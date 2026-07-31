const { test } = require('node:test');
const assert = require('node:assert');
const T = require('../tora/lib/tora-schema.js');

const gut = {
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

test('validate akzeptiert gültigen Datensatz', () => {
  assert.deepStrictEqual(T.validate(gut), []);
});

test('validate meldet fehlende Pflichtfelder', () => {
  const kaputt = JSON.parse(JSON.stringify(gut)); delete kaputt.aliyot;
  assert.ok(T.validate(kaputt).some(f => f.includes('aliyot')));
});

test('validate meldet de-id ohne he-Entsprechung', () => {
  const kaputt = JSON.parse(JSON.stringify(gut));
  kaputt.kapitel[0].verse[0].de.push({ id: 'zzz', t: 'x' });
  assert.ok(T.validate(kaputt).some(f => f.includes('zzz')));
});

test('validate erlaubt he-Partikel ohne de-Entsprechung', () => {
  assert.deepStrictEqual(T.validate(gut), []); // a2 ist particle, hat kein de
});
