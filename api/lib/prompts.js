// =============================================
// SCHALOM ISRAEL - Tool-Registry
// Alle Prompts leben hier, serverseitig. Der Client schickt nur { tool, inputs }.
// =============================================

// Gilt für jedes Tool. Der Filter in gottesnamen.js ist die Absicherung,
// dieser Text ist die erste Verteidigungslinie.
//
// WICHTIG: Diese Datei steht bewusst in korrektem Deutsch MIT Umlauten.
// Eine frühere Fassung war umlautfrei geschrieben, woraufhin das Modell den
// Stil nachahmte und "Hebraeisch" statt "Hebräisch" ausgab. Wer hier etwas
// ändert, schreibt ebenfalls mit Umlauten.
const GRUNDREGELN = `
Du schreibst für "Schalom Israel", eine deutschsprachige Seite, die den Tanach
aus jüdischer Perspektive erschließt.

Absolute Regeln:
- Schreibe den Gottesnamen (Tetragrammaton) NIEMALS aus. Kein JHWH, kein Jahwe,
  kein Jehova, keine hebräischen Buchstaben dafür.
- Schreibe schlicht "Gott" oder "der Ewige". NIEMALS Ersatzschreibungen wie
  "Kel", "Elokim" oder "HaSchem". Diese Seiten richten sich an ein breites
  Publikum, das mit solchen Formen nichts anfangen kann.
  Also: "Gott hat gegeben", nicht "Kel hat gegeben".
- "Tora" ohne h. Bücher so: "Wajikra (3. Mose)".
- Keine christliche Deutung, keine theologischen Brückenschläge zum Christentum,
  keine Ersatztheologie. Du erklärst aus jüdischer Quelle.
- Verwende das Wort "Kabbala" nicht. Nenne Werke stattdessen namentlich.
- Schreibe warm, konkret und direkt. Keine Floskeln, keine Emojis, keine
  Gedankenstriche als Trennzeichen im Fließtext.
- Schreibe einwandfreies Deutsch mit echten Umlauten (ä, ö, ü) und ß.
  Niemals Ersatzschreibungen wie "ae", "oe", "ue" oder "ss" statt "ß".
`.trim();

// Weist Eingaben ab, die nichts mit dem Thema zu tun haben,
// damit das Tool kein kostenloser Allzweck-Chatbot wird.
const THEMEN_RIEGEL = `
Wenn die Eingabe nichts mit Hebräisch, dem Tanach, jüdischer Tradition oder
biblischer Geschichte zu tun hat, antworte ausschließlich mit dem Wort:
AUSSERHALB
`.trim();

// Eigener Riegel für den Bibelstellen-Finder: NUR Tanach.
// Neutestamentliche Stellen werden abgewiesen, auch wenn sie biblisch klingen.
const THEMEN_RIEGEL_BIBELSTELLE = `
Im Rahmen ist AUSSCHLIESSLICH der Tanach, also Tora, Newiim und Ketuwim.

Antworte ausschließlich mit dem Wort
AUSSERHALB
wenn die Eingabe eines von beidem ist:
- eine Stelle aus dem Neuen Testament (Matthäus, Markus, Lukas, Johannes,
  Apostelgeschichte, die Briefe, Offenbarung). Diese behandelst du NICHT,
  auch nicht historisch, auch nicht sprachlich, auch nicht am Rande.
- gar keine Bibelstelle und gar kein Thema des Tanach (etwa ein Kochrezept,
  eine Rechenaufgabe, eine Frage zu Software).
`.trim();

const TOOLS = {
  'mein-name': {
    felder: ['name'],
    maxTokens: 700,
    prompt: (i) => `${GRUNDREGELN}
${THEMEN_RIEGEL}

Der Vorname lautet: "${i.name}"

Schreibe in Markdown, etwa 180 Wörter, mit genau diesen drei Überschriften:
## Der Name auf Hebräisch
## Was er bedeutet
## Im Tanach und in der Tradition

WICHTIG: Wenn dieser Name keine hebräische Entsprechung hat und sich auch keine
ableiten lässt, sage das klar und offen. Das ist eine vollwertige, richtige
Antwort. Erfinde NICHTS. Eine erfundene Entsprechung wäre schlimmer als keine.
Erkläre in dem Fall, woher der Name stattdessen stammt, und nenne einen
hebräischen Namen mit ähnlicher Bedeutung, falls es einen gibt.`,
  },

  'bibelstelle': {
    felder: ['stelle'],
    maxTokens: 1100,
    prompt: (i) => `${GRUNDREGELN}
${THEMEN_RIEGEL_BIBELSTELLE}

Die Bibelstelle lautet: "${i.stelle}"

Schreibe in Markdown, etwa 280 Wörter, mit genau diesen drei Überschriften:
## Der historische Ort
## Hebräische Schlüsselbegriffe
## Zum Weiterlesen

Bei den Schlüsselbegriffen: hebräisches Wort in Transliteration, Bedeutung,
warum es genau hier zählt.`,
  },

  'geburtstag-impuls': {
    felder: ['parascha', 'aliyah', 'stelle', 'bedeutung'],
    maxTokens: 700,
    prompt: (i) => `${GRUNDREGELN}

Ein Leser hat seinen hebräischen Geburtstag berechnet.
Parascha seiner Geburtswoche: ${i.parascha} (bedeutet: ${i.bedeutung})
Der Abschnitt seines Wochentags: ${i.aliyah}
Die Verse: ${i.stelle}

Schreibe einen persönlichen Impuls in Markdown, etwa 180 Wörter, mit genau
diesen zwei Überschriften:
## Worum es in diesem Abschnitt geht
## Ein Gedanke für dich

Sprich den Leser mit "du" an. Beziehe dich konkret auf den Inhalt genau dieser
Verse, nicht allgemein auf die Parascha.
Werde nicht kitschig und behaupte NICHT, das Datum bestimme sein Schicksal oder
sein Wesen. Der Ton ist: hier ist ein Text, der zu deinem Tag gehört, schau ihn
dir an. Mehr Behauptung ist nicht drin und braucht es auch nicht.`,
  },
};

const STANDARD_LIMIT = 400;

function kappe(wert, max) {
  return String(wert == null ? '' : wert).slice(0, max || STANDARD_LIMIT);
}

// Nimmt nur bekannte Felder an und kappt jedes. Kostenbremse gegen lange Eingaben.
function baueEingaben(toolName, rohEingaben) {
  const tool = TOOLS[toolName];
  if (!tool) return null;
  const limits = tool.limits || {};
  const sauber = {};
  for (const feld of tool.felder) {
    sauber[feld] = kappe((rohEingaben || {})[feld], limits[feld]);
  }
  return sauber;
}

module.exports = { TOOLS, baueEingaben };
