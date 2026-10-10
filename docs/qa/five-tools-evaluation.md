# Five Claude Code tool tracks: CivicAscent AI QA review
Review date: 2026-10-10. Budget: $0 in new spending. Production: HOLD.

## Decision and integration status

| Track | Verified project | QA benefit | Current disposition |
| --- | --- | --- | --- |
| UI/UX Pro Max | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill | Design hierarchy, mobile, accessibility checklists | Repo-local CivicAscent skill added; upstream plugin NOT installed |
| Stop Slop | https://github.com/hardikpandya/stop-slop | Clearer, factual, non-repetitive learner and partner copy | Repo-local CivicAscent skill added; upstream plugin NOT installed |
| Superpowers | https://github.com/obra/superpowers | Test-first development, systematic debugging, evidence-based closeout | Repo-local CivicAscent skill added; upstream plugin NOT installed |
| The Council | https://github.com/hex/claude-council (candidate, exact TikTok plugin not verified) | Independent critique on high-risk design decisions | Local structured-review skill added; external providers OFF |
| Playwright | https://github.com/microsoft/playwright | Desktop, mobile, and WebKit navigation/keyboard smoke tests | QA-only Playwright smoke suite 9/9 passed on 2026-10-10; project skill added |

## Project-local Claude Code skills added

These are **CivicAscent-written lightweight skills**, not third-party vendor code, plugins, hooks, or scripts. When a compatible Claude Code session opens the QA checkout of this repository, project skills under `.claude/skills/<name>/SKILL.md` can be discovered and invoked. Claude Code was **not connected here to verify interactive activation**.

- `.claude/skills/civicascent-ui-review/SKILL.md`
- `.claude/skills/civicascent-clear-writing/SKILL.md`
- `.claude/skills/civicascent-engineering/SKILL.md`
- `.claude/skills/civicascent-council-review/SKILL.md`
- `.claude/skills/civicascent-browser-qa/SKILL.md`

The offline council skill structures review perspectives only. It does not run independent agents or contact provider APIs. Five local skills are validated by `node e2e/verify-skills.mjs` in the QA workflow.

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

The workflow `.github/workflows/playwright-qa.yml` runs when a pull request targets the QA acceptance branch and changes browser-QA files. It can also be manually dispatched once available in GitHub Actions. It has read-only permissions and no deployment step. Browser dependencies/runner minutes remain subject to GitHub's plan.

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
- [x] Playwright smoke run 9/9 passed: https://github.com/civicascentai-ui/civicascentai/actions/runs/38059585288
- [x] Five project-local skills authored and CI static validation added; latest CI result pending.
- [x] Dependency install and browser smoke run completed; no failures in initial 9/9 suite.
- [ ] Confirm updated CI with all five local skill definitions.
- [ ] Independent review of the three third-party skills and Council candidate.
- [ ] Confirm a compatible Claude Code workspace loads these repo-local skills; consider upstream plugin installations separately if ever necessary.
- [ ] Separate production-readiness decision after normal security and fulfillment gates.
