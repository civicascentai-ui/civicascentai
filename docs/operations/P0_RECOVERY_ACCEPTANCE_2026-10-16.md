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
| Vercel standby `civicascentai-launch-qa` | New Git branch `recovery/shadow-source-candidate-20261016` equals current `main` SHA `fe50da6` (0 ahead/behind); one preview request `dpl_2KrAMPXpqvaiY5i3pCGRFy1zf8fm` canceled under intact ignored-build guard | **SOURCE PARITY PREPARED, DEPLOYMENT BLOCKED** |
| Persistent databases/uploads | Supabase RAG Phase 1 Test and Course Commerce QA Staging discovered; live production linkage not established | Protected export and isolated data restore **NOT VERIFIED** |
| Human witnessed timed failover/rollback | No observed authorized traffic switch or return test | **NOT VERIFIED** |

## Newly retained CURRENT production full backup and recoverability (2026-10-16)

The owner authorized the next #22 phase. A **one-time independent full-code snapshot** workflow was added in PR #139 and executed without touching `main`, public DNS, Vercel settings, secrets or databases.

- [GitHub Actions 38901152418](https://github.com/civicascentai-ui/civicascentai/actions/runs/38901152418) **SUCCESS**; `p0-current-full-code-38901152418` artifact `12046370563` (22,285,456 compressed bytes), GitHub artifact retention configured for **35 days**. This is the first independently evidenced **retained** snapshot of **current** production commit `fe50da6dd04762c9cca1d35525f559c7afe8e085`.
- Independently downloaded the ZIP and verified its manifest declares `backup_mode=full`, `scope=git-code-only`, `status=restored-and-verified-git-code-only`; `production-full.bundle` and `shadow-full.bundle` SHA256 both match recorded digests, with bundle sizes 11,202,772 and 11,099,468 bytes, respectively.
- Independently initialized fresh bare Git repositories from each bundled archive; exact Git SHAs equal manifest for both production (`fe50da6`) and **old standby** (`63e1824`), and `git fsck --full --no-reflogs` **PASS** on both.
- From the **actually retained** latest production archive, separately checked out a fresh copy, served it over loopback `127.0.0.1`, and verified **16/16** URLs (13 HTML, 3 CSS/JS) return HTTP 200, including approved homepage, learner rooms, Veterans and Spanish markers.
- **No copy** of database rows, uploads, environment variables or protected settings is in this snapshot. It is time-limited GitHub artifact storage, **not** an off-provider protected disaster backup. Do not infer it protects against GitHub provider-wide failure. Future scheduled Mon–Sat incremental and Sunday full archival policy still needs ongoing chain evidence.

### Shadow House scoped preview — blocked by existing control

- Created GitHub branch `recovery/shadow-source-candidate-20261016` at **exact same code commit** `fe50da6` as current public `main`, independently compared: **identical, 0 commits ahead / 0 behind**. This is **source-code readiness**, not a deployed standby.
- Confirmed connected Vercel team reports **Hobby** plan. Sent **one** isolated deployment request to *shadow project* `civicascentai-launch-qa`, from the pinned candidate source, targeting an unaliased preview (no `production` target, no Vercel project settings override). Result deployment `dpl_2KrAMPXpqvaiY5i3pCGRFy1zf8fm`: **CANCELED** by existing ignored-build step. A canceled deployment is **not** READY and proves **no** failover parity.
- Did **not** disable ignored-build control, change existing domains, checkout, public DNS, database, or production routing. An actual READY standby preview remains gated by controlled review of preview build suppression and guaranteed nonchargeable resource usage.

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
- [ ] Rebuild the **Shadow House Vercel project** from the approved current source in a separate authenticated **preview** only after confirming $0 incremental cost and getting scoped permission to suspend preview build suppression. Do not use production target, alter domains or disable checkout; restore suppression after the test.
- [ ] Independently confirm latest deployed standby Git SHA equals approved production source and that all critical functions/assets resolve from standby; do not equate HTTP 200 with parity.
- [ ] Time the proposed non-destructive crossover/rollback rehearsal using isolated/test domains; a public DNS cutover remains separately authorized. Record independent QC sign-off and documented fallback.
- [ ] Open issues #40 and #138 remain separate: manual WCAG 2.2 AA screen reader/learner review and protected RAG data preservation.

## Emergency operating rule

Do not switch live traffic onto old standby simply because an endpoint responds. A recent `READY` deployment at the wrong SHA is **not** current parity. Do not describe `Vercel: success — Canceled by Ignored Build Step` as a successfully built recovery environment. If the recovery procedure cannot demonstrate exact version, data integrity and a safe rollback, **hold the cutover and preserve the working public site**.

**Evidence cross-references:** [Issue #22](https://github.com/civicascentai-ui/civicascentai/issues/22), [recovery topology #135](https://github.com/civicascentai-ui/civicascentai/pull/135), [code/site rehearsal #139](https://github.com/civicascentai-ui/civicascentai/pull/139), [RAG preservation #138](https://github.com/civicascentai-ui/civicascentai/issues/138), [human accessibility #40](https://github.com/civicascentai-ui/civicascentai/issues/40).
