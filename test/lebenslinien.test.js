// Prueft die Lebenslinien gegen die Zahlen der Tora und gegen die Saetze,
// die auf der Seite stehen. Jede Zahl, die ein Leser nachrechnen kann,
// muss hier aufgehen.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const L = require('../entdecken/lebenslinien/daten.js');

const p = (id) => {
  const x = L.finde(id);
  assert.ok(x, 'Person fehlt: ' + id);
  return x;
};

// Bereschit 5 und 11: [Vater, Sohn, Alter des Vaters bei der Geburt, Lebensjahre des Vaters]
const ZEUGUNGEN = [
  ['adam', 'schet', 130, 930],
  ['schet', 'enosch', 105, 912],
  ['enosch', 'kenan', 90, 905],
  ['kenan', 'mahalalel', 70, 910],
  ['mahalalel', 'jered', 65, 895],
  ['jered', 'chanoch', 162, 962],
  ['chanoch', 'metuschelach', 65, 365],
  ['metuschelach', 'lemech', 187, 969],
  ['lemech', 'noach', 182, 777],
  ['schem', 'arpachschad', 100, 600],
  ['arpachschad', 'schelach', 35, 438],
  ['schelach', 'ewer', 30, 433],
  ['ewer', 'peleg', 34, 464],
  ['peleg', 'reu', 30, 239],
  ['reu', 'serug', 32, 239],
  ['serug', 'nachor', 30, 230],
  ['nachor', 'terach', 29, 148],
  ['terach', 'abraham', 70, 205],
  ['abraham', 'jizchak', 100, 175],
  ['jizchak', 'jakob', 60, 180],
];

test('Bereschit 5 und 11: Geburt und Lebensjahre gehen auf', () => {
  for (const [vater, sohn, alter, jahre] of ZEUGUNGEN) {
    assert.strictEqual(p(sohn).geburt - p(vater).geburt, alter, sohn + ' kommt zur falschen Zeit');
    assert.strictEqual(L.lebensjahre(p(vater)), jahre, vater + ' hat die falsche Lebensdauer');
  }
});

test('Weitere Lebensdauern aus der Tora', () => {
  const dauer = { noach: 950, jakob: 147, josef: 110, sara: 127, jischmael: 137, levi: 137, aharon: 123, mosche: 120, josua: 110 };
  for (const id in dauer) assert.strictEqual(L.lebensjahre(p(id)), dauer[id], id);
});

test('Festpunkte stimmen mit der Zeittafel des Buches überein', () => {
  assert.strictEqual(p('noach').geburt + 600, 1656, 'Noach ist 600 bei der Flut');
  assert.strictEqual(p('metuschelach').tod, 1656);
  assert.strictEqual(p('schem').geburt + 100, p('arpachschad').geburt - 0, 'Schem 100 bei Arpachschad');
  assert.strictEqual(p('arpachschad').geburt, 1658, 'zwei Jahre nach der Flut');
  assert.strictEqual(p('abraham').geburt, 1948);
  assert.strictEqual(p('peleg').tod, 1996, 'Turm von Babel');
  assert.strictEqual(p('sara').tod, 2085, 'Bindung Jizchaks');
  assert.strictEqual(p('jizchak').tod, 2228);
  assert.strictEqual(p('jocheved').geburt, 2238, 'Ankunft in Ägypten');
  assert.strictEqual(p('mosche').geburt - p('jocheved').geburt, 130);
  assert.strictEqual(p('mosche').geburt - p('aharon').geburt, 3);
  assert.strictEqual(p('levi').tod, 2332);
  assert.strictEqual(p('mosche').tod, 2488);
});

test('Abrahams Geburt: alle zehn Generationen von Noach bis Terach leben', () => {
  const zehn = ['noach', 'schem', 'arpachschad', 'schelach', 'ewer', 'peleg', 'reu', 'serug', 'nachor', 'terach'];
  for (const id of zehn) assert.ok(L.lebtIm(p(id), 1948), id + ' lebt 1948 nicht');
});

test('Die Sätze der Sprungmarken stimmen', () => {
  assert.strictEqual(L.alterIm(p('lemech'), 930), 56);
  assert.strictEqual(L.alterIm(p('schem'), 1656), 98);
  assert.strictEqual(L.alterIm(p('abraham'), 1996), 48);
  assert.strictEqual(L.alterIm(p('abraham'), 2006), 58);
  assert.strictEqual(p('schem').tod - p('abraham').tod, 35);
  assert.strictEqual(p('ewer').tod - p('abraham').tod, 64);
  assert.strictEqual(L.alterIm(p('jakob'), 2123), 15);
  assert.strictEqual(L.alterIm(p('jakob'), 2158), 50);
  assert.strictEqual(L.alterIm(p('mosche'), 2448), 80);
  assert.strictEqual(L.alterIm(p('aharon'), 2448), 83);
});

test('Die Kette der Sieben: Überschneidungen wie angegeben', () => {
  assert.strictEqual(L.gemeinsam(p('adam'), p('metuschelach')), 243);
  assert.strictEqual(L.gemeinsam(p('metuschelach'), p('schem')), 98);
  assert.strictEqual(L.gemeinsam(p('schem'), p('jakob')), 50);
  for (const k of L.KETTE) {
    if (k.verbindung && /Jahre gemeinsam/.test(k.verbindung)) {
      const zahl = parseInt(k.verbindung, 10);
      const i = L.KETTE.indexOf(k);
      assert.strictEqual(L.gemeinsam(p(L.KETTE[i - 1].id), p(k.id)), zahl, k.name);
    }
  }
});

test('Eltern verweisen auf vorhandene Personen, Kinder kommen nach den Eltern', () => {
  for (const x of L.PERSONEN) {
    for (const e of x.eltern) {
      const el = p(e);
      assert.ok(x.geburt > el.geburt, x.id + ' vor ' + e + ' geboren');
      assert.ok(x.geburt <= L.ende(el) + 1, x.id + ' nach dem Tod von ' + e + ' geboren');
    }
  }
});

test('Personen sind nach Geburt geordnet und eindeutig', () => {
  const ids = new Set();
  for (let i = 0; i < L.PERSONEN.length; i++) {
    const x = L.PERSONEN[i];
    assert.ok(!ids.has(x.id), 'doppelt: ' + x.id);
    ids.add(x.id);
    if (i > 0) assert.ok(x.geburt >= L.PERSONEN[i - 1].geburt, 'Reihenfolge bei ' + x.id);
    assert.ok(L.ende(x) <= L.ENDE_ACHSE, x.id + ' ragt über die Achse');
  }
});

test('Jede Fundstelle zeigt auf einen vorhandenen Vers im Tora-Text', () => {
  for (const x of L.PERSONEN) {
    const [buch, kap, vers] = x.stelle;
    const datei = path.join(__dirname, '..', 'tora', buch, String(kap), 'index.html');
    assert.ok(fs.existsSync(datei), x.id + ': Kapitel fehlt ' + datei);
    const html = fs.readFileSync(datei, 'utf8');
    assert.ok(html.includes('id="v' + kap + '-' + vers + '"'), x.id + ': Vers fehlt');
  }
});

test('Verlinkte Artikel gibt es', () => {
  for (const x of L.PERSONEN) {
    for (const [slug] of x.artikel || []) {
      assert.ok(fs.existsSync(path.join(__dirname, '..', slug, 'index.html')), x.id + ': Artikel fehlt ' + slug);
    }
  }
});

test('Texte: keine Gedankenstriche als Trennzeichen, kein ausgeschriebener Gottesname', () => {
  const texte = [];
  for (const x of L.PERSONEN) texte.push(x.notiz || '');
  for (const s of L.SPRUNGMARKEN) texte.push(s.satz);
  for (const t of texte) {
    assert.ok(!/ [–—-] /.test(t), 'Gedankenstrich in: ' + t);
    assert.ok(!/[ייי]הו[ה]|JHWH|Jahwe/i.test(t), 'Gottesname in: ' + t);
    assert.ok(!/Haschem|Elokim|\bKel\b/i.test(t), 'Ersatzform statt „Gott“ in: ' + t);
  }
});
