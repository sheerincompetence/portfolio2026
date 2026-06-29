/**
 * Clarity journey — slider transitions, chaos pop-outs, resting state
 */

(function () {
  const STORAGE_KEY = 'portfolio-clarity-resting';
  const slider = document.getElementById('clarity-slider');
  const root = document.documentElement;
  const body = document.body;
  const restoreBtn = document.getElementById('restore-slider');
  const slideHint = document.querySelector('.cx-slider__heading');
  const chaosLayer = document.getElementById('chaos-layer');
  const chaosChat = document.getElementById('chaos-chat');
  const chaosUrgency = document.querySelector('.chaos-urgency');
  const navComplex = document.querySelector('.cx-nav--complex');
  const recruiterCount = document.getElementById('recruiter-count');
  const chatMessage = document.getElementById('chat-message');
  const countdownEl = document.getElementById('countdown');

  if (!slider) return;

  const popWidgets = chaosLayer ? chaosLayer.querySelectorAll('[data-pop-at]') : [];
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
    if (!countdownEl || isResting || currentU > 0.1) return;
    countdownEl.textContent = formatCountdown(countdownSeconds);
    countdownSeconds = Math.max(0, countdownSeconds - 1);
    if (countdownSeconds === 0) countdownSeconds = 4 * 3600 + 32 * 60 + 12;
  }

  function tickRecruiters() {
    if (!recruiterCount || isResting || currentU > 0.15) return;
    recruiterCount.textContent = String(108 + Math.floor(Math.random() * 14));
  }

  function cycleChat() {
    if (!chatMessage || isResting || popped.get(chaosChat) || currentU > 0.5) return;
    chatMessage.style.opacity = '0';
    setTimeout(() => {
      chatIndex = (chatIndex + 1) % CHAT_LINES.length;
      chatMessage.innerHTML = CHAT_LINES[chatIndex];
      chatMessage.style.opacity = '1';
    }, 300);
  }

  function triggerPop(el) {
    if (!el || popped.get(el)) return;
    popped.set(el, true);

    if (el === chaosUrgency) {
      body.classList.add('urgency-popped');
    }

    const popType = el.dataset.popType || 'pop';
    el.classList.add(popType === 'slide' ? 'chaos-slide-off' : 'chaos-pop-out');
  }

  function resetPop(el) {
    if (!el) return;
    popped.delete(el);
    el.classList.remove('chaos-pop-out', 'chaos-slide-off');

    /* Clear animation forwards state so slide-off widgets can reappear */
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';

    if (el === chaosUrgency) {
      body.classList.remove('urgency-popped');
    }
  }

  function popHysteresis(widget) {
    return widget.dataset.popType === 'slide' ? 0.02 : 0.1;
  }

  function updateChaosWidgets(u) {
    popWidgets.forEach((widget) => {
      const at = parseFloat(widget.dataset.popAt);
      const hysteresis = popHysteresis(widget);

      if (u >= at && !popped.get(widget)) {
        if (widget === chaosChat) {
          const delay = parseInt(widget.dataset.popDelay || '600', 10);
          clearTimeout(chatPopTimer);
          chatPopTimer = setTimeout(() => triggerPop(widget), delay);
        } else {
          triggerPop(widget);
        }
      }

      if (u < at - hysteresis && popped.get(widget)) {
        resetPop(widget);
        if (widget === chaosChat) clearTimeout(chatPopTimer);
      }
    });

    if (u < 0.92 && chatPopTimer) {
      clearTimeout(chatPopTimer);
      chatPopTimer = null;
    }
  }

  function resetAllPops() {
    popWidgets.forEach((widget) => resetPop(widget));
    popped.clear();
    if (chatPopTimer) {
      clearTimeout(chatPopTimer);
      chatPopTimer = null;
    }
    body.classList.remove('urgency-popped');
  }

  function setClarity(value) {
    if (isResting) return;

    const u = Math.max(0, Math.min(100, value)) / 100;
    currentU = u;
    root.style.setProperty('--u', u);
    slider.value = Math.round(u * 100);
    slider.setAttribute('aria-valuenow', Math.round(u * 100));

    updateChaosWidgets(u);

    body.classList.toggle('nav-clarity', u >= 0.5);
    navComplex?.classList.toggle('is-hidden', u >= 0.55);

    if (slideHint) {
      slideHint.style.visibility = u > 0.12 ? 'hidden' : '';
    }
  }

  function enterRestingState() {
    if (isResting) return;
    isResting = true;
    body.classList.add('is-resting');
    document.title = 'Andrew Sheerin — Product Design Leader';
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch (_) { /* ignore */ }
  }

  function exitRestingState() {
    isResting = false;
    body.classList.remove('is-resting');
    document.title = 'Andrew Sheerin — Complexity → Clarity';
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* ignore */ }

    resetAllPops();
    setClarity(100);
    slider.focus();
  }

  function initFromQueryOrStorage() {
    const params = new URLSearchParams(window.location.search);

    if (params.get('start') === '1') {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* ignore */ }
      resetAllPops();
      setClarity(0);
      return true;
    }

    if (params.get('resting') === '1') {
      root.style.setProperty('--u', 1);
      currentU = 1;
      slider.value = 100;
      enterRestingState();
      return true;
    }

    const uParam = params.get('u');
    if (uParam !== null && !Number.isNaN(parseInt(uParam, 10))) {
      setClarity(parseInt(uParam, 10));
      return true;
    }

    try {
      if (localStorage.getItem(STORAGE_KEY) === 'true') {
        root.style.setProperty('--u', 1);
        currentU = 1;
        slider.value = 100;
        enterRestingState();
        return true;
      }
    } catch (_) { /* ignore */ }

    return false;
  }

  slider.addEventListener('input', (e) => {
    setClarity(parseInt(e.target.value, 10));
  });

  slider.addEventListener('change', (e) => {
    setClarity(parseInt(e.target.value, 10));
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
    });
  });

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!initFromQueryOrStorage()) {
    resetAllPops();
    setClarity(0);
  }

  if (!prefersReduced && !isResting) {
    setInterval(tickCountdown, 1000);
    setInterval(tickRecruiters, 4000);
    setInterval(cycleChat, 5000);
    tickCountdown();
    tickRecruiters();
  }

  window.setClarity = setClarity;
  window.enterRestingState = enterRestingState;
  window.exitRestingState = exitRestingState;
})();
