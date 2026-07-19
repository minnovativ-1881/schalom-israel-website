// =============================================
// SCHALOM ISRAEL - parascha-daten.js
// Einzige Wahrheit fuer Parascha-Namen, Bibelstellen und Artikel-Zuordnung.
// Genutzt von /parascha/ und /entdecken/hebraeischer-geburtstag/.
//
// Herausgezogen aus parascha/index.html. Verhalten unveraendert.
// UMD: laeuft per <script> im Browser und per require() in node.
// =============================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ParaschaDaten = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  // Mapping: Hebcal-Name (en) -> { de, hebrew, meaning, slugs (mögliche Blog-data-parasha-Werte) }
  const PARASHA = {
    'Bereshit':       { de: 'Bereschit',      he: 'בְּרֵאשִׁית',     meaning: 'Im Anfang',                slugs: ['bereschit'] },
    'Noach':          { de: 'Noach',          he: 'נֹחַ',             meaning: 'Noah, Ruhe',               slugs: ['noach'] },
    'Lech-Lecha':     { de: 'Lech Lecha',     he: 'לֶךְ-לְךָ',         meaning: 'Geh für dich',             slugs: ['lech-lecha'] },
    'Vayera':         { de: 'Wajera',         he: 'וַיֵּרָא',         meaning: 'Und er erschien',          slugs: ['wajera', 'wajeira'] },
    'Chayei Sara':    { de: 'Chajei Sara',    he: 'חַיֵּי שָׂרָה',    meaning: 'Das Leben Saras',          slugs: ['chajei-sara', 'chajei-sarah', 'chaje-sara'] },
    'Toldot':         { de: 'Toldot',         he: 'תּוֹלְדוֹת',       meaning: 'Nachkommen',               slugs: ['toldot', 'toledot'] },
    'Vayetzei':       { de: 'Wajetze',        he: 'וַיֵּצֵא',         meaning: 'Und er zog aus',           slugs: ['wajetze'] },
    'Vayishlach':     { de: 'Wajischlach',    he: 'וַיִּשְׁלַח',       meaning: 'Und er sandte',            slugs: ['wajischlach', 'waijschlach'] },
    'Vayeshev':       { de: 'Wajeschew',      he: 'וַיֵּשֶׁב',         meaning: 'Und er wohnte',            slugs: ['wajeschew'] },
    'Miketz':         { de: 'Miketz',         he: 'מִקֵּץ',            meaning: 'Am Ende von',              slugs: ['mikez', 'miketz'] },
    'Vayigash':       { de: 'Wajigasch',      he: 'וַיִּגַּשׁ',        meaning: 'Und er trat heran',        slugs: ['wajigasch', 'wajigash'] },
    'Vayechi':        { de: 'Wajechi',        he: 'וַיְחִי',           meaning: 'Und er lebte',             slugs: ['wajechi', 'wajchi'] },
    'Shemot':         { de: 'Schemot',        he: 'שְׁמוֹת',           meaning: 'Namen',                    slugs: ['schemot'] },
    'Vaera':          { de: 'Waera',          he: 'וָאֵרָא',           meaning: 'Und ich erschien',         slugs: ['waera'] },
    'Bo':             { de: 'Bo',             he: 'בֹּא',              meaning: 'Geh hin',                  slugs: ['bo'] },
    'Beshalach':      { de: 'Beschallach',    he: 'בְּשַׁלַּח',         meaning: 'Als er entließ',           slugs: ['beschallach', 'beschalach'] },
    'Yitro':          { de: 'Jitro',          he: 'יִתְרוֹ',           meaning: 'Jitro',                    slugs: ['jitro'] },
    'Mishpatim':      { de: 'Mischpatim',     he: 'מִשְׁפָּטִים',      meaning: 'Gesetze, Urteile',         slugs: ['mischpatim'] },
    'Terumah':        { de: 'Teruma',         he: 'תְּרוּמָה',         meaning: 'Abgabe, Gabe',             slugs: ['teruma'] },
    'Tetzaveh':       { de: 'Tetzawe',        he: 'תְּצַוֶּה',         meaning: 'Und du sollst befehlen',   slugs: ['tetzawe', 'tezawe'] },
    'Ki Tisa':        { de: 'Ki Tisa',        he: 'כִּי תִשָּׂא',      meaning: 'Wenn du zählst',           slugs: ['ki-tisa', 'ki-tissa'] },
    'Vayakhel':       { de: 'Wajakhel',       he: 'וַיַּקְהֵל',        meaning: 'Und er versammelte',       slugs: ['wajakhel'] },
    'Pekudei':        { de: 'Pekudei',        he: 'פְקוּדֵי',          meaning: 'Aufzeichnungen',           slugs: ['pekudei'] },
    'Vayikra':        { de: 'Wajikra',        he: 'וַיִּקְרָא',         meaning: 'Und er rief',              slugs: ['wajikra'] },
    'Tzav':           { de: 'Tzaw',           he: 'צַו',                meaning: 'Befiehl',                  slugs: ['tzaw', 'zaw'] },
    'Shmini':         { de: 'Schemini',       he: 'שְׁמִינִי',          meaning: 'Der achte',                slugs: ['schemini'] },
    'Tazria':         { de: 'Tazria',         he: 'תַזְרִיעַ',          meaning: 'Sie wird gebären',         slugs: ['tazria'] },
    'Metzora':        { de: 'Metzora',        he: 'מְצֹרָע',            meaning: 'Aussätziger',              slugs: ['metzora', 'mezora'] },
    'Achrei Mot':     { de: 'Acharei Mot',    he: 'אַחֲרֵי מוֹת',      meaning: 'Nach dem Tod',             slugs: ['achrei-mot', 'acharei-mot', 'acharej-mot'] },
    'Kedoshim':       { de: 'Kedoschim',      he: 'קְדוֹשִׁים',         meaning: 'Heilige',                  slugs: ['kedoschim'] },
    'Emor':           { de: 'Emor',           he: 'אֱמוֹר',             meaning: 'Sprich',                   slugs: ['emor'] },
    'Behar':          { de: 'Behar',          he: 'בְּהַר',             meaning: 'Auf dem Berg',             slugs: ['behar'] },
    'Bechukotai':     { de: 'Bechukotai',     he: 'בְּחֻקֹּתַי',        meaning: 'In meinen Satzungen',      slugs: ['bechukotai', 'bechukkotai', 'bechukotaj'] },
    'Bamidbar':       { de: 'Bamidbar',       he: 'בְּמִדְבַּר',        meaning: 'In der Wüste',             slugs: ['bamidbar'] },
    'Nasso':          { de: 'Nasso',          he: 'נָשֹׂא',             meaning: 'Erhebe',                   slugs: ['nasso'] },
    "Beha'alotcha":   { de: "Beha'alotcha",   he: 'בְּהַעֲלֹתְךָ',     meaning: 'Wenn du aufstellst',       slugs: ['behaalotcha'] },
    "Sh'lach":        { de: 'Schelach',       he: 'שְׁלַח',             meaning: 'Sende',                    slugs: ['schelach', 'schlach', 'schlach-lecha'] },
    'Korach':         { de: 'Korach',         he: 'קֹרַח',              meaning: 'Korach',                   slugs: ['korach'] },
    'Chukat':         { de: 'Chukat',         he: 'חֻקַּת',             meaning: 'Satzung',                  slugs: ['chukat'] },
    'Balak':          { de: 'Balak',          he: 'בָּלָק',             meaning: 'Balak',                    slugs: ['balak'] },
    'Pinchas':        { de: 'Pinchas',        he: 'פִּינְחָס',          meaning: 'Pinchas',                  slugs: ['pinchas'] },
    'Matot':          { de: 'Matot',          he: 'מַטּוֹת',            meaning: 'Stämme',                   slugs: ['matot'] },
    'Masei':          { de: 'Masei',          he: 'מַסְעֵי',            meaning: 'Reisen, Wanderungen',      slugs: ['masei', 'massei', 'masej'] },
    'Devarim':        { de: 'Devarim',        he: 'דְּבָרִים',          meaning: 'Worte',                    slugs: ['dewarim', 'devarim'] },
    'Vaetchanan':     { de: 'Waetchanan',     he: 'וָאֶתְחַנַּן',       meaning: 'Und ich flehte',           slugs: ['waetchanan'] },
    'Eikev':          { de: 'Ekev',           he: 'עֵקֶב',              meaning: 'Als Folge davon',          slugs: ['ekev', 'ekew'] },
    "Re'eh":          { de: 'Reeh',           he: 'רְאֵה',              meaning: 'Sieh',                     slugs: ['reeh', 'ree'] },
    'Shoftim':        { de: 'Schoftim',       he: 'שֹׁפְטִים',          meaning: 'Richter',                  slugs: ['schoftim'] },
    'Ki Teitzei':     { de: 'Ki Tetze',       he: 'כִּי תֵצֵא',         meaning: 'Wenn du ausziehst',        slugs: ['ki-tetze', 'ki-teize'] },
    'Ki Tavo':        { de: 'Ki Tavo',        he: 'כִּי תָבוֹא',        meaning: 'Wenn du kommst',           slugs: ['ki-tavo', 'ki-tawo'] },
    'Nitzavim':       { de: 'Nizavim',        he: 'נִצָּבִים',          meaning: 'Ihr steht',                slugs: ['nizavim', 'nitzavim'] },
    'Vayelech':       { de: 'Wajelech',       he: 'וַיֵּלֶךְ',          meaning: 'Und er ging',              slugs: ['wajelech'] },
    "Ha'azinu":       { de: 'Haazinu',        he: 'הַאֲזִינוּ',         meaning: 'Hört zu',                  slugs: ['haazinu', 'haasin'] },
    'Vezot Haberachah':{ de: 'Wesot Haberacha',he: 'וְזֹאת הַבְּרָכָה', meaning: 'Und dies ist der Segen',   slugs: ['wesot-haberacha', 'wesot-habracha'] }
  };

  // Konvertiert englische Bibelstellen ("Leviticus 25:1-27:34") in deutsche Form
  // ("3. Mose 25,1–27,34"). Funktioniert auch für mehrere Stellen mit Komma.
  const BIBLE_BOOKS = {
    'Genesis': '1. Mose',
    'Exodus': '2. Mose',
    'Leviticus': '3. Mose',
    'Numbers': '4. Mose',
    'Deuteronomy': '5. Mose',
    'Joshua': 'Jos',
    'Judges': 'Ri',
    'I Samuel': '1. Sam', '1 Samuel': '1. Sam',
    'II Samuel': '2. Sam', '2 Samuel': '2. Sam',
    'I Kings': '1. Kön', '1 Kings': '1. Kön',
    'II Kings': '2. Kön', '2 Kings': '2. Kön',
    'Isaiah': 'Jes',
    'Jeremiah': 'Jer',
    'Ezekiel': 'Hes',
    'Hosea': 'Hos',
    'Joel': 'Joel',
    'Amos': 'Am',
    'Obadiah': 'Obd',
    'Jonah': 'Jona',
    'Micah': 'Mi',
    'Nahum': 'Nah',
    'Habakkuk': 'Hab',
    'Zephaniah': 'Zef',
    'Haggai': 'Hag',
    'Zechariah': 'Sach',
    'Malachi': 'Mal',
    'Psalms': 'Ps', 'Psalm': 'Ps',
    'Proverbs': 'Spr',
    'Job': 'Hi',
    'Song of Songs': 'Hld', 'Song of Solomon': 'Hld',
    'Ruth': 'Rut',
    'Lamentations': 'Klgl',
    'Ecclesiastes': 'Pred',
    'Esther': 'Est',
    'Daniel': 'Dan',
    'Ezra': 'Esr',
    'Nehemiah': 'Neh',
    'I Chronicles': '1. Chr', '1 Chronicles': '1. Chr',
    'II Chronicles': '2. Chr', '2 Chronicles': '2. Chr'
  };

  function germanizeReference(ref) {
    if (!ref) return '';
    // Mehrere Verweise mit ";" oder "," getrennt einzeln behandeln
    return ref.split(';').map(part => germanizeSingleRef(part.trim())).filter(Boolean).join('; ');
  }

  function germanizeSingleRef(ref) {
    if (!ref) return '';
    // Match: "Book Name 1:2-3:4" oder "Book Name 1:2"
    const match = ref.match(/^(.+?)\s+(\d+):(\d+)(?:[-–](\d+)(?::(\d+))?)?$/);
    if (!match) return ref;
    const [, bookName, c1, v1, c2OrV2, v2] = match;
    const germanBook = BIBLE_BOOKS[bookName] || bookName;
    // Wenn nur "31:5" als Range, ist c2OrV2 = endVers im selben Kapitel
    // Wenn "1:1-6:8" als Range, ist c2OrV2 = endKapitel und v2 = endVers
    if (!c2OrV2) {
      return `${germanBook} ${c1},${v1}`;
    }
    if (v2) {
      // Bleibt der Bereich im selben Kapitel, nennt die deutsche Zitierweise
      // das Kapitel nur einmal: "25,29–38" statt "25,29–25,38".
      // Kommt bei Aliyot staendig vor, weil sie kurz sind.
      if (c1 === c2OrV2) {
        return `${germanBook} ${c1},${v1}–${v2}`;
      }
      return `${germanBook} ${c1},${v1}–${c2OrV2},${v2}`;
    }
    return `${germanBook} ${c1},${v1}–${c2OrV2}`;
  }

  function lookupParasha(hebcalName) {
    // Direct hit
    if (PARASHA[hebcalName]) return [PARASHA[hebcalName]];
    // Combined parasha like "Behar-Bechukotai" or "Chukat-Balak"
    if (hebcalName.includes('-')) {
      const parts = hebcalName.split('-');
      const result = parts.map(p => PARASHA[p.trim()]).filter(Boolean);
      if (result.length) return result;
    }
    return [];
  }

  function formatDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    const months = ['Jan.','Feb.','März','Apr.','Mai','Juni','Juli','Aug.','Sep.','Okt.','Nov.','Dez.'];
    const days = ['Son.','Mon.','Die.','Mit.','Don.','Fre.','Sam.'];
    return `${days[d.getDay()]}, ${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function dayDiff(iso) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(iso + 'T00:00:00');
    return Math.round((target - today) / (1000 * 60 * 60 * 24));
  }

  function relativeLabel(iso) {
    const diff = dayDiff(iso);
    if (diff < 0) return 'vergangener Schabbat';
    if (diff === 0) return 'heute';
    if (diff === 1) return 'morgen';
    if (diff < 7) return `in ${diff} Tagen`;
    const weeks = Math.round(diff / 7);
    if (weeks === 1) return 'nächste Woche';
    return `in ${weeks} Wochen`;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Lädt /blog/ und sammelt {data-parasha: [{ href, title, excerpt, image }]}
  // Nur im Browser nutzbar (fetch + DOMParser).
  async function loadArticleIndex() {
    try {
      const res = await fetch('/blog/');
      if (!res.ok) throw new Error('Blog nicht erreichbar');
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const cards = doc.querySelectorAll('.article-card[data-parasha]');
      const idx = {};
      cards.forEach(card => {
        const slug = card.dataset.parasha;
        if (!slug) return;
        const titleEl = card.querySelector('.article-title a');
        const excerptEl = card.querySelector('.article-excerpt');
        const imageEl = card.querySelector('.article-image');
        if (!titleEl) return;
        if (!idx[slug]) idx[slug] = [];
        // Avoid duplicates by href
        if (!idx[slug].some(a => a.href === titleEl.getAttribute('href'))) {
          idx[slug].push({
            href: titleEl.getAttribute('href'),
            title: titleEl.textContent.trim(),
            excerpt: excerptEl ? excerptEl.textContent.trim() : '',
            image: imageEl ? imageEl.getAttribute('src').replace(/^\.\.\//, '/') : null
          });
        }
      });
      return idx;
    } catch (e) {
      console.warn('Artikel-Index konnte nicht geladen werden:', e);
      return {};
    }
  }

  // Erschienene Bände der Reihe "Das Tora-Jahr", nach Hebcal-Buchname.
  // Wird von /parascha/ und vom hebräischen Geburtstag genutzt. Kommt ein
  // Band dazu, gehört er NUR hier hinein, sonst driften die Seiten auseinander.
  const BUECHER = {
    'Numbers':     { band: 'IV', name: 'Bamidbar', sub: 'In der Wüste', anzahl: 'zehn', slug: 'bamidbar' },
    'Deuteronomy': { band: 'V',  name: 'Devarim',  sub: 'Worte',        anzahl: 'elf',  slug: 'devarim'  }
  };

  // Ermittelt den Band aus einer Hebcal-Stellenangabe ("Leviticus 25:1-27:34").
  // Gibt null, wenn zu diesem Buch noch kein Band erschienen ist.
  function buchFuerStelle(summary) {
    const treffer = String(summary || '').match(/^([A-Za-z' ]+?)\s+\d/);
    return treffer ? (BUECHER[treffer[1].trim()] || null) : null;
  }

  function articlesForParasha(entry, articleIdx) {
    if (!entry || !entry.slugs) return [];
    const seen = new Set();
    const out = [];
    entry.slugs.forEach(slug => {
      const list = articleIdx[slug] || [];
      list.forEach(a => {
        if (!seen.has(a.href)) {
          seen.add(a.href);
          out.push(a);
        }
      });
    });
    return out;
  }

  return {
    PARASHA,
    BIBLE_BOOKS,
    BUECHER,
    buchFuerStelle,
    germanizeReference,
    germanizeSingleRef,
    lookupParasha,
    formatDate,
    dayDiff,
    relativeLabel,
    escapeHtml,
    loadArticleIndex,
    articlesForParasha,
  };
});
