'use strict';
// =============================================
// SCHALOM ISRAEL - tools/tora-seite-bauen.js
// Baut vorgerenderte, statische Leseseiten nach dem BUCH-UND-KAPITEL-Modell.
// Aus allen Paraschot eines Buches (tora/daten/index.json + tora/daten/<slug>.json)
// werden je Kapitel eine Seite tora/<buchSlug>/<kapitel>/index.html sowie eine
// Buch-Uebersicht tora/<buchSlug>/index.html erzeugt.
// Aufruf: node tools/tora-seite-bauen.js <buchSlug>   (z. B. devarim)
// =============================================
const fs = require('node:fs');
const path = require('node:path');
const T = require('../tora/lib/tora-schema.js');

const WURZEL = path.join(__dirname, '..');

// Die fuenf Buecher der Tora: deutscher Anzeigename, Slug und hebraeischer Name.
const BUECHER = {
  '1. Mose': { slug: 'bereschit', de: 'Bereschit', he: 'בְּרֵאשִׁית' },
  '2. Mose': { slug: 'schemot',   de: 'Schemot',   he: 'שְׁמוֹת' },
  '3. Mose': { slug: 'wajikra',   de: 'Wajikra',   he: 'וַיִּקְרָא' },
  '4. Mose': { slug: 'bamidbar',  de: 'Bamidbar',  he: 'בְּמִדְבַּר' },
  '5. Mose': { slug: 'devarim',   de: 'Devarim',   he: 'דְּבָרִים' },
};
// Roemische Bandnummer der Reihe "Das Tora-Jahr" je Buch.
const BAND_ROMAN = { bereschit: 'I', schemot: 'II', wajikra: 'III', bamidbar: 'IV', devarim: 'V' };

function buchVonSlug(slug) {
  const treffer = Object.entries(BUECHER).find(([, v]) => v.slug === slug);
  return treffer ? { buch: treffer[0], ...treffer[1] } : null;
}

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function tokSpans(arr) {
  return arr.map(t => {
    const cls = t.particle ? 'tok particle' : 'tok';
    return `<span class="${cls}" data-g="${esc(t.id)}">${esc(t.t)}</span>`;
  }).join(' ');
}

// Eine Vers-Zeile. Traegt data-para (fuer den mitlaufenden Paraschah-Streifen),
// wenn dem Vers eine Paraschah zugeordnet ist.
function versHtml(v) {
  const para = v.paraDe ? ` data-para="${esc(v.paraDe)}"` : '';
  return `<div class="verse"${para}>
  <div class="ref" title="Vers verlinken" id="v${T.refId(v.ref)}">${esc(v.ref)}</div>
  <div class="de-col">${tokSpans(v.de)}</div>
  <div class="he-col">${tokSpans(v.he)}</div>
</div>`;
}

const LESUNG_BEZEICHNUNG = ['Erste Lesung', 'Zweite Lesung', 'Dritte Lesung', 'Vierte Lesung', 'Fünfte Lesung', 'Sechste Lesung', 'Siebte Lesung'];

// Aliyah-Bande im Text (vor dem Vers, dessen ref = aliyah.von ist).
function aliyahBandHtml(aliyah) {
  const bezeichnung = LESUNG_BEZEICHNUNG[aliyah.n - 1] || `${aliyah.n}. Lesung`;
  return `<div class="aliyah" id="aliyah-${aliyah.n}">
      <span class="n">${esc(aliyah.he)}</span>
      <span class="t">${esc(bezeichnung)} · ${esc(aliyah.de)} · ${esc(aliyah.tag)}</span>
      <span class="r">${esc(aliyah.von)}–${esc(aliyah.bis)}</span>
    </div>`;
}

// Eroeffnungs-Bande: welche Paraschah in diesem Kapitel beginnt.
function eroeffnungHtml(para) {
  const bedeutung = para.meaning ? ` <span class="mean">· „${esc(para.meaning)}"</span>` : '';
  return `<div class="paraeroeffnung">
      <span class="he">${esc(para.he)}</span>
      <span class="tx">Beginn der Paraschah <b>${esc(para.de)}</b>${bedeutung}</span>
    </div>`;
}

// Trenn-Bande: hier wechselt mitten im Kapitel die Paraschah.
function paratrennHtml(para) {
  return `<div class="paratrenn">Hier beginnt Paraschah <b>${esc(para.de)}</b> <span class="he">${esc(para.he)}</span></div>`;
}

// ---------------------------------------------------------------------------
// Datenzusammenbau: aus mehreren Paraschah-Datensaetzen ein Buch-Modell bauen.
// Jeder Vers wird nach (Kapitel, Vers) einsortiert und traegt seine Paraschah-
// und Aliyah-Zuordnung. Ein Kapitel kann Verse aus zwei Paraschot enthalten.
// ---------------------------------------------------------------------------
function assembliereBuch(buchSlug, paraschot) {
  const meta = buchVonSlug(buchSlug);
  if (!meta) throw new Error('Unbekanntes Buch: ' + buchSlug);

  // Kleinste Vers-Position einer Paraschah (fuer die Reihenfolge im Buch).
  function startWert(p) {
    return p.kapitel.reduce((min, k) => k.verse.reduce((m, v) => {
      const pr = T.parseRef(v.ref);
      const w = pr.kapitel * 1000 + pr.vers;
      return w < m ? w : m;
    }, min), Infinity);
  }
  const geordnet = paraschot.slice().sort((a, b) => startWert(a) - startWert(b));

  const kapitel = {};
  geordnet.forEach(p => {
    const vonMap = {};
    p.aliyot.forEach(a => { vonMap[a.von] = a; });
    p.kapitel.forEach(k => {
      k.verse.forEach(v => {
        const pr = T.parseRef(v.ref);
        const kap = kapitel[pr.kapitel] || (kapitel[pr.kapitel] = { nr: pr.kapitel, verse: [] });
        kap.verse.push({
          ref: v.ref, k: pr.kapitel, v: pr.vers, he: v.he, de: v.de,
          paraDe: p.de, paraSlug: p.slug, paraHe: p.he,
          aliyah: vonMap[v.ref] || null,
        });
      });
    });
  });

  const paraBySlug = {};
  geordnet.forEach(p => { paraBySlug[p.slug] = { slug: p.slug, de: p.de, he: p.he, meaning: p.meaning }; });

  Object.values(kapitel).forEach(k => {
    k.verse.sort((a, b) => a.v - b.v);
    k.startPara = paraBySlug[k.verse[0].paraSlug];
  });

  const verfuegbareKapitel = Object.keys(kapitel).map(Number).sort((a, b) => a - b);

  return {
    buchSlug, buch: meta.buch, buchDe: meta.de, buchHe: meta.he,
    verfuegbareKapitel,
    paraBySlug,
    paraschot: geordnet.map(p => ({
      slug: p.slug, de: p.de, he: p.he, meaning: p.meaning, bereich: p.bereich,
      aliyot: p.aliyot, haftara: p.haftara,
      kapitelNrs: [...new Set(p.kapitel.map(k => k.nr))].sort((a, b) => a - b),
    })),
    kapitel,
  };
}

// Liest index.json + die zugehoerigen Paraschah-Datensaetze eines Buches ein.
function ladeParaschot(buchSlug) {
  const meta = buchVonSlug(buchSlug);
  if (!meta) throw new Error('Unbekanntes Buch: ' + buchSlug);
  const indexPfad = path.join(WURZEL, 'tora', 'daten', 'index.json');
  const index = fs.existsSync(indexPfad) ? JSON.parse(fs.readFileSync(indexPfad, 'utf8')) : [];
  const slugs = index.filter(e => e.buch === meta.buch).map(e => e.slug);
  const datensaetze = slugs.map(s => {
    const d = JSON.parse(fs.readFileSync(path.join(WURZEL, 'tora', 'daten', s + '.json'), 'utf8'));
    const fehler = T.validate(d);
    if (fehler.length) { console.error(`Fehler in ${s}.json:\n` + fehler.join('\n')); process.exit(1); }
    return d;
  });
  return { meta, datensaetze };
}

function ladeBuch(buchSlug) {
  const { datensaetze } = ladeParaschot(buchSlug);
  if (!datensaetze.length) throw new Error('Keine Paraschot fuer Buch ' + buchSlug + ' im Index gefunden.');
  return assembliereBuch(buchSlug, datensaetze);
}

// Oeffentlicher Pfad zum echten Buch-Cover, falls im Repo vorhanden.
function buchCoverPfad(buchSlug) {
  const rel = path.join('buecher', buchSlug, 'cover.jpg');
  return fs.existsSync(path.join(WURZEL, rel)) ? '/' + rel.replace(/\\/g, '/') : null;
}

// Voriges/naechstes VORHANDENES Kapitel im selben Buch, an den Raendern deaktiviert.
function pagerHtml(buch, kapNr) {
  const nrs = buch.verfuegbareKapitel;
  const idx = nrs.indexOf(kapNr);
  const prevNr = idx > 0 ? nrs[idx - 1] : null;
  const nextNr = idx < nrs.length - 1 ? nrs[idx + 1] : null;

  const prevBtn = prevNr !== null
    ? `<button onclick="location.href='/tora/${esc(buch.buchSlug)}/${prevNr}/'">&larr; Kapitel ${prevNr}</button>`
    : `<button disabled>&larr; Anfang</button>`;
  const nextBtn = nextNr !== null
    ? `<button onclick="location.href='/tora/${esc(buch.buchSlug)}/${nextNr}/'">Kapitel ${nextNr} &rarr;</button>`
    : `<button disabled>Ende &rarr;</button>`;

  return `<div class="pager">
    ${prevBtn}
    <span class="pos">Kapitel ${kapNr}</span>
    ${nextBtn}
  </div>`;
}

// Reader-Inhalt: Eroeffnungsbande, dann Verse mit Aliyah- und Trenn-Banden.
function readerInhaltHtml(buch, kap) {
  let html = eroeffnungHtml(kap.startPara);
  let prev = null;
  kap.verse.forEach(v => {
    if (prev !== null && v.paraSlug !== prev) {
      html += '\n    ' + paratrennHtml(buch.paraBySlug[v.paraSlug]);
    }
    if (v.aliyah) html += '\n    ' + aliyahBandHtml(v.aliyah);
    html += '\n    ' + versHtml(v);
    prev = v.paraSlug;
  });
  return html;
}

const GEBURTSTAG_ICON = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/><path d="M12 12.4l.75 1.5 1.65.25-1.2 1.15.28 1.65-1.48-.8-1.48.8.28-1.65-1.2-1.15 1.65-.25z" fill="currentColor" stroke="none"/></svg>';

function relatedHtml(buch) {
  const coverPfad = buchCoverPfad(buch.buchSlug);
  const roman = BAND_ROMAN[buch.buchSlug];
  const buchLink = coverPfad ? `/buecher/${esc(buch.buchSlug)}/` : '/buecher/';
  const buchLinkText = coverPfad ? 'Zum Buch' : 'Zur Buchreihe';
  const bandText = roman ? `Band ${roman} „${esc(buch.buchDe)}" der Reihe „Das Tora-Jahr".` : 'Aus der Reihe „Das Tora-Jahr".';

  const buchVisual = coverPfad
    ? `<img class="cover-img" src="${coverPfad}" alt="Buchcover ${esc(buch.buchDe)} – Das Tora-Jahr">`
    : `<div class="cover">DAS TORA-JAHR · ${esc(buch.buchDe.toUpperCase())}</div>`;

  return `<div class="related">
    <div class="relcard">
      ${buchVisual}
      <div>
        <h3>${esc(buch.buchDe)} noch tiefer verstehen</h3>
        <p>Ein Kapitel Deutung, jüdische Tradition und Impulse zum Beten. ${bandText}</p>
        <a href="${buchLink}">${buchLinkText}</a>
      </div>
    </div>
    <div class="relcard">
      <div class="cover-blau">${GEBURTSTAG_ICON}</div>
      <div>
        <h3>Dein hebräischer Geburtstag</h3>
        <p>Finde die Aliyah deines Geburtstags und die Parascha, die zu dir gehört.</p>
        <a href="/entdecken/hebraeischer-geburtstag/">Geburtstag entdecken</a>
      </div>
    </div>
  </div>`;
}

const FOOTER_HTML = `<footer class="tora-footer">
    <p><strong>Deutsche Übersetzung © 2026 Schalom Israel. Alle Rechte vorbehalten.</strong> Das Kopieren, Ausdrucken, Vervielfältigen oder Weiterverbreiten der Übersetzung ist nur mit ausdrücklicher Genehmigung gestattet.</p>
    <p>Hebräischer Text: Sefaria, „Miqra according to the Masorah" (CC BY-SA 4.0).</p>
  </footer>`;

// Vollstaendige Kapitel-Leseseite.
function kapitelSeiteHtml(buch, kapNr) {
  const kap = buch.kapitel[kapNr];
  if (!kap) throw new Error(`Kapitel ${kapNr} nicht in ${buch.buchSlug} vorhanden`);

  const titel = `${esc(buch.buchDe)} Kapitel ${kapNr} – Tora lesen – Schalom Israel`;
  const beschreibung = `Lies ${esc(buch.buchDe)} (${esc(buch.buch)}) Kapitel ${kapNr} zweisprachig, Deutsch und Hebräisch Wort für Wort verknüpft.`;
  const canonical = `https://www.schalomisrael.de/tora/${esc(buch.buchSlug)}/${kapNr}/`;

  const pagerOben = pagerHtml(buch, kapNr);
  const pagerUnten = pagerHtml(buch, kapNr);

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
<div class="tora-page">

  <div class="para-sticky">Paraschah <b id="para-now">${esc(kap.startPara.de)}</b></div>

  <div class="wrap">

    <span class="kicker">Tora lesen</span>
    <h1 class="title">${esc(buch.buchDe)} · Kapitel ${kapNr}</h1>
    <div class="subline">${esc(buch.buch)} · <span class="he">${esc(buch.buchHe)}</span></div>

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
    ${readerInhaltHtml(buch, kap)}
    </div>

    ${pagerUnten}

    ${relatedHtml(buch)}

    ${FOOTER_HTML}

  </div>
</div>
<script src="/tora/lesen.js"></script>
</body>
</html>
`;
}

// Buch-Uebersicht: alle vorhandenen Kapitel, nach Paraschah gruppiert.
function buchUebersichtHtml(buch) {
  const titel = `${esc(buch.buchDe)} (${esc(buch.buch)}) – Die Tora online lesen – Schalom Israel`;
  const beschreibung = `Lies ${esc(buch.buchDe)} (${esc(buch.buch)}) online, Kapitel für Kapitel, Deutsch und Hebräisch nebeneinander.`;
  const canonical = `https://www.schalomisrael.de/tora/${esc(buch.buchSlug)}/`;

  const gruppen = buch.paraschot.map(p => {
    const kaps = buch.verfuegbareKapitel.filter(nr => buch.kapitel[nr].startPara.slug === p.slug);
    return { para: p, kaps };
  }).filter(g => g.kaps.length);

  const gruppenHtml = gruppen.map(g => `
      <div class="kapgruppe">
        <h2><span class="he">${esc(g.para.he)}</span> Paraschah ${esc(g.para.de)} <span class="mean">„${esc(g.para.meaning)}"</span></h2>
        <div class="kapraster">
          ${g.kaps.map(nr => `<a class="kapchip" href="/tora/${esc(buch.buchSlug)}/${nr}/">Kapitel ${nr}</a>`).join('\n          ')}
        </div>
      </div>`).join('\n');

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
<div class="tora-page">
  <div class="wrap">

    <span class="kicker">Tora lesen</span>
    <h1 class="title">${esc(buch.buchDe)} <span class="klein">(${esc(buch.buch)})</span></h1>
    <div class="subline">Die Tora online lesen · <span class="he">${esc(buch.buchHe)}</span></div>

    <div class="kapliste">
${gruppenHtml}
    </div>

    <p class="folgen">Weitere Kapitel folgen.</p>
    <p class="zurueck"><a href="/tora/">&larr; Zurück zur Wochenlesung</a></p>

    ${FOOTER_HTML}

  </div>
</div>
</body>
</html>
`;
}

// Haelt das Paraschah-Verzeichnis (index.json) frisch – pro Paraschah ein Eintrag,
// so wie ihn die Wochenlesungs-Uebersicht /tora/ erwartet.
function aktualisiereIndex(d) {
  const datei = path.join(WURZEL, 'tora', 'daten', 'index.json');
  let liste = [];
  if (fs.existsSync(datei)) liste = JSON.parse(fs.readFileSync(datei, 'utf8'));
  const eintrag = {
    slug: d.slug, de: d.de, he: d.he, buch: d.buch, meaning: d.meaning, bereich: d.bereich,
    kapitel: [...new Set(d.kapitel.map(k => k.nr))].sort((a, b) => a - b),
    aliyot: d.aliyot, haftara: d.haftara,
  };
  const i = liste.findIndex(x => x.slug === d.slug);
  if (i > -1) liste[i] = eintrag; else liste.push(eintrag);
  fs.writeFileSync(datei, JSON.stringify(liste, null, 2) + '\n');
}

function baue(buchSlug) {
  const { datensaetze } = ladeParaschot(buchSlug);
  if (!datensaetze.length) { console.error('Keine Paraschot fuer Buch ' + buchSlug + ' im Index gefunden.'); process.exit(1); }
  const buch = assembliereBuch(buchSlug, datensaetze);

  buch.verfuegbareKapitel.forEach(nr => {
    const dir = path.join(WURZEL, 'tora', buchSlug, String(nr));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), kapitelSeiteHtml(buch, nr));
  });

  const buchDir = path.join(WURZEL, 'tora', buchSlug);
  fs.mkdirSync(buchDir, { recursive: true });
  fs.writeFileSync(path.join(buchDir, 'index.html'), buchUebersichtHtml(buch));

  datensaetze.forEach(aktualisiereIndex);

  console.log(`Gebaut: ${buchSlug}, ${buch.verfuegbareKapitel.length} Kapitel + Buch-Übersicht`);
}

if (require.main === module) {
  const slug = process.argv[2];
  if (!slug) { console.error('Aufruf: node tools/tora-seite-bauen.js <buchSlug>'); process.exit(1); }
  baue(slug);
}

module.exports = {
  BUECHER, buchVonSlug, esc, tokSpans, versHtml, aliyahBandHtml, eroeffnungHtml, paratrennHtml,
  assembliereBuch, ladeBuch, pagerHtml, readerInhaltHtml, relatedHtml,
  kapitelSeiteHtml, buchUebersichtHtml, aktualisiereIndex,
};
