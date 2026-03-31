# Session Notes

## Worked on
Transforming glow-props into a portfolio and resource hub with project detail pages, mirrored docs from all repos, and reference documentation for future updates.

## Accomplished
- Removed dead code: SessionStart hook, sample text file
- Built portfolio landing page (Projects, Tools, Patterns sections) with dark mode
- Built project detail page (`project.html`) with tabbed doc viewer, markdown rendering, copy/raw-file buttons
- Fetched and mirrored docs from all 10 active repos (README, User Guide, Testing Guide, Tutorial)
- Scrubbed private repo docs (graphiki, few-lap, synctone, tool-till-tees) to remove env vars, database details, local URLs
- Created `meta.json` per project with audience, use cases, data/privacy, status, repo visibility
- Extracted TutorialModal content as `TUTORIAL.md` for 5 projects
- Created `docs/PROJECT_DOCS_STATUS.md` — tracks which docs exist per repo and what's outstanding
- Created `docs/DOCS_UPDATE_GUIDE.md` — process for fetching, scrubbing, and updating mirrored docs
- Updated Vite config for multi-page build (index.html + project.html)

## Current state
- Site builds cleanly, deploys to GitHub Pages
- 10 projects with detail pages: 7 user-facing, 3 internal (+ canva-grid-assets)
- Each project has: meta.json, README, and available docs (User Guide, Testing Guide, Tutorial)
- Private repos have scrubbed docs — no env vars, database strings, or infrastructure details exposed
- CLAUDE.md still served at `/glow-props/CLAUDE.md`

## Key context
- Private repos: graphiki, few-lap, synctone, tool-till-tees
- Missing docs: model-pear (no User Guide, Testing Guide, Tutorial), see-veo (same)
- `project.html` uses a custom markdown renderer (no external dependencies)
- `theme.js` in `public/` — classic script, not a module (Vite copies as-is)
- `docs/DOCS_UPDATE_GUIDE.md` has the full process for updating mirrored docs
- `docs/PROJECT_DOCS_STATUS.md` tracks what's scrubbed and what's outstanding
