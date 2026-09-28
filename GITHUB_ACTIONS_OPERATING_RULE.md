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
- ChatGPT QC/Governance oversees the full chain.

## Core Principle
Automate enforcement without creating workflow noise.

Start small. Add checks only when they provide clear protection against defects or regressions.
