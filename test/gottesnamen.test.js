const test = require('node:test');
const assert = require('node:assert');
const { substituiere, enthaeltGottesnamen, saeubere } = require('../api/lib/gottesnamen');

test('substituiert Adonai zu HaSchem', () => {
  assert.strictEqual(substituiere('Adonai ist gut'), 'HaSchem ist gut');
});

test('substituiert Elohim zu Elokim', () => {
  assert.strictEqual(substituiere('Das Wort Elohim steht dort'), 'Das Wort Elokim steht dort');
});

test('substituiert Elohim mit Genitiv-s', () => {
  assert.strictEqual(substituiere('Elohims Wort'), 'Elokims Wort');
});

test('substituiert Elohei', () => {
  assert.strictEqual(substituiere('Elohei Jisrael'), 'Elokei Jisrael');
});

test('substituiert alleinstehendes El zu Kel', () => {
  assert.strictEqual(substituiere('der Name El Schaddai'), 'der Name Kel Schaddai');
});

test('zerstoert keine Woerter die El enthalten', () => {
  assert.strictEqual(substituiere('Elieser und Elischa in Bethel'), 'Elieser und Elischa in Bethel');
});

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
  assert.strictEqual(enthaeltGottesnamen('HaSchem ist der Ewige'), false);
});

test('Jehuda loest nicht faelschlich aus', () => {
  assert.strictEqual(enthaeltGottesnamen('Der Stamm Jehuda zog aus'), false);
});

test('saeubere wirft bei Tetragrammaton', () => {
  assert.throws(() => saeubere('Der Name JHWH'), /Gottesname/);
});

test('saeubere substituiert und gibt zurueck', () => {
  assert.strictEqual(saeubere('Adonai und Elohim'), 'HaSchem und Elokim');
});
