# SOP: Neuen Artikel auf Schalom Israel veröffentlichen

Jedes Mal, wenn ein neuer Artikel erscheint, diese Schritte in dieser Reihenfolge abarbeiten.

---

## Schritt 1 – Ordner und Dateien anlegen

```
schalom-israel-website/
  SLUG/
    index.html        ← aus _intern/artikel-vorlage.html kopieren
  warten-geschenk/    ← Beispiel für bestehenden Artikel
```

- `SLUG` = URL-freundlicher Name, nur Kleinbuchstaben und Bindestriche (z.B. `gebet-und-stille`)
- Vorlage: `_intern/artikel-vorlage.html` kopieren und alle `SLUG`/`ARTIKELTITEL`/`BILDNAME` ersetzen

---

## Schritt 2 – Hintergrundbild vorbereiten

1. Bild in `bilder/` ablegen (z.B. `Schlaom-Israel-24.jpg`)
2. Zu WebP konvertieren (Skill: `bild-optimierung`):
   ```python
   to_webp('bilder/Schlaom-Israel-24.jpg', quality=80, max_width=1400)
   ```
3. JPG-Original kann gelöscht oder archiviert werden
4. Im `index.html`: `background-image: url('../bilder/Schlaom-Israel-24.webp')`

---

## Schritt 3 – Share-Bild generieren

```bash
cd schalom-israel-website/_intern
python generate-share-image.py "Artikeltitel" slug-des-artikels
# Ergebnis: bilder/share/SLUG.webp
```

Optional: anderes Hintergrundbild als drittes Argument übergeben:
```bash
python generate-share-image.py "Artikeltitel" slug ../bilder/Schlaom-Israel-12.webp
```

Danach im Artikel-HTML an zwei Stellen eintragen:
1. `<meta property="og:image" content="https://www.schalomisrael.de/bilder/share/SLUG.webp">`
2. `<figure class="article-share-img"><img src="/bilder/share/SLUG.webp" ...></figure>` – nach dem 2.–3. Absatz

Design (automatisch):
- Quadratisch, 1200×1200
- Navy-Overlay + Cream-Rahmen + Gold-Linie + Titel zentriert + „Schalom Israel" unten
- Schriftart: `C:\_timon-claude\recources\Playfair_Display\PlayfairDisplay-VariableFont_wght.ttf`

---

## Schritt 4 – article-vorlage.html befüllen

Pflicht-Felder ersetzen:
- `SLUG` → URL-Slug (z.B. `gebet-und-stille`)
- `ARTIKELTITEL` → Vollständiger Titel
- `KURZBESCHREIBUNG` → 1-2 Sätze, max. 155 Zeichen (für SEO + OG)
- `BILDNAME` → z.B. `Schlaom-Israel-24.webp`

**Artikel-Reihenfolge (nie ändern):**
1. Nav
2. Hero (Hintergrundbild)
3. `<main class="article-main">` – Artikeltext (cremefarbener Hintergrund)
   - Share-Bild nach dem 2.–3. Absatz (`<figure class="article-share-img">`)
   - **NIEMALS** Share-Bild innerhalb eines `<blockquote>`
   - Inline Opt-in Teaser nach ca. der Hälfte des Textes (`.inline-optin`, navy-light Hintergrund)
4. Share-Section – navy, bleibt dunkel
5. Author-Box (Micha Levzion) – **heller Hintergrund** (cream), Text dunkel
6. Article-Optin „Kostenlos" – navy-light, Button öffnet Modal
7. Related Articles „Das könnte dich auch interessieren" – **heller Hintergrund** (cream), Text dunkel
8. Kommentare „Deine Gedanken" – **navy-light** (blau)
9. Footer
10. Opt-in Modal (direkt vor `</body>`)

**Inline Opt-in Teaser – Aufbau:**
```html
<div class="inline-optin">
  <p class="inline-optin-label">Kostenlos</p>
  <p class="inline-optin-title">7 übersehene Bibelverse mit gewaltiger Wirkung in deinem Alltag</p>
  <p class="inline-optin-sub">Mutige Worte, die dir erlauben, anders zu leben, als alle es von dir erwarten.</p>
  <button onclick="openOptinModal()" class="btn btn--gold">Ja, ich möchte die 7 Verse sehen</button>
</div>
```
Abstände (CSS): label → 1rem → title → 1.1rem → sub → 1.75rem → Button

---

## Schritt 5 – Related Articles befüllen

Im `<section class="related-articles">`: 3 thematisch passende Artikel aus der Liste eintragen.

**Thematische Gruppen:**
- **Josef-Geschichten:** zweite-chance, ein-verlorener-bruder, wachstum-durch-schwierigkeiten, wichtige-aufgaben, der-wendepunkt, ungeklaerte-schuld
- **Abraham/Patriarchen:** unerfuellte-wuensche, rebekka-isaak-segen, sei-wie-ephraim-und-menasche, gott-zweifel
- **Warten/Geistliches Wachstum:** warten-geschenk, bestaendigkeit
- **Torah/Bibel-Studium:** achtzehn-mal-und-dann, glaube-und-irrtum

---

## Schritt 6 – Blog-Index aktualisieren

In `blog/index.html`: Neuen Artikel als **ERSTE `<article class="article-card">` direkt nach `<div class="container">` von `<section class="articles blog-grid">`** einfügen – also Platz 1 der Liste.

**Nie** an einer beliebigen anderen Karte ankern – immer direkt am Container-Öffnungstag. Sonst rutscht der neue Artikel auf Platz 2.

**Bild:** Immer das Share-Bild aus `bilder/share/SLUG.webp` verwenden (nicht das Hero-Hintergrundbild). Der Pfad im Blog-Index ist `../bilder/share/SLUG.webp`.

**data-Attribute:**
- `data-parasha="slug"` + `data-book="buchslug"` falls einer Parascha zugeordnet
- `data-book="omer"` für Omer-Wochen-Artikel (ohne Parascha)
- Beides leer (`data-parasha="" data-book=""`) nur wenn weder Parascha noch thematische Kategorie passt

```html
<article class="article-card" data-parasha="..." data-book="...">
  <a href="/SLUG/" class="article-image-link">
    <img src="../bilder/share/SLUG.webp" alt="ARTIKELTITEL" class="article-image">
  </a>
  <div class="article-body">
    <p class="article-author">Micha Levzion</p>
    <h3 class="article-title"><a href="/SLUG/">ARTIKELTITEL</a></h3>
    <p class="article-excerpt">KURZTEXT (2-3 Sätze)</p>
    <a href="/SLUG/" class="btn btn--outline">Beitrag lesen</a>
  </div>
</article>
```

---

## Schritt 7 – Homepage aktualisieren

In `index.html`: Neuen Artikel als **ERSTE `<article class="article-card">`** in `<section class="articles">` einfügen. Letzten (dritten) Artikel entfernen – nur die 3 neuesten bleiben sichtbar.

**Bild:** `bilder/share/SLUG.webp` (Pfad auf der Homepage: `bilder/share/SLUG.webp`).

---

## Schritt 8 – Sitemap aktualisieren

In `sitemap.xml`: Neue URL hinzufügen:
```xml
<url>
  <loc>https://schalom-israel.de/SLUG/</loc>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

---

## Schritt 9 – Commit & Push

```bash
git add -A
git commit -m "post: ARTIKELTITEL"
git push origin master
```

Vercel deployed automatisch nach dem Push.

---

## Checkliste (schnelle Übersicht)

- [ ] Ordner `SLUG/` mit `index.html` angelegt
- [ ] Hintergrundbild als WebP in `bilder/`
- [ ] Share-Bild als WebP in `bilder/share/`
- [ ] Umami-Tracking-Script im `<head>` vorhanden (kommt automatisch aus der Vorlage)
- [ ] `og:image`, `og:title`, `og:description`, `canonical` gesetzt
- [ ] Share-Bild im Artikeltext (nicht im Blockquote!)
- [ ] Inline Opt-in Teaser vorhanden
- [ ] Related Articles (3 Artikel) eingetragen
- [ ] Blog-Index aktualisiert (neuer Artikel oben)
- [ ] Homepage aktualisiert (neuer Artikel oben, max. 3 sichtbar)
- [ ] Sitemap aktualisiert
- [ ] Gepusht
