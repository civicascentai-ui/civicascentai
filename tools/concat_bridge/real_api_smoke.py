"""Bounded actual Concat AppImage + LOCAL API test on a disposable Linux host.

Uses a random ephemeral token (never printed), a temporary XDG profile, Xvfb,
and the pinned official binary. Does not perform edits, exports or publication.
"""
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import secrets
import signal
import subprocess
import sys
import tempfile
import time

from bridge import BridgeError, ConcatBridge

def main():
    app = os.environ.get("CONCAT_APPIMAGE")
    if not app or not Path(app).is_file():
        raise RuntimeError("Pinned Concat AppImage is missing")
    results = Path("concat-api-results")
    results.mkdir(exist_ok=True)
    receipt = {
        "tool": "Concat v0.2.7",
        "scope": "actual local API read-only smoke; not a video export",
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "github_run_id": os.environ.get("GITHUB_RUN_ID"),
        "result": "not_started",
        "local_only": True,
        "paid_calls": False,
        "production_changes": False,
    }
    process = None
    try:
        with tempfile.TemporaryDirectory(prefix="concat-local-smoke-") as folder:
            home = Path(folder)
            xdg = home / ".config"
            config = xdg / "app.concat.editor"
            config.mkdir(parents=True)
            token = secrets.token_hex(24)
            settings = {"server": {"enabled": True,
                                   "listen": "127.0.0.1:7420",
                                   "token": token}}
            (config / "settings.json").write_text(json.dumps(settings), encoding="utf-8")
            env = dict(os.environ,
                       HOME=str(home), XDG_CONFIG_HOME=str(xdg),
                       XDG_DATA_HOME=str(home / ".local/share"),
                       APPIMAGE_EXTRACT_AND_RUN="1", LIBGL_ALWAYS_SOFTWARE="1")
            with (home / "concat.stderr").open("wb") as logfile:
                process = subprocess.Popen(
                    ["xvfb-run", "-a", "-s", "-screen 0 1280x800x24", app],
                    env=env, stdout=logfile, stderr=subprocess.STDOUT,
                    start_new_session=True)
                client = ConcatBridge(token=token, timeout=1.5)
                version = None
                for _ in range(35):
                    if process.poll() is not None:
                        raise RuntimeError("Concat exited before local API became ready")
                    try:
                        version = client.read("version")
                        break
                    except BridgeError:
                        time.sleep(0.6)
                if version is None:
                    raise RuntimeError("Actual Concat local API did not become reachable")
                if not isinstance(version, dict):
                    raise RuntimeError("Unexpected version API response")
                catalogue = client.read("catalogue.list", {"kind": "filter"})
                if not isinstance(catalogue, (list, dict)):
                    raise RuntimeError("Unexpected catalogue response")
                try:
                    ConcatBridge(token="deliberately-invalid", timeout=1.5).read("version")
                except BridgeError:
                    pass
                else:
                    raise RuntimeError("Wrong-token access unexpectedly succeeded")
                try:
                    client.export_sandbox("/tmp/blocked", "/tmp/blocked.mp4")
                except BridgeError:
                    pass
                else:
                    raise RuntimeError("Export gate unexpectedly allowed export")
                receipt.update(
                    result="passed", actual_api=True,
                    version_response={"concat":version.get("concat"), "api_version":version.get("apiVersion")}, catalogue_response_type=type(catalogue).__name__,
                    wrong_token_rejected=True, export_gate_disabled=True)
    except Exception as e:
        receipt.update(result="failed", reason=str(e), actual_api=False)
    finally:
        if process is not None and process.poll() is None:
            try:
                os.killpg(process.pid, signal.SIGTERM)
                process.wait(timeout=5)
            except (ProcessLookupError, subprocess.TimeoutExpired):
                try:
                    os.killpg(process.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
        (results / "receipt.json").write_text(json.dumps(receipt, indent=2, sort_keys=True),
                                               encoding="utf-8")
        print(json.dumps(receipt, sort_keys=True))
    return 0 if receipt["result"] == "passed" else 1

if __name__ == "__main__":
    sys.exit(main())
