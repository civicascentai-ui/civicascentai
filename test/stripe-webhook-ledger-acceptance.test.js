import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../api/stripe-webhook.js',import.meta.url),'utf8');
test('checkout ledger must explicitly accept payment event',()=>{
 assert.match(source,/checkoutAccepted\s*!==\s*true/);
 assert.match(source,/Checkout ledger rejected event/);
});
test('reversal ledger must explicitly accept refund event',()=>{
 assert.match(source,/reversalAccepted\s*!==\s*true/);
 assert.match(source,/Reversal ledger rejected event/);
});
test('webhook verifies Stripe signature and refetches paid session',()=>{
 assert.match(source,/stripe\.webhooks\.constructEvent/);
 assert.match(source,/stripe\.checkout\.sessions\.retrieve/);
});
test('sandbox-only checkout and recording gate remain enabled',()=>{
 assert.match(source,/process\.env\.STRIPE_MODE\s*!==\s*'test'/);
 assert.match(source,/CHECKOUT_RECORDING_ENABLED/);
});
