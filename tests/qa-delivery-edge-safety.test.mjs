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
       failStorage=false,auth=true,origin=null}={}) {
  const calls=[];
  globalThis.fetch = async (url, options={}) => {
    const path=new URL(String(url)).pathname;
    calls.push({path,body:options.body?JSON.parse(options.body):null});
    if (path==='/auth/v1/user') return ok(identity);
    if (path==='/rest/v1/rpc/lookup_download_entitlement') return ok(entitlements);
    if (path==='/storage/v1/bucket/course-qa-private') return ok({public:bucketPublic});
    if (path.startsWith('/storage/v1/object/authenticated/')) {
      if(failStorage)return new Response('not found',{status:404});
      const payload='QA PLACEHOLDER ONLY';
      return new Response(payload,{status:200,headers:{
        'content-type':'text/plain','content-length':String(Buffer.byteLength(payload))
      }});
    }
    if (path==='/rest/v1/rpc/record_download_issued') return ok(42);
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
