# Payments Preview Activation Gate — 2026-10-09
Verified Vercel environment listing for project prj_Ke6R8PFqGZX2skgoruFv8Qwx9fxP, team team_0zyECVIMLtQ5LxYRz5aNo4PI, decrypt=false: one preview variable VITE_SUPABASE_PUBLISHABLE_KEY, restricted to branch release/go-live-2026-10-12. hiddenProductionEnvCount=0. This inventory does not establish server-side Stripe and Supabase webhook credentials on the intended QA branch.
DO NOT write credentials to GitHub, issues, logs, or documents.
## Required private QA configuration
STRIPE_SECRET_KEY (test key only), STRIPE_WEBHOOK_SECRET (test endpoint signing secret), STRIPE_MODE=test, STRIPE_STARTER_PAYMENT_LINK_ID, STRIPE_FACILITATOR_PAYMENT_LINK_ID, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CHECKOUT_RECORDING_ENABLED=true only after verified QA endpoint and database authorization.
## Sequence
1. Approve isolated preview deployment for QA branch; restrict preview access.
2. Set secrets through Vercel encrypted environment management, scoped to QA branch, with least privilege. Never display values in logs.
3. Deploy preview and verify webhook endpoint responds 405 for GET, 400 for invalid signature, 503 for missing configuration in controlled test; do not expose internal details to customers.
4. Register Stripe TEST webhook endpoint with correct URL, subscribe checkout.session.completed and checkout.session.async_payment_succeeded.
5. Verify signed test event and database pending-entitlement entry; verify duplicate event idempotency and failed database retry behavior.
6. Verify real course access separately, then full/partial refund and entitlement policy; keep production disabled until independent QC.
## Current state
NOT ACTIVATED. No evidence of QA webhook deployed, credentials installed, successful workflow run, or customer course fulfillment. Production HOLD.
