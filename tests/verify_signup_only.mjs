// Signup-only release gate. Read local code only; never open a payment,
// submit a customer form, call Stripe, or perform live transactions.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import handler from '../api/create-checkout-session.js';

function fakeResponse() {
  return {
    headers: {},
    code: undefined,
    body: undefined,
    setHeader(key, value) { this.headers[key] = value; return this; },
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

for (const method of ['POST', 'GET', 'PUT']) {
  const res = fakeResponse();
  handler({ method }, res);
  assert.equal(res.headers['Cache-Control'], 'no-store');
  if (method === 'POST') {
    assert.equal(res.code, 403, 'POST must not open a payment');
    assert.equal(res.body.code, 'PAID_ENROLLMENT_ON_HOLD');
    assert.deepEqual(res.body.free_registration, ['/register.html', '/registro.html']);
  } else {
    assert.equal(res.code, 405, 'only POST defined, with payment blocked');
  }
}

const api = readFileSync('api/create-checkout-session.js', 'utf8');
assert.ok(!api.includes('checkout.sessions.create'), 'No Stripe payment session creation');
assert.ok(!api.includes('STRIPE_SECRET_KEY'), 'No payment credentials loaded while on hold');
for (const [path,lang] of [['register.html','en'],['registro.html','es']]) {
  const text = readFileSync(path,'utf8');
  assert.ok(text.includes('<html lang="'+lang+'"'), 'Expected language for '+path);
  assert.match(text,/href="https:\/\/book\.stripe\.com\/[A-Za-z0-9]+"/);
  assert.ok(text.includes('$0'), 'Free workshop must clearly say $0');
  assert.ok(!text.includes('buy.stripe.com'), 'No purchase links on registration page');
}
for (const path of ['course.html','curso-es.html']) {
  const html = readFileSync(path,'utf8');
  assert.ok(!html.includes('buy.stripe.com'), 'No direct paid links on '+path);
  assert.ok(!/href="[^"]*(\/api\/create-checkout-session|checkout\.stripe\.com)/i.test(html), 'No checkout links in '+path);
}
console.log('PASS: free bilingual entry, paid CTA disabled, POST 403 and zero payment sessions; no external network or charges');
