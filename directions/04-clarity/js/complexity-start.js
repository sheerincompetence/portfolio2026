/**
 * Full Complexity starting state — chaos widget animations only.
 * Slider transitions will be added in a later pass.
 */

(function () {
  const recruiterCount = document.getElementById('recruiter-count');
  const chatMessage = document.getElementById('chat-message');
  const countdownEl = document.getElementById('countdown');

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
    if (!chatMessage) return;
    chatMessage.style.opacity = '0';
    setTimeout(() => {
      chatIndex = (chatIndex + 1) % CHAT_LINES.length;
      chatMessage.innerHTML = CHAT_LINES[chatIndex];
      chatMessage.style.opacity = '1';
    }, 300);
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReduced) {
    setInterval(tickCountdown, 1000);
    setInterval(tickRecruiters, 4000);
    setInterval(cycleChat, 5000);
  }

  tickCountdown();
  tickRecruiters();
})();
