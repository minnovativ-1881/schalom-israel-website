// =============================================
// SCHALOM ISRAEL - Minimaler Markdown-Renderer
// Bewusst klein: der Server liefert nur Ueberschriften, Absaetze, Listen,
// **fett** und *kursiv*. Alles wird vorher escaped.
//
// UMD, damit er ohne Browser testbar ist. Er war es nicht, und genau deshalb
// ist am 2026-07-19 ein Fehler live gegangen (Ueberschrift und Absatz
// verschmolzen zu einer riesigen Ueberschrift).
// =============================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MiniMarkdown = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  function escape(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function inline(s) {
    return s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+?)\*/g, '$1<em>$2</em>');
  }

  // Zeilenweise, NICHT blockweise. Gemini setzt hinter eine Ueberschrift
  // manchmal nur einen einzelnen Zeilenumbruch statt einer Leerzeile. Wer an
  // Leerzeilen aufteilt, verschmilzt dann Ueberschrift und Absatz.
  function render(text) {
    var zeilen = escape(text).split('\n');
    var aus = [];
    var absatz = [];
    var liste = [];

    function absatzSchliessen() {
      if (absatz.length) {
        aus.push('<p>' + inline(absatz.join('<br>')) + '</p>');
        absatz = [];
      }
    }
    function listeSchliessen() {
      if (liste.length) {
        aus.push('<ul>' + liste.join('') + '</ul>');
        liste = [];
      }
    }
    function allesSchliessen() {
      absatzSchliessen();
      listeSchliessen();
    }

    for (var i = 0; i < zeilen.length; i++) {
      var z = zeilen[i].trim();

      if (!z) { allesSchliessen(); continue; }

      if (z.indexOf('#### ') === 0) { allesSchliessen(); aus.push('<h4>' + inline(z.slice(5)) + '</h4>'); continue; }
      if (z.indexOf('### ') === 0)  { allesSchliessen(); aus.push('<h3>' + inline(z.slice(4)) + '</h3>'); continue; }
      if (z.indexOf('## ') === 0)   { allesSchliessen(); aus.push('<h2>' + inline(z.slice(3)) + '</h2>'); continue; }
      if (z.indexOf('# ') === 0)    { allesSchliessen(); aus.push('<h2>' + inline(z.slice(2)) + '</h2>'); continue; }

      if (/^[-*]\s+/.test(z)) {
        absatzSchliessen();
        liste.push('<li>' + inline(z.replace(/^[-*]\s+/, '')) + '</li>');
        continue;
      }

      listeSchliessen();
      absatz.push(z);
    }
    allesSchliessen();
    return aus.join('');
  }

  return { render: render, escape: escape };
});
