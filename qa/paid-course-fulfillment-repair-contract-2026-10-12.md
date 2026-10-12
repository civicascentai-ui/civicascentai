# QA-only paid course delivery repair checklist | 2026-10-12
STATUS: NOT IMPLEMENTED, release HOLD.
1. Confirm approved complete Starter and Facilitator files; record manifest with SHA256, size, content inventory and accessibility approval in private storage.
2. Verify Stripe TEST signed webhook raw body, expected product/price/currency, unique event idempotency and matching verified purchaser identity. Reject redirect-only, unpaid and mismatched requests.
3. Serve only the manifest-approved private full course, never the QA README placeholder. Require verified session, matching paid entitlement and no refund/reversal before every download.
4. Use private no-store responses, safe filenames and explicit allowed CORS origins/visible download headers. Never expose bearer links or secrets.
5. Run actual TEST checkout, mobile and desktop file-open checks, negative auth/product cases, duplicate/delayed webhook, refund revocation and retries. Record 25 independent paid E2Es; currently 0/25 verified.
6. Preserve paused paid enrollment and production HOLD until evidence, independent QC and owner signoff. Free Payhip flyer is not a paid course test.