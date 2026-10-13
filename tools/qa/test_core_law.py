#!/usr/bin/env python3
"""Fail-closed central CivicAscent five-scene operating-law and agent-load regression check."""
import importlib.util
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
law = json.loads((ROOT/"agents/core_law.json").read_text(encoding="utf-8"))
assert law["id"] == "CIVICASCENT-SAFARI-CORE-LAW"
assert law["version"].startswith("2026-10-13.")
assert law["budget_usd"] == 0 and law["default_production_release"] is False
assert law["status"] == "ADOPTED_FOR_RECOVERY_BRANCH_NOT_YET_RELEASED"
assert law["secrets"].lower().find("api keys") >= 0
assert len(law["scene_routes"]) == 5
assert [r["scene"] for r in law["scene_routes"]] == list(range(1,6))
expect={
  1:"index.html",2:"free-ai-starter.html",3:"mentor.html",4:"course.html",
  5:"living-ai-lab.html"
}
for row in law["scene_routes"]:
    assert row["file"] == expect[row["scene"]]
    assert (ROOT/row["file"]).exists(), row["file"]
assert law["scene_routes"][4]["priority"] == 1
for role in ("zebra","codi","sam","scout","reach","friday","qa5-05"):
    assert role in law["agents"], role
for doc in ("AGENTS.md","TEAM_OPERATING_ORDER.md",law["source_of_truth"]):
    assert (ROOT/doc).exists()
agent_info=(ROOT/"AGENTS.md").read_text(encoding="utf8")
assert "core_law.json" in agent_info and "Scene 5" in agent_info
assert "Living AI Lab" in (ROOT/law["source_of_truth"]).read_text(encoding="utf-8")

# A simulated Zebra dispatch must actually read the canonical core law and include version proof.
spec=importlib.util.spec_from_file_location("zebra_runner",ROOT/"agents/zebra_runner.py")
zebra=importlib.util.module_from_spec(spec)
spec.loader.exec_module(zebra)
assert set(zebra.AGENTS) == set(law["agents"]), "Every LAW agent must have a dispatch role"
for name in zebra.AGENTS:
    receipt=zebra.run("law acknowledgement healthcheck",name)
    assert receipt["core_law_version"] == law["version"]
    assert receipt["core_law"] == law["id"]
    assert receipt["execution"] == "local_dry_run"
    assert receipt["cost_usd"] == 0
    assert "not an autonomous" in receipt["acknowledgement"]
print(f"PASS: LAW v{law['version']} routes, rules, {len(zebra.AGENTS)} simulated agent dispatches, zero-spend release hold.")
print("NOTE: this tests local dispatch only, not currently running autonomous agents.")
