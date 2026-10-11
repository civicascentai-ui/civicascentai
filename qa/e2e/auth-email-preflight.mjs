// One-time QA Auth email preflight; invokes only PUBLIC Supabase Auth endpoints.
// This script must never print login links, OTP tokens, access tokens or credentials.
// It sends one test sign-in email to the CivicAscent-controlled work inbox.
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../learner-access.html',import.meta.url),'utf8');
const key = html.match(/const PUBLIC_KEY="(sb_publishable_[A-Za-z0-9_-]+)"/)?.[1];
if(!key)throw Error('QA public key unavailable: no request made');
if(process.env.GITHUB_RUN_ATTEMPT && process.env.GITHUB_RUN_ATTEMPT!=='1')
  throw Error('Refusing automatic OTP resend on workflow retry');
const service='https://lpdvvgdejbsgurtqmrub.supabase.co';
const redirect='https://civicascentai-launch-j5qg7iv32-civicascentai.vercel.app/qa/learner-access.html';
const identity='civicascentai@gmail.com';
const endpoint=service+'/auth/v1/otp?redirect_to='+encodeURIComponent(redirect);
const result=await fetch(endpoint,{
 method:'POST',
 headers:{apikey:key,'Content-Type':'application/json'},
 body:JSON.stringify({email:identity,create_user:true}),
 signal:AbortSignal.timeout(18000)
});
const raw=await result.text();
let body={};try{body=JSON.parse(raw)}catch{}
// Avoid exposing returned tokens, email content or account identifiers.
console.log(JSON.stringify({event:'QA_AUTH_OTP_REQUEST',status:result.status,ok:result.ok,
 error_code:typeof body.code==='string'?body.code.slice(0,50):null,
 error_category:typeof body.error_code==='string'?body.error_code.slice(0,50):null}));
if(!result.ok)process.exitCode=1;
