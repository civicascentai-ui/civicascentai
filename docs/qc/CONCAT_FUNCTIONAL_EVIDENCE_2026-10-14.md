# CivicAscent AI: Concat/WolfCut functional QA evidence
Verified 2026-10-14. Scope: isolated, synthetic only. Website STOP preserved; $0 new-cost rule.

## Tests actually executed
1. Official upstream Concat v0.2.7 x86_64 AppImage SHA-256 digest verified, GUI --version/--smoke passed on isolated GitHub Actions run 38572116137.
2. Eighteen adapter safety contract tests passed on GitHub Actions run 38579890481: loopback-only, token auth failure, read-command allowlist, export-default-deny, sandbox/path traversal/symlink, overwrite protection. These eighteen use a mock API and are NOT media tests.
3. Actual Concat v0.2.7 API 0.2 read-only handshake passed against the installed official AppImage, real wrong-token rejection verified, real catalogue.list response received (an array, not an object) on run 38577200980.
4. Actual synthetic video import/edit/export: GitHub Actions run 38578849624 concluded success. Upstream AppImage hash rechecked; synthetic ffmpeg testsrc2 clip generated, a Concat project created, original clip imported, a timeline clip inserted through the actual local JSON-RPC API, and H.264 output generated. Output is a playable 1.00-second 160x90 MP4, 19,695 bytes. SHA-256: 47bb6acae28890dd87e79074e8d7c541c5dee0acff7dca88069c4aeb2cc41791. GitHub artifact id 11902711641 contains receipt.json and rendered-synthetic.mp4 (2-day GitHub retention).
5. Independent second-runtime inspection: downloaded artifact, verified SHA-256 matches saved receipt, ffprobe identified H.264 160x90 and 1.0 s, ffmpeg decoded 24 frames successfully. Pixel variance on first frame 12952.80 and mean first/last frame difference 32.32; not a blank/static fake. Re-created the same original testsrc2 source independently, and FFmpeg SSIM on source vs Concat output yielded 0.947690 (process exit 0). These constitute machine-based independent QC, NOT a FRIDAY external human test.
6. Earlier engineering failures resolved: missing ffmpeg binary on GitHub standard runner (installed free distribution package); headless video did not become playable without the free Mesa Vulkan software graphics driver. Corrected workflow reran successfully.

## Evidence anchors
- Official repository: https://github.com/jub0t/concat
- GUI startup: https://github.com/civicascentai-ui/civicascentai/actions/runs/38572116137
- Connector controls: https://github.com/civicascentai-ui/civicascentai/actions/runs/38576350350
- Actual API: https://github.com/civicascentai-ui/civicascentai/actions/runs/38577200980
- Actual synthetic import/edit/export: https://github.com/civicascentai-ui/civicascentai/actions/runs/38578849624
- Isolated source: tools/concat_bridge and .github/workflows/concat-*.yml on branch operations/zero-cost-concat-review-20261014


## Post-hardening regression: verified
- Corrected a real security weakness: the Python bridge's internal _request method previously did not enforce the public method allowlist. The socket-layer authorization now restricts direct calls as well, including project creation, media import, sample timeline edit and export. Invalid method/arguments, sandbox escape and bypass attempts fail closed.
- GitHub Actions run 38579890481: 18/18 tests PASS, including four new adversarial command-bypass tests. https://github.com/civicascentai-ui/civicascentai/actions/runs/38579890481
- GitHub Actions run 38579979334: full real import, timeline edit and H.264 export PASS again using the HARDENED bridge. 160x90, 1.00 s, 19,695 bytes, SHA-256 47bb6acae28890dd87e79074e8d7c541c5dee0acff7dca88069c4aeb2cc41791, same independently decoded media signature. https://github.com/civicascentai-ui/civicascentai/actions/runs/38579979334
- These tests are on an isolated branch and short-lived GitHub hosted public repository standard runner. No paying for a provider, no production installation, no website changes.

## Release HOLD
The connector is staged in a separate repo branch; automatic dispatch, production publishing, website access and user device installation remain OFF. No Replit, payment, external message, social post, or website development/QA/deployment. Neither this result nor the tool inventory alone proves agents are running without supervision.

Unverified: live Android app installation and support; real user editing workflow; caption recognition quality; Spanish subtitles; accessible controls/contrast/large text/reduced motion; no-watermark across real projects; optional local model storage/network behavior; independent FRIDAY/human approval; any autonomous always-on agent. Do not label these passed. Any AGPL distribution/embedding obligations need review before broader deployment.

## Follow-up QA owner roles
SAM: harden command method isolation and validate real sample project on actual intended user device.
FRIDAY: independent accessibility/caption/Spanish/Android checks with separate evidence.
SCOUT: monitor upstream versions and free status, recommend updates only after review.
CODI: maintain branch isolation, evidence scoreboard, owner release gate. No website work.
