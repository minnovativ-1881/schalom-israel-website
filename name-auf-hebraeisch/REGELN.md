# Namens-Umschrift ins Hebräische: das verbindliche Regelwerk

Stand 24.11.2026. Gilt für `/name-auf-hebraeisch/` auf schalomisrael.de und für alles, was später darauf aufbaut, insbesondere gedruckte Produkte.

Wer eine Regel ändert, ändert sie hier mit und lässt `node --test test/*.test.js` laufen. Die Prüfliste in `test/umschrift.test.js` prüft jede einzelne dieser Regeln an echten Namen.

## Der Aufbau in zwei Schritten

Eine direkte Ersetzung von Buchstaben durch Buchstaben liefert zuverlässig Unsinn, weil derselbe Buchstabe in jeder Sprache anders klingt. Deshalb zwei getrennte Schritte:

**Schritt eins, sprachabhängig** (`sprachen.js`): Der Name wird in eine Lautkette zerlegt. Nur hier wirkt die angeklickte Sprache. Jede Sprache hat ihre eigene Regeltabelle.

**Schritt zwei, für alle Sprachen gleich** (`laute.js`): Die Lautkette wird in hebräische Buchstaben gesetzt. Diese Regeln stehen genau einmal im Code, weil sie nicht die Sprache beschreiben, sondern die hebräische Schrift.

Darüber liegt `umschrift.js` mit den Regeln, die in keinen der beiden Schritte gehören: die Liste eingebürgerter Schreibweisen und die beiden Sicherheitsregeln.

Eine neue Sprache hinzuzufügen heißt, einen Eintrag in `SPRACHEN` zu ergänzen. Sonst wird nichts angefasst.

## Die Grundentscheidung

**Geschrieben wird, wie der Name klingt, nicht was er bedeutet.**

Hans wird הנס und nicht יוחנן. Anna wird אנה und nicht חנה. Matthias wird מתיאס und nicht מתתיהו. Dass Hans über Johannes auf Jochanan zurückgeht, ist wahr und für Schalom Israel interessant, aber es ist nicht derselbe Name. Diese Unterscheidung ist der Grund, warum es diese Seite neben `/entdecken/mein-name-hebraeisch/` gibt: Das dortige Tool beantwortet die Frage nach der Bedeutung, dieses die nach der Schreibweise.

Für gedruckte Produkte ist das keine Geschmacksfrage. Wer eine Tasse mit seinem Namen kauft und einen anderen Namen geliefert bekommt, hat zu Recht ein Problem.

## Die Schreibregeln

### R1. Kurze Vokale werden nicht geschrieben

Peter ist פטר, nicht פאטאר. Geschrieben werden nur langes o und u mit Waw sowie i und die Doppellaute mit Jud.

### R1b. Ein a in der letzten Silbe vor einem Zischlaut bleibt sichtbar

Thomas ist תומאס, denn תומס läse man als Toms. Ebenso Jonas, Lukas, Klaus, Andreas, Tobias, Niklas.

Nur in der letzten Silbe: Ignacio ist איגנסיו, nicht איגנאסיו. Und nicht bei der Endung auf -an, die sich selbst trägt: Roman ist רומן, Johann ist יוהן, Stefan ist שטפן.

### R2. Ein Vokal am Wortanfang bekommt einen Träger

Vor dem ersten Laut steht kein Konsonant, an dem ein Vokal hängen könnte. Also ein Alef: Ursula wird אורסולה, Anton wird אנטון, Ida wird אידה.

### R3. Langes o und u werden Waw, i und die Doppellaute werden Jud

Timon wird טימון, Bruno wird ברונו, Lina wird לינה. Die Doppellaute: ei und ai werden יי, au wird או, eu wird וי.

### R4. A und E am Wortende werden mit He geschrieben

Sabine wird סבינה, Anna wird אנה, Greta wird גרטה.

### R5. Zwei Vokale werden durch ein Alef getrennt

Ohne diese Regel verschmelzen sie, und aus Christian wird Kristin, aus Michael wird Michal. Richtig ist כריסטיאן und מיכאל. Ebenso Maximilian, Florian, Sebastian.

**Das ist die Regel, die dem älteren Tool fehlt.** Dort gibt es כריסטין aus, also Kristin.

### R5b. Kein Alef, wenn die Vokalfolge schon eindeutig ist

Zwei Fälle. Erstens am Wortende, wo Jud und He sich gegenseitig genügen: Mia ist מיה, nicht מיאה, Julia ist יוליה. Zweitens, wenn beide Vokale ein eigenes Zeichen schreiben: Dario ist דריו, Sergio ist סרג׳ו, Fabio ist פביו.

### R6. Waw und Jud werden in der Wortmitte verdoppelt

Beide sind zugleich Konsonant und Vokalzeichen. Einfach geschrieben liest man sie als Vokal. Kevin wird קווין, nicht קוין. Sven wird סוון.

Drei Waw stehen nie hintereinander: Uwe wird אווה, Wolfram wird וולפרם. Am Wortanfang wird verdoppelt, wenn der folgende Vokal selbst ein Waw schreibt, also Wolfgang zu וולפגנג, Vera dagegen zu ורה.

### R7. Fünf Buchstaben haben am Wortende eine eigene Form

Kaf, Mem, Nun, Pe und Zade. Timon endet auf Nun sofit, Erich wird אריך, Rolf endet auf Pe sofit, Moritz wird מוריץ. Ein Geresch gehört zum Buchstaben davor, die Endform greift darunter: Paige wird פייג׳.

### R8. Doppelte Konsonanten werden einfach geschrieben

Anna wird אנה, Emma wird אמה, Finn wird פין.

### R8b. Nach einem Geresch-Buchstaben wird das a sichtbar

Sonst klebt es am nächsten Konsonanten fest. Die Praxis schreibt es auch so: ז׳אן, צ׳ארלס, ג׳אקומו, ג׳אני.

### R8c. Zweibuchstabige Wörter mit Waw oder Jud am Anfang bekommen ein Alef

Jan wäre sonst ין und damit als "in" zu lesen. Richtig ist יאן.

### R9. Eingebürgerte Schreibweisen gehen vor

Über dreihundert Namen haben im Hebräischen eine feste Schreibweise, die ein Israeli erwartet. Die schlägt die Rechenregel: David bleibt דוד und wird nicht דויד.

Aufgenommen wird nur, was die Regel nicht von selbst richtig trifft. Jeder Eintrag ist eine Ausnahme und wird geprüft. Die Liste darf nach R0 niemals den Namen austauschen, nur die Schreibweise.

Bei Englisch trägt diese Liste die Hauptlast, weil englische Schreibung und Aussprache nicht regelhaft zusammenhängen. Bei Spanisch, Italienisch und Französisch greifen überwiegend die Regeln.

## Die Sicherheitsregeln

### R10. Der Gottesname wird nie geschrieben

Zwei Sperren, weil eine nicht genügt.

**Auf der Ausgabeseite:** Jedes Ergebnis wird auf die Buchstabenfolge geprüft, bevor es erscheint, mit und ohne Vokalzeichen, und auch mit doppeltem Waw. Letzteres, weil R6 aus "Jehowa" יהווה macht: nicht buchstabengleich, aber als der Name zu lesen. Wird die Folge gefunden, gibt es keine Ausgabe.

**Auf der Eingabeseite:** Wer Jahwe, Jehova, Yahweh, JHWH, Adonai, HaSchem oder Elohim eintippt, will den Gottesnamen in hebräischer Schrift sehen, und genau das liefert das Tool nicht. Diese Eingaben werden abgewiesen. Auf die Ausgabeprüfung allein zu bauen genügt hier nicht, weil die Lautregeln daneben liegen können.

Ein Vorname, der nur ähnlich klingt, bleibt erlaubt: Jehuda wird יהודה. Dort unterbricht das Dalet, und es ist nach überlieferter Auffassung kein Gottesname.

### R11. Sperrliste für Ergebnisse mit anderer Bedeutung

Manche Lautfolge ergibt im Hebräischen ein Wort, das niemand als Namen auf einem Blatt oder einem Produkt haben will. Geprüft wird auf das ganze Wort, nicht auf Teile, denn סוניה für Sonja ist unverfänglich und nur das nackte זונה ist das Problem. Ein Treffer wird entschärft, indem ein Alef eingefügt wird, und der Nutzer bekommt einen Hinweis.

### R12. Keine künstliche Intelligenz im Umschriftweg

Alles rechnet regelbasiert im Browser. Gleiche Eingabe heißt immer gleiche Ausgabe, kein Serveraufruf, keine Kosten, kein Ausfall. Ein Sprachmodell würde hebräische Schreibweisen erfinden, und das würde hier niemand merken. Dieselbe Regel gilt im Haus schon für die Kalenderdaten der Entdecken-Seiten.

### R13. Jede Regel hat eine Prüfliste

`test/umschrift.test.js` prüft jede Regel an echten Namen und zusätzlich jeden Eintrag der Liste. Das ist bei einer Regelmaschine der entscheidende Punkt: Eine Verbesserung an einer Stelle verschlechtert leicht zwanzig andere Namen, und ohne Prüfliste merkt man es nicht.

Auch die Beispiele, die im Text der Seite stehen, sind dort hinterlegt. Wer eine Regel ändert und dabei ein Beispiel verschiebt, muss den Seitentext mitpflegen.

## Kein Nikud

Vokalzeichen werden nicht gesetzt. In Israel schreibt niemand Namen mit Punkten. Die Lesbarkeit löst stattdessen die Lesehilfe unter dem Namen, also "sabine" oder "kanten".

Die Lesehilfe erscheint nur, wo wirklich gerechnet wurde. Bei einer eingebürgerten Schreibweise gibt es nichts zu erklären, und der Regelweg würde dort gelegentlich etwas anderes lesen als in der Liste steht.

## Die Sprachen

Fünf in der ersten Fassung: Deutsch, Englisch, Französisch, Spanisch, Italienisch. Was die Sprachwahl bringt, zeigt ein Buchstabe. Das J wird im Hebräischen zu drei verschiedenen Zeichen:

| Sprache | Beispiel | Hebräisch | Buchstabe |
|---|---|---|---|
| Englisch | Jordan | ג׳ורדן | Gimel mit Geresch |
| Französisch | Jérôme | ז׳רום | Sajin mit Geresch |
| Spanisch | Joaquín | חואקין | Chet |
| Deutsch | Jonas | יונאס | Jud |

Nachrüstbar sind Niederländisch, Russisch, Polnisch und Portugiesisch. Jede davon ist eine Datei, kein Umbau.

## Was später auf dem Produkt steht

Diese Regeln sind so angelegt, dass sie für gedruckte Produkte tragen. Festgehalten sind dafür bereits:

- Gedruckt wird die Klangschrift, nicht die Bedeutung (R0).
- Vor dem Druck gibt Timon jede Umschrift frei. Der Generator macht die volle Arbeit, der letzte Blick bleibt beim Menschen.
- Namen mit einem Gottes-Element wie Michael, Daniel, Gabriel oder Elias werden normal gesetzt, denn es sind Personennamen und keine Gottesbezeichnungen. Dem Produkt wird ein kurzer Hinweis beigelegt, was in dem Namen steckt und wie man respektvoll damit umgeht.
- Das Tetragrammaton bleibt ausgeschlossen (R10), ohne Ausnahme.
