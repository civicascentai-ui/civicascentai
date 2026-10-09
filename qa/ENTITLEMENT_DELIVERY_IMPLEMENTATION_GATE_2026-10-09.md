# Entitlement delivery implementation gate
Date: 2026-10-09. Scope: QA branch only. Status: HOLD.

## Verified Supabase schema
- checkout_private.stripe_events: event_id PK, processing_status restricted to pending/processed/ignored/failed.
- checkout_private.entitlements: session_id PK, stripe_event_id UNIQUE FK, product_code starter/facilitator only, exact amounts 4900/12900 cents, USD only, delivery_status pending/sent/failed.
- checkout_private.delivery_attempts: FK session_id, outcome pending/sent/failed, provider_message_id, error_code.
- public.record_verified_checkout RPC exists. The webhook responds delivery:pending after a verified ledger write.
- All three checkout tables contained zero rows when inspected.

## Required implementation before enabling fulfillment
1. Identify and verify the actual course-hosting/access provider and its grant/revoke API. Do not infer that email delivery alone grants course access.
2. Create a trusted server-side delivery worker that reads only verified pending entitlements, claims jobs atomically, and uses a stable idempotency key derived from Stripe session ID and product.
3. Grant access only to the mapped product. Persist provider receipt; mark sent only after confirmed grant.
4. Log attempts with outcome and provider_message_id/error_code. Retry transient errors with bounded backoff; escalate permanent failures to support.
5. Define refund/dispute access suspension and customer notification after legal/policy review.
6. Use least-privilege server credentials, no secrets in source, no anonymous access to private checkout tables.
7. Test duplicates, simultaneous events, failed grants, timeouts, retry, refunds, and user-facing access before 25 sandbox E2E cases.
8. Independent QC and authorized production approval remain mandatory.

## Release criteria
No live payments, fulfillment advertising, or go-live claim until authenticated Stripe sandbox webhook, real course access, refund handling, 25/25 sandbox E2E evidence, and independent QC all pass.
