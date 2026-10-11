# Friday QA reversal-ordering acceptance gate

This is an isolated QA-branch-only regression specification. It is NOT evidence that a migration has been applied.

## Required cases
1. Refund event received before checkout completion for the same TEST PaymentIntent: no active entitlement after late checkout event.
2. Checkout completion followed by refund: entitlement revoked and paid ledger reconciled.
3. Replay of either signed Stripe event: exactly one durable event record and no duplicate entitlement.
4. Concurrent delivery of checkout and refund: final entitlement revoked regardless of processing order.
5. Forged or incorrectly signed webhook: rejected before database RPC.
6. Mismatched TEST PaymentIntent, session, product, currency, or expected cents: rejected without granting access.
7. No grant on merely created checkout session; only authenticated paid event counts.
8. Each of five QA cases has distinct PaymentIntent and separately evidenced successful paid status.
9. Approved private QA README download requires authenticated identity and server receipt; browser response and exposed CORS header must be verified independently.
10. Preserve JP-QA-01 original buyer identity; new plus-address aliases cannot inherit that entitlement.

## Execution constraints
Use only QA Supabase and Stripe TEST. Migration requires independent SQL review before QA staging application. No production/main changes, no deployment, no live charges, no OTP or token logs. Keep PR #51 draft and production HOLD until 25/25 E2E and human signoff.
