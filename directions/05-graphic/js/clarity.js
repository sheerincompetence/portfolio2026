/**
 * Dark Graphic — complexity → clarity slider
 */

(function () {
  const slider = document.getElementById('clarity-slider');
  if (!slider) return;

  const root = document.documentElement;
  const statement = document.getElementById('statement');
  const complexZone = document.getElementById('complex-zone');
  const clearPortfolio = document.getElementById('clear-portfolio');
  const hintComplex = document.getElementById('hint-complex');
  const hintClear = document.getElementById('hint-clear');
  const instruction = document.getElementById('slider-instruction');
  const chaosLayer = document.getElementById('chaos-layer');
  const recruiterCount = document.getElementById('recruiter-count');
  const countdownEl = document.getElementById('countdown');
  const chatMessage = document.getElementById('chat-message');

  const frags = statement?.querySelectorAll('.frag[data-threshold]') || [];
  const verbIng = statement?.querySelector('.frag-verb-ing');
  const verbBase = statement?.querySelector('.frag-verb-base');

  const INSTRUCTIONS = [
    { u: 0, text: 'Drag toward Understanding — unlock the portfolio' },
    { u: 0.2, text: 'Noise receding…' },
    { u: 0.5, text: 'Structure emerging' },
    { u: 0.75, text: 'Almost there' },
    { u: 1, text: '' },
  ];

  const CHAT_LINES = [
    'Hi! I\'m <strong>TalentBot™</strong>. Hire Andrew before someone else does!',
    '<strong>112 recruiters</strong> viewed this profile in the last hour.',
    'Schedule a synergy call? I\'m always online.',
    'Limited availability — act now!',
  ];

  let chatIndex = 0;
  let countdownSeconds = 4 * 3600 + 32 * 60 + 12;

  function formatCountdown(t) {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  }

  function setUnderstanding(u) {
    u = Math.max(0, Math.min(1, u));
    root.style.setProperty('--u', u);
    slider.value = u;
    slider.setAttribute('aria-valuenow', Math.round(u * 100));

    frags.forEach((frag) => {
      const start = parseFloat(frag.dataset.threshold);
      const range = parseFloat(frag.dataset.range || '0.18');
      if (u <= start) {
        frag.classList.remove('is-faded');
        frag.style.opacity = '';
      } else if (u >= start + range) {
        frag.classList.add('is-faded');
        frag.style.opacity = '0';
      } else {
        frag.classList.remove('is-faded');
        frag.style.opacity = (1 - (u - start) / range).toFixed(2);
      }
    });

    if (u >= 0.72) {
      verbIng?.classList.add('is-faded');
      verbBase?.classList.add('is-visible');
    } else {
      verbIng?.classList.remove('is-faded');
      verbBase?.classList.remove('is-visible');
    }

    if (u >= 0.88) {
      complexZone?.classList.add('is-hidden');
      clearPortfolio?.classList.remove('is-hidden');
    } else {
      complexZone?.classList.remove('is-hidden');
      clearPortfolio?.classList[u < 0.4 ? 'add' : 'remove']('is-hidden');
    }

    if (hintComplex) hintComplex.style.opacity = Math.max(0, 1 - u * 1.5);
    if (hintClear) hintClear.style.opacity = Math.max(0, (u - 0.45) * 2);

    if (chaosLayer) chaosLayer.style.pointerEvents = u >= 0.18 ? 'none' : 'auto';

    if (instruction) {
      let text = INSTRUCTIONS[0].text;
      for (const item of INSTRUCTIONS) {
        if (u >= item.u) text = item.text;
      }
      instruction.textContent = text;
    }
  }

  slider.addEventListener('input', (e) => setUnderstanding(parseFloat(e.target.value)));

  document.querySelectorAll('[data-chaos-dead-end]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (instruction) instruction.textContent = 'The slider unlocks the door →';
    });
  });

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setUnderstanding(reduced ? 0.9 : 0);

  if (!reduced && countdownEl) {
    setInterval(() => {
      countdownEl.textContent = formatCountdown(countdownSeconds);
      countdownSeconds = Math.max(0, countdownSeconds - 1);
      if (countdownSeconds === 0) countdownSeconds = 4 * 3600 + 32 * 60 + 12;
    }, 1000);
  }

  if (!reduced && recruiterCount) {
    setInterval(() => {
      recruiterCount.textContent = String(108 + Math.floor(Math.random() * 14));
    }, 4000);
  }

  if (!reduced && chatMessage) {
    setInterval(() => {
      chatIndex = (chatIndex + 1) % CHAT_LINES.length;
      chatMessage.innerHTML = CHAT_LINES[chatIndex];
    }, 5000);
  }

  window.setUnderstanding = setUnderstanding;
})();
