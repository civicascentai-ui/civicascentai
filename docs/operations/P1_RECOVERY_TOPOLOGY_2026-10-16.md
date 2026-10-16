# P1 Recovery Topology — Verified Read-Only State (2026-10-16)

Status: **RECOVERY ACCEPTANCE OPEN / RELEASE HOLD PRESERVED**

This document records the currently verified recovery topology. It is evidence for Issue #22; it is not a declaration that failover or full-environment recovery is complete.

## Public production

- Public site: `https://civicascentai.com/`.
- Current Git source: `main`.
- Verified production source at this checkpoint: `5ac15fee929ca71c6c363c1316ca689c61946a1a`.
- Public delivery path is GitHub Pages. The post-hotfix Pages build/deployment completed successfully.
- Vercel project `civicascentai` remains connected to the repository, but builds for current main are intentionally canceled by the existing ignored-build release hold. The custom domain is therefore not evidence that Vercel is serving current public traffic.
- Paid checkout remains fail-closed. The repository endpoint returns `403 PAID_ENROLLMENT_ON_HOLD`, and the published course page contains no paid checkout link.

## Shadow House / standby

- Standby Vercel project: `civicascentai-launch-qa`.
- Last specifically verified READY standby source SHA used by the recovery workflow: `63e18246756ac615dfa9e7d10248aed0ea4031d6`.
- Verified READY deployment for that SHA: `civicascentai-launch-m343vxg2y-civicascentai.vercel.app`.
- The latest Vercel record for current main is CANCELED because the build hold is still active.
- Therefore **standby source parity with current production is NOT verified**. Do not treat HTTP availability of an older standby as a current failover proof.

## Git code backup evidence

- Scheduled P1 dual-code run `38875404596` completed successfully on 2026-10-16.
- The run selected the prior successful chain `38737102989`, created an **incremental** code backup, and reconstructed/verified production and pinned standby Git histories in isolation.
- Artifact `p1-dual-code-38875404596` exists and was unexpired when checked.
- This establishes current scheduled incremental **Git-code** recovery operation, not full application/data recovery.
- The run occurred before the later production merges to `5ac15fee`; the next scheduled code backup must capture the newer production source.

## Persistent services discovered

Two active Supabase projects are present in the connected account:

1. **CivicAscent RAG Phase 1 Test**
   - RAG/canonical knowledge tables and active Edge Functions.
   - No storage bucket objects were present in the checked storage inventory.
2. **CivicAscent Course Commerce QA Staging**
   - QA commerce tables, six active Edge Functions, and private bucket `course-qa-private`.
   - This is explicitly a QA/staging environment by project naming and table naming.

No direct reference from the current production HTML/JS or production-target Vercel environment variables to these Supabase projects was established during this checkpoint. That means their exact role in a future production recovery must remain **mapped but not assumed**.

## Recovery acceptance that is still open

- Current-production ↔ standby source parity and a fresh READY standby build.
- Independent restore of the actual public application into an isolated recovery target.
- Database/data backup and restore where any persistent service is production-critical.
- Upload/private-object backup and restore where applicable.
- Protected configuration and secret reconstruction without exposing secret values.
- Independent/off-provider protected copy where feasible at $0.
- Sunday independent full-environment evidence and retention proof.
- Timed crossover and rollback rehearsal without changing public traffic.
- Human witness/independent QC of the restored environment.

## Release-control rule

Do not disable checkout, branch/release holds, Vercel ignored-build controls, or change DNS/public traffic merely to make recovery evidence pass. A recovery test that requires a real deployment or traffic switch requires separate explicit owner authorization.
