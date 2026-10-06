from pathlib import Path
from html.parser import HTMLParser
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
IGNORE_DIRS = {'.git', 'backups', 'checkpoints', 'prototype-react'}
LEGACY_PREFIXES = ('model-02-', 'model-03-', 'model-04-', 'model-05-', 'model-06-', 'model-07-')
errors = []
warnings = []


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.images = []
        self.lang = False
        self.desc = False
        self.viewport = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html' and a.get('lang'):
            self.lang = True
        if tag == 'meta' and a.get('name', '').lower() == 'description' and a.get('content', '').strip():
            self.desc = True
        if tag == 'meta' and a.get('name', '').lower() == 'viewport':
            self.viewport = True
        if tag == 'a' and a.get('href'):
            self.links.append(a['href'])
        if tag == 'img':
            self.images.append(a)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)


def should_check(path):
    if any(part in IGNORE_DIRS for part in path.parts):
        return False
    if path.name.startswith(LEGACY_PREFIXES) and (
        path.name.endswith('-preview.html') or path.name.endswith('-diagnostic.html')
    ):
        return False
    return True


def check_manual_launch_evidence():
    evidence_path = ROOT / 'qa' / 'launch-evidence.json'
    if not evidence_path.exists():
        errors.append('Missing qa/launch-evidence.json manual launch evidence.')
        return

    try:
        evidence = json.loads(evidence_path.read_text(encoding='utf-8'))
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f'qa/launch-evidence.json is unreadable or invalid JSON: {exc}')
        return

    required_true = {
        'real_sip_inbound_pass': 'Real SIP inbound call has not been physically verified.',
        'real_sip_outbound_pass': 'Real SIP outbound call has not been physically verified.',
        'human_handoff_pass': 'Human handoff has not been physically verified.',
        'spanish_voice_pass': 'Spanish voice path has not been physically verified.',
        'voice_interruption_pass': 'Voice interruption/recovery has not been physically verified.',
        'native_zoom_200_pass': 'Native browser/device 200% zoom and reflow has not been verified.',
        'preview_canonical_e2e_pass': 'Protected preview canonical lookup lacks direct end-to-end evidence.',
    }
    for key, message in required_true.items():
        if evidence.get(key) is not True:
            errors.append(message)

    total = evidence.get('beginner_real_users_total', 0)
    min_unaided = evidence.get('beginner_min_unaided_per_core_task', 0)
    if not isinstance(total, int) or total < 5:
        errors.append('Fewer than five real older/beginner users have completed validation.')
    if not isinstance(min_unaided, int) or min_unaided < 4:
        errors.append('Beginner validation has not reached >=4 of 5 unaided for every core task.')

    if evidence.get('automated_transactional_email_in_scope') is True:
        if evidence.get('resend_domain_verified_pass') is not True:
            errors.append('Automated transactional email is in launch scope but Resend domain verification has not passed.')
        if evidence.get('resend_delivery_test_pass') is not True:
            errors.append('Automated transactional email is in launch scope but controlled delivery testing has not passed.')


htmls = [p for p in ROOT.rglob('*.html') if should_check(p)]
required = ['privacy.html', 'terms.html', 'accessibility.html', '404.html', 'robots.txt', 'sitemap.xml']
for filename in required:
    if not (ROOT / filename).exists():
        errors.append(f'Missing required launch file: {filename}')

for path in htmls:
    text = path.read_text(encoding='utf-8', errors='replace')
    parser = Page()
    parser.feed(text)

    if not re.search(r'<title>\s*[^<]+', text, re.I):
        errors.append(f'{path.relative_to(ROOT)}: missing title')
    if not parser.lang:
        errors.append(f'{path.relative_to(ROOT)}: missing html lang')
    if not parser.viewport:
        errors.append(f'{path.relative_to(ROOT)}: missing viewport meta')
    if not parser.desc and path.name not in {'404.html', '404-es.html'}:
        warnings.append(f'{path.relative_to(ROOT)}: missing meta description')

    for image in parser.images:
        if 'alt' not in image:
            errors.append(f'{path.relative_to(ROOT)}: image missing alt: {image.get("src", "(unknown)")}')

    for href in parser.links:
        if href.startswith(('#', 'mailto:', 'tel:', 'javascript:', 'http://', 'https://')):
            continue
        target = href.split('#')[0].split('?')[0]
        if not target:
            continue
        candidate = ROOT / target.lstrip('/') if target.startswith('/') else path.parent / target
        if target.endswith('/'):
            candidate = candidate / 'index.html'
        if not candidate.exists():
            errors.append(f'{path.relative_to(ROOT)}: broken local link -> {href}')

index = (ROOT / 'index.html').read_text(encoding='utf-8', errors='replace')
for token, label in [
    ('property="og:title"', 'Open Graph title'),
    ('property="og:image"', 'Open Graph image'),
    ('name="twitter:card"', 'Twitter card'),
    ('rel="canonical"', 'canonical URL'),
]:
    if token not in index:
        errors.append(f'index.html: missing {label}')

css = '\n'.join(
    p.read_text(encoding='utf-8', errors='replace')
    for p in ROOT.rglob('*.css')
    if should_check(p)
)
if 'prefers-reduced-motion' not in css:
    errors.append('CSS: missing prefers-reduced-motion handling')
if ':focus-visible' not in css and ':focus' not in css:
    warnings.append('CSS: no obvious focus styling detected')

check_manual_launch_evidence()

print(f'Checked {len(htmls)} HTML files')
for warning in warnings:
    print('WARNING:', warning)
for error in errors:
    print('ERROR:', error)

if errors:
    print(f'Launch gate FAILED with {len(errors)} error(s).')
    sys.exit(1)

print(f'Launch gate PASSED with {len(warnings)} warning(s).')
