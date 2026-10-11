# Course delivery release gate (QA only)

Status: HOLD. This is an acceptance test, not proof of a completed delivery.

## Verified facts (2026-10-11)
- Work-mailbox to kpeters9@gmail.com QA status email arrived in recipient Inbox.
- Customer reports no actual course download email arrived.
- QA delivery function v8 only streams private `course-qa-private/{product}/README.md` and labels it `placeholder-not-course`.
- Starter TEST checkout email on record is `jkpeters9@gmail.com`, distinct from requested destination `kpeters9@gmail.com`.
- Download ledger `sent` means a QA placeholder stream completed; it does not verify email or complete course receipt.

## Required repair sequence
1. Identify and approve complete Starter and Facilitator course artifacts, with manifest, size, SHA-256, version, learner instructions, and release owner signoff.
2. Upload artifacts into private storage. Keep public access disabled. No plaintext secrets in GitHub.
3. Replace README-only behavior on QA branch/QA endpoint, maintaining verified learner JWT, verified-email paid entitlement, storage privacy, size limits, stream-failure handling, and no-store response headers.
4. Verify the original purchaser's identity before any entitlement email change. Never treat receipt of a generic email as proof of ownership or silently copy entitlement between addresses.
5. Exercise one authorized TEST purchase to complete file download; verify local filename, archive contents, checksums, course completeness and learner access. Confirm independent receipt, not only server `sent`.
6. Negative tests: missing/wrong learner, wrong product, refunded/reversed entitlement, replay, delayed webhook, cancellation, duplicate events, expired token, broken download, and retries.
7. Run 25 distinct sandbox purchase-to-real-course cases with unique checkout IDs and independent QA evidence. No live charges.
8. Obtain human release approval before changing production. Maintain HOLD otherwise.

## Reporting rules
- Email route: PASS.
- Placeholder stream: QA-only technical observation, NOT course fulfillment.
- Complete course receipt: FAIL / not received as reported by recipient.
- Independent 25-case E2E: 0/25 verified.
- Production: HOLD.


## Independent October 11 verification addendum (read-only)
- **Public information course:** `https://civicascentai.com/course.html` returns HTTP 200. Paid options remain "Ask About Availability" and **paid enrollment remains paused**.
- **Free starter + learner page previews:** QA deployment `dpl_6zcy211WWhXZaD8eTiKBCeKd2kgr` serves `free-ai-starter.html`, `learner-interest.html` and `learner-questions.html` with HTTP 200. Free Payhip link `https://payhip.com/b/MYWad` is a separate $0 sample, not full course access or purchase.
- **Audio assets:** public `assets/audio/lesson-1.mp3` through `lesson-5.mp3` each returned HTTP 200 and audio content type. Response availability does not establish listening comprehension or purchased-kit delivery.
- **Latest GitHub QA branch:** `bad94a1af459cdeec9786b3a26f11725b5ff3053` passed 6 triggered workflows, including learner-interest (the earlier 6/8 failure in run `38164653636` is stale for this latest branch). Independent server-side receipt remains untested.
- **Private Storage inspected:** `course-qa-private` bucket has exactly `starter/README.md` and `facilitator/README.md`; **zero approved commercial course ZIPs**. The legacy QA Edge function v8 streams README-only placeholders and returns `X-CivicAscent-Artifact: placeholder-not-course`; it must not be counted as buyer fulfillment.
- **Separate sandbox draft classroom exists:** Supabase Edge function `qa-level1-classroom` v3 contains four Level 1 internal-review draft sections and requires verified Supabase identity + active sandbox entitlement. These draft sections are **not the approved packaged Starter or Facilitator offering** and are distinct from private-storage course ZIP fulfillment.
- **Source material located:** connected Drive has `CivicAscent AI Level 1 — Prompting Fundamentals` (`1ism2h4PCvf8ikhWGaaTNfykbh5s-DBSplcyO-Qdwhts`), `Student Worksheet` (`1ROwUCsZRASxk_bRvzMS01TgFFYlZWg4OMWgAlTEsxeY`), and `Facilitator Demonstration Kit v1` (`1PtIKd0w3jDjyzn5RrIh3UtY3QStc19VKt7fSLTBiK6M`). Demonstration kit is marked ready for internal use/partner demo, not approved for self-service commercial sale. Further content approval is required.
- **Outstanding E2E:** 0/25 independently verified genuine purchase→approved-course receipt/open cases. Do not bypass Supabase email verification or entitlements. Do not spend funds, open paid enrollment, or promote QA changes until explicit release gates pass.
- **Sam QA Runner:** located Replit `2bcb4253-4457-48b7-84ea-9e185b577ce2`; its prior local sample classroom and mock checkout checks are **synthetic**, not CivicAscent external course E2E. An isolated read-only external link/asset QA enhancement was requested; do not mark its new checks PASS before readback evidence.

**Owner decision required before launch:** approve versioned Starter and Facilitator commercial course bundle(s) after QC; verified purchaser must complete authentic email sign-in and independently open exact artifact; QA must verify entitlement, refund/wrong-account behavior and 25 distinct end-to-end cases. As of this addendum, **production PAID RELEASE = HOLD**.
