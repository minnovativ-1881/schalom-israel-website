const test = require('node:test');
const assert = require('node:assert');
const B = require('../entdecken/hebraeischer-geburtstag/blatt');

const ABSATZ = '<p>' + 'Ein Satz mit ordentlicher Laenge, damit die Rechnung stimmt. '.repeat(6) + '</p>';

test('kurzer Impuls bleibt unveraendert', () => {
  const h = '<h2>Titel</h2><p>Kurz.</p>';
  assert.strictEqual(B.kuerzeImpuls(h), h);
});

test('leerer Impuls bleibt leer', () => {
  assert.strictEqual(B.kuerzeImpuls(''), '');
  assert.strictEqual(B.kuerzeImpuls(null), '');
  assert.strictEqual(B.kuerzeImpuls(undefined), '');
});

test('langer Impuls wird gekuerzt', () => {
  const lang = '<h2>Titel</h2>' + ABSATZ.repeat(8);
  const k = B.kuerzeImpuls(lang);
  assert.ok(k.length < lang.length, 'sollte gekuerzt werden');
  assert.ok(k.length <= B.MAX_IMPULS, `${k.length} Zeichen, erlaubt sind ${B.MAX_IMPULS}`);
});

test('gekuerzt wird an einer Absatzgrenze, nie mitten im Satz', () => {
  const lang = '<h2>Titel</h2>' + ABSATZ.repeat(8);
  const k = B.kuerzeImpuls(lang);
  assert.ok(k.endsWith('</p>'), 'muss auf einen geschlossenen Absatz enden, endet auf: ' + k.slice(-20));
});

test('die Zahl der oeffnenden und schliessenden Absaetze stimmt ueberein', () => {
  const lang = '<h2>Titel</h2>' + ABSATZ.repeat(8);
  const k = B.kuerzeImpuls(lang);
  const auf = (k.match(/<p>/g) || []).length;
  const zu = (k.match(/<\/p>/g) || []).length;
  assert.strictEqual(auf, zu, 'kein halb offener Absatz');
});

test('ein einzelner riesiger Absatz wird nicht zerrissen', () => {
  // Kein Schnittpunkt vor MAX_IMPULS: lieber nur den ersten Absatz
  const riesig = '<p>' + 'x'.repeat(5000) + '</p><p>zweiter</p>';
  const k = B.kuerzeImpuls(riesig);
  const auf = (k.match(/<p>/g) || []).length;
  const zu = (k.match(/<\/p>/g) || []).length;
  assert.strictEqual(auf, zu);
  assert.ok(k === '' || k.endsWith('</p>'));
});

test('ein Blatt pro Tag ist frei', () => {
  assert.strictEqual(B.FREI_PRO_TAG, 1);
});

// Ohne localStorage (Node, oder Browser mit gesperrtem Speicher) darf das
// Blatt nicht blockieren. Lieber ein Blatt zu viel als ein totes Tool.
test('ohne Speicher bleibt das Blatt erreichbar', () => {
  assert.strictEqual(B.nochFrei(), true);
  assert.strictEqual(B.stand().anzahl, 0);
});

// ---------- Der PDF-Erzeuger ----------

const PDF = require('../entdecken/pdf');

// Ein winziges gueltiges JPEG (1x1, weiss) als Fuellung.
const JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a'
  + 'HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAA'
  + 'AAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==', 'base64');

function bytesAlsText(bytes) {
  return Buffer.from(bytes).toString('latin1');
}

test('das PDF hat Kopf, Ende und eine gueltige Objekttabelle', () => {
  const roh = bytesAlsText(PDF.ausJpeg(JPEG, 1240, 1754, 'Test'));
  assert.ok(roh.startsWith('%PDF-1.4'), 'kein PDF-Kopf');
  assert.ok(roh.trimEnd().endsWith('%%EOF'), 'kein Dateiende');
  assert.match(roh, /xref\n0 7\n/);
  assert.match(roh, /trailer/);
});

test('startxref zeigt genau auf die Objekttabelle', () => {
  const roh = bytesAlsText(PDF.ausJpeg(JPEG, 1240, 1754, 'Test'));
  const zeiger = Number(roh.match(/startxref\n(\d+)/)[1]);
  assert.strictEqual(roh.slice(zeiger, zeiger + 4), 'xref',
    'startxref zeigt nicht auf die Tabelle, PDF waere beschaedigt');
});

test('jeder Eintrag der Objekttabelle zeigt auf sein Objekt', () => {
  const roh = bytesAlsText(PDF.ausJpeg(JPEG, 1240, 1754, 'Test'));
  // Nach dem Kopf "xref\n0 7\n" (9 Zeichen) steht zuerst der Nulleintrag
  // (20 Zeichen), erst danach Objekt 1.
  const tabelle = roh.slice(roh.lastIndexOf('xref\n0 7\n') + 9 + 20);
  for (let i = 1; i <= 6; i++) {
    const pos = Number(tabelle.slice((i - 1) * 20, (i - 1) * 20 + 10));
    assert.strictEqual(roh.slice(pos, pos + 7), `${i} 0 obj`,
      `Eintrag ${i} zeigt auf "${roh.slice(pos, pos + 12)}"`);
  }
});

test('die Seite ist A4 im Hochformat', () => {
  const roh = bytesAlsText(PDF.ausJpeg(JPEG, 1240, 1754, 'Test'));
  assert.match(roh, /MediaBox \[0 0 595\.28 841\.89\]/);
});

test('das Bild wird als JPEG eingebettet, nicht neu kodiert', () => {
  const roh = bytesAlsText(PDF.ausJpeg(JPEG, 1240, 1754, 'Test'));
  assert.match(roh, /\/Filter \/DCTDecode/);
  assert.match(roh, new RegExp('/Length ' + JPEG.length + ' '));
  assert.match(roh, /\/Width 1240 \/Height 1754/);
});

test('das Bild behaelt sein Seitenverhaeltnis', () => {
  const roh = bytesAlsText(PDF.ausJpeg(JPEG, 1240, 1754, 'Test'));
  const [, b, h] = roh.match(/q ([\d.]+) 0 0 ([\d.]+) /).map(Number);
  assert.ok(b <= PDF.A4_BREIT + 0.01 && h <= PDF.A4_HOCH + 0.01, 'ragt ueber die Seite hinaus');
  assert.ok(Math.abs((b / h) - (1240 / 1754)) < 0.001, 'verzerrt');
});

// Klammern beenden in PDF eine Zeichenkette. Ungeschuetzt zerlegen sie die Datei.
test('Klammern im Titel zerlegen das PDF nicht', () => {
  const roh = bytesAlsText(PDF.ausJpeg(JPEG, 100, 100, 'Ein (Test) mit \\ Zeichen'));
  const titel = roh.match(/\/Title \(([^\n]*)\) \/Producer/)[1];
  assert.ok(!/(?<!\\)[()]/.test(titel), 'ungeschuetzte Klammer im Titel: ' + titel);
});

// Eine erste Fassung warf Umlaute weg, im Viewer stand "hebrischer".
test('Umlaute im Titel bleiben erhalten', () => {
  const roh = bytesAlsText(PDF.ausJpeg(JPEG, 100, 100, 'Dein hebräischer Geburtstag'));
  const titel = roh.match(/\/Title \((.*?)\) \/Producer/)[1];
  assert.ok(titel.startsWith('\xfe\xff'), 'keine UTF-16-Kennung');
  const text = Buffer.from(titel.slice(2).replace(/\\([()\\])/g, '$1'), 'latin1')
    .swap16().toString('utf16le');
  assert.strictEqual(text, 'Dein hebräischer Geburtstag');
});

test('reiner ASCII-Titel bleibt lesbar im Klartext', () => {
  const roh = bytesAlsText(PDF.ausJpeg(JPEG, 100, 100, 'Schalom Israel'));
  assert.match(roh, /\/Title \(Schalom Israel\)/);
});

test('das PDF laesst sich ohne Titel erzeugen', () => {
  const roh = bytesAlsText(PDF.ausJpeg(JPEG, 100, 100));
  assert.match(roh, /\/Title \(Schalom Israel\)/);
});
