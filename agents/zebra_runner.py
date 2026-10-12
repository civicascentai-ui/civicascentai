#!/usr/bin/env python3
"""Zebra portable agent runner. Standard library only; no paid APIs or live transactions."""
import argparse
import datetime as dt
import json
from pathlib import Path

LAW_PATH = Path(__file__).with_name("core_law.json")

def load_core_law():
    law = json.loads(LAW_PATH.read_text(encoding="utf-8"))
    if law.get("id") != "CIVICASCENT-SAFARI-CORE-LAW" or len(law.get("scene_routes", [])) != 6:
        raise ValueError("CivicAscent core LAW missing or invalid; fail closed")
    return law


AGENTS = {
    "agent-1-experience": "Safari experience and visual continuity",
    "agent-2-engineering": "Responsive implementation and accessibility",
    "agent-3-independent-qa": "Independent QA and accessibility gate",
    "agent-4-critical-evaluation": "Independent design and risk critique",
    "zebra": "Technical migration and dependency audit",
    "codi": "Operations coordination",
    "sam": "Documentation and system maintenance",
    "scout": "Research discovery (offline task preparation only)",
    "reach": "Partnership outreach (draft only)",
    "friday": "Independent QC",
    **{f"qa5-{n:02d}": "Safe simulated QA tester" for n in range(1, 6)},
}

def run(task, agent, dry_run=True):
    law = load_core_law()
    if agent not in AGENTS:
        raise ValueError("Unknown agent")
    if not dry_run:
        raise ValueError("Live execution disabled until reviewed integrations and approval")
    return {
        "timestamp_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "agent": agent, "role": AGENTS[agent], "task": task,
        "execution": "local_dry_run", "status": "PASS",
        "core_law": law["id"], "core_law_version": law["version"],
        "source_of_truth": law["source_of_truth"],
        "acknowledgement": "Read on dispatch; not an autonomous agent memory sync",
        "note": "Dispatch validated; no external autonomous model, API, purchase or hosting action executed",
        "cost_usd": 0,
    }

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--agent", choices=list(AGENTS), default="zebra")
    p.add_argument("--task", default="healthcheck")
    p.add_argument("--output", default="artifacts/zebra-health.json")
    args = p.parse_args()
    result = run(args.task, args.agent)
    path = Path(args.output)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
