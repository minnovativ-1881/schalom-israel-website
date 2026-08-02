(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { factory().initBrowser(); }
})(typeof self !== 'undefined' ? self : this, function () {

  function gruppenIndex(tokens) {
    const idx = {};
    tokens.forEach((t, i) => { (idx[t.g] = idx[t.g] || []).push(i); });
    return idx;
  }

  function initBrowser() {
    if (typeof document === 'undefined') return;
    const groups = {};
    document.querySelectorAll('.tok[data-g]').forEach(el => {
      const g = el.dataset.g; (groups[g] = groups[g] || []).push(el);
      if (el.classList.contains('particle')) return;
      el.addEventListener('mouseenter', () => groups[g].forEach(x => x.classList.add('hl')));
      el.addEventListener('mouseleave', () => groups[g].forEach(x => { if (!x.classList.contains('pin')) x.classList.remove('hl'); }));
      el.addEventListener('click', () => {
        const on = el.classList.contains('pin');
        document.querySelectorAll('.tok.pin').forEach(x => x.classList.remove('pin', 'hl'));
        if (!on) groups[g].forEach(x => x.classList.add('pin'));
      });
    });
    const reader = document.getElementById('reader');
    const seg = document.getElementById('seg');
    if (seg) seg.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      seg.querySelectorAll('button').forEach(x => x.classList.remove('on'));
      b.classList.add('on'); reader.className = 'reader mode-' + b.dataset.mode + ' ' + aktuelleGroesse(reader);
    });
    initSuche();
    initParaStreifen();
    initTextgroesse();
  }

  // Liest die aktuell am Reader gesetzte size-* Klasse aus (Default "size-s").
  function aktuelleGroesse(reader) {
    const treffer = (reader.className || '').match(/size-[sml]/);
    return treffer ? treffer[0] : 'size-s';
  }

  // Textgroessen-Umschalter (drei Stufen, fuer Deutsch UND Hebraeisch). Tut
  // nichts, wenn die Leiste (#segGroesse) oder der Reader fehlen. Merkt die
  // Wahl in localStorage, damit sie beim naechsten Besuch erhalten bleibt.
  function initTextgroesse() {
    if (typeof document === 'undefined') return;
    const segGroesse = document.getElementById('segGroesse');
    const reader = document.getElementById('reader');
    if (!segGroesse || !reader) return;

    function anwenden(groesse) {
      reader.classList.remove('size-s', 'size-m', 'size-l');
      reader.classList.add('size-' + groesse);
      segGroesse.querySelectorAll('button').forEach(b => {
        b.classList.toggle('on', b.dataset.groesse === groesse);
      });
    }

    let gespeichert = 's';
    try {
      gespeichert = localStorage.getItem('tora-textgroesse') || 's';
    } catch (e) { /* localStorage nicht verfuegbar (privat/blockiert) */ }
    if (['s', 'm', 'l'].includes(gespeichert)) anwenden(gespeichert);

    segGroesse.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const groesse = b.dataset.groesse;
      anwenden(groesse);
      try { localStorage.setItem('tora-textgroesse', groesse); } catch (e) { /* siehe oben */ }
    });
  }

  // Mitlaufender Paraschah-Streifen: setzt #para-now auf die Paraschah des
  // obersten sichtbaren Verses. Tut nichts, wenn es #para-now nicht gibt.
  function initParaStreifen() {
    if (typeof document === 'undefined') return;
    const label = document.getElementById('para-now');
    if (!label) return;
    const verse = Array.from(document.querySelectorAll('.verse[data-para]'));
    if (!verse.length) return;

    const OFFSET = 120; // unter Nav (64px) + Streifen
    let laeuft = false;

    function aktualisiere() {
      laeuft = false;
      let aktuell = verse[0];
      for (const v of verse) {
        if (v.getBoundingClientRect().top - OFFSET <= 0) aktuell = v;
        else break;
      }
      const para = aktuell.getAttribute('data-para');
      if (para && label.textContent !== para) label.textContent = para;
    }

    function beiScroll() {
      if (laeuft) return;
      laeuft = true;
      requestAnimationFrame(aktualisiere);
    }

    window.addEventListener('scroll', beiScroll, { passive: true });
    window.addEventListener('resize', beiScroll, { passive: true });
    aktualisiere();
  }

  function deuteSuche(s) {
    const m = String(s).trim().match(/^(?:\d+\.\s*Mose\s+)?(\d+)[,:](\d+)$/);
    if (m) return { art: 'stelle', kapitel: +m[1], vers: +m[2] };
    const w = String(s).trim();
    return w ? { art: 'wort', wort: w } : null;
  }

  function initSuche() {
    if (typeof document === 'undefined') return;
    const input = document.querySelector('.search input');
    if (!input) return;
    const feld = input.closest('.search');

    function signalisiereFehler() {
      if (!feld) return;
      feld.style.borderColor = '#c0392b';
      setTimeout(() => { feld.style.borderColor = ''; }, 500);
    }

    input.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const gedeutet = deuteSuche(input.value);
      if (!gedeutet) return;

      if (gedeutet.art === 'stelle') {
        const pfad = location.pathname.match(/\/tora\/([^/]+)\/(\d+)\/?/);
        if (!pfad) return;
        const slug = pfad[1];
        const aktuellesKapitel = +pfad[2];
        const ankerId = `v${gedeutet.kapitel}-${gedeutet.vers}`;

        if (gedeutet.kapitel === aktuellesKapitel) {
          const ziel = document.getElementById(ankerId);
          if (ziel) ziel.scrollIntoView({ behavior: 'smooth', block: 'start' });
          else signalisiereFehler();
        } else {
          location.href = `/tora/${slug}/${gedeutet.kapitel}/#${ankerId}`;
        }
      } else if (gedeutet.art === 'wort') {
        document.querySelectorAll('.tok.hl, .tok.pin').forEach(x => x.classList.remove('hl', 'pin'));
        const nadel = gedeutet.wort.toLowerCase();
        const treffer = Array.from(document.querySelectorAll('.tok'))
          .filter(el => el.textContent.toLowerCase().includes(nadel));

        if (!treffer.length) { signalisiereFehler(); return; }
        treffer.forEach(el => el.classList.add('hl'));
        treffer[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  return { gruppenIndex, initBrowser, deuteSuche, initParaStreifen, initTextgroesse };
});
