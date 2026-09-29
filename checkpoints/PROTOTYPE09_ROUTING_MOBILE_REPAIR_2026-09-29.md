# Prototype 09 Routing + Mobile Repair Checkpoint
Date: 2026-09-29

## Source
- Repository: civicascentai-ui/civicascentai
- Repair branch: repair/prototype09-routing-mobile-2026-09-29
- Base: build/prototype09-hotspot-door-2026-09-29
- Production/main: NOT CHANGED

## Repairs completed
1. `lab.html` now redirects to canonical `living-ai-lab.html`.
2. React Scene 01 `Start Here` now advances to `../prototype09-agent2/index.html` instead of replaying the opening video.
3. Scene 02 mobile CSS hardened:
   - dynamic/small viewport height handling
   - safe-area left/right padding
   - safer mobile intro placement
   - larger hotspot tap targets
   - safe-area-aware Living AI context panel
   - scrollable context panel with bounded mobile height
   - larger context action/close targets

## Engineering checks
- Branch is ahead of protected base and behind by 0 commits at comparison time.
- Living AI Lab has viewport metadata.
- Living AI Lab includes reduced-motion handling.
- Scene 02 has viewport metadata.
- Scene 02 includes reduced-motion handling.
- Canonical Living AI Lab page remains `living-ai-lab.html`.

## Gate status
- Agent 2 / engineering static gate: PASS for routing and responsive-code repair.
- Agent 3 / rendered visual-device gate: BLOCKED pending an actual browser-served preview of this repair branch.
- Production promotion: BLOCKED by no-known-defect rule until rendered mobile/desktop validation passes.
