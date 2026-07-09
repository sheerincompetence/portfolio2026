/**
 * Mobile nav — hamburger + backdrop for site-shell pages.
 * Clones links from .cx-nav--clarity when #cx-mobile-nav is empty.
 */
(function () {
  const toggle = document.querySelector('.cx-nav-toggle');
  const menu = document.getElementById('cx-mobile-nav');
  const backdrop = document.querySelector('.cx-mobile-nav-backdrop');
  const source = document.querySelector('.cx-nav--clarity');
  const body = document.body;

  if (!toggle || !menu) return;

  if (!menu.querySelector('a') && source) {
    menu.innerHTML = source.innerHTML;
  }

  const setOpen = (open) => {
    const isOpen = Boolean(open);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    menu.hidden = !isOpen;
    if (backdrop) backdrop.hidden = !isOpen;
    body.classList.toggle('is-mobile-nav-open', isOpen);
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  backdrop?.addEventListener('click', () => setOpen(false));

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  window.matchMedia('(max-width: 768px)').addEventListener('change', (e) => {
    if (!e.matches) setOpen(false);
  });
})();
