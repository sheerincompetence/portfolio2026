#!/usr/bin/env bash
# Main worktree — Portfolio2026-main — http://127.0.0.1:8765/ (no ribbon)
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"
echo "Production branch: http://127.0.0.1:8765/"
exec python3 -m http.server 8765
