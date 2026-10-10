# CivicAscent Symphony engineering pilot

Initial scope: one harmless local proof task, one concurrent agent, one turn per
invocation, and a bounded run of at most five minutes. This is an evaluation of
OpenAI's prototype, not a production or always-on deployment.

## Start on an isolated Linux x86_64 host

1. Run `python3 ops/symphony/install.py` (Python 3.11+, Node/npm and git required).
2. Set `CODEX_HOME` to a separate private auth-only profile directory, then sign in
   with `ops/symphony/.runtime/codex/node_modules/.bin/codex login`. The runner
   rejects the default profile and integration settings. Do not store that profile
   in Git or include it in evidence bundles.
3. Configure `SYMPHONY_GITHUB_TOKEN` in the host's secret store. Use a fine-grained
   token limited to this repository with read-only Contents and Issues permissions.
   Never put the token in a file committed to Git, a chat message, or a report.
4. Run `python3 ops/symphony/run_pilot.py --preflight-only`.
5. Prepare an issue titled `Symphony pilot: local proof`, then apply the exact
   label `symphony-pilot`. No issue has been activated by this setup package.
6. Run `python3 ops/symphony/run_pilot.py --seconds 180`.
7. Independently verify the exported proof and logs before removing the pilot
   label. The read-only token intentionally cannot close/comment on issues.

Evidence is saved outside issue workspaces. Symphony removes workspaces when an
issue becomes terminal; do not close the issue before evidence has been exported.
An active issue can be retried after a successful turn, including after restart.
The bounded runner prevents unattended indefinite retry loops during evaluation.

## Expanded assignments

See ROLE.md for scope, acceptance criteria, handoffs and verification status.
Select a role with `--role engineering`, `--role qa`, `--role reach`, or
`--role operations`. The default remains `--role proof`. Expanded assignments
require both `symphony-pilot` and the selected role label on their issue.

```sh
python3 ops/symphony/run_pilot.py --role qa --seconds 180
```

Run only one launcher at a time; the localhost port guard excludes concurrent
launchers. Each invocation uses a fresh workspace root and writes its generated
workflow and run metadata under evidence. Artifacts are exported under
`evidence/<run>/artifacts/<issue>/`, including before terminal cleanup.
For the verified host's capability error, add `--drop-linux-capabilities`.
This uses the tested setpriv command without weakening sandbox or approval modes.
Run local control checks with `python3 ops/symphony/test_roles.py`.

## Restore and verify the existing host

The named Vercel sandbox `civicascent-customer-panel` preserves files in a snapshot
when it stops; a resume creates a new session. It does not preserve running
processes or provide an always-on service. Resume the named sandbox through the
Vercel connector, then run the installed package's checks before starting work.
The deployed package is `/vercel/civicascent-symphony/ops` and the isolated auth
profile remains `/vercel/civicascent-symphony/auth`. Never archive that profile.

```sh
python3 /vercel/civicascent-symphony/ops/host_check.py --profile /vercel/civicascent-symphony/auth
python3 /vercel/civicascent-symphony/ops/host_smoke.py --profile /vercel/civicascent-symphony/auth --release /vercel/.local/share/.burrito/symphony_erts-16.4_0.0.3
```

Health checks include pinned versions/checksum, isolated profile configuration,
CLI authentication and a write-confinement probe. The fresh smoke uses the
official extracted release with static memory fixtures; it verifies real agent
output, excluded unlabeled work, cleanup and process-group shutdown. This does
not substitute for authenticated native GitHub dispatch. Its per-run evidence
is under `ops/evidence/host-smoke-<unique>/`. The native GitHub launcher requires a read-only token; the public bridge below
uses credential-free public reads. No always-on process or new account is created.

Codex can persist project trust entries during a task. Before launch, the package
removes only trust metadata for its own disposable workspace roots and preserves
allowed scalar settings. Unrelated project trust or integration settings are
refused unchanged. Authentication credentials are neither read nor exported.

## Controls and limitations

- Dashboard binds to `127.0.0.1:4318`; do not expose it publicly.
- Workspace-write sandbox defaults to network disabled. Approval mode is
  `on-request`; Symphony does not automatically grant requested approval.
- Use an auth-only Codex profile without MCP servers, plugins, hooks, or production
  credentials. Host environment filtering does not hide readable credential files.
  Preflight verifies tracker read access, not the token's complete permission set;
  the operator must configure and verify read-only permissions.
- Git write remotes are removed. Host hooks execute outside Codex's sandbox.
- Tracker token permissions enforce read access; workflow labels only select work.
- Do not supply Stripe, Vercel, Supabase, live-payment, or deployment credentials.
- Production deployment and live payments still require explicit user approval.
- One-turn/concurrency limits are not total spend caps. Operator supervision and
  a dedicated persistent host are required before any continuous service.

## Verified existing-host workaround — October 9, 2026

A bounded real Symphony/Codex task passed on the existing Vercel sandbox using
Symphony 0.0.3 and Codex 0.162.1. CLI login status confirmed ChatGPT authentication.
The memory tracker selected PILOT-1 and excluded the unlabeled IGNORED-1. Exact
proof output, completed-session logs, terminal workspace cleanup, zero queue
counts, and stopped runtime were independently verified. Native GitHub polling
and continuous operation remain unverified.

On this host, inherited Linux capabilities caused Codex's bubblewrap helper to
fail with `Unexpected capabilities but not setuid`. Dropping capabilities before
starting Codex resolved the error while retaining workspace-write and on-request:

```yaml
codex:
  command: setpriv --bounding-set=-all --inh-caps=-all --ambient-caps=-all codex app-server
  approval_policy: on-request
  thread_sandbox: workspace-write
```

For a host with this same failure, replace only the `codex.command` line in
WORKFLOW.md with the line above. Ensure util-linux `setpriv` is installed and
available on the runner PATH. The default portable workflow remains unchanged.
A sandbox probe on the verified host wrote inside its workspace, refused a write
outside with EROFS, and left no outside file. This verifies write confinement;
it does not certify isolation of readable secrets or network traffic.

The original test harness incorrectly reset its proof flag after terminal
cleanup removed the workspace. Its preserved result reports false. Independent
checks of the exported exact proof, its run timestamps, completion logs and
cleanup all passed. Export proof before transitioning a fixture to terminal,
and preserve a true proof result through cleanup.

## Sources

- [Official Symphony release](https://github.com/openai/symphony/releases/tag/v0.0.3)
- [Official implementation guide](https://github.com/openai/symphony/blob/v0.0.3/elixir/README.md)
- [Official service specification](https://github.com/openai/symphony/blob/v0.0.3/SPEC.md)
- [Codex authentication](https://learn.chatgpt.com/docs/auth)

The installation tests and real-agent result are recorded separately; a local
in-memory tracker test does not establish GitHub tracker authentication.

## Public repository workaround — October 10, 2026

The fixed CivicAscent repository is public. On the existing host, use GET-only
public polling and the official memory tracker boundary instead of a tracker token:

```sh
CODEX_HOME=/vercel/civicascent-symphony/auth python3 /vercel/civicascent-symphony/ops/run_pilot.py --public-tracker --role qa --seconds 75 --release /vercel/.local/share/.burrito/symphony_erts-16.4_0.0.3
```

The bridge verifies public visibility and complete all-state pagination, excludes
PRs, validates issue identities and scope, publishes snapshots atomically, and
retains the last good snapshot on errors. Disappeared issues cause a stop; only an
explicit closed state supports terminal cleanup. Polling occurs every 60 seconds,
fetches have a 40-second deadline, and snapshots expire after 125 seconds. API
errors, low rate budget, stale snapshots, runtime crashes and operator blocks
fail the run. It has no GitHub write tools and sends no Authorization header.

A successful bounded polling result certifies API ingestion and runtime health,
not completion of a labeled task. No current issues have the activation labels.
The four expanded roles separately passed real controlled-fixture tasks with
independent checks. Live issue dispatch and 24/7 operation remain unverified.
Run all local checks with `python3 -m unittest discover -s ops/symphony -p 'test_*.py'`.
