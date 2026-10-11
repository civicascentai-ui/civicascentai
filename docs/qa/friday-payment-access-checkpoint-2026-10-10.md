# Friday QA | Payment-to-access checkpoint (2026-10-10)

**Approval:** QA only, $0 new spend, no live payments, no production deploy. Production release: HOLD.

## Completed and verified

- Corrected checkout's optional Link sign-in interference with `wallet_options.link.display = 'never'` in the QA-only API. A new Stripe sandbox Starter session accepted this option; session remains open and **unpaid**, so it does not establish a purchase. Unsupported headless interaction with Stripe-hosted card fields was removed.
- Ran reversible **real PostgreSQL staging database** transaction with: incorrect-price rejection, valid synthetic paid entitlement, recorded issued download, receipt marked `sent`, full refund/revocation, and confirmed refusal of new downloads after refund. The entire transaction was **rolled back**, leaving no fixture sales.
- Fixed QA learner page so it supports Supabase's default **magic-link** flow as well as an emailed numeric code when the OTP email template has been customized. The page requests the same-origin `redirect_to`, immediately removes returned bearer tokens from the location fragment, verifies each token via `/auth/v1/user`, and continues to require a paid product-specific entitlement. Tokens remain in page memory, not browser storage.
- Current protected Vercel QA preview `https://civicascentai-launch-j5qg7iv32-civicascentai.vercel.app/qa/learner-access.html` returned HTTP 200 with the new magic-link handler and OTP callback logic.
- GitHub QA branch `qa/friday-secure-delivery-20261010`: Friday delivery-security [#38102855443](https://github.com/civicascentai-ui/civicascentai/actions/runs/38102855443), checkout API [#38102855442](https://github.com/civicascentai-ui/civicascentai/actions/runs/38102855442), and webhook safeguard [#38102855468](https://github.com/civicascentai-ui/civicascentai/actions/runs/38102855468) each passed.
- Verified Supabase QA staging remains healthy, private storage bucket remains nonpublic, and no commercial course ZIPs are in storage.

## Remaining actual delivery blockers

1. **Auth redirect allowlist**: Supabase's default magic link redirects only to configured Site URL/additional redirect URLs. The management connector does not expose those Auth URL settings, so this preview's redirect allowlist has not been verified. Configure a *stable QA-only domain*, then explicitly allow `/qa/learner-access.html` within **Supabase QA staging** Auth URL Configuration, without opening production or removing SSO; do not assume each transient Vercel deployment domain is automatically allowed.
2. **Auth Email template**: Supabase documents that `signInWithOtp` sends a magic link by default; numeric codes require a Magic Link email template using `{{ .Token }}`. The UI now accommodates either. The current template/delivery is unverified.
3. **Real test buyer**: No verified Supabase Auth account yet matches an actually paid sandbox order. An existing paid staging fixture used an undeliverable `example.invalid` address. Avoid fabricating identity evidence or posting OTP codes/tokens in GitHub, chat or logs.
4. **Actual file transport**: Storage contains two internal `README.md` placeholders; no commercial package has been approved/uploaded. A QA README stream requires a real authenticated buyer before being marked successful.
5. **25-case acceptance**: remains 0/25 fully verified; rollback tests and unit tests do not count as paid-to-file transactions.
6. **Vercel build**: individual preview builds have varied by commit and free-plan rate limits. The magic-link UI was verified on one READY protected QA preview, but the newest PR commit and all storefront pages must be checked independently before tester use.

**Next valid acceptance check:** A designated tester completes only a Stripe TEST-mode purchase, then uses the same reachable test mailbox's magic link/code. Confirm the signed webhook/paid record, authenticated private QA placeholder response, `sent` receipt, and refund/revocation. Do not release the paid Starter or Facilitator products until course ZIP contents and license/refund/support documents receive approval.

**Sources for technical requirements:** https://supabase.com/docs/guides/auth/auth-email-passwordless and https://docs.stripe.com/automated-testing

This document records executed read-only checks and the staging database rollback transaction; it is not a production-ready signoff.
