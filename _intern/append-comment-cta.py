#!/usr/bin/env python3
"""
Hängt an jede bestehende article-engagement Frage einen Call-to-Action
("Schreib es gern unten in die Kommentare.") an, falls noch nicht enthalten.
Idempotent.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

SLUGS = [
    "zwei-stimmen-gottes",
    "rebekka-isaak-segen",
    "auge-um-auge",
    "achtzehn-mal-und-dann",
    "ungeklaerte-schuld",
    "land-israel-ausspeit",
    "ein-verlorener-bruder",
    "der-koerper-luegt-nicht",
    "glaube-und-irrtum",
    "zweite-chance",
    "der-zweite-bock",
    "was-kommt-nach-der-befreiung",
    "vor-dem-blinden",
    "sei-wie-ephraim-und-menasche",
    "bestaendigkeit",
]

CTA = "Schreib es gern unten in die Kommentare."

PATTERN = re.compile(
    r'(<p class="article-engagement"><em>)(.*?)(</em></p>)',
    re.DOTALL,
)

def update_one(slug: str) -> str:
    path = ROOT / slug / "index.html"
    if not path.exists():
        return "missing"
    html = path.read_text(encoding="utf-8")
    matches = list(PATTERN.finditer(html))
    if not matches:
        return "no-engagement-block"
    inner = matches[0].group(2)
    if "Kommentare" in inner:
        return "already-has-cta"
    new_inner = inner.rstrip()
    if not new_inner.endswith((".", "?", "!")):
        new_inner += "."
    new_inner += " " + CTA
    new_html = html[:matches[0].start(2)] + new_inner + html[matches[0].end(2):]
    path.write_text(new_html, encoding="utf-8")
    return "updated"

def main():
    for slug in SLUGS:
        status = update_one(slug)
        print(f"{slug:35s} {status}")

if __name__ == "__main__":
    main()
