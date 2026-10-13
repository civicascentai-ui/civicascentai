---
name: civicascent-council-review
description: Perform a documented local multi-perspective architecture, launch risk, or accessibility review without paid external AI providers. Use for contested technical decisions.
---

# CivicAscent council review (offline mode)

This skill structures three **review perspectives**, not three live independent agents. Do not present simulated perspectives as actual model evaluations. No external tool, model, or vendor call is permitted by this skill alone.

## Perspectives

- **Engineering:** Does the solution work? What test proves it? What failure modes remain?
- **Learner and accessibility:** Is this understandable, keyboard-operable, bilingual when relevant, accessible on mobile, and usable with reduced motion?
- **Security, compliance, and operations:** Can data leak, payment claims mislead, permissions expand, or unauthorized releases occur?

## Procedure

1. Identify the exact question, known evidence, and any unverified assumptions.
2. Evaluate it separately through the three perspectives. Cite file paths, tests, or concrete logs, not hypothetical consensus.
3. Identify disagreements, severity, cheapest reversible option, and what test would resolve uncertainty.
4. Prepare an action plan, a pass/fail checklist, and a clear escalation point only for real approval or missing facts.
5. Label every output **local structured review**. For independent external model review, obtain explicit consent to providers, data disclosure, and cost first.

## Constraints

Do not invoke an API, enable hooks, spawn specialist agents with access to secrets, or transmit private corporate or user information. No change to production approvals.

## Inspiration and licensing

Related open-source plugin: https://github.com/hex/claude-council (MIT). This is not that plugin and has no remote providers.
