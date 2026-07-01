/**
 * Chaos edition — slider + dark pattern layer + parody animations
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
  const chaosLayer = document.getElementById('chaos-layer');
  const recruiterCount = document.getElementById('recruiter-count');
  const countdownEl = document.getElementById('countdown');
  const chatMessage = document.getElementById('chat-message');

  if (!slider) return;

  const frags = statement.querySelectorAll('.frag[data-threshold]');
  const verbIng = statement.querySelector('.frag-verb-ing');
  const verbBase = statement.querySelector('.frag-verb-base');

  const INSTRUCTIONS = [
    { u: 0,    text: '↑ This is a parody. Drag toward Understanding to escape ↑' },
    { u: 0.15, text: 'Good — the dark patterns are dissolving' },
    { u: 0.35, text: 'Words and noise begin to fall away' },
    { u: 0.55, text: 'The essence becomes visible' },
    { u: 0.85, text: 'Clarity' },
    { u: 1,    text: '' },
  ];

  const CHAT_LINES = [
    'Hi! 👋 I\'m <strong>TalentBot™</strong>. Can I help you hire Andrew <em>right now</em>?',
    '🔥 <strong>112 recruiters</strong> viewed this candidate in the last hour! Don\'t miss out!',
    'Would you like to <strong>schedule a synergy call</strong>? I\'m available 24/7!',
    'Andrew has <strong>limited availability</strong> — act fast! ⚡',
    'Still here? Let me connect you with our <strong>Enterprise Sales</strong> team!',
  ];

  let chatIndex = 0;
  let countdownSeconds = 4 * 3600 + 32 * 60 + 12;

  function formatCountdown(total) {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h} hours ${String(m).padStart(2, '0')} minutes ${String(s).padStart(2, '0')} seconds`;
  }

  function tickCountdown() {
    if (!countdownEl) return;
    countdownEl.textContent = formatCountdown(countdownSeconds);
    countdownSeconds = Math.max(0, countdownSeconds - 1);
    if (countdownSeconds === 0) countdownSeconds = 4 * 3600 + 32 * 60 + 12;
  }

  function tickRecruiters() {
    if (!recruiterCount) return;
    const base = 108 + Math.floor(Math.random() * 14);
    recruiterCount.textContent = String(base);
  }

  function cycleChat() {
    if (!chatMessage) return;
    chatMessage.style.opacity = '0';
    setTimeout(() => {
      chatIndex = (chatIndex + 1) % CHAT_LINES.length;
      chatMessage.innerHTML = CHAT_LINES[chatIndex];
      chatMessage.style.opacity = '1';
    }, 300);
  }

  function setUnderstanding(u) {
    u = Math.max(0, Math.min(1, u));
    root.style.setProperty('--u', u);
    slider.value = u;
    slider.setAttribute('aria-valuenow', Math.round(u * 100));

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
        frag.style.opacity = (1 - (u - fadeStart) / fadeRange).toFixed(2);
      }
    });

    if (u >= 0.72) {
      verbIng?.classList.add('is-faded');
      verbBase?.classList.add('is-visible');
    } else {
      verbIng?.classList.remove('is-faded');
      verbBase?.classList.remove('is-visible');
    }

    if (u >= 0.92) {
      complexZone?.classList.add('is-hidden');
      simpleZone?.classList.remove('is-hidden');
    } else {
      complexZone?.classList.remove('is-hidden');
      simpleZone?.classList[u < 0.35 ? 'add' : 'remove']('is-hidden');
    }

    if (hintComplex) hintComplex.style.opacity = Math.max(0, 1 - u * 1.4);
    if (hintClear) hintClear.style.opacity = Math.max(0, (u - 0.5) * 2);

    if (chaosLayer) {
      chaosLayer.style.pointerEvents = u >= 0.2 ? 'none' : 'auto';
    }

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

  // Parody interactions — all dead ends pointing to the slider
  document.querySelectorAll('[data-chaos-dead-end]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (instruction) {
        instruction.textContent = 'Nice try. The slider is the only way out →';
        instruction.style.color = '#c0392b';
        setTimeout(() => { instruction.style.color = ''; }, 2000);
      }
    });
  });

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setUnderstanding(prefersReduced ? 0.85 : 0);

  if (!prefersReduced) {
    setInterval(tickCountdown, 1000);
    setInterval(tickRecruiters, 4000);
    setInterval(cycleChat, 5000);
  }

  tickCountdown();
  tickRecruiters();

  window.setUnderstanding = setUnderstanding;
})();
