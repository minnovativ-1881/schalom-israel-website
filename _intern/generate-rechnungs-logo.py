"""
Schalom Israel – Rechnungs-Logo
================================
Erzeugt ein 640x500 Logo für Rechnungen (transparenter Hintergrund).

Aufruf:
    python generate-rechnungs-logo.py

Ergebnis:
    bilder/rechnungs-logo.png

Design:
    - Transparenter Hintergrund (für Druck/PDF auf jedem Untergrund)
    - "Schalom Israel" zentriert, Navy, Playfair Display
    - Gold-Akzentlinie unter dem Schriftzug
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

SCRIPT_DIR = Path(__file__).parent
SITE_DIR   = SCRIPT_DIR.parent
FONT_PATH  = Path(r"C:\_timon-claude\recources\Playfair_Display\PlayfairDisplay-VariableFont_wght.ttf")

W, H = 640, 500
NAVY  = (13,  30,  53, 255)
GOLD  = (200, 169,  98, 255)


def main():
    img  = Image.new("RGBA", (W, H), (0, 0, 0, 0))  # transparent
    draw = ImageDraw.Draw(img)

    font = ImageFont.truetype(str(FONT_PATH), size=80)
    try:
        font.set_variation_by_axes([600])
    except Exception:
        pass

    text = "Schalom Israel"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    text_x = (W - text_w) // 2 - bbox[0]
    text_y = (H - text_h) // 2 - bbox[1] - 20

    draw.text((text_x, text_y), text, font=font, fill=NAVY)

    # Gold-Akzentlinie unter dem Text
    line_w = 100
    line_h = 4
    line_x = (W - line_w) // 2
    line_y = (H + text_h) // 2 + 10
    draw.rectangle([line_x, line_y, line_x + line_w, line_y + line_h], fill=GOLD)

    out = SITE_DIR / "bilder" / "rechnungs-logo.png"
    img.save(out, "PNG", optimize=True)
    print(f"Rechnungs-Logo gespeichert: {out}")


if __name__ == "__main__":
    main()
