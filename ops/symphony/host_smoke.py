"""Fresh bounded authenticated memory-fixture proof on a restored Burrito host."""
import argparse
import json
import os
import signal
import socket
import subprocess
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path
from roles import render_workflow
from export_artifacts import export_workspace
from host_check import check

ROOT = Path(__file__).resolve().parent
ACK = '--i-understand-that-this-will-be-running-without-the-usual-guardrails'

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--profile', required=True)
    parser.add_argument('--release', required=True)
    args = parser.parse_args()
    with socket.socket() as probe:
        probe.bind(('127.0.0.1', 4318))
    release = Path(args.release).resolve()
    codex = ROOT / '.runtime/codex/node_modules/.bin/codex'
    env = {k: v for k, v in os.environ.items() if k in {'PATH', 'HOME', 'LANG', 'LC_ALL', 'TMPDIR', 'HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY'}}
    profile = Path(args.profile).resolve()
    if profile == (Path.home() / '.codex').resolve():
        raise SystemExit('Use an isolated auth-only profile.')
    if not check(profile, ROOT / '.runtime/bin/symphony', codex)['passed']:
        raise SystemExit('Restored host health checks failed.')
    env.update(CODEX_HOME=str(profile), PATH=str(codex.parent) + ':' + env.get('PATH', ''),
               ROOTDIR=str(release), BINDIR=str(release / 'erts-16.4/bin'), EMU='beam', PROGNAME='erl')
    if subprocess.run([str(codex), 'login', 'status'], env=env, capture_output=True, timeout=20).returncode:
        raise SystemExit('Codex authentication missing.')
    root = ROOT / 'evidence' / ('host-smoke-' + uuid.uuid4().hex[:12])
    root.mkdir(parents=True)
    workspace = root / 'workspaces'
    artifacts = root / 'artifacts'
    workflow = render_workflow((ROOT / 'WORKFLOW.md').read_text(), 'proof', workspace,
                                artifacts, ROOT / 'export_artifacts.py', True)
    workflow = workflow.replace('kind: github\n  provider:\n    repo: civicascentai-ui/civicascentai\n    token: $SYMPHONY_GITHUB_TOKEN', 'kind: memory')
    workflow = workflow.replace('active_states: [open]', 'active_states: [Todo]').replace('terminal_states: [closed]', 'terminal_states: [Done]').replace('interval_ms: 30000', 'interval_ms: 1000')
    workflow_file = root / 'WORKFLOW.md'
    workflow_file.write_text(workflow)
    flag = root / 'closed.flag'
    elixir = '''issue = %SymphonyElixir.Tracker.Issue{id: "host-proof", identifier: "HOST-1", title: "Symphony pilot: local proof", description: "Harmless restored-host proof", state: "Todo", labels: ["symphony-pilot"], dispatchable: true}
ignored = %SymphonyElixir.Tracker.Issue{id: "host-ignored", identifier: "IGNORED-1", title: "Unlabeled fixture", state: "Todo", labels: [], dispatchable: true}
Application.put_env(:symphony_elixir, :memory_tracker_issues, [issue, ignored])
wait = fn loop -> if File.exists?(FLAG), do: Application.put_env(:symphony_elixir, :memory_tracker_issues, [%{issue | state: "Done"}, ignored]), else: (Process.sleep(100); loop.(loop)) end
spawn(fn -> wait.(wait) end)
SymphonyElixir.CLI.main(ARGS)
'''.replace('FLAG', json.dumps(str(flag))).replace('ARGS', json.dumps([ACK, '--logs-root', str(root / 'logs'), str(workflow_file)]))
    code_file = root / 'launch.exs'
    code_file.write_text(elixir)
    evaluation = "'Elixir.Code':eval_file(<<" + json.dumps(str(code_file)) + ">>)."
    command = [str(release / 'erts-16.4/bin/erlexec'), '-noshell', '-boot_var',
               'RELEASE_LIB', str(release / 'lib'), '-config', str(release / 'releases/0.0.3/sys.config'), '-boot', str(release / 'releases/0.0.3/start_clean'), '-eval', evaluation]
    result = {'run_root': str(root), 'authenticated': True, 'proof_exact': False,
              'session_completed': False, 'terminal_cleanup': False}
    with (root / 'runtime.log').open('w') as log:
        p = subprocess.Popen(command, env=env, cwd=ROOT, stdout=log,
                             stderr=subprocess.STDOUT, start_new_session=True)
        deadline = time.monotonic() + 120
        try:
            while p.poll() is None and time.monotonic() < deadline:
                for work in workspace.glob('*'):
                    export_workspace(work, artifacts)
                logs = '\n'.join(x.read_text(errors='replace') for x in (root / 'logs').rglob('symphony.log*') if x.suffix not in ('.idx', '.siz'))
                proof = artifacts / 'HOST-1/smoke-result.txt'
                result['proof_exact'] = result['proof_exact'] or (proof.is_file() and proof.read_text() == 'SYMPHONY_CIVICASCENT_PASS\n')
                result['session_completed'] = result['session_completed'] or 'Codex session completed' in logs
                if result['proof_exact'] and result['session_completed'] and not flag.exists():
                    flag.write_text('Done')
                try:
                    with urllib.request.urlopen('http://127.0.0.1:4318/api/v1/state', timeout=2) as response:
                        state = json.load(response)
                    (root / 'state.json').write_text(json.dumps(state, indent=2))
                    result['queue_zero'] = all(state.get('counts', {}).get(k) == 0 for k in ['running', 'retrying', 'blocked'])
                except (urllib.error.URLError, ValueError):
                    result['queue_zero'] = False
                result['terminal_cleanup'] = flag.exists() and not (workspace / 'HOST-1').exists()
                result['unlabeled_ignored'] = 'IGNORED-1' not in logs and not (workspace / 'IGNORED-1').exists()
                if result['terminal_cleanup'] and result.get('queue_zero'):
                    break
                time.sleep(0.25)
        finally:
            try:
                os.killpg(p.pid, signal.SIGTERM)
                p.wait(timeout=5)
            except subprocess.TimeoutExpired:
                os.killpg(p.pid, signal.SIGKILL)
                p.wait()
            except ProcessLookupError:
                p.wait()
            try:
                os.killpg(p.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
    stopped = False
    for _ in range(20):
        try:
            os.killpg(p.pid, 0)
        except ProcessLookupError:
            stopped = True
            break
        time.sleep(0.1)
    result['runtime_stopped'] = p.poll() is not None and stopped
    required = ['authenticated', 'proof_exact', 'session_completed', 'terminal_cleanup', 'queue_zero', 'unlabeled_ignored', 'runtime_stopped']
    result['passed'] = all(result.get(k) is True for k in required)
    (root / 'result.json').write_text(json.dumps(result, indent=2))
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result['passed'] else 1)

if __name__ == '__main__':
    main()
