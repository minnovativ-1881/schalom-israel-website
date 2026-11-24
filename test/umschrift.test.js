// =============================================
// SCHALOM ISRAEL - Pruefliste fuer die Namens-Umschrift
//
// Zweck: Wer eine Regel aendert, soll sofort sehen, welche anderen Namen
// dadurch kaputtgehen. Das ist bei einer Regelmaschine der entscheidende
// Punkt, denn eine Verbesserung an einer Stelle verschlechtert leicht
// zwanzig andere.
//
// Lauf: node --test test/*.test.js   (im Wurzelverzeichnis)
// =============================================
const test = require('node:test');
const assert = require('node:assert');

const Laute = require('../name-auf-hebraeisch/laute.js');
const Sprachen = require('../name-auf-hebraeisch/sprachen.js');
const Etabliert = require('../name-auf-hebraeisch/namen-etabliert.js');
const Umschrift = require('../name-auf-hebraeisch/umschrift.js');

const heb = (name, sprache) => Umschrift.schreibe(name, sprache).schrift;

// ---------------------------------------------------------------
// Die einzelnen Schreibregeln
// ---------------------------------------------------------------

test('Regel 1: kurze Vokale werden nicht geschrieben', () => {
  assert.strictEqual(heb('Peter', 'de'), 'פטר');
  assert.strictEqual(heb('Bernd', 'de'), 'ברנד');
  assert.strictEqual(heb('Helga', 'de'), 'הלגה');
});

test('Regel 1b: a in der letzten Silbe vor einem Zischlaut bleibt sichtbar', () => {
  assert.strictEqual(heb('Thomas', 'de'), 'תומאס');
  assert.strictEqual(heb('Jonas', 'de'), 'יונאס');
  // Aber nur in der letzten Silbe, nicht mitten im Wort.
  assert.strictEqual(heb('Ignacio', 'es'), 'איגנסיו');
  // Und nicht bei der Endung -an, die sich selbst traegt.
  assert.strictEqual(heb('Roman', 'de'), 'רומן');
  assert.strictEqual(heb('Johann', 'de'), 'יוהן');
});

test('Regel 2: ein Vokal am Wortanfang bekommt einen Traeger', () => {
  assert.strictEqual(heb('Ursula', 'de'), 'אורסולה');
  assert.strictEqual(heb('Anton', 'de'), 'אנטון');
  assert.strictEqual(heb('Ida', 'de'), 'אידה');
  assert.strictEqual(heb('Otto', 'de'), 'אוטו');
});

test('Regel 3: langes o und u werden Waw, i wird Jud', () => {
  assert.strictEqual(heb('Timon', 'de'), 'טימון');
  assert.strictEqual(heb('Bruno', 'de'), 'ברונו');
  assert.strictEqual(heb('Lina', 'de'), 'לינה');
});

test('Regel 4: a und e am Wortende werden mit He geschrieben', () => {
  assert.strictEqual(heb('Sabine', 'de'), 'סבינה');
  assert.strictEqual(heb('Anna', 'de'), 'אנה');
  assert.strictEqual(heb('Greta', 'de'), 'גרטה');
  assert.strictEqual(heb('Nele', 'de'), 'נלה');
});

test('Regel 5: zwei Vokale werden durch ein Alef getrennt', () => {
  // Das ist der Fehler, an dem eine direkte Buchstabenersetzung scheitert:
  // ohne Alef wird Christian zu Kristin und Michael zu Michal.
  assert.strictEqual(heb('Christian', 'de'), 'כריסטיאן');
  assert.strictEqual(heb('Maximilian', 'de'), 'מקסימיליאן');
  assert.strictEqual(heb('Florian', 'de'), 'פלוריאן');
  assert.strictEqual(heb('Michael', 'de'), 'מיכאל');
});

test('Regel 5b: kein Alef, wenn die Vokalfolge schon eindeutig ist', () => {
  // Jud und He genuegen sich am Wortende gegenseitig.
  assert.strictEqual(heb('Mia', 'de'), 'מיה');
  assert.strictEqual(heb('Julia', 'de'), 'יוליה');
  // Schreiben beide Vokale ein eigenes Zeichen, braucht es keinen Trenner.
  assert.strictEqual(heb('Dario', 'it'), 'דריו');
  assert.strictEqual(heb('Fabio', 'it'), 'פביו');
});

test('Regel 6: Waw und Jud werden in der Wortmitte verdoppelt', () => {
  assert.strictEqual(heb('Kevin', 'de'), 'קווין');
  assert.strictEqual(heb('Sven', 'de'), 'סוון');
  // Aber nie drei Waw hintereinander.
  assert.strictEqual(heb('Uwe', 'de'), 'אווה');
  assert.strictEqual(heb('Wolfram', 'de'), 'וולפרם');
  assert.strictEqual(heb('Wolfgang', 'de'), 'וולפגנג');
});

test('Regel 7: fuenf Buchstaben haben am Wortende eine eigene Form', () => {
  assert.strictEqual(heb('Timon', 'de').slice(-1), 'ן');
  assert.strictEqual(heb('Erich', 'de'), 'אריך');
  assert.strictEqual(heb('Rolf', 'de').slice(-1), 'ף');
  assert.strictEqual(heb('Moritz', 'de'), 'מוריץ');
  // Ein Geresch gehoert zum Buchstaben davor, die Endform greift darunter.
  assert.strictEqual(heb('Paige', 'en'), 'פייג׳');
});

test('Regel 8: doppelte Konsonanten werden einfach geschrieben', () => {
  assert.strictEqual(heb('Anna', 'de'), 'אנה');
  assert.strictEqual(heb('Emma', 'de'), 'אמה');
  assert.strictEqual(heb('Finn', 'de'), 'פין');
});

test('Zusatzregel: nach einem Geresch-Buchstaben wird das a sichtbar', () => {
  assert.strictEqual(heb('Jacques', 'fr'), 'ז׳אק');
  assert.strictEqual(heb('Charles', 'en'), 'צ׳ארלס');
  assert.strictEqual(heb('Giacomo', 'it'), 'ג׳אקומו');
  assert.strictEqual(heb('Gianni', 'it'), 'ג׳אני');
});

test('Zusatzregel: zweibuchstabige Woerter mit Jud oder Waw bekommen ein Alef', () => {
  // Ohne das Alef liest man ין als "in" und nicht als "Jan".
  assert.strictEqual(heb('Jan', 'de'), 'יאן');
});

// ---------------------------------------------------------------
// Die Sprachwahl, der eigentliche Kern des Tools
// ---------------------------------------------------------------

test('dieselbe Schreibung ergibt je Sprache einen anderen Namen', () => {
  assert.strictEqual(heb('Michael', 'de'), 'מיכאל');
  assert.strictEqual(heb('Michael', 'en'), 'מייקל');

  assert.strictEqual(heb('Charles', 'en'), 'צ׳ארלס');
  assert.strictEqual(heb('Charles', 'fr'), 'שארל');

  assert.strictEqual(heb('Jean', 'fr'), 'ז׳אן');
  assert.strictEqual(heb('Jean', 'en'), 'ג׳ין');

  // Dasselbe J, drei Sprachen, drei Buchstaben:
  // englisch Gimel, franzoesisch Sajin, spanisch Chet.
  assert.strictEqual(heb('Jordan', 'en').slice(0, 2), 'ג׳');
  assert.strictEqual(heb('Jerome', 'fr').slice(0, 2), 'ז׳');
  assert.strictEqual(heb('Joaquin', 'es').slice(0, 1), 'ח');
});

test('Franzoesisch: stumme Endungen fallen weg', () => {
  assert.strictEqual(heb('Margaux', 'fr'), 'מרגו');
  assert.strictEqual(heb('Therese', 'fr'), 'תרז');
  assert.strictEqual(heb('Remi', 'fr'), 'רמי');
});

test('Franzoesisch: Nasale nur vor Konsonanten', () => {
  // "Damien" ist damjen, nicht danjan.
  assert.strictEqual(heb('Damien', 'fr'), 'דמיאן');
  assert.strictEqual(heb('Jerome', 'fr'), 'ז׳רום');
  assert.strictEqual(heb('Sandrine', 'fr'), 'סנדרין');
  // Vor Konsonant greift der Nasal dagegen.
  assert.strictEqual(heb('Quentin', 'fr'), 'קנטן');
});

test('Spanisch: h ist stumm, j ist Chet, z ist s', () => {
  assert.strictEqual(heb('Hugo', 'es'), 'אוגו');
  assert.strictEqual(heb('Joaquin', 'es'), 'חואקין');
  assert.strictEqual(heb('Gerardo', 'es'), 'חררדו');
});

test('Italienisch: c und g vor e und i, ch und gn', () => {
  assert.strictEqual(heb('Cecilia', 'it'), 'צ׳צ׳יליה');
  assert.strictEqual(heb('Chiara', 'it'), 'קיארה');
  assert.strictEqual(heb('Luigi', 'it'), 'לואיג׳י');
  assert.strictEqual(heb('Sergio', 'it'), 'סרג׳ו');
});

test('Deutsch: ch wird Kaf, th am Wortanfang wird Taw', () => {
  assert.strictEqual(heb('Christoph', 'de'), 'כריסטוף');
  assert.strictEqual(heb('Thorsten', 'de'), 'תורסטן');
  assert.strictEqual(heb('Mathilde', 'de'), 'מתילדה');
});

// ---------------------------------------------------------------
// Regel 9: eingebuergerte Schreibweisen
// ---------------------------------------------------------------

test('Regel 9: die Liste schlaegt die Rechenregel', () => {
  assert.strictEqual(heb('David', 'de'), 'דוד');
  assert.strictEqual(heb('Sarah', 'de'), 'שרה');
  assert.strictEqual(heb('Mirjam', 'de'), 'מרים');
  assert.strictEqual(Umschrift.schreibe('David', 'de').quelle, 'eingebuergert');
});

test('Regel 9: die Liste schreibt nie den Namen um', () => {
  // Das ist der ausdrueckliche Unterschied zum Tool unter /entdecken/:
  // hier wird geschrieben, wie der Name klingt, nicht was er bedeutet.
  assert.strictEqual(heb('Hans', 'de'), 'הנס');        // nicht יוחנן
  assert.strictEqual(heb('Anna', 'de'), 'אנה');        // nicht חנה
  assert.strictEqual(heb('Matthias', 'de'), 'מתיאס');  // nicht מתתיהו
  assert.strictEqual(heb('Thomas', 'de'), 'תומאס');    // nicht תאומא
  assert.strictEqual(heb('Elisabeth', 'de'), 'אליזבת'); // nicht אלישבע
});

test('jeder Eintrag der Liste ist eine saubere hebraeische Schreibweise', () => {
  const erlaubt = /^[א-ת׳־ ]+$/;
  const pruefe = (tabelle, wo) => {
    for (const k in tabelle) {
      const wert = tabelle[k];
      assert.ok(erlaubt.test(wert), `${wo}: ${k} -> ${wert} enthält fremde Zeichen`);
      assert.ok(!Umschrift.enthaeltGottesnamen(wert), `${wo}: ${k} enthält den Gottesnamen`);
      assert.ok(!Umschrift.istGesperrt(wert), `${wo}: ${k} steht auf der Sperrliste`);
    }
  };
  pruefe(Etabliert.UEBERALL, 'UEBERALL');
  for (const s in Etabliert.JE_SPRACHE) pruefe(Etabliert.JE_SPRACHE[s], s);
});

test('die Liste deckt mehr als 300 Namen ab', () => {
  assert.ok(Etabliert.anzahl() > 300, `nur ${Etabliert.anzahl()} Einträge`);
});

// ---------------------------------------------------------------
// Regel 10 und 16: die Sicherheitsregeln
// ---------------------------------------------------------------

test('Regel 10: der Gottesname wird nie ausgeschrieben', () => {
  assert.ok(Umschrift.enthaeltGottesnamen('יהוה'));
  assert.ok(Umschrift.enthaeltGottesnamen('יְהוָה'), 'auch mit Vokalzeichen');
  assert.ok(!Umschrift.enthaeltGottesnamen('יהודה'), 'Jehuda ist kein Gottesname');

  // Kein Name darf die Folge erzeugen, auch nicht ueber die Lautregeln.
  const e = Umschrift.schreibe('Jehowa', 'de');
  assert.strictEqual(e.quelle, 'abgelehnt');
  assert.strictEqual(e.schrift, '');
  assert.ok(e.hinweis.length > 0);
});

test('Regel 10 gilt fuer jedes Ergebnis des Tools', () => {
  const namen = ['Jehova', 'Yehowah', 'Jahwe', 'Jehowah'];
  for (const n of namen) {
    for (const s of ['de', 'en', 'fr', 'es', 'it']) {
      const schrift = Umschrift.schreibe(n, s).schrift;
      assert.ok(!Umschrift.enthaeltGottesnamen(schrift), `${n}/${s} ergab ${schrift}`);
    }
  }
});

test('Regel 16: gesperrte Ergebnisse werden entschaerft', () => {
  const e = Umschrift.schreibe('Sona', 'de');
  assert.ok(!Umschrift.istGesperrt(e.schrift));
  // Unverfaengliche Namen bleiben unberuehrt.
  assert.strictEqual(Umschrift.schreibe('Sonja', 'de').hinweis, '');
});

// ---------------------------------------------------------------
// Verhalten und Robustheit
// ---------------------------------------------------------------

test('kein Netz, kein Zufall: gleiche Eingabe heisst gleiche Ausgabe', () => {
  for (let i = 0; i < 20; i++) {
    assert.strictEqual(heb('Christian', 'de'), 'כריסטיאן');
  }
});

test('Doppelnamen bleiben getrennt', () => {
  const e = Umschrift.schreibe('Anna-Lena', 'de');
  assert.strictEqual(e.schrift, 'אנה־לנה');
  const zwei = Umschrift.schreibe('Hans Peter', 'de');
  assert.strictEqual(zwei.schrift, 'הנס־פטר');
});

test('leere und unsinnige Eingaben kippen nicht um', () => {
  assert.strictEqual(Umschrift.schreibe('', 'de').schrift, '');
  assert.strictEqual(Umschrift.schreibe('   ', 'de').schrift, '');
  assert.strictEqual(Umschrift.schreibe('123', 'de').schrift, '');
  assert.strictEqual(Umschrift.schreibe(null, 'de').schrift, '');
  assert.strictEqual(Umschrift.schreibe(undefined, 'de').schrift, '');
  assert.doesNotThrow(() => Umschrift.schreibe('Peter', 'klingonisch'));
  // Eine unbekannte Sprache faellt auf Deutsch zurueck.
  assert.strictEqual(Umschrift.schreibe('Peter', 'klingonisch').sprache, 'de');
});

test('Gross- und Kleinschreibung und Leerzeichen sind gleichgueltig', () => {
  assert.strictEqual(heb('PETER', 'de'), heb('peter', 'de'));
  assert.strictEqual(heb('  Peter  ', 'de'), heb('Peter', 'de'));
});

test('jedes Ergebnis besteht nur aus hebraeischen Zeichen', () => {
  const erlaubt = /^[א-ת׳־]*$/;
  const proben = ['Peter', 'Jürgen', 'François', 'José', 'Chiara', 'Ashley', 'Müller'];
  for (const n of proben) {
    for (const s of ['de', 'en', 'fr', 'es', 'it']) {
      const schrift = Umschrift.schreibe(n, s).schrift;
      assert.ok(erlaubt.test(schrift), `${n}/${s} ergab ${schrift}`);
    }
  }
});

test('die Aufschluesselung nennt jeden Buchstaben', () => {
  const e = Umschrift.schreibe('Timon', 'de');
  const namen = e.buchstaben.map((b) => b.name);
  assert.deepStrictEqual(namen, ['Tet', 'Jud', 'Mem', 'Waw', 'Nun sofit']);
});

test('die Lesehilfe zeigt, wie das Tool den Namen gelesen hat', () => {
  // Nur wo wirklich gerechnet wurde. Bei einer eingebuergerten Schreibweise
  // gibt es nichts zu erklaeren, und sie bleibt deshalb leer.
  assert.strictEqual(Umschrift.schreibe('Sabine', 'de').lesehilfe, 'sabine');
  assert.strictEqual(Umschrift.schreibe('Quentin', 'fr').lesehilfe, 'kanten');
  assert.strictEqual(Umschrift.schreibe('David', 'de').lesehilfe, '');
});

test('Regel 10 gilt auch fuer die Eingabe', () => {
  // Wer den Gottesnamen eintippt, will ihn in hebraeischer Schrift sehen.
  for (const n of ['Jahwe', 'Jehova', 'Yahweh', 'JHWH', 'Adonai', 'HaSchem']) {
    const e = Umschrift.schreibe(n, 'de');
    assert.strictEqual(e.quelle, 'abgelehnt', `${n} wurde nicht abgelehnt`);
    assert.strictEqual(e.schrift, '');
  }
  // Ein Vorname, der nur aehnlich klingt, bleibt erlaubt.
  assert.strictEqual(Umschrift.schreibe('Jehuda', 'de').schrift, 'יהודה');
});

test('der Zahlenwert rechnet wie der Gematria-Rechner', () => {
  assert.strictEqual(Umschrift.zahlenwert('דוד'), 14);
  assert.strictEqual(Umschrift.zahlenwert('שלום'), 376);
  // Endbuchstaben zaehlen wie ihre Grundform.
  assert.strictEqual(Umschrift.zahlenwert('טימון'), 9 + 10 + 40 + 6 + 50);
});

test('alle fuenf Sprachen antworten', () => {
  const liste = Sprachen.liste();
  assert.strictEqual(liste.length, 5);
  const alle = Umschrift.alleSprachen('Michael');
  assert.strictEqual(alle.length, 5);
  for (const e of alle) assert.ok(e.schrift.length > 0, `${e.code} leer`);
});

test('die Laut-Schicht arbeitet ohne die Sprach-Schicht', () => {
  // Beide Schritte sind getrennt und einzeln pruefbar.
  assert.strictEqual(Laute.schreibe(['p', 'e', 't', 'e', 'r']), 'פטר');
  assert.strictEqual(Laute.schreibe(['k', 'e', 'v', 'i', 'n']), 'קווין');
});

// ---------------------------------------------------------------
// Die Beispiele, die auf der Seite im Text stehen
// ---------------------------------------------------------------

test('jedes Beispiel im Seitentext stimmt mit der Ausgabe ueberein', () => {
  // Wer eine Regel aendert und dabei eines dieser Beispiele verschiebt,
  // muss auch den Text auf index.html anpassen. Deshalb stehen sie hier.
  const imText = [
    ['Peter', 'de', 'פטר'],
    ['Bernd', 'de', 'ברנד'],
    ['Ursula', 'de', 'אורסולה'],
    ['Ida', 'de', 'אידה'],
    ['Sabine', 'de', 'סבינה'],
    ['Anna', 'de', 'אנה'],
    ['Christian', 'de', 'כריסטיאן'],
    ['Michael', 'de', 'מיכאל'],
    ['Michael', 'en', 'מייקל'],
    ['Kevin', 'de', 'קווין'],
    ['Uwe', 'de', 'אווה'],
    ['Timon', 'de', 'טימון'],
    ['David', 'de', 'דוד'],
    ['Hans', 'de', 'הנס'],
    ['John', 'en', 'ג׳ון'],
    ['Jean', 'fr', 'ז׳אן'],
    ['Juan', 'es', 'חואן'],
  ];
  for (const [name, sprache, erwartet] of imText) {
    assert.strictEqual(heb(name, sprache), erwartet, `${name} (${sprache})`);
  }
});
