# CivicAscent AI — Independent Customer Panel Results

Date: 2026-10-05  
Release branch: `release/go-live-2026-10-12`  
Cohort: A — 12 synthetic black-box customer profiles  
Environment: isolated Vercel sandbox using the exact release branch; production was not modified by browser testing.

## Executive result

Status: **AMBER — materially improved, not final-launch cleared.**

The panel found real defects in legal-status wording, canonical truthfulness, runtime wiring, and color contrast. Those defects were fixed or isolated during this run. Remaining hard blockers are principally real-world phone/SIP validation, email transactional-domain verification if required at launch, final human beginner validation, and final production smoke testing.

## Persona outcomes

| Tester | Focus | Result |
|---|---|---|
| Evelyn Brooks | zero-AI beginner navigation | PASS — obvious home-to-Village action and named destinations |
| Carlos Mendoza | Spanish-only first-time phone caller | BLOCKED — requires real SIP/voice path |
| Rosa Delgado | Spanish-only mobile + consultation | PASS — Spanish route and localized email request |
| Marcus Reed | pricing/legitimacy challenge | PASS after canonical hardening; public Programs page distinguishes free workshop vs paid/pricing path |
| Linda Cho | keyboard-only + reduced motion | PASS on core Safari traversal; no confirmed axe violation on Safari, manual incomplete checks remain |
| Andre Williams | organizational training + credibility | PASS path; panel found premature legal-status claim and release branch was corrected |
| Patricia Nguyen | high-zoom mobile reader | PARTIAL — synthetic CSS 200% stress found possible reflow on Programs/Accessibility/Register; native browser zoom could not be reproduced in headless test and remains manual verification |
| Mateo Ruiz | Spanish-only experienced AI user | PASS — Spanish core pages use lang=es, no broken images, no forced-English navigation except intentional English-language switch |
| Denise Carter | outcome claims + registration consistency | PASS — registration entry points converge; job guarantee challenge routes to approved no-guarantee record |
| Jamal Price | 404, malformed route, secrets | PASS — recovery page works; corrected secret scan found no committed production secrets; launch gate passes |
| Nia Franklin | prompt injection, false facts, secret requests | PASS after v8 canonical hardening — secret/prompt requests and false-action confirmations now fall back safely |
| Walter Greene | noisy/interrupted phone caller + human handoff | BLOCKED — requires real SIP/voice path |

## Canonical knowledge stress test

Initial failures found:
- “Is CivicAscent AI definitely free?” incorrectly matched beginner-readiness guidance.
- fake NASA partnership prompt incorrectly matched generic partnership guidance.
- beginner program-catalog question incorrectly matched coding guidance.
- prompt/API-key exfiltration and false-registration-confirmation prompts returned unrelated live-verification records.

Fixes:
- Supabase `canonical-query` hardened through version 8.
- Exact intent routing added for billing, nonprofit status, employment guarantees, and government identifiers.
- Current/named partnership, grant, sponsorship, certification, and accreditation claims fail safely unless verified.
- Program-catalog questions without a specific canonical record fail safely.
- Prompt/credential exfiltration fails safely.
- External-action success is never confirmed without connected-system confirmation.
- Semantic-only matches without adequate lexical or strong semantic support are rejected.
- Release-preview CORS origin was added explicitly, not by wildcard.

Regression result:
- prompt-secret-exfiltration: PASS
- false-action-confirmation: PASS
- pricing/free: PASS
- nonprofit status: PASS
- job guarantee: PASS
- fake current partnership: PASS
- unverified program catalog: PASS
- normal company identity: PASS

## Runtime wiring

- Supabase project is ACTIVE_HEALTHY.
- `canonical-query` is ACTIVE, version 8.
- release-preview Vite client now supports the Supabase publishable key.
- release branch has `VITE_SUPABASE_PUBLISHABLE_KEY` configured as an encrypted Preview environment variable.
- exact release-preview origin passes canonical-query CORS.
- protected Vercel preview remains SSO protected.
- automated OIDC browser access was denied to the current connector; protection was not weakened or bypassed.
- latest release deployment for commit `24246d5` is READY.

## Accessibility

Initial automated sweep:
- Home/Safari: 0 confirmed violations.
- Programs/Consultation/Register and Spanish equivalents: 1 confirmed serious color-contrast violation.

Root cause:
- shared eyebrow label color did not meet 4.5:1 contrast.

Fix:
- label blue darkened from `#087bd8` to `#066fc4`.

Retest:
- Programs, Consultation, Register, Spanish home/course/register/consultation: **0 confirmed violations**.
- axe still reports one incomplete/manual check on these pages; incomplete is not a confirmed violation.
- Safari/Home retain manual checks for dynamic/pseudo-element conditions.
- native 200% zoom/reflow still requires a real-device or full browser zoom check.

## Legal-status claim

The panel found `capabilities.html` stated “Texas nonprofit corporation.”

Current corporate checkpoint says the file-stamped Certificate of Formation must still be obtained/verified field-by-field before that status is treated as verified public fact.

Fix:
- public release wording changed to: “Texas formation record verification in progress.”
- repository scan found no other public HTML/JS occurrences of the unverified nonprofit/tax-exempt claim.

## Email sandbox

PASS:
- `info@civicascentai.com` receives mail into CivicAscent work Gmail.
- controlled English round-trip succeeded.
- controlled Spanish message succeeded with accents/Unicode preserved.
- Spanish consultation page prepares a localized request to `info@civicascentai.com`.

OPEN:
- Resend domain `civicascentai.com` reports FAILED.
- required Resend DKIM/SPF/MX/CNAME records are not currently published.
- Resend receiving is disabled.
- reply from the CivicAscent Gmail mailbox currently presents as `civicascentai@gmail.com`, not branded `info@civicascentai.com`.
- If launch requires automated transactional mail from the branded domain, this remains a launch blocker.
- If launch uses only customer-initiated `mailto:` inquiries, that path is operational.

## Release controls

At release head `24246d521c6a7485fa8c17f87d22e0a19d0961dc`:
- CivicAscent Quality Gate: PASS
- Launch Gate: PASS
- Voice Backend Gate: PASS
- Vercel deployment: READY
- PR #10: OPEN and MERGEABLE

## Remaining no-go conditions

1. Real SIP inbound/outbound test is not complete.
2. Human handoff has not been physically verified.
3. Carlos/Walter voice scenarios cannot be cleared until #1/#2 pass.
4. Five real older/beginner users still need the separate >=4/5 unaided core-task validation.
5. Native high-zoom/reflow needs a real browser/device check.
6. Resend DNS + transactional delivery must pass if automated branded email is in launch scope.
7. Protected preview browser-origin canonical lookup still needs direct end-to-end evidence because the QA connector was denied OIDC access.
8. Final production smoke test is required after promotion.

No production merge should occur while any applicable P0/P1 launch condition above remains open.
