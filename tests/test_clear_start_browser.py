"""Browser QA for accessible Clear Start and student sandbox prototype.

Runs against localhost ONLY. Tests no real student data, purchases, third-party
requests or external AI. Automated checks are NOT a WCAG certification.
"""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
import json

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "artifacts" / "clear-start"
ART.mkdir(parents=True,exist_ok=True)
PORT = 8793
class Quiet(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kw):super().__init__(*args,directory=str(ROOT),**kw)
    def log_message(self,*args):pass
server=ThreadingHTTPServer(("127.0.0.1",PORT),Quiet)
Thread(target=server.serve_forever,daemon=True).start()
out=[]
try:
  with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    for width,height in [(320,760),(390,844),(768,1024),(1366,850)]:
      page=browser.new_page(viewport={"width":width,"height":height},device_scale_factor=1,reduced_motion="reduce")
      errors=[]
      page.on("pageerror",lambda e:errors.append(str(e)))
      resp=page.goto(f"http://127.0.0.1:{PORT}/clear-start.html",wait_until="networkidle",timeout=30000)
      assert resp.status==200,(width,"page HTTP")
      assert page.get_by_role("heading",name="Learn AI, one step at a time.").count()==1,(width,"heading")
      assert page.get_by_role("heading",name="What would you like to do?").count()==1,(width,"choice heading")
      assert page.get_by_role("link",name="Start learning").get_attribute("href")=="journey-learn.html"
      assert page.get_by_role("link",name="Open practice space").get_attribute("href")=="practice-sandbox.html"
      assert page.get_by_role("link",name="Find help").get_attribute("href")=="journey-help.html"
      assert page.locator("main .choice").count()==3,(width,"3 choices")
      nav_links = page.locator("header nav.top-links a")
      assert nav_links.count()==4,(width,"four direct visible navigation links")
      assert [nav_links.nth(i).get_attribute("href") for i in range(4)]==[
        "index.html","course.html","veterans.html","journey-help.html"],(width,"expected Home/Courses/Veteran Programs/Get Help")
      assert page.get_by_role("link",name="Text, contrast & audio settings").count()==1,(width,"settings shortcut missing")
      for title in ["Practical Everyday AI","Veteran Career Skills","Digital Safety & Scam Awareness"]:
        assert page.get_by_role("heading",name=title).count()==1,(width,title)
      assert page.locator(".featured-grid .pathway").count()==3,(width,"three pathways")
      assert page.get_by_role("heading",name="Veteran and disability learning support").count()==1
      assert page.get_by_role("link",name="Explore learning options").get_attribute("href")=="journey-learn.html"
      assert page.get_by_role("link",name="Ask for help").get_attribute("href")=="journey-help.html"

      assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),(width,"overflow")
      original=page.locator("body").evaluate("el=>getComputedStyle(el).fontSize")
      page.get_by_role("button",name="Make text larger").click()
      large=page.locator("body").evaluate("el=>getComputedStyle(el).fontSize")
      assert float(large[:-2])>float(original[:-2]),(width,"font controls",original,large)
      assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),(width,"enlarged text overflow")
      # Higher magnification must reflow without sideways page scrolling.
      for _ in range(3):
        page.get_by_role("button",name="Make text larger").click()
      assert page.locator("body").evaluate("el=>parseFloat(getComputedStyle(el).fontSize)")>=30,(width,"150 percent font")
      assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),(width,"150 percent reflow")
      for i in range(4):
        nav_box=nav_links.nth(i).bounding_box()
        assert nav_box and nav_box["x"]>=-2 and nav_box["x"]+nav_box["width"]<=width+2, (width,"nav link clipped at 150%",i,nav_box)
        assert nav_box["height"]>=48,(width,"touch target too small",i,nav_box)

      # If labels collide at maximum text size, the controls are not usable.
      for button_id in ["#theme-toggle","#scenery-toggle","#read-aloud"]:
        box=page.locator(button_id).bounding_box()
        assert box and box["x"]>=-2 and box["x"]+box["width"]<=width+2,(width,"large text button offscreen",button_id,box)

      page.get_by_role("button",name="Dark background").click()
      assert page.locator('body[data-theme="dark"]').count()==1,(width,"dark option")
      page.get_by_role("button",name="Show Safari picture").click()
      assert page.locator("body.show-scene").count()==1,(width,"scenery toggle")
      page.get_by_role("button",name="Hide Safari picture").click()
      assert page.locator("body.show-scene").count()==0,(width,"scenery hidden")
      page.get_by_role("button",name="Light background").click()
      page.screenshot(path=str(ART/f"clear-start-{width}.png"),full_page=True)
      # Actual student practice should already exist on this isolated branch.
      resp=page.goto(f"http://127.0.0.1:{PORT}/practice-sandbox.html",wait_until="networkidle",timeout=30000)
      assert resp.status==200,(width,"sandbox HTTP")
      assert page.get_by_role("heading",name="Student Practice Sandbox.").count()==1
      assert page.locator(".practice-panel:not([hidden])").count()==1
      page.get_by_role("button",name="Load a fictional example").click()
      page.get_by_role("button",name="Build my practice prompt").click()
      assert page.locator("#prompt-output").inner_text().find("My goal")>=0,(width,"prompt built")
      page.locator(".practice-tab[data-activity=verify]").click()
      assert page.locator("#activity-verify").is_visible()
      page.locator("#verify-time").check()
      page.locator("#verify-cost").check()
      page.get_by_role("button",name="Check my choices").click()
      assert "Correct" in page.locator("#verify-feedback").inner_text(),(width,"fact check")
      page.locator(".practice-tab[data-activity=privacy]").click()
      page.locator("#privacy-fictional").check()
      page.locator("#privacy-goal").check()
      page.get_by_role("button",name="Check my choices").click()
      assert "Correct" in page.locator("#privacy-feedback").inner_text(),(width,"privacy")
      assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),(width,"sandbox overflow")
      assert not errors,(width,errors)
      page.screenshot(path=str(ART/f"practice-sandbox-{width}.png"),full_page=True)
      out.append({"width":width,"clear_start":"PASS","sandbox":"PASS","accessibility_claim":"UNTESTED - manual screen-reader and WCAG audit still needed"})
      page.close()
    browser.close()
  (ART/"results.json").write_text(json.dumps(out,indent=2))
  print(json.dumps({"pass":len(out)*2,"widths":[r["width"] for r in out],"manual_wcag":"not certified"},indent=2))
finally:
  server.shutdown()
