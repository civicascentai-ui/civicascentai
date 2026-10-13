#!/usr/bin/env python3
"""SCOUT read-only QA5 evidence-gap runner. Python stdlib only; no network or purchases.
Usage: python docs/operations/zebra-scout-offline-runner-v1.py --output /tmp/scout-qa5.json
An execution receipt is created only if this script is actually run.
"""
import argparse, datetime, json, os, pathlib, uuid
CASES = {
 "QA5-01 successful checkout": ["provider_test_payment_id", "order_id", "course_entitlement", "learner_access"],
 "QA5-02 declined checkout": ["provider_decline_id", "no_entitlement"],
 "QA5-03 duplicate submission": ["idempotency_evidence", "single_order"],
 "QA5-04 refund/reversal": ["provider_refund_id", "entitlement_reversal"],
 "QA5-05 mobile recovery": ["mobile_device_result", "support_recovery"],
}
def run(evidence):
    results = {}
    for case, keys in CASES.items():
        observed = evidence.get(case, {})
        missing = [key for key in keys if not observed.get(key)]
        results[case] = {"status": "EVIDENCE_GAP" if missing else "EVIDENCE_PRESENT_UNVERIFIED",
                         "missing": missing, "submitted_keys": sorted(observed)}
    return results
def main():
    p = argparse.ArgumentParser()
    p.add_argument("--input", help="Local JSON evidence manifest; optional")
    p.add_argument("--output", required=True)
    args = p.parse_args()
    started = datetime.datetime.now(datetime.timezone.utc)
    evidence = json.loads(pathlib.Path(args.input).read_text()) if args.input else {}
    receipt = {"task_id": str(uuid.uuid4()), "runner": "scout-offline-qa5-v1",
               "started_utc": started.isoformat(), "results": run(evidence),
               "scope": "read-only local evidence inventory; not checkout execution",
               "network_calls": 0, "paid_model_calls": 0, "exit_code": 0,
               "ended_utc": datetime.datetime.now(datetime.timezone.utc).isoformat()}
    dest = pathlib.Path(args.output)
    dest.parent.mkdir(parents=True, exist_ok=True)
    temp = dest.with_suffix(dest.suffix + ".tmp")
    temp.write_text(json.dumps(receipt, indent=2))
    os.replace(temp, dest)
    print(json.dumps({"task_id": receipt["task_id"], "receipt": str(dest)}))
if __name__ == "__main__":
    main()
