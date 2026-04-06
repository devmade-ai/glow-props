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

Wraps `vite-plugin-pwa`'s React hook. Exposes `hasUpdate`, `update()`, `checkForUpdate()`, and `checking` state. Checks for new SW versions every 60 minutes and on visibility change (when tab regains focus).

**Architecture: Module-level singleton** — all SW state lives at module scope, not in React state. This solves a real bug: hook-local state re-initializes on component remount, re-triggering `register()` and causing "update available" to re-appear after navigation. The singleton pattern with pub/sub listeners preserves state across mounts.

```typescript
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { debugAdd } from '../utils/debugLog'

const CHECK_INTERVAL_MS = 60 * 60 * 1000

// Module-level state — survives component remounts
let _registration: ServiceWorkerRegistration | undefined
let _hasUpdate = false
let _userClickedUpdate = false
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
  const [, forceRender] = useState(0)
  const [checking, setChecking] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        _registration = r
        debugAdd('pwa', 'info', 'Service worker registered')

        // Clear existing interval before setting new one (prevents leak on re-registration)
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = setInterval(() => r.update(), CHECK_INTERVAL_MS)
      }
    },
    onNeedRefresh() {
      if (wasJustUpdated()) return
      _hasUpdate = true
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

  // Visibility-based update checks — catches updates when user returns to tab
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && _registration) {
        _registration.update()
      }
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

  // Cleanup interval on unmount
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const update = useCallback(() => {
    _userClickedUpdate = true
    debugAdd('pwa', 'info', 'User triggered update')
    try { sessionStorage.setItem('pwa-update-applied', String(Date.now())) } catch {}
    updateServiceWorker(true)
  }, [updateServiceWorker])

  // Manual "Check for updates" — returns typed result for toast feedback
  const checkForUpdate = useCallback(async (): Promise<'no-sw' | 'done' | 'error'> => {
    if (!_registration) return 'no-sw'
    setChecking(true)
    try {
      await _registration.update()
      // 1500ms settle delay for async SW lifecycle events
      await new Promise(r => setTimeout(r, 1500))
      return 'done'
    } catch (e) {
      debugAdd('pwa', 'error', 'Update check failed', { error: String(e) })
      return 'error'
    } finally {
      setChecking(false)
    }
  }, [])

  return {
    hasUpdate: _hasUpdate || needRefresh,
    update,
    checkForUpdate,
    checking,
  }
}
```

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

// Module-level — survives remounts
let deferredPrompt: BeforeInstallPromptEvent | null =
  (window as any).__pwaInstallPrompt || null

function detectBrowser(): BrowserType {
  const ua = navigator.userAgent

  // Brave: Check navigator.brave existence first.
  // Bug: Brave Mobile strips "Brave" from the UA string (confirmed 2026-03-07).
  // Use existence check as primary, not async call or UA match.
  if ('brave' in navigator) return 'brave'

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

    // Check early-captured event from index.html inline script
    if ((window as any).__pwaInstallPrompt && !deferredPrompt) {
      deferredPrompt = (window as any).__pwaInstallPrompt
    }
    if (deferredPrompt) setCanInstall(true)

    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt = e as BeforeInstallPromptEvent
      ;(window as any).__pwaInstallPrompt = e
      setCanInstall(true)
      trackInstallEvent('prompted')
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

  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) return false
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setCanInstall(false)
      deferredPrompt = null
      return true
    }
    return false
  }

  // Data-driven install instructions — the modal just renders whatever this returns.
  // Covers 7 Chromium browsers + Safari (iOS/macOS) + Firefox (mobile/desktop) + Samsung.
  const getInstallInstructions = (): InstallInstructions => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

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
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

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
  event: 'prompted' | 'installed' | 'dismissed' | 'instructions-viewed' | 'installed-via-browser'
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
        transition-all duration-200 ${typeStyles[toast.type]}
        ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      {/* Add type-specific SVG icons here */}
      <span>{toast.message}</span>
      <button onClick={() => setIsExiting(true)} className="ml-1 p-0.5 rounded hover:bg-white/20" aria-label="Dismiss">✕</button>
    </div>
  )
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  if (toasts.length === 0) return null
  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[70] flex flex-col-reverse gap-2 max-w-sm w-full px-4"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
    >
      {toasts.map(toast => <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />)}
    </div>
  )
}
```

**Key design decisions:**
- **Context-based** — `useToast()` accessible from any component without prop drilling. Wrap `<App>` in `<ToastProvider>`.
- **DaisyUI semantic colors** — `bg-success`, `bg-error`, etc. work across all themes automatically.
- **iOS safe area** — `env(safe-area-inset-bottom)` prevents toasts from being hidden behind the home indicator on notched iPhones.
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
- `hasUpdate` → show a persistent toast or inline banner with "Update" button
- `offlineReady` → show auto-dismissing success toast (3s)

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
    if (stored && stored !== buildTime) return true
    localStorage.setItem('app-build-time', buildTime)
    return false
  } catch { return false }
}
```

Generate `version.json` at build time with `{ "buildTime": "2026-04-06T12:00:00Z" }`.

## Platform Gotchas

**Safari aggressive caching:** On iOS, backgrounding a PWA doesn't truly close it — the service worker and cached state persist. Users may not see updates for days. The periodic `registration.update()` interval (see Service Worker Updates section) is critical for Safari users.

**Navigation overlap prevents activation:** Even refreshing a page doesn't activate a waiting service worker because the browser keeps the old page alive until response headers arrive for the new navigation. This is why `skipWaiting()` via `postMessage` exists — without it, users would have to close *every tab* before the new SW activates. The `updateServiceWorker(true)` call handles this.

**Workbox timing heuristic:** If you rebuild and re-register the service worker within one minute of the last registration, `workbox-window` treats the update as an "external event" rather than a normal update, potentially showing "offline ready" instead of "update available." Always test with full production builds served from a static file server.

**Never switch `autoUpdate` → `prompt` in production:** Users who already have the auto-updating SW installed will never see the prompt-based code — the old SW silently replaces itself before the new registration logic runs.

**Expo Web incompatibility:** vite-plugin-pwa is not compatible with Expo Web (Expo Router uses Metro, not Vite). For Expo Web PWAs, use `workbox-cli generateSW` as a post-build step and manually wire up SW registration and update detection.

## Key Lessons

### Icons & Manifest
1. **Never combine `"any maskable"` in icon purpose** — use separate entries with a dedicated 1024x1024 for maskable.
2. **Set `id` explicitly** in the manifest — Chrome derives it from `start_url` otherwise.
3. **400 DPI rasterization** — Sharp renders the SVG at ~5.5x the coordinate space before downscaling, so edges are anti-aliased from high-res source data instead of the default 72 DPI. The 192px PWA icon benefits most.
4. **`shape-rendering="geometricPrecision"`** — tells the SVG rasterizer to prioritize accurate geometry over rendering speed. Add to the root `<svg>` element.

### Install Prompt
5. **The inline script in `index.html` is essential** — without it, repeat visitors on Chromium lose the install prompt.
6. **`deferredPrompt` must be module-level** — survives React remounts. The inline script captures it before React mounts; the `useEffect` fallback handles first visits.
7. **Detect 7 Chromium browsers** — Chrome, Edge, Brave, Opera, Samsung, Vivaldi, Arc. Use the `CHROMIUM_BROWSERS` constant as single source of truth.
8. **Brave Mobile strips "Brave" from UA** — use `'brave' in navigator` existence check as primary detection, not UA string matching.
9. **iOS non-Safari browsers can't install PWAs** — explicitly redirect users to Safari with explanation.
10. **5-second diagnostic timeout** — if `beforeinstallprompt` hasn't fired on Chromium, log manifest/SW status. Chrome suppresses the prompt for 90 days after dismissal.
11. **Install instructions should be data-driven** — `getInstallInstructions()` returns `{ browser, steps, note }`. The modal renders whatever it gets. One switch case per browser, not one component.
12. **Focus trap the install modal** — keyboard users must be able to Tab within the modal without escaping to background content.

### Service Worker Updates
13. **`registerType: 'prompt'`** gives users control. `autoUpdate` silently refreshes mid-work.
14. **Module-level singleton for update state** — survives component mount/unmount cycles. Hook-local state re-initializes on remount, causing false "update available" re-detection.
15. **Visibility-based update checks** — on `visibilitychange`, trigger `registration.update()` when the page regains focus. Catches updates faster than hourly polling alone.
16. **`controllerchange` reload guard** — auto-reload when new SW takes control, but ONLY if the user explicitly clicked "Update". Prevents unexpected reloads from background SW lifecycle events.
17. **30-second `wasJustUpdated()` suppression** — prevents false re-detection after applying an update. The browser's SW lifecycle may not have fully settled after reload.
18. **Manual `checkForUpdate()` with typed result** — returns `'no-sw' | 'done' | 'error'` for toast feedback from burger menu "Check for Updates" action.
19. **Debug log all PWA lifecycle events** — SW registration, updates, offline-ready, install events, and errors routed to the debug system.
20. **`cleanupOutdatedCaches: true`** — removes stale caches from older Workbox major versions. Set this in the workbox config.
21. **`globPatterns` must match your asset types** — default may miss fonts, images, or other static assets your app uses.
22. **Workbox runtime caching for Google Fonts** — CacheFirst with 1-year TTL is universally useful.

### Caching & Deployment
23. **`navigateFallback` is SPA-only** — for multi-page apps, omit it or navigation to non-index pages will break.
24. **Cache headers complement the SW** — `no-cache` on `index.html`/`sw.js`, `immutable` on hashed assets. The SW precache layer handles the rest.
25. **`version.json` for non-SW updates** — supplementary detection mechanism for app changes that don't modify the service worker file.

### UI Patterns
26. **Use a context-based Toast system** — `ToastProvider` + `useToast()` replaces one-off DOM-injected banners. Reusable for PWA events and general app feedback.
27. **DaisyUI semantic colors for toasts** — `bg-success`, `bg-error` etc. work across all themes. Never hardcode colors like `bg-brand-600`.
28. **iOS safe area on toasts/banners** — `env(safe-area-inset-bottom)` prevents content from hiding behind the home indicator.

### Non-Vite Projects
29. **Custom SW with three-tier caching** — network-only for API, cache-first for static assets, network-first for dynamic content. Pattern-based routing is more explicit than Workbox config.
30. **Build-time SW version injection** — replace a placeholder with ISO timestamp post-build. Ensures cache name uniqueness per deployment.
31. **Triple-layer `beforeinstallprompt` capture** for Expo — inline script + module-scope listener + useEffect fallback.

### General
32. **Clean up all timers** — every `setTimeout`/`setInterval` in `useEffect` needs cleanup. Nested timeouts need the array pattern or mounted ref guard.
