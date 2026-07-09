/**
 * Antare visual case study — scroll reveals & reading progress
 */
(function () {
  var main = document.getElementById('main');
  if (!main || !main.classList.contains('antare-visual-main')) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Reading progress */
  var progressBar = document.querySelector('.av-progress__bar');
  if (progressBar && !reduced) {
    function updateProgress() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      progressBar.style.width = pct + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  if (reduced) {
    document.querySelectorAll('.av-reveal, .av-mosaic__cell').forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll('.av-reveal, .av-mosaic__cell');
  if (!revealEls.length || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  revealEls.forEach(function (el) { observer.observe(el); });
})();
