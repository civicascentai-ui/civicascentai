# PETER -> Codex Engineering Path

Status: TEST PATH
Repository: civicascentai-ui/civicascentai
Branch: main

## Purpose
This path defines how PETER hands engineering work to Codex without bypassing CivicAscent AI governance.

## Path
PETER
-> define task and acceptance criteria
-> confirm last known-good save/checkpoint
-> Codex engineering work
-> automated/static checks
-> mobile + desktop verification
-> Agent 3 quality/accessibility review
-> defect gate
-> production only after PASS

## Mandatory gates
1. No known defect moves forward.
2. Preserve a rollback point before functional changes.
3. Mobile usability and accessibility must be verified.
4. Navigation, links, hotspots, and child pages must be tested.
5. No paid add-on is introduced without approval.
6. PETER records the fix, failure cause, and reusable lesson.
7. Production deployment requires a PASS result.

## First test
- Repository connection: expected PASS
- Read/write documentation path: expected PASS
- Production code change: NOT part of this test
- Deployment: NOT part of this test

## Codex handoff template
Task:
Acceptance criteria:
Files in scope:
Known-good checkpoint:
Tests required:
Rollback plan:
Result: PASS / FAIL
Open defects:
Lessons learned:
