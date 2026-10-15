# CivicAscent AI: WCAG 2.2 AA Independent QC Matrix
Status: PREPARED FOR INDEPENDENT QC. No conformance claim.
Scope: every public route, four pathway rooms, registration, practice sandbox, veterans, Spanish pages, forms and interactive states.
Authority: https://www.w3.org/TR/WCAG22/ and https://www.w3.org/WAI/test-evaluate/

## P1: blockers to release
- 1.1.1 Non-text content: informative images have meaningful text alternatives; decorative images have empty alt.
- 1.3.1, 1.3.2, 1.3.5: landmarks, headings, reading order, input purposes and labels are programmatic.
- 1.4.3, 1.4.11: text contrast at least 4.5:1 for normal text, 3:1 for large text; UI graphics and focus indicators have 3:1 contrast where applicable.
- 1.4.4, 1.4.10, 1.4.12: 200% zoom, 320 CSS pixel reflow, text spacing without clipping.
- 2.1.1, 2.1.2: all interactions keyboard-operable; no keyboard traps.
- 2.4.1, 2.4.3, 2.4.7, 2.4.11: bypass blocks, logical focus order, visible and unobscured focus.
- 2.5.3, 2.5.8: accessible names include visible labels; targets at least 24x24 CSS px or meet spacing/exception rules.
- 3.1.1, 3.1.2: page language and language changes identified.
- 3.3.1, 3.3.2, 3.3.3, 3.3.7, 3.3.8: errors identified, labels/instructions, correction suggestions, no redundant re-entry, accessible authentication.
- 4.1.2, 4.1.3: control name/role/value and live status messages announced.
- 1.2.2, 1.2.3, 1.2.5: captions and audio description/alternatives for applicable prerecorded media.
- 2.2.2, 2.3.1: pause moving content, avoid seizure-triggering flashes.

## P2: new WCAG 2.2 AA checks
- 2.5.7: provide a single-pointer alternative to dragging.
- 3.2.6: help/contact entry is consistent across pages.
- Check sticky elements never fully obscure keyboard focus (2.4.11).
- 2.5.8: touch targets and spacing.
- 3.3.7: no re-entry of information already supplied in a process.
- 3.3.8: authentication avoids memory/transcription-only challenges.

## Test matrix
1. Automated axe-core scan on each rendered route at mobile and desktop sizes; retain per-route JSON.
2. Manual keyboard-only navigation, including skip links, menus, dialogs, forms, and redirected rooms.
3. Screen reader sessions: NVDA + Firefox/Chrome, VoiceOver + Safari, TalkBack + Android.
4. Zoom 200%, 400%, text spacing, portrait/landscape, reduced motion and high contrast.
5. Captions/transcripts, ASL access if offered, Spanish language switching and translated labels.
6. Real users including older adults, veterans, and learners with disabilities; collect issues and retest.
7. Security/privacy review: use synthetic data; never submit real payments or personal details during QA.

## Evidence and decision rules
For each issue: URL, viewport, assistive technology, WCAG criterion, reproduction steps, severity, screenshot/log, owner, correction, independent retest and disposition.
PASS requires all applicable A and AA criteria across complete pages and states. Automated scan PASS alone is NOT WCAG conformance.
Release HOLD remains until independent QC signs off and owner approves production changes.
