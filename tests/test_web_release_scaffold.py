"""No-cost standard-library technical source checks; not a live-release certificate."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://civicascentai.com"

class HeadParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta = {}
        self.links = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "meta":
            key = a.get("property") or a.get("name")
            if key:
                self.meta[key] = a.get("content", "")
        if tag == "link":
            self.links.append(a)

class WebReleaseScaffoldTests(unittest.TestCase):
    def test_homepage_social_metadata(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        p = HeadParser()
        p.feed(html)
        for k in ("description", "og:title", "og:description", "og:url",
                  "og:image", "og:image:alt", "twitter:card", "twitter:image"):
            self.assertTrue(p.meta.get(k), "Missing social field: " + k)
        self.assertEqual(p.meta["og:url"], BASE + "/")
        image_url = p.meta["og:image"]
        self.assertTrue(image_url.startswith(BASE + "/assets/"))
        self.assertTrue((ROOT / urlparse(image_url).path.lstrip("/")).is_file())
        self.assertTrue(any(link.get("rel") == "icon" for link in p.links))
    def test_robots_points_to_sitemap(self):
        robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
        self.assertIn("User-agent: *", robots)
        self.assertIn("Sitemap: " + BASE + "/sitemap.xml", robots)
    def test_sitemap_public_routes_exist(self):
        xml = ET.parse(ROOT / "sitemap.xml")
        locs = [x.text for x in xml.findall(".//{*}loc")]
        self.assertGreaterEqual(len(locs), 10)
        self.assertEqual(len(locs), len(set(locs)))
        for loc in locs:
            p = urlparse(loc)
            self.assertEqual(p.scheme + "://" + p.netloc, BASE)
            self.assertFalse(any(bad in p.path for bad in
                                ("preview", "prototype", "model-", "layer-", "/docs/", "/api/")))
            name = p.path.lstrip("/") or "index.html"
            self.assertTrue((ROOT / name).is_file(), "Sitemap target missing: " + name)
    def test_custom_404_has_recovery(self):
        html = (ROOT / "404.html").read_text(encoding="utf-8")
        self.assertIn('name="robots" content="noindex,follow"', html)
        self.assertIn('href="/"', html)
        self.assertIn('href="/free-ai-starter.html"', html)
        self.assertIn("prefers-reduced-motion", html)

    def test_homepage_free_guide_opens_actual_guide(self):
        import re
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        hrefs = re.findall(r'<a[^>]+href="([^"]+)"[^>]*>Free AI Starter Guide</a>', html)
        self.assertEqual(hrefs, ["free-ai-starter.html"])
        self.assertIn('href="free-ai-starter.html" aria-label="Guía gratuita de IA, página en inglés"', html)
        self.assertTrue((ROOT / "free-ai-starter.html").is_file())

    def test_consultation_uses_verified_business_inbox(self):
        html = (ROOT / "consultation.html").read_text(encoding="utf-8")
        self.assertNotIn("mailto:info@civicascentai.com", html)
        self.assertGreaterEqual(html.count("mailto:civicascentai@gmail.com"), 3)

if __name__ == "__main__":
    unittest.main()
