"""Independent visual/functional QA of repaired Safari interior pages.

Real Chromium, 320/390/768/1366px; screenshots and JSON are evidence.
No purchases, form submissions or external credentials.
"""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright
import json

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "artifacts" / "safari-interior"
OUTPUT.mkdir(parents=True, exist_ok=True)
PORT = 8766
class Quiet(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args): pass

server=ThreadingHTTPServer(("127.0.0.1",PORT),Quiet)
Thread(target=server.serve_forever,daemon=True).start()
results=[]
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        for width,height in [(320,760),(390,844),(768,1024),(1366,850)]:
            page=browser.new_page(viewport={"width":width,"height":height},device_scale_factor=1)
            errors=[]
            page.on("pageerror",lambda err:errors.append(str(err)))
            for slug, selector in [
                ("programs.html",".p-hero"),
                ("course.html",".hero"),
                ("free-ai-starter.html",".guide-hero")
            ]:
                response=page.goto("http://127.0.0.1:%d/%s"%(PORT,slug),wait_until="networkidle",timeout=30000)
                assert response.status==200,(slug,width,response.status)
                assert page.locator("body.safari-interior").count()==1,(slug,width,"wrong design")
                assert page.locator("header.page-header").count()==1,(slug,width,"wrong header")
                assert page.locator("header.page-header .brand").count()==1,(slug,width,"missing brand")
                assert page.locator(selector).count()==1,(slug,width,"hero absent")
                assert "scene-01-lodge-panorama.jpg" in page.locator(selector).evaluate("(e)=>getComputedStyle(e).backgroundImage"),(slug,width,"wrong scenic art")
                assert page.locator("h1").first.is_visible(),(slug,width,"title invisible")
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),(slug,width,"horizontal overflow",page.evaluate("document.documentElement.scrollWidth"))
                assert page.locator('link[href="assets/safari-interior.css"]').count()==1,(slug,width,"shared stylesheet absent")
                if width<=850:
                    mobile=page.locator("header.page-header details.mobile-nav")
                    assert mobile.is_visible(),(slug,width,"mobile menu missing")
                    mobile.locator("summary").click()
                    assert page.locator("header.page-header .mobile-nav .menu-links a").count()>=6,(slug,width,"nav links missing")
                    assert page.locator("header.page-header .mobile-nav .menu-links").is_visible(),(slug,width,"menu didn't open")
                    assert page.locator("header.page-header .menu-links").evaluate("(e)=>e.getBoundingClientRect().right<=innerWidth+2"),(slug,width,"menu offscreen")
                    mobile.locator("summary").click()
                else:
                    assert page.locator("header.page-header .site-nav").is_visible(),(slug,width,"desktop nav missing")
                if slug=="course.html":
                    first=page.locator(".course-hero-actions a").nth(0)
                    second=page.locator(".course-hero-actions a").nth(1)
                    assert first.is_visible() and second.is_visible(),(slug,width,"course links obscured")
                    a=first.bounding_box()
                    b=second.bounding_box()
                    intersect=max(0,min(a["x"]+a["width"],b["x"]+b["width"])-max(a["x"],b["x"])) * max(0,min(a["y"]+a["height"],b["y"]+b["height"])-max(a["y"],b["y"]))
                    assert intersect<=1,(slug,width,"course buttons overlap",a,b)
                    assert a["x"]>=-2 and a["x"]+a["width"]<=width+2,(slug,width,"course button 1 outside viewport")
                    assert b["x"]>=-2 and b["x"]+b["width"]<=width+2,(slug,width,"course button 2 outside viewport")
                    assert page.locator("#listen").count()==1 and page.locator("#enroll").count()==1
                    assert "buy.stripe.com" not in page.content(),(slug,width,"paid checkout must remain held")
                if slug=="programs.html":
                    assert page.locator(".track").count()>=8,(slug,width,"course tracks lost")
                    assert page.get_by_role("link",name="Start Free").count()==1,(slug,width,"free enrollment route missing")
                if slug=="free-ai-starter.html":
                    assert page.locator("#sample .cards .card").count()==3,(slug,width,"printed education guide changed")
                    assert page.get_by_role("button",name="Print or save this page as PDF").count()==1
                    assert page.get_by_role("link",name="Open the Free Guide").count()==1
                    page.emulate_media(media="print")
                    assert page.locator("header.page-header").evaluate("(e)=>getComputedStyle(e).display")=="none",(slug,width,"navigation must be excluded from PDF")
                    assert page.locator(".sheet").is_visible(),(slug,width,"printable guide hidden")
                    page.emulate_media(media="screen")
                assert not errors,(slug,width,"page JS errors",errors)
                page.screenshot(path=str(OUTPUT/("%s-%d.png"%(slug.removesuffix(".html"),width))),full_page=True)
                results.append({"page":slug,"width":width,"outcome":"PASS","errors":[]})
            page.close()
        browser.close()
    (OUTPUT/"results.json").write_text(json.dumps(results,indent=2))
    print(json.dumps({"passed":len(results),"failed":0,"pages":3,"widths":4},indent=2))
finally:
    server.shutdown()
