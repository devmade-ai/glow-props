// Requirement: PWA service worker registration, fleet-standard update policy, and
//   install detection
// Approach: Import vite-plugin-pwa's virtual module for SW registration
//   (registerType: 'prompt' — the mechanism that exposes the waiting worker to app
//   code). On top of it, the fleet-standard auto-on-launch update policy
//   (docs/implementations/PWA_SYSTEM.md "Update Application Policy"): a worker
//   already waiting at launch auto-applies (safe — nothing typed yet); updates that
//   land mid-session only arm the banner and apply on next launch; a persisted
//   "Automatic updates" toggle (default ON) opts out to tap-only. All vanilla JS.
// Alternative: Manual SW registration — rejected, vite-plugin-pwa handles caching strategy
// Alternative: autoUpdate — rejected, silently refreshes mid-browsing
// Alternative: tap-only prompt (previous behavior) — rejected, clients that never tap
//   run stale code indefinitely (see the canva-grid stale-GA incident in the pattern doc)

import { registerSW } from 'virtual:pwa-register';

// ===== Service Worker Registration & Update Detection =====
// Requirement: Fleet-standard auto-on-launch update policy —
//   1. A worker already waiting when registration first resolves auto-applies
//      (skipWaiting + one reload) behind a brief "Updating…" toast, unless the
//      user turned "Automatic updates" off or an update was applied <30s ago.
//   2. Updates detected mid-session (hourly poll, manual check) never reload —
//      they arm the update banner; the waiting worker applies on next launch.
// Approach: registerSW returns an update function. onNeedRefresh fires when a new
//   SW is installed and waiting. onOfflineReady fires when the app is fully cached.
//   Periodic update checks every 60 minutes for users who keep tabs open (critical
//   for Safari, which doesn't close backgrounded PWAs).
// Why launch-apply is triggered from onNeedRefresh, not onRegisteredSW: in
//   vite-plugin-pwa's prompt-mode client, the reload-on-'controlling' listener is
//   installed inside the 'waiting' event handler (which then calls onNeedRefresh).
//   workbox-window dispatches 'waiting' for an already-waiting worker on a 200ms
//   timer AND cancels that timer if the worker starts activating first — so calling
//   updateSW(true) straight from onRegisteredSW can skipWaiting before any reload
//   listener exists, leaving a stale page under the new SW (precache mismatch).
//   Instead onRegisteredSW only records launch eligibility (registration.waiting
//   present); the apply runs when onNeedRefresh fires ~200ms later, after
//   vite-plugin-pwa has installed its reload listener. Deterministic: onRegisteredSW
//   resolves on a microtask, the waiting event is a 200ms macrotask.
// Alternative: own controllerchange listener + postMessage SKIP_WAITING from
//   onRegisteredSW (the React repos' shape) — rejected, duplicates the reload
//   wiring vite-plugin-pwa already provides in prompt mode and risks double reload.
// Cleanup: every timer/listener tracked in module-level scope and torn down by the
//   import.meta.hot.dispose() block at the bottom. See docs/implementations/TIMER_LEAKS.md
//   variants 4 (module dispose) + 5 (HMR guard).
// Note on registerSW + HMR: registerSW is intentionally NOT wrapped in __pwaModuleAttached.
//   vite-plugin-pwa internally creates a fresh Workbox instance on each call and offers
//   no public unregister API. Wrapping registerSW behind the guard would prevent HMR'd
//   changes to onNeedRefresh / onOfflineReady from taking effect (the OLD Workbox
//   instance would keep firing OLD callbacks against OLD module closures), which breaks
//   dev UX. The trade-off is one orphaned Workbox instance per HMR cycle — benign
//   because showUpdateBanner has an `if (existing) return` dedupe guard and the dev
//   session ends with full page reload anyway. Production has no HMR.

var updateSW = null;
var CHECK_INTERVAL_MS = 60 * 60 * 1000;

// Storage keys follow this file's existing pwa- kebab convention ('pwa-install-dismissed').
var AUTO_UPDATE_KEY = 'pwa-auto-update';       // localStorage: 'true' | 'false', absent = ON
var UPDATED_AT_KEY = 'pwa-updated-at';         // sessionStorage: timestamp of last applied update
var JUST_UPDATED_WINDOW_MS = 30 * 1000;        // fleet-standard false-re-detection suppression
var LAUNCH_APPLY_WINDOW_MS = 10 * 1000;        // how long launch eligibility stays valid
var UPDATE_CHECK_SETTLE_MS = 1500;             // fleet-standard settle after registration.update()

// Update-policy state
var swRegistration = null;      // set once registration resolves; null = 'no-sw' for checks
var updateAvailable = false;    // armed by onNeedRefresh; read by checkForUpdates()
var launchApplyUntil = 0;       // epoch ms deadline while a launch-apply is pending, else 0
var checkPromise = null;        // in-flight checkForUpdates() promise (re-entrancy guard)

// Cleanup tracking — pattern: docs/implementations/TIMER_LEAKS.md
var swUpdateIntervalId = null;
var manualInstallTimeoutId = null;
var checkSettleTimeoutId = null;
var toastTimeouts = [];
var beforeInstallPromptListener = null;
var appInstalledListener = null;
var domContentLoadedListener = null;

// ===== Safe storage helpers =====
// Requirement: Preference + suppression reads/writes must not throw in sandboxed
//   iframes / private browsing (localStorage access itself can throw there).
// Approach: Tiny try/catch wrappers referencing the storage global INSIDE the try,
//   so even the property access is guarded. Same shape as theme.js's helpers.
// Alternative: Inline try/catch per call site (previous shape) — rejected, now
//   four keys need it; the repetition invited drift.

function safeLocalGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

function safeLocalSet(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* unavailable — no persistence */ }
}

function safeSessionGet(key) {
  try { return sessionStorage.getItem(key); } catch (e) { return null; }
}

function safeSessionSet(key, value) {
  try { sessionStorage.setItem(key, value); } catch (e) { /* unavailable — no persistence */ }
}

// ===== "Automatic updates" preference =====
// Requirement: Persisted user toggle, default ON when absent. OFF = never auto-apply;
//   every update waits for an explicit tap (the old prompt behavior).
// Approach: localStorage 'true'/'false'; only the literal 'false' opts out, so a
//   missing or corrupted value keeps the fleet default (ON).

function isAutoUpdateEnabled() {
  return safeLocalGet(AUTO_UPDATE_KEY) !== 'false';
}

function setAutoUpdateEnabled(on) {
  safeLocalSet(AUTO_UPDATE_KEY, String(on));
  updateAutoUpdateIndicator();
}

function toggleAutoUpdate() {
  setAutoUpdateEnabled(!isAutoUpdateEnabled());
}

// Menu indicator (mirrors the random-theme toggle's On/Off indicator shape)
function updateAutoUpdateIndicator() {
  var indicator = document.getElementById('pwa-auto-update-indicator');
  if (indicator) indicator.textContent = isAutoUpdateEnabled() ? 'On' : 'Off';
}

// ===== "Just updated" suppression =====
// Requirement: Applying an update must not loop — after the launch-apply reload,
//   a still-settling SW state must not trigger another apply.
// Approach: sessionStorage timestamp, honored for 30s. sessionStorage is the right
//   scope: it survives the reload we trigger (same tab) but dies with the tab, so a
//   genuine next launch is never suppressed.
// Alternative: localStorage — rejected, would suppress launch-apply across tabs and
//   across real next-launches within the window.

function markUpdateApplied() {
  safeSessionSet(UPDATED_AT_KEY, String(Date.now()));
}

function wasJustUpdated() {
  var raw = safeSessionGet(UPDATED_AT_KEY);
  if (!raw) return false;
  var appliedAt = Number(raw);
  return isFinite(appliedAt) && (Date.now() - appliedAt) < JUST_UPDATED_WINDOW_MS;
}

// ===== Apply (shared by launch-apply and the banner's Update button) =====
// Both paths: record suppression, brief "Updating…" toast (the app's affordance —
// the reload that follows cuts it short), then skipWaiting + reload via
// vite-plugin-pwa's own controlling listener (updateSW(true)).

function applyUpdate() {
  markUpdateApplied();
  showToast('Updating to the latest version…', 'info');
  if (updateSW) updateSW(true);
}

updateSW = registerSW({
  onNeedRefresh: function () {
    updateAvailable = true;
    // Launch-apply: onRegisteredSW found a worker already waiting and recorded a
    // short eligibility window. This onNeedRefresh is that same worker's deferred
    // 'waiting' event — apply now (reload listener is installed, see header note).
    // The window guard keeps a genuinely mid-session update from inheriting the
    // flag in the degenerate case where the launch waiting event never fired.
    if (launchApplyUntil !== 0 && Date.now() < launchApplyUntil) {
      launchApplyUntil = 0;
      applyUpdate();
      return;
    }
    launchApplyUntil = 0;
    // Mid-session (poll / manual check / toggle off): never reload — arm the
    // banner only; the waiting worker auto-applies on next launch.
    showUpdateBanner();
  },
  onOfflineReady: function () {
    showToast('Ready for offline use.', 'success');
  },
  onRegisteredSW: function (_url, registration) {
    if (registration) {
      swRegistration = registration;
      // Launch-apply eligibility: worker already waiting when registration first
      // resolved + auto-update ON + not within the 30s post-apply suppression.
      if (registration.waiting && isAutoUpdateEnabled() && !wasJustUpdated()) {
        launchApplyUntil = Date.now() + LAUNCH_APPLY_WINDOW_MS;
      }
      swUpdateIntervalId = setInterval(function () {
        registration.update();
      }, CHECK_INTERVAL_MS);
    }
  },
});

// ===== Manual update check =====
// Requirement: "Check for updates" menu action with the fleet-standard typed result
//   'no-sw' | 'up-to-date' | 'update-available' | 'error', surfaced via toasts.
// Approach: registration.update(), then a ~1500ms settle so a byte-different SW has
//   time to install and fire onNeedRefresh, then read the updateAvailable flag.
//   'update-available' re-shows the banner instead of toasting — the banner IS the
//   surface for that state, and both are bottom-anchored so a toast would cover it.
//   A short "Checking…" toast (1200ms < settle) gives immediate feedback without
//   overlapping the result toast.
// Alternative: resolve straight from registration.update() — rejected, update() only
//   means the check finished, not that the new worker reached waiting; the settle is
//   what makes the middle two results distinguishable.

function checkForUpdates() {
  if (checkPromise) return checkPromise;   // re-entrancy: share the in-flight result
  if (!swRegistration) {
    showToast('Update checks aren\'t available in this browser.', 'info');
    return Promise.resolve('no-sw');
  }
  showToast('Checking for updates…', 'info', 1200);
  checkPromise = swRegistration.update()
    .then(function () {
      return new Promise(function (resolve) {
        checkSettleTimeoutId = setTimeout(function () {
          checkSettleTimeoutId = null;
          resolve(updateAvailable ? 'update-available' : 'up-to-date');
        }, UPDATE_CHECK_SETTLE_MS);
      });
    })
    .catch(function () {
      return 'error';
    })
    .then(function (result) {
      checkPromise = null;
      if (result === 'update-available') {
        showUpdateBanner();   // dedupes internally; re-shows if previously dismissed
      } else if (result === 'up-to-date') {
        showToast('You\'re on the latest version.', 'success');
      } else if (result === 'error') {
        showToast('Couldn\'t check for updates. Please try again later.', 'error');
      }
      return result;
    });
  return checkPromise;
}

// ===== Toast System =====
// Requirement: Non-blocking feedback notifications (offline ready, errors, etc.)
// Approach: Lightweight toast with auto-dismiss and exit animation. Positioned at
//   bottom center with iOS safe area clearance. Uses DaisyUI semantic colors so
//   it works across all themes.
// Alternative: One-off DOM injection per notification type — rejected, not reusable.

var TOAST_STYLES = {
  success: 'bg-success text-success-content',
  error: 'bg-error text-error-content',
  info: 'bg-neutral text-neutral-content',
  warning: 'bg-warning text-warning-content',
};

function showToast(message, type, duration) {
  type = type || 'info';
  duration = duration || 3000;

  var toast = document.createElement('div');
  toast.className = 'fixed left-1/2 -translate-x-1/2 z-70 px-4 py-2.5 rounded-xl shadow-lg ' +
    'text-sm font-medium max-w-sm w-[calc(100%-2rem)] text-center ' +
    'transition-all duration-200 opacity-0 translate-y-2 no-print ' +
    (TOAST_STYLES[type] || TOAST_STYLES.info);
  toast.style.bottom = 'max(1rem, env(safe-area-inset-bottom))';
  toast.textContent = message;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
  document.body.appendChild(toast);

  // Trigger enter animation on next frame
  requestAnimationFrame(function () {
    toast.classList.remove('opacity-0', 'translate-y-2');
    toast.classList.add('opacity-100', 'translate-y-0');
  });

  // Nested timeouts — pattern: TIMER_LEAKS.md variant 1 (push every id to a single array).
  // Splice on fire so the array doesn't grow unboundedly across a long session.
  function untrack(id) {
    var i = toastTimeouts.indexOf(id);
    if (i !== -1) toastTimeouts.splice(i, 1);
  }
  var exitId = setTimeout(function () {
    untrack(exitId);
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-2');
    var removeId = setTimeout(function () {
      untrack(removeId);
      toast.remove();
    }, 200);
    toastTimeouts.push(removeId);
  }, duration);
  toastTimeouts.push(exitId);
}

// ===== Update Banner =====
// Requirement: Non-intrusive banner for updates detected MID-SESSION (the deferred
//   half of the auto-on-launch policy — never force-reload over in-progress reading).
// Approach: Fixed bottom banner with "Update" and "Later" actions. "Later" is safe
//   to tap: the waiting worker auto-applies on next launch anyway (when the toggle
//   is on). Safe area inset on bottom for iPhone home indicator in standalone mode.
// Alternative: Auto-dismissing toast — rejected, updates are too important to miss.

function showUpdateBanner() {
  var existing = document.getElementById('pwa-update-banner');
  if (existing) return;

  var banner = document.createElement('div');
  banner.id = 'pwa-update-banner';
  banner.className = 'fixed left-4 right-4 z-70 flex items-center justify-between gap-3 ' +
    'rounded-xl bg-base-200 border border-base-300 px-4 py-3 shadow-lg ' +
    'max-w-md mx-auto no-print';
  banner.style.bottom = 'max(1rem, env(safe-area-inset-bottom))';
  banner.innerHTML =
    '<span class="text-sm text-base-content">A new version is available.</span>' +
    '<div class="flex gap-2 shrink-0">' +
      '<button type="button" id="pwa-update-dismiss" class="btn btn-ghost btn-sm">Later</button>' +
      '<button type="button" id="pwa-update-accept" class="btn btn-primary btn-sm">Update</button>' +
    '</div>';
  document.body.appendChild(banner);

  document.getElementById('pwa-update-accept').addEventListener('click', function () {
    applyUpdate();
  });
  document.getElementById('pwa-update-dismiss').addEventListener('click', function () {
    banner.remove();
  });
}

// ===== Browser Detection =====
// Requirement: Detect browser for install prompt strategy (native vs manual instructions)
// Approach: Coarse browser type — the iOS/macOS split happens inside getInstallInstructions()
//   via UA sniffing, not at the detection level. Hook consumers only need to know
//   "safari" vs "chrome", not "safari-ios" vs "safari-macos".
// Alternative: Fine-grained types like 'safari-ios' — rejected, pushes platform logic
//   into every consumer instead of centralizing it in getInstallInstructions().

function detectBrowser() {
  var ua = navigator.userAgent;
  if (navigator.brave) return 'brave';
  if (/Firefox/i.test(ua)) return 'firefox';
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua) && !/Chromium/i.test(ua)) return 'safari';
  if (/Edg\//i.test(ua)) return 'edge';
  if (/Chrome/i.test(ua) || /Chromium/i.test(ua)) return 'chrome';
  return 'unknown';
}

// ===== Install Instructions =====
// Requirement: Browser-specific step-by-step install guides for non-technical users
// Approach: Data-driven — returns { browser, steps, note } objects. The modal renders
//   whatever this function returns. Adding a new browser is one switch case, not a
//   new HTML template. iOS/macOS Safari split happens here via UA sniffing.
// Alternative: Hardcoded HTML strings per browser — rejected, harder to maintain and
//   can't be reused (e.g., for a different modal design).

function getInstallInstructions(browser) {
  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  switch (browser) {
    case 'safari':
      if (isIOS) {
        return {
          browser: 'Safari (iOS)',
          steps: [
            'Tap the <strong>Share</strong> button (square with arrow) at the bottom of the screen',
            'Scroll down and tap <strong>Add to Home Screen</strong>',
            'Tap <strong>Add</strong> in the top right corner',
          ],
        };
      }
      return {
        browser: 'Safari (macOS)',
        steps: [
          'Click <strong>File</strong> in the menu bar',
          'Select <strong>Add to Dock...</strong>',
          'Click <strong>Add</strong> to confirm',
        ],
      };
    case 'firefox':
      if (isMobile) {
        return {
          browser: 'Firefox (Mobile)',
          steps: [
            'Tap the <strong>three-dot menu</strong> in the top right',
            'Tap <strong>Add to Home screen</strong>',
            'Tap <strong>Add</strong> to confirm',
          ],
        };
      }
      return {
        browser: 'Firefox (Desktop)',
        steps: [
          'Firefox desktop does not support PWA installation',
          'For the best experience, use <strong>Chrome</strong>, <strong>Edge</strong>, or <strong>Brave</strong>',
          'Alternatively, bookmark this page for quick access',
        ],
        note: 'Firefox removed PWA support for desktop in 2021.',
      };
    case 'brave':
      return {
        browser: 'Brave',
        steps: [
          'Click the install icon in the address bar (computer with down arrow)',
          'Or click the menu (≡) → <strong>Install Glow Props...</strong>',
          'Click <strong>Install</strong> to confirm',
        ],
        note: 'If the install option doesn\'t appear, check that Brave Shields isn\'t blocking it.',
      };
    case 'chrome':
    case 'edge':
      return {
        browser: browser === 'edge' ? 'Microsoft Edge' : 'Google Chrome',
        steps: [
          'Click the install icon in the address bar (computer with down arrow)',
          'Or click the menu (⋮) → <strong>Install Glow Props...</strong>',
          'Click <strong>Install</strong> to confirm',
        ],
      };
    default:
      return {
        browser: 'Your Browser',
        steps: [
          'Look for an <strong>Install</strong> or <strong>Add to Home Screen</strong> option in your browser menu',
          'For the best experience, use <strong>Chrome</strong>, <strong>Edge</strong>, or <strong>Brave</strong>',
        ],
      };
  }
}

// ===== Install Prompt =====
// Requirement: "Install app" menu item in burger menu + manual instructions for Safari/Firefox
// Approach: Consume the early-captured beforeinstallprompt event from the inline script
//   in index.html. Detect browser to show native install or manual instructions.
//   Listen for appinstalled to clean up state when install completes.
//   Hide when already installed or previously dismissed.

var deferredPrompt = null;
var browser = detectBrowser();
var isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
  navigator.standalone === true;
var supportsAutoInstall = browser === 'chrome' || browser === 'edge' || browser === 'brave';
var supportsManualInstall = browser === 'safari' || browser === 'firefox';
var dismissed = safeLocalGet('pwa-install-dismissed') === 'true';

// Consume early-captured event (repeat visits where SW fires before module loads)
if (window.__pwaInstallPromptEvent) {
  deferredPrompt = window.__pwaInstallPromptEvent;
  delete window.__pwaInstallPromptEvent;
}

// Module-level listeners attached behind a window flag so HMR doesn't double-subscribe.
// Pattern: TIMER_LEAKS.md variant 5. Paired teardown in the import.meta.hot.dispose() block at end.
if (typeof window !== 'undefined' && !window.__pwaModuleAttached) {
  window.__pwaModuleAttached = true;

  // Fallback listener — first-visit case where SW registers after module loads
  beforeInstallPromptListener = function (e) {
    e.preventDefault();
    deferredPrompt = e;
    updateInstallMenuVisibility();
  };
  window.addEventListener('beforeinstallprompt', beforeInstallPromptListener);

  // Requirement: Clean up install state when the app is actually installed.
  // Without this, the install menu item stays visible even after successful install.
  appInstalledListener = function () {
    deferredPrompt = null;
    isStandalone = true;
    updateInstallMenuVisibility();
  };
  window.addEventListener('appinstalled', appInstalledListener);
}

// For Safari/Firefox: show manual instructions after 1s if no native prompt fires
// Requirement: Non-Chromium browsers can still install PWAs manually; showing
//   instructions is better than hiding the feature entirely.
// Approach: 1-second timeout gives beforeinstallprompt time to fire first.
if (!isStandalone && !dismissed && supportsManualInstall) {
  manualInstallTimeoutId = setTimeout(function () {
    if (!deferredPrompt) {
      updateInstallMenuVisibility();
    }
  }, 1000);
}

// ===== Install Menu Item Visibility =====
// Requirement: Show "Install app" in burger menu only when installable and not dismissed
// Approach: Toggle hidden class on the menu item. Called on page load and when
//   beforeinstallprompt fires (which may happen after initial render).

function updateInstallMenuVisibility() {
  var canNativeInstall = !!deferredPrompt;
  var showInstall = !isStandalone && !dismissed && (canNativeInstall || supportsManualInstall);
  var installItems = document.querySelectorAll('.pwa-install-item');
  installItems.forEach(function (el) {
    if (showInstall) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });
}

// Initialize menu state (install visibility + auto-update indicator) after DOM is ready
function initMenuState() {
  updateInstallMenuVisibility();
  updateAutoUpdateIndicator();
}

if (document.readyState === 'loading') {
  domContentLoadedListener = initMenuState;
  document.addEventListener('DOMContentLoaded', domContentLoadedListener);
} else {
  initMenuState();
}

// ===== Install Action =====
// Called when user clicks "Install app" in burger menu

function triggerInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice
      .then(function (result) {
        if (result.outcome === 'dismissed') {
          dismissInstall();
        }
        deferredPrompt = null;
        updateInstallMenuVisibility();
      })
      .catch(function (err) {
        // Browser rejected the install prompt — clear state to avoid stale prompt.
        // Log for debugging — install prompt failures are otherwise invisible.
        if (typeof console !== 'undefined') console.warn('[PWA] Install prompt error:', err);
        deferredPrompt = null;
        updateInstallMenuVisibility();
      });
  } else if (supportsManualInstall) {
    showInstallModal();
  }
}

function dismissInstall() {
  dismissed = true;
  safeLocalSet('pwa-install-dismissed', 'true');
  updateInstallMenuVisibility();
}

// ===== Install Modal =====
// Requirement: Browser-specific step-by-step guides for non-technical users
// Approach: Data-driven modal that renders whatever getInstallInstructions() returns.
//   Includes benefits section to help users understand WHY to install.
//   Focus-trapped for keyboard accessibility.
//   Escape listener cleaned up on ALL close paths to prevent leaks.
// Alternative: Separate HTML template per browser — rejected, harder to maintain.

var activeEscapeHandler = null;

function closeInstallModal() {
  var modal = document.getElementById('pwa-install-modal');
  if (modal) modal.remove();
  if (activeEscapeHandler) {
    document.removeEventListener('keydown', activeEscapeHandler);
    activeEscapeHandler = null;
  }
}

function showInstallModal() {
  closeInstallModal();

  var instructions = getInstallInstructions(browser);

  // Build numbered steps from data
  var stepsHtml = instructions.steps.map(function (step, i) {
    return '<li class="flex gap-3 text-sm">' +
      '<span class="shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">' +
        (i + 1) +
      '</span>' +
      '<span class="text-base-content pt-0.5">' + step + '</span>' +
    '</li>';
  }).join('');

  // Build optional note
  var noteHtml = instructions.note
    ? '<div class="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-4">' +
        '<p class="text-xs text-warning"><strong>Note:</strong> ' + instructions.note + '</p>' +
      '</div>'
    : '';

  var modal = document.createElement('div');
  modal.id = 'pwa-install-modal';
  modal.className = 'fixed inset-0 z-60 flex items-center justify-center no-print';
  modal.style.padding = 'max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) max(1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left))';
  modal.innerHTML =
    '<div class="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer" id="pwa-install-backdrop"></div>' +
    '<div class="relative bg-base-100 rounded-xl border border-base-300 shadow-xl p-6 max-w-sm w-full" id="pwa-install-content">' +
      // Header with icon
      '<div class="flex items-center gap-3 mb-4">' +
        '<div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">' +
          '<svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">' +
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />' +
          '</svg>' +
        '</div>' +
        '<div>' +
          '<h3 class="text-lg font-semibold text-base-content">Install Glow Props</h3>' +
          '<p class="text-sm text-base-content/70">' + instructions.browser + '</p>' +
        '</div>' +
      '</div>' +
      // Steps
      '<ol class="space-y-2 mb-4">' + stepsHtml + '</ol>' +
      // Note
      noteHtml +
      // Benefits
      '<div class="border-t border-base-300 pt-4">' +
        '<p class="text-xs text-base-content/70 mb-2">Benefits of installing:</p>' +
        '<ul class="text-xs text-base-content/60 space-y-1">' +
          '<li class="flex items-center gap-2">' +
            '<svg class="w-3.5 h-3.5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>' +
            'Works offline' +
          '</li>' +
          '<li class="flex items-center gap-2">' +
            '<svg class="w-3.5 h-3.5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>' +
            'Launches from your dock or home screen' +
          '</li>' +
          '<li class="flex items-center gap-2">' +
            '<svg class="w-3.5 h-3.5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>' +
            'Full-screen experience without browser UI' +
          '</li>' +
        '</ul>' +
      '</div>' +
      // Actions
      '<div class="flex justify-end gap-2 mt-4">' +
        '<button type="button" id="pwa-install-modal-dismiss" class="btn btn-ghost">Not now</button>' +
        '<button type="button" id="pwa-install-modal-close" class="btn btn-primary">Got it</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);

  // Focus trap — keep Tab cycling within the modal content
  // Requirement: Keyboard users must be able to Tab within the modal without
  //   escaping to background content.
  // Approach: On Tab/Shift+Tab at boundary, wrap focus to the other end.
  var contentEl = document.getElementById('pwa-install-content');
  contentEl.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var focusable = contentEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Focus the first interactive element
  var firstButton = contentEl.querySelector('button');
  if (firstButton) firstButton.focus();

  // Event listeners
  document.getElementById('pwa-install-backdrop').addEventListener('click', closeInstallModal);
  document.getElementById('pwa-install-modal-close').addEventListener('click', closeInstallModal);
  document.getElementById('pwa-install-modal-dismiss').addEventListener('click', function () {
    dismissInstall();
    closeInstallModal();
  });

  activeEscapeHandler = function (e) {
    if (e.key === 'Escape') {
      closeInstallModal();
    }
  };
  document.addEventListener('keydown', activeEscapeHandler);
}

// ===== Expose to global scope =====
// The navbar partial's burger-menu items call these via onclick handlers
window.__pwa = {
  triggerInstall: triggerInstall,
  dismissInstall: dismissInstall,
  toggleAutoUpdate: toggleAutoUpdate,
  checkForUpdates: checkForUpdates,
};

// ===== HMR teardown =====
// Vite re-evaluates this module on hot reload. Without explicit cleanup the old
// copy's setInterval, setTimeout, and global listeners stay attached and a fresh
// set is added on top — visible as duplicate update checks and console noise in dev.
// Pattern: docs/implementations/TIMER_LEAKS.md variants 4 + 5.
if (import.meta.hot) {
  import.meta.hot.dispose(function () {
    if (swUpdateIntervalId !== null) clearInterval(swUpdateIntervalId);
    if (manualInstallTimeoutId !== null) clearTimeout(manualInstallTimeoutId);
    // Clearing the settle timeout leaves an in-flight checkForUpdates() promise
    // unresolved — benign: it belongs to the old module closure being discarded.
    if (checkSettleTimeoutId !== null) clearTimeout(checkSettleTimeoutId);
    toastTimeouts.forEach(clearTimeout);
    toastTimeouts.length = 0;
    if (beforeInstallPromptListener) {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptListener);
    }
    if (appInstalledListener) {
      window.removeEventListener('appinstalled', appInstalledListener);
    }
    if (domContentLoadedListener) {
      document.removeEventListener('DOMContentLoaded', domContentLoadedListener);
    }
    closeInstallModal();  // closes any open modal + clears its escape listener
    window.__pwaModuleAttached = false;
  });
}
