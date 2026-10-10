"""Patch-completeness regression tests using real isolated Git repositories."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

from assignment_checks import validate_assignment


class AssignmentChecksTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name) / 'workspace'
        self.root.mkdir()
        self.artifacts = Path(self.temp.name) / 'artifacts'
        self.artifacts.mkdir()
        self.git('init', '-q')
        (self.root / 'file.py').write_text('answer = 1\n')
        (self.root / 'other.py').write_text('unchanged = True\n')
        self.git('add', '-A')
        self.git('-c', 'user.name=Test', '-c', 'user.email=test@invalid', 'commit', '-qm', 'baseline')
        self.sha = self.git('rev-parse', 'HEAD').decode().strip()
        self.export([], b'')

    def tearDown(self):
        self.temp.cleanup()

    def git(self, *args):
        return subprocess.check_output(['git', '-C', str(self.root), *args], stderr=subprocess.DEVNULL)

    def export(self, paths, patch):
        (self.artifacts / 'changed-files.txt').write_text(''.join(p + '\n' for p in paths))
        (self.artifacts / 'changes.patch').write_bytes(patch)

    def validate(self, paths=None):
        return validate_assignment(self.root, self.artifacts, self.sha, paths or ['file.py', 'new.py'])

    def fix(self):
        (self.root / 'file.py').write_text('answer = 2\n')
        self.export(['file.py'], self.git('diff', '--binary', self.sha))

    def test_valid_tracked_fix(self):
        self.fix()
        self.assertTrue(self.validate()['passed'])

    def test_valid_new_file_patch(self):
        (self.root / 'new.py').write_text('new = True\n')
        # git diff does not export untracked files; no-index supplies their patch.
        result = subprocess.run(['git', '-C', str(self.root), 'diff', '--no-index', '--binary', '--', '/dev/null', 'new.py'], capture_output=True)
        self.assertEqual(result.returncode, 1)
        self.export(['new.py'], result.stdout)
        self.assertTrue(self.validate()['passed'])

    def test_omitted_new_file(self):
        self.fix()
        (self.root / 'new.py').write_text('missing = True\n')
        self.assertFalse(self.validate()['passed'])
        self.export(['file.py', 'new.py'], self.git('diff', '--binary', self.sha))
        result = self.validate()
        self.assertFalse(result['passed'])
        self.assertIn('incomplete', result['errors'][0])

    def test_extra_outside_path(self):
        self.fix()
        (self.root / 'other.py').write_text('changed = True\n')
        self.export(['file.py', 'other.py'], self.git('diff', '--binary', self.sha))
        self.assertFalse(self.validate()['passed'])

    def test_edited_head(self):
        self.fix()
        self.git('add', '-A')
        self.git('-c', 'user.name=Test', '-c', 'user.email=test@invalid', 'commit', '-qm', 'forbidden')
        self.assertFalse(self.validate()['passed'])

    def test_incomplete_patch(self):
        self.fix()
        self.export(['file.py'], b'')
        self.assertFalse(self.validate()['passed'])

    def test_patch_extra_change(self):
        self.fix()
        patch = (self.artifacts / 'changes.patch').read_bytes()
        (self.root / 'other.py').write_text('changed = True\n')
        extra = self.git('diff', '--binary', self.sha, '--', 'other.py')
        (self.root / 'other.py').write_text('unchanged = True\n')
        self.export(['file.py'], patch + extra)
        self.assertFalse(self.validate()['passed'])

    def test_unchanged_noop_report(self):
        self.assertTrue(self.validate()['passed'])

    def test_staged_changes(self):
        self.fix()
        self.git('add', 'file.py')
        self.assertFalse(self.validate()['passed'])

    def test_symlink_and_deletion(self):
        (self.root / 'new.py').symlink_to('/etc/passwd')
        self.assertFalse(self.validate()['passed'])
        (self.root / 'new.py').unlink()
        (self.root / 'file.py').unlink()
        self.export(['file.py'], self.git('diff', self.sha))
        self.assertFalse(self.validate()['passed'])

    def test_evidence_regular_files_allowed_but_symlinks_rejected(self):
        evidence = self.root / '.symphony-evidence'
        evidence.mkdir()
        (evidence / 'summary.md').write_text('No changes needed.\n')
        self.assertTrue(self.validate()['passed'])
        (evidence / 'unsafe').symlink_to('/etc/passwd')
        self.assertFalse(self.validate()['passed'])

    def test_new_secret_filename_and_ignored_file(self):
        (self.root / '.env').write_text('TEST=synthetic\n')
        self.assertFalse(self.validate(['.env'])['passed'])
        (self.root / '.env').unlink()
        (self.root / '.git' / 'info' / 'exclude').write_text('new.py\n')
        (self.root / 'new.py').write_text('ignored = True\n')
        self.assertFalse(self.validate()['passed'])

    def test_tracked_secret_file_modification_rejected(self):
        (self.root / '.env').write_text('TEST=baseline\n')
        self.git('add', '.env')
        self.git('-c', 'user.name=Test', '-c', 'user.email=test@invalid', 'commit', '-qm', 'secret fixture baseline')
        self.sha = self.git('rev-parse', 'HEAD').decode().strip()
        (self.root / '.env').write_text('TEST=changed\n')
        self.export(['.env'], self.git('diff', '--binary', self.sha))
        result = self.validate(['.env'])
        self.assertFalse(result['passed'])
        self.assertIn('Credential-looking', result['errors'][0])

    def test_executable_mode_must_be_preserved(self):
        os.chmod(self.root / 'file.py', 0o755)
        self.export(['file.py'], self.git('diff', '--binary', self.sha))
        self.assertTrue(self.validate()['passed'])
        self.export(['file.py'], b'')
        self.assertFalse(self.validate()['passed'])

    def test_oversized_and_unsafe_artifact(self):
        (self.artifacts / 'changes.patch').write_bytes(b'x' * (2 * 1024 * 1024 + 1))
        self.assertFalse(self.validate()['passed'])
        self.export(['../outside'], b'')
        self.assertFalse(self.validate()['passed'])
        (self.artifacts / 'changes.patch').unlink()
        (self.artifacts / 'changes.patch').symlink_to(self.root / 'file.py')
        self.assertFalse(self.validate()['passed'])


if __name__ == '__main__':
    unittest.main()
