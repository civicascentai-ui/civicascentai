import test from 'node:test';
import assert from 'node:assert/strict';
import authHandler from '../api/course-auth-request.js';
import entitlementHandler from '../api/learner-entitlements.js';
import downloadHandler from '../api/course-download.js';

function response() {
  return {
    statusCode: 200, headers: {}, body: undefined,
    setHeader(k,v) { this.headers[k.toLowerCase()] = v; return this; },
    status(code) { this.statusCode=code; return this; },
    json(value) { this.body=value; return this; },
    end() { return this; }
  };
}
async function run(handler,req) {
  const res=response();
  await handler(req,res);
  return res;
}
test('passwordless sign-in rejects unsupported methods', async () => {
  const r=await run(authHandler,{method:'GET'});
  assert.equal(r.statusCode,405);
  assert.equal(r.headers.allow,'POST');
});
test('passwordless sign-in fails closed without TEST mode', async () => {
  const previous=process.env.STRIPE_MODE;
  const flag=process.env.COURSE_ACCESS_UI_ENABLED;
  try {
    process.env.STRIPE_MODE='live';
    process.env.COURSE_ACCESS_UI_ENABLED='true';
    const r=await run(authHandler,{method:'POST',body:{email:'learner@example.org'}});
    assert.equal(r.statusCode,503);
  } finally {
    if(previous===undefined)delete process.env.STRIPE_MODE;else process.env.STRIPE_MODE=previous;
    if(flag===undefined)delete process.env.COURSE_ACCESS_UI_ENABLED;else process.env.COURSE_ACCESS_UI_ENABLED=flag;
  }
});
test('learner entitlements require bearer authentication', async () => {
  const r=await run(entitlementHandler,{method:'GET',headers:{}});
  assert.equal(r.statusCode,401);
});
test('learner entitlements reject non-GET requests', async () => {
  const r=await run(entitlementHandler,{method:'POST',headers:{}});
  assert.equal(r.statusCode,405);
});
test('private download rejects unsupported methods', async () => {
  const r=await run(downloadHandler,{method:'POST',headers:{},query:{}});
  assert.equal(r.statusCode,405);
});
test('private download is disabled by default', async () => {
  const previous=process.env.COURSE_DOWNLOAD_ENABLED;
  try {
    delete process.env.COURSE_DOWNLOAD_ENABLED;
    const r=await run(downloadHandler,{method:'GET',headers:{},query:{product:'starter'}});
    assert.equal(r.statusCode,503);
    assert.equal(r.headers['cache-control'],'no-store, private, max-age=0');
  } finally {
    if(previous!==undefined)process.env.COURSE_DOWNLOAD_ENABLED=previous;
  }
});
