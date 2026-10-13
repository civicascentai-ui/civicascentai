# CivicAscent AI | Phase 2 private packaging and sandbox preflight
**Date:** 2026-10-10
**Authorization:** Private course packaging and sandbox fulfillment QA. $0 spending, no live payments, no production deployment.
**Release:** HOLD. Not approved to sell.

## Private draft package candidates produced
Two internal review ZIPs were generated outside the public repository from CivicAscent-owned Google Drive curricular sources. They were delivered privately in the ChatGPT conversation. The actual ZIP contents are **not stored in GitHub, Vercel, or Supabase**.

| SKU | ZIP name | SHA-256 checksum | Approx size | Current status |
| --- | --- | --- | --- | --- |
| Starter ($49) | `CivicAscent_Starter_QA_Candidate_2026-10-10.zip` | `7e2abb534b72ef53a71322456dcaeaa440cb8f8b160cb123829d83d6fa177fd9` | 172 KB | Internal review only |
| Facilitator ($129) | `CivicAscent_Facilitator_QA_Candidate_2026-10-10.zip` | `b5a950cd8ce03b32005dd330c8136fa9cc02da3548cb64cb5c1df4a31092ddc2` | 346 KB | Internal review only |

Starter: PDF learner guide, workbook, assessment and reference card.
Facilitator: Starter materials plus instructor guide, scoring key, 8-page teaching slide PDF, and draft licensing/release checklist.
Each ZIP has integrity manifest and `INTERNAL QA NOT FOR SALE` notices. ZIP integrity and sample PDF visual/page layout were checked. This is not full WCAG or human course quality approval. The commercial price labels reflect the existing catalog, not a claim of approved sellability.

**Internal source evidence checked:** CivicAscent AI Training System v2, Level 1 Prompting Fundamentals, Level 1 Core audit revision draft, Student Worksheet, Practice Pack and Facilitator Demonstration Kit. The latter is expressly approved for internal demo, not as the full $129 commercial bundle.

## QA staging preflight verified directly
Supabase **Course Commerce QA Staging**: `lpdvvgdejbsgurtqmrub` is active and distinct from the older RAG test project.
- Private storage bucket: `course-qa-private`, `public=false`, ZIP MIME only, 25 MB limit.
- Storage objects: **0**. The new ZIPs have **not** been uploaded.
- Public QA tables: catalog has **starter 4900 cents** and **facilitator 12900 cents** in USD.
- Verified checkouts **0**, event records **0**, download attempts **0**.
- RLS enabled on QA tables, no anon/authenticated access policies. The lack of policies is a deliberate closed posture, not release approval.
- Verified-email status lookup for a nonexistent synthetic buyer returned **0 rows**.
- Authenticated download-entitlement lookup for a nonexistent synthetic buyer returned **0 rows**.
- The relevant database RPCs exist and are service-role-only, `SECURITY INVOKER`; their signatures match the source's expected RPC names.

Stripe sandbox `Civicascentai sandbox`, `livemode=false`:
- Confirmed TEST payment links for Starter (4900 cents) and Facilitator (12900 cents), both active.
- One sandbox webhook endpoint is listed but **disabled**, and points to an older learner-access preview.
- Fourteen prior Stripe Checkout Sessions reported test-mode paid/complete. **None count toward the 25-purchase acceptance matrix**, as they are not matched to entitlement, private download, refund/recovery, and independent test evidence.
- The test authorization does not permit live charges or exposing real user credentials.

Vercel QA project:
- QA-specific Stripe/Supabase variables are principally scoped to `qa/learner-access-ui-20261009`, not this tooling-review branch. No credential values were fetched.
- Preview SSO protection remains enabled. Prior QA branches must not be confused with the current isolated QA branch.
- The necessary staging service-role runtime configuration was not confirmed for the current preview branch.

## QA-only purchase-link safety correction
The isolated branch `course.html` now uses **only the verified Stripe test-mode Starter and Facilitator links**. A prominent banner states no sales or course access are approved.
- Production/main and existing public Stripe links remain untouched.
- Added automated regression tests to prohibit non-test checkout links in QA.
- No payment was initiated.

## Blocking dependencies before 25 real sandbox scenarios
1. President/product owner must approve the actual itemized Starter and Facilitator product files and final license/refund/support claims. Draft ZIPs are prototypes for review, not finished sellable packages.
2. The approved files must be uploaded through a supported authenticated storage API into the existing **private** staging bucket; no service key should be exposed to a public repository or chat.
3. Configure a **current-branch** isolated Vercel preview with correct sandbox-only Stripe signing secret, price-link allowlist, staging Supabase URL/publishable/service credentials, and safeguards, through secret management. Do not copy credentials into issues.
4. Confirm protected preview access and enabled sandbox webhook, signature validation and real runtime logs.
5. Only then run the 25 matrix scenarios and reconcile verified payment → verified email → entitled private download → refund/revocation and retry flows, with human independent witnesses.
6. Obtain accessibility, novice learner and language signoffs. Production stays on HOLD until separate approval.

## QC evidence
- [PR #48](https://github.com/civicascentai-ui/civicascentai/pull/48)
- [Expanded browser tests 27/27](https://github.com/civicascentai-ui/civicascentai/actions/runs/38060917297)
- [Combined Node checkout safety 80/80 and browser 27/27](https://github.com/civicascentai-ui/civicascentai/actions/runs/38061056606)
- **Sandbox regression verified**: [GitHub Actions #38063013020](https://github.com/civicascentai-ui/civicascentai/actions/runs/38063013020): 83/83 Node safety tests and 27/27 browser tests PASS; 5/5 local skills validated. Separate checkout workflow [#38063013021](https://github.com/civicascentai-ui/civicascentai/actions/runs/38063013021): 83/83 PASS.
- QA matrix remains `qa/25_SANDBOX_COURSE_E2E_MATRIX_2026-10-09.csv`, 0/25 independently verified.

### Independent QC conclusion
This preflight confirms safe work has advanced without connecting any live checkout. **There is no completed sandbox purchase-to-course-fulfillment test.** Independent QC cannot grant a release pass from static analysis, isolated negative database checks, ZIP integrity, or prior paid Stripe Sessions.
