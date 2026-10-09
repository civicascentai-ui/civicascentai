# Client Incident and Launch Runbook (QA draft)
## Trigger
P0: suspected data compromise, customer funds at risk, wrong entitlements, systemic paid/no-access, unrecoverable outage. Preserve evidence and escalate immediately to named human incident commander. Do not claim any human is on call without acknowledgment.
## Immediate safe actions
1. Record incident ID, detection time, affected scope, owner, and evidence.
2. Notify incident commander and LPC. If unavailable, use approved human backup; if no backup, HOLD affected launches/sales.
3. Authorized personnel may suspend affected sales/fulfillment and isolate compromised systems under existing charter. No unapproved transfers, irreversible deletions, production changes or customer claims.
4. Engineering verifies signed Stripe events, unique payment IDs, pending entitlement and delivery ledger. Finance independently reconciles gross charges, refunds, invoices and customer credits.
5. Support tracks paid/no-access cases and uses approved accessible notice. Never expose payment secrets or personal records.
6. Infrastructure restores only to isolated environment until QC validates data and permissions.
7. Independent QC verifies corrective actions; executive approves reopening.
## QA drills
A. Paid $49/$129 but webhook delayed or rejected; duplicate webhook; mismatch link or amount.
B. Refund issued but access remains active; partial refund policy ambiguity.
C. Backup restore fails, takes longer than recovery target, or corrupts entitlement ledger.
D. Security token exposed; revoke and rotate only under authorized incident protocol.
E. Support receives complaint while senior deputy unavailable; junior must escalate to backup, never self-approve.
## Drill evidence
Incident ID, start/end timestamps, expected/actual, roles actually participating, customer impact, ledger snapshots redacted, independent QC signature, reopen authorization.
## Launch decision
HOLD if signed webhook or learner access unverified, 25 course E2E incomplete, restore drill missing, security/QC critical findings open, or incident command human coverage missing.
