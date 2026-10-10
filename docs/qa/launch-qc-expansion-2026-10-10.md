# CivicAscent AI | Launch QA expansion and payment-access gate
Date: 2026-10-10
Scope: isolated review branch `qa/tooling-review-playwright-20261010`; no production changes.

## Evidence and accomplished work
- Playwright expanded from **9 to 27 checks**, including desktop Chromium, mobile Chromium, and desktop WebKit. Run [#38060917297](https://github.com/civicascentai-ui/civicascentai/actions/runs/38060917297) reports **27 passed**.
- New checks validate Spanish-language preference persistence, prefers-reduced-motion handling, inert/Escape menu behavior, seven learning destination links, non-navigating inspection of Stripe purchase CTAs, and horizontally bounded waypoints.
- Five project-local Claude skills passed schema validation in GitHub Actions. This is not proof a live Claude Code session has installed or invoked the upstream third-party plugins.
- GitHub workflow now also runs the **existing Node checkout and learner-access safety suite**. Its final combined run must be logged separately before marking the expansion fully QC-passed.
- The Vercel project APIs reported SSO protection enabled for preview deployments and READY preview artifacts. `READY` does **not** prove protected runtime webhook functionality, authenticated learner delivery, or free tester access.

## Payment-to-materials findings (read-only source inspection)
1. `course.html` contains two hosted Stripe purchase links for the $49 Starter and $129 Facilitator kits. These can be clicked by real users wherever the page is published. They should not be used for automated purchases.
2. `api/create-checkout-session.js` intentionally fails closed, but **it does not disable the separate direct payment links** in `course.html`.
3. `api/stripe-webhook.js` verifies signed sandbox events, retrieves session details and records verified purchase data, returning `delivery: 'pending'`. It is not itself proof of file availability, learner account creation or successful download.
4. `api/course-download.js` contains a separate fail-closed, authenticated private streaming implementation, with a purchase status lookup and final refund/receipt authorization. The implementation is test-gated and requires explicit staging configuration and reviewed private course bundles.
5. `api/learner-entitlements.js` deliberately returns `course_access_enabled:false`. This is honest purchase-status display, not course access.
6. `qa/COURSE_ASSET_READINESS_2026-10-09.md` says both advertised SKUs lack reconciled, approved distributable bundles; staging private storage, learner validation and verified physical delivery remain outstanding.

## Launch stop conditions
- **P0: Do not authorize live sales** until users can receive what the landing page promises and get help if payment completes but access fails.
- **P0: Do not count browser smoke or unit tests as 25 sandbox purchases**; real end-to-end evidence remains unverified.
- **P0: No webhook or private download activation** absent documented isolated runtime, protected credentials, paid session and verified-user match, refund/revoke behavior, and private storage ACL tests.
- **P1: Two SKU package manifests** need reviewed actual files, accessibility/copy rights confirmation, version hashes, final licensing, refunds/support copy, and signoff by a real owner.
- **P1: Test authenticated novice learner flow** from sandbox purchase to verified email, entitlement, specific private download, file-open, and refund/revocation.
- **P1: Independent human acceptance** for mobile, bilingual, screen reader and beginner comprehension; automated tests do not replace this.

## Next gated execution
- Confirm a controlled preview runtime with SSO protected; then connect a sandbox-only Stripe webhook and private Supabase staging project using secrets manager and least privilege. Never paste credentials into issues, commits, tests, or public docs.
- Assemble approved Starter and Facilitator packages **privately**; never commit commercial lesson files or donor data to this public repository.
- Execute and reconcile the existing `qa/25_SANDBOX_COURSE_E2E_MATRIX_2026-10-09.csv` with independent customer-facing QC.
- Escalate to president for an explicit **production** launch authorization after the above evidence passes. No such authorization exists in this QA work.

## Evidence index
- GitHub PR #48: https://github.com/civicascentai-ui/civicascentai/pull/48
- 27-check browser run: https://github.com/civicascentai-ui/civicascentai/actions/runs/38060917297
- Existing P0 issue: https://github.com/civicascentai-ui/civicascentai/issues/47
- Existing fulfillment issue: https://github.com/civicascentai-ui/civicascentai/issues/30

All findings are drawn from the isolated repository branch and connected Vercel project metadata, not from a live purchase or an independently verified deployment of paid-course assets.
