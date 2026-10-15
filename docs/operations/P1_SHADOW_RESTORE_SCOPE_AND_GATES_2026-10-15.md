# P1 Shadow House: Recovery Scope, Evidence and Gaps
**Read-only inventory:** 2026-10-15 | **Status:** PARTIAL, full-environment redundancy NOT QC PASSED

## Verified boundaries
| Component | Grounded target | Evidence / limitation |
|---|---|---|
| Public production | `https://civicascentai.com/` (GitHub Pages, source: GitHub `main`) | Pages may republish after commits even when Vercel skip-build is active |
| Stable Shadow House alias | `https://civicascentai-launch-qa.vercel.app/` | Vercel deployment `dpl_B6uYcvPPYqaBh7y5zEhQQrjmTJq1` READY, Git commit `63e18246756ac615dfa9e7d10248aed0ea4031d6` |
| Production code snapshot | `main` Git SHA `633ee52336148cb7eeaf6c60ddb7cbdc6527633b` at initial backup | Source can advance after the snapshot; verify latest before each restoration |
| Standby code snapshot | The exact alias deployment SHA above, NOT the historically diverged `production/shadow-concat-20261014` branch | Re-pin after actual promoted standby deployment; do not claim later revisions were protected |
| Dual-code backup workflow | `.github/workflows/p1-dual-code-backups.yml` on `main` | First hosted baseline: [run 38737102989](https://github.com/civicascentai-ui/civicascentai/actions/runs/38737102989), PASS; separate Git-only restore/checksum receipts |
| Expanded route/content parity | [run 38729581681](https://github.com/civicascentai-ui/civicascentai/actions/runs/38729581681), 31/31 PASS snapshot | The stricter monitor remains **draft PR #115**, not yet activated on `main`; snapshot does not prove continuous uptime or failover |

## Persistent data dependency inventory (not yet mapped to public environments)
Two connected Supabase projects were observed ACTIVE_HEALTHY:
- `CivicAscent RAG Phase 1 Test`: seven public-schema tables, all inspected with RLS enabled (metadata only).
- `CivicAscent Course Commerce QA Staging`: four QA-related public-schema tables, all inspected with RLS enabled (metadata only).

**Neither project is verified as the database backing the public website or the standby.** Whether any further database, object storage, external service, cloud drive, uploads or external webhook state belongs to production/shadow is OPEN. An empty/unmapped environment is not proof of no stored data.

**Additional read-only storage and serverless function census:**
- RAG test project: **0 Supabase Storage buckets** and **6 active Edge Functions**.
- Commerce QA staging: **1 nonpublic Supabase Storage bucket** and **6 active Edge Functions**, including delivery/upload-related handlers.
- No Supabase records, uploads, object contents, or secret values were copied. Edge Function source, JWT/signature verification configuration, private bucket objects, deployment versions and restoration dependencies are **not** included in the Git code bundles and have **not** been recovered independently.
- These project roles are not yet tied to production/shadow. The private Commerce QA bucket is a concrete unresolved backup dependency if that project is in recovery scope.


Never copy table contents, private learner records, keys, secrets or database dumps into public GitHub, GitHub Actions artifact archives or the public site.

## Completed vs blocked acceptance gates
- [x] Public production and standby source identities mapped to observed deployments.
- [x] Initial Git-only full backup for each source passed real hosted independent recovery and SHA checks.
- [x] Initial read-only route parity snapshot passed (31/31, 0 mismatches).
- [x] Draft integrity guard rejects unverified or malformed previous recovery chains; isolated synthetic full/incremental/no-change and tamper test PASS at [isolated test 38765376878](https://github.com/civicascentai-ui/civicascentai/actions/runs/38765376878). **Guard is NOT merged on main.**
- [ ] Observe first scheduled Mon–Sat incremental run after full bootstrap, download entire chain and independently restore both source SHAs.
- [ ] Observe Sunday separate full for production and shadow; verify retention across at least four Sundays.
- [ ] Confirm live/standby database, uploads, Edge Functions, secrets/configuration and deployment dependency map with least-privilege **metadata**, without disclosing secret values.
- [ ] Establish independently protected $0 storage and documented encryption/key custody/restore procedure for any sensitive data; do not create an unprotected backup.
- [ ] Execute independently witnessed *full application and data* isolated restore for production and shadow, with measured RPO/RTO.
- [ ] Execute a non-destructive crossover **and** rollback rehearsal; verify routing, app behavior and data consistency. Do not move production traffic without explicit separate approval.
- [ ] Install automated standby-deployment SHA drift guard that fails closed if the deployed alias revision differs from backed-up source.
- [ ] Resolve GitHub Pages republish and Vercel manual/API deployment release controls before any merge; maintain live release HOLD.

## Activation sequencing
1. **Now (reversible, isolated):** code-chain hardening, synthetic corruption fixtures, verified manifests and public-source inventory. No API spending or live changes.
2. **Scheduled evidence:** first actual Friday incremental and Sunday full code recovery; alert on missing artifact, unverified parent, missing shadow ref, or failed fsck.
3. **Protected data preflight:** establish actual production/shadow data dependencies, secure no-charge destination, backup path and independent privacy/QC gate. No data writes or dumps in public repo.
4. **Disaster rehearsal:** restore both complete environments in isolation, time recovery, prove rollback, then submit a distinct owner release decision. A green code test or HTTP 200 is **not** complete failover.

**RPO/RTO:** Not measured and not authorized as promises. ETA for complete redundancy cannot be certified before real data mapping and protected restore facilities are verified. Budget $0. Paid checkout HOLD and website release HOLD unchanged.
