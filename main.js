// Opt-in Modal
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

document.addEventListener('DOMContentLoaded', function () {
  // Close modal on backdrop click
  const modal = document.getElementById('optin-modal');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeOptinModal();
    });
  }
  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeOptinModal();
  });
});

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
