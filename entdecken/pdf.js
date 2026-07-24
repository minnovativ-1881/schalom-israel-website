// =============================================
// SCHALOM ISRAEL - Minimaler PDF-Erzeuger
//
// Baut aus einem JPEG ein einseitiges PDF im Format A4. Genau so viel PDF,
// wie dafuer noetig ist, und keine Zeile mehr.
//
// Warum selbst gebaut statt einer Bibliothek:
//   - Das Repo bleibt ohne package.json und ohne Build-Schritt.
//   - Hebraeischer Text braeuchte in jeder PDF-Bibliothek eine eingebettete
//     Schrift und eine eigene Behandlung der Schreibrichtung. Ueber den Umweg
//     Bild entfaellt beides: der Browser hat den Text schon richtig gesetzt.
//   - Kein fremdes Skript von einem CDN auf einer Seite, die Namen und
//     Geburtsdaten verarbeitet.
//
// UMD, damit ohne Browser testbar.
// =============================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MiniPDF = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  // A4 in PDF-Punkten (1/72 Zoll)
  const A4_BREIT = 595.28;
  const A4_HOCH = 841.89;

  function zahl(n) {
    return (Math.round(n * 100) / 100).toString();
  }

  // Eine PDF-Zeichenkette. Klammern und Backslash muessen geschuetzt werden,
  // sonst zerlegen sie die Datei.
  //
  // Umlaute gehen in reinem ASCII nicht: eine erste Fassung hat sie einfach
  // weggeworfen, im Viewer stand dann "hebrischer Geburtstag". PDF erlaubt
  // aber Text in UTF-16 mit vorangestellter Bytefolge FE FF. Nur wenn
  // wirklich Sonderzeichen vorkommen, damit die Datei sonst lesbar bleibt.
  function pdfText(s) {
    const roh = String(s);
    // Auch Zeilenumbrueche schuetzen: roh in einer Zeichenkette wuerde ein
    // Leser sie umdeuten. In UTF-16 koennen sie als halbes Zeichen auftreten.
    const schuetzen = (t) => t
      .replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
      .replace(/\r/g, '\\r').replace(/\n/g, '\\n');
    if (!/[^\x20-\x7e]/.test(roh)) return schuetzen(roh);

    let aus = '\xfe\xff';
    for (const zeichen of roh) {
      const code = zeichen.charCodeAt(0);
      // Zeichen ausserhalb der Grundebene (Emoji) haben eine zweite Haelfte,
      // die der for-of mitliefert. Beide Haelften einzeln schreiben.
      if (zeichen.length > 1) {
        aus += String.fromCharCode(code >> 8, code & 0xff)
          + String.fromCharCode(zeichen.charCodeAt(1) >> 8, zeichen.charCodeAt(1) & 0xff);
      } else {
        aus += String.fromCharCode(code >> 8, code & 0xff);
      }
    }
    return schuetzen(aus);
  }

  // Baut das PDF als Byte-Folge. jpegBytes ist ein Uint8Array.
  function ausJpeg(jpegBytes, breitePx, hoehePx, titel) {
    const teile = [];      // Strings oder Uint8Arrays
    const versatz = [];    // Byte-Position jedes Objekts
    let laenge = 0;

    function schreib(s) {
      teile.push(s);
      laenge += typeof s === 'string' ? s.length : s.length;
    }

    // Das Bild fuellt die Seite, das Seitenverhaeltnis bleibt erhalten.
    const skala = Math.min(A4_BREIT / breitePx, A4_HOCH / hoehePx);
    const bildBreit = breitePx * skala;
    const bildHoch = hoehePx * skala;
    const x = (A4_BREIT - bildBreit) / 2;
    const y = (A4_HOCH - bildHoch) / 2;

    const inhalt = 'q ' + zahl(bildBreit) + ' 0 0 ' + zahl(bildHoch) + ' '
      + zahl(x) + ' ' + zahl(y) + ' cm /Im1 Do Q\n';

    const sicherTitel = pdfText(titel || 'Schalom Israel');

    schreib('%PDF-1.4\n');

    versatz[1] = laenge;
    schreib('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

    versatz[2] = laenge;
    schreib('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

    versatz[3] = laenge;
    schreib('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '
      + zahl(A4_BREIT) + ' ' + zahl(A4_HOCH) + ']'
      + ' /Resources << /XObject << /Im1 4 0 R >> >>'
      + ' /Contents 5 0 R >>\nendobj\n');

    versatz[4] = laenge;
    schreib('4 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + breitePx
      + ' /Height ' + hoehePx + ' /ColorSpace /DeviceRGB /BitsPerComponent 8'
      + ' /Filter /DCTDecode /Length ' + jpegBytes.length + ' >>\nstream\n');
    schreib(jpegBytes);
    schreib('\nendstream\nendobj\n');

    versatz[5] = laenge;
    schreib('5 0 obj\n<< /Length ' + inhalt.length + ' >>\nstream\n'
      + inhalt + 'endstream\nendobj\n');

    versatz[6] = laenge;
    schreib('6 0 obj\n<< /Title (' + sicherTitel + ') /Producer (schalomisrael.de) >>\nendobj\n');

    const xrefStart = laenge;
    let xref = 'xref\n0 7\n0000000000 65535 f \n';
    for (let i = 1; i <= 6; i++) {
      xref += String(versatz[i]).padStart(10, '0') + ' 00000 n \n';
    }
    schreib(xref);
    schreib('trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n'
      + xrefStart + '\n%%EOF\n');

    // Alles zu einem Byte-Feld zusammenfuegen
    const aus = new Uint8Array(laenge);
    let pos = 0;
    for (const t of teile) {
      if (typeof t === 'string') {
        for (let i = 0; i < t.length; i++) aus[pos++] = t.charCodeAt(i) & 0xff;
      } else {
        aus.set(t, pos);
        pos += t.length;
      }
    }
    return aus;
  }

  // Wandelt eine data:-URL aus canvas.toDataURL in rohe Bytes.
  function datenUrlZuBytes(url) {
    const komma = url.indexOf(',');
    const roh = atob(url.slice(komma + 1));
    const aus = new Uint8Array(roh.length);
    for (let i = 0; i < roh.length; i++) aus[i] = roh.charCodeAt(i);
    return aus;
  }

  // Loest den Download aus.
  function herunterladen(bytes, dateiname) {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = dateiname.replace(/[^\w.-]+/g, '-') + '.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Erst spaet freigeben. Zeigt der Browser einen Dialog "Wo speichern?",
    // liest er die Adresse erst nach der Antwort des Nutzers.
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }

  function ausCanvas(canvas, dateiname, titel) {
    const url = canvas.toDataURL('image/jpeg', 0.92);
    const bytes = ausJpeg(datenUrlZuBytes(url), canvas.width, canvas.height, titel);
    herunterladen(bytes, dateiname);
    return bytes.length;
  }

  return { ausJpeg, ausCanvas, datenUrlZuBytes, herunterladen, A4_BREIT, A4_HOCH };
});
