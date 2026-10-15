from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright
import json

ROOT = Path(__file__).resolve().parents[1]
ROUTES = ["index.html","course.html","mentor.html","free-ai-starter.html","living-ai-lab.html","programs.html","es.html","register.html","journey-learn.html","journey-try.html","journey-help.html","journey-continue.html"]
OUT = ROOT / "artifacts" / "sitewide-browser"
OUT.mkdir(parents=True, exist_ok=True)
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def log_message(self, *args): pass
server = ThreadingHTTPServer(("127.0.0.1",0),Handler)
Thread(target=server.serve_forever,daemon=True).start()
results = []
failures = []
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for width,height in [(390,844),(1366,768)]:
            page = browser.new_page(viewport={"width":width,"height":height})
            for route in ROUTES:
                errors = []
                page.on("pageerror", lambda e: errors.append(str(e)))
                response = page.goto(f"http://127.0.0.1:{server.server_port}/{route}",wait_until="load",timeout=20000)
                page.screenshot(path=str(OUT / f"{route[:-5]}-{width}.png"),full_page=True,animations="disabled")
                result = {"route":route,"viewport":width,"http":response.status if response else None,
                          "title":page.title(),"horizontal_overflow":page.evaluate("document.documentElement.scrollWidth > innerWidth + 2"),
                          "page_errors":errors}
                result["pass"] = result["http"]==200 and not result["horizontal_overflow"] and not errors
                results.append(result)
                if not result["pass"]: failures.append(result)
            page.close()
        browser.close()
finally:
    server.shutdown()
(OUT/"results.json").write_text(json.dumps({"results":results,"failures":failures},indent=2))
print(json.dumps({"checks":len(results),"failures":failures},indent=2))
assert not failures, "Browser QA failed; see screenshot artifact and results.json"
