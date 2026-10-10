# Sam — Symphony expanded role

Sam is the user-assigned name for the Symphony worker. CODI assigns work and
coordinates independent QC; the executable and role keys remain unchanged.

Authorized scope: bounded, isolated CivicAscent work under CODI supervision.
This expands the configured assignment types, not production permissions or
the claim that workers are continuously running.

| Role | Work | Required labels | Evidence |
| --- | --- | --- | --- |
| engineering | Reproduce and fix a scoped defect locally; run relevant tests | symphony-pilot + symphony-engineering | Summary, result JSON, tracked patch, changed-file list |
| qa | Independent source/artifact review and local fixture tests | symphony-pilot + symphony-qa | Reproduction steps, test commands/results, defects, gaps |
| reach | Partner research and outreach drafts using supplied source content | symphony-pilot + symphony-reach | Draft, citations beside claims, missing-source blockers |
| operations | Status reconciliation, owner/action lists, runbooks and recovery drafts | symphony-pilot + symphony-operations | Evidence-backed status, action owners and risks |
| proof | Original harmless proof task | symphony-pilot | Exact smoke-result.txt |

Each role starts a separate bounded invocation. One concurrent agent, one turn
per invocation, and a maximum of 300 seconds remain in force. A successful task
can be redispatched while its issue remains active; these limits are not a total
spend cap. No unattended service or external scheduler is enabled.

Issue descriptions should state the outcome, relevant files, permitted local
changes, available sources or fixtures, and acceptance criteria. Reach needs
actual source content, not a bare link, when the sandbox cannot fetch it.
Engineering changes remain isolated drafts. QA must inspect the proposed patch
and its source snapshot in a separate assignment; fresh clones do not contain
uncommitted engineering changes automatically. The operator supplies that review
bundle. Agent result JSON is a claim, not independent QC or release approval.

The launcher creates a fresh workspace root for every run. Both selection labels
must match for expanded roles. Labels and prompts do not enforce credential or
read isolation. Existing host authentication and minimal read-only tracker access
remain prerequisites. No new production or communication credential is granted.
Host hooks run outside the agent sandbox. No deploy, publish, merge, push, live
payment, external message, tracker mutation, account change, or external
automation creation is included in this role expansion.

Evidence is copied periodically, after each run, before terminal removal, and at
shutdown. Export includes only an allowlist of small regular files; symlinks and
paths outside the workspace are excluded. Hook failures are logged by Symphony
and do not prevent terminal cleanup, so operators must check exported evidence.
Engineering must include new-file diffs against /dev/null in its exported patch,
since tracked diffs alone omit untracked source. Review the changed-file list
against patch contents before deciding whether a patch is complete. Evidence
over 2 MiB is skipped; such changes require a partial/blocked result and a
separate bounded artifact plan before task cleanup.

Verification boundary (October 10, 2026): all four expanded roles completed
real authenticated Codex tasks on controlled fixtures, with independent evidence
checks, terminal cleanup, zero queue counts and stopped process groups. Engineering
passed two independent tests with the supplied tests unchanged. QA reported both
markup defects without changing the fixture. Reach cited the supplied synthetic
source and did not send outreach. Operations preserved recorded completion,
evidence reference, blocker and CODI ownership without treating recorded claims
as independently verified outcomes. These are fixture checks, not client acceptance.

Public repository reads can use the GET-only memory bridge without a GitHub token.
Matching live GitHub issue task dispatch and authenticated native GitHub dispatch
remain unverified. Continuous operation remains unverified; this host is bounded
and resumable. No existing issue has been activated by this package.

Sources: [Symphony v0.0.3 specification](https://github.com/openai/symphony/blob/v0.0.3/SPEC.md)
(required-label matching, workspace hooks and failure semantics), repository
TEAM_OPERATING_ORDER.md (independent QA and release governance), and the saved
CivicAscent Symphony Pilot QC report dated October 9, 2026 (real proof evidence).
