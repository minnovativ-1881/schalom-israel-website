const test = require('node:test');
const assert = require('node:assert');
const ELS = require('../entdecken/els');
const P = require('../entdecken/els-paare');
const daten = require('../entdecken/tora-text.json');

const arr = ELS.vorbereiten(daten.buchstaben);

// ---------- Vers-Zuordnung ----------

test('die Verszahl liegt bei der ueberlieferten Zahl', () => {
  const gesamt = daten.struktur.reduce((s, b) => s + b.reduce((t, k) => t + k, 0), 0);
  assert.strictEqual(gesamt, daten.versStarts.length);
  // Ueberliefert sind 5845 Verse. Die Textausgabe darf leicht abweichen.
  assert.ok(Math.abs(gesamt - 5845) <= 5, `${gesamt} Verse`);
});

test('Versanfaenge steigen streng an', () => {
  for (let i = 1; i < daten.versStarts.length; i++) {
    assert.ok(daten.versStarts[i] > daten.versStarts[i - 1], `Position ${i} steigt nicht an`);
  }
});

const stelle = (pos) => P.stelleFuer(daten.struktur, daten.buecher, P.versFuer(daten.versStarts, pos));

test('Position null ist Bereschit 1,1', () => {
  assert.deepStrictEqual(
    { b: stelle(0).buch, k: stelle(0).kapitel, v: stelle(0).vers },
    { b: 'Bereschit', k: 1, v: 1 }
  );
});

test('der erste Vers hat 28 Buchstaben, danach beginnt Vers 2', () => {
  assert.strictEqual(stelle(27).vers, 1);
  assert.strictEqual(stelle(28).vers, 2);
});

test('jedes Buch beginnt mit Kapitel 1 Vers 1', () => {
  daten.buecher.forEach((b) => {
    const s = stelle(b.start);
    assert.strictEqual(s.buch, b.name);
    assert.strictEqual(s.kapitel, 1);
    assert.strictEqual(s.vers, 1);
  });
});

test('die letzte Position ist Devarim 34,12', () => {
  const s = stelle(daten.anzahl - 1);
  assert.strictEqual(s.buch, 'Devarim');
  assert.strictEqual(s.kapitel, 34);
  assert.strictEqual(s.vers, 12);
});

test('Bereichsangaben werden lesbar zusammengefasst', () => {
  const b = P.stellenBereich(daten.struktur, daten.buecher, daten.versStarts, 0, 200);
  assert.strictEqual(P.bereichText(b), 'Bereschit 1,1–6');
});

test('ein Bereich in einem einzigen Vers nennt nur diesen', () => {
  const b = P.stellenBereich(daten.struktur, daten.buecher, daten.versStarts, 0, 10);
  assert.strictEqual(P.bereichText(b), 'Bereschit 1,1');
});

// ---------- Ausdehnung und Paare ----------

test('die Ausdehnung eines Fundes stimmt', () => {
  const a = P.ausdehnung({ position: 100, sprung: 50, richtung: 1 }, 4);
  assert.strictEqual(a.min, 100);
  assert.strictEqual(a.max, 250);
});

test('die Ausdehnung stimmt auch rueckwaerts', () => {
  const a = P.ausdehnung({ position: 300, sprung: 50, richtung: -1 }, 4);
  assert.strictEqual(a.min, 150);
  assert.strictEqual(a.max, 300);
});

test('zwei Funde am selben Ort ergeben ein enges Paar', () => {
  const A = [{ position: 1000, sprung: 10, richtung: 1 }];
  const B = [{ position: 1005, sprung: 10, richtung: 1 }];
  const r = P.paare(A, 3, B, 3, { maxSpanne: 100 });
  assert.strictEqual(r.anzahl, 1);
  assert.ok(r.paare[0].spanne <= 100);
});

test('weit auseinander liegende Funde ergeben kein Paar', () => {
  const A = [{ position: 1000, sprung: 10, richtung: 1 }];
  const B = [{ position: 90000, sprung: 10, richtung: 1 }];
  const r = P.paare(A, 3, B, 3, { maxSpanne: 100 });
  assert.strictEqual(r.anzahl, 0);
});

test('Paare kommen nach Spanne sortiert, das engste zuerst', () => {
  const A = [{ position: 1000, sprung: 5, richtung: 1 }];
  const B = [
    { position: 1300, sprung: 5, richtung: 1 },
    { position: 1010, sprung: 5, richtung: 1 },
    { position: 1100, sprung: 5, richtung: 1 },
  ];
  const r = P.paare(A, 3, B, 3, { maxSpanne: 500 });
  assert.strictEqual(r.paare.length, 3);
  assert.ok(r.paare[0].spanne < r.paare[1].spanne);
  assert.ok(r.paare[1].spanne < r.paare[2].spanne);
});

// ---------- Erwartungsrechnung ----------
// Diese Funktion lag zweimal daneben: einmal ohne Abzug der Ausdehnung
// (viel zu hoch), einmal mit Mittelwerten statt Summe (viel zu niedrig).

test('sind Funde breiter als die Spanne, ist kein Paar moeglich', () => {
  // Vier Buchstaben mit Schrittweite 200 belegen 601 Positionen.
  const A = [{ position: 0, sprung: 200, richtung: 1 }];
  const B = [{ position: 0, sprung: 200, richtung: 1 }];
  const e = P.erwarteteEngePaare(A, 4, B, 4, 300, 300000);
  assert.strictEqual(e, 0);
});

test('schmale Funde ergeben eine Erwartung groesser null', () => {
  const A = [{ position: 0, sprung: 2, richtung: 1 }];
  const B = [{ position: 0, sprung: 2, richtung: 1 }];
  const e = P.erwarteteEngePaare(A, 3, B, 3, 500, 300000);
  assert.ok(e > 0);
});

test('mehr Funde bedeuten mehr erwartete Paare', () => {
  const eins = [{ position: 0, sprung: 5, richtung: 1 }];
  const zehn = Array.from({ length: 10 }, (_, i) => ({ position: i * 100, sprung: 5, richtung: 1 }));
  const a = P.erwarteteEngePaare(eins, 3, eins, 3, 500, 300000);
  const b = P.erwarteteEngePaare(zehn, 3, zehn, 3, 500, 300000);
  assert.ok(b > a * 50, 'zehnmal so viele Funde muessen deutlich mehr Paare erwarten lassen');
});

test('die Erwartung mischt schmale und breite Funde richtig', () => {
  // Nur der schmale Fund kann Paare bilden, der breite nicht.
  const gemischt = [
    { position: 0, sprung: 2, richtung: 1 },
    { position: 1000, sprung: 400, richtung: 1 },
  ];
  const schmal = [{ position: 0, sprung: 2, richtung: 1 }];
  const gemischtE = P.erwarteteEngePaare(gemischt, 3, schmal, 3, 300, 300000);
  const nurSchmal = P.erwarteteEngePaare(schmal, 3, schmal, 3, 300, 300000);
  // Der breite Fund traegt nichts bei, also muessen beide gleich sein.
  assert.strictEqual(gemischtE, nurSchmal);
});

test('leere Fundmengen ergeben Erwartung null', () => {
  assert.strictEqual(P.erwarteteEngePaare([], 3, [{ position: 0, sprung: 5, richtung: 1 }], 3, 500, 300000), 0);
});

// Der wichtigste Test: an echten Daten muss gefunden und erwartet
// in derselben Groessenordnung liegen. Waere das nicht so, waere die
// Einordnung im Ergebnis irrefuehrend.
test('an echten Daten passen gefundene und erwartete Paare zusammen', () => {
  function funde(wort, maxSprung) {
    const e = ELS.suche(arr, wort, { maxSprung, maxTreffer: 200000 });
    return e.treffer.filter((t) => t.sprung >= 2);
  }
  const A = funde('אברהם', 300);
  const B = funde('יצחק', 300);
  const r = P.paare(A, 5, B, 4, { maxSpanne: 400, maxPaare: 5 });
  const e = P.erwarteteEngePaare(A, 5, B, 4, 400, arr.length);

  assert.ok(r.anzahl > 0, 'es sollten Paare gefunden werden');
  assert.ok(e > 0, 'die Erwartung darf nicht null sein');
  const v = r.anzahl / e;
  assert.ok(v > 0.2 && v < 5, `Verhaeltnis ${v.toFixed(2)} liegt ausserhalb einer plausiblen Spanne`);
});

test('die Paarsuche bleibt schnell genug fuer den Browser', () => {
  const A = ELS.suche(arr, 'שבת', { maxSprung: 400, maxTreffer: 200000 }).treffer.filter((t) => t.sprung >= 2);
  const B = ELS.suche(arr, 'מנוחה', { maxSprung: 400, maxTreffer: 200000 }).treffer.filter((t) => t.sprung >= 2);
  const start = Date.now();
  P.paare(A, 3, B, 5, { maxSpanne: 500, maxPaare: 12 });
  P.erwarteteEngePaare(A, 3, B, 5, 500, arr.length);
  const dauer = Date.now() - start;
  assert.ok(dauer < 4000, `Paarsuche dauerte ${dauer} ms`);
});
