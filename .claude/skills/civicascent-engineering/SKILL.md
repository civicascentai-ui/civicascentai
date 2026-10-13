---
name: civicascent-engineering
description: Plan, implement, debug, test and close CivicAscent AI engineering tasks using evidence-based small changes and independent QC. Use on all code and launch work.
---

# CivicAscent engineering discipline

Use this project-specific instruction-only skill for development. It is not the third-party Superpowers plugin.

## Procedure

1. Establish a verifiable definition of done, existing behavior, known dependencies, and highest-risk failure.
2. Reproduce defects or define expected behavior as a focused regression test. Record a failing baseline when feasible.
3. Make a small, reversible change in a QA branch. Avoid broad rewrites and avoid unrelated edits.
4. Run the appropriate automated tests and then validate critical behavior directly, including failure and recovery paths.
5. Examine secrets, authentication, webhook signatures, database access policy, personal data protection, accessibility, and responsiveness.
6. Require separate reviewer feedback for high-risk changes; identify what each reviewer actually inspected.
7. Document test command, evidence link, remaining risks, and release decision. Do not claim a test passed unless a real run produced evidence.

## Release stop conditions

Production launch remains HOLD while payment-to-entitlement fulfillment, signature checks, refund/dispute handling, recovery, and 25 verified Stripe sandbox purchases remain unproven. Do not use real cards or enable live payments without explicit approval. Do not merge, deploy, contact others, spend money, or transmit project secrets independently.

## Inspiration and licensing

Related open-source project: https://github.com/obra/superpowers (MIT). This is an original, nonexecuting QA workflow tailored to CivicAscent AI.
