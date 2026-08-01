# Session Notes

## Worked on

Two major passes in one session: (1) a full 12-pattern self-audit with a
same-day fix pass (two production breaks found and fixed, PWA_ICON_CACHE_BUST
implemented, gap matrix corrected), then (2) the **React conversion** — the
whole site moved from vanilla JS to React 19 + Vite, MPA with build-time SSG,
making glow-props the fleet's reference implementation of the patterns' React
variants.

## Accomplished

- **Audit fix pass** (details in TODO.md "full self-audit + fix pass"): SW
  precache conflict fixed, offline coverage (.md, ?name=, fonts), icon
  cache-busting + `verify:icons` tripwire, full-bleed maskable icon, project
  prerendering, menu a11y, timer leaks, install-flow gaps, z-index/print/theme
  fixes, honest gap matrix + CLAUDE.md N/A declarations.
- **React conversion:**
  - Three entries (`index/pattern/project.html` keep their literal head tags +
    the inline head partial), one React root each (`src/main-*.jsx`).
  - `src/components/` — `BurgerMenu.jsx` per BURGER_MENU.md's reference
    (disclosure, portaled backdrop, arrow/Home/End, close-then-act, MenuItem
    extensions: `href`, `keepOpen`, `indicator`, `ariaLabel`, `render`),
    `Navbar` with the Approach-A theme picker, `PageShell`, `Toast`
    (ToastProvider), `PwaManager`/`InstallModal`/`UpdateBanner`, `Markdown`
    (delegated copy buttons, no window globals).
  - `src/lib/` — `pwa.js` (module singleton per PWA_SYSTEM.md; registers SW,
    owns update policy + install flow, subscriber set + event emitter),
    `theme.js` (Approach A singleton; cross-tab sync, OS fallback,
    theme-switching transition suppression), `markdown.js` (shared marked
    renderer used by client AND SSG), `safeStorage.js`, `themeCatalog.js`
    (generator-owned).
  - **SSG:** `prerenderPages()` in vite.config spins a nested Vite server
    (`configFile: false`), `ssrLoadModule`s `src/entry-server.jsx`, and
    `renderToString`s the landing page + 12 patterns + 16 projects into each
    built template's `<div id="root"></div>`, with per-item head tags replaced
    literal-for-literal. Render-then-replace on mount, NOT hydration (pages
    fetch at runtime). All links base-absolute — the old NAV_PREFIX and path
    rewriting are gone.
  - **SSR boundary:** `entry-server` must never import `src/lib/pwa.js`
    (`virtual:pwa-register` + SW registration on import); PWA state reaches
    SSR-rendered components via `PwaContext`, whose default value is the
    SSR-safe shape.
  - **Deleted:** `public/theme.js`, `partials/navbar.html`,
    `partials/skip-link.html`, old `src/pwa.js`/`src/markdown.js`, all inline
    page scripts. `partials/head-common.html` survives (GA + pre-paint
    bootstrap + install capture must stay pre-module).
  - **Generator:** `generate-meta-colors.mjs` now writes
    `src/lib/themeCatalog.js` + the bootstrap copy + three HTML metas.
  - **Tripwires:** `verify:timer-cleanup` — pairing rule for React files,
    dispose blocks for lib singletons, inline-script rules unchanged;
    `verify:seo` — SSG assertions over `#root`/`<main>`, static
    pattern+project links on the landing page, seoMeta wiring checked in the
    React pages; `verify:icons` — head links + `__ICON_VERSIONS__` define
    (versions the React navbar mark).
  - **Verified:** build + all three tripwires green; Playwright smoke test
    passes (menu open/keyboard/Escape, mode toggle stays open, theme pick
    applies, prerendered pattern + project pages mount, legacy `?name=` URLs
    canonicalize, doc tabs load).

## Current state

`vite build` clean: SSG logs index + 12 pattern + 16 project pages; precache
120 entries (~1.9 MB); sitemap 29 URLs. All three verify gates green. New
deps: `react`, `react-dom` (runtime), `@vitejs/plugin-react@5` (Vite 7
compatible — v6 needs Vite 8).

## Key context

- **DEBUG_SYSTEM and mood tags: CLOSED later this session** — see the first
  addendum below. **PR #59 review-fix pass also CLOSED** — see the second
  addendum; no open repo items remain in TODO.md.
- The smoke test lives in the session scratchpad, not the repo — rerun by
  starting `vite preview` and driving Chromium at the five checks above, or
  promote it into the repo as a real script if it should gate CI.
- Downstream repos can now reference glow-props source directly for the React
  pattern variants instead of only the docs' inline snippets.

## Addendum (same session): DEBUG_SYSTEM + PWA extras + mood tags

- **DEBUG_SYSTEM implemented, DEV-gated** (matrix `Missing → Pass (DEV)`):
  `src/lib/debugLog.js` (store, console interception, global capture, report
  with redacted URLs, PWA diagnostics probes), `src/components/debug/
  DebugPill.jsx` (inline styles, separate root via `src/debugMount.jsx`,
  z-80), loaded only through `if (import.meta.env.DEV) import(...)` in the
  page entries — production bundles verified free of the subsystem. The
  pre-module error capture + 20s plain-language load watchdog in
  `partials/head-common.html` DOES run in prod; entries clear it after mount.
  PWA lifecycle reaches the pill via the optional `window.__debugAdd` bridge.
- **Install analytics** (`pwa-install-events`, localStorage, cap 50) landed in
  `src/lib/pwa.js` — prompted / installed / installed-via-browser / dismissed /
  instructions-viewed — displayed in the pill's PWA tab. Earlier the same
  session: display-mode change listener; `version.json` decided against.
- **Mood tags**: `src/data/themeDescriptions.js` (hand-authored, outside the
  generator-owned catalog) rendered in the theme picker per BURGER_MENU.md.
- **Shared clipboard helper** upgraded to the full DEBUG_SYSTEM cascade
  (ClipboardItem Blob → writeText → textarea).
- **Dev/build asymmetry fix**: Vite's dev html pipeline rewrites asset URLs
  before post transforms, so `iconCacheBustHtml()` now accepts both the
  relative (build) and base-prefixed (dev) literal forms — the source pages
  keep relative icon links and `prerenderPages()` absolutizes them for nested
  pages via `iconLinkPairs()`.
- Verified: build + three tripwires green; app smoke test green (picker
  selector updated for mood tags); debug smoke test green (pill mounts in dev
  with live diagnostics + funnel, absent in prod, watchdog cleared both).

## Addendum 2 (same session): PR #59 review-fix pass ("fix all")

A 3-agent fresh-context review of PR #59 found 2 HIGH, 7 MEDIUM, ~15 LOW —
all fixed:

- **HIGH-1 (regression):** tapping a home card wiped `animate-in` (React owns
  className; the observer's imperative classList write was lost on re-render)
  → card faded to opacity:0. `useScrollAnimate` now returns a React-state
  `revealed` Set keyed by `data-reveal-id`; cards AND section headings render
  `animate-in` from it. Smoke test gained a card-tap regression check.
- **HIGH-2:** both dev middlewares (`/patterns/*.md`, `/patterns/manifest.json`)
  matched un-prefixed URLs, but configureServer middlewares run BEFORE Vite
  strips `/glow-props/` — every dev fetch 404'd. `stripBase()` added; verified
  live with curl (both 200 under the base).
- **MEDIUMs:** `$`-expansion killed in applyHead/injectRoot/iconCacheBustHtml
  (function-replacement form); `validateProjectMeta` now `this.error` (fails
  the build as its comment promised); InstallModal got role=dialog +
  aria-modal + labelled title + focus-in on open (the trap never engaged
  without it); visibilitychange SW update throttled 60s + rejection swallowed;
  applyUpdate falls back to plain reload when no worker is waiting;
  suppressed onNeedRefresh still records `updateAvailable`; theme mediaListener
  passes skipPersist (OS-follow is not a user choice).
- **LOWs (selection):** Toast viewport always mounted (live region exists
  before content) + CSS `:has` shift above the update banner; empty project
  doc → failed state (was eternal Loading); per-fetch AbortControllers with
  timers cleared after body parse; retry offered on all load failures;
  isSafeUrl on meta.json hrefs + protocol-relative `//` rejected + image
  renderer override + relative `X.md` links anchored to `<base>/patterns/`;
  debug probe reads durable `__pwaPromptCaptured`; pill auto-scroll keyed on
  last entry id; install-funnel Clear button; watchdog cleared from PageShell
  effect (post-commit, not module eval) and message differentiates prerendered
  pages; theme.js rAFs tracked + cancelled in dispose; install analytics via
  safeStorage; stale comments fixed (main.css, seoMeta.js, pattern/project
  html, CHROMIUM_BROWSERS).
- **Tripwires hardened:** verify-icons dropped the meaningless plugin-order
  assert (VitePWA is enforce:'post'), requires the navbar mark on the SSG'd
  index, asserts prerendered pages are precached; verify-seo counts only
  manifest-eligible pattern docs (frontmatter-parsed, quote-stripped) and
  asserts dist/robots.txt (closing the last TODO item); verify-timer-cleanup
  checks inline scripts PER BLOCK and pairs requestAnimationFrame.
- Verified: build + three tripwires green, dev middlewares curl-checked, both
  smoke suites green (incl. new card-tap + heading-reveal checks).
