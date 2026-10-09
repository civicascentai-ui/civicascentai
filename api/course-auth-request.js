// QA-only passwordless sign-in request. This endpoint is disabled by default,
// restricted to the test environment, and never creates learner accounts.
const GENERIC_MESSAGE = 'If this email has approved learner access, a sign-in link will arrive shortly.';

function noStore(res) {
  res.setHeader('Cache-Control', 'no-store, private, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

function configuredOrigin(raw) {
  const url = new URL(raw);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('Invalid origin');
  }
  return url;
}

export default async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({error:'Method not allowed'});
  }
  if (process.env.COURSE_ACCESS_UI_ENABLED !== 'true' || process.env.STRIPE_MODE !== 'test') {
    return res.status(503).json({error:'Learner sign-in is not enabled'});
  }
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (email.length < 3 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({error:'Enter a valid email address'});
  }
  const {SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, COURSE_ACCESS_ORIGIN} = process.env;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY || !COURSE_ACCESS_ORIGIN) {
    return res.status(503).json({error:'Learner sign-in is not configured'});
  }
  let endpoint;
  try {
    const supabase = configuredOrigin(SUPABASE_URL);
    const access = configuredOrigin(COURSE_ACCESS_ORIGIN);
    const redirect = new URL('/learner-access.html', access);
    endpoint = new URL('/auth/v1/otp', supabase);
    endpoint.searchParams.set('redirect_to', redirect.href);
  } catch {
    return res.status(503).json({error:'Learner sign-in is not configured'});
  }
  let response;
  try {
    response = await fetch(endpoint, {
      method:'POST',
      headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:'Bearer ' + SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({email,create_user:false}),
      signal:AbortSignal.timeout(8000)
    });
  } catch {
    return res.status(503).json({error:'Identity provider unavailable'});
  }
  // Preserve a generic response for both known and unknown addresses.
  if (response.status >= 500) return res.status(503).json({error:'Identity provider unavailable'});
  return res.status(202).json({message:GENERIC_MESSAGE});
}
