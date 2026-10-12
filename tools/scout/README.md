# SCOUT Migration: Replit -> GitHub Actions (Phase 1)

## Decision
Move SCOUT away from Replit's metered agent/hosting. The first replacement is a **read-only GitHub Actions** audit on the existing **public** \`civicascentai-ui/civicascentai\` repository. GitHub standard hosted runners (not larger runners) are free for public repositories. This does not port the whole Replit codebase and is not a claim that SCOUT's advanced autonomous/social-web scanning features have migrated.

## Migrated in this stage
- QA5-01..05 evidence-gap mission from GitHub issue #57, plus public issue status for #56, #34, #36.
- Explicit fail-closed repository identity guard, read-only GitHub issue API, no paid AI APIs, no Replit APIs, no checkout calls, no contact/solicitation.
- Four in-repo Node built-in tests; no npm install or vendor dependencies.
- Timestamped, run-ID-linked JSON audit receipt saved for 1 day as an artifact when the GitHub workflow really executes.
- Triggered on an in-repository pull request affecting this path and later manual dispatch. **No always-on billing, no scheduled automation, no production changes** during migration acceptance.

## Not migrated / no release assertions
- Replit SCOUT v2 application state, pending jobs, private credentials or databases, remote-scraper capability, buy/payment runner, independent human QC.
- A static source/CI test is not an actual mission; a successfully executed GitHub Actions audit is still only an **issue-state audit**, not a paid transaction, entitlement, or five-person accessibility test.
- No secrets are embedded in this public repository or generated audit artifacts.

## Acceptance and rollback
1. New pull request must show only \`tools/scout/\` and \`.github/workflows/scout-qa5.yml\`, with no existing website/payment changes.
2. GitHub workflow must execute successfully using public repo standard Ubuntu hosted runner, saving a real receipt with \`GITHUB_RUN_ID\`, start/end, issue statuses and all five QA5 tracker results.
3. Independent FRIDAY QC reads the receipt and compares it with GitHub issues #56/#57. Document any mismatch or failed test, and repeat before closing the blocker.
4. Later owner-approved production change is limited to this runner and its workflow; preserve Replit read-only state until the replacement works.
5. If any action risks cost, secrets, unauthorized writes, or inaccurate PASS assertions, hold the workflow. Rollback: disable the workflow or revert the isolated files; do not erase Replit project data.

## Operator notes
- Main workflow file: \`.github/workflows/scout-qa5.yml\`.
- Audit program: \`tools/scout/mission.mjs\`.
- Unit tests: \`node --test tools/scout/mission.test.mjs\`.
- Workflow on PR can run without main deployment. Manual workflow_dispatch becomes available after workflow is on the repository's default branch.
- This phase is deliberately lightweight: read four public issues, no payment provider integration or external web scraping.
- A future phase can add approved public-web discovery with source citations, cost ceilings, rate limits, deduplication, and QC. Do not confuse it with this verified phase-1 transfer.
