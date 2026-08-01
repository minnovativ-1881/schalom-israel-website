'use strict';
// =============================================
// SCHALOM ISRAEL - tools/tora-seite-bauen.js
// Baut aus einem Paraschah-Datensatz (tora/daten/<slug>.json) vorgerenderte,
// statische Kapitel-Leseseiten unter tora/<slug>/<kapitel>/index.html.
// Aufruf: node tools/tora-seite-bauen.js <slug>
// =============================================
const fs = require('node:fs');
const path = require('node:path');
const T = require('../tora/lib/tora-schema.js');

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function tokSpans(arr) {
  return arr.map(t => {
    const cls = t.particle ? 'tok particle' : 'tok';
    return `<span class="${cls}" data-g="${esc(t.id)}">${esc(t.t)}</span>`;
  }).join(' ');
}

function versHtml(v) {
  return `<div class="verse">
  <div class="ref" title="Vers verlinken" id="v${T.refId(v.ref)}">${esc(v.ref)}</div>
  <div class="de-col">${tokSpans(v.de)}</div>
  <div class="he-col">${tokSpans(v.he)}</div>
</div>`;
}

const TAGE_KURZ = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Scha'];
const LESUNG_BEZEICHNUNG = ['Erste Lesung', 'Zweite Lesung', 'Dritte Lesung', 'Vierte Lesung', 'Fünfte Lesung', 'Sechste Lesung', 'Siebte Lesung'];

function tageslesungenHtml(d) {
  return TAGE_KURZ.map((tagKurz, i) => {
    const n = i + 1;
    const aliyah = d.aliyot.find(a => a.n === n);
    if (!aliyah) return null;
    const parsed = T.parseRef(aliyah.von);
    const aliyaKapitel = parsed ? parsed.kapitel : '';
    return `<a class="day" href="/tora/${esc(d.slug)}/${aliyaKapitel}/#aliyah-${n}"><b>${esc(tagKurz)}</b><span>${esc(aliyah.von)}</span></a>`;
  }).filter(Boolean).join('\n      ');
}

function aliyahBandHtml(aliyah) {
  const bezeichnung = LESUNG_BEZEICHNUNG[aliyah.n - 1] || `${aliyah.n}. Lesung`;
  return `<div class="aliyah" id="aliyah-${aliyah.n}">
      <span class="n">${esc(aliyah.he)}</span>
      <span class="t">${esc(bezeichnung)} · ${esc(aliyah.de)} · ${esc(aliyah.tag)}</span>
      <span class="r">${esc(aliyah.von)}–${esc(aliyah.bis)}</span>
    </div>`;
}

function pagerHtml(d, kapNr, posLabel) {
  const kapNrs = d.kapitel.map(k => k.nr).slice().sort((a, b) => a - b);
  const idx = kapNrs.indexOf(kapNr);
  const prevNr = idx > 0 ? kapNrs[idx - 1] : null;
  const nextNr = idx < kapNrs.length - 1 ? kapNrs[idx + 1] : null;

  const prevBtn = prevNr !== null
    ? `<button onclick="location.href='/tora/${esc(d.slug)}/${prevNr}/'">&larr; Kapitel ${prevNr}</button>`
    : `<button disabled>&larr; Anfang der Paraschah</button>`;
  const nextBtn = nextNr !== null
    ? `<button onclick="location.href='/tora/${esc(d.slug)}/${nextNr}/'">Kapitel ${nextNr} &rarr;</button>`
    : `<button disabled>Ende der Paraschah &rarr;</button>`;

  return `<div class="pager">
    ${prevBtn}
    <span class="pos">${posLabel}</span>
    ${nextBtn}
  </div>`;
}

const PARACONTEXT_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M8 3v18M18 7h2M18 12h2M18 17h2"/></svg>';
const GEBURTSTAG_ICON = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/><path d="M12 12.4l.75 1.5 1.65.25-1.2 1.15.28 1.65-1.48-.8-1.48.8.28-1.65-1.2-1.15 1.65-.25z" fill="currentColor" stroke="none"/></svg>';

function seitenHtml(d, kapNr) {
  const kap = d.kapitel.find(k => k.nr === kapNr);
  const kapNrs = d.kapitel.map(k => k.nr).slice().sort((a, b) => a - b);
  const position = kapNrs.indexOf(kapNr) + 1;

  // Aliyot, deren erste Stelle in diesem Kapitel liegt, nach Vers-Ref indiziert.
  const aliyotProVers = {};
  d.aliyot.forEach(a => { aliyotProVers[a.von] = a; });

  const verseHtml = kap.verse.map(v => {
    const aliyah = aliyotProVers[v.ref];
    const band = aliyah ? aliyahBandHtml(aliyah) + '\n' : '';
    return band + versHtml(v);
  }).join('\n');

  const titel = `${esc(d.de)} Kapitel ${kapNr} – Tora lesen – Schalom Israel`;
  const beschreibung = `Lies ${esc(d.de)} Kapitel ${kapNr} zweisprachig, Deutsch und Hebräisch Wort für Wort verknüpft – Teil der Wochenlesung ${esc(d.de)}.`;
  const canonical = `https://www.schalomisrael.de/tora/${esc(d.slug)}/${kapNr}/`;

  const pagerOben = pagerHtml(d, kapNr, `Kapitel ${position} von ${d.kapitel.length}`);
  const pagerUnten = pagerHtml(d, kapNr, `weiter durch ${esc(d.de)} blättern`);

  // Passenden Band der Reihe "Das Tora-Jahr" verlinken (erschienen: Bamidbar/Devarim), sonst die Reihen-Uebersicht.
  const _band = { '4. Mose': { slug: 'bamidbar', name: 'Bamidbar', roman: 'IV' }, '5. Mose': { slug: 'devarim', name: 'Devarim', roman: 'V' } }[d.buch];
  const buchCard = _band
    ? `<div class="cover">DAS TORA-JAHR · ${_band.name.toUpperCase()}</div>
      <div>
        <h3>${esc(d.de)} noch tiefer verstehen</h3>
        <p>Ein Kapitel Deutung, jüdische Tradition und Impulse zum Beten. Band ${_band.roman} „${_band.name}" der Reihe „Das Tora-Jahr".</p>
        <a href="/buecher/${_band.slug}/">Zum Buch</a>
      </div>`
    : `<div class="cover">DAS TORA-JAHR</div>
      <div>
        <h3>Die ganze Parascha mit Auslegung</h3>
        <p>Ein Kapitel Deutung, jüdische Tradition und Impulse zum Beten. Aus der Reihe „Das Tora-Jahr".</p>
        <a href="/buecher/">Zur Buchreihe</a>
      </div>`;

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>${titel}</title>
  <meta name="description" content="${beschreibung}">
  <link rel="canonical" href="${canonical}">
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/tora/lesen.css">
  <script src="/site-nav.js"></script>
</head>
<body>
<site-nav></site-nav>
<div class="wrap">

  <span class="kicker">Wochenlesung</span>
  <h1 class="title">${esc(d.de)}</h1>
  <div class="hebtitle">${esc(d.he)}</div>
  <div class="subline">„${esc(d.meaning)}" · ${esc(d.buch)} · Kapitel ${kapNr}</div>
  <div class="paracontext">
    ${PARACONTEXT_ICON}
    <b>Paraschah ${esc(d.de)}</b> <span>· ${esc(d.bereich)} · 7 Tageslesungen &amp; Haftara</span>
  </div>

  <div class="tl-wrap">
    <div class="tl-head">Tageslesungen (Aliyot) — ein Abschnitt pro Tag</div>
    <div class="tl" id="tl">
      ${tageslesungenHtml(d)}
    </div>
  </div>

  <div class="controls">
    <label class="search">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      <input type="text" placeholder="Stelle springen (z. B. ${kapNr},3) oder Wort suchen …">
    </label>
    <div class="seg" id="seg">
      <button class="on" data-mode="both">Beide</button>
      <button data-mode="de">Deutsch</button>
      <button data-mode="he">עברית</button>
    </div>
  </div>

  ${pagerOben}

  <p class="hint">Fahre über ein Wort <b>oder tippe es an</b> — die passende Übersetzung leuchtet auf der anderen Seite auf.</p>

  <div class="reader mode-both" id="reader">
    <div class="colhead">
      <div></div><div class="de">Deutsch</div><div class="he">עברית</div>
    </div>

    ${verseHtml}
  </div>

  ${pagerUnten}

  <div class="related">
    <div class="relcard">
      ${buchCard}
    </div>
    <div class="relcard">
      <div class="ico">${GEBURTSTAG_ICON}</div>
      <div>
        <h3>Dein hebräischer Geburtstag</h3>
        <p>Finde die Aliyah deines Geburtstags und die Parascha, die zu dir gehört.</p>
        <a href="/entdecken/hebraeischer-geburtstag/">Geburtstag entdecken</a>
      </div>
    </div>
  </div>

  <footer class="tora-footer">
    <p><strong>Deutsche Übersetzung © 2026 Schalom Israel. Alle Rechte vorbehalten.</strong> Das Kopieren, Ausdrucken, Vervielfältigen oder Weiterverbreiten der Übersetzung ist nur mit ausdrücklicher Genehmigung gestattet.</p>
    <p>Hebräischer Text: Sefaria, „Miqra according to the Masorah" (CC BY-SA 4.0).</p>
  </footer>

</div>
<script src="/tora/lesen.js"></script>
</body>
</html>
`;
}

function aktualisiereIndex(d) {
  const datei = path.join(__dirname, '..', 'tora', 'daten', 'index.json');
  let liste = [];
  if (fs.existsSync(datei)) {
    liste = JSON.parse(fs.readFileSync(datei, 'utf8'));
  }
  const eintrag = {
    slug: d.slug,
    de: d.de,
    he: d.he,
    buch: d.buch,
    meaning: d.meaning,
    bereich: d.bereich,
    kapitel: d.kapitel.map(k => k.nr),
    aliyot: d.aliyot,
    haftara: d.haftara
  };
  const bestehenderIdx = liste.findIndex(x => x.slug === d.slug);
  if (bestehenderIdx > -1) liste[bestehenderIdx] = eintrag;
  else liste.push(eintrag);
  fs.writeFileSync(datei, JSON.stringify(liste, null, 2) + '\n');
}

function baue(slug) {
  const d = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'tora', 'daten', slug + '.json'), 'utf8'));
  const fehler = T.validate(d); if (fehler.length) { console.error(fehler.join('\n')); process.exit(1); }
  d.kapitel.forEach(kap => {
    const dir = path.join(__dirname, '..', 'tora', slug, String(kap.nr));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), seitenHtml(d, kap.nr));
  });
  aktualisiereIndex(d);
  console.log(`Gebaut: ${slug}, ${d.kapitel.length} Seiten`);
}

if (require.main === module) { baue(process.argv[2]); }
module.exports = { versHtml, seitenHtml, esc, tokSpans, aktualisiereIndex };
