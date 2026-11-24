// =============================================
// SCHALOM ISRAEL - Lebenslinien: Poster (A3 quer)
//
// Zeichnet alle Lebenslinien auf ein Canvas, hell und druckfreundlich.
// Dieselbe Zeichnung dient als kleine Vorschau auf der Seite und, in hoher
// Aufloesung, als PDF ueber /entdecken/pdf.js.
// Das PDF ist frei herunterzuladen. Ein E-Mail-Gate war gebaut und ist auf
// Timons Wunsch (24.11.2026) vorerst entfernt; es steht im Commit 13c3d63.
// =============================================
(function () {
  'use strict';

  var L = window.Lebenslinien;
  var FARBE = {
    papier: '#f8f3ea', navy: '#0d1e35', text: '#2a3a4a', leise: '#6b7889',
    gold: '#b8954a', goldHell: '#d9bb75', linie: 'rgba(13,30,53,0.10)', flut: 'rgba(96,150,210,0.16)',
  };

  function jahreText(p) {
    var g = L.geburtText(p);
    return p.tod == null ? 'ab ' + g : g + '–' + p.tod;
  }

  function zeichne(canvas) {
    var B = canvas.width, H = canvas.height;
    var c = canvas.getContext('2d');
    var u = B / 1000;
    var rand = 42 * u;

    c.fillStyle = FARBE.papier;
    c.fillRect(0, 0, B, H);

    // Kopf
    c.textBaseline = 'alphabetic';
    c.fillStyle = FARBE.navy;
    c.font = '500 ' + 30 * u + 'px "Playfair Display", Georgia, serif';
    c.fillText('Wer kannte wen?', rand, rand + 22 * u);
    c.fillStyle = FARBE.leise;
    c.font = 9.5 * u + 'px Inter, sans-serif';
    c.fillText('Die Lebenslinien von Adam bis Josua. Jahre seit der Erschaffung der Welt, nach der Zählung der Überlieferung.', rand, rand + 38 * u);
    c.textAlign = 'right';
    c.fillStyle = FARBE.gold;
    c.font = 14 * u + 'px "Playfair Display", Georgia, serif';
    c.fillText('Schalom Israel', B - rand, rand + 16 * u);
    c.fillStyle = FARBE.leise;
    c.font = 8.5 * u + 'px Inter, sans-serif';
    c.fillText('schalomisrael.de', B - rand, rand + 29 * u);
    c.textAlign = 'left';

    // Zeichenflaeche
    var von = -30, bis = L.ENDE_ACHSE;
    var oben = rand + 86 * u, unten = H - rand - 36 * u;
    var links = rand, rechts = B - rand;
    var personen = L.PERSONEN;
    var zeile = (unten - oben - 16 * u) / personen.length;
    var balken = Math.max(3, zeile * 0.2);
    function x(j) { return links + (j - von) / (bis - von) * (rechts - links); }
    function by(i) { return oben + i * zeile + zeile - balken - zeile * 0.18; }
    var index = {};
    personen.forEach(function (p, i) { index[p.id] = i; });
    var fussY = oben + personen.length * zeile;

    // Gitter
    c.strokeStyle = FARBE.linie;
    c.lineWidth = Math.max(1, 0.6 * u);
    c.fillStyle = FARBE.leise;
    c.font = 8 * u + 'px Inter, sans-serif';
    c.textAlign = 'center';
    for (var j = 0; j <= 2500; j += 250) {
      c.beginPath(); c.moveTo(x(j), oben - 4 * u); c.lineTo(x(j), fussY); c.stroke();
      c.fillText(j === 0 ? '1' : String(j), x(j), fussY + 12 * u);
    }

    // Flut und Ereignisse. Namen auf bis zu vier Ebenen verteilt, damit
    // eng liegende Ereignisse (Turm, Bund, Bindung) sich nicht ueberdecken.
    var ebenen = [];
    c.font = 7.5 * u + 'px Inter, sans-serif';
    L.EREIGNISSE.forEach(function (e) {
      var xe = x(e.jahr);
      if (e.flut) {
        c.fillStyle = FARBE.flut;
        c.fillRect(xe - 3 * u, oben - 4 * u, 6 * u, fussY - oben + 4 * u);
      } else {
        c.save();
        c.setLineDash([2 * u, 3 * u]);
        c.strokeStyle = 'rgba(184,149,74,0.45)';
        c.beginPath(); c.moveTo(xe, oben - 4 * u); c.lineTo(xe, fussY); c.stroke();
        c.restore();
      }
      var w = c.measureText(e.name).width;
      var lx = Math.min(Math.max(xe - w / 2, links), rechts - w);
      var ebene = 0;
      while (ebene < 3 && ebenen[ebene] != null && ebenen[ebene] > lx - 6 * u) ebene++;
      ebenen[ebene] = lx + w;
      var ly = oben - (7 + ebene * 9) * u;
      c.strokeStyle = e.flut ? 'rgba(60,110,170,0.35)' : 'rgba(184,149,74,0.35)';
      c.beginPath(); c.moveTo(xe, ly + 2 * u); c.lineTo(xe, oben - 4 * u); c.stroke();
      c.fillStyle = e.flut ? 'rgba(60,110,170,0.9)' : FARBE.gold;
      c.textAlign = 'left';
      c.fillText(e.name, lx, ly);
    });

    // Aeste
    c.strokeStyle = 'rgba(184,149,74,0.55)';
    c.fillStyle = 'rgba(184,149,74,0.8)';
    c.lineWidth = Math.max(1, 0.7 * u);
    personen.forEach(function (kind, i) {
      kind.eltern.forEach(function (eid) {
        var ie = index[eid];
        if (ie == null) return;
        var xa = x(kind.geburt);
        c.beginPath(); c.moveTo(xa, by(ie) + balken / 2); c.lineTo(xa, by(i) + balken / 2); c.stroke();
        c.beginPath(); c.arc(xa, by(ie) + balken / 2, 1.6 * u, 0, Math.PI * 2); c.fill();
      });
    });

    // Balken und Namen
    var grad = c.createLinearGradient(links, 0, rechts, 0);
    grad.addColorStop(0, '#a9884a'); grad.addColorStop(0.5, '#cfae66'); grad.addColorStop(1, '#b8954a');
    c.textAlign = 'left';
    personen.forEach(function (p, i) {
      var x1 = x(p.geburt), x2 = x(L.ende(p)), y = by(i);
      c.fillStyle = grad;
      rundRechteck(c, x1, y, Math.max(2, x2 - x1), balken, balken / 2);
      if (p.tod == null) {
        var g2 = c.createLinearGradient(x2, 0, x(p.mindestens + 60), 0);
        g2.addColorStop(0, '#b8954a'); g2.addColorStop(1, 'rgba(184,149,74,0)');
        c.fillStyle = g2;
        c.fillRect(x2 - 1, y, x(p.mindestens + 60) - x2, balken);
      }
      // Beschriftung: Name, hebraeisch, vertraut, Jahre
      var ty = y - zeile * 0.12;
      var teile = [
        { t: p.name, f: '500 ' + 10.5 * u + 'px "Playfair Display", Georgia, serif', farbe: FARBE.navy, abstand: 4 * u },
        { t: p.hebr, f: 10 * u + 'px "Frank Ruhl Libre", serif', farbe: FARBE.gold, abstand: 5 * u, rtl: true },
      ];
      if (p.vertraut) teile.push({ t: p.vertraut, f: 7.5 * u + 'px Inter, sans-serif', farbe: FARBE.leise, abstand: 5 * u });
      teile.push({ t: jahreText(p), f: 7.5 * u + 'px Inter, sans-serif', farbe: FARBE.gold, abstand: 0 });
      var gesamt = 0;
      teile.forEach(function (s) { c.font = s.f; s.w = c.measureText(s.t).width; gesamt += s.w + s.abstand; });
      // Passt die Zeile nicht mehr rechts neben den Balkenanfang, steht sie
      // links davor, auf Hoehe des Balkens. Dort ist auf dem Blatt Platz.
      var lx = x1;
      if (lx + gesamt > rechts) {
        lx = Math.max(links, x1 - gesamt - 4 * u);
        ty = y + balken / 2 + 3.2 * u;
      }
      teile.forEach(function (s) {
        c.font = s.f; c.fillStyle = s.farbe;
        c.direction = s.rtl ? 'rtl' : 'ltr';
        c.textAlign = s.rtl ? 'right' : 'left';
        c.fillText(s.t, s.rtl ? lx + s.w : lx, ty);
        c.direction = 'ltr'; c.textAlign = 'left';
        lx += s.w + s.abstand;
      });
    });

    // Das Jahr 1948 als Hinweis: Faden ueber die zehn Generationen, der
    // Text sitzt in der freien Flaeche links unten und zeigt auf Abraham.
    var x48 = x(1948);
    c.strokeStyle = FARBE.navy;
    c.lineWidth = Math.max(1, 0.9 * u);
    c.beginPath(); c.moveTo(x48, by(index.noach) - zeile * 0.5); c.lineTo(x48, by(index.abraham) + balken); c.stroke();
    var tx = x(1450), ty0 = by(index.abraham) + balken / 2;
    c.lineWidth = Math.max(1, 0.6 * u);
    c.beginPath(); c.moveTo(tx + 4 * u, ty0); c.lineTo(x48 - 3 * u, ty0); c.stroke();
    c.fillStyle = FARBE.navy;
    c.font = 'italic ' + 9 * u + 'px "EB Garamond", Georgia, serif';
    c.textAlign = 'right';
    c.fillText('Im Jahr 1948 wird Abraham geboren.', tx, ty0 - 2 * u);
    c.fillText('Alle zehn Generationen seiner Vorfahren bis Noach leben noch.', tx, ty0 + 9 * u);
    c.textAlign = 'left';

    // Fuss
    var fy = H - rand + 6 * u;
    c.strokeStyle = 'rgba(184,149,74,0.5)';
    c.beginPath(); c.moveTo(rand, fy - 16 * u); c.lineTo(B - rand, fy - 16 * u); c.stroke();
    c.fillStyle = FARBE.text;
    c.font = 8.5 * u + 'px Inter, sans-serif';
    c.fillText('Sieben Hände umspannen die Welt: Adam, Metuschelach, Schem, Jakob, Amram, Achija aus Schilo, Elija (Bava Batra 121b)', rand, fy);
    c.textAlign = 'right';
    c.fillStyle = FARBE.gold;
    c.font = 'italic ' + 9.5 * u + 'px "EB Garamond", Georgia, serif';
    c.fillText('Wie die Linie weitergeht: „Durch Feuer und Wasser“, Jonathan Friedmann', B - rand, fy);
    c.textAlign = 'left';
  }

  function rundRechteck(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
    c.fill();
  }

  function schriftenLaden() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load('500 20px "Playfair Display"'),
      document.fonts.load('20px "Frank Ruhl Libre"', 'אבג'),
      document.fonts.load('20px Inter'),
      document.fonts.load('italic 20px "EB Garamond"'),
    ]).catch(function () {});
  }

  function verdrahte(schriften) {
    var vorschau = document.getElementById('poster-vorschau');
    var knopf = document.getElementById('poster-knopf');
    if (!vorschau || !knopf) return;

    Promise.all([schriften, schriftenLaden()]).then(function () {
      // Vorschau scharf auf hochaufloesenden Bildschirmen
      var f = Math.min(2, window.devicePixelRatio || 1);
      vorschau.width = 840 * f;
      vorschau.height = 594 * f;
      zeichne(vorschau);
    });

    knopf.addEventListener('click', function () {
      knopf.disabled = true;
      var alt = knopf.textContent;
      knopf.textContent = 'Wird erstellt …';
      schriftenLaden().then(function () {
        var gross = document.createElement('canvas');
        gross.width = 4200;
        gross.height = 2970;
        zeichne(gross);
        window.MiniPDF.ausCanvas(gross, 'Lebenslinien-Adam-bis-Josua', 'Wer kannte wen? Die Lebenslinien von Adam bis Josua', window.MiniPDF.A3_QUER);
        knopf.textContent = alt;
        knopf.disabled = false;
      });
    });
  }

  window.LLPoster = { zeichne: zeichne, verdrahte: verdrahte };
})();
