# Clarity journey — milestones & sign-off

Use this file to record what is **done and parked**. Do not change parked items without explicit user approval.

## Preview URLs

| State | URL |
|-------|-----|
| **Complexity start** (default) | `journey.html?start=1` — clears resting memory, slider at 0 |
| **Resting / end** | `journey.html?resting=1` |
| **Mid-transition** | `journey.html?u=50` |
| **Font tune panel** | `journey.html?tune=1` |
| **Layout debug** | `journey.html?debug=layout` |

> If chaos widgets are missing on load, you may be stuck in **resting** from `localStorage`. Use `?start=1` or click **Give me back the slider**.

---

## Where to make direct edits (copy, CSS, HTML)

| What you're changing | Edit this file | Notes |
|---------------------|----------------|-------|
| Complexity start copy/layout | `journey.html` + `css/complexity-start.css` | **Locked** — Milestone 1 |
| Resting end copy/layout | `journey.html` + `css/clarity-rest.css` | **Locked** — Milestone 2 v2 |
| Fixed chrome stack | `css/clarity-layout-lock.css` | **Locked** — Milestone 3 |
| Slider motion / pop-outs | `css/clarity-transition.css` + `js/clarity-journey.js` | **Locked** — Milestone 3 |
| Chaos widget content/style | `journey.html` + `css/chaos.css` | Pop timing in `journey.html` data attrs |
| Urgency bar (parked) | `URGENCY-PARKED.md` | Hidden via `journey-no-urgency` |

Edits in these source files **are** the source of truth. To lock a change in, say **"park it"** or **"commit milestone X"**. Hard-refresh with cache-bust query params (`?v=` bumps in `journey.html`) if styles look stale.

**Current asset versions (journey.html):** complexity-start `v=43`, clarity-transition `v=53`, clarity-rest `v=13`, clarity-layout-lock `v=17`, clarity-journey.js `v=54`.

---

## Milestone 1: Complexity starting state — **SIGNED OFF (v2)**

**Figma:** `33:195`  
**Primary CSS:** `css/complexity-start.css` (`v=43`)  
**Signed off:** 27 Jun 2026 (v1 `413a46b`) · **re-signed 27 Jun 2026 (v2)** `593143b`  
**Status:** **LOCKED**

### Must pass (regression checklist)

- [ ] Orange **urgency bar** visible at top on `?start=1` when urgency restored (currently **parked** — see `URGENCY-PARKED.md`)
- [ ] Fixed header below urgency; full complex nav (7 links on one row at 1280px); ™ logo; nav gap `--cx-nav-link-gap: 0.875rem`
- [ ] Hero: portrait on HR; dots bg (**0.26**); emoji eyebrow; complexity headline; venn
- [ ] **Slide me →** left of slider panel; slider labels Complexity / **Clarity**
- [ ] Chaos widgets: social proof **8px** from top, **1.25rem** from left; quote above cookie in stack-left

---

## Milestone 2: Resting state — **SIGNED OFF (v2)**

**Figma:** `33:259`  
**Primary CSS:** `css/clarity-rest.css` (`v=13`) + `css/clarity-layout-lock.css` (rest rules)  
**Signed off:** 27 Jun 2026 (v2)  
**Status:** **LOCKED** — aligned with journey `u=100` geometry.

### Must pass

- [ ] Nav: **Work / About / Contact** (complex nav at rest, faded links hidden); gap `0.875rem`; logo 20px, no ™
- [ ] Headline: “I translate ideas” / “into understanding” at **95px**; copy expands to 80% width
- [ ] Rest panel replaces slider at same Y (`--cx-layout-control-y`); matches slider chrome (warm box, accent border)
- [ ] Site width **980px**; eyebrow slot height preserved (invisible); hero **544px** with layout-lock
- [ ] **Take a look** + **Give me back the slider**; text-only selected work; footer About & contact right

---

## Milestone 3: Slider transitions — **SIGNED OFF**

**Primary CSS:** `css/clarity-transition.css` (`v=53`) · `css/clarity-layout-lock.css` (`v=17`)  
**Primary JS:** `js/clarity-journey.js` (`v=54`)  
**Signed off:** 27 Jun 2026  
**Status:** **LOCKED** — minor threshold tweaks only unless user requests rework.

### Headline font keyframes (production)

| u | font (px) | phase |
|---|-----------|-------|
| 0 | 24 | stage 1 |
| 26 | 32 | stage 2 proto |
| 41 | 40 | stage 3 verb |
| 52 | 50 | stage 4 long |
| 68 | 64 | mid growth |
| 86 | 82 | stage 5 / tail |
| 100 | 95 | rest headline size |

Tune panel: `?tune=1` (localStorage `portfolio-clarity-font-keyframes`).

### Headline copy

- Word-level `.frag` fade; final phrase line break after “ideas”
- Copy `flex: 1 1 100%`, `max-width: 80%`; venn margin releases as `--venn-space` increases
- Site narrows **1280 → 980** (`--width-site`)

### Portrait & venn

- Portrait shrink **0→100%** (`--portrait-shrink: var(--u)`); transform scale from bottom-left
- Venn exit **0→62%** (`VENN_EXIT_END = 0.62`); slide `48vw`

### Skills eyebrow

- Stagger fade order: AI → SYNERGY → strategy → behavioural thinking → Product design
- Reserved min-height (`--cx-eyebrow-reserved-height`) — headline must not jump up

### Navigation

- Links fade at irregular thresholds; **How I Work → Work** morph (~41–55%)
- Faded links `display: none` (no phantom flex gaps)
- End state: Work · About · Contact

### Chaos widget pops

| Widget | Trigger | Delay |
|--------|---------|-------|
| Cookie | 44% | — |
| Call for quote | 44% | 850ms |
| Subscribe | 70% | — |
| TalentBot | 88% | 500ms |
| Social proof | after TalentBot | 650ms (finale pop) |

Urgency bar **parked** (`journey-no-urgency`, `URGENCY_BAR_ENABLED = false`). Restore via `URGENCY-PARKED.md`.

### Layout lock (no urgency)

- Header **82px** + hero **544px** = stack **626px**
- Slider/rest panel Y **487px** from page top
- Body classes: `journey-no-urgency journey-layout-lock`

### Rules (still apply)

1. Do not break Milestones 1 or 2 at `?start=1` / `?resting=1`.
2. At `--u:0`, transition CSS must not alter Milestone 1 layout.
3. Prefer `:not(.is-resting)` guards in transition CSS.

---

## Sign-off ritual

When the user says **“park it”**, **“sign off”**, or **“lock it in”**:

1. Update this file (status + date + checklist).
2. Git commit scoped to the milestone.
3. Optional: tag e.g. `journey/clarity-transitions-v1`.

**All milestones locked.** Future work = minor tweaks only unless user explicitly reopens a milestone.
