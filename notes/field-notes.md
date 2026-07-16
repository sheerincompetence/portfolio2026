# Field Notes

Session observations on how the build is going — workflow, not changelog.

## Template

**Date:**  
**Focus:**

### What worked

-

### Friction

-

### Next time

-

---

**Date:** 2026-07-16  
**Focus:** Fragile layout changes (homepage clarity journey, mobile resting state)

### What worked

- Naming the regression explicitly ("spacing collapsed because we removed the spacer, not because the fix was wrong") pointed to the right follow-up: restore geometry deliberately, don't bring back the broken overlay.
- Keeping the old slider chrome **in flow but invisible** (`visibility: hidden` instead of `display: none`) preserved spacing while still fixing click interception.

### Friction

- A narrow fix (header clicks on mobile after resting) accidentally collapsed headline-to-CTA spacing. Easy to miss when the task sounds unrelated to layout.
- Anxiety that any touch to a complex page might disturb parked milestones you aren't working on.

### Next time

Use this prompt when touching fragile or multi-state layouts (homepage journey, case study scroll sections, anything with parked milestones):

```text
Make the smallest possible change.
Treat all other states as locked.
The finished state must match current production in every respect except [the thing I asked to change].
Verify both the changed state and the parked/start state before stopping.
```

For this homepage specifically, name the milestones:

```text
Fix [X] only.
Do not change ?start=1 or ?resting=1 layout, spacing, or interactions except where strictly necessary.
If a fix removes an accidental spacer or overlay, reintroduce the intended geometry explicitly rather than deleting structure.
```

**Rule vs QA agent:** A project rule for production/fragile paths is worth it. A separate QA agent is optional - use it for bigger changes or as a second pass after implementation ("regression pass on ?start=1, ?resting=1, narrow mobile").
