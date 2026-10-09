// QA ONLY: secure on-demand course kit delivery. Fail-closed and test-only.
// Requires reviewed staging SQL, Supabase Auth, *private* Storage and explicit feature flag.
// Does not accept client-supplied email, session_id, bucket, path, or signed URL.
const OBJECTS = {starter:'COURSE_STARTER_OBJECT',facilitator:'COURSE_FACILITATOR_OBJECT'};
const HEADER = {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};

function fail(res,code,message) { for(const [k,v] of Object.entries(HEADER)) res.setHeader(k,v); return res.status(code).json({error:message}); }
function secureOrigin(raw) {
  const url = new URL(raw);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw Error('Bad origin');
  return url;
}
async function readJson(url,opts) {
  const response = await fetch(url,{...opts,signal:AbortSignal.timeout(8000)});
  if(!response.ok) throw Error('Service unavailable');
  return response.json();
}
function serviceHeaders(key) {return {apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};}

export default async function handler(req,res) {
  if (req.method!=='GET') {res.setHeader('Allow','GET');return fail(res,405,'Method not allowed');}
  if(process.env.COURSE_DOWNLOAD_ENABLED!=='true' || process.env.STRIPE_MODE!=='test') {
    return fail(res,503,'Course delivery is not enabled');
  }
  const product=req.query?.product;
  if(typeof product!=='string'||!Object.hasOwn(OBJECTS,product)) return fail(res,400,'Unknown course product');
  const token=req.headers?.authorization;
  if(typeof token!=='string'||!/^Bearer [a-zA-Z0-9._-]+$/.test(token)) return fail(res,401,'Authentication required');

  const {SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY,COURSE_PRIVATE_BUCKET}=process.env;
  const objectPath=process.env[OBJECTS[product]];
  if(!SUPABASE_URL||!SUPABASE_PUBLISHABLE_KEY||!SUPABASE_SERVICE_ROLE_KEY||
     !COURSE_PRIVATE_BUCKET||!objectPath) return fail(res,503,'Course delivery is not configured');
  // A fixed, single-segment bucket name and tightly scoped per-product file paths.
  if(!/^[a-z0-9_-]{3,63}$/.test(COURSE_PRIVATE_BUCKET)||
     !/^[a-zA-Z0-9_/-]+\.[a-zA-Z0-9]{2,8}$/.test(objectPath)||
     objectPath.split('/').some(s=>!s||s==='.'||s==='..')) return fail(res,503,'Invalid course storage configuration');

  let origin;
  try{origin=secureOrigin(SUPABASE_URL);}catch{return fail(res,503,'Invalid course storage configuration');}
  let email;
  try{
    const auth=await readJson(new URL('/auth/v1/user',origin),{
      method:'GET',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:token}
    });
    if(!auth.id||!auth.email||!auth.email_confirmed_at||typeof auth.email!=='string') return fail(res,403,'Verified account required');
    email=auth.email.trim().toLowerCase();
    if(email.length<3||email.length>254) return fail(res,403,'Verified account required');
  }catch{return fail(res,401,'Authentication required');}

  const svc=serviceHeaders(SUPABASE_SERVICE_ROLE_KEY);
  let matched;
  try{
    matched=await readJson(new URL('/rest/v1/rpc/lookup_download_entitlement',origin),{
      method:'POST',headers:svc,body:JSON.stringify({p_verified_email:email,p_product_code:product})
    });
    if(!Array.isArray(matched)||matched.length!==1||typeof matched[0]?.session_id!=='string') {
      return fail(res,403,'No active purchase for that course');
    }
  }catch{return fail(res,503,'Entitlement lookup unavailable');}
  const sessionId=matched[0].session_id;
  let signed;
  try {
    const bucket=await readJson(new URL('/storage/v1/bucket/'+COURSE_PRIVATE_BUCKET,origin),{
      method:'GET',headers:svc
    });
    if(bucket.public!==false) return fail(res,503,'Private course storage not verified');
    const signEndpoint=new URL('/storage/v1/object/sign/'+COURSE_PRIVATE_BUCKET+'/'+objectPath,origin);
    signed=await readJson(signEndpoint,{
      method:'POST',headers:svc,body:JSON.stringify({expiresIn:30})
    });
    if(typeof signed?.signedURL!=='string') throw Error('Missing signed URL');
  }catch{return fail(res,503,'Private course file unavailable');}

  let url;
  try{
    // Supabase Storage usually returns /object/sign/<bucket>/<path>?token=...
    const path=signed.signedURL.startsWith('/storage/v1/')
      ? signed.signedURL : '/storage/v1'+signed.signedURL;
    url=new URL(path,origin);
    const expected='/storage/v1/object/sign/'+COURSE_PRIVATE_BUCKET+'/'+objectPath;
    if(url.origin!==origin.origin||url.pathname!==expected||!url.searchParams.has('token')||
       url.username||url.password||url.hash) throw Error('Untrusted URL');
  }catch{return fail(res,503,'Invalid signed course link');}

  // Atomic last gate. A refund/dispute between authorization and signing
  // causes a denial: signed URL is not sent to the learner.
  let marked;
  try{
    marked=await readJson(new URL('/rest/v1/rpc/record_download_issued',origin),{
      method:'POST',headers:svc,body:JSON.stringify({p_session_id:sessionId,p_product_code:product,p_verified_email:email})
    });
  }catch{return fail(res,503,'Delivery receipt unavailable');}
  if(marked!==true) return fail(res,403,'Course entitlement is no longer active');
  for(const [k,v] of Object.entries(HEADER)) res.setHeader(k,v);
  return res.status(200).json({product,download_url:url.toString(),expires_in_seconds:30,
    message:'Temporary course kit link. Please keep the materials private.'});
}
