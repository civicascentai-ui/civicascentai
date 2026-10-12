# CivicAscent AI | Six-Scene Safari Page Assignment & Production Plan
Owner direction: 2026-10-12 | Status: ROUTE MAP ACCEPTED, VISUAL RELEASE BLOCKED
GitHub recovery: #68 and draft PR #69; branch \`recovery/prototype09-homepage-20261012\`.
Budget: **$0 new spend**. Never run costly Replit, Z.ai, OpenArt or other generation APIs without explicit authorization.
This is an implementation assignment, NOT evidence that agents are online, assets are production-approved, or pages are complete.

## Core decision
Reuse the **six connected shots of the Prototype 09 Safari Learning World storyboard** as the visual identities of real user destinations. Frame 5, the cinematic Living AI Lab, is the priority creative anchor. The owner explicitly endorsed this direction. Do **not** publish watermarked OpenArt storyboard art, generated mockup text, low-fidelity placeholders, or a screenshot with fake buttons as the final site.

Experience: premium, realistic elevated African safari lodge, elephants at a watering hole, sunset with atmospheric motion and quiet water reflections, focused light pathways; one obvious Start Here entry; spatial navigation only where it helps. Avoid a dashboard, card farm, distracting pills, busy rails or duplicate overlaid navigation. UI text, language controls, buttons and routes must be **real HTML**.

## Scene → existing URL → functional assignment

| Board | Existing destination | Visual / camera direction | Interaction on live page | Completion criteria |
|---|---|---|---|---|
| 1: Establishing shot | \`/index.html\` and site root \`/\` | Wide golden-hour lodge terrace, watering hole, elephants, deep natural perspective. A slow opening camera move, gentle optional motion. | Single prominent **Start Here** opens guided introduction. Secondary quiet navigation to Explore/Programs/Get Help. | Clean master media, user-approved composition, responsive hero 320-1440+, sound-free playback/poster fallback, real CTA and accessible navigation. Current PR #69 functional candidate is **not final** due watermarked movie. |
| 2: Gentle push-in | \`/free-ai-starter.html\` as free sample destination; Scene 2 motion can also appear inside Start Here sequence on \`/index.html\`. | Move from deck toward the elephants/water reflection. Natural warm haze and unobtrusive start waypoint; no fake embedded button. | Preserve existing **free AI starter** lesson and \`learner-interest.html\` path. A free user path must never force checkout or enrollment. | Visitor can start immediately with no purchase, understand example and next action, and follow the existing lead-interest link. Do not remove disclosures. |
| 3: Focus path / transition | \`/mentor.html\` (Guided Planner). | A subtle illuminated trail from lodge toward the landscape; environment becomes calmer while the visitor focuses on a goal. | Existing guided-planner questions and actual routing remain operable; restore focus correctly between stages. | No broken input/form functionality; keyboard, touch and error messaging PASS. No static overlay that fakes a live planner. |
| 4: Learning moment | \`/course.html\`; related \`/programs.html\` uses the same palette/background family only. | Focus on one learning point in the Safari; small legible live lesson prompts layered over an atmospheric still or gentle motion. | Access beginner lessons and listed programs, preserve course navigation/prices/availability truthfully; do not make unconfirmed "free" promises for paid resources. | Readable learning copy and all actual destinations, contrast AA, clear programs and registration path. |
| **5: Living AI Lab, creative priority** | **\`/living-ai-lab.html\`**; practical lab tools may link to \`/ai-lab.html\`. | Cinematic wide reframe over the water; subtle *real* data or visual overlays show observation becoming AI understanding. Rich and peaceful, not a HUD/dashboard. | Interactive **Try / Observe / Understand / Continue** demo controls; any scripted example explicitly says it is scripted, never a live backend. Existing Lab voice/accessibility behavior preserved. | Scene 5 visual review first, responsive interactive demo, loading/error fallback, keyboard/voice opt-in, reduced-motion support; independent QC + owner design acceptance. |
| 6: Lodge return / onward destinations | \`/village.html\` (Explore Safari Hub). | Return to warm lodge/terrace with three subtle spatial choices integrated with lighting and depth. | Clear links to \`course.html\`, \`living-ai-lab.html\`, \`mentor.html\` and reliable access to \`consultation.html\` and \`programs.html\`. The full navigation may exist in an accessible menu rather than noisy hero icons. | Destinations all click through; mobile tap areas ≥44px, no pill collisions, no broken links, preserved previous Safari navigation repairs. |

**Supporting routes are not new scenes:** \`consultation.html\` should use a quiet derivative of the Scene 6 palette but keep contact privacy repairs, forms, readable disclaimer, email and navigation intact. \`programs.html\` extends Scene 4; \`es.html\` and \`curso-es.html\` preserve Spanish learner paths. Do not rewrite checkout or registration during visual migration. Preserve any separately approved winter Page 2 / saved assets unless the owner expressly authorizes replacing that specific page.

## Journey and navigation (must be genuine)
1. Root Home opens **Start Here** accessible dialogue (already present in draft PR #69; currently a scripted demo).
2. Continue → free example (\`free-ai-starter.html\`) or Course/Learning (\`course.html\`).
3. Personalized help → Guided Planner (\`mentor.html\`) or Consultation (\`consultation.html\`).
4. Hands-on demonstration → Living AI Lab (\`living-ai-lab.html\`), optionally working tools (\`ai-lab.html\`).
5. Explore → Safari hub (\`village.html\`), with a working way home from every destination.
Keep canonical URLs and bookmarks stable. No broken redirects or surprise payments.

## Art and media production gates
- Each scene uses **one original, clean, accurately licensed 16:9 master background** or authorized video, with mobile-safe crop / poster. Assets stored under versioned \`assets/safari-scenes/\` after review, NEVER remote watermarked OpenArt CDN in production.
- Same visual universe across all six: same lodge architecture, golden hour, family of elephants, savanna terrain, water, atmospheric perspective, quiet cues and matching color grade. No printed type, UI mockups, logos or buttons baked into media.
- The recently generated watermark-free elephant-at-waterhole review plate is a **candidate only**, with no full elevated lodge foreground. The storyboard's watermarked frames remain concept references, not release media.
- Respect perceived performance: precompressed .webp/AVIF stills as appropriate, poster/fallback for video, lazy-load images beyond first screen, prevent layout shifts. Reduced-motion must load a stable still scene; avoid autoplay with sound.
- Figma checkpoint \`staging/prototype09-approved-20261003\` contains unfilled locked media placeholders. Validate against owner's actual selected visual before considering any asset approved.

## Practical build order and assignments (roles, not claims of running agents)
**Phase A: Recovery and art direction** (experience owner / Zebra visual specialist planned)
- [x] Map scene boards to real current routes (this document).
- [x] Preserve source storyboard, route names and versioned savepoint.
- [ ] Create and review clean Scene **5** reference first, then consistent scenes **1, 2, 3, 4, 6** from a single style bible.
- [ ] Identify authoritative clean asset provenance, legal rights, mobile-safe crops and size constraints.

**Phase B: Engineering** (Agent 2 engineer, Sam infrastructure, CODI integration roles planned)
- [ ] Put only approved scene assets on the isolated recovery branch, keyed per existing destination.
- [ ] Create a shared scene style layer that does not modify business logic or duplicate the existing JavaScript applications.
- [ ] Make real page controls interactive, including Scene 5 demo; make every link functional and keep business/private information safe.
- [ ] Validate zero added platform spend; Vercel preview/CI only. Do not promote draft PR #69 yet.

**Phase C: Independent release gate** (Agent 3 accessibility/QC; Agent 4 independent critical review; Friday testers, if actually connected)
- [ ] Screenshot 320 / 375 / 390 / 430 mobile and 768 / 1024 / 1440 desktop for all 6 destinations, before and after opening each interaction.
- [ ] Check no clipping/overlaps, 44px tap targets, keyboard focus, Escape behavior, contrast, screen reader labels, alt text, reduced-motion, readable error/fallback paths.
- [ ] Verify all cross-page URLs and side routes; don't break \`consultation.html\`, learner interest and Spanish paths.
- [ ] Inspect actual decoded media visually for watermarks, printed fake UI, or wrong species/setting. HTTP 200/206 alone is insufficient.
- [ ] Keep screenshot/artifact evidence, QA pass/fail ledger, privacy/disclaimer review, previous approved Page 2 constraints.
- [ ] Obtain explicit owner acceptance of final visual scenes followed by explicit production release approval; after both, and only after clean CI, merge and confirm public URLs.

## Current checkpoint / safety
- Main \`index.html\` **still starflight mockup** as of last verified production check. Production Vercel is READY but final six-scene experience **not live**.
- Draft PR #69 has a functioning scripted guide and five-size Chrome QA, but **watermarked video means visual FAIL** and merge is held.
- Previous consultation privacy and Village waypoint CSS fixes must remain preserved.
- No connected autonomous agent operation is established by this document; assignments indicate workstreams awaiting real execution and verification.
- Immediate priority is **clean Scene 5 design**, then the clean Scene 1 homepage; avoid designing six unrelated front ends at once.
