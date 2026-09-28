# CivicAscent AI — Fresh Rebuild

Started: September 27, 2026

This branch is the clean rebuild workspace.

## Preserved recovery point
The complete prior site state is frozen at:
- Branch: archive/pre-fresh-rebuild-20260927
- Commit: 36bd4de7539216aac8a9da7815070950fea95f26

## Core modules in the new build
- ASTRA6 — retained as a first-class project module and workflow layer.
- CivicAscent AI core experience — redesigned from a clean foundation.
- Accessibility and older-user readability — required design constraints.
- Bilingual capability — English/Spanish remains part of the product direction.
- Webflow — approved design/reference/implementation tool for interaction research, motion ideas, layout inspiration, staging, and future production experiments.
- Framer — approved design/reference/prototyping tool for cinematic motion, transitions, immersive storytelling, advanced interactions, and rapid concept exploration.
- Google Stitch — approved suggested design/UX ideation and prototyping reference, subject to the zero-fee rule.
- GSAP — approved motion/animation toolkit for scroll-driven transitions, camera-like sequencing, morphing, timeline control, and cinematic choreography.
- Three.js — approved real-time 3D/WebGL toolkit for interactive environments, depth, particles, spatial scenes, and visual AI demonstrations.
- Perplexity — approved research/reference tool for free web research and citation cross-checking only; do not use paid API access under the zero-fee rule.
- MotionSites Academy — approved reference source for scroll-scrubbed cinematic techniques, pinned 3D scenes, responsive motion patterns, and performance lessons; paid templates/services are not approved under the zero-fee rule.
- Theatre.js — approved active motion-authoring layer for Three.js camera, lights, materials, and cinematic sequences; use Studio during development and ship exported animation state without Studio in production.
- Spline Free — approved 3D prototyping and asset-reference tool; free web exports may include Spline branding/watermark, while the free 3D Library is approved for commercial-use assets subject to current terms.
- Threlte — approved conditional framework for a future Svelte-based 3D build; it is MIT-licensed and combines Three.js with integrations such as Theatre.js, but should not be introduced unless the build intentionally adopts Svelte.
- PeachWeb — approved reference/prototyping benchmark for no-code/low-code WebGL, keyframe animation, responsive scroll effects, and performance ideas; do not make it a production dependency under the zero-fee/custom-domain rule.
- ChatGPT image generation/editing — primary in-chat visual ideation and targeted editing tool; preferred when it can meet the need without adding a new paid dependency.
- Adobe Firefly Free — approved optional visual-generation/reference tool while staying within its free allowance; do not create a paid dependency without approval.
- Canva Free — approved optional design/composition tool for mockups, social assets, and layout experiments within its free allowance; paid AI/top-up features require approval.
- Adobe Express — approved optional free design tool for rapid visual compositions and asset edits; connection is optional.
- Recraft Free — reference/prototyping only for CivicAscent AI; free-tier generated assets are not approved for commercial production use because Recraft retains ownership and restricts commercial use.
- Midjourney — reference-only unless the user explicitly approves a paid subscription; no free production dependency is allowed.
- UX — a mandatory design and validation layer for every page, hotspot, scene, flow, and module.

## Core UX rule
Every cinematic moment must still make the next action obvious to someone who is new to AI.
1. One clear goal per scene.
2. Keep visible choices limited and intentional.
3. Use plain-language labels and obvious interaction cues.
4. Maintain large, readable text and accessible controls.
5. Keep interaction behavior consistent across the experience.
6. Provide clear progress and next-step guidance.
7. Design mobile-first and test mobile behavior before presentation.
8. Visual spectacle must never come at the cost of clarity.
9. Every interaction must lead to a purposeful, flowing experience with pertinent information.
10. UX review is required before any module is considered complete.

## Cinematic scroll-first rule
The CivicAscent AI experience must be designed as one continuous cinematic journey first, with page structure and interface layered into that journey afterward.
1. Build the visual world before building the interface.
2. Camera movement, depth, lighting, atmosphere, and environmental motion should carry the story.
3. Scroll or deliberate user movement may control camera progress, reveal scenes, and advance the narrative.
4. The visitor should feel they are moving through a world, not scrolling between stacked website sections.
5. Each major scene must visually demonstrate an AI capability before explanatory copy appears.
6. Use Three.js/WebGL for spatial depth and interactive environments when it materially improves the experience.
7. Use GSAP or equivalent no-fee animation techniques to choreograph camera travel, reveals, zooms, fades, and synchronized transitions.
8. Generated visual assets may support the experience, but the final world and interaction design must remain original to CivicAscent AI.
9. The cinematic journey must remain usable on mobile and include reduced-motion fallbacks.
10. Performance is part of UX: visual ambition must be balanced against load time, frame rate, and responsiveness.

## Living world rule
The CivicAscent AI site must behave like a living cinematic environment rather than a designed webpage with animated decorations.
1. The full viewport is the world; avoid hero blocks, cards, boxed demo panels, and stacked-section composition as the primary experience.
2. Continuous ambient motion must exist even before interaction: camera drift, light movement, particles, weather, reflections, environmental activity, or spatial motion.
3. Scroll should primarily move the camera or advance a cinematic timeline, not simply move page sections vertically.
4. Users should travel through, around, or into environmental objects to move between experiences.
5. Text should appear briefly and contextually inside the world, then dissolve or recede so the environment remains dominant.
6. Navigation should emerge from visible world elements such as light, architecture, terrain, characters, objects, portals, or transformations.
7. Major transitions should feel like film edits, camera moves, reveals, fly-throughs, or world transformations.
8. Avoid static compositions that only animate on hover; the experience must feel alive at rest.
9. Mobile must preserve the same living-world concept with simplified geometry/effects when needed for performance.
10. A build that visually reads as a static card, hero section, or conventional landing page fails this rule even if individual elements animate.

## Linked doorway baseline rule
Every linked doorway or child experience must inherit the same Living World baseline as the entry experience.
1. A doorway may change subject, environment, color mood, or AI capability, but it may not fall back to a conventional static page, card layout, or brochure structure.
2. Every doorway must preserve continuous ambient motion, cinematic depth, environmental navigation, mobile behavior, accessibility, and clear next-step guidance.
3. Shared interaction grammar is mandatory: light, camera movement, spatial objects, portals, terrain, architecture, characters, or other environmental cues should behave consistently across worlds.
4. Each child experience must feel like another location in the same CivicAscent universe rather than a separate website.
5. Doorway transitions should visually carry the visitor from one world to the next rather than abruptly replacing the experience.
6. The same performance, reduced-motion, no-fee, preview/testing, and beta-protection standards apply to every linked doorway.
7. A linked page that breaks the Living World baseline fails review even if the parent experience passes.

## Visual interaction rule
Primary interactions must feel like part of the cinematic world, not like ordinary website buttons or pill-shaped hotspot labels.
1. Prefer environmental interaction: glowing objects, moving light, animated surfaces, portals, doors, screens, pathways, characters, spatial cues, and camera travel.
2. A user should feel like they are entering or affecting a scene, not clicking a floating UI sticker.
3. Text labels may support an interaction, but the visual object/scene must carry the experience.
4. Clicking or tapping should trigger a visible transformation, transition, reveal, camera move, or guided sequence whenever practical.
5. Hotspots should be discovered through motion, lighting, depth, or environmental behavior instead of boxed callouts.
6. Mobile interactions must remain obvious and touch-friendly without reverting to cluttered cards.
7. Use progressive disclosure so only the right amount of information appears at each moment.
8. Each interaction should show an AI capability in action before explaining it.

## Zero-fee add-on rule
CivicAscent AI must use NO-FEE add-ons by default.
1. Do not add paid plugins, paid APIs, paid templates, paid libraries, paid hosting features, or recurring-cost services without explicit user approval.
2. Prefer open-source, free-tier, self-hosted, or already-paid-for tools.
3. If a free option has limits, verify those limits before relying on it.
4. If a feature would create a new charge, stop and surface the cost before implementation.
5. Existing paid tools the user already has may be used only when they do not create additional charges beyond the existing plan.
6. Do not use credit-consuming services when a no-fee path can meet the need.

## GSAP role
GSAP may be used to:
1. Choreograph scene transitions and scroll-driven storytelling.
2. Coordinate camera-like movement, fades, reveals, zooms, and object motion.
3. Animate SVG, text, DOM, and Three.js properties in a controlled timeline.
4. Replace abrupt section changes with fluid cinematic sequencing.
5. Support reduced-motion fallbacks for accessibility.

## Three.js role
Three.js may be used to:
1. Build spatial 3D scenes and real-time visual environments.
2. Create interactive AI demonstrations using depth, particles, lighting, and camera movement.
3. Turn visual objects into experiential navigation instead of standard hotspot buttons.
4. Add cinematic backgrounds and responsive 3D elements while maintaining performance budgets.
5. Work with GSAP for controlled scene choreography.

## Webflow role
Webflow may be used to:
1. Study advanced interaction, motion, and scrollytelling patterns.
2. Prototype cinematic page transitions and scene-based layouts.
3. Compare implementation ideas against strong modern web experiences.
4. Stage experimental versions before production.
5. Help translate approved design concepts into maintainable site behavior.

## Framer role
Framer may be used to:
1. Explore high-polish cinematic interaction patterns.
2. Prototype motion, transitions, and responsive scene changes quickly.
3. Study modern landing-page storytelling and immersive navigation.
4. Test alternate visual directions before committing them to the core build.
5. Serve as an inspiration/reference source for interaction ideas while preserving original CivicAscent AI design language.

## Google Stitch role
Google Stitch may be used to:
1. Generate and compare early UI/UX directions.
2. Explore layouts and interface ideas before implementation.
3. Translate prompts or screenshots into design concepts for discussion.
4. Support rapid experimentation when it stays within a no-fee path.
5. Serve as a reference source only; any final CivicAscent AI implementation must remain original and pass the project UX/testing rules.

## Visual generation toolkit rule
1. Prefer ChatGPT image generation/editing first when it can create or revise the needed visual without an additional paid dependency.
2. Adobe Firefly Free and Canva Free may be used for experiments and supporting assets within their current free allowances.
3. Adobe Express may be used as an optional free design/composition path.
4. Recraft Free may be used only for ideation/prototyping; do not ship its free-tier generated assets commercially because free-tier assets are not owned by the user and are not licensed for commercial use.
5. Midjourney is reference-only under the zero-fee rule because access requires a subscription.
6. Before any external AI-generated asset becomes a production asset, confirm the current licensing/commercial-use terms for the plan actually used.
7. The visual toolkit supports the Living World; it must not pull the design back toward static poster/card compositions.

## Theatre.js role
Theatre.js is an approved active tool for the Living World build:
1. Use it to author and fine-tune cinematic camera movement, lighting, material values, and synchronized Three.js sequences.
2. Keep Theatre Studio development-only; production should load exported animation state without the authoring UI.
3. Use Theatre.js where timeline precision improves the cinematic experience; GSAP remains valid for scroll control, DOM choreography, and transitions.
4. Avoid duplicate animation systems controlling the same property at the same time.

## Spline role
Spline Free may be used to:
1. Prototype interactive 3D scenes and object ideas quickly.
2. Study states, events, actions, physics, particles, lighting, and camera behavior before rebuilding approved ideas in CivicAscent code.
3. Use Spline's free 3D Library assets where appropriate; current Spline documentation states library models are free for commercial use.
4. Treat free web exports as prototypes because the free plan includes Spline branding/watermarks.
5. Do not use paid AI generation, paid export features, or paid subscriptions without explicit approval.

## Threlte role
Threlte may be used only if CivicAscent intentionally moves to a Svelte-based 3D architecture:
1. It is a Three.js framework for Svelte and is MIT-licensed.
2. Its Theatre.js integration is particularly relevant to the Living World direction.
3. Do not add Svelte/Threlte merely for novelty; the migration must reduce complexity or materially improve maintainability/performance.

## PeachWeb role
PeachWeb may be used as a reference/prototyping benchmark:
1. Study no-code/low-code Three.js workflows, keyframe animation, responsive UI, scroll effects, shader/effect concepts, and performance patterns.
2. The free plan is suitable for personal experiments, but custom-domain/custom-code production capabilities require paid plans.
3. Under the zero-fee rule, recreate useful techniques in our own Three.js/Theatre.js/GSAP stack instead of depending on PeachWeb hosting.

## MotionSites Academy role
MotionSites Academy may be used to:
1. Study scroll-scrubbed 3D storytelling and pinned cinematic scene techniques.
2. Learn responsive animation and performance strategies for motion-heavy experiences.
3. Compare implementation patterns for Three.js, scroll-controlled sequences, and immersive transitions.
4. Use only free educational/reference material unless explicit approval is given for a paid service.
5. Recreate techniques in original CivicAscent AI code and visuals rather than copying protected designs or paid templates.

## Perplexity role
Perplexity may be used to:
1. Research current public information and gather cited sources.
2. Cross-check design, technology, accessibility, SEO, and market claims.
3. Compare implementation approaches before committing them to the build.
4. Use only its free web/app path unless explicit approval is given for a paid service.
5. Never make Perplexity API access a required CivicAscent AI dependency under the zero-fee rule.

Webflow, Framer, Google Stitch, GSAP, Three.js, Theatre.js, Spline, Threlte, PeachWeb, Perplexity, and MotionSites Academy are reference or implementation resources, not permission to copy another creator's site. CivicAscent AI should borrow techniques and principles while keeping the final design original.

## ASTRA6 role
ASTRA6 is included in the fresh rebuild as a structured experimentation and review layer:
1. Observe evidence.
2. Define bounded objectives.
3. Build focused experiments.
4. Review evidence before acceptance.
5. Preserve reviewed lessons for reuse.

The current ASTRA6 implementation remains scaffold-only until a supported remote interface is available.

## Core presentation/testing rule
Nothing is presented as a preview, test build, module, or completed experience until the exact rendered version has been verified. Every true build must also be preserved as a test/beta recovery point before it moves forward. Before presentation:
1. Confirm the intended build/branch is actually being served.
2. Inspect the rendered page visually.
3. Test primary navigation, interactions, buttons, and routes.
4. Check mobile behavior and readability.
5. Confirm the visual changes requested are actually visible.
6. Complete UX review for clarity, flow, accessibility, and next-step guidance.
7. Run a page-screen test after each true build and use it as the visual reference for review.
8. Always provide both a mobile preview link and a desktop/PC preview link for every true build.
9. Save every true build as a protected test or beta recovery point before further edits, so the last working state can be restored after data loss, corruption, or a bad change.
10. Never overwrite the only working copy of a build; preserve a recoverable checkpoint first.
11. Present only after those checks pass.

## Build protection rule
1. Every true build gets its own test/beta recovery point.
2. The saved point must reference the exact verified commit used for preview.
3. Mobile and desktop/PC preview links are mandatory deliverables for review.
4. A newer build must never destroy the last verified working build.
5. Recovery branches/checkpoints remain untouched until a newer verified build supersedes them.

## Rebuild rule
Do not modify the archive branch. Build the new CivicAscent AI experience here, then review and test before replacing production.
