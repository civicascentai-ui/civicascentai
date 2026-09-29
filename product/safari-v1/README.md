# Safari Vertical Slice 1.0

Status: BETA / isolated product candidate. Not production.

## What works
- Responsive Safari opening experience
- One obvious Start Here action
- Two-step beginner AI demo
- Learn / Try / Get Help / Continue next-action structure
- Keyboard/touch controls
- reduced-motion support
- React Spring motion
- analytics event hooks through `civicascent:analytics`

## Required media
Place the current owner-approved Safari still at:

`public/assets/safari-approved.jpg`

The CSS includes a warm visual fallback so the app remains readable if the media asset fails to load.

## Governance
This candidate must not be released until:
1. approved Safari media is inserted;
2. owner visual approval passes;
3. Agent 3 accessibility/device QA passes;
4. Agent 5 control audit passes;
5. Agent 6 strategic review passes;
6. governance and owner production authorization are recorded.

No quarantined prototype assets may be substituted.

## Run locally
```
npm install
npm run dev
```

## Build
```
npm run build
```
