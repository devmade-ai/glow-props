# History

## 2026-03-30

### Theme & Dark Mode - Fix PWA Status Bar Color
- Changed meta theme-color from page background colors (`#ffffff`/`#1a1a2e`) to brand color (`#10b981`)
- Simplified from two media-query meta tags to one constant brand color tag
- Updated `useDarkMode` hook to reinforce brand color instead of toggling between background colors
- Rewrote Key Lessons and documentation to establish status-bar-as-branding-surface principle
- Fixed visibility issue: background colors caused invisible status bar text when OS scheme opposed app theme

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
