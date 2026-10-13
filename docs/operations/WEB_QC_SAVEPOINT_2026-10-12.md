# CivicAscent AI | Website Technical Repair Savepoint
- Baseline: production-main commit `647522cc23c6490606b491233c54845142107bd9` (2026-10-12)
- Branch: `repair/web-release-audit-20261012`
- Scope: additive technical SEO and accessible error handling. **No Safari artwork/layout replacement or paid checkout activation.**
- Added homepage Open Graph/Twitter metadata pointing to an existing, live-verified 200 WebP asset. Social crawler rendering still requires real-share validation.
- Added robots.txt and sitemap.xml for public routes. Excluded experimental preview pages and noncustomer source directories.
- Added custom 404.html with keyboard-accessible recovery links and reduced-motion accommodation.
- Added standard-library source QC tests and a PR workflow.
- Added explicit legal policy information checklist; **privacy policy and terms remain not published and not signed off.**
- Remaining blockers: actual mobile visual QC and Safari recovery PR #69 film/rights, legal-approved privacy/terms pages, endpoint/form validation and spam tests, page speed and contrast, paid checkout fulfillment and independent test purchases.
- Release rule: neither this branch nor PR #69 may be merged into production before their applicable review gates and owner release approval.
- Rollback: don't merge, or revert this single branch commit if merged later.

## Second repair (2026-10-12, review-only)
- Homepage free-guide CTA now links to the real `free-ai-starter.html`, English and Spanish-labelled routes.
- Consultation page uses the business inbox `civicascentai@gmail.com` already used by contact and interest pages; does not assume an unverified domain-alias mailbox works.
- Added source regression checks and offline Chrome responsive smoke testing at 320, 375, 390, 430, 768 and 1440 px for homepage, consultation and 404, with screenshots retained in workflow artifacts.
- QA screenshots need human/independent visual interpretation; geometry checks are not film/background aesthetic approval.

## Reduced-motion flash repair (2026-10-12)
- Independently reviewed GitHub Action screenshots displayed a washed-out homepage at load even with reduced motion requested.
- Root cause: startup animation used the `finish()` elapsed-time shortcut, which still triggered the `.flash.fire` whiteout. Reduced-motion CSS did not disable flash.
- Added both JS guard `!reduced` and CSS `.flash{display:none!important;animation:none!important}` in reduced-motion mode.
- Browser QA now asserts the flash overlay cannot appear in reduced-motion mode at all test viewport widths. Film-first Safari recovery PR #69 remains a separate design release.
