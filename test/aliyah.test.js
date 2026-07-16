const test = require('node:test');
const assert = require('node:assert');
const { aliyahNummer, ALIYAH_NAMEN, naechsterSchabbat, wirksamesDatum } = require('../entdecken/aliyah');

test('Sonntag ist die erste Aliyah', () => {
  assert.strictEqual(aliyahNummer(new Date('1990-05-13T12:00:00Z')), 1);
});

test('Dienstag ist die dritte Aliyah', () => {
  assert.strictEqual(aliyahNummer(new Date('1990-05-15T12:00:00Z')), 3);
});

test('Schabbat ist die siebte Aliyah', () => {
  assert.strictEqual(aliyahNummer(new Date('1990-05-19T12:00:00Z')), 7);
});

test('Aliyah-Namen sind vollstaendig', () => {
  assert.strictEqual(ALIYAH_NAMEN[1], 'Rischon');
  assert.strictEqual(ALIYAH_NAMEN[3], 'Schlischi');
  assert.strictEqual(ALIYAH_NAMEN[7], 'Schwii');
  assert.strictEqual(Object.keys(ALIYAH_NAMEN).length, 7);
});

test('naechster Schabbat von einem Dienstag', () => {
  assert.strictEqual(naechsterSchabbat(new Date('1990-05-15T12:00:00Z')), '1990-05-19');
});

test('naechster Schabbat von einem Schabbat ist derselbe Tag', () => {
  assert.strictEqual(naechsterSchabbat(new Date('1990-05-19T12:00:00Z')), '1990-05-19');
});

test('naechster Schabbat ueber Monatsgrenze', () => {
  assert.strictEqual(naechsterSchabbat(new Date('1990-05-30T12:00:00Z')), '1990-06-02');
});

test('vor Sonnenuntergang bleibt das Datum', () => {
  assert.strictEqual(wirksamesDatum('1990-05-15', false), '1990-05-15');
});

test('nach Sonnenuntergang zaehlt der Folgetag', () => {
  assert.strictEqual(wirksamesDatum('1990-05-15', true), '1990-05-16');
});

test('nach Sonnenuntergang ueber Monatsgrenze', () => {
  assert.strictEqual(wirksamesDatum('1990-05-31', true), '1990-06-01');
});

test('nach Sonnenuntergang ueber Jahresgrenze', () => {
  assert.strictEqual(wirksamesDatum('1990-12-31', true), '1991-01-01');
});

test('nach Sonnenuntergang im Schaltjahr ueber den 29. Februar', () => {
  assert.strictEqual(wirksamesDatum('2024-02-28', true), '2024-02-29');
});
