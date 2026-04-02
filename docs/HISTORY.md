# History

## 2026-04-02

### Full audit sweep — security, UX, accessibility, and code quality fixes
- **Security (critical):** Fixed XSS in `inlineMarkdown()` — escape HTML before formatting, sanitize link hrefs via protocol allowlist (`isSafeUrl()`), escape `meta.tech` array
- **Security (high):** Added URL protocol validation on `meta.liveUrl`/`meta.repoUrl` to reject `javascript:`/`data:` protocols
- **Bug fix (critical):** Random theme toggle now stores `String(newState)` instead of boolean — was always reading as "Off"
- **PWA (high):** Fixed Escape listener leak in install modal — now cleaned up on all close paths (backdrop, buttons, Escape). Added `.catch()` on `deferredPrompt.userChoice`. Removed dead `needsRefresh` variable. Added `data-close` to install menu button.
- **PWA (medium):** Added `env(safe-area-inset-bottom)` to update banner and modal for iPhone home indicator
- **Mobile (medium):** Bumped card action buttons from `btn-xs` (24px) to `btn-sm` (32px+) for better touch targets. Bumped PWA modal buttons to standard `btn` size.
- **Accessibility (medium):** Added skip-to-content link on both pages for keyboard navigation past 30+ burger menu items
- **SEO (medium):** Added OG meta tags (og:title, og:description, og:image, og:type) on both pages
- **Reliability (medium):** Added 10s AbortController timeout on project metadata fetch. Added `.catch()` on secondary doc file fetches.
- **Docs:** Updated README (35 themes, not 8 combos), PWA_SYSTEM.md (version ^1.2.0)

### Organize suggested implementations into standalone files
- Extracted all 7 suggested implementations from inline CLAUDE.md into `docs/implementations/`
- Files: PWA_SYSTEM.md, DEBUG_SYSTEM.md, APP_ICONS.md, DOWNLOAD_PDF.md, HTTPS_PROXY.md, BURGER_MENU.md, THEME_DARK_MODE.md
- Replaced 1,365-line inline section in CLAUDE.md with a reference table linking to each file
- Content preserved exactly — no changes to non-theme implementation docs

### Implement PWA support
- Added `vite-plugin-pwa` with `registerType: 'prompt'` for user-controlled updates
- Created `src/pwa.js` — vanilla JS service worker registration, update banner, offline toast, install prompt, manual install instructions (Safari/Firefox)
- Generated 1024x1024 maskable icon via Sharp at 400 DPI
- Added `beforeinstallprompt` early-capture script to both HTML files (prevents lost install prompt on repeat visits)
- Added "Install app" menu item to burger menu on both pages (hidden when installed/dismissed)
- Manifest: `id: '/glow-props/'`, `scope: '/glow-props/'`, `display: standalone`, separate icon purposes (any for 192/512, maskable for 1024)
- Service worker precaches 11 entries (~270KB) for full offline access
- Added `apple-touch-icon` link to both HTML files for iOS
- Update banner: fixed bottom bar with "Update" and "Later" buttons, z-70 per z-index scale
- Offline toast: auto-dismiss after 3s, non-intrusive confirmation
- Install modal: browser-specific plain-language steps for Safari iOS/macOS and Firefox Android

### Rewrite THEME_DARK_MODE.md for DaisyUI
- Complete rewrite to reflect actual DaisyUI-based approach used across glow-props, canva-grid, and few-lap
- Old doc described custom CSS variable semantic tokens and React hooks that no project uses
- New doc covers: dual-layer theming (`.dark` class + `data-theme` attribute), per-mode theme persistence, curated vs full theme catalogs, theme ID validation, flash prevention with DaisyUI, cross-tab sync, Uniwind for React Native, hex color lookup tables for non-CSS contexts
- Added project-specific variant documentation: vanilla JS (glow-props), React hooks (canva-grid), Uniwind + named combos (few-lap)
- Updated CLAUDE.md table description to mention DaisyUI

## 2026-04-01

### Theme toggle refactor — per-mode individual theme picker
- Replaced 8 curated theme combos with full DaisyUI catalogue (35 themes: 22 light, 13 dark)
- Dark/light toggle now controls which theme list is shown in the burger menu picker
- Each mode stores its own theme independently (`lightTheme`/`darkTheme` in localStorage)
- Rewrote theme.js: removed combo system, added per-mode storage, theme list visibility toggling
- Simplified flash prevention scripts in both HTML files — no combo map duplication needed
- Registered all 35 DaisyUI themes in main.css (up from 16)
- Added scrollable theme lists (max-h-52 with overflow-y-auto) to handle 22 items
- Each theme has a mood/style tag (Warm, Cool, Gothic, Minimal, Neon, etc.)
- Section header dynamically shows "Light themes" or "Dark themes" based on mode
- Eliminated tech debt: combo map was duplicated in 3 files, now replaced by simple key reads
- CSS bundle: ~138KB (~24KB gzipped) — up from ~117KB due to 19 additional theme definitions
- Old `themeCombo` localStorage key ignored — existing users reset to defaults

### Burger menu fixes
- Fixed project.html burger menu — was using `hidden` attribute but theme.js uses class-based opacity/scale transitions. `hidden` sets `display:none` which overrides all CSS classes, so the menu never opened. Replaced with same class-based pattern as index.html.
- Fixed tap-outside to close — backdrop overlay was trapped inside navbar due to `backdrop-filter` creating a containing block for `position:fixed`. Replaced backdrop click handler with a document-level click handler that checks if target is outside menu+trigger.
- Fixed scroll bleed-through on mobile — `overscroll-contain` only prevents chaining on scroll containers. Taps on non-scrollable menu areas chained to body. Added `document.body.style.overflow = 'hidden'` on open, restored on close.
- Removed backdrop overlay element from both HTML files — it only covered the navbar area (not the viewport) and served no functional purpose after the document click handler replaced it. Moving it outside the navbar would cover the menu too (z-index stacking conflict).
- Removed dead `z-backdrop` CSS utility from main.css
- Fixed stale comment in theme.js that said "Toggle hidden attribute" when code uses opacity+scale transitions

### Theme combo picker (superseded by per-mode refactor above)
- Added 8 curated DaisyUI light/dark theme pairs selectable from burger menu
- Combos: Caramel & Coffee (default), Nord & Night, Emerald & Forest, Autumn & Dim, Cupcake & Dracula, Lofi & Black, Garden & Luxury, Pastel & Synthwave
- Registered 16 DaisyUI themes in main.css (up from 2)
- Rewrote theme.js with combo storage, combo picker event delegation, cross-tab sync, and combo indicator UI
- Updated flash-prevention scripts in both HTML files to read stored combo key
- Choice persists in localStorage (`themeCombo` key) and syncs across tabs
- Menu stays open while switching themes for quick comparison

### Icon redesign — hexagon to multi-color 4-square grid
- Replaced hexagon-with-dots icon (network/graph feel) with 2x2 grid of colored rounded squares
- Colors: Blue #3b82f6, Emerald #10b981, Amber #f59e0b, Violet #8b5cf6
- Multi-color palette is theme-independent — no clash with any DaisyUI combo
- Transparent background so icon floats cleanly on any theme's bg
- Regenerated all PNGs (48, 192, 512) via Sharp at 400 DPI

### Code quality fixes
- Fixed combo button touch targets — added min-h-11 (44px) to all combo picker buttons
- Switched hero gradient from fixed amber/rose to DaisyUI `from-primary to-accent` tokens — auto-matches active theme
- Fixed cross-tab sync writing values back redundantly — added skipPersist flag to applyTheme()
- Removed unused `label` and `desc` properties from COMBOS array in theme.js

### CSS framework migration — Pico CSS to Tailwind + DaisyUI
- Replaced Pico CSS v2.1.1 with Tailwind CSS v4.2.2 + DaisyUI v5.5.19
- Deleted `pico-theme.css` (Pico import) and `styles.css` (420 lines of Pico overrides)
- Created `main.css` — Tailwind directives, DaisyUI plugin config, custom animations, print styles
- Migrated `index.html` — all sections rewritten with Tailwind utility classes + DaisyUI components
- Migrated `project.html` — meta grid, tabs, doc viewer, markdown renderer all use Tailwind/DaisyUI
- Updated `theme.js` — now sets both `.dark` class (Tailwind) and `data-theme` (DaisyUI) together
- Updated flash-prevention scripts in both HTML files for dual class/attribute dark mode
- Configured `@tailwindcss/vite` plugin in `vite.config.js`
- Added animations: scroll-triggered fade-in-up (Intersection Observer), card hover lift, gradient hero text, sticky glassmorphism navbar
- All accessibility preserved: disclosure pattern, aria-expanded, focus-visible, 44px touch targets, safe area insets
- Moved Tailwind/DaisyUI from dependencies to devDependencies (build-time only)
- Fixed missing `.dark` class removal in flash-prevention light mode branch
- Switched DaisyUI themes from defaults (light/dark) to caramellatte (light) / coffee (dark)
- Changed hero gradient from theme-dependent (`from-primary to-secondary`) to fixed warm gradient — caramellatte's primary/secondary are both near-black, making the gradient invisible

### Project content rewrite
- Rewrote audience and use cases for all 12 project meta.json files
- Use cases changed from feature lists to real-world scenarios ("A [person] needs to [solve problem]")
- Audiences derived from who would have those problems, not generic user categories

### Icon theming
- Changed icon colour from #06b6d4 (Tailwind cyan-500) to #0ab1b1 (Pico CSS cyan theme primary)
- Removed feGaussianBlur glow filter from SVG — clean edges match the Pico UI
- Regenerated all PNG icons (48, 192, 512)

### Header and page spacing fixes
- Fixed nav-to-content misalignment — added horizontal padding matching Pico's container spacing (1rem)
- Reduced hero top padding on index.html from 3rem to 2rem total gap (hero padding 2rem → 1rem + Pico's 1rem)
- Strengthened section separation on index.html — increased from Pico default 1rem to 2.5rem
- Unified project.html vertical rhythm — hero, meta-grid, doc-tabs all use 1.5rem bottom margin
- Fixed footer double bottom spacing — reset last-child margin to prevent Pico padding + p margin stacking
- Added .back-link class on project.html for visual de-emphasis of back navigation

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
- Created `docs/PROJECT_DOCS.md` — combined status tracker and update guide for mirrored docs
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
