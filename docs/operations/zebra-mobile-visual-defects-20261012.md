# Zebra website screenshot inspection | 2026-10-12
Source: two screenshots supplied directly by project owner in ChatGPT, not automated live site captures. The original images are in the conversation, not in this repository.

## Screenshot A: dark olive/gold landing view
Observed floating pill controls: Learn AI Skills; Workforce Development; Community Learning; Guided Support; Guided Planner; Consultation; Living AI Lab. Tall phone viewport with large empty intervals and unclear sequential reading/primary CTA. Verify whether intentional prototype scene and whether any controls are clickable. Do not assume this is the current deployed page.

## Screenshot B: civicascentai.com mobile contact view
Observed blue CivicAscent AI logo/nav bar occupying approximately upper 180 px of page content beneath browser chrome, visibly overlapping/cutting the heading "Talk with CivicAscent AI". Navigation shows Home and Programs crowded in narrow viewport. Body offers info@civicascentai.com, a directly displayed phone number (redacted here; consult private original image and issue #59), "Start with the Free Workshop", "Review Organization Capabilities". Bottom Spanish heading appears truncated in screenshot. Verify link destinations and approved offer claims before changing CTAs.

## QA reproduction
At widths 320, 375, 390, 430 CSS px: capture full-page screenshots, inspect fixed/sticky header offset and stacking context, heading top padding, horizontal overflow, nav collapse, keyboard focus, contact accessibility and language toggle. Trace email deep-link redirect separately.

## Compare historical checkpoints
savepoint/pre-page2-2026-09-29; savepoint/prototype09-hotspot-door-pass-2026-09-29; savepoint/prototype09-production-candidate-2026-09-29; save/mobile-qa-pass-2026-09-30; savepoints/page2-mobile-qa-20260929. Establish source SHA before any edit.

## Gate
P0 visible heading obstruction and privacy/contact issue. Fix on QA branch only; preserve approved design and rollback; independent QC before production.
