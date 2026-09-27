# CivicAscent AI — ASTRA6 Integration

## Status
- ASTRA6 is now an official core module of the fresh rebuild branch: `rebuild/fresh-20260927`.
- The frozen archive remains untouched.
- Production `main` remains unchanged until the fresh build is reviewed and approved.
- The current ASTRA6 implementation is informational/workflow-oriented only.
- No credentials, wallet data, private user data, or API keys are stored in this integration.

## Current module
- Page: `astra6.html`
- Role: structured experimentation, evidence checkpoints, review, and reusable learning.

## Why live connection is not enabled
ASTRA6 publicly states that its Agent Skill Hub has been built/tested locally but that real remote access is not activated. CivicAscent AI must therefore not represent ASTRA6 as a live external agent service yet.

## CivicAscent implementation
1. Observe evidence.
2. Define a bounded objective.
3. Build the smallest useful experiment.
4. Review evidence before acceptance.
5. Preserve reviewed lessons for reuse.

## Activation gate
A future live integration should only be enabled when ASTRA6 publishes a supported remote interface with documented authentication, data handling, rate limits, and stable endpoints.

## Production safety
Never expose production secrets in frontend code. Any future credentials belong in a protected backend environment with restrictive access controls.
