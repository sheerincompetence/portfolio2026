# Clarity journey — milestones & sign-off

Use this file to record what is **done and parked**. Do not change parked items without explicit user approval.

## Preview URLs

| State | URL |
|-------|-----|
| **Complexity start** (default) | `journey.html?start=1` — clears resting memory, slider at 0 |
| **Resting / end** | `journey.html?resting=1` |
| **Mid-transition** | `journey.html?u=50` |

> If the urgency bar or chaos widgets are missing on load, you may be stuck in **resting** from `localStorage`. Use `?start=1` or click **Give me back the slider**.

---

## Where to make direct edits (copy, CSS, HTML)

| What you're changing | Edit this file | Notes |
|---------------------|----------------|-------|
| Complexity start copy/layout | `journey.html` + `css/complexity-start.css` | Parked — say so after editing |
| Resting end copy/layout | `journey.html` + `css/clarity-rest.css` | Parked — say so after editing |
| Slider motion / pop-outs | `css/clarity-transition.css` + `js/clarity-journey.js` | Active work |
| Chaos widget content/style | `journey.html` + `css/chaos.css` | Shared with `chaos.html` reference |

Edits in these source files **are** the source of truth — nothing auto-generates over them. To lock a change in, say **"park it"** or **"commit milestone X"**. Hard-refresh with cache-bust query params (`?v=` bumps in `journey.html`) if styles look stale.

---

## Milestone 1: Complexity starting state — **SIGNED OFF**

**Figma:** `33:195`  
**Primary CSS:** `css/complexity-start.css` (`v=28`)  
**Signed off:** 27 Jun 2026  
**Status:** **LOCKED** — do not rework layout, spacing, or chrome without explicit ask.

### Must pass (regression checklist)

- [ ] Orange **urgency bar** visible at top on `?start=1`
- [ ] Fixed header below urgency; full complex nav + ™ logo; wrapped nav row gap **0.5rem**
- [ ] Hero: portrait on HR (inner `padding-bottom: 1.5rem` + portrait `margin-bottom: -1.5rem`), dots bg (**0.26** opacity), emoji eyebrow, complexity headline, venn
- [ ] **Slide me →** left of slider panel (outside warm box); **1.5rem** gap slider → HR
- [ ] Slider labels: Complexity / **Clarity** (not Understanding)
- [ ] Hero HR (`border-bottom`) visible; AI ticker; five pillars; work cards; approach; limited offer; method/origins
- [ ] Approach quote: accent border on `.cx-quote p` only (no blockquote outer border)
- [ ] Chaos widgets positioned per `complexity-start.css`

---

## Milestone 2: Resting state — **SIGNED OFF**

**Figma:** `33:259`  
**Primary CSS:** `css/clarity-rest.css` (when `body.is-resting`)  
**Status:** Parked — do not rework without explicit ask.

### Must pass

- [ ] Simple nav: Work / About / Contact; logo 20px, no ™
- [ ] Headline: “I translate ideas into understanding”
- [ ] Rest panel: **Take a look** + **Give me back the slider**
- [ ] Site width 980px; text-only selected work; footer About & contact right

---

## Milestone 3: Slider transitions — **IN PROGRESS**

**Primary CSS:** `css/clarity-transition.css`  
**Primary JS:** `js/clarity-journey.js`  
**Status:** Active work — may change thresholds and motion. Must **not** break Milestones 1 or 2.

### Rules for transition work

1. Edit parked layout in `complexity-start.css` or `clarity-rest.css` only when fixing an explicit bug in that milestone.
2. Prefer new rules in `clarity-transition.css` with `:not(.is-resting)` guards.
3. Before finishing a session, run both regression checklists above.

---

## Sign-off ritual (recommended)

When the user says **“park it”**, **“sign off”**, or **“keep that”**:

1. Update this file (status + date + any checklist notes).
2. User (or agent, if asked) creates a git commit scoped to that milestone.
3. Optional: tag e.g. `journey/complexity-start-v1` for a permanent reference point.

When starting new work on transitions, say which milestone is in scope and which are locked.

**Current focus:** Milestone 3 (transitions). Milestones 1 and 2 are locked.
