#!/usr/bin/env python3
"""Ephemeral-key synthetic crypto/restore test. NEVER backs up live databases."""
import hashlib
import os
import pathlib
import stat
import subprocess
import sys
import tempfile
import unittest


TOOL = pathlib.Path(__file__).resolve().parents[1] / "tools/p0_backup_crypto.sh"


def run(*args, env=None, good=True):
    p = subprocess.run(args, text=True, capture_output=True, env=env, timeout=50)
    if good and p.returncode:
        raise AssertionError("command failed: " + p.stderr[:500])
    if not good and p.returncode == 0:
        raise AssertionError("unsafe command succeeded: " + str(args))
    return p


def home(tmp, name):
    path = tmp / name
    path.mkdir(mode=0o700)
    return path


def generate_identity(tmp, name):
    folder = home(tmp, name)
    env = dict(os.environ, GNUPGHOME=str(folder))
    run("gpg", "--batch", "--pinentry-mode", "loopback", "--passphrase", "",
        "--quick-generate-key", name + " Synthetic DR Test <ci@example.invalid>",
        "rsa2048", "encrypt", "1d", env=env)
    keys = run("gpg", "--batch", "--with-colons", "--fingerprint",
               "--list-keys", env=env).stdout
    fingerprint = next(line.split(":")[9] for line in keys.splitlines()
                       if line.startswith("fpr:"))
    assert len(fingerprint) == 40
    return env, fingerprint


class SyntheticEncryptedRestore(unittest.TestCase):
    def test_encrypt_restore_and_reject_all_unsafe_cases(self):
        with tempfile.TemporaryDirectory(prefix="p0-dr-encryption-test-") as d:
            tmp = pathlib.Path(d)
            keyenv, fingerprint = generate_identity(tmp, "intended-recipient")
            wrongenv, _ = generate_identity(tmp, "unrelated-recipient")
            data = tmp / "fake-data.dump"
            # Deliberately synthetic bytes; no customer/Stripe/Supabase content.
            fake = (b"CI_SYNTHETIC_NO_PRIVATE_DATA\n" * 20000)
            data.write_bytes(fake)
            cipher = tmp / "encrypted.bin.gpg"
            restored = tmp / "restored.dump"
            run("bash", str(TOOL), "encrypt", str(data), str(cipher),
                fingerprint, env=keyenv)
            self.assertNotEqual(cipher.read_bytes(), fake)
            self.assertEqual(stat.S_IMODE(cipher.stat().st_mode), 0o600)
            run("bash", str(TOOL), "decrypt", str(cipher), str(restored),
                env=keyenv)
            self.assertEqual(hashlib.sha256(restored.read_bytes()).digest(),
                             hashlib.sha256(fake).digest())

            # Wrong owner/private key must never write a "restored" output.
            denied = tmp / "no-private-key.dump"
            run("bash", str(TOOL), "decrypt", str(cipher), str(denied),
                env=wrongenv, good=False)
            self.assertFalse(denied.exists())

            # Authenticity failure must remove partial output from disk.
            tampered = tmp / "tampered.gpg"
            damaged = bytearray(cipher.read_bytes())
            damaged[-11] ^= 0x01
            tampered.write_bytes(damaged)
            recovered = tmp / "tampered-restored.dump"
            run("bash", str(TOOL), "decrypt", str(tampered), str(recovered),
                env=keyenv, good=False)
            self.assertFalse(recovered.exists())

            truncated = tmp / "truncated.gpg"
            truncated.write_bytes(cipher.read_bytes()[:30])
            trunc_out = tmp / "truncated.dump"
            run("bash", str(TOOL), "decrypt", str(truncated), str(trunc_out),
                env=keyenv, good=False)
            self.assertFalse(trunc_out.exists())

            # Never overwrite an existing file, even if encrypted validly.
            previous = restored.read_bytes()
            run("bash", str(TOOL), "decrypt", str(cipher), str(restored),
                env=keyenv, good=False)
            self.assertEqual(restored.read_bytes(), previous)

            missing = tmp / "recipient-not-imported.gpg"
            run("bash", str(TOOL), "encrypt", str(data), str(missing),
                fingerprint, env=wrongenv, good=False)
            self.assertFalse(missing.exists())
            print("PASS: synthetic encrypted archive, correct-key restore, "
                  "wrong key/tamper/truncation/overwrite/missing-key fail closed")


if __name__ == "__main__":
    unittest.main(verbosity=2)
