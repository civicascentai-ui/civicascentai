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
        raise RuntimeError('Git recovery check failed (exit '
                           + str(p.returncode) + '): '
                           + (p.stderr or p.stdout).strip()[-4000:])
    return p.stdout.strip()

def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def load_manifest(path):
    with path.open(encoding='utf-8') as f:
        data = json.load(f)
    if data.get('schema') != 1 or data.get('scope') != 'git-code-only':
        raise ValueError(f'Unrecognized recovery manifest: {path}')
    return data

def validate_chain_manifest(manifest, chain, index, is_current=False):
    """Fail closed on gaps, unverified artifacts, or tampered parent links."""
    run_id = str(chain[index])
    expected_prefix = [str(x) for x in chain[:index + 1]]
    if str(manifest.get('run_id')) != run_id:
        raise ValueError(f'Manifest/run mismatch: {run_id}')
    if manifest.get('chain_runs') != expected_prefix:
        raise ValueError(f'Recovery chain prefix mismatch: {run_id}')
    if len(expected_prefix) != len(set(expected_prefix)):
        raise ValueError('Duplicate recovery chain IDs')
    expected_parent = str(chain[index - 1]) if index else None
    if manifest.get('previous_run_id') != expected_parent:
        raise ValueError(f'Recovery chain parent mismatch: {run_id}')
    expected_mode = 'full' if index == 0 else 'incremental'
    if manifest.get('backup_mode') != expected_mode:
        raise ValueError(f'Recovery mode mismatch: {run_id}')
    if manifest.get('status') != ('unverified' if is_current else 'restored-and-verified-git-code-only'):
        raise ValueError(f'Unverified recovery chain entry: {run_id}')
    envs = manifest.get('environments')
    if not isinstance(envs, dict) or set(envs) != set(SOURCE_REFS):
        raise ValueError(f'Incomplete recovery environment inventory: {run_id}')
    for name, entry in envs.items():
        if entry.get('kind') not in (('full',) if index == 0 else ('incremental', 'unchanged')):
            raise ValueError(f'Invalid recovery bundle kind for {name}: {run_id}')
        expected_bundle = f"{name}-{entry['kind']}.bundle" if entry['kind'] != 'unchanged' else None
        if entry.get('bundle') != expected_bundle:
            raise ValueError(f'Unsafe or incorrect bundle path for {name}: {run_id}')
        if entry['kind'] == 'unchanged' and entry.get('sha256') is not None:
            raise ValueError(f'Unexpected digest for unchanged {name}: {run_id}')


def restore_chain(chain, root, current_dir):
    with tempfile.TemporaryDirectory(prefix='p1-recovery-') as temp:
        for name in SOURCE_REFS:
            dest = pathlib.Path(temp) / name
            git('init', '--bare', '-q', str(dest))
            last = None
            for run_id in chain:
                bundle_root = current_dir if run_id == chain[-1] else root / run_id
                manifest = load_manifest(bundle_root / 'manifest.json')
                validate_chain_manifest(manifest, chain, chain.index(run_id),
                                        is_current=(run_id == chain[-1]))
                entry = manifest['environments'][name]
                if entry['kind'] != 'unchanged':
                    archive = bundle_root / entry['bundle']
                    if sha256(archive) != entry['sha256']:
                        raise ValueError(f'Checksum mismatch: {archive}')
                    # Incremental fetch requires the previous backed-up Git objects.
                    # Git fetch can launch asynchronous auto-maintenance, leaving
                    # transient .tmp-*.pack files while the immediate fsck runs.
                    # Disable auto-maintenance ONLY for this isolated restore
                    # fetch; keep the full fsck integrity check mandatory.
                    git('-C', str(dest), '-c', 'maintenance.auto=false',
                        '-c', 'gc.auto=0', 'fetch', '-q', str(archive),
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
        parent_chain = previous.get('chain_runs')
        if not isinstance(parent_chain, list) or not parent_chain or parent_chain[-1] != args.previous_id:
            raise ValueError('Invalid previous recovery chain')
        if previous.get('status') != 'restored-and-verified-git-code-only':
            raise ValueError('Unverified previous recovery manifest')
        if len(parent_chain) != len(set(parent_chain)) or previous.get('backup_mode') not in ('full', 'incremental'):
            raise ValueError('Invalid previous recovery chain manifest')
        if previous.get('previous_run_id') != (parent_chain[-2] if len(parent_chain) > 1 else None):
            raise ValueError('Previous recovery chain parent mismatch')
        if set(previous.get('environments', {})) != set(SOURCE_REFS):
            raise ValueError('Incomplete previous recovery environment list')
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
