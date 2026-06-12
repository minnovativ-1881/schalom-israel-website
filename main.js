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
// Nutzt einen versteckten <iframe> mit einer drucker-optimierten HTML-Seite und ruft
// window.print() auf. Browser bietet "Als PDF speichern" als Default, generiert ein
// sauberes Vektor-PDF mit echten Web-Fonts und ohne externe Library.

function exportArticleToPdf(triggerBtn) {
  const btn = triggerBtn || document.querySelector('.share-btn--pdf');
  const originalLabel = btn ? btn.textContent : null;
  const restoreBtn = () => {
    if (!btn) return;
    btn.disabled = false;
    btn.textContent = originalLabel || 'Als PDF';
  };

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'PDF wird vorbereitet …';
  }

  try {
    const titleEl = document.querySelector('.article-hero-title');
    const main = document.querySelector('.article-main');
    if (!titleEl || !main) throw new Error('Artikel-Inhalt nicht gefunden.');

    const title = titleEl.textContent.trim();
    const slug = window.location.pathname.split('/').filter(Boolean).pop() || 'artikel';
    const filename = `schalom-israel-${slug}`;

    const bodyClone = main.cloneNode(true);
    [
      '.article-share-img',
      '.inline-optin',
      '.article-optin',
      '.article-toc',
      '.article-tags',
      'script',
    ].forEach((sel) => {
      bodyClone.querySelectorAll(sel).forEach((el) => el.remove());
    });
    const inner = bodyClone.querySelector('.container') || bodyClone;
    const bodyHtml = inner.innerHTML;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:fixed; right:0; bottom:0; width:0; height:0; border:0; visibility:hidden;';
    document.body.appendChild(iframe);

    const css = `
      @page { size: A4; margin: 18mm 16mm 20mm 16mm; }
      html, body { margin: 0; padding: 0; background: #ffffff; }
      body { font-family: 'Inter', Arial, sans-serif; color: #2a3543; line-height: 1.7; font-size: 11pt; }
      .pdf-header { text-align: center; padding-bottom: 1rem; border-bottom: 1px solid #c8a962; margin-bottom: 1.5rem; }
      .pdf-brand { font-size: 10pt; color: #7a5c1e; letter-spacing: 0.12em; text-transform: uppercase; margin: 0 0 0.5rem 0; }
      .pdf-title { font-family: 'Playfair Display', Georgia, serif; font-size: 22pt; color: #1a2536; margin: 0; line-height: 1.25; }
      .pdf-author { font-size: 9.5pt; color: #7a8896; margin: 0.6rem 0 0 0; }
      .pdf-body p { margin: 0 0 0.8rem 0; }
      .pdf-body h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 16pt; color: #1a2536; margin: 1.6rem 0 0.6rem 0; line-height: 1.3; page-break-after: avoid; }
      .pdf-body h3 { font-family: 'Playfair Display', Georgia, serif; font-size: 13pt; color: #7a5c1e; margin: 1.4rem 0 0.5rem 0; line-height: 1.3; page-break-after: avoid; }
      .pdf-body h4 { font-family: 'Playfair Display', Georgia, serif; font-size: 11.5pt; color: #7a5c1e; margin: 1.2rem 0 0.4rem 0; page-break-after: avoid; }
      .pdf-body blockquote { border-left: 3px solid #c8a962; padding: 0.2rem 0 0.2rem 1rem; margin: 1rem 0; color: #4a5563; font-style: italic; page-break-inside: avoid; }
      .pdf-body hr { border: none; border-top: 1px solid #d8dde3; margin: 1.2rem 0; }
      .pdf-body strong { color: #1a2536; }
      .pdf-body em { font-style: italic; }
      .pdf-body img { display: none; }
      .pdf-footer { margin-top: 2rem; padding-top: 1.2rem; border-top: 1px solid #c8a962; font-size: 10pt; color: #3a4a5a; page-break-inside: avoid; }
      .pdf-footer-title { font-family: 'Playfair Display', Georgia, serif; font-size: 12pt; color: #7a5c1e; margin: 0 0 0.4rem 0; }
      .pdf-footer p { margin: 0 0 0.6rem 0; line-height: 1.6; }
      .pdf-footer p:last-child { margin-bottom: 0; }
    `;

    const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  <style>${css}</style>
</head>
<body>
  <div class="pdf-header">
    <p class="pdf-brand">Schalom Israel</p>
    <h1 class="pdf-title">${title}</h1>
    <p class="pdf-author">von Micha Levzion</p>
  </div>
  <div class="pdf-body">${bodyHtml}</div>
  <div class="pdf-footer">
    <p class="pdf-footer-title">Über den Autor</p>
    <p>Micha Levzion lebt mit seiner Frau und sieben Kindern in Israel und schreibt auf <strong>Schalom Israel</strong> über die Bibel, das Land und den Glauben. Er liebt es, tief in die Texte zu gehen und das Entdeckte so aufzubereiten, dass es herausfordert, überrascht und mitten ins Leben trifft.</p>
    <p>Diesen Artikel und viele weitere findest du auf <strong>schalom-israel.de</strong>.</p>
    <p>Wenn du regelmäßig Impulse zur Wochenlesung, biblische Perspektiven und Einblicke aus Israel bekommen möchtest, melde dich für den Newsletter an: <strong>schalom-israel.de/newsletter</strong></p>
  </div>
</body>
</html>`;

    const idoc = iframe.contentDocument || iframe.contentWindow.document;
    idoc.open();
    idoc.write(html);
    idoc.close();

    const triggerPrint = () => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (e) {
        console.error('Druckdialog konnte nicht geöffnet werden:', e);
        alert('Der Druckdialog konnte nicht geöffnet werden.\n\nMeldung: ' + (e && e.message ? e.message : e));
      } finally {
        setTimeout(() => iframe.remove(), 1500);
        restoreBtn();
      }
    };

    // Auf Schriften und Layout warten, dann drucken
    const waitForFonts = iframe.contentDocument && iframe.contentDocument.fonts && iframe.contentDocument.fonts.ready
      ? iframe.contentDocument.fonts.ready
      : new Promise((r) => setTimeout(r, 600));
    waitForFonts.then(triggerPrint).catch(triggerPrint);
  } catch (err) {
    console.error('PDF-Export fehlgeschlagen:', err);
    alert('Der PDF-Export ist fehlgeschlagen.\n\nFehlermeldung:\n' + (err && err.message ? err.message : err));
    restoreBtn();
  }
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

// ────── Teilen-Aufruf: dezentes Reveal beim Hereinscrollen ──────
function mountShareReveal() {
  const section = document.querySelector('.share-section');
  if (!section) return;
  section.classList.add('reveal-armed');
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    section.classList.add('is-revealed');
    return;
  }
  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });
  obs.observe(section);
}

// ────── Init ──────
document.addEventListener('DOMContentLoaded', function () {
  mountFreebieCovers();
  mountKlicktippForms();
  mountReadingTime();
  mountAutoToc();
  setupTestimonialsMarquee();
  mountShareReveal();

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

  // Burger-Menue wird vom <site-nav> Web Component selbst gehandhabt.
});
