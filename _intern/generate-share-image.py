"""
Schalom Israel – Share Image Generator
=======================================
Erzeugt das quadratische Social-Share-Bild (1200×1200 px) für einen Artikel.

Aufruf:
    python generate-share-image.py "Artikeltitel hier" slug-des-artikels

Ergebnis:
    bilder/share/<slug>.webp  (quality 82)

Design:
    - Hintergrundbild: bilder/Schlaom-Israel-10.webp (Standard, austauschbar)
    - Navy-Overlay (60% Deckkraft)
    - Rahmen (cream, 2px, 36px eingerückt)
    - Gold-Linie (60px breit, 3px hoch) zentriert über dem Titel
    - Titel: Playfair Display, cream, zentriert
    - „Schalom Israel": unten zentriert, gold, klein
"""

import sys
import os
import textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# ── Pfade ──────────────────────────────────────────────────────────────────
SCRIPT_DIR   = Path(__file__).parent
SITE_DIR     = SCRIPT_DIR.parent
FONT_PATH    = Path(r"C:\_timon-claude\recources\Playfair_Display\PlayfairDisplay-VariableFont_wght.ttf")
FONT_ITALIC  = Path(r"C:\_timon-claude\recources\Playfair_Display\PlayfairDisplay-Italic-VariableFont_wght.ttf")
BG_DEFAULT   = SITE_DIR / "bilder" / "Schlaom-Israel-10.webp"
SHARE_DIR    = SITE_DIR / "bilder" / "share"

# ── Farben ─────────────────────────────────────────────────────────────────
NAVY         = (13,  30,  53)       # #0d1e35
OVERLAY      = (13,  30,  53, 153)  # navy, 60% Deckkraft
CREAM        = (245, 240, 228)      # #f5f0e4
GOLD         = (200, 169,  98)      # #c8a962
BORDER       = (245, 240, 228, 180) # cream, leicht transparent

# ── Maße ───────────────────────────────────────────────────────────────────
SIZE         = 1200
MARGIN       = 36       # Rahmen-Einrückung
LINE_W       = 60       # Breite der Gold-Linie
LINE_H       = 3


def generate(title: str, slug: str, bg_path: Path = BG_DEFAULT):
    # Hintergrundbild laden und auf 1200×1200 zuschneiden
    bg = Image.open(bg_path).convert("RGB")
    bg_w, bg_h = bg.size
    scale = SIZE / min(bg_w, bg_h)
    new_w = int(bg_w * scale)
    new_h = int(bg_h * scale)
    bg = bg.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - SIZE) // 2
    top  = (new_h - SIZE) // 2
    bg   = bg.crop((left, top, left + SIZE, top + SIZE))

    # Navy-Overlay
    overlay = Image.new("RGBA", (SIZE, SIZE), OVERLAY)
    img = bg.convert("RGBA")
    img = Image.alpha_composite(img, overlay)

    draw = ImageDraw.Draw(img)

    # Rahmen
    draw.rectangle(
        [MARGIN, MARGIN, SIZE - MARGIN, SIZE - MARGIN],
        outline=BORDER,
        width=2
    )

    # Schriften laden
    try:
        font_title = ImageFont.truetype(str(FONT_PATH), size=80)
        font_brand = ImageFont.truetype(str(FONT_PATH), size=32)
    except Exception as e:
        print(f"Schriftart nicht gefunden: {e}")
        font_title = ImageFont.load_default()
        font_brand = font_title

    # Titel umbrechen (max. ~18 Zeichen pro Zeile für 80px)
    lines = textwrap.wrap(title, width=18)

    # Gesamt-Texthöhe berechnen
    line_height = 96
    total_text_h = len(lines) * line_height

    # Vertikale Mitte + Gold-Linie darüber
    center_y = SIZE // 2
    gold_line_y = center_y - (total_text_h // 2) - 40

    # Gold-Linie
    line_x = (SIZE - LINE_W) // 2
    draw.rectangle(
        [line_x, gold_line_y, line_x + LINE_W, gold_line_y + LINE_H],
        fill=GOLD
    )

    # Titelzeilen
    text_y = gold_line_y + LINE_H + 28
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font_title)
        text_w = bbox[2] - bbox[0]
        draw.text(((SIZE - text_w) // 2, text_y), line, font=font_title, fill=CREAM)
        text_y += line_height

    # Branding unten
    brand = "Schalom Israel"
    bbox = draw.textbbox((0, 0), brand, font=font_brand)
    brand_w = bbox[2] - bbox[0]
    draw.text(((SIZE - brand_w) // 2, SIZE - MARGIN - 64), brand, font=font_brand, fill=GOLD)

    # Speichern
    SHARE_DIR.mkdir(parents=True, exist_ok=True)
    out_path = SHARE_DIR / f"{slug}.webp"
    img.convert("RGB").save(str(out_path), "WEBP", quality=82)
    print(f"Share-Bild gespeichert: {out_path}")
    return out_path


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Aufruf: python generate-share-image.py \"Titel\" slug")
        print("Beispiel: python generate-share-image.py \"Was kommt nach der Befreiung?\" was-kommt-nach-der-befreiung")
        sys.exit(1)
    title = sys.argv[1]
    slug  = sys.argv[2]
    bg    = Path(sys.argv[3]) if len(sys.argv) > 3 else BG_DEFAULT
    generate(title, slug, bg)
