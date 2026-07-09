#!/usr/bin/env python3
"""Fail if play journey header CSS diverges from main or desktop mobile rules leak.

Run from repo root:
  python3 scripts/check-journey-header-parity.py

Checks:
  1. clarity-layout-lock.css line count ~= main (no bloated mobile-in-desktop file)
  2. No @media (max-width: 768px) blocks with broken braces (comma instead of {)
  3. clarity-layout-mobile.css exists and is linked from index.html
  4. play-ribbon.js must not offset .cx-header top or .cx-page padding
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAYOUT_LOCK = ROOT / "directions/04-clarity/css/clarity-layout-lock.css"
LAYOUT_MOBILE = ROOT / "directions/04-clarity/css/clarity-layout-mobile.css"
INDEX = ROOT / "index.html"
RIBBON = ROOT / "js/play-ribbon.js"
MAX_LAYOUT_LOCK_LINES = 320


def git_show_main_layout_lock() -> str | None:
    try:
        return subprocess.check_output(
            ["git", "show", "main:directions/04-clarity/css/clarity-layout-lock.css"],
            cwd=ROOT,
            text=True,
        )
    except subprocess.CalledProcessError:
        return None


def main() -> int:
    errors: list[str] = []

    if not LAYOUT_LOCK.is_file():
        errors.append(f"Missing {LAYOUT_LOCK}")
    else:
        lines = LAYOUT_LOCK.read_text().splitlines()
        if len(lines) > MAX_LAYOUT_LOCK_LINES:
            errors.append(
                f"clarity-layout-lock.css has {len(lines)} lines (max {MAX_LAYOUT_LOCK_LINES}). "
                "Desktop mobile rules may have leaked back in — extract to clarity-layout-mobile.css."
            )

        main_src = git_show_main_layout_lock()
        if main_src:
            main_lines = len(main_src.splitlines())
            if len(lines) > main_lines + 25:
                errors.append(
                    f"layout-lock is {len(lines) - main_lines} lines longer than main ({main_lines})."
                )

        # Broken selector leak signature from commit 37ffa5e
        if re.search(r"\.cx-rest-panel__cta,\s*\n\s*display:", LAYOUT_LOCK.read_text()):
            errors.append("clarity-layout-lock.css has broken .cx-rest-panel__cta, rule (mobile block leak).")

    if not LAYOUT_MOBILE.is_file():
        errors.append("Missing directions/04-clarity/css/clarity-layout-mobile.css")

    index = INDEX.read_text() if INDEX.is_file() else ""
    if "clarity-layout-mobile.css" not in index:
        errors.append("index.html does not link clarity-layout-mobile.css")

    ribbon = RIBBON.read_text() if RIBBON.is_file() else ""
    if ".cx-header.site-header" in ribbon and "top:" in ribbon:
        errors.append("play-ribbon.js offsets .cx-header top — play header will not match main.")
    if ".cx-page" in ribbon and "padding-top" in ribbon:
        errors.append("play-ribbon.js overrides .cx-page padding — play header stack will not match main.")
    if re.search(r"setProperty\s*\(\s*['\"]--play-ribbon-h['\"]", ribbon):
        errors.append(
            "play-ribbon.js sets --play-ribbon-h at runtime — site-shell interior headers will shift on :8766."
        )

    # Delegate media-block brace validation
    checker = ROOT / "scripts/check-css-media-blocks.py"
    if checker.is_file():
        proc = subprocess.run([sys.executable, str(checker)], cwd=ROOT, capture_output=True, text=True)
        if proc.returncode != 0:
            errors.append(f"check-css-media-blocks.py failed:\n{proc.stdout}\n{proc.stderr}")

    if errors:
        print("Journey header parity: FAIL\n", file=sys.stderr)
        for e in errors:
            print(f"  • {e}", file=sys.stderr)
        return 1

    print("Journey header parity: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
