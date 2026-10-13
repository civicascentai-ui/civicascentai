"""Verify a scoped assignment and its exported patch before disposable cleanup.

No network or credentials are used. allowed_paths are exact repository-relative
file names, not globs. Deletions are deliberately never authorized here.
"""
import io
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import tarfile
import tempfile

MAX_PATCH_BYTES = 2 * 1024 * 1024
MAX_FILE_BYTES = 8 * 1024 * 1024
SECRET_NAME = re.compile(r'(^|/)(\.env(?:\..*)?|auth\.json|credentials(?:\..*)?|id_(?:rsa|ed25519|ecdsa)|[^/]*\.(?:pem|key|p12|pfx))$', re.I)


class ValidationError(ValueError):
    pass


def _git(root, *args, input=None):
    result = subprocess.run(['git', '--no-replace-objects', '-c', 'core.hooksPath=/dev/null', '-c',
                             'core.fsmonitor=false', '-C', str(root), *args],
                            input=input, capture_output=True, timeout=30,
                            env={**os.environ, 'GIT_CONFIG_NOSYSTEM': '1',
                                 'GIT_CONFIG_GLOBAL': '/dev/null', 'GIT_EXTERNAL_DIFF': '',
                                 'GIT_INDEX_FILE': str(Path(root) / '.git' / 'index')})
    if result.returncode:
        raise ValidationError('Git verification failed: ' + ' '.join(args[:2]))
    return result.stdout


def _safe_path(name):
    if not isinstance(name, str) or not name or any(c in name for c in '\\\x00\r\n'):
        raise ValidationError('Unsafe path')
    path = PurePosixPath(name)
    if path.is_absolute() or any(p in ('', '.', '..', '.git') for p in name.split('/')) or ':' in name:
        raise ValidationError('Unsafe path: ' + name)
    return name


def _paths(raw):
    return [_safe_path(p.decode('utf-8', 'strict')) for p in raw.split(b'\0') if p]


def _inventory(root, exclude_evidence=False):
    result = {}
    for base, dirs, files in os.walk(root, followlinks=False):
        relative = Path(base).relative_to(root)
        dirs[:] = [d for d in dirs if not (relative == Path('.') and (d == '.git' or (exclude_evidence and d == '.symphony-evidence')))]
        for name in dirs + files:
            path = Path(base) / name
            if path.is_symlink():
                raise ValidationError('Symlink is forbidden: ' + str(path.relative_to(root)))
        for name in files:
            path = Path(base) / name
            rel = _safe_path(path.relative_to(root).as_posix())
            if relative == Path('.') and name == '.git':
                raise ValidationError('A worktree Git pointer is unsupported')
            if not path.is_file() or path.stat().st_size > MAX_FILE_BYTES:
                raise ValidationError('Nonregular or oversized file: ' + rel)
            result[rel] = (path.read_bytes(), bool(path.stat().st_mode & 0o111))
    return result


def _regular_artifact(root, name):
    path = root / name
    if path.is_symlink() or not path.is_file() or path.stat().st_size > MAX_PATCH_BYTES:
        raise ValidationError('Missing, unsafe, or oversized artifact: ' + name)
    return path.read_bytes()


def validate_assignment(workspace, artifactdir, baseline_sha, allowed_paths):
    """Return passed, checks, changed_paths, and errors; never modify workspace."""
    checks = {}
    changed = []
    try:
        workspace, artifactdir = Path(workspace), Path(artifactdir)
        if workspace.is_symlink() or not workspace.is_dir() or artifactdir.is_symlink() or not artifactdir.is_dir():
            raise ValidationError('Workspace and artifact directory must be real directories')
        if (workspace / '.git').is_symlink() or not (workspace / '.git').is_dir():
            raise ValidationError('A real local Git directory is required')
        if not isinstance(allowed_paths, list) or not allowed_paths:
            raise ValidationError('Explicit nonempty allowed_paths list required')
        allowed = {_safe_path(p) for p in allowed_paths}
        if any(p.startswith('.symphony-evidence/') or p == '.symphony-evidence' for p in allowed):
            raise ValidationError('Evidence is not an authorized source path')
        if not isinstance(baseline_sha, str) or not re.fullmatch(r'[0-9a-f]{40}|[0-9a-f]{64}', baseline_sha):
            raise ValidationError('Full baseline commit SHA required')
        head = _git(workspace, 'rev-parse', 'HEAD').decode().strip()
        baseline = _git(workspace, 'rev-parse', baseline_sha + '^{commit}').decode().strip()
        if head != baseline or baseline != baseline_sha:
            raise ValidationError('Assignment changed HEAD or baseline is ambiguous')
        checks['head_unchanged'] = True
        if _git(workspace, 'diff', '--cached', '--name-only', '-z'):
            raise ValidationError('Staged changes are forbidden')
        checks['no_staged_changes'] = True
        # Inspect evidence too, even though it is excluded from source comparison.
        actual = _inventory(workspace)
        source = {p: v for p, v in actual.items() if not p.startswith('.symphony-evidence/')}
        tracked = _paths(_git(workspace, 'diff', '--no-ext-diff', '--no-renames', '--name-only', '-z', baseline, '--'))
        new = _paths(_git(workspace, 'ls-files', '--others', '-z'))
        changed = sorted(set(tracked + [p for p in new if not p.startswith('.symphony-evidence/')]))
        if any(p not in allowed for p in changed):
            raise ValidationError('Source change outside explicit allowlist')
        if any(p not in source for p in changed):
            raise ValidationError('Deletion or nonregular source change is forbidden')
        if any(SECRET_NAME.search(p) for p in changed):
            raise ValidationError('Credential-looking source change is forbidden')
        checks['scoped_regular_changes'] = True
        listing = _regular_artifact(artifactdir, 'changed-files.txt').decode('utf-8', 'strict')
        exported = [_safe_path(p) for p in listing.splitlines()]
        if len(exported) != len(set(exported)) or sorted(exported) != changed:
            raise ValidationError('Exported changed-files.txt does not match actual changes')
        checks['changed_files_exact'] = True
        patch = _regular_artifact(artifactdir, 'changes.patch')
        with tempfile.TemporaryDirectory(prefix='sam-patch-check-') as tmp:
            root = Path(tmp)
            archive = _git(workspace, 'archive', '--format=tar', baseline)
            with tarfile.open(fileobj=io.BytesIO(archive)) as tar:
                for member in tar.getmembers():
                    name = _safe_path(member.name.rstrip('/'))
                    destination = root / name
                    if member.isdir():
                        destination.mkdir(parents=True, exist_ok=True)
                    elif member.isfile():
                        if member.size > MAX_FILE_BYTES:
                            raise ValidationError('Oversized baseline file')
                        destination.parent.mkdir(parents=True, exist_ok=True)
                        destination.write_bytes(tar.extractfile(member).read())
                        destination.chmod(0o755 if member.mode & 0o111 else 0o644)
                    else:
                        raise ValidationError('Symlink or special file in baseline')
            _git(root, 'init', '-q')
            _git(root, 'add', '-f', '-A')
            _git(root, '-c', 'user.name=Sam Validator', '-c', 'user.email=sam-validator@invalid', 'commit', '-qm', 'baseline')
            if patch:
                _git(root, 'apply', '--check', '--index', '--binary', '-', input=patch)
                _git(root, 'apply', '--index', '--binary', '-', input=patch)
            if _inventory(root) != source:
                raise ValidationError('Exported patch is incomplete or contains extra changes')
        checks['patch_recreates_workspace'] = True
        return {'passed': True, 'checks': checks, 'changed_paths': changed, 'errors': []}
    except (ValidationError, OSError, UnicodeError, subprocess.TimeoutExpired, tarfile.TarError) as exc:
        return {'passed': False, 'checks': checks, 'changed_paths': changed, 'errors': [str(exc)]}
