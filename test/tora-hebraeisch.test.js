const { test } = require('node:test');
const assert = require('node:assert');
const { tokenisiere, splitAliyaRef } = require('../tools/tora-hebraeisch-holen.js');

test('tokenisiere trennt an Leerzeichen, hält Maqaf-Wörter zusammen', () => {
  assert.deepStrictEqual(
    tokenisiere('בְּרֵאשִׁית בָּרָא עַל־פְּנֵי'),
    ['בְּרֵאשִׁית', 'בָּרָא', 'עַל־פְּנֵי']
  );
});

test('tokenisiere entfernt Sof-Pasuq am Ende', () => {
  assert.deepStrictEqual(tokenisiere('הָאָרֶץ׃'), ['הָאָרֶץ']);
});

test('tokenisiere behält Ta\'amim im Wort', () => {
  // Wort mit Kantillationszeichen bleibt unverändert erhalten (keine Zeichen entfernt außer Trennern)
  const wort = 'בְּרֵאשִׁ֖ית';
  assert.deepStrictEqual(tokenisiere(wort), [wort]);
});

test('splitAliyaRef zerlegt "7:12"', () => {
  assert.deepStrictEqual(splitAliyaRef('7:12'), { kapitel: 7, vers: 12 });
});

test('tokenisiere entfernt HTML-Tags (Paseq in <b>/<small>)', () => {
  assert.deepStrictEqual(
    tokenisiere('וְהָיָ֣ה&thinsp;<b>׀</b> עֵ֣קֶב'),
    ['וְהָיָ֣ה', 'עֵ֣קֶב']
  );
});

test('tokenisiere entfernt Absatzmarker {פ}/{ס} samt Span', () => {
  assert.deepStrictEqual(
    tokenisiere('לַעֲשׂוֹתָֽם׃&nbsp;<span class="mam-spi-pe">{פ}</span><br>'),
    ['לַעֲשׂוֹתָֽם']
  );
});

test('tokenisiere entfernt Fussnoten-Marker und Fussnotentext', () => {
  assert.deepStrictEqual(
    tokenisiere('הָאָֽרֶץ<sup class="footnote-marker">*</sup><i class="footnote">(בספרי תימן)</i>׃'),
    ['הָאָֽרֶץ']
  );
});

test('tokenisiere behält nur die vokalisierte Qere-Lesart bei Ketiv/Qere', () => {
  assert.deepStrictEqual(
    tokenisiere('וּלְשֹׁמְרֵ֥י <span class="mam-kq"><span class="mam-kq-k">(מצותו)</span> <span class="mam-kq-q">[מִצְוֺתָֽי]</span></span>׃'),
    ['וּלְשֹׁמְרֵ֥י', 'מִצְוֺתָֽי']
  );
});
