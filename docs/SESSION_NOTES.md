# Session Notes

## Worked on

Full 12-pattern self-audit ("does glow-props adhere to its own patterns?") and
the fix pass that followed. One auditor per pattern doc, findings verified
against source AND build output, then everything fixable fixed the same
session.

## Accomplished

- **Two production breaks found and fixed.** (1) The shipped service worker
  threw `add-to-cache-list-conflicting-entries` — four icons entered the
  precache twice (bare-URL `revision:null` from the glob + a revisioned copy
  from includeAssets/manifest injection), which kills the whole precache layer
  at SW evaluation. Now `globIgnores` excludes the icon files and each has
  exactly one revisioned entry. (2) All 12 prerendered pattern pages loaded
  `theme.js`, favicon, and the navbar mark via document-relative paths that
  404 from `patterns/<slug>/` — theme picker and burger menu were dead there.
  `rebaseDocumentRelativeAssets()` in `vite.config.js` now rewrites them, for
  pattern AND project prerenders.
- **Offline actually covers the content now:** `.md` added to `globPatterns`
  (the site's body content), `ignoreURLParametersMatching` covers `?name=`
  (project/pattern pages) and `?v=` (versioned icons), Google Fonts runtime-
  cached.
- **PWA_ICON_CACHE_BUST implemented** (was falsely "N/A" in the gap matrix):
  sha256 `iconVersion()` → `?v=` on manifest icons, page links, and the navbar
  mark; `iconCacheBustHtml()` fail-loud plugin; `npm run verify:icons` tripwire
  gating the deploy; stale-icon `<details>` disclosure in the install modal.
  The manifest's maskable icon is now a real full-bleed
  `icon-1024-maskable.png` (transparent one was declared maskable before).
- **Projects prerendered** like patterns: `prerenderProjectPages()` emits
  `projects/<slug>/index.html` with per-project head tags + README body;
  sitemap lists clean URLs; `project.html` reads its slug from the path and
  canonicalizes to the clean URL; index.html project links updated; static
  pattern cards injected into the built landing page for non-JS crawlers.
- **Burger menu a11y:** focus trap + Arrow/Home/End navigation, `inert` +
  `aria-hidden` while closed, 44px trigger, active theme visually distinct
  from hover, aria-label flips with the toggle.
- **Timer leaks:** abort timers cleared in catch paths (pattern/project.html),
  `index.html` IIFE on an AbortController with `window.__home.dispose()`,
  `window.__project.dispose()` for the tab listener, head-common's
  beforeinstallprompt capture guarded and released by pwa.js's dispose.
  `verify:timer-cleanup` now scans inline HTML scripts and all `public/*.js`.
- **PWA install flow:** 7 Chromium browsers detected (`CHROMIUM_BROWSERS`),
  iOS non-Safari users get Safari-redirect instructions, 5s diagnostic
  fallback for suppressed prompts, `visibilitychange` update check,
  `wasJustUpdated()` guard in `onNeedRefresh`, toasts stack in a
  `flex-col-reverse` container.
- **CSS/theme:** skip link `z-90 → z-50`; `@source not "./docs"` (pattern docs'
  violation examples were being harvested into shipped CSS);
  `print-color-adjust: exact` + `.print-avoid-break` + `no-print` footers;
  manifest `theme_color` = coffee base-100 `#261b25`; theme switches are
  transition-free via a two-frame `.theme-switching` class;
  `generate-meta-colors.mjs` now also rewrites `pattern.html`.
- **Docs made honest:** gap matrix row corrected (BURGER_MENU Partial,
  DEBUG_SYSTEM Missing-pending-decision, ICON_CACHE_BUST Pass, EVENT_BUS N/A
  with rationale), CLAUDE.md gained Not Applicable Patterns + deviation notes +
  corrected stale prebuild claim, `TIMER_LEAKS.md` cross-ref fixed
  (`bus.subscribe()` → `bus.on()`), AI_MISTAKES entry on unverified
  self-grading.

## Current state

`vite build` clean. All three tripwires green: `verify:timer-cleanup`,
`verify:seo` (extended: project pages, OG dims on all pages, noindex guard,
static pattern links), `verify:icons` (new). Precache 120 entries / ~2.2 MB.
Sitemap 29 URLs (1 + 12 patterns + 16 projects, all clean forms).

## Key context

- **DEBUG_SYSTEM needs an owner decision** — implement the pattern's vanilla-JS
  variant or document a real N/A. It's the one audit finding deliberately not
  fixed: a visible debug pill on a public portfolio is a product call. Tracked
  in TODO.md with the full reasoning.
- The deploy workflow now runs three verify gates; `verify:icons` and the
  dist-level parts of `verify:seo` are only as current as the last build.
- Remaining optional items (BURGER_MENU adornments, display-mode listener,
  install analytics, `version.json`) are in TODO.md under "glow-props (self)".
