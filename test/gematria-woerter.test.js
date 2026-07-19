const test = require('node:test');
const assert = require('node:assert');
const G = require('../entdecken/gematria');
const W = require('../entdecken/gematria-woerter');

test('die Liste hat eine sinnvolle Groesse', () => {
  assert.ok(W.length >= 150, `nur ${W.length} Woerter`);
});

test('jeder Eintrag hat Schreibweise, Umschrift und Bedeutung', () => {
  W.forEach((x, i) => {
    assert.ok(x.w, `Eintrag ${i}: Schreibweise fehlt`);
    assert.ok(x.t, `Eintrag ${i} (${x.w}): Umschrift fehlt`);
    assert.ok(x.b, `Eintrag ${i} (${x.w}): Bedeutung fehlt`);
  });
});

test('Schreibweisen enthalten nur hebraeische Buchstaben', () => {
  W.forEach((x) => {
    assert.ok(/^[א-ת]+$/.test(x.w), `"${x.w}" (${x.t}) enthaelt Fremdzeichen`);
  });
});

test('keine doppelten Schreibweisen', () => {
  const gesehen = new Map();
  W.forEach((x) => {
    assert.ok(!gesehen.has(x.w), `"${x.w}" doppelt: ${gesehen.get(x.w)} und ${x.t}`);
    gesehen.set(x.w, x.t);
  });
});

test('jedes Wort hat einen Wert groesser null', () => {
  W.forEach((x) => {
    assert.ok(G.wert(x.w) > 0, `${x.t} hat Wert 0`);
  });
});

// Klassische Werte, an denen sich die Liste messen lassen muss.
test('bekannte Gematria-Werte stimmen', () => {
  const soll = {
    'אחד': 13, 'אהבה': 13, 'חי': 18, 'שלום': 376, 'תורה': 611,
    'ישראל': 541, 'אמת': 441, 'דוד': 14, 'עין': 130, 'סיני': 130,
  };
  for (const [wort, wert] of Object.entries(soll)) {
    const eintrag = W.find((x) => x.w === wort);
    assert.ok(eintrag, `${wort} fehlt in der Liste`);
    assert.strictEqual(G.wert(wort), wert, `${wort} sollte ${wert} sein`);
  }
});

test('das klassische Paar echad und ahawa hat denselben Wert', () => {
  assert.strictEqual(G.wert('אחד'), G.wert('אהבה'));
});

test('ajin, sulam und Sinai haben alle den Wert 130', () => {
  assert.strictEqual(G.wert('עין'), 130);
  assert.strictEqual(G.wert('סלם'), 130);
  assert.strictEqual(G.wert('סיני'), 130);
});

test('Bedeutungen nutzen echte Umlaute', () => {
  W.forEach((x) => {
    assert.ok(
      !/\b(Woerter|Koenig|Staerke|Fuesse|Gebaeude)\b/.test(x.b),
      `${x.t}: Ersatzschreibung in "${x.b}"`
    );
  });
});

test('kein Gottesname in der Liste', () => {
  const { enthaeltGottesnamen } = require('../api/lib/gottesnamen');
  W.forEach((x) => {
    assert.strictEqual(
      enthaeltGottesnamen(x.w + ' ' + x.t + ' ' + x.b), false,
      `${x.t} enthaelt einen Gottesnamen`
    );
  });
});

test('genug Werte haben mehrere Woerter, sonst sind Treffer zu selten', () => {
  const nachWert = {};
  W.forEach((x) => {
    const v = G.wert(x.w);
    (nachWert[v] = nachWert[v] || []).push(x);
  });
  const mehrfach = Object.values(nachWert).filter((l) => l.length > 1);
  assert.ok(mehrfach.length >= 15, `nur ${mehrfach.length} Werte mit mehreren Woertern`);
});
