# CivicAscent AI Course Product: Release Gate

Status: NOT READY FOR SALE OR FULFILLMENT. QA branch only.

## Catalog and promises
- Starter course: $49 sandbox listing, code `starter`.
- Facilitator course: $129 sandbox listing, code `facilitator`.
- These are payment catalog entries, not evidence that course content exists or has been reviewed.
- Never advertise immediate access, completion certificates, accreditation, or accessibility features without proof.

## Required deliverables for EACH course
- [ ] Named course owner approves syllabus, target audience, learning outcomes, prerequisites, and estimated duration.
- [ ] Approved learner-facing modules and exercises; answers and sources checked for accuracy.
- [ ] Instructor/facilitator notes where applicable.
- [ ] Accessible HTML or tagged PDF equivalents for all essential materials, text alternatives for diagrams, and captions/transcripts for video/audio.
- [ ] ZIP artifact exists in private staging bucket `course-qa-private`; record object path, SHA-256, file size, version, owner and approval date.
- [ ] Independent content QA checks links, spelling, factual claims, disclaimers, privacy and learner support instructions.
- [ ] Purchase-to-entitlement-to-download verified using Stripe TEST, with refunds/disputes revoking access and no cross-course leakage.
- [ ] Learner tester independently downloads, opens, completes sample exercise and confirms intended course matches purchase.

## Fulfillment contract
1. Stripe webhook signature and paid-session details verified server-side.
2. Service-role ledger accepts and records only allowlisted price/product, currency, payment link and sandbox event.
3. Learner authenticates by verified email; server checks entitlement; no redirect-based access grants.
4. Only the purchased versioned private course object is served; failed or revoked entitlement is denied.
5. Capture test evidence: event/session IDs (redacted), course code, entitlement, object version, expected/actual result, tester and timestamp.

## Release decision
BLOCK until both course packages, content review, accessibility review and 25 documented sandbox E2E purchases pass. No production deployment or live payment changes without explicit approval.
