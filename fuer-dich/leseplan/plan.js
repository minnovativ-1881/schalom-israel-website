// =============================================
// SCHALOM ISRAEL - Leseplan: der Tanach in einem Jahr
//
// Rechnet aus den Hebcal-Lesungen eines Lesejahres den Tagesplan:
//   - Tora: jeden Tag eine Aliyah der kommenden Schabbat-Lesung
//     (Sonntag die erste, Schabbat die siebte), so wie die Wochenlesung in
//     der Synagoge. Fällt ein Fest auf den Schabbat, ist es dessen Lesung.
//     Wesot ha-Beracha wird nie an einem Schabbat gelesen; sie füllt die
//     letzten Tage bis Simchat Tora, mit dem das Lesejahr endet.
//   - Propheten und Schriften: fortlaufend in der Ordnung der hebräischen
//     Bibel, nach Versen gleichmäßig auf die Tage verteilt, immer ganze
//     Kapitel. Die fünf Rollen liegen an ihrem Fest (Ester an Purim usw.).
//   - Am Schabbat zusätzlich die Haftara.
//
// Das Lesejahr läuft vom Tag nach Simchat Tora bis zum nächsten Simchat Tora
// (Diaspora: 23. Tischri). Weil es am jüdischen Kalender hängt, gilt der
// Plan für jedes Jahr. Keine KI, nur Rechnung.
//
// Rein und ohne Seiteneffekte. UMD: Browser per <script>, node per require().
// =============================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./tanach-buecher.js'), require('../../parascha-daten.js'));
  } else {
    root.Leseplan = factory(root.TanachBuecher, root.ParaschaDaten);
  }
})(typeof self !== 'undefined' ? self : this, function (TanachBuecher, ParaschaDaten) {

  const BUECHER = TanachBuecher.BUECHER;
  const buch = TanachBuecher.buch;

  const ALIYAH = ['Rischon', 'Scheni', 'Schlischi', 'Rewii', 'Chamischi', 'Schischi', 'Schewii'];
  const WOCHENTAG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Schabbat'];
  const WOCHENTAG_KURZ = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Schabbat'];

  // ---------- Datum ----------

  function datum(iso) {
    return new Date(iso + 'T12:00:00Z');
  }

  function iso(d) {
    return d.toISOString().slice(0, 10);
  }

  function plusTage(isoDatum, n) {
    const d = datum(isoDatum);
    d.setUTCDate(d.getUTCDate() + n);
    return iso(d);
  }

  function wochentag(isoDatum) {
    return datum(isoDatum).getUTCDay(); // 0 = Sonntag, 6 = Schabbat
  }

  function tageZwischen(a, b) {
    return Math.round((datum(b) - datum(a)) / 86400000);
  }

  const HEBR_TEILE = new Intl.DateTimeFormat('en-u-ca-hebrew',
    { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const HEBR_DE = new Intl.DateTimeFormat('de-DE-u-ca-hebrew',
    { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

  function hebrTeile(isoDatum) {
    const t = {};
    HEBR_TEILE.formatToParts(datum(isoDatum)).forEach(function (p) { t[p.type] = p.value; });
    return { tag: Number(t.day), monat: t.month, jahr: Number(t.year) };
  }

  // "14. Kislew 5787" (ICU hängt "AM" an, das braucht hier niemand)
  function hebraeischesDatum(isoDatum) {
    // Schreibweise der Monate wie auf /entdecken/feste/
    return HEBR_DE.format(datum(isoDatum)).replace(/\s*AM$/, '')
      .replace('Tevet', 'Tewet').replace('Schevat', 'Schwat');
  }

  // Simchat Tora in der Diaspora: 23. Tischri. Liegt immer zwischen
  // Ende September und Ende Oktober des passenden gregorianischen Jahres.
  function simchatTora(hebrJahr) {
    const gJahr = hebrJahr - 3761;
    let d = gJahr + '-09-15';
    for (let i = 0; i < 60; i++) {
      const t = hebrTeile(d);
      if (t.jahr === hebrJahr && t.monat === 'Tishri' && t.tag === 23) return d;
      d = plusTage(d, 1);
    }
    throw new Error('Simchat Tora nicht gefunden für ' + hebrJahr);
  }

  // Das Lesejahr, in dem ein Datum liegt. "Lesejahr 5787" beginnt am Tag
  // nach Simchat Tora 5787 und endet mit Simchat Tora 5788.
  function lesejahrFuer(isoDatum) {
    const h = hebrTeile(isoDatum).jahr;
    const st = simchatTora(h);
    const jahr = isoDatum > st ? h : h - 1;
    return lesejahr(jahr);
  }

  function lesejahr(jahr) {
    const start = plusTage(simchatTora(jahr), 1);
    const ende = simchatTora(jahr + 1);
    return { jahr: jahr, start: start, ende: ende, tage: tageZwischen(start, ende) + 1 };
  }

  // Hebcal liefert pro Abfrage nur etwa ein halbes Jahr. Das Lesejahr wird
  // deshalb in Stücke von höchstens 170 Tagen geteilt.
  function abfrageStuecke(start, ende) {
    const aus = [];
    let von = start;
    while (von <= ende) {
      let bis = plusTage(von, 169);
      if (bis > ende) bis = ende;
      aus.push([von, bis]);
      von = plusTage(bis, 1);
    }
    return aus;
  }

  // ---------- Stellen ----------

  function kv(s) {
    const p = String(s).split(':');
    return { kap: Number(p[0]), vers: Number(p[1]) };
  }

  // "32:4" bis "32:13" -> "32,4–13"; "32:31" bis "33:5" -> "32,31–33,5"
  function versbereich(b, e) {
    const x = kv(b), y = kv(e);
    if (x.kap === y.kap) {
      return x.vers === y.vers ? x.kap + ',' + x.vers : x.kap + ',' + x.vers + '–' + y.vers;
    }
    return x.kap + ',' + x.vers + '–' + y.kap + ',' + y.vers;
  }

  function buchName(en) {
    const b = buch(en);
    return b ? b.de : en;
  }

  // Teile {k,b,e} zu einer deutschen Stellenangabe. Aufeinanderfolgende Teile
  // desselben Buches werden zu einem Bereich zusammengezogen.
  function stelle(teile) {
    const gruppen = [];
    teile.forEach(function (t) {
      const letzte = gruppen[gruppen.length - 1];
      if (letzte && letzte.k === t.k) letzte.e = t.e;
      else gruppen.push({ k: t.k, b: t.b, e: t.e });
    });
    return gruppen.map(function (g) { return buchName(g.k) + ' ' + versbereich(g.b, g.e); }).join('; ');
  }

  function verseIn(teil) {
    const b = buch(teil.k);
    if (!b) return 0;
    const x = kv(teil.b), y = kv(teil.e);
    if (x.kap === y.kap) return y.vers - x.vers + 1;
    let n = b.kapitel[x.kap - 1] - x.vers + 1;
    for (let k = x.kap + 1; k < y.kap; k++) n += b.kapitel[k - 1];
    return n + y.vers;
  }

  // Adresse in Or Tora, mit Sprung an den ersten Vers
  function oraToraLink(teil) {
    const b = buch(teil.k);
    if (!b || !b.slug) return null;
    const x = kv(teil.b);
    return '/tora/' + b.slug + '/' + x.kap + '/#v' + x.kap + '-' + x.vers;
  }

  function endetBuch(teil) {
    const b = buch(teil.k);
    if (!b) return false;
    const y = kv(teil.e);
    return y.kap === b.kapitel.length && y.vers === b.kapitel[b.kapitel.length - 1];
  }

  // ---------- Namen ----------

  const FESTE = [
    [/^Erev /, null],
    [/^Rosh Hashana/, 'Rosch HaSchana'],
    [/^Yom Kippur/, 'Jom Kippur'],
    [/^Sukkot/, 'Sukkot'],
    [/^Shmini Atzeret/, 'Schmini Azeret'],
    [/^Simchat Torah/, 'Simchat Tora'],
    [/^Chanukah/, 'Chanukka'],
    [/^Purim Katan/, null],
    [/^Shushan Purim/, 'Schuschan Purim'],
    [/^Purim/, 'Purim'],
    [/^Pesach/, 'Pessach'],
    [/^Shavuot/, 'Schawuot'],
    [/^Tish'a B'Av/, 'Tischa BeAw'],
    [/^Rosh Chodesh/, 'Rosch Chodesch'],
    [/^Tzom Gedaliah/, 'Zom Gedalja'],
    [/^Asara B'Tevet/, 'Assara BeTewet'],
    [/^Ta'anit Esther/, 'Taanit Ester'],
    [/^Tzom Tammuz|^Shiva Asar B'Tamuz|^Tzom Tamuz/, 'Zom Tammus'],
  ];

  function festName(en) {
    for (let i = 0; i < FESTE.length; i++) {
      if (FESTE[i][0].test(en)) return FESTE[i][1];
    }
    return null;
  }

  function paraschaName(en) {
    const treffer = ParaschaDaten.lookupParasha(en);
    if (treffer && treffer.length) {
      return {
        de: treffer.map(function (t) { return t.de; }).join('-'),
        he: treffer.map(function (t) { return t.he; }).join(' ־ '),
        eintraege: treffer,
      };
    }
    return { de: en, he: '', eintraege: [] };
  }

  // ---------- Tora ----------

  function nachDatum(items) {
    const m = {};
    items.forEach(function (it) {
      (m[it.date] = m[it.date] || []).push(it);
    });
    return m;
  }

  // Die Lesung eines Schabbats mit ihren sieben Aliyot.
  function schabbatLesung(liste) {
    const mitSieben = (liste || []).filter(function (it) { return it.fullkriyah && it.fullkriyah['7']; });
    if (!mitSieben.length) return null;
    const p = mitSieben.find(function (it) { return it.parshaNum; }) || mitSieben[0];
    const aliyot = [];
    for (let n = 1; n <= 7; n++) aliyot.push({ n: n, teil: p.fullkriyah[String(n)] });
    let name;
    if (p.parshaNum) {
      const pn = paraschaName(p.name.en);
      name = { art: 'parascha', de: pn.de, he: pn.he, eintraege: pn.eintraege };
    } else {
      name = { art: 'fest', de: 'Festlesung ' + (festName(p.name.en) || p.name.en), he: '', eintraege: [] };
    }
    return { item: p, aliyot: aliyot, name: name };
  }

  // Verteilt n Aliyot auf k Tage. Volle Woche: Tag i bekommt Aliyah i.
  function verteile(aliyot, k) {
    const n = aliyot.length;
    const aus = [];
    for (let j = 0; j < k; j++) {
      if (k > n) {
        aus.push([aliyot[Math.floor(j * n / k)]]);
      } else {
        aus.push(aliyot.slice(Math.floor(j * n / k), Math.floor((j + 1) * n / k)));
      }
    }
    return aus;
  }

  function toraTag(aliyotDesTages, name, schabbat) {
    const teile = aliyotDesTages.map(function (a) { return a.teil; });
    const nummern = aliyotDesTages.map(function (a) { return a.n; });
    let abschnitt;
    if (nummern.length === 1) abschnitt = ALIYAH[nummern[0] - 1] + ' (' + nummern[0] + '. Abschnitt)';
    else abschnitt = 'Abschnitte ' + nummern[0] + ' bis ' + nummern[nummern.length - 1];
    if (name.art === 'wesot') {
      abschnitt = nummern.length === 1 ? nummern[0] + '. Abschnitt' : abschnitt;
    }
    const verse = teile.reduce(function (s, t) { return s + verseIn(t); }, 0);
    // Ein Buch der Tora endet nur in der regulären Wochenlesung oder in
    // Wesot ha-Beracha, nie in einer Festlesung.
    const enden = name.art === 'fest' ? [] : teile.filter(endetBuch).map(function (t) { return buchName(t.k); });
    return {
      art: name.art,
      name: name.de,
      nameHe: name.he,
      eintraege: name.eintraege,
      abschnitt: abschnitt,
      aliyot: nummern,
      teile: teile,
      stelle: stelle(teile),
      link: oraToraLink(teile[0]),
      verse: verse,
      schabbat: schabbat,
      buchEnden: enden,
    };
  }

  // ---------- Propheten und Schriften ----------

  function rollenTage(items, start, ende) {
    const tage = {};
    const gesehen = {};
    items.forEach(function (it) {
      if (!it.megillah || /^Erev /.test(it.name.en)) return;
      if (it.date < start || it.date > ende) return;
      const erster = it.megillah['1'] || it.megillah[Object.keys(it.megillah)[0]];
      const b = erster && buch(erster.k);
      if (!b || gesehen[b.en] || tage[it.date]) return;
      gesehen[b.en] = true;
      tage[it.date] = { buch: b, fest: festName(it.name.en) || it.name.en };
    });
    return tage;
  }

  // Abschnitte {buch, von, bis} zu "Josua 1–2; Richter 1"
  function nkStelle(abschnitte) {
    return abschnitte.map(function (a) {
      const ganzes = a.von === 1 && a.bis === a.buch.kapitel.length;
      const name = a.buch.en === 'Psalms' ? 'Psalm' : a.buch.de;
      if (ganzes) return a.buch.de + ' (ganzes Buch)';
      if (a.von === a.bis) return name + ' ' + a.von;
      return name + ' ' + a.von + '–' + a.bis;
    }).join('; ');
  }

  function verteileKapitel(kapitel, tage) {
    const gesamt = kapitel.reduce(function (s, k) { return s + k.verse; }, 0);
    const n = tage;
    const aus = [];
    let idx = 0;
    let summe = 0;
    for (let i = 0; i < n; i++) {
      if (i === n - 1) {
        aus.push(kapitel.slice(idx));
        break;
      }
      const ziel = (i + 1) * gesamt / n;
      const grenze = kapitel.length - (n - i - 1); // jeder Folgetag braucht noch ein Kapitel
      let ende = idx + 1;
      let s = summe + kapitel[idx].verse;
      while (ende < grenze && Math.abs(s + kapitel[ende].verse - ziel) < Math.abs(s - ziel)) {
        s += kapitel[ende].verse;
        ende++;
      }
      aus.push(kapitel.slice(idx, ende));
      idx = ende;
      summe = s;
    }
    return aus;
  }

  function abschnitteAus(kapitelListe) {
    const aus = [];
    kapitelListe.forEach(function (k) {
      const letzte = aus[aus.length - 1];
      if (letzte && letzte.buch === k.buch && letzte.bis === k.kap - 1) letzte.bis = k.kap;
      else aus.push({ buch: k.buch, von: k.kap, bis: k.kap });
    });
    return aus;
  }

  // ---------- Haftara ----------

  function haftara(item) {
    if (!item || !item.haft) return null;
    const teile = Array.isArray(item.haft) ? item.haft : [item.haft];
    const ok = teile.filter(function (t) { return t && t.k && t.b && t.e; });
    if (!ok.length) return null;
    return stelle(ok);
  }

  // ---------- Der Plan ----------

  function baueLeseplan(items, lj) {
    const nd = nachDatum(items);
    const tage = [];
    for (let i = 0; i < lj.tage; i++) tage.push(plusTage(lj.start, i));

    // Tora
    const tora = {};
    const schabbatot = tage.filter(function (t) { return wochentag(t) === 6; });
    schabbatot.forEach(function (s) {
      const lesung = schabbatLesung(nd[s]);
      if (!lesung) throw new Error('Keine Schabbat-Lesung für ' + s);
      const woche = [];
      for (let i = 6; i >= 0; i--) {
        const t = plusTage(s, -i);
        if (t >= lj.start) woche.push(t);
      }
      const proTag = verteile(lesung.aliyot, woche.length);
      woche.forEach(function (t, j) {
        tora[t] = toraTag(proTag[j], lesung.name, s);
        tora[t].haftara = null;
      });
      tora[s].haftara = haftara(lesung.item);
    });

    // Die letzten Tage nach dem letzten Schabbat: Wesot ha-Beracha
    const letzterSchabbat = schabbatot[schabbatot.length - 1];
    const rest = tage.filter(function (t) { return t > letzterSchabbat; });
    if (rest.length) {
      const st = (nd[lj.ende] || []).find(function (it) { return /^Simchat Torah/.test(it.name.en) && it.fullkriyah; });
      let aliyot = [];
      if (st) {
        Object.keys(st.fullkriyah).forEach(function (n) {
          const t = st.fullkriyah[n];
          if (/^\d$/.test(n) && t.k === 'Deuteronomy') aliyot.push({ n: Number(n), teil: t });
        });
      }
      if (!aliyot.length) aliyot = [{ n: 1, teil: { k: 'Deuteronomy', b: '33:1', e: '34:12' } }];
      const name = { art: 'wesot', de: 'Wesot ha-Beracha', he: 'וְזֹאת הַבְּרָכָה', eintraege: [] };
      const proTag = verteile(aliyot, rest.length);
      rest.forEach(function (t, j) { tora[t] = toraTag(proTag[j], name, null); tora[t].haftara = null; });
    }

    // Propheten und Schriften
    const rollen = rollenTage(items, lj.start, lj.ende);
    const rollenBuecher = {};
    Object.keys(rollen).forEach(function (d) { rollenBuecher[rollen[d].buch.en] = true; });
    const kapitel = [];
    BUECHER.forEach(function (b) {
      if (b.teil === 'tora' || rollenBuecher[b.en]) return;
      b.kapitel.forEach(function (v, i) { kapitel.push({ buch: b, kap: i + 1, verse: v }); });
    });
    const leseTage = tage.filter(function (t) { return !rollen[t]; });
    const verteilt = verteileKapitel(kapitel, leseTage.length);
    const nk = {};
    leseTage.forEach(function (t, i) {
      const abschnitte = abschnitteAus(verteilt[i]);
      nk[t] = {
        art: 'fortlaufend',
        abschnitte: abschnitte,
        stelle: nkStelle(abschnitte),
        verse: verteilt[i].reduce(function (s, k) { return s + k.verse; }, 0),
        buchEnden: abschnitte.filter(function (a) { return a.bis === a.buch.kapitel.length; })
          .map(function (a) { return a.buch.de; }),
      };
    });
    Object.keys(rollen).forEach(function (t) {
      const r = rollen[t];
      nk[t] = {
        art: 'rolle',
        fest: r.fest,
        abschnitte: [{ buch: r.buch, von: 1, bis: r.buch.kapitel.length }],
        stelle: r.buch.de + ' (ganzes Buch)',
        verse: r.buch.kapitel.reduce(function (s, v) { return s + v; }, 0),
        buchEnden: [r.buch.de],
      };
    });

    return tage.map(function (t, i) {
      const feste = [];
      (nd[t] || []).forEach(function (it) {
        if (it.type !== 'holiday') return;
        const f = festName(it.name.en);
        if (f && feste.indexOf(f) < 0) feste.push(f);
      });
      const tr = tora[t];
      const abschluesse = [];
      tr.buchEnden.forEach(function (b) { abschluesse.push({ teil: 'tora', buch: b }); });
      nk[t].buchEnden.forEach(function (b) { abschluesse.push({ teil: 'nk', buch: b }); });
      if (i === tage.length - 1) abschluesse.push({ teil: 'jahr', buch: 'Tanach' });
      return {
        datum: t,
        nr: i + 1,
        wochentag: wochentag(t),
        hebr: hebraeischesDatum(t),
        tora: tr,
        nk: nk[t],
        haftara: tr.haftara,
        feste: feste,
        abschluesse: abschluesse,
      };
    });
  }

  return {
    ALIYAH: ALIYAH,
    WOCHENTAG: WOCHENTAG,
    WOCHENTAG_KURZ: WOCHENTAG_KURZ,
    plusTage: plusTage,
    wochentag: wochentag,
    tageZwischen: tageZwischen,
    hebraeischesDatum: hebraeischesDatum,
    simchatTora: simchatTora,
    lesejahr: lesejahr,
    lesejahrFuer: lesejahrFuer,
    abfrageStuecke: abfrageStuecke,
    versbereich: versbereich,
    stelle: stelle,
    verseIn: verseIn,
    verteile: verteile,
    verteileKapitel: verteileKapitel,
    baueLeseplan: baueLeseplan,
  };
});
