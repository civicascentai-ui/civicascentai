# CivicAscent AI continuous agent skill learning constitution

Status: approved design, QA branch only. This file does not imply agents are already autonomously learning.

## Skill lifecycle
Capture approved working instruction or authorized task evidence; remove private data, credentials, OTPs and tokenized links; classify owner; draft a versioned skill; test in sandbox; independent QC review; publish approved version; monitor and permit rollback. Do not silently promote untested chat suggestions.

## Skill schema
Each skill records ID, version, department, trigger, preconditions, permitted tools, precise steps, success evidence, regression tests, failure recovery, stop conditions, cost and privacy limits, QC reviewer, and revision history.

## Roles
CODI: priority and delegation, evidence reconciliation, milestone-only updates.
FRIDAY: secure checkout, refunds, webhooks, protected delivery, repository engineering.
SAM: classroom prototype, scholarships, mobile/browser QA, negative tests.
Independent QC: separate release acceptance.

## Initial skill candidates
1. Finish all authorized steps and workarounds before escalation; avoid micro-updates.
2. Checkout proof requires paid TEST intent, signed webhook, ledger, and protected delivery, not session creation.
3. Refund before or after checkout cannot restore revoked access.
4. Learner authorization is enforced on every protected request.
5. Scholarship grants are human-approved and never fake paid orders.
6. Keep production HOLD until 25/25 independent E2E and human signoff.
7. Proposal claims distinguish proposed from confirmed.
8. No new spend, subscriptions, paid credits or real charges without approval.

## Sources and limitations
ChatGPT conversation history is not automatically available to GitHub or Replit agents. Transfer only user-approved summaries or use a separately authorized integration. Never ingest unrelated emails or personal records. Do not claim that a saved instruction creates a running autonomous agent.

## Implementation
Keep versioned skill documents and issue-based candidate intake in QA GitHub. Add free-within-plan automated checks where supported; do not invoke paid AI APIs without authorization. Pilot one candidate skill with a real sandbox regression and independent QC before expanding. No production deployment or permissions expansion.
