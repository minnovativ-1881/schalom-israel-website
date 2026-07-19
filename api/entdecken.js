// =============================================
// SCHALOM ISRAEL - /api/entdecken
// Ein Endpunkt fuer alle vier Entdecken-Tools.
//
// Nacktes fetch statt SDK: so bleibt das Repo ohne package.json und buildfrei.
//
// Environment (Vercel-Dashboard, NIE im Code):
//   GEMINI_API_KEY  - Pflicht
//   RATE_SECRET     - Pflicht
//   GEMINI_MODEL    - optional, Default gemini-2.5-flash
// =============================================
const { saeubere } = require('./lib/gottesnamen');
const { saeubereStil } = require('./lib/stil');
const { pruefe, zaehleErfolg } = require('./lib/ratelimit');
const { TOOLS, baueEingaben } = require('./lib/prompts');

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function rufeGemini(prompt, maxTokens) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY fehlt');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.85,
      maxOutputTokens: maxTokens || 800,
      // Ohne das frisst das Thinking das Token-Budget auf.
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  let letzterStatus = 0;
  for (let versuch = 1; versuch <= 3; versuch++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (res.ok) {
      const daten = await res.json();
      const text =
        daten &&
        daten.candidates &&
        daten.candidates[0] &&
        daten.candidates[0].content &&
        daten.candidates[0].content.parts &&
        daten.candidates[0].content.parts[0] &&
        daten.candidates[0].content.parts[0].text;
      if (!text) throw new Error('Gemini lieferte keinen Text');
      return text;
    }

    letzterStatus = res.status;
    if ((res.status === 503 || res.status === 429) && versuch < 3) {
      await sleep(700 * versuch);
      continue;
    }
    break;
  }
  throw new Error(`Gemini HTTP ${letzterStatus}`);
}

// Ruft Gemini und saeubert. Findet der Gottesnamen-Filter etwas, wird die
// Antwort verworfen und genau einmal neu angefordert. Der Stil-Filter laeuft
// danach und korrigiert still, statt zu verwerfen.
async function generiereGesaeubert(prompt, maxTokens) {
  let letzterFehler;
  for (let versuch = 1; versuch <= 2; versuch++) {
    const roh = await rufeGemini(prompt, maxTokens);
    try {
      return saeubereStil(saeubere(roh));
    } catch (e) {
      letzterFehler = e;
      console.warn(`Gottesname in Antwort (Versuch ${versuch}), fordere neu an`);
    }
  }
  throw new Error(`Antwort konnte nicht gesaeubert werden: ${letzterFehler.message}`);
}

module.exports = async function handler(req, res) {
  // Statusabfrage: GET /api/entdecken?status=1
  // Gibt ausschliesslich Ja/Nein zurueck, niemals Werte. Damit laesst sich in
  // zwei Sekunden pruefen, ob die Konfiguration steht, statt es aus dem
  // Zeitverhalten der Fehlerantwort herzuleiten.
  if (req.method === 'GET' && req.query && req.query.status) {
    res.status(200).json({
      geminiKeyGesetzt: Boolean(process.env.GEMINI_API_KEY),
      rateSecretGesetzt: Boolean(process.env.RATE_SECRET),
      modell: MODEL,
      tools: Object.keys(TOOLS),
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ fehler: 'Nur POST' });
    return;
  }

  const { tool, inputs } = req.body || {};
  if (!TOOLS[tool]) {
    res.status(400).json({ fehler: 'Unbekanntes Werkzeug' });
    return;
  }

  const stand = pruefe(req);
  if (!stand.erlaubt) {
    const text =
      stand.grund === 'browser'
        ? `Du hast in der letzten Stunde schon einige Ergebnisse erstellt. In etwa ${stand.minuten} Minuten geht es weiter.`
        : 'Gerade sind sehr viele Anfragen unterwegs. Bitte versuche es in einer Weile noch einmal.';
    res.status(429).json({ fehler: text });
    return;
  }

  try {
    const eingaben = baueEingaben(tool, inputs);
    const prompt = TOOLS[tool].prompt(eingaben);
    const text = await generiereGesaeubert(prompt, TOOLS[tool].maxTokens);

    if (text.trim() === 'AUSSERHALB') {
      res.status(400).json({
        fehler:
          'Das liegt ausserhalb dessen, wobei dieses Werkzeug helfen kann. Hier geht es um Hebraeisch, den Tanach und juedische Tradition.',
      });
      return;
    }

    zaehleErfolg(res, stand);
    res.status(200).json({ text });
  } catch (e) {
    console.error('entdecken:', e.message);

    // Fehlt der Key, ist das Werkzeug nicht "gerade" kaputt, sondern gar nicht
    // eingerichtet. Dann waere "versuch es gleich nochmal" eine Luege, die den
    // Besucher in eine sinnlose Schleife schickt.
    if (e.message === 'GEMINI_API_KEY fehlt') {
      res.status(503).json({
        fehler: 'Dieses Werkzeug ist noch nicht fertig eingerichtet. Schau in ein paar Tagen wieder vorbei.',
      });
      return;
    }

    res.status(502).json({
      fehler: 'Die Auswertung hat gerade nicht geklappt. Bitte versuche es in einem Moment noch einmal.',
    });
  }
};
