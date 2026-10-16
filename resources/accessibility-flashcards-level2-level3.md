# CivicAscent AI: Accessibility flash cards (Levels 2 and 3)

Draft teaching resource. Not evidence of WCAG compliance. Instructor should demonstrate with accessible examples, allow extra time, and offer printed large-type copies. Do not use student data in demonstrations.


## Accessibility standard for these existing cards
Use WCAG 2.1 Level AA as the baseline for visual presentation, interaction, and accessibility quality checks; review WCAG 2.2 Level AA as an additional improvement target. Preserve all original card wording, activities, teaching topics, and sequence. This is a design and QC standard, not a claim of certified conformance.

## Level 2: Understand and practice

**Card 1: Perceivable**
Front: How can someone understand an image without seeing it?
Back: Add useful alternative text for meaningful images. Decorative images use empty alt text. Example: `alt="Instructor demonstrating an AI prompt"`.
Activity: Read an image description aloud and decide whether it communicates the purpose.

**Card 2: Operable**
Front: Can someone use this page without a mouse?
Back: All controls should work with keyboard input, have visible focus, and follow a logical order. Avoid positive tabindex values.
Activity: Tab through a sample page and describe where focus moves.

**Card 3: Understandable**
Front: What makes an online form easier to complete?
Back: Clear labels, instructions, plain-language errors and a confirmation message. Never rely on placeholder text alone as the label.
Activity: Improve a confusing sample form label.

**Card 4: Robust**
Front: Why does correct HTML matter?
Back: Semantic elements and accurate names, roles and states help screen readers and other assistive technology understand the page.
Activity: Compare a real button with a clickable generic container.

## Level 3: Apply and verify

**Card 5: Contrast and enlargement**
Front: How do we test readability?
Back: Check text contrast, 200% text resize, responsive reflow and visible focus; automated tools cannot verify everything.
Activity: Increase browser text size and look for missing or overlapping content.

**Card 6: Captions and transcripts**
Front: What should an instructional video provide?
Back: Accurate captions and a transcript when appropriate, with accessible controls.
Activity: Review captions for accuracy and timing.

**Card 7: Accessible registration**
Front: What should happen after a form error?
Back: Explain the error in text, identify the affected field and allow correction without losing entered work.
Activity: Test a harmless local practice form, not a live registration.

**Card 8: Independent review**
Front: Does a zero-error WAVE or axe report mean a site is WCAG compliant?
Back: No. Combine automated checks with keyboard, screen-reader, zoom, cognitive accessibility and human review against WCAG 2.1 AA success criteria.
Activity: Record one automated finding and one manual observation with evidence.

## Facilitator QC checklist
- [ ] Large-print, high-contrast and Spanish-language review completed
- [ ] Images have meaningful alt text or empty alt when decorative
- [ ] Cards are readable with screen readers and keyboard only
- [ ] Exercises work at 200% zoom and with reduced motion
- [ ] No positive tabindex values are recommended
- [ ] No student information or live payment/registration forms used
- [ ] Independent human review recorded before publication

References: https://www.w3.org/WAI/WCAG21/quickref/ ; https://wave.webaim.org/ ; https://www.deque.com/axe/
