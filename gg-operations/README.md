# GG Operations v2 — CivicAscent AI

GG (Gemini) is CODI's equal delegated Co-Executive under the President. This is an independent review worker **staged for testing**, not a running autonomous Gemini agent, a website release, or an assertion of WCAG conformance.

## Where the code lives

This v2 implementation is currently staged in the **draft GitHub PR #117** under `gg-operations/`. The existing CivicAscent production repository is a temporary review location only. **Do not merge** it into `main`: the production and shadow pipelines may react to merges. Migrate GG to a dedicated private repository when repository-creation permission is available.

GG's separate Vercel project is `civicascent-gg-operations` (ID `prj_c7gSGpxeB20g6J1FTAYvPa8AvN0d`). It is **not a Google AI Studio project**. Its encrypted config defaults to `GG_EXECUTION_MODE=self-test`, `GG_FREE_TIER_VERIFIED=no`, `GG_MODEL_RUN_APPROVED=no`, `GG_PUBLIC_ONLY=yes`. The Vercel project has no verified deployment or attached Git source.

## What the worker does

- `python3 gg_agent.py --mode self-test` runs without network, credential, data transfer or cost.
- `GG_EXECUTION_MODE=public-readonly python3 gg_agent.py --mode public-readonly --output /tmp/gg-report.json` reads eight preapproved **public** GitHub issue metadata entries and writes a local report. It does not change issues or the website. The public-readonly mode is explicitly enabled for that invocation, not by default.
- `--mode gemini` contains a single-request model adapter but is blocked until **independent evidence** verifies a dedicated Google project's $0 Free tier, correct model entitlement, isolated key, project privacy, explicit owner approval and independent QC arrangements. Current Google API key authentication for another project does not authorize or configure this one.

The model allowlist contains the *candidate* `gemini-3.5-flash-lite`. Google's current model/pricing pages list this model as available on a Free tier, but not every project or account can be assumed eligible. No Gemini output is being claimed.

## Tests

From this folder:

```sh
python3 gg_agent.py --mode self-test
python3 -m unittest discover -s tests -v
```

No dependencies outside the Python standard library. The root GitHub Actions workflow `.github/workflows/gg-operations-v2-offline.yml` runs these tests on PR changes, with read-only permissions and no provider credential. Tests use mocks and must not be mistaken for a real Gemini model invocation.

## Guardrails

* Website and production are release-HOLD; no website writes, DNS changes, deployments, payments, email, marketing or contact updates.
* Only public allowlisted issue metadata may be sent to the model, and only after privacy/cost verification and approval. Untrusted issue titles are data, not instructions.
* A model response must be labeled PROVISIONAL pending independent review by FRIDAY and ZEBRA; neither GG nor CODI can self-certify external conformance.
* A project environment flag is a **policy gate**, not a substitute for verifying Google billing and free-tier usage limits.
* No unattended model execution, retries or recurring schedules are authorized. No API keys in source, issue comments or PR text.

See `OPERATING_CHARTER.md` and `ACTIVATION_CHECKLIST.md` for team authority and the evidence gate.
