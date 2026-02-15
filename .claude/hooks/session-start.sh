#!/bin/bash
set -euo pipefail

GLOW_PROPS_URL="https://devmade-ai.github.io/glow-props/CLAUDE.md"
TARGET="$HOME/.claude/CLAUDE.md"

mkdir -p "$HOME/.claude"
curl -sf "$GLOW_PROPS_URL" -o "$TARGET" || true
