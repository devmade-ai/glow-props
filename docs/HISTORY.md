# History

## 2026-03-31

### Portfolio site — transform from file host to project hub
- Built portfolio landing page with Projects, Tools, and Patterns sections
- Added dark mode: CSS variable tokens, localStorage persistence, cross-tab sync, flash prevention via inline script
- Added print-friendly CSS with `no-print` class and `break-inside: avoid`
- Removed dead SessionStart hook (`.claude/` directory) — was only in this repo, redundant with local CLAUDE.md
- Removed `public/texts/hello.txt` sample file
- Updated README to reflect new purpose (portfolio, tools directory, pattern library)
- Project classification: 7 user-facing apps, 4 internal tools, 2 discontinued (excluded)

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
