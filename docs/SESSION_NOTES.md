# Session Notes

## Latest session (2026-08-03): fleet-wide PWA pattern audit

**Worked on:** auditing every PWA repo in the fleet against the PWA pattern docs
and folding the fixes back upstream. Six parallel audits — fl-farlume (Vue),
graphiki, see-veo, kl-website, qi-invoice, and glow-props itself. Sibling repos
were attached with `add_repo` + shallow clones under `/workspace/`; the
`GITHUB_ALL_REPO_TOKEN` API path is now blocked by the session proxy for repos
not attached to the session, so the CLAUDE.md "never clone siblings, use the
API" note no longer holds in this environment.

**Headline finding:** the pattern docs lagged the fleet's own fixes, and several
snippets in them were actively buggy — multiple repos had independently fixed the
same things, which is what made the findings trustworthy.

**Fixed in `docs/implementations/PWA_SYSTEM.md`:**
- `includeAssets` + `globPatterns` overlap (the doc *recommended* the combination)
  → duplicate precache entries → `add-to-cache-list-conflicting-entries` thrown
  inside the worker → SW precaches nothing while the build log looks healthy.
  Now a named invariant with both valid resolutions.
- Launch-apply moved from `onRegisteredSW` to `onNeedRefresh` behind a 10s
  eligibility window + once-guard (the old snippet could skipWaiting before any
  reload listener existed).
- `install()` clears the prompt *before* calling it — the event is single-use, so
  the old "clear only on accepted" form threw on the tap after a dismissal.
- `detectBrowser()` gained `CriOS`/`FxiOS`/`EdgiOS`; `getInstallInstructions()`
  gained iPadOS `MacIntel` + `maxTouchPoints` detection.
- `.catch()` on every background `registration.update()` (it rejects offline).
- `checkForUpdate` sample now matches the doc's own canonical union, reads
  `registration.waiting`, and shares one in-flight promise.
- `hasUpdate` no longer ORs in `needRefresh` (which bypassed the suppression).
- `onRegisteredSW` replaces deprecated `onRegistered`; the two install-capture
  snippets now use ONE window key (they disagreed, silently breaking early
  capture for anyone copy-pasting); `checkVersionUpdate` persists before
  reporting (it re-detected the same update forever).
- **New sections:** Testing (virtual-module alias + singleton reset), the
  `dontCacheBustURLsMatching` trap, large-asset strategy (ML/wasm), precache
  hygiene + a dist-level `verify:precache` tripwire, Vercel cache headers,
  Vue and SSR/SSG framework variants, `useSyncExternalStore` guidance, and
  three platform gotchas (Android `100dvh` latch after the update reload,
  `share_target` POST, `apple-touch-startup-image`).
- Key Lessons renumbered and extended to 49.

**Fixed in `PWA_ICON_CACHE_BUST.md`:** fail-loud `versioned()`, `replaceAll` +
`order: 'post'` + per-entry scoping in the HTML plugin, the single-precache-entry
mechanism, `ignoreURLParametersMatching` replacing (not extending) defaults,
duplicate-URL + manifest-icon tripwire tests, and fl-farlume's active
icon-staleness detection (`iconsHash` in version.json → standalone-only reinstall
banner) which closes invariant 5.

**Fixed in `APP_ICONS.md`:** maskable safe zone is a CIRCLE of radius 40% (not
the inner-80% square), sharp's composite-runs-last pipeline order, the
transparent-source/composited-maskable strategy, an ICO container byte tripwire,
and removal of a stale see-veo citation.

**Also:** `docs/TODO.md` gained a "PWA drift found in the 2026-08-03 fleet PWA
audit" section — per-repo repo-side fixes for all six repos, including 8 items
for glow-props itself (unhandled hourly-poll rejection, dead 1s timer, the same
iOS detection hole, event buffering before the React bridge subscribes,
`useSyncExternalStore` migration, and an entry-server import tripwire).

### Round 2 — the first pass had covered 6 of 15 PWAs

Selecting repos by the portfolio's `badge`/`tech` metadata under-covered badly:
**only 5 repos advertise PWA-ness, but 15 ship a service worker.** The user's
home screen was the ground truth. Nine more repos audited in a second pass:
four-ems, canva-grid, model-pear, repo-tor, dm-website, fh-fuelhunt, intxt,
sun-sea-o, web-arch. Two were entirely untracked (`dm-website`, `web-arch` —
"redline"), and `model-pear` turned out to be a **SvelteKit** PWA recorded in
both the portfolio and TODO.md as a React non-PWA.

**Two repos have a dead service worker in production**, both verified against
real workbox/plugin source rather than inferred: repo-tor throws
`add-to-cache-list-conflicting-entries` on evaluation (its `includeAssets` +
the default `dontCacheBustURLsMatching` produce two cache keys for one URL),
and model-pear's `navigateFallback: '/200.html'` names a URL workbox never
precached, so `createHandlerBoundToURL` throws before install.

**Corrections to doc text written earlier the same session:**
- The duplicate-precache rule was overstated as unconditional. It is fatal only
  when the two revisions *disagree*; identical revisions dedupe silently. The
  doc now carries the verified mechanism (three sources including the implicit
  `includeManifestIcons`, transform ordering, cache-key equality) so triage
  isn't guesswork — while keeping "never duplicate" as the rule.
- The in-flight promise added to `checkForUpdate` turned a hang into a
  *permanent* one: `registration.update()` can never settle (measured in
  Chromium), so the shared promise wedges every later call. Now bounded by
  `Promise.race` with the verdict read off the registration.
- `navigateFallback` guidance was wrong in three ways at once, and is rewritten.

**Other significant absorptions:** `updateServiceWorker(true)`'s argument has
been inert since 0.13.2 and the plugin installs its own unconditional reload on
`controlling` (so policy step 2's "never reload mid-session" needs
`onNeedReload` to be real); `useRegisterSW` registers once per *hook instance*,
so the doc's own snippet caused N registrations in three repos; a whole missing
section on authenticated apps (the cache key is the URL, so one user's response
is served to the next, and sign-out doesn't clear Cache Storage); a rewritten
custom-SW section (the old sample had seven production-breaking defects and its
version-injection advice was actively harmful); runtime-caching rules including
the opaque-response trap the doc itself prescribed; CSP; draft safety; a
recovery ladder for when the worker itself is the bug; and a SvelteKit variant.

**State:** docs only — no source changes. Build green, all three verify gates
green, served `dist/patterns/*.md` byte-identical to source. Full findings
checkpointed at `scratchpad/round2-findings.md` (520 lines). All repo-side
drift is queued in TODO.md, not started.

---

## Previous session

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

## Addendum 3 (same session): round-2 review-fix pass ("fix all")

A second 3-agent fresh-eyes review of PR #59 (post-fix head) found 6 MEDIUM +
16 LOW — all fixed. One claimed HIGH (card-to-card tap needing a double tap)
was REFUTED empirically with Playwright before fixing anything: one tap
switches cards.

- **Security:** `isSafeUrl` now rejects backslash protocol-relative forms
  (`/\evil.com` — browsers normalize `\`→`/`; verified `new URL` resolves it
  off-site). Bare `.md` cross-links now land on the RENDERED pattern page
  (filename↔slug fleet convention, documented in the renderer).
- **A11y:** `useFocusTrap`'s FOCUSABLE selector includes `summary` (the
  InstallModal disclosure was untabbable and could leak focus out of the
  dialog); ProjectPage doc tabs are now the FULL ARIA tabs pattern (roving
  tabindex, arrow/Home/End, labelled `tabpanel`, `aria-disabled` on
  unavailable tabs — arrow nav keeps focus on the tab, click focuses the
  panel); heading levels fixed (info cards h2, all home cards h3); UpdateBanner
  announces via role=status.
- **Maskable icon regenerated:** the mark's corner arcs reached ~523px from
  center vs the 410px circular safe zone — Pixel-style round masks cropped all
  four corners. generate-icons.mjs now composites a 780px render onto the
  white 1024 canvas (≤801px keeps the arcs inside; only the maskable PNG's
  bytes changed).
- **Theme:** the cross-tab storage listener falls back to the OS preference
  when darkMode is unset (random-theme-on-load in another tab no longer flips
  an OS-dark tab to light).
- **PWA/copy:** early "Check for updates" says "Still starting up" instead of
  blaming the browser; HomePage manifest fetch got ok-check + 10s timeout +
  actionable error; empty-body error states filled in.
- **Build/dev:** stripBase drops query strings (no more 200-HTML for
  query-stringed doc fetches); validateProjectMeta warns under `vite dev` but
  still fails the build; og-image gets a real precache revision via
  globIgnores+includeAssets (was revision:null → stale forever for installed
  SWs); generate-meta-colors fails loud when a format-coupled regex stops
  matching; verify-seo's parser now mirrors the manifest's dedupe/numeric
  rules; verify-timer-cleanup's plain-module rule covers rAF and
  IntersectionObserver.
- **Docs drift:** seoMeta JSDoc/canonical comments, main.css markdown pointer,
  CLAUDE.md "three→four inline scripts", TODO.md fully-clean list includes
  glow-props again (contradiction removed); BurgerMenu keepOpen errors route
  through the same debug surface as close-then-act.
- Verified: build + three tripwires green; app smoke green; NEW a11y/security
  smoke green (arrow-key tab nav live-tested, no unsafe hrefs in rendered
  markdown, .md links rewritten); debug smoke green.

## Addendum 4 (same session): round-3 review-fix pass ("fix all")

A third 3-agent review (round-2-regression hunt, cold state/data-flow sweep,
docs-coherence audit) found 1 HIGH + 2 real MEDIUMs + edge/docs residue — all
fixed. The jsdom-based claim that card switching needs two taps was re-tested
in real Chromium (3 trials): one tap switches cards — refuted; jsdom's event
dispatch does not match browser behavior here.

- **HIGH (round-2 regression): project-doc .md links 404'd.** The blanket
  bare-`X.md` → `/patterns/<slug>/` rewrite also caught project READMEs
  (USER_GUIDE.md etc. → 16 dead links across 8 prerendered project pages,
  confirmed in dist). The rewrite is now caller-owned: `renderMarkdown(text,
  { resolveMdLink })` with `patternMdLinkResolver` (rendered pattern pages)
  and `projectMdLinkResolver(slug)` (the project's own served doc files) —
  verified in the rebuilt dist for both families.
- **BurgerMenu error swallowing (round-2 regression):** routing to
  `__debugPushError` was wrong — that global EXISTS in prod (head-partial
  buffer nothing drains). Both action paths now `console.error`
  unconditionally; the dev pill still sees it via console interception.
- **Maskable icon:** two-pass composite + removeAlpha — the chained flatten
  ran before composite (sharp pipeline order) and the file kept an alpha
  channel; now genuinely 3-channel. PNG regenerated again.
- **Hardening:** ProjectView roving tabindex falls back to the first
  available tab (malformed meta can't drop the tablist from tab order) and
  the tabpanel's aria-labelledby only points at ids that render; ProjectView
  memoizes renderMarkdown (was re-parsing ~50KB per keystroke/tab switch);
  PwaManager resyncs once on mount (subscribe-only gap); empty pattern
  manifest gets an empty-state message; storage-blocked preference toggles
  toast an explanation (readback check in toggleAutoUpdate +
  toggleRandomTheme return value consumed by Navbar); onRegisterError tracked
  so "still starting up" can't be claimed forever; validateProjectMeta checks
  array/object shapes, not just presence; verify-seo slug parity via
  String() coercion (mirrors manifest exactly); verify-timer-cleanup message
  lists its actual verbs.
- **Docs:** TODO.md mood-tag "remaining nicety" + "three inline scripts" +
  deleted-file citations corrected; README head-partial description, scripts
  tree (all six), src tree (debugMount, debugLog, mood tags); head-common
  bootstrap comment points at themeCatalog.js; CLAUDE.md TutorialModal note
  scoped to downstream repos + PROJECT_DOCS.md added to the Documentation
  section.
- Verified: build + three tripwires green; per-context link resolution
  checked in dist (patterns → rendered pages, projects → own served docs,
  targets exist); both smoke suites green.
