// =============================================
// SCHALOM ISRAEL - Gottesnamen-Filter
// Harte Projektregel: Der Tetragrammaton wird nie ausgeschrieben.
// Adonai -> HaSchem, Elohim -> Elokim, El -> Kel.
//
// Laeuft ueber JEDE Gemini-Antwort, bevor sie den Server verlaesst.
// Die Regel steht zusaetzlich im Prompt, aber auf Prompt-Befolgung allein
// darf man sich hier nicht verlassen. Dieser Filter ist die Absicherung.
// =============================================

// Reihenfolge ist bedeutsam: Elohim/Elohei vor El, sonst frisst die
// El-Regel den Wortanfang nicht, aber die Wortgrenze macht es eindeutig.
const SUBSTITUTIONEN = [
  [/\bElohim/g, 'Elokim'],
  [/\bElohei\b/g, 'Elokei'],
  [/\bElohenu\b/g, 'Elokenu'],
  [/\bAdonai\b/g, 'HaSchem'],
  [/\bAdonaj\b/g, 'HaSchem'],
  [/\bEl\b/g, 'Kel'],
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
