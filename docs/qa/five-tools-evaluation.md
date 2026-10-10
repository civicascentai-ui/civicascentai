# Five Claude Code tool tracks: CivicAscent AI QA review
Review date: 2026-10-10. Budget: $0 in new spending. Production: HOLD.

## Decision and integration status

| Track | Verified project | QA benefit | Current disposition |
| --- | --- | --- | --- |
| UI/UX Pro Max | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill | Design hierarchy, mobile, accessibility checklists | Registered for evaluation; NOT installed |
| Stop Slop | https://github.com/hardikpandya/stop-slop | Clearer, factual, non-repetitive learner and partner copy | Registered for evaluation; NOT installed |
| Superpowers | https://github.com/obra/superpowers | Test-first development, systematic debugging, evidence-based closeout | Registered for evaluation; NOT installed |
| The Council | https://github.com/hex/claude-council (candidate, exact TikTok plugin not verified) | Independent critique on high-risk design decisions | OFF. Requires source/security review; possible paid model/API usage and data transfer |
| Playwright | https://github.com/microsoft/playwright | Desktop, mobile, and WebKit navigation/keyboard smoke tests | QA-only test scaffold committed under `e2e/`, execution not yet verified |

## Playwright QA smoke runner

From repository root:

```sh
cd e2e
npm install
npx playwright install chromium webkit
npm test
```

Tests serve the checked-out repository locally at 127.0.0.1:4187, not Vercel production.
Reports are local, and tests do **not** place real orders, access payment keys, or assume course entitlement.

The workflow `.github/workflows/playwright-qa-manual.yml` can be dispatched manually from an appropriate QA branch after review; it is not configured to run or deploy on every commit. Browser dependencies/runner minutes remain subject to GitHub's plan.

**Release evidence still required:** paid-to-entitlement reconciliation, webhook signature verification, refund/dispute handling, failed-session recovery, and 25 traceable sandbox purchases. Browser smoke tests cannot replace those.

## Before considering third-party skill activation

- Confirm exact upstream repository, license, version, and permission scope.
- Review plugin hooks, commands, network egress, scripts, and dependency installer before execution.
- Install on an isolated QA workspace only; never allow remote model agents to access .env files, Stripe or Supabase credentials, customer data, donor records, or private proposals.
- Stop Slop must not remove legally required notices, material qualifications, or accessible alternative text.
- UI/UX Pro Max must preserve WCAG 2.1 AA, reduced motion, keyboard focus, mobile, and translated content.
- Superpowers must not autonomously publish, merge, pay for resources, contact partners, or deploy to production.
- The Council stays disabled until a specific source is chosen and per-invocation API charges/data-sharing are authorized.
- Never claim any tool passed QC before a recorded run completes.

## Verification checklist

- [x] Project file `CLAUDE.md` added on a QA tooling branch.
- [x] Playwright automated smoke scripts prepared, not executed.
- [ ] Dependency install and browser run; record log and screenshot evidence.
- [ ] Independent review of the three third-party skills and Council candidate.
- [ ] Confirm appropriate Claude Code environment and install plugins only there.
- [ ] Separate production-readiness decision after normal security and fulfillment gates.
