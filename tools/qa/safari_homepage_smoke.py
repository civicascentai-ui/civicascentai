#!/usr/bin/env python3
"""Prototype09 Safari homepage structural smoke test. Does not substitute for visual QA."""
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
html = (ROOT / "index.html").read_text(encoding="utf-8")
errors = []

class Markup(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = {}
        self.links = []
        self.tags = []
    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        self.tags.append((tag, props))
        if props.get("id"):
            if props["id"] in self.ids:
                errors.append(f"Duplicate id: {props['id']}")
            self.ids[props["id"]] = (tag, props)
        if tag == "a":
            self.links.append(props.get("href", ""))

dom = Markup()
dom.feed(html)
for element_id in ("start", "guideShell", "guide", "guideNext", "closeGuide", "nextActions", "safariStill"):
    if element_id not in dom.ids:
        errors.append(f"Missing required experience element: #{element_id}")
if dom.ids.get("guide", ("", {}))[1].get("aria-modal") != "true":
    errors.append("Guided experience must declare aria-modal=true")
if dom.ids.get("start", ("", {}))[0] != "button":
    errors.append("Start Here must be a keyboard-operable button")
for link in ("village.html", "course.html", "living-ai-lab.html", "consultation.html", "programs.html"):
    if link not in dom.links:
        errors.append(f"Missing next-action/navigation link: {link}")
    if not (ROOT / link).exists():
        errors.append(f"Broken local route target: {link}")
for snippet in (
    "prefers-reduced-motion:reduce", "[hidden]{display:none!important}",
    'track("landing_view")', 'track("start_here")',
    'track("guided_experience_complete")', 'track("next_action"',
    "This is a prepared learning example, not a live AI chat",
    "aria-label=\"Site navigation\"",
):
    if snippet not in html:
        errors.append(f"Missing Safari behavior/protection: {snippet}")
if 'id="cosmos"' in html or "ai-showcase-8k" in html:
    errors.append("Rejected starflight mockup found in recovered homepage")
if "tel:+18179839404" in html:
    errors.append("Personal contact number leaked")
if not any(tag == "img" and attrs.get("id") == "safariStill" for tag,attrs in dom.tags):
    errors.append("Real text-free landscape still missing")
for tag, attrs in dom.tags:
    if tag == "img" and attrs.get("id") == "safariStill" and not attrs.get("src","").startswith("https://images.unsplash.com/"):
        errors.append("Unverified still source")
if "cdn.openart.ai" in html or "d8j0ntlcm91z4.cloudfront.net" in html:
    errors.append("Watermarked-source URL remains")
if errors:
    raise SystemExit("\n".join(errors))
print("PASS: Safari structural smoke (mockup excluded, journey/links/accessibility hooks present).")
print("NOTE: media availability, visual parity, browser interactions and owner approval NOT assessed.")
