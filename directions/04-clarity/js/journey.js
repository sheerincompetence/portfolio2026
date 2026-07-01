/**
 * Journey — Complexity → Clarity homepage
 * Slider in hero, headline degradation, chaos pop-outs, resting state
 */

(function () {
  const STORAGE_KEY = 'portfolio-clarity-resting';
  const slider = document.getElementById('clarity-slider');
  const root = document.documentElement;
  const body = document.body;
  const headline = document.getElementById('hero-heading');
  const heroLead = document.getElementById('hero-lead');
  const heroBody = document.getElementById('hero-body');
  const slideHint = document.getElementById('slide-hint');
  const chaosLayer = document.getElementById('chaos-layer');
  const chaosChat = document.getElementById('chaos-chat');
  const sliderPanel = document.getElementById('slider-panel');
  const restPanel = document.getElementById('rest-panel');
  const restoreBtn = document.getElementById('restore-slider');
  const navComplex = document.querySelector('.journey-nav--complex');
  const recruiterCount = document.getElementById('recruiter-count');
  const countdownEl = document.getElementById('countdown');
  const chatMessage = document.getElementById('chat-message');

  if (!slider) return;

  const frags = headline.querySelectorAll('.frag[data-threshold]');
  const prefixI = document.getElementById('frag-prefix-i');
  const popWidgets = chaosLayer.querySelectorAll('[data-pop-at]');
  const popped = new Map();
  let chatPopTimer = null;
  let currentU = 0;
  let isResting = false;
  let sliderFocused = false;

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
    recruiterCount.textContent = String(108 + Math.floor(Math.random() * 14));
  }

  function cycleChat() {
    if (!chatMessage || popped.get(chaosChat)) return;
    chatMessage.style.opacity = '0';
    setTimeout(() => {
      chatIndex = (chatIndex + 1) % CHAT_LINES.length;
      chatMessage.innerHTML = CHAT_LINES[chatIndex];
      chatMessage.style.opacity = '1';
    }, 300);
  }

  function updateFragments(u) {
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

    if (prefixI) {
      prefixI.classList.toggle('is-visible', u >= 0.38);
    }

    if (heroLead) {
      heroLead.classList.toggle('is-visible', u >= 0.78);
    }

    if (u >= 0.92) {
      body.setAttribute('data-u-high', 'true');
    } else {
      body.removeAttribute('data-u-high');
    }
  }

  function triggerPop(el) {
    if (!el || popped.get(el)) return;
    popped.set(el, true);

    const popType = el.dataset.popType || 'pop';
    el.classList.add(popType === 'slide' ? 'chaos-slide-off' : 'chaos-pop-out');
  }

  function resetPop(el) {
    if (!el) return;
    popped.delete(el);
    el.classList.remove('chaos-pop-out', 'chaos-slide-off');
  }

  function updateChaosWidgets(u) {
    popWidgets.forEach((widget) => {
      const at = parseFloat(widget.dataset.popAt);
      const hysteresis = 0.12;

      if (u >= at && !popped.get(widget)) {
        if (widget === chaosChat && u >= 1) {
          const delay = parseInt(widget.dataset.popDelay || '800', 10);
          clearTimeout(chatPopTimer);
          chatPopTimer = setTimeout(() => triggerPop(widget), delay);
        } else if (widget !== chaosChat) {
          triggerPop(widget);
        }
      }

      if (u < at - hysteresis && popped.get(widget)) {
        resetPop(widget);
        if (widget === chaosChat) clearTimeout(chatPopTimer);
      }
    });

    if (u < 1 && chatPopTimer) {
      clearTimeout(chatPopTimer);
      chatPopTimer = null;
    }

    if (chaosLayer) {
      chaosLayer.style.pointerEvents = u >= 0.15 ? 'none' : 'auto';
    }
  }

  function setUnderstanding(u, { skipStorage = false } = {}) {
    if (isResting) return;

    u = Math.max(0, Math.min(1, u));
    currentU = u;
    root.style.setProperty('--u', u);
    slider.value = u;
    slider.setAttribute('aria-valuenow', Math.round(u * 100));

    updateFragments(u);
    updateChaosWidgets(u);

    if (navComplex) {
      navComplex.classList.toggle('is-hidden', u >= 0.55);
    }

    body.classList.toggle('nav-clarity', u >= 0.55);

    if (slideHint) {
      slideHint.style.opacity = u > 0.08 ? '0' : '';
    }
  }

  function enterRestingState() {
    if (isResting) return;
    isResting = true;
    body.classList.add('is-resting');
    body.dataset.resting = 'true';
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch (_) { /* ignore */ }
  }

  function exitRestingState() {
    isResting = false;
    body.classList.remove('is-resting');
    body.dataset.resting = 'false';
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* ignore */ }

    setUnderstanding(1);
    slider.focus();
  }

  function initFromStorage() {
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'true') {
        setUnderstanding(1);
        enterRestingState();
        return true;
      }
    } catch (_) { /* ignore */ }
    return false;
  }

  slider.addEventListener('input', (e) => {
    setUnderstanding(parseFloat(e.target.value));
  });

  slider.addEventListener('focus', () => {
    sliderFocused = true;
  });

  slider.addEventListener('blur', () => {
    sliderFocused = false;
    if (currentU >= 0.995 && !isResting) {
      setTimeout(() => {
        if (!sliderFocused && currentU >= 0.995) {
          enterRestingState();
        }
      }, 400);
    }
  });

  restoreBtn?.addEventListener('click', exitRestingState);

  document.querySelectorAll('[data-chaos-dead-end]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (slideHint) {
        slideHint.textContent = 'Use the slider →';
        slideHint.style.opacity = '1';
        setTimeout(() => {
          if (currentU <= 0.08) slideHint.textContent = 'SLIDE ME! →';
        }, 2000);
      }
    });
  });

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!initFromStorage()) {
    setUnderstanding(prefersReduced ? 0.85 : 0);
  }

  if (!prefersReduced) {
    setInterval(tickCountdown, 1000);
    setInterval(tickRecruiters, 4000);
    setInterval(cycleChat, 5000);
  }

  tickCountdown();
  tickRecruiters();

  window.setUnderstanding = setUnderstanding;
  window.enterRestingState = enterRestingState;
})();
