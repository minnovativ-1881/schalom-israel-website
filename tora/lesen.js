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
    initTeamim();
    initVersLinks();
    initAnker();
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

  // Stellen-Logik aus /tora/lib/stelle.js (im Browser window.ToraStelle).
  function stelleLib() {
    if (typeof ToraStelle !== 'undefined') return ToraStelle;
    if (typeof require === 'function') return require('./lib/stelle.js');
    return null;
  }

  // Deutet die Sucheingabe: Stelle, Buch, Fehler oder (sonst) Wort.
  function deuteSuche(s) {
    const S = stelleLib();
    const w = String(s).trim();
    if (!w) return null;
    const st = S ? S.deuteStelle(w) : null;
    return st || { art: 'wort', wort: w };
  }

  // Buch (und Kapitel) der aktuellen Seite aus dem Pfad: /tora/<buch>/<kap>/
  function seitenOrt(pfad) {
    const m = String(pfad).match(/\/tora\/([a-z]+)\/(?:(\d+)\/?)?/);
    if (!m || m[1] === 'daten' || m[1] === 'lib') return { buch: null, kapitel: null };
    return { buch: m[1], kapitel: m[2] ? +m[2] : null };
  }

  let paraschotCache = null;
  function ladeParaschot() {
    if (!paraschotCache) {
      paraschotCache = fetch('/tora/daten/index.json')
        .then(r => (r.ok ? r.json() : []))
        .catch(() => []);
    }
    return paraschotCache;
  }

  // Markiert die Verse kapitel,vers bis kapitel,bis und scrollt hin.
  // Gibt false zurueck, wenn der Vers auf der Seite fehlt.
  function zeigeVers(kapitel, vers, bis, sanft) {
    const erster = document.getElementById(`v${kapitel}-${vers}`);
    if (!erster) return false;
    document.querySelectorAll('.verse.ziel').forEach(x => x.classList.remove('ziel'));
    const ende = bis || vers;
    for (let n = vers; n <= ende; n++) {
      const ref = document.getElementById(`v${kapitel}-${n}`);
      if (ref) ref.closest('.verse').classList.add('ziel');
    }
    erster.scrollIntoView({ behavior: sanft ? 'smooth' : 'auto', block: 'start' });
    return true;
  }

  // Hinweiszeile unter dem Suchfeld (fuer Fehler und Tipps). Wird bei Bedarf angelegt.
  function hinweisZeile() {
    let hinweis = document.querySelector('.suchhinweis');
    if (hinweis) return hinweis;
    const input = document.querySelector('.search input');
    if (!input) return null;
    hinweis = document.createElement('p');
    hinweis.className = 'suchhinweis';
    hinweis.setAttribute('aria-live', 'polite');
    const anker = input.closest('.controls') || input.closest('.search');
    anker.parentNode.insertBefore(hinweis, anker.nextSibling);
    return hinweis;
  }

  function initSuche() {
    if (typeof document === 'undefined') return;
    const input = document.querySelector('.search input');
    const S = stelleLib();
    if (!input || !S) return;
    const feld = input.closest('.search');
    const hinweis = hinweisZeile();

    function melde(text) {
      hinweis.textContent = text || '';
      hinweis.classList.toggle('sichtbar', !!text);
      if (text && feld) {
        feld.classList.add('fehler');
        setTimeout(() => feld.classList.remove('fehler'), 600);
      }
    }
    input.addEventListener('input', () => melde(''));

    const ort = seitenOrt(location.pathname);
    const BEISPIEL = 'Beispiele: 5. Mose 6,4 · Gen 1,1 · Wajischlach';

    function springe(st) {
      if (st.art === 'buch') { location.href = S.zielUrl(st); return; }
      const buch = st.buch || ort.buch;
      if (!buch) {
        melde('Bitte mit Buch angeben, zum Beispiel „1. Mose ' + st.kapitel + (st.vers ? ',' + st.vers : '') + '“.');
        return;
      }
      const b = S.buchVonSlug(buch);
      if (st.kapitel < 1 || st.kapitel > b.kapitel) { melde(`${b.de} hat ${b.kapitel} Kapitel.`); return; }
      if (buch === ort.buch && st.kapitel === ort.kapitel) {
        if (!st.vers) { window.scrollTo({ top: 0, behavior: 'smooth' }); melde(''); return; }
        if (zeigeVers(st.kapitel, st.vers, st.bis, true)) {
          history.replaceState(null, '', `#v${st.kapitel}-${st.vers}` + (st.bis ? `-${st.bis}` : ''));
          melde('');
        } else {
          melde(`${b.de} ${st.kapitel} hat keinen Vers ${st.vers}.`);
        }
        return;
      }
      location.href = S.zielUrl({ ...st, buch });
    }

    function suche() {
      const gedeutet = deuteSuche(input.value);
      if (!gedeutet) return;
      if (gedeutet.art === 'fehler') {
        melde(`${S.buchVonSlug(gedeutet.buch).de} hat ${gedeutet.max} Kapitel.`);
        return;
      }
      if (gedeutet.art !== 'wort') { springe(gedeutet); return; }

      // Kein Stellen-Format: erst Wochenlesung nach Namen, dann Wort im Kapitel.
      ladeParaschot().then(liste => {
        const para = S.findeParascha(gedeutet.wort, liste);
        if (para) { springe(para); return; }
        const toks = document.querySelectorAll('.tok');
        if (!toks.length) { melde('Nicht erkannt. ' + BEISPIEL); return; }
        document.querySelectorAll('.tok.hl, .tok.pin').forEach(x => x.classList.remove('hl', 'pin'));
        const nadel = S.ohneZeichen(gedeutet.wort.toLowerCase());
        const treffer = Array.from(toks)
          .filter(el => S.ohneZeichen(el.textContent.toLowerCase()).includes(nadel));
        if (!treffer.length) { melde(`„${gedeutet.wort}“ kommt in diesem Kapitel nicht vor. ` + BEISPIEL); return; }
        melde('');
        treffer.forEach(el => el.classList.add('hl'));
        treffer[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }

    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); suche(); } });
    const knopf = feld && feld.querySelector('.suchknopf');
    if (knopf) knopf.addEventListener('click', e => { e.preventDefault(); suche(); });
  }

  // Beim Laden: Vers aus dem Anker (#v32-4 oder #v32-4-10) markieren.
  // Fehlt der Vers, kurzer Hinweis statt stillem Sprung an den Anfang.
  function initAnker() {
    if (typeof document === 'undefined') return;
    const S = stelleLib();
    if (!S || !document.getElementById('reader')) return;
    function anwenden() {
      const a = S.deuteAnker(location.hash);
      if (!a) return;
      if (!zeigeVers(a.kapitel, a.vers, a.bis, false)) {
        const h = hinweisZeile();
        if (h) { h.textContent = `Vers ${a.vers} gibt es in Kapitel ${a.kapitel} nicht.`; h.classList.add('sichtbar'); }
      }
    }
    anwenden();
    window.addEventListener('hashchange', anwenden);
  }

  // Klick auf die Versnummer: Link auf genau diesen Vers kopieren.
  function initVersLinks() {
    if (typeof document === 'undefined') return;
    const reader = document.getElementById('reader');
    if (!reader) return;
    let toast = null;
    let timer = null;
    function zeige(text) {
      if (!toast) {
        toast = document.createElement('div');
        toast.className = 'tora-toast';
        toast.setAttribute('role', 'status');
        document.body.appendChild(toast);
      }
      toast.textContent = text;
      toast.classList.add('sichtbar');
      clearTimeout(timer);
      timer = setTimeout(() => toast.classList.remove('sichtbar'), 2200);
    }
    reader.addEventListener('click', e => {
      const ref = e.target.closest('.ref[id]');
      if (!ref) return;
      const anker = '#' + ref.id;
      history.replaceState(null, '', anker);
      document.querySelectorAll('.verse.ziel').forEach(x => x.classList.remove('ziel'));
      ref.closest('.verse').classList.add('ziel');
      const url = location.origin + location.pathname + anker;
      const fertig = () => zeige('Link zu Vers ' + ref.textContent.trim() + ' kopiert');
      const ersatz = () => zeige('Link zu diesem Vers steht jetzt in der Adresszeile');
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(fertig, ersatz);
      else ersatz();
    });
  }

  // Schalter "Teamim": blendet die Betonungszeichen im hebraeischen Text aus
  // (Vokale bleiben). Die Wahl bleibt in localStorage erhalten.
  function initTeamim() {
    if (typeof document === 'undefined') return;
    const knopf = document.getElementById('tTeamim');
    const S = stelleLib();
    if (!knopf || !S) return;
    const original = new Map();
    function anwenden(an) {
      document.querySelectorAll('.he-col .tok').forEach(el => {
        if (!original.has(el)) original.set(el, el.textContent);
        el.textContent = an ? original.get(el) : S.ohneTeamim(original.get(el));
      });
      knopf.classList.toggle('on', an);
      knopf.setAttribute('aria-pressed', an ? 'true' : 'false');
    }
    let an = true;
    try { an = localStorage.getItem('tora-teamim') !== 'aus'; } catch (e) { /* privat/blockiert */ }
    if (!an) anwenden(false);
    knopf.addEventListener('click', () => {
      an = !an;
      anwenden(an);
      try { localStorage.setItem('tora-teamim', an ? 'an' : 'aus'); } catch (e) { /* siehe oben */ }
    });
  }

  return { gruppenIndex, initBrowser, deuteSuche, seitenOrt, initParaStreifen, initTextgroesse };
});
