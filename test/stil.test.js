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

// ---------- Briefreflex ----------
// Echter Fall vom 2026-07-24: Gemini stellte dem Impuls trotz Prompt-Regel
// eine Anrede voran und haengte einen Segenswunsch an.

test('Anrede vor der ersten Ueberschrift faellt weg', () => {
  const roh = 'Lieber Leser,\n\nherzlichen Glückwunsch zu deinem hebräischen Geburtstag! '
    + 'Es ist wunderbar, dass du dich mit dem Tanach beschäftigst.\n\n'
    + '## Worum es in diesem Abschnitt geht\n\nIn diesen Versen geht es um Besitz.';
  const aus = saeubereStil(roh);
  assert.ok(aus.startsWith('## Worum es'), 'beginnt mit: ' + aus.slice(0, 40));
  assert.ok(!aus.includes('Lieber Leser'));
  assert.ok(!aus.includes('wunderbar'));
});

test('Text ohne Ueberschrift bleibt unangetastet', () => {
  const roh = 'Ein Absatz ohne jede Überschrift, der vollständig erhalten bleiben muss.';
  assert.strictEqual(saeubereStil(roh), roh);
});

test('Text, der schon mit der Ueberschrift beginnt, bleibt unangetastet', () => {
  const roh = '## Der Name auf Hebräisch\n\nDavid heißt דוד.';
  assert.strictEqual(saeubereStil(roh), roh);
});

test('Segenswunsch am Ende faellt weg', () => {
  const roh = '## Ein Gedanke\n\nEigentum ist nicht absolut. '
    + 'Möge es ein Jahr voller Segen und tiefer Verbundenheit sein.';
  assert.strictEqual(saeubereStil(roh), '## Ein Gedanke\n\nEigentum ist nicht absolut.');
});

test('Gruss auf eigener Zeile faellt weg', () => {
  const roh = '## Titel\n\nEin Satz.\n\nIch wünsche dir ein gesegnetes Jahr.';
  assert.ok(!saeubereStil(roh).includes('wünsche'));
});

// Ein Segensspruch aus der Quelle ist Inhalt, keine Grussformel.
test('ein Segensspruch in Anfuehrungszeichen bleibt stehen', () => {
  const roh = '## Ein Gedanke\n\nDer Priestersegen sagt: "Möge er dich behüten."';
  assert.strictEqual(saeubereStil(roh), roh);
});

test('ein Satz mit Möge mitten im Text bleibt stehen', () => {
  const roh = '## Titel\n\nMöge er dich behüten, heißt es dort. Der Abschnitt geht weiter.';
  assert.strictEqual(saeubereStil(roh), roh);
});
