// =============================================
// SCHALOM ISRAEL - Eingebuergerte Schreibweisen
//
// Regel 9: Manche Namen haben im Hebraeischen eine feste Schreibweise, die ein
// Israeli erwartet. Die schlaegt die Rechenregel. "David" bleibt דוד und wird
// nicht zu דויד.
//
// WICHTIG, und das ist der Unterschied zum Tool unter /entdecken/:
// Diese Liste schreibt nie den NAMEN um, nur die SCHREIBWEISE. Hans wird הנס
// und nicht יוחנן. Was ein Name bedeutet, ist eine zweite Information und
// gehoert nicht in die Schrift auf dem Papier.
//
// Aufgenommen wird nur, was die Regel nicht von selbst richtig trifft. Jeder
// Eintrag hier ist eine Ausnahme und wird in test/umschrift.test.js geprueft.
//
// UMD, damit ohne Browser testbar.
// =============================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NameEtabliert = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  // Gilt in jeder Sprache gleich. Fast alles davon sind Namen aus dem Tanach,
  // deren Schreibweise ueberliefert ist und deren Klang zugleich passt.
  const UEBERALL = {
    david: 'דוד', daniel: 'דניאל', samuel: 'שמואל', benjamin: 'בנימין',
    gabriel: 'גבריאל', michael: 'מיכאל', raphael: 'רפאל', rafael: 'רפאל',
    ariel: 'אריאל', uriel: 'אוריאל', nathanael: 'נתנאל', natanael: 'נתנאל',
    jonathan: 'יונתן', jonatan: 'יונתן', nathan: 'נתן', natan: 'נתן',
    adam: 'אדם', noa: 'נועה', tamar: 'תמר', abigail: 'אביגיל',
    sara: 'שרה', sarah: 'שרה', rachel: 'רחל', rahel: 'רחל',
    rebekka: 'רבקה', rebecca: 'רבקה', lea: 'לאה', leah: 'לאה',
    ruth: 'רות', rut: 'רות', esther: 'אסתר', ester: 'אסתר',
    miriam: 'מרים', mirjam: 'מרים', naomi: 'נעמי', noomi: 'נעמי',
    judith: 'יהודית', debora: 'דבורה', deborah: 'דבורה',
    levi: 'לוי', schalom: 'שלום', shalom: 'שלום',
    jael: 'יעל', keren: 'קרן', tal: 'טל', ilan: 'אילן', schira: 'שירה',
    amos: 'עמוס', micha: 'מיכה', joel: 'יואל', asaf: 'אסף',
  };

  // Je Sprache. Hier stehen die Faelle, in denen dieselbe Buchstabenfolge
  // anders klingt und deshalb anders geschrieben wird.
  const JE_SPRACHE = {
    de: {
      thomas: 'תומאס', stefan: 'שטפן', stephan: 'שטפן', klaus: 'קלאוס',
      jürgen: 'יורגן', juergen: 'יורגן', wolfgang: 'וולפגנג',
      heinrich: 'היינריך', günther: 'גינטר', guenther: 'גינטר',
      helmut: 'הלמוט', manfred: 'מנפרד', christoph: 'כריסטוף',
      andreas: 'אנדריאס', markus: 'מרקוס', marcus: 'מרקוס',
      matthias: 'מתיאס', mathias: 'מתיאס', sebastian: 'סבסטיאן',
      alexander: 'אלכסנדר', tobias: 'טוביאס', jonas: 'יונאס',
      lukas: 'לוקאס', lucas: 'לוקאס', niklas: 'ניקלאס', felix: 'פליקס',
      philipp: 'פיליפ', philip: 'פיליפ', moritz: 'מוריץ', oskar: 'אוסקר',
      paul: 'פאול', leon: 'לאון', luis: 'לואיס', louis: 'לואיס',
      uwe: 'אווה', ole: 'אולה', lars: 'לארס', sven: 'סוון',
      horst: 'הורסט', dieter: 'דיטר', gerhard: 'גרהרד',
      siegfried: 'זיגפריד', friedrich: 'פרידריך', wilhelm: 'וילהלם',
      ludwig: 'לודוויג', hermann: 'הרמן', walter: 'ולטר', werner: 'ורנר',
      volker: 'פולקר', veit: 'פייט', vera: 'ורה', viktor: 'ויקטור',
      victor: 'ויקטור', jörg: 'יורג', joerg: 'יורג', ralf: 'רלף',
      // Namen franzoesischer Herkunft, die im Deutschen franzoesisch
      // gesprochen werden. Ohne Eintrag wuerde die deutsche Regel ein K
      // daraus machen.
      charlotte: 'שרלוט', chantal: 'שנטל', michelle: 'מישל',
      jacqueline: 'ז׳קלין', jean: 'ז׳אן', josephine: 'ז׳וזפין',
      nicole: 'ניקול', marcel: 'מרסל', rene: 'רנה', renee: 'רנה',
      hannah: 'האנה', hanna: 'האנה', johanna: 'יוהנה', joanna: 'יוהנה',
      maria: 'מריה', marie: 'מארי', sophie: 'סופי', sofie: 'סופי',
      clara: 'קלרה', klara: 'קלרה', martha: 'מרתה', marta: 'מרתה',
      elisabeth: 'אליזבת', elisabet: 'אליזבת',
      katharina: 'קתרינה', catharina: 'קתרינה', katrin: 'קתרין',
      christina: 'כריסטינה', christiane: 'כריסטיאנה',
      susanne: 'סוזנה', theresa: 'תרזה', teresa: 'תרזה',
      claudia: 'קלאודיה', laura: 'לאורה', luisa: 'לואיזה',
      luise: 'לואיזה', louise: 'לואיזה', frieda: 'פרידה',
      angelika: 'אנגליקה', gabriele: 'גבריאלה', renate: 'רנטה',
      brigitte: 'בריגיטה', gisela: 'גיזלה', rosa: 'רוזה',
      jessica: 'יסיקה', patrizia: 'פטריציה', zoe: 'זואי',
      thorsten: 'תורסטן', torsten: 'תורסטן', mathilde: 'מתילדה',
    },
    en: {
      john: 'ג׳ון', james: 'ג׳יימס', michael: 'מייקל',
      david: 'דייוויד', richard: 'ריצ׳רד', joseph: 'ג׳וזף',
      thomas: 'תומאס', charles: 'צ׳ארלס', christopher: 'כריסטופר',
      matthew: 'מת׳יו', anthony: 'אנתוני', donald: 'דונלד',
      steven: 'סטיבן', stephen: 'סטיבן', andrew: 'אנדרו',
      joshua: 'ג׳ושוע', kenneth: 'קנת׳', george: 'ג׳ורג׳',
      edward: 'אדוארד', ronald: 'רונלד', timothy: 'טימותי',
      jason: 'ג׳ייסון', jeffrey: 'ג׳פרי', ryan: 'ראיין',
      jacob: 'ג׳ייקוב', nicholas: 'ניקולס', jonathan: 'ג׳ונתן',
      justin: 'ג׳סטין', brandon: 'ברנדון', benjamin: 'בנג׳מין',
      samuel: 'סמואל', gregory: 'גרגורי', raymond: 'ריימונד',
      patrick: 'פטריק', jack: 'ג׳ק', jerry: 'ג׳רי',
      tyler: 'טיילר', aaron: 'אהרון', henry: 'הנרי', douglas: 'דאגלס',
      peter: 'פיטר', nathan: 'נייתן', zachary: 'זכרי', walter: 'וולטר',
      kyle: 'קייל', harold: 'הרולד', carl: 'קארל', jeremy: 'ג׳רמי',
      keith: 'קית׳', roger: 'רוג׳ר', gerald: 'ג׳רלד',
      ethan: 'איתן', arthur: 'ארתור', william: 'וויליאם',
      robert: 'רוברט', mary: 'מרי', patricia: 'פטרישה',
      jennifer: 'ג׳ניפר', linda: 'לינדה', elizabeth: 'אליזבת',
      susan: 'סוזן', jessica: 'ג׳סיקה', karen: 'קארן',
      nancy: 'ננסי', lisa: 'ליסה', betty: 'בטי', margaret: 'מרגרט',
      sandra: 'סנדרה', ashley: 'אשלי', kimberly: 'קימברלי',
      emily: 'אמילי', donna: 'דונה', michelle: 'מישל', carol: 'קרול',
      amanda: 'אמנדה', dorothy: 'דורותי', melissa: 'מליסה',
      deborah: 'דברה', stephanie: 'סטפני', sharon: 'שרון',
      laura: 'לורה', cynthia: 'סינתיה', kathleen: 'קתלין',
      amy: 'איימי', angela: 'אנג׳לה', shirley: 'שירלי',
      brenda: 'ברנדה', pamela: 'פמלה', nicole: 'ניקול',
      katherine: 'קתרין', kathryn: 'קתרין', catherine: 'קתרין',
      samantha: 'סמנתה', christine: 'כריסטין', virginia: 'וירג׳יניה',
      rachel: 'רייצ׳ל', carolyn: 'קרוליין', janet: 'ג׳נט',
      heather: 'הת׳ר', diane: 'דיאן', julie: 'ג׳ולי',
      joyce: 'ג׳ויס', victoria: 'ויקטוריה', kelly: 'קלי',
      lauren: 'לורן', joan: 'ג׳ואן', evelyn: 'אוולין',
      olivia: 'אוליביה', judith: 'ג׳ודית', megan: 'מייגן',
      martha: 'מרתה', hannah: 'האנה', jacqueline: 'ז׳קלין',
      gloria: 'גלוריה', jean: 'ג׳ין', alice: 'אליס',
      teresa: 'תרזה', theresa: 'תרזה', julia: 'ג׳וליה',
      grace: 'גרייס', judy: 'ג׳ודי', marie: 'מארי',
      denise: 'דניס', natalie: 'נטלי', sophia: 'סופיה',
      rose: 'רוז', isabella: 'איזבלה', charlotte: 'שרלוט',
      danielle: 'דניאל', diana: 'דיאנה', emma: 'אמה', sarah: 'שרה',
      luke: 'לוק', mike: 'מייק', kate: 'קייט', jane: 'ג׳יין',
      chloe: 'קלואי', christina: 'כריסטינה', rebecca: 'רבקה',
      mason: 'מייסון', tracy: 'טרייסי', chelsea: 'צ׳לסי',
    },
    fr: {
      jean: 'ז׳אן', pierre: 'פייר', michel: 'מישל', andre: 'אנדרה',
      'andré': 'אנדרה', philippe: 'פיליפ', rene: 'רנה', 'rené': 'רנה',
      louis: 'לואי', alain: 'אלן', jacques: 'ז׳אק',
      bernard: 'ברנאר', marcel: 'מרסל', roger: 'רוז׳ה',
      robert: 'רובר', paul: 'פול', claude: 'קלוד', henri: 'אנרי',
      georges: 'ז׳ורז׳', maurice: 'מוריס',
      francois: 'פרנסואה', 'françois': 'פרנסואה', charles: 'שארל',
      antoine: 'אנטואן', guy: 'גי', yves: 'איב',
      gerard: 'ז׳ראר', 'gérard': 'ז׳ראר', olivier: 'אוליביה',
      nicolas: 'ניקולא', laurent: 'לורן', thierry: 'תיירי',
      pascal: 'פסקל', didier: 'דידייה', stephane: 'סטפן',
      'stéphane': 'סטפן', frederic: 'פרדריק', 'frédéric': 'פרדריק',
      sebastien: 'סבסטיאן', 'sébastien': 'סבסטיאן',
      julien: 'ז׳וליאן', mathieu: 'מתייה', vincent: 'ונסן',
      benoit: 'בנואה', emmanuel: 'אמנואל',
      marie: 'מארי', nathalie: 'נטלי', isabelle: 'איזבל',
      sylvie: 'סילבי', catherine: 'קתרין', francoise: 'פרנסואז',
      monique: 'מוניק', nicole: 'ניקול', sophie: 'סופי', anne: 'אן',
      chantal: 'שנטל', veronique: 'ורוניק', christine: 'כריסטין',
      celine: 'סלין', 'céline': 'סלין', camille: 'קמיל',
      juliette: 'ז׳ולייט', claire: 'קלייר', charlotte: 'שרלוט',
      amelie: 'אמלי', 'amélie': 'אמלי', manon: 'מנון',
      chloe: 'קלואי', 'chloé': 'קלואי', jeanne: 'ז׳אן',
      colette: 'קולט', brigitte: 'בריז׳יט', danielle: 'דניאל',
      jacqueline: 'ז׳קלין', michelle: 'מישל', simone: 'סימון',
      agnes: 'אגנס', 'agnès': 'אגנס', delphine: 'דלפין',
      lucie: 'לוסי', elodie: 'אלודי', 'élodie': 'אלודי',
    },
    es: {
      juan: 'חואן', jose: 'חוסה', 'josé': 'חוסה', antonio: 'אנטוניו',
      francisco: 'פרנסיסקו', manuel: 'מנואל', pedro: 'פדרו',
      miguel: 'מיגל', carlos: 'קרלוס', luis: 'לואיס',
      javier: 'חבייר', jorge: 'חורחה', alberto: 'אלברטו',
      ramon: 'רמון', 'ramón': 'רמון', sergio: 'סרחיו',
      alejandro: 'אלחנדרו', diego: 'דיאגו', pablo: 'פבלו',
      fernando: 'פרננדו', jesus: 'חסוס', 'jesús': 'חסוס',
      angel: 'אנחל', 'ángel': 'אנחל', enrique: 'אנריקה',
      ricardo: 'ריקרדו', roberto: 'רוברטו', eduardo: 'אדוארדו',
      raul: 'ראול', 'raúl': 'ראול', andres: 'אנדרס',
      'andrés': 'אנדרס', santiago: 'סנטיאגו', mario: 'מריו',
      oscar: 'אוסקר', 'óscar': 'אוסקר', victor: 'ויקטור',
      hugo: 'אוגו', adrian: 'אדריאן', 'adrián': 'אדריאן',
      maria: 'מריה', 'maría': 'מריה', carmen: 'כרמן',
      isabel: 'איזבל', ana: 'אנה', dolores: 'דולורס',
      pilar: 'פילאר', teresa: 'תרזה', rosa: 'רוזה',
      cristina: 'כריסטינה', laura: 'לאורה', marta: 'מרתה',
      lucia: 'לוסיה', 'lucía': 'לוסיה', elena: 'אלנה',
      paula: 'פאולה', raquel: 'רקל', carla: 'קרלה',
      sofia: 'סופיה', 'sofía': 'סופיה', valentina: 'ולנטינה',
      camila: 'קמילה', gabriela: 'גבריאלה', daniela: 'דניאלה',
      natalia: 'נטליה', alejandra: 'אלחנדרה', patricia: 'פטרישיה',
      veronica: 'ורוניקה', 'verónica': 'ורוניקה',
      claudia: 'קלאודיה', monica: 'מוניקה', 'mónica': 'מוניקה',
    },
    it: {
      giuseppe: 'ג׳וזפה', giovanni: 'ג׳ובאני',
      antonio: 'אנטוניו', mario: 'מריו', luigi: 'לואיג׳י',
      francesco: 'פרנצ׳סקו', angelo: 'אנג׳לו',
      vincenzo: 'וינצ׳נצו', pietro: 'פייטרו',
      salvatore: 'סלבטורה', carlo: 'קרלו', franco: 'פרנקו',
      domenico: 'דומניקו', bruno: 'ברונו', paolo: 'פאולו',
      michele: 'מיקלה', giorgio: 'ג׳ורג׳ו', aldo: 'אלדו',
      sergio: 'סרג׳ו', marco: 'מרקו', stefano: 'סטפנו',
      alessandro: 'אלסנדרו', roberto: 'רוברטו', massimo: 'מסימו',
      luca: 'לוקה', matteo: 'מתאו', lorenzo: 'לורנצו',
      davide: 'דויד', simone: 'סימונה', federico: 'פדריקו',
      riccardo: 'ריקרדו', gabriele: 'גבריאלה', tommaso: 'תומאזו',
      alberto: 'אלברטו', filippo: 'פיליפו', leonardo: 'לאונרדו',
      nicola: 'ניקולה', emanuele: 'אמנואלה', enrico: 'אנריקו',
      claudio: 'קלאודיו',
      maria: 'מריה', anna: 'אנה', giuseppina: 'ג׳וזפינה',
      rosa: 'רוזה', angela: 'אנג׳לה', giovanna: 'ג׳ובאנה',
      teresa: 'תרזה', lucia: 'לוסיה', carmela: 'כרמלה',
      caterina: 'קטרינה', francesca: 'פרנצ׳סקה',
      laura: 'לאורה', elena: 'אלנה', chiara: 'קיארה',
      sofia: 'סופיה', giulia: 'ג׳וליה', martina: 'מרטינה',
      valentina: 'ולנטינה', alessia: 'אלסיה', federica: 'פדריקה',
      silvia: 'סילביה', paola: 'פאולה', monica: 'מוניקה',
      simona: 'סימונה', cristina: 'כריסטינה', valeria: 'ולריה',
      alice: 'אליצ׳ה', isabella: 'איזבלה',
    },
  };

  // Sucht eine eingebuergerte Schreibweise. Die Sprache gewinnt vor der
  // allgemeinen Liste, denn Michael heisst auf Englisch Maikel.
  function suche(wort, sprache) {
    const k = String(wort || '').trim().toLowerCase();
    if (!k) return '';
    const je = JE_SPRACHE[sprache];
    if (je && je[k]) return je[k];
    if (UEBERALL[k]) return UEBERALL[k];
    return '';
  }

  function anzahl() {
    let n = Object.keys(UEBERALL).length;
    for (const s in JE_SPRACHE) n += Object.keys(JE_SPRACHE[s]).length;
    return n;
  }

  return { suche, anzahl, UEBERALL, JE_SPRACHE };
});
