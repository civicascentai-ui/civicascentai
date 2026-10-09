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
  assert.match(webhook, /Checkout recording not enabled/);
  assert.match(webhook, /checkout.sessions.retrieve/);
  assert.match(webhook, /CHECKOUT_RECORDING_ENABLED/);
});

test('database RPC uses restricted public wrapper rather than unexposed private schema', () => {
  assert.match(webhook, /\/rest\/v1\/rpc\/record_verified_checkout/);
  assert.doesNotMatch(webhook, /Content-Profile.*checkout_private/);
});
test('test and live Stripe payment links require explicit environment selection', () => {
  assert.match(webhook, /STRIPE_MODE/);
  assert.match(webhook, /STRIPE_STARTER_PAYMENT_LINK_ID/);
  assert.match(webhook, /STRIPE_FACILITATOR_PAYMENT_LINK_ID/);
  assert.match(webhook, /verified\.livemode !== \(expectedMode === 'live'\)/);
});

test('paid session must be complete before recording entitlement', () => {
  assert.match(webhook, /verified\.status !== 'complete'/);
  assert.match(webhook, /verified\.payment_status !== 'paid'/);
});
test('Stripe and database outages fail closed with retryable responses', () => {
  assert.match(webhook, /Stripe session verification unavailable/);
  assert.match(webhook, /Checkout ledger unavailable/);
  assert.match(webhook, /Checkout ledger write failed/);
});

test('unverified checkout does not record an entitlement', () => {
  assert.match(webhook, /recorded:false/);
  assert.match(webhook, /verified\.amount_total !== product\.amount/);
  assert.match(webhook, /verified\.currency !== 'usd'/);
});
