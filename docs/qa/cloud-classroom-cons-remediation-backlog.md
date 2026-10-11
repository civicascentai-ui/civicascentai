# Cloud classroom: prioritized con-to-solution engineering backlog

QA-only, no production deployment or commercial content publication. Each item requires independent evidence, not simulated signoff.

| Order | Con / failure mode | Repair approach | Pass criterion |
|---|---|---|---|
| P0-1 | Refund after/before paid webhook regrants access | Single server-side entitlement state machine; durable refund tombstone keyed to Stripe TEST payment identity; idempotent signed event processing | Both event orders and concurrent/replayed events finish revoked |
| P0-2 | Cross-user data leak | Supabase Auth identity binding, deny-by-default RLS and server authorization per request | QA alias A cannot access alias B, JP-QA-01 remains separate |
| P0-3 | Copied links bypass access | Protected lesson route and private objects; short-lived resource links; revoke future fetches | Anonymous, expired, refunded and unauthorized requests all 403/401 |
| P0-4 | Android lesson/download failure | Mobile-first browser tests; expose required CORS headers; validate response body and saved file separately | Real Android QA browser verifies rendered lesson and optional handout |
| P1-5 | Low connectivity | HTML/text-first modules, compressed media, optional small approved handouts | Low-bandwidth test with accessible text |
| P1-6 | Confusing navigation | Module list, resume/continue, completion state and keyboard navigation | Learner can resume across sessions |
| P1-7 | Password reset and login failure | Provider-native verified recovery, rate limiting, no OTP logging | Legitimate reset succeeds; other account remains inaccessible |
| P1-8 | Outages | Health endpoints, runbook, graceful error and incident log | Recovery exercise restores QA endpoint and reports outage |
| P1-9 | Admin permission abuse | Least-privilege roles, two-person approval for risky overrides, audit trail | Unauthorized grant/revoke denied; approved action auditable |
| P0-10 | False launch confidence | 25 distinct independently evidenced paid TEST-to-course-access E2Es, negative/refund cases and human signoff | 25/25 and independent QC recorded before release |

Companion handouts cannot be recalled after download. Commercial ZIP approval remains separate and pending.

Review lenses: Friday, Sam, Product, LPC, Reach, Operations, independent QC. This backlog is not proof of seven agent approvals. Production HOLD.
