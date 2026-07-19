// =============================================
// SCHALOM ISRAEL - Stil-Filter
// Setzt Timons Schreibregeln durch, auf die Prompt-Befolgung allein
// keinen Verlass ist. Gleiches Prinzip wie gottesnamen.js.
// =============================================

// Gedankenstriche als Trennzeichen im Fliesstext sind verboten.
// ACHTUNG: Bibelstellen wie "25,29–38" oder "1,1–3,22" nutzen denselben
// Strich voellig zu Recht. Deshalb greifen wir NUR bei Strichen, die von
// Leerzeichen umgeben sind, und lassen Ziffernbereiche unberuehrt.
function entferneGedankenstriche(text) {
  if (!text) return text;
  return String(text)
    // " – " oder " — " am Satzende vor Grossbuchstaben -> Punkt
    .replace(/\s+[–—]\s+/g, ', ')
    // Doppelter Bindestrich als Ersatzschreibung
    .replace(/\s+--\s+/g, ', ');
}

// Doppelte Kommas und Leerzeichen, die durch die Ersetzung entstehen koennen.
function raeumeAuf(text) {
  if (!text) return text;
  return String(text)
    .replace(/,\s*,/g, ',')
    .replace(/,\s*\./g, '.')
    .replace(/[ \t]{2,}/g, ' ');
}

function saeubereStil(text) {
  return raeumeAuf(entferneGedankenstriche(text));
}

module.exports = { saeubereStil, entferneGedankenstriche, raeumeAuf };
