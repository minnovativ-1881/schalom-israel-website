// =============================================
// SCHALOM ISRAEL - Name auf Hebraeisch, Bedienung der Seite
//
// Rechnet im Browser, waehrend getippt wird. Kein Serveraufruf, kein Warten.
// Die Umschrift selbst steht in umschrift.js und ist ohne diese Datei testbar.
// =============================================
(function () {
  const U = window.NameUmschrift;
  const S = window.NameSprachen;

  const input = document.querySelector('[data-name]');
  const sprachen = document.querySelector('[data-sprachen]');
  const ergebnis = document.querySelector('[data-ergebnis]');
  const vergleich = document.querySelector('[data-vergleich]');
  if (!input || !sprachen || !ergebnis) return;

  let sprache = 'de';

  function escape(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ---------- Sprachreiter ----------
  function baueSprachen() {
    sprachen.innerHTML = S.liste().map((s) => (
      '<button type="button" class="nh-sprache" data-code="' + escape(s.code) + '"' +
      ' aria-pressed="' + (s.code === sprache ? 'true' : 'false') + '">' +
      escape(s.name) + '</button>'
    )).join('');
  }

  sprachen.addEventListener('click', function (e) {
    const knopf = e.target.closest('[data-code]');
    if (!knopf) return;
    sprache = knopf.dataset.code;
    const alle = sprachen.querySelectorAll('[data-code]');
    for (let i = 0; i < alle.length; i++) {
      alle[i].setAttribute('aria-pressed', alle[i] === knopf ? 'true' : 'false');
    }
    zeichne();
    if (window.umami) window.umami.track('name-hebraeisch-sprache-' + sprache);
  });

  // ---------- Ergebnis ----------
  const QUELLE_TEXT = {
    eingebuergert: 'Diese Schreibweise ist im Hebräischen eingebürgert. So würde man den Namen in Israel schreiben.',
    lautlich: 'Diese Schreibweise ist lautlich gebildet, nach den Regeln der hebräischen Schrift. Sie ist nicht überliefert, aber sie liest sich wie dein Name.',
  };

  function zeichne() {
    const name = input.value;
    const teilenZiel = document.querySelector('[data-teilen]');
    if (!S.normalisiere(name)) {
      ergebnis.innerHTML = '';
      vergleich.innerHTML = '';
      if (teilenZiel) teilenZiel.innerHTML = '';
      return;
    }

    const e = U.schreibe(name, sprache);

    if (e.quelle === 'abgelehnt') {
      ergebnis.innerHTML = '<div class="nh-karte"><p class="nh-quelle" style="border:0;margin:0;padding:0">' +
        escape(e.hinweis) + '</p></div>';
      vergleich.innerHTML = '';
      if (teilenZiel) teilenZiel.innerHTML = '';
      return;
    }

    const buchstaben = e.buchstaben.map((b) => (
      '<li class="nh-buchstabe">' +
      '<span class="nh-buchstabe-zeichen">' + escape(b.zeichen) + '</span>' +
      '<span class="nh-buchstabe-name">' + escape(b.name) + '</span>' +
      '</li>'
    )).join('');

    ergebnis.innerHTML =
      '<div class="nh-karte">' +
      '<p class="nh-name" dir="rtl" lang="he">' + escape(e.schrift) + '</p>' +
      (e.lesehilfe ? '<p class="nh-lesehilfe">' + escape(e.lesehilfe) + '</p>' : '') +
      '<ul class="nh-buchstaben">' + buchstaben + '</ul>' +
      '<p class="nh-zahlenwert">Zahlenwert der Buchstaben: <strong>' +
        U.zahlenwert(e.schrift) + '</strong></p>' +
      (e.hinweis ? '<p class="nh-hinweis">' + escape(e.hinweis) + '</p>' : '') +
      '<p class="nh-quelle">' + escape(QUELLE_TEXT[e.quelle] || '') + '</p>' +
      '</div>';

    baueTeilen(e);
    baueVergleich(name);
  }

  // ---------- Teilen ----------
  //
  // Auf dem Handy kann die Seite das fertige Bild direkt an Instagram,
  // WhatsApp oder die Fotos-App uebergeben. Das ist der eigentliche Weg,
  // auf dem so eine Seite weitergereicht wird, deshalb steht dieser Knopf
  // zuerst und nur dort, wo er auch wirklich funktioniert.
  function kannBildTeilen() {
    try {
      if (!navigator.share || !navigator.canShare) return false;
      const probe = new File([new Blob([''], { type: 'image/png' })], 'p.png',
                             { type: 'image/png' });
      return navigator.canShare({ files: [probe] });
    } catch (err) {
      return false;
    }
  }

  // Der geteilte Link zeigt bewusst auf die nackte Seite, nicht auf
  // ?name=... Wer ihn bekommt, soll seinen EIGENEN Namen eintippen. Ein Link
  // auf ein fremdes Ergebnis wird angeschaut und weggeklickt.
  const SEITE = 'https://www.schalomisrael.de/name-auf-hebraeisch/';

  function teilText(e) {
    return 'Mein Name in hebräischer Schrift: ' + e.schrift +
           '\nWie deiner aussieht, findest du hier: ' + SEITE;
  }

  function baueTeilen(e) {
    const ziel = document.querySelector('[data-teilen]');
    if (!ziel) return;

    const text = teilText(e);
    const wa = 'https://wa.me/?text=' + encodeURIComponent(text);
    const tg = 'https://t.me/share/url?url=' + encodeURIComponent(SEITE) +
               '&text=' + encodeURIComponent('Mein Name in hebräischer Schrift: ' + e.schrift);
    const fb = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(SEITE);

    ziel.innerHTML =
      '<div class="nh-teilen-karte">' +
      '<h2>Zeig ihn weiter</h2>' +
      '<p class="nh-teilen-text">Wenn dir dein Name gefällt, stell ihn in deine Story oder schick ihn jemandem. ' +
      'Wer so ein Bild sieht, will sofort wissen, wie der eigene Name aussieht. Genau so spricht sich diese Seite herum.</p>' +
      '<div class="nh-aktionen">' +
      (kannBildTeilen()
        ? '<button type="button" class="nh-knopf nh-knopf--voll" data-teilen-bild>Bild teilen</button>'
        : '') +
      '<button type="button" class="nh-knopf" data-bild>Bild speichern</button>' +
      '<button type="button" class="nh-knopf" data-link>Link kopieren</button>' +
      '</div>' +
      '<p class="nh-teilen-label">Oder direkt</p>' +
      '<div class="nh-aktionen">' +
      '<a class="nh-knopf nh-knopf--klein" href="' + wa + '" target="_blank" rel="noopener">WhatsApp</a>' +
      '<a class="nh-knopf nh-knopf--klein" href="' + tg + '" target="_blank" rel="noopener">Telegram</a>' +
      '<a class="nh-knopf nh-knopf--klein" href="' + fb + '" target="_blank" rel="noopener">Facebook</a>' +
      '</div>' +
      '<p class="nh-teilen-fuss">Für Instagram das Bild speichern und aus der App hochladen. ' +
      'Instagram lässt keine Bilder direkt von einer Internetseite durch.</p>' +
      '</div>';
  }

  // Dieselbe Schreibung in den anderen Sprachen, aber nur wenn sie sich
  // wirklich unterscheidet. Sonst ist die Liste nur Rauschen.
  function baueVergleich(name) {
    const alle = U.alleSprachen(name).filter((a) => a.schrift);
    const andere = alle.filter((a) => a.code !== sprache);
    const eigene = alle.filter((a) => a.code === sprache)[0];
    const abweichend = andere.filter((a) => !eigene || a.schrift !== eigene.schrift);

    if (!abweichend.length) {
      vergleich.innerHTML = '';
      return;
    }

    vergleich.innerHTML =
      '<h2>In anderen Sprachen klingt der Name anders</h2>' +
      '<ul class="nh-vergleich-liste">' +
      abweichend.map((a) => (
        '<li class="nh-vergleich-zeile">' +
        '<span class="nh-vergleich-sprache">' + escape(a.name) + '</span>' +
        '<span class="nh-vergleich-schrift" dir="rtl" lang="he">' + escape(a.schrift) + '</span>' +
        '</li>'
      )).join('') +
      '</ul>';
  }

  // ---------- Bild ----------
  // Quadratisch, damit es sich teilen laesst. Der Browser setzt den
  // hebraeischen Text von sich aus richtig, deshalb braucht das Bild keine
  // eigene Behandlung der Schreibrichtung.
  // Den getippten Namen sauber schreiben: erster Buchstabe gross, Rest klein,
  // auch hinter Bindestrich und Leerzeichen. Wer "TIMON" tippt, bekommt
  // "Timon", und "anna-lena" wird "Anna-Lena".
  function eigenname(roh) {
    return String(roh || '').trim().toLowerCase()
      .replace(/(^|[\s\-'])([\p{L}])/gu, function (_, vor, buchstabe) {
        return vor + buchstabe.toUpperCase();
      });
  }

  const BILD = 1080;
  const BILD_INNEN = 820;   // nutzbare Breite innerhalb des Rahmens
  const BILD_MAX = 340;     // damit ein kurzer Name nicht riesig wird

  function baueBild() {
    const e = U.schreibe(input.value, sprache);
    if (!e.schrift) return null;

    const c = document.createElement('canvas');
    c.width = BILD;
    c.height = BILD;
    const g = c.getContext('2d');

    g.fillStyle = '#0d1e35';
    g.fillRect(0, 0, BILD, BILD);

    g.strokeStyle = '#c8a962';
    g.lineWidth = 3;
    g.strokeRect(70, 70, BILD - 140, BILD - 140);

    g.textAlign = 'center';
    g.textBaseline = 'middle';

    // Einmal messen und daraus die Groesse rechnen, statt sie herunterzu-
    // zaehlen. So fuellt auch ein kurzer Name den Rahmen aus, und ein langer
    // passt in einem Schritt hinein.
    g.font = '100px "Frank Ruhl Libre", serif';
    const breite100 = g.measureText(e.schrift).width || 100;
    const schriftgroesse = Math.min(BILD_MAX, Math.floor(100 * BILD_INNEN / breite100));

    g.fillStyle = '#f0ebe0';
    g.font = schriftgroesse + 'px "Frank Ruhl Libre", serif';
    g.fillText(e.schrift, BILD / 2, BILD / 2 - 50);

    // Der lateinische Name gehoert zum hebraeischen und steht deshalb dicht
    // darunter, in derselben Farbe und in der Playfair der Ueberschriften.
    // Die Marke unten ist klein, gold und in Inter. Vorher waren beide in
    // gesperrten Inter-Grossbuchstaben und dadurch zu verwechseln.
    g.fillStyle = '#f0ebe0';
    g.font = '54px "Playfair Display", Georgia, serif';
    g.fillText(eigenname(input.value), BILD / 2,
               BILD / 2 + schriftgroesse / 2 + 30);

    // Unten die Marke, wie auf den Buchruecken: das goldene Schin, darunter
    // der Schriftzug. Keine Adresse.
    //
    // Gesetzt in Frank Ruhl Libre statt in Georgia wie auf dem Buchruecken.
    // Georgia hat keine hebraeischen Zeichen, das Schin faende dort je nach
    // Rechner eine andere Ersatzschrift, und im Bild sieht man das hinterher
    // nicht mehr.
    g.fillStyle = '#c8a962';
    g.font = '88px "Frank Ruhl Libre", Georgia, serif';
    g.fillText('ש', BILD / 2, BILD - 200);

    g.font = '21px "Inter", sans-serif';
    g.letterSpacing = '6px';
    g.fillText('SCHALOM ISRAEL', BILD / 2, BILD - 128);
    g.letterSpacing = '0px';

    return c;
  }

  // Auf die Schrift warten, bevor gezeichnet wird. Sonst landet bei einem
  // schnellen Klick eine Ersatzschrift im Bild, und das sieht man dem PNG
  // hinterher nicht mehr an.
  function schriftBereit() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load('340px "Frank Ruhl Libre"'),
      document.fonts.load('54px "Playfair Display"'),
      document.fonts.load('21px "Inter"'),
    ]).catch(function () {});
  }

  function ladeBildHerunter() {
    const c = baueBild();
    if (!c) return;
    const name = S.normalisiere(input.value) || 'name';
    c.toBlob(function (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name + '-hebraeisch.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }, 'image/png');
    if (window.umami) window.umami.track('name-hebraeisch-bild');
  }

  // Gibt das Bild als Blob zurueck, mit geladenen Schriften.
  function bildAlsBlob() {
    return schriftBereit().then(function () {
      const c = baueBild();
      if (!c) return null;
      return new Promise(function (fertig) {
        c.toBlob(function (blob) { fertig(blob); }, 'image/png');
      });
    });
  }

  function dateiname() {
    return (S.normalisiere(input.value) || 'name') + '-hebraeisch.png';
  }

  // Das Bild an die Apps des Geraets uebergeben.
  function teileBild(knopf) {
    bildAlsBlob().then(function (blob) {
      if (!blob) return;
      const datei = new File([blob], dateiname(), { type: 'image/png' });
      const e = U.schreibe(input.value, sprache);
      return navigator.share({
        files: [datei],
        text: teilText(e),
      }).then(function () {
        if (window.umami) window.umami.track('name-hebraeisch-geteilt');
      });
    }).catch(function () {
      // Der Nutzer hat das Teilen-Fenster weggeklickt. Kein Fehler.
    }).then(function () {
      if (knopf) knopf.disabled = false;
    });
  }

  function kopiereLink(knopf) {
    const e = U.schreibe(input.value, sprache);
    const text = teilText(e);
    const fertig = function () {
      knopf.textContent = 'Kopiert';
      setTimeout(function () { knopf.textContent = 'Link kopieren'; }, 2000);
      if (window.umami) window.umami.track('name-hebraeisch-link-kopiert');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(fertig, function () {});
      return;
    }
    const feld = document.createElement('textarea');
    feld.value = text;
    document.body.appendChild(feld);
    feld.select();
    try { document.execCommand('copy'); fertig(); } catch (err) { /* egal */ }
    document.body.removeChild(feld);
  }

  document.addEventListener('click', function (ev) {
    const bild = ev.target.closest('[data-bild]');
    if (bild) {
      bild.disabled = true;
      schriftBereit().then(function () {
        ladeBildHerunter();
        bild.disabled = false;
      });
      return;
    }
    const teilen = ev.target.closest('[data-teilen-bild]');
    if (teilen) {
      teilen.disabled = true;
      teileBild(teilen);
      return;
    }
    const link = ev.target.closest('[data-link]');
    if (link) kopiereLink(link);
  });

  // ---------- Beispieltabelle ----------
  // Wird gerechnet und nicht hingeschrieben, damit sie nicht veraltet, wenn
  // sich eine Regel aendert.
  function baueBeispiele() {
    const ziel = document.querySelector('[data-beispiele]');
    if (!ziel) return;
    const namen = ['Michael', 'Charles', 'Jordan', 'Juan', 'Giovanni'];
    const liste = S.liste();

    const kopf = '<tr><th>Name</th>' +
      liste.map((s) => '<th>' + escape(s.name) + '</th>').join('') + '</tr>';

    const zeilen = namen.map((n) => {
      const zellen = liste.map((s) => {
        const schrift = U.schreibe(n, s.code).schrift;
        return '<td class="nh-heb" dir="rtl" lang="he">' + escape(schrift || '–') + '</td>';
      }).join('');
      return '<tr><td>' + escape(n) + '</td>' + zellen + '</tr>';
    }).join('');

    ziel.innerHTML = '<table class="nh-tabelle"><thead>' + kopf +
      '</thead><tbody>' + zeilen + '</tbody></table>';
  }

  // ---------- Start ----------
  input.addEventListener('input', zeichne);
  input.closest('form').addEventListener('submit', function (e) {
    e.preventDefault();
    input.blur();
    zeichne();
  });

  baueSprachen();
  baueBeispiele();

  // Ein Name in der Adresse, damit Ergebnisse teilbar sind: ?name=Timon
  const ausAdresse = new URLSearchParams(window.location.search).get('name');
  if (ausAdresse) {
    input.value = ausAdresse.slice(0, 40);
    zeichne();
  }

  // Die Schrift muss geladen sein, bevor das Bild gezeichnet wird, sonst
  // nimmt das Canvas eine Ersatzschrift.
  if (document.fonts && document.fonts.load) {
    document.fonts.load('300px "Frank Ruhl Libre"');
  }
})();
