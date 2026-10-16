#!/usr/bin/env python3
"""Issue #22: fail-closed, metadata-only P0 disaster recovery acceptance audit.

Never reads customer rows, secrets, environment values, or production endpoints.
Green CI means AUDIT PASSED; it NEVER implies the full DR acceptance is green.
"""
import argparse
import json
import os
import pathlib


REQUIRED_GATES = {
    "published": (
        "siteCodeRestoreVerified", "codeOnlyOffProviderBackupVerified",
        "staticRouteRollbackVerified", "paidCheckoutGuardOfflineVerified",
    ),
    "standby": (
        "matchingSourceCommit", "previewBuildReady",
        "protectedPreviewRuntimeAccepted", "buildSuppressionReadBack",
        "actualTrafficFailoverVerified",
    ),
    "dataScope": (
        "productionDatabaseDependencyProven", "privateDataBackupEncryptedOffProvider",
        "privateDataRestoreVerified", "storageBackupRestoreVerified",
        "productionSecretsReconstructionVerified",
        "stripeHostedRegistrationRecoverabilityVerified",
    ),
    "recovery": (
        "measuredFullEnvironmentRPO", "measuredFullEnvironmentRTO",
        "independentWitnessSignoff",
    ),
}


def inspect(manifest):
    assert manifest["scope"] == "PUBLIC_METADATA_ONLY_NO_PRIVATE_ROWS_OR_SECRETS"
    assert manifest["dataScope"]["supabaseOrganizationPlan"] == "free"
    assert manifest["published"]["sourceCommit"]
    projects = manifest["dataScope"]["projects"]
    assert len(projects) >= 2, "Project inventory is incomplete"
    for p in projects:
        assert p["role"] and p["status"]
        for k in ("publicTables", "privateTables", "schemaMigrations",
                  "activeEdgeFunctions", "storageBuckets", "storageObjectsApprox"):
            assert type(p[k]) is int and p[k] >= 0, (p["role"], k)
        for k in ("dataBackupVerified", "isolatedDataRestoreVerified"):
            assert type(p[k]) is bool, (p["role"], k)
    gates = {f"{section}.{key}": manifest[section][key]
             for section, keys in REQUIRED_GATES.items() for key in keys}
    assert all(type(v) is bool for v in gates.values())
    blockers = sorted(k for k, accepted in gates.items() if not accepted)
    for p in projects:
        for key in ("dataBackupVerified", "isolatedDataRestoreVerified"):
            if not p[key]:
                blockers.append("dataProject:" + p["role"] + ":" + key)
    blockers.sort()
    can_release = not blockers
    claimed = manifest["recovery"]["fullDisasterRecoveryReady"]
    assert type(claimed) is bool
    if claimed != can_release:
        raise AssertionError(
            "FAIL-CLOSED: fullDisasterRecoveryReady must match evidence; "
            f"claimed={claimed}, verified={can_release}"
        )
    return {
        "scope": "METADATA_ONLY_DONT_TREAT_AS_DATA_BACKUP",
        "audit": "PASS",
        "fullDisasterRecoveryReady": can_release,
        "disposition": "READY_REQUIRES_HUMAN_REVIEW" if can_release else "BLOCKED",
        "verifiedCodeSource": manifest["published"]["sourceCommit"],
        "projectCount": len(projects),
        "blockerCount": len(blockers),
        "blockers": blockers,
        "limits": ["No restored private data", "No live failover",
                   "No password/credential export", "No preview SSO bypass"],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--production-sha", required=True, help="Actual fetched origin/main commit SHA")
    args = parser.parse_args()
    data = json.loads(pathlib.Path(args.manifest).read_text(encoding="utf-8"))
    if data["published"]["sourceCommit"] != args.production_sha:
        raise AssertionError(
            "FAIL-CLOSED: metadata backup baseline does not match actual production SHA "
            f"({data['published']['sourceCommit']} != {args.production_sha})"
        )
    result = inspect(data)
    dest = pathlib.Path(args.output)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    report = (
        "## Full-environment recovery audit\n"
        f"- Metadata audit: **{result['audit']}**\n"
        f"- Full DR acceptance: **{result['disposition']}** "
        f"({result['blockerCount']} missing gates)\n"
        "- Successful audit DOES NOT prove database or Vercel failover restoration.\n"
    )
    print(report)
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as f:
            f.write(report)


if __name__ == "__main__":
    main()
