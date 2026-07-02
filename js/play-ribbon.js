/**
 * Sandbox ribbon — fixed overlay, no document flow impact.
 * Shows on port 8766 (play worktree) or ?env=play (debug). Inert on main (8765) and production.
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
    '.play-ribbon{' +
    'position:fixed;top:0;left:0;right:0;z-index:10001;' +
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
  document.body.appendChild(bar);
})();
