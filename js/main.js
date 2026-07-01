// Minimal enhancements — no dependencies

document.addEventListener('DOMContentLoaded', () => {
  // Mark current page in navigation
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/index.html';
  document.querySelectorAll('.site-nav a').forEach((link) => {
    const linkPath = new URL(link.href).pathname.replace(/\/$/, '');
    if (linkPath === currentPath || (currentPath.endsWith('/index.html') && linkPath.endsWith('/'))) {
      link.setAttribute('aria-current', 'page');
    }
  });
});
