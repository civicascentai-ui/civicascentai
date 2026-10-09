# Learner Access UI — QA Activation Gate

Status: source-complete, disabled by default, not deployed, not acceptance evidence.

Implemented on the QA branch:

- English/Spanish learner sign-in and purchase-status page (`learner-access.html`).
- Server-mediated Supabase passwordless request; `create_user:false` prevents self-enrollment.
- Generic response for known and unknown email addresses.
- Access token retained only in tab-scoped session storage and removed from the URL fragment.
- Download button appears only for a `sent` entitlement and an explicit test-mode delivery flag.
- No Supabase service-role key, private object URL, checkout session identifier, or reusable storage link reaches the page.

Required before preview activation:

1. Use an isolated Supabase staging project; apply and independently review the staging-only schema and restricted RPC grants.
2. Provision approved test learners deliberately, configure the exact preview redirect allowlist, and keep account creation disabled.
3. Upload approved Starter and Facilitator release bundles to a verified private bucket; record immutable checksums and approved object mappings.
4. Configure preview-only secrets and flags. Keep `COURSE_ACCESS_UI_ENABLED` and `COURSE_DOWNLOAD_ENABLED` false until the private-storage, refund and receipt checks pass.
5. Register a Stripe TEST webhook against the preview endpoint and verify the signature, event ordering, idempotency, refund/dispute hold and recovery paths.
6. Complete 25 distinct sandbox payment-to-file-open traces under the acceptance matrix. Mocked unit tests do not count.
7. Complete human Spanish, accessibility/screen-reader and independent tester acceptance. Source copy is not human validation.

The public site and live Stripe links were not changed by this work.
