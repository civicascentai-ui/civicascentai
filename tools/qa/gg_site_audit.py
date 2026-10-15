#!/usr/bin/env python3
"""Read-only CivicAscent audit. Gemini disabled unless explicitly opted in and approved."""
import datetime as dt
import json
import os
from pathlib import Path
from urllib import request, error
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse

OUT = Path("gg-audit")
OUT.mkdir(exist_ok=True)
BASE = "https://civicascentai.com/"
PAGES = ["", "journey-learn.html", "journey-try.html", "journey-help.html", "journey-continue.html", "free-ai-starter.html", "register.html"]

class PageInspector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = False
        self.lang = False
        self.main = False
        self.skip = False
        self.images_missing_alt = 0
        self.links = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html": self.lang = bool(a.get("lang"))
        if tag == "title": self.title = True
        if tag == "main": self.main = True
        if tag == "img" and "alt" not in a: self.images_missing_alt += 1
        if tag == "a":
            href = a.get("href", "")
            if href.startswith("#") and "main" in href.lower(): self.skip = True
            if href and not href.startswith(("#","mailto:","tel:","javascript:")):
                url = urljoin(BASE, href)
                if urlparse(url).netloc == urlparse(BASE).netloc:
                    self.links.append(url)

results = []
for p in PAGES:
    url = urljoin(BASE,p)
    item = {"path":"/"+p,"url":url}
    try:
        req=request.Request(url,headers={"User-Agent":"CivicAscent-GG-Audit/1.1"})
        with request.urlopen(req,timeout=20) as resp:
            body=resp.read(300000).decode("utf-8","replace")
            item.update(status=resp.status,final_url=resp.url,html="<html" in body.lower())
        parser=PageInspector()
        parser.feed(body)
        item["accessibility_indicators"]={"html_lang":parser.lang,"title":parser.title,"main_landmark":parser.main,"skip_link":parser.skip,"images_without_alt_attribute":parser.images_missing_alt}
        item["internal_link_count"]=len(parser.links)
        item["pass"]=item["status"]==200 and item["html"]
    except Exception as exc:
        item.update(pass_=False,error=str(exc)[:200])
        item["pass"]=False
    results.append(item)

receipt={"utc":dt.datetime.now(dt.timezone.utc).isoformat(),"scope":"read-only HTTP and static HTML indicators","checks":results,"http_pass":all(r["pass"] for r in results),"limitations":["Not a WCAG certification","No JavaScript interaction or form submission","No live purchases","No DR failover testing"]}
(OUT/"http-audit.json").write_text(json.dumps(receipt,indent=2))
lines=["# CivicAscent GG audit", "",f"HTTP: {'PASS' if receipt['http_pass'] else 'FAIL'}", ""]
for r in results:
    lines.append(f"- {r['path']}: {'PASS' if r['pass'] else 'FAIL'} (HTTP {r.get('status','ERROR')})")
lines += ["","Static accessibility indicators are advisory, not WCAG compliance evidence."]
(OUT/"report.md").write_text("\n".join(lines)+"\n")

def gemini():
    if os.getenv("RUN_GEMINI","false").lower()!="true":
        (OUT/"gemini-status.txt").write_text("SKIPPED: no Gemini API calls; zero Gemini API requests from this workflow")
        return
    if os.getenv("GG_PAID_USAGE_APPROVED","false").lower()!="true":
        (OUT/"gemini-status.txt").write_text("BLOCKED: independent billing approval required before any Gemini API request")
        return
    key=os.getenv("GEMINI_API_KEY","")
    if not key:
        (OUT/"gemini-status.txt").write_text("BLOCKED: missing API secret")
        return
    # A successful model listing does not guarantee generation access or free-tier billing.
    req=request.Request("https://generativelanguage.googleapis.com/v1beta/models",headers={"x-goog-api-key":key})
    try:
        with request.urlopen(req,timeout=25) as resp:
            models=json.load(resp).get("models",[])
        eligible=[m["name"] for m in models if "generateContent" in m.get("supportedGenerationMethods",[]) and "flash" in m["name"].lower()]
        if not eligible:
            (OUT/"gemini-status.txt").write_text("BLOCKED: no compatible Flash model")
            return
        model=next((m for m in eligible if m.endswith("/gemini-2.5-flash")),eligible[0])
        prompt="Review these read-only checks; identify defects and untested areas. Do not claim WCAG, browser, checkout or recovery PASS.\n"+json.dumps(receipt)
        payload=json.dumps({"contents":[{"parts":[{"text":prompt}]}],"generationConfig":{"maxOutputTokens":900}}).encode()
        endpoint="https://generativelanguage.googleapis.com/v1beta/"+model+":generateContent"
        api_req=request.Request(endpoint,data=payload,headers={"x-goog-api-key":key,"Content-Type":"application/json"},method="POST")
        try:
            with request.urlopen(api_req,timeout=75) as resp:
                response=json.load(resp)
            answer="\n".join(p.get("text","") for c in response.get("candidates",[]) for p in c.get("content",{}).get("parts",[]))
            (OUT/"gemini-review.md").write_text(answer or "No review text returned")
            (OUT/"gemini-status.txt").write_text(f"REQUEST SUCCEEDED: {model}; billing still unverified")
        except error.HTTPError as exc:
            raw=exc.read(2500).decode("utf-8","replace")
            try:
                obj=json.loads(raw).get("error",{})
                reason=obj.get("status","UNKNOWN")
                detail=obj.get("message","")[:700]
            except ValueError:
                reason="UNKNOWN";detail="Response was not JSON"
            (OUT/"gemini-status.txt").write_text(f"GENERATION FAILED HTTP {exc.code} ({reason}): {detail}\nModel: {model}\nNo automatic retries; billing unknown")
    except error.HTTPError as exc:
        (OUT/"gemini-status.txt").write_text(f"MODEL DISCOVERY FAILED HTTP {exc.code}; generation not attempted")
    except Exception as exc:
        (OUT/"gemini-status.txt").write_text("Gemini diagnostic error: "+str(exc)[:250])

gemini()
print("\n".join(lines))
print((OUT/"gemini-status.txt").read_text())
if not receipt["http_pass"]:
    raise SystemExit("HTTP site checks failed; inspect artifact")
