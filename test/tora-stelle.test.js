const { test } = require('node:test');
const assert = require('node:assert');
const S = require('../tora/lib/stelle.js');
const index = require('../tora/daten/index.json');

const stelle = (buch, kapitel, vers = null, bis = null) => ({ art: 'stelle', buch, kapitel, vers, bis });

test('deutsche Schreibweisen mit Buch', () => {
  assert.deepStrictEqual(S.deuteStelle('5. Mose 6,4'), stelle('devarim', 6, 4));
  assert.deepStrictEqual(S.deuteStelle('5 Mose 6,4'), stelle('devarim', 6, 4));
  assert.deepStrictEqual(S.deuteStelle('5.Mo 6,4'), stelle('devarim', 6, 4));
  assert.deepStrictEqual(S.deuteStelle('1. Buch Mose 1,1'), stelle('bereschit', 1, 1));
});

test('lateinische, englische und hebraeische Buchnamen', () => {
  assert.deepStrictEqual(S.deuteStelle('Dtn 6:4'), stelle('devarim', 6, 4));
  assert.deepStrictEqual(S.deuteStelle('Gen 1,1-5'), stelle('bereschit', 1, 1, 5));
  assert.deepStrictEqual(S.deuteStelle('Exodus 20.2'), stelle('schemot', 20, 2));
  assert.deepStrictEqual(S.deuteStelle('Lev 19,18'), stelle('wajikra', 19, 18));
  assert.deepStrictEqual(S.deuteStelle('Numeri 6,24–26'), stelle('bamidbar', 6, 24, 26));
  assert.deepStrictEqual(S.deuteStelle('Devarim 6,4'), stelle('devarim', 6, 4));
  assert.deepStrictEqual(S.deuteStelle('Vayikra 1'), stelle('wajikra', 1));
  assert.deepStrictEqual(S.deuteStelle('בְּרֵאשִׁית 1,1'), stelle('bereschit', 1, 1));
});

test('nur Kapitel und Vers meint das aktuelle Buch', () => {
  assert.deepStrictEqual(S.deuteStelle('7,12'), stelle(null, 7, 12));
  assert.deepStrictEqual(S.deuteStelle('32'), stelle(null, 32));
});

test('nur ein Buchname fuehrt zur Buch-Uebersicht', () => {
  assert.deepStrictEqual(S.deuteStelle('1. Mose'), { art: 'buch', buch: 'bereschit' });
  assert.deepStrictEqual(S.deuteStelle('Numeri'), { art: 'buch', buch: 'bamidbar' });
});

test('Kapitel ausserhalb des Buches wird gemeldet', () => {
  assert.deepStrictEqual(S.deuteStelle('3. Mose 28,1'),
    { art: 'fehler', grund: 'kapitel', buch: 'wajikra', kapitel: 28, max: 27 });
});

test('Woerter sind keine Stellen', () => {
  assert.strictEqual(S.deuteStelle('Licht'), null);
  assert.strictEqual(S.deuteStelle('Wajischlach'), null);
  assert.strictEqual(S.deuteStelle('   '), null);
});

test('Ziel-URL und Anker', () => {
  assert.strictEqual(S.zielUrl(stelle('devarim', 6, 4)), '/tora/devarim/6/#v6-4');
  assert.strictEqual(S.zielUrl(stelle('bereschit', 1, 1, 5)), '/tora/bereschit/1/#v1-1-5');
  assert.strictEqual(S.zielUrl(stelle('bereschit', 32)), '/tora/bereschit/32/');
  assert.strictEqual(S.zielUrl({ art: 'buch', buch: 'schemot' }), '/tora/schemot/');
  assert.deepStrictEqual(S.deuteAnker('#v32-4'), { kapitel: 32, vers: 4, bis: null });
  assert.deepStrictEqual(S.deuteAnker('#v1-1-5'), { kapitel: 1, vers: 1, bis: 5 });
  assert.strictEqual(S.deuteAnker('#oben'), null);
});

test('Wochenlesung nach Namen, auch in anderer Umschrift und Hebraeisch', () => {
  const ziel = { art: 'stelle', buch: 'bereschit', kapitel: 32, vers: 4, bis: null, paraschah: 'Wajischlach' };
  assert.deepStrictEqual(S.findeParascha('Wajischlach', index), ziel);
  assert.deepStrictEqual(S.findeParascha('vayishlach', index), ziel);
  assert.deepStrictEqual(S.findeParascha('וַיִּשְׁלַח', index), ziel);
  assert.strictEqual(S.findeParascha('Mikez', index).kapitel, 41);
  assert.strictEqual(S.findeParascha('lech-lecha', index).kapitel, 12);
  assert.strictEqual(S.findeParascha('Ki Tetze', index).buch, 'devarim');
  assert.strictEqual(S.findeParascha('Licht', index), null);
});

test('jede Wochenlesung im Verzeichnis ist ueber ihren Namen auffindbar', () => {
  index.forEach(p => {
    const t = S.findeParascha(p.de, index);
    assert.ok(t, 'nicht gefunden: ' + p.de);
    assert.strictEqual(t.paraschah, p.de);
  });
});

test('Teamim entfernen laesst Vokale stehen', () => {
  assert.strictEqual(S.ohneTeamim('וַיִּשְׁלַ֨ח'), 'וַיִּשְׁלַח');
  assert.strictEqual(S.ohneZeichen('וַיִּשְׁלַ֨ח'), 'וישלח');
});
