"""Sitewide owner-directed removal acceptance. Source-only localhost.
No payments, no user data, no external services. Not independent WCAG certification."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from html.parser import HTMLParser
from playwright.sync_api import sync_playwright
import json, re

ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/"artifacts"/"learning-areas"
ART.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs): super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args): pass
server=ThreadingHTTPServer(("127.0.0.1",0),Quiet)
Thread(target=server.serve_forever,daemon=True).start()
url=f"http://127.0.0.1:{server.server_address[1]}"
done=[]
active=[
  "index.html","learning-rooms.html","journey-learn.html","journey-try.html","journey-help.html",
  "journey-continue.html","veterans.html","course.html","programs.html","free-ai-starter.html",
  "clear-start.html","practice-sandbox.html","veteran-career-skills.html",
  "assistive-tools-guide.html","es.html","curso-es.html","register.html","registro.html",
]
expected=["journey-learn.html","journey-try.html","journey-help.html","journey-continue.html"]
assert not (ROOT/"safari-home.html").exists(), "Historic public themed homepage still exists"
assert not (ROOT/"assets"/"safari").exists(), "Historic image folder still exists"
assert not (ROOT/"assets"/"safari-build1-live.css").exists()
assert not (ROOT/"assets"/"safari-interior.css").exists()
for f in active:
    raw=(ROOT/f).read_text(encoding="utf-8")
    assert not re.search("safari|scene-01-lodge-panorama",raw,re.I), f"Retired artwork/branding in active page {f}"
asset_violations=[]
for folder in (ROOT/"assets",):
    for f in list(folder.glob("*.css"))+list(folder.glob("*.js")):
        if re.search("safari|scene-01-lodge-panorama",f.read_text(encoding="utf-8"),re.I):
            asset_violations.append(str(f.relative_to(ROOT)))
assert not asset_violations, f"Retired artwork in active assets: {asset_violations}"
try:
  with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    for width,height in [(320,760),(390,844),(768,1024),(1024,768),(1366,880)]:
      ctx=browser.new_context(viewport={"width":width,"height":height},reduced_motion="reduce")
      page=ctx.new_page()
      errors=[]
      page.on("pageerror",lambda x:errors.append(str(x)))
      response=page.goto(url+"/index.html",wait_until="networkidle",timeout=30000)
      assert response.status==200,(width,"homepage http")
      assert page.locator(".choices article.choice").count()==3,(width,"three homepage choices")
      assert page.get_by_role("link",name="Learning Rooms").get_attribute("href")=="learning-rooms.html"
      assert page.locator("#scenery-toggle").count()==0,(width,"old photo control still present")
      assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),(width,"homepage overflow")
      page.keyboard.press("Tab")
      assert page.evaluate("document.activeElement.classList.contains('skip-link')"),(width,"home skip first")
      page.keyboard.press("Enter")
      assert page.evaluate("document.activeElement.id=='main'"),(width,"home skip focus")
      page.locator("#text-plus").click()
      assert page.evaluate("parseFloat(getComputedStyle(document.documentElement).fontSize)>16"),(width,"text button")
      page.locator("#theme-toggle").click()
      assert page.locator('body[data-theme="dark"]').count()==1
      page.screenshot(path=str(ART/f"home-{width}.png"),full_page=True)
      page.goto(url+"/learning-rooms.html",wait_until="networkidle")
      assert page.get_by_role("heading",name="Learning Rooms").count()==1,(width,"hub heading")
      assert page.locator("nav.learning-room-grid a.learning-door").count()==4,(width,"four retained learning paths")
      assert page.locator("nav.learning-room-grid a.learning-door").evaluate_all("(a)=>a.map(x=>x.getAttribute('href'))")==expected
      accent=page.locator("nav.learning-room-grid a.learning-door em").evaluate_all("(a)=>a.map(x=>getComputedStyle(x).backgroundColor)")
      assert len(set(accent))==4,(width,"distinct colors")
      assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"),(width,"learning hub overflow")
      page.screenshot(path=str(ART/f"learning-rooms-{width}.png"),full_page=True)
      for room in expected:
        response=page.goto(url+"/"+room,wait_until="networkidle")
        assert response.status==200,(width,room)
        assert page.locator(".room-panel h1").count()==1,(width,room,"heading")
        assert page.locator(".room-panel nav.options a").count()==4,(width,room,"learning options preserved")
        assert page.locator(".scene").evaluate("(el)=>getComputedStyle(el,'::before').backgroundImage")=="none",(width,room,"old photo pseudo layer")
        assert page.locator(".back").get_attribute("href")=="learning-rooms.html"
        assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"),(width,room,"room horizontal scroll")
        page.locator(".back").click()
        assert page.url.endswith("/learning-rooms.html"),(width,room,"return path broken")
      response=page.goto(url+"/veterans.html",wait_until="networkidle")
      assert response.status==200,(width,"veterans")
      assert page.get_by_role("heading",name="New skills. New possibilities.").count()==1
      assert page.locator(".vet-resource-list a").count()==3,(width,"veteran links")
      assert page.get_by_role("link",name=re.compile("Return to learning rooms")).get_attribute("href")=="learning-rooms.html"
      assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"),(width,"veterans overflow")
      page.screenshot(path=str(ART/f"veterans-{width}.png"),full_page=True)
      for route in ["course.html","programs.html","free-ai-starter.html","clear-start.html","practice-sandbox.html","es.html","register.html"]:
        response=page.goto(url+"/"+route,wait_until="networkidle")
        assert response.status==200,(width,route)
        assert page.locator("h1").count()>=1,(width,route,"h1 missing")
        overflow=page.evaluate("""() => [...document.querySelectorAll('body *')].map(e=>{const b=e.getBoundingClientRect();return {tag:e.tagName,className:typeof e.className==='string'?e.className.slice(0,90):'',scroll:e.scrollWidth,right:Math.round(b.right),left:Math.round(b.left),width:Math.round(b.width)}}).filter(e=>e.right>innerWidth+2&&e.left>=0).sort((a,b)=>b.right-a.right).slice(0,12)""")
        assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+2"),(width,route,"horizontal scroll",overflow)
      assert not errors,(width,"JS exceptions",errors)
      done.append({"width":width,"result":"PASS","active_routes_checked":16,"payment_requests":"none","manual_wcag":"pending"})
      ctx.close()
    browser.close()
finally:
  server.shutdown()
(ART/"results.json").write_text(json.dumps(done,indent=2))
print(json.dumps({"result":"PASS","checks":done},indent=2))
