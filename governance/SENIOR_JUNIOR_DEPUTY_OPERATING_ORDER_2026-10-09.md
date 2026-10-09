# CivicAscent AI: Senior and Junior Deputy Operating Order
Adopted by executive directive 2026-10-09. Governance record in QA branch; actual staffing, automation and permissions remain unimplemented unless separately verified.

## Reporting
Executive authority -> CODI (executive coordination) -> Senior Deputy (operations and continuity) -> Junior Deputy (task control and evidence). Department owners retain responsibility for their technical work. Independent QC remains outside this chain for signoff. Human incident commander retains legally and operationally accountable authority.

## Senior Deputy, Operations & Continuity
- Maintain cross-functional priorities and dependencies; identify capacity conflicts.
- Recommend or coordinate reassignment within approved boundaries; never override qualified personnel or critical safety checks.
- Maintain incident roster, backup coverage and escalation triggers.
- Surface unresolved P0 issues immediately; maintain daily consolidated AAR.
- No unilateral production deployment, money movement, release approval, or QC certification.

## Junior Deputy, Task Control & Evidence
- Maintain task IDs, named owners, backups, status, deadlines, evidence URLs, next steps and blockers.
- Gather test logs and summarize results without converting pending work into passed work.
- Flag missing proof, stale assignments and overdue deadlines to Senior Deputy.
- Prepare daily AAR drafts and incident timeline.
- No independent security/finance privileges or authority to alter test evidence.

## One source of truth
Fields: task_id; severity; client impact; workstream; primary; backup; requested_at; due_at; status; evidence; dependency; next_action; escalation_at; qc_reviewer; qc_result; approval. States: proposed, assigned, accepted, active, blocked, evidence_ready, qc_failed, qc_passed, closed. No claim of staffed or active without acceptance evidence.

## Overload control
When a task is blocked, unowned, overdue, or the owner reports overload: junior flags, senior triages and proposes backup assignment, CODI resolves cross-unit conflict, incident commander handles live emergencies under preauthorized bounded charter. Escalate P0 immediately, P1 within same operating day. These are policy targets pending on-call staffing.

## Failure modes and safeguards
- Duplicate work -> single task ID, one accountable owner, dedupe reviews.
- Delegation theater -> evidence-required status and activity timestamps.
- Single-point dependency on deputies -> named human alternates and exportable register.
- Unauthorized AI action -> least privilege and human approval gates.
- Overwhelmed coordinator -> workload caps and explicit delegation queues.
- QC conflict -> independent QC signoff and documented exceptions.
- Agent failure -> manual takeover instructions and no dependence on continuous AI background execution.

## Initial backlog
P0: signed sandbox webhook and paid-course delivery, isolated restore drill, reconciliation/kill switch, full-refund and entitlement state, incident command staffing.
P1: 25 course E2E cases, accessibility/Spanish review, AR/AP and vendor-fraud controls, support communication drill.
Launch remains HOLD until evidence gates and executive signoff.
