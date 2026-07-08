# Horizontal staged reveal

**Saved exhibit** — scroll-pinned Cover Flow carousel that reveals one pipeline stage at a time.

Use this name when referring to the pattern in future case studies or transitions.

## Behaviour

- Sticky pin for a long scroll runway (`min-height: 620vh`)
- Camera holds centred and large, then track translates horizontally
- Each step fades in/out as a whole object (no edge mask)
- Finale card flips to Respond / Escalate / or Ignore before release

## Files

| File | Role |
|------|------|
| `index.html` | Standalone demo |
| `../../../css/exhibits/horizontal-staged-reveal.css` | Carousel styles |
| `../../../js/exhibits/horizontal-staged-reveal.js` | Scroll-scrub logic |

## Wire-up

```html
<link rel="stylesheet" href="../css/exhibits/horizontal-staged-reveal.css">
<div class="story-pipeline story-pipeline--staged" data-sequence="pipeline-staged">…</div>
<script src="../js/exhibits/horizontal-staged-reveal.js"></script>
```

Hook names: `data-pipeline-step`, `data-pipeline-arrow`, `--focus`, `--scale`, `--finale-reveal`.

## Superseded by

`story-pipeline--scan` on `work/antare.html` — full diagram visible, pulse emphasis across stages.
