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

| Repo | APP_ICONS | BURGER_MENU | DEBUG_SYSTEM | DOWNLOAD_PDF | PWA_SYSTEM | THEME_DARK_MODE | EVENT_BUS |
|------|-----------|-------------|--------------|--------------|------------|-----------------|-----------|
| glow-props | Pass | Pass | Missing (N/A) | Pass | Pass | Pass | Missing (N/A) |
| canva-grid | Pass | Partial | Partial | Partial* | Partial | Pass | Missing |
| budgy-ting | Partial | Partial | Partial | Partial | Partial | Missing | Missing |
| model-pear | Missing | Missing | Missing | Partial | Missing | Missing | Missing |
| see-veo | Partial | Missing | Partial | Partial | Partial | Missing | Missing |
| repo-tor | Partial | Partial | Partial | Pass | Pass | Partial | Missing |
| few-lap | Partial | Partial | Partial | Missing | Partial | Partial | Missing |
| sun-sea-o | Partial | Missing | Partial | Pass | Partial | Missing | Missing |
| graphiki | Pass | Missing | Partial | Missing | Partial | Pass | Partial |
| four-ems | Partial | Missing | Partial | Partial | Partial | Missing | Missing |
| synctone | Partial | Missing | Partial | Missing | Partial | Partial | Missing |

*canva-grid intentionally uses pdf-lib instead of window.print() (documented deviation — broken on mobile)

### glow-props

- [ ] **DEBUG_SYSTEM** — Not implemented. This is the reference docs repo (vanilla JS portfolio), so a debug system may not be needed. Evaluate if warranted.
- [ ] **EVENT_BUS** — Not implemented. Same as above — evaluate if warranted for a vanilla JS portfolio.

### canva-grid

- [ ] **BURGER_MENU** — Missing `useEscapeKey` hook extraction (inlined in component), no backdrop owned by menu (delegated to parent), no `disabled`/`separator`/`destructive`/`external` MenuItem support, no version footer, no close-then-act delay
- [ ] **DEBUG_SYSTEM** — Missing console interception, no `#debug-root` in index.html (dynamically created), no PWA Diagnostics tab (only 2 tabs), no pre-React inline pill, no URL query param redaction, no subscriber replay, DEV-only gating (should be production alpha), missing `success` severity, no `debugGenerateReport()` in module, no embed mode skip
- [ ] **DOWNLOAD_PDF** — Intentionally uses pdf-lib instead of window.print() (broken on mobile). No print CSS exists.
- [ ] **PWA_SYSTEM** — Missing visibility-based update checks, no 30s suppression, module singleton partially implemented (each hook instance has own `canInstall` state)
- [ ] **EVENT_BUS** — Not implemented. Evaluate if service-layer pub/sub is warranted.

### budgy-ting

- [ ] **APP_ICONS** — Uses 150 DPI instead of 400 DPI; no separate maskable icon (same file for both purposes)
- [ ] **BURGER_MENU** — Missing arrow key navigation, no centralized z-index scale
- [ ] **DEBUG_SYSTEM** — Missing console interception, only 2 tabs (no PWA Diagnostics), no pre-framework inline pill, uses Tailwind classes instead of inline styles, uses array shift instead of circular buffer
- [ ] **DOWNLOAD_PDF** — Print CSS exists but no window.print() trigger button
- [ ] **PWA_SYSTEM** — Missing visibility-based update checks, no 30s suppression, no PWA diagnostics tab
- [ ] **THEME_DARK_MODE** — No DaisyUI (custom Tailwind v4 CSS variables), no `data-theme` attribute, no per-mode theme selection
- [ ] **EVENT_BUS** — Not implemented

### model-pear

- [ ] **APP_ICONS** — Entirely missing. No SVG source, no Sharp script, no proper icon sizes
- [ ] **BURGER_MENU** — Basic hamburger exists but doesn't follow disclosure pattern. No focus hooks, no arrow key nav, hamburger button below 44px
- [ ] **DEBUG_SYSTEM** — Entirely missing
- [ ] **DOWNLOAD_PDF** — Print CSS exists but no explicit window.print() trigger button
- [ ] **PWA_SYSTEM** — Entirely missing. No vite-plugin-pwa, no service worker, no manifest
- [ ] **THEME_DARK_MODE** — Dark-only design. No DaisyUI, no `data-theme`, no flash prevention, no cross-tab sync, no meta theme-color
- [ ] **EVENT_BUS** — Not implemented

### see-veo

- [ ] **APP_ICONS** — Missing 400 DPI density parameter, no 48x48 favicon PNG
- [ ] **BURGER_MENU** — Not implemented (may be intentional for single-page resume site)
- [ ] **DEBUG_SYSTEM** — No separate `#debug-root`, uses Tailwind not inline styles, only 2 tabs, no `id` field on entries, no console interception, no global error listeners, no pre-React inline pill, no URL redaction, missing clipboard fallbacks
- [ ] **DOWNLOAD_PDF** — Print CSS exists but no trigger button, missing `print-color-adjust: exact`
- [ ] **PWA_SYSTEM** — No module singleton (uses hook-local state), no visibility-based checks, no 30s suppression, no `checkForUpdate()`, no `controllerchange` reload guard, no `onRegisterError` handler
- [ ] **THEME_DARK_MODE** — Not implemented (single dark theme, no DaisyUI, no toggle, no persistence)
- [ ] **EVENT_BUS** — Not implemented

### repo-tor

- [ ] **APP_ICONS** — Missing 180px Apple touch icon, no maskable vs any separation at all sizes
- [ ] **BURGER_MENU** — Missing `useDisclosureFocus` hook extraction (inline logic), `useFocusTrap` exists but not used by menu, missing `useClickOutside` in menu
- [ ] **DEBUG_SYSTEM** — No console interception, no separate `#debug-root` (appended to body), only 2 views not 3 tabs, no clipboard fallbacks. Pre-React inline pill IS present (pioneered here). Inline styles compliant.
- [ ] **THEME_DARK_MODE** — No DaisyUI (custom CSS variables), no `data-theme` attribute, no meta theme-color HTML tag. Flash prevention and cross-tab sync are compliant.
- [ ] **EVENT_BUS** — Not implemented. Uses raw CustomEvent/addEventListener instead of typed bus.

### few-lap

- [ ] **APP_ICONS** — Missing 180px Apple touch icon (uses 192px for Apple)
- [ ] **BURGER_MENU** — Missing `useDisclosureFocus` hook, no `useFocusTrap`, no arrow key/Home/End nav, no `aria-controls`, no `visible`/`disabled`/`highlight` MenuItem support
- [ ] **DEBUG_SYSTEM** — No separate `#debug-root` (renders inside app tree), uses Tailwind not inline styles, no console interception, no pre-React inline pill, no subscriber replay, `details` is string not Record, missing ClipboardItem Blob fallback, no URL redaction
- [ ] **DOWNLOAD_PDF** — Not implemented
- [ ] **PWA_SYSTEM** — Missing visibility-based update check pause (Expo/Metro, not Vite — custom SW is correct approach)
- [ ] **THEME_DARK_MODE** — No `data-theme` dual attribute (Uniwind handles differently), no flash prevention script
- [ ] **EVENT_BUS** — Not implemented

### sun-sea-o

- [ ] **APP_ICONS** — Missing 400 DPI density, no 180px Apple touch icon, no favicon.ico
- [ ] **BURGER_MENU** — Not implemented. No hamburger menu, no disclosure pattern, no focus hooks. Debug pill uses `z-[9999]` instead of z-80.
- [ ] **DEBUG_SYSTEM** — Missing `id` field on entries, no `details` Record field, no `(string & {})` source fallback, uses Tailwind not inline styles, no PWA Diagnostics tab, no `debugGenerateReport()` in module, no URL redaction, no ClipboardItem Blob fallback, no pre-React inline pill, duplicate global listeners (no HMR guard), no subscriber replay, no subscriber error isolation
- [ ] **PWA_SYSTEM** — No module singleton, no 30s suppression, no visibility-based checks, no `controllerchange` reload guard, no `checkForUpdate()` with typed result, no `onRegisterError`, no manifest `id`/`scope`/`prefer_related_applications`, no workbox config
- [ ] **THEME_DARK_MODE** — Not implemented (hardcoded slate color scheme only)
- [ ] **EVENT_BUS** — Not implemented

### graphiki

- [ ] **BURGER_MENU** — Not implemented. No burger menu component (hooks exist for modals but no menu).
- [ ] **DEBUG_SYSTEM** — Missing console interception, uses Tailwind not inline styles, only 2 tabs (no PWA tab), no pre-React inline pill. Separate `#debug-root` and clipboard fallbacks are compliant.
- [ ] **DOWNLOAD_PDF** — Not implemented
- [ ] **PWA_SYSTEM** — No module singleton for install prompt, no visibility-based checks, no 30s suppression
- [ ] **EVENT_BUS** — Partial (origin repo). Missing typed payload map (uses generic `unknown` payload). Core pattern compliant: catch-all, error isolation, factory function.

### four-ems

- [ ] **APP_ICONS** — Missing 180px Apple touch icon, no `<link rel="apple-touch-icon">` in index.html
- [ ] **BURGER_MENU** — Not implemented
- [ ] **DEBUG_SYSTEM** — Missing console interception, no PWA Diagnostics tab, no pre-React inline pill, no HMR guard, `details` is string not Record, incomplete clipboard fallbacks
- [ ] **DOWNLOAD_PDF** — Print CSS exists but no window.print() trigger button, missing `-webkit-print-color-adjust: exact`
- [ ] **PWA_SYSTEM** — No module singleton, no visibility-based checks, no 30s suppression, no `checkForUpdate()`, no `controllerchange` reload guard, no `workbox.cleanupOutdatedCaches`
- [ ] **THEME_DARK_MODE** — Not implemented (no DaisyUI, no themes, no dark mode)
- [ ] **EVENT_BUS** — Not implemented

### synctone

- [ ] **APP_ICONS** — Reuses same 512px for both maskable and any purpose, no favicon.ico
- [ ] **BURGER_MENU** — No disclosure-pattern menu. Uses ChatHeaderMenu (per-chat) and SettingsModal (bottom sheet). No shared ModalBackdrop, no haptic feedback, no z-index scale.
- [ ] **DEBUG_SYSTEM** — No separate `#debug-root`, no console interception, only 2 tabs (no Env tab), mixed inline/Tailwind styles, no pre-React inline pill, no clipboard fallbacks, no debug report generation, no HMR guard, `detail` is string not Record, no numeric `id`, no subscriber replay
- [ ] **DOWNLOAD_PDF** — Not implemented
- [ ] **PWA_SYSTEM** — Expo/Metro (no vite-plugin-pwa — correct approach). Missing visibility-based checks, no typed `checkForUpdate` result.
- [ ] **THEME_DARK_MODE** — No `data-theme` attribute (Uniwind classList), no `.dark` class, no `color-scheme` CSS, no flash prevention script, no `@custom-variant dark`
- [ ] **EVENT_BUS** — Not implemented

---

## Cross-Cutting Gaps (most common across repos)

These gaps appear in 6+ repos and represent the highest-leverage improvements:

1. **EVENT_BUS** — Missing in 10/11 repos (only graphiki has partial). Most repos may not need it.
2. **DEBUG_SYSTEM: console interception** — Missing in all repos that have debug systems (8/8)
3. **DEBUG_SYSTEM: pre-React inline pill** — Missing in 7/8 repos (only repo-tor has it)
4. **DEBUG_SYSTEM: inline styles** — Only repo-tor uses inline styles; all others use Tailwind/DaisyUI
5. **DEBUG_SYSTEM: PWA Diagnostics tab** — Missing in all repos (0/8 have 3 tabs)
6. **PWA_SYSTEM: visibility-based update checks** — Missing in 7/8 repos (only repo-tor has it)
7. **PWA_SYSTEM: 30-second suppression** — Missing in 7/8 repos (only repo-tor has it)
8. **PWA_SYSTEM: module singleton** — Missing in 6/8 repos (glow-props and repo-tor have it)
9. **BURGER_MENU: focus hooks extraction** — Missing in all repos that have menus
10. **THEME_DARK_MODE** — Missing in 5/11 repos (model-pear, see-veo, sun-sea-o, four-ems have no theming)
