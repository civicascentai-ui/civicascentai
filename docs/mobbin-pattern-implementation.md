# CivicAscent AI — Mobbin Pattern Implementation Spec

Status: ISOLATED TEST/BETA ONLY
Branch: feature/mobbin-patterns-2026-09-30
Production: NO CHANGE AUTHORIZED

## Objective
Use Mobbin as a UX research reference only. Recreate proven interaction principles in original CivicAscent code. Do not copy proprietary source code, branded assets, text, or exact visual compositions.

## Agent 1 — Experience Director
Define the experience before engineering begins.

Priority patterns:
1. Beginner onboarding with one obvious next action per screen.
2. Guided journey/progress indicator for lesson flows.
3. Large-type accessible navigation for older and first-time AI users.
4. Contextual help that does not obscure the primary task.
5. Voice-guided actions with visible text equivalents.
6. Semantic search entry point for the CivicAscent learning/reference library.
7. Reduced-motion alternative for cinematic transitions.
8. Clear completion and return paths for every child page.

Deliverable: experience specification with desktop, mobile, keyboard, reduced-motion, and first-time-user behavior.

## Agent 2 — Lead Production Engineer
Implement original reusable components. Do not merge to main.

Proposed component set:
- GuidedJourney
- AccessibleHotspot
- VoiceAction
- ProgressJourney
- SemanticSearch
- LessonLauncher
- ContextHelp
- CinematicTransition
- ReducedMotionFallback
- LargeTypeNavigation

Engineering requirements:
- semantic HTML
- keyboard operability
- visible focus
- WCAG AA contrast
- text equivalents for audio/visual information
- no motion required for comprehension
- responsive mobile-first behavior
- graceful fallback when WebGL/media is unavailable
- no paid Mobbin dependency
- no TinyFish unless other resources are insufficient

## Agent 3 — Quality & Accessibility Director
Independent validation only. Agent 3 does not self-approve engineering.

Required PASS checks:
- mobile rendering
- desktop rendering
- browser navigation
- keyboard-only navigation
- focus order
- readable type scale
- hotspot target size
- reduced-motion behavior
- broken-link scan
- child-page return paths
- voice/text parity
- obvious next action for a first-time AI user
- no regression of the verified Safari experience

Any known defect = FAIL and return to Agent 1 or Agent 2.

## Agent 5 — Security & Governance Director
Review every proposed dependency and permission.

Required checks:
- no exposed secrets
- no unauthorized external scripts
- no paid add-on silently introduced
- no third-party tracking added without approval
- no copied proprietary Mobbin code/assets
- CSP/security impact reviewed
- production remains isolated
- save point remains recoverable

Agent 5 may stop work.

## Release Gate
Discover → Experience Spec → Build → Independent QA → Security/Governance → QC review → owner approval → production.

No-known-defect rule applies. Production promotion is prohibited until all gates pass.
