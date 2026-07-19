// =============================================
// SCHALOM ISRAEL - Rate-Limit
// Zwei Stufen: signiertes Cookie pro Browser + IP-Zaehler pro warmer Instanz.
// Ohne das kann jemand ueber Nacht das Gemini-Kontingent leerlaufen lassen.
// Muster uebernommen aus minnovativ-website/api/generate.js.
// =============================================
const crypto = require('crypto');

// Bewusst knapp: Diese Seiten benutzt man ein- bis zweimal, nicht zwanzigmal.
// Haeufige Namen kommen ohnehin aus dem statischen Zwischenspeicher und
// zaehlen hier gar nicht mit.
const PRO_BROWSER_PRO_STUNDE = 8;
const PRO_BROWSER_PRO_TAG = 25;
const PRO_IP_PRO_STUNDE = 25;
const FENSTER_MS = 60 * 60 * 1000;
const TAG_MS = 24 * 60 * 60 * 1000;

// ACHTUNG: liegt im Arbeitsspeicher und gilt nur pro warmer Instanz. Vercel
// startet mehrere davon, die IP-Grenze ist also weicher als sie aussieht.
// Der verlaessliche Riegel ist das Ausgabenlimit im Google-Cloud-Projekt.
const ipHits = new Map();

function signatur(payload) {
  const secret = process.env.RATE_SECRET || 'entwicklung-unsicher';
  return crypto.createHmac('sha256', secret).update(payload).digest('hex').slice(0, 16);
}

function frisch() {
  const jetzt = Date.now();
  return { stunde: 0, stundeReset: jetzt + FENSTER_MS, tag: 0, tagReset: jetzt + TAG_MS };
}

function leseCookie(req) {
  const roh = (req.headers.cookie || '').split(';').map((s) => s.trim());
  const treffer = roh.find((s) => s.startsWith('rl='));
  if (!treffer) return frisch();

  const wert = decodeURIComponent(treffer.slice(3));
  const teile = wert.split('.');
  if (teile.length !== 5) return frisch();

  const [stunde, stundeReset, tag, tagReset, sig] = teile;
  // Manipulierte Cookies zaehlen wie kein Cookie.
  if (signatur(`${stunde}.${stundeReset}.${tag}.${tagReset}`) !== sig) return frisch();

  const jetzt = Date.now();
  const sr = Number(stundeReset);
  const tr = Number(tagReset);
  const stand = frisch();

  // Fenster einzeln ablaufen lassen: die Stunde laeuft haeufiger ab als der Tag.
  if (sr && sr > jetzt) {
    stand.stunde = Number(stunde) || 0;
    stand.stundeReset = sr;
  }
  if (tr && tr > jetzt) {
    stand.tag = Number(tag) || 0;
    stand.tagReset = tr;
  }
  return stand;
}

function setzeCookie(res, s) {
  const nutz = `${s.stunde}.${s.stundeReset}.${s.tag}.${s.tagReset}`;
  const wert = `${nutz}.${signatur(nutz)}`;
  res.setHeader(
    'Set-Cookie',
    `rl=${encodeURIComponent(wert)}; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Lax`
  );
}

function ipErlaubt(req) {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unbekannt';
  const jetzt = Date.now();
  if (ipHits.size > 5000) ipHits.clear();

  const eintrag = ipHits.get(ip);
  if (!eintrag || eintrag.reset < jetzt) {
    ipHits.set(ip, { count: 1, reset: jetzt + FENSTER_MS });
    return true;
  }
  eintrag.count += 1;
  return eintrag.count <= PRO_IP_PRO_STUNDE;
}

// Prueft vor der Generierung. Der Zaehler wird erst bei Erfolg erhoeht,
// damit ein Fehlschlag den Nutzer nicht sein Kontingent kostet.
function pruefe(req) {
  if (!ipErlaubt(req)) return { erlaubt: false, grund: 'ip' };

  const stand = leseCookie(req);

  if (stand.tag >= PRO_BROWSER_PRO_TAG) {
    const stunden = Math.max(1, Math.ceil((stand.tagReset - Date.now()) / 3600000));
    return { erlaubt: false, grund: 'tag', stunden };
  }
  if (stand.stunde >= PRO_BROWSER_PRO_STUNDE) {
    const minuten = Math.max(1, Math.ceil((stand.stundeReset - Date.now()) / 60000));
    return { erlaubt: false, grund: 'stunde', minuten };
  }
  return { erlaubt: true, stand };
}

function zaehleErfolg(res, ergebnis) {
  const s = ergebnis.stand;
  setzeCookie(res, {
    stunde: s.stunde + 1,
    stundeReset: s.stundeReset,
    tag: s.tag + 1,
    tagReset: s.tagReset,
  });
}

module.exports = {
  pruefe,
  zaehleErfolg,
  leseCookie,
  PRO_BROWSER_PRO_STUNDE,
  PRO_BROWSER_PRO_TAG,
  PRO_IP_PRO_STUNDE,
};
