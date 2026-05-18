"""
Schalom Israel – Sitemap-Builder
=================================
Regeneriert sitemap.xml automatisch aus dem Site-Verzeichnis.

Strategie:
  - Alle <slug>/index.html im Wurzel-Verzeichnis werden zu URLs
  - Themen-Cluster-Seiten unter themen/<slug>/index.html
  - Buchseiten unter buecher/<slug>/index.html
  - Funktions-/Privat-Seiten werden über EXCLUDE_SLUGS ausgeschlossen
  - lastmod wird aus git log abgeleitet (neuester Commit auf die Datei)
  - Priorität nach Pfad-Typ (Home/Blog/Themen/Artikel)

Aufruf:
    python sitemap-build.py [--dry-run]

Dry-Run: druckt nur, schreibt nicht.
"""

import subprocess
import sys
from pathlib import Path
from datetime import datetime

SITE_DIR = Path(__file__).parent.parent
BASE_URL = "https://www.schalomisrael.de"

# Diese Slugs werden NICHT in der Sitemap aufgeführt (Funnel-, Funktions-, Disallow-Seiten)
EXCLUDE_SLUGS = {
    "abmelden", "bestaetigung", "bitte-bestaetige-deine-e-mail-adresse",
    "danke", "danke-bamidbar-9b4d6f708f3a", "das-hat-geklappt",
    "feedback", "newsletter", "woechentlicher-newsletter",
    "_intern", "bilder",
}

# Priorität & changefreq nach Pfad-Pattern
PRIO_RULES = [
    # (Pfad-Match, priority, changefreq)
    ("",                              "1.0", "weekly"),   # Home
    ("blog/",                          "0.9", "weekly"),
    ("parascha/",                      "0.9", "weekly"),
    ("themen/",                        "0.85", "monthly"), # /themen/ und /themen/*/
    ("buecher/",                       "0.85", "monthly"),
    ("bibelverse/",                    "0.8", "monthly"),
    ("unterstuetzen/",                 "0.7", "monthly"),
    ("warum-schalom-israel/",          "0.7", "monthly"),
    ("kontakt/",                       "0.4", "yearly"),
    ("impressum/",                     "0.3", "yearly"),
    ("datenschutzerklaerung/",         "0.3", "yearly"),
]
DEFAULT_PRIO = ("0.7", "monthly")  # alle Artikel


def git_lastmod(html_file: Path) -> str | None:
    """Letzter Commit-Datum für die Datei (YYYY-MM-DD), oder None falls nicht in git."""
    try:
        rel = html_file.relative_to(SITE_DIR)
        result = subprocess.run(
            ["git", "log", "-1", "--format=%cs", "--", str(rel)],
            cwd=SITE_DIR, capture_output=True, text=True, check=False,
        )
        out = result.stdout.strip()
        return out if out else None
    except Exception:
        return None


def url_for(html_file: Path) -> str:
    """Aus z.B. .../themen/land-israel/index.html mache https://.../themen/land-israel/"""
    rel = html_file.relative_to(SITE_DIR)
    parts = rel.parts
    if len(parts) == 1 and parts[0] == "index.html":
        return BASE_URL + "/"
    # </slug/>/index.html oder /dir/slug/index.html
    if parts[-1] == "index.html":
        path = "/".join(parts[:-1])
        return f"{BASE_URL}/{path}/"
    return f"{BASE_URL}/{'/'.join(parts)}"


def get_prio_freq(url_path: str) -> tuple[str, str]:
    """Liefert (priority, changefreq) für einen Pfad relativ zu BASE_URL."""
    # url_path z.B. "" (Home), "blog/", "themen/land-israel/", "auge-um-auge/"
    for prefix, prio, freq in PRIO_RULES:
        if url_path == prefix or url_path.startswith(prefix):
            # Bei "" muss exact match sein
            if prefix == "" and url_path != "":
                continue
            return prio, freq
    return DEFAULT_PRIO


def has_noindex(html_file: Path) -> bool:
    """True, wenn die Seite ein <meta name="robots" content="...noindex..."> hat."""
    try:
        head = html_file.read_text(encoding="utf-8", errors="ignore")[:4000].lower()
    except Exception:
        return False
    # robusterweise auf "noindex" im Robots-Meta prüfen
    if 'name="robots"' not in head:
        return False
    # Zeile mit dem robots-Meta extrahieren und auf noindex prüfen
    for line in head.splitlines():
        if 'name="robots"' in line and "noindex" in line:
            return True
    return False


def collect_pages() -> list[Path]:
    """Findet alle index.html, die in die Sitemap gehören."""
    pages: list[Path] = []

    # Home
    home = SITE_DIR / "index.html"
    if home.exists() and not has_noindex(home):
        pages.append(home)

    # Alle ersten-Ebene-Slugs
    for d in sorted(SITE_DIR.iterdir()):
        if not d.is_dir():
            continue
        if d.name.startswith((".", "_")):
            continue
        if d.name in EXCLUDE_SLUGS:
            continue
        idx = d / "index.html"
        if idx.exists() and not has_noindex(idx):
            pages.append(idx)
        # Eine Ebene tiefer: themen/*, buecher/*
        if d.name in {"themen", "buecher"}:
            for sub in sorted(d.iterdir()):
                if sub.is_dir():
                    sub_idx = sub / "index.html"
                    if sub_idx.exists() and not has_noindex(sub_idx):
                        pages.append(sub_idx)

    return pages


def build_sitemap(pages: list[Path]) -> str:
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for p in pages:
        url = url_for(p)
        url_path = url[len(BASE_URL) + 1:]  # alles nach "https://www.schalomisrael.de/"
        prio, freq = get_prio_freq(url_path)
        lastmod = git_lastmod(p)
        parts = [f"<loc>{url}</loc>"]
        if lastmod:
            parts.append(f"<lastmod>{lastmod}</lastmod>")
        parts.append(f"<changefreq>{freq}</changefreq>")
        parts.append(f"<priority>{prio}</priority>")
        lines.append(f"  <url>{''.join(parts)}</url>")
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def main():
    dry = "--dry-run" in sys.argv
    pages = collect_pages()
    print(f"Sitemap-Build – {len(pages)} URLs")
    xml = build_sitemap(pages)
    target = SITE_DIR / "sitemap.xml"
    if dry:
        print(xml)
        print("(dry-run, nicht geschrieben)")
        return
    target.write_text(xml, encoding="utf-8")
    print(f"OK: {target.relative_to(SITE_DIR)} geschrieben ({len(pages)} URLs)")


if __name__ == "__main__":
    main()
