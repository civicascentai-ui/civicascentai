// Internal QA-only, one-attempt Stripe TEST Checkout session contract.
// This does not submit a card, purchase, grant entitlement, or assert delivery.
import assert from 'node:assert/strict';

// Default to the stable QA branch alias, not an older immutable preview build.
// An authorized runner may specify a current CivicAscent QA deployment via env.
const stableQaOrigin = 'https://civicascentai-launch-qa-git-qa-friday-secu-85862f-civicascentai.vercel.app';
const origin = process.env.QA_PREVIEW_ORIGIN || stableQaOrigin;
const allowed = new URL(origin);
assert.equal(allowed.protocol, 'https:');
assert.equal(allowed.username, '');
assert.equal(allowed.password, '');
assert.equal(allowed.port, '');
assert.equal(allowed.pathname, '/');
assert.equal(allowed.search, '');
assert.equal(allowed.hash, '');
assert.ok(
  allowed.hostname === new URL(stableQaOrigin).hostname ||
  /^civicascentai-launch-[a-z0-9]+-civicascentai\.vercel\.app$/.test(allowed.hostname),
  'Checkout QA origin must be an approved CivicAscent Vercel QA deployment.'
);
console.log('CivicAscent QA preview host: ' + allowed.hostname);
const api = new URL('/api/create-checkout-session', origin);

async function check(method, body, expected) {
  const response = await fetch(api, {
    method,
    redirect:'manual',
    headers: body ? {'Content-Type':'application/json'} : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(25000)
  });
  console.log(method + ' ' + (body?.product_code||'') + ': HTTP ' + response.status);
  if ([301,302,303,307,308,401,403].includes(response.status)) {
    // Do not follow the SSO redirect or relax preview protection.
    console.error('VERCEL_PROTECTION_BLOCKED: Runner lacks authenticated preview access.');
    console.error('Use an authorized Vercel CLI session or approved origin-scoped OIDC access.');
    throw Error('E2E QA blocked by protected preview before the API was tested.');
  }
  assert.equal(response.status, expected,
    'QA contract mismatch. No payment or delivery has been executed.');
  if (method !== 'POST' || expected !== 200) return;
  const result = await response.json();
  assert.equal(typeof result.url, 'string');
  const checkout = new URL(result.url);
  assert.equal(checkout.protocol, 'https:');
  assert.equal(checkout.hostname, 'checkout.stripe.com');
  console.log('Stripe hosted TEST checkout session created, URL intentionally withheld.');
}

await check('GET', null, 405);
await check('POST', {product_code:'not-a-course'}, 400);
await check('POST', {product_code:'starter'}, 200);
console.log('PASS: QA checkout session creation. Card payment and fulfillment NOT RUN.');
