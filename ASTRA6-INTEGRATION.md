# CivicAscent AI — ASTRA6 Integration

## Status
- Added as a project module on branch `feature/astra6-module-20260927`.
- Production `main` is intentionally unchanged.
- The module is informational and workflow-oriented only.
- No credentials, wallet data, private user data, or API keys are stored in this integration.

## Why this is scaffold-only
ASTRA6 publicly states that its Agent Skill Hub has been built/tested locally but that real remote access is not activated. Therefore CivicAscent AI must not represent ASTRA6 as a live external agent service yet.

## CivicAscent implementation
The current module maps ASTRA6-style concepts into CivicAscent AI:
1. Observe evidence.
2. Define a bounded objective.
3. Build the smallest useful experiment.
4. Review evidence before acceptance.
5. Preserve reviewed lessons for reuse.

## Activation gate
A future live integration should only be enabled when ASTRA6 publishes a supported remote interface with documented authentication, data handling, rate limits, and stable endpoints.

## Production safety
Do not modify or expose production secrets in frontend code. Keep any future server credentials in a protected backend environment and restrict browser origins to CivicAscent AI.
