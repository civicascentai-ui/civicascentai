# CivicAscent P1 — Verified PostgreSQL 17 Recovery Runbook

**Status:** Synthetic backup and isolated restore PASS; full environment recovery HOLD.  
**Verified:** 2026-10-23

## Closed acceptance checks
- Synthetic isolated PostgreSQL 17 GitHub Actions run: https://github.com/civicascentai-ui/civicascentai/actions/runs/39917079315
- Artifact ID: 12485631403.
- Logs: `synthetic.dump: OK` and `PASS synthetic PostgreSQL 17 source->pg_dump->pg_restore rows=2:3:1`.
- Two tables, five synthetic rows and one foreign-key constraint restored.
- Five scheduled Git-code backup runs verified October 18–22; code backups do not include databases or deployment recovery.
- Protected-access preflight run: https://github.com/civicascentai-ui/civicascentai/actions/runs/39918436210. Four **nominated** secret/variable names not configured; other names may exist.

## Actual Supabase inventory (read-only)
- Commerce QA staging `lpdvvgdejbsgurtqmrub`: PostgreSQL 17.11, four public tables, two foreign keys. Public metadata fingerprint: `0f6bc8a3eb5baaa58ee2665b52deb27d`.
- RAG Phase 1 Test `alsjvdqlpayuzykhhbil`: PostgreSQL 17.11, seven public tables, five foreign keys. Public metadata fingerprint: `f94f0a63722f98fb190caea34bb8bd5f`.
- Both include managed authentication and storage schemas. Metadata fingerprints are not database backups.

## Still open
Actual secure database exports and isolated restorations for both projects, protection and verification of storage objects/auth data, independent offsite retention and retrieval, Vercel/site configuration recovery, RTO/RPO test, independent QC. Do not expose secrets or protected records via workflow logs/artifacts. Do not lift release hold on synthetic proof.

## Operational separation
Treat synthetic restore, code backups, live metadata inventory, and presence preflight as **completed individual deliverables**. Do not repeat them unless new evidence invalidates a result. Track actual-data recovery as a separately blocked item. Continue other unblocked CivicAscent work in parallel.
