/**
 * Education case - journey toggle + support wheel
 */
(function () {
  function initJourney() {
    var root = document.querySelector('[data-edu-journey]');
    if (!root) return;

    var buttons = root.querySelectorAll('[data-journey-view]');
    var panels = root.querySelectorAll('[data-journey-panel]');

    function show(view) {
      buttons.forEach(function (btn) {
        var on = btn.getAttribute('data-journey-view') === view;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      panels.forEach(function (panel) {
        var on = panel.getAttribute('data-journey-panel') === view;
        panel.classList.toggle('is-active', on);
        if (on) {
          panel.removeAttribute('hidden');
        } else {
          panel.setAttribute('hidden', '');
        }
      });
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        show(btn.getAttribute('data-journey-view'));
      });
    });
  }

  function initWheel() {
    var root = document.querySelector('[data-edu-wheel]');
    if (!root) return;

    var spokesHost = root.querySelector('[data-wheel-spokes]');
    var pathHost = root.querySelector('[data-wheel-path]');
    var detail = root.querySelector('[data-wheel-detail]');
    if (!spokesHost || !detail) return;

    var cx = 240;
    var cy = 240;
    var r = 168;
    var ns = 'http://www.w3.org/2000/svg';

    // Ordered as accumulation: immediate value → permissions → opportunity → growth
    var nodes = [
      {
        id: 'expertise',
        label: 'Expertise',
        step: 1,
        body: 'Trusted input from the people who actually make RabbitMQ - not a generic ticket queue.'
      },
      {
        id: 'peace',
        label: 'Peace of mind',
        step: 2,
        body: 'The quiet certainty that someone is on call - the thing people were panic-buying.'
      },
      {
        id: 'confidence',
        label: 'Confidence',
        step: 3,
        body: 'Knowing experts who build the product have your back - shared accountability when things go wrong.'
      },
      {
        id: 'compliance',
        label: 'Compliance',
        step: 4,
        body: 'Hassle-free legal and security compliance that would be painful to assemble alone.'
      },
      {
        id: 'collaboration',
        label: 'Safer collaboration',
        step: 5,
        body: 'Permission to share sensitive details and work deeply with VMware without fear.'
      },
      {
        id: 'risk',
        label: 'Risk tolerance',
        step: 6,
        body: 'A safer base from which to innovate - room to explore because the floor won’t fall out.'
      },
      {
        id: 'markets',
        label: 'New markets',
        step: 7,
        body: 'Compliance and credibility unlock markets that were previously out of reach.'
      },
      {
        id: 'growth',
        label: 'Growth',
        step: 8,
        isGrowth: true,
        body: 'All of the above, compounded. Support solved yesterday’s crisis. Growth explained next year’s renewal.'
      }
    ];

    function polar(angleDeg, radius) {
      var rad = ((angleDeg - 90) * Math.PI) / 180;
      return {
        x: cx + radius * Math.cos(rad),
        y: cy + radius * Math.sin(rad)
      };
    }

    function setDetail(node) {
      var kicker = detail.querySelector('.edu-wheel__detail-kicker');
      var title = detail.querySelector('.edu-wheel__detail-title');
      var body = detail.querySelector('.edu-wheel__detail-body');
      if (node.isGrowth) {
        kicker.textContent = 'The destination';
      } else {
        kicker.textContent = 'Step ' + node.step + ' of ' + (nodes.length - 1);
      }
      title.textContent = node.label;
      body.textContent = node.body;
      detail.classList.toggle('is-growth', !!node.isGrowth);
    }

    function activate(id) {
      var groups = spokesHost.querySelectorAll('.edu-wheel__spoke');
      groups.forEach(function (g) {
        var on = g.getAttribute('data-spoke') === id;
        g.classList.toggle('is-active', on);
        g.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      var node = nodes.find(function (n) { return n.id === id; });
      if (node) setDetail(node);
    }

    // Leave a gap before Growth so the final arrow reads as arrival
    var count = nodes.length;
    var sweep = 300;
    var startAngle = -sweep / 2;

    var positions = nodes.map(function (node, i) {
      var t = i / (count - 1);
      var angle = startAngle + sweep * t;
      return {
        node: node,
        angle: angle,
        outer: polar(angle, r),
        inner: polar(angle, 78),
        labelPos: polar(angle, node.isGrowth ? r + 40 : r + 34)
      };
    });

    // Directional arc behind the nodes - ends just before Growth so the arrow points at it
    if (pathHost) {
      var first = positions[0].outer;
      var growthAngle = positions[positions.length - 1].angle;
      var arcEnd = polar(growthAngle - 12, r);
      var largeArc = sweep > 180 ? 1 : 0;
      var d =
        'M ' + first.x + ' ' + first.y +
        ' A ' + r + ' ' + r + ' 0 ' + largeArc + ' 1 ' + arcEnd.x + ' ' + arcEnd.y;

      var grad = document.getElementById('edu-wheel-arc-grad');
      if (grad) {
        grad.setAttribute('x1', String(first.x));
        grad.setAttribute('y1', String(first.y));
        grad.setAttribute('x2', String(arcEnd.x));
        grad.setAttribute('y2', String(arcEnd.y));
      }

      var arc = document.createElementNS(ns, 'path');
      arc.setAttribute('d', d);
      arc.setAttribute('class', 'edu-wheel__arc');
      arc.setAttribute('fill', 'none');
      arc.setAttribute('stroke', 'url(#edu-wheel-arc-grad)');
      arc.setAttribute('marker-end', 'url(#edu-wheel-arrow)');
      pathHost.appendChild(arc);

      // Soft tick marks between steps (not into Growth - the arrow owns that beat)
      for (var i = 0; i < positions.length - 2; i++) {
        var a = positions[i].angle;
        var b = positions[i + 1].angle;
        var midAngle = (a + b) / 2;
        var tickOuter = polar(midAngle, r + 6);
        var tickInner = polar(midAngle, r - 6);
        var tick = document.createElementNS(ns, 'line');
        tick.setAttribute('class', 'edu-wheel__tick');
        tick.setAttribute('x1', String(tickInner.x));
        tick.setAttribute('y1', String(tickInner.y));
        tick.setAttribute('x2', String(tickOuter.x));
        tick.setAttribute('y2', String(tickOuter.y));
        pathHost.appendChild(tick);
      }
    }

    positions.forEach(function (pos) {
      var node = pos.node;
      var g = document.createElementNS(ns, 'g');
      g.setAttribute('class', 'edu-wheel__spoke' + (node.isGrowth ? ' edu-wheel__spoke--growth' : ''));
      g.setAttribute('data-spoke', node.id);
      g.setAttribute('role', 'button');
      g.setAttribute('tabindex', '0');
      g.setAttribute('aria-pressed', 'false');
      g.setAttribute('aria-label', node.label);

      var line = document.createElementNS(ns, 'line');
      line.setAttribute('class', 'edu-wheel__spoke-line');
      line.setAttribute('x1', String(pos.inner.x));
      line.setAttribute('y1', String(pos.inner.y));
      line.setAttribute('x2', String(pos.outer.x));
      line.setAttribute('y2', String(pos.outer.y));
      g.appendChild(line);

      var dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('class', 'edu-wheel__spoke-dot');
      dot.setAttribute('cx', String(pos.outer.x));
      dot.setAttribute('cy', String(pos.outer.y));
      dot.setAttribute('r', node.isGrowth ? '14' : '9');
      g.appendChild(dot);

      var label = document.createElementNS(ns, 'text');
      label.setAttribute('class', 'edu-wheel__spoke-label');
      label.setAttribute('x', String(pos.labelPos.x));
      label.setAttribute('y', String(pos.labelPos.y));
      var anchor = 'middle';
      if (pos.labelPos.x < cx - 28) anchor = 'end';
      if (pos.labelPos.x > cx + 28) anchor = 'start';
      label.setAttribute('text-anchor', anchor);
      label.setAttribute('dominant-baseline', 'middle');
      label.textContent = node.label;
      g.appendChild(label);

      g.addEventListener('click', function () { activate(node.id); });
      g.addEventListener('mouseenter', function () { activate(node.id); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate(node.id);
        }
      });

      spokesHost.appendChild(g);
    });

    activate(nodes[0].id);
  }

  initJourney();
  initWheel();
})();
