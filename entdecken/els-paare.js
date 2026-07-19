// =============================================
// SCHALOM ISRAEL - ELS-Paarsuche
//
// Ein einzelnes Wort im Text zu finden ist belanglos: bei 300.000 Buchstaben
// und freier Schrittweite findet man fast jedes kurze Wort. Interessant wird
// es erst, wenn ZWEI zusammengehoerige Woerter dicht beieinander stehen.
// Genau so hat auch die urspruengliche Untersuchung gearbeitet.
//
// Naehe-Mass: die Spanne. Das ist der Abstand vom ersten bis zum letzten
// Buchstaben beider Woerter zusammen. Klein heisst: beide stehen eng
// beieinander. Das laesst sich einem Leser in einem Satz erklaeren, anders
// als die ueblichen Matrix-Masse.
//
// Ehrliche Einordnung gehoert dazu: auch enge Paare sind zu erwarten.
// erwarteteEngePaare() rechnet aus, wie viele.
//
// UMD, damit ohne Browser testbar.
// =============================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ELSPaare = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  // Ausdehnung eines Fundes: von wo bis wo reichen seine Buchstaben?
  function ausdehnung(t, laenge) {
    const a = t.position;
    const b = t.position + t.richtung * t.sprung * (laenge - 1);
    return { min: Math.min(a, b), max: Math.max(a, b) };
  }

  // Reichert Funde um ihre Ausdehnung an und sortiert nach Startposition.
  function aufbereiten(treffer, laenge) {
    return treffer
      .map((t) => {
        const a = ausdehnung(t, laenge);
        return { ...t, min: a.min, max: a.max, mitte: (a.min + a.max) / 2 };
      })
      .sort((x, y) => x.min - y.min);
  }

  // Erste Position im sortierten Feld, deren min >= grenze ist.
  function untereGrenze(feld, grenze) {
    let lo = 0, hi = feld.length;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (feld[m].min < grenze) lo = m + 1;
      else hi = m;
    }
    return lo;
  }

  // Sucht Paare, deren gemeinsame Spanne hoechstens maxSpanne betraegt.
  //
  // trefferA/trefferB sind die Rohfunde aus ELS.suche, laengeA/laengeB die
  // Wortlaengen. Rueckgabe ist nach Spanne sortiert, das engste Paar zuerst.
  function paare(trefferA, laengeA, trefferB, laengeB, opts) {
    opts = opts || {};
    const maxSpanne = opts.maxSpanne || 1000;
    const maxPaare = opts.maxPaare || 50;

    const A = aufbereiten(trefferA, laengeA);
    const B = aufbereiten(trefferB, laengeB);

    const gefunden = [];
    let anzahl = 0;

    for (const a of A) {
      // Alle B, die nah genug liegen koennen
      const von = untereGrenze(B, a.min - maxSpanne);
      for (let i = von; i < B.length; i++) {
        const b = B[i];
        if (b.min > a.max + maxSpanne) break;

        const min = Math.min(a.min, b.min);
        const max = Math.max(a.max, b.max);
        const spanne = max - min + 1;
        if (spanne > maxSpanne) continue;

        anzahl++;
        if (gefunden.length < maxPaare * 4) {
          gefunden.push({ a, b, spanne, min, max });
        }
      }
    }

    gefunden.sort((x, y) => x.spanne - y.spanne);
    return { paare: gefunden.slice(0, maxPaare), anzahl, maxSpanne };
  }

  // Mittlere Ausdehnung einer Fundmenge. Nur zur Anzeige, NICHT fuer die
  // Erwartungsrechnung: dort waere der Mittelwert irrefuehrend.
  function mittlereAusdehnung(treffer, laenge) {
    if (!treffer.length) return 0;
    let summe = 0;
    for (const t of treffer) summe += t.sprung * (laenge - 1) + 1;
    return summe / treffer.length;
  }

  function ausdehnungen(treffer, laenge) {
    const a = new Float64Array(treffer.length);
    for (let i = 0; i < treffer.length; i++) a[i] = treffer[i].sprung * (laenge - 1) + 1;
    return a;
  }

  // Wie viele enge Paare waeren rein zufaellig zu erwarten?
  //
  // Ein Fund ist kein Punkt, sondern erstreckt sich ueber viele Buchstaben:
  // vier Buchstaben mit Schrittweite 200 belegen 601 Positionen. Zwei solche
  // Funde passen niemals in eine Spanne von 300, egal wo sie liegen.
  //
  // Legt man Fund A fest und verschiebt Fund B zufaellig, passen beide genau
  // dann in die Spanne S, wenn B in einem Fenster der Breite
  // (2S - Ausdehnung von A - Ausdehnung von B) liegt. Ist der Ausdruck
  // negativ, ist gar kein Paar moeglich.
  //
  // Ueber alle Paare summieren, NICHT mit Mittelwerten rechnen: wegen des
  // Abschneidens bei null ist der Zusammenhang nicht linear. Die tatsaechlich
  // gefundenen Paare stammen fast immer aus den Funden mit kleiner
  // Schrittweite, deren Ausdehnung weit unter dem Mittel liegt. Zwei fruehere
  // Fassungen dieser Funktion lagen genau daran daneben, einmal nach oben
  // (ohne Abzug) und einmal nach unten (mit Mittelwerten).
  //
  // Damit das schnell bleibt: B-Ausdehnungen sortieren und Praefixsummen
  // bilden, dann je A einmal binaer suchen.
  function erwarteteEngePaare(trefferA, laengeA, trefferB, laengeB, spanne, N) {
    const nA = trefferA.length, nB = trefferB.length;
    if (!nA || !nB || N <= 0) return 0;

    const eA = ausdehnungen(trefferA, laengeA);
    const eB = ausdehnungen(trefferB, laengeB);
    eB.sort();

    // praefix[i] = Summe der ersten i Ausdehnungen von B
    const praefix = new Float64Array(nB + 1);
    for (let i = 0; i < nB; i++) praefix[i + 1] = praefix[i] + eB[i];

    let summe = 0;
    for (let i = 0; i < nA; i++) {
      const schwelle = 2 * spanne - eA[i];
      if (schwelle <= 0) continue;
      // Anzahl der B mit Ausdehnung < schwelle
      let lo = 0, hi = nB;
      while (lo < hi) {
        const m = (lo + hi) >> 1;
        if (eB[m] < schwelle) lo = m + 1;
        else hi = m;
      }
      summe += lo * schwelle - praefix[lo];
    }
    return summe / N;
  }

  // Ordnet eine Position ihrer Bibelstelle zu.
  // versStarts ist aufsteigend, deshalb binaere Suche.
  function versFuer(versStarts, position) {
    let lo = 0, hi = versStarts.length - 1, treffer = 0;
    while (lo <= hi) {
      const m = (lo + hi) >> 1;
      if (versStarts[m] <= position) { treffer = m; lo = m + 1; }
      else hi = m - 1;
    }
    return treffer;
  }

  // Rechnet den laufenden Vers-Index in Buch, Kapitel und Vers um.
  // struktur[buch][kapitel] = Anzahl Verse in diesem Kapitel.
  function stelleFuer(struktur, buecher, versIndex) {
    let rest = versIndex;
    for (let b = 0; b < struktur.length; b++) {
      for (let k = 0; k < struktur[b].length; k++) {
        const n = struktur[b][k];
        if (rest < n) {
          return {
            buch: buecher[b].name,
            dt: buecher[b].dt,
            kapitel: k + 1,
            vers: rest + 1,
          };
        }
        rest -= n;
      }
    }
    return null;
  }

  // Von welcher bis zu welcher Stelle reicht ein Bereich?
  function stellenBereich(struktur, buecher, versStarts, von, bis) {
    const a = stelleFuer(struktur, buecher, versFuer(versStarts, von));
    const b = stelleFuer(struktur, buecher, versFuer(versStarts, bis));
    if (!a || !b) return null;
    return { von: a, bis: b, gleich: a.buch === b.buch && a.kapitel === b.kapitel && a.vers === b.vers };
  }

  function stelleText(s) {
    if (!s) return '';
    return `${s.buch} ${s.kapitel},${s.vers}`;
  }

  function bereichText(bereich) {
    if (!bereich) return '';
    if (bereich.gleich) return stelleText(bereich.von);
    if (bereich.von.buch === bereich.bis.buch) {
      if (bereich.von.kapitel === bereich.bis.kapitel) {
        return `${bereich.von.buch} ${bereich.von.kapitel},${bereich.von.vers}–${bereich.bis.vers}`;
      }
      return `${bereich.von.buch} ${bereich.von.kapitel},${bereich.von.vers} bis ${bereich.bis.kapitel},${bereich.bis.vers}`;
    }
    return `${stelleText(bereich.von)} bis ${stelleText(bereich.bis)}`;
  }

  return {
    ausdehnung, aufbereiten, paare, erwarteteEngePaare,
    mittlereAusdehnung, ausdehnungen,
    versFuer, stelleFuer, stellenBereich, stelleText, bereichText,
  };
});
