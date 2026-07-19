// =============================================
// SCHALOM ISRAEL - Hebraeisches Glossar
//
// Nachschlagewerk fuer Begriffe, die in Artikeln und Wochenlesungen immer
// wieder auftauchen. Rein statisch, kein KI-Aufruf, kostet kein Kontingent.
//
// Aufbau je Eintrag:
//   b  Begriff in deutscher Umschrift (so wie er in den Artikeln steht)
//   h  hebraeische Schreibweise
//   k  kurze Bedeutung, ein Halbsatz
//   t  ausfuehrlicher Text, zwei bis vier Saetze
//   s  Stelle im Tanach zum Nachschlagen (optional)
//   g  Gruppe fuer die Filterung
//
// UMD, damit ohne Browser testbar.
// =============================================
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GlossarDaten = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  const GRUPPEN = [
    { id: 'grund', name: 'Grundbegriffe' },
    { id: 'tora', name: 'Tora und Lernen' },
    { id: 'zeit', name: 'Zeit und Feste' },
    { id: 'gebet', name: 'Gebet und Dienst' },
    { id: 'mensch', name: 'Mensch und Seele' },
    { id: 'volk', name: 'Volk und Land' },
  ];

  const EINTRAEGE = [
    // ---------- Grundbegriffe ----------
    {
      b: 'Schalom', h: 'שלום', g: 'grund',
      k: 'nicht nur Frieden, sondern Ganzheit',
      t: 'Die Wurzel Schin-Lamed-Mem trägt die Bedeutung „ganz sein, unversehrt sein". Schalom meint deshalb weniger die Abwesenheit von Krieg als einen Zustand, in dem nichts fehlt und nichts an der falschen Stelle liegt. Wer Schalom wünscht, wünscht Vollständigkeit.',
      s: 'Bamidbar (4. Mose) 6,26',
    },
    {
      b: 'Chesed', h: 'חסד', g: 'grund',
      k: 'treue Zuwendung über das Geschuldete hinaus',
      t: 'Chesed wird oft mit „Gnade" oder „Barmherzigkeit" übersetzt, beides trifft nur einen Teil. Gemeint ist Treue innerhalb einer Beziehung: Man schuldet sie nicht, man hält sie trotzdem. Das Buch Rut ist über weite Strecken eine einzige Erzählung darüber, wie Chesed aussieht, wenn niemand sie einfordern kann.',
      s: 'Rut 3,10',
    },
    {
      b: 'Emet', h: 'אמת', g: 'grund',
      k: 'Wahrheit im Sinn von Verlässlichkeit',
      t: 'Emet kommt von derselben Wurzel wie Emuna, Treue. Es geht weniger um die Übereinstimmung eines Satzes mit den Tatsachen als darum, dass etwas trägt. Wahr ist, worauf man sich stellen kann. Das Wort besteht aus dem ersten, mittleren und letzten Buchstaben des Alefbet, was Ausleger gern als Bild für Vollständigkeit lesen.',
    },
    {
      b: 'Emuna', h: 'אמונה', g: 'grund',
      k: 'Treue, Verlässlichkeit, nicht Fürwahrhalten',
      t: 'Emuna wird im Deutschen zu „Glaube", und dabei geht etwas verloren. Im Hebräischen beschreibt das Wort keine Meinung über Tatsachen, sondern ein Verhalten: standhalten, dranbleiben, verlässlich sein. Von derselben Wurzel kommt Amen.',
      s: 'Chawakuk (Habakuk) 2,4',
    },
    {
      b: 'Kadosch', h: 'קדוש', g: 'grund',
      k: 'abgesondert, für etwas bestimmt',
      t: 'Die Grundbedeutung ist nicht „moralisch rein", sondern „herausgenommen". Kadosch ist, was aus dem Alltäglichen ausgesondert und einem Zweck zugeordnet wird. Deshalb kann ein Tag heilig sein, ein Ort, ein Gefäß.',
      s: 'Wajikra (3. Mose) 19,2',
    },
    {
      b: 'Teschuwa', h: 'תשובה', g: 'grund',
      k: 'Umkehr, wörtlich Rückkehr',
      t: 'Von der Wurzel schuw, zurückkehren. Anders als „Buße" enthält das Wort keine Strafe und keine Zerknirschung, sondern eine Richtungsänderung: zurück dorthin, wo man hingehört. Teschuwa ist deshalb kein Gefühl, sondern eine Bewegung.',
      s: 'Devarim (5. Mose) 30,2',
    },
    {
      b: 'Zedaka', h: 'צדקה', g: 'grund',
      k: 'Wohltun als Pflicht, nicht als Großzügigkeit',
      t: 'Das Wort kommt von zedek, Gerechtigkeit. Wer gibt, ist damit nicht großzügig, sondern tut, was recht ist. Diese Verschiebung erklärt, warum das Geben in der jüdischen Tradition weniger mit Mitleid und mehr mit Ordnung zu tun hat.',
    },
    {
      b: 'Brit', h: 'ברית', g: 'grund',
      k: 'Bund, feste Bindung zwischen zwei Seiten',
      t: 'Ein Brit ist kein Vertrag unter Gleichen und keine bloße Zusage. Es ist eine Bindung, die beide Seiten verändert und die man nicht einseitig auflösen kann. Die Wendung „einen Bund schneiden" erinnert an den Ritus, mit dem er geschlossen wurde.',
      s: 'Bereschit (1. Mose) 15,18',
    },
    {
      b: 'Mizwa', h: 'מצוה', g: 'grund',
      k: 'Gebot, nicht gute Tat',
      t: 'Im Alltagsdeutsch ist eine Mizwa oft eine nette Geste geworden. Ursprünglich heißt das Wort schlicht Gebot, von zawa, befehlen. Die Verschiebung ist verständlich, verwischt aber, dass es um eine Anweisung geht und nicht um Freiwilligkeit.',
    },

    // ---------- Tora und Lernen ----------
    {
      b: 'Tora', h: 'תורה', g: 'tora',
      k: 'Weisung, nicht Gesetz',
      t: 'Die Wurzel jarah bedeutet zielen oder schießen. Tora ist damit eine Richtungsangabe, kein Paragrafenwerk. Die Übersetzung „Gesetz" kam über das griechische nomos herein und hat die Wahrnehmung des Wortes über Jahrhunderte geprägt.',
    },
    {
      b: 'Tanach', h: 'תנך', g: 'tora',
      k: 'Kurzwort für die ganze hebräische Bibel',
      t: 'Ein Kunstwort aus den Anfangsbuchstaben der drei Teile: Tora (Weisung), Newiim (Propheten), Ketuwim (Schriften). Die Reihenfolge der Bücher unterscheidet sich von der christlichen Bibel, der Bestand ist derselbe.',
    },
    {
      b: 'Parascha', h: 'פרשה', g: 'tora',
      k: 'Wochenabschnitt der Tora',
      t: 'Die Tora ist in vierundfünfzig Abschnitte geteilt, die im Lauf eines Jahres gelesen werden. Jede Parascha trägt den Namen eines ihrer ersten Wörter. Weil ein Jahr manchmal weniger Schabbate hat, werden einzelne Abschnitte zusammengelegt.',
    },
    {
      b: 'Aliyah', h: 'עליה', g: 'tora',
      k: 'Aufruf zur Tora, wörtlich Aufstieg',
      t: 'Die Wochenlesung wird am Schabbat in sieben Abschnitte geteilt, zu denen jeweils jemand aufgerufen wird. Dasselbe Wort bezeichnet auch die Einwanderung nach Israel, ebenfalls als Aufstieg verstanden.',
    },
    {
      b: 'Newiim', h: 'נביאים', g: 'tora',
      k: 'die Propheten, zweiter Teil des Tanach',
      t: 'Umfasst die erzählenden Bücher von Jehoschua bis Melachim und die eigentlichen Prophetenbücher. Ein Nawi ist kein Wahrsager, sondern ein Beauftragter: einer, der etwas auszurichten hat.',
    },
    {
      b: 'Ketuwim', h: 'כתובים', g: 'tora',
      k: 'die Schriften, dritter Teil des Tanach',
      t: 'Dazu gehören unter anderem Tehillim (Psalmen), Mischlei (Sprüche), Ijow (Hiob), die fünf Festrollen und Divrei HaJamim (Chronik).',
    },
    {
      b: 'Midrasch', h: 'מדרש', g: 'tora',
      k: 'auslegende Erzählung zum Text',
      t: 'Von darasch, suchen oder erforschen. Ein Midrasch füllt Lücken des Textes, erklärt Widersprüche oder erzählt weiter, wo der Text schweigt. Er beansprucht nicht, den Wortsinn zu ersetzen.',
    },
    {
      b: 'Pschat', h: 'פשט', g: 'tora',
      k: 'der einfache Wortsinn',
      t: 'Die erste und grundlegende Ebene der Auslegung: was da steht, im Zusammenhang gelesen. Andere Ebenen dürfen den Pschat vertiefen, aber nicht verdrängen.',
    },
    {
      b: 'Mussar', h: 'מוסר', g: 'tora',
      k: 'Charakterarbeit, Zucht im alten Wortsinn',
      t: 'Mussar bezeichnet sowohl die Ermahnung als auch die daraus gewachsene Literatur zur Arbeit am eigenen Charakter. Es geht nicht um Wissen, sondern um Veränderung von Gewohnheiten.',
      s: 'Mischlei (Sprüche) 1,8',
    },

    // ---------- Zeit und Feste ----------
    {
      b: 'Schabbat', h: 'שבת', g: 'zeit',
      k: 'der siebte Tag, Aufhören statt Erholung',
      t: 'Die Wurzel bedeutet aufhören, innehalten. Schabbat ist nicht in erster Linie Erholung für die Arbeit der kommenden Woche, sondern ein Aufhören um seiner selbst willen. Er beginnt am Freitagabend, weil der Tag im hebräischen Kalender abends anfängt.',
      s: 'Schemot (2. Mose) 20,8',
    },
    {
      b: 'Pessach', h: 'פסח', g: 'zeit',
      k: 'Fest des Auszugs aus Mizrajim',
      t: 'Benannt nach dem Vorübergehen in der Nacht des Auszugs. Sieben Tage lang wird nichts Gesäuertes gegessen. Der Seder-Abend ist als Erzählung gestaltet: nicht als Erinnerung an etwas Vergangenes, sondern als eigene Beteiligung.',
      s: 'Schemot (2. Mose) 12',
    },
    {
      b: 'Schawuot', h: 'שבועות', g: 'zeit',
      k: 'Wochenfest, sieben Wochen nach Pessach',
      t: 'Ursprünglich ein Erntefest, in der Tradition verbunden mit der Gabe der Tora am Sinai. Der Name kommt von den sieben gezählten Wochen des Omer.',
    },
    {
      b: 'Rosch HaSchana', h: 'ראש השנה', g: 'zeit',
      k: 'Jahresanfang, wörtlich Kopf des Jahres',
      t: 'Zugleich Tag des Gerichts und Tag des Königtums. Das Schofar wird geblasen. Der Tag eröffnet die zehn Tage, die auf Jom Kippur zulaufen.',
    },
    {
      b: 'Jom Kippur', h: 'יום כפור', g: 'zeit',
      k: 'Tag der Sühne',
      t: 'Ein Tag des Fastens und der Umkehr. Von kapar, bedecken oder sühnen. Nach der Tradition wirkt der Tag für Verfehlungen gegenüber HaSchem, während Verfehlungen gegenüber Menschen zuerst mit diesen zu klären sind.',
      s: 'Wajikra (3. Mose) 16',
    },
    {
      b: 'Sukkot', h: 'סוכות', g: 'zeit',
      k: 'Laubhüttenfest',
      t: 'Sieben Tage in einer provisorischen Hütte, zur Erinnerung an die Wüstenzeit. Das Fest fällt in die Erntezeit und verbindet Fülle mit Vorläufigkeit: Wer erntet, wohnt trotzdem im Zelt.',
    },
    {
      b: 'Omer', h: 'עומר', g: 'zeit',
      k: 'die gezählten Tage zwischen Pessach und Schawuot',
      t: 'Ein Omer war ein Getreidemaß. Vom zweiten Pessachtag an werden neunundvierzig Tage gezählt. Die Zählung verbindet Auszug und Tora-Gabe zu einem einzigen Weg.',
      s: 'Wajikra (3. Mose) 23,15',
    },
    {
      b: 'Rosch Chodesch', h: 'ראש חודש', g: 'zeit',
      k: 'Neumondtag, Monatsanfang',
      t: 'Der hebräische Kalender richtet sich nach dem Mond, das Jahr aber nach der Sonne. Deshalb wird in Schaltjahren ein ganzer Monat eingefügt, damit Pessach im Frühjahr bleibt.',
    },
    {
      b: 'Schmita', h: 'שמיטה', g: 'zeit',
      k: 'das siebte Jahr, in dem das Land ruht',
      t: 'Alle sieben Jahre bleibt das Feld unbestellt, Schulden werden erlassen. Der Gedanke: Wer das Land für sein Eigentum hält, wird alle sieben Jahre daran erinnert, dass es das nicht ist.',
      s: 'Wajikra (3. Mose) 25,1',
    },

    // ---------- Gebet und Dienst ----------
    {
      b: 'Schema', h: 'שמע', g: 'gebet',
      k: 'das zentrale Bekenntnis, wörtlich „höre"',
      t: 'Benannt nach seinem ersten Wort. Es wird morgens und abends gesprochen und fasst zusammen, worum es geht: Einheit und die Verpflichtung, die daraus folgt.',
      s: 'Devarim (5. Mose) 6,4',
    },
    {
      b: 'Tefila', h: 'תפילה', g: 'gebet',
      k: 'Gebet, in der Grundform ein Selbst-Urteilen',
      t: 'Die Wurzel palal hat mit richten und beurteilen zu tun, und die Form des Wortes ist rückbezüglich. Beten heißt danach zuerst, sich selbst zu prüfen, und erst dann, etwas zu erbitten.',
    },
    {
      b: 'Beracha', h: 'ברכה', g: 'gebet',
      k: 'Segensspruch',
      t: 'Kein Wunsch, sondern eine Anerkennung. Wer eine Beracha spricht, stellt fest, woher etwas kommt. Deshalb steht sie vor dem Essen und nicht danach.',
    },
    {
      b: 'Kaddisch', h: 'קדיש', g: 'gebet',
      k: 'Lobpreis, oft im Gedenken gesprochen',
      t: 'Der Text spricht nicht vom Tod, sondern preist. Dass er im Gedenken an Verstorbene gesprochen wird, ist eine spätere Zuordnung, kein Inhalt des Gebets.',
    },
    {
      b: 'Mischkan', h: 'משכן', g: 'gebet',
      k: 'die Wohnung, das transportable Heiligtum',
      t: 'Von schachan, wohnen. Kein Tempel für Zeremonien, sondern ein Ort zum Wohnen, der mitzieht. Die Tora widmet dem Bau ungewöhnlich viel Raum, was Ausleger seit jeher beschäftigt.',
      s: 'Schemot (2. Mose) 25,8',
    },
    {
      b: 'Korban', h: 'קרבן', g: 'gebet',
      k: 'Opfergabe, von der Wurzel „nahe kommen"',
      t: 'Das deutsche Wort „Opfer" betont den Verlust. Das hebräische betont die Annäherung: karow heißt nah. Ein Korban ist etwas, das Nähe herstellt, nicht etwas, das abgegeben wird.',
    },
    {
      b: 'Kohen', h: 'כהן', g: 'gebet',
      k: 'Priester, Nachkomme Aharons',
      t: 'Der Dienst am Heiligtum war an Abstammung gebunden, nicht an Eignung. Auch nach dem Ende des Tempeldienstes hat der Kohen bestimmte Aufgaben, etwa den Segen.',
    },
    {
      b: 'Schofar', h: 'שופר', g: 'gebet',
      k: 'Widderhorn',
      t: 'Kein Musikinstrument im üblichen Sinn, sondern ein Signal. Es wird an Rosch HaSchana geblasen und markierte im Altertum auch das Jubeljahr.',
    },
    {
      b: 'Mesusa', h: 'מזוזה', g: 'gebet',
      k: 'Türpfosten, dann die Kapsel daran',
      t: 'Das Wort bezeichnet eigentlich den Pfosten. Umgangssprachlich meint es die kleine Rolle mit dem Schema, die daran befestigt wird.',
      s: 'Devarim (5. Mose) 6,9',
    },

    // ---------- Mensch und Seele ----------
    {
      b: 'Nefesch', h: 'נפש', g: 'mensch',
      k: 'Kehle, Lebendigkeit, nicht körperlose Seele',
      t: 'Nefesch ist zuerst die Kehle, das Atmende. Es bezeichnet den Menschen als Lebewesen, nicht einen unsterblichen Teil in ihm. Auch Tiere haben eine Nefesch.',
      s: 'Bereschit (1. Mose) 2,7',
    },
    {
      b: 'Ruach', h: 'רוח', g: 'mensch',
      k: 'Wind, Atem und Geist in einem Wort',
      t: 'Das Hebräische unterscheidet nicht zwischen dem Wind draußen und dem Atem im Menschen. Wo eine Übersetzung sich für eines entscheiden muss, geht die Doppeldeutigkeit verloren.',
      s: 'Bereschit (1. Mose) 1,2',
    },
    {
      b: 'Neschama', h: 'נשמה', g: 'mensch',
      k: 'Atem, oft als höchste Seelenebene verstanden',
      t: 'Von derselben Wurzel wie das Wort für atmen. In der Auslegungstradition wird zwischen mehreren Ebenen unterschieden, wobei Neschama die dem Menschen eigene bezeichnet.',
    },
    {
      b: 'Lew', h: 'לב', g: 'mensch',
      k: 'Herz, Sitz des Denkens und Entscheidens',
      t: 'Im Hebräischen denkt man mit dem Herzen, nicht mit dem Kopf. Wo eine deutsche Bibel „Herz" schreibt, geht es deshalb oft weniger um Gefühl als um Absicht und Urteil.',
    },
    {
      b: 'Jezer', h: 'יצר', g: 'mensch',
      k: 'Trieb, Neigung, Gebilde',
      t: 'Von jazar, formen. Die Tradition unterscheidet Jezer HaTow und Jezer HaRa, die gute und die verkehrte Neigung. Die zweite gilt nicht als Fremdkörper, sondern als Antrieb, der Richtung braucht.',
      s: 'Bereschit (1. Mose) 6,5',
    },
    {
      b: 'Kawana', h: 'כוונה', g: 'mensch',
      k: 'Ausrichtung, innere Absicht bei einer Handlung',
      t: 'Von kiwen, richten. Dieselbe Handlung kann mit oder ohne Kawana geschehen. Die Frage, wie viel davon nötig ist, damit etwas zählt, wird seit langem diskutiert.',
    },
    {
      b: 'Middot', h: 'מידות', g: 'mensch',
      k: 'Charaktereigenschaften, wörtlich Maße',
      t: 'Eine Mida ist ein Maß. Auf den Charakter übertragen heißt das: Es geht selten darum, eine Eigenschaft zu haben oder nicht zu haben, sondern um das rechte Maß.',
    },
    {
      b: 'Jirat Schamajim', h: 'יראת שמים', g: 'mensch',
      k: 'Ehrfurcht, wörtlich Furcht des Himmels',
      t: 'Jira umfasst Furcht und Ehrfurcht zugleich. Gemeint ist weniger Angst vor Strafe als das Bewusstsein, dass man gesehen wird und dass das Folgen für das eigene Handeln hat.',
    },

    // ---------- Volk und Land ----------
    {
      b: 'Jisrael', h: 'ישראל', g: 'volk',
      k: 'der Name Jaakows, dann des Volkes',
      t: 'Jaakow erhält den Namen nach dem Ringen am Jabbok. Die Deutung im Text selbst verbindet ihn mit dem Ringen. Aus dem Personennamen wird der Name des Volkes und später des Landes.',
      s: 'Bereschit (1. Mose) 32,29',
    },
    {
      b: 'Ivri', h: 'עברי', g: 'volk',
      k: 'Hebräer, wörtlich der von drüben',
      t: 'Von ewer, jenseitige Seite. Awraham heißt so, weil er von jenseits des Stroms kam. Der Name beschreibt eine Herkunft und zugleich eine Stellung: einer, der nicht von hier ist.',
      s: 'Bereschit (1. Mose) 14,13',
    },
    {
      b: 'Erez Jisrael', h: 'ארץ ישראל', g: 'volk',
      k: 'das Land Israel',
      t: 'In der Tora ist das Land nicht Zubehör, sondern Teil der Zusage. Viele Gebote lassen sich nur dort erfüllen, was in der Zeit der Zerstreuung zu weitreichenden Fragen führte.',
    },
    {
      b: 'Galut', h: 'גלות', g: 'volk',
      k: 'Verbannung, Zerstreuung',
      t: 'Mehr als geografische Entfernung. Galut bezeichnet einen Zustand der Unvollständigkeit, in dem etwas nicht an seinem Ort ist. Das Gegenwort ist Geula, Erlösung.',
    },
    {
      b: 'Geula', h: 'גאולה', g: 'volk',
      k: 'Erlösung, Auslösung eines Besitzes',
      t: 'Der Begriff stammt aus dem Recht: Ein Goel löst verlorenes Eigentum oder einen verarmten Verwandten aus. Erlösung ist damit zuerst ein rechtlicher Vorgang, kein Gefühl.',
      s: 'Wajikra (3. Mose) 25,25',
    },
    {
      b: 'Ger', h: 'גר', g: 'volk',
      k: 'Fremder, der mitwohnt',
      t: 'Kein Durchreisender, sondern jemand, der dauerhaft im Land lebt, ohne dazuzugehören. Die Tora kommt auf den Umgang mit dem Ger auffällig oft zurück, meist mit der Begründung, das Volk sei selbst Ger in Mizrajim gewesen.',
      s: 'Schemot (2. Mose) 22,20',
    },
    {
      b: 'Mizrajim', h: 'מצרים', g: 'volk',
      k: 'Ägypten, wörtlich die Engen',
      t: 'Der Name enthält die Wurzel zar, eng. Ausleger lesen darin nicht nur ein Land, sondern einen Zustand: Enge, aus der man herausgeführt wird.',
    },
    {
      b: 'Kehilla', h: 'קהילה', g: 'volk',
      k: 'Gemeinde, Versammlung',
      t: 'Von kahal, versammeln. Bezeichnet die örtliche Gemeinschaft mit ihren Einrichtungen, nicht nur die Menge der Anwesenden.',
    },
    {
      b: 'HaSchem', h: 'השם', g: 'grund',
      k: 'wörtlich „der Name", Ersatz für den Gottesnamen',
      t: 'Der Gottesname wird nicht ausgesprochen und außerhalb heiliger Schriften auch nicht geschrieben. Im Gespräch und in Texten wie diesen steht deshalb HaSchem. Dieselbe Zurückhaltung führt zu Schreibweisen wie Elokim statt der vollen Form.',
    },
  ];

  return { GRUPPEN, EINTRAEGE };
});
