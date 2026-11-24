// =============================================
// SCHALOM ISRAEL - E-Mail-Riegel des Geburtstags-Tools
//
// Frei sichtbar: hebräisches Datum, Parascha, Abschnitt, Stelle, Teaser.
// Nach Eintrag (KlickTipp, Double-Opt-in): ausführlicher Impuls + PDF-Blatt.
//
// Ablauf: Formular -> KlickTipp schickt die Bestätigungsmail -> Klick führt auf
// /fuer-dich/hebraeischer-geburtstag/freigeschaltet/ -> dort wird der Browser
// freigeschaltet und das Ergebnis erneut angezeigt (Eingabe liegt im Browser).
//
// Der Riegel ist ein weicher Riegel (localStorage). Das ist bewusst so: Es geht
// um die E-Mail, nicht um Abschottung. Echte Begrenzung nur im Freundesbereich.
//
// SCHALTER: Solange aktiv=false (oder Werte fehlen), ist alles frei wie bisher.
// Werte kommen aus dem KlickTipp-Opt-in-Prozess "Hebräischer Geburtstag".
// =============================================
(function () {
  var KONFIG = {
    aktiv: false,
    formId: null,       // Zahl aus der Formular-ID ktv2-form-<formId>
    apikey: null,       // Listbuilding-Schlüssel dieses Prozesses (öffentlich, kein Geheimnis)
    feldDatum: null,    // z. B. 'field123456' (eigenes Feld "Geburtsdatum", Typ Zeile)
    feldSonne: null,    // z. B. 'field123457' (eigenes Feld "Geburt nach Sonnenuntergang", Typ Zeile)
  };

  var FREI = 'si-geburtstag-frei';
  var EINGABE = 'si-geburtstag-eingabe';

  function lies(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function schreib(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* privat */ } }

  function konfiguriert() {
    return !!(KONFIG.aktiv && KONFIG.formId && KONFIG.apikey);
  }

  function istFrei() {
    return !konfiguriert() || lies(FREI) === '1';
  }

  function freischalten() { schreib(FREI, '1'); }

  function merkeEingabe(datum, sonne) {
    schreib(EINGABE, JSON.stringify({ datum: datum, sonne: sonne, zeit: Date.now() }));
  }

  function eingabe() {
    try { return JSON.parse(lies(EINGABE) || 'null'); } catch (e) { return null; }
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Natives KlickTipp-Direktformular (siehe Memory: Captcha braucht das native
  // Formular, kein fetch). KlickTipp leitet selbst auf die Danke-Seite weiter.
  function formularHtml(datum, sonne) {
    var id = String(KONFIG.formId);
    return '<div id="form-' + esc(id) + '-wrapper">'
      + '<form id="ktv2-form-' + esc(id) + '" class="optin-form geb-riegel-form" accept-charset="UTF-8" method="post" action="https://app.klicktipp.com/api/subscriber/signin.html">'
      + '<input type="hidden" name="apikey" value="' + esc(KONFIG.apikey) + '">'
      + (KONFIG.feldDatum ? '<input type="hidden" name="fields[' + esc(KONFIG.feldDatum) + ']" value="' + esc(datum) + '">' : '')
      + (KONFIG.feldSonne ? '<input type="hidden" name="fields[' + esc(KONFIG.feldSonne) + ']" value="' + esc(sonne) + '">' : '')
      + '<input type="text" name="fields[fieldFirstName]" class="optin-input" placeholder="Dein Vorname" autocomplete="given-name">'
      + '<input type="text" name="email" class="optin-input" placeholder="Deine E-Mail-Adresse" autocomplete="email" inputmode="email" required>'
      + '<button type="submit" class="btn btn--gold" data-umami-event="entdecken-geburtstag-riegel-absenden">Impuls und Blatt freischalten</button>'
      + '</form></div>';
  }

  window.GeburtstagsRiegel = {
    KONFIG: KONFIG,
    konfiguriert: konfiguriert,
    istFrei: istFrei,
    freischalten: freischalten,
    merkeEingabe: merkeEingabe,
    eingabe: eingabe,
    formularHtml: formularHtml,
  };
})();
