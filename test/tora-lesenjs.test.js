const { test } = require('node:test');
const assert = require('node:assert');
const { gruppenIndex } = require('../tora/lesen.js');

test('gruppenIndex bündelt Tokens nach data-g', () => {
  const idx = gruppenIndex([{ g: 'a1' }, { g: 'a2' }, { g: 'a1' }]);
  assert.deepStrictEqual(idx.a1, [0, 2]);
  assert.deepStrictEqual(idx.a2, [1]);
});
