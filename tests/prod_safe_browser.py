"""Read-only browser acceptance against public custom domain. No forms submitted or purchases.
Not WCAG certification; separate human screen-reader testing is still required.
"""
from pathlib import Path
import json, sys
from playwright.sync_api import sync_playwright

root="https://civicascentai.com"
out=Path("artifacts/production-safe-load")
out.mkdir(parents=True,exist_ok=True)
checks=[]
error=None
try:
  with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    for width,height in [(320,760),(390,844),(768,1024),(1366,850)]:
      context=browser.new_context(viewport={"width":width,"height":height},reduced_motion="reduce")
      page=context.new_page()
      errors=[]
      page.on("pageerror",lambda e: errors.append(str(e)))
      r=page.goto(root+"/clear-start.html",wait_until="domcontentloaded",timeout=30000)
      assert r.status == 200, ("clear-start HTTP",width,r.status)
      assert page.get_by_role("heading",name="Learn AI, one step at a time.").count()==1
      page.keyboard.press("Tab")
      assert page.evaluate("document.activeElement.classList.contains('skip')"),("skip first tab",width)
      page.keyboard.press("Enter")
      assert page.evaluate("document.activeElement.id=='main'"),("skip focuses main",width)
      assert page.locator("header nav.top-links a").count()==4
      assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),("initial horizontal scroll",width)
      for _ in range(4):
        page.locator("#text-plus").click()
      assert page.evaluate("window.CivicReader.scale")==150,("150% reading size",width)
      assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),("reflow at 150%",width)
      page.locator("#theme-toggle").click()
      assert page.locator('body[data-theme="dark"]').count()==1
      page.locator("#theme-toggle").click()
      page.screenshot(path=str(out/f"clear-start-live-{width}.png"),full_page=True)
      r=page.goto(root+"/practice-sandbox.html",wait_until="domcontentloaded",timeout=30000)
      assert r.status==200,("practice HTTP",width,r.status)
      assert page.evaluate("window.CivicReader.scale")==150,("reader settings across pages",width)
      page.keyboard.press("Tab")
      assert page.evaluate("document.activeElement.classList.contains('practice-skip')"),("practice skip first",width)
      page.keyboard.press("Enter")
      assert page.evaluate("document.activeElement.id=='activities'"),("practice skip focus",width)
      page.get_by_role("button",name="Load a fictional example").click()
      page.get_by_role("button",name="Build my practice prompt").click()
      assert "My goal" in page.locator("#prompt-output").inner_text()
      page.locator(".practice-tab[data-activity=verify]").click()
      page.locator("#verify-time").check()
      page.locator("#verify-cost").check()
      page.get_by_role("button",name="Check my choices").click()
      assert "Correct" in page.locator("#verify-feedback").inner_text()
      assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),("sandbox reflow",width)
      assert not errors,("JS errors",width,errors)
      page.screenshot(path=str(out/f"practice-live-{width}.png"),full_page=True)
      checks.append({"viewport":width,"result":"PASS","routes":["clear-start.html","practice-sandbox.html"],"keyboard":"PASS","font":"PASS","sandbox":"PASS"})
      context.close()
    browser.close()
except Exception as ex:
  error=str(ex)
  print("FAIL live browser:",error,file=sys.stderr)
finally:
  (out/"browser_results.json").write_text(json.dumps({"target":root,"checks":checks,"error":error,"manual_wcag":"pending"},indent=2))
if error: sys.exit(1)
print("PASS live Chromium keyboard, controls, prompt and layout on four widths")
