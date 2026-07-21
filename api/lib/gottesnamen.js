// =============================================
// SCHALOM ISRAEL - Gottesnamen-Filter fuer die Entdecken-Seiten
//
// Zwei Regeln:
//
// 1. Der Tetragrammaton wird NIE ausgeschrieben. Das ist hart und gilt
//    ueberall. Antworten, die ihn enthalten, werden verworfen.
//
// 2. In DIESEN Texten steht schlicht "Gott". Keine Ersatzschreibungen wie
//    Kel, Elokim oder HaSchem. Timon am 2026-07-19: "In diesen Texten soll
//    immer Gott stehen, niemals Kel oder so." Der Grund liegt auf der Hand:
//    Die Werkzeuge richten sich an ein breites Publikum, das mit diesen
//    Formen nichts anfangen kann und ueber sie stolpert.
//    ACHTUNG: Fuer Artikel und Buecher gilt weiterhin die andere Regel.
//    Dieser Filter gilt nur fuer die Entdecken-Seiten.
// =============================================

// Reihenfolge bedeutsam: die laengeren Formen zuerst, sonst greift
// die kurze El-Regel zu frueh.
const SUBSTITUTIONEN = [
  [/\bElohenu\b/g, 'unser Gott'],
  [/\bElokenu\b/g, 'unser Gott'],
  [/\bElohei\b/g, 'Gott'],
  [/\bElokei\b/g, 'Gott'],
  [/\bElohims\b/g, 'Gottes'],
  [/\bElokims\b/g, 'Gottes'],
  [/\bElohim\b/g, 'Gott'],
  [/\bElokim\b/g, 'Gott'],
  [/\bAdonai\b/g, 'Gott'],
  [/\bAdonaj\b/g, 'Gott'],
  [/\bHaSchem\b/g, 'Gott'],
  [/\bHaschem\b/g, 'Gott'],
  [/\bHashem\b/g, 'Gott'],
  [/\bKel\b/g, 'Gott'],
  [/\bEl\b/g, 'Gott'],
];

const TETRAGRAMMATON = [
  /\bJHWH\b/i,
  /\bYHWH\b/i,
  /\bYHVH\b/i,
  /\bJHVH\b/i,
  /\bJahwe\b/i,
  /\bYahweh\b/i,
  /\bJehova[hs]?\b/i,
  /\bJehowa[hs]?\b/i,
  /יהוה/,
];

function substituiere(text) {
  if (!text) return text;
  let out = String(text);
  for (const [muster, ersatz] of SUBSTITUTIONEN) {
    out = out.replace(muster, ersatz);
  }
  return out;
}

function enthaeltGottesnamen(text) {
  if (!text) return false;
  const s = String(text);
  return TETRAGRAMMATON.some((m) => m.test(s));
}

// Wirft, wenn der Tetragrammaton vorkommt. Sonst substituiert.
function saeubere(text) {
  if (enthaeltGottesnamen(text)) {
    throw new Error('Gottesname in der Antwort gefunden');
  }
  return substituiere(text);
}

module.exports = { substituiere, enthaeltGottesnamen, saeubere };
