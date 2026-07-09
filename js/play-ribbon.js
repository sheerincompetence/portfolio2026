/**
 * Sandbox ribbon — play worktree (:8766) or ?env=play only.
 * Overlay only: must not shift header/page geometry (main is source of truth).
 */
(function () {
  function isPlayEnv() {
    if (location.port === '8766') return true;
    if (new URLSearchParams(location.search).get('env') === 'play') return true;
    return false;
  }

  if (!isPlayEnv()) return;

  var style = document.createElement('style');
  style.textContent =
    ':root{--play-ribbon-h:0px}' +
    '.play-ribbon{' +
    'position:fixed;top:0;left:0;right:0;z-index:10002;' +
    'pointer-events:none;margin:0;padding:0.28rem 0.75rem;' +
    'font:600 10px/1.2 system-ui,-apple-system,sans-serif;' +
    'letter-spacing:0.06em;text-transform:uppercase;text-align:center;' +
    'color:#1c1408;background:linear-gradient(90deg,#f5c542,#f59e0b);' +
    'box-shadow:0 1px 6px rgba(0,0,0,0.12);' +
    '}';

  var bar = document.createElement('div');
  bar.className = 'play-ribbon';
  bar.setAttribute('role', 'status');
  bar.setAttribute('aria-live', 'polite');
  bar.textContent = 'Play branch — not production';

  document.head.appendChild(style);
  document.body.classList.add('has-play-ribbon');
  document.body.appendChild(bar);

  function syncRibbonHeight() {
    document.documentElement.style.setProperty('--play-ribbon-h', bar.offsetHeight + 'px');
  }

  syncRibbonHeight();
  window.addEventListener('resize', syncRibbonHeight);
})();
