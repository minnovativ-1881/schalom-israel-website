const test = require('node:test');
const assert = require('node:assert');

process.env.RATE_SECRET = 'test-geheimnis';
const {
  pruefe, zaehleErfolg, leseCookie,
  PRO_BROWSER_PRO_STUNDE, PRO_BROWSER_PRO_TAG,
} = require('../api/lib/ratelimit');

// Kleine Helfer, die Request und Response nachbilden.
function req(cookie, ip) {
  return { headers: { cookie: cookie || '', 'x-forwarded-for': ip || '1.2.3.4' } };
}
function res() {
  const r = { header: null };
  r.setHeader = (name, wert) => { if (name === 'Set-Cookie') r.header = wert; };
  return r;
}
// Zieht den rl-Wert aus dem Set-Cookie-Header, damit er wieder eingespielt werden kann.
function cookieAus(r) {
  return r.header.split(';')[0];
}

test('ohne Cookie ist die erste Anfrage erlaubt', () => {
  const p = pruefe(req(null, '10.0.0.1'));
  assert.strictEqual(p.erlaubt, true);
  assert.strictEqual(p.stand.stunde, 0);
  assert.strictEqual(p.stand.tag, 0);
});

test('nach einem Erfolg stehen beide Zaehler auf eins', () => {
  const p = pruefe(req(null, '10.0.0.2'));
  const r = res();
  zaehleErfolg(r, p);
  const stand = leseCookie(req(cookieAus(r), '10.0.0.2'));
  assert.strictEqual(stand.stunde, 1);
  assert.strictEqual(stand.tag, 1);
});

test('Stundengrenze greift', () => {
  let cookie = null;
  let ip = '10.0.0.3';
  for (let i = 0; i < PRO_BROWSER_PRO_STUNDE; i++) {
    const p = pruefe(req(cookie, ip));
    assert.strictEqual(p.erlaubt, true, `Anfrage ${i + 1} sollte erlaubt sein`);
    const r = res();
    zaehleErfolg(r, p);
    cookie = cookieAus(r);
  }
  const p = pruefe(req(cookie, ip));
  assert.strictEqual(p.erlaubt, false);
  assert.strictEqual(p.grund, 'stunde');
  assert.ok(p.minuten >= 1);
});

test('manipuliertes Cookie wird verworfen und zaehlt als neu', () => {
  const gefaelscht = 'rl=' + encodeURIComponent('99.9999999999999.99.9999999999999.abcdef1234567890');
  const stand = leseCookie(req(gefaelscht, '10.0.0.4'));
  assert.strictEqual(stand.stunde, 0);
  assert.strictEqual(stand.tag, 0);
});

test('Cookie mit falscher Feldzahl wird verworfen', () => {
  const kaputt = 'rl=' + encodeURIComponent('5.123.abc');
  const stand = leseCookie(req(kaputt, '10.0.0.5'));
  assert.strictEqual(stand.stunde, 0);
});

test('abgelaufene Stunde setzt nur den Stundenzaehler zurueck', () => {
  const crypto = require('crypto');
  const jetzt = Date.now();
  const nutz = `7.${jetzt - 1000}.12.${jetzt + 3600000}`;
  const sig = crypto.createHmac('sha256', 'test-geheimnis').update(nutz).digest('hex').slice(0, 16);
  const cookie = 'rl=' + encodeURIComponent(`${nutz}.${sig}`);

  const stand = leseCookie(req(cookie, '10.0.0.6'));
  assert.strictEqual(stand.stunde, 0, 'Stunde muss zurueckgesetzt sein');
  assert.strictEqual(stand.tag, 12, 'Tageszaehler muss stehen bleiben');
});

test('Tagesgrenze greift auch bei frischer Stunde', () => {
  const crypto = require('crypto');
  const jetzt = Date.now();
  const nutz = `0.${jetzt + 3600000}.${PRO_BROWSER_PRO_TAG}.${jetzt + 7200000}`;
  const sig = crypto.createHmac('sha256', 'test-geheimnis').update(nutz).digest('hex').slice(0, 16);
  const cookie = 'rl=' + encodeURIComponent(`${nutz}.${sig}`);

  const p = pruefe(req(cookie, '10.0.0.7'));
  assert.strictEqual(p.erlaubt, false);
  assert.strictEqual(p.grund, 'tag');
  assert.ok(p.stunden >= 1);
});

test('Tagesgrenze liegt ueber der Stundengrenze', () => {
  assert.ok(PRO_BROWSER_PRO_TAG > PRO_BROWSER_PRO_STUNDE);
});

test('Cookie traegt HttpOnly, Secure und SameSite', () => {
  const p = pruefe(req(null, '10.0.0.8'));
  const r = res();
  zaehleErfolg(r, p);
  assert.match(r.header, /HttpOnly/);
  assert.match(r.header, /Secure/);
  assert.match(r.header, /SameSite=Lax/);
});

test('IP-Grenze greift', () => {
  const ip = '10.0.0.99';
  let letzte = null;
  // Jede Anfrage ohne Cookie, damit nur die IP-Grenze zaehlt.
  for (let i = 0; i < 40; i++) letzte = pruefe(req(null, ip));
  assert.strictEqual(letzte.erlaubt, false);
  assert.strictEqual(letzte.grund, 'ip');
});
