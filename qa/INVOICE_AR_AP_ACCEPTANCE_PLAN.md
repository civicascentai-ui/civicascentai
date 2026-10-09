# Invoice AR/AP acceptance plan

Decision: CivicAscent AI will support both outgoing customer invoices (accounts receivable) and incoming vendor invoices (accounts payable). Approved scope; implementation and tests remain pending. QA branch only; no production authorization.

## Accounts receivable
- Generate unique numbered customer invoices, accurate tax/terms/line items, bulk seat counts and purchase-order reference.
- Test draft, approval, delivery, hosted payment, card and eligible payment methods, partial payment, paid receipt, overdue reminder, cancellation, credit note, full and partial refund, and ledger reconciliation.
- Do not activate course entitlements until applicable contract/payment conditions are met.

## Accounts payable
- Capture vendor invoice, vendor identity and banking-change verification, purchase-order/receipt match, duplicate detection, approval thresholds and segregation of duties.
- Test disputed invoices, partial payment, credit memo, overdue handling, audit log, and payment confirmation. No automated vendor payment without explicit approval.

## Security and release gates
- Restrict invoice and vendor data to authorized staff; protect bank details and personally identifiable information.
- Record evidence for every test and require independent QC approval.
- Sandbox Stripe invoice list checked 2026-10-09: zero invoices. No invoice lifecycle E2E test has passed.
- Keep production and live Stripe unchanged until separate launch authorization.
