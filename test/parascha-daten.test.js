const test = require('node:test');
const assert = require('node:assert');
const { PARASHA, germanizeReference, lookupParasha } = require('../parascha-daten');

test('alle 54 Paraschot sind erfasst', () => {
  assert.strictEqual(Object.keys(PARASHA).length, 54);
});

test('jede Parascha hat deutschen Namen, Hebraeisch, Bedeutung und Slugs', () => {
  for (const [en, e] of Object.entries(PARASHA)) {
    assert.ok(e.de, `${en}: de fehlt`);
    assert.ok(e.he, `${en}: he fehlt`);
    assert.ok(e.meaning, `${en}: meaning fehlt`);
    assert.ok(Array.isArray(e.slugs) && e.slugs.length, `${en}: slugs fehlen`);
  }
});

test('germanize: Bereich ueber mehrere Kapitel', () => {
  assert.strictEqual(germanizeReference('Leviticus 25:1-27:34'), '3. Mose 25,1–27,34');
});

test('germanize: Bereich im selben Kapitel nennt das Kapitel nur einmal', () => {
  assert.strictEqual(germanizeReference('Leviticus 25:29-25:38'), '3. Mose 25,29–38');
});

test('germanize: Bereich ohne Endkapitel', () => {
  assert.strictEqual(germanizeReference('Jeremiah 16:19-17:14'), 'Jer 16,19–17,14');
});

test('germanize: einzelner Vers', () => {
  assert.strictEqual(germanizeReference('Genesis 1:1'), '1. Mose 1,1');
});

test('germanize: unbekanntes Buch bleibt stehen', () => {
  assert.strictEqual(germanizeReference('Foobar 1:1'), 'Foobar 1,1');
});

test('germanize: leere Eingabe', () => {
  assert.strictEqual(germanizeReference(''), '');
});

test('lookup: einzelne Parascha', () => {
  assert.strictEqual(lookupParasha("Sh'lach")[0].de, 'Schelach');
});

test('lookup: kombinierte Parascha', () => {
  const r = lookupParasha('Behar-Bechukotai');
  assert.strictEqual(r.length, 2);
  assert.strictEqual(r[0].de, 'Behar');
  assert.strictEqual(r[1].de, 'Bechukotai');
});

test('lookup: unbekannte Parascha gibt leere Liste', () => {
  assert.deepStrictEqual(lookupParasha('Quatsch'), []);
});

test('Lech-Lecha mit Bindestrich wird nicht faelschlich zerlegt', () => {
  const r = lookupParasha('Lech-Lecha');
  assert.strictEqual(r.length, 1);
  assert.strictEqual(r[0].de, 'Lech Lecha');
});

test('jeder in Artikeln genutzte data-parasha-Wert ist abgedeckt', () => {
  const inArtikeln = [
    'wajchi', 'schoftim', 'ki-tawo', 'kedoschim', 'wajigash', 'waera', 'schemini',
    'schelach', 'pinchas', 'nasso', 'lech-lecha', 'korach', 'bo', 'waetchanan',
    'schlach-lecha', 'mikez', 'ki-tissa', 'beschallach', 'wajakhel', 'toledot',
    'pekudei', 'noach', 'mischpatim', 'ekew', 'behar', 'bamidbar', 'achrei-mot',
    'acharej-mot', 'wajeschew', 'tazria', 'ki-teize', 'emor', 'chukat',
  ];
  const alle = new Set();
  Object.values(PARASHA).forEach((e) => e.slugs.forEach((s) => alle.add(s)));
  const fehlend = inArtikeln.filter((s) => !alle.has(s));
  assert.deepStrictEqual(fehlend, [], `Nicht abgedeckte Slugs: ${fehlend.join(', ')}`);
});
