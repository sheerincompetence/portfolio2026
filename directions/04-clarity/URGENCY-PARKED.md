# Urgency bar — parked (journey experiment)

**Status:** Hidden on `journey.html` via `body.journey-no-urgency` while we tune fixed header+hero heights.

**Restore:** Remove `journey-no-urgency` from `<body>`, set `URGENCY_BAR_ENABLED = true` in `js/clarity-journey.js`, remove urgency overrides from `css/clarity-layout-lock.css`.

---

## Design (Milestone 1 / 3a — signed off)

- Orange gradient strip fixed to top of viewport
- Copy: “⚠️ Andrew is only available to save your business for the next **4 hours 32 minutes 12 seconds** — book now!”
- **10px** vertical padding (`padding-block: 10px` in `complexity-start.css`)
- Height token: `--cx-urgency-height: calc(20px + 0.7rem * 1.25)`
- Font: sans 0.7rem, weight 600, centred, white on `#c0392b → #e74c3c` gradient
- Pulse animation: `chaos-pulse-bg` 2s ease-in-out infinite
- Countdown ticks every 1s while `u ≤ 0.1` and not resting (`tickCountdown` in JS)

## HTML (`journey.html`)

```html
<div class="chaos-urgency" role="presentation" data-pop-at="0.06" data-pop-slide="0.12" data-pop-type="slide">
  ⚠️ Andrew is only available to save your business for the next
  <strong id="countdown">4 hours 32 minutes 12 seconds</strong> — book now!
</div>
```

## CSS sources

| File | Role |
|------|------|
| `css/chaos.css` | Base `.chaos-urgency` gradient, fixed top, z-index 95 |
| `css/complexity-start.css` | Journey overrides: min-height, padding-block 10px, z-index 102 |
| `css/clarity-transition.css` | Exit slide: `transform: translateY(calc(-100% * var(--urgency-progress)))`; body/header offset via `--urgency-visible` |

## JS behaviour (`clarity-journey.js`)

- **`data-pop-at="0.06"`** — urgency “pops” (slides off) after slider passes 6%
- **`data-pop-slide="0.12"`** — slide animation spans 6%→18% of slider (`urgencySlideSpan`)
- **`updateUrgencyProgress(u)`** sets `--urgency-progress` 0→1
- **`body.clarity-journey:not(.is-resting)`** — `padding-top: calc(var(--cx-urgency-height) * var(--urgency-visible))`
- **Header** — `top: calc(var(--cx-urgency-height) * var(--urgency-visible))`
- **`.cx-page`** — `padding-top: var(--cx-top-chrome)` where `--cx-top-chrome = urgency + header`
- Pop uses class `chaos-slide-off` (not opacity fade)
- Milestone rule: at `--u:0` and `--urgency-progress:0`, transition CSS must not alter Milestone 1 layout

## Git reference

- Milestone 3a urgency exit: slower 6%→18%, `data-pop-slide="0.12"`
- Tag/context: `journey/complexity-start-v2`, commit `593143b`
