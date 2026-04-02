// Requirement: PWA service worker registration, update prompts, and install detection
// Approach: Import vite-plugin-pwa's virtual module for SW registration. Handle update
//   prompts (user-controlled via registerType: 'prompt'), install prompt capture, and
//   browser-specific install instructions. All vanilla JS — no React.
// Alternative: Manual SW registration — rejected, vite-plugin-pwa handles caching strategy
// Alternative: autoUpdate — rejected, silently refreshes mid-browsing

import { registerSW } from 'virtual:pwa-register';

// ===== Service Worker Registration & Update Detection =====
// registerType: 'prompt' means the new SW waits until the user explicitly accepts.
// The onNeedRefresh callback fires when a new SW is installed and waiting.
// The onOfflineReady callback fires when the app is fully cached for offline use.

var updateSW = null;

var CHECK_INTERVAL_MS = 60 * 60 * 1000; // Check for new SW every 60 minutes

updateSW = registerSW({
  onNeedRefresh: function () {
    showUpdateBanner();
  },
  onOfflineReady: function () {
    showOfflineToast();
  },
  onRegisteredSW: function (url, registration) {
    if (registration) {
      setInterval(function () {
        registration.update();
      }, CHECK_INTERVAL_MS);
    }
  },
});

// ===== Update Banner =====
// Requirement: Non-intrusive banner when a new version is available
// Approach: Fixed bottom banner with "Update" and "Dismiss" actions.
//   User controls when the update applies — no silent refresh.
//   Safe area inset on bottom for iPhone home indicator in standalone mode.

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
    if (updateSW) updateSW(true); // true = force reload after SW activates
  });
  document.getElementById('pwa-update-dismiss').addEventListener('click', function () {
    banner.remove();
  });
}

// ===== Offline Toast =====
// Requirement: Brief confirmation when the app is cached and ready for offline use
// Approach: Auto-dismiss toast after 3 seconds. Non-intrusive.

function showOfflineToast() {
  var toast = document.createElement('div');
  toast.className = 'fixed left-4 right-4 z-70 ' +
    'rounded-xl bg-base-200 border border-base-300 px-4 py-3 shadow-lg ' +
    'max-w-md mx-auto text-sm text-base-content text-center no-print';
  toast.style.bottom = 'max(1rem, env(safe-area-inset-bottom))';
  toast.textContent = 'Ready for offline use.';
  document.body.appendChild(toast);
  setTimeout(function () {
    toast.remove();
  }, 3000);
}

// ===== Install Prompt =====
// Requirement: "Install app" menu item in burger menu + manual instructions for Safari/Firefox
// Approach: Consume the early-captured beforeinstallprompt event from the inline script.
//   Detect browser to show native install or manual instructions.
//   Hide when already installed or previously dismissed.

var deferredPrompt = null;

// Consume early-captured event (repeat visits where SW fires before module loads)
if (window.__pwaInstallPromptEvent) {
  deferredPrompt = window.__pwaInstallPromptEvent;
  delete window.__pwaInstallPromptEvent;
}

// Fallback listener — first-visit case where SW registers after module loads
window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();
  deferredPrompt = e;
  updateInstallMenuVisibility();
});

// Detect if already in standalone mode (installed)
var isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
  navigator.standalone === true;

// Detect browser for manual install instructions
function detectBrowser() {
  var ua = navigator.userAgent;
  if (navigator.brave) return 'brave';
  if (/Edg\//i.test(ua)) return 'edge';
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return 'chrome';
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    return /iPhone|iPad|iPod/.test(ua) ? 'safari-ios' : 'safari-macos';
  }
  if (/Firefox/i.test(ua)) {
    return /Android/i.test(ua) ? 'firefox-android' : 'firefox-desktop';
  }
  return 'unknown';
}

var browser = detectBrowser();
var canNativeInstall = !!deferredPrompt;
var needsManualInstructions = ['safari-ios', 'safari-macos', 'firefox-android'].includes(browser);
var dismissed = false;
try { dismissed = localStorage.getItem('pwa-install-dismissed') === 'true'; } catch (e) { /* sandboxed */ }

// ===== Install Menu Item Visibility =====
// Requirement: Show "Install app" in burger menu only when installable and not dismissed
// Approach: Toggle hidden class on the menu item. Called on page load and when
//   beforeinstallprompt fires (which may happen after initial render).

function updateInstallMenuVisibility() {
  canNativeInstall = !!deferredPrompt;
  var showInstall = !isStandalone && !dismissed && (canNativeInstall || needsManualInstructions);
  var installItems = document.querySelectorAll('.pwa-install-item');
  installItems.forEach(function (el) {
    if (showInstall) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });
}

// Initialize visibility after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateInstallMenuVisibility);
} else {
  updateInstallMenuVisibility();
}

// ===== Install Action =====
// Called when user clicks "Install app" in burger menu

function triggerInstall() {
  if (deferredPrompt) {
    // Chromium native install
    deferredPrompt.prompt();
    deferredPrompt.userChoice
      .then(function (result) {
        if (result.outcome === 'dismissed') {
          dismissInstall();
        }
        deferredPrompt = null;
        updateInstallMenuVisibility();
      })
      .catch(function () {
        // Browser rejected the install prompt — clear state to avoid stale prompt
        deferredPrompt = null;
        updateInstallMenuVisibility();
      });
  } else if (needsManualInstructions) {
    showManualInstallInstructions();
  }
}

function dismissInstall() {
  dismissed = true;
  try { localStorage.setItem('pwa-install-dismissed', 'true'); } catch (e) { /* sandboxed */ }
  updateInstallMenuVisibility();
}

// ===== Manual Install Instructions =====
// Requirement: Browser-specific step-by-step guides for Safari and Firefox
// Approach: Simple modal with plain language instructions for non-technical users.
//   Escape listener is cleaned up on ALL close paths (not just Escape) to prevent leaks.

// Track active Escape listener so it can be cleaned up from any close path
var activeEscapeHandler = null;

function closeInstallModal() {
  var modal = document.getElementById('pwa-install-modal');
  if (modal) modal.remove();
  if (activeEscapeHandler) {
    document.removeEventListener('keydown', activeEscapeHandler);
    activeEscapeHandler = null;
  }
}

function showManualInstallInstructions() {
  closeInstallModal(); // Clean up any existing modal + listener

  var steps = '';
  if (browser === 'safari-ios') {
    steps =
      '<li>Tap the <strong>Share</strong> button (square with arrow) in Safari\'s toolbar</li>' +
      '<li>Scroll down and tap <strong>Add to Home Screen</strong></li>' +
      '<li>Tap <strong>Add</strong> in the top right</li>';
  } else if (browser === 'safari-macos') {
    steps =
      '<li>Click <strong>File</strong> in the menu bar</li>' +
      '<li>Click <strong>Add to Dock</strong></li>';
  } else if (browser === 'firefox-android') {
    steps =
      '<li>Tap the <strong>three-dot menu</strong> (⋮) in Firefox</li>' +
      '<li>Tap <strong>Install</strong></li>' +
      '<li>Tap <strong>Install</strong> again to confirm</li>';
  }

  var modal = document.createElement('div');
  modal.id = 'pwa-install-modal';
  modal.className = 'fixed inset-0 z-60 flex items-center justify-center no-print';
  modal.style.padding = 'max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) max(1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left))';
  modal.innerHTML =
    '<div class="fixed inset-0 bg-black/50 cursor-pointer" id="pwa-install-backdrop"></div>' +
    '<div class="relative bg-base-100 rounded-xl border border-base-300 shadow-xl p-6 max-w-sm w-full">' +
      '<h3 class="font-heading text-lg font-bold mb-3">Install Glow Props</h3>' +
      '<ol class="list-decimal list-inside space-y-2 text-sm text-base-content/80">' + steps + '</ol>' +
      '<div class="flex justify-end gap-2 mt-4">' +
        '<button type="button" id="pwa-install-modal-dismiss" class="btn btn-ghost">Not now</button>' +
        '<button type="button" id="pwa-install-modal-close" class="btn btn-primary">Got it</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);

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
// theme.js burger menu calls these via onclick handlers
window.__pwa = {
  triggerInstall: triggerInstall,
  dismissInstall: dismissInstall,
};
