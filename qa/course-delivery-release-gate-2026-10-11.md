# Course delivery release gate (QA only)

Status: HOLD. This is an acceptance test, not proof of a completed delivery.

## Verified facts (2026-10-11)
- Work-mailbox to kpeters9@gmail.com QA status email arrived in recipient Inbox.
- Customer reports no actual course download email arrived.
- QA delivery function v8 only streams private `course-qa-private/{product}/README.md` and labels it `placeholder-not-course`.
- Starter TEST checkout email on record is `jkpeters9@gmail.com`, distinct from requested destination `kpeters9@gmail.com`.
- Download ledger `sent` means a QA placeholder stream completed; it does not verify email or complete course receipt.

## Required repair sequence
1. Identify and approve complete Starter and Facilitator course artifacts, with manifest, size, SHA-256, version, learner instructions, and release owner signoff.
2. Upload artifacts into private storage. Keep public access disabled. No plaintext secrets in GitHub.
3. Replace README-only behavior on QA branch/QA endpoint, maintaining verified learner JWT, verified-email paid entitlement, storage privacy, size limits, stream-failure handling, and no-store response headers.
4. Verify the original purchaser's identity before any entitlement email change. Never treat receipt of a generic email as proof of ownership or silently copy entitlement between addresses.
5. Exercise one authorized TEST purchase to complete file download; verify local filename, archive contents, checksums, course completeness and learner access. Confirm independent receipt, not only server `sent`.
6. Negative tests: missing/wrong learner, wrong product, refunded/reversed entitlement, replay, delayed webhook, cancellation, duplicate events, expired token, broken download, and retries.
7. Run 25 distinct sandbox purchase-to-real-course cases with unique checkout IDs and independent QA evidence. No live charges.
8. Obtain human release approval before changing production. Maintain HOLD otherwise.

## Reporting rules
- Email route: PASS.
- Placeholder stream: QA-only technical observation, NOT course fulfillment.
- Complete course receipt: FAIL / not received as reported by recipient.
- Independent 25-case E2E: 0/25 verified.
- Production: HOLD.
