const { test } = require('node:test');
const assert = require('node:assert');
const T = require('../tora/lib/tora-schema.js');

test('parseRef akzeptiert "7,12" und "5. Mose 7,12"', () => {
  assert.deepStrictEqual(T.parseRef('7,12'), { kapitel: 7, vers: 12 });
  assert.deepStrictEqual(T.parseRef('5. Mose 7,12'), { kapitel: 7, vers: 12, buch: '5. Mose' });
});

test('parseRef gibt null bei Unsinn', () => {
  assert.strictEqual(T.parseRef('abc'), null);
});

test('refId erzeugt stabile Anker', () => {
  assert.strictEqual(T.refId('7,12'), '7-12');
});
