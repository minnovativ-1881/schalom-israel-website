"""
Schalom Israel – Digistore24 Header
====================================
Erzeugt ein 1000x200 Header-Banner für die Digistore24-Verkaufsseite.

Aufruf:
    python generate-digistore-header.py

Ergebnis:
    bilder/digistore-header.png

Design:
    - Navy-Hintergrund
    - "Schalom Israel" zentriert, Cream, Playfair Display
    - Gold-Linie als Akzent unter dem Text
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

SCRIPT_DIR = Path(__file__).parent
SITE_DIR   = SCRIPT_DIR.parent
FONT_PATH  = Path(r"C:\_timon-claude\recources\Playfair_Display\PlayfairDisplay-VariableFont_wght.ttf")

W, H = 1000, 200
NAVY  = (13,  30,  53)
CREAM = (245, 240, 228)
GOLD  = (200, 169,  98)


def main():
    img  = Image.new("RGB", (W, H), NAVY)
    draw = ImageDraw.Draw(img)

    font = ImageFont.truetype(str(FONT_PATH), size=78)
    # Variable-Font Gewicht (Semi-Bold)
    try:
        font.set_variation_by_axes([600])
    except Exception:
        pass

    text = "Schalom Israel"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    text_x = (W - text_w) // 2 - bbox[0]
    text_y = (H - text_h) // 2 - bbox[1] - 12

    draw.text((text_x, text_y), text, font=font, fill=CREAM)

    # Gold-Akzentlinie unter dem Text
    line_w = 80
    line_h = 3
    line_x = (W - line_w) // 2
    line_y = (H + text_h) // 2 + 12
    draw.rectangle([line_x, line_y, line_x + line_w, line_y + line_h], fill=GOLD)

    out = SITE_DIR / "bilder" / "digistore-header.png"
    img.save(out, "PNG", optimize=True)
    print(f"Header gespeichert: {out}")


if __name__ == "__main__":
    main()
