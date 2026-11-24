// =============================================
// SCHALOM ISRAEL - Geburtstags-Blatt als Bild
//
// Zeichnet das Blatt in ein Canvas. Daraus wird das PDF (ueber pdf.js) und
// bei Bedarf auch ein Bild zum Teilen.
//
// Warum Canvas statt HTML-Druck: Timon wollte einen echten Download statt
// des Druckdialogs. Ueber den Umweg Bild braucht das PDF keine eingebettete
// hebraeische Schrift, weil der Browser den Text schon gesetzt hat.
// =============================================
(function () {
  // A4 bei 150 dpi. Reicht fuer sauberen Druck und bleibt unter 1 MB.
  var BREIT = 1240;
  var HOCH = 1754;

  var FARBE = {
    grund: '#ffffff',
    rahmen: '#c8a962',
    gold: '#c8a962',
    dunkel: '#0d1e35',
    text: '#2a3a4a',
    grau: '#7a8798',
    creme: '#f8f3ea',
  };

  function schrift(groesse, familie, fett) {
    return (fett ? '600 ' : '') + groesse + 'px ' + familie;
  }
  var SERIF = "'Playfair Display', Georgia, serif";
  var SANS = "'Inter', system-ui, sans-serif";

  // Bricht Text auf eine Breite um und gibt die Zeilen zurueck.
  function umbrechen(ctx, text, maxBreite) {
    var woerter = String(text).split(/\s+/);
    var zeilen = [];
    var zeile = '';
    for (var i = 0; i < woerter.length; i++) {
      var probe = zeile ? zeile + ' ' + woerter[i] : woerter[i];
      if (ctx.measureText(probe).width > maxBreite && zeile) {
        zeilen.push(zeile);
        zeile = woerter[i];
      } else {
        zeile = probe;
      }
    }
    if (zeile) zeilen.push(zeile);
    return zeilen;
  }

  // Wandelt den Impuls-HTML in einfache Bloecke um.
  function impulsBloecke(html) {
    if (!html) return [];
    var hilfs = document.createElement('div');
    hilfs.innerHTML = html;
    var aus = [];
    Array.prototype.forEach.call(hilfs.children, function (el) {
      var t = (el.textContent || '').trim();
      if (!t) return;
      aus.push({ art: el.tagName === 'H2' || el.tagName === 'H3' ? 'titel' : 'text', text: t });
    });
    return aus;
  }

  // versatz schiebt den ganzen Inhalt nach unten. Gebraucht wird das nur,
  // wenn kein Impuls da ist: dann steht sonst alles oben und die untere
  // Haelfte bleibt leer. Siehe zeichne().
  function male(daten, versatz) {
    var c = document.createElement('canvas');
    c.width = BREIT;
    c.height = HOCH;
    var ctx = c.getContext('2d');

    ctx.fillStyle = FARBE.grund;
    ctx.fillRect(0, 0, BREIT, HOCH);

    // Rahmen
    var rand = 60;
    ctx.strokeStyle = FARBE.rahmen;
    ctx.lineWidth = 3;
    ctx.strokeRect(rand, rand, BREIT - 2 * rand, HOCH - 2 * rand);

    var mitte = BREIT / 2;
    var y = rand + 80;
    ctx.textAlign = 'center';
    // Folgt ein Impuls, wird die Luft zwischen den Kopf-Blöcken kleiner (nicht
    // die Zeilenabstände innerhalb eines Blocks), damit der ganze Text
    // aufs Blatt passt (die Impulse sind seit 11/2026 ausführlicher).
    var g = impulsBloecke(daten.impulsHtml).length ? 0.45 : 1;

    // Marke. Sie bleibt am oberen Rahmen stehen, der Versatz greift erst
    // darunter.
    ctx.fillStyle = FARBE.gold;
    ctx.font = schrift(30, SERIF);
    ctx.fillText('SCHALOM ISRAEL', mitte, y);
    y += 90 * g + (versatz || 0);

    // Ueberschrift
    ctx.fillStyle = FARBE.grau;
    ctx.font = schrift(22, SANS);
    ctx.fillText('DEIN HEBRÄISCHER GEBURTSTAG', mitte, y);
    y += 90;

    // Hebraeisches Datum
    ctx.fillStyle = FARBE.dunkel;
    ctx.font = schrift(74, SERIF);
    ctx.direction = 'rtl';
    ctx.fillText(daten.datumHebraeisch || '', mitte, y);
    ctx.direction = 'ltr';
    y += 70;

    ctx.font = schrift(46, SERIF);
    ctx.fillText(daten.datumDeutsch || '', mitte, y);
    y += 44;

    ctx.fillStyle = FARBE.grau;
    ctx.font = schrift(26, SANS);
    ctx.fillText(daten.datumGregorianisch || '', mitte, y);
    y += 70 * g;

    // Goldlinie
    ctx.strokeStyle = FARBE.gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mitte - 80, y);
    ctx.lineTo(mitte + 80, y);
    ctx.stroke();
    y += 80 * g;

    // Block: Parascha
    ctx.fillStyle = FARBE.grau;
    ctx.font = schrift(20, SANS);
    ctx.fillText('DIE WOCHENLESUNG DEINER GEBURTSWOCHE', mitte, y);
    y += 48;
    ctx.fillStyle = FARBE.dunkel;
    ctx.font = schrift(40, SERIF);
    ctx.fillText(daten.parascha || '', mitte, y);
    y += 46;
    if (daten.paraschaHebraeisch) {
      ctx.fillStyle = '#8a6d2f';
      ctx.font = schrift(34, SERIF);
      ctx.direction = 'rtl';
      ctx.fillText(daten.paraschaHebraeisch, mitte, y);
      ctx.direction = 'ltr';
      y += 40;
    }
    if (daten.paraschaBedeutung) {
      ctx.fillStyle = FARBE.grau;
      ctx.font = schrift(24, SANS);
      ctx.fillText('„' + daten.paraschaBedeutung + '"', mitte, y);
      y += 30;
    }
    y += 50 * g;

    // Block: Abschnitt
    ctx.fillStyle = FARBE.grau;
    ctx.font = schrift(20, SANS);
    ctx.fillText('DER ABSCHNITT DEINES WOCHENTAGS', mitte, y);
    y += 48;
    ctx.fillStyle = FARBE.dunkel;
    ctx.font = schrift(40, SERIF);
    ctx.fillText(daten.aliyah || '', mitte, y);
    y += 44;
    ctx.fillStyle = FARBE.grau;
    ctx.font = schrift(26, SANS);
    ctx.fillText(daten.stelle || '', mitte, y);
    y += 70 * g;

    // Impuls in einem Cremekasten
    var bloecke = impulsBloecke(daten.impulsHtml);
    if (bloecke.length) {
      var kastenX = rand + 45;
      var kastenBreit = BREIT - 2 * (rand + 45);
      var innen = 45;
      var textBreit = kastenBreit - 2 * innen;

      // Schrift so groß wie möglich, aber der ganze Text muss in den Kasten.
      // Untergrenze 0.78 (Fließtext 19 px bei 150 dpi, gedruckt gut lesbar).
      ctx.textAlign = 'left';
      var platz = HOCH - rand - 150 - y;
      var s, vorbereitet, benoetigt;
      for (s = 1; s >= 0.78; s -= 0.02) {
        vorbereitet = [];
        benoetigt = innen * 2 + 24 * s;
        for (var bi = 0; bi < bloecke.length; bi++) {
          var bl = bloecke[bi];
          ctx.font = bl.art === 'titel' ? schrift(Math.round(30 * s), SERIF) : schrift(Math.round(24 * s), SANS);
          var zeilen = umbrechen(ctx, bl.text, textBreit);
          var zh = (bl.art === 'titel' ? 40 : 36) * s;
          var ab = bi === 0 ? 0 : (bl.art === 'titel' ? 30 : 16) * s;
          benoetigt += ab + zeilen.length * zh;
          vorbereitet.push({ art: bl.art, zeilen: zeilen, zeilenHoehe: zh, abstand: ab });
        }
        if (benoetigt <= platz) break;
      }
      if (s < 0.78) s = 0.78;

      // Der Kasten reicht immer bis zum Fussbereich.
      var hoehe = platz;
      ctx.fillStyle = FARBE.creme;
      ctx.fillRect(kastenX, y, kastenBreit, hoehe);
      ctx.fillStyle = FARBE.gold;
      ctx.fillRect(kastenX, y, 5, hoehe);

      var ty = y + innen + 24 * s;
      var grenze = y + hoehe - 16;
      for (var i = 0; i < vorbereitet.length; i++) {
        var v = vorbereitet[i];
        // Passt ein Absatz nicht mehr ganz, endet das Blatt davor.
        // Nie mitten im Satz abbrechen.
        if (ty + v.abstand + (v.zeilen.length - 1) * v.zeilenHoehe > grenze) break;
        ty += v.abstand;
        ctx.font = v.art === 'titel' ? schrift(Math.round(30 * s), SERIF) : schrift(Math.round(24 * s), SANS);
        ctx.fillStyle = v.art === 'titel' ? FARBE.dunkel : FARBE.text;
        for (var z = 0; z < v.zeilen.length; z++) {
          ctx.fillText(v.zeilen[z], kastenX + innen, ty);
          ty += v.zeilenHoehe;
        }
      }
      // Fuer die Pruefung: mit welcher Groesse gesetzt, alles drauf?
      c.dataset.skala = s.toFixed(2);
      c.dataset.vollstaendig = String(i === vorbereitet.length);
      y += hoehe;
      ctx.textAlign = 'center';
    }

    // Fussbereich
    var fussY = HOCH - rand - 70;
    ctx.strokeStyle = '#d8d2c4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rand + 45, fussY - 30);
    ctx.lineTo(BREIT - rand - 45, fussY - 30);
    ctx.stroke();

    ctx.fillStyle = FARBE.grau;
    ctx.font = schrift(22, SANS);
    ctx.textAlign = 'left';
    if (daten.naechster) ctx.fillText(daten.naechster, rand + 45, fussY);
    ctx.textAlign = 'right';
    ctx.fillText('schalomisrael.de', BREIT - rand - 45, fussY);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#a8b0ba';
    ctx.font = schrift(17, SANS);
    ctx.fillText('Berechnet nach dem jüdischen Kalender. Der Tag beginnt am Abend zuvor.',
      mitte, fussY + 36);

    return { canvas: c, ende: y, unterkante: fussY - 30 };
  }

  function zeichne(daten) {
    // Mit Impuls fuellt der Cremekasten den Raum bis zum Fuss.
    if (impulsBloecke(daten.impulsHtml).length) return male(daten, 0).canvas;

    // Ohne Impuls (etwa wenn die Anfrage ausfaellt) stand bisher alles im
    // oberen Drittel und darunter war eine halbe leere Seite. Deshalb erst
    // messen, dann den Inhalt mittig in die Flaeche setzen. Das Blatt sieht
    // dann nach Urkunde aus statt nach Abbruch.
    var probe = male(daten, 0);
    var frei = probe.unterkante - probe.ende;
    return male(daten, Math.max(0, frei / 2)).canvas;
  }

  // Wartet auf die Schriften, damit nicht mit Ersatzschrift gezeichnet wird.
  function bereit() {
    if (document.fonts && document.fonts.ready) {
      return document.fonts.ready.catch(function () {});
    }
    return Promise.resolve();
  }

  window.BlattCanvas = { zeichne: zeichne, bereit: bereit, BREIT: BREIT, HOCH: HOCH };
})();
