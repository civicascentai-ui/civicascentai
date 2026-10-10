"""Bounded public GitHub polling through the official runtime memory boundary."""
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
from export_artifacts import export_workspace
from host_check import check
from public_tracker import REPO, fetch_snapshot, publish_snapshot
from roles import render_workflow, ROLES

ROOT = Path(__file__).resolve().parent
ACK = '--i-understand-that-this-will-be-running-without-the-usual-guardrails'

def run(args, profile):
    if not args.release:
        raise SystemExit('Public bridge requires --release pointing to the verified extracted runtime.')
    release = Path(args.release).resolve()
    codex = ROOT / '.runtime/codex/node_modules/.bin/codex'
    if not check(profile, ROOT / '.runtime/bin/symphony', codex)['passed']:
        raise SystemExit('Host health failed; public polling not started.')
    snapshot = fetch_snapshot()
    if args.preflight_only:
        print(json.dumps({'public_repository':REPO,'issues':len(snapshot['issues']),'passed':True}))
        return
    with socket.socket() as probe:
        probe.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        probe.bind(('127.0.0.1',4318))
    root = ROOT / 'evidence' / ('public-' + uuid.uuid4().hex[:12])
    root.mkdir(parents=True)
    snapshot_file, error_file = root / 'snapshot.json', root / 'snapshot-error.flag'
    publish_snapshot(snapshot_file, snapshot)
    workspaces, artifacts = root / 'workspaces', root / 'artifacts'
    workflow = render_workflow((ROOT / 'WORKFLOW.md').read_text(),args.role,workspaces,artifacts,ROOT / 'export_artifacts.py',True)
    workflow = workflow.replace('kind: github\n  provider:\n    repo: civicascentai-ui/civicascentai\n    token: $SYMPHONY_GITHUB_TOKEN','kind: memory')
    workflow_file = root / 'WORKFLOW.md'
    workflow_file.write_text(workflow)
    code = '''read = fn ->
 s = Jason.decode!(File.read!(SNAPSHOT))
 age = System.system_time(:millisecond) / 1000 - s["fetched_at"]
 if s["schema"] != 1 or s["repository"] != REPO or age < 0 or age > 125, do: raise("stale or foreign snapshot")
 if not is_list(s["issues"]), do: raise("invalid snapshot issues")
 ids = Enum.map(s["issues"], & &1["id"])
 if length(ids) != MapSet.size(MapSet.new(ids)), do: raise("duplicate issue ids")
 Enum.each(s["issues"], fn i ->
  id = i["id"]
  if not is_binary(id) or not Regex.match?(~r/^[1-9][0-9]*$/, id), do: raise("invalid issue id")
  if i["identifier"] != ("GH-" <> id) or i["url"] != ("https://github.com/" <> REPO <> "/issues/" <> id) or i["state"] not in ["open", "closed"], do: raise("invalid issue scope")
  if not is_binary(i["title"]) or not is_binary(i["description"]) or i["dispatchable"] != true, do: raise("invalid issue text")
  if not is_list(i["labels"]) or not Enum.all?(i["labels"], &is_binary/1), do: raise("invalid labels")
 end)
 Enum.map(s["issues"], fn i -> %SymphonyElixir.Tracker.Issue{id: i["id"], identifier: i["identifier"], title: i["title"], description: i["description"], state: i["state"], labels: i["labels"], url: i["url"], dispatchable: i["dispatchable"]} end)
end
Application.put_env(:symphony_elixir, :memory_tracker_issues, read.())
loop = fn loop ->
 Process.sleep(1000)
 try do
  Application.put_env(:symphony_elixir, :memory_tracker_issues, read.())
  loop.(loop)
 rescue
  _ -> File.write!(ERROR, "snapshot rejected")
 end
end
spawn(fn -> loop.(loop) end)
SymphonyElixir.CLI.main(ARGS)
'''.replace('SNAPSHOT',json.dumps(str(snapshot_file))).replace('REPO',json.dumps(REPO)).replace('ERROR',json.dumps(str(error_file))).replace('ARGS',json.dumps([ACK,'--logs-root',str(root/'logs'),str(workflow_file)]))
    launch = root / 'launch.exs'
    launch.write_text(code)
    env = {k:v for k,v in os.environ.items() if k in {'HOME','PATH','LANG','LC_ALL','TMPDIR','HTTP_PROXY','HTTPS_PROXY','NO_PROXY'}}
    env.update(CODEX_HOME=str(profile),PATH=str(codex.parent)+':'+env.get('PATH',''),ROOTDIR=str(release),
               BINDIR=str(release/'erts-16.4/bin'),EMU='beam',PROGNAME='erl')
    command = [str(release/'erts-16.4/bin/erlexec'),'-noshell','-boot_var','RELEASE_LIB',str(release/'lib'),
       '-config',str(release/'releases/0.0.3/sys.config'),'-boot',str(release/'releases/0.0.3/start_clean'),
       '-eval',"'Elixir.Code':eval_file(<<"+json.dumps(str(launch))+">>)."]
    required = ['symphony-pilot'] + ([ROLES[args.role][0]] if args.role != 'proof' else [])
    result = {'run_root':str(root),'tracker':'public-read memory bridge','role':args.role,'snapshots':1,
              'issues_seen':len(snapshot['issues']),'eligible_tasks_seen':sum(i['state']=='open' and all(label in [s.strip().casefold() for s in i['labels']] for label in required) for i in snapshot['issues']),
              'api_state_received':False,'polling_error':False,'operator_blocked':False,'stop_reason':'unexpected_exit'}
    with (root/'runtime.log').open('w') as log:
        p = subprocess.Popen(command,cwd=ROOT,env=env,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
        try:
            deadline, next_poll = time.monotonic()+args.seconds,time.monotonic()+60
            while p.poll() is None and time.monotonic()<deadline:
                for w in workspaces.glob('*'):
                    export_workspace(w,artifacts)
                if error_file.exists():
                    result['polling_error']=True
                    break
                if time.monotonic()>=next_poll:
                    try:
                        new = fetch_snapshot()
                        publish_snapshot(snapshot_file,new,snapshot)
                        snapshot=new
                        result['snapshots']+=1
                        next_poll=time.monotonic()+60
                    except (OSError,ValueError,RuntimeError):
                        result['polling_error']=True
                        break
                try:
                    with urllib.request.urlopen('http://127.0.0.1:4318/api/v1/state',timeout=2) as response:
                        state=json.load(response)
                    (root/'state.json').write_text(json.dumps(state,indent=2))
                    result['api_state_received']=True
                    if state.get('blocked'):
                        result['operator_blocked']=True
                        result['stop_reason']='operator_blocked'
                        break
                except (urllib.error.URLError,ValueError):
                    pass
                time.sleep(1)
            if result['polling_error']:
                result['stop_reason']='polling_error'
            elif p.poll() is None and time.monotonic()>=deadline and not result['operator_blocked']:
                result['stop_reason']='bounded_timeout'
            result['unexpected_exit']=p.poll() is not None
        finally:
            try:
                os.killpg(p.pid,signal.SIGTERM)
                p.wait(timeout=5)
            except subprocess.TimeoutExpired:
                os.killpg(p.pid,signal.SIGKILL)
                p.wait()
            except ProcessLookupError:
                p.wait()
            try:
                os.killpg(p.pid,signal.SIGKILL)
            except ProcessLookupError:
                pass
            for w in workspaces.glob('*'):
                export_workspace(w,artifacts)
    stopped=False
    for _ in range(20):
        try: os.killpg(p.pid,0)
        except ProcessLookupError:
            stopped=True
            break
        time.sleep(0.1)
    result['runtime_stopped']=p.poll() is not None and stopped
    result['passed']=result['api_state_received'] and not result['polling_error'] and not result['operator_blocked'] and not result['unexpected_exit'] and result['stop_reason']=='bounded_timeout' and result['runtime_stopped']
    (root/'result.json').write_text(json.dumps(result,indent=2))
    print(json.dumps(result,indent=2))
    if not result['passed']:
        raise SystemExit(1)
