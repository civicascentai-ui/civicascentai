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
import base64
import shlex
from pathlib import Path
from roles import render_workflow, ROLES
from export_artifacts import export_workspace
from host_check import check
from role_fixtures import FIXTURES, validate

ROOT = Path(__file__).resolve().parent
ACK = '--i-understand-that-this-will-be-running-without-the-usual-guardrails'

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--profile', required=True)
    parser.add_argument('--release', required=True)
    parser.add_argument('--role', choices=['proof', *ROLES], default='proof')
    parser.add_argument('--assignment-file')
    parser.add_argument('--seconds', type=int, default=120)
    args = parser.parse_args()
    if not 1 <= args.seconds <= 300:
        raise SystemExit('Duration must be 1..300 seconds.')
    assignment = None
    if args.assignment_file:
        if args.role not in ['qa','reach','operations']:
            raise SystemExit('Direct assignments currently support read-only QA, Reach and Operations; engineering requires separate patch completeness verification.')
        assignment = json.loads(Path(args.assignment_file).read_text())
        if not isinstance(assignment, dict) or not all(isinstance(assignment.get(k), str) and assignment[k].strip() for k in ['title','description']):
            raise SystemExit('Assignment requires nonempty title and description.')
    with socket.socket() as probe:
        probe.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
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
    workflow = render_workflow((ROOT / 'WORKFLOW.md').read_text(), args.role, workspace,
                                artifacts, ROOT / 'export_artifacts.py', True)
    workflow = workflow.replace('kind: github\n  provider:\n    repo: civicascentai-ui/civicascentai\n    token: $SYMPHONY_GITHUB_TOKEN', 'kind: memory')
    workflow = workflow.replace('active_states: [open]', 'active_states: [Todo]').replace('terminal_states: [closed]', 'terminal_states: [Done]').replace('interval_ms: 30000', 'interval_ms: 1000')
    labels = ['symphony-pilot'] + ([ROLES[args.role][0]] if args.role != 'proof' else [])
    description = 'Harmless restored-host proof'
    if assignment:
        description = assignment['description']
        workflow = workflow.replace('turn_timeout_ms: 120000', 'turn_timeout_ms: ' + str(args.seconds * 1000)).replace('stall_timeout_ms: 120000', 'stall_timeout_ms: ' + str(args.seconds * 1000))
    elif args.role != 'proof':
        files, description = FIXTURES[args.role]
        encoded = base64.b64encode(json.dumps(files).encode()).decode()
        setup = 'import pathlib,json,base64; files=json.loads(base64.b64decode(' + repr(encoded) + ')); [pathlib.Path(n).write_text(v) for n,v in files.items()]'
        workflow = workflow.replace('    git remote remove origin', '    git remote remove origin\n    python3 -c ' + shlex.quote(setup))
    baseline = root / 'source-baseline.txt'
    workflow = workflow.replace('    git remote remove origin', '    git remote remove origin\n    git rev-parse HEAD > ' + shlex.quote(str(baseline)), 1)
    workflow_file = root / 'WORKFLOW.md'
    workflow_file.write_text(workflow)
    flag = root / 'closed.flag'
    input_data = base64.b64encode(json.dumps({'title':assignment['title'] if assignment else 'Symphony pilot: local proof','description':description,'labels':labels,'flag':str(flag),'args':[ACK,'--logs-root',str(root/'logs'),str(workflow_file)]}).encode()).decode()
    elixir = '''input = Jason.decode!(Base.decode64!(__INPUT__))
issue = %SymphonyElixir.Tracker.Issue{id: "host-proof", identifier: "HOST-1", title: input["title"], description: input["description"], state: "Todo", labels: input["labels"], dispatchable: true}
ignored = %SymphonyElixir.Tracker.Issue{id: "host-ignored", identifier: "IGNORED-1", title: "Unlabeled fixture", state: "Todo", labels: [], dispatchable: true}
Application.put_env(:symphony_elixir, :memory_tracker_issues, [issue, ignored])
wait = fn loop -> if File.exists?(input["flag"]), do: Application.put_env(:symphony_elixir, :memory_tracker_issues, [%{issue | state: "Done"}, ignored]), else: (Process.sleep(100); loop.(loop)) end
spawn(fn -> wait.(wait) end)
SymphonyElixir.CLI.main(input["args"])
'''.replace('__INPUT__', json.dumps(input_data))
    code_file = root / 'launch.exs'
    code_file.write_text(elixir)
    evaluation = "'Elixir.Code':eval_file(<<" + json.dumps(str(code_file)) + ">>)."
    command = [str(release / 'erts-16.4/bin/erlexec'), '-noshell', '-boot_var',
               'RELEASE_LIB', str(release / 'lib'), '-config', str(release / 'releases/0.0.3/sys.config'), '-boot', str(release / 'releases/0.0.3/start_clean'), '-eval', evaluation]
    result = {'run_root': str(root), 'role': args.role, 'authenticated': True, 'artifact_verified': False,
              'session_completed': False, 'terminal_cleanup': False, 'task_kind': 'codi-assignment' if assignment else 'controlled-fixture'}
    with (root / 'runtime.log').open('w') as log:
        p = subprocess.Popen(command, env=env, cwd=ROOT, stdout=log,
                             stderr=subprocess.STDOUT, start_new_session=True)
        deadline = time.monotonic() + args.seconds
        try:
            while p.poll() is None and time.monotonic() < deadline:
                for work in workspace.glob('*'):
                    export_workspace(work, artifacts)
                logs = '\n'.join(x.read_text(errors='replace') for x in (root / 'logs').rglob('symphony.log*') if x.suffix not in ('.idx', '.siz'))
                result['session_completed'] = result['session_completed'] or 'Codex session completed' in logs
                if result['session_completed'] and not result['artifact_verified']:
                    if assignment:
                        result['baseline_source_sha'] = baseline.read_text().strip()
                        result['source_sha'] = subprocess.check_output(['git','rev-parse','HEAD'],cwd=workspace/'HOST-1',text=True).strip()
                        try:
                            claim = json.loads((artifacts/'HOST-1/result.json').read_text())
                            result['agent_status_claim'] = claim.get('status')
                            checks = {'structured_report': claim.get('role') == args.role and claim.get('status') in ['complete','partial','blocked'] and all(k in claim for k in ['evidence_paths','tests','blockers','next_owner']), 'summary_present': (artifacts/'HOST-1/summary.md').is_file()}
                            if args.role in ['qa','reach','operations']:
                                checks['revision_unchanged'] = result['source_sha'] == result['baseline_source_sha']
                                status = subprocess.check_output(['git','status','--porcelain','-z','--untracked-files=all'],cwd=workspace/'HOST-1',text=True)
                                checks['source_unchanged'] = all(x.startswith('?? .symphony-evidence/') for x in status.split('\0') if x)
                        except (OSError,ValueError):
                            checks = {'structured_report':False}
                    else:
                        checks = validate(args.role, artifacts / 'HOST-1', workspace / 'HOST-1', codex, env)
                    result['artifact_checks'] = checks
                    result['artifact_verified'] = all(checks.values())
                    if not result['artifact_verified']:
                        break
                if result['artifact_verified'] and result['session_completed'] and not flag.exists():
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
    required = ['authenticated', 'artifact_verified', 'session_completed', 'terminal_cleanup', 'queue_zero', 'unlabeled_ignored', 'runtime_stopped']
    result['passed'] = all(result.get(k) is True for k in required)
    (root / 'result.json').write_text(json.dumps(result, indent=2))
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result['passed'] else 1)

if __name__ == '__main__':
    main()
