"""Retired themed entrance regression: verify accessible four-room navigation.
This preserves all learner destinations and checks the legacy URL redirects to
the approved accessible homepage. No checkout, API use or personal data.
"""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright
import json

ROOT = Path(__file__).resolve().parents[1]
class QuietHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def log_message(self, *_): pass
server = ThreadingHTTPServer(("127.0.0.1", 0), QuietHandler)
Thread(target=server.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{server.server_address[1]}"
out=ROOT/"artifacts"/"safari-build1"
out.mkdir(parents=True, exist_ok=True)
results=[]
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        for width,height in [(320,720),(390,844),(768,1024),(1366,768)]:
            page=browser.new_page(viewport={"width":width,"height":height}, reduced_motion="reduce")
            errors=[]
            page.on("pageerror", lambda err: errors.append(str(err)))
            page.goto(base+"/safari-home.html", wait_until="domcontentloaded")
            page.wait_for_url("**/index.html",timeout=12000)
            assert page.get_by_role("heading",name="Learn AI, one step at a time.").count()==1,(width,"replacement homepage")
            assert page.locator(".choices article.choice").count()==3,(width,"approved three choices")
            assert page.locator('a[href="safari-home.html"]').count()==0,(width,"retired Safari link exposed")
            for route,title in [
                ("journey-learn.html","Learn"),
                ("journey-try.html","Try"),
                ("journey-help.html","Get Help"),
                ("journey-continue.html","Continue"),
            ]:
                page.goto(base+"/"+route,wait_until="domcontentloaded")
                assert page.locator('meta[name="civicascent-build"]').get_attribute("content")=="accessible-learning-rooms-20261015",(width,route,"new accessible build")
                assert page.get_by_role("heading",name=title,exact=True).count()==1,(width,route,"room title")
                assert page.locator(".options a.option-link").count()==4,(width,route,"four learning paths")
                assert page.locator('link[href="assets/learning-rooms-accessible.css"]').count()==1,(width,route,"accessible stylesheet")
                assert page.locator('link[href*="safari"]').count()==0,(width,route,"obsolete styling")
                assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"),(width,route,"horizontal overflow")
                for el in page.locator(".options a.option-link").all():
                    box=el.bounding_box()
                    assert box and box["height"]>=48,(width,route,"small choice target")
                if width<=780:
                    toggle=page.locator(".mobile-nav summary")
                    assert toggle.is_visible(),(width,route,"mobile navigation missing")
                    toggle.click()
                    assert page.locator(".mobile-nav .menu-links").is_visible(),(width,route,"mobile menu not shown")
                    toggle.click()
                assert page.get_by_role("link",name="Back to home").count()==1
                page.get_by_role("link",name="Back to home").click()
                assert page.url.endswith("/index.html"),(width,route,"broken return")
            page.goto(base+"/veterans.html",wait_until="domcontentloaded")
            assert page.get_by_role("heading",name="New skills. New possibilities.").count()==1
            assert page.get_by_role("link",name="Back to home").count()==1,(width,"retired Veterans link missing")
            assert page.locator('a[href="safari-home.html"]').count()==0,(width,"retired Safari link on Veterans")
            assert "Safari" not in page.locator("body").inner_text(),(width,"obsolete Safari text on Veterans")
            page.keyboard.press("Tab")
            assert page.evaluate("document.activeElement.classList.contains('vet-skip')"),(width,"Veterans first-tab skip link")
            page.keyboard.press("Enter")
            assert page.evaluate("document.activeElement.id==='main'"),(width,"Veterans skip link focus landing")
            assert page.locator(".vet-resource-list a").count()==3
            assert page.locator("input,form").count()==0
            assert "book.stripe" not in page.content().lower()
            assert not errors,(width,"browser JS errors",errors)
            page.screenshot(path=str(out/f"accessible-veterans-{width}.png"),full_page=True)
            page.get_by_role("link",name="Back to home").click()
            assert page.url.endswith("/index.html"),(width,"Veterans return must reach approved homepage")
            results.append({"viewport":width,"result":"PASS","rooms":4,"legacy_redirect":"PASS","veterans":"PASS"})
            page.close()
        browser.close()
    (out/"results.json").write_text(json.dumps(results,indent=2))
    print(json.dumps(results,indent=2))
finally:
    server.shutdown()
