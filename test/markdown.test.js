const test = require('node:test');
const assert = require('node:assert');
const { render, escape } = require('../entdecken/markdown');

// Der Fehler, der am 2026-07-19 live ging: Gemini setzte hinter die Ueberschrift
// nur EINEN Zeilenumbruch. Der alte Renderer teilte an Leerzeilen und machte
// daraus eine einzige riesige Ueberschrift.
test('Ueberschrift und Absatz mit nur einem Zeilenumbruch bleiben getrennt', () => {
  const html = render('## Der Name auf Hebräisch\nDer Name Sarah ist alt.');
  assert.strictEqual(html, '<h2>Der Name auf Hebräisch</h2><p>Der Name Sarah ist alt.</p>');
});

test('Ueberschrift und Absatz mit Leerzeile bleiben getrennt', () => {
  const html = render('## Titel\n\nText dazu.');
  assert.strictEqual(html, '<h2>Titel</h2><p>Text dazu.</p>');
});

test('mehrere Ueberschriften direkt hintereinander', () => {
  const html = render('## Eins\nText eins.\n## Zwei\nText zwei.');
  assert.strictEqual(html, '<h2>Eins</h2><p>Text eins.</p><h2>Zwei</h2><p>Text zwei.</p>');
});

test('h3 und h4 werden erkannt', () => {
  assert.strictEqual(render('### Drei'), '<h3>Drei</h3>');
  assert.strictEqual(render('#### Vier'), '<h4>Vier</h4>');
});

test('einfaches Raute-Zeichen wird zu h2', () => {
  assert.strictEqual(render('# Gross'), '<h2>Gross</h2>');
});

test('Listen werden gesammelt', () => {
  const html = render('- eins\n- zwei\n- drei');
  assert.strictEqual(html, '<ul><li>eins</li><li>zwei</li><li>drei</li></ul>');
});

test('Liste nach Ueberschrift ohne Leerzeile', () => {
  const html = render('## Punkte\n- eins\n- zwei');
  assert.strictEqual(html, '<h2>Punkte</h2><ul><li>eins</li><li>zwei</li></ul>');
});

test('Absatz nach Liste beginnt neu', () => {
  const html = render('- eins\n\nDanach Text.');
  assert.strictEqual(html, '<ul><li>eins</li></ul><p>Danach Text.</p>');
});

test('mehrzeiliger Absatz bekommt Zeilenumbrueche', () => {
  assert.strictEqual(render('Zeile eins\nZeile zwei'), '<p>Zeile eins<br>Zeile zwei</p>');
});

test('fett und kursiv', () => {
  assert.strictEqual(render('Das ist **fett** und *kursiv*.'), '<p>Das ist <strong>fett</strong> und <em>kursiv</em>.</p>');
});

test('HTML in der Eingabe wird entschaerft', () => {
  assert.strictEqual(render('<script>alert(1)</script>'), '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
});

test('HTML in einer Ueberschrift wird entschaerft', () => {
  assert.strictEqual(render('## <img src=x onerror=alert(1)>'), '<h2>&lt;img src=x onerror=alert(1)&gt;</h2>');
});

test('leere Eingabe ergibt leeren String', () => {
  assert.strictEqual(render(''), '');
  assert.strictEqual(render(null), '');
});

test('Raute ohne Leerzeichen ist keine Ueberschrift', () => {
  assert.strictEqual(render('#keinTitel'), '<p>#keinTitel</p>');
});

test('hebraeische Schrift bleibt erhalten', () => {
  assert.strictEqual(render('## Name\nSarah (שָׂרָה) ist alt.'), '<h2>Name</h2><p>Sarah (שָׂרָה) ist alt.</p>');
});

test('Bibelstelle mit Gedankenstrich bleibt erhalten', () => {
  assert.strictEqual(render('3. Mose 25,29–38'), '<p>3. Mose 25,29–38</p>');
});

test('escape maskiert die drei kritischen Zeichen', () => {
  assert.strictEqual(escape('<a & b>'), '&lt;a &amp; b&gt;');
});
