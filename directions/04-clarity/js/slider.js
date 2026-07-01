/**
 * Complexity → Understanding slider
 * Drives --u (0–1), fragment visibility, and UI layers
 */

(function () {
  const slider = document.getElementById('clarity-slider');
  const root = document.documentElement;
  const statement = document.getElementById('statement');
  const complexZone = document.getElementById('complex-zone');
  const simpleZone = document.getElementById('simple-zone');
  const hintComplex = document.getElementById('hint-complex');
  const hintClear = document.getElementById('hint-clear');
  const instruction = document.getElementById('slider-instruction');

  if (!slider) return;

  // Fragments: fade out as understanding (u) increases past threshold
  const frags = statement.querySelectorAll('.frag[data-threshold]');
  const verbIng = statement.querySelector('.frag-verb-ing');
  const verbBase = statement.querySelector('.frag-verb-base');

  const INSTRUCTIONS = [
    { u: 0,    text: 'Drag toward understanding to simplify' },
    { u: 0.25, text: 'Words and noise begin to fall away' },
    { u: 0.55, text: 'The essence becomes visible' },
    { u: 0.85, text: 'Clarity' },
    { u: 1,    text: '' },
  ];

  function setUnderstanding(u) {
    u = Math.max(0, Math.min(1, u));
    root.style.setProperty('--u', u);
    slider.value = u;
    slider.setAttribute('aria-valuenow', Math.round(u * 100));

    // Fade text fragments
    frags.forEach((frag) => {
      const threshold = parseFloat(frag.dataset.threshold);
      const fadeRange = parseFloat(frag.dataset.range || '0.18');
      const fadeStart = threshold;
      const fadeEnd = threshold + fadeRange;

      if (u <= fadeStart) {
        frag.classList.remove('is-faded');
        frag.style.opacity = '';
      } else if (u >= fadeEnd) {
        frag.classList.add('is-faded');
        frag.style.opacity = '0';
      } else {
        frag.classList.remove('is-faded');
        const opacity = 1 - (u - fadeStart) / fadeRange;
        frag.style.opacity = opacity.toFixed(2);
      }
    });

    // Verb swap: translating → translate
    if (u >= 0.72) {
      verbIng?.classList.add('is-faded');
      verbBase?.classList.add('is-visible');
    } else {
      verbIng?.classList.remove('is-faded');
      verbBase?.classList.remove('is-visible');
    }

    // UI layers
    if (u >= 0.92) {
      complexZone?.classList.add('is-hidden');
      simpleZone?.classList.remove('is-hidden');
    } else {
      complexZone?.classList.remove('is-hidden');
      if (u < 0.35) {
        simpleZone?.classList.add('is-hidden');
      } else {
        simpleZone?.classList.remove('is-hidden');
      }
    }

    // Hints
    if (hintComplex) hintComplex.style.opacity = Math.max(0, 1 - u * 1.4);
    if (hintClear) hintClear.style.opacity = Math.max(0, (u - 0.5) * 2);

    // Instruction text
    if (instruction) {
      let text = INSTRUCTIONS[0].text;
      for (const item of INSTRUCTIONS) {
        if (u >= item.u) text = item.text;
      }
      instruction.textContent = text;
    }
  }

  slider.addEventListener('input', (e) => {
    setUnderstanding(parseFloat(e.target.value));
  });

  // Respect reduced motion — start closer to clarity
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const initial = prefersReduced ? 0.85 : 0;
  setUnderstanding(initial);

  // Expose for debugging
  window.setUnderstanding = setUnderstanding;
})();
