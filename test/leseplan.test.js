// Leseplan: der Tanach in einem Jahr (/fuer-dich/leseplan/)
// Fixture: echte Hebcal-Lesungen (Diaspora) für die Lesejahre 5787 und 5788,
// gekürzt auf die Felder, die der Plan braucht.
const test = require('node:test');
const assert = require('node:assert');
const L = require('../fuer-dich/leseplan/plan.js');
const T = require('../fuer-dich/leseplan/tanach-buecher.js');
const ITEMS = require('./fixtures/hebcal-leyning-5787-5788.json');

const PLAENE = {
  5787: L.baueLeseplan(ITEMS, L.lesejahr(5787)),
  5788: L.baueLeseplan(ITEMS, L.lesejahr(5788)),
};

test('Bücherdaten: 39 Bücher, 929 Kapitel, 23.206 Verse', () => {
  assert.strictEqual(T.BUECHER.length, 39);
  const kap = T.BUECHER.reduce((s, b) => s + b.kapitel.length, 0);
  const verse = T.BUECHER.reduce((s, b) => s + b.kapitel.reduce((a, v) => a + v, 0), 0);
  assert.strictEqual(kap, 929);
  assert.strictEqual(verse, 23206);
  assert.strictEqual(T.BUECHER.filter((b) => b.rolle).length, 5);
  assert.ok(T.BUECHER.every((b) => b.teil !== 'tora' || b.slug), 'jedes Tora-Buch hat eine Or-Tora-Adresse');
});

test('Hebräisches Datum ohne "AM"', () => {
  assert.strictEqual(L.hebraeischesDatum('2026-11-24'), '14. Kislew 5787');
  assert.strictEqual(L.hebraeischesDatum('2026-12-26'), '16. Tewet 5787');
  assert.strictEqual(L.hebraeischesDatum('2027-01-20'), '12. Schwat 5787');
});

test('Lesejahr läuft vom Tag nach Simchat Tora bis zum nächsten Simchat Tora', () => {
  assert.deepStrictEqual(L.lesejahr(5787), { jahr: 5787, start: '2026-10-05', ende: '2027-10-24', tage: 385 });
  assert.deepStrictEqual(L.lesejahr(5788), { jahr: 5788, start: '2027-10-25', ende: '2028-10-13', tage: 355 });
  assert.strictEqual(L.lesejahrFuer('2026-11-24').jahr, 5787);
  assert.strictEqual(L.lesejahrFuer('2026-10-04').jahr, 5786, 'Simchat Tora selbst ist der letzte Tag des alten Jahres');
  assert.strictEqual(L.lesejahrFuer('2026-10-05').jahr, 5787);
  assert.strictEqual(L.lesejahrFuer('2027-10-24').jahr, 5787);
  // Simchat Tora fällt in der Diaspora nie auf einen Schabbat
  for (let j = 5780; j < 5810; j++) assert.notStrictEqual(L.wochentag(L.simchatTora(j)), 6, 'Jahr ' + j);
});

test('Hebcal-Abfragen: lückenlos, je höchstens 170 Tage', () => {
  const lj = L.lesejahr(5787);
  const st = L.abfrageStuecke(lj.start, lj.ende);
  assert.strictEqual(st[0][0], lj.start);
  assert.strictEqual(st[st.length - 1][1], lj.ende);
  st.forEach(([von, bis], i) => {
    assert.ok(L.tageZwischen(von, bis) < 170);
    if (i) assert.strictEqual(L.plusTage(st[i - 1][1], 1), von);
  });
});

test('Stellen auf Deutsch', () => {
  assert.strictEqual(L.versbereich('32:4', '32:13'), '32,4–13');
  assert.strictEqual(L.versbereich('32:31', '33:5'), '32,31–33,5');
  assert.strictEqual(L.stelle([{ k: 'Genesis', b: '1:1', e: '2:3' }, { k: 'Genesis', b: '2:4', e: '2:19' }]), '1. Mose 1,1–2,19');
  assert.strictEqual(L.stelle([{ k: 'Isaiah', b: '54:1', e: '55:5' }]), 'Jesaja 54,1–55,5');
  assert.strictEqual(L.verseIn({ k: 'Genesis', b: '1:1', e: '2:3' }), 34);
});

for (const jahr of [5787, 5788]) {
  const plan = PLAENE[jahr];
  const lj = L.lesejahr(jahr);

  test(jahr + ': jeder Tag hat Tora und Propheten/Schriften', () => {
    assert.strictEqual(plan.length, lj.tage);
    plan.forEach((d) => {
      assert.ok(d.tora && d.tora.stelle, d.datum + ' Tora');
      assert.ok(d.tora.teile.length >= 1, d.datum);
      assert.ok(d.nk && d.nk.stelle, d.datum + ' Propheten/Schriften');
      assert.ok(d.nk.abschnitte.length >= 1, d.datum);
    });
  });

  test(jahr + ': die ganze Tora wird gelesen (Wochenlesungen plus Wesot ha-Beracha)', () => {
    const gelesen = new Set();
    plan.forEach((d) => {
      if (d.tora.art === 'fest') return;
      d.tora.teile.forEach((t) => {
        const b = T.buch(t.k);
        let [k, v] = t.b.split(':').map(Number);
        const [ek, ev] = t.e.split(':').map(Number);
        for (;;) {
          gelesen.add(b.en + ' ' + k + ':' + v);
          if (k === ek && v === ev) break;
          v++;
          if (v > b.kapitel[k - 1]) { k++; v = 1; }
        }
      });
    });
    const fehlt = [];
    T.BUECHER.filter((b) => b.teil === 'tora').forEach((b) => {
      b.kapitel.forEach((n, i) => {
        for (let v = 1; v <= n; v++) if (!gelesen.has(b.en + ' ' + (i + 1) + ':' + v)) fehlt.push(b.en + ' ' + (i + 1) + ':' + v);
      });
    });
    assert.deepStrictEqual(fehlt.slice(0, 5), []);
  });

  test(jahr + ': jedes Kapitel der Propheten und Schriften genau einmal, in Reihenfolge', () => {
    const gelesen = [];
    plan.forEach((d) => d.nk.abschnitte.forEach((a) => {
      for (let k = a.von; k <= a.bis; k++) gelesen.push(a.buch.en + ' ' + k);
    }));
    const soll = [];
    T.BUECHER.filter((b) => b.teil !== 'tora').forEach((b) => b.kapitel.forEach((_, i) => soll.push(b.en + ' ' + (i + 1))));
    assert.strictEqual(gelesen.length, 742);
    assert.deepStrictEqual([...gelesen].sort(), [...soll].sort());
    const fortlaufend = gelesen.filter((g) => !T.buch(g.replace(/ \d+$/, '')).rolle);
    assert.deepStrictEqual(fortlaufend, soll.filter((g) => !T.buch(g.replace(/ \d+$/, '')).rolle));
  });

  test(jahr + ': die fünf Rollen liegen an ihren Festen', () => {
    const rollen = plan.filter((d) => d.nk.art === 'rolle');
    const zuordnung = Object.fromEntries(rollen.map((d) => [d.nk.abschnitte[0].buch.en, d.nk.fest]));
    assert.deepStrictEqual(zuordnung, {
      Esther: 'Purim',
      'Song of Songs': 'Pessach',
      Ruth: 'Schawuot',
      Lamentations: 'Tischa BeAw',
      Ecclesiastes: jahr === 5787 ? 'Schmini Azeret' : 'Sukkot',
    });
  });

  test(jahr + ': volle Wochen laufen Sonntag Rischon bis Schabbat Schewii, Schabbat mit Haftara', () => {
    plan.forEach((d, i) => {
      if (i < 7 || d.tora.art !== 'parascha') return;
      assert.deepStrictEqual(d.tora.aliyot, [d.wochentag + 1], d.datum);
    });
    const schabbatot = plan.filter((d) => d.wochentag === 6);
    assert.ok(schabbatot.every((d) => d.haftara), 'jeder Schabbat hat eine Haftara');
    assert.ok(plan.filter((d) => d.wochentag !== 6).every((d) => !d.haftara));
  });

  test(jahr + ': Tagespensum bleibt lesbar', () => {
    const nk = plan.filter((d) => d.nk.art === 'fortlaufend').map((d) => d.nk.verse);
    const schnitt = nk.reduce((a, b) => a + b, 0) / nk.length;
    assert.ok(schnitt > 40 && schnitt < 55, 'Schnitt ' + schnitt);
    // Ausreißer sind nur einzelne lange Kapitel (Psalm 119 hat 176 Verse)
    assert.ok(Math.max(...nk) <= 180, 'Maximum ' + Math.max(...nk));
  });

  test(jahr + ': Abschlüsse der fünf Bücher Mose und das Jahresende', () => {
    const tora = plan.flatMap((d) => d.abschluesse.filter((a) => a.teil === 'tora').map((a) => a.buch));
    assert.deepStrictEqual(tora, ['1. Mose', '2. Mose', '3. Mose', '4. Mose', '5. Mose']);
    const letzter = plan[plan.length - 1];
    assert.strictEqual(letzter.datum, lj.ende);
    assert.strictEqual(letzter.tora.name, 'Wesot ha-Beracha');
    assert.ok(letzter.abschluesse.some((a) => a.teil === 'jahr'));
    const nkEnden = plan.flatMap((d) => d.abschluesse.filter((a) => a.teil === 'nk'));
    assert.strictEqual(nkEnden.length, 34, 'jedes Buch der Propheten und Schriften endet einmal');
  });

  test(jahr + ': Or-Tora-Links zeigen auf Buch, Kapitel und Vers', () => {
    plan.forEach((d) => assert.match(d.tora.link, /^\/tora\/(bereschit|schemot|wajikra|bamidbar|devarim)\/\d+\/#v\d+-\d+$/, d.datum));
  });
}

test('Mehrseitiges PDF: Seitenzahl stimmt, jeder Querverweis trifft sein Objekt', () => {
  const MiniPDF = require('../entdecken/pdf.js');
  const fake = (n) => new Uint8Array(n).fill(0x41);
  const bytes = MiniPDF.ausJpegSeiten([
    { bytes: fake(10), breite: 1240, hoehe: 1754 },
    { bytes: fake(20), breite: 1240, hoehe: 1754 },
    { bytes: fake(30), breite: 1240, hoehe: 1754 },
  ], 'Leseplan 5787 – Tanach');
  const text = Buffer.from(bytes).toString('latin1');
  assert.match(text, /\/Count 3 >>/);
  const xref = text.slice(text.lastIndexOf('\nxref\n'));
  const eintraege = xref.split('\n').filter((z) => / 00000 n $/.test(z)).map((z) => Number(z.slice(0, 10)));
  assert.strictEqual(eintraege.length, 1 + 1 + 9 + 1);
  eintraege.forEach((pos, i) => assert.ok(text.startsWith((i + 1) + ' 0 obj', pos), 'Objekt ' + (i + 1)));
  assert.ok(text.endsWith('%%EOF\n'));
});
