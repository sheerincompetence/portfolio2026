#!/usr/bin/env bash
# Play worktree — Portfolio2026 — http://127.0.0.1:8766/ (ribbon on)
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"
echo "Play sandbox: http://127.0.0.1:8766/"
exec python3 -m http.server 8766
