# CivicAscent AI: Client Protection & Disaster Recovery Charter
Adopted by executive directive: 2026-10-09. Version 1.0. Internal policy, subject to applicable bylaws, board ratification if required, legal review and operational implementation. No production system is changed by this document.

## Supreme operating principle
No launch deadline, sale, or internal convenience overrides reasonable measures to protect clients' payments, data, access and continuity. All incidents require an accountable human owner and auditable response.

## Standing laws
1. Client Protection First: stop unsafe activity and prioritize client safety, records and services.
2. No Single Point of Failure: critical roles and services must have primary and alternate owners and fallback procedures.
3. Distributed Recovery: each workstream owns a bounded, documented piece of response.
4. Automatic Escalation: unresolved critical incidents escalate immediately to Incident Command.
5. Independent QC: responders cannot self-certify restoration.
6. Capacity Protection: reassign work when capacity or competence is exceeded; never leave an incident unowned.
7. Evidence Preservation: preserve logs, transaction IDs, timelines, approvals and communications.
8. Client Communication: authorized communications lead issues timely accurate notices; legal review where required.
9. Recovery Before Reopening: verify ledger, access, security, data integrity and service health; independent QC and authorized executive approval.
10. Continuous Preparedness: schedule and document recovery drills, backup restores, training and postincident reviews.
11. No Unowned Incident, No Overloaded Responder: single accountable coordinator, backup capacity, escalation and workload transfer.

## Standing emergency preauthorization: HOT INCIDENTS
Activation: verified or reasonably suspected SEV1 or urgent SEV2 involving incorrect or duplicate charges, lost or compromised data, payment-to-access mismatch, service unavailability affecting active clients, credential compromise or dangerous fulfillment error.
Authorized Incident Commander (named human; deputy if unavailable) MAY immediately: declare incident; pause affected new sales or entitlement issuance via approved reversible controls; isolate compromised systems or revoke compromised credentials through authorized operator; activate incident response and backups; preserve evidence; contact providers; assign work; notify executive leadership. Minimize customer impact and scope.
Must document: timestamp, severity, evidence, affected systems, authority, precise action, rollback conditions, customer impact, approvals and notifications.
Must NOT without separate authorization: transfer money; issue exceptional refunds; erase data; conceal incidents; permanently disable business services; change live billing prices; restore from unverified backups; reopen affected production flows. Emergency actions must comply with provider and legal requirements.
If command is unreachable: designated deputy inherits only these bounded containment powers; notify executive leadership as soon as practicable. If no authorized operator exists, use escalation and provider emergency support, not invented tool access.

## Roles
Incident Command: unified priority and decision log. Engineering: application and payment continuity. Infrastructure: backup, restoration and rollback. Security/LPC: containment, privacy and legal escalation. Finance: Stripe/ledger and AR/AP reconciliation. Product/Learning: learner access and content integrity. Reach/Communications: approved customer/partner notices. Support: intake and follow-up. Independent QC: separate verification. Executive: exception approval and reopen decision.
Each role must have a named primary, named deputy, runbook, workload threshold and escalation path. Functional names are not evidence of staffed assignments.

## Required readiness evidence
Signed webhook and retry/idempotency tests; reconciled purchase-to-entitlement delivery; full and partial refund and dispute tests; AR/AP approvals; tested isolated restore with approved RPO/RTO; SEV1 tabletop; independent QC signoff; executive launch authorization. Until these pass: production launch HOLD.

## Governance
Executive directive records policy adoption; board or other formal approval, where required by organizational governing documents, remains pending. LPC must review relevant legal requirements with qualified counsel. Quarterly tabletop proposed; review after each major incident and at least annually. Document does not constitute legal advice or substitute for law.
