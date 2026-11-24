// =============================================
// SCHALOM ISRAEL - Teaser fuer "Dein Name in hebraeischer Schrift"
//
// Ein Eingabefeld, das ueberall auf der Seite stehen kann und den Besucher
// mit fertigem Ergebnis auf /fuer-dich/name-auf-hebraeisch/ schickt. Wer schon getippt
// hat, ist beteiligt; ein blosser Link verliert die meisten.
//
// Einbau, zwei Zeilen:
//   <name-teaser></name-teaser>
//   <script src="/fuer-dich/name-auf-hebraeisch/teaser.js"></script>
//
// Varianten:
//   <name-teaser>              dunkler Block, fuer die Startseite
//   <name-teaser schmal>       heller Streifen, fuer das Ende eines Artikels
//
// Das Element bringt sein Aussehen selbst mit, damit kein weiteres
// Stylesheet eingebunden werden muss. Bei zwanzig Artikeln zaehlt das.
// =============================================
(function () {
  const ZIEL = '/fuer-dich/name-auf-hebraeisch/';

  const CSS = `
.nt-block{background:#0d1e35;border-radius:4px;margin:3rem auto;max-width:680px;padding:2.5rem 1.5rem;text-align:center}
.nt-block--schmal{background:#f0ebe0;border:1px solid rgba(200,169,98,.45);margin:2.5rem auto;padding:1.75rem 1.25rem}
.nt-titel{color:#f0ebe0;font-family:'Playfair Display',Georgia,serif;font-size:1.6rem;font-weight:400;line-height:1.3;margin:0 0 .6rem}
.nt-block--schmal .nt-titel{color:#0d1e35;font-size:1.3rem}
.nt-text{color:#8a9ab5;font-size:.98rem;line-height:1.65;margin:0 auto 1.4rem;max-width:30rem}
.nt-block--schmal .nt-text{color:#4a5668;font-size:.92rem;margin-bottom:1.1rem}
.nt-form{display:flex;flex-wrap:wrap;gap:.6rem;justify-content:center;margin:0 auto;max-width:28rem}
.nt-input{background:#fff;border:1px solid rgba(13,30,53,.18);border-radius:4px;box-sizing:border-box;color:#0d1e35;flex:1 1 11rem;font-family:'Inter',system-ui,sans-serif;font-size:1.05rem;min-width:0;padding:.8rem 1rem;text-align:center}
.nt-input:focus{border-color:#c8a962;box-shadow:0 0 0 3px rgba(200,169,98,.25);outline:none}
.nt-block--schmal .nt-input:focus{border-color:#a8914f;box-shadow:0 0 0 3px rgba(168,145,79,.2)}
.nt-knopf{background:#c8a962;border:1px solid #c8a962;border-radius:4px;color:#0d1e35;cursor:pointer;flex:0 0 auto;font-family:'Inter',system-ui,sans-serif;font-size:.95rem;padding:.8rem 1.5rem;transition:background .25s ease,border-color .25s ease}
.nt-knopf:hover{background:#dfc07a;border-color:#dfc07a}
.nt-block--schmal .nt-knopf{background:#0d1e35;border-color:#0d1e35;color:#f0ebe0}
.nt-block--schmal .nt-knopf:hover{background:#152843;border-color:#152843}
.nt-beispiel{color:#8a9ab5;font-size:.82rem;margin:1.1rem 0 0}
.nt-block--schmal .nt-beispiel{color:#6b7686}
.nt-heb{direction:rtl;font-family:'Frank Ruhl Libre',serif;font-size:1.2em;unicode-bidi:isolate}
@media(max-width:420px){.nt-knopf{flex:1 1 100%}}
`;

  function stylesEinmal() {
    if (document.getElementById('nt-stil')) return;
    const stil = document.createElement('style');
    stil.id = 'nt-stil';
    stil.textContent = CSS;
    document.head.appendChild(stil);
  }

  class NameTeaser extends HTMLElement {
    connectedCallback() {
      stylesEinmal();
      const schmal = this.hasAttribute('schmal');
      const titel = this.getAttribute('titel') ||
        (schmal ? 'Wie sieht dein Name auf Hebräisch aus?'
                : 'Wie sieht dein eigener Name auf Hebräisch aus?');
      const text = this.getAttribute('text') ||
        (schmal
          ? 'Du wählst, nach welcher Aussprache geschrieben wird. Das Ergebnis gibt es als Bild.'
          : 'Hebräisch schreibt Laute, keine Buchstaben. Deshalb kommt es darauf an, wie dein Name klingt. Tipp ihn ein, du siehst ihn sofort.');

      this.innerHTML =
        '<div class="nt-block' + (schmal ? ' nt-block--schmal' : '') + '">' +
        '<p class="nt-titel">' + titel + '</p>' +
        '<p class="nt-text">' + text + '</p>' +
        '<form class="nt-form">' +
        '<input class="nt-input" type="text" maxlength="40" spellcheck="false"' +
        ' autocomplete="given-name" aria-label="Dein Vorname" placeholder="Dein Vorname">' +
        '<button class="nt-knopf" type="submit">Zeig mir</button>' +
        '</form>' +
        '<p class="nt-beispiel">Zum Beispiel Peter: <span class="nt-heb" lang="he">פטר</span>' +
        ' &middot; Sabine: <span class="nt-heb" lang="he">סבינה</span></p>' +
        '</div>';

      const form = this.querySelector('form');
      const feld = this.querySelector('input');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = feld.value.trim();
        if (window.umami) window.umami.track('name-teaser-abgeschickt');
        window.location.href = name
          ? ZIEL + '?name=' + encodeURIComponent(name.slice(0, 40))
          : ZIEL;
      });
    }
  }

  if (!customElements.get('name-teaser')) {
    customElements.define('name-teaser', NameTeaser);
  }
})();
