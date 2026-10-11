# CivicAscent AI: Cloud Classroom Pivot (QA proposal, 2026-10-11)

## Decision
Primary product: authenticated, cloud-hosted curriculum access on CivicAscent website. Optional downloadable companion handouts are supplementary, never the sole entitlement proof. Zero new spend. QA branch only; production HOLD.

## Customer journey
1. Public course description and free lead signup (no entitlement).
2. Authenticated learner account with verified email, or an authorized test account.
3. TEST checkout uses immutable price/product identifiers, verified Stripe signature, and idempotent durable event ingestion.
4. Backend entitlement service grants access only after independently verified paid state, never checkout-session creation.
5. Protected classroom fetches curriculum through a server authorization check on every request, with private content storage and short-lived resource access.
6. Refund, dispute, expiration, manual suspension, and chargeback remove future access via monotonic revocation rules; delayed paid webhooks cannot regrant revoked access.
7. Optional companion PDFs/handouts use private signed URLs and clear download limitations. Previously downloaded files cannot be remotely revoked.

## Cross-functional critical review (proposals, NOT agent signoffs)
- Product/Learning: PRO updatable lessons, progress, accessibility and cohort offerings. CON requires navigation, course authoring, mobile and low-bandwidth UX.
- Friday checkout/delivery: PRO single entitlement gate. CON race conditions, webhook replay, cross-account leakage, refund ordering. Gate: real TEST events, signature, 25/25 E2E.
- Sam QA: PRO reproducible browser access tests. CON runner integration and Android CORS/browser receipt not yet proven. Gate: actual authenticated mobile browser QA.
- Security/LPC: PRO revocation of future requests and private storage. CON screenshot/offline copies, account sharing, sensitive logs, privacy and accessibility. Gate: RLS review, no tokens in logs, audit trail.
- Reach/Partnerships: PRO easy pilot and scholarship seats. CON learner support, organizational licensing and connectivity barriers. Gate: written pilot terms and support plan.
- Operations/Support: PRO centralized support and access extensions. CON password recovery, billing disputes, outages. Gate: admin role boundaries and recovery workflow.
- Independent QC: No approval until all above gates have evidence. All roles here are review lenses, not confirmed autonomous agents.

## First isolated implementation slice
- Add protected classroom route with sample non-commercial QA-only lessons and an optional companion sample handout.
- Implement learner-specific entitlement checks in backend; deny missing/expired/revoked access.
- Preserve historical JP-QA-01 original identity, separate all new plus-address QA accounts.
- Create negative tests for cross-account access, late payment-after-refund, replay, expired access, copied resource URL, and anonymous access.
- Keep paid commercial ZIPs unapproved; never imply paid access exists from created checkout sessions.
- No merge, production deployment, new spend, live charge, email blast, or external publication.

## Decision status
Architecture pivot approved for isolated implementation and critical review. No team signoff, migration execution, successful purchase, or live classroom deployment claimed.
