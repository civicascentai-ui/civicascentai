"""P1 Wajo website trust and navigation source-level regression checks.

QA only: these checks do not certify WCAG, user comprehension, Stripe fields,
actual seat inventory, email delivery, or production state.
"""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
TARGETS = ("index.html", "programs.html", "course.html", "register.html",
           "registered.html", "mentor.html", "consultation.html",
           "capabilities.html", "es.html", "free-ai-starter.html")
SITE_LINKS = ("index.html", "programs.html", "course.html",
              "consultation.html", "about.html", "privacy.html",
              "es.html", "register.html")


class WajoP1StaticAcceptance(unittest.TestCase):
    def read(self, name):
        return (ROOT / name).read_text(encoding="utf-8")

    def test_new_trust_pages_exist_and_are_accessible_in_source(self):
        for name in ("about.html", "privacy.html"):
            page = self.read(name)
            self.assertIn('<html lang="en">', page)
            self.assertIn("Skip to main content", page)
            self.assertIn('<main id="content"', page)
            self.assertIn("civicascentai@gmail.com", page)

    def test_privacy_notice_requires_human_data_handling_review(self):
        privacy = self.read("privacy.html")
        self.assertIn("Before publication:", privacy)
        self.assertIn("retention", privacy.lower())
        self.assertIn("Stripe", privacy)
        self.assertIn("data practices", privacy)

    def test_registration_is_zero_dollars_without_promising_a_seat(self):
        registration = self.read("register.html")
        confirmation = self.read("registered.html")
        self.assertIn("interest", registration.lower())
        self.assertIn("does not guarantee a seat", registration)
        self.assertIn("date, time, venue", registration.lower())
        self.assertIn("privacy.html", registration)
        self.assertIn("No payment is required", confirmation)
        self.assertIn("does not verify", confirmation)
        self.assertIn("book.stripe.com/", registration)

    def test_approved_homepage_main_structure_is_unchanged(self):
        home = self.read("index.html")
        self.assertIn('civicascent-build" content="screenshot-approved-three-choice-wcag-20261015"', home)
        self.assertEqual(home.count('class="choice"'), 3)
        self.assertIn('href="journey-learn.html"', home)
        self.assertIn('href="practice-sandbox.html"', home)
        self.assertIn('href="journey-help.html"', home)

    def test_consistent_secondary_navigation_exists_on_primary_pages(self):
        for name in TARGETS:
            page = self.read(name)
            with self.subTest(page=name):
                self.assertIn('aria-label="Sitewide help and learning links"', page)
                for target in SITE_LINKS:
                    self.assertIn('href="' + target + '"', page)

    def test_proposed_email_consistency_in_primary_pages(self):
        for name in TARGETS + ("about.html", "privacy.html"):
            with self.subTest(page=name):
                self.assertNotIn("info@civicascentai.com", self.read(name).lower())

    def test_shared_header_links_match_owner_approved_home(self):
        primary = ("programs.html", "es.html", "register.html")
        pages = ("programs.html", "course.html", "register.html", "registered.html",
                 "mentor.html", "consultation.html", "capabilities.html", "es.html",
                 "free-ai-starter.html", "about.html", "privacy.html", "veterans.html",
                 "level2.html", "journey-learn.html", "journey-help.html",
                 "journey-try.html", "journey-continue.html", "curso-es.html",
                 "registro.html", "thank-you.html")
        for name in pages:
            with self.subTest(page=name):
                page = self.read(name)
                header = re.search(r'<header class="(?:page-header|site-header)">.*?</header>', page, re.DOTALL)
                self.assertIsNotNone(header)
                nav = re.search(r'<nav class="p1-top-nav"[^>]*>(.*?)</nav>', header.group(), re.DOTALL)
                self.assertIsNotNone(nav)
                hrefs = re.findall(r'<a href="([^"]+)"', nav.group(1))
                self.assertEqual(list(primary), hrefs)
                self.assertIn('href="assets/p1-header.css"', page)

    def test_spanish_registration_does_not_claim_a_reserved_seat(self):
        registration = self.read("registro.html")
        confirmation = self.read("registrado.html")
        self.assertIn("no garantiza una plaza", registration)
        self.assertIn("fecha, la hora y el lugar", registration)
        self.assertIn("no comprueba el envío ni reserva una plaza", confirmation)
        self.assertIn("privacidad", registration.lower())
        self.assertIn("9B628sg779W1a0XfIO00003", registration)

    def test_no_public_testimonials_were_invented(self):
        self.assertNotIn("testimonials", self.read("about.html").lower())
        self.assertNotIn("testimonials", self.read("register.html").lower())


if __name__ == "__main__":
    unittest.main()
