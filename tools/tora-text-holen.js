// =============================================
// Holt den hebraeischen Text der Tora und bereitet ihn auf.
//
// Quelle: Sefaria, Version "Miqra according to the Masorah" (CC-BY-SA),
// urspruenglich hebraeisches Wikisource. Die Quellenangabe steht auf den
// Seiten, die den Text nutzen.
//
// Erzeugt entdecken/tora-text.json:
//   { buchstaben: "...", buecher: [{name, de, start, laenge}], anzahl: N }
//
// Aufruf:  node tools/tora-text-holen.js
// =============================================
const fs = require('fs');
const path = require('path');

const ZIEL = path.join(__dirname, '..', 'entdecken', 'tora-text.json');

const BUECHER = [
  { en: 'Genesis',     de: 'Bereschit', dt: '1. Mose', kapitel: 50 },
  { en: 'Exodus',      de: 'Schemot',   dt: '2. Mose', kapitel: 40 },
  { en: 'Leviticus',   de: 'Wajikra',   dt: '3. Mose', kapitel: 27 },
  { en: 'Numbers',     de: 'Bamidbar',  dt: '4. Mose', kapitel: 36 },
  { en: 'Deuteronomy', de: 'Devarim',   dt: '5. Mose', kapitel: 34 },
];

// Endbuchstaben auf ihre Grundform bringen, damit die Suche sie findet.
const ENDFORMEN = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };

// Behaelt nur die 22 Konsonanten. Weg fallen: HTML, Vokalzeichen (Nikud),
// Betonungszeichen (Teamim), Satzzeichen, Leerzeichen.
function nurBuchstaben(text) {
  return String(text)
    .replace(/<[^>]*>/g, '')          // HTML-Reste wie <big>
    .replace(/&[a-z]+;/gi, '')        // HTML-Entities
    .replace(/[֑-ׇ]/g, '')  // Nikud und Teamim
    .split('')
    .map((c) => ENDFORMEN[c] || c)
    .filter((c) => c >= 'א' && c <= 'ת')
    .join('');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function holeKapitel(buch, kapitel) {
  const url = `https://www.sefaria.org/api/texts/${buch}.${kapitel}?lang=he&commentary=0&context=0`;
  for (let versuch = 1; versuch <= 3; versuch++) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const d = await res.json();
        if (!Array.isArray(d.he)) throw new Error('kein he-Feld');
        // Verse koennen verschachtelt sein
        const flach = d.he.flat(3);
        return flach.join('');
      }
      if (versuch < 3) { await sleep(1200 * versuch); continue; }
      throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      if (versuch === 3) throw e;
      await sleep(1200 * versuch);
    }
  }
}

(async () => {
  let alles = '';
  const buecher = [];

  for (const b of BUECHER) {
    let buchText = '';
    for (let k = 1; k <= b.kapitel; k++) {
      const roh = await holeKapitel(b.en, k);
      buchText += nurBuchstaben(roh);
      process.stdout.write(`\r${b.de.padEnd(10)} Kapitel ${k}/${b.kapitel}  gesamt: ${(alles.length + buchText.length).toLocaleString('de')}   `);
      await sleep(120);
    }
    buecher.push({ name: b.de, dt: b.dt, start: alles.length, laenge: buchText.length });
    alles += buchText;
    process.stdout.write('\n');
  }

  const ergebnis = {
    quelle: 'Sefaria, "Miqra according to the Masorah" (CC-BY-SA)',
    quelleUrl: 'https://www.sefaria.org/',
    anzahl: alles.length,
    buecher,
    buchstaben: alles,
  };

  fs.writeFileSync(ZIEL, JSON.stringify(ergebnis), 'utf8');

  console.log('');
  console.log(`Buchstaben gesamt: ${alles.length.toLocaleString('de')}`);
  console.log(`Ueberlieferte Zahl einer Tora-Rolle: 304.805`);
  console.log(`Abweichung: ${(alles.length - 304805).toLocaleString('de')}`);
  console.log('');
  buecher.forEach((b) => console.log(`  ${b.name.padEnd(10)} ${b.laenge.toLocaleString('de').padStart(8)} Buchstaben`));
  console.log('');
  console.log(`Datei: ${(fs.statSync(ZIEL).size / 1024).toFixed(0)} KB`);
})();
