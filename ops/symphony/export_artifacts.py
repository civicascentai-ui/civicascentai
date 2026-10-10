"""Export a small allowlist of regular evidence files before workspace cleanup."""
import shutil
import sys
from pathlib import Path

ARTIFACTS = ('smoke-result.txt', 'summary.md', 'result.json', 'changes.patch', 'changed-files.txt')
MAX_BYTES = 2 * 1024 * 1024

def export_workspace(workspace, destination):
    workspace = Path(workspace)
    if workspace.is_symlink() or not workspace.is_dir():
        return []
    evidence = workspace / '.symphony-evidence'
    if evidence.is_symlink() or not evidence.is_dir():
        return []
    root = workspace.resolve()
    exported = []
    for name in ARTIFACTS:
        src = evidence / name
        if src.is_symlink() or not src.is_file():
            continue
        if not src.resolve().is_relative_to(root) or src.stat().st_size > MAX_BYTES:
            continue
        out = Path(destination) / workspace.name
        out.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, out / name)
        exported.append(str(out / name))
    return exported

if __name__ == '__main__':
    export_workspace(sys.argv[1], sys.argv[2])
