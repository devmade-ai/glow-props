// Requirement: PWA service worker registration, update prompts, and install detection
// Approach: Import vite-plugin-pwa's virtual module for SW registration. Handle update
//   prompts (user-controlled via registerType: 'prompt'), install prompt capture, and
//   browser-specific install instructions. All vanilla JS — no React.
// Alternative: Manual SW registration — rejected, vite-plugin-pwa handles caching strategy
// Alternative: autoUpdate — rejected, silently refreshes mid-browsing

import { registerSW } from 'virtual:pwa-register';

// ===== Service Worker Registration & Update Detection =====
// Requirement: Users must be notified when a new version is available and control
//   when the update applies (registerType: 'prompt').
// Approach: registerSW returns an update function. onNeedRefresh fires when a new
//   SW is installed and waiting. onOfflineReady fires when the app is fully cached.
//   Periodic update checks every 60 minutes for users who keep tabs open (critical
//   for Safari, which doesn't close backgrounded PWAs).
// Note: Unlike React hooks, this module runs once — no remount/interval leak concern.

var updateSW = null;
var CHECK_INTERVAL_MS = 60 * 60 * 1000;

updateSW = registerSW({
  onNeedRefresh: function () {
    showUpdateBanner();
  },
  onOfflineReady: function () {
    showToast('Ready for offline use.', 'success');
  },
  onRegisteredSW: function (_url, registration) {
    if (registration) {
      setInterval(function () {
        registration.update();
      }, CHECK_INTERVAL_MS);
    }
  },
});

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

  setTimeout(function () {
    // Exit animation
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(function () {
      toast.remove();
    }, 200);
  }, duration);
}

// ===== Update Banner =====
// Requirement: Non-intrusive banner when a new version is available
// Approach: Fixed bottom banner with "Update" and "Later" actions.
//   User controls when the update applies — no silent refresh.
//   Safe area inset on bottom for iPhone home indicator in standalone mode.
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
    if (updateSW) updateSW(true);
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
var dismissed = false;
try { dismissed = localStorage.getItem('pwa-install-dismissed') === 'true'; } catch (e) {
  // localStorage unavailable (sandboxed iframe, private browsing) — default to not dismissed
}

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

// Requirement: Clean up install state when the app is actually installed
// Approach: Listen for appinstalled event. Clear deferred prompt and hide menu item.
// Without this, the install menu item stays visible even after successful install.
window.addEventListener('appinstalled', function () {
  deferredPrompt = null;
  isStandalone = true;
  updateInstallMenuVisibility();
});

// For Safari/Firefox: show manual instructions after 1s if no native prompt fires
// Requirement: Non-Chromium browsers can still install PWAs manually; showing
//   instructions is better than hiding the feature entirely.
// Approach: 1-second timeout gives beforeinstallprompt time to fire first.
if (!isStandalone && !dismissed && supportsManualInstall) {
  setTimeout(function () {
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
  try { localStorage.setItem('pwa-install-dismissed', 'true'); } catch (e) {
    // localStorage unavailable — dismiss will not persist across reloads
  }
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
// theme.js burger menu calls these via onclick handlers
window.__pwa = {
  triggerInstall: triggerInstall,
  dismissInstall: dismissInstall,
};
