// =============================================
// SCHALOM ISRAEL - Aussprache-Regeln je Sprache
//
// Schritt EINS der Umschrift. Zerlegt einen geschriebenen Namen in seine
// Laute. Nur hier entscheidet die angeklickte Sprache mit.
//
// Danach uebernimmt laute.js und setzt die Lautkette in hebraeische
// Buchstaben, fuer alle Sprachen nach denselben Regeln.
//
// Eine neue Sprache hinzufuegen heisst: einen Eintrag in SPRACHEN ergaenzen.
// Sonst muss nichts angefasst werden.
//
// Lautinventar und Schreibregeln: siehe laute.js und REGELN.md.
//
// UMD, damit ohne Browser testbar.
// =============================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NameSprachen = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  const VOKALBUCHSTABE = 'aeiouyäöü';
  const istV = (c) => c !== undefined && VOKALBUCHSTABE.indexOf(c) !== -1;

  // ---------- Bedingungen ----------
  // Jede bekommt (wort, i, musterLaenge) und sagt ja oder nein.
  const anfang = (w, i) => i === 0;
  const ende = (w, i, n) => i + n >= w.length;
  const nichtEnde = (w, i, n) => i + n < w.length;
  const vorVokal = (w, i, n) => istV(w[i + n]);
  const vorHart = (w, i, n) => {
    const c = w[i + n];
    return c !== undefined && 'raoul'.indexOf(c) !== -1;
  };
  const zwischenVokalen = (w, i, n) => i > 0 && istV(w[i - 1]) && istV(w[i + n]);
  const nachVokal = (w, i) => i > 0 && istV(w[i - 1]);
  // Stummes h: steht nach einem Vokal und nicht vor einem Vokal (Kuhn, Jahn).
  const stummesH = (w, i, n) => nachVokal(w, i) && !vorVokal(w, i, n);
  const nichtVorVokal = (w, i, n) => !istV(w[i + n]);
  // Nasales m gilt nur vor einem Konsonanten: "Jerome" hat keines, weil ein
  // Vokal folgt, "Amboise" hat eines.
  const nasalM = (w, i, n) => i + n < w.length && !istV(w[i + n]);
  const vorWeich = (w, i, n) => {
    const c = w[i + n];
    return c !== undefined && 'eiy'.indexOf(c) !== -1;
  };

  // Englisch: Vokal + Konsonant + stummes e am Wortende macht den Vokal lang.
  // "Mike" wird majk, "Jane" wird dschejn, "Pete" wird pit.
  const langDurchStummesE = (w, i, n) => {
    const rest = w.slice(i + n);
    return /^[bcdfgklmnprstvz]e$/.test(rest) || /^[bcdfgklmnprstvz]es$/.test(rest);
  };

  const R = (muster, laute, bedingung) => ({ muster, laute, bedingung });

  // ---------- Deutsch ----------
  const DEUTSCH = [
    R('tsch', ['tsch']),
    R('sch', ['sch']),
    R('chs', ['ks']),
    R('chl', ['k', 'l']),           // Chlodwig, Chloe
    // Kaf, auch am Wortanfang: Christian wird כריסטיאן, Erich wird אריך.
    R('ch', ['ch']),
    R('ck', ['k']),
    R('ph', ['f']),
    R('th', ['t_taw'], anfang),      // Thomas, Theresa, Thorsten
    R('th', ['t']),                  // Guenther, Walther
    R('qu', ['k', 'v']),
    R('tz', ['ts']),
    R('sp', ['sch', 'p'], anfang),   // Spahn: deutsche Aussprache
    R('st', ['sch', 't'], anfang),   // Stefan, Stephan
    R('ß', ['s']),
    R('ie', ['i']),
    R('ei', ['ai']), R('ai', ['ai']), R('ey', ['ai']), R('ay', ['ai']),
    R('au', ['au']),
    R('eu', ['oi']), R('äu', ['oi']),
    R('aa', ['a']), R('ee', ['e']), R('oo', ['o']),
    R('ä', ['ae']), R('ö', ['oe']), R('ü', ['ue']),
    R('x', ['ks']),
    R('z', ['ts']),
    R('v', ['v']),
    R('w', ['v']),
    R('s', ['z'], zwischenVokalen),  // Susanne, Rosa, Theresa
    R('h', [], stummesH),            // Kuhn, Jahn, Mathilde
    R('j', ['j']),
    R('y', ['i']),
    R('c', ['ts'], vorWeich),        // Lucia, Cäcilie, Cicero
    R('c', ['k']),                   // Carl, Claudia, Nico
  ];

  // ---------- Englisch ----------
  const ENGLISCH = [
    R('tch', ['tsch']),              // Mitchell
    // "ch" vor einem Konsonanten ist in jeder dieser Sprachen ein k-Laut,
    // die Namen kommen alle aus dem Griechischen: Christian, Christoph,
    // Chris, Chloe. Muss vor der sprachgenauen ch-Regel stehen, sonst
    // gewinnt dort tsch (englisch) oder sch (franzoesisch).
    R('chr', ['ch', 'r']),
    R('chl', ['k', 'l']),
    R('sch', ['sk']),                // Schumer: englische Aussprache
    R('sh', ['sch']),
    R('ch', ['tsch']),               // Charles, Rachel
    R('ph', ['f']),
    R('th', ['t_taw'], anfang),      // Thomas, Theodore
    R('th', ['t']),
    R('gh', [], nachVokal),          // Hugh, Leigh: stumm
    R('ck', ['k']),
    R('ng', ['n', 'g']),
    R('qu', ['k', 'w']),
    R('igh', ['ai']),
    R('eigh', ['ej']),
    R('ee', ['i']), R('ea', ['i']), R('ie', ['i']),
    R('oo', ['u']), R('ou', ['au']), R('ow', ['au']),
    R('oa', ['o']), R('oe', ['o']),
    R('ai', ['ej']), R('ay', ['ej']), R('ei', ['ej']), R('ey', ['i'], ende),
    R('au', ['o']), R('aw', ['o']),
    R('oi', ['oi']), R('oy', ['oi']),
    R('ar', ['a', 'r']),
    R('wh', ['w']),
    R('x', ['ks']),
    R('j', ['dzh']),                 // John, James, Jennifer
    R('c', ['s'], vorWeich),         // Cecil, Cindy
    R('c', ['k']),
    R('g', ['dzh'], vorWeich),       // George, Gina
    R('g', ['g']),
    R('a', ['ej'], langDurchStummesE),  // Jane, Dave, Kate
    R('i', ['ai'], langDurchStummesE),  // Mike, Clive
    R('o', ['o'], langDurchStummesE),   // Rose, Joe
    R('u', ['ju'], langDurchStummesE),  // Luke, Duke
    R('e', [], ende),                // stummes Schluss-e
    R('y', ['i'], ende),             // Mary, Lily
    R('y', ['j'], anfang),           // York
    R('y', ['i']),
    R('w', ['w']),
    R('v', ['v']),
    R('a', ['e']),                   // Sam, Dan: englisches kurzes a
    R('u', ['a']),                   // Russell, Judy nicht, aber Hunt
  ];

  // ---------- Franzoesisch ----------
  const FRANZOESISCH = [
    R('eau', ['o']),                 // Beaumont
    // "ch" vor einem Konsonanten ist in jeder dieser Sprachen ein k-Laut,
    // die Namen kommen alle aus dem Griechischen: Christian, Christoph,
    // Chris, Chloe. Muss vor der sprachgenauen ch-Regel stehen, sonst
    // gewinnt dort tsch (englisch) oder sch (franzoesisch).
    R('chr', ['ch', 'r']),
    R('chl', ['k', 'l']),
    R('ch', ['sch']),                // Michel, Charles
    R('ph', ['f']),
    R('th', ['t_taw'], anfang),      // Theodore, Therese
    R('th', ['t']),
    R('gn', ['n', 'j']),             // Agnes
    R('ill', ['i', 'j']),            // Camille
    R('qu', ['k']),
    R('ou', ['u']),                  // Louis
    R('oi', ['u', 'a']),             // Francois
    R('au', ['o']),
    R('ai', ['e']), R('ei', ['e']),
    R('eu', ['oe']), R('oeu', ['oe']),
    R('an', ['a', 'n'], nichtVorVokal), R('am', ['a', 'n'], nasalM),
    R('en', ['a', 'n'], nichtVorVokal), R('em', ['a', 'n'], nasalM),
    R('on', ['o', 'n'], nichtVorVokal), R('om', ['o', 'n'], nasalM),
    R('in', ['e', 'n'], nichtVorVokal), R('im', ['e', 'n'], nasalM),
    R('un', ['e', 'n'], nichtVorVokal),
    R('é', ['e']), R('è', ['e']), R('ê', ['e']), R('ë', ['e']),
    R('à', ['a']), R('â', ['a']),
    R('î', ['i']), R('ï', ['i']),
    R('ô', ['o']),
    R('ù', ['ue']), R('û', ['ue']), R('ü', ['ue']),
    R('ç', ['s']),
    R('j', ['zh']),                  // Jean, Jacques
    R('s', ['z'], zwischenVokalen),  // Therese, Rose, Lisa
    R('y', ['j'], anfang),           // Yann, Yves
    R('c', ['s'], vorWeich),         // Cecile
    R('c', ['k']),
    R('g', ['zh'], vorWeich),        // Georges, Gilles
    R('g', ['g']),
    R('h', []),                      // immer stumm
    R('u', ['ue']),                  // franzoesisches u ist ue: Lucie
    R('y', ['i']),
    R('w', ['v']),
    R('x', [], ende),                // Margaux, Bordeaux: stumm
    R('x', ['ks']),
    // Stumme Endungen. Charles wird Scharl, Louis wird Lui.
    R('s', [], ende),
    R('t', [], ende),
    R('d', [], ende),
    R('z', [], ende),
    R('e', [], ende),
    R('r', ['r']),
  ];

  // ---------- Spanisch ----------
  const SPANISCH = [
    R('ch', ['tsch']),               // Chile, Concha
    // "ch" vor einem Konsonanten ist in jeder dieser Sprachen ein k-Laut,
    // die Namen kommen alle aus dem Griechischen: Christian, Christoph,
    // Chris, Chloe. Muss vor der sprachgenauen ch-Regel stehen, sonst
    // gewinnt dort tsch (englisch) oder sch (franzoesisch).
    R('chr', ['ch', 'r']),
    R('chl', ['k', 'l']),
    R('ll', ['j']),                  // Guillermo
    R('rr', ['r']),
    R('qu', ['k']),
    R('gu', ['g'], vorWeich),        // Guillermo, Miguel
    R('ñ', ['n', 'j']),
    R('j', ['ch_chet']),             // Juan, Jose, Jorge
    R('g', ['ch_chet'], vorWeich),   // Jorge, Gerardo
    R('g', ['g']),
    R('c', ['s'], vorWeich),         // Cecilia
    R('c', ['k']),
    R('z', ['s']),
    R('h', []),                      // immer stumm: Hugo
    R('v', ['v']),
    R('y', ['j'], vorVokal),
    R('y', ['i']),
    R('x', ['ks']),
    R('á', ['a']), R('é', ['e']), R('í', ['i']), R('ó', ['o']), R('ú', ['u']),
  ];

  // ---------- Italienisch ----------
  const ITALIENISCH = [
    R('sci', ['sch', 'i']),          // Sciarra
    // "ch" vor einem Konsonanten ist in jeder dieser Sprachen ein k-Laut,
    // die Namen kommen alle aus dem Griechischen: Christian, Christoph,
    // Chris, Chloe. Muss vor der sprachgenauen ch-Regel stehen, sonst
    // gewinnt dort tsch (englisch) oder sch (franzoesisch).
    R('chr', ['ch', 'r']),
    R('chl', ['k', 'l']),
    R('sce', ['sch', 'e']),
    R('gli', ['l', 'j', 'i']),       // Guglielmo
    R('gn', ['n', 'j']),             // Agnese
    R('chi', ['k', 'i']),            // Chiara
    R('che', ['k', 'e']),            // Michele
    R('ghi', ['g', 'i']), R('ghe', ['g', 'e']),
    R('ci', ['tsch', 'i']),          // Cinzia
    R('ce', ['tsch', 'e']),          // Cesare
    R('cia', ['tsch', 'a']),
    R('cio', ['tsch', 'o']),
    R('ciu', ['tsch', 'u']),
    R('gi', ['dzh', 'i']),            // Giovanni, Luigi
    R('ge', ['dzh', 'e']),            // Angelo
    R('gia', ['dzh', 'a']),
    R('gio', ['dzh', 'o']),
    R('giu', ['dzh', 'u']),           // Giuseppe
    R('qu', ['k', 'v']),
    R('z', ['ts']),
    R('h', []),                      // immer stumm
    R('c', ['k']),
    R('g', ['g']),
    R('j', ['j']),
    R('v', ['v']),
    R('y', ['i']),
    R('x', ['ks']),
    R('à', ['a']), R('è', ['e']), R('é', ['e']), R('ì', ['i']),
    R('ò', ['o']), R('ù', ['u']),
  ];

  // Einzelbuchstaben, die in jeder Sprache gleich liegen. Kommen am Ende,
  // damit die sprachspezifischen Regeln zuerst greifen.
  const GRUNDLAUTE = [
    R('b', ['b']), R('d', ['d']), R('f', ['f']), R('g', ['g']), R('h', ['h']),
    R('k', ['k']), R('l', ['l']), R('m', ['m']), R('n', ['n']), R('p', ['p']),
    R('r', ['r']), R('s', ['s']), R('t', ['t']), R('v', ['v']), R('w', ['v']),
    R('z', ['z']), R('c', ['k']), R('j', ['j']), R('x', ['ks']), R('y', ['i']),
    R('a', ['a']), R('e', ['e']), R('i', ['i']), R('o', ['o']), R('u', ['u']),
    R('ä', ['ae']), R('ö', ['oe']), R('ü', ['ue']),
  ];

  const SPRACHEN = {
    de: { name: 'Deutsch', regeln: DEUTSCH },
    en: { name: 'Englisch', regeln: ENGLISCH },
    fr: { name: 'Französisch', regeln: FRANZOESISCH },
    es: { name: 'Spanisch', regeln: SPANISCH },
    it: { name: 'Italienisch', regeln: ITALIENISCH },
  };

  // ---------- Anwendung ----------

  // Vereinheitlicht die Eingabe, ohne die Buchstaben zu verlieren, die eine
  // Sprache braucht. Umlaute und Akzente bleiben also stehen.
  function normalisiere(name) {
    return String(name || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-zà-öø-ÿ'\- ]/g, '');
  }

  // Zerlegt EIN Wort in Laute, nach den Regeln einer Sprache.
  function lauteVonWort(wort, sprache) {
    const eintrag = SPRACHEN[sprache] || SPRACHEN.de;
    const regeln = eintrag.regeln.concat(GRUNDLAUTE);
    const aus = [];
    let i = 0;

    while (i < wort.length) {
      let treffer = null;

      // Laengste passende Regel gewinnt. Die Reihenfolge innerhalb gleicher
      // Laenge entscheidet die Tabelle, deshalb stehen Sonderfaelle oben.
      for (let n = 4; n >= 1 && !treffer; n--) {
        const stueck = wort.substr(i, n);
        if (stueck.length < n) continue;
        for (let r = 0; r < regeln.length; r++) {
          const regel = regeln[r];
          if (regel.muster.length !== n) continue;
          if (regel.muster !== stueck) continue;
          if (regel.bedingung && !regel.bedingung(wort, i, n)) continue;
          treffer = regel;
          break;
        }
      }

      if (treffer) {
        for (let k = 0; k < treffer.laute.length; k++) aus.push(treffer.laute[k]);
        i += treffer.muster.length;
      } else {
        i += 1;                       // unbekanntes Zeichen still ueberspringen
      }
    }
    return aus;
  }

  // Zerlegt einen Namen. Doppelnamen und zwei Vornamen bleiben getrennt,
  // damit jedes Wort seine eigene Anfangs- und Endregel bekommt.
  // Gibt eine Liste von Teilen zurueck: { laute, trenner }
  function laute(name, sprache) {
    const sauber = normalisiere(name);
    if (!sauber) return [];
    const teile = [];
    const stuecke = sauber.split(/([\s\-'])/);
    for (let i = 0; i < stuecke.length; i++) {
      const s = stuecke[i];
      if (!s) continue;
      if (/^[\s\-']$/.test(s)) {
        if (teile.length) teile[teile.length - 1].trenner = s === ' ' ? ' ' : '־';
        continue;
      }
      teile.push({ laute: lauteVonWort(s, sprache), trenner: '' });
    }
    return teile;
  }

  // Lesehilfe in lateinischer Schrift, damit man sieht, wie das Tool den
  // Namen gelesen hat. Keine Fachlautschrift, sondern was ein Deutscher
  // vorlesen wuerde.
  const LESEHILFE = {
    b: 'b', d: 'd', f: 'f', g: 'g', h: 'h', k: 'k', l: 'l', m: 'm', n: 'n',
    p: 'p', r: 'r', s: 's', t: 't', t_taw: 't', z: 's', v: 'w', w: 'w', j: 'j',
    sch: 'sch', zh: 'sch', dzh: 'dsch', tsch: 'tsch', ts: 'z',
    ch: 'ch', ch_chet: 'ch', ks: 'x',
    a: 'a', e: 'e', i: 'i', o: 'o', u: 'u', ae: 'ä', oe: 'ö', ue: 'ü',
    '@': 'e', ai: 'ei', au: 'au', oi: 'eu', ej: 'ej', ui: 'ui', ju: 'ju',
  };

  function lesehilfe(teile) {
    return teile.map((teil) => {
      const silben = teil.laute.map((l) => LESEHILFE[l] || '').join('');
      return silben + (teil.trenner === '־' ? '-' : teil.trenner);
    }).join('').trim();
  }

  function liste() {
    return Object.keys(SPRACHEN).map((k) => ({ code: k, name: SPRACHEN[k].name }));
  }

  return { SPRACHEN, laute, lauteVonWort, normalisiere, lesehilfe, liste };
});
