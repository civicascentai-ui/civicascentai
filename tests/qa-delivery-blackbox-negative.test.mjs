import test from 'node:test';
import assert from 'node:assert/strict';

// Safe black-box checks. No payment, no token, no customer account required.
// Set CIVICASCENT_QA_DELIVERY_URL to the existing QA-only Supabase function URL.
const url = process.env.CIVICASCENT_QA_DELIVERY_URL;
const skip = !url || !/^https:\/\/[a-z0-9-]+\.supabase\.co\/functions\/v1\/qa-verified-course-delivery-check$/.test(url);
async function request(body, authorization) {
  return fetch(url, {
    method:'POST', redirect:'manual',
    headers:{'content-type':'application/json', ...(authorization?{authorization}:{})},
    body:JSON.stringify(body),signal:AbortSignal.timeout(12000)
  });
}
test('unauthenticated learner cannot obtain course or QA placeholder', {skip}, async()=>{
  const r=await request({product_code:'starter'});
  assert.ok([401,403].includes(r.status), 'Fail closed on unauthenticated request');
  assert.notEqual(r.headers.get('x-civicascent-artifact'),'approved-course');
  assert.equal(r.headers.get('cache-control')?.includes('no-store'),true);
});
test('invalid product is not downloadable', {skip}, async()=>{
  const r=await request({product_code:'../../facilitator'});
  assert.ok([400,401,403].includes(r.status));
  assert.notEqual(r.status,200);
});
test('unauthenticated wrong product cannot obtain private content', {skip}, async()=>{
  const r=await request({product_code:'facilitator'});
  assert.ok([401,403].includes(r.status));
});
test('disallowed browser origin fails closed', {skip}, async()=>{
  const r=await fetch(url,{method:'OPTIONS',headers:{Origin:'https://untrusted.example'},signal:AbortSignal.timeout(12000)});
  assert.equal(r.status,403);
});
test('QA endpoint does not redirect unauthenticated visitors', {skip}, async()=>{
  const r=await request({product_code:'starter'});
  assert.ok(r.status < 300 || r.status >= 400);
  assert.equal(r.headers.get('location'),null);
});
