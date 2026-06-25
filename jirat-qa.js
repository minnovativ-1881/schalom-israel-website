/*
  Jirat Schamajim – "Gefragt und geantwortet"
  --------------------------------------------
  Wird auf allen Kursteil-Seiten direkt ueber dem Kommentarfeld eingefuegt.
  Pflege an GENAU EINER Stelle: dieser Datei. Jede Seite, die /jirat-qa.js laedt,
  zeigt den Block automatisch. Neue Fragen/Antworten einfach in QA.items ergaenzen.

  Hinweis: Reihen-uebergreifende Fragen (z.B. "warum das Alphabet?") passen auf
  alle Teile. Teil-spezifische Fragen besser nur auf der betroffenen Seite zeigen.
*/
(function () {
  "use strict";

  var QA = {
    title: "Gefragt und geantwortet",
    intro: "Aus euren Zuschriften. Hast du selbst eine Frage? Schreib sie mir gern unten – vielleicht steht sie als Nächstes hier.",
    items: [
      {
        asker: "Erik",
        question: "Wie kommst du auf den Gedanken, Gottesfurcht durch das hebräische Alphabet zu beschreiben?",
        answer: [
          "Danke für deine Frage, die trifft genau einen Punkt, der mir selbst viel Freude macht.",
          "Ehrlich gesagt war es zuerst eine spontane Idee. Aber je länger ich darüber nachgedacht habe, desto mehr hat es sich angeboten. Es ist nämlich so: Wenn man ein großes Thema wie die Gottesfurcht an eine feste Struktur knüpft und es bewusst durch eine bestimmte Brille betrachtet, dann wird es auf einmal tiefer und auch attraktiver. Die Form zwingt einen, genauer hinzusehen, neue Verbindungen zu entdecken und dranzubleiben, Buchstabe für Buchstabe.",
          "Und gerade das hebräische Alphabet eignet sich dafür wunderbar. Diese Buchstaben sind keine bloßen Lautzeichen. Jeder einzelne trägt eine Bedeutung, eine Form, einen Zahlenwert und eine ganze Welt an Assoziationen in der jüdischen Tradition. Sie sind erstaunlich tief und zugleich umfassend, fast wie Bausteine, mit denen sich die ganze Schöpfung beschreiben lässt.",
          "Übrigens ist das kein neuer Einfall von mir. Schon viele Psalmen orientieren sich am Alphabet und gehen es Vers für Vers durch, von Aleph bis Tav. Insofern kopiere ich es nur von Berühmtheiten wie König David :-)",
          "Ich freue mich, dass du mit dabei bist. Herzlich, Micha"
        ]
      }
    ]
  };

  var CSS = '' +
    '.qa-section{background:#faf7f1;border-top:1px solid rgba(11,29,51,.08)}' +
    '.qa-section .qa-inner{padding:3.25rem 0 1.25rem}' +
    '.qa-title{font-family:"Playfair Display",serif;color:#0b1d33;font-size:1.9rem;line-height:1.15;margin:0 0 .45rem}' +
    '.qa-intro{color:#5a5a5a;margin:0 0 1.85rem;max-width:50ch}' +
    '.qa-item{border:1px solid rgba(11,29,51,.12);border-radius:14px;background:#fff;padding:1.6rem 1.7rem;box-shadow:0 12px 32px rgba(11,29,51,.06)}' +
    '.qa-row{display:flex;gap:.9rem;align-items:flex-start}' +
    '.qa-q{margin:0 0 1.15rem;padding-bottom:1.15rem;border-bottom:1px solid rgba(11,29,51,.1)}' +
    '.qa-avatar{flex:0 0 auto;width:2.6rem;height:2.6rem;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:"Playfair Display",serif;font-size:1.15rem;line-height:1}' +
    '.qa-q .qa-avatar{background:#e9e2d3;color:#0b1d33}' +
    '.qa-a .qa-avatar{background:#b8924a;color:#fff}' +
    '.qa-body{flex:1 1 auto;min-width:0}' +
    '.qa-name{font-weight:600;color:#0b1d33;font-size:.98rem;margin:0}' +
    '.qa-role{color:#b8924a;font-size:.72rem;text-transform:uppercase;letter-spacing:.09em;margin:.1rem 0 .55rem}' +
    '.qa-q .qa-text{color:#3a3a3a;font-style:italic;margin:0}' +
    '.qa-a .qa-text p{color:#3a3a3a;margin:0 0 .85rem}' +
    '.qa-a .qa-text p:last-child{margin:0}' +
    '@media(max-width:480px){.qa-avatar{display:none}.qa-item{padding:1.3rem 1.25rem}}';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function buildRow(roleClass, initial, name, role) {
    var row = el("div", "qa-row " + roleClass);
    row.appendChild(el("div", "qa-avatar", initial));
    var body = el("div", "qa-body");
    body.appendChild(el("p", "qa-name", name));
    body.appendChild(el("p", "qa-role", role));
    row.appendChild(body);
    return { row: row, body: body };
  }

  function buildItem(item) {
    var wrap = el("div", "qa-item");

    var q = buildRow("qa-q", (item.asker || "?").charAt(0).toUpperCase(), item.asker, "Frage");
    q.body.appendChild(el("p", "qa-text", item.question));
    wrap.appendChild(q.row);

    var a = buildRow("qa-a", "M", "Micha Levzion", "Antwort");
    var text = el("div", "qa-text");
    (item.answer || []).forEach(function (p) { text.appendChild(el("p", null, p)); });
    a.body.appendChild(text);
    wrap.appendChild(a.row);

    return wrap;
  }

  function render() {
    var anchor = document.querySelector("section.comments");
    if (!anchor || document.querySelector(".qa-section")) return;

    var style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    var section = el("section", "qa-section");
    var inner = el("div", "container container--narrow qa-inner");
    inner.appendChild(el("h2", "qa-title", QA.title));
    inner.appendChild(el("p", "qa-intro", QA.intro));
    QA.items.forEach(function (item) { inner.appendChild(buildItem(item)); });
    section.appendChild(inner);

    anchor.parentNode.insertBefore(section, anchor);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
