# Or Tora – täglicher Übersetzungs-Ablauf (Automatik)

Ziel: **pro Lauf 2 Kapitel** der zweisprachigen Tora-Lesung übersetzen und live bringen,
vollautomatisch, strikt nach den unten stehenden Kriterien. Kein manuelles Bestätigen nötig,
solange alle Prüf-Gates grün sind. Reihenfolge und Stand stehen in `tora/daten/fortschritt.json`.

Das Repo ist buildfrei (kein npm/Bundler). Alle Tools sind reine Node-Skripte.
Produktion = Branch `master` (Vercel-Auto-Deploy). Git-Identität: `Timon Mann <timon@minnovativ.de>` (NIE gmail).

---

## Ablauf pro Lauf

1. **Stand lesen:** `tora/daten/fortschritt.json` → aktuelles Buch (`buchSlug`, `buchDe`, `sefariaBuch`) und die 2 nächsten Kapitel (`als_naechstes`). Devarim ist fertig und wird nie erneut bearbeitet. Ist ein Buch komplett, das nächste aus `buecher_reihenfolge` beginnen (Kapitel 1).

2. **Paraschah bestimmen & roh sicherstellen:** Jedes Kapitel gehört zu genau einer Paraschah (slug). Existiert `tora/daten/<paraschah-slug>.roh.json` noch nicht, holen:
   - Standard: `node tools/tora-hebraeisch-holen.js <HebcalName> <slug> "<buchDe>"` (holt die ganze Paraschah, Aliyot/Haftara von Hebcal, Hebräisch aus der **gemeinfreien** Quelle).
   - Wird die Paraschah dieses Jahr nur kombiniert/als Feiertag gelesen (Hebcal findet sie nicht einzeln): Hebräisch direkt aus Sefaria per Versbereich holen (siehe „Sefaria-Direkt" unten), Aliyot/Haftara aus einem Hebcal-Jahr, in dem sie einzeln geführt ist. **Masoretische Zählung prüfen** (Eröffnungsvers gegen Erwartung abgleichen).
   - Sonder-Haftara des laufenden Jahres (z. B. Machar Chodesch, Schabbat Schuwa) NICHT übernehmen — die reguläre Haftara der Paraschah setzen.

3. **Zwei-Paraschot-Kapitel:** Enthält ein Kapitel den Übergang zweier Paraschot (z. B. Ki Tavo endet 29,8 / Nizavim beginnt 29,9), das ganze Kapitel in EINEM Durchgang übersetzen und per Vers-`ref` in die beiden Paraschah-Slugs splitten. Der Generator baut die Übergangsbande automatisch.

4. **Token-Datei je Kapitel schreiben:** Aus der roh-Datei je Vers die nummerierten Quellwörter (`ref  (N W):  1|wort 2|wort …`) in eine Textdatei, als verbindliche Vorlage für den Übersetzer.

5. **Übersetzen & ausrichten — INLINE, in EINER durchgehenden Session (WICHTIG!):** Übersetze beide Kapitel selbst, direkt im laufenden Prozess. **Starte KEINE asynchronen Hintergrund-Subagenten (Agent/Task im Hintergrund), deren Ergebnis du dann nicht abwartest** — in einem Automatik-Lauf endet die Session, sobald der Hauptlauf seine Runde beendet, und alles Unfertige in der Wegwerf-Sandbox ist verloren (genau daran ist der erste Lauf 2026-08-13 gescheitert). Der GESAMTE Lauf (Übersetzen → Gegenlesen → Assemblieren → Gates → Deploy → fortschritt.json) muss ohne Unterbrechung in derselben Session durchlaufen. Schreibe je Kapitel die Arbeitsdatei `tora/daten/work/<slug>-kap<N>.json` mit `he`-Chunks (Quellreihenfolge) und `de`-Chunks (natürliche deutsche Reihenfolge, verknüpft über gemeinsame `id`). Format-/Stilreferenz `tora/daten/work/dewarim-kap2.json`.

6. **Selbst-Gegenlesen (Pflicht):** Den deutschen Text jedes Verses laut gegenlesen. Bleibt hebräische Wortstellung stehen (Verb-Subjekt-Inversion, nachgestellte Ergänzungen, Objekt hinter Verb), einen zweiten Pass „nur `de` umsortieren für natürliches Deutsch" machen (he/ids/Wortzahlen bleiben).

7. **Assemblieren:** `node tools/tora-assemblieren.js <slug> <HebcalName>` → stellt Hebräisch byte-genau aus der roh her, großt Satzanfänge, validiert Schema. Bei „PROBLEME"/„SCHEMA-FEHLER" NICHT deployen, Ursache beheben.

8. **Neue Paraschah in den Index seeden (nur beim ersten Kapitel einer Paraschah):**
   `node -e "const g=require('./tools/tora-seite-bauen.js'); g.aktualisiereIndex(require('./tora/daten/<slug>.json'));"`

9. **Buch generieren:** `node tools/tora-seite-bauen.js <buchSlug>` (baut alle Kapitelseiten + Buch-Übersicht + Sitemap + Index).

10. **Prüf-Gates (ALLE müssen grün sein, sonst KEIN Deploy):**
    - `node --test` → 252/252 (bzw. alle) grün.
    - Wortzahl je Vers == N und jede `de-id` ∈ `he-ids` (das prüft der Assemble-Schritt bereits).
    - Keine Google-Fonts: `grep -rl 'fonts.googleapis\|fonts.gstatic' tora/<buchSlug>` == 0.
    - Kein Wort „Schwein": `grep -c Schwein` == 0 (חזיר = „Chasir").
    - Tetragramm entpunktet: keine vokalisierte Form `יְהוָה`/`יְהֹוָה` in den Seiten; bare `יהוה` vorhanden, wo der Name vorkommt.
    - Titel sauber: `<title>Or Tora – <Buch> Kapitel N – Schalom Israel</title>`.

11. **Deploy (nur wenn alle Gates grün):** über detached Worktree aus `origin/master`:
    - `git fetch origin`; `git worktree add --detach <tmp> origin/master`
    - geänderte Daten (`tora/daten/<slug>.json`, `.roh.json`, `index.json`, `fortschritt.json`) in den Worktree kopieren, dort `node tools/tora-seite-bauen.js <buchSlug>` laufen lassen.
    - `git add` (explizite Pfade), committen (Identität s. o.), `git push origin HEAD:master`.
    - Worktree entfernen (Windows: bei Lock `rm -rf` + `git worktree prune`).
    - Live prüfen (200 + Titel) mit `Cache-Control: no-cache`; Vercel braucht 1–3 Min.

12. **Fortschritt & Log aktualisieren:** in `tora/daten/fortschritt.json` `fertige_kapitel` und `als_naechstes` fortschreiben (mit-committen). Kurzer Eintrag ins Second-Brain-Entscheidungslog, falls verfügbar.

---

## KRITERIEN (verbindlich – so haben wir es erarbeitet)

**Quelle & Recht:** Hebräisch NUR aus der gemeinfreien Quelle (Sefaria „Tanach with Ta'amei Hamikra", Codex Leningradensis / tanach.us). NIE die CC-BY-SA-Quelle „Miqra according to the Masorah". So bleibt alles lizenzfrei und das Buch verkaufbar. HE nie von KI tippen lassen — byte-genau aus der roh rekonstruieren (macht `tora-assemblieren.js`).

**Register:** natürliches, flüssiges, modernes Deutsch, sinntreu, saubere Zeichensetzung. **KEINE hebräische Wortstellung** (Nebensätze verb-final, keine Verb-Subjekt-Inversion). Ausnahme: ausgesprochene **Poesie** (z. B. Lieder, Segenssprüche) darf gehoben/poetisch sein (aber nicht hebraisierend); reine **Erzählprosa** bleibt schlicht modern.

**Gottesname:** Tetragramm `יהוה` im Deutschen IMMER „der Ewige" (nie wörtlich, nie ausgeschrieben). `אֱלֹהִים` = „Gott". `יהוה אלהים` = „der Ewige, Gott". Am Bildschirm wird der Tetragramm OHNE Vokalzeichen dargestellt (der Generator `entferneTetragrammNikud` erledigt das) — den Quell-Token unverändert lassen.

**Jüdisch adressiert:** keine christliche Deutung, keine Fußnoten, keine Klammer-Erklärungen im Text. Speisegesetze: חזיר = „Chasir", nie „Schwein".

**Namen:** konventionelle deutsche Bibelschreibung, wo üblich (Mose, Esau, Juda, Ruben, Kain, Abel, Eva, Josua …), sonst Transliteration. Konsistent mit den bereits live stehenden Kapiteln.

**Alignment-Format:** `he`-Chunks 1–3 Wörter, in Quellreihenfolge, jedes Wort genau einmal; `id` = `<kap>-<vers>-<n>`. `de`-Chunks in natürlicher deutscher Reihenfolge, jede `de-id` ist eine `he-id` desselben Verses. Reine Partikel ohne deutsche Entsprechung (z. B. אֵת allein) bekommen keinen `de`-Eintrag.

**Titel-Format:** „Or Tora – <Buch> Kapitel N – Schalom Israel" (kein doppeltes „Tora lesen").

---

## Sefaria-Direkt (für Paraschot, die Hebcal nur kombiniert/als Feiertag führt)

Kleines Skript, das `tokenisiere` aus `tools/tora-hebraeisch-holen.js` importiert und Sefaria v3 direkt zieht:
`https://www.sefaria.org/api/v3/texts/<Buch>%20<vonK>.<vonV>-<bisK>.<bisV>?version=hebrew|Tanach with Ta'amei Hamikra`.
Verse als `{ref:"K,V", he:tokenisiere(text)}` je Kapitel gruppieren, Standard-Aliyot (7) + reguläre Haftara von Hand setzen, als `tora/daten/<slug>.roh.json` schreiben.

## Gestoppt / Fehlerfall

Schlägt ein Gate fehl oder ist das Kontingent (Session-Limit) erschöpft: **nicht deployen**, den Teilstand liegen lassen, im Log vermerken. Der nächste Lauf setzt an derselben Stelle fort (`fortschritt.json` wurde nicht fortgeschrieben).
