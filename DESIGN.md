# CivicAscent AI — DESIGN AUTHORITY

Status: HARD GATE
Scope: CivicAscent AI Safari experience and all child experiences
Authority: overrides generic frontend conventions when they conflict with the approved CivicAscent experience.

## 1. Core experience

CivicAscent must feel like one continuous cinematic place, not a website laid over photographs.

The user enters a living Safari learning world. Navigation belongs inside the environment. Motion communicates travel through the world. Every interaction must make the next action obvious to a person who is brand new to AI.

The approved six-stage journey is:

1. ARRIVAL AT THE LODGE — warm cinematic welcome; the journey begins.
2. EXPLORE THE ENVIRONMENT — discover key areas across a living interactive scene.
3. START HERE ACTIVATION — one obvious entry point for first-time users.
4. AI LEARNING DEMONSTRATION — real-world examples in a simple, visual, easy-to-understand way.
5. LIVING AI LAB TRANSITION — step into a hands-on experience and see AI in action.
6. RETURN TO LODGE / NEXT CHOICE — choose the next step and continue the journey.

These six stages are not a six-card layout. They are sequential moments inside one coherent world.

## 2. Environment-as-interface

Use environmental landmarks, doors, signs, paths, light, depth and motion as the primary interface.

Allowed:
- subtle in-world labels attached to meaningful places
- cinematic camera movement and environmental transitions
- one primary action at a time
- clear destination cues such as Explore, Learn AI, Programs, Community and Living AI Lab
- high-contrast controls that remain visually part of the scene
- purposeful micro-interactions that confirm hover, focus, selection and transition

Rejected:
- generic SaaS cards
- dashboard grids
- floating glass panels with no environmental meaning
- rails of buttons unrelated to the scene
- brochure-style sections
- Roblox/game-menu visual language
- train/subway concepts
- decorative clutter
- unexplained hotspots
- tiny text
- motion for spectacle without navigation purpose

## 3. First-time user clarity

Every cinematic moment must answer three questions without explanation:
1. Where am I?
2. What can I do here?
3. What should I do next?

There must be one visually dominant next action. Secondary choices may appear only after the primary path is understood.

Never make a first-time user hunt for the next step.

## 4. Accessibility

Accessibility is part of the visual system, not a cleanup step.

Required:
- keyboard access for every interactive destination
- visible focus state
- minimum 48px practical touch target
- readable text for older users and users with low vision
- WCAG-aware contrast
- semantic labels for environmental controls
- reduced-motion equivalent that preserves the same information and next action
- mobile layout that preserves scene meaning instead of merely shrinking desktop
- no interaction that requires hover
- voice support may enhance navigation but never replace visible controls

## 5. Motion authority

Motion must explain spatial movement, state change or consequence.

Preferred motion:
- arrival camera move
- environmental parallax
- lantern/light response
- doorway illumination
- path reveal
- scene focus shift
- controlled zoom or dolly movement
- transition into the Living AI Lab

Avoid:
- constant floating
- gratuitous particle storms
- spinning interface objects
- bouncing buttons
- rapid motion that competes with reading
- motion that obscures the next action

Reduced-motion mode must use still imagery and immediate state changes while preserving hierarchy.

## 6. Visual character

Tone: warm, cinematic, premium, human, grounded, inviting.

Environment:
- Safari lodge / wilderness at golden hour
- living wildlife and people where appropriate
- lantern light, wood, stone, water, vegetation and atmospheric depth
- realistic scene continuity

Typography:
- large, highly readable display type for key moments
- restrained supporting text
- avoid ultra-light text
- avoid dense copy over imagery
- use warm ivory / gold accents only where they clarify hierarchy or interaction

## 7. Living AI Lab

The Living AI Lab is a destination, not a modal card.

Entry should feel like crossing from the Safari environment into a hands-on AI space.

The Lab must demonstrate practical AI capability through short visual interactions such as:
- Ask AI
- Create
- Voice
- Translate
- Plan
- Automate

The experience should show capability, not merely describe it.

## 8. Language

English and Spanish are first-class experience modes.

Language switching must:
- preserve the current scene
- preserve the current task
- not reset progress
- remain easy to find
- keep equivalent content hierarchy

## 9. Design-quality gate

Before engineering approval, Agent 1 must confirm:
- no brochure/card regression
- environment still functions as interface
- next action is obvious
- motion has purpose
- mobile experience preserves the cinematic concept

Agent 2 must confirm:
- responsive implementation
- keyboard support
- reduced-motion support
- browser compatibility
- performance and loading fallbacks
- no dead-end navigation

Agent 3 must confirm:
- visual regression against approved references
- interaction path from Arrival through Next Choice
- accessibility checks
- mobile and desktop browser checks
- no known defect remains

## 10. Tool guidance

Use Taste Skill principles as a critique and pre-flight lens, not as the design authority.

Use Impeccable-style audit/polish methods to identify generic AI UI, weak hierarchy, nested cards, clutter, poor typography and contrast regressions.

Use Playwright as the automated browser gate for:
- scene navigation
- keyboard/focus behavior
- reduced-motion state
- mobile viewport
- desktop viewport
- screenshots / visual baselines
- destination integrity

No tool, plugin, library or agent may override this DESIGN AUTHORITY.

## 11. No-known-defect rule

If a defect is discovered, stop advancement.

Repair -> retest -> only then continue.

A build is not production-ready because it renders. It is production-ready only when the experience, engineering and independent QA gates all pass.
