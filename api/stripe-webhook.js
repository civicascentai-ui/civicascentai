import Stripe from 'stripe';

// QA ONLY. No live-mode webhook processing on this branch.
// Deploy only after configuring STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.
// Stripe signature verification requires the exact, unparsed request body.
// Only verified paid sessions are recorded. Delivery is separately gated.
export const config = { api: { bodyParser: false } };
async function rawBody(req) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of req) {
    const b = Buffer.from(chunk);
    bytes += b.length;
    if (bytes > 256 * 1024) throw new Error('Webhook body too large');
    chunks.push(b);
  }
  return Buffer.concat(chunks);
}
// Dependency injection is used by isolated webhook lifecycle tests only;
// the default route always uses the real Stripe SDK and server fetch.
export async function handleWebhook(req, res, {stripeClient, fetchImpl} = {}) {
  if (req.method !== 'POST') return res.status(405).setHeader('Allow', 'POST').end();
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({error:'Stripe webhook not configured'});
  }
  const stripe = stripeClient ?? new Stripe(process.env.STRIPE_SECRET_KEY);
  const httpFetch = fetchImpl ?? fetch;
  let event;
  try {
    event = stripe.webhooks.constructEvent(await rawBody(req), req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).json({error:'Invalid Stripe webhook signature'});
  }
  // QA-only: refund/dispute records must be checked against Stripe's API,
  // never trusted from the event payload alone.
  if (event.type === 'charge.refunded' || event.type === 'charge.dispute.created') {
    if (process.env.STRIPE_MODE !== 'test' || process.env.CHECKOUT_RECORDING_ENABLED !== 'true')
      return res.status(503).json({error:'Sandbox refund recording not enabled'});
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
      return res.status(503).json({error:'Entitlement database not configured'});
    const chargeId = event.type === 'charge.refunded' ? event.data?.object?.id
      : event.data?.object?.charge;
    if (typeof chargeId !== 'string' || !/^ch_[a-zA-Z0-9]+$/.test(chargeId))
      return res.status(200).json({received:true,recorded:false});
    let charge;
    try { charge=await stripe.charges.retrieve(chargeId); }
    catch { return res.status(503).json({error:'Stripe charge verification unavailable'}); }
    if (charge?.id !== chargeId || charge.livemode !== false ||
        charge.currency !== 'usd' || typeof charge.amount !== 'number' ||
        charge.amount <= 0 || typeof charge.amount_refunded !== 'number' ||
        charge.amount_refunded < 0 || charge.amount_refunded > charge.amount ||
        typeof charge.payment_intent !== 'string') {
      return res.status(200).json({received:true,recorded:false});
    }
    const endpoint=new URL('/rest/v1/rpc/record_verified_payment_reversal',process.env.SUPABASE_URL);
    let result;
    try{
      result=await httpFetch(endpoint,{
        method:'POST',
        headers:{
          apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          p_event_id:event.id,p_event_type:event.type,
          p_payment_intent_id:charge.payment_intent,p_charge_id:charge.id,
          p_refunded_cents:charge.amount_refunded
        }),
        signal:AbortSignal.timeout(8000)
      });
    }catch{return res.status(503).json({error:'Reversal ledger unavailable'});}
    if(!result.ok)return res.status(503).json({error:'Reversal ledger write failed'});
    return res.status(200).json({received:true,recorded:true,access:'held_or_revoked'});
  }
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object;
    // No access grants on redirects or unpaid/zero-dollar sessions.
    if (session.payment_status !== 'paid' || session.amount_total <= 0) return res.status(200).json({received:true});
    if (process.env.STRIPE_MODE !== 'test')
      return res.status(503).json({error:'Test-mode webhook only'});
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(503).json({error:'Entitlement database not configured'});
    }
    // Always retrieve the session from Stripe; event payloads are not a delivery authorization.
    let verified;
    try {
      verified = await stripe.checkout.sessions.retrieve(session.id);
    } catch {
      return res.status(503).json({error:'Stripe session verification unavailable'});
    }
    // Explicit environment-specific allowlist. Sandbox links must be configured separately.
    const expectedMode = process.env.STRIPE_MODE;
    if (expectedMode !== 'test') {
      return res.status(503).json({error:'Stripe mode not configured'});
    }
    const products = {
      [process.env.STRIPE_STARTER_PAYMENT_LINK_ID]: {code:'starter',amount:4900},
      [process.env.STRIPE_FACILITATOR_PAYMENT_LINK_ID]: {code:'facilitator',amount:12900}
    };
    if (!process.env.STRIPE_STARTER_PAYMENT_LINK_ID ||
        !process.env.STRIPE_FACILITATOR_PAYMENT_LINK_ID ||
        process.env.STRIPE_STARTER_PAYMENT_LINK_ID === process.env.STRIPE_FACILITATOR_PAYMENT_LINK_ID) {
      return res.status(503).json({error:'Payment link allowlist not configured'});
    }
    const product = products[verified.payment_link];
    if (!product || verified.status !== 'complete' || verified.payment_status !== 'paid' ||
        verified.amount_total !== product.amount || verified.currency !== 'usd' ||
        !verified.customer_details?.email || verified.livemode !== (expectedMode === 'live') ||
        typeof verified.payment_intent !== 'string' ||
        !/^pi_[a-zA-Z0-9]+$/.test(verified.payment_intent)) {
      return res.status(200).json({received:true,recorded:false});
    }
    const endpoint = new URL('/rest/v1/rpc/record_verified_checkout_v2', process.env.SUPABASE_URL);
    // Public-schema RPC wrapper grants execution only to the service role.
    if (process.env.CHECKOUT_RECORDING_ENABLED !== 'true') {
      return res.status(503).json({error:'Checkout recording not enabled'});
    }
    let response;
    try {
      response = await httpFetch(endpoint, {
      method:'POST',
      headers:{
        apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        p_event_id:event.id,p_session_id:verified.id,p_event_type:event.type,
        p_customer_id:typeof verified.customer === 'string' ? verified.customer : null,
        p_email:verified.customer_details.email,p_product_code:product.code,
        p_amount:verified.amount_total,p_currency:verified.currency,
        p_payment_intent_id:verified.payment_intent
      }),
      signal:AbortSignal.timeout(8000)
      });
    } catch {
      return res.status(503).json({error:'Checkout ledger unavailable'});
    }
    if (!response.ok) return res.status(503).json({error:'Checkout ledger write failed'});
    return res.status(200).json({received:true,recorded:true,delivery:'pending'});
  }
  return res.status(200).json({received:true});
}

export default async function handler(req, res) {
  return handleWebhook(req, res);
}
