// =============================================
// SCHALOM ISRAEL - Geburtstags-Blatt zum Ausdrucken
//
// Erzeugt aus dem Ergebnis ein Blatt im Format A4 und schickt es an den
// Druckdialog. Von dort kann jeder Browser als PDF speichern, auch auf dem
// Handy. Gleiches Verfahren wie der PDF-Export der Artikel (verstecktes
// Iframe plus window.print), also keine zusaetzliche Bibliothek noetig.
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

  // Erst beim Aufruf nachschlagen, damit die Datei auch ohne Browser
  // geladen und die Kuerzungslogik geprueft werden kann.
  function esc(s) {
    if (typeof window !== 'undefined' && window.EntdeckenTool) {
      return window.EntdeckenTool.escape(s);
    }
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function blattHtml(daten) {
    return `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8">
<title>${esc(daten.dateiname)}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  /* A4 ist 297mm hoch. Bei 15mm Rand oben und unten bleiben 267mm.
     Alles unten ist so bemessen, dass auch ein laengerer Impulstext
     noch auf EINE Seite passt. Eine erste Fassung war zu grosszuegig
     und lief auf eine zweite Seite ueber. */
  @page { size: A4 portrait; margin: 15mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Inter', system-ui, sans-serif;
    color: #1b2a3d;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .blatt {
    min-height: 255mm;
    display: flex;
    flex-direction: column;
    border: 1.5pt solid #c8a962;
    padding: 9mm 10mm;
  }
  .marke {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 10pt;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: #c8a962;
    text-align: center;
  }
  .kopf { text-align: center; margin-top: 6mm; }
  .kopf-label {
    font-size: 8pt; letter-spacing: .16em; text-transform: uppercase;
    color: #7a8798; margin-bottom: 3mm;
  }
  .datum-he {
    font-size: 26pt; line-height: 1.2; color: #0d1e35; direction: rtl;
    margin-bottom: 2mm;
  }
  .datum-de {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 17pt; color: #0d1e35; margin-bottom: 1.5mm;
  }
  .datum-greg { font-size: 10pt; color: #5c6b7d; }

  .linie { height: 1pt; background: #c8a962; width: 30mm; margin: 6mm auto; }

  .block { margin-bottom: 5mm; text-align: center; }
  .block-label {
    font-size: 8pt; letter-spacing: .16em; text-transform: uppercase;
    color: #7a8798; margin-bottom: 2mm;
  }
  .block-wert {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 14pt; color: #0d1e35;
  }
  .block-he { font-size: 13pt; color: #8a6d2f; direction: rtl; margin-top: 1mm; }
  .block-zusatz { font-size: 9.5pt; color: #5c6b7d; margin-top: 1mm; }

  .impuls {
    margin: 2mm 0 0;
    padding: 5mm 6mm;
    background: #f8f3ea;
    border-left: 2.5pt solid #c8a962;
    text-align: left;
    flex-grow: 1;
  }
  .impuls h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 11.5pt; color: #0d1e35; margin: 0 0 2mm;
  }
  .impuls h2 ~ h2 { margin-top: 4mm; }
  .impuls p { font-size: 9.5pt; line-height: 1.55; margin: 0 0 2.5mm; color: #2a3a4a; }
  .impuls p:last-child { margin-bottom: 0; }

  .fuss {
    margin-top: 5mm; padding-top: 3.5mm; border-top: .75pt solid #d8d2c4;
    display: flex; justify-content: space-between; align-items: baseline;
    gap: 4mm;
    font-size: 8.5pt; color: #7a8798;
  }
  .fuss-quelle { font-size: 7pt; color: #98a3b0; margin-top: 2mm; line-height: 1.4; }
</style></head>
<body>
  <div class="blatt">
    <div class="marke">Schalom Israel</div>

    <div class="kopf">
      <div class="kopf-label">Dein hebräischer Geburtstag</div>
      <div class="datum-he">${esc(daten.datumHebraeisch)}</div>
      <div class="datum-de">${esc(daten.datumDeutsch)}</div>
      <div class="datum-greg">${esc(daten.datumGregorianisch)}</div>
    </div>

    <div class="linie"></div>

    <div class="block">
      <div class="block-label">Die Wochenlesung deiner Geburtswoche</div>
      <div class="block-wert">${esc(daten.parascha)}</div>
      ${daten.paraschaHebraeisch ? `<div class="block-he">${esc(daten.paraschaHebraeisch)}</div>` : ''}
      ${daten.paraschaBedeutung ? `<div class="block-zusatz">„${esc(daten.paraschaBedeutung)}"</div>` : ''}
    </div>

    <div class="block">
      <div class="block-label">Der Abschnitt deines Wochentags</div>
      <div class="block-wert">${esc(daten.aliyah)}</div>
      <div class="block-zusatz">${esc(daten.stelle)}</div>
    </div>

    ${daten.impulsHtml ? `<div class="impuls">${daten.impulsHtml}</div>` : ''}

    <div class="fuss">
      <span>${daten.naechster ? esc(daten.naechster) : ''}</span>
      <span>schalomisrael.de</span>
    </div>
    <div class="fuss-quelle">
      Datumsangaben nach dem jüdischen Kalender, berechnet über hebcal.com.
      Der Tag beginnt am Abend zuvor.
    </div>
  </div>
</body></html>`;
  }

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

  function drucken(knopf) {
    var daten = sammle();
    if (!daten) return;

    var altText = knopf ? knopf.textContent : null;
    if (knopf) { knopf.disabled = true; knopf.textContent = 'Blatt wird vorbereitet ...'; }

    var rahmen = document.createElement('iframe');
    rahmen.setAttribute('aria-hidden', 'true');
    rahmen.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
    document.body.appendChild(rahmen);

    var d = rahmen.contentDocument || rahmen.contentWindow.document;
    d.open();
    d.write(blattHtml(daten));
    d.close();

    var aufraeumen = function () {
      if (knopf) { knopf.disabled = false; knopf.textContent = altText || 'Als Blatt drucken'; }
      setTimeout(function () { rahmen.remove(); }, 800);
    };

    // Schriften abwarten, sonst druckt der Browser mit Ersatzschrift.
    var los = function () {
      try {
        rahmen.contentWindow.focus();
        rahmen.contentWindow.print();
      } catch (e) { /* Druckdialog nicht verfuegbar */ }
      aufraeumen();
    };

    if (d.fonts && d.fonts.ready) {
      d.fonts.ready.then(function () { setTimeout(los, 250); }).catch(function () { setTimeout(los, 700); });
    } else {
      setTimeout(los, 700);
    }
    window.EntdeckenTool.track('entdecken-geburtstag-blatt');
  }

  return {
    drucken: drucken,
    merke: merke,
    ergaenzeImpuls: ergaenzeImpuls,
    kuerzeImpuls: kuerzeImpuls,
    sammle: sammle,
    blattHtml: blattHtml,
    MAX_IMPULS: MAX_IMPULS,
  };
});
