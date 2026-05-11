# SEO-Log Schalom Israel

> Monatliches Tracking von Google Search Console und Hebel-Artikel-Performance.
> Gestartet: 2026-05-11 nach SEO-Audit (Plan: `C:\Users\pc\.claude\plans\mache-einen-seo-audit-f-r-expressive-dove.md`)

---

## Wie dieses Log zu nutzen ist

**Rhythmus:** Einmal pro Monat, am Monatsende, ca. 30 Min.

**Schritt 1 — Export aus Search Console (5 Min):**
Anleitung siehe `seo-baseline/README.md`. CSV-Dateien legst du unter `seo-baseline/YYYY-MM/`.

**Schritt 2 — Diesen Log ausfüllen (15 Min):**
Neuen Monats-Abschnitt unten anhängen. Vorlage am Ende der Datei.

**Schritt 3 — Top-3-Aktionen ableiten (10 Min):**
Pro Monat 1-3 konkrete Verbesserungen aus den Daten ziehen. Beispiele:
- „Query X hat 200 Impressionen aber CTR 0,5% → Title/Meta auf Seite Y nachschärfen"
- „Seite Z rankt auf Pos 8 für gute Query → bessere interne Links setzen"
- „Query A taucht neu auf → entsprechenden Hebel-Artikel schreiben"

---

## Baseline (Start-Stand vor Phase 1)

**Stichtag:** 2026-05-11
**Zeitraum der Daten:** Letzte 16 Monate (GSC-Export, kein 28-Tage-Filter)
**CSVs:** `seo-baseline/2026-05/`

| Kennzahl | Wert |
|---|---|
| Klicks gesamt (16 Monate) | **16** |
| Impressionen gesamt (16 Monate) | **291** |
| Durchschn. CTR | **5,5 %** |
| Durchschn. Position (DE) | **22** |
| Mobile-Anteil Klicks | 13/16 (81 %) |
| DACH-Anteil Impressionen | 256/291 (88 %) |
| Newsletter-Abonnenten (Stand 2026-05-11) | _bitte eintragen_ |
| Anzahl indexierter URLs | ~74 laut Sitemap (GSC-Anzeige bitte nachtragen) |

**Ehrliche Einordnung:** Sehr niedrige Basis. 16 Klicks in 16 Monaten heißt ~1 Klick/Monat. Aber: die Daten erzählen drei klare Geschichten, die Phase 1 direkt validieren.

### Heimliche Hits (CTR > 20 % auf Top-Positionen)

| Seite | Klicks | Impr | CTR | Pos | Was das heißt |
|---|---:|---:|---:|---:|---|
| `/gott-zweifel/` | 3 | 10 | **30 %** | 5,7 | Top-Title-Magnet, sobald Position vorne |
| `/zweite-chance/` | 3 | 13 | **23 %** | 5,6 | Dito |
| `/der-wendepunkt/` | 1 | 5 | 20 % | 5,8 | Dito |
| `/bestaendigkeit/` | 1 | 8 | 12,5 % | 7,6 | Dito |

→ Schlussfolgerung: Wenn deine Artikel auf Seite 1 stehen, **funktionieren** die Headlines. Das Problem ist nicht die SERP-Vorschau, sondern dass diese Themen kaum gesucht werden. Hebel-Artikel mit höherem Such-Volumen sind genau der richtige Schritt.

### Top-5 Seiten nach Klicks

1. `/` (Home) — 11 Klicks / 135 Impr / CTR 8,2 % / Pos 35,8
2. `/impressum/` — 3 Klicks / 57 Impr / CTR 5,3 % / Pos 9 *(Brand-Suchen)*
3. `/zweite-chance/` — 3 / 13 / 23 % / 5,6
4. `/gott-zweifel/` — 3 / 10 / 30 % / 5,7
5. `/rebekka-isaak-segen/` — 2 / 69 / 2,9 % / 11

### Top-Queries (nach Impressionen)

| Query | Impr | Pos | Anmerkung |
|---|---:|---:|---|
| schalom | 41 | 76 | Brand-Konkurrenz mit Hebräisch-Wörterbüchern, schwer |
| shalom israel | 12 | 39 | Halbe Position-1-Seite weg |
| schalom israel | 7 | **5,1** | **Brand-Such läuft, Position 5 — Pflege halten** |
| auge um auge zahn bibel | 2 | 61 | Long-Tail-Cluster (s.u.) |
| isaak und esau | 1 | 34 | Long-Tail-Bibel-Suche |

### Die größte Chance: „Auge um Auge"-Long-Tail

In den Top-30-Queries tauchen **25+ Varianten** rund um „Auge um Auge" / „Zahn um Zahn" auf — jede mit 1-2 Impressionen, alle auf Position 50-100. Summe: ca. 50 Impressionen, 0 Klicks. Das heißt:

- Google **weiß**, dass dein Artikel zum Thema ist (sonst wäre er gar nicht in den Ergebnissen)
- Aber er rankt zu schlecht → wer „auge um auge bibel" sucht, sieht ihn nicht auf Seite 1
- **Wenn du diesen einen Artikel mit besserer Headline + interner Verlinkung + Hebel-Artikel-Status auf Pos 10-20 ziehst, gewinnst du das ganze Cluster auf einmal.**

Genau dafür haben wir den Artikel als Top-10 #8 markiert. Headline-Schärfung mit `schalom-israel-titel` ist der nächste Schritt.

### Verlierer mit Optimierungspotenzial (hohe Impr, niedrige CTR)

| Seite | Impr | Klicks | CTR | Pos | Aktion |
|---|---:|---:|---:|---:|---|
| `/rebekka-isaak-segen/` | 69 | 2 | 2,9 % | 11 | Title schärfen, fast auf Seite 1 |
| `/glaube-und-irrtum/` | 30 | 0 | 0 % | 7,7 | Title/Meta schreit nicht, dabei Pos 7,7 ! |
| `/auge-um-auge/` | 23 | 0 | 0 % | 76 | Komplettes Re-Launch (Headline + Content + Links) |

### Anomalien / Aufräum-Bedarf (alte WordPress-Reste im Index)

- `/sample-page/` (3 Impr) — WordPress-Default-Seite
- `/2025/02/03/hello-world/` (3 Impr) — WordPress-Default-Post
- `/en/schalom-israel-english/` (1 Impr) — alte englische Variante
- `/category/wochenlesung/` und Untervarianten — alte WP-Kategorien

→ Diese URLs sollten 410 oder 301-redirected werden (siehe Aktion 2 unten).

---

## Top-3-Aktionen abgeleitet aus Baseline (für 2026-05/06)

1. **„Auge um Auge"-Artikel als Hebel-Artikel #8 relaunchen** — Headline durch Skill `schalom-israel-titel` schärfen (z.B. „Auge um Auge — warum dein Lehrer falsch lag"), Meta-Description optimieren, alle Hebel-Artikel der Top-10 intern darauf verlinken. Ziel: Long-Tail-Cluster auf Seite 1-2 ziehen (aktuell Pos 76).
2. **Alte WordPress-URLs aufräumen** — In `vercel.json` 301-Redirects für `/sample-page/`, `/2025/02/03/hello-world/`, `/en/schalom-israel-english/` und alle `/category/*`-Pfade ergänzen → auf passendes Pendant umleiten oder `/` als Fallback. Reduziert „Müll im Index" und stärkt die guten Seiten.
3. **`/glaube-und-irrtum/` und `/rebekka-isaak-segen/` Title/Meta nachschärfen** — Beide ranken bereits Pos 7-11 mit über 30/69 Impressionen, aber CTR ist nahe 0. Mit besseren SERP-Snippets sofortiger Klick-Gewinn möglich, ohne neuen Artikel zu schreiben.

---

## Monats-Reviews

<!-- Neuester Eintrag unten anfügen -->

### Vorlage (kopieren und ausfüllen)

```
### YYYY-MM (Monatsname)

**Kennzahlen (letzte 28 Tage):**
| Kennzahl | Wert | vs. Vormonat | vs. Baseline |
|---|---:|---:|---:|
| Klicks | | | |
| Impressionen | | | |
| CTR | | | |
| Pos | | | |
| Newsletter-Abos | | | |

**Top-5-Queries (Klicks):**
1. 
2. 
3. 
4. 
5. 

**Neu in Top-20 (Queries, die letzten Monat noch nicht da waren):**
- 

**Verlierer (hohe Impressionen, niedrige CTR — Title/Meta-Kandidaten):**
- 

**Hebel-Artikel diesen Monat live:**
- 

**Top-3-Aktionen für nächsten Monat:**
1. 
2. 
3. 

**Anmerkungen:**

```

---

## Erfolgs-Kriterien (Plan-Bezug)

Aus dem Plan-File `mache-einen-seo-audit-f-r-expressive-dove.md`, Erfolg Phase 1 (31.07.2026):
- [ ] 10+ teilen-würdige Hebel-Artikel veröffentlicht
- [ ] Freitag-Parascha-Rhythmus ungebrochen weitergelaufen
- [ ] GSC-Klicks/Monat ≥ 3× Baseline
- [ ] Newsletter-Abonnenten ≥ 200
- [ ] Mindestens 3 Hebel-Artikel auf Seite 1 für ihren Haupt-Keyword
- [ ] Erste organisch geteilte Artikel (Referral-Traffic in Umami sichtbar)
