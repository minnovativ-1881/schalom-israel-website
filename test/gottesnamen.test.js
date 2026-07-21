const test = require('node:test');
const assert = require('node:assert');
const { substituiere, enthaeltGottesnamen, saeubere } = require('../api/lib/gottesnamen');

// ---------------------------------------------------------------
// Regel fuer die Entdecken-Seiten (Timon, 2026-07-19):
// In diesen Texten steht schlicht "Gott". Keine Ersatzschreibungen
// wie Kel, Elokim oder HaSchem. Fuer Artikel und Buecher gilt weiter
// die andere Regel, aber dieser Filter betrifft nur die Werkzeuge.
// ---------------------------------------------------------------

test('Adonai wird zu Gott', () => {
  assert.strictEqual(substituiere('Adonai ist gut'), 'Gott ist gut');
});

test('Elohim wird zu Gott', () => {
  assert.strictEqual(substituiere('Das Wort Elohim steht dort'), 'Das Wort Gott steht dort');
});

test('Elohim mit Genitiv-s wird zu Gottes', () => {
  assert.strictEqual(substituiere('Elohims Wort'), 'Gottes Wort');
});

test('Elohei wird zu Gott', () => {
  assert.strictEqual(substituiere('Elohei Jisrael'), 'Gott Jisrael');
});

test('alleinstehendes El wird zu Gott', () => {
  assert.strictEqual(substituiere('der Name El Schaddai'), 'der Name Gott Schaddai');
});

test('auch die frueheren Ersatzformen werden zu Gott', () => {
  assert.strictEqual(substituiere('Kel hat gegeben'), 'Gott hat gegeben');
  assert.strictEqual(substituiere('Wer ist wie Kel?'), 'Wer ist wie Gott?');
  assert.strictEqual(substituiere('HaSchem rettet'), 'Gott rettet');
  assert.strictEqual(substituiere('Elokim sprach'), 'Gott sprach');
});

test('zerstoert keine Woerter die El enthalten', () => {
  assert.strictEqual(substituiere('Elieser und Elischa in Bethel'), 'Elieser und Elischa in Bethel');
});

test('zerstoert keine Namen die Kel enthalten koennten', () => {
  assert.strictEqual(substituiere('Kelim und Michael'), 'Kelim und Michael');
});

test('nach der Substitution steht nirgends mehr eine Ersatzform', () => {
  const aus = substituiere('Adonai, Elohim, Elokim, HaSchem, Kel und El');
  assert.ok(!/\b(Adonai|Elohim|Elokim|HaSchem|Kel|El)\b/.test(aus), aus);
  assert.ok(aus.includes('Gott'));
});

// ---------------------------------------------------------------
// Der Tetragrammaton bleibt hart verboten. Diese Regel aendert sich nie.
// ---------------------------------------------------------------

test('erkennt JHWH lateinisch', () => {
  assert.strictEqual(enthaeltGottesnamen('Der Name JHWH'), true);
});

test('erkennt Jahwe', () => {
  assert.strictEqual(enthaeltGottesnamen('Jahwe sprach'), true);
});

test('erkennt Jehova', () => {
  assert.strictEqual(enthaeltGottesnamen('Jehova sprach'), true);
});

test('erkennt YHWH englisch', () => {
  assert.strictEqual(enthaeltGottesnamen('the name YHWH'), true);
});

test('erkennt hebraeisches Tetragrammaton', () => {
  assert.strictEqual(enthaeltGottesnamen('steht dort יהוה geschrieben'), true);
});

test('normaler Text loest nicht aus', () => {
  assert.strictEqual(enthaeltGottesnamen('Gott ist der Ewige'), false);
});

test('Jehuda loest nicht faelschlich aus', () => {
  assert.strictEqual(enthaeltGottesnamen('Der Stamm Jehuda zog aus'), false);
});

test('saeubere wirft bei Tetragrammaton', () => {
  assert.throws(() => saeubere('Der Name JHWH'), /Gottesname/);
});

test('saeubere substituiert und gibt zurueck', () => {
  assert.strictEqual(saeubere('Adonai und Elohim'), 'Gott und Gott');
});
