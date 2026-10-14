# Concat (formerly WolfCut) | isolated beta software smoke check
**Date:** 2026-10-14 UTC. **Status:** Bounded GUI startup smoke VERIFIED; full CivicAscent operational QC NOT APPROVED.

## Scope and execution
- Product: Concat v0.2.7 AppImage (Linux x86_64), from the upstream official GitHub release.
- Tested: **actual upstream packaged binary** inside a disposable standard Ubuntu GitHub Actions runner, not a mock or locally compiled substitute.
- Release file digest and checksum: SHA-256 `3f4a4afe9e42b3ad40241a978cca96a9710ac3545b6a44220a3c65a79bc5f16f`, verified with `sha256sum -c`.
- Version command printed `concat 0.2.7`. `--smoke` under Xvfb exited 0; final log says `smoke: ok`.
- GitHub run: https://github.com/civicascentai-ui/civicascentai/actions/runs/38572116137
- Run ID: 38572116137. Job ID: 115879732223. Artifact: `concat-smoke-38572116137`, artifact ID 11897903377, retained 1 day.
- Downloaded ZIP of raw checksum, version, smoke logs and receipt SHA-256: `6cd56cba2b3579f2c84415c8fd26e880428510a6635be7c2157eabff4d00a8fc`.
- JSON execution receipt reports exit_code 0 and stage completed. I independently opened the artifact ZIP and compared receipt, logs, and job status.
- Cost control: GitHub public repository standard hosted Linux runner, which GitHub lists as free; no Replit or paid AI provider invoked. No account billing ledger checked.

## Independent evidence review: issues not hidden
- Headless Linux runner: no GPU adapter, CPU compositing fallback.
- No audio device, ALSA warnings. This is not a test of audio playback.
- 32 first-run effect preview card image errors (No such file or directory). The startup procedure completed anyway. Treat as a user-experience risk to test on real hardware; do not silently declare it fixed.
- This is **not** a video import/edit, final export, transcription accuracy, Spanish captions, keyboard/accessibility, Android, offline network-privacy proof, or API/MCP command authorization test.
- FRIDAY autonomous instance has NOT independently executed; this report is CODI's independent log readback, not a FRIDAY sign-off.

## Controls and next gate
- Keep Concat `enabled=false` and agent auto-dispatch disabled.
- SAM: device-level sample import, edit, two-format export, validate playable result and watermark absence, local-only test with synthetic media; check any preview-card failures.
- FRIDAY: independent sample export QC, accessible captions, keyboard/touch and Spanish tests, and privacy/no-network behavior. Keep actual human review separate from SAM's implementation.
- CODI: only authorize internal video-production use once sample deliverables and independent QC evidence are present. No automatic outreach or publishing.
- $0 new cost; no production, payment, social accounts, or website editing. **Website STOP preserved.**
