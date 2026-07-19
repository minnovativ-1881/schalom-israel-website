// =============================================
// SCHALOM ISRAEL - Namens-Zwischenspeicher
//
// Warum: Beim Namens-Tool fragen sehr viele Leute dieselben Namen. Ohne
// Zwischenspeicher erzeugt Gemini fuer jedes "David" eine neue Antwort und
// jede kostet Kontingent. Die haeufigen Namen liegen deshalb vorab als
// statische Datei bereit, die das CDN ausliefert. Fuer diese Namen startet
// die Serverless-Funktion gar nicht erst.
//
// Erzeugt von tools/namen-cache-bauen.js. Nicht von Hand bearbeiten.
// =============================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NamenCache = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  var daten = null;
  var laeuft = null;

  // Vergleichsform: Gross/Klein und Umlaute vereinheitlichen, damit
  // "SARAH", "sarah" und "Sarah" denselben Eintrag treffen.
  function schluessel(name) {
    return String(name || '')
      .trim()
      .toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z]/g, '');
  }

  // Laedt die statische Datei einmal und merkt sie sich.
  function laden() {
    if (daten) return Promise.resolve(daten);
    if (laeuft) return laeuft;
    laeuft = fetch('/entdecken/namen.json')
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; })
      .then(function (j) { daten = j || {}; return daten; });
    return laeuft;
  }

  // Gibt den vorbereiteten Text zurueck oder null.
  function suche(name) {
    return laden().then(function (d) {
      var k = schluessel(name);
      return (k && d[k]) ? d[k] : null;
    });
  }

  return { suche: suche, schluessel: schluessel, laden: laden };
});
