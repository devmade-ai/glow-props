#!/bin/bash
set -euo pipefail

# Only run in Claude Code web sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

GLOW_PROPS_URL="https://devmade-ai.github.io/glow-props/CLAUDE.md"
TARGET="$HOME/.claude/CLAUDE.md"

mkdir -p "$HOME/.claude"
curl -sf "$GLOW_PROPS_URL" -o "$TARGET" || true
