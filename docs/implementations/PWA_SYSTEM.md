---
slug: pwa-system
title: PWA System
badge: Infrastructure
description: Install prompts, service worker updates, offline support. Handles the beforeinstallprompt race condition and browser-specific install instructions.
tags:
  - vite-plugin-pwa
  - React hooks
  - Cross-browser
order: 1
---

# PWA System

Four parts, built on `vite-plugin-pwa` (^1.2.0) with React. Adapt patterns for other frameworks — see "Framework variants" below for the Vue form and the SSR/SSG form.

**Reference implementations:** glow-props (React 19 MPA, framework-agnostic singleton + React bridge), kl-website and qi-invoice (React SPA, singleton + `useSyncExternalStore`), fl-farlume (Vue 3, module-scope `useRegisterSW`).

**Related patterns:**
- [Z_INDEX_SCALE.md](Z_INDEX_SCALE.md) — Update banner/toast at z-70, install instructions modal at z-60
- [APP_ICONS.md](APP_ICONS.md) — Generates the icon PNGs (192, 512, 1024) referenced in the manifest
- [BURGER_MENU.md](BURGER_MENU.md) — "Check for updates" and "Install app" are standard menu items
- [THEME_DARK_MODE.md](THEME_DARK_MODE.md) — Manifest `theme_color` and dynamic `<meta name="theme-color">` must match the active theme
- [DEBUG_SYSTEM.md](DEBUG_SYSTEM.md) — PWA Diagnostics tab in the debug pill runs active health checks against SW state, manifest, and install prompt

**Dependency note:** `workbox-window` is a **required peer dependency of vite-plugin-pwa ≥1.x for every project**, not just React ones — the `virtual:pwa-register` client (plain and `/react`) is built on workbox-window's `Workbox` class, so it is bundled into the app either way. Install it explicitly: `npm install -D workbox-window`. React projects additionally add `/// <reference types="vite-plugin-pwa/react" />` to their type declarations; plain-`registerSW` projects use `/// <reference types="vite-plugin-pwa/client" />`.

## Vite Config (`vite.config.ts`)

```typescript
import { VitePWA } from 'vite-plugin-pwa'

// Inside defineConfig plugins array:
VitePWA({
  registerType: 'prompt',
  // NO includeAssets here — globPatterns below already matches ico/png/svg.
  // Listing a file in BOTH is the single most destructive misconfiguration in
  // this pattern. See "Exactly one precache source per URL" below.
  workbox: {
    cleanupOutdatedCaches: true,
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    // Exclude assets the app never displays — scraper-only social cards would
    // otherwise cost every installed client megabytes of precache for nothing.
    globIgnores: ['**/og-card.png', '**/og/*.png', 'share/**'],
    // SPA only — omit for multi-page apps:
    // navigateFallback: '/index.html',
    runtimeCaching: [
      // Google Fonts — cache for 1 year (fonts rarely change)
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts-cache',
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // CDN images — cache for 30 days
      // Adapt the urlPattern to your CDN domain
    ],
  },
  manifest: {
    name: 'Your App',
    short_name: 'App',
    description: 'Description here',
    id: '/',
    theme_color: '#10b981',
    background_color: '#ffffff',
    display: 'standalone',
    scope: '/',
    start_url: '/',
    prefer_related_applications: false,
    icons: [
      { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: 'pwa-1024x1024.png', sizes: '1024x1024', type: 'image/png', purpose: 'maskable' }
    ]
  }
})
```

- **`registerType: 'prompt'`**: Always use `'prompt'` as the config value — it is the mechanism that exposes the waiting worker to app code. The *behavior* on top of it is the fleet-standard **auto-on-launch** policy (see "Update Application Policy" below): auto-apply at launch, defer mid-session, user toggle. Never use raw `autoUpdate` (silently refreshes mid-work) and never ship tap-only prompt (stale clients never converge). **Never switch from `autoUpdate` to tap-only `prompt` in production** — users with the auto-updating SW already installed will never see the prompt-based code because the old SW silently replaces itself before the new registration logic runs (switching to auto-on-launch is safe — see the policy's migration note).
- **`workbox.cleanupOutdatedCaches`**: Removes caches from incompatible older Workbox major versions. Without this, stale caches accumulate across deployments.
- **`workbox.globPatterns`**: Explicit precache patterns. The default may miss font or image types your app uses. Pay special attention to assets fetched at *feature-use* time rather than page-load time — their absence offline fails **silently**. qi-invoice precaches `.ttf` because pdf-lib can only embed TTF (the browser uses the woff2); without them a PDF generated offline silently falls back to Helvetica instead of the brand font. Enumerate those deliberately and add a tripwire.
- **`workbox.globIgnores`**: The inverse rule. Exclude anything the app itself never fetches — OG/Twitter card images are requested only by external scrapers, so precaching them taxes every install for zero benefit. Any repo following DISCOVERABILITY ships these.
- **`navigateFallback`**: Only set for SPAs. For multi-page apps (multiple HTML entry points), omit this — it would incorrectly serve `index.html` for all navigation requests.
- **`id`**: Stable app identity. Without it, Chrome derives from `start_url` — breaks on config changes or redeployments.
- **`prefer_related_applications: false`**: Without this, Chrome may skip `beforeinstallprompt` if it thinks a native app exists.
- **Separate icon purposes**: `any` for standard display (192, 512), `maskable` full-bleed. Never combine `"any maskable"` — browsers pick the wrong one. Either a dedicated 1024x1024 maskable (glow-props, qi-invoice) or maskable entries at 192 **and** 512 (see-veo) is correct; the latter matches the sizes Chrome's install criteria and Lighthouse actually request, so prefer it when you have no other use for a 1024 asset.
- **`theme_color`**: Static fallback for the browser chrome — and in Android standalone mode the manifest value **wins over the meta tags entirely**. It must therefore equal your *default/light* theme's `<meta name="theme-color">` value, not a dark accent. kl-website shipped `#15110b` here and rendered a near-black status bar over a light app. Pair it with dual `<meta name="theme-color" media="(prefers-color-scheme: light|dark)">` tags for correct pre-JS chrome in both themes, and assert manifest `theme_color` === `background_color` === the light meta in a test — three values that must agree and silently drift otherwise.

### Exactly one precache source per URL

**This is the highest-severity misconfiguration in the pattern.** If a file reaches the precache manifest twice — once from `globPatterns` and once from `includeAssets` or manifest-icon injection — workbox-precaching throws `add-to-cache-list-conflicting-entries` **inside the worker at runtime**. The SW "activates" having precached nothing: offline is dead in production while the build log still cheerfully prints `precache 37 entries`. No source-level test and no build output catches it (qi-invoice shipped exactly this; post-mortem in its `docs/AI_MISTAKES.md`).

Two valid resolutions — pick one, never both:

| Resolution | How | Used by |
|---|---|---|
| **Glob is the sole source** | Drop `includeAssets` entirely; let `globPatterns` match the icons | qi-invoice, fl-farlume |
| **`includeAssets` is the sole source** | `globIgnores` every referenced icon, list them in `includeAssets` with **bare** paths | glow-props |

In the second form the bare path matters: a `?v=` path globs nothing, so the icon silently drops out of the precache altogether. The only reliable detector is a dist-level check that parses the built `dist/sw.js` precache manifest — see "Tripwire: verify the built precache manifest" below.

### The `dontCacheBustURLsMatching` trap

vite-plugin-pwa's default treats **everything under `assets/`** as content-hashed and precaches it with `revision: null`. Any plain-named (non-hashed) file living there — icons, fonts, OG images copied from `public/assets/` — therefore gets an entry that can **never** be invalidated: change the bytes, and installed clients keep serving the old ones forever. Discovered independently in qi-invoice, kl-website, and glow-props.

```js
workbox: {
  // Only treat genuinely content-hashed filenames as immutable.
  dontCacheBustURLsMatching: /^assets\/[^/]+-[A-Za-z0-9_-]{8,}\.\w+$/,
}
```

Alternatives when you can't narrow the regex: move the file out of `assets/`, extend `?v=` versioning to it (see PWA_ICON_CACHE_BUST.md), or bump `workbox.cacheId` to rename the whole precache (kl-website's lever — effective but a manual remember-to-do-it step, so prefer the first two).

### Large assets: ML models, WASM, media

Workbox's `maximumFileSizeToCacheInBytes` defaults to 2 MiB and **silently drops** anything larger from the precache — a build warning nobody reads. Raising it is usually the wrong fix. Decide per asset class:

| Asset | Strategy | Why |
|---|---|---|
| App shell (js/css/html/fonts/icons) | Precache | Small, always needed |
| Lazy same-origin multi-MB assets (`.wasm`) | Runtime `CacheFirst` route | Precaching makes *every* visitor pay the download at SW install for a feature they may never open |
| Model-hub downloads (huggingface.co etc.) | Leave to the library's own cache | transformers.js already caches to Cache Storage; adding a workbox route **double-stores** the same bytes (~93 MB in graphiki's case) |
| User data | Never cache in the SW | Belongs in IndexedDB |

graphiki is the worked example: ~80 MB all-MiniLM + ~13 MB xtremedistil are library-cached, and the ~21 MB ORT wasm needs a `CacheFirst` runtime route — precaching it would be wrong, and omitting it (its current state) leaves offline ML dependent on HTTP-cache luck.

## Install Prompt Race Condition (`index.html`)

`beforeinstallprompt` fires once. On repeat visits with a cached SW, it fires before the framework mounts — if nothing catches it, the install prompt is permanently lost.

Inline classic (non-module) script before any `<script type="module">`:

```html
<script>
  // Named handler + attach guard so the consuming module can release it on HMR
  // dispose (TIMER_LEAKS.md). __pwaPromptCaptured is a DURABLE flag: the
  // consumer deletes the event object itself, so diagnostics cannot test for it.
  window.__pwaInstallCapture = function (e) {
    e.preventDefault();
    window.__pwaInstallPromptEvent = e;
    window.__pwaPromptCaptured = true;
  };
  if (!window.__pwaInstallCaptureAttached) {
    window.__pwaInstallCaptureAttached = true;
    window.addEventListener('beforeinstallprompt', window.__pwaInstallCapture);
  }
</script>
```

Executes synchronously during HTML parse. Stashes the event for the app to consume. `e.preventDefault()` suppresses the browser's default mini-infobar. The hook's fallback listener handles first-visit timing (SW registers after mount). Neither alone covers both cases.

**The window key must match on both sides.** Use `window.__pwaInstallPromptEvent` in the inline script *and* in the consuming module — a mismatch silently loses the early capture, which is the entire reason the script exists.

**Consume and delete.** The consumer should read the event into module scope and `delete window.__pwaInstallPromptEvent`, so a stale event can't be prompted twice. That is why the durable `__pwaPromptCaptured` boolean exists: without it, a debug pill's "install prompt received" check reads false forever the moment the app mounts (a live false negative in graphiki today).

## Update Application Policy — fleet standard: auto-on-launch

Every devmade-ai PWA applies updates the same way. One model, no per-app tiering:

1. **Auto-apply at launch (default).** When the app starts and a new service worker is
   already **waiting** (`registration.waiting` present when registration first resolves),
   apply it immediately: skipWaiting → one reload, behind the app's brief "Updating…"
   affordance. This moment is always safe — the user hasn't typed anything yet.
2. **Defer mid-session.** An update that installs *while the app is open* (hourly poll,
   visibilitychange check) never force-reloads. Surface the app's existing banner/toast
   with an explicit "Restart now" action; otherwise the waiting worker persists and
   auto-applies on the **next launch**. A fresh deploy therefore converges in at most
   two visits — visit 1 installs + arms, visit 2 launch-applies — with zero risk to
   unsaved work.
3. **"Automatic updates" toggle.** A persisted user setting in the app's menu/settings
   surface, **default ON**. OFF = never auto-apply; every update waits for an explicit
   tap (the old `prompt` behavior). Storage key follows the repo's key convention
   (e.g. `graphiki:pwaAutoUpdate`, `kl-pwa-auto-update`, `intxt_pwa_auto_update`),
   value `'true' | 'false'`, absent = ON, read through the repo's safeStorage wrapper.
   Plain-language label: "Automatic updates" with helper copy like "Updates apply
   automatically when the app opens."
4. **"Check for updates" action.** A menu/settings item everywhere. Runs
   `registration.update()` (plus the `version.json` comparison where the repo has one),
   waits a ~1500ms settle, and surfaces a typed result as a toast/banner. Canonical
   union: `'no-sw' | 'up-to-date' | 'update-available' | 'error'` — after the settle,
   read the update flag **or `registration.waiting`** to distinguish the middle two, and
   re-arm the banner if a waiting worker is found. Reading only the flag reports a false
   `'up-to-date'` to a user who dismissed the banner with "Later": the worker is still
   waiting, but nothing re-armed. Share one in-flight promise between concurrent calls so
   two menu taps don't race. Repos with an existing coarser union (`'done'`) should upgrade.

**Why this model (and not the alternatives):**
- *Immediate mid-session auto-apply* (plain `autoUpdate`): silently reloads while the
  user works — destroys unsaved designs/forms/drafts in the editor apps. Rejected as
  the fleet default.
- *Tap-only `prompt`*: users who never tap run stale code indefinitely. Real incident:
  canva-grid swapped its GA measurement ID and months later the **old** property was
  still receiving traffic from precached shells of never-updated clients. Rejected.
- *Auto-on-launch* keeps both guarantees: never reloads over in-progress work, and
  every client converges by its next visit.

**Implementation deltas on the singleton below** (the hook otherwise stays as written):

```typescript
// Persisted preference — default ON when absent.
// Read BACK after writing: private-browsing and locked-down profiles accept the
// call and drop the write. Silently failing here means the user turns auto-update
// OFF, believes it, and gets force-applied at the next launch anyway.
export function isAutoUpdateEnabled(): boolean {
  return safeGet(AUTO_UPDATE_KEY) !== 'false'
}
export function setAutoUpdateEnabled(on: boolean): boolean {
  safeSet(AUTO_UPDATE_KEY, String(on))
  notifyListeners()                              // never omit — the toggle label reads this
  return isAutoUpdateEnabled() === on            // false → surface "couldn't be saved"
}

// Launch eligibility is RECORDED in onRegisteredSW, but the apply runs from
// onNeedRefresh. Do NOT skipWaiting straight from onRegisteredSW.
let _launchApplyUntil = 0
let _launchHandled = false
const LAUNCH_APPLY_WINDOW_MS = 10_000

// onRegisteredSW(swUrl, r): only record eligibility.
if (r?.waiting && isAutoUpdateEnabled() && !wasJustUpdated()) {
  _launchApplyUntil = Date.now() + LAUNCH_APPLY_WINDOW_MS
}

// onNeedRefresh(): launch-apply if still inside the window, else arm the banner.
if (!_launchHandled && Date.now() < _launchApplyUntil) {
  _launchHandled = true                // once-guard: StrictMode double-mounts,
  _hasUpdate = false                   // and 'waiting' can land before registration resolves
  _userClickedUpdate = true            // reuse the controllerchange reload latch
  markUpdateApplied()                  // 30s false-re-detection suppression
  updateServiceWorker(true)
  return
}
_hasUpdate = true                      // mid-session: arm the banner only. No reload.
notifyListeners()
```

**Why the apply must run from `onNeedRefresh`, not `onRegisteredSW`:** in vite-plugin-pwa's prompt-mode client the reload-on-`controlling` listener is installed *inside* the `'waiting'` handler — the same handler that calls `onNeedRefresh`. workbox-window dispatches `'waiting'` for an already-waiting worker on a ~200 ms timer. Calling `updateServiceWorker(true)` (or posting `SKIP_WAITING`) straight from `onRegisteredSW` can therefore skipWaiting *before any reload listener exists*, leaving the user on a stale page under the new worker. Found independently in glow-props, qi-invoice, and kl-website.

If you do post `SKIP_WAITING` manually instead of calling `updateServiceWorker(true)`, attach your `controllerchange` listener **synchronously at init**, before any callback can fire — an effect-mounted listener loses the same race.

**Related echo:** workbox-window also fires `onNeedRefresh` for a worker that was already waiting before `register()` (`wasWaitingBeforeRegister`). That can land before your registration handler runs and arm the banner for a frame before the launch-apply reload; clearing `_hasUpdate` inside the launch-apply branch (above) covers it. When the preference is OFF, arm the banner explicitly rather than relying on the echo.

**Custom-SW repos (Expo/Metro):** identical semantics over their own plumbing —
launch-apply posts `SKIP_WAITING` to `registration.waiting` at startup; a `version.json`
mismatch found during the startup check triggers one plain reload guarded by a
sessionStorage one-shot flag (never loop). Mid-session detections arm the existing
update button/banner only.

**Migration note:** moving a deployed app from `autoUpdate` (or from immediate
auto-apply) to this model is safe — installed clients still converge at their next
launch. The long-standing warning below about `autoUpdate` → tap-only `prompt` remains
true; auto-on-launch is exempt because launch-apply preserves unattended convergence.

## Service Worker Updates (`usePWAUpdate.ts`)

Wraps `vite-plugin-pwa`'s React hook. Exposes `hasUpdate`, `update()`, `checkForUpdate()`, and `checking` state. Checks for new SW versions every 60 minutes and on visibility change (when tab regains focus).

**Architecture: Module-level singleton** — all SW state lives at module scope, not in React state. This solves a real bug: hook-local state re-initializes on component remount, re-triggering `register()` and causing "update available" to re-appear after navigation. The singleton pattern with pub/sub listeners preserves state across mounts.

**Prefer `useSyncExternalStore` over the `forceRender` listener.** The hook below uses `const [, forceRender] = useState(0)` because it predates React 18. An external mutable store React has to observe is exactly what `useSyncExternalStore` exists for; under React 19 concurrent rendering the force-render form is the textbook tearing setup, and it needs an on-mount resync hack to catch a `notify()` landing between first render and the passive effect. Use it instead (qi-invoice, kl-website):

```typescript
// Singleton exposes an immutable snapshot + subscribe; the hook is three lines.
export function usePWAUpdate() {
  return useSyncExternalStore(subscribePwa, getPwaSnapshot, getServerSnapshot)
}
```

`getSnapshot` must return a **stable** object — rebuild it only when state actually changes, or React re-renders forever. The third argument is the SSR-safe snapshot (see "Framework variants"). Keeping the policy logic in a plain module and the hook this thin is also what makes the whole thing testable (see "Testing").

```typescript
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { debugAdd } from '../utils/debugLog'

const CHECK_INTERVAL_MS = 60 * 60 * 1000

type CheckResult = 'no-sw' | 'up-to-date' | 'update-available' | 'error'

// Module-level state — survives component remounts
let _registration: ServiceWorkerRegistration | undefined
let _hasUpdate = false
let _userClickedUpdate = false
let _checkPromise: Promise<CheckResult> | null = null
const _listeners = new Set<() => void>()

function notifyListeners() { _listeners.forEach(fn => fn()) }

// 30-second suppression after applying an update — prevents false re-detection
// when the browser's SW lifecycle hasn't fully settled after reload.
function wasJustUpdated(): boolean {
  try {
    const ts = sessionStorage.getItem('pwa-update-applied')
    if (!ts) return false
    return Date.now() - Number(ts) < 30_000
  } catch { return false }
}

export function usePWAUpdate() {
  const [, forceRender] = useState(0)   // prefer useSyncExternalStore — see above
  const [checking, setChecking] = useState(false)

  const { updateServiceWorker } = useRegisterSW({
    // onRegisteredSW, not the deprecated onRegistered.
    onRegisteredSW(swUrl, r) {
      if (r) {
        _registration = r
        debugAdd('pwa', 'info', 'Service worker registered')
        // Launch-apply eligibility is recorded here; the apply itself runs in
        // onNeedRefresh (see Update Application Policy).
      }
    },
    onNeedRefresh() {
      // Still RECORD the update inside the suppression window — a manual
      // "Check for updates" during those 30s must not report "up-to-date".
      _hasUpdate = true
      if (wasJustUpdated()) return          // suppress the BANNER only
      debugAdd('pwa', 'info', 'New version available')
      notifyListeners()
    },
    onOfflineReady() {
      debugAdd('pwa', 'success', 'App ready for offline use')
    },
    onRegisterError(error) {
      debugAdd('pwa', 'error', 'SW registration failed', { error: String(error) })
    },
  })

  // Sync module state to React
  useEffect(() => {
    const listener = () => forceRender(n => n + 1)
    _listeners.add(listener)
    return () => { _listeners.delete(listener) }
  }, [])

  // Hourly poll — one mount-scoped interval that reads the module registration
  // dynamically. (Creating it inside onRegisteredSW leaks if registration
  // resolves after unmount, and needs a clear-before-reset dance.)
  // ALWAYS .catch(): registration.update() REJECTS when offline, which is
  // routine for an installed PWA. Bare calls throw an unhandled rejection on
  // every poll — and in repos that report rejections, spam analytics with it.
  useEffect(() => {
    const id = setInterval(() => {
      _registration?.update().catch(() => { /* offline — retried next tick */ })
    }, CHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  // Visibility-based update checks — catches updates when user returns to tab.
  // Throttled: tab-switching fires this rapidly and would hammer the server.
  useEffect(() => {
    let lastCheck = 0
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible' || !_registration) return
      if (Date.now() - lastCheck < 60_000) return
      lastCheck = Date.now()
      _registration.update().catch(() => { /* offline — benign */ })
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // controllerchange reload guard — auto-reload once when new SW takes control,
  // but ONLY if the user explicitly clicked "Update"
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    let refreshing = false
    const handleController = () => {
      if (refreshing || !_userClickedUpdate) return
      refreshing = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', handleController)
    return () => navigator.serviceWorker.removeEventListener('controllerchange', handleController)
  }, [])

  const update = useCallback(() => {
    _userClickedUpdate = true
    debugAdd('pwa', 'info', 'User triggered update')
    try { sessionStorage.setItem('pwa-update-applied', String(Date.now())) } catch {}
    // If the waiting worker is gone (another tab applied it, or the browser
    // discarded it), updateServiceWorker(true) has nothing to skipWaiting on
    // and never reloads — the Update button silently dead-ends. Plain-reload
    // instead. Same fallback applies when only version.json detected the change.
    if (_registration && !_registration.waiting) {
      window.location.reload()
      return
    }
    updateServiceWorker(true)
  }, [updateServiceWorker])

  // Manual "Check for updates" — canonical typed result for toast feedback.
  // Re-entrancy: two menu taps share one in-flight check rather than racing.
  const checkForUpdate = useCallback(async (): Promise<CheckResult> => {
    if (_checkPromise) return _checkPromise
    if (!_registration) return 'no-sw'
    setChecking(true)
    _checkPromise = (async () => {
      try {
        await _registration!.update()
        // 1500ms settle delay for async SW lifecycle events
        await new Promise(r => setTimeout(r, 1500))
        // Read the flag OR the waiting worker — a "Later"-dismissed update is
        // still waiting even though nothing re-armed hasUpdate.
        if (_hasUpdate || _registration!.waiting) {
          _hasUpdate = true
          notifyListeners()
          return 'update-available' as const
        }
        return 'up-to-date' as const
      } catch (e) {
        debugAdd('pwa', 'error', 'Update check failed', { error: String(e) })
        return 'error' as const
      } finally {
        setChecking(false)
        _checkPromise = null
      }
    })()
    return _checkPromise
  }, [])

  return {
    // NOT `_hasUpdate || needRefresh`. The wrapper's needRefresh is set by
    // workbox-window on EVERY waiting event, bypassing both wasJustUpdated()
    // suppression and the silent launch-apply path — the banner flashes anyway.
    hasUpdate: _hasUpdate,
    update,
    checkForUpdate,
    checking,
  }
}
```

**`'no-sw'` covers three different truths** and deserves three messages: registration failed outright (`onRegisterError` fired — "try again in a moment" would be a lie forever), registration is still in flight (the first second of page life — blaming the browser here is wrong), or the browser genuinely lacks service worker support. glow-props' `checkForUpdates()` is the reference.

**Surface update failures.** `updateServiceWorker(true)` can reject; if the banner doesn't handle it the user stares at a stuck "Updating…". Await the apply, and on rejection show "Update failed — please try again" and re-enable the button (see-veo's `UpdatePrompt`).

**Offline-ready notifications** are handled by the Toast system (see below) rather than tracked in this hook. When the app goes offline-ready, show a toast via `useToast().addToast('Ready to work offline', { type: 'success', duration: 3000 })`.

## Install Detection (`usePWAInstall.ts`)

Captures `beforeinstallprompt` (consuming the early-captured event from `index.html`), detects browser for manual install instructions, and provides a data-driven `getInstallInstructions()` function. Hides prompt when already installed or dismissed.

```typescript
// Requirement: PWA install prompt with browser-specific fallback instructions.
// Approach: Capture beforeinstallprompt via inline script in index.html (fires before
//   React mounts), then this hook reads window.__pwaInstallPrompt on mount. For browsers
//   that don't support beforeinstallprompt (Safari, Firefox), show manual install steps.
// Alternatives:
//   - Capture event in React only: Rejected — race condition on cached SW repeat visits
//     where the event fires before React mounts and is lost.
//   - Skip non-Chromium browsers: Rejected — Safari/Firefox users can still install PWAs
//     manually; showing instructions is better than hiding the feature.

import { useState, useEffect, useMemo } from 'react'
import { debugAdd } from '../utils/debugLog'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type BrowserType =
  | 'chrome' | 'edge' | 'brave' | 'opera' | 'samsung' | 'vivaldi' | 'arc'
  | 'safari' | 'firefox' | 'unknown'

// Chromium browsers that support beforeinstallprompt — exported for reuse
// by install hooks, diagnostics, and analytics.
export const CHROMIUM_BROWSERS: BrowserType[] =
  ['chrome', 'edge', 'brave', 'opera', 'samsung', 'vivaldi', 'arc']

export interface InstallInstructions {
  browser: string
  steps: string[]
  note?: string
}

// Module-level — survives remounts. Consume the early-captured event at module
// scope and DELETE the global: seeding state initializers from it (rather than
// setState inside an effect) also avoids react-hooks v7's set-state-in-effect
// lint. The inline script leaves __pwaPromptCaptured behind for diagnostics.
let deferredPrompt: BeforeInstallPromptEvent | null = (() => {
  const early = (window as any).__pwaInstallPromptEvent ?? null
  delete (window as any).__pwaInstallPromptEvent
  return early
})()

function detectBrowser(): BrowserType {
  const ua = navigator.userAgent

  // Brave: Check navigator.brave existence first.
  // Bug: Brave Mobile strips "Brave" from the UA string (confirmed 2026-03-07).
  // Use existence check as primary, not async call or UA match.
  if ('brave' in navigator) return 'brave'

  // iOS browser tokens FIRST. Chrome iOS is "CriOS", Firefox iOS "FxiOS",
  // Edge iOS "EdgiOS" — none contain "Chrome"/"Firefox", but all contain
  // "Safari". Without these three checks every one of them classifies as
  // 'safari', so the iOS non-Safari redirect below never fires for exactly
  // the browsers it was written for, and those users get told to tap a Share
  // button that isn't where the copy says it is.
  if (/CriOS/i.test(ua)) return 'chrome'
  if (/FxiOS/i.test(ua)) return 'firefox'
  if (/EdgiOS/i.test(ua)) return 'edge'

  if (/Firefox/i.test(ua)) return 'firefox'
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua) && !/Chromium/i.test(ua)) return 'safari'
  if (/SamsungBrowser/i.test(ua)) return 'samsung'
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return 'opera'
  if (/Vivaldi/i.test(ua)) return 'vivaldi'
  if (/Arc\//i.test(ua)) return 'arc'
  if (/Edg\//i.test(ua)) return 'edge'
  if (/Chrome/i.test(ua) || /Chromium/i.test(ua)) return 'chrome'
  return 'unknown'
}

// Display names for UI — separate from detection logic
const BROWSER_DISPLAY_NAMES: Record<BrowserType, string> = {
  chrome: 'Google Chrome', edge: 'Microsoft Edge', brave: 'Brave',
  opera: 'Opera', samsung: 'Samsung Internet', vivaldi: 'Vivaldi',
  arc: 'Arc', safari: 'Safari', firefox: 'Firefox', unknown: 'Your Browser',
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as any).standalone === true
}

export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false)
  const [showManualInstructions, setShowManualInstructions] = useState(false)

  const browser = useMemo(() => detectBrowser(), [])
  const isInstalled = useMemo(() => isStandalone(), [])

  const supportsAutoInstall = CHROMIUM_BROWSERS.includes(browser)
  const supportsManualInstall = browser === 'safari' || browser === 'firefox'

  useEffect(() => {
    if (isInstalled) { setCanInstall(false); return }

    // The early-captured event was already consumed at module scope above.
    if (deferredPrompt) setCanInstall(true)

    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt = e as BeforeInstallPromptEvent
      setCanInstall(true)
    }

    const installedHandler = () => {
      setCanInstall(false)
      deferredPrompt = null
      trackInstallEvent('installed')
    }

    // Detect installation via browser menu (not the native prompt)
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const displayHandler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setCanInstall(false)
        trackInstallEvent('installed-via-browser')
      }
    }
    mediaQuery.addEventListener('change', displayHandler)

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)

    // For Safari/Firefox: show manual instructions after 1s if no native prompt
    const timeout = setTimeout(() => {
      if (!deferredPrompt && !isInstalled && supportsManualInstall) {
        setShowManualInstructions(true)
      }
    }, 1000)

    // 5-second diagnostic timeout: on Chromium browsers, if beforeinstallprompt
    // hasn't fired, log a warning with manifest/SW status to help debug
    const diagnosticTimeout = setTimeout(() => {
      if (!deferredPrompt && !isInstalled && supportsAutoInstall) {
        const hasManifest = !!document.querySelector('link[rel="manifest"]')
        const hasSW = !!navigator.serviceWorker?.controller
        const isStandaloneAlready = isStandalone()
        debugAdd('pwa', 'warn', 'beforeinstallprompt not received after 5s', {
          browser, hasManifest, hasSW, isStandaloneAlready,
        })
        // Chrome suppresses the prompt for 90 days after dismissal —
        // show manual instructions as fallback
        if (!deferredPrompt && supportsAutoInstall) {
          setShowManualInstructions(true)
        }
      }
    }, 5000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
      mediaQuery.removeEventListener('change', displayHandler)
      clearTimeout(timeout)
      clearTimeout(diagnosticTimeout)
    }
  }, [isInstalled, supportsManualInstall, supportsAutoInstall, browser])

  // Track 'prompted' exactly once, whichever path captured the event. Tracking
  // it only inside the late handler above misses every repeat visit — i.e. the
  // exact case the inline script exists for — so funnel conversion reads wrong.
  const promptedTracked = useRef(false)
  useEffect(() => {
    if (canInstall && !promptedTracked.current) {
      promptedTracked.current = true
      trackInstallEvent('prompted')
    }
  }, [canInstall])

  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) return false
    // The event is SINGLE-USE: once prompt() is called it is spent, whatever
    // the outcome. Clearing only on 'accepted' means the next tap after a
    // dismissal calls prompt() on a spent event, which throws — and a fast
    // double-tap does the same. Clear FIRST, then prompt.
    const prompt = deferredPrompt
    deferredPrompt = null
    setCanInstall(false)
    try {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') return true
      trackInstallEvent('dismissed')   // the native prompt was dismissed
      setShowManualInstructions(true)  // one mis-tap must not remove the only
      return false                     // way to install for the rest of the visit
    } catch (e) {
      debugAdd('pwa', 'error', 'Install prompt failed', { error: String(e) })
      trackInstallEvent('install-failed')
      setShowManualInstructions(true)
      return false
    }
  }

  // Data-driven install instructions — the modal just renders whatever this returns.
  // Covers 7 Chromium browsers + Safari (iOS/macOS) + Firefox (mobile/desktop) + Samsung.
  const getInstallInstructions = (): InstallInstructions => {
    // iPadOS 13+ reports itself as a Mac. Without the maxTouchPoints check,
    // iPad users get macOS "File → Add to Dock" steps, which don't exist there.
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    const isMobile = isIOS || /Android/i.test(navigator.userAgent)

    // iOS non-Safari browsers cannot install PWAs — redirect to Safari
    if (isIOS && browser !== 'safari') {
      return {
        browser: `${BROWSER_DISPLAY_NAMES[browser]} (iOS)`,
        steps: [
          'Open this page in Safari (iOS requires Safari for PWA installation)',
          'Tap the Share button (square with arrow) at the bottom of the screen',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" in the top right corner',
        ],
        note: 'On iOS, only Safari can install web apps to the home screen. Chrome, Firefox, and other browsers on iOS use Safari\'s engine but cannot trigger PWA installation.',
      }
    }

    switch (browser) {
      case 'safari':
        if (isIOS) {
          return {
            browser: 'Safari (iOS)',
            steps: [
              'Tap the Share button (square with arrow) at the bottom of the screen',
              'Scroll down and tap "Add to Home Screen"',
              'Tap "Add" in the top right corner',
            ],
          }
        }
        return {
          browser: 'Safari (macOS)',
          steps: [
            'Click File in the menu bar',
            'Select "Add to Dock..."',
            'Click "Add" to confirm',
          ],
        }
      case 'firefox':
        if (isMobile) {
          return {
            browser: 'Firefox (Mobile)',
            steps: [
              'Tap the menu button (three dots)',
              'Tap "Add to Home screen"',
              'Tap "Add" to confirm',
            ],
          }
        }
        return {
          browser: 'Firefox (Desktop)',
          steps: [
            'Firefox desktop does not support PWA installation',
            'For the best experience, use Chrome, Edge, or Brave',
            'Alternatively, bookmark this page for quick access',
          ],
          note: 'Firefox removed PWA support for desktop in 2021.',
        }
      case 'brave':
        return {
          browser: 'Brave',
          steps: [
            'Click the install icon in the address bar (computer with down arrow)',
            'Or click the menu (≡) → "Install App..."',
            'Click "Install" to confirm',
          ],
          note: 'If the install option doesn\'t appear, check that Brave Shields isn\'t blocking it.',
        }
      case 'samsung':
        return {
          browser: 'Samsung Internet',
          steps: [
            'Tap the download icon in the address bar',
            'Or tap the menu (≡) → "Add page to" → "Home screen"',
            'Tap "Install" to confirm',
          ],
        }
      case 'opera':
        return {
          browser: 'Opera',
          steps: [
            'Tap the menu (⋮) → "Add to Home screen"',
            'Tap "Add" to confirm',
          ],
        }
      case 'vivaldi':
      case 'arc':
      case 'chrome':
      case 'edge':
        return {
          browser: BROWSER_DISPLAY_NAMES[browser],
          steps: [
            'Click the install icon in the address bar (computer with down arrow)',
            'Or click the menu (⋮) → "Install App..."',
            'Click "Install" to confirm',
          ],
        }
      default:
        return {
          browser: 'Your Browser',
          steps: [
            'Look for an "Install" or "Add to Home Screen" option in your browser menu',
            'For the best experience, use Chrome, Edge, or Brave',
          ],
        }
    }
  }

  return {
    canInstall, install, browser, isInstalled,
    showManualInstructions, setShowManualInstructions,
    supportsAutoInstall, getInstallInstructions,
  }
}

// --- Install analytics (optional) ---
// Track install funnel events in localStorage, capped at 50 entries.
// Useful for understanding install conversion without external analytics.
function trackInstallEvent(
  event: 'prompted' | 'installed' | 'dismissed' | 'install-failed'
    | 'instructions-viewed' | 'installed-via-browser'
) {
  try {
    const key = 'pwa-install-events'
    const events = JSON.parse(localStorage.getItem(key) || '[]')
    events.push({ event, timestamp: new Date().toISOString(), browser: detectBrowser() })
    if (events.length > 50) events.splice(0, events.length - 50)
    localStorage.setItem(key, JSON.stringify(events))
  } catch { /* best effort */ }
}
```

**Key design decisions:**
- **`CHROMIUM_BROWSERS` constant** — single source of truth for which browsers support `beforeinstallprompt`. Shared by install hook, diagnostics, and analytics.
- **7 Chromium browsers detected** — Chrome, Edge, Brave, Opera, Samsung, Vivaldi, Arc. Brave Mobile strips "Brave" from the UA string — use `'brave' in navigator` existence check, not UA match.
- **iOS non-Safari cross-redirect** — Chrome/Firefox/Edge on iOS cannot install PWAs. Instructions explicitly tell users to open in Safari and explain WHY.
- **`deferredPrompt` is module-level** — survives React remounts. The inline script in `index.html` captures it before React mounts (repeat visits), the `useEffect` fallback handles first visits.
- **5-second diagnostic timeout** — on Chromium browsers, if `beforeinstallprompt` hasn't fired, log a warning with manifest/SW status. Chrome suppresses the prompt for 90 days after dismissal — fall back to manual instructions.
- **Display-mode change listener** — detects installation via browser menu (not the native prompt) by watching `matchMedia('(display-mode: standalone)')` changes.
- **Install analytics** — localStorage-based event log tracking prompted/installed/dismissed/instructions-viewed, capped at 50 entries.
- **`getInstallInstructions()` returns data, not JSX** — the modal renders whatever it gets. Adding a new browser variant is one switch case, not a new component.

### Where PWA lifecycle events go

The snippets above call `debugAdd` directly. Two variations matter:

- **Repos with a DEV-gated debug system** (glow-props): production modules must never *import* the debug subsystem, or it ships in the bundle. Reach it through an optional `window.__debugAdd` bridge that is simply null in production. Don't mirror `console.warn` call sites into it either — the debug store already intercepts console, so mirroring double-logs.
- **Repos with no debug system at all** (kl-website, by design — a consumer app): `onRegisterError` still needs to reach *somewhere*, or SW registration failures are invisible in the field. Route it to whatever analytics channel exists, with redaction: strip query strings and fragments from URLs, truncate to a few hundred characters, use fixed source labels. Note also that the localStorage install-funnel block is deliberately **optional** — for a privacy-sensitive app (an anonymous tip line, say), even a local event log is surface area worth declining.

## Toast System (`Toast.tsx`)

Context-based toast notification system. Used for PWA events (offline ready, update applied) and general app feedback (save, export, errors). Replaces one-off DOM-injected banners with a reusable pattern.

```typescript
// Requirement: Non-blocking feedback notifications for user actions.
// Approach: Context provider + useToast hook. Stacking, auto-dismiss, exit animation.
// Alternatives:
//   - Browser alert(): Rejected — blocks UI, jarring.
//   - Third-party library (react-hot-toast): Rejected — adds dependency for simple feature.

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: number
  message: string
  type: ToastType
  duration: number
}

interface ToastContextType {
  addToast: (message: string, options?: { type?: ToastType; duration?: number }) => number
  removeToast: (id: number) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

let toastId = 0
const nextToastId = () => { toastId = (toastId + 1) % Number.MAX_SAFE_INTEGER; return toastId }

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, { type = 'info', duration = 3000 } = {}) => {
    const id = nextToastId()
    setToasts(prev => [...prev, { id, message, type, duration }])
    return id
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}
```

**ToastItem** handles auto-dismiss with exit animation:

```typescript
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (toast.duration <= 0) return
    const timer = setTimeout(() => setIsExiting(true), toast.duration)
    return () => clearTimeout(timer)
  }, [toast.duration])

  useEffect(() => {
    if (!isExiting) return
    const timer = setTimeout(() => onRemove(toast.id), 200) // exit animation duration
    return () => clearTimeout(timer)
  }, [isExiting, toast.id, onRemove])

  const typeStyles: Record<ToastType, string> = {
    success: 'bg-success text-success-content',
    error: 'bg-error text-error-content',
    info: 'bg-neutral text-neutral-content',
    warning: 'bg-warning text-warning-content',
  }

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium
        transition-all duration-200 pointer-events-auto ${typeStyles[toast.type]}
        ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
    >
      {/* Add type-specific SVG icons here */}
      <span>{toast.message}</span>
      <button onClick={() => setIsExiting(true)} className="ml-1 p-0.5 rounded hover:bg-white/20" aria-label="Dismiss">✕</button>
    </div>
  )
}

// The container is ALWAYS mounted and carries the single live region.
// A live region inserted into the DOM together with its first message is
// frequently not announced at all, and a per-toast live region inside it makes
// screen readers double-speak. One always-present announcer, many toasts.
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 -translate-x-1/2 z-[70] flex flex-col-reverse gap-2 max-w-sm w-full px-4 pointer-events-none empty:hidden"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
    >
      {toasts.map(toast => <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />)}
    </div>
  )
}
```

**Key design decisions:**
- **Context-based** — `useToast()` accessible from any component without prop drilling. Wrap `<App>` in `<ToastProvider>`.
- **Semantic theme colors** — if the app uses DaisyUI, `bg-success`/`bg-error` work across themes automatically; otherwise map these to the app's own status colors.
- **iOS safe area** — `env(safe-area-inset-bottom)` prevents toasts from being hidden behind the home indicator on notched iPhones.
- **One always-mounted live region** — never unmount the container when the list empties, and never put `role`/`aria-live` on individual toasts. Both break announcements (silence in the first case, double-speak in the second). `empty:hidden` + `pointer-events-none` keeps the always-present container invisible and click-through.
- **Stacking** — multiple toasts stack with `flex-col-reverse` (newest on top).
- **Exit animation** — 200ms fade-out before DOM removal for visual polish.
- **ID wraps at MAX_SAFE_INTEGER** — prevents overflow in long sessions.

## Install Instructions Modal (`InstallInstructionsModal.tsx`)

Data-driven modal that renders whatever `getInstallInstructions()` returns. Focus-trapped for accessibility. Includes benefits section to help non-technical users understand WHY to install.

```tsx
import { memo, useRef } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'
import type { InstallInstructions } from '../hooks/usePWAInstall'

interface Props {
  isOpen: boolean
  onClose: () => void
  instructions: InstallInstructions | null
}

export default memo(function InstallInstructionsModal({ isOpen, onClose, instructions }: Props) {
  const modalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(modalRef, isOpen)

  if (!isOpen || !instructions) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div ref={modalRef} className="relative bg-base-100 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 border border-base-300">
        {/* Header with icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            {/* Download icon SVG */}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-base-content">Install App</h2>
            <p className="text-sm text-base-content/70">{instructions.browser}</p>
          </div>
        </div>

        {/* Numbered steps — rendered from data, not separate components */}
        <ol className="space-y-2 mb-4">
          {instructions.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                {i + 1}
              </span>
              <span className="text-base-content pt-0.5">{step}</span>
            </li>
          ))}
        </ol>

        {/* Optional warning note (e.g., Brave Shields, Firefox desktop) */}
        {instructions.note && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-4">
            <p className="text-xs text-warning"><strong>Note:</strong> {instructions.note}</p>
          </div>
        )}

        {/* Benefits — helps non-technical users understand WHY to install */}
        <div className="border-t border-base-300 pt-4">
          <p className="text-xs text-base-content/70 mb-2">Benefits of installing:</p>
          <ul className="text-xs text-base-content/60 space-y-1">
            <li className="flex items-center gap-2">✓ Works offline</li>
            <li className="flex items-center gap-2">✓ Launches from your dock/home screen</li>
            <li className="flex items-center gap-2">✓ Full-screen experience without browser UI</li>
          </ul>
        </div>

        <button onClick={onClose} className="mt-4 w-full py-2 px-4 bg-primary text-primary-content rounded-lg font-medium hover:bg-primary/80">
          Got it
        </button>
      </div>
    </div>
  )
})
```

**Key design decisions:**
- **Data-driven rendering** — the modal doesn't know about browser types. It renders `instructions.steps`, `instructions.browser`, and optionally `instructions.note`. Adding a new browser is one switch case in `getInstallInstructions()`, not a new component.
- **Focus trap** — keyboard users can Tab within the modal without escaping to background content. Requires a `useFocusTrap` hook (see canva-grid's implementation).
- **Benefits section** — non-technical users don't know what a PWA is. Explaining "works offline, launches from dock, no browser chrome" gives them a reason to go through the steps.
- **Backdrop blur** — `backdrop-blur-sm` visually separates the modal from content. Click-to-dismiss on backdrop.

## Install & Update UI Patterns

**Where to surface install/update actions** depends on app layout:

| Pattern | When to use | Examples |
|---------|-------------|---------|
| **Burger menu item** | App has a nav menu | canva-grid, glow-props |
| **Fixed bottom banner** | No nav menu, or high visibility needed | four-ems |
| **Inline button** | Fits within existing page layout | sync-tone |

**Update notifications** should use the Toast system for consistency:
- `hasUpdate` (mid-session) → show a persistent toast or inline banner with a "Restart now" / "Update" button; the update also applies automatically on next launch (see Update Application Policy)
- `offlineReady` → show auto-dismissing success toast (3s)

**Standard menu/settings items** (every PWA): "Automatic updates" toggle (default ON) and "Check for updates" action, alongside the existing "Install app" item. **Single-screen apps with no menu or settings surface** put the toggle inside the update banner itself (see-veo) — it is then visible exactly when the update system is, which beats inventing a settings screen for one control.

**Top-pinned banners need `env(safe-area-inset-top)`**, the mirror of the toast rule: `padding-top: max(0.625rem, env(safe-area-inset-top))`. Required in standalone mode with a `black-translucent` status bar, or the first line sits under the clock.

**Install flow:**
- `canInstall` (Chromium) → "Install" button calls `install()` which triggers native prompt
- `showManualInstructions` (Safari/Firefox) → "How to Install" opens `InstallInstructionsModal`
- Dismiss → persists to `localStorage('pwa-install-dismissed')`

## Fix: Timer Leaks on Unmount (Nested Timeouts)

Debounce patterns using `setTimeout` leak when a component unmounts mid-timeout. The nested case is worse: a timeout callback sets *another* timeout, and cleaning up only the outer one leaves the inner one orphaned — it fires after unmount, updating state or triggering side effects on a dead component.

**Broken:**
```typescript
useEffect(() => {
  const outer = setTimeout(() => {
    doSomething();
    const inner = setTimeout(() => save(), 500); // leaked
  }, 300);
  return () => clearTimeout(outer); // only clears outer
}, [value]);
```

**Fix — track all timeout IDs:**
```typescript
useEffect(() => {
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  const outer = setTimeout(() => {
    doSomething();
    const inner = setTimeout(() => save(), 500);
    timeouts.push(inner);
  }, 300);
  timeouts.push(outer);

  return () => timeouts.forEach(clearTimeout);
}, [value]);
```

**Alternative — mounted ref guard:**
```typescript
const mountedRef = useRef(true);
useEffect(() => () => { mountedRef.current = false; }, []);

// In any async/timeout callback:
if (!mountedRef.current) return;
```

**General rule:** Every `setTimeout`, `setInterval`, `addEventListener`, or `subscribe` call inside a `useEffect` needs a corresponding cleanup in the return function. If callbacks create *new* async operations, those need cleanup too.

## Cache Headers

Three independent caching layers interact: HTTP cache, service worker Cache Storage, and the browser's in-memory cache. Server-side headers form the first line of defense.

**Non-hashed files** (`index.html`, `sw.js`, `manifest.webmanifest`): serve with `Cache-Control: no-cache` (or `max-age=0, must-revalidate`). The browser revalidates on every request, using ETags for 304 efficiency. Never aggressively cache `index.html` — it references hashed asset filenames, so a stale `index.html` pointing to deleted chunks causes `ChunkLoadError` failures.

**Content-hashed assets** (`/assets/*.hash.js`, `/assets/*.hash.css`): serve with `Cache-Control: public, max-age=31536000, immutable`. The filename changes whenever content changes, so year-long caching is safe. The `immutable` directive prevents even revalidation on hard-refresh.

Vite generates content hashes by default. vite-plugin-pwa automatically configures Workbox's `dontCacheBustURLsMatching` to recognize these, so Workbox doesn't append redundant `?__WB_REVISION__` query parameters. For non-hashed files, Workbox generates an MD5 revision:

```js
// Hashed file — revision is null (hash IS the filename)
{ url: '/assets/main.a2b3c4.js', revision: null }
// Non-hashed file — Workbox generates a revision hash
{ url: '/index.html', revision: '518747aa' }
```

**NGINX example:**
```nginx
# Hashed assets — cache forever
location /assets/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
location /workbox- {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
# Everything else — revalidate every time
location / {
  add_header Cache-Control "no-cache";
}
```

**Vercel example** (`vercel.json`) — most of the fleet deploys here:
```json
{
  "headers": [
    { "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/workbox-(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/(index.html|sw.js|registerSW.js|manifest.webmanifest)",
      "headers": [{ "key": "Cache-Control", "value": "no-cache" }] }
  ],
  "rewrites": [{ "source": "/((?!assets/).*)", "destination": "/index.html" }]
}
```

Three Vercel-specific notes: include `registerSW.js` (emitted under some `injectRegister` settings) in the no-cache set; include `workbox-<hash>.js`, which sits at the root rather than under `/assets/` when `inlineWorkboxRuntime` is false; and **scope the SPA rewrite to exclude `/assets/`** — otherwise a deleted old chunk returns `index.html` with a JS MIME type instead of a clean 404, turning a recoverable `ChunkLoadError` into a confusing parse error. Vercel's framework defaults (`max-age=0, must-revalidate` + ETag) are safe but not optimal without the explicit `immutable` rule.

**GitHub Pages note:** GitHub Pages sets its own cache headers (~10 min max-age). You can't customize them, but the service worker precache layer handles staleness — the SW compares its manifest on each check and re-fetches changed files regardless of HTTP cache state.

## ChunkLoadError Prevention

The most common PWA deployment failure: user loads version A's `index.html` referencing `dashboard.ef45.js`, you deploy version B deleting old chunks, user navigates and gets a 404.

Service worker precaching prevents this — all chunks (including lazy-loaded ones) are downloaded into Cache Storage during the SW install phase. But for the window between deploy and SW update, or if the user has no SW yet, add a lazy-load retry wrapper:

```js
const lazyRetry = (importFn) => {
  return new Promise((resolve, reject) => {
    const hasRefreshed = JSON.parse(
      sessionStorage.getItem('retry-lazy-refreshed') || 'false'
    )
    importFn()
      .then(resolve)
      .catch((error) => {
        if (!hasRefreshed) {
          sessionStorage.setItem('retry-lazy-refreshed', 'true')
          window.location.reload()
        } else {
          reject(error)
        }
      })
  })
}

// Usage with React.lazy or dynamic import:
const Dashboard = lazy(() => lazyRetry(() => import('./Dashboard')))
```

If self-hosting without a CDN, keep previous build artifacts available for an overlap period after deploy.

## Custom Service Worker (Non-Vite Projects)

For Expo/Metro or other non-Vite build systems, vite-plugin-pwa cannot be used. Implement a hand-written service worker with pattern-based caching:

```javascript
// public/sw.js
const SW_BUILD = '__SW_BUILD_VERSION__' // replaced at build time
const STATIC_CACHE = `app-static-${SW_BUILD}`
const DYNAMIC_CACHE = `app-dynamic-${SW_BUILD}`

// Install: precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(['/', '/offline.html', '/manifest.json'])
    )
  )
})

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys
        .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
        .map((key) => caches.delete(key))
      )
    )
  )
})

// Fetch: three-tier strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Network-only: API calls (never cache)
  if (url.pathname.startsWith('/api/') || url.hostname !== location.hostname) return

  // Cache-first: fonts, images (static assets)
  if (/\.(woff2?|ttf|png|jpg|svg|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) =>
        cached || fetch(event.request).then((res) => {
          const clone = res.clone()
          caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone))
          return res
        })
      )
    )
    return
  }

  // Network-first: JS, CSS, HTML (dynamic content)
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone()
        caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, clone))
        return res
      })
      .catch(() => caches.match(event.request)
        .then((cached) => cached || caches.match('/offline.html'))
      )
  )
})
```

**Build-time version injection** (`scripts/inject-sw-version.mjs`): Replace `__SW_BUILD_VERSION__` with an ISO timestamp after build. Ensures byte-for-byte SW changes on every deployment without manual version bumping.

**Triple-layer `beforeinstallprompt` capture** for Expo:
1. **Inline script in `+html.tsx`** — runs during HTML parse, catches repeat-visit early fires
2. **Module-scope listener in `_layout.tsx`** — catches during initial app boot
3. **`useEffect` fallback in `usePWAInstall`** — catches late-firing events on first visit

## version.json Update Detection

Supplementary update mechanism independent of SW changes. Compares `buildTime` in a `version.json` file against localStorage. Handles the case where app bundles change but `sw.js` doesn't (no CACHE_VERSION bump needed):

```typescript
async function checkVersionUpdate(): Promise<boolean> {
  try {
    const res = await fetch('/version.json', { cache: 'no-store' })
    const { buildTime } = await res.json()
    const stored = localStorage.getItem('app-build-time')
    const changed = !!stored && stored !== buildTime
    // ALWAYS persist first, then report. Returning true before writing means
    // the same update is re-detected on every subsequent check, forever —
    // the banner reappears after each suppression window expires. Field bug,
    // found and fixed in fl-farlume; pin it with a test.
    localStorage.setItem('app-build-time', buildTime)
    return changed
  } catch { return false }
}
```

Generate `version.json` at build time with `{ "buildTime": "2026-04-06T12:00:00Z" }`.

**Throttle the fetches** to ~once a minute — `visibilitychange` fires rapidly while tab-switching — and run one check at initial load so a deploy that happened since the last visit arms the banner immediately.

**"Update now" must handle the version.json-only case.** When only `version.json` detected the change there may be no waiting worker at all, so `updateServiceWorker(true)` posts `SKIP_WAITING` to nothing and nothing reloads — the button silently no-ops in exactly the scenario version.json exists for. Fall back to a plain `window.location.reload()` (fl-farlume uses a 2s timer as the backstop; the `!registration.waiting` check in `update()` above is the direct form).

## Testing

The PWA layer is testable, and the riskiest behavior in it — launch-apply, an *unwanted reload* — is exactly what you want pinned. Two obstacles, both solved:

**1. The virtual module can't be imported under vitest.** `virtual:pwa-register/react` only resolves inside the plugin pipeline; Vite's import analysis rejects it *before* `vi.mock` can intercept. Map it to a concrete mock with an alias:

```typescript
// vitest.config.ts
resolve: { alias: { 'virtual:pwa-register/react': '/src/test/__mocks__/virtual-pwa-register-react.ts' } }
```

Then `vi.mock` that path to capture the callbacks (`onRegisteredSW`, `onNeedRefresh`, …) and hand back a fake registration, so a test can drive the whole lifecycle synchronously.

**2. Module-level singletons leak between tests.** Export a `_resetPwaStateForTesting()` that clears module state, or call `vi.resetModules()` for a fresh module per test — mandatory once state lives at module scope.

**Structure for testability:** keep the policy decisions (`handleRegistered` / `handleNeedRefresh` / `applyUpdate` / `checkForUpdate`) as pure functions in a plain module and let the hook be a thin `useSyncExternalStore` adapter. kl-website tests the entire decision matrix that way — launch-apply vs preference-off vs suppression window, the `wasWaitingBeforeRegister` echo, all four check results — with no live service worker.

**What to pin at minimum:** the "absent = ON, only literal `'false'` opts out" preference contract (a refactor flipping that default strands every installed client on tap-only); launch-apply firing exactly once; the suppression window; and `checkVersionUpdate` persisting before reporting.

## Tripwire: verify the built precache manifest

Source-level tests cannot see duplicate precache entries, `revision: null` on mutable files, or a collapsed manifest — all three are properties of the *built* `dist/sw.js`. Add a build-gated script (qi-invoice's `scripts/verify-precache.mjs`) that parses the emitted manifest and fails on:

1. **Duplicate URLs** — including two entries that coincidentally agree on revision. This is the `add-to-cache-list-conflicting-entries` SW-killer.
2. **`revision: null` on a non-hashed file** — the `dontCacheBustURLsMatching` trap; it can never be invalidated.
3. **A revision on a content-hashed file** — double-busting, harmless but signals config drift.
4. **Missing offline-critical entries** — enumerate the ones whose absence fails silently (fonts embedded by a PDF library, wasm, etc.).
5. **Manifest collapse** — fewer than N entries means something ate the glob.

Run it in the same gate as your other verify scripts, after `npm run build`.

## Framework variants

### Vue 3

The React singleton machinery exists to survive component remounts. In Vue the idiomatic fix is one line of architecture rather than a workaround: call `useRegisterSW` from `virtual:pwa-register/vue` at **module top level** and have the composable return the shared refs. No listener set, no force-render, no re-registration on remount.

```typescript
// composables/usePWAUpdate.ts — module scope IS the singleton
const { needRefresh, updateServiceWorker } = useRegisterSW({ immediate: true, /* … */ })
export function usePWAUpdate() { return { needRefresh, updateServiceWorker, /* … */ } }
```

Three consequences:
- **Suppression works differently.** The Vue binding sets `needRefresh` itself, so a `return` inside `onNeedRefresh` can't stop it. `watch` the ref and reset it to `false` inside the 30s window instead.
- **HMR discipline is mandatory.** Module scope means dev HMR re-runs the module. Guard listener attachment behind `window.__pwaUpdateAttached` / `__pwaInstallAttached` and release listeners, intervals, media-query subscriptions and timers in `import.meta.hot.dispose()` (TIMER_LEAKS.md variants 4 + 5). React hooks get this free from effect cleanup; every module-singleton consumer — Vue *or* vanilla, including the glow-props reference — must do it explicitly.
- **Types:** add `/// <reference types="vite-plugin-pwa/client" />`; `virtual:pwa-register/vue` returns refs, not tuples.

For tests, mock `virtual:pwa-register/vue` the same way, with `vi.resetModules()` between cases.

### SSR / prerendered (SSG) apps

If any component that reads PWA state is rendered at build time or on a server, three rules apply:

1. **The server entry must never import the PWA module.** It calls `registerSW()` on import and needs `virtual:pwa-register`, which only resolves in the full plugin pipeline — importing it fails deep inside the SSG pass with a confusing error. Route state to SSR-rendered components through a context whose **default value is the SSR-safe shape**, so a build-time render falls through to markup identical to the pre-hydration client UI.
2. **`getServerSnapshot`** is the third argument to `useSyncExternalStore` — return the same SSR-safe snapshot.
3. **Mind the build-step ordering.** If pages are prerendered *after* `vite build`, Workbox has already generated the SW and never sees those HTML files — they aren't precached, and SW-controlled clients get the shell via `navigateFallback` while crawlers get the static file. That is a legitimate hybrid (kl-website relies on it), but the ordering is load-bearing: document it, or a future "tidy the build script" change silently breaks either offline or SEO.

Consider a static check that the server entry's import graph never reaches the PWA module — comments alone don't survive an indirect import through a shared component.

## Platform Gotchas

**Safari aggressive caching:** On iOS, backgrounding a PWA doesn't truly close it — the service worker and cached state persist. Users may not see updates for days. The periodic `registration.update()` interval (see Service Worker Updates section) is critical for Safari users.

**Navigation overlap prevents activation:** Even refreshing a page doesn't activate a waiting service worker because the browser keeps the old page alive until response headers arrive for the new navigation. This is why `skipWaiting()` via `postMessage` exists — without it, users would have to close *every tab* before the new SW activates. The `updateServiceWorker(true)` call handles this.

**Workbox timing heuristic:** If you rebuild and re-register the service worker within one minute of the last registration, `workbox-window` treats the update as an "external event" rather than a normal update, potentially showing "offline ready" instead of "update available." Always test with full production builds served from a static file server.

**Never switch `autoUpdate` → tap-only `prompt` in production:** Users who already have the auto-updating SW installed will never see the prompt-based code — the old SW silently replaces itself before the new registration logic runs. Switching `autoUpdate` → **auto-on-launch** is safe: launch-apply preserves unattended convergence (see Update Application Policy).

**Android standalone `100dvh` latches after the update reload:** in an installed Android PWA, the `controllerchange` reload that applies an update can leave `100dvh` measuring too tall — a bottom nav ends up pushed off-screen until the user fully relaunches the app. This is caused *by* the pattern's own reload mechanism. Fix: publish a measured `window.innerHeight` as a `--app-height` CSS variable (with `100dvh` as the fallback value), refreshed on `pageshow`/`visibilitychange`/`orientationchange` plus rAF/150ms/600ms settle reads. Track `resize` on desktop only, or the Android soft keyboard collapses the shell. graphiki's `src/utils/appHeight.ts` is the reference.

**`share_target` with `method: 'POST'` needs a real SW fetch handler:** generateSW does not provide one, and a static host receiving the POST navigation either fails or drops the shared file. Declaring it in the manifest without `injectManifest` (or an equivalent runtime POST handler plus client-side consumption) ships a feature that looks wired and isn't — fl-farlume has this half-wired today. Either implement the handler or leave it out of the manifest.

**`apple-touch-startup-image` needs real splash images:** it takes exact device-sized images selected by media queries. Pointing it at a 180px touch icon (a common copy-paste) is ignored or mis-rendered — omit it unless you generate the full set.

**Expo Web incompatibility:** vite-plugin-pwa is not compatible with Expo Web (Expo Router uses Metro, not Vite). For Expo Web PWAs, use `workbox-cli generateSW` as a post-build step and manually wire up SW registration and update detection.

## Key Lessons

### Icons & Manifest
1. **Never combine `"any maskable"` in icon purpose** — use separate entries: a dedicated 1024x1024 maskable, or maskable at 192 + 512 (the sizes install criteria actually request).
2. **Set `id` explicitly** in the manifest — Chrome derives it from `start_url` otherwise.
3. **400 DPI rasterization** — Sharp renders the SVG at ~5.5x the coordinate space before downscaling, so edges are anti-aliased from high-res source data instead of the default 72 DPI. The 192px PWA icon benefits most.
4. **`shape-rendering="geometricPrecision"`** — tells the SVG rasterizer to prioritize accurate geometry over rendering speed. Add to the root `<svg>` element.

### Install Prompt
5. **The inline script in `index.html` is essential** — without it, repeat visitors on Chromium lose the install prompt.
6. **`deferredPrompt` must be module-level** — survives React remounts. The inline script captures it before React mounts; the `useEffect` fallback handles first visits.
7. **Classify the Chromium family correctly** — Chrome, Edge, Brave, Opera, Samsung, Vivaldi, Arc, via the `CHROMIUM_BROWSERS` constant. Per-browser install *steps* are a nicety; correct capability classification is the requirement (a repo may legitimately collapse the seven into coarser buckets, since Opera/Vivaldi/Arc/Samsung all carry `Chrome/` in the UA).
8. **Brave Mobile strips "Brave" from UA** — use `'brave' in navigator` existence check as primary detection, not UA string matching.
9. **iOS non-Safari browsers can't install PWAs** — explicitly redirect users to Safari with explanation. This requires detecting `CriOS`/`FxiOS`/`EdgiOS` **before** the Safari check; those UAs contain "Safari" and none contain "Chrome"/"Firefox", so without it every one classifies as Safari and the redirect never fires.
10. **iPadOS 13+ reports as `MacIntel`** — add `navigator.maxTouchPoints > 1` to the iOS test, or iPads get macOS-only instructions.
11. **`beforeinstallprompt` is single-use** — clear it *before* calling `prompt()`, not on `'accepted'`. Otherwise a dismissal (or a fast double-tap) calls `prompt()` on a spent event and throws. Wrap in try/catch and fall back to manual instructions.
12. **Consume the early-captured event and delete the global** — same window key on both sides, and leave a durable boolean behind so diagnostics don't read a false negative.
13. **Track `'prompted'` once, wherever the event came from** — tracking it only in the late listener silently excludes every repeat visit, which is most of them.
14. **5-second diagnostic timeout** — if `beforeinstallprompt` hasn't fired on Chromium, log manifest/SW status and fall back to manual instructions. Chrome suppresses the prompt for 90 days after dismissal, and without the fallback those users get no install affordance at all.
15. **Install instructions should be data-driven** — `getInstallInstructions()` returns `{ browser, steps, note }`. The modal renders whatever it gets. One switch case per browser, not one component.
16. **Focus trap the install modal** — keyboard users must be able to Tab within the modal without escaping to background content.

### Service Worker Updates
17. **Auto-on-launch is the fleet update policy** — `registerType: 'prompt'` as the mechanism, auto-apply at launch + defer mid-session + "Automatic updates" toggle (default ON) + "Check for updates" action as the behavior. Raw `autoUpdate` reloads over unsaved work; tap-only prompt leaves stale clients forever (the canva-grid GA-tail incident).
18. **Launch-apply runs from `onNeedRefresh`, not `onRegisteredSW`** — the reload listener is installed inside workbox-window's `'waiting'` handler, so applying earlier can skipWaiting before anything is listening and strand the user on a stale page. Record eligibility at registration, apply on the refresh callback, guard it to fire once.
19. **Module-level singleton for update state** — survives component mount/unmount cycles. Hook-local state re-initializes on remount, causing false "update available" re-detection. Bridge it with `useSyncExternalStore`, not a force-render listener.
20. **Visibility-based update checks** — on `visibilitychange`, trigger `registration.update()` when the page regains focus. Throttle to ~1/minute; tab-switching fires it constantly.
21. **Always `.catch()` `registration.update()`** — it rejects whenever the client is offline, which is routine for an installed PWA. Bare calls throw unhandled rejections on every poll.
22. **`controllerchange` reload guard** — auto-reload when new SW takes control, but ONLY if the apply latch was set (user clicked "Update", or the launch-apply path set it). Prevents unexpected reloads from background SW lifecycle events, e.g. another tab updating. Attach it synchronously at init if you post `SKIP_WAITING` yourself.
23. **30-second `wasJustUpdated()` suppression** — prevents false re-detection after applying an update. Suppress the *banner*, but still record that an update exists, or a manual check inside the window lies "up-to-date".
24. **Manual `checkForUpdate()` with typed result** — `'no-sw' | 'up-to-date' | 'update-available' | 'error'`. Read the flag **or** `registration.waiting` after the settle so a "Later"-dismissed update re-arms, and share one in-flight promise between concurrent calls.
25. **"Update now" needs a plain-reload fallback** — with no waiting worker (another tab applied it, or version.json found the change), `updateServiceWorker(true)` has nothing to skip-wait and the button dead-ends silently.
26. **Read back preference writes** — private browsing accepts the write and drops it. A silently failed "Automatic updates: off" force-applies at the next launch against the user's explicit choice.
27. **Surface update failures** — a rejected apply must show "Update failed — please try again" and re-enable the button, not leave a stuck "Updating…".
28. **Log all PWA lifecycle events somewhere** — debug system where one exists (via a bridge, never a production import), otherwise a redacted analytics channel. `onRegisterError` in particular must not vanish.
29. **`cleanupOutdatedCaches: true`** — removes stale caches from older Workbox major versions. Set this in the workbox config.
30. **`globPatterns` must match your asset types** — default may miss fonts, images, or other static assets. Watch especially for assets fetched at feature-use time, whose absence fails silently offline.
31. **`globIgnores` the assets the app never fetches** — OG/social cards are scraper-only and otherwise tax every install.
32. **Workbox runtime caching for Google Fonts** — CacheFirst with 1-year TTL is universally useful.
33. **Exactly one precache source per URL** — a file matched by both `globPatterns` and `includeAssets` makes workbox throw inside the worker at runtime and precache *nothing*, while the build log still reports success.
34. **Narrow `dontCacheBustURLsMatching`** — its default marks everything under `assets/` as immutable, so plain-named files there can never be invalidated.
35. **Don't precache multi-MB opt-in assets** — runtime `CacheFirst` for lazy same-origin blobs, library-owned caches for model hubs, and remember `maximumFileSizeToCacheInBytes` silently drops anything over 2 MiB.

### Caching & Deployment
36. **`navigateFallback` is SPA-only** — for multi-page apps, omit it or navigation to non-index pages will break.
37. **Cache headers complement the SW** — `no-cache` on `index.html`/`sw.js`/`registerSW.js`/manifest, `immutable` on hashed assets. Scope SPA rewrites to exclude `/assets/`.
38. **`version.json` for non-SW updates** — supplementary detection for app changes that don't modify the service worker file. Persist the new build time *before* reporting a change, or it re-detects forever.
39. **Verify the built precache manifest** — duplicates, `revision: null` on mutable files, and manifest collapse are invisible to source-level tests.

### UI Patterns
40. **Use a context-based Toast system** — `ToastProvider` + `useToast()` replaces one-off DOM-injected banners. Reusable for PWA events and general app feedback.
41. **Use semantic theme colors for toasts** — e.g. with DaisyUI, `bg-success`/`bg-error` work across themes. Avoid hardcoding fixed colors like `bg-brand-600`.
42. **iOS safe areas on toasts/banners** — `env(safe-area-inset-bottom)` for bottom-pinned, `env(safe-area-inset-top)` for top-pinned.
43. **One always-mounted live region for toasts** — unmounting it swallows the first announcement; per-toast live regions double-speak.
44. **Manifest `theme_color` must match the default-theme meta** — Android standalone prefers the manifest value over the meta tags.

### Non-Vite Projects
45. **Custom SW with three-tier caching** — network-only for API, cache-first for static assets, network-first for dynamic content. Pattern-based routing is more explicit than Workbox config.
46. **Build-time SW version injection** — replace a placeholder with ISO timestamp post-build. Ensures cache name uniqueness per deployment.
47. **Triple-layer `beforeinstallprompt` capture** for Expo — inline script + module-scope listener + useEffect fallback.

### General
48. **Clean up all timers** — every `setTimeout`/`setInterval` in `useEffect` needs cleanup. Nested timeouts need the array pattern or mounted ref guard. Module-level singletons need an HMR attach guard plus `import.meta.hot.dispose()`.
49. **Test the policy, not the browser** — alias the virtual module, reset the singleton between cases, and pin launch-apply, the preference default, and the suppression window.
