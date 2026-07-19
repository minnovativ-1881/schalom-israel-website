const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// fragen.js ist eine Browser-Datei ohne module.exports. Wir laden den Quelltext
// und werten ihn in einem eigenen Kontext aus.
const quelle = fs.readFileSync(
  path.join(__dirname, '..', 'entdecken', 'hebraeisch-check', 'fragen.js'),
  'utf8'
);
const FRAGEN = new Function(quelle + '; return FRAGEN;')();

test('es sind genau acht Fragen', () => {
  assert.strictEqual(FRAGEN.length, 8);
});

test('jede Frage hat Begriff, Frage, vier Optionen und Erklaerung', () => {
  FRAGEN.forEach((f, i) => {
    assert.ok(f.begriff, `Frage ${i + 1}: begriff fehlt`);
    assert.ok(f.frage, `Frage ${i + 1}: frage fehlt`);
    assert.strictEqual(f.optionen.length, 4, `Frage ${i + 1}: nicht vier Optionen`);
    assert.ok(f.erklaerung, `Frage ${i + 1}: erklaerung fehlt`);
  });
});

test('jeder richtig-Index zeigt auf eine vorhandene Option', () => {
  FRAGEN.forEach((f, i) => {
    assert.ok(
      Number.isInteger(f.richtig) && f.richtig >= 0 && f.richtig < f.optionen.length,
      `Frage ${i + 1}: richtig=${f.richtig} liegt ausserhalb`
    );
  });
});

test('die Begriffe sind eindeutig', () => {
  const namen = FRAGEN.map((f) => f.begriff);
  assert.strictEqual(new Set(namen).size, namen.length, 'doppelte Begriffe: ' + namen.join(', '));
});

test('die Optionen einer Frage sind untereinander verschieden', () => {
  FRAGEN.forEach((f, i) => {
    assert.strictEqual(new Set(f.optionen).size, 4, `Frage ${i + 1}: doppelte Optionen`);
  });
});

test('die richtige Antwort steht nicht immer an derselben Stelle', () => {
  const positionen = new Set(FRAGEN.map((f) => f.richtig));
  assert.ok(positionen.size >= 3, 'zu wenig Streuung der richtigen Antworten: ' + [...positionen].join(','));
});

test('kein Gottesname in Fragen, Optionen oder Erklaerungen', () => {
  const { enthaeltGottesnamen } = require('../api/lib/gottesnamen');
  FRAGEN.forEach((f, i) => {
    const alles = [f.frage, f.erklaerung, ...f.optionen].join(' ');
    assert.strictEqual(enthaeltGottesnamen(alles), false, `Frage ${i + 1} enthaelt einen Gottesnamen`);
  });
});

test('Texte nutzen echte Umlaute statt Ersatzschreibung', () => {
  FRAGEN.forEach((f, i) => {
    const alles = [f.frage, f.erklaerung, ...f.optionen].join(' ');
    assert.ok(
      !/\b(Woerter|hebraeisch|Hebraeisch|zurueck|Bueoen|muessen)\b/.test(alles),
      `Frage ${i + 1} nutzt Ersatzschreibung statt Umlaut`
    );
  });
});
