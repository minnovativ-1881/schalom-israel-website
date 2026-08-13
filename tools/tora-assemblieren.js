'use strict';
// =============================================
// SCHALOM ISRAEL - tools/tora-assemblieren.js
// Setzt eine Paraschah aus roh + Uebersetzungs-Arbeitsdateien (work/) zusammen,
// stellt den hebraeischen Text byte-genau aus der roh-Datei wieder her,
// grosst Satzanfaenge automatisch, validiert gegen das Schema und schreibt
// tora/daten/<slug>.json.
//
// Nur Kapitel, fuer die eine Arbeitsdatei tora/daten/work/<slug>-kap<N>.json
// existiert, werden gebaut (erlaubt teilweise uebersetzte Paraschot).
//
// Aufruf:   node tools/tora-assemblieren.js <slug> <HebcalName>
// Beispiel: node tools/tora-assemblieren.js bereschit Bereshit
// =============================================
const fs = require('node:fs');
const path = require('node:path');
const WEB = path.join(__dirname, '..');
const P = require(path.join(WEB, 'parascha-daten.js'));
const T = require(path.join(WEB, 'tora/lib/tora-schema.js'));

const slug = process.argv[2];
const hebcalName = process.argv[3];
if (!slug || !hebcalName) { console.error('Aufruf: node tools/tora-assemblieren.js <slug> <HebcalName>'); process.exit(2); }

const roh = JSON.parse(fs.readFileSync(path.join(WEB, `tora/daten/${slug}.roh.json`), 'utf8'));
const rohByKap = Object.fromEntries(roh.kapitel.map(k => [k.nr, Object.fromEntries(k.verse.map(v => [v.ref, v.he]))]));

const ALIYA_NAMEN = [
  { he: 'רִאשׁוֹן', de: 'Rischon', tag: 'Sonntag' }, { he: 'שֵׁנִי', de: 'Scheni', tag: 'Montag' },
  { he: 'שְׁלִישִׁי', de: 'Schlischi', tag: 'Dienstag' }, { he: 'רְבִיעִי', de: 'Rewii', tag: 'Mittwoch' },
  { he: 'חֲמִישִׁי', de: 'Chamischi', tag: 'Donnerstag' }, { he: 'שִׁשִּׁי', de: 'Schischi', tag: 'Freitag' },
  { he: 'שְׁבִיעִי', de: 'Schewii', tag: 'Schabbat' },
];
const komma = s => String(s).replace(':', ',');

const fehler = [];
const kapitel = [];
const vorhandeneKap = roh.kapitel.map(k => k.nr).filter(nr => fs.existsSync(path.join(WEB, `tora/daten/work/${slug}-kap${nr}.json`)));
for (const kapNr of vorhandeneKap) {
  const work = JSON.parse(fs.readFileSync(path.join(WEB, `tora/daten/work/${slug}-kap${kapNr}.json`), 'utf8'));
  const rohV = rohByKap[kapNr];
  for (const v of work.verse) {
    const words = (rohV[v.ref] || []).slice();
    if (!words.length) { fehler.push(`${v.ref}: kein Quellvers`); continue; }
    let p = 0;
    for (const c of v.he) { const n = c.t.split(/\s+/).filter(Boolean).length; c.t = words.slice(p, p + n).join(' '); p += n; }
    if (p !== words.length) fehler.push(`${v.ref}: he deckt ${p} statt ${words.length} Woerter`);
    const heIds = new Set(v.he.map(c => c.id));
    for (const dd of v.de) if (!heIds.has(dd.id)) fehler.push(`${v.ref}: de-id ${dd.id} ohne he`);
    if (words.join(' ') !== v.he.flatMap(c => c.t.split(/\s+/)).join(' ')) fehler.push(`${v.ref}: HE weicht ab`);
    // Satzanfang-Grossschreibung
    let capNext = false;
    for (const c of v.de) {
      let t = c.t.replace(/([.!?]["'»]?\s+)([a-zäöü])/g, (m, pre, ch) => pre + ch.toUpperCase());
      if (capNext) t = t.replace(/^(["'«]?\s*)([a-zäöü])/, (m, pre, ch) => pre + ch.toUpperCase());
      c.t = t;
      capNext = /[.!?]$/.test(t.replace(/["'»\s]+$/, ''));
    }
  }
  kapitel.push({ nr: kapNr, verse: work.verse });
}
if (!kapitel.length) { console.log(`Keine Arbeitsdateien fuer "${slug}" gefunden (tora/daten/work/${slug}-kap<N>.json).`); process.exit(1); }
if (fehler.length) { console.log('PROBLEME:\n' + fehler.map(x => ' - ' + x).join('\n')); process.exit(1); }

const meta = P.PARASHA[hebcalName];
if (!meta) { console.log(`Kein parascha-daten-Eintrag fuer "${hebcalName}"`); process.exit(1); }
const aliyot = roh.aliyot.map((a, i) => ({ n: a.n, ...ALIYA_NAMEN[i], von: komma(a.von), bis: komma(a.bis) }));
const buch = roh.buch || '5. Mose';
const daten = {
  slug, hebcalName, de: meta.de, he: meta.he, meaning: meta.meaning, buch,
  bereich: `${buch} ${komma(roh.aliyot[0].von)}–${komma(roh.aliyot[roh.aliyot.length - 1].bis)}`,
  aliyot, haftara: roh.haftara, kapitel,
};
const schemaFehler = T.validate(daten);
if (schemaFehler.length) { console.log('SCHEMA-FEHLER:\n' + schemaFehler.join('\n')); process.exit(1); }

fs.writeFileSync(path.join(WEB, `tora/daten/${slug}.json`), JSON.stringify(daten, null, 2));
console.log(`OK: ${slug}.json, ${kapitel.length} Kapitel, ${kapitel.reduce((s, k) => s + k.verse.length, 0)} Verse, "${daten.bereich}", Haftara ${daten.haftara}`);
