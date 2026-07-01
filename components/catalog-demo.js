/**
 * Interactive demos on the component catalog page
 */
(function () {
  document.querySelectorAll('[data-clarity-demo]').forEach((demo) => {
    const slider = demo.querySelector('input[type="range"]');
    const statement = demo.querySelector('.statement');
    if (!slider || !statement) return;

    const frags = statement.querySelectorAll('.frag[data-threshold]');

    function update(u) {
      u = parseFloat(u);
      demo.style.setProperty('--u', u);
      demo.classList.toggle('is-clear', u > 0.85);

      frags.forEach((frag) => {
        const threshold = parseFloat(frag.dataset.threshold);
        const range = parseFloat(frag.dataset.range || '0.18');
        if (u <= threshold) {
          frag.classList.remove('is-faded');
        } else if (u >= threshold + range) {
          frag.classList.add('is-faded');
        } else {
          frag.classList.remove('is-faded');
          frag.style.opacity = 1 - (u - threshold) / range;
        }
      });
    }

    slider.addEventListener('input', (e) => update(e.target.value));
    update(slider.value);
  });
})();
