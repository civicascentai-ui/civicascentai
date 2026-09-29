# Prototype 09 — Agent 3 Formal QA Report

Date: 2026-09-28
Status: FAIL / RETURN TO AGENT 2

## Candidate tested
`prototype09-agent2/`

## Functional checks
PASS:
- page renders at desktop viewport
- page renders at 390x844 mobile viewport
- no horizontal overflow detected at tested viewports
- primary destination interaction opens contextual content
- close interaction works
- reduced-motion control changes its ARIA pressed state
- candidate fits within one viewport at tested desktop and mobile sizes
- keyboard-visible focus styling is defined
- production remains untouched
- Replit remains locked

## Blocking defects

### 1. Mobile interaction-label collision
FAIL.

At 390x844:
- the "Learn with AI" environmental destination visually collides with the "Start here" primary action
- the "Create with AI" destination crowds the introductory copy
- environmental labels compete with the primary reading order instead of supporting it

This violates:
- obvious next action
- older-user readability
- mobile usability
- rich world / simple attention rule

### 2. Prototype 09 scene-direction mismatch
FAIL.

The current visual source delivers a strong golden-hour savanna and elephants at water, but the rendered candidate does not clearly establish the locked elevated lodge / terrace viewpoint as part of the opening environmental composition.

This is a required Prototype 09 anchor, not an optional embellishment.

### 3. Visual hierarchy on mobile
FAIL.

The headline, introduction, primary action, and three environmental destinations all occupy the same central visual field.

The result is readable in isolation but too competitive as a complete first-screen hierarchy for the target older / beginner audience.

## QA decision
RETURN TO AGENT 2.

Required corrections before retest:
1. Recompose mobile destination positions so no destination competes with or overlaps the headline, supporting copy, or primary action.
2. Preserve one dominant next action on initial load.
3. Restore / establish the elevated lodge or terrace framing required by the Prototype 09 lock.
4. Re-render desktop and mobile proof after correction.
5. Re-run Agent 3 QA before Agent 4 critique.

## Governance
Agent 4 remains BLOCKED.
No production promotion.
No Replit use.
No known defect may advance.
