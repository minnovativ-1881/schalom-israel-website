// =============================================
// SCHALOM ISRAEL - Aliyah-Logik
// Rein und ohne Seiteneffekte, damit ohne Browser testbar.
// UMD: laeuft per <script> im Browser und per require() in node --test.
// =============================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Aliyah = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  // Der Wochentag bestimmt den Abschnitt der KOMMENDEN Schabbat-Parascha.
  const ALIYAH_NAMEN = {
    1: 'Rischon',
    2: 'Scheni',
    3: 'Schlischi',
    4: 'Rewii',
    5: 'Chamischi',
    6: 'Schischi',
    7: 'Schwii',
  };

  // Sonntag (getUTCDay 0) = 1 ... Schabbat (getUTCDay 6) = 7
  function aliyahNummer(date) {
    return date.getUTCDay() + 1;
  }

  function iso(d) {
    return d.toISOString().slice(0, 10);
  }

  // Der hebraeische Tag beginnt abends. Wer nach Sonnenuntergang geboren
  // wurde, gehoert kalendarisch bereits zum Folgetag.
  function wirksamesDatum(isoDatum, nachSonnenuntergang) {
    const d = new Date(isoDatum + 'T12:00:00Z');
    if (nachSonnenuntergang) d.setUTCDate(d.getUTCDate() + 1);
    return iso(d);
  }

  // Schabbat = getUTCDay 6. Faellt das Datum selbst auf Schabbat, ist es der Tag selbst.
  function naechsterSchabbat(date) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12));
    const diff = (6 - d.getUTCDay() + 7) % 7;
    d.setUTCDate(d.getUTCDate() + diff);
    return iso(d);
  }

  return { aliyahNummer, ALIYAH_NAMEN, naechsterSchabbat, wirksamesDatum };
});
