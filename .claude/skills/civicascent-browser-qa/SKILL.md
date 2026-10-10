---
name: civicascent-browser-qa
description: Run and assess CivicAscent AI QA-only browser checks for keyboard navigation, mobile and WebKit behavior using isolated Playwright tests.
---

# CivicAscent browser QA

This skill wraps the existing locally tested Playwright smoke harness. It does not conduct Stripe payments or guarantee production readiness.

## Procedure

1. Verify you are on a QA branch and that no customer credentials or private data are exposed.
2. From the repository root, use `cd e2e && npm install --ignore-scripts --no-audit --no-fund && npx playwright install chromium webkit && npm test`.
3. Run tests against the local server at `127.0.0.1:4187` only. Do not change the base URL to a production domain.
4. Review named results for desktop Chromium, mobile Chromium, and WebKit; capture exact failures with traces/screenshots when available.
5. Create focused regression tests for new defects and rerun the suite.
6. Attach the GitHub Actions run ID, test counts, and clear limitations to the QA record.

## Boundaries

Do not load payment secrets, submit a real checkout, or infer the required 25 sandbox purchases from browser smoke results. Continue to respect production HOLD.
