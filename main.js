// Hamburger Menu
document.addEventListener('DOMContentLoaded', function () {
  const burger = document.querySelector('.nav-burger');
  const links = document.querySelector('.nav-links');

  if (burger && links) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('is-open');
      links.classList.toggle('is-open');
    });

    // Schließen beim Klick auf einen Link
    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        burger.classList.remove('is-open');
        links.classList.remove('is-open');
      });
    });
  }
});
