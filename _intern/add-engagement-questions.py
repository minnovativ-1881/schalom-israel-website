#!/usr/bin/env python3
"""
Fügt eine Engagement-Frage am Ende des Artikels (vor </main>) und einen
artikel-spezifischen Kommentar-Sub-Text ein. Idempotent: wenn beides schon
vorhanden ist, wird übersprungen.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# slug -> (engagement_paragraph_text, comments_sub_text)
ARTICLES = {
    "rebekka-isaak-segen": (
        "Wie liest du Rebekkas Tat heute, mit dem Or HaChaim im Ohr? Und wie weit würdest du selbst gehen, um den Plan, den du erkannt hast, zu schützen?",
        "Wie liest du Rebekkas Tat heute? Schreib mir gern, was du in dieser Familiengeschichte für dich entdeckst.",
    ),
    "auge-um-auge": (
        "Wie geht es dir mit der Erkenntnis, dass dieser Vers nie wörtlich gemeint war? Welche Bibelstelle hast du vielleicht jahrelang anders verstanden – bis jetzt?",
        "Welche Bibelstelle hast du jahrelang anders verstanden – bis du sie neu gelesen hast? Schreib mir gern.",
    ),
    "achtzehn-mal-und-dann": (
        "Wo lebst du gerade Tamid – Tag für Tag dieselbe Treue, ohne dass es jemand sieht? Und wo wartest du auf das Außergewöhnliche, statt das Gewöhnliche zu sehen?",
        "Wo wartest du gerade auf das Außergewöhnliche – statt das Gewöhnliche zu sehen? Schreib mir gern.",
    ),
    "ungeklaerte-schuld": (
        "Gibt es einen Bruder, eine Schwester, einen Freund, mit dem du eine ungeklärte Schuld trägst? Was hält dich davon ab, sie auszusprechen?",
        "Gibt es jemanden, mit dem du eine ungeklärte Schuld trägst? Schreib mir gern, was dich gerade bewegt.",
    ),
    "land-israel-ausspeit": (
        "Wie liest du das Bild des ausspeienden Landes heute, wo Israel wieder bewohnt ist? Und welche Lashon Hara dürfen wir uns selbst gegenüber nicht mehr leisten?",
        "Wie liest du dieses Bild heute? Schreib mir gern, was dich an Hillels Antwort am meisten berührt.",
    ),
    "ein-verlorener-bruder": (
        "Wer ist der verborgene Bruder in deinem Leben – eine Beziehung, die nie ganz heilen konnte? Und welche Namen würdest du ihm heute geben?",
        "Wer ist der verborgene Bruder in deinem Leben? Schreib mir gern, was dich daran bewegt.",
    ),
    "der-koerper-luegt-nicht": (
        "Wo signalisiert dein Körper gerade etwas, was du innerlich noch nicht ausgesprochen hast? Wie geht es dir mit dem Gedanken, Einsamkeit nicht als Problem, sondern als Lösung zu sehen?",
        "Wie geht es dir mit dem Gedanken, Einsamkeit als Lösung zu sehen? Schreib mir gern, was du dabei spürst.",
    ),
    "glaube-und-irrtum": (
        "Welcher Buchstabe deines Lebens steht heute größer als die anderen? Und welcher kleine Irrtum hat dich gerade gelehrt, was Glaube wirklich heißt?",
        "Welcher Buchstabe deines Lebens steht heute groß? Schreib mir gern, was dich gerade beschäftigt.",
    ),
    "zweite-chance": (
        "Wem gegenüber wartest du auf eine zweite Chance – und wem schuldest du sie selbst? Was hält dich davon ab, sie zu geben?",
        "Wem schuldest du gerade eine zweite Chance? Schreib mir gern, was dich davon abhält.",
    ),
    "der-zweite-bock": (
        "Was in deinem Leben gehört auf den ersten Bock – und was möchtest du heute auf den zweiten legen, in die Wüste schicken, ein für allemal?",
        "Was möchtest du heute in die Wüste schicken? Schreib mir gern, was dich gerade dazu bewegt.",
    ),
    "was-kommt-nach-der-befreiung": (
        "Was ist dein „nach Pessach“? Wo bist du frei – und weißt noch nicht, wofür?",
        "Wo bist du frei – und weißt noch nicht, wofür? Schreib mir gern, was dich gerade beschäftigt.",
    ),
    "vor-dem-blinden": (
        "Wo legst du gerade jemandem unbewusst einen Stolperstein? Und welcher „Blinde“ in deinem Leben verdient mehr Achtsamkeit?",
        "Welcher „Blinde“ in deinem Leben verdient mehr Achtsamkeit? Schreib mir gern, wer dir gerade in den Sinn kommt.",
    ),
    "sei-wie-ephraim-und-menasche": (
        "Welcher der beiden Brüder bist du heute mehr – der Ephraim, der Frucht trägt, oder der Menasche, der vergessen darf? Was sagt dir das?",
        "Bist du heute mehr Ephraim oder mehr Menasche? Schreib mir gern, was du in deinem Leben gerade davon brauchst.",
    ),
    "bestaendigkeit": (
        "Was in deinem Leben braucht heute mehr Beständigkeit als Begeisterung? Welcher unspektakuläre Schritt kostet dich gerade alles – und ist es trotzdem wert?",
        "Welcher unspektakuläre Schritt kostet dich gerade alles? Schreib mir gern, was dich am Dranbleiben hindert.",
    ),
}

GENERIC_COMMENTS_SUB = "Was bewegt dich an diesem Beitrag? Ich freue mich über deinen Gedanken."

# Marker, mit dem wir erkennen, ob die Engagement-Frage schon eingefügt wurde.
ENGAGEMENT_MARKER_RE = re.compile(r'<p class="article-engagement"', re.IGNORECASE)

def insert_engagement(html: str, question: str) -> tuple[str, bool]:
    """Fügt vor `</main>` einen italic-paragraphen mit der Frage ein.
    Sucht den letzten `</div>\n  </main>` Block und fügt davor ein."""
    if ENGAGEMENT_MARKER_RE.search(html):
        return html, False
    # Match die Schluss-Sequenz von main mit Container-Div
    pattern = re.compile(r'(\n)([ \t]*)(</div>\s*</main>)', re.MULTILINE)
    match = pattern.search(html)
    if not match:
        return html, False
    # Indent vom </div> wird wiederverwendet, aber für den <p> gehen wir zwei Spaces
    # ein (innerhalb des container-divs). Wir nutzen 6 Spaces als sichere Wahl,
    # weil das Standard-Indent in den Artikeln ist.
    indent = "      "
    new_paragraph = f'\n{indent}<p class="article-engagement"><em>{question}</em></p>\n'
    new_html = html[:match.start()] + new_paragraph + html[match.start():]
    return new_html, True

def replace_comments_sub(html: str, new_text: str) -> tuple[str, bool]:
    """Ersetzt den generischen Kommentar-Sub-Text durch artikel-spezifischen.
    Wenn er bereits artikel-spezifisch ist (also nicht der generische), nichts tun."""
    needle = f'<p class="comments-sub">{GENERIC_COMMENTS_SUB}</p>'
    if needle not in html:
        return html, False
    replacement = f'<p class="comments-sub">{new_text}</p>'
    return html.replace(needle, replacement, 1), True

def process_article(slug: str, question: str, sub: str) -> dict:
    path = ROOT / slug / "index.html"
    if not path.exists():
        return {"slug": slug, "status": "missing"}
    html = path.read_text(encoding="utf-8")
    new_html, changed_q = insert_engagement(html, question)
    new_html, changed_sub = replace_comments_sub(new_html, sub)
    if changed_q or changed_sub:
        path.write_text(new_html, encoding="utf-8")
    return {
        "slug": slug,
        "status": "updated" if (changed_q or changed_sub) else "skipped",
        "question_added": changed_q,
        "comments_sub_replaced": changed_sub,
    }

def main():
    results = [process_article(slug, q, s) for slug, (q, s) in ARTICLES.items()]
    for r in results:
        print(f"{r['slug']:35s} {r['status']:8s}  Frage:{r.get('question_added')}  Sub:{r.get('comments_sub_replaced')}")
    updated = sum(1 for r in results if r["status"] == "updated")
    print(f"\n{updated} von {len(results)} Artikeln aktualisiert.")

if __name__ == "__main__":
    main()
