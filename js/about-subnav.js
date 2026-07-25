/**
 * About subnav — stuck state + floor colour matched to the first content block.
 */
(function () {
  var bar = document.querySelector('.about-rail-bar');
  if (!bar) return;

  function readFloorColor(el) {
    if (!el) {
      return getComputedStyle(document.body).backgroundColor;
    }

    var node = el;
    while (node) {
      var bg = getComputedStyle(node).backgroundColor;
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
        return bg;
      }
      node = node.firstElementChild;
    }

    return getComputedStyle(document.body).backgroundColor;
  }

  function setFloorColor() {
    var content = bar.nextElementSibling;
    bar.style.setProperty('--about-rail-floor', readFloorColor(content));
  }

  setFloorColor();

  if (!('IntersectionObserver' in window)) return;

  var sentinel = document.createElement('div');
  sentinel.className = 'about-rail-sentinel';
  sentinel.setAttribute('aria-hidden', 'true');
  bar.parentNode.insertBefore(sentinel, bar);

  var stickyTop = function () {
    return parseFloat(getComputedStyle(bar).top) || 0;
  };

  function createObserver() {
    return new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          bar.classList.toggle('is-stuck', !entry.isIntersecting);
        });
      },
      {
        threshold: [0],
        rootMargin: '-' + stickyTop() + 'px 0px 0px 0px'
      }
    );
  }

  var observer = createObserver();
  observer.observe(sentinel);

  window.addEventListener('resize', function () {
    setFloorColor();
    observer.disconnect();
    observer = createObserver();
    observer.observe(sentinel);
  });
})();
