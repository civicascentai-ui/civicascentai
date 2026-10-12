import test from 'node:test';
import assert from 'node:assert/strict';
import checkout from '../api/create-checkout-session.js';
import webhook from '../api/stripe-webhook.js';

function response(){
  const headers={};
  return {
    headers,statusCode:200,body:null,
    setHeader(k,v){headers[k.toLowerCase()]=v;return this;},
    status(v){this.statusCode=v;return this;},
    json(v){this.body=v;return this;},
    end(){return this;}
  };
}
function env(variables,run){
  const names=['VERCEL_ENV','VERCEL_URL','CHECKOUT_QA_ORIGIN','STRIPE_TEST_SECRET_KEY','STRIPE_SECRET_KEY',
    'STRIPE_TEST_STARTER_PRICE_ID','STRIPE_TEST_FACILITATOR_PRICE_ID','STRIPE_TEST_WEBHOOK_SECRET',
    'STRIPE_WEBHOOK_SECRET'];
  const original=Object.fromEntries(names.map(k=>[k,process.env[k]]));
  names.forEach(k=>delete process.env[k]);
  Object.entries(variables).forEach(([k,v])=>{process.env[k]=v;});
  return Promise.resolve().then(run).finally(()=>{
    for(const k of names){if(original[k]===undefined)delete process.env[k];else process.env[k]=original[k];}
  });
}
test('checkout GET returns 405, not unhandled Stripe import error',async()=>{
  await env({},async()=>{
    const r=response();
    await checkout({method:'GET'},r);
    assert.equal(r.statusCode,405);
    assert.equal(r.headers.allow,'POST');
    assert.equal(r.headers['cache-control'],'no-store');
  });
});
test('checkout invalid product is rejected before SDK or external calls',async()=>{
  await env({},async()=>{
    const r=response();
    await checkout({method:'POST',body:{product_code:'evil-product'}},r);
    assert.equal(r.statusCode,400);
  });
});
test('checkout refuses production even with synthetic test credentials',async()=>{
  await env({VERCEL_ENV:'production',VERCEL_URL:'qa-test.vercel.app',
    STRIPE_TEST_SECRET_KEY:'sk_test_synthetic',STRIPE_TEST_STARTER_PRICE_ID:'price_synthetic'},
    async()=>{const r=response();await checkout({method:'POST',body:{product_code:'starter'}},r);
      assert.equal(r.statusCode,503);assert.match(r.body.error,/preview/i);});
});
test('checkout cannot start without configured test-mode price',async()=>{
  await env({VERCEL_ENV:'preview',VERCEL_URL:'qa-test.vercel.app',STRIPE_TEST_SECRET_KEY:'sk_test_synthetic'},
    async()=>{const r=response();await checkout({method:'POST',body:{product_code:'starter'}},r);
      assert.equal(r.statusCode,503);assert.match(r.body.error,/not configured/i);});
});
test('checkout rejects untrusted redirect origin',async()=>{
  await env({VERCEL_ENV:'preview',VERCEL_URL:'qa-test.vercel.app',
    STRIPE_TEST_SECRET_KEY:'sk_test_synthetic',STRIPE_TEST_STARTER_PRICE_ID:'price_synthetic',
    CHECKOUT_QA_ORIGIN:'https://attacker.example'},
    async()=>{const r=response();await checkout({method:'POST',body:{product_code:'starter'}},r);
      assert.equal(r.statusCode,503);});
});
test('checkout refuses a non-Vercel preview host',async()=>{
  await env({VERCEL_ENV:'preview',VERCEL_URL:'attacker.example',
    STRIPE_TEST_SECRET_KEY:'sk_test_synthetic',STRIPE_TEST_STARTER_PRICE_ID:'price_synthetic'},
    async()=>{const r=response();await checkout({method:'POST',body:{product_code:'starter'}},r);
      assert.equal(r.statusCode,503);});
});
test('webhook GET returns 405 without importing Stripe',async()=>{
  await env({},async()=>{const r=response();await webhook({method:'GET'},r);
    assert.equal(r.statusCode,405);assert.equal(r.headers.allow,'POST');});
});
test('webhook rejects production before touching Stripe',async()=>{
  await env({VERCEL_ENV:'production',STRIPE_TEST_SECRET_KEY:'sk_test_synthetic',
    STRIPE_TEST_WEBHOOK_SECRET:'whsec_synthetic'},
    async()=>{const r=response();await webhook({method:'POST'},r);assert.equal(r.statusCode,503);});
});
test('webhook rejects missing signing secret',async()=>{
  await env({VERCEL_ENV:'preview',STRIPE_TEST_SECRET_KEY:'sk_test_synthetic'},
    async()=>{const r=response();await webhook({method:'POST'},r);
      assert.equal(r.statusCode,503);assert.match(r.body.error,/not configured/i);});
});
