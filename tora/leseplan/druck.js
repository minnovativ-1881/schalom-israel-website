// =============================================
// SCHALOM ISRAEL - Leseplan: Druckvorlagen
//
// Zeichnet auf Canvas, was man herunterladen kann:
//   - jahresplanSeiten(): der ganze Plan eines Lesejahres, A4, Woche für Woche
//   - teilbild():         das Bild zum Teilen, wenn ein Buch zu Ende gelesen ist
// Der Browser setzt dabei auch den hebräischen Text richtig, deshalb braucht
// das PDF (entdecken/pdf.js) keine eingebettete Schrift.
// =============================================
(function (root) {
  const P = root.Leseplan;

  const FARBE = {
    navy: '#183050', gold: '#c8a962', goldText: '#a8843a', ink: '#2a2418',
    muted: '#857a62', linie: '#e4dac4', band: '#f4eddd', papier: '#ffffff',
  };
  const SERIF = "'EB Garamond','Palatino Linotype',Georgia,serif";
  const SANS = "'Inter',system-ui,sans-serif";
  const HEBR = "'Frank Ruhl Libre','David','Times New Roman',serif";

  const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  function d(iso) { return new Date(iso + 'T12:00:00Z'); }
  function kurz(iso) { const x = d(iso); return x.getUTCDate() + '.' + (x.getUTCMonth() + 1) + '.'; }
  function lang(iso) { const x = d(iso); return x.getUTCDate() + '. ' + MONATE[x.getUTCMonth()] + ' ' + x.getUTCFullYear(); }
  // "14. Kislew 5787" -> "14. Kislew"
  function hebrKurz(s) { return s.replace(/\s+\d{4}$/, ''); }

  async function schriftenLaden() {
    if (!document.fonts || !document.fonts.load) return;
    try {
      await Promise.all([
        document.fonts.load('400 20px "Inter"'), document.fonts.load('600 20px "Inter"'),
        document.fonts.load('400 20px "EB Garamond"'), document.fonts.load('500 20px "EB Garamond"'),
        document.fonts.load('italic 400 20px "EB Garamond"'),
        document.fonts.load('400 20px "Frank Ruhl Libre"', 'חזק'),
      ]);
    } catch (e) { /* dann eben mit Ersatzschrift */ }
  }

  function leinwand(b, h) {
    const c = document.createElement('canvas');
    c.width = b; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = FARBE.papier;
    ctx.fillRect(0, 0, b, h);
    ctx.textBaseline = 'alphabetic';
    return { c: c, ctx: ctx };
  }

  // Text in eine Breite zwingen: erst kleiner, dann kürzen
  function passend(ctx, text, maxB, groesse, minGroesse, schrift) {
    let g = groesse;
    ctx.font = schrift(g);
    while (ctx.measureText(text).width > maxB && g > minGroesse) { g -= 1; ctx.font = schrift(g); }
    if (ctx.measureText(text).width <= maxB) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + '…').width > maxB) t = t.slice(0, -1);
    return t + '…';
  }

  // Zeilenumbruch nach Wörtern
  function umbrechen(ctx, text, maxB) {
    const woerter = String(text).split(' ');
    const zeilen = [];
    let z = '';
    woerter.forEach(function (w) {
      const probe = z ? z + ' ' + w : w;
      if (ctx.measureText(probe).width > maxB && z) { zeilen.push(z); z = w; } else { z = probe; }
    });
    if (z) zeilen.push(z);
    return zeilen;
  }

  function nkText(tag) {
    return tag.nk.art === 'rolle' ? tag.nk.stelle.replace(' (ganzes Buch)', '') + ' (Rolle zu ' + tag.nk.fest + ')' : tag.nk.stelle;
  }

  // Tage zu Wochen: alles, was auf denselben Schabbat zuläuft
  function wochen(plan) {
    const aus = [];
    plan.forEach(function (t) {
      const schluessel = t.tora.schabbat || 'ende';
      const letzte = aus[aus.length - 1];
      if (letzte && letzte.schluessel === schluessel) letzte.tage.push(t);
      else aus.push({ schluessel: schluessel, tage: [t] });
    });
    aus.forEach(function (w) { w.name = w.tage[w.tage.length - 1].tora.name; });
    return aus;
  }

  // ---------- Jahresplan ----------

  async function jahresplanSeiten(plan, lj) {
    await schriftenLaden();
    const B = 1240, H = 1754, M = 80;
    const SP = { chk: M, datum: M + 36, hebr: M + 190, tora: M + 380, nk: M + 750, ende: B - M };
    const ZEILE = 34, KOPF = 50;
    const seiten = [];
    let s, ctx, y;

    function spaltenKopf() {
      ctx.font = '600 14px ' + SANS;
      ctx.fillStyle = FARBE.muted;
      ctx.fillText('TAG', SP.datum, y);
      ctx.fillText('TORA', SP.tora, y);
      ctx.fillText('PROPHETEN UND SCHRIFTEN', SP.nk, y);
      y += 14;
    }

    function neueSeite() {
      s = leinwand(B, H); ctx = s.ctx; seiten.push(s.c);
      y = M;
      if (seiten.length === 1) {
        ctx.font = '600 15px ' + SANS; ctx.fillStyle = FARBE.goldText;
        ctx.fillText('SCHALOM ISRAEL  ·  OR TORA  ·  LESEPLAN', M, y + 8);
        ctx.font = '500 56px ' + SERIF; ctx.fillStyle = FARBE.navy;
        ctx.fillText('Der Tanach in einem Jahr', M, y + 76);
        ctx.font = '400 22px ' + SANS; ctx.fillStyle = FARBE.ink;
        ctx.fillText('Lesejahr ' + lj.jahr + '  ·  ' + lang(lj.start) + ' bis ' + lang(lj.ende) + '  ·  ' + lj.tage + ' Tage', M, y + 118);
        ctx.font = '400 17px ' + SANS; ctx.fillStyle = FARBE.muted;
        const erkl = 'Jeden Tag ein Abschnitt der Wochenlesung (Sonntag der erste, Schabbat der siebte) und ein Stück aus Propheten und Schriften. '
          + 'Am Schabbat dazu die Haftara, die fünf Rollen an ihrem Fest. Kapitelzählung nach der hebräischen Bibel.';
        umbrechen(ctx, erkl, B - 2 * M).forEach(function (z, i) { ctx.fillText(z, M, y + 156 + i * 25); });
        y += 230;
      } else {
        y += 10;
      }
      spaltenKopf();
    }

    function fusszeilen() {
      seiten.forEach(function (c, i) {
        const x = c.getContext('2d');
        x.font = '400 15px ' + SANS; x.fillStyle = FARBE.muted; x.textAlign = 'center';
        x.fillText('schalomisrael.de  ·  Leseplan, Lesejahr ' + lj.jahr + '  ·  Seite ' + (i + 1) + ' von ' + seiten.length, B / 2, H - 48);
        x.textAlign = 'left';
      });
    }

    neueSeite();
    wochen(plan).forEach(function (w) {
      const hoehe = KOPF + 16 + w.tage.reduce(function (h, t) { return h + (t.haftara ? ZEILE + 22 : ZEILE); }, 0) + 14;
      if (y + hoehe > H - M - 40) neueSeite();

      // Wochenkopf
      ctx.fillStyle = FARBE.band;
      ctx.fillRect(M, y, B - 2 * M, KOPF - 10);
      ctx.fillStyle = FARBE.gold;
      ctx.fillRect(M, y, 4, KOPF - 10);
      ctx.fillStyle = FARBE.navy;
      ctx.fillText(passend(ctx, w.name, 620, 24, 16, function (g) { return '500 ' + g + 'px ' + SERIF; }), M + 18, y + 28);
      ctx.font = '400 16px ' + SANS; ctx.fillStyle = FARBE.muted; ctx.textAlign = 'right';
      const erster = w.tage[0].datum, letzter = w.tage[w.tage.length - 1].datum;
      ctx.fillText(lang(erster) + ' bis ' + lang(letzter), SP.ende - 14, y + 27);
      ctx.textAlign = 'left';
      y += KOPF + 16;

      w.tage.forEach(function (t) {
        const zh = t.haftara ? ZEILE + 22 : ZEILE;
        // Kästchen
        ctx.strokeStyle = FARBE.gold; ctx.lineWidth = 1.6;
        ctx.strokeRect(SP.chk + 2, y - 17, 18, 18);
        // Tag
        ctx.font = '600 17px ' + SANS; ctx.fillStyle = FARBE.ink;
        const wt = P.WOCHENTAG_KURZ[t.wochentag] === 'Schabbat' ? 'Schabbat' : P.WOCHENTAG_KURZ[t.wochentag];
        ctx.fillText(wt + ' ' + kurz(t.datum), SP.datum, y);
        ctx.font = '400 14px ' + SANS; ctx.fillStyle = FARBE.muted;
        const hk = hebrKurz(t.hebr) + (t.feste.length ? '  ·  ' + t.feste.join(', ') : '');
        ctx.fillText(passend(ctx, hk, SP.tora - SP.hebr - 12, 14, 11, function (g) { return '400 ' + g + 'px ' + SANS; }), SP.hebr, y);
        // Tora
        ctx.fillStyle = FARBE.ink;
        ctx.fillText(passend(ctx, t.tora.stelle, SP.nk - SP.tora - 20, 17, 12, function (g) { return '400 ' + g + 'px ' + SANS; }), SP.tora, y);
        if (t.haftara) {
          ctx.fillStyle = FARBE.goldText;
          ctx.fillText(passend(ctx, 'Haftara: ' + t.haftara, SP.nk - SP.tora - 20, 15, 11, function (g) { return 'italic 400 ' + g + 'px ' + SANS; }), SP.tora, y + 22);
        }
        // Propheten und Schriften
        ctx.fillStyle = t.nk.art === 'rolle' ? FARBE.goldText : FARBE.ink;
        ctx.fillText(passend(ctx, nkText(t), SP.ende - SP.nk, 17, 12, function (g) { return (t.nk.art === 'rolle' ? '600 ' : '400 ') + g + 'px ' + SANS; }), SP.nk, y);
        // Trennlinie
        ctx.strokeStyle = FARBE.linie; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(SP.datum, y + zh - 22); ctx.lineTo(SP.ende, y + zh - 22); ctx.stroke();
        y += zh;
      });
      y += 14;
    });
    fusszeilen();
    return seiten;
  }

  // ---------- Bild zum Teilen ----------

  async function teilbild(abschluss, tag) {
    await schriftenLaden();
    const B = 1080, H = 1350;
    const s = leinwand(B, H), ctx = s.ctx;
    const g = ctx.createLinearGradient(0, 0, B, H);
    g.addColorStop(0, '#2c4a72'); g.addColorStop(0.6, '#183050'); g.addColorStop(1, '#0f2038');
    ctx.fillStyle = g; ctx.fillRect(0, 0, B, H);
    ctx.strokeStyle = 'rgba(200,169,98,.55)'; ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, B - 80, H - 80);
    ctx.strokeStyle = 'rgba(200,169,98,.25)'; ctx.lineWidth = 1;
    ctx.strokeRect(54, 54, B - 108, H - 108);

    const mitte = B / 2;
    ctx.textAlign = 'center';
    const mitChasak = abschluss.teil === 'tora' || abschluss.teil === 'jahr';
    let y = 300;
    if (mitChasak) {
      ctx.direction = 'rtl'; ctx.font = '400 96px ' + HEBR; ctx.fillStyle = '#e6c878';
      ctx.fillText('חֲזַק חֲזַק וְנִתְחַזֵּק', mitte, y); ctx.direction = 'ltr';
      ctx.font = 'italic 400 42px ' + SERIF; ctx.fillStyle = '#efe6d0';
      ctx.fillText('Chasak, chasak we-nitchasek', mitte, y + 78);
      ctx.font = '400 26px ' + SANS; ctx.fillStyle = 'rgba(239,230,208,.7)';
      ctx.fillText('Sei stark, sei stark, und wir wollen uns stärken.', mitte, y + 126);
      y += 250;
    } else {
      ctx.font = '600 24px ' + SANS; ctx.fillStyle = '#e6c878';
      ctx.fillText('DER TANACH IN EINEM JAHR', mitte, y);
      y += 120;
    }
    ctx.strokeStyle = 'rgba(200,169,98,.6)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(mitte - 90, y - 40); ctx.lineTo(mitte + 90, y - 40); ctx.stroke();

    ctx.font = '400 36px ' + SANS; ctx.fillStyle = '#efe6d0';
    if (abschluss.teil === 'jahr') {
      ctx.fillText('Ein Jahr lang, Tag für Tag:', mitte, y + 20);
      ctx.font = '500 92px ' + SERIF; ctx.fillStyle = '#ffffff';
      ctx.fillText('Der ganze Tanach', mitte, y + 130);
      ctx.font = '400 36px ' + SANS; ctx.fillStyle = '#efe6d0';
      ctx.fillText('ist gelesen.', mitte, y + 200);
    } else {
      ctx.fillText('Heute habe ich', mitte, y + 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(passend(ctx, abschluss.buch, B - 200, 104, 50, function (gr) { return '500 ' + gr + 'px ' + SERIF; }), mitte, y + 140);
      ctx.font = '400 36px ' + SANS; ctx.fillStyle = '#efe6d0';
      ctx.fillText('zu Ende gelesen.', mitte, y + 212);
    }
    ctx.font = '400 26px ' + SANS; ctx.fillStyle = 'rgba(230,200,120,.85)';
    ctx.fillText(lang(tag.datum) + '  ·  ' + tag.hebr, mitte, H - 200);
    ctx.font = '600 24px ' + SANS; ctx.fillStyle = 'rgba(239,230,208,.75)';
    ctx.fillText('schalomisrael.de/tora/leseplan', mitte, H - 120);
    ctx.textAlign = 'left';
    return s.c;
  }

  root.LeseplanDruck = { jahresplanSeiten: jahresplanSeiten, teilbild: teilbild, wochen: wochen };
})(self);
