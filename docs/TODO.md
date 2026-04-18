# TODO

## Missing Documentation (source repos)

- [ ] **model-pear** — Create User Guide, Testing Guide, and TutorialModal in the source repo, then mirror here
- [ ] **see-veo** — Create User Guide, Testing Guide, and TutorialModal in the source repo, then mirror here

## Future Improvements

- [ ] **sun-sea-o** — Add TutorialModal in source repo, then extract as TUTORIAL.md here
- [ ] **four-ems** — Add TutorialModal in source repo, then extract as TUTORIAL.md here

## Technical Debt

- [ ] **Flash prevention theme array duplication** — Theme arrays are still duplicated in `partials/head-common.html` and `public/theme.js`. Intentional — the inline bootstrap script must run synchronously before theme.js loads for flash prevention. Both copies have comments flagging the sync requirement. Consider build-time injection from a shared JSON source if DaisyUI theme list changes.

---

## Per-Repo Pattern Implementation Gaps

Audited 2026-04-06 against updated `docs/implementations/*.md` pattern docs. Updated 2026-04-10 with Z_INDEX_SCALE (9 patterns). Added PWA_ICON_CACHE_BUST pattern 2026-04-16 (10 patterns). Re-audited 2026-04-17 via GitHub API. Triggers redesign (48 triggers in 8 groups + 6 cadence meta sweeps + 7 reflective passes) added 2026-04-17 as cross-fleet alignment task to all 10 repos.

**Re-audited 2026-04-18 via GitHub API (one agent per repo) — completed items deleted from this file. Major deltas:** canva-grid fully resolved except Triggers (ICON_CACHE_BUST tripwire test + install-modal collapsible confirmed). budgy-ting resolved except Triggers + ICON_CACHE_BUST tripwire test (core plumbing + reinstall banner done, EVENT_BUS decided against in CLAUDE.md). repo-tor fully resolved except Triggers (Communication section at line 335, ICON_CACHE_BUST tripwire test + install-modal collapsible done). graphiki HUGE progress: HISTORY.md gone, CLAUDE.md fully aligned (Implementation Patterns + prohibition + Communication), BURGER_MENU upgraded to disclosure component, DEBUG_SYSTEM hardened (console interception + inline styles + PWA tab + pre-React pill), PWA visibility + 30s suppression done, ICON_CACHE_BUST core plumbing done, EVENT_BUS typed payload map done. few-lap CLAUDE.md fully aligned + APP_ICONS + BURGER_MENU fully done. model-pear DEBUG_SYSTEM audit confirmed compliant + prohibition added. **Correction:** synctone flash prevention script was incorrectly marked present on 2026-04-17 — re-audit confirms it is NOT in `+html.tsx`.

**Parallel re-validation 2026-04-18 (10 agents, one per repo) — additional deltas:** canva-grid Triggers now DONE (8 group tables + meta sweeps + reflective passes + name collisions note) — section removed. budgy-ting Triggers + tripwire test (`src/iconCacheBust.test.ts`, 151 lines) both DONE — section removed. few-lap DEBUG_SYSTEM (all 6 items: `#debug-root`, inline styles, console interception, pre-React pill, `DebugDetails` union type, URL redaction) and THEME_DARK_MODE (Uniwind `@variant` blocks cover all DaisyUI tokens; flash prevention present) now DONE; Triggers PARTIAL (8 group tables present but Meta sweeps + Reflective passes tables missing); debug comment text changed to "TEMPORARY: always-on for PWA alpha diagnostics" (same leak risk). graphiki ICON_CACHE_BUST tripwire test DONE (`src/test/icon-cache-bust.test.ts`); user communication still missing. **Correction:** four-ems 30-second suppression claim was wrong — `usePWAUpdate.ts` has a 3-second offline-ready dismissal, not a 30-second update-just-applied suppression; the item is back on the list.

Legend: **Pass** = compliant, **Partial** = has the feature but with gaps, **Missing** = not implemented, **N/A** = not applicable

### Gap Matrix

| Repo | CLAUDE.md | APP_ICONS | BURGER_MENU | DEBUG_SYSTEM | DOWNLOAD_PDF | PWA_SYSTEM | THEME_DARK_MODE | EVENT_BUS | Z_INDEX_SCALE | ICON_CACHE_BUST |
|------|-----------|-----------|-------------|--------------|--------------|------------|-----------------|-----------|---------------|-----------------|
| glow-props | Pass | Pass | Pass | N/A | Pass | Pass | Pass | N/A | Pass | N/A |
| canva-grid | Pass | Pass | Pass | Pass | Pass (B) | Pass | Pass | N/A | Pass | Pass |
| budgy-ting | Pass | Pass | Pass | Pass | Pass | Pass | Pass | N/A | Pass | Pass |
| model-pear | Partial | Pass | Missing | Pass | Partial | Missing | Missing | Missing | Partial | N/A |
| see-veo | Missing | Partial | Missing | Partial | Partial | Partial | Missing | Missing | Missing | Missing |
| repo-tor | Pass | Pass | Pass | Pass | Pass | Pass | Pass | N/A | Pass | Pass |
| few-lap | Pass | Pass | Pass | Pass | Missing | Partial | Pass | Missing | Missing | Missing |
| sun-sea-o | Missing | Partial | Missing | Partial | Pass | Partial | Missing | Missing | Missing | Missing |
| graphiki | Pass | Pass | Pass | Pass | Missing | Pass | Pass | Pass | Partial | Partial |
| four-ems | Missing | Partial | Missing | Partial | Partial | Partial | Missing | Missing | Missing | Missing |
| synctone | Missing | Partial | Missing | Partial | Missing | Partial | Partial | Missing | Missing | Missing |

**(B)** = Approach B (pdf-lib) per `docs/implementations/DOWNLOAD_PDF.md` — correct choice for canvas-heavy content

**N/A for ICON_CACHE_BUST**: glow-props (static site, no PWA icons), model-pear (no PWA yet — implement PWA_SYSTEM first)

### canva-grid — FULLY RESOLVED (2026-04-18)

React + Vite app. All items complete: HISTORY.md removed, Communication section added, ICON_CACHE_BUST fully complete (tripwire test in `src/__tests__/iconCacheBust.test.js` + install-modal collapsible), EVENT_BUS decided against (React Context dispatch), Triggers replaced (8 group tables + meta sweeps + reflective passes + name collisions note in AI Notes). No pending items.

### budgy-ting — FULLY RESOLVED (2026-04-18)

Vue + Vite app. All items complete: HISTORY.md removed, Communication section added, DOWNLOAD_PDF `handlePrint()` wired in `WorkspaceDetailView.vue`, ICON_CACHE_BUST fully complete (tripwire test at `src/iconCacheBust.test.ts`, 151 lines, source + dist assertions), EVENT_BUS decided against, Triggers replaced (8 group tables + meta sweeps + reflective passes). No name collisions found (no npm scripts/folders matching trigger names). No pending items.

### model-pear

SvelteKit app. Improved compliance verified 2026-04-17: APP_ICONS fully done (SVG source + generate-icons.mjs + manifest + HTML links + sharp), DEBUG_SYSTEM foundations done (debugLog.ts + `#debug-root` with inline pill + DebugPill.svelte). Implementation Patterns section exists at line 365. No stale "Shared conventions" AI Note. Still needs: PWA_SYSTEM (no vite-plugin-pwa), THEME_DARK_MODE (no DaisyUI), BURGER_MENU hardening, and cross-fleet items.

#### HISTORY.md — Remove (cross-fleet policy 2026-04-16)

Git history already tracks completions; a separate changelog is redundant.

1. [ ] Delete `docs/HISTORY.md`
2. [ ] Remove `### docs/HISTORY.md` section from CLAUDE.md Documentation rules
3. [ ] Change "move completed items to HISTORY.md" → "delete completed items (git history tracks them)" in CLAUDE.md
4. [ ] Remove HISTORY.md from README.md file tree (if listed)
5. [ ] Delete any `[x]` completed items from `docs/TODO.md` (including the "Negotiation Mode" High Priority section which is marked complete)

#### CLAUDE.md — Add Communication section

"Implementation Patterns (Source of Truth)" section + prohibition already present (verified 2026-04-18). Remaining: Communication section.

1. [ ] **Add `## Communication` section** — Copy from glow-props CLAUDE.md. Place between Principles and Code Standards. Update header line to include COMMUNICATION. Remove any duplicate "ASK before assuming" or "Communication style" bullets from AI Notes.
2. **Confirm:** Communication section exists between Principles and Code Standards.

#### Triggers — Replace with glow-props version (cross-fleet policy 2026-04-17)

glow-props CLAUDE.md has a redesigned Triggers section: 48 triggers in 8 groups, 6 cadence meta sweeps (`hot` / `quick` / `ship` / `session` / `tidy` / `all`), 7 reflective passes (`risk` / `surface` / `wrap` / `skipped` / `assumed` / `approach` / `cold`), and scope modifiers (`branch` / `staged` / `file <path>`). Replaces the older single-word Triggers section (`rev`/`aud`/`mobile`/`clean`/`start`/etc.).

1. [ ] **Replace the existing `## Triggers` section** — Copy the full new `## Triggers` section from glow-props CLAUDE.md verbatim, including How to invoke, Scope modifiers, Behavior rules, all 8 group tables (`correctness`, `trust`, `speed`, `frontend`, `quality`, `ops`, `design`, `fleet`), Meta sweeps table, and Reflective passes table.
2. [ ] **Note any name collisions** — If the repo has npm scripts, folders, or conventions using single-word names matching trigger names (e.g. `docs/`, `tests/`, `config/`, `api/`), add a line in AI Notes clarifying context precedence.
3. **Confirm:** `grep -c "^## Triggers$" CLAUDE.md` returns `1`. All 8 group tables present. No old single-word triggers (`rev`/`aud`/`start`/`go`) remain.

#### BURGER_MENU — Missing → Implement

Reference: `docs/implementations/BURGER_MENU.md`

1. [ ] **Replace basic hamburger with disclosure pattern** — Current toggle is a simple boolean. Rebuild as a disclosure component with `aria-expanded`, `aria-controls`, and role="navigation".
2. [ ] **Increase hamburger button to 44px** — Currently `p-2` (~32px). Use `min-h-11 min-w-11` (44px).
3. [ ] **Add keyboard navigation** — `useEscapeKey` to close, `ArrowDown`/`ArrowUp`/`Home`/`End` within items.
4. [ ] **Add focus management** — Focus first item on open, return to trigger on close.
5. [ ] **Add backdrop** — Click-outside overlay with `cursor-pointer` (iOS Safari needs this).
6. [ ] **Add standard menu items** — Tutorial/help, dark mode toggle, install app (once PWA is added). See pattern's [Theme UI in Burger Menu](../implementations/BURGER_MENU.md#theme-ui-in-burger-menu) for toggle item spec (sun/moon icons, label flips) and theme picker layout.
7. **Confirm:** Keyboard-only navigation through entire menu. Verify 44px touch targets on mobile. Verify Escape and backdrop close.

#### DOWNLOAD_PDF — Partial → Complete

Reference: `docs/implementations/DOWNLOAD_PDF.md`

1. [ ] **Add `window.print()` trigger** — Print CSS (`.no-print` class, `@media print`) already exists. Add a "Save as PDF" button that calls `window.print()`.
2. **Confirm:** Click button, verify clean print preview.

#### PWA_SYSTEM — Missing → Implement

Reference: `docs/implementations/PWA_SYSTEM.md`

1. [ ] **Install vite-plugin-pwa** — `npm install -D vite-plugin-pwa workbox-window`. Configure in `vite.config.js` with `registerType: 'prompt'`, `cleanupOutdatedCaches: true`, explicit `globPatterns`.
2. [ ] **Create manifest** — `id`, `scope`, `display: standalone`, `prefer_related_applications: false`. Reference icons from APP_ICONS step.
3. [ ] **Add beforeinstallprompt capture** — Inline classic `<script>` in `app.html` `<head>` to catch the prompt before SvelteKit mounts.
4. [ ] **Create PWA module** — Module-level singleton for SW state. `usePWAUpdate` with visibility checks, 30-second suppression, `controllerchange` reload guard. `usePWAInstall` for install prompt.
5. [ ] **Add update banner UI** — Fixed bottom bar with "Update" and "Later" buttons. Z-70 per scale.
6. [ ] **Add install UI** — "Install app" menu item (once burger menu exists) with browser-specific instructions modal.
7. **Confirm:** Build and deploy. Visit in Chrome — install prompt should work. Deploy a new version, reopen — update banner should appear.

#### THEME_DARK_MODE — Missing → Implement

Reference: `docs/implementations/THEME_DARK_MODE.md`, including **Migration Guide**

model-pear is dark-only with no DaisyUI. This is a ground-up implementation, not a migration.

1. [ ] **Install DaisyUI** — `npm install -D daisyui@5`. Configure `@plugin "daisyui"` with 2 starter themes.
2. [ ] **Add dual-layer theming** — `@custom-variant dark`, `color-scheme`, flash prevention inline script in `app.html`.
3. [ ] **Create theme module** — `applyTheme(dark, themeName, skipPersist)`, persistence (pick Approach A or B), cross-tab sync via `storage` event, OS preference fallback.
4. [ ] **Add dark/light toggle + theme picker** — In burger menu (once built). Follow [Theme UI in Burger Menu](../implementations/BURGER_MENU.md#theme-ui-in-burger-menu) for toggle item (sun/moon icons, label flips), theme picker layout (scrollable list for Approach A, combo buttons for Approach B), and `aria-label` that updates with state.
5. [ ] **Add `<meta name="theme-color">`** — Two tags with media queries in `app.html`. Dynamic updates in theme module.
6. [ ] **Migrate existing styles** — Replace hardcoded dark colors with DaisyUI semantic classes (`bg-base-100`, `text-base-content`, etc.). Follow Phase 1-3 of the migration guide for the audit and mapping process.
7. **Confirm:** Toggle dark/light. Open two tabs, toggle in one — other follows. Clear localStorage — falls back to OS preference. Check meta theme-color updates in DevTools.

#### Z_INDEX_SCALE — Missing → Implement

Reference: `docs/implementations/Z_INDEX_SCALE.md`

1. [ ] **Audit and normalize all z-index values** — Run the audit command from the pattern doc. Align all values to the standard scale.
2. **Confirm:** All z-index values map to the standard scale.

#### EVENT_BUS — Evaluate if needed

- [ ] **Decide:** Does model-pear have service-layer needs? If yes, follow `docs/implementations/EVENT_BUS.md`. If not, skip.

### see-veo

React + Vite resume/portfolio site. Single dark theme currently. Has partial debug and PWA implementations that need hardening. Burger menu and theming are absent but may be intentional for a minimal resume site.

#### HISTORY.md — Remove (cross-fleet policy 2026-04-16)

Git history already tracks completions; a separate changelog is redundant. README.md file tree already has no HISTORY.md reference (verified 2026-04-18).

1. [ ] Delete `docs/HISTORY.md`
2. [ ] Remove `### docs/HISTORY.md` section from CLAUDE.md Documentation rules
3. [ ] Change "move completed items to HISTORY.md" → "delete completed items (git history tracks them)" in CLAUDE.md

#### CLAUDE.md — Align with glow-props

No local `docs/implementations/` folder (correct). Has **~280 lines of hardcoded inline patterns** in a "Suggested Implementations" section (~lines 322-603) covering PWA System, App Icons, Download as PDF, Timer Leaks, and HTTPS Proxy — full code examples embedded directly. Missing: any reference to glow-props as pattern source. A brief `## Communication Style` bullet list exists (line 273) but is not the full glow-props version.

1. [ ] **Delete entire "Suggested Implementations" section** — Remove ~lines 322-603 (~280 lines of inline pattern code for PWA System, App Icons, Download as PDF, Timer Leaks, HTTPS Proxy).
2. [ ] **Add "Implementation Patterns (Source of Truth)" section** — Replace deleted section with the standard glow-props reference block (source location, fetch via GitHub Pages/API, listing command, rules).
3. [ ] **Add AI Note** — Add: `**Implementation patterns — always fetch from glow-props.** Never look for local copies of implementation pattern files (e.g., docs/implementations/*.md) in downstream repos. They do not exist locally — the single source of truth is the docs/implementations/ folder in the glow-props repo. Fetch the latest version before every implementation task.`
4. [ ] **Add prohibition** — Add to Prohibitions: "Create local copies of implementation pattern files in any repo — always fetch from glow-props".
5. [ ] **Promote to top-level `## Communication` section** — Replace the existing `## Communication Style` bullet list with the full glow-props Communication section. Place between Principles and Code Standards. Update header line to include COMMUNICATION. Remove any duplicate "ASK before assuming" / "Communication style" bullets from AI Notes.
6. **Confirm:** CLAUDE.md is ~280 lines shorter. No inline code examples for patterns remain. Standard fetch commands point to glow-props. Communication section exists between Principles and Code Standards.

#### Triggers — Replace with glow-props version (cross-fleet policy 2026-04-17)

glow-props CLAUDE.md has a redesigned Triggers section: 48 triggers in 8 groups, 6 cadence meta sweeps (`hot` / `quick` / `ship` / `session` / `tidy` / `all`), 7 reflective passes (`risk` / `surface` / `wrap` / `skipped` / `assumed` / `approach` / `cold`), and scope modifiers (`branch` / `staged` / `file <path>`). Replaces the older single-word Triggers section (`rev`/`aud`/`mobile`/`clean`/`start`/etc.).

1. [ ] **Replace the existing `## Triggers` section** — Copy the full new `## Triggers` section from glow-props CLAUDE.md verbatim, including How to invoke, Scope modifiers, Behavior rules, all 8 group tables (`correctness`, `trust`, `speed`, `frontend`, `quality`, `ops`, `design`, `fleet`), Meta sweeps table, and Reflective passes table.
2. [ ] **Note any name collisions** — If the repo has npm scripts, folders, or conventions using single-word names matching trigger names (e.g. `docs/`, `tests/`, `config/`, `api/`), add a line in AI Notes clarifying context precedence.
3. **Confirm:** `grep -c "^## Triggers$" CLAUDE.md` returns `1`. All 8 group tables present. No old single-word triggers (`rev`/`aud`/`start`/`go`) remain.

#### APP_ICONS — Partial → Complete

Reference: `docs/implementations/APP_ICONS.md`

1. [ ] **Add 400 DPI density** — In `generate-icons.mjs`, change `sharp(svgBuffer)` to `sharp(svgBuffer, { density: 400 })`. Regenerate all PNGs.
2. [ ] **Add 48x48 favicon PNG** — Add `{ size: 48, name: 'favicon.png' }` to the generation script's output list.
3. **Confirm:** Run script, verify crisp edges on 48px and 192px icons. Check favicon in browser tab.

#### BURGER_MENU — Evaluate if needed

- [ ] **Decide:** This is a single-page resume site with minimal navigation. A burger menu may be unnecessary. If the site grows to need navigation (e.g., separate sections, settings), follow `docs/implementations/BURGER_MENU.md`. If not, skip.

#### DEBUG_SYSTEM — Partial → Complete

Reference: `docs/implementations/DEBUG_SYSTEM.md`

1. [ ] **Add separate `#debug-root`** — In `index.html`, add `<div id="debug-root"></div>` after `<div id="root">`. Mount DebugPill into this separate React root so it survives app crashes.
2. [ ] **Switch to inline styles** — Replace Tailwind classes in DebugBanner with inline styles.
3. [ ] **Add `id` field to entries** — Auto-incrementing numeric ID for stable React keys and deduplication.
4. [ ] **Add console interception** — Patch `console.error`/`console.warn` at module load.
5. [ ] **Add global error/rejection listeners** — `window.addEventListener('error', ...)` and `unhandledrejection` at module load.
6. [ ] **Add pre-React inline pill** — Inline `<script>` in `index.html` with `window.__debugPushError()` and 20-second loading timeout.
7. [ ] **Add URL query param redaction** — Replace query strings with `?[redacted]` in debug reports.
8. [ ] **Improve clipboard fallbacks** — Add ClipboardItem Blob as primary method, then writeText, then textarea. Currently only writeText with manual textarea fallback.
9. **Confirm:** Open app, verify 3 tabs. Crash a component — pill survives. Copy report — URLs are redacted. Test clipboard on mobile PWA.

Note: third tab (PWA Diagnostics via `diagnostics.ts`) is already present (verified 2026-04-17).

#### DOWNLOAD_PDF — Partial → Complete

Reference: `docs/implementations/DOWNLOAD_PDF.md`

`window.print()` trigger button already exists in `Hero.tsx` ("Download as PDF"). Only CSS gap remains:

1. [ ] **Add `print-color-adjust: exact`** — In `@media print` CSS: `-webkit-print-color-adjust: exact; print-color-adjust: exact;` to preserve background colors.
2. **Confirm:** Click print button, verify background colors are preserved in preview, no interactive elements visible.

#### PWA_SYSTEM — Partial → Complete

Reference: `docs/implementations/PWA_SYSTEM.md`

1. [ ] **Convert to module-level singleton** — Move `_registration`, `_hasUpdate`, `_userClickedUpdate` from hook-local `useRef`/`useState` to module-scope variables with a pub/sub listener set. See pattern's "Module-Level Singleton" section.
2. [ ] **Add visibility-based update checks** — `visibilitychange` listener to check for SW updates when tab regains focus.
3. [ ] **Add 30-second suppression** — `sessionStorage` timestamp after update. See pattern's `wasJustUpdated()`.
4. [ ] **Add `checkForUpdate()` function** — Manual trigger returning typed result (`'no-sw' | 'done' | 'error'`) for UI feedback.
5. [ ] **Add `controllerchange` reload guard** — Auto-reload only when user explicitly clicked "Update".
6. [ ] **Add `onRegisterError` handler** — Log SW registration errors to debug system.
7. **Confirm:** Deploy new version, background tab, bring back — update detected. Click Update, verify reload. No re-detection within 30 seconds.

#### THEME_DARK_MODE — Missing → Implement

Reference: `docs/implementations/THEME_DARK_MODE.md`, including **Migration Guide**

see-veo is a single dark theme with no DaisyUI. Ground-up implementation.

1. [ ] **Decide: Is theming needed?** For a minimal resume site, a fixed dark theme may be intentional. If adding theme support, continue below. If not, skip.
2. [ ] **Install DaisyUI** — `npm install -D daisyui@5`. Configure with 2 themes.
3. [ ] **Add dual-layer theming** — `@custom-variant dark`, `color-scheme`, flash prevention script.
4. [ ] **Create theme hook** — `applyTheme`, persistence, cross-tab sync, OS preference fallback.
5. [ ] **Migrate existing dark styles** — Replace custom `@theme` CSS variables with DaisyUI semantic classes. Follow migration guide Phase 1-3.
6. **Confirm:** Toggle works, cross-tab syncs, fresh visit falls back to OS preference.

#### Z_INDEX_SCALE — Missing → Implement

Reference: `docs/implementations/Z_INDEX_SCALE.md`

1. [ ] **Audit and normalize all z-index values** — Run the audit command from the pattern doc. Align all values to the standard scale.
2. **Confirm:** All z-index values map to the standard scale.

#### ICON_CACHE_BUST — Missing → Implement

Reference: `docs/implementations/PWA_ICON_CACHE_BUST.md` (fetch from glow-props)

see-veo uses vite-plugin-pwa. Icons served with stable filenames.

1. [ ] **Add `iconVersion()` + `iconCacheBustHtml()` to `vite.config.{js|ts}`** — Content-hash each icon file, inject `?v=<hash>` into HTML link tags. Plugin must be wired before `VitePWA()`.
2. [ ] **Version manifest icon URLs** — Pass `versioned()` paths to `VitePWA({ manifest: { icons: [...] } })`.
3. [ ] **Add `ignoreURLParametersMatching: [/^v$/]`** to workbox config.
4. [ ] **Add tripwire test** — Source-level and dist-level assertions per the pattern doc.
5. [ ] **Add user communication** — "Already installed and the icon looks outdated?" collapsible in install modal.
6. **Confirm:** Build, verify versioned URLs in manifest + HTML + SW config.

#### EVENT_BUS — Evaluate if needed

- [ ] **Decide:** Minimal resume site — likely not needed. Skip unless service-layer pub/sub becomes necessary.

### repo-tor

React + Vite dashboard app. Only Triggers replacement remains (verified 2026-04-18). All original 9 patterns resolved, HISTORY.md removed, Communication section promoted to top-level (line 335), ICON_CACHE_BUST fully complete (tripwire test in `scripts/__tests__/icon-cache-bust.test.mjs` + install-modal collapsible in `dashboard/js/components/InstallInstructionsModal.jsx`).

EVENT_BUS: Not needed — React Context dispatch + useReducer in AppContext.jsx is sufficient.

#### Triggers — Replace with glow-props version (cross-fleet policy 2026-04-17)

glow-props CLAUDE.md has a redesigned Triggers section: 48 triggers in 8 groups, 6 cadence meta sweeps (`hot` / `quick` / `ship` / `session` / `tidy` / `all`), 7 reflective passes (`risk` / `surface` / `wrap` / `skipped` / `assumed` / `approach` / `cold`), and scope modifiers (`branch` / `staged` / `file <path>`). Replaces the older single-word Triggers section (`rev`/`aud`/`mobile`/`clean`/`start`/etc.).

1. [ ] **Replace the existing `## Triggers` section** — Copy the full new `## Triggers` section from glow-props CLAUDE.md verbatim, including How to invoke, Scope modifiers, Behavior rules, all 8 group tables (`correctness`, `trust`, `speed`, `frontend`, `quality`, `ops`, `design`, `fleet`), Meta sweeps table, and Reflective passes table.
2. [ ] **Note any name collisions** — If the repo has npm scripts, folders, or conventions using single-word names matching trigger names (e.g. `docs/`, `tests/`, `config/`, `api/`), add a line in AI Notes clarifying context precedence.
3. **Confirm:** `grep -c "^## Triggers$" CLAUDE.md` returns `1`. All 8 group tables present. No old single-word triggers (`rev`/`aud`/`start`/`go`) remain.

### few-lap

React Native (Expo) app (package name `fuelhunt`). Uses Metro bundler (not Vite) and Uniwind for theming. Custom SW approach is correct for Expo. CLAUDE.md fully aligned with glow-props (verified 2026-04-18): Implementation Patterns section, AI Note, prohibition, and Communication section all present. APP_ICONS and BURGER_MENU fully complete. **DEBUG_SYSTEM fully complete 2026-04-18** (`#debug-root`, pure inline styles, `consoleCapture.ts`, pre-React bootPillScript, `DebugDetails = string | Record<string, unknown>` union, `redactUrls()` in report). **THEME_DARK_MODE fully complete 2026-04-18** (Uniwind `@variant` blocks cover all DaisyUI semantic tokens in `src/global.css` incl. `-content` variants; flash prevention script in `+html.tsx`).

**Bonus finding (not a pattern gap):** `src/debug/debugLog.ts` has a leftover `// TEMPORARY: always-on for PWA alpha diagnostics. Restore` comment — production debug-pill leak risk. Restore the `__DEV__` guard.

#### Triggers — Replace with glow-props version (cross-fleet policy 2026-04-17) — PARTIAL

few-lap has a current `## Triggers` section with 8 group tables matching glow-props group structure, but is **missing the Meta sweeps table and Reflective passes table** (and likely the How to invoke / Scope modifiers / Behavior rules preamble).

1. [ ] **Add Meta sweeps table** — Copy the Meta sweeps table (`hot` / `quick` / `ship` / `session` / `tidy` / `all`) from glow-props CLAUDE.md verbatim.
2. [ ] **Add Reflective passes table** — Copy the Reflective passes table (`risk` / `surface` / `wrap` / `skipped` / `assumed` / `approach` / `cold`) from glow-props CLAUDE.md verbatim.
3. [ ] **Verify preamble sections** — Ensure How to invoke, Scope modifiers (`branch` / `staged` / `file <path>`), and Behavior rules are present before the group tables.
4. [ ] **Note any name collisions** — If the repo has npm scripts, folders, or conventions matching trigger names, add a line in AI Notes.
5. **Confirm:** All 8 group tables present (already done). Meta sweeps and Reflective passes tables present. All preamble sections present.

#### DOWNLOAD_PDF — Missing → Implement

Reference: `docs/implementations/DOWNLOAD_PDF.md`

1. [ ] **Decide: Is PDF export needed?** FuelHunt is a fuel price tracker — users might want to save price comparisons. If yes, continue.
2. [ ] **Add `@media print` CSS** — In `src/global.css`: `.no-print { display: none !important; }`, white background, black text, `print-color-adjust: exact`.
3. [ ] **Add `no-print` class** to interactive elements (nav, buttons, debug pill).
4. [ ] **Add `window.print()` trigger** — Button in the UI.
5. **Confirm:** Click print, verify clean output with no interactive elements.

#### PWA_SYSTEM — Partial → Complete

Reference: `docs/implementations/PWA_SYSTEM.md` (Custom SW section for Expo/Metro)

few-lap uses Expo with a custom `sw.js`, not vite-plugin-pwa — this is the correct approach.

1. [ ] **Add visibility-based update check pause** — In `usePWAUpdate.ts`, add a `visibilitychange` listener. Pause interval-based checks when tab is hidden, resume and immediately check when visible again.
2. **Confirm:** Background the tab for a while, bring it back — update check should trigger on visibility change.

#### Z_INDEX_SCALE — Missing → Implement

Reference: `docs/implementations/Z_INDEX_SCALE.md`

1. [ ] **Audit and normalize all z-index values** — Run the audit command from the pattern doc. Align all values to the standard scale.
2. **Confirm:** All z-index values map to the standard scale.

#### ICON_CACHE_BUST — Missing → Implement

Reference: `docs/implementations/PWA_ICON_CACHE_BUST.md` (fetch from glow-props)

few-lap uses Expo with a custom `sw.js` — not vite-plugin-pwa. Adapt the hash computation and HTML injection to the Expo/Metro build pipeline. See the "Adapting to other stacks" table in the pattern doc for the Expo / Metro column. Note: `inject-sw-version.mjs` prebuild script exists (for SW version), could be extended or paired with an icon hash script.

1. [ ] **Compute content hash of icon files** — In a prebuild script, SHA-256 hash each icon PNG and expose versioned paths.
2. [ ] **Inject versioned URLs into `+html.tsx`** — Update `<link rel="icon">` and `<link rel="apple-touch-icon">` tags with `?v=<hash>`.
3. [ ] **Update `sw.js` precache** — Ensure the custom service worker handles versioned icon URLs (strip `?v=` on cache lookup or precache the versioned URL directly).
4. [ ] **Add user communication** — "Already installed and the icon looks outdated?" collapsible in install UI.
5. **Confirm:** Build, verify versioned URLs in HTML link tags. Test offline icon loading.

#### EVENT_BUS — Evaluate if needed

- [ ] **Decide:** Does few-lap have service-layer pub/sub needs? If yes, follow `docs/implementations/EVENT_BUS.md`. If not, skip.

### sun-sea-o

React + Vite app. DOWNLOAD_PDF is fully compliant. Debug system and PWA have partial implementations with many gaps. No theming or burger menu — hardcoded slate colors.

#### HISTORY.md — Remove (cross-fleet policy 2026-04-16)

Git history already tracks completions; a separate changelog is redundant.

1. [ ] Delete `docs/HISTORY.md`
2. [ ] Remove `### docs/HISTORY.md` section from CLAUDE.md Documentation rules
3. [ ] Change "move completed items to HISTORY.md" → "delete completed items (git history tracks them)" in CLAUDE.md
4. [ ] Remove HISTORY.md from README.md file tree (if listed)
5. [ ] Delete any `[x]` completed items from `docs/TODO.md`

#### CLAUDE.md — Align with glow-props

No local `docs/implementations/` folder (correct). Has **~470 lines of hardcoded inline patterns** in a "Suggested Implementations" section (~lines 419-888) covering PWA System, Debug System, App Icons, Download as PDF — full code examples. Also has a "Shared References" section (~lines 6-20) that points to `raw.githubusercontent.com/.../CLAUDE.md` instead of `docs/implementations/`.

1. [ ] **Delete entire "Suggested Implementations" section** — Remove ~lines 419-888 (~470 lines of inline pattern code for PWA System, Debug System, App Icons, Download as PDF).
2. [ ] **Add "Implementation Patterns (Source of Truth)" section** — Replace deleted section with the standard glow-props reference block (source location, fetch via GitHub Pages/API, listing command, rules).
3. [ ] **Update "Shared References" section** — Near lines 6-20, update the fetch URL from `raw.githubusercontent.com/.../CLAUDE.md` to the GitHub Pages URL for `docs/implementations/`. Remove the hardcoded list of "adopted patterns" and replace with the listing command to discover patterns dynamically.
4. [ ] **Add AI Note** — Add the standard implementation patterns note about always fetching from glow-props.
5. [ ] **Add prohibition** — Add to Prohibitions: "Create local copies of implementation pattern files in any repo — always fetch from glow-props".
6. [ ] **Add `## Communication` section** — Copy from glow-props CLAUDE.md (lines 32-46). Place between Principles and Code Standards. Update header line to include COMMUNICATION. Remove any duplicate "ASK before assuming" or "Communication style" bullets from AI Notes.
7. **Confirm:** CLAUDE.md is ~470 lines shorter. No inline code examples for patterns remain. Shared References points to `docs/implementations/`. Communication section exists between Principles and Code Standards.

#### Triggers — Replace with glow-props version (cross-fleet policy 2026-04-17)

glow-props CLAUDE.md has a redesigned Triggers section: 48 triggers in 8 groups, 6 cadence meta sweeps (`hot` / `quick` / `ship` / `session` / `tidy` / `all`), 7 reflective passes (`risk` / `surface` / `wrap` / `skipped` / `assumed` / `approach` / `cold`), and scope modifiers (`branch` / `staged` / `file <path>`). Replaces the older single-word Triggers section (`rev`/`aud`/`mobile`/`clean`/`start`/etc.).

1. [ ] **Replace the existing `## Triggers` section** — Copy the full new `## Triggers` section from glow-props CLAUDE.md verbatim, including How to invoke, Scope modifiers, Behavior rules, all 8 group tables (`correctness`, `trust`, `speed`, `frontend`, `quality`, `ops`, `design`, `fleet`), Meta sweeps table, and Reflective passes table.
2. [ ] **Note any name collisions** — If the repo has npm scripts, folders, or conventions using single-word names matching trigger names (e.g. `docs/`, `tests/`, `config/`, `api/`), add a line in AI Notes clarifying context precedence.
3. **Confirm:** `grep -c "^## Triggers$" CLAUDE.md` returns `1`. All 8 group tables present. No old single-word triggers (`rev`/`aud`/`start`/`go`) remain.

#### APP_ICONS — Partial → Complete

Reference: `docs/implementations/APP_ICONS.md`

Maskable 1024px already generated (verified 2026-04-17 — manifest references `pwa-1024x1024.png` with maskable purpose).

1. [ ] **Add 400 DPI density** — In `generate-icons.mjs`, change `sharp(svgBuffer).resize()` to `sharp(svgBuffer, { density: 400 }).resize()`.
2. [ ] **Add 180px Apple touch icon** — Add to generation script output list. Add `<link rel="apple-touch-icon">` to `index.html`.
3. [ ] **Optional: Add favicon.ico** — For Windows taskbar pinning and older browsers. See pattern's ICO generation section.
4. **Confirm:** Regenerate all PNGs, verify 180px icon is crisp. Check manifest has `"purpose": "maskable"` on 1024.

#### BURGER_MENU — Missing → Implement

Reference: `docs/implementations/BURGER_MENU.md`

1. [ ] **Create BurgerMenu component** — Disclosure pattern with `aria-expanded`, `aria-controls`, backdrop with `cursor-pointer`.
2. [ ] **Add focus hooks** — `useDisclosureFocus`, `useEscapeKey`. Extract as reusable hooks.
3. [ ] **Add keyboard navigation** — ArrowDown/ArrowUp with wrapping, Home/End.
4. [ ] **Add standard menu items** — Dark mode toggle (once theming is added), app info, install app. See pattern's [Theme UI in Burger Menu](../implementations/BURGER_MENU.md#theme-ui-in-burger-menu) for toggle and picker spec.
5. **Confirm:** Full keyboard navigation. Escape closes. Backdrop click closes. 44px touch targets. Debug pill renders above menu.

#### Z_INDEX_SCALE — Missing → Implement

Reference: `docs/implementations/Z_INDEX_SCALE.md`

1. [ ] **Audit and normalize all z-index values** — Debug pill currently uses `z-[9999]`. Run the audit command from the pattern doc and fix all violations.
2. **Confirm:** All z-index values map to the standard scale. Debug pill at z-[80] renders above menu at z-50.

#### DEBUG_SYSTEM — Partial → Complete

Reference: `docs/implementations/DEBUG_SYSTEM.md`

sun-sea-o's debug system still has many gaps. ClipboardItem Blob fallback and pre-React inline pill are already present (verified 2026-04-17).

1. [ ] **Add `id` field to entries** — Auto-incrementing numeric ID.
2. [ ] **Change `details` to `Record<string, unknown>`** — Currently uses `message: string` only.
3. [ ] **Add `(string & {})` source fallback** — Make `DebugSource` extensible for ad-hoc sources.
4. [ ] **Switch to inline styles** — Replace Tailwind classes with inline styles.
5. [ ] **Add PWA Diagnostics tab** — Third tab with active health checks.
6. [ ] **Move `debugGenerateReport()` to module** — Currently inline in component.
7. [ ] **Add URL query param redaction** — In report generation.
8. [ ] **Add HMR guard** — Use `window.__debugLogListenersAttached` flag to prevent duplicate global listeners during dev hot reload. Currently attaches via both `window.onerror` AND `addEventListener`, doubling up.
9. [ ] **Add subscriber replay** — New subscribers receive existing entries on subscribe.
10. [ ] **Add subscriber error isolation** — Wrap each subscriber callback in try/catch so one throwing subscriber doesn't break others.
11. **Confirm:** Open app, verify 3 tabs. HMR reload — no duplicate error entries. New subscriber gets existing log. Copy report — redacted.

#### PWA_SYSTEM — Partial → Complete

Reference: `docs/implementations/PWA_SYSTEM.md`

sun-sea-o has the most PWA gaps of any partial implementation.

1. [ ] **Convert to module-level singleton** — Move SW state from React hooks to module-scope variables with pub/sub.
2. [ ] **Add 30-second suppression** — `sessionStorage` timestamp after update. See pattern's `wasJustUpdated()`.
3. [ ] **Add visibility-based update checks** — `visibilitychange` listener.
4. [ ] **Add `controllerchange` reload guard** — Auto-reload only when user clicked "Update".
5. [ ] **Add `checkForUpdate()` with typed result** — Returns `'no-sw' | 'done' | 'error'` for UI feedback.
6. [ ] **Add `onRegisterError` handler** — Log to debug system.
7. [ ] **Add manifest fields** — `id: '/'`, `scope`, `prefer_related_applications: false`.
8. [ ] **Add workbox config** — `cleanupOutdatedCaches: true`, explicit `globPatterns`.
9. **Confirm:** Deploy, background tab, return — update detected. Click Update, reload, no re-detection for 30s. Manual "Check for updates" returns typed result.

#### THEME_DARK_MODE — Missing → Implement

Reference: `docs/implementations/THEME_DARK_MODE.md`, including **Migration Guide**

Hardcoded slate color scheme only. Ground-up implementation.

1. [ ] **Install DaisyUI** — `npm install -D daisyui@5`. Configure with 2 themes.
2. [ ] **Add dual-layer theming** — `@custom-variant dark`, `color-scheme`, flash prevention script.
3. [ ] **Create theme module** — `applyTheme`, persistence (Approach A or B), cross-tab sync, OS preference fallback.
4. [ ] **Add dark/light toggle + theme picker** — In burger menu (once built). Follow [Theme UI in Burger Menu](../implementations/BURGER_MENU.md#theme-ui-in-burger-menu) for toggle and picker spec.
5. [ ] **Add `<meta name="theme-color">`** — Dynamic updates per theme.
6. [ ] **Migrate hardcoded slate colors** — Replace with DaisyUI semantic classes. Follow migration guide Phase 1-3.
7. **Confirm:** Toggle dark/light. Cross-tab sync. Fresh visit falls back to OS preference.

#### ICON_CACHE_BUST — Missing → Implement

Reference: `docs/implementations/PWA_ICON_CACHE_BUST.md` (fetch from glow-props)

sun-sea-o uses vite-plugin-pwa. Icons served with stable filenames.

1. [ ] **Add `iconVersion()` + `iconCacheBustHtml()` to `vite.config.{js|ts}`** — Content-hash each icon file, inject `?v=<hash>` into HTML link tags. Plugin must be wired before `VitePWA()`.
2. [ ] **Version manifest icon URLs** — Pass `versioned()` paths to `VitePWA({ manifest: { icons: [...] } })`.
3. [ ] **Add `ignoreURLParametersMatching: [/^v$/]`** to workbox config.
4. [ ] **Add tripwire test** — Source-level and dist-level assertions per the pattern doc.
5. [ ] **Add user communication** — "Already installed and the icon looks outdated?" collapsible in install modal.
6. **Confirm:** Build, verify versioned URLs in manifest + HTML + SW config.

#### EVENT_BUS — Evaluate if needed

- [ ] **Decide:** If service-layer pub/sub needs emerge, follow `docs/implementations/EVENT_BUS.md`. Otherwise skip.

### graphiki

React + Vite graph editor. Major progress since last audit (verified 2026-04-18): HISTORY.md removed, CLAUDE.md fully aligned (Implementation Patterns + AI Note + prohibition + Communication all present), BURGER_MENU upgraded to disclosure component, DEBUG_SYSTEM hardened (console interception + inline styles + PWA Diagnostics tab + pre-React inline pill), PWA visibility-based checks + 30s suppression in `usePWAUpdate.ts`, ICON_CACHE_BUST core plumbing in vite.config.ts, EVENT_BUS typed `EventBus<M>` payload map. Remaining: Triggers, DOWNLOAD_PDF decision, Z_INDEX_SCALE audit, ICON_CACHE_BUST tripwire test + user communication.

#### Triggers — Replace with glow-props version (cross-fleet policy 2026-04-17)

glow-props CLAUDE.md has a redesigned Triggers section: 48 triggers in 8 groups, 6 cadence meta sweeps (`hot` / `quick` / `ship` / `session` / `tidy` / `all`), 7 reflective passes (`risk` / `surface` / `wrap` / `skipped` / `assumed` / `approach` / `cold`), and scope modifiers (`branch` / `staged` / `file <path>`). Replaces the older single-word Triggers section (`rev`/`aud`/`mobile`/`clean`/`start`/etc.).

1. [ ] **Replace the existing `## Triggers` section** — Copy the full new `## Triggers` section from glow-props CLAUDE.md verbatim, including How to invoke, Scope modifiers, Behavior rules, all 8 group tables (`correctness`, `trust`, `speed`, `frontend`, `quality`, `ops`, `design`, `fleet`), Meta sweeps table, and Reflective passes table.
2. [ ] **Note any name collisions** — If the repo has npm scripts, folders, or conventions using single-word names matching trigger names (e.g. `docs/`, `tests/`, `config/`, `api/`), add a line in AI Notes clarifying context precedence.
3. **Confirm:** `grep -c "^## Triggers$" CLAUDE.md` returns `1`. All 8 group tables present. No old single-word triggers (`rev`/`aud`/`start`/`go`) remain.

#### DOWNLOAD_PDF — Evaluate if needed

Reference: `docs/implementations/DOWNLOAD_PDF.md`

1. [ ] **Decide:** Does a graph editor benefit from PDF export? If users need to export graph views as documents, this is useful. If graph export is handled differently (e.g., SVG/PNG export), skip.
2. If implementing: **Use Approach B (pdf-lib)** — graph views are canvas/visual content that `window.print()` can't reliably capture. Follow the pdf-lib section: `npm install pdf-lib html-to-image`, capture graph DOM via `toPng()`, compose into PDF pages.
3. **Confirm:** Export produces a clean PDF with the graph rendered at chosen quality level.

#### Z_INDEX_SCALE — Partial → Complete

Reference: `docs/implementations/Z_INDEX_SCALE.md`

1. [ ] **Audit and normalize all z-index values** — Run the audit command from the pattern doc. Fix any values outside the standard scale.
2. **Confirm:** All z-index values map to the standard scale.

#### ICON_CACHE_BUST — Partial → Complete

Reference: `docs/implementations/PWA_ICON_CACHE_BUST.md` (fetch from glow-props)

Core plumbing done: `iconVersion()` + `iconCacheBustHtml()` in `vite.config.ts`, versioned manifest icon URLs, `ignoreURLParametersMatching: [/^v$/]` in workbox config. Tripwire test done 2026-04-18 (`src/test/icon-cache-bust.test.ts` with full source-level assertions). Remaining: user communication.

1. [ ] **Add user communication** — "Already installed and the icon looks outdated?" collapsible in install modal (`usePWAInstall.ts` or the install prompt UI).
2. **Confirm:** User sees reinstall guidance when a stale cached icon is detected.

### four-ems

React + Vite app. Has partial APP_ICONS, DEBUG_SYSTEM, DOWNLOAD_PDF, and PWA. Missing BURGER_MENU, THEME_DARK_MODE, and EVENT_BUS entirely.

#### HISTORY.md — Remove (cross-fleet policy 2026-04-16)

Git history already tracks completions; a separate changelog is redundant. README.md has no file-tree section (verified 2026-04-18).

1. [ ] Delete `docs/HISTORY.md`
2. [ ] Remove `### docs/HISTORY.md` section from CLAUDE.md Documentation rules
3. [ ] Change "move completed items to HISTORY.md" → "delete completed items (git history tracks them)" in CLAUDE.md

#### CLAUDE.md — Align with glow-props

No local `docs/implementations/` folder (correct). Has **~630 lines of hardcoded inline patterns** in a "Suggested Implementations" section (~lines 328-957) covering PWA System, Debug System, and Download as PDF — full code examples. No reference to glow-props as pattern source exists.

1. [ ] **Delete entire "Suggested Implementations" section** — Remove ~lines 328-957 (~630 lines of inline pattern code for PWA System, Debug System, and Download as PDF).
2. [ ] **Add "Implementation Patterns (Source of Truth)" section** — Replace deleted section with the standard glow-props reference block (source location, fetch via GitHub Pages/API, listing command, rules).
3. [ ] **Add AI Note** — Add the standard implementation patterns note about always fetching from glow-props.
4. [ ] **Add prohibition** — Add to Prohibitions: "Create local copies of implementation pattern files in any repo — always fetch from glow-props".
5. [ ] **Add `## Communication` section** — Copy from glow-props CLAUDE.md (lines 32-46). Place between Principles and Code Standards. Update header line to include COMMUNICATION. Remove any duplicate "ASK before assuming" or "Communication style" bullets from AI Notes.
6. **Confirm:** CLAUDE.md is ~630 lines shorter. No inline code examples for patterns remain. Standard fetch commands point to glow-props. Communication section exists between Principles and Code Standards.

#### Triggers — Replace with glow-props version (cross-fleet policy 2026-04-17)

glow-props CLAUDE.md has a redesigned Triggers section: 48 triggers in 8 groups, 6 cadence meta sweeps (`hot` / `quick` / `ship` / `session` / `tidy` / `all`), 7 reflective passes (`risk` / `surface` / `wrap` / `skipped` / `assumed` / `approach` / `cold`), and scope modifiers (`branch` / `staged` / `file <path>`). Replaces the older single-word Triggers section (`rev`/`aud`/`mobile`/`clean`/`start`/etc.).

1. [ ] **Replace the existing `## Triggers` section** — Copy the full new `## Triggers` section from glow-props CLAUDE.md verbatim, including How to invoke, Scope modifiers, Behavior rules, all 8 group tables (`correctness`, `trust`, `speed`, `frontend`, `quality`, `ops`, `design`, `fleet`), Meta sweeps table, and Reflective passes table.
2. [ ] **Note any name collisions** — If the repo has npm scripts, folders, or conventions using single-word names matching trigger names (e.g. `docs/`, `tests/`, `config/`, `api/`), add a line in AI Notes clarifying context precedence.
3. **Confirm:** `grep -c "^## Triggers$" CLAUDE.md` returns `1`. All 8 group tables present. No old single-word triggers (`rev`/`aud`/`start`/`go`) remain.

#### APP_ICONS — Partial → Complete

Reference: `docs/implementations/APP_ICONS.md`

1. [ ] **Add 180px Apple touch icon** — Add to `generate-icons.mjs` output list.
2. [ ] **Add `<link rel="apple-touch-icon">` to `index.html`** — `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`.
3. **Confirm:** Regenerate icons, verify 180px exists. Test on iOS home screen.

#### BURGER_MENU — Missing → Implement

Reference: `docs/implementations/BURGER_MENU.md`

1. [ ] **Create BurgerMenu component** — Disclosure pattern with `aria-expanded`, `aria-controls`, backdrop.
2. [ ] **Add focus hooks** — `useDisclosureFocus`, `useEscapeKey`. Extract as reusable hooks.
3. [ ] **Add keyboard navigation** — ArrowDown/ArrowUp with wrapping, Home/End.
4. [ ] **Add standard menu items** — Tutorial/help, dark mode toggle (once theming added), check for updates, install app. See pattern's [Theme UI in Burger Menu](../implementations/BURGER_MENU.md#theme-ui-in-burger-menu) for toggle and picker spec.
5. **Confirm:** Full keyboard navigation. Escape and backdrop close. 44px touch targets.

#### DEBUG_SYSTEM — Partial → Complete

Reference: `docs/implementations/DEBUG_SYSTEM.md`

1. [ ] **Add console interception** — Patch `console.error`/`console.warn` at module load.
2. [ ] **Add PWA Diagnostics tab** — Third tab with active health checks.
3. [ ] **Add pre-React inline pill** — Inline `<script>` in `index.html` with `window.__debugPushError()` and 20-second timeout.
4. [ ] **Add HMR guard** — `window.__debugLogListenersAttached` flag to prevent duplicate listeners during dev hot reload.
5. [ ] **Change `details` to `Record<string, unknown>`** — Currently `string`.
6. [ ] **Improve clipboard fallbacks** — `navigator.clipboard` + textarea fallback already exists in `src/lib/clipboard.ts`. Add ClipboardItem Blob as primary method for richer content.
7. **Confirm:** 3 tabs in pill. HMR reload — no duplicate entries. Console errors captured.

#### DOWNLOAD_PDF — Partial → Complete

Reference: `docs/implementations/DOWNLOAD_PDF.md`

1. [ ] **Add `window.print()` trigger button** — Print CSS exists (`.no-print` class, `@media print`). Add a "Save as PDF" button in the UI.
2. [ ] **Add `-webkit-print-color-adjust: exact`** — To `@media print` CSS for background color preservation.
3. **Confirm:** Click print, verify background colors preserved, no interactive elements visible.

#### PWA_SYSTEM — Partial → Complete

Reference: `docs/implementations/PWA_SYSTEM.md`

**Correction 2026-04-18 parallel re-audit:** Previous note claimed 30-second suppression was present — actually `usePWAUpdate.ts` has a 3-second offline-ready *dismissal* timer, not a 30-second *update-just-applied* suppression. Item added back.

1. [ ] **Convert to module-level singleton** — Move SW state from React hooks to module-scope variables.
2. [ ] **Add visibility-based update checks** — `visibilitychange` listener.
3. [ ] **Add 30-second suppression** — `sessionStorage` timestamp after user clicks Update, `wasJustUpdated()` guard to prevent re-detection.
4. [ ] **Add `checkForUpdate()` function** — Returns typed result for UI/menu integration.
5. [ ] **Add `controllerchange` reload guard** — Auto-reload only when user clicked "Update".
6. [ ] **Add `workbox.cleanupOutdatedCaches: true`** — In vite config.
7. **Confirm:** Deploy, background tab, return — update detected. Click Update, reload, no re-detection for 30s.

#### THEME_DARK_MODE — Missing → Implement

Reference: `docs/implementations/THEME_DARK_MODE.md`, including **Migration Guide**

No theming currently. Ground-up implementation.

1. [ ] **Install DaisyUI** — `npm install -D daisyui@5`. Configure with 2 themes.
2. [ ] **Add dual-layer theming** — `@custom-variant dark`, `color-scheme`, flash prevention script in `index.html`.
3. [ ] **Create theme hook** — `applyTheme`, persistence (Approach A or B), cross-tab sync, OS preference fallback.
4. [ ] **Add dark/light toggle + theme picker** — In burger menu (once built). Follow [Theme UI in Burger Menu](../implementations/BURGER_MENU.md#theme-ui-in-burger-menu) for toggle and picker spec.
5. [ ] **Add `<meta name="theme-color">`** — Dynamic updates per theme.
6. [ ] **Migrate existing plain colors** — Replace Tailwind color classes with DaisyUI semantic tokens. Follow migration guide Phase 1-3.
7. **Confirm:** Toggle dark/light. Cross-tab sync. Fresh visit falls back to OS preference.

#### Z_INDEX_SCALE — Missing → Implement

Reference: `docs/implementations/Z_INDEX_SCALE.md`

1. [ ] **Audit and normalize all z-index values** — Run the audit command from the pattern doc. Align all values to the standard scale.
2. **Confirm:** All z-index values map to the standard scale.

#### ICON_CACHE_BUST — Missing → Implement

Reference: `docs/implementations/PWA_ICON_CACHE_BUST.md` (fetch from glow-props)

four-ems uses vite-plugin-pwa. Icons served with stable filenames.

1. [ ] **Add `iconVersion()` + `iconCacheBustHtml()` to `vite.config.{js|ts}`** — Content-hash each icon file, inject `?v=<hash>` into HTML link tags. Plugin must be wired before `VitePWA()`.
2. [ ] **Version manifest icon URLs** — Pass `versioned()` paths to `VitePWA({ manifest: { icons: [...] } })`.
3. [ ] **Add `ignoreURLParametersMatching: [/^v$/]`** to workbox config.
4. [ ] **Add tripwire test** — Source-level and dist-level assertions per the pattern doc.
5. [ ] **Add user communication** — "Already installed and the icon looks outdated?" collapsible in install modal.
6. **Confirm:** Build, verify versioned URLs in manifest + HTML + SW config.

#### EVENT_BUS — Evaluate if needed

- [ ] **Decide:** If service-layer pub/sub needs emerge, follow `docs/implementations/EVENT_BUS.md`. Otherwise skip.

### synctone

React Native (Expo) chat app. Uses Metro bundler and Uniwind for theming. Has Zustand stores for state. Custom SW approach is correct for Expo. Theming exists via Uniwind but doesn't follow the DaisyUI dual-layer spec. **Correction 2026-04-18:** earlier note claimed flash prevention inline script was present in `+html.tsx` — re-audit confirmed it is NOT there (only OneSignal init + beforeinstallprompt scripts). Flash prevention still missing.

#### HISTORY.md — Remove (cross-fleet policy 2026-04-16)

Git history already tracks completions; a separate changelog is redundant.

1. [ ] Delete `docs/HISTORY.md`
2. [ ] Remove `### docs/HISTORY.md` section from CLAUDE.md Documentation rules
3. [ ] Change "move completed items to HISTORY.md" → "delete completed items (git history tracks them)" in CLAUDE.md
4. [ ] Remove HISTORY.md from README.md file tree (if listed)
5. [ ] Delete any `[x]` completed items from `docs/TODO.md`

#### CLAUDE.md — Align with glow-props

**Only repo with a local `docs/implementations/` folder** — contains 8 files (APP_ICONS.md, BURGER_MENU.md, DEBUG_SYSTEM.md, DOWNLOAD_PDF.md, HTTPS_PROXY.md, KEY_LESSONS.md, PWA_SYSTEM.md, TIMER_LEAKS.md). Also has a hardcoded table in "Suggested Implementations" (~line 1413) linking to these local files, and an Architecture section (~line 790) listing the folder.

1. [ ] **Delete `docs/implementations/` folder** — Remove the entire directory and all 8 local pattern files. These are stale copies of the glow-props originals.
2. [ ] **Delete "Suggested Implementations" section** — Remove the hardcoded table (~line 1413) that links to local `docs/implementations/` files.
3. [ ] **Remove Architecture listing** — Remove the `implementations/` entry (~lines 790-798) from the file tree in the Architecture section since the directory will no longer exist.
4. [ ] **Add "Implementation Patterns (Source of Truth)" section** — Replace deleted section with the standard glow-props reference block (source location, fetch via GitHub Pages/API, listing command, rules).
5. [ ] **Add AI Note** — Add the standard implementation patterns note about always fetching from glow-props.
6. [ ] **Add `## Communication` section** — Copy from glow-props CLAUDE.md (lines 32-46). Place between Principles and Code Standards. Update header line to include COMMUNICATION. Remove any duplicate "ASK before assuming" or "Communication style" bullets from AI Notes.
7. **Confirm:** No `docs/implementations/` folder exists. No hardcoded table. Architecture section no longer lists pattern files. Standard fetch commands point to glow-props. Communication section exists between Principles and Code Standards.

#### Triggers — Replace with glow-props version (cross-fleet policy 2026-04-17)

glow-props CLAUDE.md has a redesigned Triggers section: 48 triggers in 8 groups, 6 cadence meta sweeps (`hot` / `quick` / `ship` / `session` / `tidy` / `all`), 7 reflective passes (`risk` / `surface` / `wrap` / `skipped` / `assumed` / `approach` / `cold`), and scope modifiers (`branch` / `staged` / `file <path>`). Replaces the older single-word Triggers section (`rev`/`aud`/`mobile`/`clean`/`start`/etc.).

1. [ ] **Replace the existing `## Triggers` section** — Copy the full new `## Triggers` section from glow-props CLAUDE.md verbatim, including How to invoke, Scope modifiers, Behavior rules, all 8 group tables (`correctness`, `trust`, `speed`, `frontend`, `quality`, `ops`, `design`, `fleet`), Meta sweeps table, and Reflective passes table.
2. [ ] **Note any name collisions** — If the repo has npm scripts, folders, or conventions using single-word names matching trigger names (e.g. `docs/`, `tests/`, `config/`, `api/`), add a line in AI Notes clarifying context precedence.
3. **Confirm:** `grep -c "^## Triggers$" CLAUDE.md` returns `1`. All 8 group tables present. No old single-word triggers (`rev`/`aud`/`start`/`go`) remain.

#### APP_ICONS — Partial → Complete

Reference: `docs/implementations/APP_ICONS.md`

1. [ ] **Create separate maskable icon** — Currently reuses `icon-512.png` for both `any` and `maskable` purposes. Create a dedicated 1024px maskable variant with safe-area padding. Update manifest to use separate files with distinct `purpose` values.
2. [ ] **Optional: Add favicon.ico** — For web platform. See pattern's ICO generation section.
3. **Confirm:** Check manifest has `"purpose": "any"` on 192/512 and `"purpose": "maskable"` on 1024. Test PWA install — icon should be correctly cropped on Android.

#### BURGER_MENU — Evaluate architecture

Reference: `docs/implementations/BURGER_MENU.md` (React Native variant section)

synctone uses `ChatHeaderMenu` (per-chat contextual actions) and `SettingsModal` (bottom sheet) — these are different UI patterns than a burger menu.

1. [ ] **Decide:** Does synctone need a traditional burger menu, or are the existing contextual menus + settings modal the right pattern for a chat app? Chat apps typically use bottom sheets and action sheets rather than burger menus.
2. If adding burger menu: Follow pattern's React Native variant with `Modal`, `ModalBackdrop`, haptic feedback.
3. [ ] **Either way: Extract shared `ModalBackdrop`** — Each modal currently implements its own backdrop inline. Extract to a reusable component.
4. [ ] **Either way: Add haptic feedback** — `expo-haptics` lightTap on menu/modal toggle.
5. **Confirm:** Modals/menus have consistent backdrop behavior, haptic feedback on toggle.

#### Z_INDEX_SCALE — Missing → Implement

Reference: `docs/implementations/Z_INDEX_SCALE.md`

1. [ ] **Audit and normalize all z-index values** — Run the audit command from the pattern doc. Align all values to the standard scale.
2. **Confirm:** Consistent layering across modals, menus, debug pill, and toasts.

#### DEBUG_SYSTEM — Partial → Complete

Reference: `docs/implementations/DEBUG_SYSTEM.md`

1. [ ] **Add separate debug root** — In `+html.tsx`, add a root element for the debug pill outside the app tree. Currently `PWADebugBanner` renders inside `_layout.tsx` — if the app crashes, the pill goes with it.
2. [ ] **Add console interception** — Patch `console.error`/`console.warn` in `debugLog.ts`.
3. [ ] **Add Environment tab** — Currently has PWA and App tabs but no standalone Environment tab (UA, screen dimensions, online status, protocol, standalone mode).
4. [ ] **Switch to inline styles** — Replace mixed inline/Tailwind styles with pure inline styles.
5. [ ] **Add pre-React inline pill** — Inline `<script>` in `+html.tsx` with `window.__debugPushError()` and 20-second timeout.
6. [ ] **Add clipboard fallbacks** — ClipboardItem Blob → writeText → textarea.
7. [ ] **Add `debugGenerateReport()` to module** — Move report generation out of the component.
8. [ ] **Add HMR guard** — `window.__debugLogListenersAttached` flag.
9. [ ] **Change `detail` to `details: Record<string, unknown>`** — Structured data.
10. [ ] **Add numeric `id` to entries** — Auto-incrementing for stable keys.
11. [ ] **Add subscriber replay** — New subscribers receive existing entries.
12. **Confirm:** 3 tabs in pill. App crash — pill survives. Console errors captured. Copy report works on mobile.

#### DOWNLOAD_PDF — Evaluate if needed

- [ ] **Decide:** Does a chat app need print-to-PDF? Chat export is typically done via data export (JSON/text), not print layout. If chat transcript PDF is desired, consider a custom export approach rather than `window.print()`. If not needed, skip.

#### PWA_SYSTEM — Partial → Complete

Reference: `docs/implementations/PWA_SYSTEM.md` (Custom SW section for Expo/Metro)

synctone uses Expo with a custom `sw.js` — correct approach, no vite-plugin-pwa needed.

1. [ ] **Add visibility-based update checks** — `visibilitychange` listener in `usePWAUpdate.ts`. Currently only checks hourly via setInterval.
2. [ ] **Add typed `checkForUpdate()` result** — Return `'no-sw' | 'done' | 'error'` instead of `Promise<void>` so the UI can show feedback.
3. **Confirm:** Background tab, bring back — update check triggers. Manual check returns typed result for toast feedback.

#### THEME_DARK_MODE — Partial → Complete

Reference: `docs/implementations/THEME_DARK_MODE.md` (Uniwind Theme Switching + Zustand Store sections)

synctone uses Uniwind's `setTheme()` with `classList.add()` — not the DaisyUI `data-theme` approach. The Uniwind mechanism is architecturally different for React Native. Flash prevention inline script is missing (re-verified 2026-04-18 — `+html.tsx` has only OneSignal + install-prompt scripts).

1. [ ] **Add flash prevention inline script** — Inline `<script>` in `+html.tsx` `<head>` to apply saved theme before Expo mounts. Must run synchronously before the rest of the page.
2. [ ] **Add `data-theme` attribute** (web platform) — Uniwind's `classList.add(name)` doesn't set `data-theme`. For web, add `document.documentElement.setAttribute('data-theme', name)` alongside the Uniwind call so DaisyUI components work correctly.
3. [ ] **Add `.dark` class toggling** — Set/remove `.dark` on `<html>` for Tailwind's `dark:` variant.
4. [ ] **Add `color-scheme` CSS rule** — `html.dark { color-scheme: dark; }` for native form inputs and scrollbars.
5. [ ] **Extend flash prevention script** — Apply both `data-theme` + `.dark` class before Expo mounts.
6. [ ] **Add `@custom-variant dark`** — Tailwind v4's class-based dark mode configuration in CSS.
7. **Confirm:** Reload with non-default theme — no flash. Toggle dark/light — instant. Native select dropdowns match theme on web.

#### ICON_CACHE_BUST — Missing → Implement

Reference: `docs/implementations/PWA_ICON_CACHE_BUST.md` (fetch from glow-props)

synctone uses Expo with a custom `sw.js` — not vite-plugin-pwa. Adapt the hash computation and HTML injection to the Expo/Metro build pipeline. See the "Adapting to other stacks" table in the pattern doc for the Expo / Metro column.

1. [ ] **Compute content hash of icon files** — In a prebuild script, SHA-256 hash each icon PNG and expose versioned paths.
2. [ ] **Inject versioned URLs into `+html.tsx`** — Update `<link rel="icon">` and `<link rel="apple-touch-icon">` tags with `?v=<hash>`.
3. [ ] **Update `sw.js` precache** — Ensure the custom service worker handles versioned icon URLs (strip `?v=` on cache lookup or precache the versioned URL directly).
4. [ ] **Add user communication** — "Already installed and the icon looks outdated?" collapsible in install UI.
5. **Confirm:** Build, verify versioned URLs in HTML link tags. Test offline icon loading.

#### EVENT_BUS — Evaluate if needed

- [ ] **Decide:** synctone has Zustand stores and React hooks for state. If chat/message/reaction services need decoupled pub/sub communication, follow `docs/implementations/EVENT_BUS.md`. Otherwise skip.

---

## Cross-Cutting Gaps (most common across repos)

Updated 2026-04-18 after parallel re-validation via GitHub API (one agent per repo).

Fully clean (no pending items): **canva-grid, budgy-ting**.
Fully clean on core patterns + HISTORY.md + Communication, trailing items only: glow-props, repo-tor, graphiki, few-lap.
Still carrying substantial backlogs: see-veo, sun-sea-o, four-ems, synctone, model-pear.

These gaps appear in 4+ repos and represent the highest-leverage improvements:

1. **Triggers redesign** — Cross-fleet policy 2026-04-17. glow-props has 48 triggers in 8 groups + 6 cadence meta sweeps + 7 reflective passes, replacing the older 9-trigger single-word set. **Done in canva-grid + budgy-ting. Partial in few-lap** (8 group tables present but missing Meta sweeps + Reflective passes tables). **Still missing in repo-tor, model-pear, see-veo, sun-sea-o, graphiki, four-ems, synctone** (7 repos).
2. **CLAUDE.md alignment** — Pass in canva-grid, budgy-ting, repo-tor, graphiki, few-lap. Worst remaining offenders for inline patterns: four-ems (~630 lines), sun-sea-o (~470 lines), see-veo (~285 lines), synctone (8 local files in `docs/implementations/`). model-pear needs Communication section only.
3. **HISTORY.md removal** — Already done in canva-grid, budgy-ting, repo-tor, graphiki, few-lap (file already absent). Still present in model-pear, see-veo, sun-sea-o, four-ems, synctone.
4. **PWA_ICON_CACHE_BUST** — Full Pass in canva-grid, budgy-ting (tripwire test `src/iconCacheBust.test.ts` added), repo-tor (core + test + UX). Partial in graphiki (tripwire test `src/test/icon-cache-bust.test.ts` added; user communication missing). Missing in see-veo, sun-sea-o, four-ems (vite-plugin-pwa repos) and few-lap, synctone (Expo — stack-specific adaptation needed). N/A for glow-props + model-pear.
5. **EVENT_BUS** — N/A in canva-grid, budgy-ting, repo-tor (decided against). Pass in graphiki (typed payload map done). 6 repos still need evaluate decision.
6. **DEBUG_SYSTEM: console interception** — Done in canva-grid, budgy-ting, repo-tor, graphiki, model-pear, few-lap (`consoleCapture.ts`). Still missing in see-veo, sun-sea-o, four-ems, synctone.
7. **DEBUG_SYSTEM: pre-React inline pill** — Done in canva-grid, budgy-ting, repo-tor, sun-sea-o, graphiki, model-pear, few-lap (`bootPillScript`). Still missing in see-veo, four-ems, synctone.
8. **DEBUG_SYSTEM: inline styles** — Done in canva-grid, repo-tor, graphiki, model-pear, few-lap. Others still use Tailwind/DaisyUI.
9. **DEBUG_SYSTEM: PWA Diagnostics tab** — Done in canva-grid, budgy-ting, repo-tor, see-veo, graphiki, model-pear. Still missing in few-lap, sun-sea-o, four-ems, synctone.
10. **PWA_SYSTEM: visibility-based update checks** — Done in canva-grid, budgy-ting, repo-tor, glow-props, graphiki. Still missing in see-veo, few-lap, sun-sea-o, four-ems, synctone.
11. **PWA_SYSTEM: 30-second suppression** — Done in canva-grid, budgy-ting, repo-tor, glow-props, graphiki. **Four-ems correction 2026-04-18: earlier claim was wrong — has only a 3s offline-ready dismissal, not 30s update suppression.** Still missing in see-veo, sun-sea-o, four-ems, synctone.
12. **PWA_SYSTEM: module singleton** — Done in canva-grid, budgy-ting, glow-props, repo-tor, graphiki. Still missing in see-veo, sun-sea-o, four-ems, model-pear.
13. **BURGER_MENU: focus hooks extraction** — Done in canva-grid, budgy-ting, repo-tor, graphiki, few-lap. Still missing in repos without a full burger menu (model-pear, see-veo, sun-sea-o, four-ems, synctone).
14. **THEME_DARK_MODE** — Missing in model-pear, see-veo, sun-sea-o, four-ems (no theming). canva-grid, budgy-ting, repo-tor, graphiki have full DaisyUI systems. few-lap has Uniwind with `@variant` blocks covering all DaisyUI semantic tokens (Pass). synctone has Uniwind but flash prevention script is missing.
15. **Z_INDEX_SCALE** — Pass in glow-props, canva-grid, budgy-ting, repo-tor. Partial in graphiki, model-pear. Missing in see-veo, few-lap, sun-sea-o, four-ems, synctone.
