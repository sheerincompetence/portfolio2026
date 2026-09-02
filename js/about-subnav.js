/**
 * About subnav - stuck state + floor colour matched to the first content block.
 */
(function () {
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

  function stickyTop(bar) {
    var px = parseFloat(getComputedStyle(bar).top);
    if (!Number.isNaN(px) && px > 0) {
      return px;
    }

    var header = document.querySelector('.cx-header');
    return header ? header.getBoundingClientRect().height : 92;
  }

  function initAboutSubnav() {
    var bar = document.querySelector('.about-rail-bar');
    if (!bar) return;

    function setFloorColor() {
      var content = bar.nextElementSibling;
      if (content) {
        var section = content.querySelector(':scope > .section');
        if (section) content = section;
      }
      bar.style.setProperty('--about-rail-floor', readFloorColor(content));
    }

    setFloorColor();

    if (!('IntersectionObserver' in window)) return;

    var sentinel = document.createElement('div');
    sentinel.className = 'about-rail-sentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    bar.parentNode.insertBefore(sentinel, bar);

    function createObserver() {
      return new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            bar.classList.toggle('is-stuck', !entry.isIntersecting);
          });
        },
        {
          threshold: [0],
          rootMargin: '-' + stickyTop(bar) + 'px 0px 0px 0px'
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAboutSubnav);
  } else {
    initAboutSubnav();
  }
})();
