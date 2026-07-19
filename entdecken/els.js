// =============================================
// SCHALOM ISRAEL - ELS-Suche (Equidistant Letter Sequences)
//
// Liest den Konsonantentext der Tora in gleichmaessigen Schritten: jeden
// zweiten, jeden siebten, jeden fuenfzigsten Buchstaben. Findet sich dabei
// ein Wort, nennt man das einen ELS-Fund.
//
// Reine Mathematik, kein KI-Aufruf. Kostet dauerhaft kein Kontingent.
//
// WICHTIG fuer die ehrliche Darstellung: Diese Funde sind zu ERWARTEN.
// Bei 300.000 Buchstaben und freier Schrittweite findet man fast jedes kurze
// Wort. Deshalb liefert die Suche neben der Trefferzahl auch die statistisch
// erwartete Zahl mit. Wer beide nebeneinander sieht, kann selbst einordnen.
//
// UMD, damit ohne Browser testbar.
// =============================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ELS = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  const ALEFBET = 'אבגדהוזחטיכלמנסעפצקרשת';
  const ENDFORMEN = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };

  const INDEX = {};
  for (let i = 0; i < ALEFBET.length; i++) INDEX[ALEFBET[i]] = i;

  // Text einmalig in ein typisiertes Array umwandeln. Vergleiche auf Zahlen
  // sind deutlich schneller als auf Zeichenketten, und die Suche macht
  // Millionen davon.
  function vorbereiten(text) {
    const n = text.length;
    const arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      const c = text[i];
      arr[i] = INDEX[ENDFORMEN[c] || c];
    }
    return arr;
  }

  // Haeufigkeit jedes Buchstabens, fuer die Erwartungsrechnung.
  function haeufigkeiten(arr) {
    const zaehler = new Float64Array(22);
    for (let i = 0; i < arr.length; i++) zaehler[arr[i]]++;
    const f = new Float64Array(22);
    for (let i = 0; i < 22; i++) f[i] = zaehler[i] / arr.length;
    return f;
  }

  // Suchwort in Zahlen umwandeln. Gibt null, wenn ein Zeichen nicht passt.
  function wortZuIndex(wort) {
    const aus = [];
    for (const c of String(wort || '')) {
      const g = ENDFORMEN[c] || c;
      if (INDEX[g] === undefined) continue;
      aus.push(INDEX[g]);
    }
    return aus.length ? aus : null;
  }

  // Wie viele Funde waeren rein zufaellig zu erwarten?
  // Naeherung: Anzahl moeglicher Startpunkte mal Wahrscheinlichkeit,
  // dass dort zufaellig die richtige Buchstabenfolge steht.
  function erwartung(wortIdx, arr, maxSprung, f) {
    let p = 1;
    for (const i of wortIdx) p *= f[i];
    const laenge = wortIdx.length;
    let starts = 0;
    for (let d = 1; d <= maxSprung; d++) {
      const moeglich = arr.length - (laenge - 1) * d;
      if (moeglich > 0) starts += moeglich;
    }
    // mal zwei, weil auch rueckwaerts gesucht wird
    return 2 * starts * p;
  }

  // Sinnvolle Obergrenze fuer die Schrittweite.
  function maxSprungFuer(laenge, textLaenge) {
    if (laenge < 2) return 1;
    return Math.min(2000, Math.floor((textLaenge - 1) / (laenge - 1)));
  }

  // Die eigentliche Suche.
  // Rueckgabe: { treffer: [{position, sprung, richtung}], anzahl, erwartet, ... }
  function suche(arr, wort, opts) {
    opts = opts || {};
    const wortIdx = wortZuIndex(wort);
    if (!wortIdx || wortIdx.length < 2) {
      return { fehler: 'zu-kurz', treffer: [], anzahl: 0 };
    }

    const laenge = wortIdx.length;
    const n = arr.length;
    const maxSprung = opts.maxSprung || maxSprungFuer(laenge, n);
    const maxTreffer = opts.maxTreffer || 200;

    const erster = wortIdx[0];
    const zweiter = wortIdx[1];
    const treffer = [];
    let anzahl = 0;

    for (let p = 0; p < n; p++) {
      if (arr[p] !== erster) continue;

      // vorwaerts
      const restVor = n - 1 - p;
      const maxVor = Math.min(maxSprung, Math.floor(restVor / (laenge - 1)));
      for (let d = 1; d <= maxVor; d++) {
        if (arr[p + d] !== zweiter) continue;
        let passt = true;
        for (let k = 2; k < laenge; k++) {
          if (arr[p + k * d] !== wortIdx[k]) { passt = false; break; }
        }
        if (passt) {
          anzahl++;
          if (treffer.length < maxTreffer) treffer.push({ position: p, sprung: d, richtung: 1 });
        }
      }

      // rueckwaerts
      const maxRueck = Math.min(maxSprung, Math.floor(p / (laenge - 1)));
      for (let d = 1; d <= maxRueck; d++) {
        if (arr[p - d] !== zweiter) continue;
        let passt = true;
        for (let k = 2; k < laenge; k++) {
          if (arr[p - k * d] !== wortIdx[k]) { passt = false; break; }
        }
        if (passt) {
          anzahl++;
          if (treffer.length < maxTreffer) treffer.push({ position: p, sprung: d, richtung: -1 });
        }
      }
    }

    // Kleine Schrittweiten zuerst: sie gelten als bemerkenswerter.
    treffer.sort((a, b) => a.sprung - b.sprung || a.position - b.position);

    return {
      treffer,
      anzahl,
      gezeigt: treffer.length,
      maxSprung,
      laenge,
      wortIdx,
    };
  }

  // Umgebung eines Fundes, damit man ihn im Text nachschlagen kann.
  function umgebung(text, position, spanne) {
    spanne = spanne || 40;
    const von = Math.max(0, position - spanne);
    const bis = Math.min(text.length, position + spanne);
    return { von, text: text.slice(von, bis), stelleImAusschnitt: position - von };
  }

  // In welchem Buch liegt eine Position?
  function buchFuer(buecher, position) {
    for (const b of buecher) {
      if (position >= b.start && position < b.start + b.laenge) {
        return { name: b.name, dt: b.dt, imBuch: position - b.start + 1 };
      }
    }
    return null;
  }

  return {
    ALEFBET, vorbereiten, haeufigkeiten, wortZuIndex,
    suche, erwartung, maxSprungFuer, umgebung, buchFuer,
  };
});
