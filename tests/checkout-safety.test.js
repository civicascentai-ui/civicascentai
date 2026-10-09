import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const webhook = readFileSync(new URL('../api/stripe-webhook.js', import.meta.url), 'utf8');
const confirmation = readFileSync(new URL('../thank-you.html', import.meta.url), 'utf8');

test('checkout return cannot falsely confirm payment', () => {
  assert.doesNotMatch(confirmation, /PAYMENT COMPLETE/i);
  assert.match(confirmation, /cannot verify whether a payment succeeded/i);
  assert.match(confirmation, /only after CivicAscent AI verifies payment/i);
});
test('webhook rejects unsigned requests and missing secrets', () => {
  assert.match(webhook, /constructEvent\(/);
  assert.match(webhook, /STRIPE_WEBHOOK_SECRET/);
  assert.match(webhook, /Invalid Stripe webhook signature/);
  assert.match(webhook, /Stripe webhook not configured/);
});
test('webhook does not grant access or fulfill unverified payments', () => {
  assert.match(webhook, /payment_status !== 'paid'/);
  assert.match(webhook, /amount_total <= 0/);
  assert.match(webhook, /Entitlement processing not configured/);
});
