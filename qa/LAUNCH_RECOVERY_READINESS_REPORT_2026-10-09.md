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

## QC addendum (2026-10-09, latest QA changes)
- Replaced the unused example checkout creation API in `api/create-checkout-session.js` with a method-checked, **503 fail-closed** response. It no longer attempts to create Checkout Sessions with placeholder pricing/redirects. This change applies only to the QA branch; it does not turn off publicly advertised live Stripe payment links.
- Added `tests/checkout-session-disabled.test.js` (2 tests) to prevent the placeholder checkout route from accidentally becoming active.
- **Latest isolated QA Actions run:** 28/28 passed, 0 failed, 0 skipped: https://github.com/civicascentai-ui/civicascentai/actions/runs/37927164343
- An earlier CI workflow had failed at Node setup before testing because it requested npm caching without a package lock; configuration was corrected and rerun to passing. Future release hardening should commit a lockfile and pin dependencies.
- The passing tests are automated and partially mocked. They are not payment-to-download, independent human learner acceptance, actual refund revocation, or proof of production readiness. Production HOLD remains mandatory.

## CODI staging-only delivery/reversal implementation update — 2026-10-09
**Branch:** `qa/external-launch-acceptance-20261009`. **Launch:** NO-GO / HOLD.
**Changes were committed to QA, not applied to shared Supabase, Stripe live, or production.** Vercel creates automatic nonproduction branch previews, but secret-dependent endpoints stay disabled.

### Implemented (code only)
- `api/course-download.js`: denies by default unless `COURSE_DOWNLOAD_ENABLED=true` and `STRIPE_MODE=test`; rechecks Supabase confirmed-email identity; fetches an active matching SKU entitlement only from service-role-only SQL; checks Storage bucket is private; signs an exact allowlisted object with a 30-second expiration; calls a final transactional delivery-receipt RPC. A refund during the download authorization flow denies release of the URL.
- `qa/sql/secure-delivery-refund.staging-only.sql`: **unapplied** database design for held/active/revoked entitlements; event-id deduplicated refund/dispute history, refund holds that can precede payment events, restricted service-role RPCs, and durable delivery-attempt receipts.
- `api/stripe-webhook.js`: QA-only signed Stripe webhook now uses `record_verified_checkout_v2`; rejects live-mode configuration; adds Stripe API re-verification of `charge.refunded` and `charge.dispute.created` events before restricted reconciliation RPC.
- `tests/course-download.test.js`, `tests/checkout-refund-safety.test.js`: covers access disabled, live-mode refusal, unverified buyer, wrong product, public bucket, incorrect signed object, refund at final grant and invalid/disabled refund events.
- `qa/25_SANDBOX_COURSE_E2E_MATRIX_2026-10-09.csv`: 25 **NOT RUN** independently witnessed purchaser-access evidence slots: 5 tester slots x 5 distinct purchases (13 Starter / 12 Facilitator).

### Verified automated QC
GitHub Actions isolated safety suite: **42/42 passed, 0 failed, 0 skipped**. Run: https://github.com/civicascentai-ui/civicascentai/actions/runs/37932430190 . General and checkout quality workflows succeeded for that code revision. These are isolated tests with mocks and static checks, **not** signed webhook delivery, real Stripe purchase-to-file access, refund lifecycle, or independent human QC.

### Remaining hard blockers
1. Provision isolated $0-cost-confirmed Supabase staging project/database and private Storage kit bucket. No schema migration should be applied to the connected shared RAG database without a separate explicit review.
2. Obtain **approved paid-kit files**, real Starter and Facilitator object mappings, and a defined license/use policy.
3. Configure secret values only in a restricted preview environment; set up the Stripe **sandbox** webhook endpoint and a confirmed private staging URL. No production/live webhook changes.
4. Test real signed paid sandbox sessions, event ordering, duplicate delivery, access after purchase, failed/recovered fulfillment, full and partial refund, dispute, and safe regrant. Verify the 30-second link with assistive accessibility settings.
5. Run 25 genuine distinct purchases-to-file-open test traces and secure independent human reviewer signoffs. Do not count code tests as purchases.

### Customer-protection release gate
Published LIVE payment links remain in the public `course.html` on the default branch while operational delivery is not established. Pausing these links requires an **explicit** separate live-account instruction. No change was made to customer-facing payment availability.

## Security remediation revision (2026-10-09, 12:57 UTC)
**Priority:** P0, QA branch only. **Production:** HOLD.

An independent follow-up identified a residual access-revocation weakness in signed Storage URLs. Supabase documentation states that a signed URL remains usable until expiry regardless of Auth key changes and that CDN caches may persist after token expiry. A 30-second signed URL does not guarantee instantaneous revocation.

**Corrective commits:** `cde799dc` server-authorized direct file streaming, `3d51b3fe` two-stage SQL receipt lifecycle, `d49a1a27` updated tests. These replace the proposed 30-second client-side signed-URL contract from the earlier section above. The newer streaming design is authoritative. References:
- https://supabase.com/docs/guides/storage/serving/downloads
- https://supabase.com/docs/guides/storage/cdn/smart-cdn
- https://supabase.com/docs/reference/self-hosting-storage

**Authorization flow:** confirmed user email -> trusted service-role SKU entitlement lookup -> private-bucket check -> server-only object GET -> lock and reserve pending download receipt while confirming entitlement active/no refunds -> server streams bytes (does not disclose Storage bearer URL) -> record successful or failed transfer. Separate client possession of already downloaded media cannot be revoked technically. Refunds block *new* requests, not historical copies. Streaming-size limit is 25 MiB; larger course kits need an independently reviewed delivery mechanism.

**Verification:** GitHub isolated safety suite passed **43 tests, 0 failures, 0 skipped**, https://github.com/civicascentai-ui/civicascentai/actions/runs/37933457634 . This proves mocked interface/error behaviors only, not end-to-end Stripe purchases or real file delivery. Supabase staging migrations remain unapplied, Vercel QA branch lacks protected environment variables, Stripe sandbox webhook is not configured, and 25-purchase acceptance remains **0/25**.

**Required QC before any deployment:** stage schema in isolated project; assert RLS/service-role grants; test a real private file, large-file/timeout/aborted downloads, refund-concurrency gates, CDN avoidance, and receipt reconciliation, then conduct independent manual verification. Observe resource/cost constraints; no automatic project purchases. No production rollout has been authorized.

## Final current checkpoint: protected streaming + materials discovery
**Latest recorded test run:** 45/45 PASS, zero failed and zero skipped, 2026-10-09:
https://github.com/civicascentai-ui/civicascentai/actions/runs/37933688280
Run includes additional rejection tests for oversized files and interrupted file streams. This is still automated code-level evidence, not live payment or learner-access acceptance.

**Source-material discovery:** Connected private Google Drive contains Level 1 lesson, learner worksheet, optional practice pack, an internal-only Facilitator Demonstration Kit, a user-testing pilot kit and the internal curriculum/price/delivery standard. These are **candidates, not finished approved commercial downloads**. No complete, approved $49 or $129 customer bundle has been positively identified. Private source IDs and document contents are intentionally omitted from this public GitHub report.

See the sanitized asset/release inventory at `qa/COURSE_ASSET_READINESS_2026-10-09.md`.

**Unchanged critical launch gates:** Isolated staging DB, preview-only secrets, private vetted customer ZIPs, signed Stripe sandbox webhook, true purchase-to-stream verification, refund/held-access race testing with real backend, 25/25 independent purchase evidence, reviewer signatures, and executive production approval. Sandbox-to-real-course E2E remains 0/25.

**Executive decision:** NO-GO, production HOLD. Existing LIVE Stripe links have not been altered or disabled. Pending risk decision: pause the live sale links until paid fulfillment is operational; do not imply this happened.

## CODI verified SQL + webhook hardening checkpoint (2026-10-09)
- **Staging SQL correction:** `qa/sql/secure-delivery-refund.staging-only.sql` now confirms the Stripe session/event/SKU/amount/email exists in the authoritative entitlement row before activation; no longer depends on a specific v1 `record_paid_checkout` response string. A full refund arriving *before* payment processing now yields `revoked` rather than `held`; a partial refund/dispute yields `held`. Event/session payment-intent rebinding is rejected. These corrections are QA branch only, **not applied to shared Supabase**.
- **Actual isolated PostgreSQL execution:** `qa/sql/fixtures/isolated-checkout-base.sql` creates a synthetic representation of the observed private checkout tables and service role, then `qa/sql/secure-delivery-refund.staging-only.sql` is applied to an ephemeral PostgreSQL 16 GitHub Actions container. `qa/sql/tests/checkout-fulfillment-acceptance.sql` executes six assertion groups (refund-before-payment, buyer/SKU isolation, streaming receipt, partial refund + duplicate event replay, dispute-before-payment, DB permissions). **PASS**: https://github.com/civicascentai-ui/civicascentai/actions/runs/37936943308 . Caveat: the v1 record function is a representative synthetic fixture; this is SQL integration QC, not real Supabase deployment or real Stripe acceptance.
- **Signed Stripe event lifecycle:** `api/stripe-webhook.js` now has bounded raw body length and 8-second RPC timeouts, an injectable internal test seam, and retains fail-closed sandbox-only payment/refund handling. Unrelated signed events are acknowledged without writes, while live-mode paid/refund processing remains disabled. Tests exercise valid Stripe-signed Starter events, amount/allowlist mismatches, refund and dispute re-verification, 503 retry behavior and large body rejection.
- **Latest automated code QC:** **54 tests, 54 passed, 0 failed, 0 skipped**, run: https://github.com/civicascentai-ui/civicascentai/actions/runs/37937300643 . Checkout QA, Quality Gate and QA preview also succeeded on `c76059c8`. Earlier intermediate workflow failures were fixed before this checkpoint; use the latest green commit rather than previous intermediate jobs as acceptance evidence.
- **Current constraints unchanged:** connected Supabase checkout entitlements/events/delivery attempts remain **0/0/0** from read-only inspection. No isolated staging Supabase, no ready/approved commercial downloadable kit, no protected Vercel branch secrets, no sandbox webhook endpoint, no functioning end-user sign-in and **0/25 real course purchases-to-access**. Existing Stripe LIVE payment links remain unchanged pending explicit authorization. **PRODUCTION NO-GO**.
- **Next strict sequence:** assign commercial package approver, secure approved two-SKU private kit assets, approve isolated staging cost/scope, configure staging-only keys and signed sandbox webhook, verify buyer log-in and one real test purchase-to-download/refund, finish five testers x five purchases, run independent review, then seek explicit production change approval.
