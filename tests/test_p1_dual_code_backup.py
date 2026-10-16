"""Independent fixtures: full, incremental and no-change Git restore chains."""
import json
import pathlib
import subprocess
import sys
import tempfile
import unittest

SCRIPT = pathlib.Path(__file__).resolve().parents[1] / 'tools' / 'p1_dual_code_backup.py'

def run(*args):
    result = subprocess.run(args, capture_output=True, text=True)
    if result.returncode:
        raise AssertionError(
            "Recovery fixture subprocess failed: " + repr(args)
            + "\\nSTDERR: " + result.stderr[-4000:]
            + "\\nSTDOUT: " + result.stdout[-4000:]
        )
    return result.stdout.strip()

class RecoveryChainTests(unittest.TestCase):
    def test_workflow_shell_arguments_expand_and_default(self):
        """Exercise the actual workflow argument expressions using Bash."""
        import os
        workflow = (SCRIPT.parents[1] / '.github/workflows/p1-dual-code-backups.yml').read_text()
        previous_line = workflow.split('--previous-id ', 1)[1].splitlines()[0].strip()
        self.assertTrue(previous_line.endswith(chr(92)), 'expected continuation')
        previous = previous_line[:-1].strip()
        mode = workflow.split('--mode ', 1)[1].splitlines()[0].strip()
        for overrides, expected in (
            ({}, ['', 'auto']),
            ({'PREVIOUS_ID': '1234', 'INPUT_MODE': 'full'}, ['1234', 'full']),
        ):
            env = os.environ.copy()
            env.pop('PREVIOUS_ID', None)
            env.pop('INPUT_MODE', None)
            env.update(overrides)
            checked = subprocess.run(
                ['bash', '-c', f'set -- {previous} {mode}; printf "%s\\n" "$1" "$2"'],
                env=env, capture_output=True, text=True, check=True,
            )
            self.assertEqual(checked.stdout.splitlines(), expected)

    def test_full_incremental_and_unchanged_restore_both_branches(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = pathlib.Path(tmp)
            repo = root / 'repo'
            repo.mkdir()
            run('git', 'init', '-q', str(repo))
            run('git', '-C', str(repo), 'config', 'user.email', 'backup-test@example.invalid')
            run('git', '-C', str(repo), 'config', 'user.name', 'Backup Test')
            (repo / 'file.txt').write_text('original\n')
            run('git', '-C', str(repo), 'add', '.')
            run('git', '-C', str(repo), 'commit', '-qm', 'base')
            run('git', '-C', str(repo), 'branch', '-M', 'main')
            run('git', '-C', str(repo), 'branch', 'production/shadow-concat-20261014')

            def sync():
                for b in ('main', 'production/shadow-concat-20261014'):
                    run('git', '-C', str(repo), 'update-ref', 'refs/remotes/origin/' + b, b)

            def backup(run_id, weekday, previous=''):
                run(sys.executable, str(SCRIPT), '--repo', str(repo),
                    '--output', str(root / 'backups' / run_id),
                    '--history', str(root / 'backups'),
                    '--run-id', run_id, '--previous-id', previous,
                    '--weekday', str(weekday),
                '--standby-ref', 'refs/remotes/origin/production/shadow-concat-20261014')
                return json.loads((root / 'backups' / run_id / 'manifest.json').read_text())

            sync()
            full = backup('100', 7)
            self.assertEqual([full['environments'][n]['kind'] for n in ('production','shadow')],
                             ['full', 'full'])
            (repo / 'file.txt').write_text('production changed\n')
            run('git', '-C', str(repo), 'add', '.')
            run('git', '-C', str(repo), 'commit', '-qm', 'change')
            sync()
            daily = backup('101', 1, '100')
            self.assertEqual(daily['environments']['production']['kind'], 'incremental')
            self.assertEqual(daily['environments']['shadow']['kind'], 'unchanged')
            unchanged = backup('102', 2, '101')
            self.assertEqual(unchanged['status'], 'restored-and-verified-git-code-only')
            self.assertEqual([unchanged['environments'][n]['kind'] for n in ('production','shadow')],
                             ['unchanged', 'unchanged'])

if __name__ == '__main__':
    unittest.main()
