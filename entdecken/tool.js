// =============================================
// SCHALOM ISRAEL - Geteilte Client-Logik der Entdecken-Tools
//
// Vertrag im HTML:
//   <form class="tool-form" data-tool="<tool-id>">   Felder: [data-input="<key>"]
//   <button type="submit">                            wird waehrend des Ladens gesperrt
//   <div class="tool-status">                         Lade- und Fehlermeldungen
//   <div class="tool-ergebnis">                       Ausgabe
//   <div class="tool-optin" hidden data-optin>        erscheint nach dem Ergebnis
// =============================================
(function () {

  // ---------- Minimaler Markdown-Renderer ----------
  // Bewusst klein: der Server liefert nur ##/###-Ueberschriften, Absaetze,
  // Listen, **fett** und *kursiv*. Alles wird vorher escaped.
  function escape(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function inline(s) {
    return s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+?)\*/g, '$1<em>$2</em>');
  }

  function markdown(text) {
    return escape(text)
      .split(/\n{2,}/)
      .map(function (block) {
        var b = block.trim();
        if (!b) return '';
        if (b.indexOf('### ') === 0) return '<h3>' + inline(b.slice(4)) + '</h3>';
        if (b.indexOf('## ') === 0) return '<h2>' + inline(b.slice(3)) + '</h2>';
        if (/^[-*]\s/m.test(b)) {
          var items = b.split('\n')
            .filter(function (l) { return /^[-*]\s/.test(l.trim()); })
            .map(function (l) { return '<li>' + inline(l.trim().replace(/^[-*]\s+/, '')) + '</li>'; })
            .join('');
          return '<ul>' + items + '</ul>';
        }
        return '<p>' + inline(b.replace(/\n/g, '<br>')) + '</p>';
      })
      .join('');
  }

  // ---------- Opt-in ----------
  // Eigene KlickTipp-Liste fuer die Entdecken-Tools, NICHT die 7-Verse-Liste.
  var OPTIN_HTML = [
    '<h3 class="tool-optin-titel">Willst du tiefer einsteigen?</h3>',
    '<p class="tool-optin-text">Ich schicke dir regelmässig, was ich beim Lesen der Tora finde. Kein Werbebrief, sondern das, woran ich gerade selbst hängenbleibe.</p>',
    '<div id="form-354801-wrapper">',
    '<form id="ktv2-form-354801" class="optin-form" accept-charset="UTF-8" method="post" action="https://app.klicktipp.com/api/subscriber/signin.html">',
    '  <input type="hidden" name="apikey" value="89m6zqxbxz8z463f">',
    '  <input type="text" name="fields[fieldFirstName]" class="optin-input" placeholder="Dein Vorname">',
    '  <input type="text" name="email" class="optin-input" placeholder="Deine E-Mail-Adresse">',
    '  <button type="submit" class="btn btn--gold" data-umami-event="entdecken-optin">Ja, schick mir mehr</button>',
    '</form>',
    '</div>',
    '<p class="tool-optin-disclaimer">Kein Spam. Abbestellen jederzeit möglich.</p>',
  ].join('\n');

  function mounteOptin() {
    var knoten = document.querySelectorAll('[data-optin]');
    for (var i = 0; i < knoten.length; i++) {
      if (knoten[i].dataset.mounted === '1') continue;
      knoten[i].innerHTML = OPTIN_HTML;
      knoten[i].dataset.mounted = '1';
    }
  }

  // ---------- Server ----------
  function sammleEingaben(form) {
    var inputs = {};
    var felder = form.querySelectorAll('[data-input]');
    for (var i = 0; i < felder.length; i++) {
      inputs[felder[i].dataset.input] = felder[i].value;
    }
    return inputs;
  }

  // Sendet an /api/entdecken. Wirft mit lesbarer Meldung.
  function generiere(tool, inputs) {
    return fetch('/api/entdecken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: tool, inputs: inputs }),
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (daten) {
        if (!res.ok) throw new Error(daten.fehler || 'Es hat gerade nicht geklappt.');
        return daten.text;
      });
    });
  }

  function track(name) {
    if (window.umami && typeof window.umami.track === 'function') window.umami.track(name);
  }

  // ---------- Verdrahtung ----------
  // opts.eingaben(form) -> inputs          (Default: sammleEingaben)
  // opts.vorher(inputs, ziel) -> false|any (Sofort-Ausgabe; false bricht ab)
  // opts.nachher(text, ziel)               (Default: Markdown anhaengen)
  function verdrahte(form, opts) {
    opts = opts || {};
    var knopf = form.querySelector('button[type="submit"]');
    var status = document.querySelector('.tool-status');
    var ziel = document.querySelector('.tool-ergebnis');
    var optin = document.querySelector('.tool-optin');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      knopf.disabled = true;
      status.className = 'tool-status';
      status.textContent = 'Einen Moment, das wird gerade zusammengestellt ...';
      ziel.innerHTML = '';

      Promise.resolve()
        .then(function () {
          return opts.eingaben ? opts.eingaben(form) : sammleEingaben(form);
        })
        .then(function (inputs) {
          if (!opts.vorher) return inputs;
          return Promise.resolve(opts.vorher(inputs, ziel)).then(function (weiter) {
            if (weiter === false) return null;
            return inputs;
          });
        })
        .then(function (inputs) {
          if (!inputs) return null;
          track('entdecken-' + form.dataset.tool + '-absenden');
          return generiere(form.dataset.tool, inputs);
        })
        .then(function (text) {
          if (text === null) return;
          if (opts.nachher) opts.nachher(text, ziel);
          else ziel.innerHTML += markdown(text);
          status.textContent = '';
          track('entdecken-' + form.dataset.tool + '-fertig');
          if (optin) optin.hidden = false;
        })
        .catch(function (err) {
          // Steht schon etwas im Ergebnis (Geburtstag: Datum und Parascha),
          // bleibt das stehen. Nur der KI-Teil fehlt dann.
          if (ziel.innerHTML.trim()) {
            status.className = 'tool-status tool-fehler';
            status.textContent = err.message + ' Dein Ergebnis oben bleibt gültig.';
            if (optin) optin.hidden = false;
          } else {
            status.className = 'tool-status tool-fehler';
            status.textContent = err.message;
          }
        })
        .then(function () {
          knopf.disabled = false;
        });
    });
  }

  document.addEventListener('DOMContentLoaded', mounteOptin);

  window.EntdeckenTool = {
    verdrahte: verdrahte,
    generiere: generiere,
    markdown: markdown,
    escape: escape,
    track: track,
  };
})();
