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

## Active art direction
Model 05 and later builds should use the current reference pack as the visual benchmark:
- Glow-driven cinematic scrollytelling
- One connected world rather than stacked sections
- Premium sci-fi framing with minimal chrome
- Flash-era nostalgia only as a texture/accent
- Strong focal lighting and environmental depth
- Navigation through destinations, portals, stations, terrain, architecture, objects, or characters
- Text appears briefly and supports the world instead of dominating it
- Shared Living World baseline across every linked doorway
- No cards, pill-hotspots, brochure layouts, or static hero compositions as the primary experience
- Movement, light, and depth lead; text supports; UI stays secondary

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

## Model 05 theme
Use a glow-driven cinematic transit/world concept: the visitor travels through a connected CivicAscent universe, discovers illuminated destinations, and moves into child worlds through cinematic environmental transitions. The experience may borrow the feeling of transit, stations, tunnels, portals, or moving infrastructure without locking the site to a literal train theme unless that proves strongest in testing.

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


## STOP-THE-LINE STATUS — browser/preview verification
Status: PAUSED
Date: September 27, 2026

Forward design and feature work is paused until preview verification is reliable.

### Verified facts
- Model 05 source and preview files exist on the GitHub main branch.
- The custom-domain CNAME in the repository is civicascentai.com.
- The user has successfully opened prior civicascentai.com preview URLs on a real mobile browser.
- ChatGPT's current web-fetch/browser environment cannot access civicascentai.com or the GitHub Pages hostname, and the container environment cannot resolve the domain. This prevents independent live-browser verification from this environment.

### Engineering interpretation
The current blocker is the verification path, not yet proven to be a production-site outage. Do not alter DNS, hosting, or production merely to compensate for a restricted verification environment without evidence that the live site itself is broken.

### Required closure criteria
Do not resume Model 05+ development until a reliable verification path is established that can:
1. Load the exact published preview.
2. Render the real HTML/CSS/JS assets.
3. Test desktop and mobile viewport behavior.
4. Exercise primary interactions and doorway routes.
5. Capture page-screen evidence.
6. Distinguish site/deployment failures from verification-tool network restrictions.

Until these criteria pass, keep the current beta and all recovery points intact.


### Browser repair finding
A concrete Model 05 dependency fault was found during diagnosis:
- Model 05 referenced Three.js r180 using the removed legacy path build/three.min.js.
- Three.js removed the legacy three.js/three.min.js build beginning after r160; r180 requires the module build or another supported loading strategy.
- Model 05 is now repaired to use repository-local vendor assets for Three.js r159 and GSAP 3.13.0, eliminating the broken Three.js r180 legacy URL and reducing external CDN risk.
- The published PC, mobile, and doorway preview pages were also updated to use the local vendor assets.
- A same-origin browser diagnostic page was published to test Three.js, GSAP, WebGL, Model 05 CSS/JS, and all preview HTML files directly in the user's browser.

### Current closure state
NOT YET CLOSED.
The code/dependency defect is fixed, but the stop-the-line remains active until the live browser diagnostic reports all checks PASS on an actual browser. ChatGPT's external web-fetch environment still cannot reach the custom domain, so it cannot independently close the live-site verification step.


### Browser verification closure
Status: CLOSED
Verified in the user's live mobile browser on September 27, 2026.

The published diagnostic reported PASS for:
- Three.js
- GSAP
- WebGL
- Model 05 CSS
- Model 05 JavaScript
- PC preview HTML
- Mobile preview HTML
- Doorway preview HTML

Conclusion:
- The broken Three.js dependency was the confirmed Model 05 browser defect.
- Local vendor copies of Three.js and GSAP resolved the dependency-loading issue.
- The same-origin preview asset path is now verified in a real browser.
- Stop-the-line pause is lifted for this blocker.
- Forward development may resume from the repaired Model 05 baseline, while preserving all checkpoints and continuing the stop-the-line rule for any future defect.


## Model 06 — Living Directive
Status: BUILT / PUBLISHED / PENDING LIVE BROWSER VERIFICATION

Purpose:
- Establish a stronger living starting point from the verified Model 05 baseline.
- Keep the world moving before user input.
- Make scroll/swipe feel like travel through a connected environment.
- Use environmental glowing gates instead of cards or pill hotspots.
- Preserve the same living-world baseline inside every linked doorway.

Protected beta:
- Branch: beta/model-06-living-directive
- Build commit: b17e21fd0f3c70794363941691c65d07dec7a7db

Published integrity checks completed:
- PC preview HTML exists and references local Three.js plus Model 06 preview assets.
- Mobile preview HTML exists and references local Three.js plus Model 06 preview assets.
- Doorway preview HTML exists and references local Three.js plus Model 06 preview assets.
- Preview CSS and JavaScript exist on main.
- Model 06 browser diagnostic exists on main.

Stop-the-line gate:
Do not mark Model 06 preview accepted or continue forward development until the Model 06 live browser diagnostic reports ALL CHECKS PASS in the actual review browser.
