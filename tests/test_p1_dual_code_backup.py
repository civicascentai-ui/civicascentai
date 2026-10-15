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
        # Synthetic fixtures only: expose diagnostics for intermittent Git fsck.
        print("Synthetic subprocess failed:", " ".join(args), file=sys.stderr)
        print("Synthetic STDERR:", result.stderr[-4000:], file=sys.stderr)
        raise subprocess.CalledProcessError(result.returncode, args,
                                            output=result.stdout,
                                            stderr=result.stderr)
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

    def test_legacy_sunday_smoke_checks_stable_standby_alias(self):
        workflow = (SCRIPT.parents[1] / '.github/workflows/p1-disaster-recovery.yml').read_text()
        self.assertIn('SHADOW_URL: https://civicascentai-launch-qa.vercel.app/', workflow)
        self.assertNotIn('civicascentai-launch-9rj1lutsy-civicascentai.vercel.app', workflow)
        self.assertIn("test \"$status\" = 200", workflow)

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

            # Independent anti-corruption cases: never extend an unverified chain.
            manifest_file = root / 'backups' / '101' / 'manifest.json'
            baseline = json.loads(manifest_file.read_text())
            corrupted = dict(baseline)
            corrupted['status'] = 'unverified'
            manifest_file.write_text(json.dumps(corrupted))
            with self.assertRaises(subprocess.CalledProcessError):
                backup('103', 3, '101')
            corrupted = dict(baseline)
            corrupted['chain_runs'] = ['101']
            manifest_file.write_text(json.dumps(corrupted))
            with self.assertRaises(subprocess.CalledProcessError):
                backup('104', 3, '101')
            manifest_file.write_text(json.dumps(baseline))

            # A verified parent must remain restorable after these rejected attempts.
            try:
                recovered = backup('105', 3, '101')
            except subprocess.CalledProcessError as exc:
                self.fail("Valid chain recovery unexpectedly failed: "
                          + str(exc.returncode) + "\nSTDERR:\n" + (exc.stderr or "")
                          + "\nSTDOUT:\n" + (exc.stdout or ""))
            self.assertEqual(recovered['status'], 'restored-and-verified-git-code-only')
            self.assertEqual(recovered['chain_runs'], ['100', '101', '105'])


if __name__ == '__main__':
    unittest.main()
