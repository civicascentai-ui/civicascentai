"""Check a restored host without reading or exporting credential contents."""
import argparse
import hashlib
import json
import os
import shutil
import subprocess
import tempfile
import tomllib
from pathlib import Path
from install import SYMPHONY_SHA256, CODEX_VERSION

ROOT = Path(__file__).resolve().parent

def check(profile, binary, codex):
    profile = Path(profile).resolve()
    env = {k: v for k, v in os.environ.items() if k in
           {'HOME', 'PATH', 'LANG', 'LC_ALL', 'TMPDIR', 'HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY'}}
    env['CODEX_HOME'] = str(profile)
    result = {'isolated_profile': profile != (Path.home() / '.codex').resolve(),
              'binary_checksum': hashlib.sha256(Path(binary).read_bytes()).hexdigest() == SYMPHONY_SHA256,
              'capability_drop_available': bool(shutil.which('setpriv'))}
    config = profile / 'config.toml'
    conf = tomllib.loads(config.read_text()) if config.exists() else {}
    result['profile_config_allowed'] = not (set(conf) - {'approval_policy', 'sandbox_mode', 'openai_base_url', 'chatgpt_base_url'})
    if not result['isolated_profile'] or not result['profile_config_allowed']:
        result['passed'] = False
        return result
    login = subprocess.run([str(codex), 'login', 'status'], env=env,
                           capture_output=True, timeout=20)
    result['authenticated'] = login.returncode == 0
    version = subprocess.run([str(codex), '--version'], env=env,
                             capture_output=True, text=True, timeout=20)
    result['pinned_cli'] = version.returncode == 0 and version.stdout.strip() == 'codex-cli ' + CODEX_VERSION
    if result['capability_drop_available']:
        with tempfile.TemporaryDirectory(prefix='host-probe-', dir=ROOT) as tmp:
            parent = Path(tmp)
            work = parent / 'workspace'
            work.mkdir()
            program = "import pathlib,json; p=pathlib.Path('inside.txt'); p.write_text('ok'); denied=False\ntry: pathlib.Path('../outside.txt').write_text('forbidden')\nexcept OSError: denied=True\nprint(json.dumps({'inside_write':p.read_text()=='ok','outside_write_denied':denied}))"
            probe = subprocess.run(['setpriv', '--bounding-set=-all', '--inh-caps=-all',
                '--ambient-caps=-all', str(codex), 'sandbox', '-c', 'sandbox_mode="workspace-write"',
                '--', 'python3', '-c', program], cwd=work, env=env,
                capture_output=True, text=True, timeout=30)
            try:
                detail = json.loads(probe.stdout.strip())
            except ValueError:
                detail = {}
            result['sandbox_write_confinement'] = (probe.returncode == 0 and
                detail.get('inside_write') is True and detail.get('outside_write_denied') is True
                and not (parent / 'outside.txt').exists())
    else:
        result['sandbox_write_confinement'] = False
    result['passed'] = all(result.values())
    return result

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--profile', required=True)
    parser.add_argument('--binary', default=str(ROOT / '.runtime/bin/symphony'))
    parser.add_argument('--codex', default=str(ROOT / '.runtime/codex/node_modules/.bin/codex'))
    args = parser.parse_args()
    checks = check(args.profile, args.binary, args.codex)
    print(json.dumps(checks, indent=2))
    raise SystemExit(0 if checks['passed'] else 1)
