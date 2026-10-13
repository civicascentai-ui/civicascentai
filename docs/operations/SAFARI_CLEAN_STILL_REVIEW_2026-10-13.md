# Safari clean-still alternative | REVIEW ONLY | 2026-10-13

## Source checkpoint
- Parent branch: `recovery/prototype09-homepage-20261012`, SHA `3b6a63b0d8cf6b6e085a7359b49818bdaf2e8b26`; original watermarked video/poster preserved on parent branch and unmodified.
- Alternative branch: `recovery/safari-clean-still-candidate-20261013`. This is a **temporary royalty-free still-photo option**, not the final cinematic 6-scene Safari movie.
- Visual source: [Nate Blank, Golden sunset over silhouetted African savanna](https://unsplash.com/photos/golden-sunset-over-a-silhouetted-african-savanna-landscape-3b3A8BhxzDE), published 2025-08-08, listed as free under [Unsplash License](https://unsplash.com/license). Attribution is included as a provenance note, though not required by the ordinary Unsplash License. Avoid representing the still as CivicAscent-original art.
- Image currently served from `images.unsplash.com` at `https://images.unsplash.com/photo-1754679996635-9fa307b38c36?auto=format&fit=crop&w=2000&q=78`. Its CDN availability, load speed, mobile framing and long-term availability must be verified; production should use vetted, self-hosted asset. Do not represent external dependency as durable controlled media.
- Recovered original storyboard file `CivicAscent_Safari_repair_preview_2026-09-29.html` contains six images, but scene text and button labels are baked into all six image pixels. Images retained in Library, **not released as interactive backgrounds**.

## Implemented
- Removed watermark-source movie and poster references from the alternative homepage; uses real photo with gradient fallback and safe subtle CSS still animation. Reduced-motion mode stops that animation.
- Preserves original semantic navigation, working two-step Start Here experience, and four live page destinations.
- Updates structure and browser QC from video expectation to real photo decode and no-overflow/mobile checks.

## Restrictions
- Different still-image aesthetic requires user visual review and explicit approval before it can replace any original Scene 1 media.
- The original six-scene media, independent reviewer sign-off, motion equivalence and Scene 05 design acceptance are all incomplete.
- `safari_release_gate.py` remains fail-closed. No paid purchase activation, production merge, or public release authorized.

## Local media hosting upgrade (2026-10-13)
- Licensed photo from Nate Blank/Unsplash has been archived in this review branch as `assets/safari/scene-01-savanna-nate-blank.jpg` (2000×1333 JPEG; 370,684 bytes); this replaces the previous CDN-only dependency.
- Homepage now requests the project's local file; browser tests await image decoding on every mobile width.
- Removed temporary GitHub Actions write permission and vendor/import stages. The remaining QA job has read-only permissions.
- The asset remains a still-photo **alternative**, not the original six-scene cinematic film. Independent accessibility, visual, all-scene media, and owner release approvals remain open.
