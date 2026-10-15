# GitHub Actions Operating Rule

## Status
APPROVED AND ACTIVE

GitHub Actions is the automated enforcement layer for CivicAscent AI.

## Role
GitHub Actions does not replace any agent. It automatically verifies code and governance conditions around the team's work.

## Initial Responsibilities
- build/integrity sanity checks
- internal broken-link checks
- merge-conflict detection
- critical-file presence checks
- governance guardrail checks
- manual workflow execution when needed

## Future Responsibilities
After the Safari living-canvas prototype is visually approved, GitHub Actions may be expanded to:
- accessibility checks
- browser automation
- performance budgets
- preview deployments
- protected production deployment
- release verification

## Authority Boundaries
- Agent 1 owns experience direction.
- Agent 2 owns engineering implementation.
- Harness + Opus provides specialist engineering reasoning.
- GitHub Actions verifies automatically.
- Agent 3 performs independent QA and accessibility review.
- Agent 4 continuously evaluates and reports separately.
- CODI and GG (Gemini) are **equal Co-Executives** coordinating the full chain within actual platform access; neither is above the President or independent QC. See [Co-Executive Charter](docs/operations/GG_CODI_COEXECUTIVE_CHARTER_2026-10-15.md).
- ChatGPT QC/Governance oversees the full chain when connected and authorized. A role designation alone does not create a running Gemini model agent.

## Core Principle
Automate enforcement without creating workflow noise.

Start small. Add checks only when they provide clear protection against defects or regressions.

## P1 Backup and Recovery Law (owner-approved 2026-10-15)
Daily Mon–Sat **incremental** backups of both production and Shadow House; each Sunday **full** backups of both. Backups must be environment-separated, checksummed, protected, recoverable and independently restore-tested. The existing code-bundle and HTTP smoke workflow does not meet full-scope recovery requirements. The $0 spend/release HOLD remain binding. Implement per [P1 backup law](docs/operations/P1_BACKUP_RECOVERY_LAW_2026-10-15.md) and track proof on [issue #22](https://github.com/civicascentai-ui/civicascentai/issues/22).
