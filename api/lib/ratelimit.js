// =============================================
// SCHALOM ISRAEL - Rate-Limit
// Zwei Stufen: signiertes Cookie pro Browser + IP-Zaehler pro warmer Instanz.
// Ohne das kann jemand ueber Nacht das Gemini-Kontingent leerlaufen lassen.
// Muster uebernommen aus minnovativ-website/api/generate.js.
// =============================================
const crypto = require('crypto');

const PRO_BROWSER_PRO_STUNDE = 20;
const PRO_IP_PRO_STUNDE = 40;
const FENSTER_MS = 60 * 60 * 1000;

const ipHits = new Map();

function signatur(payload) {
  const secret = process.env.RATE_SECRET || 'entwicklung-unsicher';
  return crypto.createHmac('sha256', secret).update(payload).digest('hex').slice(0, 16);
}

function leseCookie(req) {
  const roh = (req.headers.cookie || '').split(';').map((s) => s.trim());
  const treffer = roh.find((s) => s.startsWith('rl='));
  if (!treffer) return { count: 0, reset: Date.now() + FENSTER_MS };

  const wert = decodeURIComponent(treffer.slice(3));
  const [count, reset, sig] = wert.split('.');
  // Manipulierte Cookies zaehlen wie kein Cookie.
  if (signatur(`${count}.${reset}`) !== sig) return { count: 0, reset: Date.now() + FENSTER_MS };

  const r = Number(reset);
  if (!r || r < Date.now()) return { count: 0, reset: Date.now() + FENSTER_MS };
  return { count: Number(count) || 0, reset: r };
}

function setzeCookie(res, count, reset) {
  const wert = `${count}.${reset}.${signatur(`${count}.${reset}`)}`;
  res.setHeader(
    'Set-Cookie',
    `rl=${encodeURIComponent(wert)}; Path=/; Max-Age=3600; HttpOnly; Secure; SameSite=Lax`
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

  const { count, reset } = leseCookie(req);
  if (count >= PRO_BROWSER_PRO_STUNDE) {
    const minuten = Math.max(1, Math.ceil((reset - Date.now()) / 60000));
    return { erlaubt: false, grund: 'browser', minuten };
  }
  return { erlaubt: true, count, reset };
}

function zaehleErfolg(res, stand) {
  setzeCookie(res, stand.count + 1, stand.reset);
}

module.exports = { pruefe, zaehleErfolg, PRO_BROWSER_PRO_STUNDE, PRO_IP_PRO_STUNDE };
