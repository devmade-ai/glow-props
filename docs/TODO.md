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

Audited 2026-04-06 against updated `docs/implementations/*.md` pattern docs. Updated 2026-04-10 with Z_INDEX_SCALE (9 patterns). Re-audited 2026-04-16 against actual repo code — corrected stale statuses for canva-grid, budgy-ting, see-veo, few-lap, four-ems, repo-tor. repo-tor re-audited same day and confirmed fully compliant on original 9 patterns. Added PWA_ICON_CACHE_BUST pattern 2026-04-16 (10 patterns).

Legend: **Pass** = compliant, **Partial** = has the feature but with gaps, **Missing** = not implemented, **N/A** = not applicable

### Gap Matrix

| Repo | CLAUDE.md | APP_ICONS | BURGER_MENU | DEBUG_SYSTEM | DOWNLOAD_PDF | PWA_SYSTEM | THEME_DARK_MODE | EVENT_BUS | Z_INDEX_SCALE | ICON_CACHE_BUST |
|------|-----------|-----------|-------------|--------------|--------------|------------|-----------------|-----------|---------------|-----------------|
| glow-props | Pass | Pass | Pass | N/A | Pass | Pass | Pass | N/A | Pass | N/A |
| canva-grid | Pass | Pass | Pass | Pass | Pass (B) | Pass | Pass | N/A | Pass | Missing |
| budgy-ting | Pass | Pass | Partial | Partial | Partial | Pass | Pass | Missing | Pass | Missing |
| model-pear | Missing | Missing | Missing | Missing | Partial | Missing | Missing | Missing | Missing | N/A |
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

#### ICON_CACHE_BUST — Missing → Implement

Reference: `docs/implementations/PWA_ICON_CACHE_BUST.md` (fetch from glow-props)

canva-grid uses vite-plugin-pwa with Approach B (pdf-lib) for export. PWA icons are served with stable filenames.

1. [ ] **Add `iconVersion()` + `iconCacheBustHtml()` to `vite.config.js`** — Content-hash each icon file, inject `?v=<hash>` into HTML link tags. Plugin must be wired before `VitePWA()`.
2. [ ] **Version manifest icon URLs** — Pass `versioned()` paths to `VitePWA({ manifest: { icons: [...] } })`.
3. [ ] **Add `ignoreURLParametersMatching: [/^v$/]`** to workbox config — Required so Workbox precache matches versioned URLs.
4. [ ] **Add tripwire test** — Source-level and dist-level assertions per the pattern doc.
5. [ ] **Add user communication** — "Already installed and the icon looks outdated?" collapsible in install modal.
6. **Confirm:** Build, verify `dist/manifest.webmanifest` icons have `?v=` hashes, `dist/index.html` link tags have `?v=` hashes, `dist/sw.js` has `ignoreURLParametersMatching` with `/^v$/`.

### budgy-ting

Vue + Vite app. Mostly compliant (verified 2026-04-10). CLAUDE.md, APP_ICONS, PWA_SYSTEM, THEME_DARK_MODE, and Z_INDEX_SCALE are now fully passing. Remaining gaps: BURGER_MENU (minor), DEBUG_SYSTEM (minor), DOWNLOAD_PDF (needs print button), plus cross-fleet items (HISTORY.md removal, Communication section, ICON_CACHE_BUST).

Previous gaps now confirmed done: CLAUDE.md URLs updated, 400 DPI + separate maskable icon, visibility-based update checks + 30-second suppression + module singleton, full DaisyUI combo-based theme system with flash prevention + cross-tab sync, z-index scale documented and applied.

#### HISTORY.md — Remove (cross-fleet policy 2026-04-16)

Git history already tracks completions; a separate changelog is redundant.

1. [ ] Delete `docs/HISTORY.md`
2. [ ] Remove `### docs/HISTORY.md` section from CLAUDE.md Documentation rules
3. [ ] Change "move completed items to HISTORY.md" → "delete completed items (git history tracks them)" in CLAUDE.md
4. [ ] Remove HISTORY.md from README.md file tree (if listed)
5. [ ] Delete any `[x]` completed items from `docs/TODO.md`

#### BURGER_MENU — Partial (minor gaps)

Reference: `docs/implementations/BURGER_MENU.md`

Arrow key navigation (ArrowDown/Up/Home/End with wrapping), z-index normalization (backdrop z-40, menu z-50), close-then-act delay, and MenuItem interface with `disabled`/`separator` are all implemented.

1. [ ] **Add `destructive` and `external` MenuItem properties** — These properties from the pattern's MenuItem interface are not yet supported.
2. **Confirm:** Verify destructive items have warning styling. External items open in new tab with indicator icon.

#### DEBUG_SYSTEM — Partial (minor gaps)

Reference: `docs/implementations/DEBUG_SYSTEM.md`

Console interception, PWA Diagnostics tab, pre-framework inline pill, circular buffer (head/count pattern), URL redaction, success severity, and debugGenerateReport in module are all implemented. Inline styles in Vue DebugPill use Tailwind (intentional — inline pill handles CSS-not-loaded case).

1. [ ] **Add static `#debug-root` to `index.html`** — Still uses `document.createElement('div')` in `main.ts`. Add a static `<div id="debug-root">` after `<div id="root">`.
2. [ ] **Add subscriber replay** — New subscribers should receive existing entries immediately on subscribe.
3. [ ] **Add embed mode skip** — Skip pill when `?embed=` is in the URL.
4. **Confirm:** New subscriber gets existing log entries. Pill hidden in embed mode.

#### DOWNLOAD_PDF — Partial → Complete

Reference: `docs/implementations/DOWNLOAD_PDF.md`

1. [ ] **Add `window.print()` trigger button** — Print CSS already exists (`.no-print` class, `@media print` rules, `beforeprint`/`afterprint` dark mode handlers). Add a "Save as PDF" button in the UI that calls `window.print()`.
2. **Confirm:** Click button, verify print preview shows clean output with no interactive elements.

#### CLAUDE.md — Add Communication section (cross-fleet policy 2026-04-16)

glow-props CLAUDE.md now has a top-level `## Communication` section between Principles and Code Standards. Downstream repos must add it.

1. [ ] **Add `## Communication` section** — Copy from glow-props CLAUDE.md (lines 32-46). Place between Principles and Code Standards.
2. [ ] **Update header line** — Add COMMUNICATION to the `# READ AND FOLLOW...` line.
3. [ ] **Remove duplicate bullets from AI Notes** — If "ASK before assuming" or "Communication style" bullets exist in AI Notes, remove them (now covered by the Communication section).

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

SvelteKit app. Lowest compliance across the fleet — 5 of 7 patterns are entirely missing. This needs foundational work. Dark-only design currently.

#### HISTORY.md — Remove (cross-fleet policy 2026-04-16)

Git history already tracks completions; a separate changelog is redundant.

1. [ ] Delete `docs/HISTORY.md`
2. [ ] Remove `### docs/HISTORY.md` section from CLAUDE.md Documentation rules
3. [ ] Change "move completed items to HISTORY.md" → "delete completed items (git history tracks them)" in CLAUDE.md
4. [ ] Remove HISTORY.md from README.md file tree (if listed)
5. [ ] Delete any `[x]` completed items from `docs/TODO.md` (including the "Negotiation Mode" High Priority section which is marked complete)

#### CLAUDE.md — Align with glow-props

No local `docs/implementations/` folder (correct). No inline patterns. Has a stale "Shared conventions with glow-props" AI Note (~line 215) that points to the old `glow-props/CLAUDE.md` for patterns. Missing: Implementation Patterns section, prohibition, and pattern-specific AI note.

1. [ ] **Replace stale AI Note** — Remove the "Shared conventions with glow-props" block (~lines 215-219) that references "suggested implementations" in glow-props CLAUDE.md. Replace with: `**Implementation patterns — always fetch from glow-props.** Never look for local copies of implementation pattern files (e.g., docs/implementations/*.md) in downstream repos. They do not exist locally — the single source of truth is the docs/implementations/ folder in the glow-props repo. Fetch the latest version before every implementation task.`
2. [ ] **Add "Implementation Patterns (Source of Truth)" section** — Add the standard section from glow-props CLAUDE.md with fetch instructions (GitHub Pages URL, GitHub API URL, listing command) and rules.
3. [ ] **Add prohibition** — Add to Prohibitions: "Create local copies of implementation pattern files in any repo — always fetch from glow-props".
4. [ ] **Add `## Communication` section** — Copy from glow-props CLAUDE.md (lines 32-46). Place between Principles and Code Standards. Update header line to include COMMUNICATION. Remove any duplicate "ASK before assuming" or "Communication style" bullets from AI Notes.
5. **Confirm:** No references to "suggested implementations in glow-props CLAUDE.md" remain. Standard pattern source section exists. Communication section exists between Principles and Code Standards.

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

React + Vite dashboard app. All original 9 patterns resolved (verified 2026-04-16). Remaining: HISTORY.md removal, Communication section, and new ICON_CACHE_BUST pattern.

All previous gaps implemented: 180px Apple touch icon + favicon.ico, z-index scale normalized, full debugLog module with pub/sub + console interception + #debug-root + React DebugPill (3 tabs) + clipboard fallbacks + URL redaction, DaisyUI v5 with 8 themes + data-theme + flash prevention + cross-tab sync + meta theme-color, useDisclosureFocus + useFocusTrap + Home/End keys + disabled items + theme UI in burger menu.

EVENT_BUS: Not needed — React Context dispatch + useReducer in AppContext.jsx is sufficient.

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

#### ICON_CACHE_BUST — Missing → Implement

Reference: `docs/implementations/PWA_ICON_CACHE_BUST.md` (fetch from glow-props)

repo-tor uses vite-plugin-pwa with a mature PWA setup. Icons are served with stable filenames.

1. [ ] **Add `iconVersion()` + `iconCacheBustHtml()` to `vite.config.js`** — Content-hash each icon file, inject `?v=<hash>` into HTML link tags. Plugin must be wired before `VitePWA()`.
2. [ ] **Version manifest icon URLs** — Pass `versioned()` paths to `VitePWA({ manifest: { icons: [...] } })`.
3. [ ] **Add `ignoreURLParametersMatching: [/^v$/]`** to workbox config.
4. [ ] **Add tripwire test** — Source-level and dist-level assertions per the pattern doc.
5. [ ] **Add user communication** — "Already installed and the icon looks outdated?" collapsible in install modal.
6. **Confirm:** Build, verify versioned URLs in manifest + HTML + SW config.

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

No local `docs/implementations/` folder (correct). Has **~620 lines of hardcoded inline patterns** in a "Suggested Implementations" section (~lines 597-1219) covering PWA System, Debug System, App Icons, Download as PDF, and HTTPS Proxy — full code examples. Also has an AI Note (~line 525) referencing "from Suggested Implementations" locally.

1. [ ] **Delete entire "Suggested Implementations" section** — Remove ~lines 597-1219 (~620 lines of inline pattern code for PWA System, Debug System, App Icons, Download as PDF, HTTPS Proxy).
2. [ ] **Add "Implementation Patterns (Source of Truth)" section** — Replace deleted section with the standard glow-props reference block (source location, fetch via GitHub Pages/API, listing command, rules).
3. [ ] **Update AI Note reference** — Near line 525, change `httpsGet() CONNECT tunnel pattern from Suggested Implementations` to reference fetching the HTTPS_PROXY pattern from glow-props.
4. [ ] **Add AI Note** — Add the standard implementation patterns note about always fetching from glow-props.
5. [ ] **Add prohibition** — Add to Prohibitions: "Create local copies of implementation pattern files in any repo — always fetch from glow-props".
6. [ ] **Add `## Communication` section** — Copy from glow-props CLAUDE.md (lines 32-46). Place between Principles and Code Standards. Update header line to include COMMUNICATION. Remove any duplicate "ASK before assuming" or "Communication style" bullets from AI Notes.
7. **Confirm:** CLAUDE.md is ~620 lines shorter. No inline code examples for patterns remain. All pattern references point to glow-props. Communication section exists between Principles and Code Standards.

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

1. [ ] **Add flash prevention script** — Inline `<script>` in `+html.tsx` `<head>` that reads localStorage and applies the theme CSS class before Expo mounts. Without this, users see a flash of the default theme on page load.
2. [ ] **Verify Uniwind `@variant` blocks cover all DaisyUI semantic tokens** — Ensure the CSS variable definitions in each `@variant` block match DaisyUI's expected variables for full component compatibility.
3. **Confirm:** Reload with a non-default theme saved — no flash. Toggle dark/light — instant switch.

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
5. **Confirm:** Full keyboard navigation. Escape closes. Backdrop click closes. 44px touch targets. Debug pill renders above menu.

#### Z_INDEX_SCALE — Missing → Implement

Reference: `docs/implementations/Z_INDEX_SCALE.md`

1. [ ] **Audit and normalize all z-index values** — Debug pill currently uses `z-[9999]`. Run the audit command from the pattern doc and fix all violations.
2. **Confirm:** All z-index values map to the standard scale. Debug pill at z-[80] renders above menu at z-50.

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

1. [ ] **Add `data-theme` attribute** (web platform) — Uniwind's `classList.add(name)` doesn't set `data-theme`. For web, add `document.documentElement.setAttribute('data-theme', name)` alongside the Uniwind call so DaisyUI components work correctly.
2. [ ] **Add `.dark` class toggling** — Set/remove `.dark` on `<html>` for Tailwind's `dark:` variant.
3. [ ] **Add `color-scheme` CSS rule** — `html.dark { color-scheme: dark; }` for native form inputs and scrollbars.
4. [ ] **Add flash prevention script** — Inline `<script>` in `+html.tsx` `<head>` that reads persisted theme from localStorage/AsyncStorage and applies both `data-theme` + `.dark` before Expo mounts.
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

Updated 2026-04-16 after code audit. canva-grid, budgy-ting, and repo-tor have resolved all original 9 pattern gaps. All repos still need the new ICON_CACHE_BUST pattern, HISTORY.md removal, and Communication section propagation. Only glow-props is fully clean.

These gaps appear in 4+ repos and represent the highest-leverage improvements:

1. **CLAUDE.md alignment** — 3 Pass on original scope (repo-tor, canva-grid, budgy-ting), 7 Missing. All 10 downstream repos still need the new Communication section added. Must be done first — removes inline patterns and local copies, ensures all repos fetch from glow-props and have consistent communication rules. Worst offenders for inline patterns: few-lap (~620 lines), four-ems (~630 lines), sun-sea-o (~470 lines), see-veo (~318 lines), synctone (8 local files in `docs/implementations/`).
2. **HISTORY.md removal** — New cross-fleet policy 2026-04-16. Missing in all 10 downstream repos. Delete `docs/HISTORY.md`, remove from CLAUDE.md Documentation rules, update TODO wording.
3. **PWA_ICON_CACHE_BUST** — New pattern added 2026-04-16. Missing in all 9 repos with PWA (canva-grid, budgy-ting, see-veo, repo-tor, few-lap, sun-sea-o, graphiki, four-ems, synctone). N/A for glow-props (static) and model-pear (no PWA yet). Expo repos (few-lap, synctone) need stack-specific adaptation.
4. **EVENT_BUS** — N/A in 3 repos (canva-grid, budgy-ting, repo-tor decided against). graphiki has partial. 7 repos still need evaluate decision.
5. **DEBUG_SYSTEM: console interception** — Done in canva-grid, budgy-ting, repo-tor. Still missing in 5/8 repos with debug systems (see-veo, few-lap, sun-sea-o, four-ems, synctone).
6. **DEBUG_SYSTEM: pre-React inline pill** — Done in canva-grid, budgy-ting, repo-tor. Still missing in 5/8 repos.
7. **DEBUG_SYSTEM: inline styles** — Done in repo-tor and canva-grid. Others still use Tailwind/DaisyUI.
8. **DEBUG_SYSTEM: PWA Diagnostics tab** — Done in canva-grid, budgy-ting, repo-tor. Still missing in 5/8 repos.
9. **PWA_SYSTEM: visibility-based update checks** — Done in canva-grid, budgy-ting, repo-tor, glow-props. Still missing in 4/8 repos.
10. **PWA_SYSTEM: 30-second suppression** — Done in canva-grid, budgy-ting, repo-tor, glow-props. Still missing in 4/8 repos.
11. **PWA_SYSTEM: module singleton** — Done in canva-grid, budgy-ting, glow-props, repo-tor. Still missing in 4/8 repos.
12. **BURGER_MENU: focus hooks extraction** — Done in canva-grid (`useEscapeKey`) and repo-tor (`useDisclosureFocus` + `useFocusTrap`). Still missing in other repos with menus.
13. **THEME_DARK_MODE** — Missing in 4/11 repos (model-pear, see-veo, sun-sea-o, four-ems have no theming). budgy-ting and repo-tor now have full DaisyUI systems.
14. **Z_INDEX_SCALE** — 4 Pass (glow-props, canva-grid, budgy-ting, repo-tor), 1 Partial (graphiki), 6 Missing.
