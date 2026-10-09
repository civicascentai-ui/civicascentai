# Sandbox checkout QA handoff (2026-10-09)

Environment: **Stripe sandbox only**. Do not point production or live Payment Links to these resources.

## Confirmed Stripe sandbox objects
- Stripe context: `acct_1UJG04JaOu2sZoZG`, `livemode=false`
- Starter: product `prod_VPP2ca44LL1oiz`, price `price_1UOaEUJaOu2sZoZGtTJuB2G6`, payment link `plink_1UOaEeJaOu2sZoZGFoC1KX2N`, $49 USD.
- Facilitator: product `prod_VPP2dZnuNwGGry`, price `price_1UOaEWJaOu2sZoZGQNnZQ2WK`, payment link `plink_1UOaEgJaOu2sZoZGv9HYFJgh`, $129 USD.
- URLs: https://buy.stripe.com/test_5kQ00kg7Qf1Ufgwgac6Vq00 and https://buy.stripe.com/test_28E4gAaNw2f8fgwgac6Vq01
- Both links use hosted confirmation, explicitly state no course access, and are test-mode.

## Required QA deployment environment (secrets MUST be entered in protected preview environment, never committed)
```env
STRIPE_MODE=test
STRIPE_STARTER_PAYMENT_LINK_ID=plink_1UOaEeJaOu2sZoZGFoC1KX2N
STRIPE_FACILITATOR_PAYMENT_LINK_ID=plink_1UOaEgJaOu2sZoZGv9HYFJgh
STRIPE_SECRET_KEY=<sandbox secret, private>
STRIPE_WEBHOOK_SECRET=<sandbox endpoint signing secret, private>
SUPABASE_URL=<verified Supabase project URL>
SUPABASE_SERVICE_ROLE_KEY=<server-only service role secret, private>
CHECKOUT_RECORDING_ENABLED=true
```
Do not enable CHECKOUT_RECORDING_ENABLED until QA preview deploy, signature verification and service-role-only RPC access have been checked.

## Backend
- `api/stripe-webhook.js` validates Stripe signature and retrieves Checkout Session from Stripe, checks paid/complete, amount, currency, payment link and `livemode`.
- Supabase `public.record_verified_checkout` RPC is restricted to service_role and delegates to private atomic deduplication.
- This creates a **pending** entitlement, not a delivered course.
- No verified Vercel preview webhook runtime or Stripe sandbox webhook destination exists yet.

## Remaining acceptance
1. Deploy QA branch to an isolated Vercel preview with correct root and serverless function routing; do not merge or deploy production.
2. Configure preview-only secrets securely.
3. Create sandbox Stripe webhook destination pointing to the verified preview `/api/stripe-webhook`; subscribe to `checkout.session.completed` and `checkout.session.async_payment_succeeded`; securely set signing secret.
4. Exercise valid signed sandbox paid session, unpaid session, wrong amount/link, bad signature, duplicate event, duplicate session, database outage, and environment mismatch.
5. Verify exactly-once pending entitlement and receipt evidence; implement and verify actual course delivery separately.
6. Complete and record 25 distinct sandbox purchases, including English/Spanish UX, five independent testers, and accessibility/human approval.

**Current end-to-end paid test count: 0/25. Launch: HOLD.**
