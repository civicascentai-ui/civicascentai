import Stripe from 'stripe';

// Deploy only after configuring STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.
// Stripe signature verification requires the exact, unparsed request body.
// Fulfillment is deliberately NOT claimed here. Add a durable, idempotent
// entitlement store before enabling this endpoint in Stripe.
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
    // Fail closed until durable fulfillment is installed and tested.
    return res.status(503).json({error:'Entitlement processing not configured'});
  }
  return res.status(200).json({received:true});
}
