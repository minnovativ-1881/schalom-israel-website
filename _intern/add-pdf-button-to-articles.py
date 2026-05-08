"""
Fügt den PDF-Download-Button in die .share-buttons-Section aller Artikel ein.

Idempotent — kann mehrfach laufen, fügt den Button nur ein, wenn er fehlt.
Bearbeitet keine Service-/System-Seiten.

Nutzung:
    python _intern/add-pdf-button-to-articles.py
"""

import re
from pathlib import Path

SITE_DIR = Path(__file__).parent.parent

NON_ARTICLE_SLUGS = {
    "abmelden", "bestaetigung", "bibelverse", "bitte-bestaetige-deine-e-mail-adresse",
    "blog", "danke", "das-hat-geklappt", "datenschutzerklaerung", "feedback",
    "freebie-vorschau", "impressum", "kontakt", "newsletter", "parascha",
    "themen", "unterstuetzen", "warum-schalom-israel", "woechentlicher-newsletter",
    "danke-bamidbar-9b4d6f708f3a",
}

PDF_BUTTON_HTML = '<button class="share-btn share-btn--pdf" onclick="exportArticleToPdf(this)">Als PDF</button>'

# Matcht die Copy-Button-Zeile mit beliebiger Einrückung; behält die Einrückung bei
# und fügt den PDF-Button auf der nächsten Zeile mit derselben Einrückung ein.
COPY_BTN_PATTERN = re.compile(
    r'(?P<indent>[ \t]*)<button class="share-btn share-btn--copy".*?>Link kopieren</button>'
)


def already_has_pdf_button(html: str) -> bool:
    return 'share-btn--pdf' in html


def add_pdf_button(html: str) -> str:
    if already_has_pdf_button(html):
        return html
    match = COPY_BTN_PATTERN.search(html)
    if not match:
        return html  # Datei hat kein Share-Button-Block → nicht anfassen
    indent = match.group('indent')
    insertion = f"\n{indent}{PDF_BUTTON_HTML}"
    return html[:match.end()] + insertion + html[match.end():]


def main():
    updated = []
    skipped_no_share = []
    skipped_already = []

    for index_file in sorted(SITE_DIR.glob('*/index.html')):
        slug = index_file.parent.name
        if slug in NON_ARTICLE_SLUGS:
            continue

        original = index_file.read_text(encoding='utf-8')
        if already_has_pdf_button(original):
            skipped_already.append(slug)
            continue
        if not COPY_BTN_PATTERN.search(original):
            skipped_no_share.append(slug)
            continue

        new = add_pdf_button(original)
        if new != original:
            index_file.write_text(new, encoding='utf-8')
            updated.append(slug)

    print(f"Aktualisiert: {len(updated)} Artikel")
    for s in updated:
        print(f"  + {s}")
    if skipped_already:
        print(f"\nBereits aktuell: {len(skipped_already)} Artikel")
    if skipped_no_share:
        print(f"\nKein Share-Block (uebersprungen): {len(skipped_no_share)}")
        for s in skipped_no_share:
            print(f"  - {s}")


if __name__ == '__main__':
    main()
