# Learner identity-to-fulfillment sandbox activation checklist
**QA only · 2026-10-09 · NO PRODUCTION DEPLOYMENT AUTHORIZED**

## What is implemented
- \`learner.html\`: accessible verification form, email code entry, verified purchase-status UI. Tokens stay **in page memory**, not cookies or localStorage. No link to this unlaunched page was added to production or customer navigation.
- \`api/learner-auth.js\`: same-origin POST only, disabled unless both \`LEARNER_AUTH_ENABLED=true\` and \`STRIPE_MODE=test\`, requires HTTPS Supabase origin and publishable key. Uses Supabase Auth email OTP and \`verify\` with confirmed-email match. Does not read/write the entitlement ledger.
- \`api/learner-entitlements.js\`: existing read-only, authenticated purchase status, **never grants course access**; current \`course_access_enabled=false\` is deliberate.
- \`api/course-download.js\`: independent, separately flagged private streaming endpoint, not linked to the learner page while approvals/secure assets are missing.
- Tests: \`tests/learner-auth.test.js\` plus previous access/download/refund suites. 65/65 automated tests passed on GitHub Actions as of this checkpoint: https://github.com/civicascentai-ui/civicascentai/actions/runs/37942989789

## Required one-time setup in isolated sandbox, NOT on shared CivicAscent RAG database
1. Owner approves the cost and scope for an **isolated test Supabase project**, provisioned only after explicit consent. All environment variables and secrets must be saved through Vercel protected preview settings, never in GitHub.
2. Configure sandbox Supabase Auth email provider with the email **OTP template** using the Supabase-authored template variable for the one-time code. Verify template delivery to **authorized** test inboxes. Confirm rate limiting and CAPTCHA controls if exposed beyond the small trusted tester group. Never send unsolicited codes.
3. In the **QA preview branch only**, configure:
   - \`STRIPE_MODE=test\`
   - \`LEARNER_AUTH_ENABLED=true\`
   - \`SUPABASE_URL\` (HTTPS test project)
   - \`SUPABASE_PUBLISHABLE_KEY\` (publishable/public key only)
   - \`SUPABASE_SERVICE_ROLE_KEY\` (server-only and protected)
   - \`CHECKOUT_RECORDING_ENABLED=true\` only after correct schema and signed webhook exist
   - \`STRIPE_SECRET_KEY\` and \`STRIPE_WEBHOOK_SECRET\` from the **sandbox**, never live
   - \`STRIPE_STARTER_PAYMENT_LINK_ID\` and \`STRIPE_FACILITATOR_PAYMENT_LINK_ID\` match inspected sandbox links
   - \`COURSE_DOWNLOAD_ENABLED=true\` only after privately vetted course archives and refund checks pass
   - \`COURSE_PRIVATE_BUCKET\`, \`COURSE_STARTER_OBJECT\`, \`COURSE_FACILITATOR_OBJECT\` configured to approved private objects, with strict size limits.
4. Database: review both proposed SQL scripts with independent QC. Apply to isolated preview only; do not alter shared RAG schema. Verify no unauthenticated or public table/RPC grants. The developer fixture simulates v1 ledger; it does **not** establish production equivalence.
5. Run one authorized sandbox purchase. Use the **same email** in Stripe Checkout and the QA learner OTP portal. Confirm verified user identity, one active entitlement, correct SKU, refund holds, successful server-proxied private download and attempt receipt, and denial after refund/dispute.
6. Run 25 unique purchase-to-course delivery acceptance cases with actual sandbox events and authorized test users, then record independent signatures.
7. Only after successful evidence, review launch decision separately; no silent switch to \`STRIPE_MODE=live\`.

## Current blockers
- Connected sandbox Stripe account has **zero registered webhook destinations** at last read.
- No protected QA-branch environment variables were visible in connected Vercel project.
- No isolated Supabase staging project, approved paid kit ZIPs, configured OTP emails, or real purchase-to-access tests.
- Stripe LIVE account is not accessible via current connection, so protective pause of paid links is still **UNVERIFIED**. Never describe links as disabled without a readback from the live account.
- The authenticated status endpoint remains intentionally **read-only** until delivery is operational. The learner portal displays purchase status and **no download buttons** until the separate release gate.

## Security / usability release reminders
- No analytics or persistent access token storage in the QA sign-in experience.
- Client-supplied email and checkout redirect parameters are **never** authorization.
- Service keys are server-only.
- Verify screen reader labeling, keyboard-only sign-in, high contrast, OTP delivery, resend UX and error recovery during independent WCAG QC.
- For leaked or revoked tokens, provider sessions must be revoked/expired. Refund denial remains server-side at every download.
- This checklist is an engineering artifact, not evidence of completed commercial kit fulfillment.

**Owner decision remains: PRODUCTION NO-GO.**
