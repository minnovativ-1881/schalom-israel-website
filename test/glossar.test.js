const test = require('node:test');
const assert = require('node:assert');
const { GRUPPEN, EINTRAEGE } = require('../entdecken/glossar-daten');
const { enthaeltGottesnamen, substituiere } = require('../api/lib/gottesnamen');

test('die Sammlung hat eine sinnvolle Groesse', () => {
  assert.ok(EINTRAEGE.length >= 45, `nur ${EINTRAEGE.length} Eintraege`);
});

test('jeder Eintrag hat alle Pflichtfelder', () => {
  EINTRAEGE.forEach((e, i) => {
    assert.ok(e.b, `Eintrag ${i}: Begriff fehlt`);
    assert.ok(e.h, `${e.b}: hebraeische Schreibweise fehlt`);
    assert.ok(e.k, `${e.b}: Kurzbedeutung fehlt`);
    assert.ok(e.t, `${e.b}: Text fehlt`);
    assert.ok(e.g, `${e.b}: Gruppe fehlt`);
  });
});

test('jede Gruppe eines Eintrags existiert auch', () => {
  const ids = new Set(GRUPPEN.map((g) => g.id));
  EINTRAEGE.forEach((e) => {
    assert.ok(ids.has(e.g), `${e.b}: unbekannte Gruppe "${e.g}"`);
  });
});

test('keine Gruppe bleibt leer', () => {
  GRUPPEN.forEach((g) => {
    const n = EINTRAEGE.filter((e) => e.g === g.id).length;
    assert.ok(n > 0, `Gruppe "${g.name}" hat keine Eintraege`);
  });
});

test('hebraeische Schreibweisen enthalten nur hebraeische Buchstaben', () => {
  EINTRAEGE.forEach((e) => {
    assert.ok(/^[א-ת ]+$/.test(e.h), `${e.b}: "${e.h}" enthaelt Fremdzeichen`);
  });
});

test('keine doppelten Begriffe', () => {
  const gesehen = new Set();
  EINTRAEGE.forEach((e) => {
    const k = e.b.toLowerCase();
    assert.ok(!gesehen.has(k), `Begriff "${e.b}" kommt doppelt vor`);
    gesehen.add(k);
  });
});

// Harte Projektregel, auch fuer statische Texte.
test('kein Gottesname in irgendeinem Eintrag', () => {
  EINTRAEGE.forEach((e) => {
    const alles = [e.b, e.h, e.k, e.t, e.s || ''].join(' ');
    assert.strictEqual(enthaeltGottesnamen(alles), false, `${e.b} enthaelt einen Gottesnamen`);
  });
});

test('Adonai und Elohim stehen nirgends unsubstituiert', () => {
  EINTRAEGE.forEach((e) => {
    const alles = [e.b, e.k, e.t, e.s || ''].join(' ');
    assert.strictEqual(substituiere(alles), alles, `${e.b} braucht eine Substitution`);
  });
});

test('Texte nutzen echte Umlaute', () => {
  EINTRAEGE.forEach((e) => {
    const alles = [e.k, e.t].join(' ');
    assert.ok(
      !/\b(Woerter|Koenig|hebraeisch|Ueberlieferung|naemlich|zurueck)\b/.test(alles),
      `${e.b}: Ersatzschreibung im Text`
    );
  });
});

test('keine Gedankenstriche als Trennzeichen im Fliesstext', () => {
  EINTRAEGE.forEach((e) => {
    assert.ok(!/ [–—] /.test(e.t), `${e.b}: Gedankenstrich im Text`);
    assert.ok(!/ [–—] /.test(e.k), `${e.b}: Gedankenstrich in der Kurzbedeutung`);
  });
});

test('Bibelstellen nennen das Buch in der Projektschreibweise', () => {
  EINTRAEGE.filter((e) => e.s).forEach((e) => {
    // "Wajikra (3. Mose) 19,2" oder "Rut 3,10" oder "Mischlei (Sprueche) 1,8"
    assert.ok(
      /^[A-ZÄÖÜ][\wÄÖÜäöüß' ]+( \([^)]+\))? \d+([,:]\d+)?$/.test(e.s),
      `${e.b}: Stellenangabe "${e.s}" folgt nicht dem Muster`
    );
  });
});

test('das Wort Kabbala kommt nicht vor', () => {
  EINTRAEGE.forEach((e) => {
    assert.ok(!/kabbala/i.test(e.t + e.k), `${e.b} nennt das Wort Kabbala`);
  });
});

test('Texte sind lang genug, um etwas zu sagen', () => {
  EINTRAEGE.forEach((e) => {
    assert.ok(e.t.length >= 80, `${e.b}: Text mit ${e.t.length} Zeichen ist zu knapp`);
  });
});
