"""Offline source tests for the OWNER-APPROVED six Safari destinations, not launch certification."""
from pathlib import Path
from html.parser import HTMLParser
import re
import unittest
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
ROUTES=("index.html","free-ai-starter.html","mentor.html","course.html","living-ai-lab.html","village.html")
BUSINESS="civicascentai@gmail.com"

class Tags(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links=[]
        self.ids=set()
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=="a": self.links.append(a.get("href",""))
        if a.get("id"): self.ids.add(a["id"])

class SafariOriginalIntegrity(unittest.TestCase):
    def test_six_real_pages_and_home_link(self):
        for route in ROUTES:
            with self.subTest(route=route):
                p=ROOT/route
                self.assertTrue(p.is_file())
                text=p.read_text(encoding="utf-8")
                self.assertIn("<h1",text)
                t=Tags();t.feed(text)
                if route!="index.html":
                    self.assertTrue(any(h in t.links for h in ("index.html","https://civicascentai.com","/")),
                                    "Missing path to actual Safari home "+route)
    def test_guide_is_free_and_has_home_and_interest_paths(self):
        h=(ROOT/"free-ai-starter.html").read_text(encoding="utf-8")
        self.assertIn('href="index.html">← Return to Safari',h)
        self.assertIn('href="learner-interest.html"',h)
        self.assertIn("NO PAYMENT REQUIRED",h)
    def test_planner_contact_mails_are_verified(self):
        for p in ("mentor.html","consultation.html"):
            text=(ROOT/p).read_text(encoding="utf-8")
            self.assertNotIn("mailto:info@civicascentai.com",text)
            self.assertIn("mailto:"+BUSINESS,text)
    def test_original_safari_design_and_release_hold_preserved(self):
        h=(ROOT/"index.html").read_text(encoding="utf-8")
        self.assertIn('meta name="robots" content="noindex,nofollow"',h)
        self.assertIn('id="start"',h)
        self.assertIn('id="guideShell"',h)
        self.assertIn('meta property="og:title"',h)
        self.assertNotIn("photo-1754679996635",h)
        self.assertNotIn('id="cosmos"',h)
        self.assertIn("safari-scene05-lab.css",(ROOT/"living-ai-lab.html").read_text(encoding="utf-8"))
        release=(ROOT/"docs/operations/SAFARI_RELEASE_GATE_2026-10-12.json").read_text(encoding="utf-8")
        self.assertIn('"status": "HOLD"',release)
        self.assertIn('"owner_visual_approved": false',release)
    def test_discovery_and_error_files(self):
        self.assertIn("Sitemap: https://civicascentai.com/sitemap.xml",(ROOT/"robots.txt").read_text())
        locs=[x.text for x in ET.parse(ROOT/"sitemap.xml").findall(".//{*}loc")]
        self.assertTrue(any(x.endswith("/"+r) for x in locs for r in ROUTES[1:]))
        for x in locs:
            name=x.removeprefix("https://civicascentai.com/") or "index.html"
            self.assertTrue((ROOT/name).is_file(),name)
        error=(ROOT/"404.html").read_text()
        self.assertIn('href="/free-ai-starter.html"',error)

if __name__=="__main__":unittest.main()
