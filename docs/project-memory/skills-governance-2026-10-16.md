# CivicAscent project memory and reusable skills — 2026-10-16

**Status:** permanent *version-controlled* operational notes, NOT a claim that ChatGPT automatically retains all details forever or that all third-party agents have loaded the repository files.

## Current governing decisions

- Owner approved accessible three-choice homepage, readable warm neutral/navy/teal design and functional large-button navigation. Later October 16 homepage hotfix #134 changed header navigation to **Programs**, **Español**, **Free Workshop**. Retain current Programs link to programs.html.
- Owner subsequently directed **remove/overwrite Safari** legacy navigation and presentation; this supersedes old instructions to preserve the cinematic Safari Home or optional Safari picture. Four learning journeys remain separately navigable, use accessible shared design, and old Safari URL must be redirected after approved release.
- Target **WCAG 2.2 AA** with axe, browsers and manual real assistive-technology and learner checks. Automated test passes are not formal WCAG conformance certification.
- **FF = Find → Fix → Retest** on isolated branch, with SHA, screenshots, independent quality findings, reproduce/repair/retest and documented safe release/rollback stages.
- Owner's ongoing production policy: **$0 spending**, protect release HOLD, preserve current production until approved tested replacement; no live payment exercises and no unsupported background-automation claims.
- GG and CODI share equal delegated Co-Executive status; separate GG private repository stores working read-only review code. This is not confirmation of Gemini API entitlement, private-model access or fully autonomous operation.
- Live model activation may be restricted by provider eligibility and requires genuine permissions and independent verification. Do not bypass.
- Source control and public service state must be distinguished: GitHub main, QA draft PR, GitHub Pages public site, Vercel shadow/operations projects, backups/DR and true model-backed runs.
- Backup law persists: Monday–Saturday incremental, Sunday full backups of production **and** shadow, actual restore evidence needed.

## Verified October 16 evidence

- GG private repo: https://github.com/civicascentai-ui/civicascent-gg-operations ; 14/14 safety tests PASS https://github.com/civicascentai-ui/civicascent-gg-operations/actions/runs/38884142261 .
- GG live public issue read-only run PASS https://github.com/civicascentai-ui/civicascent-gg-operations/actions/runs/38884944503 ; no Gemini model called.
- Site draft PR #133: https://github.com/civicascentai-ui/civicascentai/pull/133 ; after latest main #134 conflict fix, final SHA ef2ad0b23133e4c774343024116fd44e0256135b, mergeable. **40/40 automated axe scans PASS** https://github.com/civicascentai-ui/civicascentai/actions/runs/38887190368 ; homepage https://github.com/civicascentai-ui/civicascentai/actions/runs/38887187436 , rooms https://github.com/civicascentai-ui/civicascentai/actions/runs/38887187435 , sitewide https://github.com/civicascentai-ui/civicascentai/actions/runs/38887187380 , governance https://github.com/civicascentai-ui/civicascentai/actions/runs/38887187386 all PASS.
- As of capture, #133 is DRAFT and UNMERGED, and actual production deployment, human screenshot approval and manual screen reader conformance remain **unverified**. Do not use above passing results to claim deployed or certified.

## How every agent uses these skills

1. At start of CivicAscent work, read latest AGENTS.md, this project-memory file, and the matching skill: skills/civicascent-sitewide-ff/SKILL.md and/or skills/civicascent-gg-operations/SKILL.md.
2. Check for newer owner directives and recent Git commits before acting; latest explicit owner instruction supersedes this dated snapshot.
3. Work only through granted connected permissions and safe release gates. Do not claim imaginary teammates, scheduled work, finished merge, or third-party memory propagation.
4. Capture evidence and update records for future agents. Keep draft skill changes out of production-linked main until appropriately reviewed.

**Retention:** Git commits permanently version these instructions while repository and history are retained. Human account owners can still edit/delete them. Memory across separate chats, models or connected services is not guaranteed without each system explicitly loading project instructions.
