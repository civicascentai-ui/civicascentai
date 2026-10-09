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
    const products = {
      'plink_1UJGBeJ7cMj3Kc1O7n7vu36i': {code:'starter',amount:4900},
      'plink_1UJGBjJ7cMj3Kc1OiSRxl9a3': {code:'facilitator',amount:12900}
    };
    const product = products[verified.payment_link];
    if (!product || verified.payment_status !== 'paid' ||
        verified.amount_total !== product.amount || verified.currency !== 'usd' ||
        !verified.customer_details?.email || !verified.livemode) {
      return res.status(200).json({received:true,recorded:false});
    }
    const endpoint = new URL('/rest/v1/rpc/record_paid_checkout', process.env.SUPABASE_URL);
    // Private-schema RPC requires explicit PostgREST exposure and service-role grants.
    // Fail closed until the restricted RPC route has been configured and reviewed.
    if (process.env.CHECKOUT_RECORDING_ENABLED !== 'true') {
      return res.status(503).json({error:'Checkout recording not enabled'});
    }
    const response = await fetch(endpoint, {
      method:'POST',
      headers:{
        apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type':'application/json',
        'Content-Profile':'checkout_private'
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
