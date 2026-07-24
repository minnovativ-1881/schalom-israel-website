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

// Wo der Prompt feste Ueberschriften vorgibt, faengt die Antwort auch dort an.
// Gemini stellte trotz Anweisung einen Brief voran: "Lieber Leser, herzlichen
// Glueckwunsch ... Es ist wunderbar, dass du dich mit dem Tanach beschaeftigst."
// Das ist Anrede plus Ansprache des Lesers als Nutzer, beides unerwuenscht,
// und auf dem PDF-Blatt sah es albern aus.
//
// Alles vor der ersten Ueberschrift faellt weg. Nur wenn ueberhaupt eine
// Ueberschrift da ist, sonst bliebe nichts uebrig.
function schneideVorspann(text) {
  if (!text) return text;
  const roh = String(text);
  const treffer = roh.match(/^#{1,3} /m);
  if (!treffer || treffer.index === 0) return roh;
  return roh.slice(treffer.index);
}

// Derselbe Briefreflex am Ende: "Möge es ein Jahr voller Segen sein."
// Es trifft nur den LETZTEN Satz und nur, wenn er mit einer Grussformel
// anfaengt. Ein Segensspruch aus dem Tanach steht in Anfuehrungszeichen und
// bleibt deshalb stehen.
const ABSCHIED = /(^|[.!?]\s+)(Möge (es|dir|dein|dieses|dieser)|Herzliche Grüße|Alles Gute|Ich wünsche dir)[^"„»]*?[.!?]\s*$/;

function schneideAbschied(text) {
  if (!text) return text;
  return String(text).replace(ABSCHIED, '$1').trimEnd();
}

function saeubereStil(text) {
  return raeumeAuf(entferneGedankenstriche(schneideAbschied(schneideVorspann(text))));
}

module.exports = {
  saeubereStil, entferneGedankenstriche, raeumeAuf,
  schneideVorspann, schneideAbschied,
};
