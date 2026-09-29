# CivicAscent AI — Agent 5 Resource-Control Incident
Date: 2026-09-29
Status: GOVERNANCE FAILURE RECORDED

## Incident
TinyFish, a metered fallback resource, was used multiple times during Page 2 QA.

The standing resource law required:
1. existing source/project state;
2. connected deployment/browser resources;
3. local/static validation;
4. other no-fee/already-connected resources;
5. specialist review when justified;
6. TinyFish only when other reasonable resources were insufficient.

## What Agent 5 got wrong
- Local Chromium/browser-harness attempts failed, which could justify fallback consideration.
- However, Agent 5 did not require a documented PRE-USE NECESSITY RECORD before invoking TinyFish.
- After the first rendered FAIL, Agent 5 did not first validate that the preview endpoint was serving the actual committed document.
- raw.githack/rawcdn.githack were later proven to inject an external-content interstitial.
- Additional TinyFish runs therefore tested an invalid preview path and consumed a metered resource unnecessarily.

## Root cause
Agent 5 enforced the resource order conceptually but lacked a hard execution gate requiring proof before a metered fallback call.

## Corrective law
Effective immediately:

### TINYFISH PRE-USE HARD GATE
Before any TinyFish call, Agent 5 MUST record:
- exact task TinyFish is needed for;
- which higher-priority resources were attempted;
- why each higher-priority resource is insufficient;
- whether the target URL/source has been independently validated;
- whether the task can be completed by static/source inspection instead;
- expected TinyFish call count;
- whether the action is metered;
- owner authorization status when required.

If any item is missing, TinyFish use is BLOCKED.

### RETRY LIMIT
A failed or ambiguous TinyFish run may not be repeated until Agent 5 identifies and documents why the prior run failed.

### PREVIEW VALIDATION
Before any paid/metered browser QA:
- verify the preview URL serves the exact intended commit/build;
- verify it is not an interstitial, stale cache, redirect wrapper, or transformed document;
- verify referenced assets resolve from that same build.

### COST ESCALATION
If more than one metered browser run is expected for the same defect, Agent 5 must STOP and reassess free/local/connected alternatives before another run.

## Accountability
This incident is attributed to Agent 5 governance failure, not to the user.

## Disposition
RESOLVED WITH NEW HARD GATE.
