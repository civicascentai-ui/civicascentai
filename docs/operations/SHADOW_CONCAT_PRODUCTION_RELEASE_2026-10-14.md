# CivicAscent AI | Shadow House Concat production-lane release evidence

**Recorded:** 2026-10-14 UTC
**Owner instruction:** "Move to production and confirm good."
**Deployment target:** GitHub branch `production/shadow-concat-20261014`, isolated from the live website and the `main` branch. This is production **source and verified GitHub Actions execution lane** only. It is NOT a persistent running agent, a device install, a customer video service, or a website deployment.

## Verified production-branch release gate
- Status **PASS**: https://github.com/civicascentai-ui/civicascentai/actions/runs/38593079881
- Production CI job 115952735492: all steps completed successfully.
- Official upstream Concat v0.2.7 Linux x86_64 AppImage: SHA-256 verified `3f4a4afe9e42b3ad40241a978cca96a9710ac3545b6a44220a3c65a79bc5f16f`.
- SAM connector tests: **18/18 PASS** including command allowlist, token handling, sandbox controls, traversal/symlink rejection and no-overwrite.
- Genuine Concat media workflow on an ephemeral GitHub-hosted runner: synthetic file created, project created, imported, edited on timeline, exported playable H.264 MP4.
- Final synthetic file: 160x90 pixels, 24 frames, 1.00 seconds, 19,695 bytes; SHA-256 `47bb6acae28890dd87e79074e8d7c541c5dee0acff7dca88069c4aeb2cc41791`.
- Evidence GitHub Actions artifact ID **11907599855**, name `shadow-concat-production-evidence`, 7-day retention.
- Run config: `.github/workflows/shadow-concat-production-verify.yml` (isolated production branch).

## Intentionally not activated
- Concat registry: `enabled=false`, `automatic_dispatch_allowed=false`, `production_access=false`, `social_publishing_allowed=false`.
- No client media, credentials or production accounts used. No live services or subscriptions activated, no paid model APIs, no purchase, no publication.
- Website STOP stands. Website source/deploy/QA not changed, and Concat was not merged to `main`, where a push would trigger existing unrelated website QA.
- The hosted CI runner is disposable. Finishing a runner test does NOT mean the Concat service is available continuously.

## Release readiness still outstanding
- Actual intended-device install and usability, including Android.
- Automatic captioning, Spanish subtitle accuracy, accessibility, keyboard/touch checks, motion/reduced-motion and independent FRIDAY/human QC.
- Verified always-on Shadow House agent runtime, controlled production credentials, monitoring and recovery. No assertion that CODI/SAM/FRIDAY/SCOUT agents were remotely executed as independent workers.
- Approval required for customer files, public publishing or moving into an approved persistent host. This report does not waive the security and accessibility release gates.

## Recommended operational status
**Restricted production source lane: VERIFIED. Full customer-facing production: HOLD.**
This is the maximum verified, zero-cost, non-website release supported by the present tests and environment.
