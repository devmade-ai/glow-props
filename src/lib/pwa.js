// Requirement: PWA service worker registration, fleet-standard update policy,
//   and install detection (PWA_SYSTEM.md), shared by every page root.
// Approach: module-level singleton (the pattern's "Module-Level Singleton" key
//   decision) — registration, update policy, and install state live at module
//   scope with a subscriber set; React reads it through the usePWA hooks and
//   renders the UI (toasts, banner, modal) from state + events. This module
//   builds no DOM.
// Why launch-apply is triggered from onNeedRefresh, not onRegisteredSW: in
//   vite-plugin-pwa's prompt-mode client, the reload-on-'controlling' listener
//   is installed inside the 'waiting' event handler (which then calls
//   onNeedRefresh). workbox-window dispatches 'waiting' for an already-waiting
//   worker on a 200ms timer AND cancels it if the worker starts activating
//   first — so calling updateSW(true) straight from onRegisteredSW can
//   skipWaiting before any reload listener exists, leaving a stale page under
//   the new SW. onRegisteredSW only records launch eligibility; the apply runs
//   when onNeedRefresh fires ~200ms later.
// Alternative: own controllerchange listener + postMessage SKIP_WAITING —
//   rejected, duplicates the reload wiring vite-plugin-pwa already provides.
// Cleanup: every timer/listener tracked at module scope and torn down by the
//   import.meta.hot.dispose() block (TIMER_LEAKS.md variants 4 + 5).

import { registerSW } from 'virtual:pwa-register';
import { safeLocalGet, safeLocalSet, safeSessionGet, safeSessionSet } from './safeStorage.js';
import { APP_SHORT_NAME } from './appIdentity.js';

const CHECK_INTERVAL_MS = 60 * 60 * 1000;
const AUTO_UPDATE_KEY = 'pwa-auto-update';       // localStorage: 'true' | 'false', absent = ON
const UPDATED_AT_KEY = 'pwa-updated-at';         // sessionStorage: timestamp of last applied update
const JUST_UPDATED_WINDOW_MS = 30 * 1000;        // fleet-standard false-re-detection suppression
const LAUNCH_APPLY_WINDOW_MS = 10 * 1000;        // how long launch eligibility stays valid
const UPDATE_CHECK_SETTLE_MS = 1500;             // fleet-standard settle after registration.update()
const VISIBILITY_CHECK_MIN_MS = 60 * 1000;       // throttle for visibilitychange update checks

// Single source of truth for the Chromium-family browsers where the native
// beforeinstallprompt MAY fire (desktop/Android only — on iOS every browser is
// WebKit and none of them fire it; the iOS case is handled separately in
// getInstallInstructions). Shared by supportsAutoInstall and the diagnostic
// fallback (PWA_SYSTEM.md).
export const CHROMIUM_BROWSERS = ['chrome', 'edge', 'brave', 'opera', 'samsung', 'vivaldi', 'arc'];

export const BROWSER_DISPLAY_NAMES = {
  chrome: 'Google Chrome', edge: 'Microsoft Edge', brave: 'Brave',
  opera: 'Opera', samsung: 'Samsung Internet', vivaldi: 'Vivaldi',
  arc: 'Arc', safari: 'Safari', firefox: 'Firefox', unknown: 'Your Browser',
};

// iOS browsers are all Safari underneath, but they report themselves with
// distinct tokens that contain neither "Chrome" nor "Firefox" — CriOS, FxiOS,
// EdgiOS. Without these three checks they fall through to the Safari test
// below (their UAs DO contain "Safari"), which made the iOS-non-Safari
// redirect in getInstallInstructions() unreachable: exactly the users it was
// written for were told to use a Share sheet their browser cannot install from.
export function detectBrowser() {
  const ua = navigator.userAgent;
  // Brave Mobile strips "Brave" from the UA string — existence check, not UA match.
  if ('brave' in navigator) return 'brave';
  if (/CriOS\//i.test(ua)) return 'chrome';
  if (/FxiOS\//i.test(ua)) return 'firefox';
  if (/EdgiOS\//i.test(ua)) return 'edge';
  if (/Firefox/i.test(ua)) return 'firefox';
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua) && !/Chromium/i.test(ua)) return 'safari';
  if (/SamsungBrowser/i.test(ua)) return 'samsung';
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return 'opera';
  if (/Vivaldi/i.test(ua)) return 'vivaldi';
  if (/Arc\//i.test(ua)) return 'arc';
  if (/Edg\//i.test(ua)) return 'edge';
  if (/Chrome/i.test(ua) || /Chromium/i.test(ua)) return 'chrome';
  return 'unknown';
}

// ===== Singleton state =====

let updateSW = null;
let swRegistration = null;
let swRegistrationFailed = false;
let updateAvailable = false;
let launchApplyUntil = 0;
let checkPromise = null;
let deferredPrompt = null;

// Replaced wholesale on every change, never mutated in place: getPwaState is a
// useSyncExternalStore snapshot, and React compares snapshots with Object.is —
// a mutated-in-place object keeps its identity and the UI would never update.
let state = {
  updateBannerVisible: false,
  installModalOpen: false,
  showInstallItem: false,
  autoUpdateEnabled: true,
  browser: 'unknown',
};

const listeners = new Set();
const eventListeners = new Set();
// Events emitted before any consumer subscribes are held here rather than
// dropped: PwaManager subscribes in a passive effect, so an onOfflineReady
// that fires before React mounts would otherwise lose its toast. Capped
// because nothing guarantees a consumer ever attaches.
let pendingEvents = [];
const MAX_PENDING_EVENTS = 10;

function notify() {
  listeners.forEach((fn) => {
    try { fn(); } catch (e) { console.error('[pwa] subscriber failed:', e); }
  });
}

// Events carry toast-worthy moments ({ type, message?, tone? }) — the
// PwaManager component turns them into toasts so this module stays DOM-free.
function emit(event) {
  if (eventListeners.size === 0) {
    pendingEvents.push(event);
    if (pendingEvents.length > MAX_PENDING_EVENTS) pendingEvents.shift();
    return;
  }
  eventListeners.forEach((fn) => {
    try { fn(event); } catch (e) { console.error('[pwa] event listener failed:', e); }
  });
}

export function getPwaState() {
  return state;
}

// Lifecycle events reach the DEV-gated debug pill through the optional
// window.__debugAdd bridge (set by src/lib/debugLog.js, which production
// never loads) — this module must not import the debug subsystem, or it would
// ship in every bundle. console.warn call sites are NOT mirrored here: the
// debug module intercepts console, and mirroring would double-log.
function debugHook(severity, event, details) {
  if (typeof window !== 'undefined' && window.__debugAdd) {
    window.__debugAdd('pwa', severity, event, details);
  }
}

// Install-funnel analytics (PWA_SYSTEM.md, optional): localStorage event log
// capped at 50, read by the debug pill's PWA tab. Local only — no external
// service, nothing leaves the browser.
function trackInstallEvent(event) {
  try {
    const key = 'pwa-install-events';
    const events = JSON.parse(safeLocalGet(key) || '[]');
    events.push({ event, timestamp: new Date().toISOString(), browser: state.browser });
    if (events.length > 50) events.splice(0, events.length - 50);
    safeLocalSet(key, JSON.stringify(events));
  } catch { /* best effort — analytics must never break the install flow */ }
}

// Returns an unsubscribe fn — callers store and invoke it on cleanup.
export function subscribePwa(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function subscribePwaEvents(fn) {
  eventListeners.add(fn);
  // Drain anything that fired before this first subscriber existed.
  if (pendingEvents.length) {
    const queued = pendingEvents;
    pendingEvents = [];
    queued.forEach((event) => {
      try { fn(event); } catch (e) { console.error('[pwa] event listener failed:', e); }
    });
  }
  return () => eventListeners.delete(fn);
}

function setState(patch) {
  state = { ...state, ...patch };
  notify();
}

// ===== "Automatic updates" preference =====

export function isAutoUpdateEnabled() {
  return safeLocalGet(AUTO_UPDATE_KEY) !== 'false';
}

export function toggleAutoUpdate() {
  const wanted = !isAutoUpdateEnabled();
  safeLocalSet(AUTO_UPDATE_KEY, String(wanted));
  // Read back rather than trust the write: safeLocalSet swallows failures
  // (private browsing, storage-blocked iframes), and a toggle that silently
  // stays put looks broken — say why instead.
  if (isAutoUpdateEnabled() !== wanted) {
    emit({ type: 'toast', message: 'Couldn\'t save this setting — your browser is blocking site storage.', tone: 'error' });
  }
  setState({ autoUpdateEnabled: isAutoUpdateEnabled() });
}

// ===== "Just updated" suppression =====
// sessionStorage: survives the reload we trigger (same tab) but dies with the
// tab, so a genuine next launch is never suppressed.

function markUpdateApplied() {
  safeSessionSet(UPDATED_AT_KEY, String(Date.now()));
}

function wasJustUpdated() {
  const raw = safeSessionGet(UPDATED_AT_KEY);
  if (!raw) return false;
  const appliedAt = Number(raw);
  return isFinite(appliedAt) && (Date.now() - appliedAt) < JUST_UPDATED_WINDOW_MS;
}

// ===== Apply (shared by launch-apply and the banner's Update button) =====

export function applyUpdate() {
  markUpdateApplied();
  debugHook('info', 'Applying update (skipWaiting + reload)');
  emit({ type: 'toast', message: 'Updating to the latest version…', tone: 'info' });
  // If the waiting worker is gone (it activated on its own, or the browser
  // discarded it), updateSW(true) has nothing to skipWaiting on and never
  // reloads — the Update button would silently do nothing. A plain reload
  // picks up whatever worker is now controlling.
  if (swRegistration && !swRegistration.waiting) {
    dismissUpdateBanner();
    window.location.reload();
    return;
  }
  if (updateSW) updateSW(true);
}

export function dismissUpdateBanner() {
  setState({ updateBannerVisible: false });
}

// ===== Manual update check =====
// Fleet-standard typed result: 'no-sw' | 'up-to-date' | 'update-available' | 'error'.

let checkSettleTimeoutId = null;

export function checkForUpdates() {
  if (checkPromise) return checkPromise;   // re-entrancy: share the in-flight result
  if (!swRegistration) {
    // Three distinct truths, three messages: registration failed outright
    // (onRegisterError fired — "try again in a moment" would be a lie
    // forever), registration still in flight (first second of page life), or
    // the browser genuinely has no service worker support.
    const supported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
    emit({
      type: 'toast',
      message: swRegistrationFailed
        ? 'Update checks aren\'t working right now. Reload the page to try again.'
        : supported
          ? 'Still starting up — try again in a moment.'
          : 'Update checks aren\'t available in this browser.',
      tone: swRegistrationFailed ? 'error' : 'info',
    });
    return Promise.resolve('no-sw');
  }
  emit({ type: 'toast', message: 'Checking for updates…', tone: 'info', duration: 1200 });
  checkPromise = swRegistration.update()
    .then(() => new Promise((resolve) => {
      // A byte-different SW needs time to install and fire onNeedRefresh —
      // update() resolving only means the check finished.
      checkSettleTimeoutId = setTimeout(() => {
        checkSettleTimeoutId = null;
        resolve(updateAvailable ? 'update-available' : 'up-to-date');
      }, UPDATE_CHECK_SETTLE_MS);
    }))
    .catch(() => 'error')
    .then((result) => {
      checkPromise = null;
      debugHook(result === 'error' ? 'error' : 'info', `Manual update check: ${result}`);
      if (result === 'update-available') {
        setState({ updateBannerVisible: true });   // the banner IS the surface for this state
      } else if (result === 'up-to-date') {
        emit({ type: 'toast', message: 'You\'re on the latest version.', tone: 'success' });
      } else if (result === 'error') {
        emit({ type: 'toast', message: 'Couldn\'t check for updates. Please try again later.', tone: 'error' });
      }
      return result;
    });
  return checkPromise;
}

// ===== Install instructions (data, not markup) =====

// Steps that quote a browser menu item interpolate APP_SHORT_NAME rather than
// spelling the name out: the browser builds that menu label from the manifest,
// so any wording of our own tells the user to look for an entry that isn't
// there. Same constant feeds the manifest — see src/lib/appIdentity.js.
export function getInstallInstructions() {
  const browser = state.browser;
  // iPadOS 13+ reports itself as "Macintosh", so a UA-only test sends iPad
  // users to the macOS "File → Add to Dock" steps — a menu that does not exist
  // there. Touch points disambiguate: desktop Safari reports 0.
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || isIPadOS;
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || isIPadOS;

  // iOS non-Safari browsers cannot install PWAs — redirect to Safari and say
  // why, instead of desktop instructions that are impossible to follow.
  if (isIOS && browser !== 'safari') {
    return {
      browser: BROWSER_DISPLAY_NAMES[browser] + ' (iOS)',
      steps: [
        'Open this page in Safari (iOS requires Safari for app installation)',
        'Tap the Share button (square with arrow) at the bottom of the screen',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" in the top right corner',
      ],
      note: 'On iOS, only Safari can install web apps to the home screen. Other browsers on iOS cannot trigger installation.',
    };
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
        };
      }
      return {
        browser: 'Safari (macOS)',
        steps: [
          'Click File in the menu bar',
          'Select "Add to Dock..."',
          'Click "Add" to confirm',
        ],
      };
    case 'firefox':
      if (isMobile) {
        return {
          browser: 'Firefox (Mobile)',
          steps: [
            'Tap the three-dot menu in the top right',
            'Tap "Add to Home screen"',
            'Tap "Add" to confirm',
          ],
        };
      }
      return {
        browser: 'Firefox (Desktop)',
        steps: [
          'Firefox desktop does not support PWA installation',
          'For the best experience, use Chrome, Edge, or Brave',
          'Alternatively, bookmark this page for quick access',
        ],
        note: 'Firefox removed PWA support for desktop in 2021.',
      };
    case 'brave':
      return {
        browser: 'Brave',
        steps: [
          'Click the install icon in the address bar (computer with down arrow)',
          `Or click the menu (≡) → "Install ${APP_SHORT_NAME}..."`,
          'Click "Install" to confirm',
        ],
        note: 'If the install option doesn\'t appear, check that Brave Shields isn\'t blocking it.',
      };
    case 'samsung':
      return {
        browser: 'Samsung Internet',
        steps: [
          'Tap the download icon in the address bar',
          'Or tap the menu (≡) → "Add page to" → "Home screen"',
          'Tap "Install" to confirm',
        ],
      };
    case 'opera':
      return {
        browser: 'Opera',
        steps: [
          'Tap the menu (⋮) → "Add to Home screen"',
          'Tap "Add" to confirm',
        ],
      };
    case 'vivaldi':
    case 'arc':
    case 'chrome':
    case 'edge':
      return {
        browser: BROWSER_DISPLAY_NAMES[browser],
        steps: [
          'Click the install icon in the address bar (computer with down arrow)',
          `Or click the menu (⋮) → "Install ${APP_SHORT_NAME}..."`,
          'Click "Install" to confirm',
        ],
      };
    default:
      return {
        browser: 'Your Browser',
        steps: [
          'Look for an "Install" or "Add to Home Screen" option in your browser menu',
          'For the best experience, use Chrome, Edge, or Brave',
        ],
      };
  }
}

// ===== Install flow =====

let isStandalone = false;
let supportsAutoInstall = false;
let supportsManualInstall = false;
let dismissed = false;
let manualFallbackArmed = false;

function updateInstallVisibility() {
  const canNativeInstall = !!deferredPrompt;
  setState({
    showInstallItem: !isStandalone && !dismissed &&
      (canNativeInstall || supportsManualInstall || manualFallbackArmed),
  });
}

export function dismissInstall() {
  dismissed = true;
  safeLocalSet('pwa-install-dismissed', 'true');
  trackInstallEvent('dismissed');
  setState({ installModalOpen: false });
  updateInstallVisibility();
}

export function closeInstallModal() {
  setState({ installModalOpen: false });
}

export function triggerInstall() {
  if (deferredPrompt) {
    // Clear BEFORE prompting: a beforeinstallprompt event may only be
    // prompt()ed once, so a fast double tap — or any retap after a dismissal —
    // would call it on a spent event and throw. prompt() itself can also
    // reject (no user gesture, permission policy), which the old code left
    // uncaught because only userChoice was wrapped.
    const promptEvent = deferredPrompt;
    deferredPrompt = null;
    Promise.resolve()
      .then(() => promptEvent.prompt())
      .then(() => promptEvent.userChoice)
      .then((result) => {
        if (result.outcome === 'dismissed') dismissInstall();
        updateInstallVisibility();
      })
      .catch((err) => {
        console.warn('[PWA] Install prompt error:', err);
        // Don't strand the user with no way in — the native path is gone for
        // this page load, so offer the manual steps instead.
        manualFallbackArmed = true;
        updateInstallVisibility();
      });
  } else if (supportsManualInstall || manualFallbackArmed) {
    trackInstallEvent('instructions-viewed');
    setState({ installModalOpen: true });
  }
}

// ===== Initialization (client only — entry-server never imports this module) =====

let visibilityListener = null;
let beforeInstallPromptListener = null;
let appInstalledListener = null;
let displayModeMediaQuery = null;
let displayModeListener = null;
let swUpdateIntervalId = null;
let diagnosticTimeoutId = null;

function init() {
  // setState, not direct assignment — `state` is an immutable snapshot now.
  setState({ browser: detectBrowser(), autoUpdateEnabled: isAutoUpdateEnabled() });
  displayModeMediaQuery = window.matchMedia('(display-mode: standalone)');
  isStandalone = displayModeMediaQuery.matches || navigator.standalone === true;
  supportsAutoInstall = CHROMIUM_BROWSERS.includes(state.browser);
  supportsManualInstall = state.browser === 'safari' || state.browser === 'firefox';
  dismissed = safeLocalGet('pwa-install-dismissed') === 'true';

  // Consume the early-captured event (repeat visits where the SW fires
  // beforeinstallprompt before any module runs — partials/head-common.html).
  if (window.__pwaInstallPromptEvent) {
    deferredPrompt = window.__pwaInstallPromptEvent;
    delete window.__pwaInstallPromptEvent;
    // Durable "the prompt fired" flag for the debug diagnostics probe — the
    // event object itself is consumed here, so the probe can't test for it.
    window.__pwaPromptCaptured = true;
    trackInstallEvent('prompted');
  }

  updateSW = registerSW({
    onNeedRefresh() {
      // Post-reload lifecycle re-fires within the suppression window are
      // noise — without this guard the banner pops right after the update it
      // announces.
      if (wasJustUpdated()) {
        // Still record the fact — a manual "Check for updates" during the
        // suppression window must report update-available, not up-to-date.
        updateAvailable = true;
        launchApplyUntil = 0;
        return;
      }
      updateAvailable = true;
      debugHook('info', 'New version available');
      // Launch-apply: onRegisteredSW found a worker already waiting and
      // recorded a short eligibility window (see module header).
      if (launchApplyUntil !== 0 && Date.now() < launchApplyUntil) {
        launchApplyUntil = 0;
        applyUpdate();
        return;
      }
      launchApplyUntil = 0;
      // Mid-session: never reload — arm the banner; the waiting worker
      // auto-applies on next launch.
      setState({ updateBannerVisible: true });
    },
    onOfflineReady() {
      debugHook('success', 'App ready for offline use');
      emit({ type: 'toast', message: 'Ready for offline use.', tone: 'success' });
    },
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      swRegistration = registration;
      debugHook('info', 'Service worker registered', { waiting: !!registration.waiting });
      if (registration.waiting && isAutoUpdateEnabled() && !wasJustUpdated()) {
        launchApplyUntil = Date.now() + LAUNCH_APPLY_WINDOW_MS;
      }
      // Rejections swallowed for the same reason as the visibility check
      // below: update() throws when offline, and a backgrounded offline tab
      // would otherwise emit an unhandled rejection every hour — which the
      // head-common error capture then dutifully logs as noise.
      swUpdateIntervalId = setInterval(() => {
        registration.update().catch(() => { /* offline — the next poll retries */ });
      }, CHECK_INTERVAL_MS);
    },
    onRegisterError(err) {
      // Permanent for this page load — checkForUpdates uses this to avoid
      // telling the user to "try again in a moment" forever.
      swRegistrationFailed = true;
      debugHook('error', 'Service worker registration failed', { error: String(err) });
    },
  });

  // Fallback listener — first-visit case where the SW registers after this
  // module loads.
  beforeInstallPromptListener = (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.__pwaPromptCaptured = true;
    trackInstallEvent('prompted');
    updateInstallVisibility();
  };
  window.addEventListener('beforeinstallprompt', beforeInstallPromptListener);

  appInstalledListener = () => {
    deferredPrompt = null;
    isStandalone = true;
    trackInstallEvent('installed');
    updateInstallVisibility();
  };
  window.addEventListener('appinstalled', appInstalledListener);

  // Install via the browser's own menu doesn't always reach appinstalled —
  // watching display-mode catches the page flipping into standalone so the
  // "Install app" item hides mid-session instead of on next launch
  // (PWA_SYSTEM.md "Display-mode change listener").
  displayModeListener = (e) => {
    if (e.matches) {
      isStandalone = true;
      deferredPrompt = null;
      trackInstallEvent('installed-via-browser');
      updateInstallVisibility();
    }
  };
  displayModeMediaQuery.addEventListener('change', displayModeListener);

  // Catch updates when the user returns to a long-lived tab — the hourly poll
  // alone leaves backgrounded tabs stale (PWA_SYSTEM.md key lesson 15).
  // Throttled: rapid tab-switching would otherwise hammer the server with
  // update fetches. Rejections swallowed — update() throws offline, and an
  // unhandled rejection on every offline tab-switch is pure console noise.
  let lastVisibilityCheck = 0;
  visibilityListener = () => {
    if (document.visibilityState === 'visible' && swRegistration &&
        Date.now() - lastVisibilityCheck > VISIBILITY_CHECK_MIN_MS) {
      lastVisibilityCheck = Date.now();
      swRegistration.update().catch(() => { /* offline — the next check retries */ });
    }
  };
  document.addEventListener('visibilitychange', visibilityListener);

  // NOTE: no 1s "reveal manual instructions" timer here, unlike the pattern's
  // reference hook. `supportsManualInstall` already grants visibility in
  // updateInstallVisibility(), and init() calls that unconditionally below, so
  // the timer's callback recomputed a value that was already true — it gated
  // nothing. The pattern's delay exists to let a native prompt win the race,
  // but it only applies to Safari/Firefox, which never fire
  // beforeinstallprompt at all. Deleted rather than wired to a real flag.

  // Chromium whose beforeinstallprompt never fires (90-day suppression after
  // a dismissal): log diagnostics, then fall back to manual instructions.
  if (!isStandalone && !dismissed && supportsAutoInstall) {
    diagnosticTimeoutId = setTimeout(() => {
      diagnosticTimeoutId = null;
      if (!deferredPrompt) {
        // DEV-only console noise; the debug pill gets it either way. In prod
        // this state is normal (90-day suppression) — not warning-worthy.
        if (import.meta.env.DEV) {
          console.warn('[PWA] beforeinstallprompt not received after 5s', {
            browser: state.browser,
            hasManifest: !!document.querySelector('link[rel="manifest"]'),
            hasSW: !!(navigator.serviceWorker && navigator.serviceWorker.controller),
          });
        }
        debugHook('warn', 'beforeinstallprompt not received after 5s', {
          browser: state.browser,
          hasManifest: !!document.querySelector('link[rel="manifest"]'),
          hasSW: !!(navigator.serviceWorker && navigator.serviceWorker.controller),
        });
        manualFallbackArmed = true;
        updateInstallVisibility();
      }
    }, 5000);
  }

  updateInstallVisibility();
}

// Attached once behind the HMR guard (TIMER_LEAKS.md variant 5). registerSW is
// re-invoked per HMR cycle by design — vite-plugin-pwa offers no unregister
// API and stale callbacks would otherwise keep firing against old closures.
if (typeof window !== 'undefined' && !window.__pwaModuleAttached) {
  window.__pwaModuleAttached = true;
  init();
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (swUpdateIntervalId !== null) clearInterval(swUpdateIntervalId);
    if (diagnosticTimeoutId !== null) clearTimeout(diagnosticTimeoutId);
    if (checkSettleTimeoutId !== null) clearTimeout(checkSettleTimeoutId);
    if (beforeInstallPromptListener) window.removeEventListener('beforeinstallprompt', beforeInstallPromptListener);
    if (appInstalledListener) window.removeEventListener('appinstalled', appInstalledListener);
    if (displayModeMediaQuery && displayModeListener) {
      displayModeMediaQuery.removeEventListener('change', displayModeListener);
    }
    if (visibilityListener) document.removeEventListener('visibilitychange', visibilityListener);
    // The early-capture listener lives in partials/head-common.html (inline,
    // pre-bundle); it exposes its handler on window so this dispose can pair it.
    if (window.__pwaInstallCapture) {
      window.removeEventListener('beforeinstallprompt', window.__pwaInstallCapture);
      window.__pwaInstallCapture = null;
      window.__pwaInstallCaptureAttached = false;
    }
    listeners.clear();
    eventListeners.clear();
    window.__pwaModuleAttached = false;
  });
}
