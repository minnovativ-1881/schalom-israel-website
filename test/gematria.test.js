const test = require('node:test');
const assert = require('node:assert');
const G = require('../entdecken/gematria');

test('Buchstabenwerte sind vollstaendig', () => {
  // 22 Grundbuchstaben plus 5 Endformen
  assert.strictEqual(Object.keys(G.WERTE).length, 27);
});

test('Endformen haben denselben Wert wie ihre Grundform', () => {
  assert.strictEqual(G.WERTE['ך'], G.WERTE['כ']);
  assert.strictEqual(G.WERTE['ם'], G.WERTE['מ']);
  assert.strictEqual(G.WERTE['ן'], G.WERTE['נ']);
  assert.strictEqual(G.WERTE['ף'], G.WERTE['פ']);
  assert.strictEqual(G.WERTE['ץ'], G.WERTE['צ']);
});

// Bekannte Werte, gegen die man rechnen kann.
test('David hat den Wert 14', () => {
  // ד=4 ו=6 ד=4
  assert.strictEqual(G.wert('דוד'), 14);
});

test('Chai hat den Wert 18', () => {
  // ח=8 י=10
  assert.strictEqual(G.wert('חי'), 18);
});

test('Schalom hat den Wert 376', () => {
  // ש=300 ל=30 ו=6 ם=40
  assert.strictEqual(G.wert('שלום'), 376);
});

test('Israel hat den Wert 541', () => {
  // י=10 ש=300 ר=200 א=1 ל=30
  assert.strictEqual(G.wert('ישראל'), 541);
});

test('Tora hat den Wert 611', () => {
  // ת=400 ו=6 ר=200 ה=5
  assert.strictEqual(G.wert('תורה'), 611);
});

test('Nicht-hebraeische Zeichen zaehlen nicht mit', () => {
  assert.strictEqual(G.wert('דוד!? abc'), 14);
});

test('leeres Wort ergibt null', () => {
  assert.strictEqual(G.wert(''), 0);
  assert.strictEqual(G.wert(null), 0);
});

test('ueberlieferte Namen kommen aus der Liste', () => {
  const d = G.hebraeisch('David');
  assert.strictEqual(d.schrift, 'דוד');
  assert.strictEqual(d.quelle, 'ueberliefert');
});

test('Gross- und Kleinschreibung ist egal', () => {
  assert.strictEqual(G.hebraeisch('DAVID').schrift, 'דוד');
  assert.strictEqual(G.hebraeisch('david').schrift, 'דוד');
});

test('Sarah wird als ueberliefert erkannt', () => {
  const s = G.hebraeisch('Sarah');
  assert.strictEqual(s.schrift, 'שרה');
  assert.strictEqual(G.wert(s.schrift), 505);
});

test('unbekannter Name bekommt eine Umschrift, klar gekennzeichnet', () => {
  const k = G.hebraeisch('Kevin');
  assert.strictEqual(k.quelle, 'umschrift');
  assert.ok(k.schrift.length > 0);
});

test('Umschrift setzt am Ende die Endform', () => {
  // "Miriam" ist in der Liste, nehmen wir etwas Unbekanntes auf m
  const u = G.umschreiben('Wilhelm');
  assert.ok(u.endsWith('ם'), 'Endform Mem erwartet, bekam: ' + u);
});

test('sch wird zu einem einzigen Schin', () => {
  assert.strictEqual(G.umschreiben('scha'), 'שא');
});

test('Umlaute werden aufgeloest', () => {
  assert.strictEqual(G.normalisiereName('Jürgen'), 'juergen');
  assert.strictEqual(G.normalisiereName('Käthe'), 'kaethe');
});

test('kleiner Wert reduziert auf eine Ziffer', () => {
  assert.strictEqual(G.kleinerWert(376), 7);  // 3+7+6=16 -> 1+6=7
  assert.strictEqual(G.kleinerWert(14), 5);
  assert.strictEqual(G.kleinerWert(9), 9);
});

test('Zerlegung nennt jeden Buchstaben mit Wert', () => {
  const z = G.zerlegung('דוד');
  assert.deepStrictEqual(z, [
    { buchstabe: 'ד', wert: 4 },
    { buchstabe: 'ו', wert: 6 },
    { buchstabe: 'ד', wert: 4 },
  ]);
});

test('Grundform macht Endbuchstaben rueckgaengig', () => {
  assert.strictEqual(G.grundform('שלום'), 'שלומ');
});

test('jeder Eintrag der Namensliste enthaelt nur hebraeische Buchstaben', () => {
  for (const [name, schrift] of Object.entries(G.ECHTE_NAMEN)) {
    assert.ok(/^[א-ת]+$/.test(schrift), `${name}: "${schrift}" enthaelt Fremdzeichen`);
  }
});

test('jeder Name der Liste ist normalisiert gespeichert', () => {
  for (const name of Object.keys(G.ECHTE_NAMEN)) {
    assert.strictEqual(name, G.normalisiereName(name), `Schluessel "${name}" ist nicht normalisiert`);
  }
});
