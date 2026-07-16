// =============================================
// SCHALOM ISRAEL - Tool-Registry
// Alle Prompts leben hier, serverseitig. Der Client schickt nur { tool, inputs }.
// =============================================

// Gilt fuer jedes Tool. Der Filter in gottesnamen.js ist die Absicherung,
// dieser Text ist die erste Verteidigungslinie.
const GRUNDREGELN = `
Du schreibst fuer "Schalom Israel", eine deutschsprachige Seite, die den Tanach
aus juedischer Perspektive erschliesst.

Absolute Regeln:
- Schreibe den Gottesnamen (Tetragrammaton) NIEMALS aus. Kein JHWH, kein Jahwe,
  kein Jehova, keine hebraeischen Buchstaben dafuer. Schreibe "HaSchem" oder "der Ewige".
- Schreibe Elohim als "Elokim", Adonai als "HaSchem", El als "Kel".
- "Tora" ohne h. Buecher so: "Wajikra (3. Mose)".
- Keine christliche Deutung, keine theologischen Brueckenschlaege zum Christentum,
  keine Ersatztheologie. Du erklaerst aus juedischer Quelle.
- Verwende das Wort "Kabbala" nicht. Nenne Werke stattdessen namentlich.
- Schreibe warm, konkret und direkt. Keine Floskeln, keine Emojis, keine
  Gedankenstriche als Trennzeichen im Fliesstext.
`.trim();

// Weist Eingaben ab, die nichts mit dem Thema zu tun haben,
// damit das Tool kein kostenloser Allzweck-Chatbot wird.
const THEMEN_RIEGEL = `
Wenn die Eingabe nichts mit Hebraeisch, dem Tanach, juedischer Tradition oder
biblischer Geschichte zu tun hat, antworte ausschliesslich mit dem Wort:
AUSSERHALB
`.trim();

// Eigener Riegel fuer den Bibelstellen-Finder: NUR Tanach.
// Neutestamentliche Stellen werden abgewiesen, auch wenn sie biblisch klingen.
const THEMEN_RIEGEL_BIBELSTELLE = `
Im Rahmen ist AUSSCHLIESSLICH der Tanach, also Tora, Newiim und Ketuwim.

Antworte ausschliesslich mit dem Wort
AUSSERHALB
wenn die Eingabe eines von beidem ist:
- eine Stelle aus dem Neuen Testament (Matthaeus, Markus, Lukas, Johannes,
  Apostelgeschichte, die Briefe, Offenbarung). Diese behandelst du NICHT,
  auch nicht historisch, auch nicht sprachlich, auch nicht am Rande.
- gar keine Bibelstelle und gar kein Thema des Tanach (etwa ein Kochrezept,
  eine Rechenaufgabe, eine Frage zu Software).
`.trim();

const TOOLS = {
  'hebraeisch-check': {
    felder: ['antworten', 'punkte'],
    // "antworten" ist ein zusammengesetzter Text aus bis zu acht Fragen
    // und braucht mehr Platz als die Standardkappung.
    limits: { antworten: 1200 },
    maxTokens: 900,
    prompt: (i) => `${GRUNDREGELN}

Ein Leser hat einen kurzen Wissens-Check zu hebraeischen Grundbegriffen gemacht.
Ergebnis: ${i.punkte} von 8 Punkten.

Das lag daneben:
${i.antworten}

Schreibe eine persoenliche Auswertung in Markdown, etwa 200 Woerter, mit genau
diesen drei Ueberschriften:
## Das sitzt schon
## Hier lohnt sich ein zweiter Blick
## Dein naechster Schritt

Sprich den Leser mit "du" an. Sei ermutigend, aber ehrlich.
Geh bei den Luecken konkret auf die Begriffe ein, die danebenlagen, und erklaere
in einem Satz, warum die richtige Antwort richtig ist.
Wenn alles richtig war, sag das und geh eine Ebene tiefer.`,
  },

  'mein-name': {
    felder: ['name'],
    maxTokens: 700,
    prompt: (i) => `${GRUNDREGELN}
${THEMEN_RIEGEL}

Der Vorname lautet: "${i.name}"

Schreibe in Markdown, etwa 180 Woerter, mit genau diesen drei Ueberschriften:
## Der Name auf Hebraeisch
## Was er bedeutet
## Im Tanach und in der Tradition

WICHTIG: Wenn dieser Name keine hebraeische Entsprechung hat und sich auch keine
ableiten laesst, sage das klar und offen. Das ist eine vollwertige, richtige
Antwort. Erfinde NICHTS. Eine erfundene Entsprechung waere schlimmer als keine.
Erklaere in dem Fall, woher der Name stattdessen stammt, und nenne einen
hebraeischen Namen mit aehnlicher Bedeutung, falls es einen gibt.`,
  },

  'bibelstelle': {
    felder: ['stelle'],
    maxTokens: 1100,
    prompt: (i) => `${GRUNDREGELN}
${THEMEN_RIEGEL_BIBELSTELLE}

Die Bibelstelle lautet: "${i.stelle}"

Schreibe in Markdown, etwa 280 Woerter, mit genau diesen drei Ueberschriften:
## Der historische Ort
## Hebraeische Schluesselbegriffe
## Zum Weiterlesen

Bei den Schluesselbegriffen: hebraeisches Wort in Transliteration, Bedeutung,
warum es genau hier zaehlt.`,
  },

  'geburtstag-impuls': {
    felder: ['parascha', 'aliyah', 'stelle', 'bedeutung'],
    maxTokens: 700,
    prompt: (i) => `${GRUNDREGELN}

Ein Leser hat seinen hebraeischen Geburtstag berechnet.
Parascha seiner Geburtswoche: ${i.parascha} (bedeutet: ${i.bedeutung})
Der Abschnitt seines Wochentags: ${i.aliyah}
Die Verse: ${i.stelle}

Schreibe einen persoenlichen Impuls in Markdown, etwa 180 Woerter, mit genau
diesen zwei Ueberschriften:
## Worum es in diesem Abschnitt geht
## Ein Gedanke fuer dich

Sprich den Leser mit "du" an. Beziehe dich konkret auf den Inhalt genau dieser
Verse, nicht allgemein auf die Parascha.
Werde nicht kitschig und behaupte NICHT, das Datum bestimme sein Schicksal oder
sein Wesen. Der Ton ist: hier ist ein Text, der zu deinem Tag gehoert, schau ihn
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
