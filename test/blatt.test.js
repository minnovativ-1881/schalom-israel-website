const test = require('node:test');
const assert = require('node:assert');
const B = require('../entdecken/hebraeischer-geburtstag/blatt');

const ABSATZ = '<p>' + 'Ein Satz mit ordentlicher Laenge, damit die Rechnung stimmt. '.repeat(6) + '</p>';

test('kurzer Impuls bleibt unveraendert', () => {
  const h = '<h2>Titel</h2><p>Kurz.</p>';
  assert.strictEqual(B.kuerzeImpuls(h), h);
});

test('leerer Impuls bleibt leer', () => {
  assert.strictEqual(B.kuerzeImpuls(''), '');
  assert.strictEqual(B.kuerzeImpuls(null), '');
  assert.strictEqual(B.kuerzeImpuls(undefined), '');
});

test('langer Impuls wird gekuerzt', () => {
  const lang = '<h2>Titel</h2>' + ABSATZ.repeat(8);
  const k = B.kuerzeImpuls(lang);
  assert.ok(k.length < lang.length, 'sollte gekuerzt werden');
  assert.ok(k.length <= B.MAX_IMPULS, `${k.length} Zeichen, erlaubt sind ${B.MAX_IMPULS}`);
});

test('gekuerzt wird an einer Absatzgrenze, nie mitten im Satz', () => {
  const lang = '<h2>Titel</h2>' + ABSATZ.repeat(8);
  const k = B.kuerzeImpuls(lang);
  assert.ok(k.endsWith('</p>'), 'muss auf einen geschlossenen Absatz enden, endet auf: ' + k.slice(-20));
});

test('die Zahl der oeffnenden und schliessenden Absaetze stimmt ueberein', () => {
  const lang = '<h2>Titel</h2>' + ABSATZ.repeat(8);
  const k = B.kuerzeImpuls(lang);
  const auf = (k.match(/<p>/g) || []).length;
  const zu = (k.match(/<\/p>/g) || []).length;
  assert.strictEqual(auf, zu, 'kein halb offener Absatz');
});

test('ein einzelner riesiger Absatz wird nicht zerrissen', () => {
  // Kein Schnittpunkt vor MAX_IMPULS: lieber nur den ersten Absatz
  const riesig = '<p>' + 'x'.repeat(5000) + '</p><p>zweiter</p>';
  const k = B.kuerzeImpuls(riesig);
  const auf = (k.match(/<p>/g) || []).length;
  const zu = (k.match(/<\/p>/g) || []).length;
  assert.strictEqual(auf, zu);
  assert.ok(k === '' || k.endsWith('</p>'));
});

test('das Blatt-HTML enthaelt alle Angaben', () => {
  const daten = {
    datumHebraeisch: 'כ׳ בְּאִיָיר תש״נ',
    datumDeutsch: '20. Ijar 5750',
    datumGregorianisch: 'Die., 15. Mai 1990',
    parascha: 'Behar · Bechukotai',
    paraschaHebraeisch: 'בְּהַר',
    paraschaBedeutung: 'Auf dem Berg',
    aliyah: 'Schlischi, der 3. Abschnitt',
    stelle: '3. Mose 25,29–38',
    impulsHtml: '<h2>Gedanke</h2><p>Text.</p>',
    naechster: 'Nächster hebräischer Geburtstag: 27. Mai 2027',
    dateiname: 'Test',
  };
  const html = B.blattHtml(daten);
  ['20. Ijar 5750', 'Behar', 'Schlischi', '3. Mose 25,29–38', 'Schalom Israel', 'schalomisrael.de']
    .forEach((s) => assert.ok(html.includes(s), `"${s}" fehlt im Blatt`));
});

test('das Blatt setzt A4 im Hochformat', () => {
  const html = B.blattHtml({ datumDeutsch: 'x', dateiname: 'x' });
  assert.match(html, /@page\s*\{[^}]*size:\s*A4 portrait/);
});

// Harte Projektregel, auch fuer ein Druckblatt.
test('kein Gottesname im Blatt-Geruest', () => {
  const html = B.blattHtml({ datumDeutsch: 'x', dateiname: 'x' });
  assert.ok(!/JHWH|Jahwe|Jehova|יהוה/.test(html));
});

test('Eingaben werden entschaerft', () => {
  const html = B.blattHtml({ parascha: '<script>alert(1)</script>', datumDeutsch: 'x', dateiname: 'x' });
  assert.ok(!html.includes('<script>alert(1)</script>'), 'Eingabe wurde nicht escaped');
  assert.ok(html.includes('&lt;script&gt;'));
});
