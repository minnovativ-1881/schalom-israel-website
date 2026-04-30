"""
Themen-Seiten-Generator für Schalom Israel.

Liest:
  - _intern/themen.json     (Themen-Definitionen)
  - blog/index.html         (Quelle für Artikel-Cards)

Schreibt:
  - themen/index.html               (Hub)
  - themen/<slug>/index.html        (1 Seite je Thema)

Aufruf:
    python build-themen.py
"""

import json
import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
SITE_DIR   = SCRIPT_DIR.parent
THEMEN_JSON = SCRIPT_DIR / "themen.json"
BLOG_HTML   = SITE_DIR / "blog" / "index.html"
THEMEN_DIR  = SITE_DIR / "themen"

UMAMI_SCRIPT = '<script defer src="https://umami-production-7ef6.up.railway.app/script.js" data-website-id="d7365873-4767-4546-9e8f-6fc68b868046"></script>'


def extract_cards(blog_html: str) -> dict:
    """Liefert dict[slug] = card-HTML-string. Quelle: <article class='article-card'>...</article>."""
    pattern = re.compile(r'(<article class="article-card"[\s\S]*?</article>)', re.MULTILINE)
    href_re = re.compile(r'href="/([^/"]+)/"')
    cards = {}
    for match in pattern.finditer(blog_html):
        block = match.group(1)
        href_match = href_re.search(block)
        if not href_match:
            continue
        slug = href_match.group(1)
        if slug not in cards:
            cards[slug] = block
    return cards


def fix_card_paths(card_html: str) -> str:
    """Card aus blog/ enthält ../bilder/share/...
    Auf Themen-Seiten liegen wir in /themen/<slug>/ — also auch ../../bilder/share/...
    Wir nutzen absolute Pfade /bilder/... damit es überall funktioniert."""
    # ../bilder/  -> /bilder/
    return card_html.replace('../bilder/', '/bilder/')


def render_hub(themen: list) -> str:
    cards_html = []
    for t in themen:
        cards_html.append(f"""      <a href="/themen/{t['slug']}/" class="theme-hub-card" style="background-image:url('/bilder/{t['hero_image']}')">
        <div class="theme-hub-card-overlay"></div>
        <div class="theme-hub-card-body">
          <p class="theme-hub-eyebrow">{len(t['slugs'])} Beiträge</p>
          <h2 class="theme-hub-title">{t['title']}</h2>
          <p class="theme-hub-lead">{t['lead']}</p>
          <span class="theme-hub-cta">Thema entdecken →</span>
        </div>
      </a>""")

    return f"""<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Themen – Schalom Israel</title>
  <meta name="description" content="Sieben Themen-Cluster: Warten, Vergebung, Auszug aus Ägypten, Worte, Land Israel, Heiligkeit, Berufung. Alle Beiträge nach Inhalt sortiert.">
  <meta property="og:title" content="Themen – Schalom Israel">
  <meta property="og:description" content="Sieben Themen-Cluster der Bibel-Beiträge. Alle Artikel nach Inhalt sortiert.">
  <meta property="og:image" content="https://www.schalomisrael.de/bilder/Schlaom-Israel.jpg">
  <meta property="og:url" content="https://www.schalomisrael.de/themen/">
  <meta property="og:type" content="website">
  <link rel="canonical" href="https://www.schalomisrael.de/themen/">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/article.css">
  <style>
    .themen-hero {{
      padding: 7rem 1.5rem 3rem;
      text-align: center;
      background: var(--navy);
    }}
    .themen-hero h1 {{
      font-family: 'Playfair Display', Georgia, serif;
      font-size: clamp(1.9rem, 5vw, 2.8rem);
      color: var(--cream);
      margin-bottom: 0.8rem;
    }}
    .themen-hero p {{
      max-width: 600px;
      margin: 0 auto;
      color: var(--text-muted);
      font-size: 1.02rem;
      line-height: 1.7;
    }}
    .themen-grid {{
      max-width: 1100px;
      margin: 0 auto;
      padding: 1rem 1.5rem 5rem;
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.4rem;
    }}
    @media (min-width: 720px) {{
      .themen-grid {{ grid-template-columns: 1fr 1fr; }}
    }}
    .theme-hub-card {{
      position: relative;
      display: block;
      overflow: hidden;
      border-radius: 4px;
      min-height: 260px;
      background-size: cover;
      background-position: center;
      text-decoration: none;
      color: inherit;
      transition: transform 0.3s, box-shadow 0.3s;
    }}
    .theme-hub-card:hover {{
      transform: translateY(-3px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.35);
    }}
    .theme-hub-card-overlay {{
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(13,30,53,0.45) 0%, rgba(13,30,53,0.95) 100%);
    }}
    .theme-hub-card-body {{
      position: relative;
      padding: 2rem 1.6rem 1.6rem;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      min-height: 260px;
    }}
    .theme-hub-eyebrow {{
      font-size: 0.74rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 0.45rem;
      font-weight: 500;
    }}
    .theme-hub-title {{
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.6rem;
      color: var(--cream);
      margin-bottom: 0.7rem;
      line-height: 1.25;
    }}
    .theme-hub-lead {{
      color: var(--text);
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 1rem;
      opacity: 0.92;
    }}
    .theme-hub-cta {{
      font-size: 0.82rem;
      letter-spacing: 0.06em;
      color: var(--gold);
      font-weight: 500;
    }}
  </style>
  {UMAMI_SCRIPT}
</head>
<body>
  <nav class="nav">
    <div class="nav-inner">
      <a href="/" class="logo">Schalom <strong>Israel</strong></a>
      <button class="nav-burger" aria-label="Menü öffnen"><span></span><span></span><span></span></button>
      <ul class="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/blog">Blog</a></li>
        <li><a href="/themen">Themen</a></li>
        <li><a href="/warum-schalom-israel">Über das Projekt</a></li>
        <li><a href="/bibelverse" class="nav-cta">7 Verse</a></li>
      </ul>
    </div>
  </nav>

  <header class="themen-hero">
    <h1>Themen</h1>
    <p>Sieben Cluster, durch die sich die wichtigsten Linien der Beiträge ziehen. Wähle, was dich gerade beschäftigt.</p>
  </header>

  <div class="themen-grid">
{chr(10).join(cards_html)}
  </div>

  <footer class="footer">
    <div class="container">
      <p class="footer-logo">Schalom <strong>Israel</strong></p>
      <nav class="footer-nav">
        <a href="/kontakt">Kontakt</a>
        <span>·</span>
        <a href="/datenschutzerklaerung">Datenschutzerklärung</a>
        <span>·</span>
        <a href="/impressum">Impressum</a>
      </nav>
    </div>
  </footer>

  <script src="/main.js"></script>
</body>
</html>
"""


def render_thema_page(thema: dict, cards_lookup: dict, themen_all: list) -> str:
    cards_html = []
    missing = []
    for slug in thema['slugs']:
        if slug in cards_lookup:
            cards_html.append('      ' + fix_card_paths(cards_lookup[slug]))
        else:
            missing.append(slug)

    if missing:
        print(f"  WARNUNG: Thema '{thema['slug']}' verweist auf fehlende Slugs: {missing}")

    # Andere Themen für Footer-Links
    other_themen_html = []
    for t in themen_all:
        if t['slug'] == thema['slug']:
            continue
        other_themen_html.append(f'<a href="/themen/{t["slug"]}/" class="theme-related-link">{t["title"]}</a>')

    return f"""<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{thema['title']} – Schalom Israel</title>
  <meta name="description" content="{thema['description']}">
  <meta property="og:title" content="{thema['title']} – Schalom Israel">
  <meta property="og:description" content="{thema['description']}">
  <meta property="og:image" content="https://www.schalomisrael.de/bilder/{thema['hero_image']}">
  <meta property="og:url" content="https://www.schalomisrael.de/themen/{thema['slug']}/">
  <meta property="og:type" content="website">
  <link rel="canonical" href="https://www.schalomisrael.de/themen/{thema['slug']}/">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/article.css">
  <style>
    .thema-hero {{
      position: relative;
      min-height: 360px;
      padding: 7rem 1.5rem 3rem;
      display: flex;
      align-items: flex-end;
    }}
    .thema-hero-bg {{
      position: absolute;
      inset: 0;
      background-image: url('/bilder/{thema['hero_image']}');
      background-size: cover;
      background-position: center;
    }}
    .thema-hero-overlay {{
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(13,30,53,0.55) 0%, rgba(13,30,53,0.95) 100%);
    }}
    .thema-hero-content {{
      position: relative;
      max-width: 700px;
      margin: 0 auto;
      text-align: center;
      color: var(--cream);
    }}
    .thema-hero-eyebrow {{
      font-size: 0.78rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 0.6rem;
      font-weight: 500;
    }}
    .thema-hero-title {{
      font-family: 'Playfair Display', Georgia, serif;
      font-size: clamp(2rem, 5vw, 3rem);
      line-height: 1.18;
      margin-bottom: 1rem;
    }}
    .thema-hero-lead {{
      font-size: 1.05rem;
      line-height: 1.7;
      color: var(--text);
      max-width: 580px;
      margin: 0 auto;
    }}
    .thema-related {{
      max-width: 860px;
      margin: 1rem auto 4rem;
      padding: 2.5rem 1.5rem;
      border-top: 1px solid rgba(200,169,98,0.15);
      text-align: center;
    }}
    .thema-related-eyebrow {{
      font-size: 0.74rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 1rem;
      font-weight: 500;
    }}
    .thema-related-grid {{
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem 1rem;
    }}
    .theme-related-link {{
      color: var(--text-muted);
      font-size: 0.92rem;
      padding: 0.4rem 0.85rem;
      border: 1px solid rgba(200,169,98,0.2);
      border-radius: 2px;
      text-decoration: none;
      transition: all 0.2s;
    }}
    .theme-related-link:hover {{
      color: var(--cream);
      border-color: var(--gold);
    }}
  </style>
  {UMAMI_SCRIPT}
</head>
<body>
  <nav class="nav">
    <div class="nav-inner">
      <a href="/" class="logo">Schalom <strong>Israel</strong></a>
      <button class="nav-burger" aria-label="Menü öffnen"><span></span><span></span><span></span></button>
      <ul class="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/blog">Blog</a></li>
        <li><a href="/themen">Themen</a></li>
        <li><a href="/warum-schalom-israel">Über das Projekt</a></li>
        <li><a href="/bibelverse" class="nav-cta">7 Verse</a></li>
      </ul>
    </div>
  </nav>

  <header class="thema-hero">
    <div class="thema-hero-bg"></div>
    <div class="thema-hero-overlay"></div>
    <div class="thema-hero-content">
      <p class="thema-hero-eyebrow">Thema</p>
      <h1 class="thema-hero-title">{thema['title']}</h1>
      <p class="thema-hero-lead">{thema['lead']}</p>
    </div>
  </header>

  <nav class="breadcrumb" aria-label="Brotkrumen-Navigation">
    <div class="breadcrumb-inner">
      <a href="/">Home</a>
      <span class="breadcrumb-sep">›</span>
      <a href="/themen/">Themen</a>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current">{thema['title']}</span>
    </div>
  </nav>

  <section class="articles blog-grid">
    <div class="container">
{chr(10).join(cards_html)}
    </div>
  </section>

  <section class="thema-related">
    <p class="thema-related-eyebrow">Weitere Themen</p>
    <div class="thema-related-grid">
      {chr(10)      .join(other_themen_html)}
    </div>
  </section>

  <footer class="footer">
    <div class="container">
      <p class="footer-logo">Schalom <strong>Israel</strong></p>
      <nav class="footer-nav">
        <a href="/kontakt">Kontakt</a>
        <span>·</span>
        <a href="/datenschutzerklaerung">Datenschutzerklärung</a>
        <span>·</span>
        <a href="/impressum">Impressum</a>
      </nav>
    </div>
  </footer>

  <script src="/main.js"></script>
</body>
</html>
"""


def main():
    blog_html = BLOG_HTML.read_text(encoding="utf-8")
    cards = extract_cards(blog_html)
    print(f"Karten aus blog/index.html extrahiert: {len(cards)}")

    config = json.loads(THEMEN_JSON.read_text(encoding="utf-8"))
    themen = config["themen"]

    THEMEN_DIR.mkdir(exist_ok=True)

    # Hub
    hub_path = THEMEN_DIR / "index.html"
    hub_path.write_text(render_hub(themen), encoding="utf-8")
    print(f"  ->{hub_path}")

    # Einzel-Themen
    for thema in themen:
        thema_dir = THEMEN_DIR / thema["slug"]
        thema_dir.mkdir(exist_ok=True)
        page = render_thema_page(thema, cards, themen)
        (thema_dir / "index.html").write_text(page, encoding="utf-8")
        print(f"  ->{thema_dir / 'index.html'} ({len(thema['slugs'])} Karten)")


if __name__ == "__main__":
    main()
