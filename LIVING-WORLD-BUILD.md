# CivicAscent AI — Living World Rebuild

Started: September 27, 2026

This branch is the new active design direction.

## What is preserved
- Production remains untouched.
- Model 03 remains preserved at beta/model-03-cinematic-world.
- Earlier checkpoints and archive branches remain recovery points.
- Core UX, no-fee, mobile/desktop preview, and beta protection rules remain mandatory.

## What is cleared
Do not use Model 02 or Model 03 layout/composition as the visual foundation.
They are retained only as experiments and lessons.

## New target
Build one continuous living world:
- Full-viewport cinematic environment
- Continuous ambient motion at rest
- Scroll-scrubbed camera travel instead of stacked page sections
- Environmental navigation instead of cards or floating hotspot pills
- Contextual text that appears briefly and recedes
- Scene transitions through movement, objects, portals, light, and camera travel
- Three.js/WebGL as the primary spatial rendering layer
- Theatre.js as the precision cinematic timeline for camera, lights, and 3D property animation
- GSAP for scroll-scrubbing, DOM/text choreography, and transitions where it is the cleaner controller
- Spline Free for rapid 3D prototyping and approved free-library assets; rebuild final critical interactions in our own stack when needed
- Threlte reserved for a deliberate future Svelte migration only
- PeachWeb and MotionSites Academy as technique/performance references, not production dependencies
- Mobile retains the living-world concept with lighter effects

## Technical baseline going forward
- Rendering: Three.js/WebGL
- Cinematic sequencing: Theatre.js
- Scroll and interface choreography: GSAP
- 3D prototyping/asset exploration: Spline Free
- Framework option only if later justified: Threlte/Svelte
- Reference benchmarks: PeachWeb + MotionSites Academy
- Production rule: no new paid dependency

## First build target
Model 04 remains the preserved proof-of-concept. Model 05 becomes the first build to implement the upgraded technical baseline:
1. Real Three.js scene graph rather than a 2D canvas approximation.
2. Theatre.js-controlled camera/light sequence.
3. GSAP scroll-scrub connected to the cinematic timeline.
4. One true 3D environmental doorway that inherits the shared Living World baseline.
5. Spline may be used to prototype the doorway/object, but the experience must remain viable under the zero-fee rule.
6. Maintain mobile performance fallback and reduced-motion behavior.

### Model 04 original proof criteria
Model 04 should prove only the core experience:
1. Living full-screen world
2. Continuous motion before interaction
3. Camera responds to scroll/touch
4. One environmental interaction
5. One cinematic transition
6. Minimal text
7. Desktop and mobile previews
8. Saved beta checkpoint before presentation

No production replacement until the model passes visual, interaction, mobile, UX, and performance review.
