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
(function () {
  var esc = window.EntdeckenTool.escape;

  function blattHtml(daten) {
    return `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8">
<title>${esc(daten.dateiname)}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  @page { size: A4 portrait; margin: 18mm; }
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
    min-height: 260mm;
    display: flex;
    flex-direction: column;
    border: 1.5pt solid #c8a962;
    padding: 14mm 12mm;
  }
  .marke {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 11pt;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: #c8a962;
    text-align: center;
  }
  .kopf { text-align: center; margin-top: 10mm; }
  .kopf-label {
    font-size: 8.5pt; letter-spacing: .16em; text-transform: uppercase;
    color: #7a8798; margin-bottom: 4mm;
  }
  .datum-he {
    font-size: 34pt; line-height: 1.25; color: #0d1e35; direction: rtl;
    margin-bottom: 3mm;
  }
  .datum-de {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 19pt; color: #0d1e35; margin-bottom: 2mm;
  }
  .datum-greg { font-size: 10.5pt; color: #5c6b7d; }

  .linie { height: 1pt; background: #c8a962; width: 34mm; margin: 9mm auto; }

  .block { margin-bottom: 8mm; text-align: center; }
  .block-label {
    font-size: 8.5pt; letter-spacing: .16em; text-transform: uppercase;
    color: #7a8798; margin-bottom: 2.5mm;
  }
  .block-wert {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 15pt; color: #0d1e35;
  }
  .block-he { font-size: 15pt; color: #8a6d2f; direction: rtl; margin-top: 1.5mm; }
  .block-zusatz { font-size: 10pt; color: #5c6b7d; margin-top: 1.5mm; }

  .impuls {
    margin: 4mm 0 0;
    padding: 6mm 7mm;
    background: #f8f3ea;
    border-left: 2.5pt solid #c8a962;
    text-align: left;
    flex-grow: 1;
  }
  .impuls h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 12.5pt; color: #0d1e35; margin: 0 0 2.5mm;
  }
  .impuls h2 + p { margin-top: 0; }
  .impuls p { font-size: 10.5pt; line-height: 1.65; margin: 0 0 3mm; color: #2a3a4a; }
  .impuls p:last-child { margin-bottom: 0; }

  .fuss {
    margin-top: 8mm; padding-top: 5mm; border-top: .75pt solid #d8d2c4;
    display: flex; justify-content: space-between; align-items: baseline;
    font-size: 9pt; color: #7a8798;
  }
  .fuss-quelle { font-size: 7.5pt; color: #98a3b0; }
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
      impulsHtml: impulsHtml || '',
      naechster: e.naechsterText || '',
      dateiname: 'Hebraeischer-Geburtstag',
    };
    return gemerkt;
  }

  function ergaenzeImpuls(impulsHtml) {
    if (gemerkt) gemerkt.impulsHtml = impulsHtml || '';
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

  window.GeburtstagsBlatt = {
    drucken: drucken,
    merke: merke,
    ergaenzeImpuls: ergaenzeImpuls,
    sammle: sammle,
    blattHtml: blattHtml,
  };
})();
