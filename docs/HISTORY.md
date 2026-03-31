# History

## 2026-03-31

### Portfolio site — complete rebuild

**Landing page + project detail pages:**
- Built portfolio landing page with Projects (9 user-facing), Tools (4 internal), Patterns (7) sections
- Built project detail page (`project.html`) with tabbed doc viewer, markdown renderer, copy/raw buttons
- Fetched and mirrored docs from all 12 active repos (README, User Guide, Testing Guide, Tutorial)
- Scrubbed 6 private repo docs (graphiki, few-lap, synctone, tool-till-tees, sun-sea-o, four-ems)
- Created meta.json per project with audience, use cases, data/privacy, tech stack, status
- Extracted TutorialModal content as TUTORIAL.md for 5 projects
- Removed dead SessionStart hook and sample text file

**Design + theming:**
- Integrated Pico CSS v2 Jade theme (imported via Vite from node_modules)
- Added Google Fonts: Space Grotesk (headings), Inter (body)
- Switched dark mode from `.dark` class to `data-theme` attribute (Pico convention)
- Restructured HTML to Pico's semantic conventions (`<nav>`, `<article>`, `<header>`/`<footer>`)
- Rewrote styles.css as Pico override layer
- Added Save as PDF button via `window.print()`

**Bug fixes + security:**
- Fixed 5 wrong live URLs (GitHub Pages -> Vercel) based on user-provided correct URLs
- Fixed XSS: all dynamic meta.json values escaped via `escapeHtml()` (badge, repo, privacy, use cases, URLs, table headers)
- Fixed JS event listener accumulation — switched tab handlers to event delegation
- Fixed copy button targeting wrong element — uses `getElementById` now
- Added `&quot;` escaping to `escapeHtml()`
- Replaced `<nav class="card-links">` with `<div>` to avoid Pico nav styling conflicts
- Removed all inline styles from project.html — replaced with CSS classes

**Mobile + accessibility:**
- Touch targets: icon buttons (44px), card links (padded), doc tabs and action buttons (min-height 2.75rem)
- Safe area insets: `viewport-fit=cover` + `env(safe-area-inset-*)` on body, nav, footer
- Card grid overflow fix: lowered minmax from 300px to 280px
- `:active` feedback on cards, links, and buttons for touch
- `:focus-visible` outlines on card links, doc tabs, doc action buttons
- Dynamic meta description on project detail page

**CI + infrastructure:**
- Updated CI Node version 20 -> 22 (Vite 7 requires ^20.19.0 || >=22.12.0)
- Resolved npm audit vulnerability (picomatch, transitive dep of Vite)
- Updated package.json description

**Documentation:**
- Created `docs/PROJECT_DOCS_STATUS.md` — doc coverage tracker with "last mirrored" date
- Created `docs/DOCS_UPDATE_GUIDE.md` — step-by-step process for future updates
- Logged AI mistake: used stale secondary source instead of GITHUB_ALL_REPO_TOKEN API
- Updated README with Pico CSS tech stack, project structure, and correct URLs

## 2026-03-30

### Theme & Dark Mode - Remove meta theme-color suggestion
- Removed entire "Meta Theme-Color" section from suggested implementation (HTML meta tags, media queries, docs)
- Removed dynamic meta theme-color update from `useDarkMode` hook
- Removed Key Lessons #5-7 about theme-color, renumbered remaining lessons
- The suggestion caused invisible status bar text when the OS color scheme opposed the app theme

## 2026-03-29

### Theme & Dark Mode - Suggested Implementation Updates
- Added cross-tab sync via `storage` event to `useDarkMode.js` hook template
- Added dynamic meta theme-color update for manual toggle sync on Android Chrome
- Fixed querySelector bug: switched to `querySelectorAll` to update both meta theme-color tags (querySelector only returns the first DOM match, leaving the second stale)
- Documented debug pill theme detection pattern (separate React root reads `.dark` class)
- Clarified that `ui.*` semantic token classes eliminate most `dark:` prefixes
- Added PWA System cross-reference note linking manifest `theme_color` to dynamic meta updates
- Reorganized Key Lessons into logical groups: Foundations, HTML & browser chrome, CSS & Tailwind, Storage & sync, React Native

## 2026-03-23

### Documentation
- Updated README.md: added project structure, icon generation instructions, expanded CLAUDE.md description
- Created missing docs files (SESSION_NOTES, TODO, HISTORY, USER_ACTIONS)
- Conducted cross-repo documentation audit of all 14 devmade-ai repos
