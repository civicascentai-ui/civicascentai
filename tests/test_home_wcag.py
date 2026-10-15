"""Browser QC for screenshot-approved CivicAscent homepage, isolated localhost only.
   Does NOT certify full WCAG conformance. No payments, signups or external APIs.
"""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
import json

ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/"artifacts"/"home-wcag"
ART.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kw):super().__init__(*args,directory=str(ROOT),**kw)
    def log_message(self,*args):pass
server=ThreadingHTTPServer(("127.0.0.1",0),Quiet)
Thread(target=server.serve_forever,daemon=True).start()
base=f"http://127.0.0.1:{server.server_address[1]}"
out=[]
try:
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True)
        for width,height in [(320,760),(390,844),(768,1024),(987,1540),(1366,860)]:
            ctx=browser.new_context(viewport={"width":width,"height":height},reduced_motion="reduce")
            page=ctx.new_page()
            errs=[]
            page.on("pageerror",lambda err:errs.append(str(err)))
            resp=page.goto(base+"/index.html",wait_until="networkidle",timeout=30000)
            assert resp.status==200,(width,"home status")
            assert page.locator('meta[name="civicascent-build"]').get_attribute('content')=="screenshot-approved-three-choice-wcag-20261015"
            assert page.get_by_role("heading",name="Learn AI, one step at a time.").count()==1
            assert page.locator("main#main").get_attribute("tabindex")=="-1"
            assert page.locator("header nav.top-links a").count()==3,(width,"screenshot top navigation")
            assert page.locator("header nav.top-links a").evaluate_all("(a)=>a.map(x=>x.textContent.trim())")==["Safari Home","Español","Free Workshop"]
            assert page.locator("main .choices article.choice").count()==3,(width,"exactly 3 choices")
            assert page.get_by_role("heading",name="What would you like to do?").count()==1
            expected=["journey-learn.html","practice-sandbox.html","journey-help.html"]
            assert page.locator(".choices a.choice-link").evaluate_all("(a)=>a.map(x=>x.getAttribute('href'))")==expected,(width,"choice destinations")
            assert page.get_by_role("heading",name="Other ways to begin").count()==1
            assert page.locator(".other-links a").count()==3
            assert page.get_by_role("heading",name="Remember").count()==1
            assert "Nothing is saved about you" in page.locator(".preferences-desc").inner_text()
            assert page.locator("#theme-toggle").get_attribute("aria-pressed")=="false"
            assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"),(width,"initial overflow")
            if width>=987:
                boxes=page.locator(".choices .choice").evaluate_all("(els)=>els.map(el=>el.getBoundingClientRect().y)")
                assert max(boxes)-min(boxes)<3,(width,"cards should form same row",boxes)
            if width<=390:
                boxes=page.locator(".choices .choice").evaluate_all("(els)=>els.map(el=>el.getBoundingClientRect().y)")
                assert boxes==sorted(boxes) and len(set(boxes))==3,(width,"phone cards stack")
            page.keyboard.press("Tab")
            assert page.evaluate("document.activeElement.classList.contains('skip-link')"),(width,"skip first")
            page.keyboard.press("Enter")
            assert page.evaluate("document.activeElement.id==='main'"),(width,"skip focus")
            # Validate settings at defaults and reload: no local storage or preference carryover.
            page.locator("#text-minus").click()
            assert page.evaluate("getComputedStyle(document.documentElement).fontSize")=="14.4px",(width,"smaller works from initial")
            for _ in range(5):page.locator("#text-plus").click()
            assert page.locator("#text-plus").is_disabled()
            assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"),(width,"large font overflow")
            for a in page.locator(".choice-link").all():
                box=a.bounding_box()
                assert box and box["x"]>=-2 and box["x"]+box["width"]<=width+2,(width,"choice off-screen",box)
                assert box["height"]>=48,(width,"target too small",box)
            page.locator("#theme-toggle").click()
            assert page.locator('body[data-theme="dark"]').count()==1
            assert page.locator("#theme-toggle").get_attribute("aria-pressed")=="true"
            page.locator("#scenery-toggle").click()
            assert page.locator("body.show-scene").count()==1
            assert "scene-01-lodge-panorama.jpg" in page.locator(".intro").evaluate("(e)=>getComputedStyle(e).backgroundImage")
            page.locator("#scenery-toggle").click()
            assert page.locator("body.show-scene").count()==0
            # User-chosen UI preferences must not be stored or carried into a reload.
            assert page.evaluate("localStorage.length")==0,(width,"unexpected localStorage")
            page.reload(wait_until="networkidle")
            assert page.locator('body[data-theme="dark"]').count()==0
            assert page.evaluate("getComputedStyle(document.documentElement).fontSize")=="16px"
            # Check reference paths and separate original four-room Safari.
            page.locator('a[href="safari-home.html"]').first.click()
            assert page.url.endswith("/safari-home.html"),(width,"Safari Home navigation")
            assert page.locator("nav.portals a").count()==4,(width,"original Safari rooms preserved")
            for dest in ["journey-learn.html","journey-try.html","journey-help.html","journey-continue.html"]:
                assert page.locator(f'nav.portals a[href="{dest}"]').count()==1,(width,"missing Safari portal",dest)
            page.goto(base+"/index.html",wait_until="networkidle")
            assert not errs,(width,"JS errors",errs)
            page.screenshot(path=str(ART/f"approved-reference-{width}.png"),full_page=True)
            out.append({"width":width,"status":"PASS","reference_cards":3,"safari_rooms":4,"keyboard":"PASS","text_controls":"PASS","no_local_storage":"PASS"})
            ctx.close()
        browser.close()
finally:
    server.shutdown()
(ART/"results.json").write_text(json.dumps(out,indent=2))
print(json.dumps({"scope":"screenshot-approved homepage and preserved Safari route","results":out,"manual_wcag":"not certified"},indent=2))
