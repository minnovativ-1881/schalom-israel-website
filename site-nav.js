// =============================================
// SCHALOM ISRAEL – site-nav.js
// Zentrale Navigation als Custom Element.
// Aenderungen hier wirken auf allen Seiten.
// =============================================
(function () {
  const ITEMS = [
    { href: '/',                      label: 'Home',              match: (p) => p === '/' || p === '' },
    { href: '/blog',                  label: 'Blog',              match: (p) => p === '/blog' || p.startsWith('/blog/') },
    { href: '/themen',                label: 'Themen',            match: (p) => p === '/themen' || p.startsWith('/themen/') },
    { href: '/parascha',              label: 'Parascha',          match: (p) => p === '/parascha' || p.startsWith('/parascha/') },
    { href: '/entdecken',             label: 'Entdecken',         match: (p) => p === '/entdecken' || p.startsWith('/entdecken/') },
    { href: '/buecher-und-musik/',    label: 'Bücher & Musik',    match: (p) => p.startsWith('/buecher') || p.startsWith('/musik') },
    { href: '/warum-schalom-israel',  label: 'Über das Projekt',  match: (p) => p === '/warum-schalom-israel' || p.startsWith('/warum-schalom-israel/') },
    { href: '/bibelverse',            label: '7 Verse',           match: (p) => p === '/bibelverse' || p.startsWith('/bibelverse/'), cta: true },
  ];

  class SiteNav extends HTMLElement {
    connectedCallback() {
      const path = (window.location.pathname || '/').replace(/\/index\.html$/, '/');
      const linksHtml = ITEMS.map((it) => {
        const active = it.match(path);
        const classes = [];
        if (it.cta) classes.push('nav-cta');
        if (active) classes.push('is-active');
        const cls = classes.length ? ` class="${classes.join(' ')}"` : '';
        return `<li><a href="${it.href}"${cls}>${it.label}</a></li>`;
      }).join('\n            ');

      this.innerHTML = `<nav class="nav">
    <div class="nav-inner">
      <a href="/" class="logo">Schalom <strong>Israel</strong></a>
      <button class="nav-burger" aria-label="Menü öffnen">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <ul class="nav-links">
            ${linksHtml}
      </ul>
    </div>
  </nav>`;

      const burger = this.querySelector('.nav-burger');
      const links = this.querySelector('.nav-links');
      if (burger && links) {
        burger.addEventListener('click', () => {
          burger.classList.toggle('is-open');
          links.classList.toggle('is-open');
          links.classList.toggle('open');
        });
        links.querySelectorAll('a').forEach((link) => {
          link.addEventListener('click', () => {
            burger.classList.remove('is-open');
            links.classList.remove('is-open');
            links.classList.remove('open');
          });
        });
      }
    }
  }

  if (!customElements.get('site-nav')) {
    customElements.define('site-nav', SiteNav);
  }
})();
