// =============================================
// SCHALOM ISRAEL - Name auf Hebraeisch, Hauptweg
//
// Fuehrt die beiden Schritte zusammen und setzt die Regeln durch, die weder
// in die Aussprache noch in die Schreibregeln gehoeren:
//   - eingebuergerte Schreibweisen schlagen die Rechenregel
//   - der Gottesname wird nie ausgeschrieben
//   - eine kleine Sperrliste verhindert Ergebnisse, die man niemandem
//     als Namen hinstellt
//
// Kein KI-Aufruf, kein Netz. Gleiche Eingabe heisst immer gleiche Ausgabe.
// Ein Sprachmodell wuerde hebraeische Schreibweisen erfinden, und das wuerde
// hier niemand merken.
//
// Regelwerk mit Begruendungen: REGELN.md im selben Ordner.
//
// UMD, damit ohne Browser testbar.
// =============================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./laute.js'), require('./sprachen.js'), require('./namen-etabliert.js'));
  } else {
    root.NameUmschrift = factory(root.NameLaute, root.NameSprachen, root.NameEtabliert);
  }
})(typeof self !== 'undefined' ? self : this, function (Laute, Sprachen, Etabliert) {

  // ---------- Regel 10: Der Gottesname ----------
  // Das Tetragrammaton wird nie ausgeschrieben, auch nicht, wenn es zufaellig
  // aus einer Lautfolge entstehen wuerde. Geprueft wird mit und ohne
  // Vokalzeichen, denn יְהוָה ist genauso verboten wie יהוה.
  //
  // Das Waw darf auch doppelt stehen: "Jehowa" ergibt ueber die Lautregeln
  // יהווה, weil ein Waw in der Wortmitte verdoppelt wird. Das ist zwar nicht
  // buchstabengleich, wird aber als der Name gelesen, und damit faellt es
  // unter dieselbe Regel.
  const NIKUD = '[֐-ֽֿ-ׇ]*';
  const TETRAGRAMMATON = new RegExp('י' + NIKUD + 'ה' + NIKUD + 'ו{1,2}' + NIKUD + 'ה');

  function enthaeltGottesnamen(wort) {
    return TETRAGRAMMATON.test(String(wort || ''));
  }

  // Dazu die Eingabeseite. Wer den Gottesnamen in lateinischer Schrift
  // eintippt, will ihn in hebraeischer Schrift sehen, und genau das soll
  // das Tool nicht liefern. Auf die Buchstabenfolge der Ausgabe zu warten
  // genuegt hier nicht, weil die Lautregeln daneben liegen koennen.
  const GESPERRTE_EINGABEN = [
    'jahwe', 'jahweh', 'yahwe', 'yahweh', 'jehova', 'jehovah', 'jehowa',
    'jehowah', 'yehova', 'yehovah', 'yehowa', 'yehowah', 'jhwh', 'yhwh',
    'adonai', 'hashem', 'haschem', 'elohim', 'tetragramm', 'tetragrammaton',
  ];

  function istGesperrteEingabe(name) {
    const k = String(name || '').trim().toLowerCase().replace(/[^a-z]/g, '');
    return GESPERRTE_EINGABEN.indexOf(k) !== -1;
  }

  // ---------- Regel 16: Sperrliste ----------
  // Ergebnisse, die als Wort etwas anderes bedeuten, als jemand auf einem
  // Blatt oder spaeter einem Produkt stehen haben will. Geprueft wird auf das
  // ganze Wort, nicht auf Teile: סוניה fuer Sonja ist unverfaenglich, nur das
  // nackte זונה ist das Problem.
  const SPERRLISTE = ['זונה', 'חרא', 'שרמוטה', 'מניאק', 'זין', 'קקי', 'שד', 'צואה'];

  function istGesperrt(wort) {
    return SPERRLISTE.indexOf(String(wort || '')) !== -1;
  }

  // Entschaerft ein gesperrtes Ergebnis, indem der erste Vokal sichtbar
  // gemacht wird. Aus זונה wird זואנה, das liest sich weiter wie der Name,
  // ist aber nicht mehr das Wort.
  function entschaerfe(wort) {
    if (wort.length < 2) return wort;
    return wort.slice(0, 1) + 'א' + wort.slice(1);
  }

  // ---------- Hauptweg ----------

  // Schreibt einen Namen in hebraeischer Schrift.
  //
  // Gibt zurueck:
  //   schrift    die hebraeische Schreibweise
  //   quelle     'eingebuergert' oder 'lautlich'
  //   lesehilfe  wie das Tool den Namen gelesen hat
  //   buchstaben Aufschluesselung, von rechts gelesen
  //   hinweis    gesetzt, wenn etwas angepasst werden musste
  //   sprache    der verwendete Sprachcode
  function schreibe(name, sprache) {
    const code = Sprachen.SPRACHEN[sprache] ? sprache : 'de';
    const sauber = Sprachen.normalisiere(name);
    if (!sauber) {
      return { schrift: '', quelle: 'leer', lesehilfe: '', buchstaben: [], hinweis: '', sprache: code };
    }

    if (istGesperrteEingabe(sauber)) {
      return {
        schrift: '', quelle: 'abgelehnt', lesehilfe: '', buchstaben: [], sprache: code,
        hinweis: 'Das ist kein Vorname, sondern eine Bezeichnung für Gott. Die schreibt dieses Tool nicht.',
      };
    }

    const teile = Sprachen.laute(sauber, code);
    const stuecke = [];
    let alleEingebuergert = teile.length > 0;
    let hinweis = '';

    // Jedes Wort fuer sich. Bei "Anna-Lena" wird jeder Teil eigenstaendig
    // geschrieben, damit Anfangs- und Endregeln je Wort greifen.
    const woerter = sauber.split(/[\s\-']+/).filter(Boolean);

    for (let i = 0; i < teile.length; i++) {
      const wort = woerter[i] || '';
      const fertig = Etabliert.suche(wort, code);

      if (fertig) {
        stuecke.push(fertig);
      } else {
        alleEingebuergert = false;
        stuecke.push(Laute.schreibe(teile[i].laute));
      }
    }

    let schrift = stuecke.filter(Boolean).join('־');

    // Regel 10 vor allem anderen.
    if (enthaeltGottesnamen(schrift)) {
      return {
        schrift: '', quelle: 'abgelehnt', lesehilfe: Sprachen.lesehilfe(teile),
        buchstaben: [], sprache: code,
        hinweis: 'Diese Buchstabenfolge ergäbe den Gottesnamen. Der wird nicht geschrieben.',
      };
    }

    // Regel 16.
    if (istGesperrt(schrift)) {
      schrift = entschaerfe(schrift);
      hinweis = 'Die kürzere Schreibweise ergäbe ein hebräisches Wort mit anderer Bedeutung. Deshalb steht hier ein Alef zusätzlich.';
    }

    return {
      schrift: schrift,
      quelle: alleEingebuergert ? 'eingebuergert' : 'lautlich',
      lesehilfe: alleEingebuergert ? '' : Sprachen.lesehilfe(teile),
      buchstaben: Laute.buchstaben(schrift),
      hinweis: hinweis,
      sprache: code,
    };
  }

  // Dieselbe Schreibweise in allen Sprachen, fuer den Vergleich auf der Seite.
  function alleSprachen(name) {
    return Sprachen.liste().map((s) => {
      const e = schreibe(name, s.code);
      return { code: s.code, name: s.name, schrift: e.schrift, lesehilfe: e.lesehilfe };
    });
  }

  // Zahlenwert der Buchstaben. Rein rechnerisch, dieselben Werte wie im
  // Gematria-Rechner (Seite seit 11/2026 offline, Bibliothek bleibt).
  const WERTE = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80,
    'צ': 90, 'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
    'ך': 20, 'ם': 40, 'ן': 50, 'ף': 80, 'ץ': 90,
  };

  function zahlenwert(wort) {
    let summe = 0;
    for (const c of String(wort || '')) if (WERTE[c]) summe += WERTE[c];
    return summe;
  }

  return {
    schreibe, alleSprachen, zahlenwert,
    enthaeltGottesnamen, istGesperrteEingabe, istGesperrt,
    SPERRLISTE, GESPERRTE_EINGABEN, WERTE,
  };
});
