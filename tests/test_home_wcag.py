"""Staging regression for CivicAscent WCAG-oriented real homepage, not WCAG certification.
Local-only, no checkout attempts, no messages, no third-party calls.
"""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
import json, re, sys

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT/"artifacts"/"home-wcag"
ART.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kw): super().__init__(*args,directory=str(ROOT),**kw)
    def log_message(self,*args): pass
server=ThreadingHTTPServer(("127.0.0.1",0),Quiet)
Thread(target=server.serve_forever,daemon=True).start()
base=f"http://127.0.0.1:{server.server_address[1]}"
out=[]
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        for width,height in [(320,760),(390,844),(768,1024),(1366,860)]:
            ctx=browser.new_context(viewport={"width":width,"height":height},reduced_motion="reduce")
            page=ctx.new_page()
            errors=[]
            page.on("pageerror",lambda e: errors.append(str(e)))
            response=page.goto(base+"/index.html",wait_until="networkidle",timeout=30000)
            assert response.status==200,("HTTP",width,response.status)
            assert page.title().startswith("CivicAscent AI"),(width,page.title())
            assert page.locator("header").count()==1
            assert page.locator("main#main").count()==1
            assert page.locator("main#main").get_attribute("tabindex")=="-1"
            assert page.get_by_role("heading",name="Learn AI, one step at a time.").count()==1
            assert page.locator("nav.learning-rooms a.learning-room").count()==4,(width,"all four distinct doors")
            expected=["journey-learn.html","journey-try.html","journey-help.html","journey-continue.html"]
            assert page.locator("nav.learning-rooms a.learning-room").evaluate_all("(links)=>links.map(a=>a.getAttribute('href'))")==expected
            colors=page.locator("nav.learning-rooms a.learning-room .room-enter").evaluate_all("(e)=>e.map(x=>getComputedStyle(x).backgroundColor)")
            assert len(set(colors))==4,(width,"distinct room colors",colors)
            assert page.locator("header nav.top-links a").count()==4
            assert page.locator(".reader-toolbar").is_visible()
            assert page.locator(".reader-toolbar").evaluate("(el)=>getComputedStyle(el).position")=="sticky"
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),(width,"initial sideways scrolling")
            page.keyboard.press("Tab")
            assert page.evaluate("document.activeElement.classList.contains('skip')"),(width,"skip should be first keyboard target")
            page.keyboard.press("Enter")
            assert page.evaluate("document.activeElement.id==='main'"),(width,"skip should focus main")
            page.locator("#text-plus").click()
            for _ in range(3): page.locator("#text-plus").click()
            assert page.evaluate("window.CivicReader.scale")==150,(width,"150pct reader enlargement")
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),(width,"large text sideways scroll")
            roomlinks=page.locator("nav.learning-rooms a.learning-room")
            for i in range(4):
                bb=roomlinks.nth(i).bounding_box()
                assert bb and bb["x"]>=-2 and bb["x"]+bb["width"]<=width+2,(width,"clipped door",i,bb)
            page.locator("#theme-toggle").click()
            assert page.locator('body[data-theme="dark"]').count()==1
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),(width,"dark mode overflow")
            page.locator("#scenery-toggle").click()
            assert page.locator("body.show-scene").count()==1,(width,"Safari picture opt-in")
            page.locator("#scenery-toggle").click()
            assert page.locator("body.show-scene").count()==0
            page.locator("#theme-toggle").click()
            # Reading controls remain consistent with separate practice route.
            r=page.goto(base+"/practice-sandbox.html",wait_until="networkidle",timeout=30000)
            assert r.status==200
            assert page.evaluate("window.CivicReader.scale")==150,(width,"reader settings persisted")
            page.get_by_role("button",name="Load a fictional example").click()
            page.get_by_role("button",name="Build my practice prompt").click()
            assert "My goal" in page.locator("#prompt-output").inner_text()
            page.goto(base+"/index.html",wait_until="networkidle",timeout=30000)
            page.locator("#text-minus").click()
            assert page.evaluate("window.CivicReader.scale")==137.5
            page.get_by_role("button",name="Reset reading settings").click()
            assert page.evaluate("window.CivicReader.scale")==100
            assert page.locator('body[data-theme="light"]').count()==1
            assert not errors,(width,"page JS errors",errors)
            page.screenshot(path=str(ART/f"homepage-{width}.png"),full_page=True)
            out.append({"width":width,"status":"PASS","rooms":4,"large_text":"PASS","focus":"PASS","colors":"4 distinct","practice":"PASS"})
            ctx.close()
        browser.close()
finally:
    server.shutdown()
(ART/"results.json").write_text(json.dumps(out,indent=2))
print(json.dumps({"test":"WCAG-style real homepage local Chromium acceptance","results":out,"manual_wcag":"pending","production":"not changed"},indent=2))
