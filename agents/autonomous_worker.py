#!/usr/bin/env python3
"""SCOUT-style CivicAscent role workers. Read-only, deterministic, no paid APIs.

These are scheduled automation workers, NOT persistent human/LLM agents.
No write methods, production deployment, customer data, orders, or outreach.
"""
import argparse
import datetime
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

REPO = "civicascentai-ui/civicascentai"
BASE_API = "https://api.github.com/repos/" + REPO + "/issues/"
SITE_BASE = "https://civicascentai.com/"
ROOT = Path(__file__).resolve().parents[1]
ROOMS = ("journey-learn.html", "journey-try.html", "journey-help.html", "journey-continue.html")
TASKS = {
    "sam": (21, 22, 68),
    "friday": (26, 50, 95),
    "zebra": (22, 26, 68),
    "reach": (33, 34, 36),
    "codi": (17, 20, 21, 22, 26, 50, 68, 92),
    "gg": (17, 20, 21, 22, 26, 50, 68, 92),
}
MISSIONS = {
    "sam": "Engineering: production route health and safety blockers",
    "friday": "Independent QA: visitor links, accessibility basics, checkout hold",
    "zebra": "Independent critical review: risky checkout links and release gates",
    "reach": "Partner/reviewer lead triage: read and prepare, NEVER contact",
    "codi": "Co-Executive CODI: current P0 issue inventory and next priority",
    "gg": "Co-Executive GG (Gemini): equal P0 issue coordination and independent priority review",
}

class PageLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = set()
        self.headings = []
        self._in_h1 = False
    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self.links.update(v for k, v in attrs if k == "href" and v)
        if tag == "h1":
            self._in_h1 = True
    def handle_endtag(self, tag):
        if tag == "h1":
            self._in_h1 = False
    def handle_data(self, data):
        if self._in_h1:
            self.headings.append(data.strip())

def get_json(url, token):
    if not url.startswith(BASE_API):
        raise ValueError("Disallowed public GitHub issue API URL")
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "CivicAscent-ReadOnly-Worker",
    }
    if token:
        headers["Authorization"] = "Bearer " + token
    with urlopen(Request(url, headers=headers, method="GET"), timeout=18) as res:
        if res.status != 200:
            raise RuntimeError("Unexpected GitHub API response: " + str(res.status))
        return json.loads(res.read(150000))

def get_page(route):
    if route and (route.startswith("/") or ".." in route or not re.fullmatch(r"[\w.-]+", route)):
        raise ValueError("External/unsafe route not allowed")
    target = SITE_BASE + route
    with urlopen(Request(target, headers={"User-Agent":"CivicAscent-ReadOnly-QA/1.0"}, method="GET"), timeout=22) as res:
        data = res.read(300000).decode("utf-8", "replace")
        if res.status != 200 or "<html" not in data.lower():
            raise RuntimeError("Site unavailable or invalid HTML: " + route)
        return data

def check(report, label, condition, critical=False):
    passed = bool(condition)
    report["checks"][label] = "PASS" if passed else "FAIL"
    if not passed and critical:
        report["critical_failures"].append(label)

def fetch_tasks(report, token):
    summaries = []
    for number in TASKS[report["role"]]:
        try:
            issue = get_json(BASE_API + str(number), token)
            if issue.get("number") != number or not isinstance(issue.get("title"), str):
                raise ValueError("Malformed issue response")
            summaries.append({
                "number": number, "state": issue.get("state"),
                "title": issue["title"][:150],
                "url": issue.get("html_url"),
                "updated_at": issue.get("updated_at"),
                "source": "LIVE_PUBLIC_GITHUB_ISSUE",
            })
        except (HTTPError, URLError, RuntimeError, ValueError, TimeoutError) as exc:
            report["warnings"].append("Issue " + str(number) + " unreadable: " + type(exc).__name__)
    report["issues"] = summaries
    check(report,"issue_inventory_available",len(summaries)>0,critical=True)
    return summaries

def do_sam(report):
    for route in ("", *ROOMS, "course.html", "register.html", "consultation.html"):
        try:
            html = get_page(route)
            check(report, "public_page_" + (route or "home"), "</html>" in html.lower(),critical=True)
        except Exception as exc:
            check(report, "public_page_" + (route or "home"), False,critical=True)
            report["warnings"].append("Route " + (route or "home") + ": " + type(exc).__name__)
    report["next_safe_action"] = "Engineering triage for failed routes, or review unresolved security/rollback issue #22; do not deploy."

def do_friday(report):
    try:
        home = get_page("")
        parsed = PageLinks()
        parsed.feed(home)
        check(report, "home_has_heading", any(x for x in parsed.headings), critical=True)
        for route in ROOMS:
            check(report, "home_links_" + route, route in parsed.links, critical=True)
        for route in ROOMS:
            html = get_page(route)
            links = PageLinks()
            links.feed(html)
            check(report, "room_links_back_" + route, "index.html" in links.links,critical=True)
        spanish = get_page("curso-es.html")
        check(report, "spanish_paid_buy_links_disabled", "buy.stripe.com/" not in spanish,critical=True)
        report["warnings"].append("Screen-reader, manual older-adult QC and 25 real purchase/fulfillment tests NOT performed.")
    except Exception as exc:
        check(report, "qa_public_route_audit", False, critical=True)
        report["warnings"].append("QA page audit unavailable: " + type(exc).__name__)
    report["next_safe_action"] = "Keep paid sales HOLD until separately witnessed 25 E2E and accessibility QC."

def do_zebra(report):
    pages = {}
    for route in ("", "course.html", "curso-es.html"):
        try:
            pages[route] = get_page(route)
        except Exception as exc:
            check(report, "independent_page_" + (route or "home"), False, critical=True)
            report["warnings"].append("Missing independent comparison page " + route + ": " + type(exc).__name__)
    for name in ("course.html", "curso-es.html"):
        if name in pages:
            check(report, "unsafe_paid_buy_link_absent_" + name, "buy.stripe.com/" not in pages[name],critical=True)
    if "" in pages:
        for room in ROOMS:
            check(report,"four_room_design_path_" + room,room in pages[""],critical=True)
    check(report,"full_visual_storyboard_QC_complete",False)
    report["warnings"].append("Automated link inspection is NOT independent visual acceptance of approved cinematic art.")
    report["next_safe_action"] = "Review visual acceptance #68 and backup recovery #22 independently; escalate evidence gaps, never certify full release from HTTP success."

def do_reach(report):
    issues = report.get("issues", [])
    open_issues = [x["number"] for x in issues if x.get("state") == "open"]
    check(report,"reviewer_and_partner_intake_open",bool(open_issues))
    report["unresolved_research_targets"] = open_issues
    report["next_safe_action"] = "Review official, public sources for reviewer/partner fit; prepare draft for approval only. Do NOT email, DM, post, or submit forms."
    report["warnings"].append("No outreach, new contacts, external sharing, or volunteer acceptance performed.")

def do_codi(report):
    report["co_executive_parity"] = True
    report["co_executive_peer"] = "gg" if report["role"] == "codi" else "codi"
    issues = report.get("issues", [])
    opens = [x for x in issues if x.get("state") == "open"]
    rank = (68, 22, 26, 50, 21, 20, 17, 92)
    report["priority_open_queue"] = [x["number"] for key in rank for x in opens if x["number"] == key]
    check(report, "tracked_open_backlog", bool(opens))
    report["next_safe_action"] = "Assign next P0 from priority_open_queue to engineering or independent QA; do not assert external staffing or completion."

def do_gg(report):
    """GG has CODI-equivalent read-only operating authority and queue access.

    This deterministic worker is not a Gemini model call.
    """
    do_codi(report)
    report["next_safe_action"] = (
        "Co-lead the P0 queue with CODI; independently challenge priorities, "
        "request separate FRIDAY/ZEBRA QC, escalate conflicts to President; never deploy."
    )
    report["model_execution"] = "NOT_INVOKED_DETERMINISTIC_ROLE_RECEIPT"

def main(argv=None):
    p=argparse.ArgumentParser()
    p.add_argument("--role",choices=sorted(TASKS),required=True)
    p.add_argument("--output-dir",default="agent-receipts")
    p.add_argument("--offline-self-check",action="store_true")
    args=p.parse_args(argv)
    if args.offline_self_check:
        for x in ROOMS:
            assert x in ("journey-learn.html","journey-try.html","journey-help.html","journey-continue.html")
        parser = PageLinks()
        parser.feed('<html><h1>Safe</h1><a href="index.html">Back</a></html>')
        assert parser.headings == ["Safe"] and "index.html" in parser.links
        assert sorted(TASKS) == ["codi","friday","gg","reach","sam","zebra"]
        assert TASKS["gg"] == TASKS["codi"]
        assert MISSIONS["gg"].startswith("Co-Executive GG")
        try:
            get_page("../bad-route")
        except ValueError:
            pass
        else:
            raise AssertionError("Traversal must be rejected")
        print("PASS: role registry, HTML parser and URL safety")
        return 0
    if os.getenv("GITHUB_ACTIONS") != "true" or os.getenv("GITHUB_REPOSITORY") != REPO:
        raise SystemExit("Blocked: only the authorized public GitHub Actions repository can run live tasks")
    report={
        "schema":"civicascent.agent-worker.v1",
        "role":args.role, "mission":MISSIONS[args.role],
        "timestamp_utc":datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "github_run_id":os.getenv("GITHUB_RUN_ID"),
        "commit":os.getenv("GITHUB_SHA"),
        "run_url":"https://github.com/"+REPO+"/actions/runs/"+str(os.getenv("GITHUB_RUN_ID","")),
        "execution":"ACTUAL_AUTOMATED_READ_ONLY_CHECKS_NOT_LLM",
        "permission_scope":"contents:read, issues:read; no mutation",
        "spend_policy":"public standard GitHub Actions Linux; no paid API",
        "checks":{}, "critical_failures":[], "warnings":[],
        "no_purchases":True, "no_emails":True, "no_production_deploy":True,
        "no_unattended_agent_dispatch":True
    }
    fetch_tasks(report,os.getenv("GITHUB_TOKEN"))
    {
        "sam":do_sam,
        "friday":do_friday,
        "zebra":do_zebra,
        "reach":do_reach,
        "codi":do_codi,
        "gg":do_gg
    }[args.role](report)
    report["status"] = "FAIL" if report["critical_failures"] else ("ATTENTION" if report["warnings"] else "PASS")
    out = Path(args.output_dir)
    out.mkdir(parents=True,exist_ok=True)
    location=out/(args.role+".json")
    location.write_text(json.dumps(report,sort_keys=True,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"role":args.role,"status":report["status"],"issues":len(report.get("issues",[])),
                      "checks":len(report["checks"]),"critical_failures":report["critical_failures"],
                      "receipt":str(location)},sort_keys=True))
    return 1 if report["critical_failures"] else 0

if __name__ == "__main__":
    sys.exit(main())
