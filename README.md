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
| [Farlume](https://budgy-ting.vercel.app/) | Household cashflow tracker | JS, Vue 3, Vite, IndexedDB |
| [canva-grid](https://canva-grid.vercel.app/) | Visual design tool | JS, Vite, Tailwind |
| [graphiki](https://graphiki.vercel.app/) | Graph-based knowledge workspace | TS, Cytoscape.js |
| [model-pear](https://model-pear-web.vercel.app/) | B2B software pricing tool | TS, React, Vite |
| [see-veo](https://see-veo.vercel.app/) | Personal CV/resume as PWA | TS, React, Tailwind |
| [FuelHunt](https://fuelhunt.app) | Fuel station finder (SA) | TS, Expo, Supabase, Mapbox |
| [inTXT](https://intxt.app) | Anonymous intention-tagged messaging | TS, Expo, Supabase |
| [Sancio](https://sun-sea-o.vercel.app) | Module-based agreement builder | TS, React, Supabase |
| [four-ems](https://four-ems.vercel.app/) | Self-hosted form builder | TS, React, Supabase |
| [knowless](https://knowless.net) | Investigative journalism reader | TS, React, PWA |
| [redline](https://web-arch.vercel.app) | Archived-page diff viewer (knowless) | JS, React, Wayback |
| [devmade](https://www.devmade.app) | devmade studio front-door | TS, React, Cloudflare |

### Internal Tools

| Project | Description |
|---------|-------------|
| [repo-tor](https://repo-tor.vercel.app/) | Git analytics dashboard |
| [tool-till-tees](https://github.com/devmade-ai/tool-till-tees) | Utilities API (contact forms, form builder, agreements) |
| [glow-props](https://devmade-ai.github.io/glow-props/) | This site — portfolio, patterns, and CLAUDE.md reference |
| [canva-grid-assets](https://github.com/devmade-ai/canva-grid-assets) | CDN assets for canva-grid |

## Engineering Patterns

The site documents reusable implementation patterns. Each pattern has YAML frontmatter — drop a `.md` file into `docs/implementations/` and it appears in the app automatically via the `generatePatternManifest` Vite plugin.

Currently 11 patterns: PWA System, Theme & Dark Mode, Burger Menu, App Icons from SVG, Download as PDF, HTTPS Proxy Support, Debug System, Event Bus, Z-Index Scale, PWA Icon Cache Busting, Timer & Subscription Cleanup.

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
    navbar.html                 # Shared navbar with burger menu, theme picker, PWA install + update controls
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
    implementations/            # Implementation patterns (11 files, YAML frontmatter)
  .github/
    workflows/
      deploy.yml                # GitHub Pages deployment on push to main
```

## Development

```bash
npm install
npm run dev          # Start dev server
npm run build        # Production build → dist/
npm run verify:seo   # Static check on the discoverability setup
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

## Discoverability

This site is meant to be found, so it follows the public column of
[DISCOVERABILITY.md](docs/implementations/DISCOVERABILITY.md): `robots.txt`
allows crawling and points at the sitemap, every page carries a canonical and a
full Open Graph / Twitter set, and links unfurl with a 1200×630 card rather than
a cropped app icon.

```bash
npm run generate:og-image   # Rebuild the card from assets/icon-source.svg
npm run verify:seo          # Fails if any of it drifts
```

Every pattern is **prerendered to its own file** at `patterns/<slug>/` — real
content and its own title, description and canonical in the markup, so it
crawls without JS and unfurls as itself rather than as "Pattern Details". The
legacy `pattern.html?name=<slug>` still works and canonicalises to the clean
URL.

`sitemap.xml` is **generated at build** from `docs/implementations/` and
`public/projects/` — do not add one to `public/`, it would shadow the real file.
`project.html` is not prerendered; its canonical is set at runtime
(`src/seoMeta.js`), because its content is chosen by `?name=` and a static one
would point every project at the same URL.

Run `npm run build` before `npm run verify:seo` — the checks over generated
output are only as current as `dist/`.

## Deployment

Automated via GitHub Actions. Pushes to `main` trigger a build and deploy to GitHub Pages.

**Setup:** In repo Settings > Pages, set the source to **GitHub Actions**.

## Analytics

This site uses Google Analytics 4 (measurement ID `G-MJWQS453DP`) to track aggregate visitor metrics — page views, referrers, geography. The loader is in `partials/head-common.html` and is loaded async on every page. The CSP in `index.html`, `project.html`, and `pattern.html` allowlists `googletagmanager.com` and `*.google-analytics.com` / `*.analytics.google.com`.

**Privacy posture:** No consent banner is shown. EU/UK visitors are tracked the moment they load any page. If the site starts attracting meaningful EU traffic, add Google Consent Mode v2 (denied-by-default) plus a small banner — see `docs/TODO.md`.

To disable analytics locally, comment out the `<script>` block at the top of `partials/head-common.html`. To remove entirely, also strip the `googletagmanager.com` / `google-analytics.com` entries from the three CSP meta tags.
