// =============================================
// SCHALOM ISRAEL - Lebenslinien: Daten
//
// Jahre seit der Erschaffung der Welt nach dem Seder Olam, abgestimmt mit
// der Zeittafel (Anhang 1) und dem Personenregister (Anhang 3) von
// „Durch Feuer und Wasser“, Band I.
//
// Rechenweise: geburt + lebensjahre = tod. Adam zaehlt mit geburt 0, damit
// Schet im Jahr 130 kommt, wenn Adam 130 ist (Bereschit 5,3); angezeigt wird
// fuer Adam „Jahr 1“, wie im Buch.
//
// Sicherheit der Angaben (feld "sicher"):
//   "genau"        aus den Zahlen der Tora errechnet
//   "ueberliefert" nach der Ueberlieferung (Seder Olam, Weise), nicht im Text
//   "ungefaehr"    Jahr mit „um“
// lebensalter: die Zahl der Tora, wo die reine Jahresdifferenz um eins
//   abweicht, weil Geburts- und Todesmonat verschieden liegen (Aharon:
//   2487 - 2365 = 122, die Tora sagt 123, Bamidbar 33,39).
// tod: null heisst: Todesjahr nicht ueberliefert. "mindestens" gibt dann das
// letzte Jahr an, in dem die Person sicher noch lebte.
//
// Keine Personen ohne belastbare Jahre (Kehat und Amram etwa nennt die Tora
// nur mit Lebensdauer, nicht mit Geburtsjahr). Lieber eine Zeile weniger als
// eine erfundene Zahl.
//
// UMD, damit ohne Browser testbar.
// =============================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Lebenslinien = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  // stelle: Fundstelle in der Tora, verlinkt in den Tora-Text der Seite.
  // buch muss ein Ordner unter /tora/ sein.
  const PERSONEN = [
    { id: 'adam', name: 'Adam', hebr: 'אדם', geburt: 0, anzeigeGeburt: 1, tod: 930, sicher: 'genau',
      eltern: [], stelle: ['bereschit', 5, 5],
      notiz: 'Der erste Mensch, erschaffen am 1. Tischri des Jahres 1. Er wurde 930 Jahre alt und erlebte noch Lemech, den Vater Noachs.',
      artikel: [['kain-und-die-suende-vor-der-tuer', 'Kain und die Sünde vor der Tür']] },
    { id: 'schet', name: 'Schet', vertraut: 'Set', hebr: 'שת', geburt: 130, tod: 1042, sicher: 'genau',
      eltern: ['adam'], stelle: ['bereschit', 5, 3],
      notiz: 'Geboren, als Adam 130 war. Nach Kajin und Hewel der Sohn, mit dem die Linie weitergeht.' },
    { id: 'enosch', name: 'Enosch', hebr: 'אנוש', geburt: 235, tod: 1140, sicher: 'genau',
      eltern: ['schet'], stelle: ['bereschit', 4, 26],
      notiz: 'In seinen Tagen „begann man, den Namen Gottes anzurufen“. Die Ausleger lesen es als den Anfang der Entweihung.' },
    { id: 'kenan', name: 'Kenan', hebr: 'קינן', geburt: 325, tod: 1235, sicher: 'genau',
      eltern: ['enosch'], stelle: ['bereschit', 5, 9] },
    { id: 'mahalalel', name: 'Mahalalel', hebr: 'מהללאל', geburt: 395, tod: 1290, sicher: 'genau',
      eltern: ['kenan'], stelle: ['bereschit', 5, 12] },
    { id: 'jered', name: 'Jered', hebr: 'ירד', geburt: 460, tod: 1422, sicher: 'genau',
      eltern: ['mahalalel'], stelle: ['bereschit', 5, 15],
      notiz: 'Er wurde 962 Jahre alt, nach Metuschelach der älteste Mensch der Tora.' },
    { id: 'chanoch', name: 'Chanoch', vertraut: 'Henoch', hebr: 'חנוך', geburt: 622, tod: 987, sicher: 'genau',
      eltern: ['jered'], stelle: ['bereschit', 5, 24],
      notiz: '„Und Chanoch wandelte mit Gott, und er war nicht mehr, denn Gott hatte ihn genommen.“ Mit 365 Jahren der Jüngste in der Reihe.' },
    { id: 'metuschelach', name: 'Metuschelach', vertraut: 'Methusalem', hebr: 'מתושלח', geburt: 687, tod: 1656, sicher: 'genau',
      eltern: ['chanoch'], stelle: ['bereschit', 5, 27],
      notiz: 'Mit 969 Jahren der älteste Mensch der Tora. Er starb im Jahr der Flut, nach der Überlieferung sieben Tage vor ihrem Beginn, und die Flut wartete die Trauerwoche ab.' },
    { id: 'lemech', name: 'Lemech', vertraut: 'Lamech', hebr: 'למך', geburt: 874, tod: 1651, sicher: 'genau',
      eltern: ['metuschelach'], stelle: ['bereschit', 5, 28],
      notiz: 'Er war 56, als Adam starb, und erlebte noch die Geburt aller drei Söhne Noachs. Fünf Jahre vor der Flut starb er.' },
    { id: 'noach', name: 'Noach', vertraut: 'Noah', hebr: 'נח', geburt: 1056, tod: 2006, sicher: 'genau',
      eltern: ['lemech'], stelle: ['bereschit', 6, 9],
      notiz: 'Er ging mit 600 Jahren in die Arche und lebte danach noch 350 Jahre. Als er starb, war Abraham 58.',
      artikel: [['noach-siebzig-voelker', 'Noach, die 70 Völker und der achte Tag']] },
    { id: 'schem', name: 'Schem', vertraut: 'Sem', hebr: 'שם', geburt: 1558, tod: 2158, sicher: 'genau',
      eltern: ['noach'], stelle: ['bereschit', 11, 10],
      notiz: 'Er überlebte die Flut mit 98 Jahren und starb erst, als Jakob 50 war. Nach der Überlieferung lehrte er mit Ewer in einem Lehrhaus, in dem Jakob lernte. Er überlebte Abraham um 35 Jahre.' },
    { id: 'arpachschad', name: 'Arpachschad', hebr: 'ארפכשד', geburt: 1658, tod: 2096, sicher: 'genau',
      eltern: ['schem'], stelle: ['bereschit', 11, 10],
      notiz: 'Zwei Jahre nach der Flut geboren. Ab ihm werden die Menschen deutlich jünger als vor der Flut.' },
    { id: 'schelach', name: 'Schelach', hebr: 'שלח', geburt: 1693, tod: 2126, sicher: 'genau',
      eltern: ['arpachschad'], stelle: ['bereschit', 11, 12] },
    { id: 'ewer', name: 'Ewer', vertraut: 'Eber', hebr: 'עבר', geburt: 1723, tod: 2187, sicher: 'genau',
      eltern: ['schelach'], stelle: ['bereschit', 11, 14],
      notiz: 'Er überlebte Abraham um 64 Jahre. Nach der Überlieferung lernte Jakob vierzehn Jahre in seinem Lehrhaus, bevor er zu Lawan ging; zwei Jahre danach starb Ewer.' },
    { id: 'peleg', name: 'Peleg', hebr: 'פלג', geburt: 1757, tod: 1996, sicher: 'genau',
      eltern: ['ewer'], stelle: ['bereschit', 10, 25],
      notiz: '„Denn in seinen Tagen wurde die Erde geteilt.“ Nach dem Seder Olam starb er im Jahr des Turms von Babel.' },
    { id: 'reu', name: 'Reu', vertraut: 'Regu', hebr: 'רעו', geburt: 1787, tod: 2026, sicher: 'genau',
      eltern: ['peleg'], stelle: ['bereschit', 11, 18] },
    { id: 'serug', name: 'Serug', hebr: 'שרוג', geburt: 1819, tod: 2049, sicher: 'genau',
      eltern: ['reu'], stelle: ['bereschit', 11, 20] },
    { id: 'nachor', name: 'Nachor', vertraut: 'Nahor', hebr: 'נחור', geburt: 1849, tod: 1997, sicher: 'genau',
      eltern: ['serug'], stelle: ['bereschit', 11, 22],
      notiz: 'Der Großvater Abrahams. Mit 148 Jahren hatte er das kürzeste Leben in der ganzen Reihe.' },
    { id: 'terach', name: 'Terach', hebr: 'תרח', geburt: 1878, tod: 2083, sicher: 'genau',
      eltern: ['nachor'], stelle: ['bereschit', 11, 24],
      notiz: 'Der Vater Abrahams, nach der Überlieferung ein Händler mit Götzenbildern in Ur. Er starb in Charan.' },
    { id: 'abraham', name: 'Abraham', hebr: 'אברהם', geburt: 1948, tod: 2123, sicher: 'genau',
      eltern: ['terach'], stelle: ['bereschit', 12, 1],
      notiz: 'Der erste der drei Väter. Als er geboren wurde, lebten noch alle zehn Generationen seiner Vorfahren bis zurück zu Noach.',
      artikel: [['lech-und-lecha', '„Lech“ und „Lecha“'], ['was-abraham-in-den-sternen-las', 'Was Abraham in den Sternen las'], ['besitzurkunde-und-sodom', 'Eine Besitzurkunde und Sodom']] },
    { id: 'sara', name: 'Sara', frau: true, hebr: 'שרה', geburt: 1958, tod: 2085, sicher: 'genau',
      eltern: [], stelle: ['bereschit', 23, 1],
      notiz: 'Zehn Jahre jünger als Abraham. Sie bekam Jizchak mit 90 und starb mit 127, nach der Überlieferung in dem Jahr, in dem Jizchak gebunden wurde.' },
    { id: 'jischmael', name: 'Jischmael', vertraut: 'Ismael', hebr: 'ישמעאל', geburt: 2034, tod: 2171, sicher: 'genau',
      eltern: ['abraham'], stelle: ['bereschit', 25, 17],
      notiz: 'Sohn Abrahams und Hagars, geboren, als Abraham 86 war. Er wurde 137 Jahre alt.' },
    { id: 'jizchak', name: 'Jizchak', vertraut: 'Isaak', hebr: 'יצחק', geburt: 2048, tod: 2228, sicher: 'genau',
      eltern: ['abraham', 'sara'], stelle: ['bereschit', 21, 3],
      notiz: 'Mit 180 Jahren der Langlebigste der Väter. Als Josef verkauft wurde, lebte er noch, und er starb ein Jahr, bevor Josef vor Pharao stand.',
      artikel: [['isaaks-brunnen-weite', 'Isaaks drei Brunnen'], ['rebekka-isaak-segen', 'Rebekka, Isaak und der Segen']] },
    { id: 'jakob', name: 'Jakob', hebr: 'יעקב', geburt: 2108, tod: 2255, sicher: 'genau',
      eltern: ['jizchak'], stelle: ['bereschit', 25, 26],
      notiz: 'Er war 15, als Abraham starb, und 50, als Schem starb. Nach der Überlieferung lernte er vierzehn Jahre im Lehrhaus von Schem und Ewer.',
      artikel: [['der-schlimmste-chef-der-bibel', 'Der schlimmste Chef der Bibel'], ['kritik-die-verbindet', 'Wie man kritisiert, ohne zu zerstören']] },
    { id: 'esau', name: 'Esau', hebr: 'עשו', geburt: 2108, tod: 2255, sicher: 'ueberliefert',
      eltern: ['jizchak'], stelle: ['bereschit', 25, 25],
      notiz: 'Zwillingsbruder Jakobs. Die Tora nennt sein Todesjahr nicht. Nach der Überlieferung starb er bei Jakobs Begräbnis an der Höhle Machpela.',
      artikel: [['rebekka-isaak-segen', 'Warum nur Esau wütend ist']] },
    { id: 'levi', name: 'Levi', hebr: 'לוי', geburt: 2195, tod: 2332, sicher: 'ueberliefert',
      eltern: ['jakob'], stelle: ['schemot', 6, 16],
      notiz: 'Er wurde 137 Jahre alt und starb als Letzter der zwölf Brüder. Nach der Überlieferung begann erst danach die harte Knechtschaft.' },
    { id: 'josef', name: 'Josef', hebr: 'יוסף', geburt: 2199, tod: 2309, sicher: 'genau',
      eltern: ['jakob'], stelle: ['bereschit', 30, 24],
      notiz: 'Mit 17 verkauft, mit 30 vor Pharao, mit 110 gestorben. Sein Großvater Jizchak lebte noch, als er nach Ägypten kam.',
      artikel: [['ungeklaerte-schuld', 'Die Angst nach Jakobs Tod'], ['sei-wie-ephraim-und-menasche', 'Sei wie Ephraim und Menasche']] },
    { id: 'jocheved', name: 'Jocheved', frau: true, vertraut: 'Jochebed', hebr: 'יוכבד', geburt: 2238, tod: null, mindestens: 2368, sicher: 'ueberliefert',
      eltern: ['levi'], stelle: ['schemot', 6, 20],
      notiz: 'Die Tochter Levis. Nach der Überlieferung kam sie im Jahr der Ankunft in Ägypten zur Welt, „zwischen den Mauern“, und war 130, als Mosche geboren wurde. Ihr Todesjahr ist nicht überliefert.' },
    { id: 'mirjam', name: 'Mirjam', frau: true, hebr: 'מרים', geburt: 2362, anzeigeUm: true, tod: 2487, sicher: 'ungefaehr',
      eltern: ['jocheved'], weitereEltern: ['Amram'], stelle: ['bamidbar', 20, 1],
      notiz: 'Die Schwester Mosches, die am Nil über ihn wachte. Sie starb im Nissan des vierzigsten Jahres, und mit ihr versiegte der Brunnen.' },
    { id: 'aharon', name: 'Aharon', vertraut: 'Aaron', hebr: 'אהרן', geburt: 2365, tod: 2487, lebensalter: 123, sicher: 'genau',
      eltern: ['jocheved'], weitereEltern: ['Amram'], stelle: ['bamidbar', 33, 39],
      notiz: 'Der erste Hohepriester, drei Jahre älter als Mosche. Er starb am 1. Aw auf dem Berg Hor, 123 Jahre alt.',
      artikel: [['goldenes-kalb-vergebung', 'Das Goldene Kalb']] },
    { id: 'mosche', name: 'Mosche', vertraut: 'Mose', hebr: 'משה', geburt: 2368, tod: 2488, sicher: 'genau',
      eltern: ['jocheved'], weitereEltern: ['Amram'], stelle: ['schemot', 2, 10],
      notiz: 'Geboren am 7. Adar 2368 und gestorben am 7. Adar 2488, auf den Tag genau 120 Jahre. Er führte Israel aus Ägypten und brachte die Tora vom Sinai.',
      artikel: [['unerfuelltes-gebet-moses', 'Was Mose lernen musste'], ['ein-mann-in-dem-geist-ist', 'Der beste Führer Israels']] },
    { id: 'josua', name: 'Josua', hebr: 'יהושע', geburt: 2406, tod: 2516, sicher: 'ueberliefert',
      eltern: [], weitereEltern: ['Nun'], stelle: ['bamidbar', 27, 18],
      notiz: 'Der Diener Mosches und sein Nachfolger. Er führte das Volk ins Land und starb mit 110 Jahren.',
      artikel: [['worte-haben-macht', 'Was die zwölf Kundschafter lehren']] },
  ];

  // Ereignisse auf der Achse, alle aus der Zeittafel von Band I.
  const EREIGNISSE = [
    { jahr: 1656, bis: 1657, name: 'Die Flut', flut: true },
    { jahr: 1996, name: 'Der Turm von Babel' },
    { jahr: 2018, name: 'Der Bund zwischen den Stücken' },
    { jahr: 2085, name: 'Die Bindung Jizchaks' },
    { jahr: 2238, name: 'Jakob zieht nach Ägypten' },
    { jahr: 2448, name: 'Auszug und Sinai' },
    { jahr: 2488, name: 'Mosches Tod, Einzug ins Land' },
  ];

  // Sprungmarken fuer den Jahresfaden, mit dem Satz, der dort staunen laesst.
  const SPRUNGMARKEN = [
    { jahr: 930, titel: 'Adams Tod', satz: 'Lemech, der Vater Noachs, ist 56. Er hat Adam noch gekannt.' },
    { jahr: 1656, titel: 'Die Flut', satz: 'Metuschelach ist gerade gestorben, sieben Tage vor dem Regen. Noach ist 600, Schem 98.' },
    { jahr: 1948, titel: 'Abrahams Geburt', satz: 'Alle zehn Generationen von Noach bis Terach leben noch. Keiner von Abrahams Vorfahren bis zur Flut ist gestorben.' },
    { jahr: 1996, titel: 'Der Turm von Babel', satz: 'Peleg stirbt in diesem Jahr. Abraham ist 48 und erlebt die Zerstreuung der Völker mit.' },
    { jahr: 2006, titel: 'Noachs Tod', satz: 'Abraham ist 58. Er konnte die Geschichte der Flut von dem hören, der sie überlebt hat.' },
    { jahr: 2123, titel: 'Abrahams Tod', satz: 'Schem und Ewer leben noch. Sie überleben Abraham um 35 und 64 Jahre. Jakob ist 15.' },
    { jahr: 2158, titel: 'Schems Tod', satz: 'Jakob ist 50. Schem hat Metuschelach gekannt, und Metuschelach hat Adam gekannt.' },
    { jahr: 2238, titel: 'Nach Ägypten', satz: 'Jakob zieht mit siebzig Seelen nach Ägypten. Jocheved wird geboren, die Mutter Mosches.' },
    { jahr: 2448, titel: 'Auszug', satz: 'Mosche ist 80, Aharon 83, Mirjam um die 86. Von Adam bis hierher reichen nur wenige Hände.' },
  ];

  // Bava Batra 121b: Sieben umspannen die ganze Welt.
  const KETTE = [
    { id: 'adam', name: 'Adam', jahre: '1 bis 930' },
    { id: 'metuschelach', name: 'Metuschelach', jahre: '687 bis 1656', verbindung: '243 Jahre gemeinsam' },
    { id: 'schem', name: 'Schem', jahre: '1558 bis 2158', verbindung: '98 Jahre gemeinsam' },
    { id: 'jakob', name: 'Jakob', jahre: '2108 bis 2255', verbindung: '50 Jahre gemeinsam' },
    { id: 'amram', name: 'Amram', jahre: 'Vater Mosches', verbindung: 'sah Jakob' },
    { id: 'achija', name: 'Achija aus Schilo', jahre: 'Prophet unter Jerobeam', verbindung: 'sah Amram' },
    { id: 'elija', name: 'Elija', jahre: 'um 860 v. d. Z.', verbindung: 'sah Achija' },
  ];

  // Wie die Linie nach dem Tanach weitergeht. Jahre seit der Erschaffung,
  // dazu die uebliche Zaehlung, beides aus den Zeittafeln beider Baende.
  const WEITER = [
    { jahr: 2928, ueblich: '967 v. d. Z.', name: 'Salomo baut den Tempel', band: 1 },
    { jahr: 3338, ueblich: '586 v. d. Z.', name: 'Zerstörung des Ersten Tempels', band: 1 },
    { jahr: 3828, ueblich: '70 n. d. Z.', name: 'Zerstörung des Zweiten Tempels', band: 1 },
    { jahr: 5252, ueblich: '1492', name: 'Vertreibung aus Spanien', band: 2 },
    { jahr: 5708, ueblich: '1948', name: 'Der Staat Israel', band: 2 },
    { jahr: 5787, ueblich: 'heute', name: 'Heute', band: 2 },
  ];

  const ENDE_ACHSE = 2520;

  function finde(id) {
    for (let i = 0; i < PERSONEN.length; i++) if (PERSONEN[i].id === id) return PERSONEN[i];
    return null;
  }

  // Letztes Jahr, in dem die Person sicher lebte.
  function ende(p) {
    return p.tod != null ? p.tod : p.mindestens;
  }

  function lebtIm(p, jahr) {
    return jahr >= p.geburt && jahr <= ende(p);
  }

  function alterIm(p, jahr) {
    return lebtIm(p, jahr) ? jahr - p.geburt : null;
  }

  function lebensjahre(p) {
    if (p.lebensalter != null) return p.lebensalter;
    return p.tod != null ? p.tod - p.geburt : null;
  }

  function lebendeIm(jahr) {
    return PERSONEN.filter(function (p) { return lebtIm(p, jahr); });
  }

  // Gemeinsame Jahre zweier Menschen, 0 wenn keine.
  function gemeinsam(a, b) {
    const von = Math.max(a.geburt, b.geburt);
    const bis = Math.min(ende(a), ende(b));
    return Math.max(0, bis - von);
  }

  // Alle, die die Person erlebt hat, laengste Ueberschneidung zuerst.
  // offen: eine der beiden Linien endet offen, die Zahl ist ein Mindestwert.
  function zeitgenossen(p) {
    return PERSONEN
      .filter(function (q) {
        if (q === p) return false;
        const offen = p.tod == null || q.tod == null;
        return offen ? Math.min(ende(p), ende(q)) >= Math.max(p.geburt, q.geburt) : gemeinsam(p, q) > 0;
      })
      .map(function (q) { return { person: q, jahre: gemeinsam(p, q), offen: p.tod == null || q.tod == null }; })
      .sort(function (x, y) { return y.jahre - x.jahre; });
  }

  function kinder(p) {
    return PERSONEN.filter(function (q) { return q.eltern.indexOf(p.id) !== -1; });
  }

  function geburtText(p) {
    const j = p.anzeigeGeburt != null ? p.anzeigeGeburt : p.geburt;
    return (p.anzeigeUm ? 'um ' : '') + j;
  }

  return {
    PERSONEN: PERSONEN,
    EREIGNISSE: EREIGNISSE,
    SPRUNGMARKEN: SPRUNGMARKEN,
    KETTE: KETTE,
    WEITER: WEITER,
    ENDE_ACHSE: ENDE_ACHSE,
    finde: finde,
    ende: ende,
    lebtIm: lebtIm,
    alterIm: alterIm,
    lebensjahre: lebensjahre,
    lebendeIm: lebendeIm,
    gemeinsam: gemeinsam,
    zeitgenossen: zeitgenossen,
    kinder: kinder,
    geburtText: geburtText,
  };
});
