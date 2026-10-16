# P0 Issue #22: Disaster-recovery acceptance and safe rehearsal (2026-10-16)

**Scope: CivicAscent AI GitHub Pages public site and Vercel Shadow House.**

This document is an **evidence-backed release and recovery checklist**, not an assertion of complete disaster-recovery acceptance. Approved budget: **$0 additional spend**. Keep public traffic/DNS, Vercel production ignored-build controls, paid checkout, and data stores unchanged unless separately authorized and tested.

## Latest known evidence

| Capability | Exact evidence | Status |
| --- | --- | --- |
| Public production GitHub Pages | Commit `fe50da6dd04762c9cca1d35525f559c7afe8e085`; PR #135 Pages action `38898487114` | Published / smoke verified |
| **NEW retained full current production snapshot** | GitHub Actions [38901152418](https://github.com/civicascentai-ui/civicascentai/actions/runs/38901152418), artifact ID `12046370563`, retention 35 days, FULL code-only production + legacy shadow; independent ZIP/bundle SHA256 + Git fsck and exact SHA checked | **PASS: live `fe50da6` now backed up in a retained GitHub artifact** |
| Preexisting Git-code backups | `.github/workflows/p1-dual-code-backups.yml`, daily 08:17 UTC; last reviewed successful scheduled run `38875404596` before the subsequent merges | Verified **code-only**, freshness to latest SHA unverified |
| Latest code + served-site rehearsal | PR #139 workflow `p0-isolated-code-site-recovery.yml`; ephemeral full Git bundle, `git fsck`, recovered HEAD equals current main, 16 loopback HTTP routes | Automated PASS on tested run, **not durable stored backup** |
| Vercel standby `civicascentai-launch-qa` | Exact-source preview `dpl_3wmTfUoQkzamp9eZVhhdJCtDDTqf` reported `READY` at `fe50da6`; Vercel's protected-login page blocks independent public page smoke; ignore-build suppression restored after launch | **PREVIEW BUILD READY / PAGE QA AND LIVE CUTOVER NOT VERIFIED** |
| Persistent databases/uploads | Supabase RAG Phase 1 Test and Course Commerce QA Staging discovered; live production linkage not established | Protected export and isolated data restore **NOT VERIFIED** |
| Human witnessed timed failover/rollback | No observed authorized traffic switch or return test | **NOT VERIFIED** |

## Newly retained CURRENT production full backup and recoverability (2026-10-16)

The owner authorized the next #22 phase. A **one-time independent full-code snapshot** workflow was added in PR #139 and executed without touching `main`, public DNS, Vercel settings, secrets or databases.

- [GitHub Actions 38901152418](https://github.com/civicascentai-ui/civicascentai/actions/runs/38901152418) **SUCCESS**; `p0-current-full-code-38901152418` artifact `12046370563` (22,285,456 compressed bytes), GitHub artifact retention configured for **35 days**. This is the first independently evidenced **retained** snapshot of **current** production commit `fe50da6dd04762c9cca1d35525f559c7afe8e085`.
- Independently downloaded the ZIP and verified its manifest declares `backup_mode=full`, `scope=git-code-only`, `status=restored-and-verified-git-code-only`; `production-full.bundle` and `shadow-full.bundle` SHA256 both match recorded digests, with bundle sizes 11,202,772 and 11,099,468 bytes, respectively.
- Independently initialized fresh bare Git repositories from each bundled archive; exact Git SHAs equal manifest for both production (`fe50da6`) and **old standby** (`63e1824`), and `git fsck --full --no-reflogs` **PASS** on both.
- From the **actually retained** latest production archive, separately checked out a fresh copy, served it over loopback `127.0.0.1`, and verified **16/16** URLs (13 HTML, 3 CSS/JS) return HTTP 200, including approved homepage, learner rooms, Veterans and Spanish markers.
- **No copy** of database rows, uploads, environment variables or protected settings is in this snapshot. It is time-limited GitHub artifact storage, **not** an off-provider protected disaster backup. Do not infer it protects against GitHub provider-wide failure. Future scheduled Mon–Sat incremental and Sunday full archival policy still needs ongoing chain evidence.

### Earlier preview request — blocked before owner-approved temporary build window

- Created GitHub branch `recovery/shadow-source-candidate-20261016` at **exact same code commit** `fe50da6` as current public `main`, independently compared: **identical, 0 commits ahead / 0 behind**. This is **source-code readiness**, not a deployed standby.
- Confirmed connected Vercel team reports **Hobby** plan. Sent **one** isolated deployment request to *shadow project* `civicascentai-launch-qa`, from the pinned candidate source, targeting an unaliased preview (no `production` target, no Vercel project settings override). Result deployment `dpl_2KrAMPXpqvaiY5i3pCGRFy1zf8fm`: **CANCELED** by existing ignored-build step. A canceled deployment is **not** READY and proves **no** failover parity.
- Did **not** disable ignored-build control, change existing domains, checkout, public DNS, database, or production routing. An actual READY standby preview remains gated by controlled review of preview build suppression and guaranteed nonchargeable resource usage.

## Scoped READY Shadow preview — October 16, 2026

Following explicit owner approval (“Go”, confirmed “Yes”), a single new isolated Vercel **preview** was built for the connected shadow project `civicascentai-launch-qa` (team's existing Hobby plan), pinned to the currently published production Git commit `fe50da6dd04762c9cca1d35525f559c7afe8e085`. No public-domain aliases, DNS, production target, checkout controls, data or secret settings were deliberately changed.

**Controlled build-window sequence and exact receipts:**

1. Rechecked both production `main` and the isolated shadow-source branch: **identical** at `fe50da6`.
2. Temporarily allowed a preview build on **the shadow project only** (ignored-build command changed from `exit 0` to `exit 1`, preview-disable switched off).
3. Created one preview deploy `dpl_3wmTfUoQkzamp9eZVhhdJCtDDTqf`, target **preview** (Vercel reports `target=null`, not production), at exact SHA `fe50da6`. Build logs confirm the intended branch and commit, `exit 1` allowed the build, the Vercel output was successfully built and deployed, and deployment API reports **READY**.
4. **Restored** the existing project suppression settings immediately after the build entered BUILDING: `commandForIgnoringBuildStep="exit 0"`; `previewDeploymentsDisabled=true`. Vercel's project-update API confirmed both write requests succeeded. The project API currently omits those flags in its read-only response; their restored values were **not independently read back**. Do not claim subsequent automatic preview builds are disabled based solely on this call if a new contradiction emerges.
5. Verified Vercel reports this preview as latest deployment, its source SHA is correct and the project retains Vercel SSO protection for its previews. An unauthenticated GET showed the **Protected Deployment – Vercel** login page rather than the real website, so **human authenticated route/browser checks remain incomplete**. A Git deployment source-file-list endpoint returned 404 (file tree not available), so the returned build logs are the build verification.

**Disposition:** `SHADOW_BUILD_READY_SOURCE_SHA_MATCHED`; **NOT** full standby restoration or recoverability. No real end-user smoke of the protected preview, full data/config restore, failover rehearsal, or public DNS transition. The earlier canceled request `dpl_2KrAMPXpqvaiY5i3pCGRFy1zf8fm` remains accurately recorded as an earlier attempt, not the final deployment. Keep #22 open, budget policy $0 and public traffic unchanged.

## Read-only static-site rollback rehearsal — verified (2026-10-16)

Following the owner's request to finish outstanding safe recovery work, the draft PR adds `tools/p0_isolated_cutover_rollback.py` to the existing loopback-only recovery workflow. It reconstructs **two release Git commits** from disposable full local bundles, checks `git fsck`, and switches only a Python localhost HTTP-server document-root pointer:

1. Prior successful Pages release `af7edd4fb1be1507542db899611bcb63a207045c`.
2. Current Pages production `fe50da6dd04762c9cca1d35525f559c7afe8e085`.
3. Rollback to prior release `af7edd4`.
4. Recovery/roll-forward to current `fe50da6`.

The [exact-source PR check 38936490722](https://github.com/civicascentai-ui/civicascentai/actions/runs/38936490722) **PASS**: **4 × 16 = 64 HTTP 200 checks**, version-specific SHA header assertions, approved homepage/room/Veterans/Spanish markers and archived JSON receipts (artifact `12060622924`). The measured per-step durations are **local smoke timings only**, not real recovery RTO. Bundles/worktrees are discarded. This is an **isolated code-and-static-site cutover/rollback simulation**; it does **not** alter GitHub Pages, DNS, Vercel routing, visitors, Supabase, secrets, checkout or paid features. Do not claim live failover, Vercel runtime QC or full disaster recovery.

## Checkout and hosted-registration safety during recovered rollback

- PR #139 adds `tools/p0_checkout_guard_probe.mjs` and requires the local rollback runner to **load the checkout handler directly from each independently restored Git release**. No HTTP request to Stripe/Vercel or any production payment provider is issued.
- [Action 38948166321](https://github.com/civicascentai-ui/civicascentai/actions/runs/38948166321) **PASS**: four localhost cutover/rollback/recovery phases × 16 routes = **64/64**; the restored paid-enrollment handler was invoked in each phase, with `POST → HTTP 403 / PAID_ENROLLMENT_ON_HOLD` and `GET → HTTP 405` in **all four** phases. `Cache-Control: no-store` verified. This is a source-level functional harness, NOT proof of external serverless runtime behavior.
- Both English `register.html` and Spanish `registro.html` source contain their intended **external** `https://book.stripe.com/` registration link and $0 messaging; these forms are **NOT** part of GitHub Pages or Vercel code/data backup. Their provider configuration, actual no-card requirements, availability, confirmation return, and the handling of attendee data must be reviewed independently under the provider account. Source copy asserting "$0" is **not** provider proof.
- A provider outage could break free registration even when the static website and rollback tests pass. Safe fallback: show clear free-workshop contact/help instructions only after owner approval of content; do not fabricate an existing working replacement form or import private attendee data into public GitHub.

**Recovery acceptance:** The actual public-site restore/checkout guard is tested offline, but full end-to-end enrollment availability and privacy remain separate external dependencies.

## Live private-service inventory (metadata only; NO protected data exported)

Provider reports two Supabase projects `ACTIVE_HEALTHY`, both in `us-east-1`:

- **CivicAscent RAG Phase 1 Test**: 7 `public` tables, all RLS enabled; **18** recorded migrations; **6** active Edge Functions.
- **CivicAscent Course Commerce QA Staging**: 4 `public` tables, all RLS enabled; **8** recorded migrations; **6** active Edge Functions. One webhook endpoint is configured for its own authentication mechanism and must be independently validated before any production attribution; an API metadata flag alone is not a security conclusion.

This is a **read-only schema/manifest inventory**, not a Postgres dump, storage export, encrypted or off-provider copy, config/secret restore or validation of live production dependencies. No private table row values, source secrets or environment variable values were read or saved in GitHub. `#138` remains responsible for protected RAG preservation; `#22` remains responsible for determining which services are truly production-critical.

## Protected Vercel preview — independent runtime QC limitation

The Vercel connector independently reports the shadow preview `dpl_3wmTfUoQkzamp9eZVhhdJCtDDTqf` as **READY**, with exact Git source `fe50da6`, no production target and a single branch preview alias. Its authenticated provider build logs show the source checkout and successful compilation/deployment. **Public HTTP opens Vercel's SSO protection page rather than the application.** The provider's deployment file-tree endpoint returned 404, and direct authenticated file-content lookups for `index.html` were also unavailable, so no actual preview-page runtime test is claimed. Preserve SSO; an explicitly authenticated review (owner's Vercel session / permitted independent reviewer) is still required.

The shadow project's earlier ignored-build and preview-suppression settings were restored by a successful Vercel project update API call, but the available read endpoints omit those fields, so the **configuration has not been independently read back**. Do not disable SSO or weaken production security to get a green check.

## Independent retained full + incremental archive restore (2026-10-16)

Separate from the fresh-bundle test, **the actual previously stored GitHub Actions backup artifacts were downloaded and restored independently** into temporary local bare repositories, without accessing production or customer data:

- Full baseline action `38737102989`, artifact `11974307272` (run's `p1-dual-code-38737102989`).
- Friday incremental action `38875404596`, artifact `12034469020` (`p1-dual-code-38875404596`, 2026-10-16 08:41:59 UTC).
- Manifests, two Git-bundle hashes, full-to-incremental source continuity, exact recovered SHAs and `git fsck --full --no-reflogs` **PASS for production and shadow separately**.
- Actual archived **production recovered at `96655c60ab3e3e5ae9f4248635380bb69acba98f`**; a loopback server using this *reconstructed retained backup* returned HTTP 200 for `index.html`, `programs.html`, `veterans.html`, `register.html`, `es.html` (5/5). Shadow recovered at `63e18246756ac615dfa9e7d10248aed0ea4031d6`; its commit matches the archived manifest.
- This independently demonstrates the **stored prior code-only backup chain is actually restorable**, not merely that the original workflow passed. No repository source or secrets were copied into a public issue or artifact.

**Freshness HOLD:** The restored retained production backup is OLDER than public production commit `fe50da6dd04762c9cca1d35525f559c7afe8e085`. Today's fresh-bundle static-site proof at the newest SHA is **ephemeral**, not a retained durable backup. A new verified scheduled/current production backup is still mandatory. This is not full application/data/Shadow House disaster recovery.

## What the non-destructive code-only rehearsal does

1. On a disposable GitHub Actions runner, fetch the current `origin/main` commit without changing remote branches.
2. Create a temporary full Git bundle of that source and independently verify Git object integrity and SHA-256 metadata.
3. Clone bundle to a fresh temporary worktree; check out the exact source commit, run `git fsck`.
4. Serve restored files *only* at `127.0.0.1` and request homepage, four learner rooms, Veterans, Spanish, registration, Programs, courses, support and essential CSS/JS.
5. Assert the approved three homepage cards, Programs/Spanish/Workshop navigation, no retired Safari control, four restored room markers, Veterans navigation fix, Spanish document language.
6. Persist a **JSON receipt only**. Source bundle and restored files are destroyed with the CI runner; no backup secret or site source is uploaded in the PR artifact.

**Limits:** The rehearsal exercises current source, not the separately retained backup chain. A successful Git bundle clone does not prove a deployable standby, HTTPS, DNS, data persistence, credentials, functions or real users' sessions.

## Backup-policy acceptance before closing #22

- [x] **Immediate full Git-code artifact** captures latest production commit, hashes verified, independently restored from retained artifact. [Run 38901152418](https://github.com/civicascentai-ui/civicascentai/actions/runs/38901152418).
- [ ] Confirm the **next scheduled** Mon–Sat incremental / Sunday full chain also captures current and future changes, with continuing retention checks.
- [ ] Verify Monday–Saturday **incremental** and Sunday **independent full** Git backup separately for production and standby source; inspect restore chain, retention and artifact expiry.
- [ ] Establish protected, encrypted/off-provider full backup destination for any production-critical persistent data, secrets/config inventory and uploaded objects. Do not put private rows, raw secrets or functions' sensitive environment values in a public Git repository or CI artifact.
- [ ] Define recovery-point and recovery-time objectives (RPO/RTO) with owner; verify measured results rather than invent them.
- [ ] Inventory actual public-service dependencies: static Pages, DNS, redirect rules, contact/registration forms, analytics and any real production-linked persistent services. QA-only projects must not silently be counted as current production.
- [ ] Recreate complete application **from a retained restore point** in isolated protected environment, independently inspect its contents and conduct functional smoke.
- [ ] For real production-linked data, conduct an isolated backup restoration with sensitive data protected. Never modify the source database during rehearsal.
- [x] Request owner-approved isolated Vercel preview for the matching Git SHA: deployment **READY**; build suppression restoration requested/accepted. It stayed on the Hobby plan and used no paid upgrade.
- [ ] Independently verify the **authenticated preview's actual pages and assets**, route interactions and data-free checkout hold; Vercel SSO blocks anonymous HTTP smoke. Read back restored build settings via a provider source that exposes them, or separately validate the next intended skipped build without triggering an unauthorized deployment.
- [ ] Independently confirm latest deployed standby Git SHA equals approved production source and that all critical functions/assets resolve from standby; do not equate HTTP 200 with parity.
- [ ] Time the proposed non-destructive crossover/rollback rehearsal using isolated/test domains; a public DNS cutover remains separately authorized. Record independent QC sign-off and documented fallback.
- [ ] Open issues #40 and #138 remain separate: manual WCAG 2.2 AA screen reader/learner review and protected RAG data preservation.

## Emergency operating rule

Do not switch live traffic onto old standby simply because an endpoint responds. A recent `READY` deployment at the wrong SHA is **not** current parity. Do not describe `Vercel: success — Canceled by Ignored Build Step` as a successfully built recovery environment. If the recovery procedure cannot demonstrate exact version, data integrity and a safe rollback, **hold the cutover and preserve the working public site**.

**Evidence cross-references:** [Issue #22](https://github.com/civicascentai-ui/civicascentai/issues/22), [recovery topology #135](https://github.com/civicascentai-ui/civicascentai/pull/135), [code/site rehearsal #139](https://github.com/civicascentai-ui/civicascentai/pull/139), [RAG preservation #138](https://github.com/civicascentai-ui/civicascentai/issues/138), [human accessibility #40](https://github.com/civicascentai-ui/civicascentai/issues/40).
