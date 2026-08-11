'use strict';
// =============================================
// SCHALOM ISRAEL - tools/tora-hebraeisch-holen.js
// Holt den vokalisierten hebraeischen Text (Nikud + Taamim) einer Paraschah
// von Sefaria sowie die Aliyot-Bereiche und die Haftara von Hebcal.
// Schreibt tora/daten/<slug>.roh.json -- die Eingabe fuer die spaetere
// deutsche Uebersetzung. Kein KI-Anteil, reines Ziehen aus offenen Quellen.
//
// Quelle Hebraeisch: Sefaria, Version "Tanach with Ta'amei Hamikra"
// -- GEMEINFREI (Public Domain, Quelle tanach.us / Leningrad-Codex). Bewusst
// GEGEN "Miqra according to the Masorah" (CC-BY-SA) gewaehlt, damit der
// hebraeische Text ohne jede Lizenzauflage genutzt und spaeter im Buch
// kommerziell verkauft werden darf. Vokalisierung UND Kantillation (Taamim)
// bleiben erhalten; die Anzeige blendet Taamim spaeter optional aus.
// Der Konsonantentext ist mit MAM praktisch identisch (nur vereinzelte
// Schreibvarianten plene/defektiv), die Anzeige aendert sich kaum.
//
// Quelle Aliyot/Haftara: Hebcal Leyning-API (https://www.hebcal.com/leyning/).
//
// Aufruf:   node tools/tora-hebraeisch-holen.js <HebcalName> <slug> <BuchDe>
// Beispiel: node tools/tora-hebraeisch-holen.js Eikev ekev "5. Mose"
// =============================================
const fs = require('node:fs');
const path = require('node:path');
const { PARASHA } = require('../parascha-daten.js');

// Sefaria-Versionskennung fuer "Tanach with Ta'amei Hamikra" (hebraeisch, PUBLIC DOMAIN).
// Verifiziert per Live-Request: /api/texts/versions/Deuteronomy -> license "Public Domain",
// versionSource http://www.tanach.us/Tanach.xml
const SEFARIA_VERSION = "hebrew|Tanach with Ta'amei Hamikra";

// Volle deutsche Buchnamen fuer die Haftara-Angabe (Newiim/Ketuwim).
// Bewusst NICHT die Abkuerzungen aus parascha-daten.js/BIBLE_BOOKS ("Jes"),
// weil tora-schema.js ausgeschriebene Namen erwartet ("Jesaja 49,14").
const HAFTARA_BUCH_DE = {
  'Joshua': 'Josua', 'Judges': 'Richter',
  'I Samuel': '1. Samuel', '1 Samuel': '1. Samuel',
  'II Samuel': '2. Samuel', '2 Samuel': '2. Samuel',
  'I Kings': '1. Könige', '1 Kings': '1. Könige',
  'II Kings': '2. Könige', '2 Kings': '2. Könige',
  'Isaiah': 'Jesaja', 'Jeremiah': 'Jeremia', 'Ezekiel': 'Hesekiel',
  'Hosea': 'Hosea', 'Joel': 'Joel', 'Amos': 'Amos', 'Obadiah': 'Obadja',
  'Jonah': 'Jona', 'Micah': 'Micha', 'Nahum': 'Nahum', 'Habakkuk': 'Habakuk',
  'Zephaniah': 'Zefanja', 'Haggai': 'Haggai', 'Zechariah': 'Sacharja',
  'Malachi': 'Maleachi',
  'Psalms': 'Psalmen', 'Psalm': 'Psalm', 'Proverbs': 'Sprüche', 'Job': 'Ijob',
  'Song of Songs': 'Hoheslied', 'Song of Solomon': 'Hoheslied', 'Ruth': 'Rut',
  'Lamentations': 'Klagelieder', 'Ecclesiastes': 'Kohelet', 'Esther': 'Ester',
  'Daniel': 'Daniel', 'Ezra': 'Esra', 'Nehemiah': 'Nehemia',
  'I Chronicles': '1. Chronik', '1 Chronicles': '1. Chronik',
  'II Chronicles': '2. Chronik', '2 Chronicles': '2. Chronik',
};

// -----------------------------------------------
// Tokenisiert einen Sefaria-Vers (Text ODER HTML-behafteter Rohtext) zu
// Wort-Tokens. Nikud und Taamim bleiben in jedem Token unangetastet.
// Entfernt werden nur Nicht-Wort-Bestandteile:
//   - Sof Pasuq (׃) und Paseq (׀) als Satz-/Halbvers-Trenner
//   - HTML-Tags (Sefaria markiert z.B. Paseq mit <b>/<small>, einzelne
//     Woerter mit <span class="mam-kq-trivial">)
//   - Fussnoten: <sup class="footnote-marker">*</sup> + <i class="footnote">...</i>
//     (Dokumentationstext zu Handschriften-Varianten, kein Bibeltext)
//   - Absatzmarker {פ}/{ס}: <span class="mam-spi-pe|mam-spi-samekh">...</span>
//   - Ketiv/Qere: <span class="mam-kq-q">[Qere]</span> behalten (vokalisiert),
//     <span class="mam-kq-k">(Ketiv)</span> verwerfen (unvokalisierte Variante)
//   - HTML-Entities &nbsp;/&thinsp;
// Mit Maqaf (־) verbundene Woerter (z.B. עַל־פְּנֵי) bleiben EIN Token, weil
// am Maqaf nicht getrennt wird -- nur an echten Leerzeichen.
function tokenisiere(vers) {
  let s = String(vers);
  s = s.replace(/<sup[^>]*class="footnote-marker"[^>]*>[\s\S]*?<\/sup>/g, '');
  s = s.replace(/<i[^>]*class="footnote"[^>]*>[\s\S]*?<\/i>/g, '');
  s = s.replace(/<span[^>]*class="mam-kq-q"[^>]*>\[([^\]]*)\]<\/span>/g, '$1');
  s = s.replace(/<span[^>]*class="mam-kq-k"[^>]*>\([^)]*\)<\/span>/g, '');
  s = s.replace(/<span[^>]*class="mam-spi-[^"]*"[^>]*>[\s\S]*?<\/span>/g, ' ');
  s = s.replace(/<[^>]+>/g, ''); // uebrige Tags (z.B. <b>, <small>, mam-kq-trivial) raus, Inhalt bleibt
  s = s.replace(/&nbsp;|&thinsp;/g, ' ');
  // Ketiv/Qere im tanach.us-Klartext: "<ketiv> [<qere>]" -> nur das vokalisierte Qere behalten
  // (wie MAM, das die Ketiv-Variante verwirft). Das Ketiv-Wort direkt vor der Klammer entfaellt.
  s = s.replace(/[^\s()\[\]{}]+\s+\[([^\[\]]*)\]/g, '$1');
  s = s.replace(/[\[\]]/g, ' '); // etwaige alleinstehende eckige Klammern (Qere ohne Ketiv) aufloesen
  // Setuma/Petucha-Absatzmarker als Klartext (tanach.us: "(ס)"/"(פ)") entfernen -- kein Bibelwort.
  s = s.replace(/[({][ספרנ][)}]/g, ' ');
  s = s.replace(/[׃׀]/g, ' '); // Sof Pasuq / Paseq raus. KEINE Nikud/Taamim entfernen.
  return s.trim().split(/\s+/).filter(Boolean);
}

// Zerlegt eine Hebcal-Stellenangabe wie "7:12" in { kapitel, vers }.
function splitAliyaRef(s) {
  const m = String(s).match(/(\d+):(\d+)/);
  return m ? { kapitel: +m[1], vers: +m[2] } : null;
}

// Formatiert { kapitel, vers } als deutsche Stellenangabe "7,12" (tora-schema.js-Format).
function kapVersDe(hebcalRef) {
  const p = splitAliyaRef(hebcalRef);
  return p ? `${p.kapitel},${p.vers}` : '';
}

// Formatiert eine Hebcal-Haftara-Angabe ("Isaiah 49:14-51:3") als deutsche
// Stelle ("Jesaja 49,14–51,3"). Mehrteilige Haftarot ("Hosea 14:2-10; Micah
// 7:18-20") werden Semikolon-getrennt einzeln formatiert.
function formatHaftara(ref) {
  if (!ref) return '';
  return String(ref).split(';').map((teil) => formatHaftaraTeil(teil.trim())).filter(Boolean).join('; ');
}

function formatHaftaraTeil(ref) {
  const m = ref.match(/^(.+?)\s+(\d+):(\d+)(?:[-–](\d+)(?::(\d+))?)?$/);
  if (!m) return ref;
  const [, buch, k1, v1, k2OderV2, v2] = m;
  const deBuch = HAFTARA_BUCH_DE[buch] || buch;
  if (!k2OderV2) return `${deBuch} ${k1},${v1}`;
  if (v2) {
    // Bleibt der Bereich im selben Kapitel, wird das Kapitel nur einmal genannt.
    if (k1 === k2OderV2) return `${deBuch} ${k1},${v1}–${v2}`;
    return `${deBuch} ${k1},${v1}–${k2OderV2},${v2}`;
  }
  return `${deBuch} ${k1},${v1}–${k2OderV2}`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Holt JSON per fetch mit Wiederholungsversuchen (Netzwerkfehler/5xx).
async function holeJson(url, versuche = 3) {
  let letzterFehler;
  for (let i = 1; i <= versuche; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} bei ${url}`);
      return await res.json();
    } catch (e) {
      letzterFehler = e;
      if (i < versuche) await sleep(800 * i);
    }
  }
  throw letzterFehler;
}

// Sucht den Hebcal-Leyning-Eintrag (Typ "shabbat") fuer eine Paraschah nach
// ihrem Hebcal-Namen. Die /leyning/-API verlangt einen Datumsbereich und
// liefert maximal ~6 Monate pro Aufruf, daher zwei Halbjahres-Aufrufe.
// Verifiziert per Live-Request: /leyning/?cfg=json&start=2026-08-01&end=2026-08-01
// -> Feld "fullkriyah" mit "1".."7", je { k: Buch, b: Beginn "7:12", e: Ende },
//    Feld "haftara" als String ("Isaiah 49:14-51:3").
async function holeHebcalEintrag(hebcalName) {
  const jahr = new Date().getFullYear();
  for (const y of [jahr, jahr + 1]) {
    const zeitraeume = [
      [`${y}-01-01`, `${y}-06-30`],
      [`${y}-07-01`, `${y}-12-31`],
    ];
    for (const [start, end] of zeitraeume) {
      const url = `https://www.hebcal.com/leyning/?cfg=json&start=${start}&end=${end}`;
      const data = await holeJson(url);
      const treffer = (data.items || []).find(
        (i) => i.type === 'shabbat' && i.name && i.name.en === hebcalName
      );
      if (treffer) return treffer;
    }
  }
  throw new Error(`Hebcal: Paraschah "${hebcalName}" nicht gefunden (Jahre ${jahr}/${jahr + 1} geprueft)`);
}

// Holt den vokalisierten Text fuer einen Stellenbereich (z.B. Deuteronomy
// 7:12 bis 11:25) von Sefaria in EINEM Request und gruppiert ihn nach
// Kapiteln. Sefaria liefert bei Mehrkapitel-Bereichen ein verschachteltes
// Array (ein Unter-Array je Kapitel), bei Einzelkapitel-Bereichen ein
// flaches Array -- beides wird hier vereinheitlicht.
// Verifiziert per Live-Request:
//   /api/v3/texts/Deuteronomy%207.12-11.25?version=hebrew|Miqra according to the Masorah
async function holeSefariaBereich(buchEnglisch, vonKap, vonVers, bisKap, bisVers) {
  const stelle = `${buchEnglisch} ${vonKap}.${vonVers}-${bisKap}.${bisVers}`;
  const url = `https://www.sefaria.org/api/v3/texts/${encodeURIComponent(stelle)}?version=${encodeURIComponent(SEFARIA_VERSION)}`;
  const data = await holeJson(url);
  if (data.error) throw new Error(`Sefaria: ${data.error}`);
  const version = data.versions && data.versions[0];
  if (!version || !Array.isArray(version.text)) throw new Error(`Sefaria: keine Textdaten fuer "${stelle}"`);

  const rohKapitel = Array.isArray(version.text[0]) ? version.text : [version.text];
  const kapitel = [];
  rohKapitel.forEach((verse, i) => {
    const nr = vonKap + i;
    const startVers = nr === vonKap ? vonVers : 1;
    const eintraege = verse.map((text, j) => ({
      ref: `${nr},${startVers + j}`,
      he: tokenisiere(text),
    }));
    kapitel.push({ nr, verse: eintraege });
  });
  return kapitel;
}

// Holt eine ganze Paraschah (Aliyot + Haftara von Hebcal, Text von Sefaria)
// und schreibt tora/daten/<slug>.roh.json.
async function holeParascha(hebcalName, slug, buchDe) {
  const treffer = await holeHebcalEintrag(hebcalName);
  if (!treffer.fullkriyah) throw new Error(`Hebcal: "fullkriyah" fehlt fuer "${hebcalName}"`);

  const aliyot = [];
  for (let n = 1; n <= 7; n++) {
    const a = treffer.fullkriyah[String(n)];
    if (!a) throw new Error(`Hebcal: Aliyah ${n} fehlt fuer "${hebcalName}"`);
    aliyot.push({ n, von: kapVersDe(a.b), bis: kapVersDe(a.e) });
  }

  const buchEnglisch = treffer.fullkriyah['1'].k;
  const ersteAliyah = splitAliyaRef(treffer.fullkriyah['1'].b);
  const letzteAliyah = splitAliyaRef(treffer.fullkriyah['7'].e);

  const kapitel = await holeSefariaBereich(
    buchEnglisch, ersteAliyah.kapitel, ersteAliyah.vers, letzteAliyah.kapitel, letzteAliyah.vers
  );

  const eintrag = PARASHA[hebcalName];
  if (!eintrag) console.warn(`Warnung: "${hebcalName}" nicht in parascha-daten.js gefunden -- 'de' faellt auf den Hebcal-Namen zurueck.`);
  const de = eintrag ? eintrag.de : hebcalName;

  const ergebnis = {
    slug,
    hebcalName,
    de,
    buch: buchDe,
    aliyot,
    haftara: formatHaftara(treffer.haftara),
    kapitel,
  };

  const zielVerzeichnis = path.join(__dirname, '..', 'tora', 'daten');
  fs.mkdirSync(zielVerzeichnis, { recursive: true });
  const zielPfad = path.join(zielVerzeichnis, `${slug}.roh.json`);
  fs.writeFileSync(zielPfad, JSON.stringify(ergebnis, null, 2) + '\n', 'utf8');

  const gesamtVerse = kapitel.reduce((s, k) => s + k.verse.length, 0);
  console.log(`Geschrieben: ${zielPfad}`);
  console.log(`Bereich: ${buchDe} ${aliyot[0].von} bis ${aliyot[6].bis}  (${gesamtVerse} Verse in ${kapitel.length} Kapiteln)`);
  kapitel.forEach((k) => console.log(`  Kapitel ${k.nr}: ${k.verse.length} Verse`));
  console.log(`Haftara: ${ergebnis.haftara}`);

  return ergebnis;
}

if (require.main === module) {
  const [hebcal, slug, buch] = process.argv.slice(2);
  if (!hebcal || !slug || !buch) {
    console.error('Aufruf: node tools/tora-hebraeisch-holen.js <HebcalName> <slug> <BuchDe>');
    console.error('Beispiel: node tools/tora-hebraeisch-holen.js Eikev ekev "5. Mose"');
    process.exit(1);
  }
  holeParascha(hebcal, slug, buch).catch(e => { console.error(e); process.exit(1); });
}

module.exports = { tokenisiere, splitAliyaRef, holeParascha };
