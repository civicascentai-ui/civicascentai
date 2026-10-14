#!/usr/bin/env python3
"""Time-boxed, no-spend Blue Crew shift executor.

Scheduled 04:00-08:00 and 20:00-00:01 America/Chicago every calendar day.
Runs five existing read-only agent tasks repeatedly, plus SCOUT public research
and QA5 audits at bounded intervals. This is an active test/check loop, NOT a
persistently reasoning LLM or a host that can publish, email, deploy, or charge.
"""
import argparse
from datetime import datetime, time, timedelta, timezone
import json
import os
from pathlib import Path
import subprocess
import sys
import time as clock
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

TZ = ZoneInfo("America/Chicago")
REPO = "civicascentai-ui/civicascentai"
ROOT = Path(__file__).resolve().parents[1]
ROLES = ("sam", "friday", "zebra", "reach", "codi")
INTERVAL = 30 * 60
OUT = ROOT / "blue-crew-shift-receipts"

def shift_bounds(now):
    """Return (name, local start, local end), or None outside assigned shifts."""
    local = now.astimezone(TZ)
    day = local.date()
    if time(4, 0) <= local.time().replace(tzinfo=None) < time(8, 0):
        return ("morning", datetime.combine(day, time(4), TZ),
                datetime.combine(day, time(8), TZ))
    if local.time().replace(tzinfo=None) >= time(20, 0):
        return ("night", datetime.combine(day, time(20), TZ),
                datetime.combine(day + timedelta(days=1), time(0, 1), TZ))
    if local.time().replace(tzinfo=None) < time(0, 1):
        yesterday = day - timedelta(days=1)
        return ("night", datetime.combine(yesterday, time(20), TZ),
                datetime.combine(day, time(0, 1), TZ))
    return None

def self_test():
    examples = (
        ((2026, 10, 15, 4, 0), "morning"),
        ((2026, 10, 15, 7, 59), "morning"),
        ((2026, 10, 15, 8, 0), None),
        ((2026, 10, 15, 19, 59), None),
        ((2026, 10, 15, 20, 0), "night"),
        ((2026, 10, 15, 23, 59), "night"),
        ((2026, 10, 16, 0, 0), "night"),
        ((2026, 10, 16, 0, 1), None),
        ((2026, 12, 15, 4, 0), "morning"),
        ((2026, 12, 15, 20, 0), "night"),
    )
    for parts, expected in examples:
        dt = datetime(*parts, tzinfo=TZ)
        actual = shift_bounds(dt)
        assert (actual[0] if actual else None) == expected, (dt, actual, expected)
    # DST must use Central local clock time in both seasons.
    assert datetime(2026, 7, 15, 4, tzinfo=TZ).utcoffset() == timedelta(hours=-5)
    assert datetime(2026, 12, 15, 4, tzinfo=TZ).utcoffset() == timedelta(hours=-6)
    assert ROLES == ("sam", "friday", "zebra", "reach", "codi")
    print("PASS: Blue Crew shift boundaries, midnight rollover, DST, five-role registry")
    return 0

def assert_readonly_public_runner():
    if os.environ.get("GITHUB_ACTIONS") != "true":
        raise RuntimeError("GitHub Actions-only live execution")
    if os.environ.get("GITHUB_REPOSITORY") != REPO:
        raise RuntimeError("Unexpected repository")
    if os.environ.get("GITHUB_REF") != "refs/heads/main":
        raise RuntimeError("Scheduled execution must use protected main source")
    if os.environ.get("RUNNER_ENVIRONMENT") != "github-hosted" or os.environ.get("RUNNER_OS") != "Linux":
        raise RuntimeError("Not the expected free standard hosted Linux runner")
    req = Request("https://api.github.com/repos/" + REPO,
                  headers={"Accept": "application/vnd.github+json",
                           "User-Agent": "BlueCrew-ZeroSpend-Guard"}, method="GET")
    with urlopen(req, timeout=20) as res:
        info = json.loads(res.read(200000))
    if info.get("private") is not False:
        raise RuntimeError("Repository not public: abort to avoid billed minutes")

def execute(cmd, seconds, label):
    try:
        proc = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True,
                              timeout=seconds, env=os.environ.copy())
        outcome = {
            "label": label,
            "passed": proc.returncode == 0,
            "exit_code": proc.returncode,
            "output_tail": (proc.stdout + proc.stderr)[-450:],
        }
    except subprocess.TimeoutExpired:
        outcome = {"label": label, "passed": False, "error": "timed_out"}
    except Exception as exc:
        outcome = {"label": label, "passed": False,
                   "error": type(exc).__name__ + ": " + str(exc)[:120]}
    return outcome

def make_round(n, phase, cutoff):
    now = datetime.now(TZ)
    remaining = (cutoff - now).total_seconds()
    result = {
        "schema": "blue-crew.shift.v1",
        "cycle": n,
        "phase": phase,
        "started_central": now.isoformat(),
        "github_run_id": os.environ.get("GITHUB_RUN_ID"),
        "shift_cutoff_central": cutoff.isoformat(),
        "agents": [],
    }
    for role in ROLES:
        if datetime.now(TZ) >= cutoff:
            break
        result["agents"].append(execute(
            [sys.executable, "agents/autonomous_worker.py", "--role", role],
            110, role))
    # Research is the sixth role; run every other cycle, including the first.
    if n % 2 == 1 and datetime.now(TZ) < cutoff:
        result["agents"].append(execute(
            ["node", "--test", "tools/scout/discovery.test.mjs"],
            45, "scout_public_research_safety_tests"))
        if datetime.now(TZ) < cutoff:
            result["agents"].append(execute(
                ["node", "tools/scout/discovery.mjs"],
                100, "scout_public_research"))
        if datetime.now(TZ) < cutoff:
            result["agents"].append(execute(
                ["node", "--test", "tools/scout/mission.test.mjs"],
                45, "scout_qa5_safety_tests"))
        if datetime.now(TZ) < cutoff:
            result["agents"].append(execute(
                ["node", "tools/scout/mission.mjs"],
                100, "scout_qa5_readonly_audit"))
    result["ended_central"] = datetime.now(TZ).isoformat()
    result["all_executed_checks_passed"] = all(v["passed"] for v in result["agents"])
    result["note"] = "Read-only tasks only, not ongoing AI conversations or verified purchase/fulfillment."
    OUT.mkdir(parents=True, exist_ok=True)
    with (OUT / "blue-crew-cycles.jsonl").open("a", encoding="utf-8") as f:
        f.write(json.dumps(result, sort_keys=True) + "\n")
    print(json.dumps({"phase": phase, "cycle": n,
                      "central": result["ended_central"],
                      "checks": len(result["agents"]),
                      "passed": result["all_executed_checks_passed"],
                      "failed": [x["label"] for x in result["agents"] if not x["passed"]]}),
          flush=True)
    return result["all_executed_checks_passed"]

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--self-test", action="store_true")
    args = p.parse_args()
    if args.self_test:
        return self_test()
    assert_readonly_public_runner()
    now = datetime.now(TZ)
    limits = shift_bounds(now)
    if limits is None:
        print("Outside Blue Crew shifts: no autonomous tasks run. Central:", now.isoformat())
        return 0
    phase, start, cutoff = limits
    OUT.mkdir(parents=True, exist_ok=True)
    print("BLUE CREW SHIFT OPEN:", phase, "starts", start.isoformat(),
          "ends", cutoff.isoformat(), "current", now.isoformat(), flush=True)
    n, fails = 0, 0
    while datetime.now(TZ) < cutoff:
        if (cutoff - datetime.now(TZ)).total_seconds() <= 15:
            break
        n += 1
        if not make_round(n, phase, cutoff):
            fails += 1
        remaining = (cutoff - datetime.now(TZ)).total_seconds()
        if remaining <= 15:
            break
        clock.sleep(min(INTERVAL, max(0, remaining - 10)))
    summary = {
        "schema": "blue-crew.shift.summary.v1",
        "phase": phase,
        "started_schedule_central": start.isoformat(),
        "cutoff_central": cutoff.isoformat(),
        "finished_central": datetime.now(TZ).isoformat(),
        "cycles": n,
        "failed_cycles": fails,
        "status": "PASS" if n > 0 and fails == 0 else "FAIL",
        "limits": "No payments, emails, changes to website/main, secret sharing, or external paid APIs.",
        "execution_kind": "Scheduled bounded read-only programs, not 24/7 AI model hosting"
    }
    (OUT / "shift-summary.json").write_text(json.dumps(summary, indent=2) + "\n")
    print("BLUE CREW SHIFT REPORT:", json.dumps(summary), flush=True)
    return 0 if n > 0 and fails == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
