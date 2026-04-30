// =============================================
// SCHALOM ISRAEL – main.js
// Zentrale Client-Komponenten
// =============================================

// ────── Freebie-Cover als zentrale Komponente ──────
// Pfad zum aktuellen Freebie-Cover (Sajin-Variante).
// Wenn das Cover wechselt, hier zentral umstellen.
const FREEBIE_COVER_SRC = '/bilder/freebie/v3-sajin.webp';
const FREEBIE_COVER_ALT = '7 übersehene Bibelverse — kostenlose E-Mail-Serie';

function mountFreebieCovers() {
  // .article-optin: vor dem ersten Kind einfügen (Cover oben)
  document.querySelectorAll('.article-optin .container').forEach((el) => {
    if (el.dataset.coverMounted === '1') return;
    if (el.querySelector('.optin-cover')) {
      el.dataset.coverMounted = '1';
      return;
    }
    const img = document.createElement('img');
    img.src = FREEBIE_COVER_SRC;
    img.alt = FREEBIE_COVER_ALT;
    img.className = 'optin-cover';
    img.loading = 'lazy';
    img.width = 1200;
    img.height = 1200;
    el.insertBefore(img, el.firstChild);
    el.dataset.coverMounted = '1';
  });

  // .optin-modal-inner: vor dem ersten Element nach dem Close-Button
  document.querySelectorAll('.optin-modal-inner').forEach((el) => {
    if (el.dataset.coverMounted === '1') return;
    if (el.querySelector('.optin-cover')) {
      el.dataset.coverMounted = '1';
      return;
    }
    const img = document.createElement('img');
    img.src = FREEBIE_COVER_SRC;
    img.alt = FREEBIE_COVER_ALT;
    img.className = 'optin-cover';
    img.loading = 'lazy';
    img.width = 1200;
    img.height = 1200;
    // Nach dem Close-Button einfügen (oder als erstes wenn kein Close)
    const closeBtn = el.querySelector('.optin-modal-close');
    if (closeBtn && closeBtn.nextSibling) {
      el.insertBefore(img, closeBtn.nextSibling);
    } else {
      el.insertBefore(img, el.firstChild);
    }
    el.dataset.coverMounted = '1';
  });

  // .optin (Startseite): Cover oben (außerhalb von .container? .container ist drum herum)
  document.querySelectorAll('.optin > .container').forEach((el) => {
    if (el.dataset.coverMounted === '1') return;
    if (el.querySelector('.optin-cover')) {
      el.dataset.coverMounted = '1';
      return;
    }
    const img = document.createElement('img');
    img.src = FREEBIE_COVER_SRC;
    img.alt = FREEBIE_COVER_ALT;
    img.className = 'optin-cover';
    img.loading = 'lazy';
    img.width = 1200;
    img.height = 1200;
    el.insertBefore(img, el.firstChild);
    el.dataset.coverMounted = '1';
  });
}

// ────── Klicktipp-Form als zentrale Komponente ──────
// Nutzung in HTML:  <div data-klicktipp-form></div>
// Wird beim Page-Load in echtes Form-HTML expandiert.
const KLICKTIPP_FORM_HTML = `
<form id="ktv2-form-341119" class="optin-form" accept-charset="UTF-8" method="post" action="https://app.klicktipp.com/api/subscriber/signin.html">
  <input type="hidden" name="apikey" value="7xg9zqxbxz8z9e10">
  <input type="text" name="fields[fieldFirstName]" class="optin-input" placeholder="Dein Vorname">
  <input type="text" name="email" class="optin-input" placeholder="Deine E-Mail-Adresse">
  <button type="submit" class="btn btn--gold">Ja, ich möchte die 7 Verse sehen</button>
</form>
`;

function mountKlicktippForms() {
  document.querySelectorAll('[data-klicktipp-form]').forEach((el) => {
    if (el.dataset.mounted === '1') return;
    el.innerHTML = KLICKTIPP_FORM_HTML;
    el.dataset.mounted = '1';
  });
}

// ────── Opt-in Modal ──────
function openOptinModal() {
  const modal = document.getElementById('optin-modal');
  if (modal) {
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
}

function closeOptinModal() {
  const modal = document.getElementById('optin-modal');
  if (modal) {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }
}

// ────── Reading-Time-Estimate ──────
// Berechnet aus dem .article-main-Inhalt eine Lesezeit (~200 Wörter/Min)
// und schreibt sie in [data-reading-time], falls vorhanden.
function mountReadingTime() {
  const target = document.querySelector('[data-reading-time]');
  if (!target) return;
  const main = document.querySelector('.article-main');
  if (!main) return;
  const text = main.innerText || main.textContent || '';
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  target.textContent = `${minutes} Min Lesezeit`;
}

// ────── Auto-TOC für lange Artikel ──────
// Aktiviert sich, wenn ein Container [data-toc] existiert UND die
// .article-main mindestens 4 h3-Überschriften hat. Erzeugt eine
// nummerierte Liste mit Anchor-Links.
function mountAutoToc() {
  const tocHost = document.querySelector('[data-toc]');
  if (!tocHost) return;
  if (tocHost.dataset.mounted === '1') return;
  const main = document.querySelector('.article-main');
  if (!main) return;
  const headings = Array.from(main.querySelectorAll('h3'));
  if (headings.length < 4) return;
  tocHost.dataset.mounted = '1';

  const slug = (s) =>
    s.toLowerCase()
      .replace(/[äöüß]/g, (c) => ({ä:'ae', ö:'oe', ü:'ue', ß:'ss'}[c]))
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60);

  const used = new Set();
  const list = document.createElement('ol');
  list.className = 'toc-list';
  headings.forEach((h, i) => {
    let id = h.id || slug(h.textContent || '');
    if (!id) id = `abschnitt-${i + 1}`;
    let unique = id;
    let n = 2;
    while (used.has(unique)) unique = `${id}-${n++}`;
    used.add(unique);
    h.id = unique;

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${unique}`;
    a.textContent = h.textContent;
    li.appendChild(a);
    list.appendChild(li);
  });

  tocHost.classList.add('is-active');
  const title = document.createElement('p');
  title.className = 'toc-title';
  title.textContent = 'Im Überblick';
  tocHost.appendChild(title);
  tocHost.appendChild(list);
}

// ────── Init ──────
document.addEventListener('DOMContentLoaded', function () {
  mountFreebieCovers();
  mountKlicktippForms();
  mountReadingTime();
  mountAutoToc();

  // Modal: Backdrop-Click und Escape schließen
  const modal = document.getElementById('optin-modal');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeOptinModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeOptinModal();
  });

  // Burger-Menü
  const burger = document.querySelector('.nav-burger');
  const links = document.querySelector('.nav-links');
  if (burger && links) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('is-open');
      links.classList.toggle('is-open');
    });
    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        burger.classList.remove('is-open');
        links.classList.remove('is-open');
      });
    });
  }
});
