# CivicAscent AI Phone / Voice - Staging Repair

Status: **isolated beta only**. This folder does not alter the public website or production phone routing.

## What this repairs

The phone architecture requires the same dispatch name on both sides:

- Agent worker: `civicascent-voice`
- SIP dispatch rule: `civicascent-voice`

Current LiveKit guidance recommends explicit agent dispatch for inbound SIP calls. The included staging dispatch rule sends each caller to an isolated room and explicitly dispatches the named CivicAscent worker.

## Files

- `agent.py` - inbound LiveKit voice agent
- `.env.example` - credential/model template; contains no secrets
- `dispatch-rule.staging.json` - staging SIP routing rule
- `requirements.txt` - minimal Python dependencies

## Safety / governance

1. Do not commit credentials.
2. Do not attach this rule to the production phone number until staging passes.
3. Do not enable paid model/provider usage without approval.
4. Do not merge this branch while any known voice defect remains.
5. Human handoff must be implemented and tested before production.
6. Call recording must remain off unless there is a defined consent and retention policy.
7. Logs must not expose sensitive caller data.

## Staging sequence

1. Create or select a LiveKit **staging** agent deployment with dispatch name `civicascent-voice`.
2. Add LiveKit credentials to a local/deployment `.env.local`; never commit them.
3. Start the worker in staging.
4. Create an inbound SIP trunk or LiveKit phone number.
5. Bind that trunk/number to the included dispatch rule.
6. Call the staging number.
7. Verify:
   - SIP participant enters a unique staging room.
   - `civicascent-voice` is dispatched.
   - Agent greets caller.
   - Caller interruption works.
   - English and Spanish requests work.
   - Unknown facts trigger a safe fallback.
   - Disconnect is clean.
8. Only after all checks pass should a production rule be prepared.

## Local check

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env.local
lk agent console agent.py
```

For a real LiveKit-connected staging test:

```bash
lk agent dev agent.py
```

No production deployment is authorized by this scaffold.
