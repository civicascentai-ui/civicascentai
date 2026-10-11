// CivicAscent AI: QA-only verified delivery. Never enable as a live/commercial endpoint.
// This function serves internal README placeholders while course ZIPs await signoff.
// Authorization is based on confirmed Supabase learner identity and a paid QA entitlement.
// No signed bearer URLs, redirects, live Stripe writes or public Storage access are issued.
const DB = () => {
  const url = Deno.env.get('SUPABASE_URL');
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  if (!url || !/^https:\/\/[^/]+\.supabase\.co\/?$/.test(url) || !service || !anon) return null;
  return {url: url.replace(/\/$/, ''), service, anon};
};
const BUCKET = 'course-qa-private';
const MAX = 1024 * 1024; // Only README QA placeholders, never commercial bundles.
const PRODUCTS = new Set(['starter', 'facilitator']);
const NO_CACHE = {'Cache-Control': 'private, no-store, max-age=0',
  'X-Content-Type-Options':'nosniff', 'X-CivicAscent-QA':'internal-only'};
const json = (code, payload, extra={}) => new Response(JSON.stringify(payload),
  {status:code,headers:{...NO_CACHE,'Content-Type':'application/json',...extra}});
function cors(origin) {
  if (!origin) return null; // Server-to-server callers have no Origin header.
  let host;
  try {
    const u = new URL(origin);
    if (u.protocol !== 'https:' || u.pathname !== '/' || u.search || u.hash) return false;
    host = u.hostname;
  } catch { return false; }
  const safe = host === 'civicascentai-launch-qa.vercel.app' ||
    (host.startsWith('civicascentai-launch-') && host.endsWith('-civicascentai.vercel.app'));
  return safe ? origin : false;
}
function corsHeaders(origin) {
  if (typeof origin !== 'string' || !origin) return {};
  return {'Access-Control-Allow-Origin':origin,'Vary':'Origin',
    'Access-Control-Allow-Headers':'authorization, apikey, content-type',
    'Access-Control-Allow-Methods':'POST, OPTIONS'};
}
async function requestJson(url, opts) {
  const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(12000) });
  if (!r.ok) throw Error('Backend request rejected');
  return await r.json();
}
async function rpc(ctx, name, body) {
  return await requestJson(ctx.url + '/rest/v1/rpc/' + name, {
    method:'POST',
    headers:{apikey:ctx.service,Authorization:'Bearer ' + ctx.service,
      'Content-Type':'application/json'},
    body:JSON.stringify(body)
  });
}
Deno.serve(async (req) => {
  const origin = req.headers.get('Origin');
  const allowedOrigin = cors(origin);
  if (allowedOrigin === false) return json(403,{error:'Origin rejected'});
  const ch = corsHeaders(allowedOrigin);
  if (req.method === 'OPTIONS')
    return new Response(null, {status:204,headers:{...NO_CACHE,...ch}});
  if (req.method !== 'POST') return json(405,{error:'POST required'},ch);
  const ctx = DB();
  if (!ctx) return json(503,{error:'QA delivery not configured'},ch);
  const auth = req.headers.get('Authorization');
  if (!auth || auth.length > 8192 || !/^Bearer [A-Za-z0-9._-]+$/.test(auth))
    return json(401,{error:'Authentication required'},ch);
  const length = Number(req.headers.get('content-length') || 0);
  if (length > 4096) return json(413,{error:'Request too large'},ch);
  let product;
  try {
    const body = await req.json();
    product = body?.product_code;
    if (typeof product !== 'string' || !PRODUCTS.has(product))
      return json(400,{error:'Invalid QA product'},ch);
  } catch { return json(400,{error:'Invalid request'},ch); }

  let email;
  try {
    const person = await requestJson(ctx.url + '/auth/v1/user', {
      method:'GET', headers:{apikey:ctx.anon,Authorization:auth}
    });
    if (typeof person?.id !== 'string' || !person.id ||
        typeof person?.email !== 'string' || !person.email_confirmed_at)
      return json(403,{error:'Verified learner required'},ch);
    email = person.email.trim().toLowerCase();
    if (email.length < 3 || email.length > 254)
      return json(403,{error:'Verified learner required'},ch);
  } catch { return json(401,{error:'Authentication required'},ch); }

  let session;
  try {
    const rows = await rpc(ctx, 'lookup_download_entitlement',
      {p_verified_email:email, p_product_code:product});
    if (!Array.isArray(rows) || rows.length !== 1 ||
        typeof rows[0]?.session_id !== 'string')
      return json(403,{error:'No active QA purchase entitlement'},ch);
    session = rows[0].session_id;
  } catch { return json(503,{error:'Entitlement verification unavailable'},ch); }

  const secretHeaders = {apikey:ctx.service,Authorization:'Bearer ' + ctx.service};
  let file;
  try {
    const bucket = await requestJson(ctx.url + '/storage/v1/bucket/' + BUCKET,
      {method:'GET',headers:secretHeaders});
    if (bucket?.public !== false) return json(503,{error:'Private storage not verified'},ch);
    const path = product + '/README.md';
    file = await fetch(ctx.url + '/storage/v1/object/authenticated/' + BUCKET + '/' + path,
      {method:'GET',headers:secretHeaders,signal:AbortSignal.timeout(15000)});
    // Chunked/streamed Supabase responses may omit Content-Length.
    // Enforce the 1MB limit on streamed bytes below even without this header.
    const declared = file.headers.get('content-length');
    const size = declared === null ? null : Number(declared);
    if (!file.ok || !file.body ||
      (size !== null && (!Number.isSafeInteger(size) || size < 1 || size > MAX)))
      return json(503,{error:'QA placeholder unavailable'},ch);
    const mime = (file.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (mime !== 'text/plain' && mime !== 'text/markdown' && mime !== 'application/octet-stream')
      return json(503,{error:'Unexpected QA file type'},ch);
  } catch { return json(503,{error:'Private QA file unavailable'},ch); }

  let attempt;
  try {
    attempt = await rpc(ctx, 'record_download_issued',
      {p_session_id:session,p_product_code:product,p_verified_email:email});
    if (!Number.isSafeInteger(attempt) || attempt <= 0)
      return json(403,{error:'Entitlement no longer active'},ch);
  } catch { return json(503,{error:'Delivery authorization unavailable'},ch); }

  const reader = file.body.getReader();
  let finalized = false, delivered = 0;
  async function finish(outcome) {
    if (finalized) return;
    finalized = true;
    try {
      const result = await rpc(ctx, 'complete_course_download_attempt',
        {p_session_id:session,p_attempt_id:attempt,p_outcome:outcome});
      if (result !== true) console.error('QA delivery attempt requires reconciliation');
    } catch { console.error('QA delivery receipt unavailable'); }
  }
  const stream = new ReadableStream({
    async pull(controller) {
      try {
        const {done,value} = await reader.read();
        if (done) {
          await finish(delivered ? 'sent' : 'failed');
          controller.close();
          return;
        }
        delivered += value.byteLength;
        if (delivered > MAX) throw Error('QA payload exceeds size limit');
        controller.enqueue(value);
      } catch {
        await finish('failed');
        controller.error(new Error('QA file transfer failed'));
      }
    },
    async cancel() {
      try { await reader.cancel(); } catch {}
      await finish('failed');
    }
  });
  return new Response(stream,{status:200,headers:{
    ...NO_CACHE,...ch,
    'Content-Type':'text/plain; charset=utf-8',
    'Content-Disposition': 'attachment; filename="' + product + '-QA-README.md"',
    'X-CivicAscent-Artifact':'placeholder-not-course',
    'X-Robots-Tag':'noindex, nofollow'
  }});
});
