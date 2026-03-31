# glow-props

Portfolio and resource hub for devmade-ai projects. Deployed via GitHub Pages.

**Live site:** [devmade-ai.github.io/glow-props](https://devmade-ai.github.io/glow-props/)

## What It Is

A static site that serves three purposes:

1. **Project portfolio** — Showcases user-facing applications with live links and source code
2. **Internal tools directory** — Lists infrastructure and supporting repositories
3. **Pattern library** — Reusable engineering patterns extracted from real projects (PWA, dark mode, burger menu, etc.)

Also hosts `CLAUDE.md` — a comprehensive AI assistant ruleset used as a reference across all devmade-ai projects.

## Projects Featured

### User-Facing

| Project | Description | Stack |
|---------|-------------|-------|
| [budgy-ting](https://devmade-ai.github.io/budgy-ting/) | Household cashflow tracker | JS, Vite, IndexedDB |
| [canva-grid](https://devmade-ai.github.io/canva-grid/) | Visual design tool | JS, Vite, Tailwind |
| [graphiki](https://devmade-ai.github.io/graphiki/) | Graph-based knowledge workspace | TS, Cytoscape.js |
| [model-pear](https://devmade-ai.github.io/model-pear/) | B2B software pricing tool | TS, React, Vite |
| [see-veo](https://devmade-ai.github.io/see-veo/) | Personal CV/resume as PWA | TS, React, Tailwind |
| [few-lap](https://few-lap.vercel.app) | Fuel station finder (SA) | TS, Expo, Supabase, Mapbox |
| [synctone](https://synctone.vercel.app) | Anonymous tone-tagged messaging | TS, React, Supabase |

### Internal Tools

| Project | Description |
|---------|-------------|
| [repo-tor](https://repo-tor.vercel.app/) | Git analytics dashboard |
| [tool-till-tees](https://github.com/devmade-ai/tool-till-tees) | Utilities API (contact forms, form builder, agreements) |
| [glow-props](https://devmade-ai.github.io/glow-props/) | This site — portfolio, patterns, and CLAUDE.md reference |
| [canva-grid-assets](https://github.com/devmade-ai/canva-grid-assets) | CDN assets for canva-grid |

## Engineering Patterns

The site documents reusable implementation patterns from `CLAUDE.md`:

- **PWA System** — Install prompts, service worker updates, offline support
- **Theme & Dark Mode** — User-controlled with system fallback, cross-tab sync, flash prevention
- **Burger Menu** — WAI-ARIA disclosure pattern, iOS Safari fixes, focus management
- **App Icons from SVG** — Sharp at 400 DPI, single source to all PNG sizes
- **Download as PDF** — Zero-dependency via `window.print()`
- **HTTPS Proxy Support** — Node.js HTTP CONNECT tunnel, zero dependencies
- **Debug System** — In-memory event store with floating debug pill

Full pattern reference: [CLAUDE.md](https://devmade-ai.github.io/glow-props/CLAUDE.md)

## Project Structure

```
glow-props/
  CLAUDE.md                     # AI assistant ruleset (reference for all projects)
  README.md                     # This file
  package.json                  # Vite + Sharp (devDependencies)
  vite.config.js                # Build config + plugin to copy CLAUDE.md to dist/
  index.html                    # Portfolio landing page
  styles.css                    # Site styles with dark mode and print support
  public/
    theme.js                    # Dark mode toggle with persistence and cross-tab sync
    assets/
      images/                   # Generated PNGs (from icon-source.svg)
  assets/
    icon-source.svg             # SVG source for icon generation
  scripts/
    generate-icons.mjs          # Sharp: SVG → PNG at 400 DPI
  docs/
    SESSION_NOTES.md            # Current session context
    HISTORY.md                  # Completed work changelog
    TODO.md                     # Pending items
    AI_MISTAKES.md              # Learnings from past AI errors
    USER_ACTIONS.md             # Manual tasks requiring user intervention
  .github/
    workflows/
      deploy.yml                # GitHub Pages deployment on push to main
```

## Development

```bash
npm install
npm run dev          # Start dev server
npm run build        # Production build → dist/
```

## Icon Generation

All icons are generated from a single SVG source at 400 DPI:

```bash
npm run generate-icons
```

## Deployment

Automated via GitHub Actions. Pushes to `main` trigger a build and deploy to GitHub Pages.

**Setup:** In repo Settings > Pages, set the source to **GitHub Actions**.
