const { test } = require('node:test');
const assert = require('node:assert');
const { versHtml, seitenHtml } = require('../tools/tora-seite-bauen.js');

test('versHtml erzeugt Spans mit data-g und markiert Partikel', () => {
  const html = versHtml({
    ref: '1,1',
    he: [{ id: 'a1', t: 'בְּרֵאשִׁית' }, { id: 'a2', t: 'אֵת', particle: true }],
    de: [{ id: 'a1', t: 'Im Anfang' }]
  });
  assert.match(html, /data-g="a1"[^>]*>Im Anfang/);
  assert.match(html, /class="tok particle" data-g="a2"/);
  assert.match(html, /class="ref"[^>]*>1,1/);
});

const fixture = {
  slug: 'probe', hebcalName: 'Bereshit', de: 'Probe', he: 'בְּרֵאשִׁית',
  meaning: 'Test', buch: '1. Mose', bereich: 'Genesis 1,1–1,1',
  aliyot: [{ n: 1, he: 'רִאשׁוֹן', de: 'Rischon', tag: 'Sonntag', von: '1,1', bis: '1,1' }],
  haftara: 'Jesaja 1,1',
  kapitel: [{ nr: 1, verse: [{
    ref: '1,1',
    he: [{ id: 'a1', t: 'בְּרֵאשִׁית' }, { id: 'a2', t: 'אֵת', particle: true }],
    de: [{ id: 'a1', t: 'Im Anfang' }]
  }]}]
};

test('seitenHtml bindet Navigation, Styles und Skripte ein', () => {
  const html = seitenHtml(fixture, 1);
  assert.match(html, /<site-nav><\/site-nav>/);
  assert.match(html, /href="\/tora\/lesen\.css"/);
  assert.match(html, /src="\/tora\/lesen\.js"/);
  assert.match(html, /src="\/site-nav\.js"/);
});

test('seitenHtml setzt die Aliyah-Bande vor den passenden Vers', () => {
  const html = seitenHtml(fixture, 1);
  const bandIdx = html.indexOf('id="aliyah-1"');
  const versIdx = html.indexOf('id="v1-1"');
  assert.ok(bandIdx > -1, 'Aliyah-Bande fehlt');
  assert.ok(versIdx > -1, 'Vers fehlt');
  assert.ok(bandIdx < versIdx, 'Aliyah-Bande muss vor dem Vers stehen');
});

test('seitenHtml deaktiviert den Pager am einzigen Kapitel der Paraschah', () => {
  const html = seitenHtml(fixture, 1);
  const pagerMatches = html.match(/<div class="pager">[\s\S]*?<\/div>/g) || [];
  assert.ok(pagerMatches.length >= 1, 'Kein Pager gefunden');
  pagerMatches.forEach(p => {
    assert.match(p, /disabled/);
    assert.match(p, /Anfang der Paraschah/);
    assert.match(p, /Ende der Paraschah/);
  });
});
