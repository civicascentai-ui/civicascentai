# Sam follow-up: feature language QC
October 10, 2026, America/Chicago.

## Outcome
Four demo pages now synchronize document language with EN/ES selection. Remaining English scene examples, help text and AI Lab navigation explicitly declare English; the Spanish translation example explicitly declares Spanish. These changes are saved on draft PR #44; no merge or production deployment was requested or performed.

Reviewed starting revision: 029c6a16746fd4eaabde2f88fd24fa8c2de05a3b.
Final application revision: 06e714e68bb880d6a50ea84f6d281f81a062916f.

## Verification
`node ops/site-qc/test-feature-language.cjs`: 4/4 passed.
The test runs each actual inline script with a minimal DOM fixture, checks EN→ES→EN document metadata, checks fixed English passage markers, and invokes load/timer callbacks to confirm no audio is triggered on initialization or language selection.
Independent QC reviewed all four candidate files and passed the behavior checks. It found the Spanish example inherited English; CODI corrected the example's metadata and reran the four checks, with an additional static assertion for that example.

## Open findings
- All eight media URLs contain expiration metadata dated September 28–29, 2026. Offline inspection establishes expired metadata, not the server's current response. These cannot be counted as verified durable playback. No replacement audio was located in two focused saved-file searches; that does not prove none exists.
- Browser playback, layout, accessibility-tree and mobile behavior remain unverified. Local Playwright was available but its Chromium executable was absent. No paid runtime was started.
- These pages remain partly translated; metadata now accurately distinguishes the retained English passages.
- Payment-to-course fulfillment, refunds, recovery and 25 completed purchases were not exercised by this follow-up. Production launch remains HOLD.

## Sources
[Saved application](https://github.com/civicascentai-ui/civicascentai/tree/06e714e68bb880d6a50ea84f6d281f81a062916f)
[Regression check](https://github.com/civicascentai-ui/civicascentai/blob/dfc54557aac77492cbc705fa695814546306b15e/ops/site-qc/test-feature-language.cjs)
[Draft PR](https://github.com/civicascentai-ui/civicascentai/pull/44)
