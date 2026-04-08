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

Audited 2026-04-06 against updated `docs/implementations/*.md` pattern docs (8 patterns).

Legend: **Pass** = compliant, **Partial** = has the feature but with gaps, **Missing** = not implemented, **N/A** = not applicable

### Gap Matrix

| Repo | CLAUDE.md | APP_ICONS | BURGER_MENU | DEBUG_SYSTEM | DOWNLOAD_PDF | PWA_SYSTEM | THEME_DARK_MODE | EVENT_BUS |
|------|-----------|-----------|-------------|--------------|--------------|------------|-----------------|-----------|
| glow-props | Pass | Pass | Pass | N/A | Pass | Pass | Pass | N/A |
| canva-grid | Missing | Pass | Partial | Partial | Pass (B) | Partial | Pass | Missing |
| budgy-ting | Partial | Partial | Partial | Partial | Partial | Partial | Missing | Missing |
| model-pear | Missing | Missing | Missing | Missing | Partial | Missing | Missing | Missing |
| see-veo | Missing | Partial | Missing | Partial | Partial | Partial | Missing | Missing |
| repo-tor | Pass | Partial | Partial | Partial | Pass | Pass | Partial | Missing |
| few-lap | Missing | Partial | Partial | Partial | Missing | Partial | Partial | Missing |
| sun-sea-o | Missing | Partial | Missing | Partial | Pass | Partial | Missing | Missing |
| graphiki | Missing | Pass | Missing | Partial | Missing | Partial | Pass | Partial |
| four-ems | Missing | Partial | Missing | Partial | Partial | Partial | Missing | Missing |
| synctone | Missing | Partial | Missing | Partial | Missing | Partial | Partial | Missing |

**(B)** = Approach B (pdf-lib) per `docs/implementations/DOWNLOAD_PDF.md` — correct choice for canvas-heavy content

### glow-props

This is the reference docs repo (vanilla JS portfolio). All applicable patterns are fully compliant.

#### APP_ICONS — Pass

180px Apple touch icon added to `scripts/generate-icons.mjs` and HTML files updated. Run `node scripts/generate-icons.mjs` to regenerate (requires `sharp`).

#### DEBUG_SYSTEM — N/A

Static vanilla JS portfolio with no user input, API calls, or dynamic state. Only failure mode is build/deploy. Debug system not warranted.

#### EVENT_BUS — N/A

Event bus is for service-layer pub/sub. Static portfolio has no services.

### canva-grid

React + Vite app. Strong foundation — APP_ICONS and THEME_DARK_MODE are fully compliant. Focus areas: debug system robustness, PWA update reliability, and burger menu completeness.

#### CLAUDE.md — Align with glow-props

No local `docs/implementations/` folder exists (correct). No inline patterns. Two stale references need updating.

1. [ ] **Update shared scaffolding description** — Near line 5, change "Suggested Implementations" to "Implementation Patterns" in the sentence about shared scaffolding from glow-props.
2. [ ] **Replace "Sister project reference" AI Note** — Near line 306, replace the bullet referencing "Suggested Implementations" section in glow-props with: `**Implementation patterns — always fetch from glow-props.** Never look for local copies of implementation pattern files (e.g., docs/implementations/*.md) in downstream repos. They do not exist locally — the single source of truth is the docs/implementations/ folder in the glow-props repo. Fetch the latest version before every implementation task.`
3. [ ] **Add "Implementation Patterns (Source of Truth)" section** — After the Triggers section, add the standard section from glow-props CLAUDE.md with fetch instructions (GitHub Pages URL, GitHub API URL, listing command) and rules.
4. [ ] **Add prohibition** — Add to Prohibitions: "Create local copies of implementation pattern files in any repo — always fetch from glow-props".
5. **Confirm:** No references to "Suggested Implementations" remain. Standard pattern source section exists with fetch commands.

#### BURGER_MENU — Partial → Complete

Reference: `docs/implementations/BURGER_MENU.md`

1. [ ] **Extract `useEscapeKey` hook** — Currently inlined in the BurgerMenu component. Extract to `src/hooks/useEscapeKey.js` per the pattern.
2. [ ] **Move backdrop into BurgerMenu** — Currently delegated to parent (MobileLayout). The menu should own its backdrop with `cursor-pointer` for iOS Safari click support. Z-index: backdrop z-40, menu z-50.
3. [ ] **Add MenuItem interface support** — Add `disabled`, `separator`, `destructive`, and `external` properties to menu items. See pattern's MenuItem interface.
4. [ ] **Add close-then-act delay** — Close menu first, execute action after 50-150ms timeout to prevent visual glitches.
5. [ ] **Optional: version footer** — Display app version at bottom of dropdown.
6. [ ] **Verify theme UI** — canva-grid's THEME_DARK_MODE is compliant (combo-based). Verify the theme toggle and combo picker in the burger menu match the [Theme UI in Burger Menu](../implementations/BURGER_MENU.md#theme-ui-in-burger-menu) spec (toggle item with sun/moon icons, combo buttons with active checkmark, menu stays open during switching).
7. **Confirm:** Toggle menu open/close, verify Escape closes it, verify backdrop click closes it, verify 44px touch targets on all items. Theme toggle and picker work within menu.

#### DEBUG_SYSTEM — Partial → Complete

Reference: `docs/implementations/DEBUG_SYSTEM.md`

1. [ ] **Add console interception** — Patch `console.error` and `console.warn` at module load in `debugLog.js` to capture React warnings automatically. See pattern's "Console Interception" section.
2. [ ] **Add `#debug-root` to `index.html`** — Replace dynamic `document.createElement` with a static `<div id="debug-root">` after `<div id="root">`. Mount DebugPill into this separate React root.
3. [ ] **Add PWA Diagnostics tab** — Third tab alongside Log and Env. Active health checks: HTTPS status, SW registration state, manifest validation, standalone mode, beforeinstallprompt receipt.
4. [ ] **Add pre-React inline pill** — Inline `<script>` in `index.html` with `window.__debugPushError()` global and 20-second loading timeout. See pattern's "Pre-React Inline Pill" section and repo-tor's implementation for reference.
5. [ ] **Add URL query param redaction** — In the copy/report function, replace query strings with `?[redacted]` to prevent token leaking.
6. [ ] **Add subscriber replay** — New subscribers should receive existing entries immediately on subscribe.
7. [ ] **Remove DEV-only gating** — Debug pill should be available in production (alpha phase tool).
8. [ ] **Add `success` severity** — Add to the severity union type and `SEVERITY_COLORS` map.
9. [ ] **Add `debugGenerateReport()` to module** — Move report generation out of the pill component into the debug log module for reuse.
10. [ ] **Add embed mode skip** — Skip pill when `?embed=` is in the URL.
11. **Confirm:** Open app, verify pill appears in bottom corner, check all 3 tabs render, crash the app (throw in a component) and verify pill survives, copy report and check URL is redacted.

#### DOWNLOAD_PDF — Compliant (Approach B: pdf-lib)

- **No action needed.** canva-grid uses pdf-lib (Approach B in `docs/implementations/DOWNLOAD_PDF.md`) — the correct choice for canvas-heavy content where `window.print()` can't reliably capture visual output. Implementation includes html-to-image capture, quality selection (1x/2x/3x), and multi-page support.

#### PWA_SYSTEM — Partial → Complete

Reference: `docs/implementations/PWA_SYSTEM.md`

1. [ ] **Add visibility-based update checks** — In `usePWAUpdate.js`, add a `visibilitychange` listener that checks for SW updates when the tab regains focus. See pattern's "Visibility-Based Checks" section.
2. [ ] **Add 30-second suppression** — After user clicks "Update", write timestamp to `sessionStorage`. On next mount, skip update banner if within 30 seconds. See pattern's `wasJustUpdated()`.
3. [ ] **Fix module singleton for install prompt** — Each `usePWAInstall` hook instance has its own `canInstall` state. Lift to module-level variable so all consumers share state. See pattern's "Module-Level Singleton" section.
4. **Confirm:** Deploy, wait for a new build, reopen tab — update banner should appear. Click Update, verify reload. Reopen — no banner for 30 seconds.

#### EVENT_BUS — Evaluate if needed

- [ ] **Decide:** Does canva-grid have service-layer communication that would benefit from pub/sub? (e.g., layout engine notifying renderers, export service notifying UI). If yes, follow `docs/implementations/EVENT_BUS.md`. If not, skip.

### budgy-ting

Vue + Vite app. Has partial implementations of most patterns but needs DaisyUI migration (currently custom Tailwind v4 CSS variables) and debug/PWA hardening.

#### CLAUDE.md — Align with glow-props (Partial — stale URLs)

No local `docs/implementations/` folder (correct). No inline patterns (correct). Has a clean "Suggested Implementations" pointer and prohibition, but fetch URLs point to the old location (`glow-props/CLAUDE.md`) instead of `glow-props/docs/implementations/`.

1. [ ] **Update "Suggested Implementations" section** — Change fetch URLs from `api.github.com/repos/devmade-ai/glow-props/contents/CLAUDE.md` to `api.github.com/repos/devmade-ai/glow-props/contents/docs/implementations/{PATTERN_NAME}.md`. Add the GitHub Pages URL: `https://devmade-ai.github.io/glow-props/patterns/{PATTERN_NAME}.md`. Add the listing command to discover available patterns.
2. [ ] **Update AI Notes entry** — Change "All Suggested Implementation patterns live in glow-props CLAUDE.md" to reference `docs/implementations/` folder in glow-props.
3. [ ] **Rename section** — Change "Suggested Implementations" to "Implementation Patterns (Source of Truth)" to match glow-props.
4. **Confirm:** All fetch URLs point to `docs/implementations/` in glow-props, not to CLAUDE.md. Listing command exists to discover patterns dynamically.

#### APP_ICONS — Partial → Complete

Reference: `docs/implementations/APP_ICONS.md`

1. [ ] **Increase Sharp density to 400 DPI** — In `scripts/generate-icons.mjs`, change `sharp(svgBuffer, { density: 150 })` to `sharp(svgBuffer, { density: 400 })`. Regenerate all PNGs.
2. [ ] **Create separate maskable icon** — Currently reuses the same file for both `any` and `maskable` purposes. Create a maskable variant with safe-area padding (content within 80% inner zone) at 1024px. Update manifest to reference separate files with distinct `purpose` values.
3. **Confirm:** Run `node scripts/generate-icons.mjs`, verify output sizes (48, 180, 192, 512, 1024). Check manifest has `"purpose": "any"` on 192/512 and `"purpose": "maskable"` on 1024.

#### BURGER_MENU — Partial → Complete

Reference: `docs/implementations/BURGER_MENU.md`

1. [ ] **Add arrow key navigation** — In the menu component, handle `ArrowDown`/`ArrowUp` (with wrapping) and `Home`/`End` keys to move focus between items. See pattern's `handleMenuKeyDown`.
2. [ ] **Establish z-index scale** — Document and enforce: backdrop=40, menu=50, modal=60, toast=70, debug=80. Audit existing z-index values.
3. [ ] **Add theme UI to menu** — Once THEME_DARK_MODE migration is done, add dark/light toggle and theme picker per [Theme UI in Burger Menu](../implementations/BURGER_MENU.md#theme-ui-in-burger-menu) spec.
4. **Confirm:** Open menu, press ArrowDown through all items, verify wrapping. Press Home/End. Verify z-index layering with debug pill visible.

#### DEBUG_SYSTEM — Partial → Complete

Reference: `docs/implementations/DEBUG_SYSTEM.md`

1. [ ] **Add console interception** — Patch `console.error`/`console.warn` at module load in debug store.
2. [ ] **Add PWA Diagnostics tab** — Third tab with active health checks (HTTPS, SW state, manifest, standalone, install prompt).
3. [ ] **Add pre-framework inline pill** — Inline `<script>` in `index.html` with vanilla JS pill, `window.__debugPushError()`, and 20-second loading timeout. See repo-tor's implementation.
4. [ ] **Switch to inline styles** — Replace Tailwind classes in DebugPill with inline styles so the pill renders even if CSS fails to load.
5. [ ] **Replace array shift with circular buffer** — Use head/tail pointer pattern for O(1) instead of `Array.shift()` O(n).
6. **Confirm:** Open app, verify 3 tabs in pill. Kill the dev server mid-load — inline pill should still appear after 20 seconds.

#### DOWNLOAD_PDF — Partial → Complete

Reference: `docs/implementations/DOWNLOAD_PDF.md`

1. [ ] **Add `window.print()` trigger button** — Print CSS already exists (`.no-print` class, `@media print` rules). Add a "Save as PDF" button in the UI that calls `window.print()`.
2. **Confirm:** Click button, verify print preview shows clean output with no interactive elements.

#### PWA_SYSTEM — Partial → Complete

Reference: `docs/implementations/PWA_SYSTEM.md`

1. [ ] **Add visibility-based update checks** — `visibilitychange` listener to check for SW updates when tab regains focus.
2. [ ] **Add 30-second suppression** — `sessionStorage` timestamp after update applied. See pattern's `wasJustUpdated()`.
3. [ ] **Add PWA diagnostics** — Wire into debug pill's new PWA tab (step 2 under DEBUG_SYSTEM above).
4. **Confirm:** Deploy new version, background the tab, bring it back — should detect update. After applying, no re-detection for 30 seconds.

#### THEME_DARK_MODE — Missing → Implement

Reference: `docs/implementations/THEME_DARK_MODE.md`, including the **Migration Guide** section

This is a full migration from custom Tailwind v4 CSS variables to DaisyUI. Follow the 6-phase migration guide:

1. [ ] **Phase 0: Prerequisites** — `npm install -D daisyui@5`, configure `@plugin "daisyui"` in CSS, add `@custom-variant dark`, add `color-scheme`, add flash prevention script. Start with 2 themes.
2. [ ] **Phase 1: Audit** — Run the search patterns from the migration guide to build a worklist of hardcoded colors, custom variables, raw Tailwind, and z-index values.
3. [ ] **Phase 2: CSS variable removal** — Map custom `:root`/`.dark` variables to DaisyUI semantic classes using the mapping tables. Collapse `dark:` pairs.
4. [ ] **Phase 3: Component class migration** — Replace raw Tailwind on buttons, inputs, badges, etc. with DaisyUI component classes. Work incrementally.
5. [ ] **Phase 4: Z-index normalization** — Align to standard scale.
6. [ ] **Phase 5: Verification** — Run the 10-point checklist (dark toggle, theme switch, button states, form inputs, meta theme-color, print, mobile, cross-tab, fresh visit, accessibility).
7. [ ] **Phase 6: Cleanup** — Delete old variable definitions, remove orphaned `dark:` prefixes, migrate localStorage keys.
8. **Confirm:** Toggle dark/light in two tabs simultaneously. Clear localStorage and reload — should fall back to OS preference.

#### EVENT_BUS — Evaluate if needed

- [ ] **Decide:** Does budgy-ting have service-layer pub/sub needs? If yes, follow `docs/implementations/EVENT_BUS.md`. If not, skip.

### model-pear

SvelteKit app. Lowest compliance across the fleet — 5 of 7 patterns are entirely missing. This needs foundational work. Dark-only design currently.

#### CLAUDE.md — Align with glow-props

No local `docs/implementations/` folder (correct). No inline patterns. Has a stale "Shared conventions with glow-props" AI Note (~line 215) that points to the old `glow-props/CLAUDE.md` for patterns. Missing: Implementation Patterns section, prohibition, and pattern-specific AI note.

1. [ ] **Replace stale AI Note** — Remove the "Shared conventions with glow-props" block (~lines 215-219) that references "suggested implementations" in glow-props CLAUDE.md. Replace with: `**Implementation patterns — always fetch from glow-props.** Never look for local copies of implementation pattern files (e.g., docs/implementations/*.md) in downstream repos. They do not exist locally — the single source of truth is the docs/implementations/ folder in the glow-props repo. Fetch the latest version before every implementation task.`
2. [ ] **Add "Implementation Patterns (Source of Truth)" section** — Add the standard section from glow-props CLAUDE.md with fetch instructions (GitHub Pages URL, GitHub API URL, listing command) and rules.
3. [ ] **Add prohibition** — Add to Prohibitions: "Create local copies of implementation pattern files in any repo — always fetch from glow-props".
4. **Confirm:** No references to "suggested implementations in glow-props CLAUDE.md" remain. Standard pattern source section exists.

#### APP_ICONS — Missing → Implement

Reference: `docs/implementations/APP_ICONS.md`

1. [ ] **Create SVG source icon** — Design a square SVG at `assets/icon-source.svg` with `shape-rendering="geometricPrecision"`. Content within 80% inner zone for maskable safe area.
2. [ ] **Create Sharp generation script** — `scripts/generate-icons.mjs` that reads the SVG and outputs PNGs at 400 DPI: 48 (favicon), 180 (Apple touch), 192 (PWA any), 512 (PWA any), 1024 (PWA maskable).
3. [ ] **Add to manifest** — Create or update `manifest.webmanifest` with icon entries. Separate `purpose` values: `any` for 192/512, `maskable` for 1024.
4. [ ] **Add HTML links** — `<link rel="icon" href="/favicon.png">` and `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` in `app.html`.
5. [ ] **Add `sharp` to devDependencies** — `npm install -D sharp`.
6. **Confirm:** Run `node scripts/generate-icons.mjs`, verify all 5 PNGs generated. Check favicon in browser tab. Test Apple touch icon on iOS.

#### BURGER_MENU — Missing → Implement

Reference: `docs/implementations/BURGER_MENU.md`

1. [ ] **Replace basic hamburger with disclosure pattern** — Current toggle is a simple boolean. Rebuild as a disclosure component with `aria-expanded`, `aria-controls`, and role="navigation".
2. [ ] **Increase hamburger button to 44px** — Currently `p-2` (~32px). Use `min-h-11 min-w-11` (44px).
3. [ ] **Add keyboard navigation** — `useEscapeKey` to close, `ArrowDown`/`ArrowUp`/`Home`/`End` within items.
4. [ ] **Add focus management** — Focus first item on open, return to trigger on close.
5. [ ] **Add backdrop** — Click-outside overlay with `cursor-pointer` (iOS Safari needs this).
6. [ ] **Add standard menu items** — Tutorial/help, dark mode toggle, install app (once PWA is added). See pattern's [Theme UI in Burger Menu](../implementations/BURGER_MENU.md#theme-ui-in-burger-menu) for toggle item spec (sun/moon icons, label flips) and theme picker layout.
7. **Confirm:** Keyboard-only navigation through entire menu. Verify 44px touch targets on mobile. Verify Escape and backdrop close.

#### DEBUG_SYSTEM — Missing → Implement

Reference: `docs/implementations/DEBUG_SYSTEM.md`

1. [ ] **Create debug log module** — `src/lib/debugLog.ts` with circular buffer (max 200), typed sources/severities, `debugAdd`/`debugSubscribe`/`debugGetEntries`/`debugClear`/`debugGenerateReport`. Include console interception and global error/rejection listeners.
2. [ ] **Add `#debug-root`** to `app.html` — After the SvelteKit root element.
3. [ ] **Create DebugPill component** — Render into `#debug-root` with inline styles (not Tailwind). 3 tabs: Log, Environment, PWA Diagnostics.
4. [ ] **Add pre-framework inline pill** — Inline `<script>` in `app.html` with `window.__debugPushError()` and 20-second loading timeout.
5. **Confirm:** Open app, verify pill appears. Trigger `console.error('test')` in DevTools — should appear in Log tab. Kill the server mid-load — inline pill should appear.

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

- [ ] **Decide:** Does model-pear have service-layer needs? If yes, follow `docs/implementations/EVENT_BUS.md`. If not, skip.

### see-veo

React + Vite resume/portfolio site. Single dark theme currently. Has partial debug and PWA implementations that need hardening. Burger menu and theming are absent but may be intentional for a minimal resume site.

#### CLAUDE.md — Align with glow-props

No local `docs/implementations/` folder (correct). Has **~280 lines of hardcoded inline patterns** in a "Suggested Implementations" section (~lines 322-603) covering PWA System, App Icons, Download as PDF, Timer Leaks, and HTTPS Proxy — full code examples embedded directly. Missing: any reference to glow-props as pattern source.

1. [ ] **Delete entire "Suggested Implementations" section** — Remove ~lines 322-603 (~280 lines of inline pattern code for PWA System, App Icons, Download as PDF, Timer Leaks, HTTPS Proxy).
2. [ ] **Add "Implementation Patterns (Source of Truth)" section** — Replace deleted section with the standard glow-props reference block (source location, fetch via GitHub Pages/API, listing command, rules).
3. [ ] **Add AI Note** — Add: `**Implementation patterns — always fetch from glow-props.** Never look for local copies of implementation pattern files (e.g., docs/implementations/*.md) in downstream repos. They do not exist locally — the single source of truth is the docs/implementations/ folder in the glow-props repo. Fetch the latest version before every implementation task.`
4. [ ] **Add prohibition** — Add to Prohibitions: "Create local copies of implementation pattern files in any repo — always fetch from glow-props".
5. **Confirm:** CLAUDE.md is ~280 lines shorter. No inline code examples for patterns remain. Standard fetch commands point to glow-props.

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
6. [ ] **Add third tab (PWA Diagnostics)** — Active health checks: HTTPS, SW state, manifest validation, standalone mode, install prompt receipt. Currently has Diagnostics + Event Log.
7. [ ] **Add pre-React inline pill** — Inline `<script>` in `index.html` with `window.__debugPushError()` and 20-second loading timeout.
8. [ ] **Add URL query param redaction** — Replace query strings with `?[redacted]` in debug reports.
9. [ ] **Improve clipboard fallbacks** — Add ClipboardItem Blob as primary method, then writeText, then textarea. Currently only writeText with manual textarea fallback.
10. **Confirm:** Open app, verify 3 tabs. Crash a component — pill survives. Copy report — URLs are redacted. Test clipboard on mobile PWA.

#### DOWNLOAD_PDF — Partial → Complete

Reference: `docs/implementations/DOWNLOAD_PDF.md`

1. [ ] **Add `window.print()` trigger button** — Print CSS exists. Add a "Save as PDF" or print icon button.
2. [ ] **Add `print-color-adjust: exact`** — In `@media print` CSS: `-webkit-print-color-adjust: exact; print-color-adjust: exact;` to preserve background colors.
3. **Confirm:** Click print button, verify background colors are preserved in preview, no interactive elements visible.

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

#### EVENT_BUS — Evaluate if needed

- [ ] **Decide:** Minimal resume site — likely not needed. Skip unless service-layer pub/sub becomes necessary.

### repo-tor

React + Vite dashboard app. One of the most compliant repos — PWA and DOWNLOAD_PDF are fully passing. Has the fleet's best pre-React inline debug pill. Main gaps: DaisyUI migration and debug system modernization.

#### CLAUDE.md — Pass (already aligned)

No local `docs/implementations/` folder (correct). "Suggested Implementations" section already points to glow-props `docs/implementations/` with dynamic fetch commands and listing. Prohibition against local copies exists. No action needed.

#### APP_ICONS — Partial → Complete

Reference: `docs/implementations/APP_ICONS.md`

1. [ ] **Add 180px Apple touch icon** — Add `{ size: 180, name: 'apple-touch-icon.png' }` to `generate-icons.mjs` output list. Regenerate.
2. [ ] **Add `<link rel="apple-touch-icon">` to `index.html`** — `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`.
3. **Confirm:** Run generation script, verify 180px PNG exists. Test on iOS — home screen icon should use the correct image.

#### BURGER_MENU — Partial → Complete

Reference: `docs/implementations/BURGER_MENU.md`

1. [ ] **Extract `useDisclosureFocus` hook** — Focus logic is inlined in HamburgerMenu.jsx. Extract to `src/hooks/useDisclosureFocus.js` — focus first item on open, return to trigger on close.
2. [ ] **Wire `useFocusTrap` to menu** — Hook exists in codebase but isn't used by the burger menu. Import and apply.
3. [ ] **Add Home/End key support** — Currently handles ArrowDown/ArrowUp. Add Home (first item) and End (last item).
4. [ ] **Add `disabled` item support** — Grayed out styling, prevent click/focus. See pattern's MenuItem interface.
5. [ ] **Add theme UI to menu** — Once THEME_DARK_MODE migration is done, add dark/light toggle and theme picker per [Theme UI in Burger Menu](../implementations/BURGER_MENU.md#theme-ui-in-burger-menu) spec.
6. **Confirm:** Open menu, Tab is trapped. Home/End work. Disabled items can't be clicked or focused. Theme toggle and picker work.

#### DEBUG_SYSTEM — Partial → Complete

Reference: `docs/implementations/DEBUG_SYSTEM.md`

repo-tor pioneered the pre-React inline pill — that's compliant and inline styles are correct. Focus on the React-side debug system.

1. [ ] **Add console interception** — Patch `console.error`/`console.warn` at module load to capture React warnings.
2. [ ] **Create full `debugLog` module** — Replace simple `{time, message, stack}` array with typed pub/sub module: `debugAdd`, `debugSubscribe`, `debugGetEntries`, `debugClear`, `debugGenerateReport`. Structured entries with `source`, `severity`, `details` (Record).
3. [ ] **Add `#debug-root` and React DebugPill** — Add `<div id="debug-root">` to `index.html`. Create a React-based DebugPill in a separate root with 3 tabs (Log, Environment, PWA Diagnostics). The existing inline pill handles pre-React; this handles post-mount.
4. [ ] **Add clipboard fallbacks** — ClipboardItem Blob → writeText → textarea. Currently only writeText.
5. [ ] **Add URL query param redaction** — In debug report generation.
6. **Confirm:** Open app, verify inline pill loads during boot, then React pill takes over. 3 tabs work. Console errors appear in Log. Copy report — URLs redacted.

#### THEME_DARK_MODE — Partial → Full DaisyUI

Reference: `docs/implementations/THEME_DARK_MODE.md`, including **Migration Guide**

repo-tor has working flash prevention and cross-tab sync using custom CSS variables. Needs migration to DaisyUI's dual-layer system.

1. [ ] **Phase 0: Prerequisites** — `npm install -D daisyui@5`. Configure `@plugin "daisyui"` in CSS with 2 themes (e.g., `lofi --default, black --prefersdark`). Add `@custom-variant dark`. DaisyUI can coexist with existing custom variables during transition.
2. [ ] **Phase 1: Audit** — Run migration guide search patterns to find all custom variable references and `dark:` pairs in components.
3. [ ] **Phase 2-3: Variable removal + component migration** — Replace custom `:root`/`.dark` variables with DaisyUI semantic classes. Replace raw Tailwind with DaisyUI component classes (buttons, inputs, cards, etc.). Work incrementally.
4. [ ] **Phase 4: Z-index normalization** — Audit z-index values, align to standard scale.
5. [ ] **Add `data-theme` attribute** — Update flash prevention script and theme toggle to set `data-theme` alongside `.dark` class. See pattern's `applyTheme()`.
6. [ ] **Add `<meta name="theme-color">`** — Two tags with media queries in `index.html`. Dynamic updates in theme module. Generate hex values with `scripts/generate-theme-meta.mjs`.
7. [ ] **Phase 5-6: Verification and cleanup** — Run 10-point checklist. Delete old variable definitions. Clean up orphaned `dark:` prefixes.
8. **Confirm:** All DaisyUI components switch themes correctly. Flash prevention still works. Cross-tab sync still works. Meta theme-color updates in DevTools.

#### EVENT_BUS — Evaluate if needed

- [ ] **Decide:** repo-tor currently uses React Context dispatch and `window.dispatchEvent(new CustomEvent(...))` for PWA communication. If this pattern grows unwieldy or other service-layer events emerge, migrate to `docs/implementations/EVENT_BUS.md`. If current approach works, skip.

### few-lap

React Native (Expo) app. Uses Metro bundler (not Vite) and Uniwind for theming. Has a burger menu and debug system that need hardening. Custom SW approach is correct for Expo.

#### CLAUDE.md — Align with glow-props

No local `docs/implementations/` folder (correct). Has **~620 lines of hardcoded inline patterns** in a "Suggested Implementations" section (~lines 597-1219) covering PWA System, Debug System, App Icons, Download as PDF, and HTTPS Proxy — full code examples. Also has an AI Note (~line 525) referencing "from Suggested Implementations" locally.

1. [ ] **Delete entire "Suggested Implementations" section** — Remove ~lines 597-1219 (~620 lines of inline pattern code for PWA System, Debug System, App Icons, Download as PDF, HTTPS Proxy).
2. [ ] **Add "Implementation Patterns (Source of Truth)" section** — Replace deleted section with the standard glow-props reference block (source location, fetch via GitHub Pages/API, listing command, rules).
3. [ ] **Update AI Note reference** — Near line 525, change `httpsGet() CONNECT tunnel pattern from Suggested Implementations` to reference fetching the HTTPS_PROXY pattern from glow-props.
4. [ ] **Add AI Note** — Add the standard implementation patterns note about always fetching from glow-props.
5. [ ] **Add prohibition** — Add to Prohibitions: "Create local copies of implementation pattern files in any repo — always fetch from glow-props".
6. **Confirm:** CLAUDE.md is ~620 lines shorter. No inline code examples for patterns remain. All pattern references point to glow-props.

#### APP_ICONS — Partial → Complete

Reference: `docs/implementations/APP_ICONS.md`

1. [ ] **Add 180px Apple touch icon** — Currently uses 192px for `<link rel="apple-touch-icon">`. Add a dedicated 180px output to the generation script (Apple's recommended size).
2. [ ] **Update `+html.tsx`** — Point `<link rel="apple-touch-icon">` to the new 180px file instead of `icon-192.png`.
3. **Confirm:** Verify 180px PNG is generated. Test on iOS — home screen icon should be crisp.

#### BURGER_MENU — Partial → Complete

Reference: `docs/implementations/BURGER_MENU.md` (React Native variant section)

1. [ ] **Add `useDisclosureFocus` hook** — Focus first item on open, return to trigger on close. Extract as reusable hook.
2. [ ] **Add `useFocusTrap`** — Tab/Shift+Tab should cycle within menu items when open. For Expo web, this is a DOM concern.
3. [ ] **Add arrow key / Home / End navigation** — For web platform. React Native doesn't have DOM keyboard nav, but Expo serves on web too.
4. [ ] **Add `aria-controls` linking** — Trigger button `aria-controls={menuId}` pointing to the menu element.
5. [ ] **Add data-driven MenuItem interface** — Replace hardcoded inline buttons with `items` prop supporting `visible`, `disabled`, `highlight`, `highlightColor`. See pattern's MenuItem interface.
6. [ ] **Add theme UI to menu** — Once THEME_DARK_MODE flash prevention is done, verify theme toggle and picker follow [Theme UI in Burger Menu](../implementations/BURGER_MENU.md#theme-ui-in-burger-menu) spec (React Native variant).
7. **Confirm:** Open menu on web — keyboard navigation works, focus is trapped. On mobile — haptic feedback on toggle, 44px touch targets. Theme toggle works within menu.

#### DEBUG_SYSTEM — Partial → Complete

Reference: `docs/implementations/DEBUG_SYSTEM.md`

1. [ ] **Add separate `#debug-root`** — In `+html.tsx`, add a root element for the debug pill outside the app tree so it survives crashes.
2. [ ] **Switch to inline styles** — Replace Tailwind `className` with inline styles in DebugPill.
3. [ ] **Add console interception** — Patch `console.error`/`console.warn` in `debugLog.ts`.
4. [ ] **Add pre-React inline pill** — Inline `<script>` in `+html.tsx` with `window.__debugPushError()` and 20-second timeout.
5. [ ] **Add subscriber replay** — New subscribers receive existing entries immediately on subscribe.
6. [ ] **Change `details` to `Record<string, unknown>`** — Currently `string`. Structured data enables post-mortem filtering.
7. [ ] **Add ClipboardItem Blob fallback** — Primary clipboard method before writeText.
8. [ ] **Add URL query param redaction** — In `debugGenerateReport()`.
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

1. [ ] **Add flash prevention script** — Inline `<script>` in `+html.tsx` `<head>` that reads localStorage and applies the theme CSS class before Expo mounts. Without this, users see a flash of the default theme on page load.
2. [ ] **Verify Uniwind `@variant` blocks cover all DaisyUI semantic tokens** — Ensure the CSS variable definitions in each `@variant` block match DaisyUI's expected variables for full component compatibility.
3. **Confirm:** Reload with a non-default theme saved — no flash. Toggle dark/light — instant switch.

#### EVENT_BUS — Evaluate if needed

- [ ] **Decide:** Does few-lap have service-layer pub/sub needs? If yes, follow `docs/implementations/EVENT_BUS.md`. If not, skip.

### sun-sea-o

React + Vite app. DOWNLOAD_PDF is fully compliant. Debug system and PWA have partial implementations with many gaps. No theming or burger menu — hardcoded slate colors.

#### CLAUDE.md — Align with glow-props

No local `docs/implementations/` folder (correct). Has **~470 lines of hardcoded inline patterns** in a "Suggested Implementations" section (~lines 419-888) covering PWA System, Debug System, App Icons, Download as PDF — full code examples. Also has a "Shared References" section (~lines 6-20) that points to `raw.githubusercontent.com/.../CLAUDE.md` instead of `docs/implementations/`.

1. [ ] **Delete entire "Suggested Implementations" section** — Remove ~lines 419-888 (~470 lines of inline pattern code for PWA System, Debug System, App Icons, Download as PDF).
2. [ ] **Add "Implementation Patterns (Source of Truth)" section** — Replace deleted section with the standard glow-props reference block (source location, fetch via GitHub Pages/API, listing command, rules).
3. [ ] **Update "Shared References" section** — Near lines 6-20, update the fetch URL from `raw.githubusercontent.com/.../CLAUDE.md` to the GitHub Pages URL for `docs/implementations/`. Remove the hardcoded list of "adopted patterns" and replace with the listing command to discover patterns dynamically.
4. [ ] **Add AI Note** — Add the standard implementation patterns note about always fetching from glow-props.
5. [ ] **Add prohibition** — Add to Prohibitions: "Create local copies of implementation pattern files in any repo — always fetch from glow-props".
6. **Confirm:** CLAUDE.md is ~470 lines shorter. No inline code examples for patterns remain. Shared References points to `docs/implementations/`.

#### APP_ICONS — Partial → Complete

Reference: `docs/implementations/APP_ICONS.md`

1. [ ] **Add 400 DPI density** — In `generate-icons.mjs`, change `sharp(svgBuffer).resize()` to `sharp(svgBuffer, { density: 400 }).resize()`.
2. [ ] **Fix maskable icon size** — Currently generates maskable at 512px (`pwa-maskable-512x512.png`). Pattern requires 1024px for high-DPI Android devices. Add a 1024px maskable output and update manifest `purpose` values.
3. [ ] **Add 180px Apple touch icon** — Add to generation script output list. Add `<link rel="apple-touch-icon">` to `index.html`.
4. [ ] **Optional: Add favicon.ico** — For Windows taskbar pinning and older browsers. See pattern's ICO generation section.
5. **Confirm:** Regenerate all PNGs, verify 180px and 1024px maskable are crisp. Check manifest has `"purpose": "maskable"` on 1024.

#### BURGER_MENU — Missing → Implement

Reference: `docs/implementations/BURGER_MENU.md`

1. [ ] **Create BurgerMenu component** — Disclosure pattern with `aria-expanded`, `aria-controls`, backdrop with `cursor-pointer`.
2. [ ] **Add focus hooks** — `useDisclosureFocus`, `useEscapeKey`. Extract as reusable hooks.
3. [ ] **Add keyboard navigation** — ArrowDown/ArrowUp with wrapping, Home/End.
4. [ ] **Add standard menu items** — Dark mode toggle (once theming is added), app info, install app. See pattern's [Theme UI in Burger Menu](../implementations/BURGER_MENU.md#theme-ui-in-burger-menu) for toggle and picker spec.
5. [ ] **Fix z-index** — Debug pill currently uses `z-[9999]`. Normalize to standard scale (debug=`z-[80]`).
6. **Confirm:** Full keyboard navigation. Escape closes. Backdrop click closes. 44px touch targets. Debug pill renders above menu.

#### DEBUG_SYSTEM — Partial → Complete

Reference: `docs/implementations/DEBUG_SYSTEM.md`

sun-sea-o's debug system has the most gaps of any partial implementation. Needs significant rework.

1. [ ] **Add `id` field to entries** — Auto-incrementing numeric ID.
2. [ ] **Change `details` to `Record<string, unknown>`** — Currently uses `message: string` only.
3. [ ] **Add `(string & {})` source fallback** — Make `DebugSource` extensible for ad-hoc sources.
4. [ ] **Switch to inline styles** — Replace Tailwind classes with inline styles.
5. [ ] **Add PWA Diagnostics tab** — Third tab with active health checks.
6. [ ] **Move `debugGenerateReport()` to module** — Currently inline in component.
7. [ ] **Add URL query param redaction** — In report generation.
8. [ ] **Add ClipboardItem Blob fallback** — Before writeText.
9. [ ] **Add pre-React inline pill** — Inline `<script>` in `index.html` with `window.__debugPushError()` and 20-second timeout.
10. [ ] **Add HMR guard** — Use `window.__debugLogListenersAttached` flag to prevent duplicate global listeners during dev hot reload. Currently attaches via both `window.onerror` AND `addEventListener`, doubling up.
11. [ ] **Add subscriber replay** — New subscribers receive existing entries on subscribe.
12. [ ] **Add subscriber error isolation** — Wrap each subscriber callback in try/catch so one throwing subscriber doesn't break others.
13. **Confirm:** Open app, verify 3 tabs. HMR reload — no duplicate error entries. New subscriber gets existing log. Copy report — redacted.

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

#### EVENT_BUS — Evaluate if needed

- [ ] **Decide:** If service-layer pub/sub needs emerge, follow `docs/implementations/EVENT_BUS.md`. Otherwise skip.

### graphiki

React + Vite graph editor. Strong foundation — APP_ICONS, THEME_DARK_MODE, and EVENT_BUS (origin repo) are compliant or near-compliant. Focus areas: debug system hardening, PWA update reliability, and evaluating burger menu need.

#### CLAUDE.md — Align with glow-props

No local `docs/implementations/` folder (correct). Has **~180 lines of hardcoded inline patterns** in a "SUGGESTED IMPLEMENTATIONS" section (~line 581) covering PWA System, Debug System, App Icons, Download as PDF — full code examples. No reference to glow-props as pattern source exists.

1. [ ] **Delete entire "SUGGESTED IMPLEMENTATIONS" section** — Remove ~180 lines of inline pattern code (~lines 581-760) for PWA System, Debug System, App Icons, Download as PDF.
2. [ ] **Add "Implementation Patterns (Source of Truth)" section** — Replace deleted section with the standard glow-props reference block (source location, fetch via GitHub Pages/API, listing command, rules).
3. [ ] **Add AI Note** — Add the standard implementation patterns note about always fetching from glow-props.
4. [ ] **Add prohibition** — Add to Prohibitions: "Create local copies of implementation pattern files in any repo — always fetch from glow-props".
5. **Confirm:** CLAUDE.md is ~180 lines shorter. No inline code examples for patterns remain. Standard fetch commands point to glow-props.

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

1. [ ] **Convert install prompt to module singleton** — `usePWAInstall` stores state in React hooks. Lift `deferredPrompt` and `canInstall` to module scope so multiple consumers share state.
2. [ ] **Add visibility-based update checks** — `visibilitychange` listener to check for SW updates when tab regains focus.
3. [ ] **Add 30-second suppression** — `sessionStorage` timestamp after update applied. See pattern's `wasJustUpdated()`.
4. **Confirm:** Deploy new version, background tab, bring back — update detected. No re-detection within 30s of applying.

#### EVENT_BUS — Partial → Complete (origin repo)

Reference: `docs/implementations/EVENT_BUS.md`

graphiki is the origin repo for this pattern. Core is compliant (catch-all, error isolation, factory). One enhancement:

1. [ ] **Add typed payload map** — Currently uses `EventCallback = (payload: unknown) => void`. Upgrade to a generic `EventMap` that maps event names to specific payload types for type safety. See pattern doc for the TypeScript approach.
2. **Confirm:** Existing event bus tests still pass. New typed payloads catch type errors at compile time.

### four-ems

React + Vite app. Has partial APP_ICONS, DEBUG_SYSTEM, DOWNLOAD_PDF, and PWA. Missing BURGER_MENU, THEME_DARK_MODE, and EVENT_BUS entirely.

#### CLAUDE.md — Align with glow-props

No local `docs/implementations/` folder (correct). Has **~475 lines of hardcoded inline patterns** in a "Suggested Implementations" section (~lines 326-800) covering PWA System, Debug System, App Icons, Download as PDF — full code examples. No reference to glow-props as pattern source exists.

1. [ ] **Delete entire "Suggested Implementations" section** — Remove ~lines 326-800 (~475 lines of inline pattern code for PWA System, Debug System, App Icons, Download as PDF).
2. [ ] **Add "Implementation Patterns (Source of Truth)" section** — Replace deleted section with the standard glow-props reference block (source location, fetch via GitHub Pages/API, listing command, rules).
3. [ ] **Add AI Note** — Add the standard implementation patterns note about always fetching from glow-props.
4. [ ] **Add prohibition** — Add to Prohibitions: "Create local copies of implementation pattern files in any repo — always fetch from glow-props".
5. **Confirm:** CLAUDE.md is ~475 lines shorter. No inline code examples for patterns remain. Standard fetch commands point to glow-props.

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
6. [ ] **Improve clipboard fallbacks** — Add ClipboardItem Blob as primary method.
7. **Confirm:** 3 tabs in pill. HMR reload — no duplicate entries. Console errors captured.

#### DOWNLOAD_PDF — Partial → Complete

Reference: `docs/implementations/DOWNLOAD_PDF.md`

1. [ ] **Add `window.print()` trigger button** — Print CSS exists (`.no-print` class, `@media print`). Add a "Save as PDF" button in the UI.
2. [ ] **Add `-webkit-print-color-adjust: exact`** — To `@media print` CSS for background color preservation.
3. **Confirm:** Click print, verify background colors preserved, no interactive elements visible.

#### PWA_SYSTEM — Partial → Complete

Reference: `docs/implementations/PWA_SYSTEM.md`

1. [ ] **Convert to module-level singleton** — Move SW state from React hooks to module-scope variables.
2. [ ] **Add visibility-based update checks** — `visibilitychange` listener.
3. [ ] **Add 30-second suppression** — `sessionStorage` timestamp after update.
4. [ ] **Add `checkForUpdate()` function** — Returns typed result for UI/menu integration.
5. [ ] **Add `controllerchange` reload guard** — Auto-reload only when user clicked "Update".
6. [ ] **Add `workbox.cleanupOutdatedCaches: true`** — In vite config.
7. **Confirm:** Deploy, background tab, return — update detected. Manual "Check for updates" works from menu.

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

#### EVENT_BUS — Evaluate if needed

- [ ] **Decide:** If service-layer pub/sub needs emerge, follow `docs/implementations/EVENT_BUS.md`. Otherwise skip.

### synctone

React Native (Expo) chat app. Uses Metro bundler and Uniwind for theming. Has Zustand stores for state. Custom SW approach is correct for Expo. Theming exists via Uniwind but doesn't follow the DaisyUI dual-layer spec.

#### CLAUDE.md — Align with glow-props

**Only repo with a local `docs/implementations/` folder** — contains 8 files (APP_ICONS.md, BURGER_MENU.md, DEBUG_SYSTEM.md, DOWNLOAD_PDF.md, HTTPS_PROXY.md, KEY_LESSONS.md, PWA_SYSTEM.md, TIMER_LEAKS.md). Also has a hardcoded table in "Suggested Implementations" (~line 1413) linking to these local files, and an Architecture section (~line 790) listing the folder.

1. [ ] **Delete `docs/implementations/` folder** — Remove the entire directory and all 8 local pattern files. These are stale copies of the glow-props originals.
2. [ ] **Delete "Suggested Implementations" section** — Remove the hardcoded table (~line 1413) that links to local `docs/implementations/` files.
3. [ ] **Remove Architecture listing** — Remove the `implementations/` entry (~lines 790-798) from the file tree in the Architecture section since the directory will no longer exist.
4. [ ] **Add "Implementation Patterns (Source of Truth)" section** — Replace deleted section with the standard glow-props reference block (source location, fetch via GitHub Pages/API, listing command, rules).
5. [ ] **Add AI Note** — Add the standard implementation patterns note about always fetching from glow-props.
6. **Confirm:** No `docs/implementations/` folder exists. No hardcoded table. Architecture section no longer lists pattern files. Standard fetch commands point to glow-props.

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
5. [ ] **Either way: Establish z-index scale** — Document and enforce consistent layering.
6. **Confirm:** Modals/menus have consistent backdrop behavior, haptic feedback on toggle.

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

1. [ ] **Add `data-theme` attribute** (web platform) — Uniwind's `classList.add(name)` doesn't set `data-theme`. For web, add `document.documentElement.setAttribute('data-theme', name)` alongside the Uniwind call so DaisyUI components work correctly.
2. [ ] **Add `.dark` class toggling** — Set/remove `.dark` on `<html>` for Tailwind's `dark:` variant.
3. [ ] **Add `color-scheme` CSS rule** — `html.dark { color-scheme: dark; }` for native form inputs and scrollbars.
4. [ ] **Add flash prevention script** — Inline `<script>` in `+html.tsx` `<head>` that reads persisted theme from localStorage/AsyncStorage and applies both `data-theme` + `.dark` before Expo mounts.
5. [ ] **Add `@custom-variant dark`** — Tailwind v4's class-based dark mode configuration in CSS.
6. **Confirm:** Reload with non-default theme — no flash. Toggle dark/light — instant. Native select dropdowns match theme on web.

#### EVENT_BUS — Evaluate if needed

- [ ] **Decide:** synctone has Zustand stores and React hooks for state. If chat/message/reaction services need decoupled pub/sub communication, follow `docs/implementations/EVENT_BUS.md`. Otherwise skip.

---

## Cross-Cutting Gaps (most common across repos)

These gaps appear in 6+ repos and represent the highest-leverage improvements:

1. **CLAUDE.md alignment** — 1 Pass (repo-tor), 1 Partial (budgy-ting), 8 Missing. Must be done first — removes inline patterns and local copies, ensures all repos fetch from glow-props. Worst offenders: few-lap (~620 lines inline), four-ems (~475 lines), sun-sea-o (~470 lines), see-veo (~280 lines), synctone (8 local files in `docs/implementations/`).
2. **EVENT_BUS** — Missing in 10/11 repos (only graphiki has partial). Most repos may not need it.
3. **DEBUG_SYSTEM: console interception** — Missing in all repos that have debug systems (8/8)
4. **DEBUG_SYSTEM: pre-React inline pill** — Missing in 7/8 repos (only repo-tor has it)
5. **DEBUG_SYSTEM: inline styles** — Only repo-tor uses inline styles; all others use Tailwind/DaisyUI
6. **DEBUG_SYSTEM: PWA Diagnostics tab** — Missing in all repos (0/8 have 3 tabs)
7. **PWA_SYSTEM: visibility-based update checks** — Missing in 7/8 repos (only repo-tor has it)
8. **PWA_SYSTEM: 30-second suppression** — Missing in 7/8 repos (only repo-tor has it)
9. **PWA_SYSTEM: module singleton** — Missing in 6/8 repos (glow-props and repo-tor have it)
10. **BURGER_MENU: focus hooks extraction** — Missing in all repos that have menus
11. **THEME_DARK_MODE** — Missing in 5/11 repos (model-pear, see-veo, sun-sea-o, four-ems have no theming)
