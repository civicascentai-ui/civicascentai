# CivicAscent AI — Agent 5 Librarian Review: React Spring
Date: 2026-09-29
Status: APPROVED WITH CONTROLS
Resource: React Spring
Type: External React animation library

## Librarian assessment
React Spring fills a legitimate engineering gap: physically natural, interaction-driven UI motion inside React without requiring every animation to be hand-built. Official documentation shows support for React 19, web targets, Three.js-related targets, SSR, imperative APIs that can animate without React state re-renders, and a reduced-motion utility.

## Fit with CivicAscent
GOOD FIT when used for:
- subtle hover/focus/press feedback;
- hotspot transitions;
- scene-integrated labels;
- smooth panel or guided-step transitions;
- small physics-based UI movements;
- React or React Three Fiber interface motion.

POOR FIT when used for:
- cinematic wildlife/environment video;
- large continuous background animation that belongs in media/WebGL;
- decorative motion that competes with the user's next action;
- effects that can be handled more simply with CSS.

## Overlap / duplication review
React Spring overlaps partially with GSAP, Osmo patterns, and CSS transitions.

Recommended division:
- React Spring: component-level spring physics and state-linked UI motion.
- GSAP / Osmo patterns: authored sequences, scroll choreography, richer timeline work.
- CSS: simple transitions and low-cost micro-interactions.
- Higgsfield / Runway: cinematic media.
- Three.js / React Three Fiber: 3D/environment rendering.

Do not use multiple animation engines for the same interaction.

## Accessibility
The library provides useReducedMotion. CivicAscent must wire reduced-motion behavior globally and verify it in QA. Animation remains optional enhancement, never the only way information or state change is communicated.

## Cost
Open-source library usage has no subscription cost. Agent 5 should still track dependency/version/maintenance risk.

## Connector status
No direct ChatGPT plugin was found. This is an engineering library, not a connector.

## Agent 5 decision
APPROVED WITH CONTROLS.

Classification:
USEFUL / NON-ESSENTIAL / LOW-COST / ENGINEERING-SCOPED

Recommended first use:
A restrained spring transition for the Safari "Start Here" affordance and hotspot focus state, tested against a plain CSS version. Keep whichever is clearer, lighter, and more accessible.
