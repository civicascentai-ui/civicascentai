# P1 Recovery Topology — Verified Read-Only State (2026-10-16)

Status: **PRODUCTION RELEASE #133 LIVE / FULL RECOVERY ACCEPTANCE OPEN**

**As-of evidence:** October 16, 2026, after PR #133. Human WCAG 2.2 AA and full recovery continue as distinct open projects; the owner approved the site release with these risks outstanding.

This document records the currently verified recovery topology. It is evidence for Issue #22; it is not a declaration that failover or full-environment recovery is complete.

## Public production

- Public site: `https://civicascentai.com/`.
- Current Git source: `main`.
- Verified production source at this checkpoint: `af7edd4fb1be1507542db899611bcb63a207045c` (merged PR #133).
- Public delivery path is GitHub Pages. The Pages build/deployment completed successfully for commit `af7edd4fb1be1507542db899611bcb63a207045c` in [run 38895279586](https://github.com/civicascentai-ui/civicascentai/actions/runs/38895279586). Live public HTTP read-only acceptance confirmed the three-choice homepage, four accessible learning rooms, Veterans, Programs, Spanish and registration. This is website smoke, not DR acceptance.
- Vercel project `civicascentai` remains connected to the repository, but builds for current main are intentionally canceled by the existing ignored-build release hold. The custom domain is therefore not evidence that Vercel is serving current public traffic.
- Paid checkout remains fail-closed. The repository endpoint returns `403 PAID_ENROLLMENT_ON_HOLD`, and the published course page contains no paid checkout link.

## Shadow House / standby

- Standby Vercel project: `civicascentai-launch-qa`.
- Last specifically verified READY standby source SHA used by the recovery workflow: `63e18246756ac615dfa9e7d10248aed0ea4031d6`.
- Verified READY deployment for that SHA: `civicascentai-launch-m343vxg2y-civicascentai.vercel.app`.
- The newest Vercel project deployment records for commit `af7edd4fb1be1507542db899611bcb63a207045c` are both **CANCELED**, due to the preexisting ignored-build hold: production project `dpl_8Fh44UTCYePm9DqRLbQtFCV3FAQG`, shadow project `dpl_An3JTEX3yoUp6FBfkN7JaAkgnQ6A`. Neither is READY nor a rollback candidate. A successful GitHub/Vercel source-status check must NOT be misinterpreted as a deployed standby.
- Therefore **standby source parity with current production is NOT verified**. Do not treat HTTP availability of an older standby as a current failover proof.

## Git code backup evidence

- Scheduled P1 dual-code run `38875404596` completed successfully on 2026-10-16.
- The run selected the prior successful chain `38737102989`, created an **incremental** code backup, and reconstructed/verified production and pinned standby Git histories in isolation.
- Artifact `p1-dual-code-38875404596` exists and was unexpired when checked.
- This establishes current scheduled incremental **Git-code** recovery operation, not full application/data recovery.
- The run occurred before the later production merges to `5ac15fee`; the next scheduled code backup must capture the newly published merge commit `af7edd4fb1be1507542db899611bcb63a207045c`; do not claim that the earlier backup contains it.

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
