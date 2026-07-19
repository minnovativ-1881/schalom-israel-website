// =============================================
// Erzeugt entdecken/namen.json: vorbereitete Antworten fuer haeufige Vornamen.
//
// Aufruf (aus dem Repo-Wurzelverzeichnis):
//   node tools/namen-cache-bauen.js            # nur fehlende ergaenzen
//   node tools/namen-cache-bauen.js --neu      # alles neu erzeugen
//
// Der Key kommt aus zugaenge.env und wird nie ausgegeben.
// Jede Antwort laeuft durch dieselben Filter wie im Livebetrieb.
// =============================================
const fs = require('fs');
const path = require('path');

const WURZEL = path.join(__dirname, '..');
const { TOOLS, baueEingaben } = require(path.join(WURZEL, 'api/lib/prompts.js'));
const { saeubere, enthaeltGottesnamen } = require(path.join(WURZEL, 'api/lib/gottesnamen.js'));
const { saeubereStil } = require(path.join(WURZEL, 'api/lib/stil.js'));
const { schluessel } = require(path.join(WURZEL, 'entdecken/namen-cache.js'));
const NAMEN = require('./namen-liste.js');

const ZIEL = path.join(WURZEL, 'entdecken/namen.json');
const NEU = process.argv.includes('--neu');

function keyLesen() {
  const pfad = 'C:/_timon-claude/_fuer-claude/secrets/zugaenge.env';
  const txt = fs.readFileSync(pfad, 'utf8');
  const zeilen = txt.split(/\r?\n/);
  for (let i = 0; i < zeilen.length; i++) {
    if (/Schalom Israel API Gemini/i.test(zeilen[i])) {
      for (let j = i + 1; j < zeilen.length; j++) {
        if (zeilen[j].trim()) return zeilen[j].trim();
      }
    }
  }
  throw new Error('SI-Gemini-Key nicht gefunden');
}

const KEY = keyLesen();
const MODEL = 'gemini-2.5-flash';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function frage(name) {
  const eingaben = baueEingaben('mein-name', { name });
  const prompt = TOOLS['mein-name'].prompt(eingaben);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;

  for (let versuch = 1; versuch <= 4; versuch++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: TOOLS['mein-name'].maxTokens,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (res.ok) {
      const d = await res.json();
      const roh = d?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!roh) throw new Error('kein Text');
      if (enthaeltGottesnamen(roh)) throw new Error('GOTTESNAME');
      return saeubereStil(saeubere(roh));
    }

    if ((res.status === 429 || res.status === 503) && versuch < 4) {
      await sleep(3000 * versuch);
      continue;
    }
    const t = (await res.text()).replace(new RegExp(KEY, 'g'), '<KEY>');
    throw new Error(`HTTP ${res.status}: ${t.slice(0, 120)}`);
  }
}

(async () => {
  let cache = {};
  if (!NEU && fs.existsSync(ZIEL)) {
    cache = JSON.parse(fs.readFileSync(ZIEL, 'utf8'));
    console.log(`Vorhanden: ${Object.keys(cache).length} Eintraege`);
  }

  const offen = NAMEN.filter((n) => !cache[schluessel(n)]);
  console.log(`Zu erzeugen: ${offen.length} von ${NAMEN.length}`);
  if (!offen.length) { console.log('Nichts zu tun.'); return; }

  let ok = 0, fehler = 0;
  for (let i = 0; i < offen.length; i++) {
    const name = offen[i];
    try {
      const text = await frage(name);
      cache[schluessel(name)] = text;
      ok++;
      process.stdout.write(`\r[${i + 1}/${offen.length}] ${name.padEnd(14)} ok:${ok} fehler:${fehler}   `);
      // Zwischenstand sichern, damit ein Abbruch nichts kostet
      if (ok % 10 === 0) fs.writeFileSync(ZIEL, JSON.stringify(cache, null, 0), 'utf8');
    } catch (e) {
      fehler++;
      process.stdout.write(`\r[${i + 1}/${offen.length}] ${name.padEnd(14)} ok:${ok} fehler:${fehler}  (${e.message.slice(0, 40)})\n`);
    }
    await sleep(400);
  }

  fs.writeFileSync(ZIEL, JSON.stringify(cache, null, 0), 'utf8');
  const groesse = (fs.statSync(ZIEL).size / 1024).toFixed(0);
  console.log(`\n\nFertig. ${Object.keys(cache).length} Eintraege, ${groesse} KB.`);
})();
