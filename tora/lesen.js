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
      b.classList.add('on'); reader.className = 'reader mode-' + b.dataset.mode;
    });
    const tl = document.getElementById('tl');
    if (tl) tl.addEventListener('click', e => {
      const d = e.target.closest('.day'); if (!d || !d.dataset.anchor) return;
      const ziel = document.getElementById(d.dataset.anchor);
      if (ziel) ziel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    initSuche();
  }

  function initSuche() { /* wird in einem spaeteren Task gefuellt */ }

  return { gruppenIndex, initBrowser };
});
