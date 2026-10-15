# CivicAscent AI: P1 Backup and Recovery Law

**Owner directive approved:** 2026-10-15
**Policy status:** ADOPTED by owner; repository integration and execution are tracked separately.
**Applies to:** Production, Shadow House, GitHub Actions, CODI, SAM, FRIDAY, SCOUT, ZEBRA, LPC, and future operators.

## Required cadence (America/Chicago)
- **Monday through Saturday: INCREMENTAL backup daily, for BOTH production and Shadow House.** Include all changes since each environment's last valid recovery point, preserving the required backup chain.
- **Sunday: FULL backup of BOTH production and Shadow House**, independently recoverable and clearly labeled by environment. A Sunday full backup replaces that day's incremental cycle.
- Neither environment may depend exclusively on the other for restoration. Backups must not overwrite one another. Never restore shadow data into production without explicit owner authorization.

## Recovery scope and protection
- Inventory and cover complete recoverable code/history, deployable assets, persistent data/databases and user uploads where present, and environment configuration required for restoration.
- Secrets and sensitive data require separate protected/encrypted handling with least privilege. **Never publish secrets, private learner records, database dumps or credentials in GitHub public source or unprotected Actions artifacts.**
- Maintain an independently protected second recovery location where feasible at $0. Report any uncovered system or lack of suitable secure storage as P1, not as PASS.
- Target at least seven recent daily recovery points and four weekly full recovery points; monthly archives are desirable **only if $0 storage allows**. Actual retention must be documented and verified; do not delete a needed backup chain prematurely.
- Capture checksum/integrity receipt, UTC timestamp, source branch/environment and version, type, scope, included/excluded systems, destination, retention deadline and restore instructions for each backup.
- Failed backup, missing baseline/chain links, failed checksums and incomplete coverage must be treated as P1 incidents; find, fix and retest with independent evidence.

## Independent recovery tests
- Sunday: run non-destructive *isolated* restore-verification checks for each environment using the appropriate full backup and/or recovery chain; log FRIDAY's independent QC status.
- Weekly: test a crossover rehearsal without changing the production traffic path; a read-only HTTP 200 response alone is **NOT** successful failover, rollback, or full environment restore.
- Real production traffic switching, data writes/destructive recovery, live payment flow, spending money or production deployments require separate explicit approval. Preserve current release HOLD.
- Do not label this policy operationally compliant until both production and shadow have evidenced incremental and Sunday full backups, coverage checks, and independent recoveries.

## Responsibility
- CODI: policy compliance, P1 escalation and result ledger.
- SAM: production and shadow backup implementations and isolated restoration procedure.
- FRIDAY: independent checks, chain integrity, evidence, false-pass prevention.
- SCOUT/ZEBRA: identify missing assets, cost/storage constraints and failure modes.
- LPC: privacy, secrets and compliance risk review; no legal advice.
- Budget remains **$0** without explicit spending authorization.

## Adoption vs actual operations
As reviewed on 2026-10-15, existing `.github/workflows/p1-disaster-recovery.yml` makes a **nightly full Git code bundle** and runs weekly HTTP probes. Those checks are useful, but they do **not** provide daily incremental backups or Sunday full backups of both complete environments, databases, external files, or deployment configuration. This document changes governance; it does not itself activate new backups.

Implementation and recovery acceptance tracker: [Issue #22](https://github.com/civicascentai-ui/civicascentai/issues/22).
