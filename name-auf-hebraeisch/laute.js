// =============================================
// SCHALOM ISRAEL - Laute zu hebraeischer Schrift
//
// Schritt ZWEI der Umschrift. Nimmt eine Lautkette und setzt sie in
// hebraeische Buchstaben. Gilt fuer ALLE Sprachen gleich, denn hier geht es
// nicht mehr um Aussprache, sondern darum, wie hebraeische Schrift funktioniert.
//
// Schritt EINS (Name -> Lautkette) steht je Sprache in sprachen.js.
//
// Das vollstaendige Regelwerk mit Begruendungen: REGELN.md im selben Ordner.
// Wer hier etwas aendert, aendert es dort mit und laesst test/umschrift.test.js
// laufen.
//
// UMD, damit ohne Browser testbar.
// =============================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NameLaute = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  // ---------- Lautinventar ----------
  //
  // Konsonanten
  //   b d f g h k l m n p r s t z     wie erwartet
  //   v    stimmhaftes w/v            (deutsch "Wein", englisch "very")
  //   w    englisches w               (englisch "water")
  //   j    Konsonant-Jud              (deutsch "ja")
  //   sch  ש      zh   ז׳ (franz. j)
  //   tsch צ׳     ts   צ (deutsches z)
  //   ch   כ      (ach-Laut, "Bach")
  //   ks   Doppellaut fuer x
  //
  // Vokale
  //   a e i o u ae oe ue     und @ fuer unbetontes Schwa
  //
  // Doppellaute
  //   ai (deutsch ei), au, oi (deutsch eu), ej (englisch langes a), ui

  const KONSONANT = {
    b: 'ב', d: 'ד', f: 'פ', g: 'ג', h: 'ה', k: 'ק', l: 'ל', m: 'מ',
    n: 'נ', p: 'פ', r: 'ר', s: 'ס', t: 'ט', z: 'ז',
    sch: 'ש', ts: 'צ', ch: 'כ',
    // Drei Zischlaute, die drei verschiedene Sprachen brauchen:
    //   zh   ז׳  franzoesisches j   (Jean, Jacques)
    //   dzh  ג׳  englisches j       (John, George), italienisches gi
    //   tsch צ׳  tsch               (Charles englisch, Cesare italienisch)
    zh: 'ז׳', dzh: 'ג׳', tsch: 'צ׳',
    // Chet fuer das spanische j und g: חואן, חורחה.
    ch_chet: 'ח',
    j: 'י', v: 'ו', w: 'ו', ks: 'קס',
    // Taw fuer das th am Wortanfang: תומאס, תרזה, תורסטן.
    t_taw: 'ת',
  };

  // Was ein Vokal in der Wortmitte schreibt. Leer heisst: gar nichts.
  // Das ist die Hauptregel der hebraeischen Schrift, kurze Vokale stehen nicht
  // da. "Peter" ist פטר, nicht פאטאר.
  const VOKAL_MITTE = {
    a: '', e: '', i: 'י', o: 'ו', u: 'ו',
    ae: '', oe: 'ו', ue: 'ו', '@': '',
  };

  // Am Wortanfang braucht jeder Vokal einen Traeger, es gibt davor keinen
  // Konsonanten, an dem er haengen koennte.
  const VOKAL_ANFANG = {
    a: 'א', e: 'א', i: 'אי', o: 'או', u: 'או',
    ae: 'א', oe: 'או', ue: 'או', '@': 'א',
  };

  const DOPPEL_MITTE = { ai: 'יי', au: 'או', oi: 'וי', ej: 'יי', ui: 'וי' };
  const DOPPEL_ANFANG = { ai: 'איי', au: 'או', oi: 'אוי', ej: 'איי', ui: 'אוי' };

  const ENDFORM = { 'כ': 'ך', 'מ': 'ם', 'נ': 'ן', 'פ': 'ף', 'צ': 'ץ' };

  const VOKALE = ['a', 'e', 'i', 'o', 'u', 'ae', 'oe', 'ue', '@'];
  const DOPPEL = ['ai', 'au', 'oi', 'ej', 'ui'];

  const istVokal = (l) => VOKALE.indexOf(l) !== -1;
  const istDoppel = (l) => DOPPEL.indexOf(l) !== -1;
  const istSelbstlaut = (l) => istVokal(l) || istDoppel(l);

  // Zischlaute am Wortende. Vor ihnen muss ein a sichtbar bleiben, sonst
  // entsteht ein Haufen Konsonanten, den niemand aufloesen kann:
  // "Thomas" ohne Alef waere תומס, und das liest man als Toms.
  const ZISCHLAUT = ['s', 'z', 'sch', 'ts'];

  // ---------- Hilfsfragen an die Lautkette ----------

  // Steht dieses a in der letzten Silbe und direkt vor einem Zischlaut?
  // Dann bekommt es ein Alef. Trifft Thomas, Jonas, Lukas, Klaus, Andreas,
  // Niklas, Tobias. Trifft NICHT Stefan, Roman, Johann, denn dort traegt die
  // Endung -an sich selbst (שטפן, רומן, יוהן).
  function aBrauchtAlef(laute, i) {
    const naechster = laute[i + 1];
    const danach = laute[i + 2];
    if (!naechster) return false;                        // a am Wortende: wird He
    if (istSelbstlaut(naechster)) return false;          // Hiatus, eigene Regel
    if (danach !== undefined) return false;              // nicht die letzte Silbe
    return ZISCHLAUT.indexOf(naechster) !== -1;
  }

  // Waw und Jud sind zugleich Konsonant und Vokalzeichen. Mitten im Wort
  // werden sie als Konsonant verdoppelt, sonst liest man sie als Vokal:
  // "Kevin" ist קווין, nicht קוין.
  function trifftAufWaw(bisher) {
    return bisher.slice(-1) === 'ו';
  }

  // Schreibt ein Vokal-Zeichen, das direkt hinter diesem Waw steht, selbst
  // schon ein Waw? Dann darf es nicht noch einmal gesetzt werden, sonst
  // stehen drei Waw am Wortanfang ("Wolfram" waere ווולפרם).
  function schlucktVokal(laute, i) {
    if (i !== 0) return false;
    const n = laute[1];
    return VOKAL_MITTE[n] === 'ו';
  }

  function schreibeWaw(laute, i, bisher) {
    const amAnfang = i === 0;
    const amEnde = i === laute.length - 1;
    // Direkt hinter einem Waw nie verdoppeln, sonst stehen drei da.
    // "Uwe" wird אווה, nicht אוווה.
    if (trifftAufWaw(bisher)) return 'ו';
    if (amEnde) return 'ו';
    if (amAnfang) {
      // Am Wortanfang verdoppelt, wenn danach ein Vokal folgt, der selbst als
      // Waw geschrieben wird. "Wolfgang" wird וולפגנג, "Vera" dagegen ורה.
      const n = laute[1];
      const schreibtWaw = VOKAL_MITTE[n] === 'ו' || DOPPEL_MITTE[n] === 'או' ||
                          DOPPEL_MITTE[n] === 'וי';
      return schreibtWaw ? 'וו' : 'ו';
    }
    return 'וו';
  }

  function schreibeJud(laute, i, bisher) {
    const amEnde = i === laute.length - 1;
    if (bisher.slice(-1) === 'י') return 'י';
    if (i === 0 || amEnde) return 'י';
    // Konsonant-Jud zwischen zwei Vokalen wird verdoppelt: "Maja" wird מאייה
    // nur dann, wenn davor nichts geschrieben steht. Steht ein Alef davor,
    // genuegt ein Jud.
    const vorher = laute[i - 1];
    const nachher = laute[i + 1];
    if (istSelbstlaut(vorher) && istSelbstlaut(nachher) && bisher.slice(-1) !== 'א') {
      return 'יי';
    }
    return 'י';
  }

  // ---------- Hauptweg ----------

  // Setzt eine Lautkette in hebraeische Buchstaben.
  function schreibe(laute) {
    if (!Array.isArray(laute) || !laute.length) return '';

    let aus = '';
    const letzterIndex = laute.length - 1;
    let ueberspringen = false;

    for (let i = 0; i < laute.length; i++) {
      const laut = laute[i];
      const amAnfang = i === 0;
      const amEnde = i === letzterIndex;
      const vorher = i > 0 ? laute[i - 1] : null;

      if (ueberspringen) { ueberspringen = false; continue; }

      // Zwei Selbstlaute hintereinander brauchen ein Alef dazwischen, sonst
      // verschmelzen sie zu einem. "Christian" wird כריסטיאן, nicht כריסטין,
      // und "Michael" wird מיכאל, nicht מיכל.
      //
      // Nicht aber, wenn der zweite Vokal am Wortende steht und dort als He
      // geschrieben wird: "Mia" ist מיה, nicht מיאה, und "Julia" ist יוליה.
      // Jud und He genuegen sich dort gegenseitig.
      if (!amAnfang && istSelbstlaut(laut) && istSelbstlaut(vorher)) {
        const endetAufHe = amEnde &&
          (laut === 'a' || laut === 'e' || laut === 'ae' || laut === '@');
        // Schreiben beide Vokale schon ein eigenes Zeichen, ist die Folge von
        // sich aus eindeutig und braucht keinen Trenner: "Dario" ist דריו,
        // nicht דריאו, und "Sergio" ist סרחיו.
        const beideSichtbar = !!VOKAL_MITTE[laut] && !!VOKAL_MITTE[vorher];
        if (aus.slice(-1) !== 'א' && !endetAufHe && !beideSichtbar) aus += 'א';
      }

      if (istDoppel(laut)) {
        aus += amAnfang ? DOPPEL_ANFANG[laut] : DOPPEL_MITTE[laut];
        continue;
      }

      if (istVokal(laut)) {
        if (amEnde && (laut === 'a' || laut === 'e' || laut === 'ae' || laut === '@')) {
          // a und e am Wortende werden mit He geschrieben: סבינה, אנה, מרתה.
          aus += amAnfang ? 'א' + 'ה' : 'ה';
        } else if (amAnfang) {
          aus += VOKAL_ANFANG[laut];
        } else if (laut === 'a' && aus.slice(-1) === '׳') {
          // Nach einem Geresch-Buchstaben wird das a sichtbar gemacht, sonst
          // klebt es am naechsten Konsonanten fest. So schreibt die Praxis es
          // auch: ז׳אן, צ׳ארלס, ג׳אקומו, ג׳אני.
          aus += 'א';
        } else if (laut === 'a' && aBrauchtAlef(laute, i)) {
          aus += 'א';
        } else {
          aus += VOKAL_MITTE[laut];
        }
        continue;
      }

      if (laut === 'v' || laut === 'w') {
        aus += schreibeWaw(laute, i, aus);
        if (schlucktVokal(laute, i)) ueberspringen = true;
        continue;
      }
      if (laut === 'j') { aus += schreibeJud(laute, i, aus); continue; }

      const heb = KONSONANT[laut];
      if (!heb) continue;
      // Gleicher Konsonant doppelt wird einfach geschrieben: אנה, nicht אננה.
      if (aus.slice(-heb.length) === heb && vorher === laut) continue;
      aus += heb;
    }

    return mitEndform(lesbarMachen(aus));
  }

  // Ein Wort, von dem nur zwei Buchstaben uebrig bleiben und das mit Waw oder
  // Jud beginnt, ist nicht lesbar: der erste Buchstabe wird dann als Vokal
  // gelesen. "Jan" waere ין, also "in". Ein Alef macht es eindeutig: יאן.
  function lesbarMachen(wort) {
    if (wort.length !== 2) return wort;
    const erster = wort.slice(0, 1);
    if (erster !== 'י' && erster !== 'ו') return wort;
    return erster + 'א' + wort.slice(1);
  }

  // Fuenf Buchstaben haben am Wortende eine eigene Form.
  function mitEndform(wort) {
    if (!wort) return wort;
    // Ein Geresch gehoert zum Buchstaben davor: צ׳ am Ende wird ץ׳.
    if (wort.slice(-1) === '׳') {
      const vor = wort.slice(-2, -1);
      if (ENDFORM[vor]) return wort.slice(0, -2) + ENDFORM[vor] + '׳';
      return wort;
    }
    const letzter = wort.slice(-1);
    if (ENDFORM[letzter]) return wort.slice(0, -1) + ENDFORM[letzter];
    return wort;
  }

  // Namen der Buchstaben, fuer die Aufschluesselung auf der Seite.
  const BUCHSTABEN_NAME = {
    'א': 'Alef', 'ב': 'Bet', 'ג': 'Gimel', 'ד': 'Dalet', 'ה': 'He',
    'ו': 'Waw', 'ז': 'Sajin', 'ח': 'Chet', 'ט': 'Tet', 'י': 'Jud',
    'כ': 'Kaf', 'ך': 'Kaf sofit', 'ל': 'Lamed', 'מ': 'Mem', 'ם': 'Mem sofit',
    'נ': 'Nun', 'ן': 'Nun sofit', 'ס': 'Samech', 'ע': 'Ajin', 'פ': 'Pe',
    'ף': 'Pe sofit', 'צ': 'Zade', 'ץ': 'Zade sofit', 'ק': 'Kuf', 'ר': 'Resch',
    'ש': 'Schin', 'ת': 'Taw',
  };

  // Zerlegt ein hebraeisches Wort in seine Buchstaben, von rechts gelesen.
  // Ein Geresch bleibt beim Buchstaben davor, damit ז׳ und צ׳ zusammen stehen.
  function buchstaben(wort) {
    const aus = [];
    const zeichen = String(wort || '').split('');
    for (let i = 0; i < zeichen.length; i++) {
      const c = zeichen[i];
      if (c === '׳' && aus.length) {
        aus[aus.length - 1].zeichen += c;
        continue;
      }
      if (!BUCHSTABEN_NAME[c]) continue;
      aus.push({ zeichen: c, name: BUCHSTABEN_NAME[c] });
    }
    return aus;
  }

  return {
    schreibe, mitEndform, buchstaben,
    BUCHSTABEN_NAME, KONSONANT, VOKAL_MITTE, VOKAL_ANFANG,
    istVokal, istDoppel, istSelbstlaut,
  };
});
