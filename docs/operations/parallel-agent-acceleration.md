# Parallel acceleration plan: SCOUT / Friday / CODI / Sam

Approved constraints: zero incremental spend, no Replit expansion, no unverified completion claims, no live customer/payment actions without QC.

## Parallel lanes (start without waiting for one another)
- SCOUT: run existing GitHub Actions research; produce timestamped public-source evidence, deduplicated lead records, and failures. Research leads are unverified until reviewed.
- Friday: independently check workflow executions, website mobile/link/phone regressions, and release gates. Publish pass/fail evidence, not self-attested results.
- CODI: maintain a single owner/status/blocker/evidence register; flag stalled tasks; authorize releases only with Friday evidence.
- Sam: implement synthetic-data operations pilot, error logging, retries, and status exports. Apps Script integration requires verified Google access and authentication.

## Coordination contract
Task record fields: id, owner, priority, status, blocker, evidence_url, last_updated_utc, next_action. Status: queued, running, blocked, passed, failed.
Each lane may run independently; the only dependencies are (1) real integrations require credentials and permissions and (2) public release requires independent QC.
Do not mark a role operational because it exists in the Zebra dry-run registry.

## First verification gates
1. SCOUT: confirm actual scheduled/manual workflow run and inspect artifact.
2. Friday: record mobile website and contact/link QC, then verify SCOUT evidence.
3. CODI: publish one consolidated blocker register with evidence links.
4. Sam: test synthetic status intake and durable storage, including invalid/duplicate data.
5. Confirm cost remains $0; keep Replit as rollback only until parity is proven.

Status: ACCELERATION PLAN RECORDED; individual lane execution is not implied.
