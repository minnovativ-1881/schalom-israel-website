"""
Bulk-Update für alle HTML-Seiten der Schalom-Israel-Website.

Funktionen (idempotent — kann mehrfach laufen):
  1. Nav-Eintrag "Themen" hinzufügen, wo er fehlt
  2. Auf Artikel-Seiten:
     a. Reading-Time-Slot in der Hero-Meta einfügen
     b. Inline Klicktipp-Form durch <div data-klicktipp-form></div> ersetzen
     c. <img>-Tags im article-main mit width/height/loading="lazy" anreichern
     d. Article-Tags klickbar machen (-> /blog/?q=<tag>)
     e. Breadcrumb-Schema (JSON-LD) + visuelle Breadcrumb einfügen
     f. TOC-Container <div class="article-toc" data-toc></div> oben im Artikel-Body

Nutzung:
    python bulk-update-articles.py
"""

import re
import json
import sys
from pathlib import Path
from urllib.parse import quote

SITE_DIR = Path(__file__).parent.parent

# Slugs, die explizit *KEINE* normalen Artikel sind (Service-/System-Seiten)
NON_ARTICLE_SLUGS = {
    "abmelden", "bestaetigung", "bibelverse", "bitte-bestaetige-deine-e-mail-adresse",
    "blog", "danke", "das-hat-geklappt", "datenschutzerklaerung", "feedback",
    "impressum", "kontakt", "newsletter", "themen", "unterstuetzen",
    "warum-schalom-israel", "woechentlicher-newsletter", "warten-geschenk.html",
    "404"
}

# Aus blog/index.html: pro slug -> {parasha, book}
def parasha_lookup_from_blog():
    blog_html = (SITE_DIR / "blog" / "index.html").read_text(encoding="utf-8")
    result = {}
    pattern = re.compile(
        r'<article class="article-card" data-parasha="([^"]*)" data-book="([^"]*)">[\s\S]*?<a href="/([^/"]+)/"',
        re.MULTILINE
    )
    for m in pattern.finditer(blog_html):
        parasha, book, slug = m.group(1), m.group(2), m.group(3)
        result[slug] = {"parasha": parasha, "book": book}
    return result


# Buch-Slug → Buch-Name
BOOK_NAMES = {
    "bereschit": "1. Buch Mose",
    "schemot":   "2. Buch Mose",
    "wajikra":   "3. Buch Mose",
    "bamidbar":  "4. Buch Mose",
    "dewarim":   "5. Buch Mose",
    "omer":      "Omer",
}

# Parascha-Slug → Anzeigename (aus Blog-Index JS)
PARASHA_NAMES = {
    'bereschit':'Bereschit','noach':'Noach','lech-lecha':'Lech Lecha','wajera':'Wajera','chaje-sara':'Chaje Sara',
    'toledot':'Toledot','wajeze':'Wajeze','waijschlach':'Waijschlach','wajeschew':'Wajeschew','mikez':'Mikez',
    'wajigash':'Wajigash','wajchi':'Wajchi',
    'schemot':'Schemot','waera':'Waera','bo':'Bo','beschallach':'Beschallach','jitro':'Jitro',
    'mischpatim':'Mischpatim','teruma':'Teruma','tezawe':'Tezawe','ki-tissa':'Ki Tissa','wajakhel':'Wajakhel','pekudei':'Pekudei',
    'wajikra':'Wajikra','zaw':'Zaw','schemini':'Schemini','tazria':'Tazria','mezora':'Mezora',
    'acharej-mot':'Acharej Mot','kedoschim':'Kedoschim','emor':'Emor','behar':'Behar','bechukkotaj':'Bechukkotaj',
    'bamidbar':'Bamidbar','nasso':'Nasso','behaalotcha':'Behaalotcha','schlach-lecha':'Schlach Lecha',
    'korach':'Korach','chukat':'Chukat','balak':'Balak','pinchas':'Pinchas','matot':'Matot','masej':'Masej',
    'dewarim':'Dewarim','waetchanan':'Waetchanan','ekew':'Ekew','ree':'Ree','schoftim':'Schoftim',
    'ki-teize':'Ki Teize','ki-tawo':'Ki Tawo','nizawim':'Nizawim','wajelech':'Wajelech',
    'haasin':'Haasin','wesot-habracha':'Wesot Habracha',
}


# ========== Update-Funktionen ==========

def add_themen_nav(html: str) -> tuple:
    """Fügt /themen-Link in nav-links ein, falls noch nicht vorhanden."""
    if 'href="/themen"' in html or 'href="/themen/"' in html:
        return html, False
    # Match: <li><a href="/warum-schalom-israel">Über das Projekt</a></li>
    pattern = re.compile(r'(<li><a href="/warum-schalom-israel">Über das Projekt</a></li>)')
    if pattern.search(html):
        new_html = pattern.sub(
            '<li><a href="/themen">Themen</a></li>\n        \\1', html, count=1
        )
        return new_html, True
    return html, False


def replace_klicktipp_form(html: str) -> tuple:
    """Ersetzt das Klicktipp-Form-Snippet durch <div data-klicktipp-form></div>."""
    # Match: <div id="form-341119-wrapper">\n<form ...>...</form>\n</div>
    pattern = re.compile(
        r'<div id="form-341119-wrapper">\s*<form[^>]*>[\s\S]*?</form>\s*</div>',
        re.MULTILINE
    )
    if not pattern.search(html):
        return html, False
    if '<div data-klicktipp-form></div>' in html:
        # Möglich: Mix aus alter und neuer Form. Sicher gehen, dass alle ersetzt werden.
        pass
    new_html = pattern.sub('<div data-klicktipp-form></div>', html)
    return new_html, True


def add_image_dimensions(html: str) -> tuple:
    """Fügt width=1200, height=1200, loading=lazy auf article-share-img <img> ein, sofern noch nicht vorhanden."""
    pattern = re.compile(
        r'(<figure class="article-share-img">\s*<img\s+)([^>]*?)(/>|>)',
        re.MULTILINE
    )
    changed = False
    def repl(m):
        nonlocal changed
        attrs = m.group(2)
        if 'width=' in attrs and 'height=' in attrs:
            return m.group(0)
        # Sicher attrs ergänzen — vor dem schließenden Tag
        new_attrs = attrs.rstrip()
        if 'loading=' not in new_attrs:
            new_attrs += ' loading="lazy"'
        if 'width=' not in new_attrs:
            new_attrs += ' width="1200"'
        if 'height=' not in new_attrs:
            new_attrs += ' height="1200"'
        changed = True
        return m.group(1) + new_attrs + ' ' + m.group(3)
    new_html = pattern.sub(repl, html)
    return new_html, changed


def add_reading_time_marker(html: str) -> tuple:
    """Fügt einen [data-reading-time]-Slot direkt nach dem 'von Micha Levzion' Meta-Element ein."""
    if 'data-reading-time' in html:
        return html, False
    # Match: <p class="article-meta">von Micha Levzion</p>
    pattern = re.compile(r'<p class="article-meta">von Micha Levzion</p>')
    if not pattern.search(html):
        return html, False
    new_html = pattern.sub(
        '<div class="article-meta-line">\n'
        '        <p class="article-meta">von Micha Levzion</p>\n'
        '        <span class="meta-divider">·</span>\n'
        '        <span class="article-reading-time" data-reading-time>… Min Lesezeit</span>\n'
        '      </div>',
        html, count=1
    )
    return new_html, True


def link_tags(html: str, parasha_slug: str, parasha_name: str) -> tuple:
    """Macht <span class="article-tag">XYZ</span> klickbar zu /blog/?q=XYZ. Parascha-Tag verlinkt direkt zum Filter."""
    pattern = re.compile(r'<span class="article-tag">([^<]+)</span>')
    if not pattern.search(html):
        return html, False
    if 'class="article-tag" href' in html:
        # bereits gemacht
        return html, False

    changed = False
    def repl(m):
        nonlocal changed
        label = m.group(1).strip()
        # Parascha-Tag: link nicht zur Suche, sondern direkter Anker zum Blog mit Filter
        # — vereinfacht: alles geht in die Suche
        href = '/blog/?q=' + quote(label)
        changed = True
        return f'<a class="article-tag" href="{href}">{label}</a>'
    new_html = pattern.sub(repl, html)
    return new_html, changed


def add_breadcrumb(html: str, slug: str, lookup: dict) -> tuple:
    """Fügt Breadcrumb-Schema (JSON-LD) + visuelle Breadcrumb ein, falls noch nicht vorhanden."""
    if 'class="breadcrumb"' in html:
        return html, False

    info = lookup.get(slug, {})
    parasha_slug = info.get("parasha", "")
    book_slug = info.get("book", "")
    book_name = BOOK_NAMES.get(book_slug, "")
    parasha_name = PARASHA_NAMES.get(parasha_slug, "")

    # Title aus <title>...</title> extrahieren
    m = re.search(r'<title>([^<]+?)\s*–\s*Schalom Israel</title>', html)
    article_title = m.group(1).strip() if m else "Beitrag"

    # Liste der Krumen aufbauen
    crumbs = [("Home", "/"), ("Blog", "/blog/")]
    if book_slug and book_name:
        crumbs.append((book_name, f"/blog/?book={book_slug}"))
    if parasha_slug and parasha_name:
        crumbs.append((parasha_name, f"/blog/?parasha={parasha_slug}"))
    crumbs.append((article_title, None))

    # JSON-LD (BreadcrumbList)
    items = []
    for i, (name, url) in enumerate(crumbs, start=1):
        item = {
            "@type": "ListItem",
            "position": i,
            "name": name,
        }
        if url:
            item["item"] = "https://www.schalomisrael.de" + url
        items.append(item)
    schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items,
    }
    schema_json = json.dumps(schema, ensure_ascii=False, indent=2)

    # Visuelle Breadcrumb-HTML
    parts = []
    for i, (name, url) in enumerate(crumbs):
        if url:
            parts.append(f'<a href="{url}">{name}</a>')
        else:
            parts.append(f'<span class="breadcrumb-current">{name}</span>')
        if i < len(crumbs) - 1:
            parts.append('<span class="breadcrumb-sep">›</span>')
    visual_html = (
        '\n  <nav class="breadcrumb" aria-label="Brotkrumen-Navigation">\n'
        '    <div class="breadcrumb-inner">\n      '
        + '\n      '.join(parts) +
        '\n    </div>\n  </nav>\n'
    )

    # JSON-LD vor </head>
    if 'BreadcrumbList' not in html:
        html = html.replace(
            '</head>',
            f'  <script type="application/ld+json">\n{schema_json}\n  </script>\n</head>',
            1
        )

    # Visuelle Breadcrumb nach </header> (nach dem Hero) einfügen
    # Match die ENDE des Article-Hero (sucht nach </header>) — aber nur die ERSTE
    if '</header>' in html:
        html = html.replace('</header>', '</header>' + visual_html, 1)

    return html, True


def add_toc_marker(html: str) -> tuple:
    """Fügt <div class='article-toc' data-toc></div> direkt nach <div class='article-tags'>...</div> ein."""
    if 'class="article-toc"' in html or 'data-toc' in html:
        return html, False
    pattern = re.compile(r'(<div class="article-tags">[\s\S]*?</div>)')
    if not pattern.search(html):
        return html, False
    new_html = pattern.sub(r'\1\n      <div class="article-toc" data-toc></div>', html, count=1)
    return new_html, True


# ========== Hauptlauf ==========

def process_file(html_path: Path, slug: str, lookup: dict, is_article: bool) -> dict:
    html = html_path.read_text(encoding="utf-8")
    original = html
    changes = {}

    # Auf ALLEN Seiten: Themen-Nav
    html, changed = add_themen_nav(html)
    if changed: changes["nav"] = True

    if is_article:
        html, changed = replace_klicktipp_form(html)
        if changed: changes["klicktipp"] = True

        html, changed = add_image_dimensions(html)
        if changed: changes["images"] = True

        html, changed = add_reading_time_marker(html)
        if changed: changes["reading_time"] = True

        info = lookup.get(slug, {})
        parasha_slug = info.get("parasha", "")
        parasha_name = PARASHA_NAMES.get(parasha_slug, "")
        html, changed = link_tags(html, parasha_slug, parasha_name)
        if changed: changes["tags"] = True

        html, changed = add_breadcrumb(html, slug, lookup)
        if changed: changes["breadcrumb"] = True

        html, changed = add_toc_marker(html)
        if changed: changes["toc"] = True

    if html != original:
        html_path.write_text(html, encoding="utf-8")
    return changes


def main():
    lookup = parasha_lookup_from_blog()
    print(f"Parascha-Lookup mit {len(lookup)} Eintraegen geladen.")

    # Liste aller Verzeichnisse mit index.html
    article_dirs = []
    other_dirs = []
    for child in sorted(SITE_DIR.iterdir()):
        if not child.is_dir():
            continue
        if child.name.startswith("."):
            continue
        if child.name in {"_intern", "bilder", "themen"}:
            continue
        idx = child / "index.html"
        if not idx.exists():
            continue
        if child.name in NON_ARTICLE_SLUGS:
            other_dirs.append((child.name, idx))
        else:
            article_dirs.append((child.name, idx))

    # Auch die Wurzel-index.html
    root_idx = SITE_DIR / "index.html"

    print(f"Artikel: {len(article_dirs)}, andere Seiten: {len(other_dirs)}, Wurzel: {root_idx.exists()}")

    summary = {"articles_changed": 0, "others_changed": 0}

    # Artikel
    for slug, idx in article_dirs:
        changes = process_file(idx, slug, lookup, is_article=True)
        if changes:
            summary["articles_changed"] += 1
            print(f"  [A] {slug}: {','.join(changes.keys())}")

    # Andere Seiten — nur Nav-Update
    for slug, idx in other_dirs:
        changes = process_file(idx, slug, lookup, is_article=False)
        if changes:
            summary["others_changed"] += 1
            print(f"  [S] {slug}: {','.join(changes.keys())}")

    # Wurzel
    if root_idx.exists():
        changes = process_file(root_idx, "", lookup, is_article=False)
        if changes:
            print(f"  [R] /: {','.join(changes.keys())}")

    print()
    print("Summary:", summary)


if __name__ == "__main__":
    main()
