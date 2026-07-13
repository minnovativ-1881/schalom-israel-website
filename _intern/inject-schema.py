"""
Schalom Israel – Schema.org LD+JSON Injector
=============================================
Fügt Schema.org-Markup als ld+json ein (idempotent):
  - Article-Schema in alle Artikel-index.html
  - WebSite-Schema auf der Home (index.html)
  - Book-Schema auf Buchseiten unter buecher/<slug>/index.html

Bereits vorhandene ld+json-Blöcke werden NICHT überschrieben (Skip).

Aufruf:
    python inject-schema.py

Datums-Map: kann unten erweitert werden wenn neue Artikel hinzukommen.
Buch-Daten: unten in BOOKS pflegen.
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
        "wichtige-aufgaben",  # wichtige-aufgaben ist kein Artikel
        "themen", "parascha", "unterstuetzen", "warum-schalom-israel",
        "freebie-vorschau", "buecher"}

# Buch-Daten für Book-Schema (slug → Daten)
BOOKS = {
    "bamidbar": {
        "name": "Bamidbar – In der Wüste",
        "alternateName": "Das Tora-Jahr · Band IV",
        "isbn_softcover": "979-8-19593-460-6",
        "isbn_hardcover": "979-8-19596-716-1",
        "numberOfPages": 179,
        "datePublished": "2026-05-07",
        "inLanguage": "de",
        "bookFormat": "https://schema.org/Paperback",
        "image": "https://www.schalomisrael.de/buecher/bamidbar/cover.jpg",
        "description": "Band IV der Reihe „Das Tora-Jahr\": Tiefgehende Auslegungen zu allen zehn Wochenlesungen von Bamidbar (4. Mose).",
        "price_softcover": "16.95",
        "price_hardcover": "24.95",
        "price_ebook": "9.95",
    },
}

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

def inject_block(html_file: Path, schema_obj: dict, label: str) -> bool:
    """Schreibt einen ld+json-Block in </head>. Idempotent: skip wenn schon vorhanden."""
    if not html_file.exists():
        print(f"  SKIP ({label}, Datei fehlt): {html_file}")
        return False
    html = html_file.read_text(encoding="utf-8")
    if "application/ld+json" in html:
        print(f"  SKIP ({label}, schon vorhanden): {html_file.relative_to(SITE_DIR)}")
        return False
    block = (
        '  <script type="application/ld+json">\n  '
        + json.dumps(schema_obj, ensure_ascii=False, indent=2)
        + "\n  </script>"
    )
    updated = html.replace("</head>", f"{block}\n</head>", 1)
    html_file.write_text(updated, encoding="utf-8")
    print(f"  OK ({label}): {html_file.relative_to(SITE_DIR)}")
    return True


def inject_website_schema():
    """WebSite-Schema auf der Home."""
    schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Schalom Israel",
        "alternateName": "Schalom Israel – Gedanken zu Israel, Gottes Wort und deinem Alltag",
        "url": BASE_URL,
        "inLanguage": "de",
        "publisher": {
            "@type": "Organization",
            "name": "Schalom Israel",
            "url": BASE_URL,
        },
    }
    inject_block(SITE_DIR / "index.html", schema, "WebSite")


def inject_book_schema():
    """Book-Schema auf jeder Buchseite unter buecher/<slug>/index.html."""
    for slug, b in BOOKS.items():
        book_dir = SITE_DIR / "buecher" / slug
        url = f"{BASE_URL}/buecher/{slug}/"
        schema = {
            "@context": "https://schema.org",
            "@type": "Book",
            "name": b["name"],
            "alternateName": b["alternateName"],
            "description": b["description"],
            "image": b["image"],
            "url": url,
            "inLanguage": b["inLanguage"],
            "numberOfPages": b["numberOfPages"],
            "datePublished": b["datePublished"],
            "bookFormat": b["bookFormat"],
            "isbn": b["isbn_softcover"],
            "author": {
                "@type": "Person",
                "name": "Micha Levzion",
            },
            "publisher": {
                "@type": "Organization",
                "name": "Schalom Israel",
                "url": BASE_URL,
            },
            "workExample": [
                {
                    "@type": "Book",
                    "bookFormat": "https://schema.org/Paperback",
                    "isbn": b["isbn_softcover"],
                    "potentialAction": {
                        "@type": "ReadAction",
                        "target": {
                            "@type": "EntryPoint",
                            "urlTemplate": "https://www.amazon.de/dp/PRODUKT-ASIN-PAPERBACK",
                        },
                    },
                    "offers": {
                        "@type": "Offer",
                        "price": b["price_softcover"],
                        "priceCurrency": "EUR",
                    },
                },
                {
                    "@type": "Book",
                    "bookFormat": "https://schema.org/Hardcover",
                    "isbn": b["isbn_hardcover"],
                    "potentialAction": {
                        "@type": "ReadAction",
                        "target": {
                            "@type": "EntryPoint",
                            "urlTemplate": "https://www.amazon.de/dp/PRODUKT-ASIN-HARDCOVER",
                        },
                    },
                    "offers": {
                        "@type": "Offer",
                        "price": b["price_hardcover"],
                        "priceCurrency": "EUR",
                    },
                },
                {
                    "@type": "Book",
                    "bookFormat": "https://schema.org/EBook",
                    "offers": {
                        "@type": "Offer",
                        "price": b["price_ebook"],
                        "priceCurrency": "EUR",
                    },
                },
            ],
        }
        inject_block(book_dir / "index.html", schema, f"Book/{slug}")


if __name__ == "__main__":
    print("Schema.org Inject – Schalom Israel")
    print("=" * 40)
    print("\n[1/3] Article-Schema")
    for d in sorted(SITE_DIR.iterdir()):
        if d.is_dir() and not d.name.startswith(("_", ".", "bilder", "marke")):
            process(d)
    print("\n[2/3] WebSite-Schema (Home)")
    inject_website_schema()
    print("\n[3/3] Book-Schema (Buchseiten)")
    inject_book_schema()
    print("\nFertig.")
