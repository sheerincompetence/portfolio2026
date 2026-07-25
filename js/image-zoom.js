/**
 * Universal image zoom — opt in with data-zoom on img or data-zoom-src on a control.
 * Hover: zoom-in cursor. Click: native-size overlay. Click overlay: close (zoom-out cursor).
 */
(function () {
  var dialog = null;
  var dialogImg = null;
  var lastTrigger = null;

  function ensureDialog() {
    if (dialog) return;

    dialog = document.createElement('dialog');
    dialog.id = 'image-zoom-dialog';
    dialog.className = 'image-zoom-dialog';
    dialog.setAttribute('aria-label', 'Enlarged image preview');

    var figure = document.createElement('figure');
    figure.className = 'image-zoom-dialog__figure';

    dialogImg = document.createElement('img');
    dialogImg.className = 'image-zoom-dialog__img';
    dialogImg.decoding = 'async';

    figure.appendChild(dialogImg);
    dialog.appendChild(figure);
    document.body.appendChild(dialog);

    dialog.addEventListener('click', function () {
      close();
    });

    dialog.addEventListener('close', function () {
      document.body.classList.remove('is-image-zoom-open');
      dialogImg.removeAttribute('src');
      if (lastTrigger) {
        lastTrigger.focus();
        lastTrigger = null;
      }
    });
  }

  function open(src, alt, trigger) {
    ensureDialog();
    lastTrigger = trigger || null;
    dialogImg.src = src;
    dialogImg.alt = alt || '';
    document.body.classList.add('is-image-zoom-open');
    if (!dialog.open) dialog.showModal();
  }

  function close() {
    if (dialog && dialog.open) dialog.close();
  }

  function isOpen() {
    return !!(dialog && dialog.open);
  }

  function getSource(node) {
    if (node.tagName === 'IMG') {
      return {
        src: node.currentSrc || node.src,
        alt: node.alt || ''
      };
    }

    return {
      src: node.getAttribute('data-zoom-src') || '',
      alt: node.getAttribute('data-zoom-alt') || ''
    };
  }

  function markZoomable(node) {
    if (!node || node.dataset.zoomMarked === '1') return;
    node.dataset.zoomMarked = '1';

    if (node.tagName === 'IMG') {
      if (!node.hasAttribute('tabindex')) node.tabIndex = 0;
      if (!node.alt) {
        node.setAttribute('role', 'button');
        node.setAttribute('aria-label', 'Enlarge image');
      }
    }
  }

  function bindZoomables(root) {
    var scope = root || document;
    scope.querySelectorAll('img[data-zoom], [data-zoom-src]').forEach(markZoomable);
  }

  function handleClick(e) {
    if (isOpen()) return;

    var trigger = e.target.closest('img[data-zoom], [data-zoom-src]');
    if (!trigger) return;

    var source = getSource(trigger);
    if (!source.src) return;

    e.preventDefault();
    e.stopPropagation();
    open(source.src, source.alt, trigger);
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' && isOpen()) {
      e.preventDefault();
      close();
      return;
    }

    if (e.key !== 'Enter' && e.key !== ' ') return;

    var trigger = e.target.closest('img[data-zoom], [data-zoom-src]');
    if (!trigger || isOpen()) return;

    e.preventDefault();
    var source = getSource(trigger);
    if (!source.src) return;
    open(source.src, source.alt, trigger);
  }

  function init(root) {
    bindZoomables(root);
  }

  document.addEventListener('click', handleClick);
  document.addEventListener('keydown', handleKeydown);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      init();
    });
  } else {
    init();
  }

  window.PortfolioImageZoom = {
    init: init,
    open: open,
    close: close
  };
})();
