from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright
import json

ROOT = Path(__file__).resolve().parents[1]
PORT = 8765
class QuietHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def log_message(self, *_): pass
server = ThreadingHTTPServer(("127.0.0.1", PORT), QuietHandler)
Thread(target=server.serve_forever, daemon=True).start()
results=[]
out=ROOT/"artifacts"/"safari-build1"
out.mkdir(parents=True, exist_ok=True)
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        for width, height in [(320,720),(390,844),(768,1024),(1366,768)]:
            page=browser.new_page(viewport={"width":width,"height":height}, device_scale_factor=1)
            errs=[]
            page.on("pageerror",lambda err:errs.append(str(err)))
            response=page.goto(f"http://127.0.0.1:{PORT}/index.html",wait_until="networkidle",timeout=30000)
            assert response.status==200,(width,"home response",response.status)
            assert page.locator("h1").inner_text().find("Compassionate")>=0,(width,"wrong homepage")
            assert page.locator("nav.portals a").count()==4,(width,"missing room portals")
            image=page.evaluate("getComputedStyle(document.querySelector('.scene'),'::before').backgroundImage")
            assert "scene-01-lodge-panorama.jpg" in image,(width,"missing panorama")
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),(width,"horizontal overflow")
            # Click every portal and return to site home: actual navigation test, not mere href check
            for title in ["Learn","Try","Get Help","Continue"]:
                page.locator("nav.portals a").filter(has=page.get_by_role("heading",name=title,exact=True)).click()
                assert "/journey-" in page.url,(width,title,"bad destination",page.url)
                assert page.locator(".option-link").count()==4,(width,title,"missing destination choices")
                assert page.get_by_role("link",name="Back to Safari").count()==1,(width,title,"back missing")
                page.get_by_role("link",name="Back to Safari").click()
                assert page.url.endswith("/index.html"),(width,title,"back broken")
            assert not errs,(width,errs)
            page.screenshot(path=str(out/f"homepage-{width}.png"),full_page=True)
            if width<=390:
                page.locator("details.mobile-nav summary").click()
                assert page.get_by_role("link",name="Free Workshop").count()>=1
                page.locator("details.mobile-nav summary").click()
            # Preserve four Safari portals while testing the new dedicated Veterans entrance.
            page.locator(".vet-home-entry a").click()
            assert page.url.endswith("/veterans.html"), (width,"veterans entrance broken",page.url)
            assert page.get_by_role("heading",name="New skills. New possibilities.").count()==1,(width,"veterans heading absent")
            assert page.locator(".vet-resource-list a").count()==3,(width,"veterans resource links")
            assert "not yet open" in page.locator(".vet-stage").inner_text().lower(),(width,"pilot not accurately labeled")
            assert page.locator("input,form").count()==0,(width,"unexpected data capture")
            assert "book.stripe" not in page.content().lower(),(width,"payment path in veterans page")
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),(width,"veterans horizontal overflow")
            page.screenshot(path=str(out/f"veterans-{width}.png"),full_page=True)
            page.locator(".vet-back a").click()
            assert page.url.endswith("/index.html"),(width,"veterans return path failed")
            results.append({"viewport":width,"status":"PASS","click_throughs":5,"veterans":"PASS","errors":[]})
            page.close()
        browser.close()
    (out/"results.json").write_text(json.dumps(results,indent=2))
    print(json.dumps(results,indent=2))
finally:
    server.shutdown()
