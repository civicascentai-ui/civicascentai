# Launch Recovery Control Matrix
State: ACTIVE REMEDIATION, production HOLD. GitHub issues are work orders, not proof of completion.
| Finding | Evidence required | Tracking |
|---|---|---|
| 1 CODI manual coordination | reconciled command register | #20 |
| 2 Human incident command absent | signed on-call primary/backup roster | #20 |
| 3 Senior deputy inactive | successful workflow run + escalation | #17 #20 |
| 4 Senior escalation untested | witnessed blocked-task simulation | #20 |
| 5 Junior deputy inactive | workflow run + artifact | #18 #20 |
| 6 Junior evidence audit unverified | audit sample compared to source issues | #20 |
| 7 Payment-to-course not verified | sandbox payment to actual learner access | #21 |
| 8 Refund/entitlement incomplete | full refund, partial refund, entitlement reconciliation | #21 |
| 9 Backup restore absent | isolated restored data and QC signature | #22 |
| 10 Recovery/rollback unproven | timed drill with approved RPO/RTO | #22 |
| 11 Access audit incomplete | inventory of tokens, privileges and rotation | #22 |
| 12 Breach/legal review incomplete | tabletop and qualified review | #22 |
| 13 Vendor AP untested | vendor invoice through two approvals | #23 |
| 14 Reconciliation incomplete | payment/invoice/refund ledger match | #23 |
| 15 Fraud controls unverified | duplicate and bank-change rejection tests | #23 |
| 16 Learner access unverified | course SKU-specific delivery proof | #21 |
| 17 Curriculum acceptance absent | reviewer signoff and learning outcomes | #24 |
| 18 WCAG review incomplete | independent accessible test report | #24 |
| 19 ASL/Spanish testing incomplete | qualified reviewer evidence | #24 |
| 20 Incident templates unapproved | approved notices and accessibility | #25 |
| 21 Notification routing untested | delivered drill acknowledgment | #25 |
| 22 Ticket workflow untested | support ticket to closure trace | #25 |
| 23 Paid/no-access escalation untested | timed support-to-engineering drill | #21 #25 |
| 24 Runtime/disaster tests incomplete | witnessed E2E and recovery evidence | #26 |
| 25 Independent QC signoff absent | separate reviewer signatures and issue links | #26 |

## QC protocol
For each finding: owner -> reproduction -> proposed change -> isolated test -> evidence -> independent QC -> executive acceptance. Failed tests reopen. Every test must note date, environment, run ID, actual versus expected, screenshot/log link, reviewer. No production changes or live charges without separate approval.

## Team integration
CODI resolves priorities; Senior Deputy triages dependencies; Junior Deputy preserves evidence; department owner performs technical work; LPC reviews high-risk impacts; QC independently approves. Every critical function needs a qualified human backup. Functional roles are not assumed to be live agents.

## Immediate critical path
1. Incident command human primary/backup and safe manual fallback.
2. Deploy and exercise signed sandbox webhook with end-to-end course access.
3. Witness isolated backup restore and security review.
4. Prove refund/reconciliation and paid/no-access support path.
5. Complete 25 course-specific E2E tests and accessibility reviews.
6. Independent QC gate and executive go/no-go.
