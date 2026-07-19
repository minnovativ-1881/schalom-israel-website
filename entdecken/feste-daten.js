// =============================================
// SCHALOM ISRAEL - Feste, deutsche Erklaerungen
//
// Die DATEN kommen von Hebcal und sind damit immer korrekt. Die TEXTE stehen
// hier, damit sie auf Deutsch und in eigener Stimme sind. Verbunden wird
// ueber Hebcals englischen Titel (Feld title_orig).
//
// Kein KI-Aufruf, kostet kein Kontingent.
//
// UMD, damit ohne Browser testbar.
// =============================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FesteDaten = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  // rang: 1 = Hauptfest, 2 = weiteres Fest, 3 = Nebentag
  const FESTE = {
    'Rosh Hashana': {
      de: 'Rosch HaSchana', rang: 1,
      k: 'Jahresanfang und Tag des Gerichts',
      t: 'Der Kopf des Jahres. Zwei Tage, an denen das Schofar geblasen wird. Anders als ein Silvester ist der Tag ernst: Er eröffnet die zehn Tage, die auf Jom Kippur zulaufen.',
      s: 'Wajikra (3. Mose) 23,24',
    },
    'Yom Kippur': {
      de: 'Jom Kippur', rang: 1,
      k: 'Tag der Sühne, Fasten und Umkehr',
      t: 'Der ernsteste Tag des Jahres. Gefastet wird von Sonnenuntergang bis Sonnenuntergang. Nach der Überlieferung wirkt der Tag für das, was zwischen Mensch und HaSchem steht. Was zwischen Menschen steht, muss vorher mit ihnen selbst geklärt werden.',
      s: 'Wajikra (3. Mose) 16',
    },
    'Sukkot': {
      de: 'Sukkot', rang: 1,
      k: 'Laubhüttenfest, sieben Tage im Provisorium',
      t: 'Sieben Tage lang wird in einer Hütte gewohnt, deren Dach den Himmel durchscheinen lässt. Das Fest fällt in die Erntezeit, und genau darin liegt die Pointe: Wer eingefahren hat, zieht trotzdem ins Zelt.',
      s: 'Wajikra (3. Mose) 23,42',
    },
    'Shmini Atzeret': {
      de: 'Schmini Azeret', rang: 2,
      k: 'der achte Tag, ein eigenes Fest',
      t: 'Schließt sich an Sukkot an, gilt aber als eigener Tag. Die Überlieferung liest ihn als Bitte um noch einen Tag, bevor man auseinandergeht.',
    },
    'Simchat Torah': {
      de: 'Simchat Tora', rang: 2,
      k: 'Freude über die Tora, Ende und Anfang des Lesejahres',
      t: 'An diesem Tag wird der letzte Abschnitt der Tora gelesen und unmittelbar danach der erste. Der Kreis schließt sich nicht, er dreht sich weiter.',
    },
    'Chanukah': {
      de: 'Chanukka', rang: 2,
      k: 'acht Tage Lichter, Erinnerung an die Wiedereinweihung',
      t: 'Kein Fest aus der Tora, sondern später entstanden. Jeden Abend kommt ein Licht dazu, nie eines weg. Chanukka heißt Einweihung.',
    },
    'Tu BiShvat': {
      de: 'Tu BiSchwat', rang: 3,
      k: 'Neujahr der Bäume',
      t: 'Ein Stichtag, ursprünglich für die Berechnung von Abgaben auf Baumfrüchte. Aus dem Verwaltungsdatum ist ein Tag geworden, an dem gepflanzt und Früchte gegessen werden.',
    },
    'Purim': {
      de: 'Purim', rang: 2,
      k: 'Erinnerung an die Rettung in Persien',
      t: 'Die Rolle Ester wird gelesen, laut und mit Lärm bei einem bestimmten Namen. Auffällig an dem Buch: Der Gottesname kommt darin nicht vor. Genau das gehört zur Aussage.',
      s: 'Ester 9,26',
    },
    'Erev Purim': { de: 'Erew Purim', rang: 3, k: 'Vorabend von Purim', t: 'Der Tag davor, an dem gefastet wird (Taanit Ester).' },
    'Shushan Purim': { de: 'Schuschan Purim', rang: 3, k: 'Purim in ummauerten Städten', t: 'In Städten, die seit alter Zeit ummauert sind, etwa Jeruschalajim, wird Purim einen Tag später begangen.' },
    'Pesach': {
      de: 'Pessach', rang: 1,
      k: 'Auszug aus Mizrajim, sieben Tage ohne Gesäuertes',
      t: 'Am Seder-Abend wird die Geschichte des Auszugs erzählt, und zwar so, als betreffe sie die Anwesenden selbst. Sieben Tage lang wird nichts Gesäuertes gegessen.',
      s: 'Schemot (2. Mose) 12',
    },
    'Erev Pesach': { de: 'Erew Pessach', rang: 3, k: 'Vorabend, Beginn des Fests', t: 'Der Tag, an dem das Gesäuerte entfernt wird und am Abend der Seder stattfindet.' },
    'Pesach Sheni': { de: 'Pessach Scheni', rang: 3, k: 'zweites Pessach, ein Nachholtermin', t: 'Für alle, die am eigentlichen Termin verhindert waren. Bemerkenswert, dass die Tora einen Nachholtermin überhaupt vorsieht.', s: 'Bamidbar (4. Mose) 9,11' },
    'Lag BaOmer': {
      de: 'Lag BaOmer', rang: 3,
      k: 'der 33. Tag der Omer-Zählung',
      t: 'Eine Unterbrechung in einer sonst zurückhaltenden Zeit. Traditionell mit Feuern und Ausflügen begangen.',
    },
    'Shavuot': {
      de: 'Schawuot', rang: 1,
      k: 'Wochenfest, sieben Wochen nach Pessach',
      t: 'Ursprünglich ein Erntefest, in der Überlieferung verbunden mit der Gabe der Tora am Sinai. Der Name kommt von den sieben gezählten Wochen.',
      s: 'Schemot (2. Mose) 34,22',
    },
    'Erev Shavuot': { de: 'Erew Schawuot', rang: 3, k: 'Vorabend von Schawuot', t: 'Vielerorts wird die Nacht durchgelernt.' },
    'Tish\'a B\'Av': {
      de: 'Tischa BeAw', rang: 2,
      k: 'Trauertag, Zerstörung beider Heiligtümer',
      t: 'Ein Fastentag. Nach der Überlieferung fielen die Zerstörung des ersten und des zweiten Heiligtums auf denselben Tag. Gelesen wird Echa, die Klagelieder.',
    },
    'Tu B\'Av': { de: 'Tu BeAw', rang: 3, k: 'ein heller Tag mitten im Trauermonat', t: 'Wenige Tage nach Tischa BeAw, in der Überlieferung als einer der freudigsten Tage beschrieben.' },
    'Rosh Chodesh': { de: 'Rosch Chodesch', rang: 3, k: 'Monatsanfang, Neumond', t: 'Der hebräische Kalender richtet sich nach dem Mond. Der Monatsanfang wird eigens begangen.' },
    'Selichot': { de: 'Slichot', rang: 3, k: 'Bußgebete vor den hohen Feiertagen', t: 'Beginnen in den Nächten vor Rosch HaSchana und stimmen auf die Tage der Umkehr ein.' },
    'Yom HaShoah': { de: 'Jom HaSchoa', rang: 2, k: 'Gedenktag für die Schoa', t: 'In Israel wird um zehn Uhr eine Sirene ausgelöst, das Land steht still.' },
    'Yom HaZikaron': { de: 'Jom HaSikaron', rang: 2, k: 'Gedenktag für die Gefallenen', t: 'Geht unmittelbar in den Unabhängigkeitstag über. Der Übergang von Trauer zu Feier an einem Abend ist gewollt.' },
    'Yom HaAtzma\'ut': { de: 'Jom HaAzmaut', rang: 2, k: 'Unabhängigkeitstag Israels', t: 'Erinnert an die Ausrufung des Staates 1948.' },
    'Yom Yerushalayim': { de: 'Jom Jeruschalajim', rang: 3, k: 'Tag der Wiedervereinigung Jeruschalajims', t: 'Erinnert an das Jahr 1967.' },
    'Sigd': { de: 'Sigd', rang: 3, k: 'Fest der äthiopischen Gemeinde', t: 'Fünfzig Tage nach Jom Kippur begangen, seit 2008 offizieller Feiertag in Israel.' },
    'Asara B\'Tevet': { de: 'Assara BeTewet', rang: 3, k: 'Fastentag, Beginn der Belagerung', t: 'Erinnert an den Beginn der Belagerung Jeruschalajims.' },
    'Ta\'anit Esther': { de: 'Taanit Ester', rang: 3, k: 'Fasten vor Purim', t: 'Erinnert an das Fasten, zu dem Ester aufrief.' },
    'Ta\'anit Bechorot': { de: 'Taanit Bechorot', rang: 3, k: 'Fasten der Erstgeborenen', t: 'Am Vorabend von Pessach, zur Erinnerung an die Verschonung der Erstgeborenen.' },
    'Tzom Gedaliah': { de: 'Zom Gedalja', rang: 3, k: 'Fastentag nach Rosch HaSchana', t: 'Erinnert an die Ermordung Gedaljas und das Ende jüdischer Selbstverwaltung nach der ersten Zerstörung.' },
    'Tzom Tammuz': { de: 'Zom Tammus', rang: 3, k: 'Fastentag, Bresche in der Stadtmauer', t: 'Beginnt die drei Wochen, die auf Tischa BeAw zulaufen.' },
  };

  // Hebcal haengt an mehrtaegige Feste Nummern an ("Pesach I", "Sukkot II").
  // Für die Zuordnung interessiert nur der Grundname.
  function grundname(titelOrig) {
    return String(titelOrig || '')
      .replace(/\s+[IVX]+$/, '')
      .replace(/\s+\(CH''M\)$/, '')
      .replace(/\s+\d{4}$/, '')
      .trim();
  }

  function fuer(titelOrig) {
    const t = String(titelOrig || '').trim();
    if (FESTE[t]) return FESTE[t];
    const g = grundname(t);
    return FESTE[g] || null;
  }

  return { FESTE, fuer, grundname };
});
