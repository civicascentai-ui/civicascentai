# CivicAscent AI: Critical AAR and Disaster Response v1
Date: 2026-10-09. Status: DRAFT operational policy for review, QA branch only. Production release HOLD.

## Verified evidence
- Stripe sandbox: 12 earlier paid sessions (11 x $0.50; 1 x $250); $50 partial refund succeeded. Later 2 additional $250 multi-method bulk checkouts succeeded, both actually used Link. Card/Cash App Pay not verified.
- Sandbox AR invoice in_1UOaaBJaOu2sZoZG8iT8Y7wz created in draft with one $250 line item, 500 units, net 30, not sent. AP implementation unverified.
- Checkout webhook source verifies signature, fetches session, checks paid/complete, USD amount, allowlisted Starter $49 or Facilitator $129 link, environment, and service-role-only database RPC. This is source inspection, not runtime proof.
- QA test source checks code text/static patterns; not end-to-end runtime, resilience, load, security penetration, or course delivery.
- No Stripe sandbox webhook endpoint verified. No production course-fulfillment E2E pass. Refund handling and entitlement revocation absent from inspected webhook. Bulk QA links are not in course entitlement allowlist.
- No evidence of proven recovery time, backup restoration, vendor-invoice workflow, accessibility signoff, or 25 course purchases.

## Product review
Product promise: practical AI education, digital-skills support, accessible workshops. Starter and Facilitator sandbox offerings at $49/$129. Validate actual curricula, enrollment UX, learner account activation, content accessibility (WCAG 2.1 AA, captions and ASL access plan), English/Spanish support, instructor operations, privacy notices, refunds and customer support with human reviewers. No claim of completion without evidence.
Key architectural finding: a paid Stripe Checkout is not course fulfillment; recorded pending entitlement is not delivered access.

## Severity and triggers
SEV1: suspected breach, incorrect access grants, lost payment/entitlement records, unbounded duplicate charging, or unavailable core service with active paying customers. Immediately freeze new sales or fulfillment as relevant; preserve logs; alert incident commander and security/LPC; contact processor/provider. No unapproved deletion or production write.
SEV2: checkout failures, webhook outage, invoice discrepancies, refund failure, inaccessible critical learning content. Pause affected path, provide alternate support and status updates.
SEV3: isolated UI or documentation issue without loss or material service impact. Log and fix in QA.

## Incident command and response
Roles: Incident Commander (operations owner), Technical Lead, Payments/Ledger Lead, Security & LPC, Customer Communications, Independent QC. Named people and on-call coverage must be assigned before launch.
0-15 min target: declare severity, preserve evidence, stop affected transactions using approved controls, protect credentials, open incident log, assign owners. These are targets, not verified capabilities.
15-60 min target: assess scope and reconcile Stripe payments/refunds/invoices against internal ledger; isolate QA/production boundaries; notify affected owners and provider; prepare customer notice.
1-4 hours target: restore from verified clean backup or roll back approved release if safe; replay idempotent events only after reconciliation; verify entitlements; test accessibility and core transactions before reopen.
24-72 hours: incident report, customer resolution, legally reviewed notices when applicable, root-cause corrective actions, independent QC and executive approval to resume.
Never assume specific breach-notification deadlines without counsel's jurisdictional assessment.

## Mandatory controls and tabletop tests
1. Backup inventory, encrypted off-site copies, tested restore and documented RPO/RTO targets. No proof currently.
2. Immutable incident/event logs; Stripe idempotency and event deduplication; manual reconciliation and export procedure.
3. Webhook dead-letter/retry queue, outage alarm, replay protection, refund/chargeback state machine and entitlement freeze/revocation.
4. Least privilege, MFA, key rotation, incident credential revocation, environment separation, access review.
5. Transaction kill switch with customer-facing maintenance notice; approved rollback and recovery runbook.
6. Human approval for vendor invoice payments, vendor banking changes, credit notes, large refunds and bulk entitlement grants.
7. Customer support contact and templates for service outage, payment accepted but access delayed, refunds, and privacy incidents.
8. Tabletop exercises: payment succeeded/no access; duplicate webhook; provider outage; compromised credential; database loss; erroneous bulk refund; accessibility outage; invoice fraud; ransomware; data breach.
9. Reopening requires independently witnessed recovery drill, ledger zero unexplained variances, verified checkout and course access, refunds, support and accessibility acceptance.

## Launch gates
G0 production HOLD. G1 verified QA deployment and secret configuration. G2 signed webhook + idempotent ledger. G3 25 paid-course sandbox E2E with real human reviewers and accessibility. G4 full/partial refund and chargeback handling. G5 AR/AP and approvals. G6 backups restored in drill and incident tabletop. G7 security/LPC + independent QC signoff. G8 explicit executive production approval.
