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

Audited 2026-04-06 against updated `docs/implementations/*.md` pattern docs. Updated 2026-04-10 with Z_INDEX_SCALE (9 patterns). Re-audited 2026-04-16 against actual repo code — corrected stale statuses for canva-grid, budgy-ting, see-veo, few-lap, four-ems, repo-tor. repo-tor re-audited same day and confirmed fully compliant on original 9 patterns. Added PWA_ICON_CACHE_BUST pattern 2026-04-16 (10 patterns). Re-audited 2026-04-17 via GitHub API across all 10 downstream repos — struck items confirmed done: canva-grid/repo-tor ICON_CACHE_BUST partial implementation, repo-tor HISTORY.md already removed, budgy-ting BURGER_MENU + DEBUG_SYSTEM fully done, graphiki PWA module singleton, model-pear APP_ICONS entirely done + Implementation Patterns section exists, see-veo DEBUG PWA Diagnostics tab, few-lap Suggested Implementations already deleted + flash prevention, sun-sea-o maskable 1024 + clipboard + inline pill, four-ems 30s suppression, synctone flash prevention. Also 2026-04-17: Triggers redesign (48 triggers in 8 groups + 6 cadence meta sweeps + 7 reflective passes) added as a cross-fleet alignment task to all 10 repos.

Legend: **Pass** = compliant, **Partial** = has the feature but with gaps, **Missing** = not implemented, **N/A** = not applicable

### Gap Matrix

| Repo | CLAUDE.md | APP_ICONS | BURGER_MENU | DEBUG_SYSTEM | DOWNLOAD_PDF | PWA_SYSTEM | THEME_DARK_MODE | EVENT_BUS | Z_INDEX_SCALE | ICON_CACHE_BUST |
|------|-----------|-----------|-------------|--------------|--------------|------------|-----------------|-----------|---------------|-----------------|
| glow-props | Pass | Pass | Pass | N/A | Pass | Pass | Pass | N/A | Pass | N/A |
| canva-grid | Pass | Pass | Pass | Pass | Pass (B) | Pass | Pass | N/A | Pass | Missing |
| budgy-ting | Pass | Pass | Pass | Pass | Partial | Pass | Pass | Missing | Pass | Missing |
| model-pear | Partial | Pass | Missing | Partial | Partial | Missing | Missing | Missing | Missing | N/A |
| see-veo | Missing | Partial | Missing | Partial | Partial | Partial | Missing | Missing | Missing | Missing |
| repo-tor | Pass | Pass | Pass | Pass | Pass | Pass | Pass | N/A | Pass | Missing |
| few-lap | Missing | Partial | Partial | Partial | Missing | Partial | Partial | Missing | Missing | Missing |
| sun-sea-o | Missing | Partial | Missing | Partial | Pass | Partial | Missing | Missing | Missing | Missing |
| graphiki | Missing | Pass | Missing | Partial | Missing | Partial | Pass | Partial | Partial | Missing |
| four-ems | Missing | Partial | Missing | Partial | Partial | Partial | Missing | Missing | Missing | Missing |
| synctone | Missing | Partial | Missing | Partial | Missing | Partial | Partial | Missing | Missing | Missing |

**(B)** = Approach B (pdf-lib) per `docs/implementations/DOWNLOAD_PDF.md` — correct choice for canvas-heavy content

**N/A for ICON_CACHE_BUST**: glow-props (static site, no PWA icons), model-pear (no PWA yet — implement PWA_SYSTEM first)

### canva-grid

React + Vite app. All original 9 patterns resolved (verified 2026-04-10). Remaining: HISTORY.md removal, Communication section, and new ICON_CACHE_BUST pattern.

EVENT_BUS: Decided against — React Context dispatch is sufficient for its architecture.

#### HISTORY.md — Remove (cross-fleet policy 2026-04-16)

Git history already tracks completions; a separate changelog is redundant.

1. [ ] Delete `docs/HISTORY.md`
2. [ ] Remove `### docs/HISTORY.md` section from CLAUDE.md Documentation rules
3. [ ] Change "move completed items to HISTORY.md" → "delete completed items (git history tracks them)" in CLAUDE.md
4. [ ] Remove HISTORY.md from README.md file tree (if listed)
5. [ ] Delete any `[x]` completed items from `docs/TODO.md`

#### CLAUDE.md — Add Communication section (cross-fleet policy 2026-04-16)

glow-props CLAUDE.md now has a top-level `## Communication` section between Principles and Code Standards. Downstream repos must add it.

1. [ ] **Add `## Communication` section** — Copy from glow-props CLAUDE.md (lines 32-46). Place between Principles and Code Standards.
2. [ ] **Update header line** — Add COMMUNICATION to the `# READ AND FOLLOW...` line.
3. [ ] **Remove duplicate bullets from AI Notes** — If "ASK before assuming" or "Communication style" bullets exist in AI Notes, remove them (now covered by the Communication section).

#### Triggers — Replace with glow-props version (cross-fleet policy 2026-04-17)

glow-props CLAUDE.md has a redesigned Triggers section: 48 triggers in 8 groups, 6 cadence meta sweeps (`hot` / `quick` / `ship` / `session` / `tidy` / `all`), 7 reflective passes (`risk` / `surface` / `wrap` / `skipped` / `assumed` / `approach` / `cold`), and scope modifiers (`branch` / `staged` / `file <path>`). Replaces the older single-word Triggers section (`rev`/`aud`/`mobile`/`clean`/`start`/etc.).

1. [ ] **Replace the existing `## Triggers` section** — Copy the full new `## Triggers` section from glow-props CLAUDE.md verbatim, including How to invoke, Scope modifiers, Behavior rules, all 8 group tables (`correctness`, `trust`, `speed`, `frontend`, `quality`, `ops`, `design`, `fleet`), Meta sweeps table, and Reflective passes table.
2. [ ] **Note any name collisions** — If the repo has npm scripts, folders, or conventions using single-word names matching trigger names (e.g. `docs/`, `tests/`, `config/`, `api/`), add a line in AI Notes clarifying context precedence.
3. **Confirm:** `grep -c "^## Triggers$" CLAUDE.md` returns `1`. All 8 group tables present. No old single-word triggers (`rev`/`aud`/`start`/`go`) remain.

#### ICON_CACHE_BUST — Partial → Complete

Reference: `docs/implementations/PWA_ICON_CACHE_BUST.md` (fetch from glow-props)

Core plumbing done (verified 2026-04-17): `iconVersion()` + `iconCacheBustHtml()` in `vite.config.js`, versioned manifest icon URLs, `ignoreURLParametersMatching: [/^v$/]` in workbox config. Remaining: test + user communication.

1. [ ] **Add tripwire test** — Source-level and dist-level assertions per the pattern doc.
2. [ ] **Add user communication** — "Already installed and the icon looks outdated?" collapsible in install modal.
3. **Confirm:** Build, verify `dist/manifest.webmanifest` icons have `?v=` hashes, `dist/index.html` link tags have `?v=` hashes, `dist/sw.js` has `ignoreURLParametersMatching` with `/^v$/`.

### budgy-ting

Vue + Vite app. Mostly compliant (verified 2026-04-17). CLAUDE.md, APP_ICONS, BURGER_MENU, DEBUG_SYSTEM, PWA_SYSTEM, THEME_DARK_MODE, and Z_INDEX_SCALE are now fully passing. Remaining gaps: DOWNLOAD_PDF (needs print button), plus cross-fleet items (HISTORY.md removal, Communication section, ICON_CACHE_BUST).

Previous gaps now confirmed done (2026-04-17 audit): BURGER_MENU `destructive`/`external` MenuItem properties implemented; DEBUG_SYSTEM static `#debug-root` in `index.html`, subscriber replay via `getEntries()` on subscribe, `?embed=` skip in `main.ts`.

#### HISTORY.md — Remove (cross-fleet policy 2026-04-16)

Git history already tracks completions; a separate changelog is redundant.

1. [ ] Delete `docs/HISTORY.md`
2. [ ] Remove `### docs/HISTORY.md` section from CLAUDE.md Documentation rules
3. [ ] Change "move completed items to HISTORY.md" → "delete completed items (git history tracks them)" in CLAUDE.md
4. [ ] Remove HISTORY.md from README.md file tree (if listed)
5. [ ] Delete any `[x]` completed items from `docs/TODO.md`

#### DOWNLOAD_PDF — Partial → Complete

Reference: `docs/implementations/DOWNLOAD_PDF.md`

1. [ ] **Add `window.print()` trigger button** — Print CSS already exists (`.no-print` class, `@media print` rules, `beforeprint`/`afterprint` dark mode handlers). Add a "Save as PDF" button in the UI that calls `window.print()`.
2. **Confirm:** Click button, verify print preview shows clean output with no interactive elements.

#### CLAUDE.md — Add Communication section (cross-fleet policy 2026-04-16)

glow-props CLAUDE.md now has a top-level `## Communication` section between Principles and Code Standards. Downstream repos must add it.

1. [ ] **Add `## Communication` section** — Copy from glow-props CLAUDE.md (lines 32-46). Place between Principles and Code Standards.
2. [ ] **Update header line** — Add COMMUNICATION to the `# READ AND FOLLOW...` line.
3. [ ] **Remove duplicate bullets from AI Notes** — If "ASK before assuming" or "Communication style" bullets exist in AI Notes, remove them (now covered by the Communication section).

#### Triggers — Replace with glow-props version (cross-fleet policy 2026-04-17)

glow-props CLAUDE.md has a redesigned Triggers section: 48 triggers in 8 groups, 6 cadence meta sweeps (`hot` / `quick` / `ship` / `session` / `tidy` / `all`), 7 reflective passes (`risk` / `surface` / `wrap` / `skipped` / `assumed` / `approach` / `cold`), and scope modifiers (`branch` / `staged` / `file <path>`). Replaces the older single-word Triggers section (`rev`/`aud`/`mobile`/`clean`/`start`/etc.).

1. [ ] **Replace the existing `## Triggers` section** — Copy the full new `## Triggers` section from glow-props CLAUDE.md verbatim, including How to invoke, Scope modifiers, Behavior rules, all 8 group tables (`correctness`, `trust`, `speed`, `frontend`, `quality`, `ops`, `design`, `fleet`), Meta sweeps table, and Reflective passes table.
2. [ ] **Note any name collisions** — If the repo has npm scripts, folders, or conventions using single-word names matching trigger names (e.g. `docs/`, `tests/`, `config/`, `api/`), add a line in AI Notes clarifying context precedence.
3. **Confirm:** `grep -c "^## Triggers$" CLAUDE.md` returns `1`. All 8 group tables present. No old single-word triggers (`rev`/`aud`/`start`/`go`) remain.

#### ICON_CACHE_BUST — Missing → Implement

Reference: `docs/implementations/PWA_ICON_CACHE_BUST.md` (fetch from glow-props)

budgy-ting uses vite-plugin-pwa. Icons served with stable filenames.

1. [ ] **Add `iconVersion()` + `iconCacheBustHtml()` to `vite.config.ts`** — Content-hash each icon file, inject `?v=<hash>` into HTML link tags. Plugin must be wired before `VitePWA()`.
2. [ ] **Version manifest icon URLs** — Pass `versioned()` paths to `VitePWA({ manifest: { icons: [...] } })`.
3. [ ] **Add `ignoreURLParametersMatching: [/^v$/]`** to workbox config.
4. [ ] **Add tripwire test** — Source-level and dist-level assertions per the pattern doc.
5. [ ] **Add user communication** — "Already installed and the icon looks outdated?" collapsible in install modal.
6. **Confirm:** Build, verify versioned URLs in manifest + HTML + SW config.

#### EVENT_BUS — Evaluate if needed

- [ ] **Decide:** Does budgy-ting have service-layer pub/sub needs? If yes, follow `docs/implementations/EVENT_BUS.md`. If not, skip.

### model-pear

SvelteKit app. Improved compliance verified 2026-04-17: APP_ICONS fully done (SVG source + generate-icons.mjs + manifest + HTML links + sharp), DEBUG_SYSTEM foundations done (debugLog.ts + `#debug-root` with inline pill + DebugPill.svelte). Implementation Patterns section exists at line 365. No stale "Shared conventions" AI Note. Still needs: PWA_SYSTEM (no vite-plugin-pwa), THEME_DARK_MODE (no DaisyUI), BURGER_MENU hardening, and cross-fleet items.

#### HISTORY.md — Remove (cross-fleet policy 2026-04-16)

Git history already tracks completions; a separate changelog is redundant.

1. [ ] Delete `docs/HISTORY.md`
2. [ ] Remove `### docs/HISTORY.md` section from CLAUDE.md Documentation rules
3. [ ] Change "move completed items to HISTORY.md" → "delete completed items (git history tracks them)" in CLAUDE.md
4. [ ] Remove HISTORY.md from README.md file tree (if listed)
5. [ ] Delete any `[x]` completed items from `docs/TODO.md` (including the "Negotiation Mode" High Priority section which is marked complete)

#### CLAUDE.md — Align with glow-props

"Implementation Patterns (Source of Truth)" section already exists at line 365 (verified 2026-04-17). No stale "Shared conventions" note. Remaining: prohibition + Communication section.

1. [ ] **Add prohibition** — Add to Prohibitions: "Create local copies of implementation pattern files in any repo — always fetch from glow-props".
2. [ ] **Add `## Communication` section** — Copy from glow-props CLAUDE.md (lines 32-46). Place between Principles and Code Standards. Update header line to include COMMUNICATION. Remove any duplicate "ASK before assuming" or "Communication style" bullets from AI Notes.
3. **Confirm:** Prohibition present. Communication section exists between Principles and Code Standards.

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

#### DEBUG_SYSTEM — Partial → Complete

Reference: `docs/implementations/DEBUG_SYSTEM.md`

Foundations confirmed present (2026-04-17): `src/lib/debugLog.ts`, `<div id="debug-root">` in `app.html` with inline pill script, `DebugPill.svelte` component. Verify depth of implementation against the pattern doc:

1. [ ] **Audit `debugLog.ts`** — Confirm circular buffer (max 200), typed sources/severities, `debugAdd`/`debugSubscribe`/`debugGetEntries`/`debugClear`/`debugGenerateReport`, console interception (`console.error`/`console.warn` patched at module load), global error/rejection listeners.
2. [ ] **Audit `DebugPill.svelte`** — Confirm it renders into `#debug-root` (not inline in app tree), uses inline styles (not Tailwind), has 3 tabs: Log, Environment, PWA Diagnostics.
3. [ ] **Audit inline pill script in `app.html`** — Confirm 20-second loading timeout, `window.__debugPushError()` stub, handover to framework pill.
4. **Confirm:** Open app, verify pill appears. Trigger `console.error('test')` in DevTools — should appear in Log tab. Kill the server mid-load — inline pill should appear.

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

Git history already tracks completions; a separate changelog is redundant.

1. [ ] Delete `docs/HISTORY.md`
2. [ ] Remove `### docs/HISTORY.md` section from CLAUDE.md Documentation rules
3. [ ] Change "move completed items to HISTORY.md" → "delete completed items (git history tracks them)" in CLAUDE.md
4. [ ] Remove HISTORY.md from README.md file tree (if listed)
5. [ ] Delete any `[x]` completed items from `docs/TODO.md`

#### CLAUDE.md — Align with glow-props

No local `docs/implementations/` folder (correct). Has **~280 lines of hardcoded inline patterns** in a "Suggested Implementations" section (~lines 322-603) covering PWA System, App Icons, Download as PDF, Timer Leaks, and HTTPS Proxy — full code examples embedded directly. Missing: any reference to glow-props as pattern source.

1. [ ] **Delete entire "Suggested Implementations" section** — Remove ~lines 322-603 (~280 lines of inline pattern code for PWA System, App Icons, Download as PDF, Timer Leaks, HTTPS Proxy).
2. [ ] **Add "Implementation Patterns (Source of Truth)" section** — Replace deleted section with the standard glow-props reference block (source location, fetch via GitHub Pages/API, listing command, rules).
3. [ ] **Add AI Note** — Add: `**Implementation patterns — always fetch from glow-props.** Never look for local copies of implementation pattern files (e.g., docs/implementations/*.md) in downstream repos. They do not exist locally — the single source of truth is the docs/implementations/ folder in the glow-props repo. Fetch the latest version before every implementation task.`
4. [ ] **Add prohibition** — Add to Prohibitions: "Create local copies of implementation pattern files in any repo — always fetch from glow-props".
5. [ ] **Add `## Communication` section** — Copy from glow-props CLAUDE.md (lines 32-46). Place between Principles and Code Standards. Update header line to include COMMUNICATION. Remove any duplicate "ASK before assuming" or "Communication style" bullets from AI Notes.
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

React + Vite dashboard app. All original 9 patterns resolved (verified 2026-04-16). HISTORY.md already removed (verified 2026-04-17). Remaining: formalize Communication section as top-level, finish ICON_CACHE_BUST (test + user communication).

All previous gaps implemented: 180px Apple touch icon + favicon.ico, z-index scale normalized, full debugLog module with pub/sub + console interception + #debug-root + React DebugPill (3 tabs) + clipboard fallbacks + URL redaction, DaisyUI v5 with 8 themes + data-theme + flash prevention + cross-tab sync + meta theme-color, useDisclosureFocus + useFocusTrap + Home/End keys + disabled items + theme UI in burger menu.

EVENT_BUS: Not needed — React Context dispatch + useReducer in AppContext.jsx is sufficient.

#### CLAUDE.md — Formalize Communication section (cross-fleet policy 2026-04-16)

repo-tor already has a "Communication Style" block but not as a top-level `## Communication` section. glow-props CLAUDE.md now places `## Communication` between Principles and Code Standards.

1. [ ] **Promote to top-level `## Communication` section** — Move/restructure existing "Communication Style" content into a top-level section placed between Principles and Code Standards. Copy glow-props CLAUDE.md (lines 32-46) as the authoritative version.
2. [ ] **Update header line** — Add COMMUNICATION to the `# READ AND FOLLOW...` line.
3. [ ] **Remove duplicate bullets from AI Notes** — If "ASK before assuming" or "Communication style" bullets remain in AI Notes, remove them (now covered by the Communication section).

#### Triggers — Replace with glow-props version (cross-fleet policy 2026-04-17)

glow-props CLAUDE.md has a redesigned Triggers section: 48 triggers in 8 groups, 6 cadence meta sweeps (`hot` / `quick` / `ship` / `session` / `tidy` / `all`), 7 reflective passes (`risk` / `surface` / `wrap` / `skipped` / `assumed` / `approach` / `cold`), and scope modifiers (`branch` / `staged` / `file <path>`). Replaces the older single-word Triggers section (`rev`/`aud`/`mobile`/`clean`/`start`/etc.).

1. [ ] **Replace the existing `## Triggers` section** — Copy the full new `## Triggers` section from glow-props CLAUDE.md verbatim, including How to invoke, Scope modifiers, Behavior rules, all 8 group tables (`correctness`, `trust`, `speed`, `frontend`, `quality`, `ops`, `design`, `fleet`), Meta sweeps table, and Reflective passes table.
2. [ ] **Note any name collisions** — If the repo has npm scripts, folders, or conventions using single-word names matching trigger names (e.g. `docs/`, `tests/`, `config/`, `api/`), add a line in AI Notes clarifying context precedence.
3. **Confirm:** `grep -c "^## Triggers$" CLAUDE.md` returns `1`. All 8 group tables present. No old single-word triggers (`rev`/`aud`/`start`/`go`) remain.

#### ICON_CACHE_BUST — Partial → Complete

Reference: `docs/implementations/PWA_ICON_CACHE_BUST.md` (fetch from glow-props)

Core plumbing done (verified 2026-04-17): `iconVersion()` + `iconCacheBustHtml()` in `vite.config.js`, versioned manifest icon URLs, `ignoreURLParametersMatching: [/^v$/]` in workbox config. Remaining: test + user communication.

1. [ ] **Add tripwire test** — Source-level and dist-level assertions per the pattern doc.
2. [ ] **Add user communication** — "Already installed and the icon looks outdated?" collapsible in install modal.
3. **Confirm:** Build, verify versioned URLs in manifest + HTML + SW config.

### few-lap

React Native (Expo) app. Uses Metro bundler (not Vite) and Uniwind for theming. Has a burger menu and debug system that need hardening. Custom SW approach is correct for Expo.

#### HISTORY.md — Remove (cross-fleet policy 2026-04-16)

Git history already tracks completions; a separate changelog is redundant.

1. [ ] Delete `docs/HISTORY.md`
2. [ ] Remove `### docs/HISTORY.md` section from CLAUDE.md Documentation rules
3. [ ] Change "move completed items to HISTORY.md" → "delete completed items (git history tracks them)" in CLAUDE.md
4. [ ] Remove HISTORY.md from README.md file tree (if listed)
5. [ ] Delete any `[x]` completed items from `docs/TODO.md`

#### CLAUDE.md — Align with glow-props

"Suggested Implementations" section already deleted (verified 2026-04-17 — CLAUDE.md is 1221 lines, not 1800+). Remaining: add Implementation Patterns section, prohibition, Communication section, and update the stale HTTPS_PROXY AI Note.

1. [ ] **Add "Implementation Patterns (Source of Truth)" section** — Add the standard glow-props reference block (source location, fetch via GitHub Pages/API, listing command, rules).
2. [ ] **Update AI Note reference** — Near line 525, change `httpsGet() CONNECT tunnel pattern from Suggested Implementations` to reference fetching the HTTPS_PROXY pattern from glow-props.
3. [ ] **Add AI Note** — Add the standard implementation patterns note about always fetching from glow-props.
4. [ ] **Add prohibition** — Add to Prohibitions: "Create local copies of implementation pattern files in any repo — always fetch from glow-props".
5. [ ] **Add `## Communication` section** — Copy from glow-props CLAUDE.md (lines 32-46). Place between Principles and Code Standards. Update header line to include COMMUNICATION. Remove any duplicate "ASK before assuming" or "Communication style" bullets from AI Notes.
6. **Confirm:** All pattern references point to glow-props. Communication section exists between Principles and Code Standards.

#### Triggers — Replace with glow-props version (cross-fleet policy 2026-04-17)

glow-props CLAUDE.md has a redesigned Triggers section: 48 triggers in 8 groups, 6 cadence meta sweeps (`hot` / `quick` / `ship` / `session` / `tidy` / `all`), 7 reflective passes (`risk` / `surface` / `wrap` / `skipped` / `assumed` / `approach` / `cold`), and scope modifiers (`branch` / `staged` / `file <path>`). Replaces the older single-word Triggers section (`rev`/`aud`/`mobile`/`clean`/`start`/etc.).

1. [ ] **Replace the existing `## Triggers` section** — Copy the full new `## Triggers` section from glow-props CLAUDE.md verbatim, including How to invoke, Scope modifiers, Behavior rules, all 8 group tables (`correctness`, `trust`, `speed`, `frontend`, `quality`, `ops`, `design`, `fleet`), Meta sweeps table, and Reflective passes table.
2. [ ] **Note any name collisions** — If the repo has npm scripts, folders, or conventions using single-word names matching trigger names (e.g. `docs/`, `tests/`, `config/`, `api/`), add a line in AI Notes clarifying context precedence.
3. **Confirm:** `grep -c "^## Triggers$" CLAUDE.md` returns `1`. All 8 group tables present. No old single-word triggers (`rev`/`aud`/`start`/`go`) remain.

#### APP_ICONS — Partial → Complete

Reference: `docs/implementations/APP_ICONS.md`

1. [ ] **Add 180px Apple touch icon** — Currently uses 192px for `<link rel="apple-touch-icon">`. Add a dedicated 180px output to the generation script (Apple's recommended size).
2. [ ] **Update `+html.tsx`** — Point `<link rel="apple-touch-icon">` to the new 180px file instead of `icon-192.png`.
3. **Confirm:** Verify 180px PNG is generated. Test on iOS — home screen icon should be crisp.

#### BURGER_MENU — Partial → Complete

Reference: `docs/implementations/BURGER_MENU.md` (React Native variant section)

Data-driven MenuItem interface already implemented. Remaining gaps:

1. [ ] **Add `useDisclosureFocus` hook** — Focus first item on open, return to trigger on close. Extract as reusable hook.
2. [ ] **Add `useFocusTrap`** — Tab/Shift+Tab should cycle within menu items when open. For Expo web, this is a DOM concern.
3. [ ] **Add arrow key / Home / End navigation** — For web platform. React Native doesn't have DOM keyboard nav, but Expo serves on web too.
4. [ ] **Add `aria-controls` linking** — Trigger button `aria-controls={menuId}` pointing to the menu element.
5. [ ] **Add theme UI to menu** — Once THEME_DARK_MODE flash prevention is done, verify theme toggle and picker follow [Theme UI in Burger Menu](../implementations/BURGER_MENU.md#theme-ui-in-burger-menu) spec (React Native variant).
6. **Confirm:** Open menu on web — keyboard navigation works, focus is trapped. On mobile — haptic feedback on toggle, 44px touch targets. Theme toggle works within menu.

#### DEBUG_SYSTEM — Partial → Complete

Reference: `docs/implementations/DEBUG_SYSTEM.md`

1. [ ] **Add separate `#debug-root`** — In `+html.tsx`, add a root element for the debug pill outside the app tree so it survives crashes.
2. [ ] **Switch to inline styles** — Replace Tailwind `className` with inline styles in DebugPill.
3. [ ] **Add console interception** — Patch `console.error`/`console.warn` in `debugLog.ts`.
4. [ ] **Add pre-React inline pill** — Inline `<script>` in `+html.tsx` with `window.__debugPushError()` and 20-second timeout.
5. [ ] **Add subscriber replay** — New subscribers receive existing entries immediately on subscribe.
6. [ ] **Change `details` to `Record<string, unknown>`** — Currently `string`. Structured data enables post-mortem filtering.
7. [ ] **Add URL query param redaction** — In `debugGenerateReport()`.
9. **Confirm:** Open app, crash a component — pill survives in separate root. Copy report — URLs redacted. New subscriber gets existing entries.

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

#### THEME_DARK_MODE — Partial → Complete

Reference: `docs/implementations/THEME_DARK_MODE.md` (Uniwind Theme Switching + Zustand Store sections)

few-lap uses Uniwind with `@variant` blocks — not `data-theme`. The Uniwind approach is architecturally different but should still cover flash prevention.

Flash prevention script already present in `+html.tsx` (verified 2026-04-17).

1. [ ] **Verify Uniwind `@variant` blocks cover all DaisyUI semantic tokens** — Ensure the CSS variable definitions in each `@variant` block match DaisyUI's expected variables for full component compatibility.
2. **Confirm:** Reload with a non-default theme saved — no flash. Toggle dark/light — instant switch.

#### Z_INDEX_SCALE — Missing → Implement

Reference: `docs/implementations/Z_INDEX_SCALE.md`

1. [ ] **Audit and normalize all z-index values** — Run the audit command from the pattern doc. Align all values to the standard scale.
2. **Confirm:** All z-index values map to the standard scale.

#### ICON_CACHE_BUST — Missing → Implement

Reference: `docs/implementations/PWA_ICON_CACHE_BUST.md` (fetch from glow-props)

few-lap uses Expo with a custom `sw.js` — not vite-plugin-pwa. Adapt the hash computation and HTML injection to the Expo/Metro build pipeline. See the "Adapting to other stacks" table in the pattern doc for the Expo / Metro column.

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

React + Vite graph editor. Strong foundation — APP_ICONS, THEME_DARK_MODE, and EVENT_BUS (origin repo) are compliant or near-compliant. Focus areas: debug system hardening, PWA update reliability, and evaluating burger menu need.

#### HISTORY.md — Remove (cross-fleet policy 2026-04-16)

Git history already tracks completions; a separate changelog is redundant.

1. [ ] Delete `docs/HISTORY.md`
2. [ ] Remove `### docs/HISTORY.md` section from CLAUDE.md Documentation rules
3. [ ] Change "move completed items to HISTORY.md" → "delete completed items (git history tracks them)" in CLAUDE.md
4. [ ] Remove HISTORY.md from README.md file tree (if listed)
5. [ ] Delete any `[x]` completed items from `docs/TODO.md` (including the "DONE: Remove IDs from Import/Merge" section which is marked complete)

#### CLAUDE.md — Align with glow-props

No local `docs/implementations/` folder (correct). Has **~180 lines of hardcoded inline patterns** in a "SUGGESTED IMPLEMENTATIONS" section (~line 581) covering PWA System, Debug System, App Icons, Download as PDF — full code examples. No reference to glow-props as pattern source exists.

1. [ ] **Delete entire "SUGGESTED IMPLEMENTATIONS" section** — Remove ~180 lines of inline pattern code (~lines 581-760) for PWA System, Debug System, App Icons, Download as PDF.
2. [ ] **Add "Implementation Patterns (Source of Truth)" section** — Replace deleted section with the standard glow-props reference block (source location, fetch via GitHub Pages/API, listing command, rules).
3. [ ] **Add AI Note** — Add the standard implementation patterns note about always fetching from glow-props.
4. [ ] **Add prohibition** — Add to Prohibitions: "Create local copies of implementation pattern files in any repo — always fetch from glow-props".
5. [ ] **Add `## Communication` section** — Copy from glow-props CLAUDE.md (lines 32-46). Place between Principles and Code Standards. Update header line to include COMMUNICATION. Remove any duplicate "ASK before assuming" or "Communication style" bullets from AI Notes.
6. **Confirm:** CLAUDE.md is ~180 lines shorter. No inline code examples for patterns remain. Standard fetch commands point to glow-props. Communication section exists between Principles and Code Standards.

#### Triggers — Replace with glow-props version (cross-fleet policy 2026-04-17)

glow-props CLAUDE.md has a redesigned Triggers section: 48 triggers in 8 groups, 6 cadence meta sweeps (`hot` / `quick` / `ship` / `session` / `tidy` / `all`), 7 reflective passes (`risk` / `surface` / `wrap` / `skipped` / `assumed` / `approach` / `cold`), and scope modifiers (`branch` / `staged` / `file <path>`). Replaces the older single-word Triggers section (`rev`/`aud`/`mobile`/`clean`/`start`/etc.).

1. [ ] **Replace the existing `## Triggers` section** — Copy the full new `## Triggers` section from glow-props CLAUDE.md verbatim, including How to invoke, Scope modifiers, Behavior rules, all 8 group tables (`correctness`, `trust`, `speed`, `frontend`, `quality`, `ops`, `design`, `fleet`), Meta sweeps table, and Reflective passes table.
2. [ ] **Note any name collisions** — If the repo has npm scripts, folders, or conventions using single-word names matching trigger names (e.g. `docs/`, `tests/`, `config/`, `api/`), add a line in AI Notes clarifying context precedence.
3. **Confirm:** `grep -c "^## Triggers$" CLAUDE.md` returns `1`. All 8 group tables present. No old single-word triggers (`rev`/`aud`/`start`/`go`) remain.

#### BURGER_MENU — Evaluate if needed

Reference: `docs/implementations/BURGER_MENU.md`

1. [ ] **Decide:** graphiki has an inline mobile overflow menu in `App.tsx` with basic toggle state. Hooks (`useFocusTrap`, `useEscapeKey`) exist but aren't wired to the menu. Options:
   - **Option A:** Upgrade the existing inline menu to a proper disclosure-pattern BurgerMenu component with the hooks wired in.
   - **Option B:** If the current inline menu serves the app's needs, document as intentional deviation and skip.
2. If upgrading: Add `aria-expanded`/`aria-controls`, wire `useFocusTrap` and `useEscapeKey`, add arrow key navigation, fix hamburger button to 44px (currently 40px), add backdrop, add data-driven MenuItem interface.
3. **Confirm:** Full keyboard navigation, focus trapped, Escape closes, 44px touch targets.

#### DEBUG_SYSTEM — Partial → Complete

Reference: `docs/implementations/DEBUG_SYSTEM.md`

graphiki's debug system has `#debug-root` (compliant) and clipboard fallbacks (compliant). Focus on the remaining gaps.

1. [ ] **Add console interception** — Patch `console.error`/`console.warn` at module load in `debugLog.ts`.
2. [ ] **Switch to inline styles** — Replace Tailwind/DaisyUI classes in `DebugPill.tsx` with inline styles so the pill renders in the isolated root even if CSS fails.
3. [ ] **Add PWA Diagnostics tab** — Third tab alongside Log and Env. Active health checks: HTTPS, SW state, manifest validation, standalone mode, install prompt receipt.
4. [ ] **Add pre-React inline pill** — Inline `<script>` in `index.html` with `window.__debugPushError()` and 20-second loading timeout.
5. **Confirm:** Open app, verify 3 tabs. Kill dev server mid-load — inline pill appears. Console errors captured in Log tab.

#### DOWNLOAD_PDF — Evaluate if needed

Reference: `docs/implementations/DOWNLOAD_PDF.md`

1. [ ] **Decide:** Does a graph editor benefit from PDF export? If users need to export graph views as documents, this is useful. If graph export is handled differently (e.g., SVG/PNG export), skip.
2. If implementing: **Use Approach B (pdf-lib)** — graph views are canvas/visual content that `window.print()` can't reliably capture. Follow the pdf-lib section: `npm install pdf-lib html-to-image`, capture graph DOM via `toPng()`, compose into PDF pages.
3. **Confirm:** Export produces a clean PDF with the graph rendered at chosen quality level.

#### PWA_SYSTEM — Partial → Complete

Reference: `docs/implementations/PWA_SYSTEM.md`

Module singleton for install prompt already implemented (verified 2026-04-17 — `consumeEarlyCapturedEvent()` reads from `window.__pwaInstallPromptEvent` captured in inline script).

1. [ ] **Add visibility-based update checks** — `visibilitychange` listener to check for SW updates when tab regains focus.
2. [ ] **Add 30-second suppression** — `sessionStorage` timestamp after update applied. See pattern's `wasJustUpdated()`.
3. **Confirm:** Deploy new version, background tab, bring back — update detected. No re-detection within 30s of applying.

#### Z_INDEX_SCALE — Partial → Complete

Reference: `docs/implementations/Z_INDEX_SCALE.md`

1. [ ] **Audit and normalize all z-index values** — Run the audit command from the pattern doc. Fix any values outside the standard scale.
2. **Confirm:** All z-index values map to the standard scale.

#### ICON_CACHE_BUST — Missing → Implement

Reference: `docs/implementations/PWA_ICON_CACHE_BUST.md` (fetch from glow-props)

graphiki uses vite-plugin-pwa. Icons served with stable filenames.

1. [ ] **Add `iconVersion()` + `iconCacheBustHtml()` to `vite.config.{js|ts}`** — Content-hash each icon file, inject `?v=<hash>` into HTML link tags. Plugin must be wired before `VitePWA()`.
2. [ ] **Version manifest icon URLs** — Pass `versioned()` paths to `VitePWA({ manifest: { icons: [...] } })`.
3. [ ] **Add `ignoreURLParametersMatching: [/^v$/]`** to workbox config.
4. [ ] **Add tripwire test** — Source-level and dist-level assertions per the pattern doc.
5. [ ] **Add user communication** — "Already installed and the icon looks outdated?" collapsible in install modal.
6. **Confirm:** Build, verify versioned URLs in manifest + HTML + SW config.

#### EVENT_BUS — Partial → Complete (origin repo)

Reference: `docs/implementations/EVENT_BUS.md`

graphiki is the origin repo for this pattern. Core is compliant (catch-all, error isolation, factory). One enhancement:

1. [ ] **Add typed payload map** — Currently uses `EventCallback = (payload: unknown) => void`. Upgrade to a generic `EventMap` that maps event names to specific payload types for type safety. See pattern doc for the TypeScript approach.
2. **Confirm:** Existing event bus tests still pass. New typed payloads catch type errors at compile time.

### four-ems

React + Vite app. Has partial APP_ICONS, DEBUG_SYSTEM, DOWNLOAD_PDF, and PWA. Missing BURGER_MENU, THEME_DARK_MODE, and EVENT_BUS entirely.

#### HISTORY.md — Remove (cross-fleet policy 2026-04-16)

Git history already tracks completions; a separate changelog is redundant.

1. [ ] Delete `docs/HISTORY.md`
2. [ ] Remove `### docs/HISTORY.md` section from CLAUDE.md Documentation rules
3. [ ] Change "move completed items to HISTORY.md" → "delete completed items (git history tracks them)" in CLAUDE.md
4. [ ] Remove HISTORY.md from README.md file tree (if listed)
5. [ ] Delete any `[x]` completed items from `docs/TODO.md`

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

30-second suppression already present in `usePWAUpdate.ts` (verified 2026-04-17).

1. [ ] **Convert to module-level singleton** — Move SW state from React hooks to module-scope variables.
2. [ ] **Add visibility-based update checks** — `visibilitychange` listener.
3. [ ] **Add `checkForUpdate()` function** — Returns typed result for UI/menu integration.
4. [ ] **Add `controllerchange` reload guard** — Auto-reload only when user clicked "Update".
5. [ ] **Add `workbox.cleanupOutdatedCaches: true`** — In vite config.
6. **Confirm:** Deploy, background tab, return — update detected. Manual "Check for updates" works from menu.

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

React Native (Expo) chat app. Uses Metro bundler and Uniwind for theming. Has Zustand stores for state. Custom SW approach is correct for Expo. Theming exists via Uniwind but doesn't follow the DaisyUI dual-layer spec.

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

synctone uses Uniwind's `setTheme()` with `classList.add()` — not the DaisyUI `data-theme` approach. The Uniwind mechanism is architecturally different for React Native.

Flash prevention inline script already present in `+html.tsx` (verified 2026-04-17). Remaining items address the dual-layer theming gap.

1. [ ] **Add `data-theme` attribute** (web platform) — Uniwind's `classList.add(name)` doesn't set `data-theme`. For web, add `document.documentElement.setAttribute('data-theme', name)` alongside the Uniwind call so DaisyUI components work correctly.
2. [ ] **Add `.dark` class toggling** — Set/remove `.dark` on `<html>` for Tailwind's `dark:` variant.
3. [ ] **Add `color-scheme` CSS rule** — `html.dark { color-scheme: dark; }` for native form inputs and scrollbars.
4. [ ] **Extend flash prevention script** — Current inline script handles theme fallback. Extend to also apply both `data-theme` + `.dark` class before Expo mounts.
5. [ ] **Add `@custom-variant dark`** — Tailwind v4's class-based dark mode configuration in CSS.
6. **Confirm:** Reload with non-default theme — no flash. Toggle dark/light — instant. Native select dropdowns match theme on web.

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

Updated 2026-04-17 after re-audit via GitHub API. canva-grid, budgy-ting, and repo-tor have resolved all original 9 pattern gaps; budgy-ting also resolved BURGER_MENU and DEBUG_SYSTEM partial gaps. repo-tor has already removed HISTORY.md. Only glow-props is fully clean on everything.

Also 2026-04-17: glow-props CLAUDE.md Triggers section redesigned from 9 single-word commands to 48 triggers across 8 groups + 6 cadence meta sweeps + 7 reflective passes with scope modifiers. All 10 downstream repos need their Triggers sections replaced.

These gaps appear in 4+ repos and represent the highest-leverage improvements:

1. **CLAUDE.md alignment** — 3 Pass on original scope (repo-tor, canva-grid, budgy-ting), model-pear now Partial (Implementation Patterns section exists), few-lap "Suggested Implementations" section already deleted. Worst remaining offenders for inline patterns: four-ems (~630 lines), sun-sea-o (~470 lines), see-veo (~285 lines), graphiki (~180 lines), synctone (8 local files in `docs/implementations/`). All 10 downstream repos still need the Communication section added.
2. **Triggers redesign** — Cross-fleet policy 2026-04-17. glow-props CLAUDE.md now has 48 triggers in 8 groups + 6 cadence meta sweeps + 7 reflective passes, replacing the older 9-trigger single-word set. Missing in all 10 downstream repos — each needs its existing `## Triggers` section replaced with the new version verbatim.
3. **HISTORY.md removal** — Cross-fleet policy 2026-04-16. Already done in repo-tor. Missing in 9 downstream repos.
4. **PWA_ICON_CACHE_BUST** — Partial in canva-grid + repo-tor (core plumbing done, missing test + user communication). Missing in 7 other PWA repos. N/A for glow-props (static) and model-pear (no PWA yet). Expo repos (few-lap, synctone) need stack-specific adaptation.
5. **EVENT_BUS** — N/A in 3 repos (canva-grid, budgy-ting, repo-tor decided against). graphiki has partial. 7 repos still need evaluate decision.
6. **DEBUG_SYSTEM: console interception** — Done in canva-grid, budgy-ting, repo-tor. Still missing in 5 repos (see-veo, few-lap, sun-sea-o, four-ems, synctone).
7. **DEBUG_SYSTEM: pre-React inline pill** — Done in canva-grid, budgy-ting, repo-tor, sun-sea-o. Still missing in 4 repos.
8. **DEBUG_SYSTEM: inline styles** — Done in repo-tor and canva-grid. Others still use Tailwind/DaisyUI.
9. **DEBUG_SYSTEM: PWA Diagnostics tab** — Done in canva-grid, budgy-ting, repo-tor, see-veo. Still missing in 4 repos.
10. **PWA_SYSTEM: visibility-based update checks** — Done in canva-grid, budgy-ting, repo-tor, glow-props. Still missing in 4 repos.
11. **PWA_SYSTEM: 30-second suppression** — Done in canva-grid, budgy-ting, repo-tor, glow-props, four-ems. Still missing in 3 repos.
12. **PWA_SYSTEM: module singleton** — Done in canva-grid, budgy-ting, glow-props, repo-tor, graphiki (install prompt). Still missing in 3 repos.
13. **BURGER_MENU: focus hooks extraction** — Done in canva-grid (`useEscapeKey`) and repo-tor (`useDisclosureFocus` + `useFocusTrap`). Still missing in other repos with menus.
14. **THEME_DARK_MODE** — Missing in 4/11 repos (model-pear, see-veo, sun-sea-o, four-ems have no theming). budgy-ting and repo-tor now have full DaisyUI systems. Flash prevention inline script present in few-lap + synctone.
15. **Z_INDEX_SCALE** — 4 Pass (glow-props, canva-grid, budgy-ting, repo-tor), 1 Partial (graphiki), 6 Missing.
