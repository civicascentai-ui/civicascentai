#!/usr/bin/env python3
"""Zero-cost, offline Friday evidence gate for existing SCOUT runs."""
import json
import sys
from pathlib import Path

def validate(records):
    required = {"scout_public_research", "scout_readonly_audit"}
    if set(records) != required:
        raise ValueError("Expected exactly two named SCOUT run records")
    results = {}
    for name, record in records.items():
        if not isinstance(record, dict):
            raise ValueError(f"{name}: invalid record")
        passed = (
            record.get("status") == "completed"
            and record.get("conclusion") == "success"
            and isinstance(record.get("run_id"), int)
            and record.get("run_id") > 0
            and isinstance(record.get("artifact_id"), int)
            and record.get("artifact_id") > 0
            and record.get("artifact_expired") is False
        )
        results[name] = "PASS" if passed else "FAIL"
    return {"gate": "friday_scout_evidence", "results": results, "status": "PASS" if all(v == "PASS" for v in results.values()) else "FAIL", "scope": "record validation only; not website/payment or autonomous agent QC"}

def main():
    records = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    result = validate(records)
    print(json.dumps(result, indent=2, sort_keys=True))
    if result["status"] != "PASS":
        raise SystemExit(1)

if __name__ == "__main__":
    main()
