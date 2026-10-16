---
name: civicascent-sitewide-ff
description: Mandatory Find-Fix-Retest, design decisions, accessibility, QC and safe release skill for CivicAscent AI.
version: 2.0.0
updated: 2026-10-16
status: Versioned project skill on review branch; NOT deployment or WCAG certification
applies_to: [CODI, GG, SAM, FRIDAY, SCOUT, ZEBRA, BLUE TEAM, REACH, LPC, future contributors]
---

# CivicAscent AI — Sitewide FF and accessible release skill v2

## Current owner-approved direction overrides historical screenshots

**Retire Safari-themed navigation, optional scenery controls and the former Safari presentation.** Previous October 14–15 instructions to *preserve* cinematic Safari rooms are superseded. Preserve four independently functional learning destinations: journey-learn.html, journey-try.html, journey-help.html and journey-continue.html, with the new accessible common learning-room style. Old safari-home.html bookmarks must route users to the accessible homepage when the release is approved.

The approved public homepage has **three choices** (Learn something new, Practice a skill, Ask for help), readable off-white/navy/teal presentation and usable learner-focused settings. **Current production hotfix #134 sets the homepage navigation to Programs → programs.html, Español → es.html, Free Workshop → register.html; preserve this latest decision.** Do not revive “Safari Home” or overwrite Programs with the older “Learning paths” label. Approved learner illustrations/identity elsewhere stay unchanged unless the owner explicitly updates them. Avoid uniform monochrome redesigns and decorative controls that do not work.

## Mandatory FF = Find → Fix → Retest

1. **FIND**: read latest owner direction/reference, compare actual live source vs main vs PR vs shadow, capture base SHA, classify defects and inventory routes/scripts. Verify old decisions have not been superseded.
2. **SAVE**: use an isolated review branch and reversibly record the exact unmodified SHA, screenshot references and rollback target. Never overwrite a newer production repair with an older branch.
3. **FIX**: smallest justified code change that preserves accessible presentation, 3 homepage choices, 4 learning rooms, live forms, Spanish localization, veteran and sandbox curriculum, privacy promises, and fail-closed checkout; retain existing test rigor.
4. **RETEST**: source/link/syntax/quality gates, Chromium at 320/390/768/1280+ widths, zoom/reflow, keyboard-only focus/landmark/skip links, readable color contrast, reduced motion, touch target spacing, functional routes, registration security and both languages. Inspect screenshots. Retest after *every* head-SHA change.
5. **REPAIR ON FAILURE**: reproduce with logs/DOM evidence, investigate cause, fix without deleting checks or hiding regressions, rerun from clean source, or record explicit permissions/manual blockers.
6. **QC**: CODI verifies owner decisions; SAM implements/recovers; FRIDAY tests independently; ZEBRA challenges; SCOUT inventories; BLUE TEAM checks seniors, veterans and learners with disabilities; GG can read public issue evidence in her independent private repo; REACH/LPC respect outreach/consent/legal boundaries. Names are delegated work roles, not proof that independent agents are running.
7. **HOLD** merge and deployment when manual assistive-tech and owner visual acceptance are missing; merging into main can publish GitHub Pages. Specific release authorization and post-merge QC are separate gates.
8. **POST RELEASE** verify deployed commit matches approved SHA, homepage+rooms+registration+Spanish+veterans work and checkout stays fail-closed. Independently verify shadow parity, backup/restore and rollback; HTTP 200 alone does not prove DR.

## WCAG 2.2 AA verification

Aim for WCAG 2.2 AA **without claiming full conformance from automated scans**. Include accessible names/roles, semantic headings/landmarks, keyboard focus order/visibility/no trap, non-obscured focus, text contrast normally ≥4.5:1, large text and relevant non-text contrast ≥3:1, error/status messaging, reasonable 48px targets where feasible, and 200–400% zoom/reflow. Respect reduced motion and optional user-initiated audio. Use lang=es on Spanish pages and never silently translate them to English.

Run localhost PR axe scans: 10 routes x 4 widths (320,390,768,1280), supplemented by actual browser tests and independent manual checks (NVDA/JAWS, VoiceOver, TalkBack, learner testing). Axe/Chromium PASS ≠ WCAG certification. Any ASL claim requires qualified Deaf/ASL review.

**Evidence pinned to tested code:** conflict-resolved PR #133 commit ef2ad0b23133e4c774343024116fd44e0256135b passed 40/40 axe scans https://github.com/civicascentai-ui/civicascentai/actions/runs/38887190368, homepage https://github.com/civicascentai-ui/civicascentai/actions/runs/38887187436, room navigation https://github.com/civicascentai-ui/civicascentai/actions/runs/38887187435, sitewide browser https://github.com/civicascentai-ui/civicascentai/actions/runs/38887187380 and quality https://github.com/civicascentai-ui/civicascentai/actions/runs/38887187386. Historic receipts do NOT apply to changed head SHAs, deployment, or conformance.

## Non-negotiables

$0 budget; no paid API, subscription or purchase activation. No private student records, secrets, disallowed disclosures or unapproved outreach. Preserve the paid checkout fail-closed safeguard. The GG Gemini model requires provider eligibility and specific policy/cost approvals; do not silently activate it. Keep project documents and older owner references traceable as historical, not current contradictory instructions.

Production + Shadow House backup law remains: incremental Monday–Saturday, full on Sunday with isolated restoration integrity evidence; a Git code bundle is not full recovery. Write every FF outcome to a PR/issue and the project-memory skills snapshot. Permanent Git versioning means **durable project instructions**, not guaranteed ChatGPT personal memory or automatic adoption by every connected agent.
