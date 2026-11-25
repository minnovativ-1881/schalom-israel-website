// =============================================
// SCHALOM ISRAEL - tora/lib/stelle.js
// Versteht Bibelstellen-Eingaben fuer die Or-Tora-Suche:
//   "5. Mose 6,4", "5 Mo 6,4", "Dtn 6:4", "Devarim 6,4", "Gen 1,1-5",
//   "Bereschit 32", "6,4" (im aktuellen Buch), "1. Mose" (Buch-Uebersicht)
// und findet Wochenlesungen nach Namen ("Wajischlach", "Vayishlach", "וישלח").
// Reine Funktionen ohne DOM. UMD: per <script> (window.ToraStelle) und per require().
// =============================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ToraStelle = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  // Die fuenf Buecher mit Kapitelzahl und allen gaengigen Schreibweisen.
  // Schreibweisen werden mit normBuch() verglichen (klein, ohne Leerzeichen/Punkte).
  const BUECHER = [
    { slug: 'bereschit', de: '1. Mose', name: 'Bereschit', kapitel: 50,
      namen: ['1mose', '1mo', '1mos', '1buchmose', 'erstesbuchmose', 'gen', 'genesis', 'gn',
        'bereschit', 'bereshit', 'bereshith', 'bereschith', 'beresit', 'ber', 'בראשית'] },
    { slug: 'schemot', de: '2. Mose', name: 'Schemot', kapitel: 40,
      namen: ['2mose', '2mo', '2mos', '2buchmose', 'zweitesbuchmose', 'ex', 'exo', 'exod', 'exodus',
        'schemot', 'shemot', 'schmot', 'shmot', 'schemoth', 'shemoth', 'שמות'] },
    { slug: 'wajikra', de: '3. Mose', name: 'Wajikra', kapitel: 27,
      namen: ['3mose', '3mo', '3mos', '3buchmose', 'drittesbuchmose', 'lev', 'levitikus', 'leviticus', 'lv',
        'wajikra', 'vayikra', 'wayikra', 'vajikra', 'ויקרא'] },
    { slug: 'bamidbar', de: '4. Mose', name: 'Bamidbar', kapitel: 36,
      namen: ['4mose', '4mo', '4mos', '4buchmose', 'viertesbuchmose', 'num', 'numeri', 'numbers', 'nu',
        'bamidbar', 'bemidbar', 'במדבר'] },
    { slug: 'devarim', de: '5. Mose', name: 'Devarim', kapitel: 34,
      namen: ['5mose', '5mo', '5mos', '5buchmose', 'fuenftesbuchmose', 'fünftesbuchmose', 'dtn', 'dt', 'deut',
        'deuteronomium', 'deuteronomy', 'devarim', 'dewarim', 'dvarim', 'dwarim', 'דברים'] },
  ];

  // Entfernt Vokalzeichen, Teamim und Satzzeichen aus hebraeischem Text
  // (U+0591 bis U+05C7), Buchstaben bleiben.
  function ohneZeichen(s) {
    return String(s).replace(/[֑-ׇ]/g, '');
  }

  // Entfernt nur die Teamim (Betonungszeichen U+0591 bis U+05AF), Vokale bleiben.
  function ohneTeamim(s) {
    return String(s).replace(/[֑-֯]/g, '');
  }

  function normBuch(s) {
    return ohneZeichen(String(s).toLowerCase()).replace(/[\s.'’`´\-]/g, '');
  }

  function buchVonName(s) {
    const n = normBuch(s);
    if (!n) return null;
    return BUECHER.find(b => b.namen.includes(n)) || null;
  }

  function buchVonSlug(slug) {
    return BUECHER.find(b => b.slug === slug) || null;
  }

  // Deutet eine Eingabe als Stelle oder Buch. Rueckgabe:
  //   { art: 'stelle', buch, kapitel, vers, bis }   buch = slug oder null (= aktuelles Buch)
  //   { art: 'buch', buch }
  //   { art: 'fehler', grund: 'kapitel', buch, kapitel, max }
  //   null, wenn die Eingabe keine Stelle ist (dann Wochenlesung oder Wort suchen)
  function deuteStelle(eingabe) {
    const s = String(eingabe || '').trim().replace(/[–—]/g, '-').replace(/\s+/g, ' ');
    if (!s) return null;

    const m = s.match(/^(.*?)\s*(\d+)(?:\s*[,:.]\s*(\d+)(?:\s*-\s*(\d+))?)?\s*$/);
    if (m) {
      const buchTeil = m[1].trim();
      let buch = null;
      if (buchTeil) {
        const b = buchVonName(buchTeil);
        if (!b) return null;
        buch = b.slug;
      }
      const kapitel = +m[2];
      const vers = m[3] ? +m[3] : null;
      let bis = m[4] ? +m[4] : null;
      if (bis !== null && vers !== null && bis <= vers) bis = null;
      if (buch) {
        const max = buchVonSlug(buch).kapitel;
        if (kapitel < 1 || kapitel > max) return { art: 'fehler', grund: 'kapitel', buch, kapitel, max };
      }
      if (vers === 0) return null;
      return { art: 'stelle', buch, kapitel, vers, bis };
    }

    const b = buchVonName(s);
    if (b) return { art: 'buch', buch: b.slug };
    return null;
  }

  // Ziel-URL fuer eine Stelle. Vers-Anker wie auf den Seiten: #v<kap>-<vers>,
  // ein Bereich haengt das Ende an: #v<kap>-<vers>-<bis>.
  function zielUrl(st) {
    if (st.art === 'buch') return `/tora/${st.buch}/`;
    let url = `/tora/${st.buch}/${st.kapitel}/`;
    if (st.vers) url += `#v${st.kapitel}-${st.vers}` + (st.bis ? `-${st.bis}` : '');
    return url;
  }

  // Liest den Vers-Anker aus location.hash: "#v32-4" oder "#v32-4-10".
  function deuteAnker(hash) {
    const m = String(hash || '').match(/^#v(\d+)-(\d+)(?:-(\d+))?$/);
    if (!m) return null;
    return { kapitel: +m[1], vers: +m[2], bis: m[3] ? +m[3] : null };
  }

  // Lautschrift-Vergleich fuer Wochenlesungs-Namen: Wajischlach = Vayishlach,
  // Miketz = Mikez, Lech-Lecha = Lech Lecha.
  function lautSchluessel(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z]/g, '')
      .replace(/sch|sh/g, 's').replace(/tz|ts/g, 'z').replace(/ch|kh/g, 'h')
      .replace(/w/g, 'v').replace(/j/g, 'y').replace(/ei/g, 'e')
      .replace(/(.)\1+/g, '$1');
  }

  // Sucht eine Wochenlesung im Paraschah-Verzeichnis (tora/daten/index.json).
  // Rueckgabe { art: 'stelle', buch, kapitel, vers, bis: null, paraschah } oder null.
  function findeParascha(eingabe, liste) {
    const roh = String(eingabe || '').trim();
    if (!roh || !Array.isArray(liste)) return null;
    const istHebr = /[א-ת]/.test(roh);
    const key = istHebr ? ohneZeichen(roh).replace(/[\s\-־]/g, '') : lautSchluessel(roh);
    if (key.length < 2) return null;
    const schluessel = p => istHebr
      ? ohneZeichen(p.he || '').replace(/[\s\-־]/g, '')
      : lautSchluessel(p.de || '');

    let treffer = liste.filter(p => schluessel(p) === key);
    if (!treffer.length && key.length >= 4) {
      treffer = liste.filter(p => schluessel(p).startsWith(key));
      if (treffer.length !== 1) return null;
    }
    if (!treffer.length) return null;
    const p = treffer[0];
    const m = String(p.bereich || '').match(/^(\d\.\s*Mose)\s+(\d+),(\d+)/);
    if (!m) return null;
    const b = buchVonName(m[1]);
    if (!b) return null;
    return { art: 'stelle', buch: b.slug, kapitel: +m[2], vers: +m[3], bis: null, paraschah: p.de };
  }

  return { BUECHER, ohneZeichen, ohneTeamim, normBuch, buchVonName, buchVonSlug,
    deuteStelle, zielUrl, deuteAnker, lautSchluessel, findeParascha };
});
