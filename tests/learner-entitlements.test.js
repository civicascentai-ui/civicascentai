import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import handler from '../api/learner-entitlements.js';

const envKeys = ['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','SUPABASE_SERVICE_ROLE_KEY'];
const readyEnv = {
  SUPABASE_URL: 'https://qa.example.invalid',
  SUPABASE_PUBLISHABLE_KEY: 'qa_public_test_only',
  SUPABASE_SERVICE_ROLE_KEY: 'qa_service_placeholder'
};
function response() {
  return {
    statusCode: 200, headers: {}, body: null,
    status(code) { this.statusCode = code; return this; },
    setHeader(k,v) { this.headers[k] = v; return this; },
    json(value) { this.body = value; return this; }
  };
}
async function sandbox(changes, fetchMock, fn) {
  const prev = Object.fromEntries(envKeys.map(k=>[k, process.env[k]]));
  const originalFetch = globalThis.fetch;
  try {
    for (const k of envKeys) {
      if (Object.hasOwn(changes,k) && changes[k] === null) delete process.env[k];
      else process.env[k] = Object.hasOwn(changes,k) ? changes[k] : readyEnv[k];
    }
    globalThis.fetch = fetchMock ?? (() => { throw Error('Unexpected external request'); });
    await fn();
  } finally {
    globalThis.fetch = originalFetch;
    for (const k of envKeys) {
      if (prev[k] === undefined) delete process.env[k];
      else process.env[k] = prev[k];
    }
  }
}
const bearer = {authorization:'Bearer qa_auth_token'};
const ok = (data) => ({ ok:true, async json(){return data;} });
const verified = {id:'qa_user',email:' Buyer@Example.com ',email_confirmed_at:'2026-10-09T00:00:00Z'};

test('status route refuses writes', async()=>{
  await sandbox({},null,async()=>{
    const res=response();await handler({method:'POST',headers:bearer},res);
    assert.equal(res.statusCode,405); assert.equal(res.headers.Allow,'GET');
  });
});
test('status route rejects unauthenticated callers without service access',async()=>{
  await sandbox({},null,async()=>{
    const res=response();await handler({method:'GET',headers:{}},res);
    assert.equal(res.statusCode,401);
  });
});
test('unconfigured service secrets fail closed',async()=>{
  await sandbox({SUPABASE_SERVICE_ROLE_KEY:null},null,async()=>{
    const res=response();await handler({method:'GET',headers:bearer},res);
    assert.equal(res.statusCode,503);
  });
});
test('invalid access token cannot query ledger',async()=>{
  let calls=0;
  await sandbox({},async()=>{calls++;return {ok:false,status:401};},async()=>{
    const res=response();await handler({method:'GET',headers:bearer},res);
    assert.equal(res.statusCode,401);assert.equal(calls,1);
  });
});
test('unverified email cannot query ledger',async()=>{
  let calls=0;
  await sandbox({},async()=>{calls++;return ok({...verified,email_confirmed_at:null});},async()=>{
    const res=response();await handler({method:'GET',headers:bearer},res);
    assert.equal(res.statusCode,403);assert.equal(calls,1);
  });
});
test('verified learner gets status only, not kit downloads or access grant',async()=>{
  const calls=[];
  await sandbox({},async(url, opts)=>{
    calls.push({url:String(url),opts});
    if(calls.length===1) return ok(verified);
    return ok([
      {product_code:'starter',delivery_status:'pending',session_id:'cs_secret'},
      {product_code:'facilitator',delivery_status:'sent',session_id:'cs_hidden'},
      {product_code:'dangerous',delivery_status:'sent'}
    ]);
  },async()=>{
    const res=response();await handler({method:'GET',headers:bearer,query:{email:'attacker@example.com'}},res);
    assert.equal(res.statusCode,200);
    assert.equal(res.headers['Cache-Control'],'no-store');
    assert.equal(res.body.course_access_enabled,false);
    assert.deepEqual(res.body.entitlements,[
      {product:'starter',delivery_status:'pending'},
      {product:'facilitator',delivery_status:'sent'}
    ]);
    assert.ok(!JSON.stringify(res.body).includes('cs_secret'));
    assert.ok(!JSON.stringify(res.body).includes('qa_service_placeholder'));
    assert.ok(!JSON.stringify(res.body).includes('download'));
    assert.match(calls[0].url,/\/auth\/v1\/user$/);
    assert.match(calls[1].url,/\/rpc\/lookup_verified_course_status$/);
    assert.deepEqual(JSON.parse(calls[1].opts.body),{p_verified_email:'buyer@example.com'});
    assert.notEqual(JSON.parse(calls[1].opts.body).p_verified_email,'attacker@example.com');
  });
});
test('ledger outage cannot expose entitlements',async()=>{
  await sandbox({},async(url)=>{
    if(String(url).includes('/auth/')) return ok(verified);
    return {ok:false,status:503};
  },async()=>{
    const res=response();await handler({method:'GET',headers:bearer},res);
    assert.equal(res.statusCode,503);
  });
});
test('SQL migration restricts lookup to service role and does not bypass RLS',()=>{
  const sql=readFileSync(new URL('../qa/sql/lookup_verified_course_status.qa-only.sql',import.meta.url),'utf8');
  assert.match(sql,/SECURITY INVOKER/);
  assert.match(sql,/REVOKE ALL .* FROM PUBLIC, anon, authenticated;/);
  assert.match(sql,/GRANT EXECUTE .* TO service_role;/);
  assert.doesNotMatch(sql,/SECURITY DEFINER/);
});
