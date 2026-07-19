const test = require('node:test');
const assert = require('node:assert');
const ELS = require('../entdecken/els');
const daten = require('../entdecken/tora-text.json');

const arr = ELS.vorbereiten(daten.buchstaben);

test('der Text ist vollstaendig geladen', () => {
  assert.ok(daten.buchstaben.length > 300000, 'Text zu kurz');
  assert.strictEqual(arr.length, daten.buchstaben.length);
});

test('jeder Buchstabe liegt im gueltigen Bereich', () => {
  for (let i = 0; i < arr.length; i++) {
    assert.ok(arr[i] < 22, `Position ${i} hat den Wert ${arr[i]}`);
  }
});

test('die Tora beginnt mit Bereschit', () => {
  assert.ok(daten.buchstaben.startsWith('בראשית'));
});

test('die Tora endet mit "vor den Augen von ganz Israel"', () => {
  assert.ok(daten.buchstaben.endsWith('לעיניכלישראל'));
});

// Der klassische Fund, der die Ausrichtung des Textes belegt:
// ab dem ersten Taw jeden fuenfzigsten Buchstaben lesen ergibt "Tora".
test('der ueberlieferte Fund Tora bei Schrittweite 50 findet sich', () => {
  const start = daten.buchstaben.indexOf('ת');
  let wort = '';
  for (let i = 0; i < 4; i++) wort += daten.buchstaben[start + i * 50];
  assert.strictEqual(wort, 'תורה');
});

test('derselbe Fund wiederholt sich in Schemot', () => {
  const schemot = daten.buecher.find((b) => b.name === 'Schemot');
  const ab = daten.buchstaben.slice(schemot.start);
  const start = ab.indexOf('ת');
  let wort = '';
  for (let i = 0; i < 4; i++) wort += ab[start + i * 50];
  assert.strictEqual(wort, 'תורה');
});

test('die Suche findet diesen Fund auch selbst', () => {
  const e = ELS.suche(arr, 'תורה', { maxSprung: 60 });
  const gesucht = e.treffer.find((t) => t.sprung === 50 && t.richtung === 1 && t.position === 5);
  assert.ok(gesucht, 'der Fund an Position 6 mit Schrittweite 50 fehlt');
});

test('ein Wort im Klartext wird bei Schrittweite eins gefunden', () => {
  // "בראשית" steht ganz am Anfang
  const e = ELS.suche(arr, 'בראשית', { maxSprung: 5 });
  const klartext = e.treffer.find((t) => t.sprung === 1 && t.richtung === 1 && t.position === 0);
  assert.ok(klartext, 'der Klartext-Fund am Anfang fehlt');
});

test('rueckwaerts wird ebenfalls gesucht', () => {
  const e = ELS.suche(arr, 'תישארב', { maxSprung: 5 });
  const rueck = e.treffer.find((t) => t.richtung === -1 && t.sprung === 1);
  assert.ok(rueck, 'kein Rueckwaertsfund fuer das umgedrehte Bereschit');
});

test('Endbuchstaben werden auf ihre Grundform gebracht', () => {
  const mitEnd = ELS.wortZuIndex('שלום');
  const ohneEnd = ELS.wortZuIndex('שלומ');
  assert.deepStrictEqual(mitEnd, ohneEnd);
});

test('zu kurze Woerter werden abgewiesen', () => {
  const e = ELS.suche(arr, 'א');
  assert.strictEqual(e.fehler, 'zu-kurz');
  assert.strictEqual(e.anzahl, 0);
});

test('nicht-hebraeische Zeichen werden ignoriert', () => {
  assert.deepStrictEqual(ELS.wortZuIndex('ab תו cd'), ELS.wortZuIndex('תו'));
});

test('die Erwartungsrechnung liefert eine sinnvolle Groessenordnung', () => {
  const f = ELS.haeufigkeiten(arr);
  const idx = ELS.wortZuIndex('תורה');
  const e = ELS.erwartung(idx, arr, 100, f);
  assert.ok(e > 0, 'Erwartung muss groesser null sein');
  assert.ok(e < arr.length, 'Erwartung unrealistisch hoch');
});

test('laengere Woerter sind seltener zu erwarten als kurze', () => {
  const f = ELS.haeufigkeiten(arr);
  const kurz = ELS.erwartung(ELS.wortZuIndex('אב'), arr, 100, f);
  const lang = ELS.erwartung(ELS.wortZuIndex('אברהם'), arr, 100, f);
  assert.ok(lang < kurz, 'ein laengeres Wort muss seltener erwartet werden');
});

test('Buchzuordnung stimmt an den Grenzen', () => {
  const erstes = ELS.buchFuer(daten.buecher, 0);
  assert.strictEqual(erstes.name, 'Bereschit');
  assert.strictEqual(erstes.imBuch, 1);

  const schemot = daten.buecher.find((b) => b.name === 'Schemot');
  const amAnfang = ELS.buchFuer(daten.buecher, schemot.start);
  assert.strictEqual(amAnfang.name, 'Schemot');
  assert.strictEqual(amAnfang.imBuch, 1);

  const davor = ELS.buchFuer(daten.buecher, schemot.start - 1);
  assert.strictEqual(davor.name, 'Bereschit');
});

test('die Umgebung eines Fundes enthaelt die Fundstelle', () => {
  const u = ELS.umgebung(daten.buchstaben, 1000, 20);
  assert.strictEqual(u.text[u.stelleImAusschnitt], daten.buchstaben[1000]);
});

test('die Suche bleibt schnell genug fuer den Browser', () => {
  const start = Date.now();
  ELS.suche(arr, 'ישראל', { maxSprung: 1000 });
  const dauer = Date.now() - start;
  assert.ok(dauer < 5000, `Suche dauerte ${dauer} ms`);
});
