#!/usr/bin/env python3
"""Fail if any @media block in CSS closes early (common cause of mobile rules leaking to desktop)."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS_GLOBS = (
    "css/**/*.css",
    "directions/**/*.css",
)


def check_file(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8")
    errors: list[str] = []
    for match in re.finditer(r"@media\s*\([^)]+\)\s*\{", text):
        start = match.end() - 1
        depth = 0
        i = start
        while i < len(text):
            ch = text[i]
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    block = text[start : i + 1]
                    line = text.count("\n", 0, match.start()) + 1
                    # Obvious typo: selector line ending with comma then property
                    if re.search(
                        r"[^,{]\s*,\s*\n\s*(display|position|overflow|width|height|margin|padding|top|left|right|bottom)\s*:",
                        block,
                    ):
                        errors.append(
                            f"{path}:{line}: @media block may be malformed (comma before property — missing '{{' ?)"
                        )
                    break
            i += 1
    return errors


def main() -> int:
    paths: list[Path] = []
    for pattern in CSS_GLOBS:
        paths.extend(ROOT.glob(pattern))
    all_errors: list[str] = []
    for path in sorted(set(paths)):
        all_errors.extend(check_file(path))
    if all_errors:
        print("CSS media-block check failed:\n", file=sys.stderr)
        for err in all_errors:
            print(f"  {err}", file=sys.stderr)
        return 1
    print(f"OK — checked {len(paths)} CSS files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
