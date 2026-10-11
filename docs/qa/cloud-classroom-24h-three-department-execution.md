# Cloud classroom: 24-hour three-department execution

Target: working isolated QA classroom prototype by 2026-10-12, not a production launch. Zero spend, no real charges, no commercial content, no production merge/deploy. Production HOLD until 25/25 independently verified E2E plus human signoff.

## CODI: program/operations department
Own cross-department priorities, acceptance evidence, course/sample-content requirements, accessibility and mobile UX, blockers, independent QC coordination. Scope minimum viable demo: sample course overview, modules, resume, learner sign-in, locked/unlocked/expired/refunded states, optional approved sample handout. Track genuine evidence; never imply simulated agents independently signed off.

## FRIDAY: checkout/security/delivery department
Own QA-only entitlement state machine and proposed migration, refund-before-checkout monotonic revocation, Stripe TEST signed webhook/idempotency checks, RLS and private lesson authorization, immutable buyer mapping, secure short-lived resource access. Keep original JP-QA-01 separate from all plus-address QA aliases. No synthetic paid-order claims. Proposed migration needs review and QA-only execution evidence before acceptance.

## SAM: classroom QA/prototype department
Own Replit QA sample classroom, responsive browser experience, sample lesson navigation and companion handout, anonymous/cross-account/refunded/expired negative tests, mobile CORS and download receipt checks, integration evidence dashboard. Do not deploy or publish. Keep mock results separate from actual TEST provider evidence.

## Delivery gates by tomorrow
1. Demonstrable local/isolated QA sample classroom, with sample content only.
2. Access-denied and allowed demonstrations with test-only identities; no unauthorized authentication.
3. Security regression test output and clear pass/fail statuses.
4. Android/mobile viewport verification, CORS and companion handout check where authorized browser accessible.
5. CODI independent QC review of demo and unresolved blockers.

## Risks and fallback
If provider secrets or authorized tester authentication unavailable, demonstrate only safe mock entitlement transitions clearly labeled SIMULATED, not real purchase success. If SQL migration not approved, do not apply. Report genuine human-required blockers only. No production release.
