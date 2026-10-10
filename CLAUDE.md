# CivicAscent AI coding and quality instructions (QA branch)

This repository supports beginner-friendly AI education. Work in isolated QA branches and preserve accessibility, privacy, and the current production launch HOLD.

## Required gates before declaring completion
1. Verify actual behavior, not inferred completion. Include reproducible commands and a test result.
2. Maintain accessible keyboard navigation, clear focus, mobile layout, reduced motion, and English/Spanish content.
3. Do not enable live checkout, alter production Vercel, change Supabase policies, expose credentials, or send customer/partner data to external AI agents.
4. Treat payment-to-course fulfillment, refunds, recovery, and 25 sandbox purchase tests as distinct release blockers until independently verified.
5. Require independent QC review of user-facing copy, security/privacy, UI/UX, and browser flows. Never turn QA-only evidence into a production approval.

## Five reviewed tool tracks
- **UI/UX Pro Max:** Use design and accessibility checklist before installing third-party skills. Upstream: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- **Stop Slop:** Edit copy to remove repetition/filler without losing factual accuracy, inclusive tone, or compliance notices. Upstream: https://github.com/hardikpandya/stop-slop
- **Superpowers:** Apply scoped planning, test-first code, systematic debugging, and verified completion. Upstream: https://github.com/obra/superpowers
- **The Council:** Optional *human-approved* multi-reviewer process for difficult architecture decisions; not running by default. Upstream implementation is ambiguous; review https://github.com/hex/claude-council before considering install. No API keys, paid provider calls, confidential data sharing, or automatic remote delegation without separate approval.
- **Playwright:** QA smoke suite in `e2e/`; no live-purchase automation. Official project: https://github.com/microsoft/playwright

**Project-local skills available on this QA branch:** `/civicascent-ui-review`, `/civicascent-clear-writing`, `/civicascent-engineering`, `/civicascent-council-review`, and `/civicascent-browser-qa`. Each is an instruction-only `.claude/skills/*/SKILL.md` authored for our project. These should be discoverable when Claude Code opens a checkout of this branch, but interactive activation has **not** been verified.

The upstream third-party plugins themselves are **not installed or activated**. See `docs/qa/five-tools-evaluation.md` for installation and acceptance gates.
