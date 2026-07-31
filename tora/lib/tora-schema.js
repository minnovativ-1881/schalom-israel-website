// =============================================
// SCHALOM ISRAEL - tora/lib/tora-schema.js
// Validiert Paraschah-Datensaetze fuer "Tora lesen" und parst/formatiert Stellen-Angaben.
// UMD: laeuft per <script> im Browser und per require() in node.
// =============================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ToraSchema = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  // Parst eine Stellen-Angabe wie "7,12" oder "5. Mose 7,12" in { kapitel, vers, buch? }.
  function parseRef(s) {
    if (!s) return null;
    const m = String(s).trim().match(/^(?:(\d+\.\s*Mose)\s+)?(\d+)[,:](\d+)$/);
    if (!m) return null;
    const out = { kapitel: +m[2], vers: +m[3] };
    if (m[1]) out.buch = m[1].replace(/\s+/, ' ');
    return out;
  }

  // Erzeugt einen stabilen Anker ("7-12") aus einer Stellen-Angabe.
  function refId(ref) {
    const p = parseRef(ref);
    return p ? `${p.kapitel}-${p.vers}` : '';
  }

  // Validiert einen Paraschah-Datensatz. Gibt ein Array von Fehlermeldungen zurueck (leer = gueltig).
  function validate(d) {
    const f = [];
    ['slug','hebcalName','de','he','meaning','buch','bereich','aliyot','haftara','kapitel']
      .forEach(k => { if (d[k] === undefined || d[k] === null) f.push(`Pflichtfeld fehlt: ${k}`); });
    if (!Array.isArray(d.aliyot)) return f.concat('aliyot muss ein Array sein');
    if (!Array.isArray(d.kapitel)) return f.concat('kapitel muss ein Array sein');
    d.kapitel.forEach((kap, ki) => {
      if (typeof kap.nr !== 'number') f.push(`kapitel[${ki}].nr fehlt`);
      (kap.verse || []).forEach((v, vi) => {
        const wo = `kapitel[${ki}].verse[${vi}] (${v.ref})`;
        if (!v.ref || !parseRef(v.ref)) f.push(`${wo}: ref ungültig`);
        if (!Array.isArray(v.he) || !v.he.length) f.push(`${wo}: he leer`);
        if (!Array.isArray(v.de)) f.push(`${wo}: de fehlt`);
        const heIds = new Set((v.he || []).map(x => x.id));
        (v.de || []).forEach(x => {
          if (!heIds.has(x.id)) f.push(`${wo}: de-id '${x.id}' ohne he-Entsprechung`);
        });
      });
    });
    return f;
  }

  return { parseRef, refId, validate };
});
