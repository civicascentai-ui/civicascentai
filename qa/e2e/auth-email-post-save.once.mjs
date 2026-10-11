// Single-use QA sign-in delivery test following a Supabase redirect allowlist update.
// Uses the public QA project's publishable key; never prints tokens or links.
import {readFileSync} from 'node:fs';
const page=readFileSync(new URL('../learner-access.html',import.meta.url),'utf8');
const key=page.match(/const PUBLIC_KEY="(sb_publishable_[A-Za-z0-9_-]+)"/)?.[1];
const alias='https://civicascentai-launch-qa-git-qa-friday-secu-85862f-civicascentai.vercel.app/qa/learner-access.html';
if(!key)throw Error('QA public key not available');
if(process.env.GITHUB_RUN_ATTEMPT && process.env.GITHUB_RUN_ATTEMPT!=='1')throw Error('Stop: single run only, never auto-resend');
const api='https://lpdvvgdejbsgurtqmrub.supabase.co/auth/v1/otp?redirect_to='+encodeURIComponent(alias);
const response=await fetch(api,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},
 body:JSON.stringify({email:'civicascentai@gmail.com',create_user:true}),signal:AbortSignal.timeout(20000)});
let code=null;try{const payload=await response.json();code=typeof payload.error_code==='string'?payload.error_code.slice(0,45):null}catch{}
console.log(JSON.stringify({test:'post-allowlist QA email send',httpStatus:response.status,accepted:response.ok,errorCategory:code,requestedQaAlias:true}));
if(!response.ok)process.exitCode=1;
