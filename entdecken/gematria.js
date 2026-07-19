// =============================================
// SCHALOM ISRAEL - Gematria
//
// Jeder hebraeische Buchstabe hat einen Zahlenwert. Die Summe eines Wortes
// nennt man seine Gematria. Rein rechnerisch, kein KI-Aufruf noetig.
//
// Zwei Wege zur hebraeischen Schreibweise:
//   1. Namen mit hebraeischem Ursprung stehen in einer gepflegten Liste
//      und bekommen ihre ECHTE Schreibweise (David -> דוד).
//   2. Alle anderen bekommen eine lautliche Umschrift, klar als solche
//      gekennzeichnet. Eine Naeherung ist ehrlicher als eine erfundene Wurzel.
//
// UMD, damit ohne Browser testbar.
// =============================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Gematria = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  // Standardwerte (Mispar Hechrachi). Endbuchstaben zaehlen wie ihre Grundform.
  const WERTE = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
    'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
    'ך': 20, 'ם': 40, 'ן': 50, 'ף': 80, 'ץ': 90,
  };

  const ENDFORM = { 'כ': 'ך', 'מ': 'ם', 'נ': 'ן', 'פ': 'ף', 'צ': 'ץ' };
  const GRUNDFORM = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };

  // Namen mit echtem hebraeischem Ursprung, so wie sie im Tanach stehen.
  const ECHTE_NAMEN = {
    david: 'דוד', sara: 'שרה', sarah: 'שרה', michael: 'מיכאל', daniel: 'דניאל',
    hanna: 'חנה', hannah: 'חנה', anna: 'חנה', jonatan: 'יהונתן', jonathan: 'יהונתן',
    rebekka: 'רבקה', rachel: 'רחל', rahel: 'רחל', ruth: 'רות', rut: 'רות',
    esther: 'אסתר', ester: 'אסתר', mirjam: 'מרים', miriam: 'מרים', maria: 'מרים',
    noomi: 'נעמי', naomi: 'נעמי', lea: 'לאה', leah: 'לאה',
    elisabeth: 'אלישבע', elisabet: 'אלישבע',
    simon: 'שמעון', schimon: 'שמעון', thomas: 'תאומא', johannes: 'יוחנן',
    jochanan: 'יוחנן', hans: 'יוחנן', jakob: 'יעקב', jaakow: 'יעקב',
    josef: 'יוסף', joseph: 'יוסף', benjamin: 'בנימין', samuel: 'שמואל',
    gabriel: 'גבריאל', raphael: 'רפאל', rafael: 'רפאל', elias: 'אליהו',
    elia: 'אליהו', noah: 'נח', adam: 'אדם', eva: 'חוה', chawa: 'חוה',
    abraham: 'אברהם', awraham: 'אברהם', isaak: 'יצחק', jizchak: 'יצחק',
    salomon: 'שלמה', salomo: 'שלמה', schlomo: 'שלמה',
    judith: 'יהודית', debora: 'דבורה', deborah: 'דבורה', tamar: 'תמר',
    aaron: 'אהרן', aharon: 'אהרן', mose: 'משה', moses: 'משה', mosche: 'משה',
    levi: 'לוי', jesaja: 'ישעיהו', jeremia: 'ירמיהו', hesekiel: 'יחזקאל',
    josua: 'יהושע', jehoschua: 'יהושע', nathan: 'נתן', natan: 'נתן',
    tobias: 'טוביה', matthias: 'מתתיהו', mattias: 'מתתיהו',
    magdalena: 'מגדלנה', martha: 'מרתא', marta: 'מרתא',
    jonas: 'יונה', jona: 'יונה', immanuel: 'עמנואל', emanuel: 'עמנואל',
    nathanael: 'נתנאל', natanael: 'נתנאל', asaf: 'אסף', boas: 'בעז',
    caleb: 'כלב', kaleb: 'כלב', gideon: 'גדעון', hiob: 'איוב', job: 'איוב',
    ismael: 'ישמעאל', jischmael: 'ישמעאל', juda: 'יהודה', jehuda: 'יהודה',
    dan: 'דן', gad: 'גד', ascher: 'אשר', asser: 'אשר', naftali: 'נפתלי',
    ruben: 'ראובן', reuwen: 'ראובן', simeon: 'שמעון', issachar: 'יששכר',
    sebulon: 'זבולון', efraim: 'אפרים', ephraim: 'אפרים', manasse: 'מנשה',
    zippora: 'ציפורה', abigail: 'אביגיל', awigail: 'אביגיל',
    joel: 'יואל', amos: 'עמוס', micha: 'מיכה', maleachi: 'מלאכי',
    schalom: 'שלום', ariel: 'אריאל', uriel: 'אוריאל', asriel: 'עזריאל',
    eliana: 'אליענה', talia: 'טליה', tal: 'טל', noa: 'נועה', jael: 'יעל',
    keren: 'קרן', schira: 'שירה', liora: 'ליאורה', ilan: 'אילן',
  };

  // Lautliche Umschrift. Laengere Folgen zuerst, sonst greift die kurze Regel.
  const LAUTE = [
    ['tsch', 'צ'], ['sch', 'ש'], ['chs', 'כס'], ['ck', 'ק'], ['ph', 'פ'],
    ['th', 'ת'], ['ch', 'ח'], ['sp', 'שפ'], ['st', 'שט'], ['qu', 'קו'],
    ['ei', 'יי'], ['ai', 'יי'], ['eu', 'וי'], ['au', 'או'], ['ie', 'י'],
    ['ae', 'א'], ['oe', 'ו'], ['ue', 'ו'],
    ['a', 'א'], ['b', 'ב'], ['c', 'ק'], ['d', 'ד'], ['e', 'א'], ['f', 'פ'],
    ['g', 'ג'], ['h', 'ה'], ['i', 'י'], ['j', 'י'], ['k', 'ק'], ['l', 'ל'],
    ['m', 'מ'], ['n', 'נ'], ['o', 'ו'], ['p', 'פ'], ['q', 'ק'], ['r', 'ר'],
    ['s', 'ס'], ['t', 'ט'], ['u', 'ו'], ['v', 'ו'], ['w', 'ו'], ['x', 'קס'],
    ['y', 'י'], ['z', 'ז'],
  ];

  function normalisiereName(name) {
    return String(name || '')
      .trim()
      .toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z]/g, '');
  }

  // Setzt am Wortende die Endform, wie es die hebraeische Schrift verlangt.
  function mitEndform(wort) {
    if (!wort) return wort;
    const letzter = wort[wort.length - 1];
    if (ENDFORM[letzter]) return wort.slice(0, -1) + ENDFORM[letzter];
    return wort;
  }

  function umschreiben(name) {
    let rest = normalisiereName(name);
    if (!rest) return '';
    let aus = '';
    while (rest.length) {
      let treffer = false;
      for (const [lat, heb] of LAUTE) {
        if (rest.indexOf(lat) === 0) {
          aus += heb;
          rest = rest.slice(lat.length);
          treffer = true;
          break;
        }
      }
      if (!treffer) rest = rest.slice(1);
    }
    return mitEndform(aus);
  }

  // Liefert die hebraeische Schreibweise und woher sie stammt.
  function hebraeisch(name) {
    const k = normalisiereName(name);
    if (ECHTE_NAMEN[k]) return { schrift: ECHTE_NAMEN[k], quelle: 'ueberliefert' };
    const u = umschreiben(name);
    return { schrift: u, quelle: u ? 'umschrift' : 'leer' };
  }

  // Summe der Buchstabenwerte.
  function wert(hebraeischesWort) {
    let summe = 0;
    for (const c of String(hebraeischesWort || '')) {
      if (WERTE[c]) summe += WERTE[c];
    }
    return summe;
  }

  // Einzelwerte, fuer die Aufschluesselung in der Anzeige.
  function zerlegung(hebraeischesWort) {
    const aus = [];
    for (const c of String(hebraeischesWort || '')) {
      if (WERTE[c]) aus.push({ buchstabe: c, wert: WERTE[c] });
    }
    return aus;
  }

  // Quersumme bis zur einstelligen Zahl (Mispar Katan).
  function kleinerWert(zahl) {
    let n = Number(zahl) || 0;
    while (n > 9) {
      n = String(n).split('').reduce((s, z) => s + Number(z), 0);
    }
    return n;
  }

  function grundform(wort) {
    return String(wort || '').split('').map((c) => GRUNDFORM[c] || c).join('');
  }

  return {
    WERTE, ECHTE_NAMEN,
    normalisiereName, umschreiben, hebraeisch,
    wert, zerlegung, kleinerWert, mitEndform, grundform,
  };
});
