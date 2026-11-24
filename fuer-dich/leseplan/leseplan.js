// =============================================
// SCHALOM ISRAEL - Leseplan: die Seite /fuer-dich/leseplan/
// Rechnung in plan.js, Druck in druck.js. Hier nur Anzeige und Fortschritt.
// Der Fortschritt bleibt im Browser (localStorage), keine Anmeldung.
// =============================================
(function () {
  const P = window.Leseplan;
  const D = window.LeseplanDruck;
  const PD = window.ParaschaDaten;
  const esc = PD.escapeHtml;

  const SPEICHER = 'si-leseplan-v1';
  const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  const zustand = {
    lj: null,          // aktuelles Lesejahr
    plan: [],          // Tage des Lesejahres
    index: 0,          // gewählter Tag
    heute: 0,          // Index von heute
    gelesen: {},       // { 'YYYY-MM-DD': true }
    artikel: {},       // Artikel nach Paraschah-Slug
  };

  // ---------- Hilfen ----------

  function heuteIso() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function langDatum(iso) {
    const d = new Date(iso + 'T12:00:00Z');
    return P.WOCHENTAG[d.getUTCDay()] + ', ' + d.getUTCDate() + '. ' + MONATE[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
  }

  function kurzDatum(iso) {
    const d = new Date(iso + 'T12:00:00Z');
    return d.getUTCDate() + '.' + (d.getUTCMonth() + 1) + '.';
  }

  function ladeFortschritt() {
    try {
      const roh = localStorage.getItem(SPEICHER);
      const j = roh ? JSON.parse(roh) : null;
      zustand.gelesen = (j && j.gelesen) || {};
    } catch (e) { zustand.gelesen = {}; }
  }

  function speichereFortschritt() {
    try { localStorage.setItem(SPEICHER, JSON.stringify({ gelesen: zustand.gelesen })); } catch (e) { /* privates Fenster */ }
  }

  function zaehlen(ereignis, daten) {
    try { if (window.umami) window.umami.track(ereignis, daten); } catch (e) { /* egal */ }
  }

  // Hebcal-Lesungen eines Lesejahres. Ändern sich nie, deshalb im Browser
  // zwischengespeichert.
  async function ladeLesungen(lj) {
    const schluessel = 'si-leseplan-hebcal-' + lj.jahr;
    try {
      const roh = localStorage.getItem(schluessel);
      if (roh) return JSON.parse(roh);
    } catch (e) { /* weiter */ }
    const stuecke = P.abfrageStuecke(lj.start, lj.ende);
    const antworten = await Promise.all(stuecke.map(function (s) {
      return fetch('https://www.hebcal.com/leyning?cfg=json&start=' + s[0] + '&end=' + s[1])
        .then(function (r) { if (!r.ok) throw new Error('Hebcal'); return r.json(); });
    }));
    const items = [];
    antworten.forEach(function (a) {
      (a.items || []).forEach(function (i) {
        if (i.type === 'weekday') return;
        items.push({ date: i.date, type: i.type, name: { en: i.name.en }, parshaNum: i.parshaNum,
          fullkriyah: i.fullkriyah, haft: i.haft, megillah: i.megillah });
      });
    });
    try { localStorage.setItem(schluessel, JSON.stringify(items)); } catch (e) { /* zu groß oder gesperrt */ }
    return items;
  }

  async function planFuer(jahr) {
    const lj = P.lesejahr(jahr);
    const items = await ladeLesungen(lj);
    return { lj: lj, plan: P.baueLeseplan(items, lj) };
  }

  // ---------- Fortschritt ----------

  // Welche Tage gehören zu welchem Buch? Ein Buch ist gelesen, wenn alle
  // seine Tage abgehakt sind.
  function buchTage() {
    const tora = {}, nk = {};
    zustand.plan.forEach(function (t) {
      if (t.tora.art !== 'fest') {
        t.tora.teile.forEach(function (teil) {
          const b = window.TanachBuecher.buch(teil.k);
          if (b) (tora[b.de] = tora[b.de] || []).push(t.datum);
        });
      }
      t.nk.abschnitte.forEach(function (a) { (nk[a.buch.de] = nk[a.buch.de] || []).push(t.datum); });
    });
    return { tora: tora, nk: nk };
  }

  function fertigeBuecher() {
    const bt = buchTage();
    const fertig = function (tage) { return tage.every(function (d) { return zustand.gelesen[d]; }); };
    return {
      tora: Object.keys(bt.tora).filter(function (b) { return fertig(bt.tora[b]); }),
      nk: Object.keys(bt.nk).filter(function (b) { return fertig(bt.nk[b]); }),
    };
  }

  function tageAmStueck() {
    let n = 0;
    for (let i = zustand.heute; i >= 0; i--) {
      if (zustand.gelesen[zustand.plan[i].datum]) n++;
      else if (i !== zustand.heute) break;
    }
    return n;
  }

  // ---------- Anzeige ----------

  function zeigeTag() {
    const t = zustand.plan[zustand.index];
    const el = document.getElementById('tag');
    const istHeute = zustand.index === zustand.heute;
    const abstand = zustand.index - zustand.heute;
    const etikett = istHeute ? 'Heute' : abstand === 1 ? 'Morgen' : abstand === -1 ? 'Gestern'
      : (abstand > 0 ? 'In ' + abstand + ' Tagen' : 'Vor ' + (-abstand) + ' Tagen');
    const gelesen = !!zustand.gelesen[t.datum];
    const feste = t.feste.map(function (f) { return '<span class="fest">' + esc(f) + '</span>'; }).join('');

    let toraKopf = esc(t.tora.name);
    if (t.tora.nameHe) toraKopf += ' <span class="he">' + t.tora.nameHe + '</span>';
    const toraArt = t.tora.art === 'fest' ? 'Das Fest hat am Schabbat seine eigene Lesung; diese Woche wird sie Tag für Tag gelesen.'
      : t.tora.art === 'wesot' ? 'Der Schluss der Tora. Er wird an keinem Schabbat gelesen, sondern zu Simchat Tora.'
      : '';

    let nkHtml;
    if (t.nk.art === 'rolle') {
      nkHtml = '<div class="blk rolle"><div class="blk-lbl">Die Rolle zu ' + esc(t.nk.fest) + '</div>'
        + '<div class="stelle">' + esc(t.nk.stelle) + '</div>'
        + '<p class="hinweis">So wie sie zu ' + esc(t.nk.fest) + ' in der Synagoge gelesen wird. Heute ersetzt sie das fortlaufende Stück.</p></div>';
    } else {
      nkHtml = '<div class="blk"><div class="blk-lbl">Propheten und Schriften</div>'
        + '<div class="stelle">' + esc(t.nk.stelle) + '</div>'
        + '<p class="hinweis">In deiner eigenen Bibel, ' + t.nk.verse + ' Verse.</p></div>';
    }

    const haftHtml = t.haftara
      ? '<div class="blk haft"><div class="blk-lbl">Haftara</div><div class="stelle">' + esc(t.haftara) + '</div>'
        + '<p class="hinweis">Die Prophetenlesung, die am Schabbat nach der Wochenlesung gelesen wird.</p></div>'
      : '';

    el.innerHTML =
      '<div class="tag-kopf">'
      + '<button class="pfeil" data-schritt="-1" aria-label="Vorheriger Tag"' + (zustand.index === 0 ? ' disabled' : '') + '>‹</button>'
      + '<div class="tag-titel"><div class="etikett">' + esc(etikett) + '</div>'
      + '<div class="datum">' + esc(langDatum(t.datum)) + '</div>'
      + '<div class="hebr">' + esc(t.hebr) + feste + '</div></div>'
      + '<button class="pfeil" data-schritt="1" aria-label="Nächster Tag"' + (zustand.index === zustand.plan.length - 1 ? ' disabled' : '') + '>›</button>'
      + '</div>'
      + '<div class="blk tora"><div class="blk-lbl">Tora · ' + esc(t.tora.abschnitt) + '</div>'
      + '<div class="wochenname">' + toraKopf + '</div>'
      + '<div class="stelle">' + esc(t.tora.stelle) + '</div>'
      + (toraArt ? '<p class="hinweis">' + esc(toraArt) + '</p>' : '')
      + '<a class="knopf gold" href="' + esc(t.tora.link) + '" data-zaehl="leseplan-or-tora">In Or Tora lesen, Hebräisch und Deutsch</a></div>'
      + nkHtml + haftHtml
      + '<div class="tag-fuss">'
      + '<button id="abhaken" class="abhaken' + (gelesen ? ' an' : '') + '" aria-pressed="' + gelesen + '">'
      + '<span class="haken" aria-hidden="true"></span>' + (gelesen ? 'Gelesen' : 'Als gelesen abhaken') + '</button>'
      + (istHeute ? '' : '<button class="link" id="zuHeute">Zu heute</button>')
      + '<span class="tagnr">Tag ' + t.nr + ' von ' + zustand.plan.length + '</span>'
      + '</div>';
  }

  function zeigeWoche() {
    const t = zustand.plan[zustand.index];
    const woche = zustand.plan.filter(function (x) { return x.tora.schabbat === t.tora.schabbat; });
    const el = document.getElementById('woche');
    el.innerHTML = '<div class="woche-kopf"><span>Diese Woche</span><strong>' + esc(woche[woche.length - 1].tora.name) + '</strong></div>'
      + '<div class="tage">' + woche.map(function (x) {
        const i = zustand.plan.indexOf(x);
        const cls = ['wtag'];
        if (i === zustand.index) cls.push('gewaehlt');
        if (i === zustand.heute) cls.push('heute');
        if (zustand.gelesen[x.datum]) cls.push('erledigt');
        if (x.nk.art === 'rolle' || x.feste.length) cls.push('festtag');
        return '<button class="' + cls.join(' ') + '" data-index="' + i + '">'
          + '<span class="wt">' + esc(x.wochentag === 6 ? 'Schab.' : P.WOCHENTAG_KURZ[x.wochentag]) + '</span>'
          + '<span class="wd">' + esc(kurzDatum(x.datum)) + '</span>'
          + '<span class="punkt" aria-hidden="true"></span></button>';
      }).join('') + '</div>';
  }

  function zeigeFortschritt() {
    const anzahl = zustand.plan.filter(function (t) { return zustand.gelesen[t.datum]; }).length;
    const prozent = Math.round(anzahl / zustand.plan.length * 100);
    const fertig = fertigeBuecher();
    const toraBuecher = ['1. Mose', '2. Mose', '3. Mose', '4. Mose', '5. Mose'];
    const el = document.getElementById('fortschritt');
    el.innerHTML = '<h2>Dein Fortschritt</h2>'
      + '<div class="balken"><span style="width:' + prozent + '%"></span></div>'
      + '<div class="zahlen"><div><strong>' + anzahl + '</strong> von ' + zustand.plan.length + ' Tagen</div>'
      + '<div><strong>' + tageAmStueck() + '</strong> Tage am Stück</div>'
      + '<div><strong>' + (fertig.tora.length + fertig.nk.length) + '</strong> von 39 Büchern</div></div>'
      + '<div class="buecher">' + toraBuecher.map(function (b) {
        return '<span class="buch' + (fertig.tora.indexOf(b) >= 0 ? ' fertig' : '') + '">' + esc(b) + '</span>';
      }).join('') + '</div>'
      + (fertig.nk.length ? '<p class="nk-fertig">Propheten und Schriften: ' + fertig.nk.map(esc).join(', ') + '</p>' : '')
      + '<p class="still">Gespeichert nur in diesem Browser. Wer an einem anderen Gerät liest, beginnt dort mit leerem Fortschritt.</p>';
  }

  function zeigeZurWoche() {
    const t = zustand.plan[zustand.index];
    const el = document.getElementById('zurwoche');
    const schabbat = zustand.plan.find(function (x) { return x.datum === t.tora.schabbat; }) || t;
    let html = '';
    const artikel = [];
    (schabbat.tora.eintraege || []).forEach(function (e) {
      PD.articlesForParasha(e, zustand.artikel).forEach(function (a) {
        if (!artikel.some(function (x) { return x.href === a.href; })) artikel.push(a);
      });
    });
    if (artikel.length) {
      html += '<div class="chips-h">Beiträge zu ' + esc(schabbat.tora.name) + '</div><div class="chips">'
        + artikel.map(function (a) { return '<a class="chip" href="' + esc(a.href) + '">' + esc(a.title) + '</a>'; }).join('') + '</div>';
    }
    const ersterTeil = schabbat.tora.teile[0];
    const band = schabbat.tora.art === 'parascha' && ersterTeil ? PD.buchFuerStelle(ersterTeil.k + ' 1') : null;
    if (band) {
      html += '<div class="relcard"><img src="/buecher/' + esc(band.slug) + '/cover.jpg" alt="Buchcover ' + esc(band.name) + '">'
        + '<div><h3>Band ' + esc(band.band) + ': ' + esc(band.name) + '</h3>'
        + '<p>Die Auslegung zu jeder Wochenlesung von ' + esc(band.name) + ', aus der Reihe „Das Tora-Jahr“.</p>'
        + '<a href="/buecher/' + esc(band.slug) + '/">Zum Buch</a></div></div>';
    }
    el.innerHTML = html;
    el.hidden = !html;
  }

  function alles() {
    zeigeTag();
    zeigeWoche();
    zeigeFortschritt();
    zeigeZurWoche();
  }

  // ---------- Abschluss ----------

  function zeigeAbschluss(abschluss, tag) {
    const dlg = document.getElementById('abschluss');
    const mitChasak = abschluss.teil === 'tora' || abschluss.teil === 'jahr';
    const titel = abschluss.teil === 'jahr' ? 'Der ganze Tanach, ein Jahr lang' : abschluss.buch + ' ist gelesen';
    const text = abschluss.teil === 'tora'
      ? 'Wenn in der Synagoge ein Buch der Tora zu Ende gelesen ist, steht die Gemeinde auf und ruft diesen Satz. Heute gilt er dir.'
      : abschluss.teil === 'jahr'
        ? 'Mit Simchat Tora schließt sich der Kreis. Morgen beginnt die Tora wieder mit „Im Anfang“.'
        : 'Ein weiteres Buch des Tanach, Kapitel für Kapitel.';
    dlg.querySelector('.inhalt').innerHTML =
      (mitChasak ? '<div class="chasak" lang="he" dir="rtl">חֲזַק חֲזַק וְנִתְחַזֵּק</div><div class="chasak-de">Chasak, chasak we-nitchasek</div>' : '')
      + '<h2>' + esc(titel) + '</h2><p>' + esc(text) + '</p>'
      + '<div class="dlg-knoepfe"><button class="knopf gold" id="bildTeilen">Bild speichern oder teilen</button>'
      + '<button class="knopf hell" id="dlgZu">Schließen</button></div>';
    dlg.querySelector('#dlgZu').onclick = function () { dlg.close(); };
    dlg.querySelector('#bildTeilen').onclick = async function () {
      const c = await D.teilbild(abschluss, tag);
      zaehlen('leseplan-teilbild', { buch: abschluss.buch });
      c.toBlob(async function (blob) {
        const name = 'gelesen-' + abschluss.buch.replace(/[^\wäöüÄÖÜß]+/g, '-').toLowerCase() + '.png';
        const datei = new File([blob], name, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [datei] })) {
          try { await navigator.share({ files: [datei], text: 'schalomisrael.de/fuer-dich/leseplan' }); return; } catch (e) { /* abgebrochen */ }
        }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 60000);
      }, 'image/png');
    };
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }

  function abhaken() {
    const t = zustand.plan[zustand.index];
    const vorher = fertigeBuecher();
    if (zustand.gelesen[t.datum]) delete zustand.gelesen[t.datum];
    else zustand.gelesen[t.datum] = true;
    speichereFortschritt();
    alles();
    if (!zustand.gelesen[t.datum]) return;
    zaehlen('leseplan-gelesen');
    const nachher = fertigeBuecher();
    const neuTora = nachher.tora.filter(function (b) { return vorher.tora.indexOf(b) < 0; });
    const neuNk = nachher.nk.filter(function (b) { return vorher.nk.indexOf(b) < 0; });
    const alleGelesen = zustand.plan.every(function (x) { return zustand.gelesen[x.datum]; });
    if (alleGelesen) zeigeAbschluss({ teil: 'jahr', buch: 'Tanach' }, t);
    else if (neuTora.length) zeigeAbschluss({ teil: 'tora', buch: neuTora[neuTora.length - 1] }, t);
    else if (neuNk.length) zeigeAbschluss({ teil: 'nk', buch: neuNk[neuNk.length - 1] }, t);
  }

  // ---------- Herunterladen ----------

  async function mitWarten(knopf, arbeit) {
    const text = knopf.textContent;
    knopf.disabled = true; knopf.textContent = 'Wird erstellt …';
    try { await arbeit(); } catch (e) {
      console.error(e);
      knopf.textContent = 'Das hat nicht geklappt. Bitte noch einmal versuchen.';
      setTimeout(function () { knopf.textContent = text; knopf.disabled = false; }, 3500);
      return;
    }
    knopf.textContent = text; knopf.disabled = false;
  }

  function zeigeDownloads() {
    const el = document.getElementById('laden');
    const jahr = zustand.lj.jahr;
    el.innerHTML = '<h2>Zum Ausdrucken</h2>'
      + '<div class="laden-raster">'
      + '<div class="laden-karte"><h3>Der Jahresplan</h3><p>Alle ' + zustand.lj.tage + ' Tage des Lesejahres ' + jahr + ', Woche für Woche, mit Kästchen zum Abhaken.</p>'
      + '<button class="knopf gold" data-jahr="' + jahr + '">Jahresplan ' + jahr + ' als PDF</button>'
      + '<button class="knopf hell" data-jahr="' + (jahr + 1) + '">Lesejahr ' + (jahr + 1) + ' (ab ' + kurzDatum(P.lesejahr(jahr + 1).start) + P.lesejahr(jahr + 1).start.slice(0, 4) + ')</button></div>'
      + '</div>';
    el.querySelectorAll('[data-jahr]').forEach(function (k) {
      k.onclick = function () {
        mitWarten(k, async function () {
          const j = Number(k.dataset.jahr);
          const daten = j === zustand.lj.jahr ? { lj: zustand.lj, plan: zustand.plan } : await planFuer(j);
          const seiten = await D.jahresplanSeiten(daten.plan, daten.lj);
          window.MiniPDF.ausCanvasSeiten(seiten, 'Leseplan-Tanach-' + j, 'Der Tanach in einem Jahr – Lesejahr ' + j);
          zaehlen('leseplan-pdf-jahr', { jahr: j });
        });
      };
    });
  }

  // ---------- Start ----------

  function verdrahten() {
    document.getElementById('tag').addEventListener('click', function (e) {
      const pfeil = e.target.closest('[data-schritt]');
      if (pfeil) {
        zustand.index = Math.max(0, Math.min(zustand.plan.length - 1, zustand.index + Number(pfeil.dataset.schritt)));
        alles();
        return;
      }
      if (e.target.closest('#abhaken')) { abhaken(); return; }
      if (e.target.closest('#zuHeute')) { zustand.index = zustand.heute; alles(); return; }
      const z = e.target.closest('[data-zaehl]');
      if (z) zaehlen(z.dataset.zaehl);
    });
    document.getElementById('woche').addEventListener('click', function (e) {
      const b = e.target.closest('[data-index]');
      if (!b) return;
      zustand.index = Number(b.dataset.index);
      alles();
    });
  }

  async function start() {
    const inhalt = document.getElementById('inhalt');
    ladeFortschritt();
    try {
      const heute = heuteIso();
      const lj = P.lesejahrFuer(heute);
      const geladen = await planFuer(lj.jahr);
      zustand.lj = geladen.lj;
      zustand.plan = geladen.plan;
      zustand.heute = Math.max(0, zustand.plan.findIndex(function (t) { return t.datum === heute; }));
      zustand.index = zustand.heute;
    } catch (e) {
      console.error(e);
      inhalt.innerHTML = '<p class="fehler">Der Kalender lässt sich gerade nicht laden. Bitte in ein paar Minuten noch einmal versuchen.</p>';
      return;
    }
    document.getElementById('lesejahr').textContent = 'Lesejahr ' + zustand.lj.jahr + ': ' + langDatum(zustand.lj.start).replace(/^\w+, /, '')
      + ' bis ' + langDatum(zustand.lj.ende).replace(/^\w+, /, '');
    inhalt.hidden = false;
    document.getElementById('laedt').hidden = true;
    verdrahten();
    alles();
    zeigeDownloads();
    PD.loadArticleIndex().then(function (idx) { zustand.artikel = idx || {}; zeigeZurWoche(); }).catch(function () { /* ohne Artikel */ });
  }

  start();
})();
