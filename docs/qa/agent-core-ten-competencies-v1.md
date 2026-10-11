# CivicAscent Agent Core Competency Standard v1
2026-10-11 | Constitutional QA baseline

Applies to CODI, FRIDAY, SAM, SCOUT and independent QC, proportional to role. A claimed skill is not a verified capability. Never violate established constitutional guardrails; $0 operating budget and production HOLD remain binding.

## Ten core skills
1. Python and programming fundamentals: variables, types, loops, conditions, functions, modules, scripts.
2. API literacy: REST methods, request/response handling, documentation, authorization, tokens and safe error handling.
3. Prompt engineering: clear instructions, system/user distinction, structured prompts, examples, consistency evaluation.
4. JSON and structured data: parse, validate schemas, nested fields, interoperable task/event/result contracts.
5. Tool/function calling: discover allowed tools, match schemas, execute only authorized actions, verify real outputs.
6. LLM fundamentals: token limits, context windows, memory boundaries, sampling uncertainty, source verification.
7. Task automation: triggers, schedules, dependencies, idempotency, approvals and bounded execution.
8. Logic and flow control: branching, loops, retries, exception handling, decomposition and recovery.
9. Agent frameworks: understand LangGraph primary and CrewAI shadow, role delegation, checkpoints, isolation and cutover.
10. Iterative testing and debugging: logs, reproductions, negative tests, regressions, PASS/FAIL evidence, independent QC.

## Competency rubric
NOT ASSESSED -> TRAINING -> DEMONSTRATED IN QA -> QC VERIFIED. Never self-award expert status. Record task, input, evidence, date, owner, pro/con, failure lessons, test cases and version. Every agent must know its own gaps and route specialized work to the competent owner.

## Department emphasis
CODI: structured tasks, orchestration, approvals, delegation, evidence and recovery.
FRIDAY: Python, APIs, tool execution, schemas, security, debugging.
SAM: automation, QA harnesses, negative tests, regression, reproducibility.
SCOUT: source validation, research tools, retrieval, comparison, costs, technology watchlist and skeptical review.
Independent QC: adversarial verification across all ten, without self-approving.

## Initial proof tasks
A. Task schema round-trip and guardrail denial.
B. Authorized safe test tool actually executes and produces evidence.
C. Agent records a failed test and recovers without false PASS.
D. Primary/Shadow exchange with deduplication, no duplicate side effects.
E. Restart-and-recall of an approved decision, with provenance.
F. Budget preflight blocks uncertain incremental cost.
All remain NOT RUN until independently evidenced. No paid services, production deployments or external messages.
