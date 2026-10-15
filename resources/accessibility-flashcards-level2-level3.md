# CivicAscent AI | WCAG Standards Flash Cards | Levels 2 and 3

**Standard:** WCAG 2.1 Level AA (required learning baseline). WCAG 2.2 Level AA is an additional improvement target, clearly identified where applicable. These are instructional cards, not a certification or evidence that the CivicAscent AI website complies.

## Level 2: Learn the WCAG standards

**Card 1 | Perceivable | WCAG 1.1.1 (A): Non-text Content**
Front: What must meaningful images provide?
Back: A text alternative that conveys the image's purpose. Decorative images use empty alt text.
Practice: Write useful alt text for a learning-room illustration.

**Card 2 | Perceivable | WCAG 1.4.3 (AA): Contrast (Minimum)**
Front: What contrast ratios apply to text?
Back: At least 4.5:1 for normal text and 3:1 for large text, with WCAG exceptions.
Practice: Check a heading and paragraph using a contrast checker.

**Card 3 | Operable | WCAG 2.1.1 (A), 2.4.3 (A), 2.4.7 (AA)**
Front: How should keyboard navigation work?
Back: Functionality works by keyboard, focus order preserves meaning, and keyboard focus is visible.
Practice: Tab through a page without a mouse. Avoid positive tabindex values.

**Card 4 | Understandable | WCAG 3.3.2 (A), 3.3.1 (A)**
Front: What must an accessible form communicate?
Back: Labels or instructions and identification of detected input errors in text.
Practice: Identify the label, required instructions, and an error message.

## Level 3: Apply, test and verify

**Card 5 | Robust | WCAG 4.1.2 (A): Name, Role, Value**
Front: What do assistive technologies need from controls?
Back: Programmatically determinable names and roles, plus states/values where applicable.
Practice: Inspect the accessible name of a button.

**Card 6 | Perceivable | WCAG 1.2.2 (A), 1.2.3 (A), 1.2.5 (AA)**
Front: What access does prerecorded instructional video need?
Back: Captions for synchronized audio, plus required audio description or media alternative under the applicable criteria.
Practice: Review caption accuracy and important visual information.

**Card 7 | Perceivable | WCAG 1.4.4 (AA), 1.4.10 (AA)**
Front: What should happen at 200% text enlargement?
Back: Text remains usable without loss of content or functionality; test reflow separately at its specified viewport.
Practice: Zoom text to 200% and inspect content and controls.

**Card 8 | Operable | WCAG 2.5.8 (AA, WCAG 2.2 only)**
Front: What is the WCAG 2.2 minimum pointer target rule?
Back: Generally 24×24 CSS pixels or sufficient spacing, subject to listed exceptions.
Practice: Measure nearby buttons and check exceptions. This is a WCAG 2.2 enhancement, not a WCAG 2.1 AA requirement.

**Card 9 | Understandable | WCAG 3.3.3 (AA), 3.3.4 (AA)**
Front: How should important form errors be handled?
Back: Provide correction suggestions when known; qualifying legal/financial/data submissions need safeguards.
Practice: Test a local demonstration form only, never a live registration.

**Card 10 | Verification | WCAG conformance**
Front: Does a zero-error axe or WAVE scan prove WCAG compliance?
Back: No. Evaluate applicable success criteria with automated checks and manual keyboard, screen-reader and human testing.
Practice: Log criterion, route, viewport, evidence, severity, fix and retest.

## Facilitator and independent QC checklist

- [ ] Each card's criterion number, level and WCAG version checked against the W3C standard
- [ ] Accessible labels, alternative text and logical heading order checked
- [ ] Keyboard-only and screen-reader reviews performed
- [ ] Contrast, 200% text resizing, reflow and visible focus tested
- [ ] WCAG 2.2-only enhancements distinguished from WCAG 2.1 AA
- [ ] Large-print, plain-language and Spanish-language review performed
- [ ] Reduced-motion preference and mobile TalkBack usability reviewed as additional inclusive-design checks
- [ ] No personal learner information or live payment/registration submissions in exercises
- [ ] Independent human QC documented before release

Official references:
- https://www.w3.org/TR/WCAG21/
- https://www.w3.org/TR/WCAG22/
- https://www.w3.org/WAI/WCAG21/quickref/
- https://wave.webaim.org/

**Status:** Draft training resource. Release HOLD. No claim of certification.
