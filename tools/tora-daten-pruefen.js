'use strict';
// =============================================
// SCHALOM ISRAEL - tools/tora-daten-pruefen.js
// Prueft einen Paraschah-Datensatz gegen das Schema (tora/lib/tora-schema.js).
// Aufruf: node tools/tora-daten-pruefen.js tora/daten/<slug>.json
// =============================================
const fs = require('node:fs');
const T = require('../tora/lib/tora-schema.js');

const datei = process.argv[2];
if (!datei) { console.error('Aufruf: node tools/tora-daten-pruefen.js <datei.json>'); process.exit(2); }

const d = JSON.parse(fs.readFileSync(datei, 'utf8'));
const fehler = T.validate(d);
if (fehler.length) {
  console.error('FEHLER:\n' + fehler.map(x => ' - ' + x).join('\n'));
  process.exit(1);
}
console.log(`OK: ${d.slug}, ${d.kapitel.length} Kapitel, ${d.kapitel.reduce((s, k) => s + k.verse.length, 0)} Verse`);
