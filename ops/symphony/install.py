#!/usr/bin/env python3
"""Install pinned official runtimes; never reads or writes credentials."""
import hashlib
import platform
import shutil
import subprocess
import urllib.request
from pathlib import Path

SYMPHONY_VERSION = '0.0.3'
CODEX_VERSION = '0.162.1'
SYMPHONY_SHA256 = 'ea35a04a54a6d37c0cafe3f195da871e47614a8c05765b90dbb4cac32e1435ee'
ROOT = Path(__file__).resolve().parent

def main():
    if platform.system() != 'Linux' or platform.machine() not in ('x86_64', 'amd64'):
        raise SystemExit('This tested installer supports Linux x86_64 only.')
    if not shutil.which('npm') or not shutil.which('git'):
        raise SystemExit('Install Node/npm and git before running the installer.')
    runtime = ROOT / '.runtime'
    (runtime / 'bin').mkdir(parents=True, exist_ok=True)
    target = runtime / 'bin/symphony'
    url = f'https://github.com/openai/symphony/releases/download/v{SYMPHONY_VERSION}/symphony-v{SYMPHONY_VERSION}-linux_x86_64'
    data = urllib.request.urlopen(url, timeout=60).read()
    if hashlib.sha256(data).hexdigest() != SYMPHONY_SHA256:
        raise SystemExit('Checksum mismatch: downloaded executable was not installed.')
    target.write_bytes(data)
    target.chmod(0o755)
    subprocess.run(['npm', 'install', '--prefix', str(runtime / 'codex'),
                    f'@openai/codex@{CODEX_VERSION}', '--no-audit', '--no-fund'], check=True)
    print('Pinned runtimes installed; Symphony checksum verified. No service started.')

if __name__ == '__main__':
    main()
