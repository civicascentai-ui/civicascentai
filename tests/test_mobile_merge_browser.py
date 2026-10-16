from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from playwright.sync_api import sync_playwright
import json

ROOT=Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs): super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args): pass
server=ThreadingHTTPServer(("127.0.0.1",0),Handler)
Thread(target=server.serve_forever,daemon=True).start()
base=f"http://127.0.0.1:{server.server_port}"
out=ROOT/"artifacts"/"mobile-merge"
out.mkdir(parents=True,exist_ok=True)
results=[]
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        for width,height in [(320,720),(390,844),(768,1024),(1366,768)]:
            page=browser.new_page(viewport={"width":width,"height":height},device_scale_factor=1)
            errors=[]
            page.on("pageerror",lambda err:errors.append(str(err)))
            response=page.goto(base+"/course.html",wait_until="domcontentloaded")
            assert response.status==200,(width,"course HTTP")
            page.get_by_role("link",name="Listen & Learn").first.click()
            assert page.evaluate("location.hash")=="#listen",(width,"CTA did not navigate")
            assert page.locator("#listen").count()==1,(width,"listen section missing")
            page.get_by_role("link",name="Courses & Pricing").first.click()
            assert page.evaluate("location.hash")=="#enroll",(width,"pricing CTA did not navigate")
            assert page.locator("#enroll").count()==1,(width,"pricing section missing")
            assert not errors,(width,errors)
            page.screenshot(path=str(out/f"course-{width}.png"),full_page=True)
            response=page.goto(base+"/index.html",wait_until="domcontentloaded")
            assert response.status==200,(width,"home HTTP")
            assert page.locator("nav.portals a").count()==4,(width,"four room links")
            assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"),(width,"horizontal overflow")
            for name in ["Learn","Try","Get Help","Continue"]:
                page.locator("nav.portals a").filter(has=page.get_by_role("heading",name=name,exact=True)).click()
                assert "/journey-" in page.url,(width,name,"room link")
                page.go_back(wait_until="domcontentloaded")
            page.screenshot(path=str(out/f"home-{width}.png"),full_page=True)
            results.append({"width":width,"status":"PASS","course_ctas":2,"rooms":4})
            page.close()
        browser.close()
    (out/"results.json").write_text(json.dumps(results,indent=2))
    print(json.dumps(results,indent=2))
finally:
    server.shutdown()
