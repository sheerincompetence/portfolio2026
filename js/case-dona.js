/**
 * Citrix DONA case - paradox slider + audience stories carousel
 */
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initParadox() {
    var root = document.querySelector('[data-dona-paradox]');
    if (!root) return;

    var dayEl = root.querySelector('[data-paradox-day]');
    var queueEl = root.querySelector('[data-paradox-queue]');
    var slider = root.querySelector('[data-paradox-slider]');
    if (!dayEl || !queueEl || !slider) return;

    /*
     * Step story the eye can follow:
     * 1. A random grey day block turns white (automated away)
     * 2. Queue top processes into that gap; the stream shifts up one
     * 3. Queue always shows the next 10. After stream item 14, only highs remain.
     */
    var NATURAL = [
      {
        name: 'Morning',
        energy: 'high energy',
        tasks: [
          { id: 'm0', type: 'high', size: 24 },
          { id: 'm1', type: 'high', size: 20 },
          { id: 'm2', type: 'high', size: 18 },
          { id: 'm3', type: 'low', size: 12 },
          { id: 'm4', type: 'high', size: 16 }
        ]
      },
      {
        name: 'Middle of day',
        energy: 'low energy',
        tasks: [
          { id: 'n0', type: 'low', size: 22 },
          { id: 'n1', type: 'low', size: 18 },
          { id: 'n2', type: 'high', size: 14 },
          { id: 'n3', type: 'low', size: 20 },
          { id: 'n4', type: 'low', size: 16 }
        ]
      },
      {
        name: 'Afternoon',
        energy: 'mixed',
        tasks: [
          { id: 'a0', type: 'low', size: 16 },
          { id: 'a1', type: 'high', size: 18 },
          { id: 'a2', type: 'low', size: 14 },
          { id: 'a3', type: 'high', size: 20 },
          { id: 'a4', type: 'high', size: 16 },
          { id: 'a5', type: 'low', size: 12 }
        ]
      }
    ];

    var QUEUE_CAPACITY = 10;
    /* 1-based items 1–14 may include greys; from 15 onward the stream is all high */
    var STREAM_ALL_HIGH_AFTER = 14;
    var STREAM_TYPES = [
      'low', 'high', 'low', 'low', 'high', 'low', 'high', 'low', 'low', 'high',
      'low', 'high', 'low', 'high'
    ];

    function streamTypeAt(index) {
      if (index >= STREAM_ALL_HIGH_AFTER) return 'high';
      return STREAM_TYPES[index] || 'high';
    }

    function windowAt(head) {
      var chips = [];
      for (var i = 0; i < QUEUE_CAPACITY; i++) {
        chips.push({
          id: 's' + (head + i),
          type: streamTypeAt(head + i)
        });
      }
      return chips;
    }

    function mulberry32(seed) {
      var a = seed >>> 0;
      return function () {
        a = (a + 0x6d2b79f5) >>> 0;
        var t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    function shuffle(list, rand) {
      var a = list.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(rand() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
      }
      return a;
    }

    function cloneDay() {
      return NATURAL.map(function (period) {
        return {
          name: period.name,
          energy: period.energy,
          tasks: period.tasks.map(function (task) {
            return { id: task.id, type: task.type, size: task.size };
          })
        };
      });
    }

    function cloneQueue(source) {
      return source.map(function (chip) {
        return { id: chip.id, type: chip.type };
      });
    }

    function findTask(day, id) {
      for (var p = 0; p < day.length; p++) {
        for (var t = 0; t < day[p].tasks.length; t++) {
          if (day[p].tasks[t].id === id) return day[p].tasks[t];
        }
      }
      return null;
    }

    function listLowIds(day) {
      var ids = [];
      day.forEach(function (period) {
        period.tasks.forEach(function (task) {
          if (task.type === 'low') ids.push(task.id);
        });
      });
      return ids;
    }

    function heatOf(day) {
      var total = 0;
      var high = 0;
      day.forEach(function (period) {
        period.tasks.forEach(function (task) {
          total += task.size;
          if (task.type === 'high') high += task.size;
        });
      });
      return total ? high / total : 0;
    }

    function snapshot(day, queue) {
      return {
        day: cloneDayFrom(day),
        queue: cloneQueue(queue),
        heat: heatOf(day)
      };
    }

    function cloneDayFrom(day) {
      return day.map(function (period) {
        return {
          name: period.name,
          energy: period.energy,
          tasks: period.tasks.map(function (task) {
            return { id: task.id, type: task.type, size: task.size };
          })
        };
      });
    }

    /* Precompute every beat so the slider scrubs a readable cause → effect */
    function buildFrames() {
      var frames = [];
      var day = cloneDay();
      var head = 0;
      var rand = mulberry32(20260712);
      var pending = shuffle(listLowIds(day), rand);
      var guard = 0;

      frames.push(snapshot(day, windowAt(head)));

      while (guard < 48) {
        guard += 1;

        var targetId = null;
        while (pending.length && !targetId) {
          var candidate = pending.shift();
          var cTask = findTask(day, candidate);
          if (cTask && cTask.type === 'low') targetId = candidate;
        }
        if (!targetId) {
          var leftovers = listLowIds(day);
          if (leftovers.length) {
            targetId = leftovers[Math.floor(rand() * leftovers.length)];
          }
        }

        if (!targetId) {
          /* Day is full - keep the stream rolling until the window is all high */
          while (head < STREAM_ALL_HIGH_AFTER) {
            head += 1;
            frames.push(snapshot(day, windowAt(head)));
          }
          break;
        }

        var slot = findTask(day, targetId);
        slot.type = 'empty';
        frames.push(snapshot(day, windowAt(head)));

        var topType = streamTypeAt(head);
        slot.type = topType;
        head += 1;
        if (topType === 'low') pending.push(targetId);
        frames.push(snapshot(day, windowAt(head)));
      }

      return frames;
    }

    var FRAMES = buildFrames();
    var prevDayType = {};
    var dayBuilt = false;

    function simulate(u) {
      var index = Math.round(Math.max(0, Math.min(1, u)) * (FRAMES.length - 1));
      return FRAMES[index];
    }

    function ensureDay() {
      if (dayBuilt) return;
      dayEl.innerHTML = '';
      NATURAL.forEach(function (period) {
        var row = document.createElement('div');
        row.className = 'dona-paradox__row';

        var hour = document.createElement('p');
        hour.className = 'dona-paradox__hour';
        hour.appendChild(document.createTextNode(period.name));
        if (period.energy) {
          var energy = document.createElement('span');
          energy.className = 'dona-paradox__energy';
          energy.textContent = period.energy;
          hour.appendChild(energy);
        }
        row.appendChild(hour);

        var track = document.createElement('div');
        track.className = 'dona-paradox__track';

        var sum = period.tasks.reduce(function (acc, t) {
          return acc + t.size;
        }, 0) || 1;

        period.tasks.forEach(function (task) {
          var el = document.createElement('span');
          el.className = 'dona-paradox__task dona-paradox__task--' + task.type;
          el.dataset.taskId = task.id;
          el.style.flexBasis = ((task.size / sum) * 100).toFixed(2) + '%';
          prevDayType[task.id] = task.type;
          track.appendChild(el);
        });

        row.appendChild(track);
        dayEl.appendChild(row);
      });
      dayBuilt = true;
    }

    function render(state, animate) {
      root.style.setProperty(
        '--paradox-heat',
        String(Math.max(0, Math.min(1, (state.heat - 0.45) / 0.55)))
      );

      ensureDay();

      state.day.forEach(function (period) {
        period.tasks.forEach(function (task) {
          var el = dayEl.querySelector('[data-task-id="' + task.id + '"]');
          if (!el) return;
          var was = prevDayType[task.id];
          el.className = 'dona-paradox__task dona-paradox__task--' + task.type;
          if (
            animate &&
            !reduced &&
            was &&
            was !== task.type &&
            (was === 'low' || was === 'empty' || task.type === 'empty')
          ) {
            el.classList.add('is-flipping');
            window.setTimeout(function () {
              el.classList.remove('is-flipping');
            }, 400);
          }
          prevDayType[task.id] = task.type;
        });
      });

      /* Solid units: replace the stack wholesale - no shrink / leave animation */
      queueEl.innerHTML = '';
      state.queue.forEach(function (task) {
        var chip = document.createElement('span');
        chip.className = 'dona-paradox__chip dona-paradox__chip--' + task.type;
        chip.title = task.type === 'high' ? 'High-cognitive' : 'Low-effort';
        queueEl.appendChild(chip);
      });
    }

    function setU(raw) {
      var u = Math.max(0, Math.min(1, raw));
      slider.value = String(Math.round(u * 100));
      slider.setAttribute('aria-valuenow', slider.value);
      render(simulate(u), true);
    }

    slider.addEventListener('input', function () {
      setU(parseInt(slider.value, 10) / 100);
    });

    setU(0);
  }

  function initStories() {
    var root = document.querySelector('[data-dona-stories]');
    if (!root) return;

    var track = root.querySelector('[data-stories-track]');
    var slides = root.querySelectorAll('[data-stories-slide]');
    var tabs = root.querySelectorAll('[data-stories-tab]');
    var prev = root.querySelector('[data-stories-prev]');
    var next = root.querySelector('[data-stories-next]');
    var count = slides.length;
    if (!track || !count) return;

    var index = 0;

    function go(i) {
      index = Math.max(0, Math.min(count - 1, i));
      var offset = index * 100;
      track.style.transform = 'translateX(-' + offset + '%)';

      slides.forEach(function (slide, n) {
        var on = n === index;
        slide.setAttribute('aria-hidden', on ? 'false' : 'true');
        if (on) slide.removeAttribute('tabindex');
        else slide.setAttribute('tabindex', '-1');
      });

      tabs.forEach(function (tab, n) {
        var on = n === index;
        tab.classList.toggle('is-active', on);
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.setAttribute('tabindex', on ? '0' : '-1');
      });

      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index === count - 1;
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var i = parseInt(tab.getAttribute('data-stories-tab'), 10);
        if (!isNaN(i)) go(i);
      });
    });

    if (prev) prev.addEventListener('click', function () { go(index - 1); });
    if (next) next.addEventListener('click', function () { go(index + 1); });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(index - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(index + 1);
      }
    });

    if (reduced) {
      track.style.transition = 'none';
    }

    go(0);
  }

  initParadox();
  initStories();
})();
