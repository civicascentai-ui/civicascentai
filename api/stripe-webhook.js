import Stripe from 'stripe';

// Deploy only after configuring STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.
// Stripe signature verification requires the exact, unparsed request body.
// Only verified paid sessions are recorded. Delivery is separately gated.
export const config = { api: { bodyParser: false } };
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_missing');

async function rawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).setHeader('Allow', 'POST').end();
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({error:'Stripe webhook not configured'});
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(await rawBody(req), req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).json({error:'Invalid Stripe webhook signature'});
  }
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object;
    // No access grants on redirects or unpaid/zero-dollar sessions.
    if (session.payment_status !== 'paid' || session.amount_total <= 0) return res.status(200).json({received:true});
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(503).json({error:'Entitlement database not configured'});
    }
    // Always retrieve the session from Stripe; event payloads are not a delivery authorization.
    const verified = await stripe.checkout.sessions.retrieve(session.id);
    // Explicit environment-specific allowlist. Sandbox links must be configured separately.
    const expectedMode = process.env.STRIPE_MODE;
    if (!['test', 'live'].includes(expectedMode)) {
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
    if (!product || verified.payment_status !== 'paid' ||
        verified.amount_total !== product.amount || verified.currency !== 'usd' ||
        !verified.customer_details?.email || verified.livemode !== (expectedMode === 'live')) {
      return res.status(200).json({received:true,recorded:false});
    }
    const endpoint = new URL('/rest/v1/rpc/record_verified_checkout', process.env.SUPABASE_URL);
    // Public-schema RPC wrapper grants execution only to the service role.
    if (process.env.CHECKOUT_RECORDING_ENABLED !== 'true') {
      return res.status(503).json({error:'Checkout recording not enabled'});
    }
    const response = await fetch(endpoint, {
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
        p_amount:verified.amount_total,p_currency:verified.currency
      })
    });
    if (!response.ok) return res.status(503).json({error:'Checkout ledger write failed'});
    return res.status(200).json({received:true,recorded:true,delivery:'pending'});
  }
  return res.status(200).json({received:true});
}
