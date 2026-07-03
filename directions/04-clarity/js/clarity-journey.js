/**
 * Clarity journey — slider transitions, chaos pop-outs, resting state
 */

(function () {
  const STORAGE_KEY = 'portfolio-clarity-resting';
  const slider = document.getElementById('clarity-slider');
  const root = document.documentElement;
  const body = document.body;
  const restoreBtn = document.getElementById('restore-slider');
  const restPanel = document.getElementById('rest-panel');
  const slideHint = document.querySelector('.cx-slider__heading');
  const chaosLayer = document.getElementById('chaos-layer');
  const chaosChat = document.getElementById('chaos-chat');
  const chaosSocial = document.getElementById('chaos-social');
  const chaosUrgency = document.querySelector('.chaos-urgency');
  const navComplex = document.querySelector('.cx-nav--complex');
  const navHowIWork = document.getElementById('nav-how-i-work');
  const heroEyebrow = document.getElementById('hero-eyebrow');
  const recruiterCount = document.getElementById('recruiter-count');
  const chatMessage = document.getElementById('chat-message');
  const countdownEl = document.getElementById('countdown');
  const headline = document.getElementById('hero-heading');
  const fragPrefixI = document.getElementById('frag-prefix-i');
  const fragVerbIng = document.getElementById('frag-verb-ing');
  const fragS2To = document.getElementById('frag-s2-to');
  const fragVerbPlain = document.getElementById('frag-verb-plain');
  const fragProtoAnd = document.getElementById('frag-proto-and');

  if (!slider) return;

  const headlineFrags = headline ? headline.querySelectorAll('.frag[data-threshold]') : [];
  const eyebrowFrags = heroEyebrow ? heroEyebrow.querySelectorAll('[data-threshold]') : [];
  const navFadeLinks = navComplex ? navComplex.querySelectorAll('a[data-threshold]') : [];
  let headlineBaseline = null;

  const popWidgets = chaosLayer
    ? chaosLayer.querySelectorAll('[data-pop-at], [data-pop-chain-after]')
    : [];
  const popped = new Map();
  const popTimers = new Map();
  let currentU = 0;
  let isResting = false;
  let isRestTransitioning = false;
  let restEnterTimer = null;

  const urgencyPopAt = parseFloat(chaosUrgency?.dataset.popAt || '0.06');
  const urgencySlideSpan = parseFloat(chaosUrgency?.dataset.popSlide || '0.06');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Parked for layout-lock experiment — restore via URGENCY-PARKED.md */
  const URGENCY_BAR_ENABLED = true;
  const REST_ENTER_DELAY_MS = 1500;
  const REST_FADE_MS = 180;
  const LAYOUT_LOCK_ENABLED = body.classList.contains('journey-layout-lock');

  const urlParams = new URLSearchParams(window.location.search);
  const TUNE_ENABLED = urlParams.get('tune') === '1';
  const TUNE_STORAGE_KEY = 'portfolio-clarity-font-keyframes';

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
    if (!URGENCY_BAR_ENABLED || !countdownEl || isResting) return;
    if (currentU >= urgencyPopAt + urgencySlideSpan) return;
    countdownEl.textContent = formatCountdown(countdownSeconds);
    countdownSeconds = Math.max(0, countdownSeconds - 1);
    if (countdownSeconds === 0) countdownSeconds = 4 * 3600 + 32 * 60 + 12;
  }

  function tickRecruiters() {
    if (!recruiterCount || isResting || currentU > 0.15) return;
    recruiterCount.textContent = String(108 + Math.floor(Math.random() * 14));
  }

  function cycleChat() {
    if (!chatMessage || isResting || popped.get(chaosChat) || currentU > 0.5 || chaosChat?.classList.contains('chaos-chat--open')) return;
    chatMessage.style.opacity = '0';
    setTimeout(() => {
      chatIndex = (chatIndex + 1) % CHAT_LINES.length;
      chatMessage.innerHTML = CHAT_LINES[chatIndex];
      chatMessage.style.opacity = '1';
    }, 300);
  }

  function setFragOpacity(frag, u) {
    const threshold = parseFloat(frag.dataset.threshold);
    const fadeRange = parseFloat(frag.dataset.range || '0.1');
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
      frag.style.opacity = String(1 - (u - fadeStart) / fadeRange);
    }
  }

  function captureEyebrowReservedHeight() {
    if (!heroEyebrow) return;

    const existing = root.style.getPropertyValue('--cx-eyebrow-reserved-height').trim();
    if (existing) return;

    const savedU = currentU;
    eyebrowFrags.forEach((frag) => {
      frag.classList.remove('is-faded');
      frag.style.opacity = '';
    });

    const h = Math.ceil(heroEyebrow.getBoundingClientRect().height);
    root.style.setProperty('--cx-eyebrow-reserved-height', `${h}px`);

    if (savedU > 0) {
      syncEyebrowSkills(savedU);
    }
  }

  function syncEyebrowSkills(u) {
    eyebrowFrags.forEach((frag) => setFragOpacity(frag, u));
  }

  function syncNavMorph(u) {
    if (!navHowIWork) return;

    const start = parseFloat(navHowIWork.dataset.navMorph);
    const range = parseFloat(navHowIWork.dataset.navMorphRange || '0.1');
    const end = start + range;
    const clarityHref = navHowIWork.dataset.navHrefClarity || 'work/';
    const complexHref = navHowIWork.dataset.navHrefComplex || 'about/how-i-work.html';

    if (u <= start) {
      navHowIWork.setAttribute('href', complexHref);
      navHowIWork.setAttribute('aria-label', 'How I Work');
      navHowIWork.style.removeProperty('--nav-prefix-t');
      return;
    }

    navHowIWork.setAttribute('href', clarityHref);

    if (u >= end) {
      navHowIWork.removeAttribute('aria-label');
      navHowIWork.style.setProperty('--nav-prefix-t', '1');
      return;
    }

    navHowIWork.setAttribute('aria-label', 'How I Work');
    navHowIWork.style.setProperty('--nav-prefix-t', String((u - start) / range));
  }

  function syncNavModeFlags(u = currentU) {
    body.classList.toggle('is-nav-simplified', isResting || u >= 0.55);
  }

  function syncNavItems(u) {
    navFadeLinks.forEach((link) => setFragOpacity(link, u));
    syncNavMorph(u);
    syncNavModeFlags(u);
  }

  function syncJourneyChrome(u) {
    syncEyebrowSkills(u);
    syncNavItems(u);
  }

  function getHeadlineLineCount(el) {
    const style = getComputedStyle(el);
    const lineHeight = parseFloat(style.lineHeight);
    if (!lineHeight) return 1;
    return Math.max(1, Math.round(el.offsetHeight / lineHeight));
  }

  function applyHeadlineTypography(fontPx, lineHeightRatio) {
    root.style.setProperty('--headline-font-size', `${fontPx}px`);
    root.style.setProperty('--headline-line-height', String(lineHeightRatio));
  }

  function setHeadlineGrowFromFont(fontPx) {
    if (!headlineBaseline) return;

    let grow;
    if (currentU >= FREE_GROW_START && headlineBaseline.stage4StartPx != null) {
      const span = headlineBaseline.maxFontPx - headlineBaseline.stage4StartPx;
      grow = span > 0 ? (fontPx - headlineBaseline.stage4StartPx) / span : 0;
    } else {
      const span = headlineBaseline.maxFontPx - headlineBaseline.baseFontPx;
      grow = span > 0 ? (fontPx - headlineBaseline.baseFontPx) / span : 0;
    }

    root.style.setProperty('--headline-grow', Math.max(0, Math.min(1, grow)).toFixed(3));
  }

  function withNaturalHeadlineHeight(fn) {
    headline.style.minHeight = '0';
    const result = fn();
    headline.style.minHeight = '';
    return result;
  }

  function measureHeadlineAt(fontPx, lineHeightRatio) {
    applyHeadlineTypography(fontPx, lineHeightRatio);
    void headline.offsetHeight;

    return withNaturalHeadlineHeight(() => ({
      height: headline.offsetHeight,
      lines: getHeadlineLineCount(headline),
    }));
  }

  function readRestTitleMetrics() {
    const tmp = document.createElement('span');
    tmp.style.cssText =
      'position:absolute;visibility:hidden;display:block;pointer-events:none;' +
      'font-family:var(--font-serif);font-weight:500;' +
      'font-size:var(--cx-rest-title-size);line-height:var(--cx-rest-title-lh);letter-spacing:-0.02em;';
    body.appendChild(tmp);
    const cs = getComputedStyle(tmp);
    const fontPx = parseFloat(cs.fontSize);
    const metrics = {
      fontPx,
      lineHeight: parseFloat(cs.lineHeight) / fontPx,
    };
    body.removeChild(tmp);
    return metrics;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInCubic(t) {
    return t * t * t;
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  function lerpLineHeight(fontPx, fromPx, fromLh, toPx, toLh) {
    if (toPx === fromPx) return fromLh;
    const t = (fontPx - fromPx) / (toPx - fromPx);
    return fromLh + t * (toLh - fromLh);
  }

  function computeRestMorph(u) {
    return easeInOutCubic(clamp01((u - REST_MORPH_START) / (REST_MORPH_END - REST_MORPH_START)));
  }

  function computeFreeGrowState(u, stage4StartPx, maxFontPx, stage4StartLh, restLineHeight) {
    const midTargetPx = stage4StartPx + (maxFontPx - stage4StartPx) * SURGE_SIZE_RATIO;
    const midTargetLh = stage4StartLh + (restLineHeight - stage4StartLh) * SURGE_SIZE_RATIO;

    if (u <= FREE_GROW_SURGE_END) {
      const raw = clamp01((u - FREE_GROW_START) / (FREE_GROW_SURGE_END - FREE_GROW_START));
      const surge = easeOutCubic(raw);
      return {
        fontPx: stage4StartPx + surge * (midTargetPx - stage4StartPx),
        lineHeight: stage4StartLh + surge * (midTargetLh - stage4StartLh),
        morph: computeRestMorph(u),
      };
    }

    const raw = clamp01((u - FREE_GROW_SURGE_END) / (FREE_GROW_END - FREE_GROW_SURGE_END));
    const tail = easeInCubic(raw);
    return {
      fontPx: midTargetPx + tail * (maxFontPx - midTargetPx),
      lineHeight: midTargetLh + tail * (restLineHeight - midTargetLh),
      morph: computeRestMorph(u),
    };
  }

  function getLayoutStyles() {
    return LAYOUT_LOCK_ENABLED ? getComputedStyle(body) : getComputedStyle(root);
  }

  function measureCompactSliderHeight() {
    const slider = document.querySelector('.cx-slider');
    if (!slider) return 0;

    const savedU = currentU;
    root.style.setProperty('--u', '1');
    const height = slider.offsetHeight;
    root.style.setProperty('--u', String(savedU));
    root.style.setProperty('--cx-layout-control-h-compact', `${height}px`);
    return height;
  }

  function captureLayoutZones() {
    if (!LAYOUT_LOCK_ENABLED) return;

    const layout = getLayoutStyles();
    const contentEl = document.querySelector('.cx-hero__content');
    const gapRaw = layout.getPropertyValue('--cx-layout-content-gap').trim();
    const contentTopRaw = layout.getPropertyValue('--cx-layout-hero-content-top').trim();
    const heroPadBottomRaw = layout.getPropertyValue('--cx-layout-hero-pad-bottom').trim();
    const rootPx = parseFloat(getComputedStyle(root).fontSize) || 16;
    const toPx = (raw) => (raw.endsWith('rem') ? parseFloat(raw) * rootPx : parseFloat(raw) || 0);
    const gap = gapRaw ? toPx(gapRaw) : 20;
    const contentTop = contentTopRaw ? toPx(contentTopRaw) : 0;
    const heroPadBottom = heroPadBottomRaw ? toPx(heroPadBottomRaw) : toPx('1.5rem');
    const bonusRaw = layout.getPropertyValue('--cx-layout-headline-zone-bonus').trim();
    const bonus = bonusRaw ? toPx(bonusRaw) : 0;
    const eyebrowSlotRaw = layout.getPropertyValue('--cx-layout-eyebrow-slot').trim();
    let eyebrowSlot = eyebrowSlotRaw ? toPx(eyebrowSlotRaw) : 0;
    if (!eyebrowSlot) {
      const eyebrowEl = document.querySelector('.cx-hero__eyebrow');
      const reservedRaw = root.style.getPropertyValue('--cx-eyebrow-reserved-height').trim();
      if (reservedRaw && eyebrowEl) {
        eyebrowSlot = Math.ceil(
          toPx(reservedRaw)
          + parseFloat(getComputedStyle(eyebrowEl).marginBottom || 0)
        );
        root.style.setProperty('--cx-layout-eyebrow-slot', `${eyebrowSlot}px`);
      } else if (eyebrowEl) {
        eyebrowSlot = Math.ceil(
          eyebrowEl.getBoundingClientRect().height
          + parseFloat(getComputedStyle(eyebrowEl).marginBottom || 0)
        );
        root.style.setProperty('--cx-layout-eyebrow-slot', `${eyebrowSlot}px`);
      }
    }
    const compactControlH = measureCompactSliderHeight();
    const contentH = contentEl?.offsetHeight ?? 0;
    const sliderTopInContent = contentH - heroPadBottom - compactControlH;
    const zoneH = Math.max(120, sliderTopInContent - contentTop - gap + bonus);
    const titleZoneH = Math.max(80, zoneH - eyebrowSlot);

    root.style.setProperty('--cx-headline-zone-height', `${zoneH}px`);
    root.style.setProperty('--cx-headline-title-max-height', `${titleZoneH}px`);

    if (headlineBaseline) {
      headlineBaseline.zoneHeight = zoneH;
      headlineBaseline.titleZoneHeight = titleZoneH;
    }
  }

  function syncHeadlineFragments(u) {
    headlineFrags.forEach((frag) => setFragOpacity(frag, u));

    if (fragVerbIng) {
      if (u < 0.14) {
        fragVerbIng.classList.remove('is-faded');
        fragVerbIng.style.opacity = '';
      } else {
        fragVerbIng.classList.add('is-faded');
        fragVerbIng.style.opacity = '0';
      }
    }

    fragS2To?.classList.toggle('is-visible', u >= 0.14);
    fragVerbPlain?.classList.toggle('is-visible', u >= 0.14);
    fragPrefixI?.classList.toggle('is-visible', u >= 0.52);
    fragProtoAnd?.classList.toggle('is-visible', u >= 0.36);
    headline?.classList.toggle('is-final-phrase', u >= 0.78);
  }

  function measureHeadlineAtStage(u, fontPx, lineHeightRatio) {
    const savedU = currentU;
    syncHeadlineFragments(u);
    const result = measureHeadlineAt(fontPx, lineHeightRatio);
    syncHeadlineFragments(savedU);
    return result;
  }

  function computeZoneMaxFont(zoneHeight) {
    if (!headlineBaseline || !headline || zoneHeight <= 0) {
      return headlineBaseline?.restUncappedMaxPx ?? headlineBaseline?.maxFontPx ?? 0;
    }

    const { baseFontPx, baseLineHeight, restLineHeight, restUncappedMaxPx } = headlineBaseline;
    let lo = baseFontPx;
    let hi = restUncappedMaxPx;
    let best = baseFontPx;

    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      const lh = lerpLineHeight(mid, baseFontPx, baseLineHeight, restUncappedMaxPx, restLineHeight);
      const measured = measureHeadlineAtStage(0.88, mid, lh);

      if (measured.height <= zoneHeight + 0.5) {
        best = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }

    return Math.min(restUncappedMaxPx, best);
  }

  function captureSliderAnchor() {
    const sliderEl = document.querySelector('.cx-slider');
    if (!sliderEl || sliderAnchorY != null) return;
    sliderAnchorY = Math.round(sliderEl.getBoundingClientRect().y);
  }

  let layoutDebugEnabled = false;
  let sliderAnchorY = null;
  let layoutDebugPanel = null;
  const layoutDebugGuides = {};

  function initLayoutDebug() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') !== 'layout') return;

    layoutDebugEnabled = true;
    body.classList.add('has-layout-debug');

    layoutDebugPanel = document.createElement('aside');
    layoutDebugPanel.className = 'cx-layout-debug';
    layoutDebugPanel.setAttribute('aria-hidden', 'true');
    layoutDebugPanel.innerHTML = [
      '<p class="cx-layout-debug__title">Layout debug</p>',
      '<dl>',
      '<dt>u</dt><dd data-d="u">—</dd>',
      '<dt>Font</dt><dd data-d="font">—</dd>',
      '<dt>Stack H</dt><dd data-d="stack-h">—</dd>',
      '<dt>Target stack</dt><dd data-d="stack-target">—</dd>',
      '<dt>Control Y</dt><dd data-d="control-y">—</dd>',
      '<dt>Target control</dt><dd data-d="control-target">—</dd>',
      '<dt>Zone H</dt><dd data-d="zone-h">—</dd>',
      '<dt>Slot H</dt><dd data-d="slot">—</dd>',
      '<dt>Headline H</dt><dd data-d="headline-h">—</dd>',
      '<dt>Hero H</dt><dd data-d="hero-h">—</dd>',
      '<dt>Content H</dt><dd data-d="content-h">—</dd>',
      '<dt>Slider Y</dt><dd data-d="slider-y">—</dd>',
      '<dt>Δ slider</dt><dd data-d="slider-d">—</dd>',
      '<dt>Morph</dt><dd data-d="morph">—</dd>',
      '<dt>Portrait</dt><dd data-d="portrait">—</dd>',
      '<dt>Phase</dt><dd data-d="phase">—</dd>',
      '</dl>',
    ].join('');
    body.appendChild(layoutDebugPanel);

    ['anchor', 'slider', 'slot'].forEach((name) => {
      const guide = document.createElement('div');
      guide.className = `cx-layout-debug__guide cx-layout-debug__guide--${name}`;
      guide.dataset.guide = name;
      body.appendChild(guide);
      layoutDebugGuides[name] = guide;
    });
  }

  function updateLayoutDebug() {
    if (!layoutDebugEnabled || !layoutDebugPanel) return;

    const sliderEl = document.querySelector('.cx-slider');
    const heroEl = document.querySelector('.cx-hero');
    const contentEl = document.querySelector('.cx-hero__content');
    const headlineEl = isResting
      ? document.querySelector('.cx-hero__title-clarity')
      : headline;
    if (!headlineEl) return;

    if (sliderAnchorY == null && sliderEl) {
      sliderAnchorY = Math.round(sliderEl.getBoundingClientRect().y);
    }

    const sliderY = sliderEl ? Math.round(sliderEl.getBoundingClientRect().y) : 0;
    const delta = sliderY - sliderAnchorY;
    const slotH = getComputedStyle(document.documentElement).getPropertyValue('--headline-slot-height').trim();
    const morph = getComputedStyle(document.documentElement).getPropertyValue('--headline-morph').trim();
    const portrait = getComputedStyle(document.documentElement).getPropertyValue('--portrait-shrink').trim();
    const fontPx = Math.round(parseFloat(getComputedStyle(headlineEl).fontSize));
    const headlineH = Math.round(headlineEl.getBoundingClientRect().height);
    const heroH = heroEl ? Math.round(heroEl.getBoundingClientRect().height) : 0;
    const contentH = contentEl ? Math.round(contentEl.getBoundingClientRect().height) : 0;

    const stackTarget = getLayoutStyles().getPropertyValue('--cx-layout-stack-h').trim();
    const controlTarget = getLayoutStyles().getPropertyValue('--cx-layout-control-y').trim();
    const zoneH = getLayoutStyles().getPropertyValue('--cx-headline-zone-height').trim();
    const headerEl = document.querySelector('.cx-header.site-header');
    const headerH = headerEl ? Math.round(headerEl.getBoundingClientRect().height) : 0;
    const stackH = headerH + heroH;
    const controlEl = (() => {
      const block = document.querySelector('.cx-hero__slider-block');
      if (block?.offsetHeight) return block;
      const slider = document.querySelector('.cx-slider');
      const panel = document.querySelector('.cx-rest-panel');
      if (slider?.offsetHeight) return slider;
      if (panel?.offsetHeight) return panel;
      return block || slider || panel;
    })();
    const controlY = controlEl ? Math.round(controlEl.getBoundingClientRect().y) : 0;

    let phase = getKeyframePhase(currentU);

    const set = (key, value, className) => {
      const el = layoutDebugPanel.querySelector(`[data-d="${key}"]`);
      if (!el) return;
      el.textContent = value;
      if (className) {
        el.classList.remove(
          'cx-layout-debug__delta--ok',
          'cx-layout-debug__delta--warn',
          'cx-layout-debug__delta--bad'
        );
        el.classList.add(className);
      }
    };

    set('u', `${Math.round(currentU * 100)}%`);
    set('font', `${fontPx}px`);
    set('headline-h', `${headlineH}px`);
    set('slot', slotH || 'auto');
    set('stack-h', `${stackH}px`);
    set('stack-target', stackTarget || '—');
    set('control-y', `${controlY}px`);
    set('control-target', controlTarget || '—');
    set('zone-h', zoneH || '—');
    set('hero-h', `${heroH}px`);
    set('content-h', `${contentH}px`);
    set('slider-y', `${sliderY}px`);
    set(
      'slider-d',
      `${delta >= 0 ? '+' : ''}${delta}px`,
      Math.abs(delta) <= 8 ? 'cx-layout-debug__delta--ok'
        : Math.abs(delta) <= 24 ? 'cx-layout-debug__delta--warn'
          : 'cx-layout-debug__delta--bad'
    );
    set('morph', morph || '0');
    set('portrait', portrait);
    set('phase', phase);

    if (layoutDebugGuides.anchor) {
      layoutDebugGuides.anchor.style.top = `${sliderAnchorY}px`;
    }
    if (layoutDebugGuides.slider) {
      layoutDebugGuides.slider.style.top = `${sliderY}px`;
    }
    if (layoutDebugGuides.slot) {
      const slotRect = headlineEl.getBoundingClientRect();
      Object.assign(layoutDebugGuides.slot.style, {
        top: `${Math.round(slotRect.y)}px`,
        left: `${Math.round(slotRect.x)}px`,
        width: `${Math.round(slotRect.width)}px`,
        height: `${Math.round(slotRect.height)}px`,
      });
    }
  }

  /* ——— Font keyframe curve (production + ?tune=1) ——— */
  const FONT_KEYFRAMES = [
    { u: 0, font: 24, note: 'Full complexity opening' },
    { u: 26, font: 32, note: 'After first lines fade — stay small' },
    { u: 41, font: 40, note: 'Stage 3 verb swap' },
    { u: 52, font: 50, note: 'Stage 4: I translate complex…' },
    { u: 68, font: 64, note: 'Mid growth' },
    { u: 86, font: 82, note: 'Stage 5 word fades' },
    { u: 100, font: 95, note: 'Rest headline size' },
  ];

  function getKeyframePhase(u) {
    if (TUNE_ENABLED && !tuneUsePreview) {
      if (u < FREE_GROW_START) return 'line-budget';
      if (u < FREE_GROW_SURGE_END) return 'surge';
      if (u < REST_MORPH_START) return 'tail';
      return 'rest-morph';
    }

    const pct = Math.round(u * 100);
    if (pct < 26) return 'stage 1';
    if (pct < 41) return 'stage 2 proto';
    if (pct < 52) return 'stage 3 verb';
    if (pct < 68) return 'stage 4 long';
    if (pct < 86) return 'tail / morph';
    if (pct < 100) return 'grow →95';
    return 'rest';
  }

  let tuneKeyframes = [];
  let tuneUsePreview = true;
  let tunePanel = null;
  let tuneCopyStatus = null;

  function loadTuneKeyframes() {
    try {
      const raw = localStorage.getItem(TUNE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          tuneKeyframes = parsed
            .map((k) => ({
              u: Math.round(Number(k.u)),
              font: Math.round(Number(k.font)),
              note: String(k.note || ''),
            }))
            .sort((a, b) => a.u - b.u);
          return;
        }
      }
    } catch (_) { /* ignore */ }
    tuneKeyframes = FONT_KEYFRAMES.map((k) => ({ ...k }));
  }

  function saveTuneKeyframes() {
    try {
      localStorage.setItem(TUNE_STORAGE_KEY, JSON.stringify(tuneKeyframes));
    } catch (_) { /* ignore */ }
  }

  function getTunePhaseLabel(uPct) {
    const u = uPct / 100;
    if (u < 0.14) return 'stage 1';
    if (u < 0.30) return 'stage 2 proto';
    if (u < 0.52) return 'stage 3 verb';
    if (u < 0.70) return 'stage 4 long';
    if (u < 0.86) return 'stage 5 fade';
    if (u < 1) return 'tail / morph';
    return 'rest';
  }

  function getHeadlineSnippet(maxLen = 48) {
    if (!headline) return '';
    const text = headline.textContent.replace(/\s+/g, ' ').trim();
    return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
  }

  function interpolateFontKeyframes(frames, u) {
    if (!frames?.length) return 24;
    const pct = u * 100;
    const sorted = [...frames].sort((a, b) => a.u - b.u);

    if (pct <= sorted[0].u) return sorted[0].font;
    if (pct >= sorted[sorted.length - 1].u) return sorted[sorted.length - 1].font;

    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i];
      const b = sorted[i + 1];
      if (pct >= a.u && pct <= b.u) {
        const t = b.u === a.u ? 0 : (pct - a.u) / (b.u - a.u);
        return a.font + t * (b.font - a.font);
      }
    }

    return sorted[sorted.length - 1].font;
  }

  function applyKeyframeFont(u, frames) {
    if (!headline) return;

    if (!headlineBaseline) {
      captureHeadlineBaseline();
      if (!headlineBaseline) return;
    }

    const fontPx = interpolateFontKeyframes(frames, u);
    const { baseFontPx, baseLineHeight, restUncappedMaxPx, maxFontPx, restLineHeight } = headlineBaseline;
    const maxPx = restUncappedMaxPx || maxFontPx;
    const lineHeight = lerpLineHeight(fontPx, baseFontPx, baseLineHeight, maxPx, restLineHeight);
    const morph = computeRestMorph(u);

    root.style.setProperty('--headline-morph', morph.toFixed(3));
    applyHeadlineTypography(fontPx, lineHeight);
    setHeadlineGrowFromTuneFont(fontPx);
    if (TUNE_ENABLED) updateTunePanelLive();
  }

  function applyTuneFont(u) {
    applyKeyframeFont(u, tuneKeyframes);
  }

  function setHeadlineGrowFromTuneFont(fontPx) {
    if (!headlineBaseline) return;
    const { baseFontPx, maxFontPx, restUncappedMaxPx } = headlineBaseline;
    const maxPx = restUncappedMaxPx || maxFontPx;
    const span = maxPx - baseFontPx;
    const grow = span > 0 ? (fontPx - baseFontPx) / span : 0;
    root.style.setProperty('--headline-grow', Math.max(0, Math.min(1, grow)).toFixed(3));
  }

  function buildTuneExportJson() {
    return JSON.stringify(
      tuneKeyframes.map((k) => ({ u: k.u, font: k.font, note: k.note })),
      null,
      2
    );
  }

  function buildTuneExportMarkdown() {
    const savedU = currentU;
    const lines = [
      '| u | phase | font (px) | copy (approx) | notes |',
      '|---|-------|-----------|---------------|-------|',
    ];

    tuneKeyframes.forEach((k) => {
      const u = k.u / 100;
      syncHeadlineFragments(u);
      applyTuneFont(u);
      lines.push(
        `| ${k.u} | ${getTunePhaseLabel(k.u)} | ${k.font} | ${getHeadlineSnippet(40)} | ${k.note || '—'} |`
      );
    });

    syncHeadlineFragments(savedU);
    if (tuneUsePreview) {
      applyTuneFont(savedU);
    } else {
      updateHeadlineLayout(savedU);
    }

    return lines.join('\n');
  }

  function renderTuneRows() {
    if (!tunePanel) return;
    const container = tunePanel.querySelector('.cx-font-tune__rows');
    if (!container) return;

    container.innerHTML = tuneKeyframes
      .map(
        (k, index) => `
        <div class="cx-font-tune__row" data-index="${index}">
          <label>${k.u}%</label>
          <button type="button" class="cx-font-tune__btn cx-font-tune__btn--ghost cx-font-tune__btn--jump">Go</button>
          <input type="number" min="12" max="120" step="1" data-field="font" value="${k.font}" aria-label="Font at ${k.u}%">
          <input type="text" data-field="note" value="${k.note.replace(/"/g, '&quot;')}" placeholder="notes" aria-label="Notes at ${k.u}%">
          <button type="button" class="cx-font-tune__btn cx-font-tune__btn--capture" title="Use live font at this u">Cap</button>
        </div>`
      )
      .join('');

    container.querySelectorAll('.cx-font-tune__row').forEach((row) => {
      const index = Number(row.dataset.index);
      const fontInput = row.querySelector('[data-field="font"]');
      const noteInput = row.querySelector('[data-field="note"]');

      row.querySelector('.cx-font-tune__btn--jump')?.addEventListener('click', () => {
        setClarity(tuneKeyframes[index].u);
      });

      row.querySelector('.cx-font-tune__btn--capture')?.addEventListener('click', () => {
        setClarity(tuneKeyframes[index].u);
        requestAnimationFrame(() => {
          if (!headline) return;
          const live = Math.round(parseFloat(getComputedStyle(headline).fontSize));
          fontInput.value = String(live);
          tuneKeyframes[index].font = live;
          saveTuneKeyframes();
          if (tuneUsePreview) applyTuneFont(currentU);
          updateTunePanelLive();
        });
      });

      fontInput?.addEventListener('change', () => {
        tuneKeyframes[index].font = Math.round(parseFloat(fontInput.value) || tuneKeyframes[index].font);
        saveTuneKeyframes();
        if (tuneUsePreview) {
          resetHeadlineBaseline();
          applyTuneFont(currentU);
        }
        updateTunePanelLive();
      });

      noteInput?.addEventListener('change', () => {
        tuneKeyframes[index].note = noteInput.value.trim();
        saveTuneKeyframes();
      });
    });
  }

  function updateTunePanelLive() {
    if (!tunePanel || isResting || !headline) return;

    const liveEl = tunePanel.querySelector('[data-tune-live]');
    if (!liveEl) return;

    const livePx = Math.round(parseFloat(getComputedStyle(headline).fontSize));
    const previewFrames = tuneUsePreview ? tuneKeyframes : FONT_KEYFRAMES;
    const targetPx = Math.round(interpolateFontKeyframes(previewFrames, currentU));
    const mode = tuneUsePreview ? 'keyframe preview' : 'legacy algorithm';

    liveEl.innerHTML = [
      `<strong>u</strong> ${Math.round(currentU * 100)}%`,
      `<strong>live</strong> ${livePx}px`,
      `<strong>curve</strong> ${targetPx}px`,
      `<strong>mode</strong> ${mode}`,
    ].join(' · ');
  }

  function initTunePanel() {
    if (!TUNE_ENABLED) return;

    loadTuneKeyframes();
    body.classList.add('has-font-tune');

    tunePanel = document.createElement('aside');
    tunePanel.className = 'cx-font-tune';
    tunePanel.setAttribute('aria-label', 'Font keyframe tuner');
    tunePanel.innerHTML = [
      '<p class="cx-font-tune__title">Font keyframe tuner</p>',
      '<p class="cx-font-tune__hint">Production uses the keyframe table. Toggle preview to edit; turn off to compare the legacy line-budget algorithm.</p>',
      '<p class="cx-font-tune__live" data-tune-live>—</p>',
      '<label class="cx-font-tune__toggle"><input type="checkbox" data-tune-preview checked> Preview edited keyframes (off = legacy algorithm)</label>',
      '<div class="cx-font-tune__rows"></div>',
      '<div class="cx-font-tune__actions">',
      '<button type="button" class="cx-font-tune__btn" data-tune-add>Add @ slider</button>',
      '<button type="button" class="cx-font-tune__btn" data-tune-reset>Reset defaults</button>',
      '<button type="button" class="cx-font-tune__btn" data-tune-copy-json>Copy JSON</button>',
      '<button type="button" class="cx-font-tune__btn" data-tune-copy-md>Copy table</button>',
      '</div>',
      '<p class="cx-font-tune__copy-status" data-tune-status></p>',
    ].join('');
    body.appendChild(tunePanel);

    tuneCopyStatus = tunePanel.querySelector('[data-tune-status]');
    const previewToggle = tunePanel.querySelector('[data-tune-preview]');
    previewToggle.checked = tuneUsePreview;

    previewToggle.addEventListener('change', () => {
      tuneUsePreview = previewToggle.checked;
      resetHeadlineBaseline();
      updateHeadlineFragments(currentU);
      updateTunePanelLive();
    });

    tunePanel.querySelector('[data-tune-add]')?.addEventListener('click', () => {
      const u = Math.round(currentU * 100);
      const font = headline
        ? Math.round(parseFloat(getComputedStyle(headline).fontSize))
        : 24;
      const existing = tuneKeyframes.findIndex((k) => k.u === u);
      const entry = { u, font, note: getTunePhaseLabel(u) };

      if (existing >= 0) {
        tuneKeyframes[existing] = entry;
      } else {
        tuneKeyframes.push(entry);
        tuneKeyframes.sort((a, b) => a.u - b.u);
      }

      saveTuneKeyframes();
      renderTuneRows();
      updateTunePanelLive();
    });

    tunePanel.querySelector('[data-tune-reset]')?.addEventListener('click', () => {
      tuneKeyframes = FONT_KEYFRAMES.map((k) => ({ ...k }));
      saveTuneKeyframes();
      renderTuneRows();
      resetHeadlineBaseline();
      updateHeadlineFragments(currentU);
    });

    async function copyText(text, label) {
      try {
        await navigator.clipboard.writeText(text);
        if (tuneCopyStatus) tuneCopyStatus.textContent = `${label} copied — paste into chat.`;
      } catch (_) {
        if (tuneCopyStatus) tuneCopyStatus.textContent = 'Copy failed — use window.getTuneExport() in console.';
      }
    }

    tunePanel.querySelector('[data-tune-copy-json]')?.addEventListener('click', () => {
      renderTuneRows();
      copyText(buildTuneExportJson(), 'JSON');
    });

    tunePanel.querySelector('[data-tune-copy-md]')?.addEventListener('click', () => {
      renderTuneRows();
      copyText(buildTuneExportMarkdown(), 'Markdown table');
    });

    renderTuneRows();
    updateTunePanelLive();
  }

  function captureLayoutSlots(stage4StartPx, stage4StartLh) {
    if (!headlineBaseline || headlineBaseline.slotCaptured) return;

    if (LAYOUT_LOCK_ENABLED) {
      headlineBaseline.slotCaptured = true;
      return;
    }

    const { budgetHeight } = headlineBaseline;
    const stage4Height = measureHeadlineAt(stage4StartPx, stage4StartLh).height;
    const maxHeadlineH = Math.max(budgetHeight, stage4Height);

    headlineBaseline.slotHeight = maxHeadlineH;
    headlineBaseline.stage4StartPx = stage4StartPx;
    headlineBaseline.stage4StartLh = stage4StartLh;
    headlineBaseline.slotCaptured = true;
    root.style.setProperty('--headline-slot-height', `${maxHeadlineH}px`);
  }

  function projectStage4Layout() {
    if (!headline || !headlineBaseline || headlineBaseline.slotCaptured) return;

    updateHeadlineFragments(FREE_GROW_START);

    const preStage4Px = parseFloat(getComputedStyle(headline).fontSize);
    const preStage4Lh = parseFloat(getComputedStyle(headline).lineHeight) / preStage4Px;
    const { maxFontPx, restLineHeight } = headlineBaseline;
    const stage4StartPx = computeStage4StartFont(preStage4Px);
    const stage4StartLh = lerpLineHeight(
      stage4StartPx,
      preStage4Px,
      preStage4Lh,
      maxFontPx,
      restLineHeight
    );

    captureLayoutSlots(stage4StartPx, stage4StartLh);
    updateHeadlineFragments(currentU);
  }

  function computeStage4StartFont(fromPx) {
    /* Continue line-budget size for stage-4 copy; no floor jump or max-font search */
    return computeLineBudgetFont() ?? fromPx;
  }

  function captureHeadlineBaseline() {
    if (!headline || headlineBaseline || isResting) return;

    const style = getComputedStyle(headline);
    const baseFontPx = parseFloat(style.fontSize);
    const baseLineHeight = parseFloat(style.lineHeight) / baseFontPx;
    const start = measureHeadlineAt(baseFontPx, baseLineHeight);
    const restTarget = readRestTitleMetrics();

    headlineBaseline = {
      budgetHeight: start.height,
      startLines: start.lines,
      baseFontPx,
      baseLineHeight,
      maxFontPx: restTarget.fontPx,
      restUncappedMaxPx: restTarget.fontPx,
      restLineHeight: restTarget.lineHeight,
      restTarget,
    };

    captureLayoutZones();
    root.style.setProperty('--headline-budget-height', `${headlineBaseline.budgetHeight}px`);

    applyHeadlineTypography(baseFontPx, baseLineHeight);
    setHeadlineGrowFromTuneFont(baseFontPx);
  }

  function resetHeadlineBaseline() {
    headlineBaseline = null;
    sliderAnchorY = null;
    resetVennMetrics();
    root.style.removeProperty('--headline-budget-height');
    root.style.removeProperty('--headline-slot-height');
    root.style.removeProperty('--headline-font-size');
    root.style.removeProperty('--headline-line-height');
    root.style.setProperty('--headline-grow', '0');
    root.style.setProperty('--headline-morph', '0');
    root.style.setProperty('--headline-free-grow', '0');
    if (headline) headline.style.minHeight = '';
  }

  function refreshJourneyLayout() {
    if (isResting) return;

    root.style.removeProperty('--cx-eyebrow-reserved-height');
    root.style.removeProperty('--cx-layout-eyebrow-slot');

    resetHeadlineBaseline();
    captureEyebrowReservedHeight();
    captureVennSlotWidth();
    captureHeadlineBaseline();
    captureLayoutZones();

    const u = currentU;
    syncJourneyMotionVars(u);
    updateHeadlineLayout(u);
    updateHeadlineFragments(u);
    syncJourneyChrome(u);
    updateChaosWidgets(u);

    if (slideHint) {
      slideHint.style.visibility = u > 0.12 ? 'hidden' : '';
    }

    if (TUNE_ENABLED) updateTunePanelLive();
    if (currentU >= 0.995) maybeScheduleRestEnter();
    else clearRestEnterTimer();
  }

  let journeyResizeTimer = null;

  function resetVennMetrics() {
    vennSlotPx = null;
    root.style.removeProperty('--venn-slot-px');
    root.style.setProperty('--venn-space', '0');
    root.style.setProperty('--venn-slide', '0');
    root.style.setProperty('--venn-exit', '0');
  }

  let vennSlotPx = null;

  function captureVennSlotWidth() {
    if (isResting) return;

    const vennEl = document.querySelector('.cx-hero__venn');
    const row = vennEl?.closest('.cx-hero__headline-row');
    if (!vennEl || !row) return;

    const vennStyle = getComputedStyle(vennEl);
    if (vennStyle.display === 'none' || vennStyle.visibility === 'hidden') {
      vennSlotPx = 0;
      root.style.setProperty('--venn-slot-px', '0px');
      return;
    }

    if (vennSlotPx != null && vennSlotPx > 0) return;

    const rootPx = parseFloat(getComputedStyle(root).fontSize) || 16;
    const liftPx = parseFloat(
      getComputedStyle(root).getPropertyValue('--cx-hero-lift')
    ) || 70;
    const vennScale = parseFloat(
      getComputedStyle(body).getPropertyValue('--cx-venn-slot-scale')
    ) || 1;
    const rowW = row.getBoundingClientRect().width;
    const w = Math.ceil(Math.min(
      18.75 * rootPx,
      rowW * 0.48,
      28 * rootPx - liftPx * 0.55
    ) * vennScale);

    if (w < 80 || w > 520) return;
    vennSlotPx = w;
    root.style.setProperty('--venn-slot-px', `${w}px`);
  }

  const FREE_GROW_START = 0.52;
  const FREE_GROW_SURGE_END = 0.78;
  const FREE_GROW_END = 1;
  const SURGE_SIZE_RATIO = 0.52;
  const REST_MORPH_START = 0.9;
  const REST_MORPH_END = 1;

  /* Venn exit timing — single source of truth (CSS reads --venn-slide / --venn-space from JS) */
  const VENN_EXIT_START = 0;
  const VENN_EXIT_END = 0.62;
  const VENN_SLIDE_VW = 48;

  function syncJourneyMotionVars(u) {
    if (!isResting && u <= VENN_EXIT_START + 0.001) captureVennSlotWidth();

    const vennExit = clamp01((u - VENN_EXIT_START) / (VENN_EXIT_END - VENN_EXIT_START));

    root.style.setProperty('--u', u);
    root.style.setProperty('--venn-exit', vennExit.toFixed(4));
    root.style.setProperty('--venn-space', vennExit.toFixed(4));
    root.style.setProperty('--venn-slide', `${(vennExit * VENN_SLIDE_VW).toFixed(2)}vw`);
  }

  function computeLineBudgetFont() {
    if (!headlineBaseline || !headline) return null;

    const { budgetHeight, startLines, baseFontPx, baseLineHeight, maxFontPx } = headlineBaseline;
    const atBase = measureHeadlineAt(baseFontPx, baseLineHeight);

    if (atBase.lines >= startLines) {
      return baseFontPx;
    }

    let lo = baseFontPx;
    let hi = maxFontPx;
    let best = baseFontPx;

    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      const measured = measureHeadlineAt(mid, baseLineHeight);

      if (measured.height <= budgetHeight + 0.5) {
        best = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }

    return best;
  }

  function applyLegacyHeadlineLayout(u) {
    if (LAYOUT_LOCK_ENABLED && u >= FREE_GROW_START && headlineBaseline.titleZoneHeight) {
      root.style.setProperty('--headline-slot-height', `${headlineBaseline.titleZoneHeight}px`);
    } else if (LAYOUT_LOCK_ENABLED) {
      root.style.setProperty('--headline-slot-height', `${headlineBaseline.budgetHeight}px`);
    }

    const { baseFontPx, baseLineHeight, maxFontPx, restLineHeight } = headlineBaseline;

    if (u < FREE_GROW_START) {
      headlineBaseline.stage4StartPx = null;
      headlineBaseline.stage4StartLh = null;
    }

    if (u >= FREE_GROW_START) {
      if (headlineBaseline.stage4StartPx == null) {
        const currentStyle = getComputedStyle(headline);
        const preStage4Px = parseFloat(currentStyle.fontSize);
        const preStage4Lh = parseFloat(currentStyle.lineHeight) / preStage4Px;

        headlineBaseline.stage4StartPx = computeStage4StartFont(preStage4Px);
        headlineBaseline.stage4StartLh = lerpLineHeight(
          headlineBaseline.stage4StartPx,
          preStage4Px,
          preStage4Lh,
          maxFontPx,
          restLineHeight
        );

        if (!headlineBaseline.slotCaptured) {
          captureLayoutSlots(headlineBaseline.stage4StartPx, headlineBaseline.stage4StartLh);
        }
      }

      const { fontPx, lineHeight, morph } = computeFreeGrowState(
        u,
        headlineBaseline.stage4StartPx,
        maxFontPx,
        headlineBaseline.stage4StartLh,
        restLineHeight
      );

      root.style.setProperty('--headline-morph', morph.toFixed(3));
      applyHeadlineTypography(fontPx, lineHeight);
      setHeadlineGrowFromFont(fontPx);
      return;
    }

    root.style.setProperty('--headline-morph', '0');

    const best = computeLineBudgetFont() ?? baseFontPx;
    applyHeadlineTypography(best, baseLineHeight);
    setHeadlineGrowFromFont(best);
  }

  function updateHeadlineLayout(u = currentU) {
    if (!headline || isResting) return;

    if (!headlineBaseline) {
      captureHeadlineBaseline();
      if (!headlineBaseline) return;
    }

    const freeGrow = u >= FREE_GROW_START
      ? clamp01((u - FREE_GROW_START) / (FREE_GROW_END - FREE_GROW_START))
      : 0;
    root.style.setProperty('--headline-free-grow', freeGrow.toFixed(3));

    if (TUNE_ENABLED && !tuneUsePreview) {
      applyLegacyHeadlineLayout(u);
    } else {
      const frames = (TUNE_ENABLED && tuneUsePreview) ? tuneKeyframes : FONT_KEYFRAMES;
      applyKeyframeFont(u, frames);
    }

    captureSliderAnchor();
    updateLayoutDebug();
  }

  function updateHeadlineFragments(u) {
    syncHeadlineFragments(u);
    requestAnimationFrame(() => updateHeadlineLayout());
  }

  function updateUrgencyProgress(u) {
    if (!URGENCY_BAR_ENABLED) {
      root.style.setProperty('--urgency-progress', '0');
      return;
    }

    if (!chaosUrgency || urgencyPopAt <= 0) return;

    let progress = 0;
    if (u > urgencyPopAt) {
      progress = prefersReduced
        ? 1
        : Math.min(1, (u - urgencyPopAt) / urgencySlideSpan);
    }

    root.style.setProperty('--urgency-progress', String(progress));

    if (progress >= 1) {
      popped.set(chaosUrgency, true);
    } else {
      popped.delete(chaosUrgency);
    }
  }

  function triggerPop(el) {
    if (!el || popped.get(el)) return;
    popped.set(el, true);

    const popType = el.dataset.popType || 'pop';
    if (popType === 'slide') {
      el.classList.add('chaos-slide-off');
    } else if (popType === 'finale') {
      el.classList.add('chaos-pop-finale');
    } else {
      el.classList.add('chaos-pop-out');
    }

    chainPopsAfter(el);
  }

  function chainPopsAfter(anchor) {
    if (!chaosLayer || !anchor.id) return;

    chaosLayer.querySelectorAll(`[data-pop-chain-after="${anchor.id}"]`).forEach((chained) => {
      if (popped.get(chained) || popTimers.has(chained)) return;

      const delay = parseInt(chained.dataset.popDelay || '650', 10);
      const timer = setTimeout(() => {
        popTimers.delete(chained);
        triggerPop(chained);
      }, delay);
      popTimers.set(chained, timer);
    });
  }

  function resetChainedPops(anchor) {
    if (!chaosLayer || !anchor.id) return;

    chaosLayer.querySelectorAll(`[data-pop-chain-after="${anchor.id}"]`).forEach((chained) => {
      resetPop(chained);
    });
  }

  function clearPopTimer(widget) {
    const timer = popTimers.get(widget);
    if (timer) {
      clearTimeout(timer);
      popTimers.delete(widget);
    }
  }

  function schedulePop(widget, at) {
    if (popped.get(widget) || popTimers.has(widget)) return;

    const delay = parseInt(widget.dataset.popDelay || '0', 10);
    if (delay > 0) {
      const timer = setTimeout(() => {
        popTimers.delete(widget);
        if (currentU >= at) triggerPop(widget);
      }, delay);
      popTimers.set(widget, timer);
      return;
    }

    triggerPop(widget);
  }

  function resetPop(el) {
    if (!el) return;
    clearPopTimer(el);
    popped.delete(el);
    el.classList.remove('chaos-pop-out', 'chaos-slide-off', 'chaos-pop-finale');

    /* Clear animation forwards state so slide-off widgets can reappear */
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  }

  function popHysteresis(widget) {
    return widget.dataset.popType === 'slide' ? 0.02 : 0.1;
  }

  function updateChaosWidgets(u) {
    updateUrgencyProgress(u);

    popWidgets.forEach((widget) => {
      if (widget === chaosUrgency || widget.dataset.popChainAfter) return;

      const at = parseFloat(widget.dataset.popAt);
      if (Number.isNaN(at)) return;

      const hysteresis = popHysteresis(widget);

      if (u >= at && !popped.get(widget)) {
        schedulePop(widget, at);
      }

      if (u < at - hysteresis) {
        clearPopTimer(widget);
        if (popped.get(widget)) {
          resetPop(widget);
          resetChainedPops(widget);
        }
      }
    });
  }

  function resetAllPops() {
    popWidgets.forEach((widget) => {
      clearPopTimer(widget);
      if (widget !== chaosUrgency) resetPop(widget);
    });
    popped.clear();
    root.style.setProperty('--urgency-progress', '0');
  }

  function resetToStart() {
    clearRestEnterTimer();
    resetHeadlineBaseline();
    resetAllPops();
    setClarity(0);
  }

  function clearRestEnterTimer() {
    if (restEnterTimer) {
      clearTimeout(restEnterTimer);
      restEnterTimer = null;
    }
  }

  function beginRestTransition() {
    if (isResting || isRestTransitioning || currentU < 0.995) return;
    clearRestEnterTimer();
    isRestTransitioning = true;
    restPanel?.removeAttribute('hidden');
    body.classList.add('is-entering-rest');
    snapshotRestTypography();
    setTimeout(() => {
      body.classList.remove('is-entering-rest');
      enterRestingState();
      isRestTransitioning = false;
    }, REST_FADE_MS);
  }

  function maybeScheduleRestEnter() {
    if (isResting || isRestTransitioning || currentU < 0.995) return;
    clearRestEnterTimer();
    restEnterTimer = setTimeout(() => {
      restEnterTimer = null;
      beginRestTransition();
    }, REST_ENTER_DELAY_MS);
  }

  function maybeRestEnterOnBlur() {
    if (isResting || isRestTransitioning || currentU < 0.995) return;
    clearRestEnterTimer();
    beginRestTransition();
  }

  function setClarity(value) {
    if (isResting) return;

    const u = Math.max(0, Math.min(100, value)) / 100;
    currentU = u;
    syncJourneyMotionVars(u);
    slider.value = Math.round(u * 100);
    slider.setAttribute('aria-valuenow', Math.round(u * 100));

    updateChaosWidgets(u);
    updateHeadlineFragments(u);
    syncJourneyChrome(u);

    if (slideHint) {
      slideHint.style.visibility = u > 0.12 ? 'hidden' : '';
    }

    if (TUNE_ENABLED) updateTunePanelLive();

    if (currentU >= 0.995) maybeScheduleRestEnter();
    else clearRestEnterTimer();
  }

  function snapshotRestTypography() {
    const frames = (TUNE_ENABLED && tuneUsePreview) ? tuneKeyframes : FONT_KEYFRAMES;
    const endFont = interpolateFontKeyframes(frames, 1);

    if (headlineBaseline) {
      const maxPx = headlineBaseline.restUncappedMaxPx || endFont;
      const lh = lerpLineHeight(
        endFont,
        headlineBaseline.baseFontPx,
        headlineBaseline.baseLineHeight,
        maxPx,
        headlineBaseline.restLineHeight
      );
      root.style.setProperty('--cx-rest-title-size', `${endFont}px`);
      root.style.setProperty('--cx-rest-title-lh', String(lh));
      applyHeadlineTypography(endFont, lh);
    } else {
      root.style.setProperty('--cx-rest-title-size', `${endFont}px`);
      applyHeadlineTypography(endFont, 1.08);
    }
  }

  function dismissChaosForResting() {
    root.style.setProperty('--urgency-progress', '1');
    if (chaosLayer) {
      chaosLayer.classList.add('is-gone');
      chaosLayer.setAttribute('aria-hidden', 'true');
    }
    popWidgets.forEach((widget) => {
      clearPopTimer(widget);
      popped.set(widget, true);
    });
  }

  /** Cold load → resting (localStorage / ?direct=1). Layout before is-resting or headline shrinks on refresh. */
  function hydrateRestingFromColdStart() {
    clearRestEnterTimer();
    resetHeadlineBaseline();
    resetAllPops();

    currentU = 1;
    syncJourneyMotionVars(1);
    slider.value = 100;
    slider.setAttribute('aria-valuenow', '100');

    syncHeadlineFragments(1);
    syncJourneyChrome(1);
    dismissChaosForResting();

    if (slideHint) slideHint.style.visibility = 'hidden';
    restPanel?.removeAttribute('hidden');

    captureEyebrowReservedHeight();
    captureHeadlineBaseline();
    captureLayoutZones();

    const frames = (TUNE_ENABLED && tuneUsePreview) ? tuneKeyframes : FONT_KEYFRAMES;
    applyKeyframeFont(1, frames);
    snapshotRestTypography();

    enterRestingState();
  }

  function wantsDirectPortfolio(params) {
    return ['resting', 'direct', 'skip', 'clarity'].some((key) => params.get(key) === '1');
  }

  function enterRestingState() {
    if (isResting) return;
    isResting = true;
    dismissChaosForResting();
    restPanel?.removeAttribute('hidden');
    body.classList.add('is-resting');
    syncNavModeFlags();
    document.title = 'Andrew Sheerin — Product Design Leader';
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch (_) { /* ignore */ }
  }

  function clearSkipEntryClasses() {
    document.documentElement.classList.remove('journey-skip-entry');
    body.classList.remove('journey-skip-entry');
  }

  function exitRestingState() {
    isResting = false;
    isRestTransitioning = false;
    clearRestEnterTimer();
    clearSkipEntryClasses();
    restPanel?.setAttribute('hidden', '');
    body.classList.remove('is-resting', 'is-entering-rest');
    document.title = 'Andrew Sheerin — Complexity → Clarity';
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* ignore */ }

    resetAllPops();
    if (chaosLayer) {
      chaosLayer.classList.remove('is-gone');
      chaosLayer.setAttribute('aria-hidden', 'true');
    }
    setClarity(100);
    syncNavModeFlags();
    slider.focus();
  }

  function initFromQueryOrStorage() {
    const params = new URLSearchParams(window.location.search);

    if (TUNE_ENABLED) {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* ignore */ }
    }

    if (params.get('start') === '1' || TUNE_ENABLED) {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* ignore */ }
      resetToStart();
      return true;
    }

    if (wantsDirectPortfolio(params)) {
      hydrateRestingFromColdStart();
      return true;
    }

    const uParam = params.get('u');
    if (uParam !== null && !Number.isNaN(parseInt(uParam, 10))) {
      setClarity(parseInt(uParam, 10));
      return true;
    }

    try {
      if (localStorage.getItem(STORAGE_KEY) === 'true') {
        hydrateRestingFromColdStart();
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

  slider.addEventListener('blur', () => {
    maybeRestEnterOnBlur();
  });

  restoreBtn?.addEventListener('click', exitRestingState);

  initLayoutDebug();
  initTunePanel();

  document.querySelectorAll('[data-chaos-dead-end]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
    });
  });

  if (!initFromQueryOrStorage()) {
    resetAllPops();
    setClarity(0);
  }

  requestAnimationFrame(() => {
    if (isResting) {
      captureLayoutZones();
      updateLayoutDebug();
      return;
    }
    captureEyebrowReservedHeight();
    captureHeadlineBaseline();
    captureLayoutZones();
    updateHeadlineLayout();
  });

  document.fonts?.ready?.then(() => {
    if (isResting) return;
    resetVennMetrics();
    resetHeadlineBaseline();
    captureEyebrowReservedHeight();
    captureHeadlineBaseline();
    captureLayoutZones();
    updateHeadlineLayout();
  });

  window.addEventListener('resize', () => {
    if (isResting) return;
    clearTimeout(journeyResizeTimer);
    journeyResizeTimer = setTimeout(refreshJourneyLayout, 100);
  });

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
  window.getTuneExport = () => ({
    json: buildTuneExportJson(),
    markdown: buildTuneExportMarkdown(),
  });
})();
