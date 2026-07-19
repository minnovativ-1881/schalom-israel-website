const test = require('node:test');
const assert = require('node:assert');
const { saeubereStil } = require('../api/lib/stil');

test('ersetzt Gedankenstrich als Trennzeichen durch Komma', () => {
  assert.strictEqual(
    saeubereStil('Wohlbefinden – ein Zustand, in dem alles passt.'),
    'Wohlbefinden, ein Zustand, in dem alles passt.'
  );
});

test('ersetzt auch den langen Gedankenstrich', () => {
  assert.strictEqual(saeubereStil('Ganzheit — mehr als Frieden'), 'Ganzheit, mehr als Frieden');
});

test('ersetzt doppelten Bindestrich', () => {
  assert.strictEqual(saeubereStil('Schalom -- Ganzheit'), 'Schalom, Ganzheit');
});

test('laesst Bibelstellen unberuehrt', () => {
  assert.strictEqual(saeubereStil('3. Mose 25,29–38'), '3. Mose 25,29–38');
});

test('laesst mehrteilige Bibelstellen unberuehrt', () => {
  assert.strictEqual(saeubereStil('5. Mose 1,1–3,22 und Jes 1,1–27'), '5. Mose 1,1–3,22 und Jes 1,1–27');
});

test('laesst Bindestriche in Wortverbindungen unberuehrt', () => {
  assert.strictEqual(saeubereStil('Wissens-Check und Lech-Lecha'), 'Wissens-Check und Lech-Lecha');
});

test('laesst zusammengesetzte Parascha-Namen unberuehrt', () => {
  assert.strictEqual(saeubereStil('Behar-Bechukotai'), 'Behar-Bechukotai');
});

test('raeumt doppelte Kommas auf', () => {
  assert.strictEqual(saeubereStil('Ganzheit, – und mehr'), 'Ganzheit, und mehr');
});

test('leere Eingabe bleibt leer', () => {
  assert.strictEqual(saeubereStil(''), '');
});

test('mehrere Gedankenstriche in einem Text', () => {
  assert.strictEqual(
    saeubereStil('Erstens – so. Zweitens – anders.'),
    'Erstens, so. Zweitens, anders.'
  );
});
