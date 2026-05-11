# SEO-Baseline & Monats-Exports

Hier liegen die monatlichen CSV-Exports aus Google Search Console.

**Struktur:**

```
seo-baseline/
├── README.md             (diese Datei)
├── 2026-05/              (Baseline-Monat)
│   ├── queries.csv
│   ├── pages.csv
│   ├── countries.csv
│   └── devices.csv
├── 2026-06/
│   └── ...
```

---

## Export-Anleitung (5 Min)

**Frequenz:** Einmal im Monat, am Monatsende.

### Schritt 1: Search Console öffnen
1. https://search.google.com/search-console aufrufen
2. Property `schalomisrael.de` wählen
3. Im linken Menü auf **„Leistung"** klicken

### Schritt 2: Zeitraum einstellen
- Oben den Datums-Filter aufklappen → **„Letzte 28 Tage"** wählen (das ist GSC-Standard)
- Klick auf **„Anwenden"**

### Schritt 3: Vier CSV-Exports machen

Für jeden Tab im unteren Bereich („Suchanfragen", „Seiten", „Länder", „Geräte") jeweils:

1. Tab auswählen
2. Oben rechts auf das **Export-Symbol** (↓ Pfeil) klicken
3. **„Tabellendaten herunterladen"** wählen (NICHT „Diagrammdaten" — wir wollen die Tabelle)
4. Format: **CSV (Tabelle)** wählen
5. Datei wird heruntergeladen

Die vier Dateien:
- `Suchanfragen.csv` → speichern als `queries.csv`
- `Seiten.csv` → speichern als `pages.csv`
- `Länder.csv` → speichern als `countries.csv`
- `Geräte.csv` → speichern als `devices.csv`

### Schritt 4: Ablegen
Alle vier CSV-Dateien in einen neuen Unterordner `seo-baseline/YYYY-MM/`:
- Für den Baseline-Export (Stichtag heute): `seo-baseline/2026-05/`
- Folge-Monate analog: `seo-baseline/2026-06/`, `seo-baseline/2026-07/`, ...

### Schritt 5: Claude bitten, auszuwerten
„Schau dir den GSC-Export in `seo-baseline/2026-05/` an und füll die Baseline in `seo-log.md` aus." (oder analog für den jeweiligen Monat).

---

## Was Claude aus den CSVs zieht

- **queries.csv:** Top-5-Queries (nach Klicks), Top-5-Verlierer (hohe Impressionen, niedrige CTR), neue Queries
- **pages.csv:** Top-5-Seiten, Performance pro Hebel-Artikel
- **countries.csv:** DACH-Anteil (DE/AT/CH zusammen), wo Traffic herkommt
- **devices.csv:** Mobile/Desktop/Tablet-Mix (sollte stark Mobile-lastig sein)

Daraus baut Claude die Monats-Tabelle in `seo-log.md` und gibt Top-3-Aktionen für den Folgemonat.

---

## Datenschutz

Diese CSVs enthalten **keine** Nutzerdaten — nur aggregierte Such-Statistiken. Sicher in das Repo committbar.
