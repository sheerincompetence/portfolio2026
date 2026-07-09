/**
 * Antare cinema — scroll-pinned sequences & beat reveals
 * Used across editorial direction variants
 */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ——— Beat reveals ——— */
  function initReveals() {
    var els = document.querySelectorAll('[data-beat]');
    if (!els.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-on'); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-on');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    els.forEach(function (el) { io.observe(el); });
  }

  /* ——— Overwhelm crowd sequence (5 cards, scroll-scrubbed) ——— */
  function initOverwhelm() {
    var stages = document.querySelectorAll('[data-sequence="overwhelm"]');
    if (!stages.length) return;

    stages.forEach(function (stage) {
      var cards = stage.querySelectorAll('[data-crowd-card]');
      var quote = stage.querySelector('[data-crowd-quote]');
      var label = stage.querySelector('[data-crowd-label]');

      if (reduced) {
        stage.classList.add('is-complete');
        cards.forEach(function (c) { c.style.setProperty('--t', '0.5'); });
        return;
      }

      function tick() {
        var rect = stage.getBoundingClientRect();
        var vh = window.innerHeight;
        var start = vh * 0.15;
        var end = -rect.height + vh * 0.85;
        var raw = (start - rect.top) / (start - end);
        var t = Math.max(0, Math.min(1, raw));
        stage.style.setProperty('--scroll', t);

        cards.forEach(function (card, i) {
          var delay = i * 0.06;
          var enter = clamp((t - delay) / 0.35, 0, 1);
          var exit = clamp((t - 0.72) / 0.28, 0, 1);
          var local = enter * (1 - exit);
          card.style.setProperty('--crowd', local);
          card.style.setProperty('--exit', exit);
        });

        if (quote) quote.style.setProperty('--crowd', clamp((t - 0.45) / 0.25, 0, 1));
        if (label) label.style.setProperty('--crowd', clamp((t - 0.08) / 0.2, 0, 1));

        if (t >= 0.98) stage.classList.add('is-complete');
      }

      window.addEventListener('scroll', tick, { passive: true });
      window.addEventListener('resize', tick);
      tick();
    });
  }

  /* ——— Pinned principle (climax) ——— */
  function initPrinciple() {
    var blocks = document.querySelectorAll('[data-sequence="principle"]');
    blocks.forEach(function (block) {
      if (reduced) {
        block.classList.add('is-lit');
        return;
      }
      function tick() {
        var rect = block.getBoundingClientRect();
        var vh = window.innerHeight;
        var t = clamp(1 - rect.top / vh, 0, 1);
        block.style.setProperty('--glow', t);
        if (t > 0.55) block.classList.add('is-lit');
      }
      window.addEventListener('scroll', tick, { passive: true });
      tick();
    });
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  initReveals();
  initOverwhelm();
  initPrinciple();
})();
