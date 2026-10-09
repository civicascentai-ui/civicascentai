"""Read-only CivicAscent deputy QA review. No write permission or production actions."""
import json
import os
import sys
import urllib.request
from datetime import datetime, timezone

REPO = os.environ.get("GH_REPOSITORY", "civicascentai-ui/civicascentai")
TOKEN = os.environ.get("GH_TOKEN")
TRACKED = (17, 18, 19)
now = datetime.now(timezone.utc)
report = {"checked_at": now.isoformat(), "repository": REPO, "tasks": [], "escalations": [], "status": "ok"}
try:
    if not TOKEN:
        raise RuntimeError("GitHub read token unavailable")
    for number in TRACKED:
        request = urllib.request.Request(
            f"https://api.github.com/repos/{REPO}/issues/{number}",
            headers={"Authorization": f"Bearer {TOKEN}", "Accept": "application/vnd.github+json", "User-Agent": "civicascent-deputy-qa"},
        )
        with urllib.request.urlopen(request, timeout=15) as response:
            issue = json.load(response)
        labels = [label["name"] for label in issue.get("labels", [])]
        assignees = [person["login"] for person in issue.get("assignees", [])]
        item = {"number": number, "title": issue["title"], "state": issue["state"],
                "updated_at": issue["updated_at"], "assignees": assignees,
                "labels": labels, "url": issue["html_url"]}
        report["tasks"].append(item)
        if issue["state"] == "open":
            updated = datetime.fromisoformat(issue["updated_at"].replace("Z", "+00:00"))
            age_hours = (now - updated).total_seconds() / 3600
            if not assignees:
                report["escalations"].append({"issue": number, "reason": "No named GitHub assignee"})
            if age_hours > 24:
                report["escalations"].append({"issue": number, "reason": f"No issue update for {age_hours:.1f} hours"})
    if report["escalations"]:
        report["status"] = "attention_required"
except Exception as error:
    report["status"] = "monitor_failed"
    report["error"] = str(error)
with open("deputy-review.json", "w", encoding="utf-8") as output:
    json.dump(report, output, indent=2)
print(json.dumps(report, indent=2))
if report["status"] == "monitor_failed":
    sys.exit(1)
# Attention is evidence, not an automatic permission to edit or reassign issues.
