# glow-props

A static file host deployed via GitHub Pages. Serves fetchable config files — primarily `CLAUDE.md` — so Claude Code sessions across any project can pull shared rules from a single URL.

## What CLAUDE.md Provides

The main hosted file is a comprehensive AI assistant ruleset (~40KB) covering:

- **Process & Principles** — step-by-step workflow and design priorities (user-first, simplicity, testability)
- **Code Standards** — file/function size limits, decision documentation, cleanup rules, quality checks, UX requirements, commit message format
- **Documentation Standards** — required docs files (SESSION_NOTES, TODO, HISTORY, USER_GUIDE, etc.) with read/update triggers
- **AI Notes** — learned patterns and anti-patterns from past sessions
- **Triggers** — single-word commands (`review`, `audit`, `clean`, `performance`, etc.) for focused analysis passes
- **Suggested Implementations** — reference patterns for PWA, debug systems, app icons, PDF export, HTTPS proxy support
- **Prohibitions** — explicit guardrails to prevent common AI mistakes

## How It Works

1. Files in this repo are deployed to GitHub Pages automatically on push to `main`.
2. Any file becomes fetchable at `https://devmade-ai.github.io/glow-props/<path>`.
3. A Vite plugin copies `CLAUDE.md` from the repo root into `dist/` at build time (it must live at root for Claude Code to read it locally, but also needs to be served via Pages).

## Hosted Files

| File | URL | Purpose |
|------|-----|---------|
| `CLAUDE.md` | `https://devmade-ai.github.io/glow-props/CLAUDE.md` | Global AI assistant rules (process, principles, code standards, documentation, triggers, suggested implementations, prohibitions) |

## Project Structure

```
glow-props/
  CLAUDE.md                     # Source of truth — AI assistant ruleset
  README.md                     # This file
  package.json                  # Vite + Sharp (devDependency)
  vite.config.js                # Build config + plugin to copy CLAUDE.md to dist/
  index.html                    # Landing page listing available files
  public/
    assets/
      images/                   # Generated PNGs (from icon-source.svg)
        icon.png                #   1024x1024
        icon-192.png            #   192x192
        icon-512.png            #   512x512
        favicon.png             #   48x48
        adaptive-icon.png       #   1024x1024
        splash-icon.png         #   1024x1024
      icon-source.svg           # SVG source for all icons
    texts/
      hello.txt                 # Sample hosted text file
  scripts/
    generate-icons.mjs          # Sharp: SVG → PNG at 400 DPI
  docs/
    AI_MISTAKES.md              # Learnings from past AI errors
  .claude/
    hooks/
      session-start.sh          # SessionStart hook for consuming projects
    settings.json               # Hook registration
  .github/
    workflows/
      deploy.yml                # GitHub Pages deployment
```

## Icon Generation

All app icons are generated from a single SVG source using Sharp at 400 DPI for crisp edges:

```bash
npm install        # Ensure sharp is installed
npm run generate-icons
```

This reads `public/assets/icon-source.svg` and outputs 6 PNG sizes to `public/assets/images/`.

## Adding Files

1. Add any `.md`, `.txt`, or other static file to the repo root or a subdirectory.
2. Push to `main`.
3. Access it at `https://devmade-ai.github.io/glow-props/<path>`.

## Using in Other Projects (Claude Code Web)

To have any project automatically fetch these rules at session start, copy the `.claude/` directory into that project:

```
.claude/
  hooks/
    session-start.sh    # Fetches CLAUDE.md from GitHub Pages
  settings.json         # Registers the SessionStart hook
```

The hook only runs in Claude Code web sessions (`$CLAUDE_CODE_REMOTE=true`). Local sessions are unaffected. If the fetch fails (e.g., offline), the session continues normally.

Once merged into a repo's default branch, all future web sessions for that repo will pull the latest rules automatically.

## Deployment

Automated via GitHub Actions. The workflow at `.github/workflows/deploy.yml` deploys to GitHub Pages on every push to `main`.

**Setup:** In repo Settings > Pages, set the source to **GitHub Actions**.
