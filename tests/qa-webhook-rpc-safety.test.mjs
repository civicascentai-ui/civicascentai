import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../api/stripe-webhook.js', import.meta.url), 'utf8');
const start = source.indexOf('async function rpc(name,args){');
const end = source.indexOf('\nexport const config=', start);
assert.ok(start >= 0 && end > start, 'RPC helper must be present in QA webhook');
const rpcSource = source.slice(start, end);
function fixture({httpOk=true,accepted=true,configured=true}={}) {
  const calls=[];
  const fetch=async (url, request) => {
    calls.push({url,request});
    return {ok:httpOk,status:httpOk?200:503,json:async()=>accepted};
  };
  const process={env:{SUPABASE_URL:'https://qa.example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:configured?'sandbox_test_only_key':undefined}};
  const rpc = vm.runInNewContext(rpcSource+'\nrpc', {fetch,process,JSON,Error});
  return {rpc,calls};
}

test('accepts explicitly successful QA database receipt', async()=>{
  const t=fixture();
  assert.equal(await t.rpc('record_verified_checkout_v2',{p_event_id:'evt_synthetic'}),true);
  assert.equal(t.calls.length,1);
  assert.match(t.calls[0].url,/\/rest\/v1\/rpc\/record_verified_checkout_v2$/);
  assert.equal(t.calls[0].request.method,'POST');
});
test('refuses HTTP 200 with database rejection false so Stripe can retry',async()=>{
  const t=fixture({accepted:false});
  await assert.rejects(t.rpc('record_verified_checkout_v2',{}),/Database rejected QA webhook event/);
});
test('refuses HTTP 503 database failure so Stripe can retry',async()=>{
  const t=fixture({httpOk:false});
  await assert.rejects(t.rpc('record_verified_payment_reversal',{}),/failed: HTTP 503/);
});
test('refuses malformed database result rather than acknowledge',async()=>{
  const t=fixture({accepted:null});
  await assert.rejects(t.rpc('record_verified_payment_reversal',{}),/Database rejected QA webhook event/);
});
test('fails closed if server credentials are not configured',async()=>{
  const t=fixture({configured:false});
  await assert.rejects(t.rpc('record_verified_checkout_v2',{}),/Database not configured/);
  assert.equal(t.calls.length,0);
});
