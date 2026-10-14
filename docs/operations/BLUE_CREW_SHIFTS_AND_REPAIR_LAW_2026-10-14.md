# Blue Crew | Owner-approved two-shift work and repair-control order

Status: owner-approved operating policy, implementation stages tracked separately.
Timezone: America/Chicago, including DST and all seven days of the week.
Morning: 04:00 to 08:00.
Night: 20:00 to 00:01 on the next calendar day.
Bounded real GitHub Actions runners, with timestamps and evidence, not always-on LLM agents. GitHub scheduled starts are best-effort and can be delayed; if delayed, workers perform only the remaining shift duration. Do not start work outside the window automatically.

## Team

- CODI: priority routing, blockers, production-release request preparation.
- SAM: isolated engineering repairs and engineering verification.
- FRIDAY: independent QC, functional/a11y checks and reproducible defect receipts.
- ZEBRA: independent risk review; must not use SAM's self-assertion as QC.
- SCOUT: research, official-source changes, QA5 evidence collection; no unsolicited outreach.
- REACH: internal partnership-research queue, drafts only, human-approved outreach.

## Owner-authorized repair rule

1. SAM can prepare a change only in an isolated testing branch, never in main, the public release branch, production configuration, DNS or live checkouts. A repair must name a reproducible defect and tests.
2. SAM must provide a changelog, prior/current test results and a reversible plan. FRIDAY independently reruns functional checks; ZEBRA independently examines security, provenance, privacy and the release gate.
3. Changes are presented as a proposed pull request. Both QA reviews and owner approval are required before production merge, deployment, payment activation or publication. The owner can reject without stopping safe nonproduction work.
4. No workstream may approve its own fixes; CODI coordinates but cannot override FRIDAY's failed gate.
5. No broad write permissions, self-merge, automatic production release, credentials, billing, customer private data, emails, external outreach, or paid API activation are authorized by this order.
6. Current GitHub scheduled Blue Crew code remains read-only, `contents: read` and `issues: read`. The repair/write capability requires a separate narrowly-scoped branch workflow and independent security gate before it is enabled. Use controlled CODI connector operations on isolated branches to prepare fixes until that gate exists.
7. $0 incremental budget. Only public-repository standard hosted Linux runners; fail closed if repository becomes private or the no-cost conditions change.
8. Four-hour shift receipts must report tasks actually executed, failures and unattended gaps. A CI PASS or Vercel READY is not the same as accepted finished design or real purchase settlement.

## Evidence and scope

Shift unit tests: GitHub Actions #38655033039 (clock boundaries, DST, rollover). Existing five-worker read-only tests: #38653913826 (5/5 success). Full four-hour run is NOT complete until a real shift finishes and produces evidence. User-approved public website Build 1 functional release is separate, with its own visual acceptance gate.
