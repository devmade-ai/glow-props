# PWA System

Four parts, built on `vite-plugin-pwa` (^1.2.0) with React. Adapt patterns for other frameworks (glow-props uses vanilla JS).

**React dependency note:** React projects using `virtual:pwa-register/react` require `workbox-window` as a dev dependency: `npm install -D workbox-window`. Add `/// <reference types="vite-plugin-pwa/react" />` to your type declarations.

## Vite Config (`vite.config.ts`)

```typescript
import { VitePWA } from 'vite-plugin-pwa'

// Inside defineConfig plugins array:
VitePWA({
  registerType: 'prompt',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
  workbox: {
    cleanupOutdatedCaches: true,
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    // SPA only — omit for multi-page apps:
    // navigateFallback: '/index.html',
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

- **`registerType: 'prompt'`**: Users control when updates apply. `autoUpdate` silently refreshes mid-work. **Never switch from `autoUpdate` to `prompt` in production** — users with the auto-updating SW already installed will never see the prompt-based code because the old SW silently replaces itself before the new registration logic runs.
- **`workbox.cleanupOutdatedCaches`**: Removes caches from incompatible older Workbox major versions. Without this, stale caches accumulate across deployments.
- **`workbox.globPatterns`**: Explicit precache patterns. The default may miss font or image types your app uses.
- **`navigateFallback`**: Only set for SPAs. For multi-page apps (multiple HTML entry points), omit this — it would incorrectly serve `index.html` for all navigation requests.
- **`id`**: Stable app identity. Without it, Chrome derives from `start_url` — breaks on config changes or redeployments.
- **`prefer_related_applications: false`**: Without this, Chrome may skip `beforeinstallprompt` if it thinks a native app exists.
- **Separate icon purposes**: `any` for standard display (192, 512), `maskable` for full-bleed (1024). Never combine `"any maskable"` — browsers pick the wrong one. Use a dedicated 1024x1024 for maskable.
- **`theme_color`**: Static fallback for the browser chrome. Overrides meta tags in Android PWA standalone mode.

## Install Prompt Race Condition (`index.html`)

`beforeinstallprompt` fires once. On repeat visits with a cached SW, it fires before the framework mounts — if nothing catches it, the install prompt is permanently lost.

Inline classic (non-module) script before any `<script type="module">`:

```html
<script>
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    window.__pwaInstallPromptEvent = e;
  });
</script>
```

Executes synchronously during HTML parse. Stashes the event for the React hook to consume. `e.preventDefault()` suppresses the browser's default mini-infobar. The hook's fallback `useEffect` listener handles first-visit timing (SW registers after mount). Neither alone covers both cases.

## Service Worker Updates (`usePWAUpdate.ts`)

Wraps `vite-plugin-pwa`'s React hook. Exposes `hasUpdate` boolean and `updateApp()`. Checks for new SW versions every 60 minutes. Offline-ready auto-dismisses after 3 seconds.

```typescript
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useEffect, useCallback } from 'react'

const CHECK_INTERVAL_MS = 60 * 60 * 1000

export function usePWAUpdate() {
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (registration) {
        setInterval(() => registration.update(), CHECK_INTERVAL_MS)
      }
    }
  })

  // Auto-dismiss offline-ready after 3s
  useEffect(() => {
    if (!offlineReady) return
    const t = setTimeout(() => setOfflineReady(false), 3000)
    return () => clearTimeout(t)
  }, [offlineReady, setOfflineReady])

  const updateApp = useCallback(() => {
    updateServiceWorker(true)
  }, [updateServiceWorker])

  return { hasUpdate: needRefresh, offlineReady, updateApp }
}
```

## Install Detection (`usePWAInstall.ts`)

Detects browser, captures `beforeinstallprompt` (consuming the early-captured event from `index.html`), tracks install analytics. Hides prompt when already installed or dismissed.

```typescript
import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type BrowserType = 'chrome' | 'edge' | 'brave' | 'safari-ios' | 'safari-macos'
  | 'firefox-android' | 'firefox-desktop' | 'unknown'

function detectBrowser(): BrowserType {
  const ua = navigator.userAgent
  if ((navigator as any).brave) return 'brave'
  if (/Edg\//i.test(ua)) return 'edge'
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return 'chrome'
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    return /iPhone|iPad|iPod/.test(ua) ? 'safari-ios' : 'safari-macos'
  }
  if (/Firefox/i.test(ua)) {
    return /Android/i.test(ua) ? 'firefox-android' : 'firefox-desktop'
  }
  return 'unknown'
}

function consumeEarlyCapturedEvent(): BeforeInstallPromptEvent | null {
  const win = window as unknown as Record<string, unknown>
  const captured = win.__pwaInstallPromptEvent as BeforeInstallPromptEvent | undefined
  if (captured) {
    delete win.__pwaInstallPromptEvent
    return captured
  }
  return null
}

const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  || (navigator as any).standalone === true

export function usePWAInstall() {
  const [browser] = useState(detectBrowser)
  const [deferredPrompt, setDeferredPrompt] = useState(consumeEarlyCapturedEvent)
  const [installed] = useState(isStandalone)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('pwa-install-dismissed') === 'true'
  )

  // Fallback listener — first-visit case where SW registers after mount
  useEffect(() => {
    if (deferredPrompt) return
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [deferredPrompt])

  // Diagnostic: warn if beforeinstallprompt hasn't fired after 5s on Chromium
  useEffect(() => {
    if (deferredPrompt || !['chrome', 'edge', 'brave'].includes(browser)) return
    const t = setTimeout(() => {
      const hasManifest = !!document.querySelector('link[rel="manifest"]')
      const swControlled = !!navigator.serviceWorker?.controller
      console.warn('[PWA Install] No beforeinstallprompt after 5s', {
        browser, hasManifest, swControlled, standalone: isStandalone
      })
    }, 5000)
    return () => clearTimeout(t)
  }, [deferredPrompt, browser])

  const canNativeInstall = !!deferredPrompt
  const needsManualInstructions = ['safari-ios', 'safari-macos', 'firefox-android', 'firefox-desktop'].includes(browser)
  const showInstallPrompt = !installed && !dismissed && (canNativeInstall || needsManualInstructions)

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return
    trackEvent('prompted')
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    trackEvent(outcome === 'accepted' ? 'installed' : 'dismissed')
    setDeferredPrompt(null)
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
    trackEvent('dismissed')
  }, [])

  return {
    browser, installed, dismissed, canNativeInstall,
    needsManualInstructions, showInstallPrompt,
    triggerInstall, dismiss
  }
}

// Analytics — last 50 events in localStorage
function trackEvent(type: string) {
  try {
    const key = 'pwa-install-analytics'
    const events = JSON.parse(localStorage.getItem(key) || '[]')
    events.push({ type, timestamp: Date.now() })
    localStorage.setItem(key, JSON.stringify(events.slice(-50)))
  } catch { /* localStorage unavailable */ }
}
```

Key detail: `consumeEarlyCapturedEvent` is passed directly as a `useState` initializer — runs once on mount, grabs the stashed event from `index.html`'s inline script (repeat visits), then the `useEffect` fallback handles first visits. The `swControlled` diagnostic is critical: on first visit the SW registers but doesn't control the page until reload, which is likely why Chrome won't fire the event.

## Install Prompt UI (`InstallPrompt.tsx`)

Banner that shows conditionally based on `showInstallPrompt`:
- **Chromium** (`canNativeInstall`): "Install" button -> calls `triggerInstall()`
- **Safari/Firefox** (`needsManualInstructions`): "How to Install" button -> opens `InstallInstructionsModal`
- **"Not now"** dismiss button -> calls `dismiss()`, persists to localStorage

Hidden when already in standalone mode, dismissed, or unsupported browser.

## Manual Install Instructions (`InstallInstructionsModal.tsx`)

Browser-specific step-by-step guides in a modal. Four variants, plain language for non-technical users:

| Browser | Steps |
|---------|-------|
| Safari iOS | Share -> Add to Home Screen -> Add |
| Safari macOS | File -> Add to Dock |
| Firefox Android | Three-dot menu -> Install -> Install again |
| Firefox Desktop | Fallback: "Use Chrome or Edge for install support" |

Tracks `instructions-viewed` analytics event on open.

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

## Platform Gotchas

**Safari aggressive caching:** On iOS, backgrounding a PWA doesn't truly close it — the service worker and cached state persist. Users may not see updates for days. The periodic `registration.update()` interval (see Service Worker Updates section) is critical for Safari users.

**Navigation overlap prevents activation:** Even refreshing a page doesn't activate a waiting service worker because the browser keeps the old page alive until response headers arrive for the new navigation. This is why `skipWaiting()` via `postMessage` exists — without it, users would have to close *every tab* before the new SW activates. The `updateServiceWorker(true)` call handles this.

**Workbox timing heuristic:** If you rebuild and re-register the service worker within one minute of the last registration, `workbox-window` treats the update as an "external event" rather than a normal update, potentially showing "offline ready" instead of "update available." Always test with full production builds served from a static file server.

**Never switch `autoUpdate` → `prompt` in production:** Users who already have the auto-updating SW installed will never see the prompt-based code — the old SW silently replaces itself before the new registration logic runs.

**Expo Web incompatibility:** vite-plugin-pwa is not compatible with Expo Web (Expo Router uses Metro, not Vite). For Expo Web PWAs, use `workbox-cli generateSW` as a post-build step and manually wire up SW registration and update detection.

## Key Lessons

1. **Never combine `"any maskable"` in icon purpose** — use separate entries with a dedicated 1024x1024 for maskable.
2. **Set `id` explicitly** in the manifest — Chrome derives it from `start_url` otherwise.
3. **The inline script in `index.html` is essential** — without it, repeat visitors on Chromium lose the install prompt.
4. **`registerType: 'prompt'`** gives users control. `autoUpdate` silently refreshes mid-work.
5. **Diagnostic 5s timeout on Chromium** — log `hasManifestLink` and `swControlled` state for debugging. `swControlled: false` on first visit is expected (SW doesn't control until reload).
6. **Clean up all timers** — every `setTimeout`/`setInterval` in `useEffect` needs cleanup. Nested timeouts need the array pattern or mounted ref guard.
7. **400 DPI rasterization** — Sharp renders the SVG at ~5.5x the coordinate space before downscaling, so edges are anti-aliased from high-res source data instead of the default 72 DPI. The 192px PWA icon benefits most.
8. **`shape-rendering="geometricPrecision"`** — tells the SVG rasterizer to prioritize accurate geometry over rendering speed. Add to the root `<svg>` element.
9. **`cleanupOutdatedCaches: true`** — removes stale caches from older Workbox major versions. Set this in the workbox config.
10. **`globPatterns` must match your asset types** — default may miss fonts, images, or other static assets your app uses.
11. **`navigateFallback` is SPA-only** — for multi-page apps, omit it or navigation to non-index pages will break.
12. **Cache headers complement the SW** — `no-cache` on `index.html`/`sw.js`, `immutable` on hashed assets. The SW precache layer handles the rest.
