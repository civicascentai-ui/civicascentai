#!/usr/bin/env python3
"""P1 Git-code recovery chain for production/shadow source refs; NOT database backup."""
import argparse
import datetime as dt
import hashlib
import json
import pathlib
import subprocess
import tempfile

# Verified Vercel standby alias civicascentai-launch-qa.vercel.app was deployed
# from this Git commit (dpl_B6uYcvPPYqaBh7y5zEhQQrjmTJq1), not the
# historical production/shadow-concat-20261014 branch. Re-pin on deployments.
DEFAULT_STANDBY_GIT_SHA = '63e18246756ac615dfa9e7d10248aed0ea4031d6'
SOURCE_REFS = {
    'production': 'refs/remotes/origin/main',
    'shadow': DEFAULT_STANDBY_GIT_SHA,
}

def git(*args, cwd=None):
    p = subprocess.run(['git', *args], cwd=cwd, check=False, text=True,
                       capture_output=True)
    if p.returncode:
        raise RuntimeError(f'Git {args[0]} failed (exit {p.returncode}): '
                           + p.stderr[-2500:])
    return p.stdout.strip()

def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def load_manifest(path):
    with path.open(encoding='utf-8') as f:
        data = json.load(f)
    if data.get('schema') != 1 or data.get('scope') != 'git-code-only':
        raise ValueError(f'Unrecognized recovery manifest: {path}')
    return data

def restore_chain(chain, root, current_dir):
    with tempfile.TemporaryDirectory(prefix='p1-recovery-') as temp:
        for name in SOURCE_REFS:
            dest = pathlib.Path(temp) / name
            git('init', '--bare', '-q', str(dest))
            # These isolated restore repositories are ephemeral. Git's background
            # auto-maintenance can race git fsck and remove a temporary pack file.
            # Disable automatic cleanup here, never disable integrity validation.
            git('-C', str(dest), 'config', 'gc.auto', '0')
            git('-C', str(dest), 'config', 'maintenance.auto', 'false')
            last = None
            for run_id in chain:
                bundle_root = current_dir if run_id == chain[-1] else root / run_id
                manifest = load_manifest(bundle_root / 'manifest.json')
                if str(manifest['run_id']) != str(run_id):
                    raise ValueError(f'Manifest/run mismatch: {run_id}')
                entry = manifest['environments'][name]
                if entry['kind'] != 'unchanged':
                    archive = bundle_root / entry['bundle']
                    if sha256(archive) != entry['sha256']:
                        raise ValueError(f'Checksum mismatch: {archive}')
                    # Incremental fetch requires the previous backed-up Git objects.
                    git('-C', str(dest), 'fetch', '-q', str(archive),
                        f'refs/heads/p1-snapshot-{name}')
                    commit = git('-C', str(dest), 'rev-parse', 'FETCH_HEAD')
                    git('-C', str(dest), 'update-ref', 'refs/heads/recovered', commit)
                last = git('-C', str(dest), 'rev-parse', 'refs/heads/recovered')
                if last != entry['sha']:
                    raise ValueError(f'Restore mismatch for {name} at run {run_id}')
            git('-C', str(dest), 'fsck', '--full', '--no-reflogs')
            expected = load_manifest(current_dir / 'manifest.json')['environments'][name]['sha']
            if last != expected:
                raise ValueError(f'Wrong final {name} commit')
    return True

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--repo', default='.')
    p.add_argument('--output', required=True)
    p.add_argument('--history', required=True)
    p.add_argument('--run-id', required=True)
    p.add_argument('--previous-id', default='')
    p.add_argument('--standby-ref', default=DEFAULT_STANDBY_GIT_SHA,
                   help='Exact deployed standby Git SHA; override in isolated fixtures')
    p.add_argument('--mode', choices=['auto', 'full'], default='auto')
    p.add_argument('--weekday', type=int, choices=range(1, 8), default=None,
                   help='1=Monday through 7=Sunday; only for fixture testing')
    args = p.parse_args()
    out = pathlib.Path(args.output).absolute()
    history = pathlib.Path(args.history).absolute()
    out.mkdir(parents=True, exist_ok=True)
    history.mkdir(parents=True, exist_ok=True)

    today = dt.datetime.now(dt.timezone.utc)
    if args.weekday is None:
        from zoneinfo import ZoneInfo
        weekday = today.astimezone(ZoneInfo('America/Chicago')).isoweekday()
    else:
        weekday = args.weekday
    previous = None
    if args.previous_id:
        previous = load_manifest(history / args.previous_id / 'manifest.json')
        if str(previous['run_id']) != args.previous_id:
            raise ValueError('Previous run ID does not match manifest')
    full = args.mode == 'full' or weekday == 7 or previous is None
    mode = 'full' if full else 'incremental'
    chain = [args.run_id] if full else [*previous['chain_runs'], args.run_id]
    if len(chain) != len(set(chain)) or len(chain) > 9:
        raise ValueError('Recovery chain invalid or Sunday full snapshot overdue')

    environments = {}
    for name, ref in SOURCE_REFS.items():
        if name == 'shadow':
            ref = args.standby_ref
        current = git('-C', args.repo, 'rev-parse', f'{ref}^{{commit}}')
        localref = f'refs/heads/p1-snapshot-{name}'
        git('-C', args.repo, 'update-ref', localref, current)
        old = previous['environments'][name]['sha'] if previous else None
        kind = 'full' if full else 'incremental'
        if not full:
            git('-C', args.repo, 'merge-base', '--is-ancestor', old, current)
            if old == current:
                kind = 'unchanged'
        bundle_name = f'{name}-{kind}.bundle' if kind != 'unchanged' else None
        digest = None
        if bundle_name:
            path = out / bundle_name
            spec = [localref] + ([f'^{old}'] if kind == 'incremental' else [])
            git('-C', args.repo, 'bundle', 'create', str(path), *spec)
            git('-C', args.repo, 'bundle', 'verify', str(path))
            digest = sha256(path)
        environments[name] = {
            'ref': ref, 'sha': current, 'previous_sha': old, 'kind': kind,
            'bundle': bundle_name, 'sha256': digest,
        }

    manifest = {
        'schema': 1, 'scope': 'git-code-only', 'status': 'unverified',
        'run_id': args.run_id, 'previous_run_id': args.previous_id or None,
        'created_at_utc': today.isoformat(), 'weekday_local': weekday,
        'backup_mode': mode, 'chain_runs': chain,
        'initial_bootstrap_full': previous is None and weekday != 7,
        'environments': environments,
        'excluded': ['databases', 'Supabase', 'uploads outside Git',
                     'Vercel project settings', 'environment variables', 'secrets'],
    }
    (out / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    restore_chain(chain, history, out)
    manifest['status'] = 'restored-and-verified-git-code-only'
    (out / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    print(f'PASS: {mode} code backups and isolated Git restore for production and shadow; ' +
          'NOT a full production/Shadow House environment restore.')

if __name__ == '__main__':
    main()
