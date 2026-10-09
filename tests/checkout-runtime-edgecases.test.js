import test from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import handler from '../api/stripe-webhook.js';

function response() {
  return {
    statusCode: 200, body: null, ended: false, headers: {},
    status(code) { this.statusCode = code; return this; },
    setHeader(key, value) { this.headers[key] = value; return this; },
    json(value) { this.body = value; return this; },
    end() { this.ended = true; return this; }
  };
}
async function withWebhookEnv(fn) {
  const names = ['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET'];
  const old = Object.fromEntries(names.map(n => [n, process.env[n]]));
  process.env.STRIPE_SECRET_KEY = 'sk_test_qa_placeholder_no_network';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_qa_only';
  try { await fn(); }
  finally { for (const n of names) { if (old[n] === undefined) delete process.env[n]; else process.env[n] = old[n]; } }
}
function request(payload, signature) {
  return {
    method:'POST',
    headers:{'stripe-signature':signature},
    async *[Symbol.asyncIterator]() { yield Buffer.from(payload); }
  };
}

test('runtime: missing signature fails with 400, no entitlement', async () => {
  await withWebhookEnv(async () => {
    const res = response();
    await handler(request(JSON.stringify({id:'evt_unsigned',type:'checkout.session.completed'}),undefined),res);
    assert.equal(res.statusCode,400);
    assert.deepEqual(res.body,{error:'Invalid Stripe webhook signature'});
  });
});

test('runtime: correctly signed unrelated event is acknowledged without entitlement', async () => {
  await withWebhookEnv(async () => {
    const payload=JSON.stringify({id:'evt_qa_nonpurchase',type:'customer.created',data:{object:{id:'cus_qa'}}});
    const signature=Stripe.webhooks.generateTestHeaderString({payload,secret:process.env.STRIPE_WEBHOOK_SECRET});
    const res=response();
    await handler(request(payload,signature),res);
    assert.equal(res.statusCode,200);
    assert.deepEqual(res.body,{received:true});
  });
});

test('runtime: signed unpaid checkout is acknowledged without entitlement', async () => {
  await withWebhookEnv(async () => {
    const payload=JSON.stringify({id:'evt_qa_unpaid',type:'checkout.session.completed',data:{object:{id:'cs_test_qa',payment_status:'unpaid',amount_total:4900}}});
    const signature=Stripe.webhooks.generateTestHeaderString({payload,secret:process.env.STRIPE_WEBHOOK_SECRET});
    const res=response();
    await handler(request(payload,signature),res);
    assert.equal(res.statusCode,200);
    assert.deepEqual(res.body,{received:true});
  });
});
