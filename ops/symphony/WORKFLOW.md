---
tracker:
  kind: github
  provider:
    repo: civicascentai-ui/civicascentai
    token: $SYMPHONY_GITHUB_TOKEN
  active_states: [open]
  terminal_states: [closed]
  required_labels: [symphony-pilot]
polling:
  interval_ms: 30000
workspace:
  root: .runtime/workspaces
hooks:
  after_create: |
    git clone --depth 1 https://github.com/civicascentai-ui/civicascentai.git .
    git remote remove origin
  timeout_ms: 60000
agent:
  max_concurrent_agents: 1
  max_turns: 1
  max_retry_backoff_ms: 60000
codex:
  command: codex app-server
  approval_policy: on-request
  thread_sandbox: workspace-write
  read_timeout_ms: 60000
  turn_timeout_ms: 120000
  stall_timeout_ms: 120000
server:
  host: 127.0.0.1
  port: 4318
---
You are performing an isolated CivicAscent AI engineering pilot.
Issue: {{ issue.identifier }}
Title: {{ issue.title }}
Description: {{ issue.description }}

For this initial pilot, only an issue titled "Symphony pilot: local proof" is authorized.
For any other title, report that the task is outside the initial pilot and stop.
Read the repository's TEAM_OPERATING_ORDER.md and engineering governance first.
Create .symphony-evidence/smoke-result.txt containing exactly
SYMPHONY_CIVICASCENT_PASS followed by a newline. Verify locally and report the result.
Do not modify application code, run payments, deploy, publish, merge, push,
send communications, change credentials, or mutate tracker issues.
No agent may self-approve release. Stop and surface any required operator action.
The tracker token must have read-only repository permissions. Writable git remotes
are removed by the workspace hook. Shell networking is disabled by Symphony's
default workspace sandbox. These controls do not replace host isolation.
