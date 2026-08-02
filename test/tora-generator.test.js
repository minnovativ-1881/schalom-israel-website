const { test } = require('node:test');
const assert = require('node:assert');
const {
  versHtml, assembliereBuch, kapitelSeiteHtml, buchUebersichtHtml, pagerHtml,
  entferneTetragrammNikud, paraschotSatz, GEBURTSTAG_COVER_SVG,
} = require('../tools/tora-seite-bauen.js');

// --- versHtml ---------------------------------------------------------------

test('versHtml erzeugt Spans mit data-g und markiert Partikel', () => {
  const html = versHtml({
    ref: '1,1',
    he: [{ id: 'a1', t: 'בְּרֵאשִׁית' }, { id: 'a2', t: 'אֵת', particle: true }],
    de: [{ id: 'a1', t: 'Im Anfang' }],
  });
  assert.match(html, /data-g="a1"[^>]*>Im Anfang/);
  assert.match(html, /class="tok particle" data-g="a2"/);
  assert.match(html, /class="ref"[^>]*>1,1/);
});

test('versHtml setzt data-para, wenn eine Paraschah zugeordnet ist', () => {
  const html = versHtml({ ref: '1,1', he: [{ id: 'a1', t: 'x' }], de: [{ id: 'a1', t: 'y' }], paraDe: 'Ekev' });
  assert.match(html, /class="verse" data-para="Ekev"/);
});

// --- Zwei Paraschot in einem Kapitel (Kernfall) -----------------------------

function vers(ref, para) {
  return { ref, he: [{ id: ref, t: 'ה' }], de: [{ id: ref, t: 'd' }] };
}

// Alpha: 1,1 · 1,2 · 2,1   Beta: 2,2 · 2,3   → Kapitel 2 enthält beide.
const alpha = {
  slug: 'alpha', hebcalName: 'Alpha', de: 'Alpha', he: 'אלף', meaning: 'Anfang', buch: '5. Mose',
  bereich: '5. Mose 1,1–2,1', haftara: 'x',
  aliyot: [{ n: 1, he: 'רִאשׁוֹן', de: 'Rischon', tag: 'Sonntag', von: '1,1', bis: '2,1' }],
  kapitel: [
    { nr: 1, verse: [vers('1,1'), vers('1,2')] },
    { nr: 2, verse: [vers('2,1')] },
  ],
};
const beta = {
  slug: 'beta', hebcalName: 'Beta', de: 'Beta', he: 'בית', meaning: 'Haus', buch: '5. Mose',
  bereich: '5. Mose 2,2–2,3', haftara: 'y',
  aliyot: [{ n: 1, he: 'רִאשׁוֹן', de: 'Rischon', tag: 'Sonntag', von: '2,2', bis: '2,3' }],
  kapitel: [{ nr: 2, verse: [vers('2,2'), vers('2,3')] }],
};

test('assembliereBuch gruppiert Verse zweier Paraschot nach Kapitel', () => {
  const buch = assembliereBuch('devarim', [beta, alpha]); // Reihenfolge egal
  assert.deepStrictEqual(buch.verfuegbareKapitel, [1, 2]);
  assert.strictEqual(buch.buchDe, 'Devarim');
  assert.strictEqual(buch.buch, '5. Mose');
  const kap2 = buch.kapitel[2];
  assert.deepStrictEqual(kap2.verse.map(v => v.ref), ['2,1', '2,2', '2,3']);
  assert.deepStrictEqual(kap2.verse.map(v => v.paraDe), ['Alpha', 'Beta', 'Beta']);
  assert.strictEqual(kap2.startPara.de, 'Alpha');
});

test('assembliereBuch weist Aliyot dem jeweiligen Startvers zu', () => {
  const buch = assembliereBuch('devarim', [alpha, beta]);
  const kap2 = buch.kapitel[2];
  const v21 = kap2.verse.find(v => v.ref === '2,1');
  const v22 = kap2.verse.find(v => v.ref === '2,2');
  assert.strictEqual(v21.aliyah, null);
  assert.ok(v22.aliyah && v22.aliyah.von === '2,2');
});

test('kapitelSeiteHtml setzt Trennbande vor den ersten Vers der neuen Paraschah', () => {
  const buch = assembliereBuch('devarim', [alpha, beta]);
  const html = kapitelSeiteHtml(buch, 2);
  const trennIdx = html.indexOf('Hier beginnt Paraschah <b>Beta</b>');
  const v22Idx = html.indexOf('id="v2-2"');
  const v21Idx = html.indexOf('id="v2-1"');
  assert.ok(trennIdx > -1, 'Trennbande fehlt');
  assert.ok(v21Idx > -1 && v22Idx > -1, 'Verse fehlen');
  assert.ok(v21Idx < trennIdx, 'Trennbande darf nicht vor 2,1 stehen');
  assert.ok(trennIdx < v22Idx, 'Trennbande muss vor 2,2 stehen');
});

test('reines Kapitel bekommt keine Trennbande, aber ein Kapitel-Kontext-Band mit einer Paraschah', () => {
  const buch = assembliereBuch('devarim', [alpha, beta]);
  const html = kapitelSeiteHtml(buch, 1);
  assert.doesNotMatch(html, /paratrenn/);
  assert.match(html, /parakontext/);
  assert.match(html, /In diesem Kapitel/);
  assert.match(html, /class="pk-para" href="#v1-1"><b>Alpha<\/b>/);
  assert.doesNotMatch(html, /Beginn der Paraschah/);
});

test('Kapitel-Kontext-Band zeigt beide Paraschot mit Sprung zum jeweils ersten Vers im Kapitel', () => {
  const buch = assembliereBuch('devarim', [alpha, beta]);
  const html = kapitelSeiteHtml(buch, 2);
  const bandIdx = html.indexOf('class="parakontext"');
  assert.ok(bandIdx > -1, 'Kapitel-Kontext-Band fehlt');
  const band = html.slice(bandIdx, html.indexOf('</div>', html.indexOf('</div>', bandIdx) + 1) + 6);
  assert.match(band, /class="pk-para" href="#v2-1"><b>Alpha<\/b>/);
  assert.match(band, /class="pk-para" href="#v2-2"><b>Beta<\/b>/);
  assert.match(band, /class="sep">·<\/span>/);
});

// --- Seiten-Gerüst und Orientierung -----------------------------------------

test('kapitelSeiteHtml bindet Navigation, Styles, Skripte und Wrapper ein', () => {
  const buch = assembliereBuch('devarim', [alpha, beta]);
  const html = kapitelSeiteHtml(buch, 1);
  assert.match(html, /<site-nav><\/site-nav>/);
  assert.match(html, /href="\/styles\.css"/);
  assert.match(html, /href="\/tora\/lesen\.css"/);
  assert.match(html, /src="\/tora\/lesen\.js"/);
  assert.match(html, /src="\/site-nav\.js"/);
  assert.match(html, /<div class="tora-page">/);
  // site-nav steht VOR dem .tora-page-Wrapper (Nav bleibt unberührt).
  assert.ok(html.indexOf('<site-nav>') < html.indexOf('class="tora-page"'));
});

test('kapitelSeiteHtml und buchUebersichtHtml laden KEINE Google-Fonts mehr (DSGVO: Schriften lokal via styles.css)', () => {
  const buch = assembliereBuch('devarim', [alpha, beta]);
  const kapitelHtml = kapitelSeiteHtml(buch, 1);
  assert.ok(!/fonts\.googleapis\.com/.test(kapitelHtml), 'kein fonts.googleapis.com-Verweis mehr erlaubt');
  assert.ok(!/fonts\.gstatic\.com/.test(kapitelHtml), 'kein fonts.gstatic.com-Verweis mehr erlaubt');
  assert.match(kapitelHtml, /href="\/styles\.css"/);
  const uebersichtHtml = buchUebersichtHtml(buch);
  assert.ok(!/fonts\.googleapis\.com/.test(uebersichtHtml), 'kein fonts.googleapis.com-Verweis mehr erlaubt');
  assert.ok(!/fonts\.gstatic\.com/.test(uebersichtHtml), 'kein fonts.gstatic.com-Verweis mehr erlaubt');
  assert.match(uebersichtHtml, /href="\/styles\.css"/);
});

test('kapitelSeiteHtml hat drei Textgroessen-Buttons und der Reader startet mit size-s', () => {
  const buch = assembliereBuch('devarim', [alpha, beta]);
  const html = kapitelSeiteHtml(buch, 1);
  assert.match(html, /<div class="reader mode-both size-s" id="reader">/);
  assert.match(html, /id="segGroesse"/);
  assert.match(html, /<button data-groesse="s" class="on">A<\/button>/);
  assert.match(html, /<button data-groesse="m">A<\/button>/);
  assert.match(html, /<button data-groesse="l">A<\/button>/);
});

test('kapitelSeiteHtml zeigt Buch und Kapitel als Überschrift, nicht die Paraschah', () => {
  const buch = assembliereBuch('devarim', [alpha, beta]);
  const html = kapitelSeiteHtml(buch, 2);
  assert.match(html, /<h1 class="title">Devarim · Kapitel 2<\/h1>/);
  assert.match(html, /<title>Devarim Kapitel 2 – Tora lesen – Schalom Israel<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/www\.schalomisrael\.de\/tora\/devarim\/2\/"/);
  assert.match(html, /5\. Mose · <span class="he">דְּבָרִים<\/span>/);
});

test('kapitelSeiteHtml enthält den mitlaufenden Paraschah-Streifen', () => {
  const buch = assembliereBuch('devarim', [alpha, beta]);
  const html = kapitelSeiteHtml(buch, 2);
  assert.match(html, /class="para-sticky">Paraschah <b id="para-now">Alpha<\/b>/);
});

test('kapitelSeiteHtml hat keine Tageslesungen-Leiste mehr', () => {
  const buch = assembliereBuch('devarim', [alpha, beta]);
  const html = kapitelSeiteHtml(buch, 1);
  assert.doesNotMatch(html, /tl-wrap|Tageslesungen \(Aliyot\)/);
});

test('kapitelSeiteHtml nutzt neutrale Pager-Texte und blaues Geburtstags-Cover', () => {
  const buch = assembliereBuch('devarim', [alpha, beta]);
  const html = kapitelSeiteHtml(buch, 1);
  assert.doesNotMatch(html, /weiter durch .* blättern/);
  assert.match(html, /class="cover-blau"/);
});

// --- Pager ------------------------------------------------------------------

test('pagerHtml deaktiviert die Ränder mit Anfang/Ende', () => {
  const buch = assembliereBuch('devarim', [alpha, beta]);
  const ersteSeite = pagerHtml(buch, 1);
  assert.match(ersteSeite, /<button disabled>&larr; Anfang<\/button>/);
  assert.match(ersteSeite, /Kapitel 2 &rarr;/);
  assert.match(ersteSeite, /<span class="pos">Kapitel 1<\/span>/);
  const letzteSeite = pagerHtml(buch, 2);
  assert.match(letzteSeite, /&larr; Kapitel 1/);
  assert.match(letzteSeite, /<button disabled>Ende &rarr;<\/button>/);
});

// --- Buch-Übersicht ---------------------------------------------------------

test('buchUebersichtHtml listet vorhandene Kapitel als Chips, gruppiert nach Paraschah', () => {
  const buch = assembliereBuch('devarim', [alpha, beta]);
  const html = buchUebersichtHtml(buch);
  assert.match(html, /Devarim/);
  assert.match(html, /Die Tora online lesen/);
  assert.match(html, /href="\/tora\/devarim\/1\/"/);
  assert.match(html, /href="\/tora\/devarim\/2\/"/);
  assert.match(html, /Paraschah Alpha/);
  assert.match(html, /Weitere Kapitel folgen\./);
  assert.match(html, /href="\/tora\/"/);
});

// --- Tetragramm ohne Nikud (bare יהוה, Reverenz) -----------------------------

test('entferneTetragrammNikud entfernt Nikud/Taamim NUR vom Gottesnamen, das Wort davor bleibt vokalisiert', () => {
  const ausgabe = entferneTetragrammNikud('וַיְדַבֵּ֣ר יְהֹוָ֔ה');
  const woerter = ausgabe.split(' ');
  assert.strictEqual(woerter[0], 'וַיְדַבֵּ֣ר', 'erstes Wort bleibt vokalisiert');
  assert.strictEqual(woerter[1], 'יהוה', 'aus dem Gottesnamen wird bare יהוה');
});

test('entferneTetragrammNikud laesst ein Wort ohne den Gottesnamen unveraendert', () => {
  const eingabe = 'בְּרֵאשִׁית';
  assert.strictEqual(entferneTetragrammNikud(eingabe), eingabe);
});

test('entferneTetragrammNikud erkennt das Tetragramm auch direkt nach einem Maqaf-Wort', () => {
  assert.strictEqual(entferneTetragrammNikud('אֶל־יְהֹוָה֮'), 'אֶל־יהוה');
});

test('entferneTetragrammNikud loest bei "Jehoschua" keinen Fehlalarm aus (4. Buchstabe Schin, nicht He)', () => {
  const eingabe = 'יְהוֹשֻׁעַ';
  assert.strictEqual(entferneTetragrammNikud(eingabe), eingabe);
});

test('versHtml stellt das Tetragramm in der HE-Spalte bare dar, die DE-Spalte bleibt unangetastet', () => {
  const html = versHtml({
    ref: '1,1',
    he: [{ id: 'a1', t: 'וַיְדַבֵּ֣ר' }, { id: 'a2', t: 'יְהֹוָ֔ה' }],
    de: [{ id: 'a1', t: 'Und es sprach' }, { id: 'a2', t: 'der Ewige' }],
  });
  const heColStart = html.indexOf('class="he-col"');
  const heCol = html.slice(heColStart, html.indexOf('</div>', heColStart));
  assert.match(heCol, /data-g="a2">יהוה</);
  assert.doesNotMatch(heCol, /יְהֹוָה/);
  assert.match(html, /der Ewige/);
});

// --- Geburtstags-Cover ohne Davidstern ---------------------------------------

test('Geburtstags-Cover enthaelt KEINEN Davidstern (kein polygon/Sternpfad), aber Goldrahmen und die hebraeische Zeile', () => {
  assert.doesNotMatch(GEBURTSTAG_COVER_SVG, /polygon/);
  assert.match(GEBURTSTAG_COVER_SVG, /מַזָּל טוֹב/);
  assert.match(GEBURTSTAG_COVER_SVG, /stroke="#c8a962"/);
});

test('kapitelSeiteHtml bindet das Geburtstags-Cover ohne Davidstern ein', () => {
  const buch = assembliereBuch('devarim', [alpha, beta]);
  const html = kapitelSeiteHtml(buch, 1);
  assert.doesNotMatch(html, /polygon/);
  assert.match(html, /cover-blau/);
});

// --- SEO: Meta-Description, Open Graph, JSON-LD, Breadcrumb ------------------

test('kapitelSeiteHtml hat eine aussagekraeftige Meta-Description mit Paraschah-Bezug', () => {
  const buch = assembliereBuch('devarim', [alpha, beta]);
  const html = kapitelSeiteHtml(buch, 2);
  assert.match(html, /<meta name="description" content="[^"]*Kapitel 2[^"]*Paraschot Alpha und Beta[^"]*">/);
});

test('kapitelSeiteHtml setzt Open-Graph-Tags inkl. og:type=article und og:url=canonical', () => {
  const buch = assembliereBuch('devarim', [alpha, beta]);
  const html = kapitelSeiteHtml(buch, 1);
  assert.match(html, /<meta property="og:title" content="[^"]+">/);
  assert.match(html, /<meta property="og:description" content="[^"]+">/);
  assert.match(html, /<meta property="og:type" content="article">/);
  assert.match(html, /<meta property="og:url" content="https:\/\/www\.schalomisrael\.de\/tora\/devarim\/1\/">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/www\.schalomisrael\.de\/buecher\/devarim\/cover\.jpg">/);
});

test('kapitelSeiteHtml enthaelt valides JSON-LD (Article) mit headline, inLanguage, about, isPartOf, publisher, mainEntityOfPage', () => {
  const buch = assembliereBuch('devarim', [alpha, beta]);
  const html = kapitelSeiteHtml(buch, 2);
  const bloecke = [...html.matchAll(/<script type="application\/ld\+json">\n([\s\S]*?)\n  <\/script>/g)].map(m => JSON.parse(m[1]));
  const article = bloecke.find(b => b['@type'] === 'Article');
  assert.ok(article, 'Article-Block fehlt');
  assert.strictEqual(article.headline, 'Devarim Kapitel 2 – Tora lesen – Schalom Israel');
  assert.deepStrictEqual(article.inLanguage, ['de', 'he']);
  assert.strictEqual(article.about.length, 2);
  assert.ok(article.about.some(a => a.name.startsWith('Alpha')));
  assert.ok(article.about.some(a => a.name.startsWith('Beta')));
  assert.ok(article.isPartOf && article.isPartOf['@type']);
  assert.strictEqual(article.publisher.name, 'Schalom Israel');
  assert.strictEqual(article.publisher.url, 'https://www.schalomisrael.de');
  assert.strictEqual(article.mainEntityOfPage['@id'], 'https://www.schalomisrael.de/tora/devarim/2/');
  assert.strictEqual(article.url, 'https://www.schalomisrael.de/tora/devarim/2/');
});

test('kapitelSeiteHtml enthaelt eine valide BreadcrumbList: Home -> Tora lesen -> Buch -> Kapitel', () => {
  const buch = assembliereBuch('devarim', [alpha, beta]);
  const html = kapitelSeiteHtml(buch, 1);
  const bloecke = [...html.matchAll(/<script type="application\/ld\+json">\n([\s\S]*?)\n  <\/script>/g)].map(m => JSON.parse(m[1]));
  const breadcrumb = bloecke.find(b => b['@type'] === 'BreadcrumbList');
  assert.ok(breadcrumb, 'BreadcrumbList-Block fehlt');
  const namen = breadcrumb.itemListElement.map(i => i.name);
  assert.deepStrictEqual(namen, ['Home', 'Tora lesen', 'Devarim', 'Kapitel 1']);
  assert.strictEqual(breadcrumb.itemListElement[2].item, 'https://www.schalomisrael.de/tora/devarim/');
  assert.ok(!('item' in breadcrumb.itemListElement[3]), 'letzter Eintrag (aktuelle Seite) darf keine item-URL haben');
});

test('buchUebersichtHtml hat eine sinnvolle Meta-Description und Open-Graph-Tags', () => {
  const buch = assembliereBuch('devarim', [alpha, beta]);
  const html = buchUebersichtHtml(buch);
  assert.match(html, /<meta name="description" content="[^"]*Devarim[^"]*">/);
  assert.match(html, /<meta property="og:title" content="[^"]+">/);
  assert.match(html, /<meta property="og:type" content="website">/);
  assert.match(html, /<meta property="og:url" content="https:\/\/www\.schalomisrael\.de\/tora\/devarim\/">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/www\.schalomisrael\.de\/buecher\/devarim\/cover\.jpg">/);
});
