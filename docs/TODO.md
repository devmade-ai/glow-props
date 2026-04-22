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

**Parallel re-validation 2026-04-21 (11 agents: 1 coverage + 10 per-repo) — major progress since 2026-04-18 and a coverage finding:**
- **Coverage:** `tool-till-tees` surfaced as untracked first-party backend (powers four-ems + Sancio agreements) — added as tracked repo with a placeholder section pending audit. `canva-grid-assets` correctly skipped (asset CDN for canva-grid).
- **canva-grid, budgy-ting:** FULLY RESOLVED confirmed (no regressions).
- **repo-tor:** Triggers section VERIFIED DONE (all 8 group tables + Meta sweeps + Reflective passes present in CLAUDE.md) — repo-tor is now fully resolved. New small gap: DOWNLOAD_PDF partial (missing `.no-print` class + dedicated print button).
- **few-lap:** Triggers DONE (Meta sweeps + Reflective passes present), Z_INDEX_SCALE DONE (`src/constants/zIndex.ts`), ICON_CACHE_BUST DONE (`scripts/inject-icon-hashes.mjs` + `IconCacheDisclosure.tsx`). Remaining: DOWNLOAD_PDF decision, `__DEV__` guard restore, EVENT_BUS evaluate.
- **model-pear:** Communication section DONE (CLAUDE.md line 365), Z_INDEX_SCALE DONE (Tailwind config extends). HISTORY.md still present — remaining items stand.
- **graphiki:** Z_INDEX_SCALE DONE (no violations), ICON_CACHE_BUST user communication DONE (collapsible in `InstallInstructionsModal.tsx`). Remaining: Triggers, DOWNLOAD_PDF decision.
- **sun-sea-o:** FULLY RESOLVED (live re-verification 2026-04-21 corrected the agent's stale snapshot — recent push landed DEBUG_SYSTEM hardening, PWA user comm, theme color migration, apple-touch-icon link, and EVENT_BUS "Not Applicable" note). Only `PdfPreview.tsx` uses `print:text-gray-*` utilities — documented intentional print-media exception.
- **see-veo:** No progress; **regression correction** — the previous TODO note claiming "PWA Diagnostics third tab via `diagnostics.ts` is already present" is FALSE. `DebugBanner.tsx` has only 2 tabs (`type Tab = 'diagnostics' | 'log'`). The `diagnostics.ts` file exists but is consumed by the single "diagnostics" tab, not a third PWA tab. Corrected in section below.
- **four-ems, synctone:** No progress; all items remain valid.

Legend: **Pass** = compliant, **Partial** = has the feature but with gaps, **Missing** = not implemented, **N/A** = not applicable

### Gap Matrix

| Repo | CLAUDE.md | APP_ICONS | BURGER_MENU | DEBUG_SYSTEM | DOWNLOAD_PDF | PWA_SYSTEM | THEME_DARK_MODE | EVENT_BUS | Z_INDEX_SCALE | ICON_CACHE_BUST |
|------|-----------|-----------|-------------|--------------|--------------|------------|-----------------|-----------|---------------|-----------------|
| glow-props | Pass | Pass | Pass | N/A | Pass | Pass | Pass | N/A | Pass | N/A |
| canva-grid | Pass | Pass | Pass | Pass | Pass (B) | Pass | Pass | N/A | Pass | Pass |
| budgy-ting | Pass | Pass | Pass | Pass | Pass | Pass | Pass | N/A | Pass | Pass |
| model-pear | Pass | Pass | Missing | Pass | Partial | Missing | Missing | Missing | Pass | N/A |
| see-veo | Missing | Partial | Missing | Partial | Partial | Partial | Missing | Missing | Missing | Missing |
| repo-tor | Pass | Pass | Pass | Pass | Pass | Pass | Pass | N/A | Pass | Pass |
| few-lap | Pass | Pass | Pass | Pass | Missing | Partial | Pass | N/A | Pass | Pass |
| sun-sea-o | Pass | Pass | Pass | Pass | Pass | Pass | Pass | N/A | Pass | Pass |
| graphiki | Pass | Pass | Pass | Pass | Missing | Pass | Pass | Pass | Pass | Pass |
| four-ems | Missing | Partial | Missing | Partial | Partial | Partial | Missing | Missing | Missing | Missing |
| synctone | Missing | Partial | Missing | Partial | Missing | Partial | Partial | Missing | Missing | Missing |
| tool-till-tees | Missing | Partial | N/A | N/A | N/A | N/A | ? | ? | N/A | N/A |

**(B)** = Approach B (pdf-lib) per `docs/implementations/DOWNLOAD_PDF.md` — correct choice for canvas-heavy content

**N/A for ICON_CACHE_BUST**: glow-props (static site, no PWA icons), model-pear (no PWA yet — implement PWA_SYSTEM first)

**`?` for tool-till-tees**: two cells pending a decision (THEME_DARK_MODE — does the minimal landing page need theming? EVENT_BUS — does the backend API need internal pub/sub?). Most other cells are `N/A` because tool-till-tees is a hybrid backend-API + minimal landing page, not a user-facing PWA.

### canva-grid — FULLY RESOLVED (2026-04-18)

React + Vite app. All items complete: HISTORY.md removed, Communication section added, ICON_CACHE_BUST fully complete (tripwire test in `src/__tests__/iconCacheBust.test.js` + install-modal collapsible), EVENT_BUS decided against (React Context dispatch), Triggers replaced (8 group tables + meta sweeps + reflective passes + name collisions note in AI Notes). No pending items.

### budgy-ting — FULLY RESOLVED (2026-04-18)

Vue + Vite app. All items complete: HISTORY.md removed, Communication section added, DOWNLOAD_PDF `handlePrint()` wired in `WorkspaceDetailView.vue`, ICON_CACHE_BUST fully complete (tripwire test at `src/iconCacheBust.test.ts`, 151 lines, source + dist assertions), EVENT_BUS decided against, Triggers replaced (8 group tables + meta sweeps + reflective passes). No name collisions found (no npm scripts/folders matching trigger names). No pending items.

### model-pear

SvelteKit app. APP_ICONS done, DEBUG_SYSTEM foundations done, Implementation Patterns section + prohibition present. **Communication section DONE** (verified 2026-04-21, CLAUDE.md line 365). **Z_INDEX_SCALE DONE** (verified 2026-04-21, Tailwind config extends z-index with z-60/z-70/z-80 custom utilities). Still needs: PWA_SYSTEM (no vite-plugin-pwa), THEME_DARK_MODE (no DaisyUI, `class="dark"` hardcoded), BURGER_MENU hardening, DOWNLOAD_PDF button, HISTORY.md removal, Triggers, EVENT_BUS decision.

#### HISTORY.md — Remove (cross-fleet policy 2026-04-16)

Git history already tracks completions; a separate changelog is redundant.

1. [ ] Delete `docs/HISTORY.md`
2. [ ] Remove `### docs/HISTORY.md` section from CLAUDE.md Documentation rules
3. [ ] Change "move completed items to HISTORY.md" → "delete completed items (git history tracks them)" in CLAUDE.md
4. [ ] Remove HISTORY.md from README.md file tree (if listed)
5. [ ] Delete any `[x]` completed items from `docs/TODO.md` (including the "Negotiation Mode" High Priority section which is marked complete)

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

#### EVENT_BUS — Evaluate if needed

- [ ] **Decide:** Does model-pear have service-layer needs? If yes, follow `docs/implementations/EVENT_BUS.md`. If not, document in CLAUDE.md "Not Applicable Patterns".

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

**Correction 2026-04-21:** Previous claim that "third tab (PWA Diagnostics via `diagnostics.ts`) is already present" was WRONG. `DebugBanner.tsx` has only 2 tabs (`type Tab = 'diagnostics' | 'log'`). The `src/utils/diagnostics.ts` file exists but feeds the single "diagnostics" tab — there is no separate PWA Diagnostics third tab. Add as an additional DEBUG_SYSTEM item:

9. [ ] **Add PWA Diagnostics tab as a third tab** — Change `type Tab` to include `'pwa'`, add the tab button + panel in `DebugBanner.tsx`, surface SW registration status, controller, cache names, manifest fetch status, and online status.

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

### repo-tor — FULLY RESOLVED (2026-04-21, corrected)

React + Vite dashboard app. All patterns compliant. Verified 2026-04-21:
- HISTORY.md removed; Communication section at CLAUDE.md line 335.
- Triggers section at line 393 has all 8 group tables (correctness/trust/speed/frontend/quality/ops/design/fleet) + Meta sweeps + Reflective passes + scope modifiers.
- ICON_CACHE_BUST complete (tripwire test in `scripts/__tests__/icon-cache-bust.test.mjs` + install-modal collapsible in `dashboard/js/components/InstallInstructionsModal.jsx`).
- EVENT_BUS decided against (React Context + useReducer in `dashboard/js/AppContext.jsx`).
- DOWNLOAD_PDF complete: `Header.jsx:187` has `{ label: 'Save as PDF', action: () => window.print() }`; `dashboard/styles.css` has `@media print` element overrides; JSX consumers use Tailwind's `print:hidden` variant on chrome they want hidden (documented design choice in the CSS file's header comment — intentionally no `.no-print` utility class, so my earlier "partial" flag was wrong).

No pending items.

### few-lap

React Native (Expo) app (package name `fuelhunt`). Metro bundler + Uniwind + custom `sw.js`. CLAUDE.md, APP_ICONS, BURGER_MENU, DEBUG_SYSTEM, THEME_DARK_MODE, PWA visibility pause, Triggers, Z_INDEX_SCALE (`src/constants/zIndex.ts`), ICON_CACHE_BUST (`scripts/inject-icon-hashes.mjs` + `IconCacheDisclosure.tsx` + sw.js handles versioned URLs), and **EVENT_BUS** (Not Applicable — documented in `CLAUDE.md:747-751` with rationale 2026-04-18) all confirmed DONE 2026-04-21. Two items remain.

**Bonus finding (not a pattern gap — STILL UNADDRESSED):** `src/debug/debugLog.ts` has a leftover `// TEMPORARY: always-on for PWA alpha diagnostics. Restore` comment (lines 6, 218, 353). The `__DEV__` guard is still missing on `debugAdd()` and the global listener registration — production debug-pill leak risk. Restore:

1. [ ] Add `if (!__DEV__) return;` guard at the top of the init/install function in `src/debug/debugLog.ts` (and the SW-registration path at line ~353).
2. [ ] Delete the 3 TEMPORARY comment blocks.
3. **Confirm:** `eas build --profile production` (or equivalent) → debug pill does not render; dev build still works.

#### DOWNLOAD_PDF — Missing → Implement (conditional)

Reference: `docs/implementations/DOWNLOAD_PDF.md`

1. [ ] **Decide: Is PDF export needed?** FuelHunt is a fuel price tracker — users might want to save price comparisons. If yes, continue.
2. [ ] **Add `@media print` CSS** — In `src/global.css`: `.no-print { display: none !important; }`, white background, black text, `print-color-adjust: exact`.
3. [ ] **Add `no-print` class** to interactive elements (nav, buttons, debug pill).
4. [ ] **Add `window.print()` trigger** — Button in the UI (web-only via `Platform.OS === 'web'` guard).
5. **Confirm:** Click print, verify clean output with no interactive elements.

### sun-sea-o — FULLY RESOLVED (2026-04-21, corrected)

React + Vite app. All 10 glow-props patterns compliant. **Live re-verification 2026-04-21 confirmed all items done** (earlier agent report was against a stale snapshot; repo had a push today that landed the outstanding items):
- HISTORY.md removed; CLAUDE.md fully aligned (Suggested Implementations deleted, Implementation Patterns + Communication + prohibition + AI Note all present); Triggers replaced.
- BurgerMenu with WAI-ARIA disclosure + focus hooks + arrow/Home/End keyboard nav.
- DaisyUI 5.5.19 installed; THEME_DARK_MODE framework complete (Approach A, dual-layer, cross-tab sync, OS fallback, dynamic meta theme-color); color migration complete (only `PdfPreview.tsx` uses `print:text-gray-*` utilities — intentional print-media fallback, documented in file header comment).
- PWA singleton at `src/lib/pwa.ts` (30s suppression, visibility, controllerchange reload guard, `onRegisterError`).
- ICON_CACHE_BUST core plumbing in `vite.config.ts` + user communication collapsible ("Already installed and the icon looks outdated?") with platform-tailored reinstall steps in `src/components/common/InstallInstructionsModal.tsx` lines 122–128.
- APP_ICONS: 400 DPI + 180px apple-touch-icon + favicon.ico + maskable 1024px. `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />` present in `index.html` line 7.
- DebugPill: separate React root, inline styles, 3 tabs (Log / Env / PWA), ClipboardItem Blob fallback, pre-React inline pill. All 6 hardening items DONE: `id: number` field, `details?: Record<string, unknown>`, `DebugSource` with `(string & {})` extensibility, `debugGenerateReport()` exported from module, `redactUrl()` + `redactUrlsInText()` with `?[redacted]`, `window.__debugLogListenersAttached` HMR guard, subscriber replay + try/catch error isolation.
- EVENT_BUS: Not Applicable — documented in CLAUDE.md line 697–699 with rationale (Supabase realtime channels serve as de-facto event bus for data mutations; only internal pub/sub is `debugLog`'s own, which EVENT_BUS pattern excludes).

No pending items.

### graphiki

React + Vite graph editor. CLAUDE.md fully aligned, BURGER_MENU disclosure, DEBUG_SYSTEM hardened, PWA visibility checks + 30s suppression, EVENT_BUS typed `EventBus<M>`. **Z_INDEX_SCALE DONE** (verified 2026-04-21, all values compliant: Toast `z-[70]`, BurgerMenu `z-49/z-50`, ContextMenu `z-50`). **ICON_CACHE_BUST fully DONE** (verified 2026-04-21, tripwire test at `src/test/icon-cache-bust.test.ts` + user communication in `InstallInstructionsModal.tsx` collapsible). Only 2 items remain: Triggers, DOWNLOAD_PDF decision.

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

**Bonus finding 2026-04-21 (corrected 2026-04-22):** synctone's local `docs/implementations/` folder contains 2 patterns that are **NOT in glow-props**: `KEY_LESSONS.md` and `TIMER_LEAKS.md`. (`HTTPS_PROXY.md` IS in glow-props — earlier note incorrectly listed it as synctone-only; synctone's copy is simply stale and can be deleted with the rest of the folder.) Before deletion (per CLAUDE.md alignment task), decide whether to upstream `KEY_LESSONS` / `TIMER_LEAKS` into glow-props as cross-fleet patterns. **TIMER_LEAKS recommendation:** upstream — glow-props currently has no timer/subscription cleanup rule (§Cleanup is cosmetic-only; `hacks` trigger flags `setTimeout` abuse but not cleanup hygiene; no pattern doc covers the mandate). Two-pronged upstream: (a) add `docs/implementations/TIMER_LEAKS.md` with frontmatter, (b) add a "Timer and Subscription Cleanup" bullet-group to glow-props `CLAUDE.md §Code Standards` so every downstream CLAUDE.md inherits the rule at the preferences level, not just as a pattern doc.

### tool-till-tees — NEWLY TRACKED (2026-04-21, first-pass audited)

**Hybrid repo:** Vercel-hosted Node.js API (`api/`) + a minimal React 19 / Vite landing page (`src/App.tsx`, `src/main.tsx`, `index.css`). Backs three systems: contact/notification endpoint, Four Ems form-builder API, Sancio agreement management — all backed by Supabase. Serves 4 frontend consumers (four-ems, glow-props, see-veo, sun-sea-o) per CORS allowlist in `lib/cors.ts`.

**First-pass audit 2026-04-21 against live `main`:**
- CLAUDE.md exists but uses the OLD format: still has "move completed items to HISTORY.md" (line 283), "Communication style" bullet only (line 392 — not the full glow-props Communication section), old "## Triggers" section (line 397 — likely single-word triggers), "## Suggested Implementations" section (line 521 — inline pattern code).
- `docs/HISTORY.md` EXISTS.
- Tech stack: React 19 + Vite + Tailwind v4 + Vitest + Supabase + Vercel serverless functions.

**Gap Matrix classification (updates the `?` row above):**

| Pattern | Status | Reason |
|---|---|---|
| CLAUDE.md | Missing | Old format; Suggested Implementations + old HISTORY.md workflow + no Communication section + no Implementation Patterns block + no prohibition |
| APP_ICONS | Partial | Landing page exists; needs audit of icon generation |
| BURGER_MENU | N/A | Single-page landing, no navigation needed |
| DEBUG_SYSTEM | N/A | Tiny landing page + backend service; no user-facing debug surface |
| DOWNLOAD_PDF | N/A | API + landing page, no printable content |
| PWA_SYSTEM | N/A | Landing page is brochureware; backend is serverless |
| THEME_DARK_MODE | ? | Landing page is minimal — verify theming intent |
| EVENT_BUS | ? | Evaluate for backend service-layer pub/sub (form submissions → email + audit log?) |
| Z_INDEX_SCALE | N/A | Single-page landing, minimal layered UI |
| ICON_CACHE_BUST | N/A | No PWA/SW |

#### CLAUDE.md — Align with glow-props

1. [ ] **Delete "## Suggested Implementations" section** (line 521+) — Remove inline pattern code. tool-till-tees has fewer applicable patterns than downstream frontends, so the replacement Implementation Patterns block can be smaller.
2. [ ] **Add "## Implementation Patterns (Source of Truth)" section** — Standard glow-props reference block (fetch commands, listing command, rules). Note the N/A patterns inline so future sessions don't re-implement them.
3. [ ] **Add AI Note** — The standard "Implementation patterns — always fetch from glow-props" note.
4. [ ] **Add prohibition** — "Create local copies of implementation pattern files in any repo — always fetch from glow-props".
5. [ ] **Promote to `## Communication` section** — Replace the bullet at line 392 with the full glow-props Communication section. Place between Principles (line 147) and Code Standards (line 159).
6. **Confirm:** Inline pattern code removed. Communication section between Principles and Code Standards. Fetch commands point to glow-props.

#### HISTORY.md — Remove (cross-fleet policy 2026-04-16)

1. [ ] Delete `docs/HISTORY.md`.
2. [ ] Remove `### docs/HISTORY.md` subsection from CLAUDE.md Documentation rules (~line 293).
3. [ ] Replace "move completed items to HISTORY.md" with "delete completed items (git history tracks them)" in CLAUDE.md.
4. [ ] Remove HISTORY.md from README.md file tree if listed.

#### Triggers — Replace with glow-props version

1. [ ] **Replace the "## Triggers" section** (line 397) verbatim with the glow-props version (48 triggers in 8 groups + Meta sweeps + Reflective passes + scope modifiers + behavior rules).
2. [ ] **Note any name collisions** — Backend context has different vocabulary (`api/`, `supabase/`, `lib/`). If any collide with trigger names, add a line in AI Notes.

#### APP_ICONS — Audit

1. [ ] **Check `scripts/` for icon generation** — if a `generate-icons.mjs` or equivalent exists, ensure it uses `{ density: 400 }` and produces favicon.png + apple-touch-icon.png. If not, decide whether the landing page warrants icon polish.
2. [ ] **Verify `index.html` icon links** (favicon, apple-touch-icon).

#### THEME_DARK_MODE — Decide

1. [ ] **Decide: does the landing page need light/dark theming?** If it's brochureware with a fixed style, mark N/A with rationale. If it's an admin UI or evolves into one, follow the pattern.

#### EVENT_BUS — Evaluate for backend

1. [ ] **Decide: does the Vercel serverless API benefit from internal pub/sub?** Candidate use cases: form submission → (email + audit log + webhook dispatch) in a single request. Likely NO for now — each serverless function is short-lived and stateless. Document as "Not Applicable" in CLAUDE.md with rationale; revisit if a shared request-scoped event pipeline is needed.

#### Backend-specific (not a glow-props pattern yet)

Tool-till-tees is the first backend service in the fleet. Several patterns *might* belong in glow-props eventually:

1. [ ] **Flag for consideration:** CORS allowlist discipline (`lib/cors.ts`), env-var schema validation (Zod on `process.env`), serverless error surfacing, RLS policy tests, SMTP failure handling. If any becomes a recurring need across backends, propose as a new glow-props pattern.

---

## Cross-Cutting Gaps (most common across repos)

Updated 2026-04-21 after parallel full-sweep re-validation (11 agents — 1 coverage + 10 per-repo).

Fully clean (no pending items): **canva-grid, budgy-ting, repo-tor, sun-sea-o**.
Fully clean on core patterns, trailing items only: **glow-props**, **graphiki** (Triggers + DOWNLOAD_PDF decision), **few-lap** (DOWNLOAD_PDF decision + __DEV__ guard restore).
Mid-backlog: **model-pear** (Communication + Z-index done; still needs PWA, THEME_DARK_MODE, BURGER_MENU, HISTORY.md, Triggers, DOWNLOAD_PDF button, EVENT_BUS).
Largest backlogs: **see-veo, four-ems, synctone**.
First-pass audited: **tool-till-tees** — N/A for most UI patterns; needs CLAUDE.md alignment + HISTORY.md removal + Triggers replacement + THEME + EVENT_BUS decisions.

Highest-leverage cross-cutting gaps:

1. **Triggers redesign** — Cross-fleet policy 2026-04-17. **Done in canva-grid, budgy-ting, repo-tor, few-lap, sun-sea-o.** Still missing in **model-pear, see-veo, graphiki, four-ems, synctone** (5 repos). tool-till-tees pending audit.
2. **CLAUDE.md alignment** — Pass in canva-grid, budgy-ting, repo-tor, graphiki, few-lap, **model-pear** (Communication landed), **sun-sea-o**. Worst remaining: four-ems (~630 lines of inline patterns), see-veo (~285 lines), synctone (8 local pattern files in `docs/implementations/`).
3. **HISTORY.md removal** — Already done in canva-grid, budgy-ting, repo-tor, graphiki, few-lap, **sun-sea-o**. Still present in **model-pear, see-veo, four-ems, synctone**.
4. **PWA_ICON_CACHE_BUST** — Full Pass in canva-grid, budgy-ting, repo-tor, **graphiki, few-lap, sun-sea-o** (core + test/user comm). Missing in see-veo, four-ems, synctone. N/A for glow-props + model-pear.
5. **EVENT_BUS** — N/A in canva-grid, budgy-ting, repo-tor, **sun-sea-o** (Supabase realtime serves as de-facto bus). Pass in graphiki. 5 repos still need an evaluate decision.
6. **DEBUG_SYSTEM: console interception** — Done in canva-grid, budgy-ting, repo-tor, graphiki, model-pear, few-lap, **sun-sea-o**. Still missing in see-veo, four-ems, synctone.
7. **DEBUG_SYSTEM: pre-React inline pill** — Done in canva-grid, budgy-ting, repo-tor, sun-sea-o, graphiki, model-pear, few-lap. Still missing in see-veo, four-ems, synctone.
8. **DEBUG_SYSTEM: inline styles** — Done in canva-grid, repo-tor, graphiki, model-pear, few-lap, **sun-sea-o**. Others still use Tailwind/DaisyUI.
9. **DEBUG_SYSTEM: PWA Diagnostics tab** — Done in canva-grid, budgy-ting, repo-tor, graphiki, model-pear, **sun-sea-o**. **see-veo correction 2026-04-21: previous claim was false — only 2 tabs**. Still missing in see-veo, few-lap, four-ems, synctone.
10. **PWA_SYSTEM: visibility-based update checks** — Done in canva-grid, budgy-ting, repo-tor, glow-props, graphiki, **few-lap, sun-sea-o**. Still missing in see-veo, four-ems, synctone.
11. **PWA_SYSTEM: 30-second suppression** — Done in canva-grid, budgy-ting, repo-tor, glow-props, graphiki, **sun-sea-o**. Still missing in see-veo, few-lap, four-ems (3s offline dismiss only), synctone.
12. **PWA_SYSTEM: module singleton** — Done in canva-grid, budgy-ting, glow-props, repo-tor, graphiki, **sun-sea-o** (`src/lib/pwa.ts`). Still missing in see-veo, four-ems, model-pear.
13. **BURGER_MENU: focus hooks extraction** — Done in canva-grid, budgy-ting, repo-tor, graphiki, few-lap, **sun-sea-o**. Still missing in model-pear, see-veo, four-ems, synctone.
14. **THEME_DARK_MODE** — Full in canva-grid, budgy-ting, repo-tor, graphiki, **sun-sea-o** (Approach A, color migration complete except documented print-media exception). few-lap has Uniwind (Pass). Missing in model-pear, see-veo, four-ems. synctone has Uniwind but flash prevention missing.
15. **Z_INDEX_SCALE** — Pass in glow-props, canva-grid, budgy-ting, repo-tor, **graphiki, model-pear, few-lap, sun-sea-o**. Missing in see-veo, four-ems, synctone.
16. **DOWNLOAD_PDF** — New small gap surfaced 2026-04-21 in **repo-tor** (missing `.no-print` utility class + dedicated trigger button). Still Partial in see-veo, model-pear, four-ems. Decision pending in few-lap, graphiki, synctone. Pass in sun-sea-o (`window.print()` + `print:text-gray-*` fallbacks documented).
