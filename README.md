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
| [budgy-ting](https://budgy-ting.vercel.app/) | Household cashflow tracker | JS, Vue 3, Vite, IndexedDB |
| [canva-grid](https://canva-grid.vercel.app/) | Visual design tool | JS, Vite, Tailwind |
| [graphiki](https://graphiki.vercel.app/) | Graph-based knowledge workspace | TS, Cytoscape.js |
| [model-pear](https://model-pear-web.vercel.app/) | B2B software pricing tool | TS, React, Vite |
| [see-veo](https://see-veo.vercel.app/) | Personal CV/resume as PWA | TS, React, Tailwind |
| [few-lap](https://few-lap.vercel.app) | Fuel station finder (SA) | TS, Expo, Supabase, Mapbox |
| [synctone](https://synctone.vercel.app) | Anonymous tone-tagged messaging | TS, Expo, Supabase |
| [sun-sea-o](https://sun-sea-o.vercel.app) | Module-based agreement builder | TS, React, Supabase |
| [four-ems](https://four-ems.vercel.app/) | Self-hosted form builder | TS, React, Supabase |

### Internal Tools

| Project | Description |
|---------|-------------|
| [repo-tor](https://repo-tor.vercel.app/) | Git analytics dashboard |
| [tool-till-tees](https://github.com/devmade-ai/tool-till-tees) | Utilities API (contact forms, form builder, agreements) |
| [glow-props](https://devmade-ai.github.io/glow-props/) | This site — portfolio, patterns, and CLAUDE.md reference |
| [canva-grid-assets](https://github.com/devmade-ai/canva-grid-assets) | CDN assets for canva-grid |

## Engineering Patterns

The site documents reusable implementation patterns. Each pattern has YAML frontmatter — drop a `.md` file into `docs/implementations/` and it appears in the app automatically via the `generatePatternManifest` Vite plugin.

Currently 10 patterns: PWA System, Theme & Dark Mode, Burger Menu, App Icons from SVG, Download as PDF, HTTPS Proxy Support, Debug System, Event Bus, Z-Index Scale, PWA Icon Cache Busting.

Full pattern reference: [CLAUDE.md](https://devmade-ai.github.io/glow-props/CLAUDE.md)

## Project Structure

```
glow-props/
  CLAUDE.md                     # AI assistant ruleset (reference for all projects)
  README.md                     # This file
  package.json                  # Vite + Tailwind + DaisyUI + Sharp (devDependencies)
  vite.config.js                # Build config (multi-page, Tailwind plugin, copies CLAUDE.md)
  index.html                    # Portfolio landing page
  project.html                  # Project detail page (markdown viewer)
  pattern.html                  # Pattern detail page (markdown viewer + copy)
  main.css                      # Tailwind directives, DaisyUI config, custom animations, markdown renderer styles
  partials/
    head-common.html            # Shared <head> content (bootstrap, fonts, CSS)
    navbar.html                 # Shared navbar with burger menu, theme picker, PWA install
    skip-link.html              # Accessibility skip-to-content link
  public/
    theme.js                    # Per-mode theme picker, dark/light toggle, burger menu behavior
    projects/                   # Mirrored docs per project
      {name}/
        meta.json               # Metadata (audience, use cases, privacy, status)
        README.md               # Project overview
        USER_GUIDE.md           # How to use (if available)
        TESTING_GUIDE.md        # Test scenarios (if available)
        TUTORIAL.md             # In-app tutorial steps (if available)
    assets/
      images/                   # Generated PNGs (from icon-source.svg)
  assets/
    icon-source.svg             # SVG source for icon generation
  scripts/
    generate-icons.mjs          # Sharp: SVG → PNG at 400 DPI
  docs/
    SESSION_NOTES.md            # Current session context
    TODO.md                     # Pending items
    AI_MISTAKES.md              # Learnings from past AI errors
    USER_ACTIONS.md             # Manual tasks requiring user intervention
    PROJECT_DOCS.md             # Status tracker and update guide for mirrored docs
    implementations/            # Implementation patterns (10 files, YAML frontmatter)
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

## Tech Stack

- **CSS Framework:** [Tailwind CSS](https://tailwindcss.com/) v4 + [DaisyUI](https://daisyui.com/) v5 — utility-first CSS with 35 DaisyUI themes (22 light, 13 dark) independently selectable per mode from the burger menu
- **Fonts:** [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) (headings) + [Inter](https://fonts.google.com/specimen/Inter) (body) via Google Fonts
- **Build:** Vite 7 with `@tailwindcss/vite` plugin
- **Icons:** Sharp (SVG to PNG at 400 DPI)
- **Animations:** Scroll-triggered fade-in (Intersection Observer), card hover effects, gradient text

## Icon Generation

All icons are generated from a single SVG source at 400 DPI:

```bash
npm run generate-icons
```

## Deployment

Automated via GitHub Actions. Pushes to `main` trigger a build and deploy to GitHub Pages.

**Setup:** In repo Settings > Pages, set the source to **GitHub Actions**.
