# Session Notes

## Worked on
Transforming glow-props from a bare CLAUDE.md file host into a portfolio and resource hub with Pico CSS Jade theme.

## Accomplished
- Removed dead code (SessionStart hook, sample text file)
- Built portfolio landing page with 3 sections: Projects (9 user-facing), Tools (4 internal), Patterns (7)
- Built project detail page with tabbed doc viewer (Overview, User Guide, Testing Guide, Tutorial)
- Fetched and mirrored docs from all 12 active repos, scrubbed 6 private repos
- Integrated Pico CSS v2 Jade theme with Space Grotesk + Inter fonts
- Switched dark mode from `.dark` class to `data-theme` attribute (Pico convention)
- Added Save as PDF button via `window.print()`
- Fixed 5 wrong live URLs (GitHub Pages -> Vercel) and added 2 missing projects (sun-sea-o, four-ems)
- Fixed XSS: all dynamic meta.json values now escaped via `escapeHtml()`
- Fixed JS bugs: event listener accumulation, copy button selector, quote escaping
- Mobile UX: 44px touch targets, safe area insets, grid overflow fix, `:active` feedback
- Replaced `<nav>` card-links with `<div>` to avoid Pico nav conflicts
- Removed all inline styles from project.html
- Updated CI Node version 20 -> 22 (Vite 7 requires ^20.19.0 || >=22.12.0)
- Resolved npm audit vulnerability (picomatch)
- Strengthened DOCS_UPDATE_GUIDE and PROJECT_DOCS_STATUS for future maintenance

## Current state
- Site builds cleanly (58 files, 1.1MB), deploys to GitHub Pages via GitHub Actions
- 12 project directories with detail pages, all with correct Vercel live URLs
- Pico CSS Jade theme bundled via Vite, dark mode via `data-theme` attribute
- Zero inline styles, zero console.log, zero TODO comments, zero npm vulnerabilities
- All dynamic HTML content escaped, event delegation for tab switching

## Key context
- Pico CSS imported via `pico-jade.css` which `@import`s from node_modules — Vite bundles it
- Dark mode uses `data-theme` attribute (Pico convention), NOT `.dark` class
- Private repos: graphiki, few-lap, synctone, tool-till-tees, sun-sea-o, four-ems
- Missing docs: model-pear (no User Guide, Testing Guide, Tutorial), see-veo (same)
- All apps deployed on Vercel except glow-props (GitHub Pages)
- `docs/DOCS_UPDATE_GUIDE.md` has the full process for updating mirrored docs
- `docs/PROJECT_DOCS_STATUS.md` tracks what's scrubbed and outstanding (last mirrored: 2026-03-31)
- Always list repos via `GITHUB_ALL_REPO_TOKEN` API, never rely on cached lists
