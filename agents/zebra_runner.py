#!/usr/bin/env python3
"""Zebra portable agent runner. Standard library only; no paid APIs or live transactions."""
import argparse
import datetime as dt
import json
import hashlib
from pathlib import Path

AGENTS = {
    "zebra": "Technical migration and dependency audit",
    "codi": "Operations coordination",
    "sam": "Documentation and system maintenance",
    "scout": "Research discovery (offline task preparation only)",
    "reach": "Partnership outreach (draft only)",
    "friday": "Independent QC",
    **{f"qa5-{n:02d}": "Safe simulated QA tester" for n in range(1, 6)},
}

COMMANDS = ("choose", "design", "prompt", "test", "ship", "handoff", "review", "status", "blocked", "flashcards")

def load_agent_commands(agent):
    """Validate documented instructions without claiming a live model loaded them."""
    root = Path(__file__).resolve().parent
    shared = root / "COMMAND_STANDARD_v1.md"
    role_file = root / "commands" / f"{agent}.md"
    if agent.startswith("qa5-"):
        role_file = root / "commands" / "friday.md"
    policies = {}
    for path in (shared, role_file):
        content = path.read_text(encoding="utf-8")
        missing = [cmd for cmd in COMMANDS if f"/{cmd}" not in content]
        if missing:
            raise ValueError(f"Missing documented commands in {path}: {missing}")
        policies[path.name] = hashlib.sha256(content.encode("utf-8")).hexdigest()
    return policies

def run(task, agent, dry_run=True, command="status"):
    if agent not in AGENTS:
        raise ValueError("Unknown agent")
    if command not in COMMANDS:
        raise ValueError("Unknown command")
    if not dry_run:
        raise ValueError("Live execution disabled until reviewed integrations and approval")
    policy_hashes = load_agent_commands(agent)
    return {
        "timestamp_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "agent": agent, "role": AGENTS[agent], "task": task,
        "execution": "local_dry_run", "status": "PASS",
        "command": command,
        "policy_hashes": policy_hashes,
        "note": "Command and documented agent instructions validated; no external autonomous model, API, purchase, publication, deployment or hosting action executed",
        "cost_usd": 0,
    }

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--agent", choices=list(AGENTS), default="zebra")
    p.add_argument("--task", default="healthcheck")
    p.add_argument("--command", choices=COMMANDS, default="status")
    p.add_argument("--output", default="artifacts/zebra-health.json")
    args = p.parse_args()
    result = run(args.task, args.agent, command=args.command)
    path = Path(args.output)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
