const { test } = require('node:test');
const assert = require('node:assert');
const { deuteSuche, seitenOrt } = require('../tora/lesen.js');

test('deuteSuche erkennt Stellen-Eingabe im aktuellen Buch', () => {
  assert.deepStrictEqual(deuteSuche('7,12'), { art: 'stelle', buch: null, kapitel: 7, vers: 12, bis: null });
});
test('deuteSuche erkennt Stelle in einem anderen Buch', () => {
  // Frueher sprang "5. Mose 6,4" auf einer 1.-Mose-Seite nach 1. Mose 6,4.
  assert.deepStrictEqual(deuteSuche('5. Mose 6,4'), { art: 'stelle', buch: 'devarim', kapitel: 6, vers: 4, bis: null });
});
test('deuteSuche erkennt Wort-Eingabe', () => {
  assert.deepStrictEqual(deuteSuche('Licht'), { art: 'wort', wort: 'Licht' });
});
test('deuteSuche gibt null bei leer', () => {
  assert.strictEqual(deuteSuche('   '), null);
});
test('seitenOrt liest Buch und Kapitel aus dem Pfad', () => {
  assert.deepStrictEqual(seitenOrt('/tora/bereschit/32/'), { buch: 'bereschit', kapitel: 32 });
  assert.deepStrictEqual(seitenOrt('/tora/devarim/'), { buch: 'devarim', kapitel: null });
  assert.deepStrictEqual(seitenOrt('/tora/'), { buch: null, kapitel: null });
});
