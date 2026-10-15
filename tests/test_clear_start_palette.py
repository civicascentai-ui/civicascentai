"""Verify the owner's senior-friendly visual palette without claiming WCAG certification.

Static token checks must remain independently testable at $0, with no third
party packages, internet requests, tracking or unpublished student records.
"""
from pathlib import Path
import re

css = (Path(__file__).resolve().parents[1] / "assets/clear-start.css").read_text()
root = re.search(r":root\{([^}]+)\}", css)
dark = re.search(r'body\[data-theme="dark"\]\{([^}]+)\}', css)
assert root and dark, "Expected explicit light and dark color tokens"

def tokens(block):
    return dict(re.findall(r"(--[\w-]+):([^;}]+)", block))

def luminance(color):
    assert re.fullmatch(r"#[0-9a-fA-F]{6}", color), ("Palette must be a literal hex RGB color", color)
    raw = [int(color[i:i+2],16)/255 for i in (1,3,5)]
    linear = [v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in raw]
    return sum(v*w for v,w in zip(linear,(.2126,.7152,.0722)))

def contrast(a,b):
    a,b=sorted((luminance(a),luminance(b)))
    return (b+.05)/(a+.05)

light,dark=tokens(root.group(1)),tokens(dark.group(1))
assert light["--ink"].upper()=="#0A192F", light["--ink"]
assert light["--paper"].upper()=="#F8F9FA", light["--paper"]
assert light["--gold"].upper()=="#D97706", light["--gold"]
pairs = [
    ("main_light_text",light["--ink"],light["--paper"],7),
    ("panel_light_text",light["--ink"],light["--surface"],7),
    ("secondary_light_text",light["--muted"],light["--paper"],7),
    ("main_dark_text",dark["--ink"],dark["--paper"],7),
    ("panel_dark_text",dark["--ink"],dark["--surface"],7),
    ("secondary_dark_text",dark["--muted"],dark["--band"],7),
    ("primary_light_button",light["--accent-text"],light["--accent"],7),
    ("primary_dark_button",dark["--accent-text"],dark["--accent"],7),
    ("amber_nontext_border_on_white",light["--gold"],light["--surface"],3),
]
for label,foreground,background,minimum in pairs:
    value=contrast(foreground,background)
    assert value >= minimum, (label,"expected",minimum,"measured",round(value,2))
    print("PASS",label,round(value,2),":1")

# An attractive amber accent is NOT legible as normal text on off-white.
assert contrast(light["--gold"],light["--paper"])<7
assert "font-base:20px" in css
assert "line-height:1.65" in css or "/1.65 " in css
for selector in (
    ".top-links a",".intro .eyebrow",".preferences p",
    ".control-group strong",".choice .step",".choice p:not(.step)",
    ".more-choices a",".reassurance p"
):
    match=re.search(re.escape(selector)+r"\{([^}]+)\}",css)
    assert match, selector
    size=re.search(r"font-size:([\d.]+)rem",match.group(1))
    assert size and float(size.group(1))*16>=18, (selector, "must be at least 18px",size.group(1) if size else None)
print("PASS: body>=20px, supporting text>=18px, line-height>=1.65; AAA-like primary palette contrast validated only")
