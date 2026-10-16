"""Independent redesign interior functional QC; legacy Safari test remains untouched."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright
import json

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"artifacts"/"redesign-interior-functional"
OUT.mkdir(parents=True,exist_ok=True)
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs): super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args): pass
server=ThreadingHTTPServer(("127.0.0.1",0),Handler)
Thread(target=server.serve_forever,daemon=True).start()
results=[]
failures=[]
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        for width,height in [(320,760),(390,844),(768,1024),(1366,850)]:
            page=browser.new_page(viewport={"width":width,"height":height})
            for slug in ["programs.html","course.html","free-ai-starter.html"]:
                errors=[]
                page.on("pageerror",lambda e:errors.append(str(e)))
                checks=[]
                def check(name,condition):
                    checks.append({"check":name,"pass":bool(condition)})
                    if not condition: failures.append({"page":slug,"width":width,"check":name})
                response=page.goto(f"http://127.0.0.1:{server.server_port}/{slug}",wait_until="load",timeout=30000)
                check("HTTP 200",response is not None and response.status==200)
                check("approved redesign class",page.locator("body.ff-interior").count()==1)
                check("approved shared stylesheet",page.locator('link[href="assets/sitewide-reference.css"]').count()==1)
                check("semantic page heading visible",page.locator("h1").first.is_visible())
                check("no horizontal overflow",page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"))
                check("header and brand exist",page.locator("header.page-header .brand").count()==1)
                if width<=850:
                    nav=page.locator("header.page-header details.mobile-nav")
                    check("mobile menu visible",nav.is_visible())
                    if nav.count():
                        nav.locator("summary").click()
                        check("mobile links revealed",page.locator("header.page-header .mobile-nav .menu-links").is_visible())
                        check("mobile navigation destinations",page.locator("header.page-header .mobile-nav .menu-links a").count()>=6)
                        nav.locator("summary").click()
                else:
                    check("desktop navigation visible",page.locator("header.page-header .site-nav").is_visible())
                if slug=="programs.html":
                    check("eight course tracks retained",page.locator(".track").count()>=8)
                    check("free workshop link",page.get_by_role("link",name="Start Free").count()==1)
                elif slug=="course.html":
                    check("listen and enroll targets",page.locator("#listen").count()==1 and page.locator("#enroll").count()==1)
                    check("course CTAs visible",page.locator(".course-hero-actions a").count()>=2 and all(x.is_visible() for x in page.locator(".course-hero-actions a").all()[:2]))
                    check("live Stripe checkout absent", "buy.stripe.com" not in page.content())
                else:
                    check("three printable guide cards",page.locator("#sample .cards .card").count()==3)
                    check("print button",page.get_by_role("button",name="Print or save this page as PDF").count()==1)
                    check("free guide link",page.get_by_role("link",name="Open the Free Guide").count()==1)
                    page.emulate_media(media="print")
                    check("print guide visible",page.locator(".sheet").is_visible())
                    check("print navigation hidden",page.locator("header.page-header").evaluate("(e)=>getComputedStyle(e).display")=="none")
                    page.emulate_media(media="screen")
                check("no JS exceptions",not errors)
                page.screenshot(path=str(OUT/f"{slug[:-5]}-{width}.png"),full_page=True,animations="disabled")
                results.append({"page":slug,"width":width,"checks":checks,"errors":errors})
            page.close()
        browser.close()
finally:
    server.shutdown()
(OUT/"results.json").write_text(json.dumps({"results":results,"failures":failures},indent=2))
print(json.dumps({"pages":3,"widths":4,"checks":sum(len(x["checks"]) for x in results),"failures":failures},indent=2))
assert not failures,"Redesign interior functional QC failed; inspect artifacts"
