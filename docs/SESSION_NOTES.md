# Session Notes

## Worked on
Transforming glow-props from a bare CLAUDE.md file host into a portfolio and resource hub.

## Accomplished
- Removed dead code: SessionStart hook (`.claude/` directory), `public/texts/hello.txt`
- Built portfolio landing page with three sections: Projects (7 user-facing), Tools (4 internal), Patterns (7 engineering patterns)
- Added dark mode with localStorage persistence, cross-tab sync, OS preference fallback, and flash prevention
- Added print-friendly CSS (`@media print`, `no-print` class, `break-inside: avoid`)
- Created `styles.css` with CSS variable theming (light/dark tokens)
- Created `public/theme.js` for toggle, cross-tab sync, and OS preference tracking
- Updated README to reflect new purpose (portfolio, tools directory, pattern library)
- Updated all docs (SESSION_NOTES, HISTORY)

## Current state
- Site builds cleanly with Vite, deploys to GitHub Pages
- Three sections: user-facing projects, internal tools, engineering patterns
- Dark mode works with persistence and flash prevention
- CLAUDE.md still served at `/glow-props/CLAUDE.md` for direct access
- Dead code removed (hook, sample text file)

## Key context
- Project classification: 7 user-facing, 4 internal (repo-tor, tool-till-tees, glow-props, canva-grid-assets), 2 discontinued (plant-fur, coin-zapp — excluded)
- `theme.js` lives in `public/` (not root) so Vite copies it as-is without bundling — it's a classic script, not a module
- The Vite `copyRootFiles` plugin still copies `CLAUDE.md` from root to `dist/`
- repo-tor's `projects.json` has the canonical project listing with live URLs
