"""Read-only production browser smoke audit. GET navigation only; no forms, clicks, or purchases."""
import json
from pathlib import Path
from urllib.parse import urljoin, urlparse
from playwright.sync_api import sync_playwright

BASE = "https://civicascentai.com/"
ROUTES = ["", "course.html", "mentor.html", "programs.html", "register.html",
          "veterans.html", "es.html", "free-ai-starter.html", "living-ai-lab.html",
          "practice-sandbox.html", "consultation.html", "capabilities.html",
          "level2.html", "learner-questions.html", "curso-es.html", "registro.html",
          "learner-interest.html", "safari-home.html", "village.html",
          "journey-learn.html", "journey-try.html", "journey-help.html",
          "journey-continue.html"]
OUT = Path("artifacts/production-readonly")
OUT.mkdir(parents=True, exist_ok=True)
results = []
links = {}
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for width, height in [(390, 844), (1366, 768)]:
        context = browser.new_context(viewport={"width":width,"height":height}, accept_downloads=False)
        for route in ROUTES:
            page = context.new_page()
            page_errors = []
            page.on("pageerror", lambda err: page_errors.append(str(err)))
            url = urljoin(BASE, route)
            record = {"route":route or "index.html", "viewport":width, "url":url}
            try:
                response = page.goto(url, wait_until="domcontentloaded", timeout=25000)
                page.wait_for_timeout(350)
                record["http"] = response.status if response else None
                record["final_url"] = page.url
                record["title"] = page.title()
                record["overflow"] = page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 2")
                record["page_errors"] = page_errors[:10]
                record["broken_images"] = page.locator("img").evaluate_all("(imgs) => imgs.filter(i => !i.complete || i.naturalWidth===0).map(i=>i.src).slice(0,10)")
                record["missing_main"] = page.locator("main, [role=main]").count() == 0
                if width == 1366:
                    anchors = page.locator("a[href]").evaluate_all("(els) => els.map(e=>e.href)")
                    links[route or "index.html"] = sorted(set(u for u in anchors if urlparse(u).netloc == urlparse(BASE).netloc))
                page.screenshot(path=str(OUT / f"{(route or 'index.html').replace('.html','')}-{width}.png"),full_page=True,animations="disabled",timeout=15000)
            except Exception as e:
                record["error"] = str(e)[:400]
            record["pass"] = record.get("http") == 200 and not record.get("overflow",True) and not record.get("page_errors") and not record.get("broken_images") and "error" not in record
            results.append(record)
            page.close()
        context.close()
    browser.close()
report = {"target":BASE,"read_only":True,"checks":len(results),"passed":sum(r["pass"] for r in results),"failed":[r for r in results if not r["pass"]],"results":results,"internal_links":links}
(OUT / "report.json").write_text(json.dumps(report,indent=2))
print(json.dumps({"checks":report["checks"],"passed":report["passed"],"failed":report["failed"]},indent=2))
assert not report["failed"], "Production smoke failures detected. See uploaded artifacts."
