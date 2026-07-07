/**
 * Horizontal staged reveal — archived scroll-pinned pipeline carousel
 * See work/exhibits/horizontal-staged-reveal/README.md
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

  function initPipelineStaged() {
    var stage = document.querySelector('[data-sequence="pipeline-staged"]');
    if (!stage) return;
    var track = stage.querySelector('.story-pipeline__track');
    var viewport = stage.querySelector('.story-pipeline__viewport');
    var steps = stage.querySelectorAll('[data-pipeline-step]');
    var arrows = stage.querySelectorAll('[data-pipeline-arrow]');
    var count = steps.length;
    if (!track || !count) return;

    var HOLD_CAM = 0.14;
    var TRAVEL_END = 0.52;
    var HOLD_FINALE_END = 0.64;
    var REVEAL_END = 0.76;

    if (reduced) {
      steps.forEach(function (s) {
        s.style.setProperty('--focus', '1');
        s.style.setProperty('--scale', '1');
      });
      stage.style.setProperty('--finale-reveal', '1');
      return;
    }

    function mapProgress(t) {
      if (t <= HOLD_CAM) return { pos: 0, reveal: 0 };
      if (t <= TRAVEL_END) {
        var local = (t - HOLD_CAM) / (TRAVEL_END - HOLD_CAM);
        return { pos: local * (count - 1), reveal: 0 };
      }
      if (t <= HOLD_FINALE_END) return { pos: count - 1, reveal: 0 };
      if (t <= REVEAL_END) {
        var flip = (t - HOLD_FINALE_END) / (REVEAL_END - HOLD_FINALE_END);
        return { pos: count - 1, reveal: flip };
      }
      return { pos: count - 1, reveal: 1 };
    }

    function tick() {
      var t = progressInView(stage, 0.92, 0.02);
      var mapped = mapProgress(t);
      var pos = mapped.pos;
      var reveal = mapped.reveal;
      var vpCenter = viewport ? viewport.offsetWidth / 2 : window.innerWidth / 2;

      stage.style.setProperty('--finale-reveal', reveal);

      var focuses = [];
      steps.forEach(function (step, i) {
        var dist = Math.abs(pos - i);
        var focus = clamp(1 - dist * 0.92, 0, 1);
        focus = focus * focus * (3 - 2 * focus);
        if (focus < 0.06) focus = 0;
        var scale = 0.88 + focus * 0.12;
        if (step.classList.contains('story-pipeline__item--camera') && i === 0 && t <= HOLD_CAM) {
          focus = 1;
          scale = 1;
        }
        if (step.classList.contains('story-pipeline__item--finale') && pos >= count - 1 && reveal > 0) {
          focus = 1;
          scale = 1;
        }
        focuses[i] = focus;
        step.style.setProperty('--focus', focus);
        step.style.setProperty('--scale', scale);
        if (step.classList.contains('story-pipeline__item--finale')) {
          step.classList.toggle('is-peak', focus > 0.9 && reveal < 0.08);
        }
      });

      arrows.forEach(function (arrow, i) {
        var on = clamp(((focuses[i] || 0) + (focuses[i + 1] || 0)) / 2, 0, 1);
        arrow.style.setProperty('--arrow-on', on);
      });

      var i0 = Math.floor(pos);
      var i1 = Math.min(count - 1, i0 + 1);
      var frac = pos - i0;
      var x0 = steps[i0].offsetLeft + steps[i0].offsetWidth / 2;
      var x1 = steps[i1].offsetLeft + steps[i1].offsetWidth / 2;
      var centerX = x0 + (x1 - x0) * frac;
      track.style.transform = 'translateX(calc(' + vpCenter + 'px - ' + centerX + 'px))';
    }

    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    stage.querySelectorAll('img').forEach(function (img) {
      if (!img.complete) img.addEventListener('load', tick);
    });
    tick();
  }

  initPipelineStaged();
})();
