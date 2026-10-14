# Concat / WolfCut Shadow House: implementation record
Date: 2026-10-14. Owner requested continued implementation. Status: staging only; live use held.

## Accomplished
The Concat v0.2.7 Linux AppImage official SHA-256, version and GUI initialization already passed on GitHub Actions run 38572116137. That was not a video-export, captions or Android test.

This stage adds tools/concat_bridge/bridge.py and a separate executable safety test suite. Python standard library only: no paid AI APIs and no Replit. Concat must be installed and its Local API explicitly enabled by the operator before a real connection is possible. The adapter does not toggle the app settings or start any service.

## Standing controls
1. TCP endpoint is restricted to 127.0.0.1; external hosts cannot be configured.
2. Reads require locally supplied CONCAT_API_TOKEN; no key is written to GitHub.
3. Default read methods are version and catalogue.list only.
4. Exports are blocked unless a caller explicitly creates a bridge with allow_export=True AND supplies a pre-existing project and destination confined to a dedicated sandbox root. Never overwrite files.
5. No operation here permits payments, publication, email, external outreach, website QA or deployment.
6. No customer/private media is placed in this public repository, CI log, or artifact.
7. The website STOP and $0 incremental-cost rule remain unchanged.

## Independent verification and scope
The isolated GitHub Actions workflow exercises fake local JSON-RPC, authentication rejection, event handling, write denial, remote-host denial, path traversal/symlink denial, overwrite denial, and default export prohibition. These synthetic checks do NOT prove Concat can render media, transcribe captions, operate on Android, or accept the exact export request.

## Gates still open
- Real Concat local API handshake with one disposable non-sensitive project.
- Actual Concat media import/edit, MP4 export, replay and no-watermark evidence.
- Accessibility including keyboard navigation, captions and Spanish output, Android device compatibility.
- Independent FRIDAY functional review against real outputs.
- Do not enable unattended Shadow House dispatch, private documents, or external posting until evidence-based approval.
