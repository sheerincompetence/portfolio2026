/**
 * How I Work — workshop wall loop, threshold draws, diagram hover
 */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function duplicateTrack(track) {
    if (!track || track.dataset.hiwDuplicated === '1') return;
    var items = Array.prototype.slice.call(track.children);
    items.forEach(function (node) {
      track.appendChild(node.cloneNode(true));
    });
    track.dataset.hiwDuplicated = '1';
  }

  function initWorkshopWall() {
    document.querySelectorAll('.hiw-ws-wall').forEach(function (wall) {
      var track = wall.querySelector('[data-hiw-ws-track]');
      if (!track) return;
      duplicateTrack(track);
      if (window.PortfolioImageZoom) {
        window.PortfolioImageZoom.init(track);
      }
    });
  }

  function initThresholds() {
    var thresholds = document.querySelectorAll('.hiw-threshold');
    if (!thresholds.length) return;

    if (reduced) {
      thresholds.forEach(function (el) {
        el.style.setProperty('--hiw-score-scale', '1');
      });
      return;
    }

    function clamp(n, min, max) {
      return Math.min(max, Math.max(min, n));
    }

    function tick() {
      thresholds.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var vh = window.innerHeight;
        var raw = (vh * 0.88 - rect.top) / (vh * 0.5);
        el.style.setProperty('--hiw-score-scale', clamp(raw, 0, 1));
      });
    }

    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  }

  function initEpilogueScore() {
    var chapters = document.querySelectorAll('.hiw-epilogue .story-chapter');
    if (!chapters.length) return;

    if (reduced) {
      chapters.forEach(function (ch) {
        ch.style.setProperty('--score-scale', '1');
      });
      return;
    }

    function clamp(n, min, max) {
      return Math.min(max, Math.max(min, n));
    }

    function tick() {
      chapters.forEach(function (ch) {
        var rect = ch.getBoundingClientRect();
        var vh = window.innerHeight;
        var raw = (vh * 0.88 - rect.top) / (vh * 0.5);
        ch.style.setProperty('--score-scale', clamp(raw, 0, 1));
      });
    }

    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  }

  function initDiagrams() {
    document.querySelectorAll('[data-hiw-diagram]').forEach(function (diagram) {
      var layers = diagram.querySelectorAll('.hiw-stack-diagram__layer, .hiw-flow-diagram__step');
      if (!layers.length) return;

      diagram.classList.add('is-interactive');

      layers.forEach(function (layer) {
        layer.addEventListener('mouseenter', function () {
          layers.forEach(function (l) { l.classList.remove('is-hovered'); });
          layer.classList.add('is-hovered');
        });
        layer.addEventListener('mouseleave', function () {
          layer.classList.remove('is-hovered');
        });
        layer.setAttribute('tabindex', '0');
      });
    });
  }

  function init() {
    initWorkshopWall();
    initThresholds();
    initEpilogueScore();
    initDiagrams();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
