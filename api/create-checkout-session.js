import Stripe from 'stripe';
const PRODUCTS = Object.freeze({
  starter: { priceEnv: 'STRIPE_TEST_STARTER_PRICE_ID' },
  facilitator: { priceEnv: 'STRIPE_TEST_FACILITATOR_PRICE_ID' },
});
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({error:'Method not allowed'}); }
  const {product_code: code} = req.body || {};
  if (typeof code !== 'string' || !Object.hasOwn(PRODUCTS, code)) return res.status(400).json({error:'Invalid product'});
  const key = process.env.STRIPE_TEST_SECRET_KEY;
  const price = process.env[PRODUCTS[code].priceEnv];
  const origin = process.env.CHECKOUT_QA_ORIGIN;
  if (!key?.startsWith('sk_test_') || !price?.startsWith('price_') || !origin?.startsWith('https://')) return res.status(503).json({error:'Sandbox not configured'});
  try {
    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.create({
      mode:'payment', line_items:[{price,quantity:1}],
      success_url:`${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:`${origin}/cancel`,
      metadata:{product_code:code},
      payment_intent_data:{metadata:{product_code:code}},
    });
    return res.status(200).json({url:session.url});
  } catch (e) {
    console.error('Sandbox checkout creation failed',e?.type || 'unknown');
    return res.status(502).json({error:'Checkout unavailable'});
  }
}