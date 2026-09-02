/**
 * Chaos widget easter eggs — curiosity rewards, not real functionality.
 */
(function () {
  const FOCUS_REVERT_MS = 1000;

  const cookie = document.querySelector('.chaos-cookie');
  const cookieBtns = cookie?.querySelector('.chaos-cookie__btns');
  const cookieAccept = cookie?.querySelector('.chaos-cookie__accept');
  const cookieReject = cookie?.querySelector('.chaos-cookie__reject');
  const cookieMeta = cookie?.querySelector('.chaos-cookie__meta');

  const newsletterWrap = document.querySelector('.chaos-newsletter-wrap');
  const newsletterTab = document.querySelector('.chaos-newsletter');
  const newsletterPanel = document.querySelector('.chaos-newsletter-panel');
  const newsletterText = document.querySelector('.chaos-newsletter__platitude');
  const newsletterPrev = document.querySelector('.chaos-newsletter__prev');
  const newsletterNext = document.querySelector('.chaos-newsletter__next');

  const quoteBtn = document.querySelector('.chaos-fab-quote');
  const quoteOriginalHtml = quoteBtn?.innerHTML ?? '';

  const chaosChat = document.getElementById('chaos-chat');
  const chatTeaser = chaosChat?.querySelector('.chaos-chat__teaser');
  const chatPanel = chaosChat?.querySelector('.chaos-chat__panel');
  const chatOpenBtn = chaosChat?.querySelector('.chaos-chat__btn');
  const chatLog = chaosChat?.querySelector('.chaos-chat__log');
  const chatInput = chaosChat?.querySelector('.chaos-chat__input');
  const chatForm = chaosChat?.querySelector('.chaos-chat__form');

  if (!cookie && !newsletterWrap && !quoteBtn && !chaosChat) return;

  const PLATITUDES = [
    'Move fast and break things - but preferably someone else\'s things. Even better if they pay for it.',
    'Disruption isn\'t a strategy. Unless it is. Then it\'s synergy.',
    '\'Strong opinions, loosely held\' is adopted widely but never loosely held in itself.',
    'Culture eats strategy for breakfast but what happens if your culture is eating breakfast for strategy.',
    'Data beats opinion. Unless opinion pays your salary.',
    'The best time to plant a tree is 20 years ago. The second best time is still 20 years ago; same day even.',
  ];

  const CHAT_TEMPLATES = [
    () => 'Funny you should ask that — Andrew once turned a hallway conversation into a twelve-month roadmap. The deck was beautiful. The problem was already solved.',
    () => 'That reminds me of when Andrew reframed a "simple UI tweak" into the actual business problem. People still quote the workshop, not the pixels.',
    () => 'A better question might be whether Andrew is free next quarter — but while I have you: his real skill is making the chaos more comfortable.',
    () => 'Ha. I get that a lot. Andrew\'s usual move is clarity first, then design, then the session where everyone pretends they agreed all along.',
    () => 'Good instinct. Andrew tends to care less about the deliverable and more about what everyone thought the deliverable was proving.',
    () => 'That reminds me — Andrew once got a room of executives to nod along by renaming the problem. Same work, better frame, fewer circular meetings.',
  ];

  let platitudeIndex = Math.floor(Math.random() * PLATITUDES.length);
  let cookieSwapping = false;
  let newsletterHandleHeight = 0;
  let quoteRevertTimer;
  let newsletterRevertTimer;
  let chatRevertTimer;

  function flipSwap(elA, elB, container, onDone) {
    const aRect = elA.getBoundingClientRect();
    const bRect = elB.getBoundingClientRect();

    if (elA.compareDocumentPosition(elB) & Node.DOCUMENT_POSITION_FOLLOWING) {
      container.insertBefore(elB, elA);
    } else {
      container.insertBefore(elA, elB);
    }

    const deltaA = aRect.left - elA.getBoundingClientRect().left;
    const deltaB = bRect.left - elB.getBoundingClientRect().left;

    elA.style.transform = `translateX(${deltaA}px)`;
    elB.style.transform = `translateX(${deltaB}px)`;

    requestAnimationFrame(() => {
      const duration = '0.22s';
      const easing = 'cubic-bezier(0.34, 1.3, 0.64, 1)';
      elA.style.transition = `transform ${duration} ${easing}`;
      elB.style.transition = `transform ${duration} ${easing}`;
      elA.style.transform = '';
      elB.style.transform = '';

      let pending = 2;
      const finish = () => {
        pending -= 1;
        if (pending > 0) return;
        elA.style.transition = '';
        elB.style.transition = '';
        onDone?.();
      };
      elA.addEventListener('transitionend', finish, { once: true });
      elB.addEventListener('transitionend', finish, { once: true });
    });
  }

  function swapCookieButtons() {
    if (cookieSwapping || !cookieAccept || !cookieReject || !cookieBtns) return;
    if (cookie.classList.contains('chaos-cookie--surrendered')) return;

    cookieSwapping = true;
    flipSwap(cookieAccept, cookieReject, cookieBtns, () => {
      cookieSwapping = false;
    });
  }

  function acceptCookies() {
    if (!cookieBtns || !cookieMeta || cookie.classList.contains('chaos-cookie--surrendered')) return;
    cookieMeta.hidden = false;
    cookieBtns.replaceWith(cookieMeta);
    cookie.classList.add('chaos-cookie--surrendered');
  }

  function showPlatitude() {
    if (!newsletterText) return;
    newsletterText.textContent = `"${PLATITUDES[platitudeIndex]}"`;
  }

  function captureNewsletterHandleHeight() {
    if (!newsletterTab) return;
    newsletterHandleHeight = newsletterTab.offsetHeight;
  }

  function syncNewsletterPanelHeight() {
    if (!newsletterPanel || !newsletterWrap?.classList.contains('is-open')) return;
    const h = newsletterHandleHeight || newsletterTab?.offsetHeight;
    if (!h) return;
    newsletterPanel.style.height = `${h}px`;
    newsletterPanel.style.maxHeight = `${h}px`;
  }

  function openNewsletter() {
    if (!newsletterWrap || !newsletterPanel) return;
    captureNewsletterHandleHeight();
    newsletterWrap.classList.add('is-open');
    newsletterPanel.hidden = false;
    showPlatitude();
    syncNewsletterPanelHeight();
    requestAnimationFrame(syncNewsletterPanelHeight);
    newsletterWrap.focus({ preventScroll: true });
  }

  function closeNewsletter() {
    if (!newsletterWrap?.classList.contains('is-open')) return;
    newsletterWrap.classList.remove('is-open');
    newsletterPanel.style.height = '';
    newsletterPanel.style.maxHeight = '';
    window.setTimeout(() => {
      if (!newsletterWrap.classList.contains('is-open')) {
        newsletterPanel.hidden = true;
      }
    }, 400);
  }

  function stepPlatitude(delta) {
    platitudeIndex = (platitudeIndex + delta + PLATITUDES.length) % PLATITUDES.length;
    showPlatitude();
  }

  function disarmQuoteRevert() {
    clearTimeout(quoteRevertTimer);
  }

  function scheduleQuoteRevert() {
    disarmQuoteRevert();
    quoteRevertTimer = window.setTimeout(revertQuoteButton, FOCUS_REVERT_MS);
  }

  function showQueueMessage() {
    if (!quoteBtn || quoteBtn.classList.contains('is-queue')) return;
    quoteBtn.classList.add('is-queue');
    quoteBtn.setAttribute('aria-disabled', 'true');
    quoteBtn.innerHTML =
      '<span class="chaos-fab-quote__connect" aria-hidden="true">' +
      '<span class="chaos-fab-quote__phone">📞</span>' +
      '<span class="chaos-fab-quote__dots">Connecting…</span>' +
      '</span>' +
      '<span class="chaos-fab-quote__queue-text">' +
      'We are experiencing unusually high call volumes. ' +
      'Your call is important to us; you are number ' +
      '<strong>10<sup>847</sup> − ⌊π<sup>e</sup>⌋</strong> in the queue.' +
      '</span>';
  }

  function revertQuoteButton() {
    if (!quoteBtn || !quoteBtn.classList.contains('is-queue')) return;
    disarmQuoteRevert();
    quoteBtn.classList.remove('is-queue');
    quoteBtn.removeAttribute('aria-disabled');
    quoteBtn.innerHTML = quoteOriginalHtml;
  }

  function appendChatMessage(html, role) {
    if (!chatLog) return;
    const msg = document.createElement('p');
    msg.className = `chaos-chat__msg chaos-chat__msg--${role}`;
    msg.innerHTML = html;
    chatLog.appendChild(msg);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function openChatPanel() {
    if (!chaosChat || !chatPanel) return;
    chaosChat.classList.add('chaos-chat--open');
    chatPanel.hidden = false;
    if (chatTeaser) chatTeaser.hidden = true;
    chatOpenBtn?.setAttribute('aria-label', 'Close chat');
    chatInput?.focus();
    if (chatLog && !chatLog.childElementCount) {
      appendChatMessage('What would you like to know about Andrew?', 'bot');
    }
  }

  function closeChatPanel() {
    if (!chaosChat?.classList.contains('chaos-chat--open')) return;
    chaosChat.classList.remove('chaos-chat--open');
    chatPanel.hidden = true;
    if (chatTeaser) chatTeaser.hidden = false;
    chatOpenBtn?.setAttribute('aria-label', 'Open chat');
  }

  function submitChatQuestion(e) {
    e.preventDefault();
    const question = chatInput?.value.trim();
    if (!question) return;

    appendChatMessage(question.replace(/</g, '&lt;').replace(/>/g, '&gt;'), 'user');
    chatInput.value = '';

    const template = CHAT_TEMPLATES[Math.floor(Math.random() * CHAT_TEMPLATES.length)];
    window.setTimeout(() => {
      appendChatMessage(template(), 'bot');
    }, 450);
  }

  cookieReject?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    swapCookieButtons();
  });

  cookieAccept?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    acceptCookies();
  });

  newsletterTab?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openNewsletter();
  });

  newsletterPrev?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    stepPlatitude(-1);
  });

  newsletterNext?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    stepPlatitude(1);
  });

  quoteBtn?.addEventListener('click', (e) => {
    if (quoteBtn.classList.contains('is-queue')) return;
    e.preventDefault();
    e.stopPropagation();
    showQueueMessage();
  });

  chatOpenBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearTimeout(chatRevertTimer);
    if (chaosChat?.classList.contains('chaos-chat--open')) {
      closeChatPanel();
    } else {
      openChatPanel();
    }
  });

  chatForm?.addEventListener('submit', submitChatQuestion);

  if (quoteBtn) {
    quoteBtn.addEventListener('mouseleave', () => {
      if (!quoteBtn.classList.contains('is-queue')) return;
      scheduleQuoteRevert();
    });
    quoteBtn.addEventListener('mouseenter', () => {
      if (!quoteBtn.classList.contains('is-queue')) return;
      disarmQuoteRevert();
    });
  }

  if (newsletterWrap) {
    captureNewsletterHandleHeight();
    window.addEventListener('resize', captureNewsletterHandleHeight);

    newsletterWrap.addEventListener('mouseleave', () => {
      if (!newsletterWrap.classList.contains('is-open')) return;
      clearTimeout(newsletterRevertTimer);
      newsletterRevertTimer = window.setTimeout(closeNewsletter, FOCUS_REVERT_MS);
    });
    newsletterWrap.addEventListener('mouseenter', () => {
      if (!newsletterWrap.classList.contains('is-open')) return;
      clearTimeout(newsletterRevertTimer);
    });
    newsletterWrap.addEventListener('focusout', (e) => {
      if (newsletterWrap.contains(e.relatedTarget)) return;
      clearTimeout(newsletterRevertTimer);
      newsletterRevertTimer = window.setTimeout(closeNewsletter, FOCUS_REVERT_MS);
    });
    newsletterWrap.addEventListener('focusin', () => clearTimeout(newsletterRevertTimer));
  }

  if (chaosChat) {
    chaosChat.addEventListener('focusout', (e) => {
      if (chaosChat.contains(e.relatedTarget)) return;
      clearTimeout(chatRevertTimer);
      chatRevertTimer = window.setTimeout(closeChatPanel, FOCUS_REVERT_MS);
    });
    chaosChat.addEventListener('focusin', () => clearTimeout(chatRevertTimer));
  }
})();
