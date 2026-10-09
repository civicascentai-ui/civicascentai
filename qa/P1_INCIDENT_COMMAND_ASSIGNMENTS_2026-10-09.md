# P1 Emergency Readiness Command Register
Effective 2026-10-09. Decision: all-hands P1; production HOLD. This document assigns functional ownership; human/agent acceptance and execution must be confirmed separately.

## Operating directives
- Pause noncritical enhancements. Keep sandbox-only financial testing and QA-branch-only code changes.
- Do not claim that named agents, staff, monitors, or scheduled work have started without proof.
- Every task needs named human owner, backup, evidence URL, status, and independent QC reviewer before signoff.
- Do not deploy production, move real funds, change live Stripe, or send customer notifications without explicit authorization.
- Incident commander may propose pause/containment; actual production actions require authorized operator.

## P0 work packets
1. Operations/Incident Command: identify incident commander and deputy, contact tree, SEV1/2/3 criteria, incident log template, on-call hours. Evidence: completed drill roster.
2. Engineering/Payments: verify webhook destination, signature, retries, idempotency, paid order-to-entitlement reconciliation, payment kill switch. Evidence: sandbox E2E traces and zero unexplained discrepancies.
3. Security/LPC: inventory secrets, privilege/MFA, access audit, breach escalation and preservation rules. Evidence: redacted review checklist. No legal advice.
4. Infrastructure/Continuity: inventory backups, RPO/RTO targets, rollback and isolated restore drill. Evidence: timestamped restoration logs, data-integrity checks.
5. Product/Learning: verify Starter and Facilitator content, purchase-to-access, course progress, support escalation, English/Spanish and WCAG 2.1 AA. Evidence: independent learner test results.
6. Finance/AR/AP: full and partial refunds, disputes, $250 bulk invoice lifecycle, vendor invoice fraud/approval controls. Evidence: Stripe sandbox IDs, reconciliation report, approved AP test cases.
7. Communications/Reach: prepare partner notices for paid/no access, outage, refund delay, privacy incident. Do not send until approved.
8. QC independent: collect all workstream evidence, rerun acceptance tests, issue hold/pass with exceptions.
9. Customer support: intake, incident ticket IDs, payment lookup with minimal PII, refund escalation, documented response times.
10. CODI oversight: consolidate status, track dependencies, maintain decision log and escalation.

## Immediate dependency order
A. Confirm incident command roster and critical customer support channel.
B. Verify sandbox webhook and ledger, then prove paid course access.
C. Independently restore backups in isolated environment.
D. Validate refunds and invoice exceptions.
E. Run tabletop: 500-unit order paid, database unavailable, customer requests refund.
F. Complete 25 paid-course E2E transactions and independent product/accessibility review.
G. QC, LPC/security and executive signoff before launch.

## Current evidence and blockers
- Sandbox checkout paid and partial refund proven; separate full refund blocked by tool safety restriction.
- Two $250 multi-method bulk payments actually used Link; card/Cash App unverified.
- $250 customer invoice exists as unsent draft.
- No verified sandbox Stripe webhook endpoint; delivery E2E unproven.
- No witnessed recovery drill, approved owner roster, vendor AP workflow, or 25 course E2E tests.
- Launch status: HOLD.

## Status format
Each daily update: Completed / In Progress / Blocked / Overdue / Next Actions / Decisions Needed. Never mark an unexecuted test complete.
