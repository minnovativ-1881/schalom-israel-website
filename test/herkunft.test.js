const test = require('node:test');
const assert = require('node:assert');
process.env.RATE_SECRET = 'test-geheimnis';
const { herkunftErlaubt } = require('../api/lib/ratelimit');

const req = (headers) => ({ headers: headers || {} });

test('Anfrage mit passendem Origin wird durchgelassen', () => {
  assert.strictEqual(herkunftErlaubt(req({ origin: 'https://www.schalomisrael.de' })), true);
});

test('auch ohne www wird durchgelassen', () => {
  assert.strictEqual(herkunftErlaubt(req({ origin: 'https://schalomisrael.de' })), true);
});

test('fremder Origin wird abgewiesen', () => {
  assert.strictEqual(herkunftErlaubt(req({ origin: 'https://boese.example' })), false);
});

test('Anfrage ganz ohne Header wird abgewiesen', () => {
  assert.strictEqual(herkunftErlaubt(req()), false);
});

test('Referer wird als Ersatz akzeptiert', () => {
  assert.strictEqual(
    herkunftErlaubt(req({ referer: 'https://www.schalomisrael.de/entdecken/gematria/' })),
    true
  );
});

test('fremder Referer wird abgewiesen', () => {
  assert.strictEqual(herkunftErlaubt(req({ referer: 'https://boese.example/klau' })), false);
});

// Der Klassiker: eine Domain, die mit unserer beginnt, aber eine andere ist.
test('aehnlich aussehende Domain wird abgewiesen', () => {
  assert.strictEqual(herkunftErlaubt(req({ origin: 'https://www.schalomisrael.de.boese.example' })), false);
});

test('aehnlicher Referer wird abgewiesen', () => {
  assert.strictEqual(herkunftErlaubt(req({ referer: 'https://www.schalomisrael.de.boese.example/x' })), false);
});

test('Origin hat Vorrang vor Referer', () => {
  // Fremder Origin, eigener Referer: Origin entscheidet, also abweisen.
  assert.strictEqual(
    herkunftErlaubt(req({ origin: 'https://boese.example', referer: 'https://www.schalomisrael.de/' })),
    false
  );
});

test('unverschluesselte Herkunft wird abgewiesen', () => {
  assert.strictEqual(herkunftErlaubt(req({ origin: 'http://www.schalomisrael.de' })), false);
});
