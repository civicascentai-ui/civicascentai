// QA-only endpoint: loads payment SDK only after request and sandbox checks.
const PRODUCTS = Object.freeze({
  starter: { priceEnv: 'STRIPE_TEST_STARTER_PRICE_ID' },
  facilitator: { priceEnv: 'STRIPE_TEST_FACILITATOR_PRICE_ID' },
});
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({error:'Method not allowed'}); }
  const {product_code: code} = req.body || {};
  if (typeof code !== 'string' || !Object.hasOwn(PRODUCTS, code)) return res.status(400).json({error:'Invalid product'});
  if (process.env.VERCEL_ENV !== 'preview') return res.status(503).json({error:'Sandbox preview only'});
  const key = process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  const price = process.env[PRODUCTS[code].priceEnv];
  const configuredOrigin = process.env.CHECKOUT_QA_ORIGIN;
  const previewHost = process.env.VERCEL_URL;
  const origin = configuredOrigin || (previewHost?.endsWith('.vercel.app') ? `https://${previewHost}` : undefined);
  if (!key?.startsWith('sk_test_') || !price?.startsWith('price_') || !previewHost?.endsWith('.vercel.app') || origin !== `https://${previewHost}`) return res.status(503).json({error:'Sandbox not configured'});
  try {
    const {default: Stripe} = await import('stripe');
    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.create({
      mode:'payment', customer_creation:'always', line_items:[{price,quantity:1}],
      // QA-only: prevent Stripe Link sign-in from obscuring the normal card form.
      wallet_options: {link: {display: 'never'}},
      success_url:`${origin}/checkout/success/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:`${origin}/course.html?checkout_cancelled=1`,
      metadata:{product_code:code},
      payment_intent_data:{metadata:{product_code:code}},
    });
    return res.status(200).json({url:session.url});
  } catch (e) {
    console.error('Sandbox checkout creation failed',e?.type || 'unknown');
    return res.status(502).json({error:'Checkout unavailable'});
  }
}