"""Local safety/routing checks; these do not simulate completed agent work."""
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path
from export_artifacts import export_workspace, MAX_BYTES
from roles import ROLES, render_workflow
from host_check import check

TEMPLATE = (Path(__file__).parent / 'WORKFLOW.md').read_text()

class RoleChecks(unittest.TestCase):
    def test_role_routing_preserves_limits_and_requires_both_labels(self):
        for role, (label, _) in ROLES.items():
            rendered = render_workflow(TEMPLATE, role, Path('/tmp/run-unique/workspaces'),
                                       Path('/tmp/export'), Path('/tmp/exporter.py'))
            self.assertIn('required_labels: [symphony-pilot, ' + label + ']', rendered)
            self.assertIn('root: "/tmp/run-unique/workspaces"', rendered)
            for control in ('max_concurrent_agents: 1', 'max_turns: 1',
                            'approval_policy: on-request', 'thread_sandbox: workspace-write'):
                self.assertIn(control, rendered)
            self.assertIn('before_remove:', rendered)
            self.assertIn('after_run:', rendered)

    def test_unknown_role_refused(self):
        with self.assertRaises(ValueError):
            render_workflow(TEMPLATE, 'deploy', Path('/tmp/w'), Path('/tmp/e'), Path('/tmp/x'))

    def test_workspace_path_is_quoted(self):
        rendered = render_workflow(TEMPLATE, 'qa', Path('/tmp/A: B/workspaces'),
            Path('/tmp/e'), Path('/tmp/x'))
        self.assertIn('root: "/tmp/A: B/workspaces"', rendered)

    def test_proof_and_optional_capability_drop(self):
        rendered = render_workflow(TEMPLATE, 'proof', Path('/tmp/w'), Path('/tmp/e'), Path('/tmp/x'), True)
        self.assertIn('SYMPHONY_CIVICASCENT_PASS', rendered)
        self.assertIn('required_labels: [symphony-pilot]', rendered)
        self.assertIn('setpriv --bounding-set=-all --inh-caps=-all --ambient-caps=-all codex app-server', rendered)

    def test_export_survives_cleanup_and_excludes_secrets_symlinks_and_large_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            workspace = root / 'ISSUE-1'
            evidence = workspace / '.symphony-evidence'
            evidence.mkdir(parents=True)
            outside = root / 'secret.txt'
            outside.write_text('do not export')
            (evidence / 'summary.md').write_text('verified local result')
            (evidence / 'result.json').symlink_to(outside)
            (evidence / 'auth.json').write_text('unlisted')
            (evidence / 'changes.patch').write_bytes(b'x' * (MAX_BYTES + 1))
            dest = root / 'export'
            exported = export_workspace(workspace, dest)
            self.assertEqual(len(exported), 1)
            (evidence / 'summary.md').unlink()
            self.assertEqual((dest / 'ISSUE-1/summary.md').read_text(), 'verified local result')
            self.assertFalse((dest / 'ISSUE-1/result.json').exists())
            self.assertFalse((dest / 'ISSUE-1/auth.json').exists())
            self.assertFalse((dest / 'ISSUE-1/changes.patch').exists())

    def test_symlink_evidence_directory_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            workspace = root / 'ISSUE-2'
            workspace.mkdir()
            external = root / 'external'
            external.mkdir()
            (external / 'summary.md').write_text('outside')
            (workspace / '.symphony-evidence').symlink_to(external, target_is_directory=True)
            self.assertEqual(export_workspace(workspace, root / 'export'), [])

class HostProfileChecks(unittest.TestCase):
    def test_default_profile_refused_before_cli_execution(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            binary = root / 'binary'
            binary.write_bytes(b'test')
            with patch('host_check.Path.home', return_value=root), patch('host_check.subprocess.run') as run:
                self.assertFalse(check(root / '.codex', binary, root / 'codex')['passed'])
                run.assert_not_called()

    def test_integration_profile_refused_before_cli_execution(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            binary = root / 'binary'
            binary.write_bytes(b'test')
            profile = root / 'auth'
            profile.mkdir()
            (profile / 'config.toml').write_text('[mcp_servers.unapproved]\ncommand="example"\n')
            with patch('host_check.subprocess.run') as run:
                self.assertFalse(check(profile, binary, root / 'codex')['passed'])
                run.assert_not_called()

if __name__ == '__main__':
    unittest.main()
