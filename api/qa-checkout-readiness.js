// CivicAscent AI internal QA diagnostic. GET only. No orders, tokens or personal data.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({status:'method_not_allowed'});
  }
  if (process.env.VERCEL_ENV !== 'preview' ||
      !/^[-a-z0-9]+\.vercel\.app$/.test(process.env.VERCEL_URL || '')) {
    return res.status(503).json({status:'qa_preview_only'});
  }
  const key = process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  const starterId = process.env.STRIPE_TEST_STARTER_PRICE_ID;
  const facilitatorId = process.env.STRIPE_TEST_FACILITATOR_PRICE_ID;
  if (!key?.startsWith('sk_test_') || !starterId?.startsWith('price_') ||
      !facilitatorId?.startsWith('price_')) {
    return res.status(503).json({status:'sandbox_configuration_missing'});
  }
  try {
    const {default: Stripe} = await import('stripe');
    const stripe = new Stripe(key, {maxNetworkRetries:0, timeout:8000});
    const [starter, facilitator] = await Promise.all([
      stripe.prices.retrieve(starterId),
      stripe.prices.retrieve(facilitatorId)
    ]);
    const verify = (p,cents,id) =>
      p.id === id && p.livemode === false && p.active === true &&
      p.currency === 'usd' && p.unit_amount === cents &&
      p.type === 'one_time';
    if (!verify(starter,4900,starterId) || !verify(facilitator,12900,facilitatorId)) {
      return res.status(503).json({status:'sandbox_catalog_mismatch'});
    }
    return res.status(200).json({status:'sandbox_catalog_ready',
      mode:'test', products_checked:2,
      note:'Read-only Stripe configuration check. No checkout or delivery tested.'});
  } catch (_) {
    return res.status(502).json({status:'sandbox_stripe_read_unavailable'});
  }
}
