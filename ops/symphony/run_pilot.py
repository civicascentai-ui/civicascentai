#!/usr/bin/env python3
"""Run one bounded pilot after validating host-side credentials."""
import argparse
import json
import os
import shutil
import signal
import socket
import subprocess
import time
import tomllib
import urllib.error
import urllib.request
from pathlib import Path
from roles import ROLES, render_workflow
from export_artifacts import export_workspace
from profile_config import normalize_profile_config

ROOT = Path(__file__).resolve().parent
ACK = '--i-understand-that-this-will-be-running-without-the-usual-guardrails'

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--seconds', type=int, default=180)
    parser.add_argument('--preflight-only', action='store_true')
    parser.add_argument('--role', choices=['proof', *ROLES], default='proof')
    parser.add_argument('--drop-linux-capabilities', action='store_true')
    args = parser.parse_args()
    if not 1 <= args.seconds <= 300:
        raise SystemExit('Pilot duration must be between 1 and 300 seconds.')
    if args.drop_linux_capabilities and not shutil.which('setpriv'):
        raise SystemExit('BLOCKED: capability-drop mode requires util-linux setpriv on PATH.')
    runtime = ROOT / '.runtime'
    symphony = runtime / 'bin/symphony'
    codex = runtime / 'codex/node_modules/.bin/codex'
    if not symphony.is_file() or not codex.is_file():
        raise SystemExit('Runtime missing: run install.py first.')
    profile_name = os.environ.get('CODEX_HOME')
    if not profile_name:
        raise SystemExit('BLOCKED: explicit auth-only CODEX_HOME is required.')
    profile = Path(profile_name).resolve()
    if profile == (Path.home() / '.codex').resolve():
        raise SystemExit('BLOCKED: use a separate auth-only Codex profile.')
    if not normalize_profile_config(profile, ROOT):
        raise SystemExit('BLOCKED: pilot profile contains unsupported integrations or configuration.')
    token = os.environ.get('SYMPHONY_GITHUB_TOKEN')
    if not token:
        raise SystemExit('BLOCKED: host-side read-only SYMPHONY_GITHUB_TOKEN is missing.')
    req = urllib.request.Request('https://api.github.com/repos/civicascentai-ui/civicascentai/issues?state=open&per_page=1',
                                 headers={'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json', 'User-Agent': 'CivicAscent-Symphony-Pilot'})
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            json.load(response)
    except (urllib.error.URLError, ValueError):
        raise SystemExit('BLOCKED: tracker credential or tracker connectivity failed; secret omitted.')
    auth_env = os.environ.copy()
    auth_env['CODEX_HOME'] = str(profile)
    auth = subprocess.run([str(codex), 'login', 'status'], capture_output=True, text=True, env=auth_env)
    if auth.returncode != 0:
        raise SystemExit('BLOCKED: Codex must be signed in on this host.')
    print('Preflight passed: runtime, tracker read access, and Codex sign-in.', flush=True)
    if args.preflight_only:
        return
    try:
        with socket.socket() as probe:
            probe.bind(('127.0.0.1', 4318))
    except OSError:
        raise SystemExit('BLOCKED: port 4318 already in use; evidence must come from this run.')
    allowed = {'PATH','HOME','LANG','LC_ALL','TMPDIR','HTTP_PROXY','HTTPS_PROXY','NO_PROXY','http_proxy','https_proxy','no_proxy','CODEX_HOME'}
    env = {k: v for k, v in os.environ.items() if k in allowed}
    env['CODEX_HOME'] = str(profile)
    env['PATH'] = str(codex.parent) + os.pathsep + env.get('PATH', '')
    env['SYMPHONY_GITHUB_TOKEN'] = token
    evidence = ROOT / 'evidence' / str(time.time_ns())
    evidence.mkdir(parents=True)
    workspaces = runtime / 'runs' / evidence.name / 'workspaces'
    workflow = evidence / 'WORKFLOW.md'
    workflow.write_text(render_workflow((ROOT / 'WORKFLOW.md').read_text(), args.role,
        workspaces, evidence / 'artifacts', ROOT / 'export_artifacts.py', args.drop_linux_capabilities))
    (evidence / 'run.json').write_text(json.dumps({'role': args.role,
        'seconds': args.seconds, 'workspace_root': str(workspaces),
        'drop_linux_capabilities': args.drop_linux_capabilities}, indent=2))
    with (evidence / 'service.log').open('w') as log:
        p = subprocess.Popen([str(symphony), ACK, '--logs-root', str(evidence / 'logs'), str(workflow)], cwd=str(ROOT), env=env, stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
        try:
            deadline = time.monotonic() + args.seconds
            while p.poll() is None and time.monotonic() < deadline:
                for workspace in workspaces.glob('*'):
                    export_workspace(workspace, evidence / 'artifacts')
                try:
                    with urllib.request.urlopen('http://127.0.0.1:4318/api/v1/state', timeout=2) as response:
                        state = json.load(response)
                    (evidence / 'state.json').write_text(json.dumps(state, indent=2))
                    if state.get('blocked'):
                        print('Operator action required; bounded pilot stopped.', flush=True)
                        break
                except (urllib.error.URLError, ValueError):
                    pass
                time.sleep(1)
        finally:
            try:
                os.killpg(p.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
            try:
                p.wait(timeout=5)
            except subprocess.TimeoutExpired:
                try:
                    os.killpg(p.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
                p.wait()
            # The leader can exit before descendants; reap any remaining group.
            try:
                os.killpg(p.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            for workspace in workspaces.glob('*'):
                export_workspace(workspace, evidence / 'artifacts')
    print('Pilot stopped. Review evidence at ' + str(evidence))
    print('This command does not certify task success or continuous operation.')

if __name__ == '__main__':
    main()
