---
name: civicascent-ui-review
description: Review CivicAscent AI UI and UX for readable layouts, keyboard use, WCAG 2.1 AA, small screens, and language parity. Use for any website page or design change.
---

# CivicAscent UI/UX review

Use this project-owned, instruction-only skill when inspecting or changing public-facing design. It is independent of and does **not** install the upstream UI/UX Pro Max plugin.

## Procedure

1. Identify the affected user journeys and record their starting URLs, viewports, and language variants.
2. Check navigation sequence, skip links, meaningful control names, visible focus, touch target sizes, sufficient color contrast, reduced motion, semantic headings, readable typography, and zoom at 200%.
3. Check Android-width mobile layouts, desktop width, and a WebKit browser; check horizontal overflow and clipped calls to action.
4. Ensure English and Spanish pages convey the same functional choices. Check alt text and form errors using labels rather than only color.
5. Compare against WCAG 2.1 AA. Flag anything not verified as **unverified**, not **passed**.
6. Propose the smallest reversible changes on QA only. Add or update a Playwright test when practical.
7. Record issue, evidence, severity, result, and remaining manual checks. Do not alter production.

## Constraints

No live checkout, no user data, no external screenshot uploads, and no third-party scripts without a review. Keep production on HOLD until normal launch approval.

## Inspiration and licensing

Related open-source project: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill (MIT). This is an original CivicAscent workflow, not a copy or execution of that package.
