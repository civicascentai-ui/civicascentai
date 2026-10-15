# CivicAscent AI Clear Start: Accessibility-First Visual Direction
Date: 2026-10-14
Owner reference: uploaded screenshots of a "Core Visual & UX Blueprint" table.
Scope: `clear-start.html` prototype, **not** automatically the production homepage.
Status: Proposed, implemented in a testing branch, awaiting independent QC and user acceptance.

## Audience and operating principles
Designed for older adults, veterans, people with disabilities and diverse learning needs. Support dignity and learner choice; don't require someone to disclose a disability or medical history. Avoid clutter, complex page tables, flashing animation, autoplay speech, and instructions that depend on color or icon alone. Text-first simple flow: Learn, Practice, Ask for Help. Accessible Safari imagery is optional, OFF by default.

## User blueprint, implemented
- **Body size:** base 20px, at least 18px for explanatory text, navigation, controls, step labels and notices on Clear Start. Responsive no-sideways-scrolling cards replace wide tabular page layouts.
- **Typography:** locally installed `Atkinson Hyperlegible`, Inter, or Roboto when available; browser/system sans-serif otherwise. No font download, API, tracking or new cost. Text line-height 1.65; headings remain structured.
- **Colors:** deep navy `#0A192F` for main text and interactive background, warm off-white `#F8F9FA` for the page, warm amber `#D97706` for borders/decorative accents only on light surfaces. Amber is **not** ordinary body text on light surfaces.
- **Contrast:** tested `#0A192F` on `#F8F9FA` gives approx. **16.7:1**. `#D97706` on `#F8F9FA` gives approx. **3.02:1**, so it **fails** normal-text WCAG AAA (7:1). Some combinations meet a 7:1 contrast target, but that does **not** imply full WCAG AAA page compliance.
- **Controls:** large (minimum approximately 54px) keyboard-operable interactive targets, clear focus outlines, adjustable text from 20px to 30px (150%), high-contrast dark mode, optional scenery, user-initiated Read Aloud when browser supports it. Reading display preferences only (text size, contrast, scenery) are saved locally in device browser storage so they persist across the four prototype pages. No analytics, learner exercises, or personally identifying information is saved. Device screen reader remains independent of browser speech.
- **Learner pathways:** no purchase, login, diagnosis, extra permissions or AI key needed to visit Clear Start or its separately staged Student Practice Sandbox. Sandbox uses fictional examples and local JS only.
- **Reduced motion:** system setting respected; no autoplay video or audio.
- **Privacy:** no user form fields on Clear Start, no stored learner inputs on practice sandbox, no model calls or purchases.

## Release gates
- Chromium 320, 390, 768, 1366px: route check, visual no-overflow, 150% text reflow, dark mode, focusable interactive controls, fact-check and privacy examples.
- Automated palette contrast tests. Scope known tokens only, do not assert full-page AA or AAA.
- Manual testing still required: Android TalkBack, desktop NVDA, iOS VoiceOver (if available), keyboard-only, cognitive accessibility, no sideways scrolling at enlarged text, and feedback from seniors, veterans and learners with disabilities.
- Independent FRIDAY QA and ZEBRA risk review are required; only the owner can approve replacing the current public homepage. GitHub workflow success alone is not release approval.

Budget $0: no external accessibility overlays or commercial font dependency.

## Owner screenshot supplements (received October 14)
- Replace abstract navigation labels with *Home, Courses, Veteran Programs, Get Help*. Within the prototype, Home returns to Clear Start; original cinematic Safari is separate, not the required learner entry.
- Minimum 48×48 px active targets; Clear Start visible nav/controls typically 54×54px or larger. Documented focus styles and native accessible HTML landmarks. Interactive activities use `aria-pressed` plus live-region feedback; do not sprinkle `aria-expanded` on elements that do not expand.
- Sticky A− / A+ controls on **Clear Start, student practice, veteran-career guide, and assistive-tools guide**. Only UI display settings (scale 100–150%, contrast choice, optional scenery) are stored using browser `localStorage` key `civicascent-reader-preferences-v1`; no student exercise text or personal data is stored. Users can use Reset reading settings on Clear Start.
- Added focused pathways: Practical Everyday AI, Veteran Career Skills, Digital Safety & Scam Awareness, a dedicated veteran-career translation exercise, and an assistive-tools orientation. Neither an official military transition credential nor direct VA affiliation is implied.
- Added `veteran-career-skills.html` and `assistive-tools-guide.html` as self-contained, free, no-signup guides. They describe general skills and device features, without asserting unverified compatibility or live staff availability.
- **Global rollout not done**. Accessibility preferences currently work only in these four isolated prototype pages and cannot yet be described as persistent across every page of the existing public website. Extending to all subpages requires design QC, visual verification and explicit production approval.
- Avoid implying automatic progress saving, verified JAWS/NVDA/VoiceOver/TalkBack compatibility, eye-tracking operation or an immediately available veteran specialist.
- Independent manual usability and assistive-tech QA remains mandatory. No compliance/certification claim.
