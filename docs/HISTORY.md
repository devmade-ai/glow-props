# History

## 2026-04-06

### Cross-repo pattern audit — backport field improvements into reference docs

Audited all 12 active devmade-ai repos for implementation of the 7 suggested patterns. Identified ~70 improvements from field implementations and backported them into the reference pattern docs.

**APP_ICONS.md:**
- Added `apple-touch-icon.png` (180x180) to output list (Apple's recommended iOS size)
- Added favicon.ico generation — both manual ICO packing (zero-dep) and `png-to-ico` package
- Added Expo/Metro copy step for `public/` directory

**BURGER_MENU.md:**
- Added extracted hooks: `useDisclosureFocus`, `useFocusTrap`, `useEscapeKey`
- Added ArrowUp/ArrowDown/Home/End keyboard navigation with wrapping
- Added `icon`, `iconClass`, `disabled`, `highlight`, `highlightColor` to MenuItem interface
- Added `ModalBackdrop` extraction and haptic feedback for React Native
- Added version display footer, 44px minimum touch targets, DaisyUI `menu` classes
- Added Vue variant notes, error routing to debug system

**DEBUG_SYSTEM.md:**
- Complete rewrite with full code examples
- Added `generateReport()` to the debugLog module (not just the pill UI)
- Added `console.error`/`console.warn` interception for automatic React warning capture
- Added URL redaction in debug reports to prevent token leaking
- Added numeric `id` field, `(string & {})` typed source fallback, structured `details` as Record
- Added immediate subscriber delivery (new subscribers get existing entries)
- Added PWA Diagnostics tab with active health checks
- Added pre-React inline pill for bundle load failure scenarios (20s loading timeout)
- Added multiple clipboard fallbacks (ClipboardItem Blob → writeText → textarea → visible textarea)
- Added failure diagnosis utility (`diagnoseFailure`)
- Added hydration-safe initialization patterns

**DOWNLOAD_PDF.md:**
- Added `print-color-adjust: exact` for preserving background colors in print
- Added `print-avoid-break` utility class (composable alternative to global `section` rule)
- Added document verification hash pattern (optional)

**PWA_SYSTEM.md:**
- Added module-level singleton pattern for update state (survives component remounts)
- Added visibility-based update checks on `visibilitychange`
- Added `controllerchange` reload guard with user-controlled activation
- Added `wasJustUpdated()` 30-second suppression
- Added manual `checkForUpdate()` with typed result and `checking` state
- Expanded browser detection to 7 Chromium browsers (Samsung, Opera, Vivaldi, Arc)
- Added Brave Mobile UA stripping bug workaround
- Added 5-second diagnostic timeout for missing `beforeinstallprompt`
- Added Chrome 90-day cooldown handling with manual instruction fallback
- Added install analytics tracking (localStorage, 50-event cap)
- Added display-mode change listener for browser-menu installation detection
- Added iOS non-Safari cross-redirect instructions
- Added custom SW section for non-Vite projects (Expo/Metro)
- Added `version.json` supplementary update detection
- Added Workbox runtime caching examples (Google Fonts)
- Added debug logging throughout PWA hooks

**THEME_DARK_MODE.md:**
- Corrected canva-grid documentation (uses combo-based, not per-mode independent)
- Added full `generate-theme-meta.mjs` script with oklch→hex conversion
- Extracted `safeStorage` into shared utility module with `safeRemoveItem`
- Added Zustand store pattern for React Native
- Added `withAlpha()` utility for hex colors with opacity
- Added module-level theme dedup guard
- Added `_asyncLoadStarted` guard for preventing duplicate AsyncStorage reads

**EVENT_BUS.md (new pattern):**
- Created new implementation doc for typed pub/sub event bus factory
- Pattern sourced from graphiki where it's used across graph, workspace, and view services
- Factory creates a type-safe bus with catch-all "changed" event and per-listener error isolation
- Documents the encapsulation pattern: export `on` (subscribe), keep `emit` private

**HTTPS_PROXY.md:**
- Added `fetchWithRetry()` with rate-limit handling and exponential backoff
- Refactored to shared `handleResponse()` (deduplicates direct/proxy paths)
- Changed return shape to `{ status, data }` for HTTP status visibility
- Added `logProxyStatus()` startup diagnostic

## 2026-04-05

### Markdown renderer — replace regex parser with marked library

The hand-rolled regex markdown parser had fundamental structural bugs causing content truncation on pages with code blocks. Replaced with `marked` v17 (~43KB bundled / 13KB gzipped).

**Root cause of truncation:** Multi-line fenced code block content was matched by the paragraph regex (`/gm` flag processes each line independently). The `<pre><code>` wrapper only covered the first line, so middle lines got wrapped in `<p>` tags — breaking the `<pre>` structure and double-escaping all HTML entities.

**Additional bugs fixed:**
- Raw `<` characters in markdown text passed unescaped into innerHTML, creating broken HTML elements that swallowed subsequent content
- Code block content double-escaped (`&lt;` → `&amp;lt;`) by the catch-all inline formatting pass
- Table cells double-processed (formatted by inlineMarkdown in the table handler, then re-processed by the catch-all pass)
- Table headers only escaped, not formatted (missing bold/italic/link/code in headers)
- Windows `\r\n` line endings broke the code block regex which required `\n`

**New architecture:**
- `src/markdown.js` — ES module importing `marked`, configured with custom renderer, exposes `window.md`
- Custom renderer overrides only what needs DaisyUI styling: code blocks (copy button wrapper), codespan (badge classes), tables (scrollable wrapper), links (URL validation + link-primary), strong (font-semibold), list items (DaisyUI checkbox styling for task lists)
- Everything else uses marked defaults (headings, paragraphs, blockquotes, regular lists, emphasis, horizontal rules)
- project.html and pattern.html inline scripts changed to `type="module"` (execute after markdown.js in document order)

**CSS additions:**
- `.md-render ol` — numbered lists now correctly use `<ol>` (old parser incorrectly used `<ul>` for everything)
- `.md-render em` — explicit italic rule for marked's `<em>` output
- `.code-block-wrap` / `.code-copy-btn` — per-code-block copy button positioned top-right
- `.md-render { user-select: text }` — ensures text is always selectable regardless of DaisyUI defaults

**Verified:** 42 markdown files render correctly with zero double-escaped entities and matching code block counts.

## 2026-04-02

### PWA status bar theme-color — dynamic per-theme meta tag

Implemented dynamic `<meta name="theme-color">` that updates on every DaisyUI theme change, matching the canva-grid pattern. The status bar (time, wifi, battery icons) now reflects the active theme color.

**Color strategy:**
- Light themes with dark/saturated primary (L ≤ ~65%): Use primary color for a colorful branded bar (e.g., nord `#5E81AC`, valentine `#F43098`, autumn `#8C0327`)
- Light themes with too-light primary (L > ~65%): Use neutral or alternative dark color (e.g., cupcake neutral `#262629`, pastel neutral `#61738D`, emerald secondary `#377CFB`)
- Dark themes: Use base-100 background (e.g., night `#0F172A`, dracula `#282A36`, coffee `#261B25`)
- wireframe: Uses base-content `#161616` (only dark option — primary, neutral, secondary are all identical light gray)

**Changes:**
- Added `<meta name="theme-color">` with media queries to index.html, project.html, pattern.html (two tags: light/dark OS preference, both overwritten by JS)
- Added `META_COLORS` lookup map (35 hex values) and `updateMetaThemeColor()` to `public/theme.js`
- Wired `updateMetaThemeColor()` into `applyTheme()` and initialization
- Added compact color map to bootstrap script in `partials/head-common.html` for flash prevention
- Updated `THEME_DARK_MODE.md` — expanded PWA Meta Theme-Color section with full-catalog pattern, color strategy rules, HTML setup, bootstrap integration
- Updated Key Lesson #7 — now explains white-text-safe color selection, not just "needs hex"
- Added resolution note to `AI_MISTAKES.md` for the 2026-03-30 invisible status bar bug

**Why not page background for light themes:** The original approach (`#ffffff` for light) caused invisible status bar text when the OS color scheme opposed the app theme. The OS controls text/icon color — the app only controls background. All hex values must be dark or saturated enough for white text.

### Full 9-trigger parallel audit sweep — comprehensive fixes

Ran all 9 audit triggers (rev, aud, doc, tap, cln, perf, sec, dbg, imp) in parallel. Applied fixes across all categories:

**Deduplication (cleanup):**
- Extracted shared `<head>` content (bootstrap script, beforeinstallprompt, fonts, CSS) into `partials/head-common.html` — eliminates 80+ lines of duplication between index.html and project.html
- Extracted skip-to-content link into `partials/skip-link.html`
- Extended `htmlPartials` Vite plugin to support `<!-- HEAD_COMMON -->` and `<!-- SKIP_LINK -->` in addition to `<!-- NAVBAR:prefix -->`
- Theme arrays remain duplicated in head-common.html and theme.js (intentional — inline scripts must run synchronously before theme.js loads for flash prevention)

**Security:**
- Added Content Security Policy meta tag to both HTML files (self + inline + Google Fonts)
- Added canonical URL to index.html
- Fixed `isSafeUrl()` — now decodes percent-encoded characters before protocol check (prevents `%3Ajavascript:` bypass)
- Added projectName format validation (alphanumeric + hyphens only) to prevent path traversal
- Added theme validation in `getStoredTheme()` — validates stored theme against known lists, falls back to default if corrupted

**Accessibility:**
- Added `@media (prefers-reduced-motion: reduce)` — disables all animations, transitions, and smooth scrolling (WCAG 2.1 SC 2.3.3)
- Added focus management on tab switches in project.html — moves focus to content area for screen reader users
- Fixed burger menu layout shift — added `scrollbar-gutter: stable` before `overflow: hidden` to preserve scrollbar space

**Error handling:**
- Added 15s AbortController timeout on all doc file fetches (previously only meta.json had a timeout)
- Differentiated timeout vs 404 errors on meta.json fetch — timeout shows "Request timed out" with retry button
- Failed doc file loads now show error state instead of perpetual "Loading..."
- Copy button now shows "Copy failed" on clipboard API errors instead of silent failure
- Replaced empty `catch(e) {}` in bootstrap script with descriptive comment explaining the intentional catch
- Added `console.warn` to PWA install prompt error catch for debugging
- Replaced terse `/* sandboxed */` comments with descriptive explanations in pwa.js

**Cleanup:**
- Removed all 30+ `onclick="event.stopPropagation()"` from card links — replaced with single delegated check in card click handler
- Removed unused `animate-fade-in` CSS utility and `fade-in` keyframes (only `animate-fade-in-up` is used)
- Removed unused `data-delay="5"` CSS selector (only 1-4 are used)
- Removed `console.log` from `copyRootFiles` Vite plugin
- Added defensive defaults for all meta.json fields in render() to prevent "undefined" in HTML

**Performance:**
- Font loading: Changed Google Fonts `<link>` from render-blocking to non-blocking (`media="print" onload="this.media='all'"`)

**Improvements:**
- Added build-time meta.json validation Vite plugin — checks required fields, validates doc file references exist
- Added markdown renderer CSS classes to main.css — moved inline Tailwind class strings out of JS regexes into `.md-render` parent selector
- Simplified `renderMarkdown()` to output bare semantic HTML elements styled by CSS

**Documentation:**
- Added `partials/` directory to README project structure
- Added `docs/implementations/` to README project structure

### Standardize PWA install/update patterns from cross-repo audit
- Audited canva-grid, four-ems, sync-tone, and glow-props PWA implementations
- Rewrote `docs/implementations/PWA_SYSTEM.md` — standardized on canva-grid patterns with four-ems TypeScript types
- Added new sections: Toast System, Install Instructions Modal (data-driven), Install & Update UI Patterns, Cache Headers, ChunkLoadError Prevention, Platform Gotchas
- Applied all patterns to `src/pwa.js` (vanilla JS adaptation):
  - Replaced hardcoded HTML install instructions with data-driven `getInstallInstructions()`
  - Added benefits section to install modal (works offline, dock, full-screen)
  - Added `appinstalled` event listener to clean up state on successful install
  - Added focus trap to install modal for keyboard accessibility
  - Added reusable `showToast()` with DaisyUI semantic colors, exit animation, safe area
  - Switched browser detection to coarse types (safari/firefox) with iOS/macOS split inside `getInstallInstructions()`
  - Added `backdrop-blur-sm` to install modal backdrop
  - Added 1s timeout for Safari/Firefox manual instruction fallback
- Added `cleanupOutdatedCaches: true` and `globPatterns` to Workbox config in `vite.config.js`
- Key Lessons reorganized into categories: Icons & Manifest, Install Prompt, Service Worker Updates, Caching & Deployment, UI Patterns, General

### Quick wins from audit — touch feedback, sitemap, navbar deduplication
- Added `:active` touch feedback on card-interactive (scale 0.98 on tap)
- Added `robots.txt` and `sitemap.xml` to `public/` for SEO
- Extracted entire navbar (440 lines) into `partials/navbar.html` — injected at build time by custom `htmlPartials` Vite plugin with `{{NAV_PREFIX}}` token replacement. Eliminates burger menu + theme picker duplication across index.html and project.html.
- Cleaned up TODO.md — removed 14 intentional-tradeoff items, kept only actionable work

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
