"""
Erzeugt drei Cover-Varianten für das Lead-Magnet "7 übersehene Bibelverse".

Output (alle 1200×1200 webp, Quality 90):
  bilder/freebie/v1-sieben.webp        — die "7" als großes Playfair-Italic
  bilder/freebie/v2-lichtpunkte.webp   — vertikaler Lichtstrahl mit 7 Punkten
  bilder/freebie/v3-sajin.webp         — hebräisches ז (Sajin = Buchstabe + Zahlenwert 7)

Nutzung:
    python generate-freebie-covers.py
"""

import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ── Pfade ──────────────────────────────────────────────────────────────────
SCRIPT_DIR  = Path(__file__).parent
SITE_DIR    = SCRIPT_DIR.parent
OUT_DIR     = SITE_DIR / "bilder" / "freebie"
OUT_DIR.mkdir(parents=True, exist_ok=True)

FONT_PLAYFAIR_REG = Path(r"C:\_timon-claude\recources\Playfair_Display\PlayfairDisplay-VariableFont_wght.ttf")
FONT_PLAYFAIR_ITA = Path(r"C:\_timon-claude\recources\Playfair_Display\PlayfairDisplay-Italic-VariableFont_wght.ttf")
FONT_ALEF_BOLD    = Path(r"C:\_timon-claude\recources\Alef\Alef-Bold.ttf")
FONT_INTER_FALLBK = Path(r"C:\Windows\Fonts\segoeui.ttf")

# ── Farben ─────────────────────────────────────────────────────────────────
NAVY        = (13,  30,  53)        # #0d1e35
NAVY_DARK   = (8,   20,  40)        # tiefer Navy für Gradient
CREAM       = (245, 240, 228)       # #f5f0e4
GOLD        = (200, 169,  98)       # #c8a962
GOLD_LIGHT  = (223, 192, 122)       # var(--gold-light)
BORDER_FAINT= (245, 240, 228, 90)   # cream, sehr leicht

SIZE        = 1200
MARGIN      = 48


# ── Helpers ────────────────────────────────────────────────────────────────

def load_font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size=size)


def make_navy_gradient() -> Image.Image:
    """Navy-Gradient von oben (heller) nach unten (dunkler) — gibt ein wenig Tiefe."""
    img = Image.new("RGB", (SIZE, SIZE), NAVY)
    draw = ImageDraw.Draw(img)
    for y in range(SIZE):
        # interpolate from NAVY (top) to NAVY_DARK (bottom)
        t = y / SIZE
        r = int(NAVY[0] * (1 - t) + NAVY_DARK[0] * t)
        g = int(NAVY[1] * (1 - t) + NAVY_DARK[1] * t)
        b = int(NAVY[2] * (1 - t) + NAVY_DARK[2] * t)
        draw.line([(0, y), (SIZE, y)], fill=(r, g, b))
    return img


def add_inner_border(img: Image.Image, inset: int = 36, width: int = 2):
    """Cream-Innenrahmen wie auf den Share-Bildern."""
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rectangle(
        [inset, inset, SIZE - inset, SIZE - inset],
        outline=BORDER_FAINT,
        width=width,
    )
    img.paste(overlay, (0, 0), overlay)


def text_size(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> tuple:
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def draw_centered(draw, text, font, y, fill, letter_spacing: int = 0):
    """Zeichnet Text horizontal zentriert. Optional mit Letter-Spacing (in px)."""
    if letter_spacing == 0:
        w, _ = text_size(draw, text, font)
        x = (SIZE - w) // 2
        draw.text((x, y), text, fill=fill, font=font)
        return
    # Mit Letter-Spacing: jedes Zeichen einzeln
    widths = []
    for ch in text:
        widths.append(text_size(draw, ch, font)[0])
    total = sum(widths) + letter_spacing * (len(text) - 1)
    x = (SIZE - total) // 2
    for i, ch in enumerate(text):
        draw.text((x, y), ch, fill=fill, font=font)
        x += widths[i] + letter_spacing


def draw_eyebrow(draw, text, y):
    """Eyebrow-Text wie auf den Share-Bildern."""
    f = load_font(FONT_INTER_FALLBK, 22)
    draw_centered(draw, text.upper(), f, y, GOLD, letter_spacing=8)


def draw_gold_line(draw, y, width=80, height=3):
    """Mittige Gold-Linie."""
    x = (SIZE - width) // 2
    draw.rectangle([x, y, x + width, y + height], fill=GOLD)


def draw_brand(draw, y=None):
    """„Schalom Israel" Brand-Stempel unten."""
    if y is None:
        y = SIZE - 120
    f = load_font(FONT_PLAYFAIR_ITA, 28)
    draw_centered(draw, "Schalom Israel", f, y, GOLD)


def save_webp(img: Image.Image, name: str, quality: int = 90):
    out = OUT_DIR / name
    img.save(out, format="WEBP", quality=quality, method=6)
    print(f"  -> {out}")


# ── Variante 1: Die "7" ────────────────────────────────────────────────────

def variante_1_sieben():
    img = make_navy_gradient()
    draw = ImageDraw.Draw(img)
    add_inner_border(img)

    # Eyebrow
    draw_eyebrow(draw, "Kostenlose E-Mail-Serie", 140)

    # Italic „7" — Playfair, zentriert. Kleiner als vorher, klar abgesetzt.
    f7 = load_font(FONT_PLAYFAIR_ITA, 440)
    w7, h7 = text_size(draw, "7", f7)
    x7 = (SIZE - w7) // 2
    y7 = 230
    # Subtle dropshadow für Tiefe
    shadow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.text((x7 + 6, y7 + 8), "7", fill=(0, 0, 0, 130), font=f7)
    shadow = shadow.filter(ImageFilter.GaussianBlur(8))
    img.paste(shadow, (0, 0), shadow)
    # Gold-7
    draw.text((x7, y7), "7", fill=GOLD, font=f7)

    # Gold-Linie unterhalb der 7
    draw_gold_line(draw, 770, width=120)

    # Title
    f_title = load_font(FONT_PLAYFAIR_REG, 56)
    draw_centered(draw, "übersehene Bibelverse", f_title, 810, CREAM)

    # Subtitle
    f_sub = load_font(FONT_PLAYFAIR_ITA, 30)
    draw_centered(draw, "mit gewaltiger Wirkung in deinem Alltag", f_sub, 890, CREAM)

    # Brand
    draw_brand(draw, y=SIZE - 90)

    save_webp(img, "v1-sieben.webp")
    return img


# ── Variante 2: 7 Lichtpunkte / vertikaler Lichtstrahl ─────────────────────

def variante_2_lichtpunkte():
    img = make_navy_gradient()
    draw = ImageDraw.Draw(img)
    add_inner_border(img)

    # Eyebrow
    draw_eyebrow(draw, "Kostenlose E-Mail-Serie", 140)

    # 7 Lichtpunkte als horizontale Reihe (Menora-Anspielung) — visuell luftig
    cy = 360
    cx = SIZE // 2
    spacing = 95
    n = 7
    total_w = (n - 1) * spacing
    start_x = cx - total_w // 2

    # Subtiler horizontaler Lichtstreifen als Untergrund
    streifen = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    sd2 = ImageDraw.Draw(streifen)
    for h, alpha in [(140, 22), (70, 45), (24, 90)]:
        sd2.rectangle(
            [start_x - 60, cy - h // 2, start_x + total_w + 60, cy + h // 2],
            fill=(GOLD[0], GOLD[1], GOLD[2], alpha),
        )
    streifen = streifen.filter(ImageFilter.GaussianBlur(22))
    img.paste(streifen, (0, 0), streifen)

    # Punkte mit Glow
    for i in range(n):
        px = start_x + i * spacing
        for radius, alpha in [(38, 50), (22, 120), (10, 230)]:
            glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
            gd = ImageDraw.Draw(glow)
            gd.ellipse(
                [px - radius, cy - radius, px + radius, cy + radius],
                fill=(GOLD_LIGHT[0], GOLD_LIGHT[1], GOLD_LIGHT[2], alpha),
            )
            glow = glow.filter(ImageFilter.GaussianBlur(7 if radius > 20 else 3))
            img.paste(glow, (0, 0), glow)
        # Heller Kern
        d2 = ImageDraw.Draw(img)
        d2.ellipse([px - 5, cy - 5, px + 5, cy + 5], fill=CREAM)

    # Gold-Linie als Trenner unter Lichtreihe
    draw_gold_line(draw, cy + 130, width=120)

    # Title
    f_title = load_font(FONT_PLAYFAIR_REG, 60)
    draw_centered(draw, "Sieben übersehene", f_title, cy + 175, CREAM)
    draw_centered(draw, "Bibelverse", f_title, cy + 250, CREAM)

    # Subtitle
    f_sub = load_font(FONT_PLAYFAIR_ITA, 28)
    draw_centered(draw, "mit gewaltiger Wirkung in deinem Alltag", f_sub, cy + 330, CREAM)

    # Brand unten
    draw_brand(draw, y=SIZE - 90)

    save_webp(img, "v2-lichtpunkte.webp")
    return img


# ── Variante 3: Hebräisches ז (Sajin = 7. Buchstabe & Zahlenwert 7) ────────

def variante_3_sajin():
    img = make_navy_gradient()
    draw = ImageDraw.Draw(img)
    add_inner_border(img)

    # Eyebrow
    draw_eyebrow(draw, "Kostenlose E-Mail-Serie", 130)

    # Riesiges ז in Alef-Bold (gold)
    f_heb = load_font(FONT_ALEF_BOLD, 540)
    w_heb, h_heb = text_size(draw, "ז", f_heb)
    x_heb = (SIZE - w_heb) // 2
    y_heb = 220
    # Drop-Shadow
    shadow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.text((x_heb + 6, y_heb + 8), "ז", fill=(0, 0, 0, 140), font=f_heb)
    shadow = shadow.filter(ImageFilter.GaussianBlur(8))
    img.paste(shadow, (0, 0), shadow)
    draw.text((x_heb, y_heb), "ז", fill=GOLD, font=f_heb)

    # Romanisierung als kleiner Zusatz
    f_translit = load_font(FONT_PLAYFAIR_ITA, 26)
    draw_centered(draw, "Sajin · sieben", f_translit, 770, CREAM)

    # Gold-Linie
    draw_gold_line(draw, 815, width=120)

    # Title
    f_title = load_font(FONT_PLAYFAIR_REG, 56)
    draw_centered(draw, "Sieben übersehene Bibelverse", f_title, 850, CREAM)

    # Subtitle
    f_sub = load_font(FONT_PLAYFAIR_ITA, 28)
    draw_centered(draw, "die anders leben lassen", f_sub, 925, CREAM)

    # Brand
    draw_brand(draw, y=SIZE - 90)

    save_webp(img, "v3-sajin.webp")
    return img


def main():
    print("Erzeuge Freebie-Cover-Varianten ...")
    variante_1_sieben()
    variante_2_lichtpunkte()
    variante_3_sajin()
    print("Fertig.")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
