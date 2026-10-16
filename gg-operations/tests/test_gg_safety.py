"""GG v2 offline safety tests. All Gemini responses and HTTP operations mocked."""
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import gg_agent as gg

GOOD = {
    "GG_EXECUTION_MODE": "gemini",
    "GG_FREE_TIER_VERIFIED": "yes",
    "GG_MODEL_RUN_APPROVED": "yes",
    "GG_PUBLIC_ONLY": "yes",
    "GG_GEMINI_MODEL": "gemini-3.5-flash-lite",
    "GEMINI_API_KEY": "FAKE_UNIT_TEST_ONLY_KEY_012345",
}
SAMPLE = [{"number": 22, "title": "Public backup audit",
           "state": "open", "private_note": "NEVER_SEND_ME"}]


class SafetyTests(unittest.TestCase):
    def test_allowlist(self):
        self.assertTrue(gg.public_issue_url(22).endswith("/22"))
        for value in (99, "22", True, 10.0, None):
            with self.subTest(value=value), self.assertRaises(gg.SafetyStop):
                gg.public_issue_url(value)

    def test_startup_fails_closed(self):
        with self.assertRaises(gg.SafetyStop):
            gg.require_model_authorization({})
        self.assertEqual(gg.main(["--mode", "self-test"]), 0)

    def test_execution_mode_gate(self):
        for value in ("self-test", "public-readonly", "", "GEMINI"):
            with self.subTest(value=value), self.assertRaises(gg.SafetyStop):
                gg.require_model_authorization({**GOOD, "GG_EXECUTION_MODE": value})

    def test_approval_gate_independently_checked(self):
        for key in ("GG_FREE_TIER_VERIFIED", "GG_MODEL_RUN_APPROVED", "GG_PUBLIC_ONLY"):
            with self.subTest(key=key), self.assertRaises(gg.SafetyStop):
                gg.require_model_authorization({**GOOD, key: "no"})

    def test_model_allowlist(self):
        self.assertEqual(gg.require_model_authorization(GOOD)[0], "gemini-3.5-flash-lite")
        for model in ("gemini-3.1-pro-preview", "gemini-2.5-flash", "",
                      "gemini-3.5-flash-lite/../unsafe"):
            with self.subTest(model=model), self.assertRaises(gg.SafetyStop):
                gg.require_model_authorization({**GOOD, "GG_GEMINI_MODEL": model})

    def test_bad_secret_fails_closed(self):
        for key in ("", "abc", "line\nbreakNOPEEXAMPLEKEY", "space in key example"):
            with self.subTest(key=key), self.assertRaises(gg.SafetyStop):
                gg.require_model_authorization({**GOOD, "GEMINI_API_KEY": key})

    def test_prompt_data_only(self):
        prompt = gg.public_only_prompt(SAMPLE)
        self.assertNotIn("NEVER_SEND_ME", prompt)
        self.assertIn("untrusted", prompt)
        self.assertIn("Public backup audit", prompt)
        self.assertEqual(json.loads(prompt.split("JSON data:\n")[1])["issues"][0]["number"], 22)

    def test_prompt_rejects_unlisted_issue(self):
        with self.assertRaises(gg.SafetyStop):
            gg.public_only_prompt([{"number": 123456, "title": "unauthorized", "state": "open"}])

    def test_receipt_release_hold(self):
        x = gg.receipt(SAMPLE)
        self.assertTrue(x["release_hold"])
        self.assertTrue(x["no_production_changes"])
        self.assertEqual(x["model_execution"], "NOT_INVOKED")
        self.assertEqual(x["priority_open_queue"], [22])

    def test_public_metadata_validation(self):
        class FakeResponse:
            status = 200
            def __enter__(self): return self
            def __exit__(self, *args): return False
            def read(self, n): return json.dumps(
                {"number": 22, "state": "open", "title": "public issue"}).encode()
        with patch.object(gg, "urlopen", return_value=FakeResponse()) as api:
            x = gg.public_get(22)
            self.assertEqual(x["url"], "https://github.com/civicascentai-ui/civicascentai/issues/22")
            self.assertEqual(api.call_args.args[0].get_method(), "GET")

    def test_model_uses_single_readonly_request(self):
        class FakeResponse:
            status = 200
            def __enter__(self): return self
            def __exit__(self, *args): return False
            def read(self, n): return json.dumps(
                {"candidates": [{"content": {"parts": [{"text": "Provisional only"}]}}]}).encode()
        with patch.object(gg, "urlopen", return_value=FakeResponse()) as api:
            ans = gg.invoke_gemini(SAMPLE, GOOD)
            self.assertEqual(ans["output"], "Provisional only")
            self.assertTrue(ans["requires_independent_qc"])
            self.assertEqual(api.call_count, 1)
            req = api.call_args.args[0]
            self.assertEqual(req.get_method(), "POST")
            self.assertTrue(req.full_url.startswith("https://generativelanguage.googleapis.com/"))
            self.assertNotIn("NEVER_SEND_ME", req.data.decode())
            self.assertNotIn("FAKE_UNIT_TEST_ONLY_KEY_012345", req.data.decode())
            self.assertNotIn("tools", req.data.decode())

    def test_model_never_runs_when_denied(self):
        with patch.object(gg, "urlopen") as api, self.assertRaises(gg.SafetyStop):
            gg.invoke_gemini(SAMPLE, {**GOOD, "GG_MODEL_RUN_APPROVED": "no"})
        api.assert_not_called()

    def test_receipt_file_private(self):
        with tempfile.TemporaryDirectory() as td:
            path = Path(td) / "gg.json"
            gg.safe_write_json(path, gg.receipt(SAMPLE))
            self.assertEqual(json.loads(path.read_text())["role"], "GG")
            if os.name == "posix":
                self.assertEqual(path.stat().st_mode & 0o077, 0)

    def test_disabled_project_blocks_public_run_before_network(self):
        with patch.dict(os.environ, {"GG_EXECUTION_MODE": "self-test"}), \
             patch.object(gg, "urlopen") as api:
            self.assertEqual(gg.main(["--mode", "public-readonly"]), 1)
            api.assert_not_called()


if __name__ == "__main__":
    unittest.main()
