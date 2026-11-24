// =============================================
// SCHALOM ISRAEL - Geburtstags-Blatt als PDF
//
// Sammelt die Angaben aus dem Ergebnis und laesst daraus ein PDF im Format
// A4 erzeugen: blatt-canvas.js zeichnet das Blatt, pdf.js verpackt es.
// Es ist ein echter Download, kein Druckdialog.
//
// Ein Blatt pro Tag ist frei, danach fuehrt der Weg in den Freundes-Bereich.
//
// BEWUSST OHNE VERSTEXT: Der Bibeltext enthaelt den Gottesnamen. Ein
// ausgedrucktes Blatt damit waere nicht einfach wegwerfbar. Ob und wie die
// Verse aufgenommen werden, ist eine Entscheidung fuer Timon, nicht fuer den
// Code. Das Blatt nennt deshalb die Stelle zum Nachschlagen.
// =============================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GeburtstagsBlatt = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  // Die Angaben werden vom Tool uebergeben, NICHT aus dem HTML zurueckgelesen.
  // Zuruecklesen war die erste Fassung und ging schief: der Impulstext wurde
  // nicht gefunden und die Bedeutung nur ungenau aus dem Fliesstext geraten.
  var gemerkt = null;

  // e ist das Ergebnis aus Geburtstag.berechne(), impuls der Markdown-Text.
  function merke(e, impulsHtml) {
    var PD = window.ParaschaDaten;
    gemerkt = {
      datumHebraeisch: e.heb.hebrew || '',
      datumDeutsch: e.datumDeutsch,
      datumGregorianisch: PD.formatDate(e.wirksam),
      parascha: e.eintraege.length
        ? e.eintraege.map(function (x) { return x.de; }).join(' · ')
        : e.lesung.item.name.en,
      paraschaHebraeisch: e.eintraege.map(function (x) { return x.he; }).join(' · '),
      paraschaBedeutung: e.eintraege.map(function (x) { return x.meaning; }).join(' · '),
      aliyah: e.aliyahName + ', der ' + e.nummer + '. Abschnitt',
      stelle: e.stelleDe,
      impulsHtml: kuerzeImpuls(impulsHtml),
      naechster: e.naechsterText || '',
      dateiname: 'Hebraeischer-Geburtstag',
    };
    return gemerkt;
  }

  // Das Blatt soll auf EINE Seite passen. Gemessen: ein Impuls von rund
  // 1400 Zeichen laesst noch Luft, ab etwa 1800 Zeichen laeuft das Blatt
  // ueber. Laengere Texte werden deshalb an der letzten vollstaendigen
  // Absatzgrenze abgeschnitten. Auf der Seite selbst steht weiter alles.
  var MAX_IMPULS = 1800;

  function kuerzeImpuls(html) {
    if (!html || html.length <= MAX_IMPULS) return html || '';
    var stueck = html.slice(0, MAX_IMPULS);
    var letztesEnde = stueck.lastIndexOf('</p>');
    if (letztesEnde > 400) return stueck.slice(0, letztesEnde + 4);
    // Kein sauberer Schnittpunkt: lieber ganz weglassen als zerrissen drucken.
    var ersterAbsatz = html.indexOf('</p>');
    return ersterAbsatz > -1 ? html.slice(0, ersterAbsatz + 4) : '';
  }

  function ergaenzeImpuls(impulsHtml) {
    if (gemerkt) gemerkt.impulsHtml = kuerzeImpuls(impulsHtml);
  }

  function sammle() { return gemerkt; }

  // ---------- Wie oft schon heruntergeladen? ----------
  //
  // Ein Download pro Tag ist frei, danach fuehrt der Weg in den
  // Freundes-Bereich. Der Zaehler liegt im Browser, ist also mit etwas
  // Aufwand zu umgehen (privates Fenster, anderer Browser). Das ist bewusst
  // so: fuer eine harte Sperre braeuchte es Anmeldung und Server, und der
  // Aufwand steht in keinem Verhaeltnis. Der Zaehler haelt den Normalfall
  // ab, nicht den entschlossenen Fall.
  var SPEICHER = 'si-blatt-downloads';
  var FREI_PRO_TAG = 1;

  function heute() {
    return new Date().toISOString().slice(0, 10);
  }

  function stand() {
    try {
      var roh = localStorage.getItem(SPEICHER);
      if (!roh) return { tag: heute(), anzahl: 0 };
      var s = JSON.parse(roh);
      if (s.tag !== heute()) return { tag: heute(), anzahl: 0 };
      return { tag: s.tag, anzahl: Number(s.anzahl) || 0 };
    } catch (e) {
      return { tag: heute(), anzahl: 0 };
    }
  }

  function zaehle() {
    var s = stand();
    s.anzahl += 1;
    try { localStorage.setItem(SPEICHER, JSON.stringify(s)); } catch (e) {}
    return s;
  }

  function nochFrei() {
    return stand().anzahl < FREI_PRO_TAG;
  }

  // ---------- Download ----------
  function herunterladen(knopf, beiSperre) {
    var daten = sammle();
    if (!daten) return;

    if (!nochFrei()) {
      if (typeof beiSperre === 'function') beiSperre();
      window.EntdeckenTool.track('entdecken-geburtstag-blatt-gesperrt');
      return;
    }

    var altText = knopf ? knopf.textContent : null;
    if (knopf) { knopf.disabled = true; knopf.textContent = 'Wird erstellt ...'; }

    var fertig = function () {
      if (knopf) { knopf.disabled = false; knopf.textContent = altText || 'Als PDF herunterladen'; }
    };

    window.BlattCanvas.bereit()
      .then(function () {
        var canvas = window.BlattCanvas.zeichne(daten);
        window.MiniPDF.ausCanvas(canvas, 'Hebraeischer-Geburtstag', 'Dein hebräischer Geburtstag');
        zaehle();
        window.EntdeckenTool.track('entdecken-geburtstag-blatt');
      })
      .catch(function () {
        if (knopf) knopf.textContent = 'Hat nicht geklappt';
      })
      .then(fertig);
  }

  return {
    herunterladen: herunterladen,
    nochFrei: nochFrei,
    stand: stand,
    FREI_PRO_TAG: FREI_PRO_TAG,
    merke: merke,
    ergaenzeImpuls: ergaenzeImpuls,
    kuerzeImpuls: kuerzeImpuls,
    sammle: sammle,
    MAX_IMPULS: MAX_IMPULS,
  };
});
