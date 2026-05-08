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

// ────── PDF-Export ──────
// html2pdf.js wird beim ersten Klick lazy geladen.
const HTML2PDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
let html2pdfLoadingPromise = null;

function loadHtml2Pdf() {
  if (window.html2pdf) return Promise.resolve(window.html2pdf);
  if (html2pdfLoadingPromise) return html2pdfLoadingPromise;
  html2pdfLoadingPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = HTML2PDF_CDN;
    s.onload = () => resolve(window.html2pdf);
    s.onerror = () => reject(new Error('html2pdf konnte nicht geladen werden.'));
    document.head.appendChild(s);
  });
  return html2pdfLoadingPromise;
}

function buildPdfDocument() {
  const titleEl = document.querySelector('.article-hero-title');
  const main = document.querySelector('.article-main');
  if (!titleEl || !main) return null;

  const title = titleEl.textContent.trim();
  const bodyClone = main.cloneNode(true);

  // Entfernen, was nicht ins PDF gehört
  const stripSelectors = [
    '.article-share-img',
    '.inline-optin',
    '.article-optin',
    '.article-toc',
    '.article-tags',
    'script',
  ];
  stripSelectors.forEach((sel) => {
    bodyClone.querySelectorAll(sel).forEach((el) => el.remove());
  });

  const wrap = document.createElement('div');
  wrap.style.cssText = 'font-family: Inter, Arial, sans-serif; color: #2a3543; line-height: 1.7; padding: 0;';

  wrap.innerHTML = `
    <div style="text-align:center; margin-bottom: 1.6rem; padding-bottom: 1.2rem; border-bottom: 1px solid #c8a962;">
      <p style="font-family: Inter, Arial, sans-serif; font-size: 11pt; color: #7a5c1e; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 0.4rem 0;">Schalom Israel</p>
      <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22pt; color: #1a2536; margin: 0; line-height: 1.25;">${title}</h1>
      <p style="font-family: Inter, Arial, sans-serif; font-size: 10pt; color: #7a8896; margin: 0.6rem 0 0 0;">von Micha Levzion</p>
    </div>
  `;

  // Body-Container styled
  const bodyHost = document.createElement('div');
  bodyHost.style.cssText = 'font-size: 11pt; color: #2a3543;';
  // Inhalte nur aus dem .container .container--narrow nehmen
  const inner = bodyClone.querySelector('.container') || bodyClone;
  bodyHost.innerHTML = inner.innerHTML;

  // Inline-Tweaks für sauberes PDF-Layout
  bodyHost.querySelectorAll('h2').forEach((h) => {
    h.style.cssText = 'font-family: \'Playfair Display\', Georgia, serif; font-size: 16pt; color: #1a2536; margin: 1.6rem 0 0.6rem 0;';
  });
  bodyHost.querySelectorAll('h3').forEach((h) => {
    h.style.cssText = 'font-family: \'Playfair Display\', Georgia, serif; font-size: 13.5pt; color: #7a5c1e; margin: 1.4rem 0 0.5rem 0;';
  });
  bodyHost.querySelectorAll('h4').forEach((h) => {
    h.style.cssText = 'font-family: \'Playfair Display\', Georgia, serif; font-size: 12pt; color: #7a5c1e; margin: 1.2rem 0 0.4rem 0;';
  });
  bodyHost.querySelectorAll('p').forEach((p) => {
    p.style.cssText = 'margin: 0 0 0.8rem 0;';
  });
  bodyHost.querySelectorAll('blockquote').forEach((bq) => {
    bq.style.cssText = 'border-left: 3px solid #c8a962; padding: 0.2rem 0 0.2rem 1rem; margin: 1rem 0; color: #4a5563; font-style: italic;';
  });
  bodyHost.querySelectorAll('hr').forEach((hr) => {
    hr.style.cssText = 'border: none; border-top: 1px solid #d8dde3; margin: 1.2rem 0;';
  });
  bodyHost.querySelectorAll('strong').forEach((s) => {
    s.style.cssText = 'color: #1a2536;';
  });
  wrap.appendChild(bodyHost);

  // Footer: Autor + Hinweis + Newsletter
  const footer = document.createElement('div');
  footer.style.cssText = 'margin-top: 2rem; padding-top: 1.2rem; border-top: 1px solid #c8a962; font-size: 10.5pt; color: #3a4a5a;';
  footer.innerHTML = `
    <p style="font-family: 'Playfair Display', Georgia, serif; font-size: 12pt; color: #7a5c1e; margin: 0 0 0.4rem 0;">Über den Autor</p>
    <p style="margin: 0 0 1rem 0; line-height: 1.6;">Micha Levzion lebt mit seiner Frau und sieben Kindern in Israel und schreibt auf <strong>Schalom Israel</strong> über die Bibel, das Land und den Glauben. Er liebt es, tief in die Texte zu gehen und das Entdeckte so aufzubereiten, dass es herausfordert, überrascht und mitten ins Leben trifft.</p>
    <p style="margin: 0 0 0.4rem 0;">Diesen Artikel und viele weitere findest du auf <strong>schalom-israel.de</strong>.</p>
    <p style="margin: 0;">Wenn du regelmäßig Impulse zur Wochenlesung, biblische Perspektiven und Einblicke aus Israel bekommen möchtest, melde dich für den Newsletter an: <strong>schalom-israel.de/newsletter</strong></p>
  `;
  wrap.appendChild(footer);

  return wrap;
}

function exportArticleToPdf(triggerBtn) {
  const btn = triggerBtn || document.querySelector('.share-btn--pdf');
  const originalLabel = btn ? btn.textContent : null;
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'PDF wird erstellt …';
  }

  loadHtml2Pdf().then((html2pdf) => {
    const doc = buildPdfDocument();
    if (!doc) throw new Error('Artikel-Inhalt nicht gefunden.');

    // Sichtbar ins DOM einhängen, aber off-screen positioniert.
    // html2canvas rendert nur Elemente mit echter Layout-Position und Größe.
    doc.style.position = 'absolute';
    doc.style.top = '0';
    doc.style.left = '-9999px';
    doc.style.width = '720px';
    doc.style.padding = '24px';
    doc.style.boxSizing = 'border-box';
    doc.style.background = '#ffffff';
    doc.style.display = 'block';
    document.body.appendChild(doc);

    console.log('[PDF] Container im DOM, Höhe:', doc.offsetHeight, 'px, Inhalt-Vorschau:', doc.innerText.slice(0, 120));

    const slugMatch = window.location.pathname.split('/').filter(Boolean).pop() || 'artikel';
    const filename = `schalom-israel-${slugMatch}.pdf`;

    return html2pdf().set({
      margin: [15, 15, 18, 15],
      filename: filename,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(doc).save().finally(() => {
      doc.remove();
    });
  }).catch((err) => {
    console.error('PDF-Export fehlgeschlagen:', err);
    alert('Der PDF-Export ist fehlgeschlagen.\n\nFehlermeldung:\n' + (err && err.message ? err.message : err));
  }).finally(() => {
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalLabel || 'Als PDF';
    }
  });
}

window.exportArticleToPdf = exportArticleToPdf;

// ────── Testimonials-Marquee: Cards für nahtlose Endlosschleife duplizieren ──────
function setupTestimonialsMarquee() {
  const track = document.getElementById('testimonials-track');
  if (!track) return;
  if (track.dataset.cloned === '1') return;
  // prefers-reduced-motion respektieren: keine Klone, kein Duplikat — Track ist scrollbar
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    track.dataset.cloned = '1';
    return;
  }
  Array.from(track.children).forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
  track.dataset.cloned = '1';
}

// ────── Init ──────
document.addEventListener('DOMContentLoaded', function () {
  mountFreebieCovers();
  mountKlicktippForms();
  mountReadingTime();
  mountAutoToc();
  setupTestimonialsMarquee();

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
