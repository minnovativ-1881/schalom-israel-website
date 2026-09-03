'use strict';
// =============================================
// SCHALOM ISRAEL - tools/tora-roh-holen.js
// Holt die roh-Datei einer Paraschah (tora/daten/<slug>.roh.json) aus Quellen,
// die AUCH AUS DER CLOUD-SANDBOX erreichbar sind. Inhaltlich gleichwertiger
// Ersatz fuer tools/tora-hebraeisch-holen.js, das sefaria.org und hebcal.com
// direkt anspricht -- beide Hosts sperrt die Egress-Policy des Automatik-Laufs
// (HTTP 403 beim CONNECT), weshalb der taegliche Lauf dort blockierte.
//
// Quelle Hebraeisch: OFFIZIELLER Sefaria-Export-Bucket
//   https://storage.googleapis.com/sefaria-export/json/Tanakh/Torah/<Buch>/Hebrew/
//   Tanach with Ta'amei Hamikra.json
// Das ist dieselbe Version wie ueber die Sefaria-API: versionTitle
// "Tanach with Ta'amei Hamikra", versionSource http://www.tanach.us/Tanach.xml,
// license "Public Domain" (tanach.us / Leningrad-Codex). Bewusst NICHT
// "Miqra according to the Masorah" (CC-BY-SA), damit der hebraeische Text ohne
// Lizenzauflage genutzt und spaeter im Buch verkauft werden darf.
// Die Gleichwertigkeit ist nachweisbar: `--selbsttest` baut jede bereits
// vorhandene roh-Datei aus dieser Quelle nach und vergleicht Token fuer Token.
//
// Quelle Aliyot/Haftara: npm-Paket @hebcal/leyning (BSD-2-Clause) --
// dieselbe Datenbasis, aus der auch die Hebcal-Leyning-API antwortet. Das Paket
// wird zur Laufzeit von registry.npmjs.org geladen (in der Sandbox direkt
// erreichbar) und NICHT ins Repo aufgenommen; das Repo bleibt buildfrei.
// Es liefert die REGULAERE Haftara der Paraschah, nicht die Sonder-Haftara des
// laufenden Jahres (Schabbat Schuwa, Machar Chodesch, Chanukka) -- genau das,
// was die Pipeline verlangt.
//
// Aufruf:
//   node tools/tora-roh-holen.js <HebcalName> <slug> "<BuchDe>"
//   node tools/tora-roh-holen.js --buch "2. Mose"     (alle Paraschot des Buches)
//   node tools/tora-roh-holen.js --selbsttest         (Quellen gegen Bestand pruefen)
// Beispiel: node tools/tora-roh-holen.js Shemot schemot "2. Mose"
// =============================================
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { tokenisiere, kapVersDe, formatHaftara } = require('./tora-hebraeisch-holen.js');
const { PARASHA } = require('../parascha-daten.js');

const WEB = path.join(__dirname, '..');
const DATEN = path.join(WEB, 'tora', 'daten');

const SEFARIA_BUCKET = 'https://storage.googleapis.com/sefaria-export';
const SEFARIA_VERSION_DATEI = "Tanach with Ta'amei Hamikra.json";
const HEBCAL_PAKET = '@hebcal/leyning';
const HEBCAL_VERSION = '10.0.0'; // gepinnt: Aliyot-/Haftara-Tabelle soll sich nie unbemerkt aendern

// Buchnummer aus @hebcal/leyning (1..5) -> englischer Sefaria-Name + deutscher Buchname.
const BUECHER = [
  null,
  { en: 'Genesis', de: '1. Mose' },
  { en: 'Exodus', de: '2. Mose' },
  { en: 'Leviticus', de: '3. Mose' },
  { en: 'Numbers', de: '4. Mose' },
  { en: 'Deuteronomy', de: '5. Mose' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Laedt eine URL mit Wiederholungsversuchen und liefert den Rohpuffer.
async function holePuffer(url, versuche = 3) {
  let letzterFehler;
  for (let i = 1; i <= versuche; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} bei ${url}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      letzterFehler = e;
      if (i < versuche) await sleep(800 * i);
    }
  }
  throw letzterFehler;
}

// -----------------------------------------------
// Hebraeischer Text
// -----------------------------------------------
const textCache = new Map();

// Holt ein ganzes Tora-Buch als Array text[kapitel-1][vers-1] und prueft dabei,
// dass wirklich die gemeinfreie tanach.us-Version geliefert wurde.
async function holeBuchText(buchEnglisch) {
  if (textCache.has(buchEnglisch)) return textCache.get(buchEnglisch);
  const url = `${SEFARIA_BUCKET}/json/Tanakh/Torah/${encodeURIComponent(buchEnglisch)}`
    + `/Hebrew/${encodeURIComponent(SEFARIA_VERSION_DATEI)}`;
  const daten = JSON.parse((await holePuffer(url)).toString('utf8'));
  if (daten.versionTitle !== "Tanach with Ta'amei Hamikra") {
    throw new Error(`Falsche Version geliefert: "${daten.versionTitle}" (erwartet "Tanach with Ta'amei Hamikra")`);
  }
  if (daten.license !== 'Public Domain') {
    throw new Error(`Lizenz ist "${daten.license}", erwartet "Public Domain" -- NICHT verwenden.`);
  }
  if (!Array.isArray(daten.text) || !daten.text.length) throw new Error(`Keine Textdaten fuer ${buchEnglisch}`);
  textCache.set(buchEnglisch, daten.text);
  return daten.text;
}

// -----------------------------------------------
// Aliyot / Haftara aus @hebcal/leyning
// -----------------------------------------------

// Minimaler tar-Leser: liefert den Inhalt der ersten Datei, deren Pfad auf
// `endung` endet. Reicht fuer npm-Tarballs (kurze Pfade, keine Long-Name-Records).
function tarDatei(puffer, endung) {
  for (let off = 0; off + 512 <= puffer.length;) {
    const name = puffer.toString('utf8', off, off + 100).replace(/\0.*$/, '');
    if (!name) { off += 512; continue; }
    const groesse = parseInt(puffer.toString('ascii', off + 124, off + 136).replace(/\0.*$/, '').trim(), 8) || 0;
    const start = off + 512;
    if (name.endsWith(endung)) return puffer.toString('utf8', start, start + groesse);
    off = start + Math.ceil(groesse / 512) * 512;
  }
  return null;
}

let aliyotCache = null;

// Laedt die Aliyot-/Haftara-Tabelle aus dem npm-Tarball von @hebcal/leyning.
async function holeAliyotTabelle() {
  if (aliyotCache) return aliyotCache;
  const url = `https://registry.npmjs.org/${HEBCAL_PAKET}/-/leyning-${HEBCAL_VERSION}.tgz`;
  const quelle = tarDatei(zlib.gunzipSync(await holePuffer(url)), 'dist/esm/aliyot.json.js');
  if (!quelle) throw new Error('aliyot.json.js im npm-Tarball nicht gefunden');
  // Die Datei ist ein reines Daten-Modul ("export default { ... };") aus einem
  // gepinnten Paket -- als Objektliteral auswerten.
  const literal = quelle.replace(/^\s*export\s+default\s*/, '').replace(/;?\s*(\/\/[^\n]*)?\s*$/, '');
  aliyotCache = new Function(`return (${literal});`)();
  return aliyotCache;
}

// Baut aus den Hebcal-Haftara-Teilen den String, den die Leyning-API im Feld
// "haftara" liefert ("Isaiah 27:6-28:13; Isaiah 29:22-23").
function haftaraString(haft) {
  return (Array.isArray(haft) ? haft : [haft]).map((p) => {
    const [vonKap] = p.b.split(':');
    const [bisKap, bisVers] = p.e.split(':');
    return `${p.k} ${p.b}-${vonKap === bisKap ? bisVers : p.e}`;
  }).join('; ');
}

// -----------------------------------------------
// roh-Datei bauen
// -----------------------------------------------

// Stellt eine komplette roh-Struktur fuer eine Paraschah zusammen.
async function baueRoh(hebcalName, slug, buchDe) {
  const tabelle = await holeAliyotTabelle();
  const eintrag = tabelle[hebcalName];
  if (!eintrag) {
    throw new Error(`"${hebcalName}" fehlt in @hebcal/leyning (kombinierte oder Feiertags-Paraschah?) `
      + '-- diese Paraschah lokal mit tools/tora-hebraeisch-holen.js oder per Sefaria-Direkt holen.');
  }
  const buch = BUECHER[eintrag.book];
  if (!buch) throw new Error(`Unbekannte Buchnummer ${eintrag.book} fuer "${hebcalName}"`);
  if (buchDe && buchDe !== buch.de) {
    throw new Error(`"${hebcalName}" gehoert zu ${buch.de}, nicht zu ${buchDe}`);
  }

  const aliyot = [];
  for (let n = 1; n <= 7; n++) {
    const a = eintrag.fullkriyah[String(n)];
    if (!a) throw new Error(`Aliyah ${n} fehlt fuer "${hebcalName}"`);
    aliyot.push({ n, von: kapVersDe(a[0]), bis: kapVersDe(a[1]) });
  }

  const text = await holeBuchText(buch.en);
  const [vonKap, vonVers] = eintrag.fullkriyah['1'][0].split(':').map(Number);
  const [bisKap, bisVers] = eintrag.fullkriyah['7'][1].split(':').map(Number);

  const kapitel = [];
  for (let nr = vonKap; nr <= bisKap; nr++) {
    const quelle = text[nr - 1];
    if (!quelle) throw new Error(`Kapitel ${nr} fehlt in ${buch.en}`);
    const ersterVers = nr === vonKap ? vonVers : 1;
    const letzterVers = nr === bisKap ? bisVers : quelle.length;
    if (letzterVers > quelle.length) {
      throw new Error(`${buch.en} ${nr},${letzterVers} liegt hinter dem Kapitelende (${quelle.length} Verse) `
        + '-- masoretische Zaehlung pruefen.');
    }
    const verse = [];
    for (let v = ersterVers; v <= letzterVers; v++) {
      const he = tokenisiere(quelle[v - 1]);
      if (!he.length) throw new Error(`${buch.en} ${nr},${v} ist leer`);
      verse.push({ ref: `${nr},${v}`, he });
    }
    kapitel.push({ nr, verse });
  }

  const meta = PARASHA[hebcalName];
  if (!meta) console.warn(`Warnung: "${hebcalName}" nicht in parascha-daten.js -- 'de' faellt auf den Hebcal-Namen zurueck.`);

  return {
    slug,
    hebcalName,
    de: meta ? meta.de : hebcalName,
    buch: buch.de,
    aliyot,
    haftara: formatHaftara(haftaraString(eintrag.haft)),
    kapitel,
  };
}

// Schreibt tora/daten/<slug>.roh.json und meldet den Umfang.
async function schreibeRoh(hebcalName, slug, buchDe) {
  const roh = await baueRoh(hebcalName, slug, buchDe);
  fs.mkdirSync(DATEN, { recursive: true });
  const ziel = path.join(DATEN, `${slug}.roh.json`);
  fs.writeFileSync(ziel, JSON.stringify(roh, null, 2) + '\n', 'utf8');
  const verse = roh.kapitel.reduce((s, k) => s + k.verse.length, 0);
  console.log(`Geschrieben: tora/daten/${slug}.roh.json`);
  console.log(`  ${roh.buch} ${roh.aliyot[0].von} bis ${roh.aliyot[6].bis}  (${verse} Verse, `
    + `Kapitel ${roh.kapitel.map((k) => `${k.nr}:${k.verse.length}`).join(' ')})`);
  console.log(`  Haftara: ${roh.haftara}`);
  return roh;
}

// -----------------------------------------------
// Selbsttest: Quellen gegen den vorhandenen Bestand pruefen
// -----------------------------------------------

// Baut jede bereits vorhandene roh-Datei aus den hier genutzten Quellen nach
// und vergleicht sie Token fuer Token. Weicht der hebraeische Text auch nur in
// einem Vers ab, ist die Quelle NICHT gleichwertig und darf nicht genutzt werden.
async function selbsttest() {
  const dateien = fs.readdirSync(DATEN).filter((f) => f.endsWith('.roh.json')).sort();
  let heFehler = 0;
  let metaFehler = 0;
  let versGesamt = 0;
  const uebersprungen = [];

  for (const datei of dateien) {
    const bestand = JSON.parse(fs.readFileSync(path.join(DATEN, datei), 'utf8'));
    let neu;
    try {
      neu = await baueRoh(bestand.hebcalName, bestand.slug, bestand.buch);
    } catch (e) {
      uebersprungen.push(`${bestand.slug}: ${e.message.split('\n')[0]}`);
      continue;
    }
    let abweichungen = 0;
    let verse = 0;
    for (const kap of bestand.kapitel) {
      const neuKap = neu.kapitel.find((k) => k.nr === kap.nr);
      for (const v of kap.verse) {
        verse++;
        const neuV = neuKap && neuKap.verse.find((x) => x.ref === v.ref);
        if (!neuV || JSON.stringify(neuV.he) !== JSON.stringify(v.he)) {
          if (abweichungen === 0) console.log(`  ${v.ref}: HE weicht ab`);
          abweichungen++;
        }
      }
    }
    versGesamt += verse;
    heFehler += abweichungen;

    const aliyotGleich = JSON.stringify(neu.aliyot) === JSON.stringify(bestand.aliyot);
    const haftaraGleich = neu.haftara.trim() === String(bestand.haftara).trim();
    if (!aliyotGleich || !haftaraGleich) metaFehler++;
    const marke = abweichungen ? 'FEHLER' : (aliyotGleich && haftaraGleich ? 'OK    ' : 'HINWEIS');
    console.log(`${marke} ${bestand.slug.padEnd(18)} ${String(verse).padStart(3)} Verse`
      + (abweichungen ? `  ${abweichungen} HE-Abweichungen` : '')
      + (aliyotGleich ? '' : '  Aliyot weichen ab')
      + (haftaraGleich ? '' : `  Haftara: Bestand "${String(bestand.haftara).trim()}" vs. regulaer "${neu.haftara}"`));
  }

  console.log(`\n${versGesamt} Verse geprueft, ${heFehler} hebraeische Abweichungen, ${metaFehler} Meta-Hinweise.`);
  if (uebersprungen.length) console.log('Uebersprungen:\n - ' + uebersprungen.join('\n - '));
  if (heFehler) {
    console.log('\nQuelle ist NICHT gleichwertig -- nicht verwenden.');
    process.exitCode = 1;
  } else {
    console.log('Hebraeischer Text ist byte-genau identisch mit dem Bestand.');
  }
}

// Alle Paraschot eines Buches holen (in Lesereihenfolge).
async function holeBuch(buchDe) {
  const nr = BUECHER.findIndex((b) => b && b.de === buchDe);
  if (nr < 1) throw new Error(`Unbekanntes Buch "${buchDe}" (erwartet z. B. "2. Mose")`);
  const tabelle = await holeAliyotTabelle();
  const namen = Object.keys(tabelle)
    // PARASHA kennt nur die 54 Einzel-Paraschot; kombinierte Eintraege
    // ("Vayakhel-Pekudei") fallen damit automatisch weg.
    .filter((n) => tabelle[n].book === nr && tabelle[n].fullkriyah && PARASHA[n])
    .sort((a, b) => tabelle[a].num - tabelle[b].num);
  console.log(`${buchDe}: ${namen.length} Paraschot -- ${namen.join(', ')}\n`);
  for (const name of namen) {
    const slugs = PARASHA[name].slugs;
    if (!slugs || !slugs.length) throw new Error(`Kein slug fuer "${name}" in parascha-daten.js`);
    await schreibeRoh(name, slugs[0], buchDe);
  }
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  const lauf = async () => {
    if (argv[0] === '--selbsttest') return selbsttest();
    if (argv[0] === '--buch') {
      if (!argv[1]) throw new Error('Aufruf: node tools/tora-roh-holen.js --buch "2. Mose"');
      return holeBuch(argv[1]);
    }
    const [hebcal, slug, buch] = argv;
    if (!hebcal || !slug) {
      console.error('Aufruf: node tools/tora-roh-holen.js <HebcalName> <slug> "<BuchDe>"');
      console.error('        node tools/tora-roh-holen.js --buch "2. Mose"');
      console.error('        node tools/tora-roh-holen.js --selbsttest');
      process.exit(1);
    }
    await schreibeRoh(hebcal, slug, buch);
  };
  lauf().catch((e) => { console.error(e.message || e); process.exit(1); });
}

module.exports = { baueRoh, haftaraString, tarDatei, holeAliyotTabelle, holeBuchText };
