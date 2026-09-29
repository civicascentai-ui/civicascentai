# CivicAscent AI — Safari Vertical Slice 1.0 Production Objective

Date: 2026-09-29
Status: PRODUCTION OBJECTIVE / NOT YET RELEASED
Source of truth: master-savepoint-safari-2026-09-29

## Objective
Create one complete, production-quality CivicAscent AI journey that proves the core product works before expanding the site.

The experience must take a first-time AI learner from a cinematic Safari opening scene to one useful, understandable AI experience with a clear next action.

## Primary user outcome
A visitor with little or no AI experience should be able to:
1. Understand that CivicAscent AI helps people learn and use AI.
2. Immediately know where to begin.
3. Enter one guided AI experience without confusion.
4. Complete one short learning or demonstration step.
5. Understand what to do next.

## Production journey
**Living Safari World → Start Here → Guided AI Experience → Learn / Try / Get Help / Continue**

## Opening scene
The production opening must preserve the approved Safari direction:
- cinematic golden-hour African savanna;
- elevated lodge/terrace viewpoint;
- elephants at the water as the dominant living event;
- giraffes, birds, grasses, water, reflections, and haze as secondary motion;
- left side visually open;
- premium, restrained, documentary-like realism;
- no cards, brochure grid, game UI, train/station references, or legacy prototype styling.

Motion must remain controlled:
- nearly invisible camera movement;
- natural water and reflection movement;
- subtle grasses and atmospheric motion;
- slow, believable animal movement;
- one dominant wildlife story.

## Primary interaction
One unmistakable **Start Here** action.

The action must:
- be visible without hunting;
- remain readable over the scene;
- work with mouse, keyboard, and touch;
- remain obvious on mobile;
- have a clear focus state;
- not compete with excessive hotspots or decorative controls.

## First guided AI experience
The first destination should demonstrate a practical AI capability for a beginner.

It should:
- explain the capability in plain language;
- show a short example;
- let the user try or explore something simple;
- avoid jargon;
- finish with a clear next decision.

The first experience must remain short enough that a new user can complete it without feeling trapped in a tutorial.

## End-state choices
At completion, the user should see no more than four clear options:
- Learn
- Try
- Get Help
- Continue

Each option must have a distinct purpose.

## Accessibility requirements
Production cannot advance without:
- readable type for older users;
- high contrast;
- keyboard navigation;
- visible focus states;
- touch-friendly targets;
- reduced-motion behavior;
- scene comprehension without audio;
- captions/transcripts for spoken content where used;
- no essential information conveyed only by color, sound, or motion;
- no horizontal overflow or overlapping interface at target mobile widths.

## Mobile requirement
Mobile is a designed experience, not a scaled-down desktop page.

The mobile version must:
- keep the Safari world recognizable;
- preserve the dominant elephant/waterhole story;
- keep Start Here immediately discoverable;
- reduce nonessential motion and clutter;
- maintain smooth loading and interaction.

## Performance objective
The cinematic experience must not make the site unusable.

Engineering must:
- optimize images/video for web delivery;
- lazy-load nonessential media;
- provide poster/fallback imagery;
- prevent layout shift;
- provide a reduced-motion/static fallback;
- avoid blocking the primary action on media load;
- document performance budget before release.

## Measurement
The first production slice must measure:
- landing view;
- Start Here activation;
- guided experience start;
- guided experience completion;
- next-action selection;
- signup / contact / purchase-intent events if presented.

Success is not “the animation looks good.”
Success is that users understand the site, enter the experience, finish the first step, and choose what to do next.

## Tool chain
Use the shared governed library:
- Figma: visual and interaction source of truth;
- Osmo: interaction/motion reference patterns;
- Higgsfield: current motion/video studies;
- Runway: secondary cinematic engine once entitlement is verified;
- Webflow: implementation and delivery;
- GitHub: source control, checkpoints, quarantine, rollback;
- Semrush: SEO/search and market intelligence;
- Gemini: approved research/cross-checking resource when direct access is available.

No tool may override the master visual direction.

## Production gates
This objective is not production-ready until all gates pass:

### Gate 1 — Owner visual approval
The owner confirms the scene matches the intended Safari direction.

### Gate 2 — Agent 1 experience approval
Navigation, hierarchy, interaction, and cinematic intent match the specification.

### Gate 3 — Agent 2 engineering readiness
Implementation is stable, responsive, performant, recoverable, and documented.

### Gate 4 — Agent 3 QA & accessibility
Desktop/mobile, keyboard/touch, reduced motion, readability, interaction clarity, links, and fallback behavior pass.

### Gate 5 — Agent 5 control audit
No unresolved STOP-WORK issue involving tooling, cost, licensing, integration, source-of-truth, backup, security, or quarantine contamination.

### Gate 6 — Agent 6 strategic review
The experience leads to a meaningful learning/business outcome and is not merely visual spectacle.

### Gate 7 — Governance approval
ChatGPT Governance/QC Overseer confirms all required approvals and evidence are present.

### Gate 8 — Owner production authorization
Production deployment requires explicit owner authorization.

## Definition of done
Safari Vertical Slice 1.0 is complete only when:
- the approved Safari world is visually correct;
- Start Here is immediately obvious;
- one guided AI experience works end-to-end;
- mobile and desktop both pass;
- accessibility and reduced-motion paths work;
- analytics events are defined and verified;
- no known defect is carried forward;
- all required agents have passed their gates;
- owner gives explicit production authorization.

## Scope protection
Do not add additional worlds, extra cinematic pages, unrelated features, or legacy concepts until this vertical slice passes production acceptance.

Depth before breadth.
