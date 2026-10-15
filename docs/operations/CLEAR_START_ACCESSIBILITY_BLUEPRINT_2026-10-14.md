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
- **Controls:** large (minimum approximately 54px) keyboard-operable interactive targets, clear focus outlines, adjustable text from 20px to 30px (150%), high-contrast dark mode, optional scenery, user-initiated Read Aloud when browser supports it. No preference storage or analytics. Device screen reader remains independent of browser speech.
- **Learner pathways:** no purchase, login, diagnosis, extra permissions or AI key needed to visit Clear Start or its separately staged Student Practice Sandbox. Sandbox uses fictional examples and local JS only.
- **Reduced motion:** system setting respected; no autoplay video or audio.
- **Privacy:** no user form fields on Clear Start, no stored learner inputs on practice sandbox, no model calls or purchases.

## Release gates
- Chromium 320, 390, 768, 1366px: route check, visual no-overflow, 150% text reflow, dark mode, focusable interactive controls, fact-check and privacy examples.
- Automated palette contrast tests. Scope known tokens only, do not assert full-page AA or AAA.
- Manual testing still required: Android TalkBack, desktop NVDA, iOS VoiceOver (if available), keyboard-only, cognitive accessibility, no sideways scrolling at enlarged text, and feedback from seniors, veterans and learners with disabilities.
- Independent FRIDAY QA and ZEBRA risk review are required; only the owner can approve replacing the current public homepage. GitHub workflow success alone is not release approval.

Budget $0: no external accessibility overlays or commercial font dependency.
