// =============================================
// SCHALOM ISRAEL - Feste des Geburtstags-Tools
//
// Wer an einem Fest geboren ist, bekommt zusaetzlich die Lesung dieses Festes
// als Zusatztext (nie aufs Blatt). Hebcal kennt 68 Anlaesse, viele davon
// Varianten oder mit gleicher Lesung. Dieses Modul gruppiert sie auf 18
// sinnvolle Fest-Einheiten und liefert die deutsche Bezeichnung.
//
// festKey(anlassEn) -> { key, label } oder null (kein passendes Fest / Mincha)
// FESTE[key] -> { name, stelleEn, kurz }  (fuer die Bestand-Erzeugung)
//
// UMD, damit Generator (node) und Tool (browser) dasselbe nutzen.
// =============================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Feste = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  // name: fuer den Prompt ("... geboren an NAME"). stelleEn: repraesentative
  // Haupt-Lesung (fuer die deutsche Referenz). kurz: steuert den Prompt.
  const FESTE = {
    'rosch-chodesch': { name: 'Rosch Chodesch, dem Neumondtag', stelleEn: 'Numbers 28:1-28:15',
      kurz: 'die Opfer des Neumondtags, der kleine Neuanfang jeden Monat' },
    'fasttag': { name: 'einem öffentlichen Fasttag', stelleEn: 'Exodus 32:11-32:14, 34:1-34:10',
      kurz: 'Mosches Fürbitte nach dem goldenen Kalb und die dreizehn Eigenschaften der Barmherzigkeit' },
    'pessach-1': { name: 'dem ersten Tag von Pessach', stelleEn: 'Exodus 12:21-12:51',
      kurz: 'die Nacht des Auszugs aus Ägypten und das erste Pessachopfer' },
    'pessach-7': { name: 'dem siebten Tag von Pessach', stelleEn: 'Exodus 13:17-15:26',
      kurz: 'der Durchzug durch das Meer und das Lied am Meer' },
    'pessach-zwischentage': { name: 'den Zwischenfeiertagen von Pessach', stelleEn: 'Exodus 13:1-13:16',
      kurz: 'Gebote der Freiheit und des Gedenkens an den Zwischentagen von Pessach' },
    'festkalender-wajikra': { name: 'einem Feiertag, an dem der Festkalender aus Wajikra gelesen wird (Pessach oder Sukkot)',
      stelleEn: 'Leviticus 22:26-23:44',
      kurz: 'der Festkalender in Wajikra: Schabbat, Pessach, Schawuot und die Herbstfeste' },
    'festkalender-dewarim': { name: 'einem Wallfahrtsfest, an dem die Festordnung aus Dewarim gelesen wird (Pessach, Schawuot oder Schmini Azeret)',
      stelleEn: 'Deuteronomy 14:22-16:17',
      kurz: 'die drei Wallfahrtsfeste und das Teilen mit dem Fremden, der Waise und der Witwe' },
    'fest-zwischenschabbat': { name: 'dem Zwischenschabbat eines Festes', stelleEn: 'Exodus 33:12-34:26',
      kurz: 'Mosches Bitte, Gottes Herrlichkeit zu sehen, und die dreizehn Eigenschaften' },
    'schawuot': { name: 'Schawuot, dem Fest der Toragabe', stelleEn: 'Exodus 19:1-20:23',
      kurz: 'die Offenbarung am Sinai und die zehn Worte' },
    'rosch-haschana-1': { name: 'dem ersten Tag von Rosch HaSchana', stelleEn: 'Genesis 21:1-21:34',
      kurz: 'die Geburt Jizchaks, das späte Wunder an Sara und Abraham' },
    'rosch-haschana-2': { name: 'dem zweiten Tag von Rosch HaSchana', stelleEn: 'Genesis 22:1-22:24',
      kurz: 'die Bindung Jizchaks, die Prüfung Abrahams' },
    'jom-kippur': { name: 'Jom Kippur, dem Versöhnungstag', stelleEn: 'Leviticus 16:1-16:34',
      kurz: 'der Dienst des Hohepriesters am Versöhnungstag' },
    'sukkot-zwischentage': { name: 'den Zwischenfeiertagen von Sukkot', stelleEn: 'Numbers 29:17-29:34',
      kurz: 'die Festopfer der Zwischentage von Sukkot' },
    'simchat-tora': { name: 'Simchat Tora, dem Tag von Toraschluss und Neubeginn', stelleEn: 'Deuteronomy 33:1-34:12',
      kurz: 'Mosches Segen über die Stämme und sein Tod, unmittelbar gefolgt vom Anfang der Schöpfung' },
    'chanukka': { name: 'Chanukka', stelleEn: 'Numbers 7:1-7:17',
      kurz: 'die Gaben der Stammesfürsten zur Einweihung des Heiligtums' },
    'purim': { name: 'Purim', stelleEn: 'Exodus 17:8-17:16',
      kurz: 'der Angriff Amaleks und der Auftrag, sein Andenken nicht zu vergessen' },
    'tischa-beaw': { name: 'Tischa BeAw, dem Trauertag über die Zerstörung', stelleEn: 'Deuteronomy 4:25-4:40',
      kurz: 'die Warnung vor Zerstreuung und die Verheißung der Umkehr aus der Ferne' },
    'jom-haatzmaut': { name: 'Jom haAtzmaut, dem Unabhängigkeitstag Israels', stelleEn: 'Deuteronomy 7:12-8:18',
      kurz: 'der Segen des Landes und die Mahnung, Gott im Wohlstand nicht zu vergessen' },
  };

  // Reihenfolge zaehlt: erste passende Regel gewinnt. label ist die deutsche
  // Bezeichnung fuer genau diesen Anlass (feiner als der key).
  const REGELN = [
    [/^Rosh Chodesh/, 'rosch-chodesch', 'Rosch Chodesch'],
    [/^Chanukah/, 'chanukka', 'Chanukka'],
    [/^Pesach I\b/, 'pessach-1', 'Pessach, erster Tag'],
    [/^Pesach VII\b/, 'pessach-7', 'Pessach, siebter Tag'],
    [/^Pesach VIII\b/, 'festkalender-dewarim', 'Pessach, achter Tag'],
    [/^Pesach II\b/, 'festkalender-wajikra', 'Pessach, zweiter Tag'],
    [/^Pesach Shabbat Chol/, 'fest-zwischenschabbat', 'Pessach, Zwischenschabbat'],
    [/^Pesach Chol ha-Moed/, 'pessach-zwischentage', 'Pessach, Zwischenfeiertage'],
    [/^Shavuot I\b/, 'schawuot', 'Schawuot'],
    [/^Shavuot II\b/, 'festkalender-dewarim', 'Schawuot, zweiter Tag'],
    [/^Rosh Hashana II\b/, 'rosch-haschana-2', 'Rosch HaSchana, zweiter Tag'],
    [/^Rosh Hashana/, 'rosch-haschana-1', 'Rosch HaSchana'],
    [/^Yom Kippur/, 'jom-kippur', 'Jom Kippur'],
    [/^Sukkot Shabbat Chol/, 'fest-zwischenschabbat', 'Sukkot, Zwischenschabbat'],
    [/^Sukkot I\b|^Sukkot II\b/, 'festkalender-wajikra', 'Sukkot'],
    [/^Sukkot (Chol|Final|Hoshana)/, 'sukkot-zwischentage', 'Sukkot, Zwischenfeiertage'],
    [/^Shmini Atzeret/, 'festkalender-dewarim', 'Schmini Azeret'],
    [/^(Erev )?Simchat Torah/, 'simchat-tora', 'Simchat Tora'],
    [/^Purim/, 'purim', 'Purim'],
    [/Tish'?a B'?Av/, 'tischa-beaw', 'Tischa BeAw'],
    [/^Yom HaAtzma'?ut/, 'jom-haatzmaut', 'Jom haAtzmaut'],
    [/Asara B'?Tevet|Ta'?anit Esther|Tzom Gedaliah|Tzom Tammuz|Tzom/, 'fasttag', 'öffentlicher Fasttag'],
  ];

  function festKey(anlassEn) {
    if (!anlassEn) return null;
    if (/Mincha/i.test(anlassEn)) return null; // Nachmittagslesung, nicht die Tageslesung
    for (const eintrag of REGELN) {
      if (eintrag[0].test(anlassEn)) return { key: eintrag[1], label: eintrag[2] };
    }
    return null;
  }

  return { FESTE, festKey };
});
