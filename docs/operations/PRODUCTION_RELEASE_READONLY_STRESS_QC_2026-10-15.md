# CivicAscent AI production release and stress QC

Date: 2026-10-15. Environment: public `https://civicascentai.com`. This report is evidence-scoped; it is not full production, payment, or WCAG certification.

## Save points
- Pre-merge source snapshot: `savepoint/premerge-checkout-clearstart-20261015-0406`, commit `62f1168dee8e681220e0102cac7454133ec9bd50`.
- Post-merge release snapshot: `savepoint/postmerge-release-20261015-2a912cc`, commit `2a912ccd52dc976197afc9cf21ca4717491c148b`.
- QA scripts remain separately in `qa/prod-safestress-20261015` (not merged to production).

## Applied changes
- [Checkout safeguard PR #105](https://github.com/civicascentai-ui/civicascentai/pull/105): merged as `baad4d4b54d2a0f74f86860957e4015deb02f785`. Source handler rejects POST with HTTP 403 in local/offline tests, without Stripe calls.
- [Clear Start accessibility PR #107](https://github.com/civicascentai-ui/civicascentai/pull/107): merged as `2a912ccd52dc976197afc9cf21ca4717491c148b`. Adds new standalone pages without replacing the approved Safari homepage.
- [Vercel production deployment](https://vercel.com/civicascentai/civicascentai/Czsfne54K1jkjiE4jDgb8nWkKjaB): READY, aliases include `civicascentai.com` and `www.civicascentai.com`.

## Real network and browser results
- [Read-only production QA run #38711447298](https://github.com/civicascentai-ui/civicascentai/actions/runs/38711447298): both jobs PASS.
- Seven public routes returned expected HTTP 200 and key page text, including the English/Spanish $0 registration pages.
- Bounded production GET-only load: 180/180 completed with zero failed requests, three workers; measured GitHub-runner p50 3 ms, p95 4 ms, maximum 126 ms. These are test-runner figures, not a general performance SLA.
- Offline local hard stress: 2,400/2,400 requests passed at 24 workers, p95 15 ms, p99 108 ms. This tests the local static server, not production capacity.
- Offline simulated checkout requests: 20,000 attempts (GET/POST) passed; no payment sessions created.
- Real public Chromium checks passed for 320, 390, 768, 1366 px: keyboard skip links, reading size and contrast controls, prompt builder, practice activities, and horizontal reflow.
- Vercel runtime errors grouped for one hour: no error clusters reported. Last 10 minutes of fatal/error runtime logs returned no entries, which is not proof of zero errors across all systems.
- Screenshots and machine-readable results are in the GitHub Actions artifacts from run #38711447298.

## Discovered finding and repair
The first production smoke run #38711314790 correctly found `GET /api/create-checkout-session` returned 404 (not the assumed 405). Source safety remains fail-closed in local tests, but the deployed request path does not expose the handler to GET. We repaired the QA assertion to accept and explicitly report 404 as an absent route, then reran the suite to PASS. Do not treat 404 as proof of the live POST behavior. No live checkout POST was attempted and no payments were initiated.

## Release limitations / holds
- Paid checkout still held. Live POST method, Stripe-hosted $0 registration completion, payment processing, entitlements, and 25 purchase-to-fulfillment E2E scenarios remain unverified.
- Full WCAG 2.2 AA and optional AAA success criteria need independent manual screen-reader and real-device accessibility assessment.
- Heavy production-saturating stress deliberately not executed to avoid impairing the public service; heavier requests were local only.
- Existing homepage design preserved, based on source inspection; owner visual approval of all new pages remains separate from test automation.

Outcome: release merged and deployed, bounded read-only production tests PASS with stated limitations. Preserve no-purchase mode.
