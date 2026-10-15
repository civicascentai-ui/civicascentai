# CivicAscent AI project memory: sitewide approved design + FF

Captured: October 15, 2026, by owner's explicit request: "Remember everything and turn into a skill for all. Save to memory."

This is the **durable, versioned project memory** in GitHub. This file does **not** assert an update to ChatGPT's separate account-level memory, which cannot be forced through the repository.

## Current decisions
1. Owner's approved screenshots are visual source of truth, including the seven further interior-page reference screenshots shared after the sitewide request. Do not substitute generic layouts. Some imagery lives only in the conversation; obtain it if not visible.
2. Correct accessible home has exactly three white choice cards and teal buttons: Learn / Practice / Help, warm off-white background, navy text, pale settings panel, simple header "Safari Home | Español | Free Workshop", reassuring privacy and Remember notes.
3. Safari Home is a *separate* fully preserved cinematic home with **four unique themed room pages**. Do not recolor or flatten all rooms. Preserve separate scenes, approved imagery and mobile identity.
4. Full public site should be updated to the new design system *page-by-page* with content and navigation intact, not just homepage. Older adults, veterans, Spanish speakers, disabilities, and students with learning difficulties guide accessibility decisions.
5. FF = Find, Fix, Retest until verified pass; independent QC and repeated regression; savepoint before edit, after confirmed test; don't claim pass without evidence.
6. All agent roles to use `skills/civicascent-sitewide-ff/SKILL.md` and repository `AGENTS.md`.
7. Budget $0; checkout/purchases held; no live card payments or paid services; no credentials or private learner data in artifacts.
8. WCAG 2.2 AA target and higher readability where appropriate, but **no full certification** until independent automated/manual and screen-reader tests.
9. Source merge is not live release. Deployment must match tested approved commit and pass live route/keyboard/safe bounded load checks.

## Known source versions (historical status, verify every time)
- Approved screenshot three-choice homepage GitHub PR #111 merged to main: `d94d96d0d7af2cc90ff321c1be27b8d68c746131`.
- Original Safari world archived as `safari-home.html`, `journey-learn.html`, `journey-try.html`, `journey-help.html`, `journey-continue.html`.
- At last check production Vercel project `civicascentai` had old READY deployment commit `2a912ccd52dc976197afc9cf21ca4717491c148b`, blocked from updating by free-plan deployment quota. Cannot assert live updated.
- Sitewide task work branch: `fix/sitewide-approved-accessibility-20261015`, pre-edit base `d94d96d`. A safety backup already exists under `savepoint/approved-screenshot-home-merged-20261015`.
- QC for screenshot homepage and Safari click-through passed in linked GitHub Action runs; repeat after global modifications.
- Current remaining work: active routes inventory, interior page-by-page visual fidelity, controls, actual performance/accessibility regression, manual WCAG review, Vercel quota resolution (without paid upgrade), production smoke, owner signoff.

## Agent assignment and evidence
CODI coordination; SAM development/integration; FRIDAY objective QC; SCOUT inventory/research; ZEBRA independent challenge; BLUE TEAM course content/practice; REACH outreach only with authorization; LPC privacy/compliance holds. These are role labels unless attached, available agents/tools actually ran. No imaginary parallel work.

## Files
- Canonical skill: `skills/civicascent-sitewide-ff/SKILL.md`
- Agent directive: `AGENTS.md`
- Memory baseline: this file
- Correct homepage `index.html`, retained Safari world `safari-home.html`
- Checkout source guard `api/create-checkout-session.js`
- Source of truth: user-supplied approved reference screenshots, not arbitrary newly generated visuals.

## Status discipline
Use Planned, Prepared, Ready, In Progress, Submitted, Verified, QC Passed, Complete.
Never mark "Complete", "deployed", "live", "sent", "test passed", or "WCAG certified" without direct proof for the applicable target.
