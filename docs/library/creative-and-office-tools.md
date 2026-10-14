# CivicAscent AI Tool Library: Craft series and ONLYOFFICE

Status: Approved for internal evaluation and use within free tiers. Owner instruction: add both Craft series and ONLYOFFICE to CivicAscent library (2026-10-12).

## ONLYOFFICE Documents (Android)
- Category: office productivity; document, spreadsheet, presentation and PDF review/editing.
- Mobile installation: owner-confirmed on Android 2026-10-12.
- Basic QC: DOCX open/edit/save/reopen passed (save/reopen owner-confirmed); XLSX and PPTX sample opening owner-confirmed; PDF sample rendering screenshot-confirmed. See issue #58.
- Use cases: CivicAscent workbooks, course handouts, proposals, slide decks, spreadsheets, PDF review.
- Official Android link: https://play.google.com/store/apps/details?id=com.onlyoffice.documents
- Caveat: actual CivicAscent Veterans workbook, advanced formatting, XLSX/PPTX editing and PDF forms not yet independently QA-approved.

## ArtCraft / Craft series
- Category: open-source creative production and asset editing.
- Owner reports Craft series already added; preserve existing setup. No fresh installation or functional verification in this entry.
- Screenshot identified ArtCraft website advertising PhotoCraft and VectorCraft; other Craft tools/features require separate availability and licensing verification.
- Intended uses subject to feature verification: logos, flyers, graphics, vector assets, course visuals.
- Do not claim Word/Excel/PowerPoint equivalence or production readiness without hands-on QA.


## WolfCut (renamed Concat): free local video editor
- Added to inventory: 2026-10-14 at owner's instruction to add only if free.
- Status: **REGISTERED FOR EVALUATION ONLY**. No installation, remote agent connection, paid subscription, video edit/export, or runtime deployment verified. This entry does not approve external/public use.
- Source and releases: https://github.com/jub0t/Concat and https://github.com/jub0t/Concat/releases ; official site https://concatenate.pages.dev/
- Verified pricing (official upstream README, checked 2026-10-14): free and open-source; no subscription, paid tier, mandatory account, or watermark. Optional sponsorship links are NOT required and MUST NOT be used.
- License: GNU Affero General Public License v3 (AGPL-3.0-or-later) in upstream LICENSE. Ordinary local editing is a candidate use; before modifications, embedding, redistribution, or network-hosted deployments, perform a separate license review (do not treat this entry as legal advice).
- Platform claims: Windows, macOS, Linux and Android supported by upstream; the application is in **beta**. Actual compatibility with CivicAscent devices and safe/accessible editing/export remain untested.
- Potential CivicAscent uses: captioned course explainers, short-form educational outreach, accessible training demonstrations, local-only video editing. No permission to publish or contact audiences.
- Automation potential: upstream advertises CLI, JSON-RPC, gRPC and MCP integrations. **Integration NOT enabled.** Do not grant production, customer, payment, email, social or private-file credentials; only isolated synthetic/non-sensitive input after QC approval.
- Ownership: SCOUT verifies version, download integrity and free status; SAM checks isolated compatibility and API risk; FRIDAY independently tests captions, keyboard/touch usability, Spanish, reduced-motion suitability, watermarks, offline/privacy claims and export before operational approval; CODI manages approval and evidence.
- Exit gate: confirmed $0 incremental cost + legitimate checksum/release source + local smoke-run + independent QC evidence + license/security review if distributing/modifying software. Hold if any test fails.
- Website work remains STOPPED; no build, QA, modification, release, or deployment of website as part of this entry.

## Operational rules
1. Zero-dollar incremental budget: no paid plan, auto-refill, premium service, or subscription without separate explicit authorization.
2. Treat this as a *tool inventory*, not a deployment, automatic integration, or license grant. No software is installed by this GitHub record.
3. Keep child school/health records out of CivicAscent repositories and public assets.
4. Protect signed PDFs: do not modify originals or invalidate signatures.
5. Before distributing customer-facing materials, perform format, accessibility, disclaimer, privacy, and independent QC review.
6. Tool ownership: operations maintains inventory; QC records actual tests; creative team may use verified features.

Related tracker: https://github.com/civicascentai-ui/civicascentai/issues/58
