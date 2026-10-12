# Approved: Google operations pilot (2026-10-12)

Decision: GitHub Actions remains the portable execution and independent QC environment. Google Apps Script + Sheets is a proposed *secondary* status and lead-tracking environment for Sam/Reach. Google Workspace Studio is deferred. Google Flow is creative-only and not a launch dependency. Budget: $0 incremental.

## Pilot scope
1. Create a Google Sheet with tabs `AgentStatus`, `ReachLeads`, `AuditLog`.
2. In Apps Script, install a time-based trigger to mark stale tasks and send a summary to an approved company mailbox only after permission review.
3. Accept structured status records from an approved GitHub job only after authenticated endpoint setup. Never use a publicly writable unauthenticated web app.
4. Do not copy API keys, client data, personal phone numbers, or private filings into code, sheet templates, or CI logs.
5. Test with synthetic records: PASS, FAIL, OVERDUE, duplicate ID, missing fields, unauthorized request.
6. Friday signs off separately on privacy, cost/quota, delivery, and recovery. No Replit shutdown until evidence proves parity.

## Acceptance criteria
- Test spreadsheet created in controlled Google account.
- Authentication and least privilege verified.
- Five synthetic test cases pass, with dated evidence.
- Agent health report reproducible; no real external actions.
- Recovery/rollback documented.
- No unexpected charges or subscription requirements.

Status: APPROVED FOR PILOT DESIGN. NOT DEPLOYED. No account access or trigger installation claimed.
