"""Remove only generated trust metadata for this package's disposable workspaces."""
import json
import tomllib
from pathlib import Path

ALLOWED = {'approval_policy', 'sandbox_mode', 'openai_base_url', 'chatgpt_base_url'}

def normalize_profile_config(profile, workload_root):
    config = Path(profile) / 'config.toml'
    if not config.exists():
        return True
    conf = tomllib.loads(config.read_text())
    if set(conf) - (ALLOWED | {'projects'}):
        return False
    if any(not isinstance(v, str) for k, v in conf.items() if k in ALLOWED):
        return False
    projects = conf.get('projects', {})
    if not isinstance(projects, dict):
        return False
    root = Path(workload_root).resolve()
    for name, settings in projects.items():
        path = Path(name).resolve()
        scoped = path.is_relative_to(root / 'evidence') or path.is_relative_to(root / '.runtime/runs')
        if not scoped or 'workspaces' not in path.relative_to(root).parts:
            return False
        if not isinstance(settings, dict) or set(settings) != {'trust_level'} or settings['trust_level'] not in {'trusted', 'untrusted'}:
            return False
    if 'projects' in conf:
        # Remove temporary trust entries, preserving allowed scalar settings.
        # Refused configurations remain unchanged. Auth credentials are untouched.
        text = ''.join(k + ' = ' + json.dumps(v) + '\n' for k, v in conf.items() if k in ALLOWED)
        config.write_text(text)
    return True
