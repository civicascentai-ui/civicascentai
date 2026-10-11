import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../supabase/functions/qa-verified-course-delivery-check/index.ts', import.meta.url),'utf8');
assert.doesNotMatch(source, /object\/sign|signedURL|expiresIn\s*:/,
  'QA delivery must never generate reusable signed download URLs');
assert.match(source,/record_download_issued/);
assert.match(source,/complete_course_download_attempt/);
assert.match(source,/file\.body\.getReader\(\)/);
assert.match(source,/email_confirmed_at/);
assert.match(source,/public\s*!==\s*false/);
assert.match(source,/X-CivicAscent-Artifact/);

let handler;
globalThis.Deno = {
  env: {get: (key)=>({
    SUPABASE_URL:'https://qa.example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY:'qa_service_placeholder',
    SUPABASE_ANON_KEY:'qa_public_placeholder'
  })[key]},
  serve: (fn)=>{handler=fn}
};
await import('data:text/javascript;charset=utf-8,'+encodeURIComponent(source));
const ok = (data)=>new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}});
const member={id:'qa_learner',email:'Tester@example.invalid',email_confirmed_at:'2026-10-10T00:00:00Z'};

async function exercise({identity=member,entitlements=[{session_id:'cs_test_mock'}],bucketPublic=false,
       failStorage=false,auth=true,origin=null,omitSizeHeader=false,oversizedFile=false,issuedId=42}={}) {
  const calls=[];
  globalThis.fetch = async (url, options={}) => {
    const path=new URL(String(url)).pathname;
    calls.push({path,body:options.body?JSON.parse(options.body):null});
    if (path==='/auth/v1/user') return ok(identity);
    if (path==='/rest/v1/rpc/lookup_download_entitlement') return ok(entitlements);
    if (path==='/storage/v1/bucket/course-qa-private') return ok({public:bucketPublic});
    if (path.startsWith('/storage/v1/object/authenticated/')) {
      if(failStorage)return new Response('not found',{status:404});
      const payload=oversizedFile?'X'.repeat(1024*1024+1):'QA PLACEHOLDER ONLY';
      const headers={'content-type':'text/plain'};
      if(!omitSizeHeader&&!oversizedFile)headers['content-length']=String(Buffer.byteLength(payload));
      return new Response(payload,{status:200,headers});
    }
    if (path==='/rest/v1/rpc/record_download_issued') return ok(issuedId);
    if (path==='/rest/v1/rpc/complete_course_download_attempt') return ok(true);
    throw Error('Unexpected backend path '+path);
  };
  const headers={'Content-Type':'application/json'};
  if(auth)headers.Authorization='Bearer test_identity_jwt';
  if(origin)headers.Origin=origin;
  const response=await handler(new Request('https://qa.example.supabase.co/functions/v1/qa-verified-course-delivery-check',{
    method:'POST',headers,body:JSON.stringify({product_code:'starter'})
  }));
  return {response,calls};
}
test('unauthenticated callers cannot reach backend or receive files',async()=>{
  const v=await exercise({auth:false});
  assert.equal(v.response.status,401);
  assert.equal(v.calls.length,0);
});
test('invalid origins rejected before backend access',async()=>{
  const v=await exercise({origin:'https://attacker.example'});
  assert.equal(v.response.status,403);
  assert.equal(v.calls.length,0);
});
test('missing purchases are forbidden and no object is fetched',async()=>{
  const v=await exercise({entitlements:[]});
  assert.equal(v.response.status,403);
  assert.equal(v.calls.some(c=>c.path.includes('/object/')),false);
});
test('unverified learners are blocked before entitlement checks',async()=>{
  const v=await exercise({identity:{...member,email_confirmed_at:null}});
  assert.equal(v.response.status,403);
  assert.equal(v.calls.filter(c=>c.path.includes('lookup_download_entitlement')).length,0);
});
test('public bucket fails closed; no attempt is issued',async()=>{
  const v=await exercise({bucketPublic:true});
  assert.equal(v.response.status,503);
  assert.equal(v.calls.some(c=>c.path.includes('record_download_issued')),false);
});
test('missing private asset never grants an attempt',async()=>{
  const v=await exercise({failStorage:true});
  assert.equal(v.response.status,503);
  assert.equal(v.calls.some(c=>c.path.includes('record_download_issued')),false);
});
test('verified paid learner receives server-streamed QA placeholder, with receipt',async()=>{
  const v=await exercise();
  assert.equal(v.response.status,200);
  assert.equal(v.response.headers.get('X-CivicAscent-Artifact'),'placeholder-not-course');
  assert.equal(v.response.headers.get('Cache-Control'),'private, no-store, max-age=0');
  assert.equal(await v.response.text(),'QA PLACEHOLDER ONLY');
  assert.equal(v.calls.filter(c=>c.path.includes('/object/sign')).length,0);
  assert.equal(v.calls.filter(c=>c.path.includes('record_download_issued')).length,1);
  const receipt=v.calls.find(c=>c.path.includes('complete_course_download_attempt'));
  assert.equal(receipt?.body.p_outcome,'sent');
  assert.equal(receipt?.body.p_attempt_id,42);
});

test('revoked or refunded entitlement cannot issue or stream a QA download',async()=>{
  const v=await exercise({entitlements:[]});
  assert.equal(v.response.status,403);
  assert.equal(v.calls.some(c=>c.path.includes('/object/')),false);
  assert.equal(v.calls.some(c=>c.path.includes('record_download_issued')),false);
});
test('refund race after lookup refuses issuance, without recording successful delivery',async()=>{
  const v=await exercise({issuedId:null});
  assert.equal(v.response.status,403);
  assert.equal(v.calls.filter(c=>c.path.includes('record_download_issued')).length,1);
  assert.equal(v.calls.some(c=>c.path.includes('complete_course_download_attempt')),false);
});

test('Stripe QA redirects use existing receipt page and a real cancel destination',()=>{
  const route = readFileSync(new URL('../api/create-checkout-session.js',import.meta.url),'utf8');
  const receipt = readFileSync(new URL('../checkout/success/index.html',import.meta.url),'utf8');
  const course = readFileSync(new URL('../course.html',import.meta.url),'utf8');
  assert.match(route,/\/checkout\/success\/\?session_id=\{CHECKOUT_SESSION_ID\}/);
  assert.match(route,/\/course\.html\?checkout_cancelled=1/);
  assert.doesNotMatch(route,/\$\{origin\}\/success\?/);
  assert.doesNotMatch(route,/\$\{origin\}\/cancel`/);
  assert.match(receipt,/Sandbox checkout received/i);
  assert.match(course,/CivicAscent AI/);
});

test('QA checkout confirmation links to a learner-owned verification and download page',()=>{
  const receipt=readFileSync(new URL('../checkout/success/index.html',import.meta.url),'utf8');
  const ui=readFileSync(new URL('../qa/learner-access.html',import.meta.url),'utf8');
  assert.match(receipt,/qa\/learner-access\.html/);
  assert.match(receipt,/not proof of payment or enrollment/i);
  assert.match(ui,/\/auth\/v1\/otp/);
  assert.match(ui,/\/auth\/v1\/verify/);
  assert.match(ui,/qa-verified-course-delivery-check/);
  assert.match(ui,/placeholder-not-course/);
  assert.match(ui,/sb_publishable_/);
  assert.doesNotMatch(ui,/SUPABASE_SERVICE_ROLE_KEY|sk_test_|whsec_/);
  assert.doesNotMatch(ui,/localStorage|sessionStorage/);
  assert.doesNotMatch(ui,/session_id=\{CHECKOUT_SESSION_ID\}.*accessToken/);
});

test('streaming storage responses without Content-Length still work',async()=>{
  const v=await exercise({omitSizeHeader:true});
  assert.equal(v.response.status,200);
  assert.equal(await v.response.text(),'QA PLACEHOLDER ONLY');
  assert.equal(v.calls.find(c=>c.path.includes('complete_course_download_attempt'))?.body.p_outcome,'sent');
});
test('streaming storage response exceeding 1MB fails closed and records failure',async()=>{
  const v=await exercise({oversizedFile:true});
  assert.equal(v.response.status,200);
  await assert.rejects(v.response.text());
  assert.equal(v.calls.find(c=>c.path.includes('complete_course_download_attempt'))?.body.p_outcome,'failed');
});

test('the independent QA checkout doorway creates server-side TEST Stripe sessions only',()=>{
  const page = readFileSync(new URL('../qa/sandbox-checkout.html',import.meta.url),'utf8');
  const learner = readFileSync(new URL('../qa/learner-access.html',import.meta.url),'utf8');
  const api = readFileSync(new URL('../api/create-checkout-session.js',import.meta.url),'utf8');
  assert.match(page,/TEST ONLY: No real money or customer orders/i);
  assert.match(page,/data-product="starter"/);
  assert.match(page,/data-product="facilitator"/);
  assert.match(page,/\/api\/create-checkout-session/);
  assert.match(page,/target\.hostname\s*!==\s*'checkout\.stripe\.com'/);
  assert.doesNotMatch(page,/buy\.stripe\.com\/(?!test_)/);
  assert.doesNotMatch(page,/sk_live_|sk_test_|SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(learner,/href="sandbox-checkout\.html"/);
  assert.match(api,/key\?\.startsWith\('sk_test_'\)/);
  assert.match(api,/metadata:\{product_code:code\}/);
  assert.match(api,/\/checkout\/success\/\?session_id=/);
});

test('both Starter and Facilitator sandbox Checkout sessions suppress optional Link sign-in',()=>{
  const checkoutSource=readFileSync(new URL('../api/create-checkout-session.js',import.meta.url),'utf8');
  assert.match(checkoutSource,/wallet_options:\s*\{link:\s*\{display:\s*'never'\}\}/);
  assert.match(checkoutSource,/key\?\.startsWith\('sk_test_'\)/);
  assert.match(checkoutSource,/process\.env\.VERCEL_ENV\s*!==\s*'preview'/);
  assert.match(checkoutSource,/product_code:code/);
});

test('QA learner accepts Supabase Magic Link and numeric OTP without trusting a redirect',()=>{
  const page=readFileSync(new URL('../qa/learner-access.html',import.meta.url),'utf8');
  assert.match(page,/\/auth\/v1\/otp\?redirect_to=/);
  assert.match(page,/encodeURIComponent\(redirectTo\)/);
  assert.match(page,/async function acceptMagicLink/);
  assert.match(page,/new URLSearchParams\(fragment\.slice\(1\)\)/);
  assert.match(page,/history\.replaceState\(null,''/);
  assert.match(page,/\/auth\/v1\/user/);
  assert.match(page,/learner\.email_confirmed_at/);
  assert.match(page,/\/auth\/v1\/verify/);
  assert.match(page,/\/functions\/v1\/qa-verified-course-delivery-check/);
  assert.match(page,/X-CivicAscent-Artifact/);
  assert.doesNotMatch(page,/localStorage|sessionStorage|document\.cookie/);
  assert.doesNotMatch(page,/sk_live_|sk_test_|whsec_|SUPABASE_SERVICE_ROLE_KEY/);
});

test('Supabase email callback uses the stable protected QA branch alias',()=>{
  const page=readFileSync(new URL('../qa/learner-access.html',import.meta.url),'utf8');
  assert.match(page,/const redirectTo="https:\/\/civicascentai-launch-qa-git-qa-friday-secu-85862f-civicascentai\.vercel\.app\/qa\/learner-access\.html"/);
  assert.doesNotMatch(page,/const redirectTo=location\.origin\+location\.pathname/);
  assert.match(page,/encodeURIComponent\(redirectTo\)/);
  assert.match(page,/history\.replaceState\(null,''/);
});

test('QA sign-in page explains Supabase 429 throttling instead of blaming redirect configuration',()=>{
  const page=readFileSync(new URL('../qa/learner-access.html',import.meta.url),'utf8');
  assert.match(page,/response\.status===429/);
  assert.match(page,/Wait for the limit to reset/);
  assert.match(page,/request just one new email/);
  assert.doesNotMatch(page,/Sign-in request unavailable\. Check sandbox email authentication configuration/);
});

test('checkout live-preview probe targets current QA branch and never weakens protection',()=>{
  const probe=readFileSync(new URL('../qa/e2e/qa-checkout-session-contract.mjs',import.meta.url),'utf8');
  assert.match(probe,/const stableQaOrigin = 'https:\/\/civicascentai-launch-qa-git-qa-friday-secu-85862f-civicascentai\.vercel\.app'/);
  assert.match(probe,/process\.env\.QA_PREVIEW_ORIGIN/);
  assert.match(probe,/assert\.equal\(allowed\.protocol, 'https:'\)/);
  assert.match(probe,/assert\.equal\(allowed\.username, ''\)/);
  assert.match(probe,/assert\.equal\(allowed\.pathname, '\/'\)/);
  assert.match(probe,/VERCEL_PROTECTION_BLOCKED/);
  assert.doesNotMatch(probe,/civicascentai-launch-gcw34sbrh/);
});

test('protected checkout probe uses repository-scoped short-lived OIDC without bypass secrets',()=>{
  const probe=readFileSync(new URL('../qa/e2e/qa-checkout-session-contract.mjs',import.meta.url),'utf8');
  const workflow=readFileSync(new URL('../.github/workflows/qa-checkout-live-preview.yml',import.meta.url),'utf8');
  assert.match(probe,/process\.env\.QA_GITHUB_OIDC_TOKEN/);
  assert.match(probe,/x-vercel-trusted-oidc-idp-token/);
  assert.match(probe,/oidcToken\.length <= 8192/);
  assert.match(probe,/VERCEL_PROTECTION_BLOCKED/);
  assert.match(workflow,/id-token: write/);
  assert.match(workflow,/core\.getIDToken\(\)/);
  assert.match(workflow,/core\.setSecret\(token\)/);
  assert.match(workflow,/github\.event_name != 'pull_request'/);
  assert.match(workflow,/github\.ref == 'refs\/heads\/qa\/friday-secure-delivery-20261010'/);
  assert.doesNotMatch(workflow,/VERCEL_AUTOMATION_BYPASS_SECRET|x-vercel-protection-bypass/i);
  assert.doesNotMatch(probe,/_vercel_share|x-vercel-protection-bypass/i);
});

test('QA push OIDC probe is not cancelled by pull-request source checks',()=>{
  const workflow=readFileSync(new URL('../.github/workflows/qa-checkout-live-preview.yml',import.meta.url),'utf8');
  assert.ok(workflow.includes('group: qa-checkout-live-preview-${{ github.event_name }}-${{ github.ref }}'));
  assert.match(workflow,/source-only-not-e2e:/);
  assert.match(workflow,/Probe source checks only, NOT payment or preview E2E/);
  assert.match(workflow,/if: github\.event_name == 'pull_request'/);
  assert.match(workflow,/if: github\.event_name != 'pull_request' && github\.ref == 'refs\/heads\/qa\/friday-secure-delivery-20261010'/);
  assert.doesNotMatch(workflow,/group: qa-checkout-live-preview-single-session/);
});
