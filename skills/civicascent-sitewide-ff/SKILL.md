---
name: civicascent-sitewide-ff
description: Source-of-truth design, accessibility, verification, and Find-Fix-Retest ("FF") operating skill for all CivicAscent AI site agents.
version: 1.0.0
owner: CivicAscent AI President
updated: 2026-10-15
status: Active project instruction; repository skill, NOT proof of deployment or WCAG certification
applies_to:
  - CODI
  - SAM
  - FRIDAY
  - SCOUT
  - ZEBRA
  - BLUE TEAM
  - REACH
  - LPC
  - human or AI contributors with repository access
---

# CivicAscent AI: SITEWIDE APPROVED DESIGN + FF SKILL

## Activation
Use this skill whenever a request concerns CivicAscent AI website design, responsive layout, navigation, courses, accessibility/WCAG, student practice, Veterans learning, localization, checkout safeguards, QA, releases, backups, monitoring, or incident repair. The owner's shorthand **FF** means **Find → Fix → Retest** until an evidenced pass, or stop only for a genuine permission/safety/human blocker.

**Authoritative approval:** The latest owner's explicitly approved screenshots and instructions govern the visuals. Prior assistant-generated themes and prototypes are *not* interchangeable with those references. Do not invent a replacement design. Do not change approved visual identity for convenience.

## Canonical design, based on owner screenshots shared October 15, 2026
**Accessible public homepage** (`index.html`, saved in PR #111, merge `d94d96d`):
- Warm off-white page background; deep navy readable text; pale gray-blue settings/reassurance panels; teal primary actions; white bordered cards. Keep the page varied and recognizable, not monochrome.
- Top row: CivicAscent AI logo + tagline; **Safari Home**, **Español**, **Free Workshop** navigation.
- Main headline: **Learn AI, one step at a time.** Plain-language supporting copy, honest free/no-purchase reassurance.
- A prominent, functioning **Make this page easier to use** panel: A−/A+ text controls, dark appearance, optional Safari picture, user-triggered read aloud and Stop reading.
- **Exactly three main homepage choice cards**: **Learn something new**, **Practice a skill**, **Ask for help**, with separate teal calls to action. Do not replace them with four generic cards, and do not introduce a single-color variant.
- **Other ways to begin**: veterans and military families, Spanish, free workshop.
- **Remember** reassurance panel and modest educational disclaimer/footer.
- Keep headline, spacing, button hierarchy, desktop three-column cards, and stacked mobile cards visually faithful to supplied references. On narrow devices reflow is required; do not squeeze desktop columns.
- The browser/system Share menu visible in one mobile screenshot is **not** a webpage feature. Never reproduce or hard-code it.

**Cinematic Safari world** (`safari-home.html` and four `journey-*.html` routes):
- Preserve the original photographic/cinematic Safari scenes and separate Learn, Try, Get Help and Continue destinations, including their **distinct approved colors**.
- **Safari Home** is a separate deliberate destination from the simpler accessible homepage. Do not discard either experience or silently merge their layouts.
- Each room remains its own page; route labels and back navigation must agree. "Back to Safari" means `safari-home.html`, not `index.html`.
- Keep the veteran entrance/programs and original interior scenes. Do not change approved backgrounds, art, colors or user-approved page order without explicit new authorization.
- Additional user-supplied screenshots represent interior-page references; use their actual visual details as the primary reference when working on the matching page, not a generalized guess. Ask for the original matching image if unavailable to the agent.

## Sitewide application, preserving function
- Inventory all current HTML routes, scripts, styles, form endpoints, and archival preview pages BEFORE editing.
- Classify routes: public content, Safari rooms, instructional course/classwork, practice sandbox, veteran learning, Spanish, informational/legal, contact/registration, interactive demonstration, and archived prototype/diagnostic. Never treat obsolete model previews as current production routes.
- Apply one **coherent design system** (typography, spacing, accessible navigation, link targets, focus states, control sizing, contrast, labels) to public pages, but preserve each page's distinct curriculum, content, scene, language, interactive behavior, and approved image.
- Use a narrowly-scoped global stylesheet and page-specific variants; avoid universal CSS that destroys room graphics, lab interaction layers, or JS-driven stages. Use page-level classes or opt-in selectors.
- When updating a page, preserve semantic landmarks and working links, buttons, practice activities, forms, submissions, script loading, and privacy requirements.
- Spanish routes remain Spanish, with `lang="es"`, accurate Spanish labels and correctly directed navigation. Do not machine-replace text with English.
- Vet-specific content is useful and respectful without implying official VA affiliation, guaranteed benefits or outcomes.
- Student sandbox should permit low-stakes practice with fictional examples, clear feedback, and no surprise collection of user inputs.

## Accessibility target and verification
- **Target WCAG 2.2 AA** with strong readability and cognitive accessibility. Do NOT claim certification, legal conformance, all-device support, or a passed full audit from automated checks alone.
- Use semantic heading order, unique IDs, correctly labeled form controls, sensible landmarks, language, accessible errors/statuses and honest disability support descriptions.
- Keyboard support: visible first-tab skip link, correct focus landing, keyboard-operable menus/buttons, meaningful focus order, no keyboard traps, visible strong focus ring on each background.
- Contrast: body text normally at least 4.5:1; large text normally 3:1; nontext components/focus cues at least 3:1 where applicable; verify each theme, overlay, room color, hover/disabled state with automated tokens AND representative screenshots.
- Zoom/reflow: test narrow viewport (320, 390, 768, 987/1024, 1366+ CSS pixels), 200% browser text enlargement, 400% zoom/reflow when applicable, no unwanted horizontal scrolling/cutoff.
- Target comfortably tappable controls, normally 48 px or larger; follow WCAG 2.2 minimums, including spacing/exceptions.
- Support OS reduced-motion preference; no flashing/autoplay or timed pressure. User-triggered audio only, cancelable.
- Controls must **actually function** and reflect `aria-pressed` or disabled state; never place cosmetic buttons that pretend to work.
- Privacy claims must be TRUE for that page: the approved homepage's display preferences are in-memory-only ("These settings work on this page only"). Other previously developed student accessibility pages may have separate approved local reading-preference behavior; do not misrepresent their scope or introduce tracking.
- Manual testing still required with older adult learners, veterans, people with disabilities/cognitive accessibility needs, actual phones, TalkBack/NVDA/VoiceOver where available. Automated Chromium is insufficient.

## Payment, data and compliance guardrails
- **Budget is $0**. Do not activate paid Vercel features, API credits, subscriptions, checkout, live purchases or chargeable features without explicit owner approval.
- Preserve the paid-enrollment fail-closed safeguard; do not change `api/create-checkout-session.js` merely to make a UI test green. Do not submit real card details or perform purchase stress tests.
- Free workshops and checkout links must be labeled accurately. Inspect all public purchase surfaces independently; a 404 GET is not proof POST cannot charge.
- Don't disclose credentials or personal learner data. No PII in QA screenshots/artifacts. Use invented prompts for practice tests.
- Include standardized legal/privacy/education disclaimer where required; LPC flags or holds compliance questions and escalates legal advice, not a legal opinion.

## FF execution protocol (mandatory)
1. **FIND**: read the owner's reference and current project state; inventory live vs source; identify deviations and classify P0/P1/P2. Save the exact pre-change Git SHA; make an isolated work branch.
2. **FIX**: implement the *smallest justified* correction consistent with approved visual references and functional requirements. Preserve all unrelated designs/artwork. Keep test changes as rigorous as or stronger than prior checks.
3. **RETEST**: run syntax/static checks, navigation/link checks, functionality, keyboard/contrast/reflow, English/Spanish, actual Chromium at multiple widths, and relevant mobile/room/integration regressions. Compare rendered screenshots with owner-provided reference.
4. **ON FAILURE**: retain failure evidence, trace the actual cause, repair, rerun from a clean version until objective pass. Do not silently delete failing tests or weaken quality thresholds. If blocked, record reason and safe workaround.
5. **SAVE POINT**: record fixed commit SHA, test run URLs, screenshot artifacts, changes, remaining unverified gates and rollback branch.
6. **MERGE/DEPLOY**: only after owner authorization for the release, appropriate tests and explicit team/project checks. A successful GitHub merge is NOT a Vercel production deployment. Production is ready only when **the deployed commit equals the approved commit**, aliases resolve, and post-deploy tests pass.
7. **PRODUCTION ACCEPTANCE**: bounded, read-only smoke and load; accessibility and purchase safety; no abusive production stress or simulated checkouts through live POST. Monitor runtime errors when supported. Never claim "live", "pass", "complete", or "WCAG compliant" without matching evidence.
8. **RECORD**: leave owner a concise PROS/CONS and state with **Completed, In Progress, Blocked, Overdue, Next Action, Decision Needed**.

## All-hands division of responsibility
- **CODI**: coordinate priorities, restore context, own release gate and concise evidence-based decisions. Do not ask for micro-updates when no human decision is required.
- **SAM**: source audit, architecture, UI implementation, performance, navigation, build/deploy repair.
- **FRIDAY**: independent QA matrix, browser tests, accessibility test evidence, failures/retest.
- **SCOUT**: inventory active pages, find broken journeys, investigate source of reference and blocker, free alternatives.
- **ZEBRA**: independent design and logic challenge, compare screenshots, investigate false positives, risks and missed edge cases.
- **BLUE TEAM**: learning activities, flashcards, beginner and advanced course usability, senior/veteran classwork.
- **REACH**: outreach paths/contacts only when authorized; no sending without user approval.
- **LPC**: risk, privacy, regulatory and disclaimers checks; escalate any actual legal advice decision to a qualified human.
These are **assigned review roles**, NOT proof of autonomous running agents. Report actual tool evidence, not imaginary tasks or deployments.

## Current project baseline / cautions (verify afresh before acting)
- Source branch `main` after screenshot-correct homepage merge: `d94d96d0d7af2cc90ff321c1be27b8d68c746131`; approved [PR #111](https://github.com/civicascentai-ui/civicascentai/pull/111).
- Screenshot-matched full-homepage browser run: [GitHub Actions #38716807432](https://github.com/civicascentai-ui/civicascentai/actions/runs/38716807432); isolated browser checks passed as of Oct 15.
- At that check, public Vercel deployment still reported commit `2a912ccd52dc976197afc9cf21ca4717491c148b`; $0 deployment quota (402, `api-deployments-free-per-day`) blocked release. Recheck; this is NOT a permanent live status.
- Before any further sitewide changes use backup/savepoints and verify which routes are current. Keep existing homepage exactly unless owner changes approval.
- The screenshots referenced above were supplied in the owner's conversation. Their pixels are **not embedded** in this repository skill; if an agent cannot see them, obtain them from the owner/relevant approved project artifact before asserting visual fidelity.

## Stop conditions
Stop/hold and inform owner only for: live money/PII safety risk, legal/regulatory escalation, absent authority, paid-plan requirement, inaccessible approved screenshot, irreversible destructive change, severe production impact, or verified unresolved release blocker. Otherwise continue safely with isolated, reversible Find-Fix-Retest work.
