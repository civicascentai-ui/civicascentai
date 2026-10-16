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
                # CSS must be loaded before measuring focus outlines or reflow.
                page.goto(base+"/"+route,wait_until="load")
                page.evaluate("document.fonts.ready")
                assert page.locator('meta[name="civicascent-build"]').get_attribute("content")=="accessible-learning-rooms-20261015",(width,route,"new accessible build")
                # Keyboard-only acceptance: skip link must be first and move focus into main.
                page.keyboard.press("Tab")
                assert page.evaluate("document.activeElement.classList.contains('skip-link')"),(width,route,"skip link must be first tab stop")
                page.keyboard.press("Enter")
                assert page.evaluate("document.activeElement.id==='main'"),(width,route,"skip link must focus main")
                assert page.locator("main#main").get_attribute("tabindex")=="-1",(width,route,"accessible skip destination")
                # Automated accessible-name/role preflight, not a real screen-reader session.
                assert page.get_by_role("main").count()==1,(width,route,"single named main landmark")
                assert page.get_by_role("navigation",name=f"{title} choices").count()==1,(width,route,"named learner choices landmark")
                assert page.locator("html").get_attribute("lang")=="en",(width,route,"document language")
                snapshot=page.locator("nav.options").aria_snapshot()
                # Playwright quotes link snapshots that contain punctuation differently.
                # Query the accessibility role instead of parsing the snapshot's formatting.
                option_roles=page.get_by_role("navigation",name=f"{title} choices").get_by_role("link")
                assert option_roles.count()==4,(width,route,"four accessible link roles",snapshot)
                assert snapshot.count("/url:")==4,(width,route,"four exposed destinations",snapshot)
                # Real Tab navigation from focused main: first choice must receive visible keyboard focus.
                page.keyboard.press("Tab")
                focused=page.evaluate("""() => {
                    const e=document.activeElement;
                    const b=e.getBoundingClientRect();
                    const c=getComputedStyle(e);
                    return {firstChoice:e.matches('nav.options a.option-link'),
                        focusVisible:e.matches(':focus-visible'),
                        outlineStyle:c.outlineStyle,
                        outlineWidth:parseFloat(c.outlineWidth)||0,
                        boxLeft:b.left,boxRight:b.right,
                        inViewport:b.left>=-2 && b.right<=innerWidth+2}
                }""")
                assert focused["firstChoice"] and focused["focusVisible"],(width,route,"Tab to first choice and focus-visible",focused)
                page.screenshot(path=str(out/f"focused-{route.removesuffix('.html')}-{width}.png"),full_page=True)
                assert focused["outlineStyle"]!="none" and focused["outlineWidth"]>=3 and focused["inViewport"],(width,route,"visible loaded-CSS keyboard focus ring",focused)
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
                    toggle.focus()
                    page.keyboard.press("Enter")
                    assert page.locator(".mobile-nav").get_attribute("open") is not None,(width,route,"keyboard menu does not open")
                    assert page.locator(".mobile-nav .menu-links").is_visible(),(width,route,"mobile menu not shown")
                    page.keyboard.press("Enter")
                    assert page.locator(".mobile-nav").get_attribute("open") is None,(width,route,"keyboard menu does not close")
                page.screenshot(path=str(out/f"learning-room-{route.removesuffix('.html')}-{width}.png"),full_page=True)
                # 200% root-text scaling is an automated stress proxy, NOT actual 200% browser zoom.
                page.evaluate("document.documentElement.style.fontSize='200%'")
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 2"),(width,route,"200 percent text reflow overflow")
                for element in page.locator(".options a.option-link").all():
                    box=element.bounding_box()
                    assert box and box["x"]>=-2 and box["x"]+box["width"]<=width+2,(width,route,"200 percent text choice clipped",box)
                if width in (320,390):
                    page.screenshot(path=str(out/f"learning-room-{route.removesuffix('.html')}-text200-{width}.png"),full_page=True)
                page.evaluate("document.documentElement.style.fontSize=''")
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
