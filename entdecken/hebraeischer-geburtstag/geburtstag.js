// =============================================
// SCHALOM ISRAEL - Hebraeischer Geburtstag
//
// Alles Kalendarische kommt deterministisch von Hebcal. Gemini rechnet NICHTS,
// es schreibt nur den Impuls zum fertig ermittelten Abschnitt.
//
// Braucht: /parascha-daten.js und /entdecken/aliyah.js
// =============================================
(function () {
  var PD = window.ParaschaDaten;
  var AL = window.Aliyah;
  var esc = window.EntdeckenTool.escape;

  var HEB_MONATE_DE = {
    Nisan: 'Nissan', Iyyar: 'Ijar', Sivan: 'Siwan', Tamuz: 'Tammus',
    Av: 'Aw', Elul: 'Elul', Tishrei: 'Tischri', Cheshvan: 'Cheschwan',
    Kislev: 'Kislew', Tevet: 'Tewet', Shvat: 'Schwat', Adar: 'Adar',
    'Adar I': 'Adar I', 'Adar II': 'Adar II', Adar1: 'Adar I', Adar2: 'Adar II',
  };

  function monatDe(hm) {
    return HEB_MONATE_DE[hm] || hm;
  }

  async function holeJson(url, was) {
    var res = await fetch(url);
    if (!res.ok) throw new Error(was + ' konnte nicht geladen werden.');
    return res.json();
  }

  // Gregorianisch -> hebraeisch
  function konvertiere(isoDatum) {
    var t = isoDatum.split('-');
    var url = 'https://www.hebcal.com/converter?cfg=json&gy=' + Number(t[0]) +
      '&gm=' + Number(t[1]) + '&gd=' + Number(t[2]) + '&g2h=1&strict=1';
    return holeJson(url, 'Das hebräische Datum');
  }

  // Hebraeisch -> gregorianisch. Fuer den naechsten Geburtstag.
  function zurueck(hy, hm, hd) {
    var url = 'https://www.hebcal.com/converter?cfg=json&hy=' + hy +
      '&hm=' + encodeURIComponent(hm) + '&hd=' + hd + '&h2g=1&strict=1';
    return holeJson(url, 'Der nächste Geburtstag');
  }

  // Die Lesungen ab dem Schabbat der Geburtswoche.
  // Faellt auf diesen Schabbat ein Fest, gibt es keine regulaere Wochenlesung.
  // Dann suchen wir die naechste und sagen das offen.
  async function holeLesung(schabbatIso) {
    var ende = new Date(schabbatIso + 'T12:00:00Z');
    ende.setUTCDate(ende.getUTCDate() + 21);
    var url = 'https://www.hebcal.com/leyning?cfg=json&start=' + schabbatIso +
      '&end=' + ende.toISOString().slice(0, 10) + '&triennial=off';
    var daten = await holeJson(url, 'Die Wochenlesung');

    var schabbatot = (daten.items || []).filter(function (i) {
      return i.type === 'shabbat' && i.parshaNum && i.fullkriyah;
    });
    if (!schabbatot.length) throw new Error('Zu diesem Datum wurde keine Wochenlesung gefunden.');

    return {
      item: schabbatot[0],
      verschoben: schabbatot[0].date !== schabbatIso,
    };
  }

  // Setzt "Leviticus 25:29-25:38" aus einem fullkriyah-Eintrag zusammen.
  function stelleAus(k) {
    return k.k + ' ' + k.b + '-' + k.e;
  }

  async function naechsterGeburtstag(heute, hm, hd) {
    // Erst das laufende hebraeische Jahr probieren, sonst das naechste.
    for (var i = 0; i < 3; i++) {
      var jahr = heute.hy + i;
      try {
        var r = await zurueck(jahr, hm, hd);
        var d = new Date(r.gy + '-' + String(r.gm).padStart(2, '0') + '-' + String(r.gd).padStart(2, '0') + 'T12:00:00Z');
        if (d.getTime() >= Date.now() - 86400000) return r;
      } catch (e) {
        // Adar II gibt es nur im Schaltjahr. Dann das naechste Jahr probieren.
      }
    }
    return null;
  }

  function formatGreg(r) {
    var monate = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
    return r.gd + '. ' + monate[r.gm - 1] + ' ' + r.gy;
  }

  // ---------- Berechnung ----------
  async function berechne(isoDatum, nachSonnenuntergang) {
    var wirksam = AL.wirksamesDatum(isoDatum, nachSonnenuntergang);
    var alsDate = new Date(wirksam + 'T12:00:00Z');

    var heb = await konvertiere(wirksam);
    var schabbat = AL.naechsterSchabbat(alsDate);
    var lesung = await holeLesung(schabbat);
    var nummer = AL.aliyahNummer(alsDate);
    var kriyah = lesung.item.fullkriyah[String(nummer)];
    if (!kriyah) throw new Error('Der Abschnitt zu diesem Wochentag wurde nicht gefunden.');

    var eintraege = PD.lookupParasha(lesung.item.name.en);
    var heute = await konvertiere(new Date().toISOString().slice(0, 10));
    var naechster = await naechsterGeburtstag(heute, heb.hm, heb.hd);

    return {
      wirksam: wirksam,
      verschobenDurchSonnenuntergang: wirksam !== isoDatum,
      heb: heb,
      lesung: lesung,
      nummer: nummer,
      aliyahName: AL.ALIYAH_NAMEN[nummer],
      stelleEn: stelleAus(kriyah),
      stelleDe: PD.germanizeReference(stelleAus(kriyah)),
      eintraege: eintraege,
      naechster: naechster,
      // Fertig formatiert, damit das Blatt nicht noch einmal rechnen muss.
      datumDeutsch: heb.hd + '. ' + monatDe(heb.hm) + ' ' + heb.hy,
      naechsterText: naechster
        ? 'Nächster hebräischer Geburtstag: ' + formatGreg(naechster)
        : '',
    };
  }

  // ---------- Darstellung ----------
  function renderKopf(e) {
    var namenDe = e.eintraege.length
      ? e.eintraege.map(function (x) { return x.de; }).join(' · ')
      : e.lesung.item.name.en;
    var bedeutung = e.eintraege.length
      ? e.eintraege.map(function (x) { return '„' + x.meaning + '"'; }).join(' · ')
      : '';

    var hinweise = [];
    if (e.verschobenDurchSonnenuntergang) {
      hinweise.push('Weil du nach Sonnenuntergang geboren wurdest, zählt im hebräischen Kalender bereits der Folgetag.');
    }
    if (e.lesung.verschoben) {
      hinweise.push('Auf den Schabbat deiner Geburtswoche fiel ein Fest, deshalb gab es dort keine reguläre Wochenlesung. Dies ist die nächstfolgende.');
    }

    return '<div class="geb-kopf">'
      + '<div class="geb-datum">' + esc(e.heb.hd + '. ' + monatDe(e.heb.hm) + ' ' + e.heb.hy) + '</div>'
      + '<div class="geb-datum-he">' + esc(e.heb.hebrew || '') + '</div>'
      + '<p class="geb-zeile"><strong>' + esc(namenDe) + '</strong>'
      + (bedeutung ? ' ' + esc(bedeutung) : '') + '</p>'
      + (e.naechster
          ? '<p class="geb-zeile">Dein nächster hebräischer Geburtstag: <strong>' + esc(formatGreg(e.naechster)) + '</strong></p>'
          : '')
      + '<div class="geb-aliyah">'
      + '<div class="geb-aliyah-label">Dein Abschnitt · ' + esc(PD.formatDate(e.wirksam)) + '</div>'
      + '<div class="geb-aliyah-wert">' + esc(e.aliyahName) + ', der ' + e.nummer + '. Abschnitt</div>'
      + '<div class="geb-aliyah-stelle">' + esc(e.stelleDe) + '</div>'
      + '</div>'
      + hinweise.map(function (h) { return '<p class="tool-hinweis">' + esc(h) + '</p>'; }).join('')
      + '</div>';
  }

  function renderArtikel(artikel) {
    if (!artikel.length) {
      return '<div class="tool-artikel">'
        + '<p class="tool-artikel-titel">Beiträge zu dieser Parascha</p>'
        + '<p class="tool-hinweis">Zu dieser Parascha gibt es noch keinen Beitrag. '
        + 'Die <a href="/parascha">Paraschah-Übersicht</a> zeigt dir, was gerade dran ist.</p>'
        + '</div>';
    }
    return '<div class="tool-artikel">'
      + '<p class="tool-artikel-titel">Beiträge zu dieser Parascha</p>'
      + '<div class="tool-artikel-liste">'
      + artikel.map(function (a) {
          return '<a class="tool-artikel-link" href="' + esc(a.href) + '">' + esc(a.title) + '</a>';
        }).join('')
      + '</div></div>';
  }

  // Passender Band der Buchreihe, falls zu diesem Buch schon einer erschienen
  // ist. Bamidbar und Devarim decken zusammen 21 der 54 Paraschot ab, also
  // knapp vierzig Prozent aller Geburtstage.
  //
  // Bewusst zurueckhaltend: Der Leser hat gerade etwas Persoenliches erfahren,
  // ein Verkaufsblock waere hier fehl am Platz. Deshalb ein Hinweis, der auf
  // die Parascha bezogen ist, und kein Preis.
  function renderBuch(e) {
    var buch = PD.buchFuerStelle(e.lesung.item.summary);
    if (!buch) return '';

    var parascha = e.eintraege.length
      ? e.eintraege.map(function (x) { return x.de; }).join(' und ')
      : e.lesung.item.name.en;

    return '<div class="geb-buch">'
      + '<a class="geb-buch-cover-link" href="/buecher/' + esc(buch.slug) + '/">'
      + '<img class="geb-buch-cover" src="/buecher/' + esc(buch.slug) + '/cover.jpg" '
      + 'alt="Buchcover ' + esc(buch.name) + ', Das Tora-Jahr Band ' + esc(buch.band) + '" loading="lazy">'
      + '</a>'
      + '<div class="geb-buch-text">'
      + '<p class="geb-buch-eyebrow">Das Tora-Jahr · Band ' + esc(buch.band) + '</p>'
      + '<p class="geb-buch-satz">Deine Paraschah <strong>' + esc(parascha) + '</strong> ist in '
      + esc(buch.name) + ' ausführlich ausgelegt, zusammen mit allen ' + esc(buch.anzahl)
      + ' Wochenlesungen dieses Buches.</p>'
      + '<p class="geb-buch-cta"><a class="geb-buch-btn" href="/buecher/' + esc(buch.slug) + '/" '
      + 'data-umami-event="entdecken-geburtstag-buch">Zum Band ' + esc(buch.band) + '</a></p>'
      + '</div></div>';
  }

  // Faellt der Geburtstag selbst auf ein Fest, gibt es dazu eine eigene
  // Tageslesung. Die holen wir separat: holeLesung schaut nur ab dem
  // kommenden Schabbat, das Fest kann aber ein Wochentag davor sein.
  async function festFuerTag(wirksamIso) {
    if (!window.Feste) return null;
    var url = 'https://www.hebcal.com/leyning?cfg=json&start=' + wirksamIso +
      '&end=' + wirksamIso + '&triennial=off';
    try {
      var daten = await holeJson(url, 'Die Festlesung');
      var eintrag = (daten.items || []).find(function (i) {
        return i.fullkriyah && !i.parshaNum && i.name && i.name.en;
      });
      if (!eintrag) return null;
      var fk = window.Feste.festKey(eintrag.name.en);
      if (!fk) return null;
      var prim = (eintrag.summary || '').split(';')[0].trim();
      return { key: fk.key, label: fk.label, stelleDe: PD.germanizeReference(prim) || prim };
    } catch (e) {
      return null; // Der Zusatz ist Beiwerk. Ohne ihn steht das Ergebnis trotzdem.
    }
  }

  window.Geburtstag = {
    berechne: berechne,
    renderKopf: renderKopf,
    renderArtikel: renderArtikel,
    renderBuch: renderBuch,
    festFuerTag: festFuerTag,
  };
})();
