import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../course.html', import.meta.url), 'utf8');

test('QA course preview displays a conspicuous no-sale and sandbox warning', () => {
  assert.match(source, /INTERNAL QA PREVIEW ONLY/);
  assert.match(source, /No real charges/);
  assert.match(source, /Materials are not yet approved for sale/);
});

test('QA course links are strictly Stripe test-mode destinations', () => {
  const matches = [...source.matchAll(/href="(https:\/\/buy\.stripe\.com\/[^"]+)"/g)];
  assert.equal(matches.length, 2, 'QA preview must carry only the two known test products');
  for (const [, value] of matches) {
    const u = new URL(value);
    assert.equal(u.protocol, 'https:');
    assert.equal(u.hostname, 'buy.stripe.com');
    assert.ok(u.pathname.startsWith('/test_'), 'Real-money Stripe payment link in QA preview is prohibited');
  }
});

test('QA preview does not contain older production buy-link identifiers', () => {
  assert.ok(!source.includes('9B614o9IJb05c9554a00000'));
  assert.ok(!source.includes('9B68wQaMNd8db51bsy00001'));
});
