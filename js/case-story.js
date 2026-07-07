/**
 * Case study storytelling — scroll sequences & exhibits
 * Reusable via data-* hooks across portfolio essays
 */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function progressInView(el, startAt, endAt) {
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight;
    var raw = (startAt * vh - rect.top) / (rect.height + (startAt - endAt) * vh);
    return clamp(raw, 0, 1);
  }

  /* ——— Beat reveals ——— */
  function initBeats() {
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
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }
    );
    els.forEach(function (el) { io.observe(el); });

    /* Above-fold: don't wait for scroll */
    els.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) el.classList.add('is-on');
    });
  }

  /* ——— Pipeline scan pulse ——— */
  function pipelineEnterProgress(stage) {
    var rect = stage.getBoundingClientRect();
    var vh = window.innerHeight;
    var shell = document.querySelector('.cx-header');
    var headerBottom = shell ? shell.getBoundingClientRect().bottom : 0;
    var mid = rect.top + rect.height * 0.5;
    var startY = vh * 0.82;
    var endY = headerBottom + (vh - headerBottom) * 0.32;
    var raw = (startY - mid) / (startY - endY);
    return clamp(raw, 0, 1);
  }

  function initPipeline() {
    var stage = document.querySelector('[data-sequence="pipeline-scan"]');
    if (!stage) return;
    var steps = stage.querySelectorAll('[data-pipeline-step]');
    var count = steps.length;
    if (!count) return;

    var ANIM_START = 0.28;
    var ANIM_END = 0.96;
    var PULSE_END = 0.88;
    var FLIP_START = 0.78;
    var FLIP_END = 1;

    if (reduced) {
      steps.forEach(function (s) {
        s.style.setProperty('--emphasis', '0.55');
        s.style.setProperty('--scale', '1');
      });
      stage.style.setProperty('--finale-reveal', '1');
      return;
    }

    function mapProgress(anim) {
      var pulsePos = clamp(anim / PULSE_END, 0, 1) * (count - 1);
      var flipRaw = anim <= FLIP_START ? 0 : clamp((anim - FLIP_START) / (FLIP_END - FLIP_START), 0, 1);
      var reveal = flipRaw * flipRaw * (3 - 2 * flipRaw);
      return { pulsePos: pulsePos, reveal: reveal };
    }

    function tick() {
      var t = pipelineEnterProgress(stage);
      var anim = clamp((t - ANIM_START) / (ANIM_END - ANIM_START), 0, 1);
      var mapped = mapProgress(anim);
      var pulsePos = mapped.pulsePos;
      var reveal = mapped.reveal;

      stage.style.setProperty('--finale-reveal', reveal);

      steps.forEach(function (step, i) {
        var dist = Math.abs(pulsePos - i);
        var emphasis = clamp(1 - dist * 0.78, 0.42, 1);
        emphasis = emphasis * emphasis * (3 - 2 * emphasis);
        var scale = 0.99 + emphasis * 0.03;
        if (step.classList.contains('story-pipeline__item--finale') && reveal > 0.2) {
          emphasis = 1;
          scale = 1;
        }
        step.style.setProperty('--emphasis', emphasis);
        step.style.setProperty('--scale', scale);
        if (step.classList.contains('story-pipeline__item--finale')) {
          step.classList.toggle('is-peak', emphasis > 0.9 && reveal < 0.12);
        }
      });
    }

    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    stage.querySelectorAll('img').forEach(function (img) {
      if (!img.complete) img.addEventListener('load', tick);
    });
    tick();
  }

  /* ——— Chapter score draw ——— */
  function initChapterScores() {
    var chapters = document.querySelectorAll('.story-chapter');
    if (!chapters.length) return;

    if (reduced) {
      chapters.forEach(function (ch) { ch.style.setProperty('--score-scale', '1'); });
      return;
    }

    function tick() {
      chapters.forEach(function (ch) {
        var rect = ch.getBoundingClientRect();
        var vh = window.innerHeight;
        var raw = (vh * 0.88 - rect.top) / (vh * 0.5);
        var scale = clamp(raw, 0, 1);
        ch.style.setProperty('--score-scale', scale);
      });
    }

    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  }

  /* ——— Feed hero fade ——— */
  function initFeedHero() {
    var stage = document.querySelector('[data-sequence="feed-hero"]');
    if (!stage) return;
    if (reduced) {
      stage.style.setProperty('--feed-fade', '0');
      return;
    }
    function tick() {
      var t = progressInView(stage, 0.9, 0.05);
      stage.style.setProperty('--feed-fade', t);
    }
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  }

  /* ——— Card assemble ——— */
  function initCardAssemble() {
    var exhibit = document.querySelector('[data-sequence="card-assemble"]');
    if (!exhibit) return;
    if (reduced) {
      exhibit.style.setProperty('--card-assemble', '1');
      return;
    }
    function tick() {
      var t = progressInView(exhibit, 0.75, 0.2);
      exhibit.style.setProperty('--card-assemble', t);
    }
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  }

  /* ——— Event card layer hover ——— */
  function initCardLayers() {
    var layers = document.querySelectorAll('[data-card-layer]');
    var frame = document.querySelector('.story-card-exhibit__frame');
    if (!layers.length) return;
    layers.forEach(function (layer) {
      var color = layer.getAttribute('data-color');
      function on() {
        layers.forEach(function (l) { l.classList.remove('is-active'); });
        layer.classList.add('is-active');
        if (frame) frame.style.setProperty('--card-glow', '1');
        if (frame && color) frame.style.setProperty('--layer-color', color);
      }
      function off() {
        layer.classList.remove('is-active');
        if (frame) frame.style.setProperty('--card-glow', '0');
      }
      layer.addEventListener('mouseenter', on);
      layer.addEventListener('focus', on);
      layer.addEventListener('mouseleave', off);
      layer.addEventListener('blur', off);
      layer.setAttribute('tabindex', '0');
    });
  }

  /* ——— Then break ——— */
  function initThen() {
    var el = document.querySelector('[data-sequence="then"]');
    if (!el) return;
    if (reduced) {
      el.style.setProperty('--then-on', '1');
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            el.style.setProperty('--then-on', '1');
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
  }

  /* ——— Overwhelm stagger ——— */
  function initOverwhelm() {
    var stage = document.querySelector('[data-sequence="overwhelm"]');
    if (!stage) return;
    var cards = stage.querySelectorAll('[data-overwhelm-card]');
    var quote = stage.querySelector('[data-overwhelm-quote]');

    if (reduced) {
      cards.forEach(function (c) { c.style.setProperty('--card-in', '1'); });
      if (quote) quote.style.setProperty('--quote-on', '1');
      return;
    }

    function tick() {
      var t = progressInView(stage, 0.88, 0.02);
      cards.forEach(function (card, i) {
        var delay = i * 0.14;
        var enter = clamp((t - delay) / 0.22, 0, 1);
        var settle = clamp((t - 0.55) / 0.2, 0, 1);
        var yStack = i * settle * 52;
        card.style.setProperty('--card-in', enter);
        card.style.setProperty('--card-ty', yStack);
        card.style.top = yStack + 'px';
      });
      if (quote) quote.style.setProperty('--quote-on', clamp((t - 0.78) / 0.15, 0, 1));
    }

    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  }

  /* ——— Wrongness steps ——— */
  function initWrong() {
    var blocks = document.querySelectorAll('[data-sequence="wrong"]');
    blocks.forEach(function (block) {
      if (reduced) {
        block.style.setProperty('--w1', '1');
        block.style.setProperty('--w2', '1');
        block.style.setProperty('--w3', '1');
        return;
      }
      function tick() {
        var t = progressInView(block, 0.8, 0.05);
        block.style.setProperty('--w1', clamp(t / 0.25, 0, 1));
        block.style.setProperty('--w2', clamp((t - 0.28) / 0.28, 0, 1));
        block.style.setProperty('--w3', clamp((t - 0.58) / 0.32, 0, 1));
      }
      window.addEventListener('scroll', tick, { passive: true });
      window.addEventListener('resize', tick);
      tick();
    });
  }

  /* ——— Principle ——— */
  function initPrinciple() {
    var block = document.querySelector('[data-sequence="principle"]');
    if (!block) return;
    if (reduced) {
      block.classList.add('is-lit');
      block.style.setProperty('--glow', '1');
      return;
    }
    function tick() {
      var rect = block.getBoundingClientRect();
      var vh = window.innerHeight;
      var t = clamp(1 - rect.top / vh, 0, 1);
      block.style.setProperty('--glow', t);
      if (t > 0.5) block.classList.add('is-lit');
    }
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  /* ——— Surface cards ——— */
  function initSurfaces() {
    var cards = document.querySelectorAll('.story-surface');
    if (!cards.length || reduced) {
      cards.forEach(function (c) { c.classList.add('is-on'); });
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
      { threshold: 0.2 }
    );
    cards.forEach(function (c, i) {
      c.style.transitionDelay = i * 0.12 + 's';
      io.observe(c);
    });
  }

  /* ——— Compression expand ——— */
  function initCompress() {
    var dialog = document.getElementById('story-expand-dialog');
    var img = dialog && dialog.querySelector('img');
    if (!dialog || !img) return;

    document.querySelectorAll('[data-expand-src]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        img.src = btn.getAttribute('data-expand-src');
        img.alt = btn.getAttribute('data-expand-alt') || '';
        dialog.showModal();
      });
    });

    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });
  }

  initBeats();
  initChapterScores();
  initPipeline();
  initFeedHero();
  initCardAssemble();
  initCardLayers();
  initThen();
  initOverwhelm();
  initWrong();
  initPrinciple();
  initSurfaces();
  initCompress();
})();
