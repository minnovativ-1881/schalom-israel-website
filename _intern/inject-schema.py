"""
Schalom Israel – Schema.org LD+JSON Injector
=============================================
Fügt Article-Schema in alle Artikel-index.html ein (idempotent).
Bereits vorhandene ld+json-Blöcke werden übersprungen.

Aufruf:
    python inject-schema.py

Datums-Map: kann unten erweitert werden wenn neue Artikel hinzukommen.
"""

import re
import json
from pathlib import Path

SITE_DIR = Path(__file__).parent.parent
BASE_URL  = "https://www.schalomisrael.de"

# Bekannte Publikationsdaten (slug → ISO-Datum)
DATE_MAP = {
    "omer-woche-chesed":            "2026-04-10",
    "was-kommt-nach-der-befreiung": "2026-04-10",
    "das-grosse-waw":               "2026-04-10",
    "warten-geschenk":              "2026-03-29",
    "der-wendepunkt":               "2026-03-26",
    "glaube-und-irrtum":            "2026-03-26",
    "bestaendigkeit":               "2026-03-26",
    "sei-wie-ephraim-und-menasche": "2026-03-26",
    "ungeklaerte-schuld":           "2026-03-26",
    "zweite-chance":                "2026-03-26",
    "ein-verlorener-bruder":        "2026-03-26",
    "gott-zweifel":                 "2026-03-26",
    "rebekka-isaak-segen":          "2026-03-26",
    "unerfuellte-wuensche":         "2026-03-26",
    "wachstum-durch-schwierigkeiten": "2026-03-26",
    "wichtige-aufgaben":            "2026-03-26",
    "achtzehn-mal-und-dann":        "2026-03-26",
}

# Seiten, die KEIN Article-Schema bekommen sollen
SKIP = {"blog", "bibelverse", "kontakt", "impressum", "datenschutzerklaerung",
        "abmelden", "bestaetigung", "danke", "das-hat-geklappt", "feedback",
        "newsletter", "woechentlicher-newsletter", "bitte-bestaetige-deine-e-mail-adresse",
        "wichtige-aufgaben"}  # wichtige-aufgaben ist kein Artikel

def extract_meta(html: str, prop: str) -> str:
    m = re.search(rf'<meta\s+property=["\']og:{prop}["\']\s+content=["\'](.*?)["\']', html)
    return m.group(1) if m else ""

def build_schema(slug: str, title: str, description: str, image: str, date: str) -> str:
    schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        "image": image,
        "datePublished": date,
        "dateModified": date,
        "author": {
            "@type": "Person",
            "name": "Micha Levzion"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Schalom Israel",
            "url": BASE_URL
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": f"{BASE_URL}/{slug}/"
        }
    }
    return f'  <script type="application/ld+json">\n  {json.dumps(schema, ensure_ascii=False, indent=2)}\n  </script>'

def process(article_dir: Path):
    slug = article_dir.name
    if slug in SKIP:
        return

    html_file = article_dir / "index.html"
    if not html_file.exists():
        return

    html = html_file.read_text(encoding="utf-8")

    # Bereits vorhanden?
    if "application/ld+json" in html:
        print(f"  SKIP (bereits vorhanden): {slug}")
        return

    title       = extract_meta(html, "title")
    description = extract_meta(html, "description")
    image       = extract_meta(html, "image")
    date        = DATE_MAP.get(slug, "2026-03-26")

    if not title:
        print(f"  SKIP (kein og:title): {slug}")
        return

    schema_block = build_schema(slug, title, description, image, date)
    updated = html.replace("</head>", f"{schema_block}\n</head>", 1)

    html_file.write_text(updated, encoding="utf-8")
    print(f"  OK: {slug} ({date})")

if __name__ == "__main__":
    print("Schema.org Inject – Schalom Israel")
    print("=" * 40)
    for d in sorted(SITE_DIR.iterdir()):
        if d.is_dir() and not d.name.startswith(("_", ".", "bilder", "marke")):
            process(d)
    print("Fertig.")
