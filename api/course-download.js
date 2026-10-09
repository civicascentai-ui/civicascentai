// QA only. Server-mediated downloads avoid distributing reusable signed bearer URLs.
// Requires reviewed isolated staging database, private bucket, verified paid entitlement,
// explicitly enabled TEST environment and server-only service credentials.
// No customer access can be granted from redirect/query parameters.
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const PRODUCTS = {starter:'COURSE_STARTER_OBJECT',facilitator:'COURSE_FACILITATOR_OBJECT'};
const MAX_BYTES = 25 * 1024 * 1024;
const NO_CACHE = {'Cache-Control':'no-store, private, max-age=0','X-Content-Type-Options':'nosniff'};

function sendError(res, status, error) {
  for (const [key,val] of Object.entries(NO_CACHE)) res.setHeader(key,val);
  return res.status(status).json({error});
}
function originFrom(raw) {
  const url=new URL(raw);
  if (url.protocol!=='https:' || url.username || url.password || url.search || url.hash) throw Error('Invalid origin');
  return url;
}
async function apiJson(url, opts) {
  const resp=await fetch(url,{...opts,signal:AbortSignal.timeout(8000)});
  if (!resp.ok) throw Error('Backend unavailable');
  return await resp.json();
}
function headers(key) {return {apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};}
function fileIsValid(path) {
  return typeof path==='string' && /^[a-zA-Z0-9_/-]+\.[a-zA-Z0-9]{2,8}$/.test(path)
    && !path.split('/').some(part=>!part || part==='.' || part==='..');
}
export default async function handler(req,res) {
  if(req.method!=='GET') {res.setHeader('Allow','GET');return sendError(res,405,'Method not allowed');}
  if(process.env.COURSE_DOWNLOAD_ENABLED!=='true' || process.env.STRIPE_MODE!=='test') {
    return sendError(res,503,'Course delivery is not enabled');
  }
  const product=req.query?.product;
  if(typeof product!=='string'||!Object.hasOwn(PRODUCTS,product)) return sendError(res,400,'Unknown course product');
  const bearer=req.headers?.authorization;
  if(typeof bearer!=='string'||!/^Bearer [a-zA-Z0-9._-]+$/.test(bearer)) return sendError(res,401,'Authentication required');
  const {
    SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY, COURSE_PRIVATE_BUCKET
  }=process.env;
  const objectPath=process.env[PRODUCTS[product]];
  if(!SUPABASE_URL||!SUPABASE_PUBLISHABLE_KEY||!SUPABASE_SERVICE_ROLE_KEY||
     !COURSE_PRIVATE_BUCKET||!fileIsValid(objectPath)||!/^[a-z0-9_-]{3,63}$/.test(COURSE_PRIVATE_BUCKET)) {
    return sendError(res,503,'Private course storage is not configured');
  }
  let origin;
  try{origin=originFrom(SUPABASE_URL);}catch{return sendError(res,503,'Invalid service configuration');}

  let email;
  try{
    const user=await apiJson(new URL('/auth/v1/user',origin),{
      method:'GET',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:bearer}
    });
    if(typeof user?.id!=='string'||typeof user?.email!=='string'||!user.email_confirmed_at)
      return sendError(res,403,'Verified learner required');
    email=user.email.trim().toLowerCase();
    if(email.length<3||email.length>254) return sendError(res,403,'Verified learner required');
  }catch{return sendError(res,401,'Authentication required');}

  const privateHeaders=headers(SUPABASE_SERVICE_ROLE_KEY);
  let session;
  try{
    const records=await apiJson(new URL('/rest/v1/rpc/lookup_download_entitlement',origin),{
      method:'POST',headers:privateHeaders,
      body:JSON.stringify({p_verified_email:email,p_product_code:product})
    });
    if(!Array.isArray(records)||records.length!==1||
       typeof records[0]?.session_id!=='string') {
      return sendError(res,403,'No active purchase for this course');
    }
    session=records[0].session_id;
  }catch{return sendError(res,503,'Entitlement lookup unavailable');}

  try{
    const bucket=await apiJson(new URL('/storage/v1/bucket/'+COURSE_PRIVATE_BUCKET,origin),{
      method:'GET',headers:privateHeaders
    });
    if(bucket?.public!==false) return sendError(res,503,'Private storage not verified');
  }catch{return sendError(res,503,'Storage configuration unavailable');}

  let file;
  try{
    const url=new URL('/storage/v1/object/authenticated/'+COURSE_PRIVATE_BUCKET+'/'+objectPath,origin);
    file=await fetch(url,{
      method:'GET',headers:privateHeaders,signal:AbortSignal.timeout(20000)
    });
    const length=Number(file.headers?.get('content-length'));
    if(!file.ok||!file.body||!Number.isSafeInteger(length)||length<1||length>MAX_BYTES)
      return sendError(res,503,'Private course file unavailable');
  }catch{return sendError(res,503,'Private course file unavailable');}

  // The final transactional ownership/refund gate is checked AFTER fetching
  // metadata and BEFORE exposing any file bytes.
  let attemptId;
  try{
    attemptId=await apiJson(new URL('/rest/v1/rpc/record_download_issued',origin),{
      method:'POST',headers:privateHeaders,
      body:JSON.stringify({
        p_session_id:session,p_product_code:product,p_verified_email:email
      })
    });
  }catch{return sendError(res,503,'Delivery authorization unavailable');}
  if(!Number.isSafeInteger(attemptId)||attemptId<1) return sendError(res,403,'Entitlement is no longer active');

  // Never redirect to Storage or return a bearer URL. Always use a new
  // server-side authenticated request after the current entitlement check.
  for (const [key,val] of Object.entries(NO_CACHE)) res.setHeader(key,val);
  res.setHeader('Content-Type','application/octet-stream');
  res.setHeader('Content-Disposition','attachment; filename="'+product+'-kit.zip"');
  res.setHeader('Content-Length',String(file.headers.get('content-length')));
  res.status(200);
  let delivered=false;
  try{
    await pipeline(Readable.fromWeb(file.body),res);
    delivered=true;
  }catch{
    // Caller already may have received a portion; do not report delivery sent.
  }
  const outcome=delivered?'sent':'failed';
  try{
    const result=await apiJson(new URL('/rest/v1/rpc/complete_course_download_attempt',origin),{
      method:'POST',headers:privateHeaders,
      body:JSON.stringify({p_session_id:session,p_attempt_id:attemptId,p_outcome:outcome})
    });
    if(result!==true) {
      // Reconciliation review required; do not mark success just because bytes streamed.
      console.error('Course download receipt requires reconciliation');
    }
  }catch{
    console.error('Course download receipt unavailable');
  }
}