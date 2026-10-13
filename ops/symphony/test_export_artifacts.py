"""Checkpoint export allowlist and safety regression tests."""
import tempfile
import unittest
from pathlib import Path

from export_artifacts import export_workspace, MAX_BYTES


class CheckpointExportTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.workspace = self.root / 'HOST-1'
        self.evidence = self.workspace / '.symphony-evidence'
        self.evidence.mkdir(parents=True)
        self.destination = self.root / 'export'

    def tearDown(self):
        self.temp.cleanup()

    def export(self):
        return export_workspace(self.workspace, self.destination)

    def test_checkpoint_is_exported_byte_for_byte(self):
        payload = b'{"checkpoint":"saved", "sequence":7}\n\x00'
        (self.evidence / 'checkpoint.json').write_bytes(payload)

        exported = self.export()

        target = self.destination / 'HOST-1' / 'checkpoint.json'
        self.assertIn(str(target), exported)
        self.assertEqual(target.read_bytes(), payload)

    def test_checkpoint_symlink_is_rejected(self):
        outside = self.root / 'checkpoint.json'
        outside.write_bytes(b'{"external":true}\n')
        (self.evidence / 'checkpoint.json').symlink_to(outside)

        self.assertEqual(self.export(), [])
        self.assertFalse((self.destination / 'HOST-1' / 'checkpoint.json').exists())

    def test_oversized_checkpoint_is_rejected(self):
        (self.evidence / 'checkpoint.json').write_bytes(b'x' * (MAX_BYTES + 1))

        self.assertEqual(self.export(), [])
        self.assertFalse((self.destination / 'HOST-1' / 'checkpoint.json').exists())

    def test_unknown_filename_is_excluded(self):
        (self.evidence / 'unknown.json').write_bytes(b'{"not":"allowlisted"}\n')

        self.assertEqual(self.export(), [])
        self.assertFalse((self.destination / 'HOST-1' / 'unknown.json').exists())


if __name__ == '__main__':
    unittest.main()
