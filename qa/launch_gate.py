from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import re, sys

ROOT=Path(__file__).resolve().parents[1]
IGNORE_DIRS={'.git','backups','checkpoints','prototype-react'}
LEGACY_PREFIXES=('model-03-','model-04-','model-05-','model-06-','model-07-')
errors=[]; warnings=[]

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.links=[]; self.images=[]; self.title=False; self.lang=False; self.desc=False; self.viewport=False
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='html' and a.get('lang'): self.lang=True
        if tag=='meta' and a.get('name','').lower()=='description' and a.get('content','').strip(): self.desc=True
        if tag=='meta' and a.get('name','').lower()=='viewport': self.viewport=True
        if tag=='a' and a.get('href'): self.links.append(a['href'])
        if tag=='img': self.images.append(a)
    def handle_startendtag(self, tag, attrs): self.handle_starttag(tag,attrs)
    def handle_data(self, data): pass
    def handle_starttag_title(self): pass

def should_check(p):
    if any(part in IGNORE_DIRS for part in p.parts): return False
    if p.name.startswith(LEGACY_PREFIXES) and (p.name.endswith('-preview.html') or p.name.endswith('-diagnostic.html')): return False
    return True

htmls=[p for p in ROOT.rglob('*.html') if should_check(p)]
required=['privacy.html','terms.html','accessibility.html','404.html','robots.txt','sitemap.xml']
for f in required:
    if not (ROOT/f).exists(): errors.append(f'Missing required launch file: {f}')

for p in htmls:
    text=p.read_text(encoding='utf-8',errors='replace')
    parser=Page(); parser.feed(text)
    if not re.search(r'<title>\s*[^<]+',text,re.I): errors.append(f'{p.relative_to(ROOT)}: missing title')
    if not parser.lang: errors.append(f'{p.relative_to(ROOT)}: missing html lang')
    if not parser.viewport: errors.append(f'{p.relative_to(ROOT)}: missing viewport meta')
    if not parser.desc and p.name not in {'404.html','404-es.html'}: warnings.append(f'{p.relative_to(ROOT)}: missing meta description')
    for img in parser.images:
        if 'alt' not in img: errors.append(f'{p.relative_to(ROOT)}: image missing alt: {img.get("src","(unknown)")}')
    for href in parser.links:
        if href.startswith(('#','mailto:','tel:','javascript:','http://','https://')): continue
        target=href.split('#')[0].split('?')[0]
        if not target: continue
        if target.startswith('/'): q=ROOT/target.lstrip('/')
        else: q=(p.parent/target)
        if target.endswith('/'): q=q/'index.html'
        if not q.exists(): errors.append(f'{p.relative_to(ROOT)}: broken local link -> {href}')

index=(ROOT/'index.html').read_text(encoding='utf-8',errors='replace')
for token,label in [
    ('property="og:title"','Open Graph title'),
    ('property="og:image"','Open Graph image'),
    ('name="twitter:card"','Twitter card'),
    ('rel="canonical"','canonical URL'),
]:
    if token not in index: errors.append(f'index.html: missing {label}')

css='\n'.join(p.read_text(encoding='utf-8',errors='replace') for p in ROOT.rglob('*.css') if should_check(p))
if 'prefers-reduced-motion' not in css: errors.append('CSS: missing prefers-reduced-motion handling')
if ':focus-visible' not in css and ':focus' not in css: warnings.append('CSS: no obvious focus styling detected')

print(f'Checked {len(htmls)} HTML files')
for w in warnings: print('WARNING:',w)
for e in errors: print('ERROR:',e)
if errors:
    print(f'Launch gate FAILED with {len(errors)} error(s).')
    sys.exit(1)
print(f'Launch gate PASSED with {len(warnings)} warning(s).')
