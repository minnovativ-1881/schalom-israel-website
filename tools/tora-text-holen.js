// =============================================
// Holt den hebraeischen Text der Tora und bereitet ihn auf.
//
// Quelle: Sefaria, Version "Miqra according to the Masorah" (CC-BY-SA),
// urspruenglich hebraeisches Wikisource.
//
// Erzeugt entdecken/tora-text.json:
//   buchstaben  Konsonantenkette ohne Vokale, Leerzeichen, Satzzeichen
//   buecher     [{name, dt, start, laenge}]
//   versStarts  Startposition jedes Verses in der Kette
//   struktur    Verse je Kapitel je Buch, damit sich aus dem Vers-Index
//               die Stelle (Buch, Kapitel, Vers) berechnen laesst
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

const ENDFORMEN = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };

function nurBuchstaben(text) {
  return String(text)
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z]+;/gi, '')
    .replace(/[֑-ׇ]/g, '')
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
        // Verse einzeln behalten, damit die Positionen stimmen
        return d.he.map((v) => (Array.isArray(v) ? v.flat(3).join('') : String(v)));
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
  const versStarts = [];
  const struktur = [];

  for (const b of BUECHER) {
    const buchStart = alles.length;
    const kapitelLaengen = [];

    for (let k = 1; k <= b.kapitel; k++) {
      const verse = await holeKapitel(b.en, k);
      kapitelLaengen.push(verse.length);

      for (const vers of verse) {
        versStarts.push(alles.length);
        alles += nurBuchstaben(vers);
      }
      process.stdout.write(`\r${b.de.padEnd(10)} Kapitel ${k}/${b.kapitel}  Buchstaben: ${alles.length.toLocaleString('de')}  Verse: ${versStarts.length.toLocaleString('de')}   `);
      await sleep(120);
    }

    buecher.push({ name: b.de, dt: b.dt, start: buchStart, laenge: alles.length - buchStart });
    struktur.push(kapitelLaengen);
    process.stdout.write('\n');
  }

  const ergebnis = {
    quelle: 'Sefaria, "Miqra according to the Masorah" (CC-BY-SA)',
    quelleUrl: 'https://www.sefaria.org/',
    anzahl: alles.length,
    buecher,
    struktur,
    versStarts,
    buchstaben: alles,
  };

  fs.writeFileSync(ZIEL, JSON.stringify(ergebnis), 'utf8');

  const verseGesamt = struktur.reduce((s, b) => s + b.reduce((t, k) => t + k, 0), 0);
  console.log('');
  console.log(`Buchstaben: ${alles.length.toLocaleString('de')}  (Torarolle ueberliefert: 304.805)`);
  console.log(`Verse:      ${verseGesamt.toLocaleString('de')}  (ueberliefert: 5.845)`);
  console.log('');
  buecher.forEach((b, i) => {
    const v = struktur[i].reduce((t, k) => t + k, 0);
    console.log(`  ${b.name.padEnd(10)} ${b.laenge.toLocaleString('de').padStart(8)} Buchstaben, ${String(v).padStart(5)} Verse, ${struktur[i].length} Kapitel`);
  });
  console.log('');
  console.log(`Datei: ${(fs.statSync(ZIEL).size / 1024).toFixed(0)} KB`);
})();
