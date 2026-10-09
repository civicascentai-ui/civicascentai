import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/stripe-webhook.js';

function response() {
  return {
    statusCode: 200, headers: {}, body: null, ended: false,
    status(code) { this.statusCode = code; return this; },
    setHeader(key, value) { this.headers[key] = value; return this; },
    json(value) { this.body = value; return this; },
    end() { this.ended = true; return this; }
  };
}

test('runtime: non-POST webhook requests are rejected', async () => {
  const res = response();
  await handler({method:'GET'}, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, 'POST');
  assert.equal(res.ended, true);
});

test('runtime: absent Stripe webhook secrets fail closed', async () => {
  const oldKey = process.env.STRIPE_SECRET_KEY;
  const oldWebhook = process.env.STRIPE_WEBHOOK_SECRET;
  try {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const res = response();
    await handler({method:'POST'}, res);
    assert.equal(res.statusCode, 503);
    assert.deepEqual(res.body, {error:'Stripe webhook not configured'});
  } finally {
    if (oldKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = oldKey;
    if (oldWebhook === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = oldWebhook;
  }
});
