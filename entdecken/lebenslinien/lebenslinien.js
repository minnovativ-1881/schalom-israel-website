// =============================================
// SCHALOM ISRAEL - Lebenslinien: Zeichnung und Bedienung
//
// Jede Person ist eine Zeile mit einem waagerechten Balken von der Geburt
// bis zum Tod. Der Jahresfaden zeigt, wer in einem Jahr lebte und wie alt.
// Die Zeichnung wird bei jeder Aenderung komplett neu als SVG geschrieben;
// bei gut 30 Zeilen ist das schneller als jedes Abgleichen.
// =============================================
(function () {
  'use strict';

  var L = window.Lebenslinien;
  var NS = 'http://www.w3.org/2000/svg';
  var BUCHNAME = { bereschit: 'Bereschit', schemot: 'Schemot', wajikra: 'Wajikra', bamidbar: 'Bamidbar', devarim: 'Devarim' };
  var HEBR_KETTE = { adam: 'אדם', metuschelach: 'מתושלח', schem: 'שם', jakob: 'יעקב', amram: 'עמרם', achija: 'אחיה', elija: 'אליה' };
  var ruhig = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var zustand = {
    jahr: 1948,
    von: -30,
    bis: L.ENDE_ACHSE,
    hervor: null,       // Set von ids, die leuchten sollen
  };

  var el = {
    svg: document.getElementById('ll-svg'),
    zeichnung: document.getElementById('zeichnung'),
    jahr: document.getElementById('anzeige-jahr'),
    satz: document.getElementById('anzeige-satz'),
    regler: document.getElementById('jahr-regler'),
    marken: document.getElementById('sprungmarken'),
    abschnitte: document.querySelectorAll('.ll-abschnitte button'),
    lebendeTitel: document.getElementById('lebende-titel'),
    lebendeListe: document.getElementById('lebende-liste'),
    dialog: document.getElementById('person-dialog'),
    dialogInhalt: document.getElementById('person-inhalt'),
  };

  function track(name) {
    try { if (window.umami) window.umami.track(name); } catch (e) { /* egal */ }
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function jahreText(p) {
    var g = L.geburtText(p);
    if (p.tod == null) return 'ab ' + g;
    return g + '–' + p.tod;
  }

  function anzeigeJahr(j) { return j < 1 ? 1 : j; }

  // ---------- Textbreiten (fuer die Lage der Beschriftung) ----------
  var messer = document.createElement('canvas').getContext('2d');
  function breite(text, schrift) {
    messer.font = schrift;
    return messer.measureText(text).width;
  }

  // ---------- Masse ----------
  function masse() {
    var W = Math.max(300, el.zeichnung.clientWidth);
    var schmal = W < 560;
    return {
      W: W,
      schmal: schmal,
      links: 6,
      rechts: 6,
      oben: schmal ? 22 : 26,
      unten: 24,
      zeile: schmal ? 31 : 34,
      balken: schmal ? 6 : 7,
      fName: schmal ? 12.5 : 13.5,
      fKlein: schmal ? 9.5 : 10.5,
    };
  }

  function sichtbarePersonen() {
    return L.PERSONEN.filter(function (p) {
      var e = p.tod != null ? p.tod : p.mindestens + 60;
      return p.geburt <= zustand.bis && e >= zustand.von;
    });
  }

  // ---------- Zeichnen ----------
  function zeichne() {
    var m = masse();
    var personen = sichtbarePersonen();
    var H = m.oben + personen.length * m.zeile + m.unten;
    var innen = m.W - m.links - m.rechts;
    var spanne = zustand.bis - zustand.von;
    function x(j) { return m.links + (j - zustand.von) / spanne * innen; }
    var zeileY = {};
    personen.forEach(function (p, i) { zeileY[p.id] = m.oben + i * m.zeile; });
    function balkenY(p) { return zeileY[p.id] + m.zeile - m.balken - 7; }

    var s = [];
    s.push('<title id="ll-svg-titel">Lebenslinien von Adam bis Josua</title>');
    s.push('<defs>'
      + '<linearGradient id="ll-gold" x1="0" x2="1"><stop offset="0" stop-color="#a9884a"/><stop offset="0.5" stop-color="#dfc07a"/><stop offset="1" stop-color="#c8a962"/></linearGradient>'
      + '<linearGradient id="ll-gold-offen" x1="0" x2="1"><stop offset="0" stop-color="#c8a962"/><stop offset="1" stop-color="#c8a962" stop-opacity="0"/></linearGradient>'
      + '<filter id="ll-leuchten" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
      + '<clipPath id="ll-schnitt"><rect x="' + m.links + '" y="0" width="' + innen + '" height="' + H + '"/></clipPath>'
      + '</defs>');

    // Achse: Gitter und Jahreszahlen
    var schritte = [50, 100, 250, 500, 1000];
    var schritt = schritte[schritte.length - 1];
    for (var i = 0; i < schritte.length; i++) {
      if (innen / (spanne / schritte[i]) >= (m.schmal ? 52 : 70)) { schritt = schritte[i]; break; }
    }
    s.push('<g class="ll-achse">');
    for (var j = Math.ceil(zustand.von / schritt) * schritt; j <= zustand.bis; j += schritt) {
      if (j < 0) continue;
      var xj = x(j);
      s.push('<line x1="' + xj + '" x2="' + xj + '" y1="' + (m.oben - 4) + '" y2="' + (H - m.unten + 2) + '"/>');
      s.push('<text x="' + xj + '" y="' + (H - 7) + '" font-size="' + m.fKlein + '" text-anchor="middle">' + (j === 0 ? '1' : j) + '</text>');
    }
    s.push('</g>');

    // Ereignisse
    s.push('<g clip-path="url(#ll-schnitt)">');
    var letzteKante = -Infinity;
    L.EREIGNISSE.forEach(function (e) {
      if (e.jahr < zustand.von || e.jahr > zustand.bis) return;
      var xe = x(e.jahr);
      if (e.flut) {
        var b = Math.max(6, x(e.bis) - xe);
        s.push('<rect class="ll-flut" x="' + (xe - b / 2) + '" y="' + (m.oben - 4) + '" width="' + b + '" height="' + (H - m.unten - m.oben + 6) + '"/>');
      } else {
        s.push('<line class="ll-ereignis" x1="' + xe + '" x2="' + xe + '" y1="' + (m.oben - 4) + '" y2="' + (H - m.unten + 2) + '"/>');
      }
      var w = breite(e.name, m.fKlein + 'px Inter');
      var links = Math.min(Math.max(xe - w / 2, m.links), m.W - m.rechts - w);
      if (links > letzteKante + 8) {
        s.push('<text class="' + (e.flut ? 'll-flut-text' : 'll-ereignis-text') + '" font-size="' + m.fKlein + '" x="' + links + '" y="' + (m.oben - 9) + '">' + esc(e.name) + '</text>');
        letzteKante = links + w;
      }
    });
    s.push('</g>');

    // Aeste des Stammbaums: von den Eltern zum Kind, im Geburtsjahr
    s.push('<g class="ll-aeste" clip-path="url(#ll-schnitt)">');
    personen.forEach(function (kind) {
      kind.eltern.forEach(function (eid) {
        if (zeileY[eid] == null) return;
        var el2 = L.finde(eid);
        var xa = x(kind.geburt);
        var y1 = balkenY(el2) + m.balken / 2;
        var y2 = balkenY(kind) + m.balken / 2;
        s.push('<path class="ll-ast" d="M' + xa + ' ' + y1 + ' V' + y2 + '"/>');
        s.push('<circle class="ll-ast-punkt" cx="' + xa + '" cy="' + y1 + '" r="2.2"/>');
      });
    });
    s.push('</g>');

    // Der Faden liegt unter den Zeilen, damit die Namen lesbar bleiben
    var jahr = zustand.jahr;
    if (jahr >= zustand.von && jahr <= zustand.bis) {
      s.push('<g class="ll-faden" pointer-events="none"><line x1="' + x(jahr) + '" x2="' + x(jahr) + '" y1="' + (m.oben - 2) + '" y2="' + (H - m.unten + 2) + '"/></g>');
    }

    // Zeilen
    personen.forEach(function (p) {
      var y0 = zeileY[p.id];
      var by = balkenY(p);
      var lebt = L.lebtIm(p, jahr);
      var klassen = 'll-zeile';
      if (zustand.hervor) {
        klassen += zustand.hervor.has(p.id) ? ' ist-hervor' : ' ist-gedimmt';
      } else if (!lebt) {
        klassen += ' ist-tot';
      }
      var x1 = x(p.geburt);
      var endeSicher = L.ende(p);
      var x2 = x(endeSicher);

      var label = (p.anzeigeUm ? '' : '') + p.name;
      var wName = breite(p.name, m.fName + 'px "Playfair Display"');
      var wVertraut = p.vertraut ? breite(p.vertraut, m.fKlein + 'px Inter') + 6 : 0;
      var jt = jahreText(p);
      var wJahre = breite(jt, m.fKlein + 'px Inter') + 8;
      var wGesamt = wName + wVertraut + wJahre;
      var lx = Math.max(x1, m.links);
      var anker = 'start';
      if (lx + wGesamt > m.W - m.rechts) {
        lx = Math.min(Math.max(x2, m.links + wGesamt), m.W - m.rechts);
        anker = 'end';
      }

      s.push('<g class="' + klassen + '" data-id="' + p.id + '" tabindex="0" role="button" aria-label="' + esc(p.name + (p.vertraut ? ' (' + p.vertraut + ')' : '') + ', ' + jt) + '">');
      s.push('<rect class="ll-trefferflaeche" x="' + Math.min(lx - (anker === 'end' ? wGesamt : 0), x1) + '" y="' + (y0 + 2) + '" width="' + Math.max(wGesamt, x2 - x1) + '" height="' + (m.zeile - 4) + '" rx="3"/>');
      s.push('<text x="' + lx + '" y="' + (by - 5) + '" text-anchor="' + anker + '">'
        + '<tspan class="ll-name" font-size="' + m.fName + '">' + esc(p.name) + '</tspan>'
        + (p.vertraut ? '<tspan class="ll-vertraut" font-size="' + m.fKlein + '" dx="6">' + esc(p.vertraut) + '</tspan>' : '')
        + '<tspan class="ll-jahre" font-size="' + m.fKlein + '" dx="8">' + esc(jt) + '</tspan>'
        + '</text>');
      s.push('<g clip-path="url(#ll-schnitt)">');
      s.push('<rect class="ll-balken" x="' + x1 + '" y="' + by + '" width="' + Math.max(2, x2 - x1) + '" height="' + m.balken + '" rx="' + m.balken / 2 + '"/>');
      if (p.tod == null) {
        var x3 = x(p.mindestens + 60);
        s.push('<rect class="ll-balken-offen" x="' + (x2 - 1) + '" y="' + by + '" width="' + Math.max(2, x3 - x2) + '" height="' + m.balken + '"/>');
      }
      s.push('</g>');
      s.push('</g>');
    });

    // Faden und Alterszeichen
    if (jahr >= zustand.von && jahr <= zustand.bis) {
      var xf = x(jahr);
      s.push('<g class="ll-alter" pointer-events="none">');
      personen.forEach(function (p) {
        var a = L.alterIm(p, jahr);
        if (a == null) return;
        var txt = String(a);
        var w = breite(txt, '600 ' + m.fKlein + 'px Inter') + 8;
        var by = balkenY(p);
        var h = m.fKlein + 5;
        var xr = Math.min(Math.max(xf - w / 2, m.links), m.W - m.rechts - w);
        s.push('<rect x="' + xr + '" y="' + (by + m.balken / 2 - h / 2) + '" width="' + w + '" height="' + h + '" rx="' + h / 2 + '"/>');
        s.push('<text x="' + (xr + w / 2) + '" y="' + (by + m.balken / 2 + m.fKlein * 0.36) + '" font-size="' + m.fKlein + '" text-anchor="middle">' + txt + '</text>');
      });
      s.push('</g>');
      s.push('<g class="ll-faden" pointer-events="none"><circle class="ll-faden-griff" cx="' + xf + '" cy="' + (m.oben - 3) + '" r="6"/></g>');
    }

    el.svg.setAttribute('viewBox', '0 0 ' + m.W + ' ' + H);
    el.svg.setAttribute('height', H);
    el.svg.innerHTML = s.join('');
  }

  // ---------- Anzeige ueber und unter der Zeichnung ----------
  function satzFuer(jahr) {
    for (var i = 0; i < L.SPRUNGMARKEN.length; i++) {
      if (L.SPRUNGMARKEN[i].jahr === jahr) return esc(L.SPRUNGMARKEN[i].satz);
    }
    var teile = [];
    L.EREIGNISSE.forEach(function (e) { if (e.jahr === jahr) teile.push('<b>' + esc(e.name) + '.</b>'); });
    L.PERSONEN.forEach(function (p) {
      if (p.geburt === jahr && p.id !== 'adam') teile.push('<b>' + esc(p.name) + '</b> wird geboren.');
      if (p.id === 'adam' && jahr <= 1) teile.push('<b>Adam</b> wird erschaffen.');
      if (p.tod === jahr) teile.push('<b>' + esc(p.name) + '</b> stirbt mit ' + L.lebensjahre(p) + ' Jahren.');
    });
    if (teile.length) return teile.join(' ');
    var n = L.lebendeIm(jahr).length;
    return n === 1 ? 'Nur ein Mensch dieser Reihe lebt.' : n + ' Menschen dieser Reihe leben gleichzeitig.';
  }

  function aktualisiereAnzeige() {
    var jahr = zustand.jahr;
    el.jahr.textContent = anzeigeJahr(jahr);
    el.satz.innerHTML = satzFuer(jahr);
    el.regler.value = jahr;
    var lebende = L.lebendeIm(jahr);
    el.lebendeTitel.textContent = lebende.length
      ? 'Im Jahr ' + anzeigeJahr(jahr) + (lebende.length === 1 ? ' lebt ein Mensch' : ' leben ' + lebende.length + ' Menschen') + ' dieser Reihe:'
      : 'In diesem Jahr lebt keiner aus dieser Reihe.';
    el.lebendeListe.innerHTML = lebende.map(function (p) {
      return '<li><button type="button" data-person="' + p.id + '">' + esc(p.name) + '</button><span>' + L.alterIm(p, jahr) + '</span></li>';
    }).join('');
    var knoepfe = el.marken.querySelectorAll('button');
    for (var i = 0; i < knoepfe.length; i++) {
      knoepfe[i].classList.toggle('ist-aktiv', Number(knoepfe[i].dataset.jahr) === jahr);
    }
  }

  var geplant = false;
  function neu() {
    if (geplant) return;
    geplant = true;
    requestAnimationFrame(function () {
      geplant = false;
      zeichne();
      aktualisiereAnzeige();
    });
  }

  function setzeJahr(j) {
    j = Math.round(Math.max(1, Math.min(L.ENDE_ACHSE - 4, j)));
    if (j === zustand.jahr) return;
    zustand.jahr = j;
    neu();
  }

  // ---------- Bewegung ----------
  var laufend = null;
  function gleite(ziel, dauer, fertig) {
    if (laufend) cancelAnimationFrame(laufend);
    var start = {};
    for (var k in ziel) start[k] = zustand[k];
    if (ruhig) dauer = 0;
    var t0 = performance.now();
    function schritt(t) {
      var f = dauer ? Math.min(1, (t - t0) / dauer) : 1;
      var e = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
      for (var k in ziel) zustand[k] = start[k] + (ziel[k] - start[k]) * e;
      zustand.jahr = Math.round(zustand.jahr);
      zeichne();
      aktualisiereAnzeige();
      if (f < 1) laufend = requestAnimationFrame(schritt);
      else { laufend = null; if (fertig) fertig(); }
    }
    laufend = requestAnimationFrame(schritt);
  }

  // ---------- Faden ziehen und Zeilen antippen ----------
  function jahrAusX(clientX) {
    var r = el.svg.getBoundingClientRect();
    var m = masse();
    var innen = m.W - m.links - m.rechts;
    var px = (clientX - r.left) * (m.W / r.width);
    return zustand.von + (px - m.links) / innen * (zustand.bis - zustand.von);
  }

  var druck = null;
  el.zeichnung.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    druck = { x: e.clientX, y: e.clientY, zieht: false, zeile: e.target.closest('.ll-zeile') };
  });
  el.zeichnung.addEventListener('pointermove', function (e) {
    if (!druck) return;
    if (!druck.zieht) {
      var dx = Math.abs(e.clientX - druck.x), dy = Math.abs(e.clientY - druck.y);
      if (dy > dx && dy > 6) { druck = null; return; }  // senkrecht: Seite scrollt
      if (dx < 5) return;
      druck.zieht = true;
      try { el.zeichnung.setPointerCapture(e.pointerId); } catch (x) { /* egal */ }
      if (laufend) { cancelAnimationFrame(laufend); laufend = null; }
      track('lebenslinien-faden');
    }
    setzeJahr(jahrAusX(e.clientX));
  });
  el.zeichnung.addEventListener('pointerup', function (e) {
    if (!druck) return;
    var d = druck;
    druck = null;
    if (d.zieht) return;
    if (d.zeile) { oeffnePerson(d.zeile.dataset.id); return; }
    gleite({ jahr: Math.max(1, Math.min(L.ENDE_ACHSE - 4, Math.round(jahrAusX(e.clientX)))) }, 350);
  });
  el.zeichnung.addEventListener('pointercancel', function () { druck = null; });
  el.zeichnung.addEventListener('keydown', function (e) {
    var z = e.target.closest && e.target.closest('.ll-zeile');
    if (z && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); oeffnePerson(z.dataset.id); }
  });

  el.regler.addEventListener('input', function () {
    if (laufend) { cancelAnimationFrame(laufend); laufend = null; }
    setzeJahr(Number(el.regler.value));
  });

  // Sprungmarken
  el.marken.innerHTML = L.SPRUNGMARKEN.map(function (s) {
    return '<button type="button" data-jahr="' + s.jahr + '">' + esc(s.titel) + '<span>' + s.jahr + '</span></button>';
  }).join('');
  el.marken.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    var j = Number(b.dataset.jahr);
    zustand.hervor = null;
    var ziel = { jahr: j };
    if (j < zustand.von || j > zustand.bis) { ziel.von = -30; ziel.bis = L.ENDE_ACHSE; setzeAbschnittKnopf(0); }
    gleite(ziel, 800);
    track('lebenslinien-marke');
  });

  // Abschnitte
  function setzeAbschnittKnopf(index) {
    for (var i = 0; i < el.abschnitte.length; i++) el.abschnitte[i].classList.toggle('ist-aktiv', i === index);
  }
  Array.prototype.forEach.call(el.abschnitte, function (b, i) {
    b.addEventListener('click', function () {
      var von = Number(b.dataset.von), bis = Number(b.dataset.bis);
      setzeAbschnittKnopf(i);
      zustand.hervor = null;
      var ziel = { von: von, bis: bis };
      if (zustand.jahr < von + 10 || zustand.jahr > bis - 10) ziel.jahr = Math.round((Math.max(1, von) + bis) / 2);
      gleite(ziel, 650);
      track('lebenslinien-abschnitt');
    });
  });

  // Liste der Lebenden
  el.lebendeListe.addEventListener('click', function (e) {
    var b = e.target.closest('[data-person]');
    if (b) oeffnePerson(b.dataset.person);
  });

  // ---------- Personentafel ----------
  function personKnopf(p) {
    return '<button type="button" class="ll-p-person" data-person="' + p.id + '">' + esc(p.name) + '</button>';
  }

  function oeffnePerson(id) {
    var p = L.finde(id);
    if (!p) return;
    var h = [];
    h.push('<div class="ll-p-kopf"><div class="ll-p-hebr" lang="he">' + esc(p.hebr) + '</div><div>'
      + '<h2 class="ll-p-name" id="person-name">' + esc(p.name) + '</h2>'
      + (p.vertraut ? '<span class="ll-p-vertraut">' + esc(p.vertraut) + '</span>' : '')
      + '</div></div>');
    var alter = L.lebensjahre(p);
    h.push('<div class="ll-p-zahlen">'
      + '<div class="ll-p-zahl"><b>' + esc(L.geburtText(p)) + '</b><span>geboren</span></div>'
      + '<div class="ll-p-zahl"><b>' + (p.tod != null ? p.tod : '?') + '</b><span>gestorben</span></div>'
      + '<div class="ll-p-zahl"><b>' + (alter != null ? alter : '?') + '</b><span>Jahre alt</span></div>'
      + '</div>');
    if (p.notiz) h.push('<p class="ll-p-notiz">' + esc(p.notiz) + '</p>');
    if (p.sicher === 'ueberliefert') h.push('<p class="ll-p-sicher">Die Jahre folgen der Überlieferung, nicht allein dem Text der Tora.</p>');
    if (p.sicher === 'ungefaehr') h.push('<p class="ll-p-sicher">Das Geburtsjahr ist nur ungefähr überliefert.</p>');

    var eltern = p.eltern.map(L.finde).filter(Boolean);
    var kinder = L.kinder(p);
    if (eltern.length || kinder.length || p.weitereEltern) {
      h.push('<div class="ll-p-abschnitt"><h3>Familie</h3><p>');
      var namen = (p.weitereEltern || []).map(esc).concat(eltern.map(personKnopf));
      if (namen.length) h.push((p.frau ? 'Tochter von ' : 'Sohn von ') + namen.join(' und ') + '. ');
      if (kinder.length) h.push((kinder.length > 1 ? 'Kinder' : (kinder[0].frau ? 'Tochter' : 'Sohn')) + ' in dieser Reihe: ' + kinder.map(personKnopf).join(', ') + '.');
      h.push('</p></div>');
    }

    var zg = L.zeitgenossen(p);
    if (zg.length) {
      h.push('<div class="ll-p-abschnitt"><h3>Hat gleichzeitig gelebt mit</h3><p>'
        + zg.map(function (z) {
            var t = z.offen ? (z.jahre ? 'mind. ' + z.jahre + ' J.' : 'bei der Geburt') : z.jahre + ' J.';
            return personKnopf(z.person) + ' <span class="ll-p-vertraut">' + t + '</span>';
          }).join(', ')
        + '</p></div>');
    }

    var st = p.stelle;
    h.push('<div class="ll-p-abschnitt"><h3>In der Tora</h3><p><a class="ll-p-link" href="/tora/' + st[0] + '/' + st[1] + '/#v' + st[1] + '-' + st[2] + '" data-umami-event="lebenslinien-tora-stelle">'
      + BUCHNAME[st[0]] + ' ' + st[1] + ',' + st[2] + ' lesen</a></p></div>');

    if (p.artikel && p.artikel.length) {
      h.push('<div class="ll-p-abschnitt"><h3>Mehr dazu auf Schalom Israel</h3><ul>'
        + p.artikel.map(function (a) { return '<li><a href="/' + a[0] + '/" data-umami-event="lebenslinien-artikel">' + esc(a[1]) + '</a></li>'; }).join('')
        + '</ul></div>');
    }
    h.push('<button type="button" class="ll-knopf-zart" data-springe="' + p.geburt + '">Zum Geburtsjahr springen</button>');

    el.dialogInhalt.innerHTML = h.join('');
    if (!el.dialog.open) {
      if (el.dialog.showModal) el.dialog.showModal(); else el.dialog.setAttribute('open', '');
    }
    el.dialog.scrollTop = 0;
    track('lebenslinien-person');
  }

  el.dialog.addEventListener('click', function (e) {
    if (e.target === el.dialog) { el.dialog.close(); return; }     // Klick auf den Hintergrund
    var b = e.target.closest('[data-person]');
    if (b) { oeffnePerson(b.dataset.person); return; }
    var s = e.target.closest('[data-springe]');
    if (s) {
      el.dialog.close();
      var j = Math.max(1, Number(s.dataset.springe));
      var ziel = { jahr: j };
      if (j < zustand.von || j > zustand.bis) { ziel.von = -30; ziel.bis = L.ENDE_ACHSE; setzeAbschnittKnopf(0); }
      gleite(ziel, 700);
    }
  });
  document.getElementById('person-zu').addEventListener('click', function () { el.dialog.close(); });

  // ---------- Die Kette der Sieben ----------
  var ketteListe = document.getElementById('kette-liste');
  ketteListe.innerHTML = L.KETTE.map(function (k, i) {
    return '<li class="ll-kette-glied" style="transition-delay:' + (i * 0.18) + 's;animation-delay:' + (i * 0.18) + 's">'
      + (k.verbindung ? '<span class="ll-kette-verbindung">' + esc(k.verbindung) + '</span>' : '')
      + '<div class="ll-kette-kreis" lang="he" style="animation-delay:' + (0.3 + i * 0.18) + 's">' + HEBR_KETTE[k.id].charAt(0) + '</div>'
      + '<span class="ll-kette-name">' + esc(k.name) + '</span>'
      + '<span class="ll-kette-jahre">' + esc(k.jahre) + '</span>'
      + '</li>';
  }).join('');

  document.getElementById('kette-zeigen').addEventListener('click', function () {
    zustand.hervor = new Set(['adam', 'metuschelach', 'schem', 'jakob']);
    setzeAbschnittKnopf(0);
    document.getElementById('lebenslinien').scrollIntoView({ behavior: ruhig ? 'auto' : 'smooth', block: 'start' });
    gleite({ von: -30, bis: L.ENDE_ACHSE, jahr: 1600 }, 700);
  });

  // ---------- Wie die Linie weitergeht ----------
  document.getElementById('weiter-linie').innerHTML = L.WEITER.map(function (w) {
    return '<li class="ll-weiter-punkt"><span class="ll-weiter-name">' + esc(w.name) + '</span>'
      + '<span class="ll-weiter-jahr">' + (w.ueblich === 'heute' ? 'Jahr ' + w.jahr : 'Jahr ' + w.jahr + ' · ' + esc(w.ueblich)) + '</span>'
      + '<span class="ll-weiter-band">Band ' + (w.band === 1 ? 'I' : 'II') + '</span></li>';
  }).join('');

  // ---------- Start ----------
  // Erst zeichnen, wenn die Schriften da sind, sonst stimmen die Breiten nicht.
  var schriften = document.fonts && document.fonts.load
    ? Promise.all([
        document.fonts.load('13.5px "Playfair Display"'),
        document.fonts.load('10.5px Inter'),
        document.fonts.load('600 10.5px Inter'),
      ]).catch(function () {})
    : Promise.resolve();

  zustand.jahr = 1;
  zeichne();
  aktualisiereAnzeige();

  schriften.then(function () {
    zeichne();
    var gelaufen = false;
    function losFahren() {
      if (gelaufen) return;
      gelaufen = true;
      gleite({ jahr: 1948 }, 2600);
    }
    if ('IntersectionObserver' in window && !ruhig) {
      var io = new IntersectionObserver(function (eintraege) {
        eintraege.forEach(function (e) { if (e.isIntersecting) { losFahren(); io.disconnect(); } });
      }, { threshold: 0, rootMargin: '0px 0px -35% 0px' });
      io.observe(el.zeichnung);
    } else {
      zustand.jahr = 1948;
      neu();
    }
  });

  var kette = document.getElementById('kette');
  if ('IntersectionObserver' in window && !ruhig) {
    var io2 = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) { if (e.isIntersecting) { kette.classList.add('ist-sichtbar'); io2.disconnect(); } });
    }, { threshold: 0, rootMargin: '0px 0px -25% 0px' });
    io2.observe(kette);
  } else {
    kette.classList.add('ist-sichtbar');
  }

  var breiteAlt = el.zeichnung.clientWidth;
  window.addEventListener('resize', function () {
    if (el.zeichnung.clientWidth !== breiteAlt) { breiteAlt = el.zeichnung.clientWidth; neu(); }
  });

  // Poster
  if (window.LLPoster) window.LLPoster.verdrahte(schriften);
})();
