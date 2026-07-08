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
  function initReveal(selector) {
    var els = document.querySelectorAll(selector);
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
    els.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) el.classList.add('is-on');
    });
  }

  function initBeats() {
    initReveal('[data-beat]');
  }

  function initBob() {
    initReveal('[data-bob]');
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

  /* ——— Feed stage (auto-pan + diary rise) ——— */
  function smoothstep(t) {
    return t * t * (3 - 2 * t);
  }

  function initFeedStage() {
    var stage = document.querySelector('[data-sequence="feed-stage"]');
    if (!stage) return;

    var punch = stage.querySelector('[data-feed-punch]');

    function tickPunch() {
      if (!punch) return;
      var rect = stage.getBoundingClientRect();
      var vh = window.innerHeight;
      var raw = (vh * 0.58 - rect.top) / (rect.height * 0.72);
      var t = smoothstep(clamp(raw, 0, 1));
      stage.style.setProperty('--punch-emphasis', t.toFixed(3));
    }

    if (reduced) {
      stage.classList.add('is-complete');
      stage.style.setProperty('--punch-emphasis', '1');
      return;
    }

    var played = false;

    function play() {
      if (played) return;
      played = true;
      stage.classList.add('is-playing');
      stage.addEventListener('animationend', function (e) {
        if (e.target.classList.contains('story-feed-stage__feed')) {
          stage.classList.add('is-complete');
        }
      });
    }

    if (!('IntersectionObserver' in window)) {
      play();
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              play();
              io.unobserve(stage);
            }
          });
        },
        { threshold: 0.35 }
      );
      io.observe(stage);
    }

    window.addEventListener('scroll', tickPunch, { passive: true });
    window.addEventListener('resize', tickPunch);
    tickPunch();
  }

  /* ——— Event card exhibit (assemble + layers) ——— */
  function initCardExhibit() {
    var exhibit = document.querySelector('[data-sequence="card-assemble"]');
    if (!exhibit) return;

    var frame = exhibit.querySelector('.story-card-exhibit__frame');
    var visual = exhibit.querySelector('.story-card-exhibit__visual');
    var stack = exhibit.querySelector('[data-card-stack]');
    var spec = exhibit.querySelector('.story-card-exhibit__spec');
    var slices = exhibit.querySelectorAll('[data-card-slice]');
    var layers = exhibit.querySelectorAll('[data-card-layer]');
    var hitMaps = [];
    var hoverLock = false;
    var count = layers.length;

    function buildHitMap(img) {
      var canvas = document.createElement('canvas');
      var w = canvas.width = img.naturalWidth;
      var h = canvas.height = img.naturalHeight;
      var ctx = canvas.getContext('2d');
      if (!ctx || !w || !h) return null;
      ctx.drawImage(img, 0, 0);
      return { w: w, h: h, data: ctx.getImageData(0, 0, w, h).data };
    }

    function hitSlice(n, relX, relY) {
      var map = hitMaps[n];
      if (!map) return false;
      var px = Math.min(map.w - 1, Math.max(0, Math.floor(relX * map.w)));
      var py = Math.min(map.h - 1, Math.max(0, Math.floor(relY * map.h)));
      return map.data[(py * map.w + px) * 4 + 3] > 24;
    }

    slices.forEach(function (slice, n) {
      var img = slice.querySelector('img');
      var color = slice.getAttribute('data-color') || (layers[n] && layers[n].getAttribute('data-color')) || '';
      if (color) slice.style.setProperty('--layer-color', color);
      if (!img) return;
      function bindMask() {
        var src = img.currentSrc || img.src;
        if (src) slice.style.setProperty('--slice-mask', 'url("' + src + '")');
      }
      bindMask();
      img.addEventListener('load', bindMask);
      function capture() {
        hitMaps[n] = buildHitMap(img);
      }
      if (img.complete) capture();
      else img.addEventListener('load', capture);
    });

    function setActive(index) {
      var i = typeof index === 'number' ? index : -1;
      slices.forEach(function (slice, n) {
        var color = (layers[n] && layers[n].getAttribute('data-color')) || '';
        if (color) slice.style.setProperty('--layer-color', color);
        slice.classList.toggle('is-active', n === i);
      });
      layers.forEach(function (layer, n) {
        layer.classList.toggle('is-active', n === i);
        if (n === i) {
          layer.style.setProperty('--layer-color', layer.getAttribute('data-color') || '');
        }
      });
      exhibit.classList.toggle('is-layered', i >= 0);
      if (frame) {
        if (i >= 0 && layers[i]) {
          frame.style.setProperty('--layer-color', layers[i].getAttribute('data-color') || '');
          frame.style.setProperty('--card-glow', '1');
        } else {
          frame.style.setProperty('--card-glow', '0');
        }
      }
    }

    function updateFromScroll() {
      if (hoverLock || !count || exhibit.style.getPropertyValue('--card-assembled') !== '1') return;
      var rect = exhibit.getBoundingClientRect();
      if (rect.bottom < window.innerHeight * 0.15 || rect.top > window.innerHeight * 0.92) return;

      var focusY = window.innerHeight * 0.38;
      var active = -1;
      layers.forEach(function (layer, n) {
        var lr = layer.getBoundingClientRect();
        var mid = lr.top + lr.height * 0.45;
        if (mid <= focusY) active = n;
      });
      setActive(active);
    }

    function lockHover(index) {
      hoverLock = true;
      exhibit.dataset.hover = '1';
      setActive(index);
    }

    function unlockHover() {
      hoverLock = false;
      exhibit.dataset.hover = '';
      updateFromScroll();
    }

    function tickAssemble() {
      var target = visual || frame || exhibit;
      var t = progressInView(target, 0.97, 0.78);
      exhibit.style.setProperty('--card-assemble', t.toFixed(3));
      if (t > 0.45) {
        exhibit.style.setProperty('--card-assembled', '1');
        exhibit.classList.add('is-assembled');
      } else {
        exhibit.style.setProperty('--card-assembled', '0');
        exhibit.classList.remove('is-assembled');
      }
    }

    function tick() {
      tickAssemble();
      updateFromScroll();
    }

    function wireInteractions() {
      layers.forEach(function (layer, n) {
        layer.addEventListener('mouseenter', function () { lockHover(n); });
      });

      if (stack) {
        stack.addEventListener('mousemove', function (e) {
          if (exhibit.style.getPropertyValue('--card-assembled') !== '1') return;
          var rect = stack.getBoundingClientRect();
          var rx = (e.clientX - rect.left) / rect.width;
          var ry = (e.clientY - rect.top) / rect.height;
          for (var n = count - 1; n >= 0; n--) {
            if (hitSlice(n, rx, ry)) {
              lockHover(n);
              return;
            }
          }
          hoverLock = false;
          exhibit.dataset.hover = '';
          setActive(-1);
        });

        stack.addEventListener('mouseleave', function () {
          hoverLock = false;
          exhibit.dataset.hover = '';
          setActive(-1);
        });
      }

      exhibit.addEventListener('focusin', function (e) {
        var layer = e.target.closest('[data-card-layer]');
        if (layer) lockHover(Number(layer.getAttribute('data-card-layer')));
      });

      exhibit.addEventListener('focusout', function (e) {
        if (!exhibit.contains(e.relatedTarget)) unlockHover();
      });

      exhibit.addEventListener('mouseleave', unlockHover);
    }

    if (reduced) {
      exhibit.style.setProperty('--card-assemble', '1');
      exhibit.style.setProperty('--card-assembled', '1');
      exhibit.classList.add('is-assembled');
      wireInteractions();
      setActive(-1);
      return;
    }

    wireInteractions();
    setActive(-1);

    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  }

  /* ——— Then break ——— */
  function initThen() {
    var el = document.querySelector('[data-sequence="then"]');
    if (!el) return;
    var dots = el.querySelectorAll('[data-then-dot]');
    var prevBand = el.previousElementSibling;
    var prevPara = prevBand ? prevBand.querySelector('.story-prose p:last-child') : null;

    function thenGate() {
      if (!prevPara) return 1;
      var rect = prevPara.getBoundingClientRect();
      var comfort = window.innerHeight * 0.42;
      return clamp((comfort - rect.bottom) / (window.innerHeight * 0.1), 0, 1);
    }

    function tickThen() {
      var gate = thenGate();
      var t = progressInView(el, 0.9, 0.05);
      var on = gate * clamp((t - 0.04) / 0.16, 0, 1);
      el.style.setProperty('--then-on', on.toFixed(3));
      dots.forEach(function (dot, n) {
        dot.classList.toggle('is-on', on > 0.9 && t > 0.3 + n * 0.06);
      });
    }

    if (reduced) {
      el.style.setProperty('--then-on', '1');
      dots.forEach(function (dot) { dot.classList.add('is-on'); });
      return;
    }

    window.addEventListener('scroll', tickThen, { passive: true });
    window.addEventListener('resize', tickThen);
    tickThen();
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

    function snapIn(raw) {
      var t = clamp(raw, 0, 1);
      if (t > 0.68) return 1;
      return clamp(t * 1.45, 0, 1);
    }

    var cardGap = 0.11;
    var cardSnap = 0.07;
    var fifthStart = 4 * cardGap;

    function tick() {
      var t = progressInView(stage, 0.9, 0.08);
      cards.forEach(function (card, i) {
        var delay = i * cardGap;
        card.style.setProperty('--card-in', snapIn((t - delay) / cardSnap));
      });
      if (quote) {
        quote.style.setProperty('--quote-on', snapIn((t - fifthStart) / 0.1));
      }
    }

    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  }

  /* ——— Wrongness steps ——— */
  function initWrong() {
    var blocks = document.querySelectorAll('[data-sequence="wrong"]');

    function snapBrisk(raw) {
      var t = clamp(raw, 0, 1);
      if (t > 0.66) return 1;
      return clamp(t * 1.55, 0, 1);
    }

    blocks.forEach(function (block) {
      if (reduced) {
        block.style.setProperty('--w-head', '1');
        block.style.setProperty('--w-img', '1');
        block.style.setProperty('--w-note', '1');
        return;
      }
      function tick() {
        var t = progressInView(block, 0.9, 0.18);
        var head = snapBrisk(t / 0.2);
        var img = head > 0.88 ? snapBrisk((t - 0.2) / 0.18) : 0;
        var note = img > 0.92 ? snapBrisk((t - 0.42) / 0.09) : 0;
        block.style.setProperty('--w-head', head);
        block.style.setProperty('--w-img', img);
        block.style.setProperty('--w-note', note);
      }
      window.addEventListener('scroll', tick, { passive: true });
      window.addEventListener('resize', tick);
      tick();
    });
  }

  /* ——— Act V chapter ——— */
  function initActVChapter() {
    var header = document.querySelector('[data-sequence="act-v-chapter"]');
    if (!header) return;
    if (reduced) {
      header.style.setProperty('--act-label', '1');
      header.style.setProperty('--act-title', '1');
      return;
    }
    function tick() {
      var t = progressInView(header, 0.82, 0.28);
      header.style.setProperty('--act-label', clamp((t - 0.12) / 0.16, 0, 1));
      header.style.setProperty('--act-title', clamp((t - 0.32) / 0.16, 0, 1));
    }
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  }

  /* ——— Principle ——— */
  function initPrinciple() {
    var block = document.querySelector('[data-sequence="principle"]');
    if (!block) return;

    function snapBrisk(raw) {
      var t = clamp(raw, 0, 1);
      if (t > 0.66) return 1;
      return clamp(t * 1.55, 0, 1);
    }

    if (reduced) {
      block.style.setProperty('--principle-block', '1');
      block.style.setProperty('--principle-lead', '1');
      return;
    }
    function tick() {
      var t = progressInView(block, 0.9, 0.14);
      block.style.setProperty('--principle-block', snapBrisk((t - 0.05) / 0.2));
      var leadRaw = clamp(t / 0.72, 0, 1);
      block.style.setProperty('--principle-lead', Math.pow(leadRaw, 2.4).toFixed(3));
    }
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
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

  /* ——— Jump nav — instant scroll + scroll-margin anchors (smooth scroll drifts through sticky sequences) ——— */
  function scrollToJumpTarget(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var root = document.documentElement;
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    el.scrollIntoView({ block: 'start', behavior: 'auto' });
    root.style.scrollBehavior = prev;
  }

  function initJumps() {
    var nav = document.querySelector('.case-interior-jumps');
    if (!nav) return;

    nav.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href').slice(1);
        if (!id || !document.getElementById(id)) return;
        e.preventDefault();
        scrollToJumpTarget(id);
        if (history.replaceState) {
          history.replaceState(null, '', '#' + id);
        } else {
          location.hash = id;
        }
      });
    });

    function applyHashScroll() {
      if (!location.hash) return;
      var hashId = location.hash.slice(1);
      if (document.getElementById(hashId)) scrollToJumpTarget(hashId);
    }

    applyHashScroll();
    window.addEventListener('load', applyHashScroll);
  }

  initBeats();
  initBob();
  initChapterScores();
  initPipeline();
  initFeedStage();
  initCardExhibit();
  initThen();
  initOverwhelm();
  initWrong();
  initActVChapter();
  initPrinciple();
  initSurfaces();
  initCompress();
  initJumps();
})();
