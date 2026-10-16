#!/usr/bin/env python3
"""Safe public HTTP and markup smoke test. Never submits forms or calls payment APIs."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from hashlib import sha256
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
import json, pathlib, time
from urllib.parse import urlparse

SITES = {
    "production": "https://civicascentai.com/",
    "shadow": "https://civicascentai-launch-qa.vercel.app/",
}
PATHS = [
    "", "journey-learn.html", "journey-try.html", "journey-help.html",
    "journey-continue.html", "veterans.html", "course.html", "programs.html",
    "free-ai-starter.html", "level2.html", "clear-start.html",
    "practice-sandbox.html", "register.html", "registro.html", "es.html",
    "404.html",
]

class Surface(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.lang = None
        self.main = 0
        self.images_without_alt = 0
        self.empty_href = 0
        self.title = False
        self.title_text = ""
        self._title_open = False
        self.headings = 0
    def handle_starttag(self, tag, attrlist):
        attrs = dict(attrlist)
        if tag == "html":
            self.lang = attrs.get("lang")
        elif tag == "main":
            self.main += 1
        elif tag == "img" and "alt" not in attrs:
            self.images_without_alt += 1
        elif tag == "a" and attrs.get("href") == "":
            self.empty_href += 1
        elif tag == "title":
            self.title = True
            self._title_open = True
        elif tag == "h1":
            self.headings += 1
    def handle_endtag(self, tag):
        if tag == "title":
            self._title_open = False
    def handle_data(self, data):
        if self._title_open:
            self.title_text += data

def inspect(site, path):
    url = SITES[site] + path
    record = {"site": site, "path": "/" + path, "http": None, "pass": False}
    start = time.monotonic()
    try:
        req = Request(url, headers={
            "User-Agent": "CivicAscent-QA/1.0 (read-only public smoke; no checkout)",
            "Accept": "text/html",
        }, method="GET")
        with urlopen(req, timeout=15) as reply:
            record["http"] = reply.status
            record["final_url_host"] = urlparse(reply.geturl()).hostname
            raw = reply.read(2_000_000)
            record["content_type"] = reply.headers.get("Content-Type", "")
        record["bytes"] = len(raw)
        record["sha256"] = sha256(raw).hexdigest()
        p = Surface()
        p.feed(raw.decode("utf-8", "replace"))
        record.update(title=p.title_text.strip()[:120], lang=p.lang,
                      main_count=p.main, h1_count=p.headings,
                      images_without_alt=p.images_without_alt,
                      empty_href=p.empty_href)
        record["pass"] = record["http"] == 200 and p.title and p.main >= 1 and bool(p.lang)
        record["issue"] = None if record["pass"] else "HTTP or HTML semantics failure"
    except HTTPError as e:
        record["http"] = e.code
        record["issue"] = "HTTP " + str(e.code)
    except (URLError, TimeoutError, OSError, ValueError) as e:
        record["issue"] = type(e).__name__ + ": " + str(e)[:180]
    record["elapsed_ms"] = int((time.monotonic() - start) * 1000)
    return record

def main():
    tasks = [(site, p) for site in SITES for p in PATHS]
    receipts = []
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = [pool.submit(inspect, site, p) for site, p in tasks]
        for f in as_completed(futures):
            receipts.append(f.result())
    receipts.sort(key=lambda v: (v["path"], v["site"]))
    grouped = {}
    for r in receipts:
        grouped.setdefault(r["path"], {})[r["site"]] = r
    drift = []
    for path, pair in grouped.items():
        a, b = pair.get("production"), pair.get("shadow")
        if a and b and a.get("http") == 200 and b.get("http") == 200:
            if a.get("sha256") != b.get("sha256"):
                drift.append(path)
    failures = [x for x in receipts if not x["pass"]]
    accessible_flags = [x for x in receipts if x.get("images_without_alt", 0) > 0 or x.get("h1_count", 0) != 1]
    summary = {
        "scope": "public GET only; no form submissions, logins, payment, learner data or environment changes",
        "checks": len(receipts),
        "passes": len(receipts)-len(failures),
        "failures": len(failures),
        "content_sha_mismatch_paths": drift,
        "markup_accessibility_flags": [{"site":r["site"],"path":r["path"],"missing_alt":r.get("images_without_alt",0),"h1":r.get("h1_count",0)} for r in accessible_flags],
        "limits": [
            "HTTP/markup is not a real browser interaction or WCAG certification",
            "Public-content parity is not validated database failover",
            "No signed checkout or entitlement delivery tested",
            "Production and shadow versions may differ by design; differences require human triage",
            "No vendor service credentials or private records accessed",
        ]
    }
    pathlib.Path("all-systems-evidence").mkdir(exist_ok=True)
    pathlib.Path("all-systems-evidence/public-http.json").write_text(json.dumps({"summary":summary,"routes":receipts},indent=2)+"\n")
    print("READ-ONLY LIVE AUDIT: GET checks",summary["checks"],"pass",summary["passes"],"fail",summary["failures"])
    for rec in receipts:
        print(f'{rec["site"]:10} {rec["path"]:28} status={rec.get("http")} pass={rec["pass"]} issue={rec.get("issue") or ""}')
    print("CONTENT SHA DIFFERENCES",len(drift),", ".join(drift))
    print("ACCESSIBILITY MARKUP FLAGS",len(accessible_flags))
    print("NO PAYMENT, NO EMAIL, NO WEB WRITES, NO LIVE TRAFFIC CUTOVER")
    if failures or drift or accessible_flags:
        raise SystemExit(1)

if __name__ == "__main__":
    main()
