#!/usr/bin/env python3
"""Time-bounded, synthetic/read-only Shadow House live QA; no agent activation."""
import json
import os
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import time
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE = ROOT / "shadow-live-receipts"
EVIDENCE.mkdir(parents=True, exist_ok=True)
DEADLINE = datetime.fromisoformat(os.environ.get("CUT_OFF_UTC", "2026-10-15T02:37:00+00:00").replace("Z", "+00:00"))
INTERVAL = int(os.environ.get("INTERVAL_SECONDS", "300"))
PUBLIC_BASE = "https://civicascentai.com/"
PUBLIC_PATHS = [
    "", "journey-learn.html", "journey-try.html",
    "journey-help.html", "journey-continue.html",
    "free-ai-starter.html", "register.html"
]
EXPECTED_LINKS = PUBLIC_PATHS[1:5]

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = set()
    def handle_starttag(self, tag, attrs):
        if tag.lower() == "a":
            self.hrefs.update(str(v) for k, v in attrs if k.lower() == "href" and v)

def checkpoint(n):
    result = {
        "iteration": n,
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "github_run_id": os.getenv("GITHUB_RUN_ID"),
        "git_ref": os.getenv("GITHUB_REF"),
        "mode": "read_only_public_http_and_synthetic_local_security",
        "checks": {},
        "failures": []
    }
    config = json.loads((ROOT / "agents/tool_registry/wolfcut-concat.json").read_text())
    blocked = ["enabled", "automatic_dispatch_allowed", "paid_calls_allowed",
               "production_access", "social_publishing_allowed", "website_work_allowed"]
    safe = all(config.get(key) is False for key in blocked)
    result["checks"]["shadow_registry_release_hold"] = safe
    if not safe:
        result["failures"].append("Shadow registry release HOLD is not intact")
    proc = subprocess.run(
        ["python3", "-m", "unittest", "discover", "-s",
         "tools/concat_bridge", "-p", "test_bridge.py"],
        cwd=ROOT, capture_output=True, text=True, timeout=90
    )
    unit_pass = proc.returncode == 0 and "Ran 18 tests" in (proc.stdout + proc.stderr) and "OK" in proc.stderr
    result["checks"]["shadow_18_security_contract_tests"] = unit_pass
    if not unit_pass:
        result["failures"].append("Shadow 18-test suite did not pass")
        result["test_error_tail"] = (proc.stderr + proc.stdout)[-900:]
    for path in PUBLIC_PATHS:
        key = "public_" + (path or "homepage")
        try:
            req = Request(PUBLIC_BASE + path, headers={
                "User-Agent": "CivicAscent-Shadow-ReadOnly-QA/1.0",
                "Cache-Control": "no-cache"
            })
            with urlopen(req, timeout=20) as response:
                status = response.status
                body = response.read(300_000).decode("utf-8", errors="replace")
            valid = status == 200 and "<html" in body.lower() and "</html>" in body.lower()
            result["checks"][key] = valid
            if not valid:
                result["failures"].append(f"{path or 'homepage'} HTTP/content check failed ({status})")
            if not path:
                parser = Links()
                parser.feed(body)
                for p in EXPECTED_LINKS:
                    found = p in parser.hrefs
                    result["checks"]["homepage_links_" + p] = found
                    if not found:
                        result["failures"].append("Homepage missing functional link: " + p)
        except Exception as exc:
            result["checks"][key] = False
            result["failures"].append(f"{path or 'homepage'}: {type(exc).__name__}: {str(exc)[:180]}")
    result["passed"] = not result["failures"]
    with (EVIDENCE / "checkpoints.jsonl").open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(result, sort_keys=True) + "\n")
    print(json.dumps({
        "iteration": n,
        "timestamp_utc": result["timestamp_utc"],
        "pass": result["passed"],
        "passed_checks": sum(v is True for v in result["checks"].values()),
        "checked": len(result["checks"]),
        "failures": result["failures"]
    }), flush=True)
    return result["passed"]

def main():
    total = 0
    failures = 0
    print("SHADOW LIVE QA: bounded runner started, cutoff UTC:", DEADLINE.isoformat(), flush=True)
    while datetime.now(timezone.utc) < DEADLINE:
        total += 1
        try:
            ok = checkpoint(total)
        except Exception as exc:
            ok = False
            print("CHECKPOINT UNHANDLED ERROR:", repr(exc), flush=True)
        if not ok:
            failures += 1
        secs = (DEADLINE - datetime.now(timezone.utc)).total_seconds()
        if secs <= 40:
            break
        time.sleep(min(INTERVAL, max(0, secs - 20)))
    receipt = {
        "finish_utc": datetime.now(timezone.utc).isoformat(),
        "total_checkpoints": total,
        "failed_checkpoints": failures,
        "fully_passed": failures == 0,
        "warning": "Continuous runner is time bounded, not a persistent autonomous agent, and tests exclude real customer transactions and Android/Spanish captions."
    }
    (EVIDENCE / "summary.json").write_text(json.dumps(receipt, indent=2))
    print("SHADOW LIVE QA FINAL:", json.dumps(receipt), flush=True)
    return 0 if failures == 0 and total >= 1 else 1

if __name__ == "__main__":
    raise SystemExit(main())
