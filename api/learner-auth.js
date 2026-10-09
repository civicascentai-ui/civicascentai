// QA-ONLY: email OTP sign-in for verified learners.
// Never returns a service-role key, never authorizes purchases by email alone.
// Production and unconfigured staging fail closed.
const EMAIL=/^[^\s@<>]{1,64}@[^\s@<>]{1,190}$/;
const OTP=/^\d{6,8}$/;
function reject(res,code,message) {return res.status(code).json({error:message});}
function baseUrl(base) {
 const origin=new URL(base);
 if(origin.protocol!=='https:' || origin.username || origin.password || origin.search || origin.hash ||
   origin.pathname!=='/' || origin.hostname==='localhost') throw Error('Unsafe Supabase origin');
 return origin;
}
async function jsonResponse(res){
 if(!res.ok)return null;
 return res.json();
}
export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store');
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='POST'){
   res.setHeader('Allow','POST');
   return reject(res,405,'Method not allowed');
 }
 if(process.env.STRIPE_MODE!=='test'||process.env.LEARNER_AUTH_ENABLED!=='true')
   return reject(res,503,'Sandbox learner sign-in disabled');
 if(!process.env.SUPABASE_URL||!process.env.SUPABASE_PUBLISHABLE_KEY)
   return reject(res,503,'Sandbox learner sign-in unconfigured');
 let origin;
 try{origin=baseUrl(process.env.SUPABASE_URL);}
 catch{return reject(res,503,'Sandbox learner sign-in unconfigured');}
 // Browser same-origin calls only. No cookies are used.
 const h=req.headers||{};
 if(h.origin) {
   let requestOrigin;
   try {requestOrigin=new URL(h.origin).origin;} catch {return reject(res,403,'Origin not allowed');}
   const host=h['x-forwarded-host']||h.host;
   const protocol=h['x-forwarded-proto']||'https';
   if(!host||requestOrigin!==protocol+'://'+host)
     return reject(res,403,'Origin not allowed');
 }
 const {action,email,code}=req.body||{};
 if(!['request_code','verify_code'].includes(action)
   || typeof email!=='string'||email.length>254||!EMAIL.test(email.trim())) {
   return reject(res,400,'Invalid sign-in request');
 }
 const normalized=email.trim().toLowerCase();
 if(action==='verify_code' && (typeof code!=='string'||!OTP.test(code)))
   return reject(res,400,'Invalid verification code');
 const path=action==='request_code'?'/auth/v1/otp':'/auth/v1/verify';
 let response;
 try {
   response=await fetch(new URL(path,origin),{
     method:'POST',
     headers:{apikey:process.env.SUPABASE_PUBLISHABLE_KEY,
       'Content-Type':'application/json'},
     body:JSON.stringify(action==='request_code'
       ?{email:normalized,create_user:true}
       :{email:normalized,token:code,type:'email'}),
     signal:AbortSignal.timeout(8000)
   });
 }catch{return reject(res,503,'Identity provider unavailable');}
 if(response.status===429)return reject(res,429,'Sign-in rate limited. Try again later.');
 if(action==='request_code') {
   if(!response.ok)return reject(res,503,'Unable to send sign-in code');
   return res.status(202).json({requested:true,
     message:'If email OTP is enabled, check your inbox for a verification code.'});
 }
 const result=await jsonResponse(response).catch(()=>null);
 if(!result || typeof result.access_token!=='string' || !result.user?.id ||
   result.user?.email?.toLowerCase()!==normalized || !result.user.email_confirmed_at)
   return reject(res,401,'Invalid or expired verification code');
 // Keep the access token only in the browser page's memory. Do not set a
 // long-lived JS-readable cookie/localStorage value.
 return res.status(200).json({access_token:result.access_token,
   expires_in:Number.isFinite(result.expires_in)?result.expires_in:0,
   message:'Email identity verified'});
}
