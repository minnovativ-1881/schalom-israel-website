const { test } = require('node:test');
const assert = require('node:assert');
const { deuteSuche } = require('../tora/lesen.js');

test('deuteSuche erkennt Stellen-Eingabe', () => {
  assert.deepStrictEqual(deuteSuche('7,12'), { art: 'stelle', kapitel: 7, vers: 12 });
});
test('deuteSuche erkennt Wort-Eingabe', () => {
  assert.deepStrictEqual(deuteSuche('Licht'), { art: 'wort', wort: 'Licht' });
});
test('deuteSuche gibt null bei leer', () => {
  assert.strictEqual(deuteSuche('   '), null);
});
