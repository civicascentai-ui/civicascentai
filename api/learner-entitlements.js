// QA-only learner purchase-status endpoint. No course files, download URLs,
// enrollment grants, or access tokens are issued by this route.
const productCodes = new Set(['starter', 'facilitator']);
const deliveryStates = new Set(['pending', 'sent', 'failed']);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authorization = req.headers?.authorization ?? '';
  const match = /^Bearer ([A-Za-z0-9_\-.]+)$/.exec(authorization);
  if (!match) return res.status(401).json({ error: 'Authentication required' });

  const base = process.env.SUPABASE_URL;
  const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !publicKey || !serviceKey) {
    return res.status(503).json({ error: 'Learner access not configured' });
  }
  let authUrl, lookupUrl;
  try {
    const origin = new URL(base);
    if (origin.protocol !== 'https:' || origin.username || origin.password) throw new Error('Invalid origin');
    authUrl = new URL('/auth/v1/user', origin);
    lookupUrl = new URL('/rest/v1/rpc/lookup_verified_course_status', origin);
  } catch {
    return res.status(503).json({ error: 'Learner access not configured' });
  }

  let user;
  try {
    const response = await fetch(authUrl, {
      method: 'GET',
      headers: { apikey: publicKey, Authorization: authorization },
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) return res.status(401).json({ error: 'Authentication required' });
    user = await response.json();
  } catch {
    return res.status(503).json({ error: 'Identity provider unavailable' });
  }
  // Reject unconfirmed-email accounts. Never authorize with user_metadata,
  // caller-supplied email, redirect query parameters, or Stripe return URLs.
  if (!user?.id || !user?.email || !user.email_confirmed_at) {
    return res.status(403).json({ error: 'Verified email required' });
  }
  const email = user.email.trim().toLowerCase();
  if (!email || email.length > 254) {
    return res.status(403).json({ error: 'Verified email required' });
  }

  let records;
  try {
    const response = await fetch(lookupUrl, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: 'Bearer ' + serviceKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_verified_email: email }),
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) return res.status(503).json({ error: 'Purchase ledger unavailable' });
    records = await response.json();
    if (!Array.isArray(records)) throw new Error('Invalid ledger response');
  } catch {
    return res.status(503).json({ error: 'Purchase ledger unavailable' });
  }

  const entitlements = records
    .filter(row => row && typeof row === 'object' && productCodes.has(row.product_code) && deliveryStates.has(row.delivery_status))
    .map(row => ({ product: row.product_code, delivery_status: row.delivery_status }));

  res.setHeader('Cache-Control', 'no-store, private, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(200).json({
    entitlements,
    course_access_enabled: process.env.COURSE_DOWNLOAD_ENABLED === 'true' && process.env.STRIPE_MODE === 'test',
    message: 'Access is available only for a verified active entitlement when private delivery is explicitly enabled.'
  });
}
