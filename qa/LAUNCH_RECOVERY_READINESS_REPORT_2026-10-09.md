# CivicAscent AI — Launch Recovery Readiness Report
**Date:** 2026-10-09 (America/Chicago)
**Prepared by:** CODI, executive project management
**Branch:** `qa/external-launch-acceptance-20261009`
**Release:** **NO-GO / PRODUCTION HOLD**
**Scope:** GitHub/Vercel/Supabase/Stripe access review, isolated QA code/tests, sandbox evidence. No live changes approved or performed.

## Verified evidence
1. GitHub `civicascentai-ui/civicascentai` uses public static HTML, including `course.html`; paid-kit content is not in the reviewed repository tree. `register.html` is a $0 hosted Stripe form, not learner authentication. `course.html` publicly contains five audio lesson previews and advertises Starter ($49) and Facilitator ($129) Stripe links.
2. Vercel has project `civicascentai` (Vite) and `civicascent-ui`. A QA-branch preview was READY; no approved production deployment has been made in this work.
3. Supabase project `alsjvdqlpayuzykhhbil` includes private `stripe_events`, `entitlements`, and `delivery_attempts`, with RLS on and direct service_role handling. Each table held **0 rows** at inspection; Supabase Auth had **0 users** and Storage **0 buckets**. Only RAG-related Edge Functions are present; no course provisioning provider exists.
4. Stripe test account `acct_1UJG04JaOu2sZoZG` contains test payments from **bulk** scenarios, not 25 distinct course-to-access purchases. The sandbox has **0 webhook endpoints**; one $50 test refund is recorded, with no corresponding course-access revocation evidence.
5. Original checkout safety baseline 18/18. New QA safety workflow after remediation: **26 tests passed, 0 failed, 0 skipped**; run https://github.com/civicascentai-ui/civicascentai/actions/runs/37926904263. Other QC workflows on commit `b2f148e2` succeeded. Automated QC is not human E2E or independent acceptance.

## Remediation committed in QA only
- `api/learner-entitlements.js`: GET-only; validates bearer credential against Supabase Auth; requires confirmed email; server-only database RPC; returns **purchase status only**; never grants course access or publishes files. Missing configuration/identity/ledger causes closed failure.
- `qa/sql/lookup_verified_course_status.qa-only.sql`: staged `SECURITY INVOKER` lookup restricted to `service_role`. **Not applied to any database**. Do not apply before isolated staging and access review.
- `tests/learner-entitlements.test.js`: 8 tests for method denial, authentication, missing secrets, token rejection, email confirmation, service-only data exposure, ledger failures and SQL authority.
- `.github/workflows/checkout-qa-tests.yml`: removed broken npm cache/lock prerequisite, ran complete `npm test` suite, 26/26 passed.

## P0 block list
| Gate | Current status | Evidence required to pass |
| --- | --- | --- |
| Authenticated learner identity | BLOCKED | Configured Supabase Auth, confirmed-email registration and recovery, privacy/security review |
| Paid assets/provider | BLOCKED | Approved Starter and Facilitator kits stored in a private bucket or accepted LMS with grant/revoke API |
| QA environment | BLOCKED | Isolated approved preview with server-only secrets and dedicated database, signed Stripe sandbox endpoint |
| Verified payment -> entitlement | NOT E2E VERIFIED | Real signed sandbox checkout for each SKU, correct ledger record and idempotent retry |
| Entitlement -> real access | BLOCKED | SKU-specific private access/download grant with receipt, learner sign-in and access confirmation |
| Refund / dispute | BLOCKED | Fully/partially refunded purchase, access suspend/revoke, ledger reconciliation and notifications |
| Support/recovery | BLOCKED | Paid-no-access incident, replay/timeout, failed delivery, deterministic recovery |
| 25 independent complete purchases | 0/25 | 25 separate test Checkout Sessions including confirmed payment and actual learner access |
| Independent accessibility and QC | BLOCKED | Reviewer signoffs, language/ASL testing and evidence for critical scenarios |
| Production executive approval | NOT GIVEN | Explicit go/no-go after all gates pass |

## Required safe design before full activation
1. Use Supabase Auth confirmed-email sign-in (prefer magic link/OTP) or an approved equivalent; bind each verified Stripe buyer to the same confirmed identity, never trust a URL session ID or mutable user metadata.
2. Keep Stripe prices/product IDs in environment-specific allowlists, verify event signatures using raw body, re-fetch complete paid sessions from Stripe, atomically dedupe event and Checkout Session IDs.
3. Host approved paid materials behind a **private** access layer. Grant/revoke access only for the purchased SKU, record provider receipts and attempts, and support bounded retries. Never use a publicly accessible GitHub Pages URL as paid course access control.
4. Add refund/partial-refund/dispute policy and revocation ledger, and implement customer support regrant only after authorized verification. Reconcile charge/payment_intent to Checkout Session safely.
5. Configure Stripe sandbox webhook *only on isolated preview*, keep all live endpoints/Payment Links untouched until separate written approval. Do not commit keys or expose service_role tokens in browser code.
6. Test success, repeat events, out-of-order events, payment delayed/failed, refund/revoke, missing files, offline DB, expired auth sessions, two different SKU buyers, cross-account access attempts, and recovery. Run security advisors after staging migration.

## Acceptance test matrix
For each of **five independent testers**, run **five distinct completed course purchases**, alternating Starter/Facilitator; each requires its own Checkout Session ID, payment success, event receipt, exactly-once ledger entry, private access grant, content download/open validation, and screenshot/log evidence. Thus **5 x 5 = 25** valid purchase-to-access traces. Add separate negative/refund/recovery tests that do *not* count as completed purchases.
Evidence per case: tester code (not public personal information), SKU, environment, UTC timestamp, non-secret Stripe session/event identifiers, database correlation ID, receipt/grant reference, outcome and independent reviewer signature.

## Accountability
- Engineering/Payments: fulfillment implementation and sandbox webhook.
- Infrastructure/Security: isolated environment, secrets, RLS, encrypted private materials and disaster restore.
- Product/Learning: accepted kit materials, access and learner onboarding.
- Customer Support: incident handling, status notification and escalation.
- Finance/LPC: refund, partial-refund and dispute rules subject to qualified compliance review.
- Independent QC: independently witnessed evidence and launch signoff; **not yet obtained**.
- CODI: coordinate, preserve HOLD and report executive decisions. This does not represent 10 separately running AI agents.

## Decisions needed
1. Approve a secure **staging-only** Supabase/Vercel configuration and secret provisioning. Do not repurpose production or expose secrets.
2. Select where the actual paid kit files will be stored and approve final deliverables: Starter and Facilitator.
3. Confirm account access method: Supabase Auth verified-email login recommended.
4. Authorize safe handling of currently advertised **live Stripe payment links** while fulfillment is not working, since a customer payment without automatic access is a client-protection risk. Do not silently modify live sales settings.
5. Assign human independent testers and accountable QC approver.
6. Later, after all evidence passes, make a **separate explicit** production release decision.

## Executive release decision
**NO-GO.** A green automated suite is not an operational payment-to-access system. No production deployment, live payment activation, QA SQL migration application, or customer-fulfillment claim is authorized by this report.
