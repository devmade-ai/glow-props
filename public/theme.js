// Requirement: Per-mode individual theme picker + dark/light toggle + burger menu behavior
// Approach: Single IIFE handles individual theme selection (separate light/dark choices),
//   dark/light toggle, and burger menu open/close. Each mode stores its own DaisyUI theme
//   name in localStorage. Toggle flips between modes and applies the stored theme.
// Alternative: Theme combos (curated light/dark pairs) — rejected, users want independent
//   control over their light and dark theme choices without artificial pairing constraints.

(function () {
  // ===== Defaults =====
  // Requirement: Sensible defaults for first-time visitors
  // Approach: caramellatte (light) and coffee (dark) — warm, welcoming feel.
  //   Users who never touch the picker get a polished default.
  var DEFAULT_LIGHT_THEME = 'caramellatte';
  var DEFAULT_DARK_THEME = 'coffee';

  // ===== Storage helpers =====
  function safeStorageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* sandboxed */ }
  }

  function safeStorageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  // ===== Theme resolution =====
  // Requirement: Each mode stores its own theme independently
  // Approach: Two localStorage keys — lightTheme and darkTheme.
  //   Falls back to defaults if no stored value.
  function getStoredTheme(dark) {
    if (dark) {
      return safeStorageGet('darkTheme') || DEFAULT_DARK_THEME;
    }
    return safeStorageGet('lightTheme') || DEFAULT_LIGHT_THEME;
  }

  // ===== Theme application =====
  // Requirement: Both .dark class and data-theme must be set together
  // Why: Tailwind dark: variant reads .dark class on <html>;
  //   DaisyUI component colors read data-theme attribute.
  //   If only one is set, custom dark: utilities and DaisyUI components
  //   fall out of sync — e.g. dark: hover states on light DaisyUI bg.
  function isDark() {
    return document.documentElement.classList.contains('dark');
  }

  // skipPersist: when true, skip writing to localStorage.
  // Used by the cross-tab sync handler — the values already came from
  // another tab's localStorage write, so writing them back is redundant.
  function applyTheme(dark, themeName, skipPersist) {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('data-theme', themeName);

    if (!skipPersist) {
      safeStorageSet('darkMode', dark);
      safeStorageSet(dark ? 'darkTheme' : 'lightTheme', themeName);
    }
    updateThemeLabels(dark);
    updateThemeListVisibility(dark);
    updateThemeIndicators(themeName);
  }

  // ===== UI updates =====
  // Requirement: Show correct toggle label based on current dark/light state
  function updateThemeLabels(dark) {
    var darkLabels = document.querySelectorAll('.theme-label-dark');
    var lightLabels = document.querySelectorAll('.theme-label-light');
    darkLabels.forEach(function (el) {
      if (dark) el.classList.remove('hidden');
      else el.classList.add('hidden');
    });
    lightLabels.forEach(function (el) {
      if (dark) el.classList.add('hidden');
      else el.classList.remove('hidden');
    });
  }

  // Requirement: Show which theme list matches the current mode
  // Approach: Toggle visibility of .theme-list-light and .theme-list-dark containers.
  //   Only the active mode's themes are visible in the picker.
  function updateThemeListVisibility(dark) {
    var lightLists = document.querySelectorAll('.theme-list-light');
    var darkLists = document.querySelectorAll('.theme-list-dark');
    lightLists.forEach(function (el) {
      if (dark) el.classList.add('hidden');
      else el.classList.remove('hidden');
    });
    darkLists.forEach(function (el) {
      if (dark) el.classList.remove('hidden');
      else el.classList.add('hidden');
    });

    // Update section header to reflect current mode
    var lightHeaders = document.querySelectorAll('.theme-section-label-light');
    var darkHeaders = document.querySelectorAll('.theme-section-label-dark');
    lightHeaders.forEach(function (el) {
      if (dark) el.classList.add('hidden');
      else el.classList.remove('hidden');
    });
    darkHeaders.forEach(function (el) {
      if (dark) el.classList.remove('hidden');
      else el.classList.add('hidden');
    });
  }

  // Requirement: Show which theme is currently active in the picker
  function updateThemeIndicators(themeName) {
    var items = document.querySelectorAll('[data-theme-pick]');
    items.forEach(function (el) {
      var check = el.querySelector('.theme-check');
      if (el.getAttribute('data-theme-pick') === themeName) {
        if (check) check.classList.remove('invisible');
        el.classList.add('bg-base-200');
      } else {
        if (check) check.classList.add('invisible');
        el.classList.remove('bg-base-200');
      }
    });
  }

  // ===== Initialize =====
  var currentDark = isDark();
  var currentTheme = getStoredTheme(currentDark);
  updateThemeLabels(currentDark);
  updateThemeListVisibility(currentDark);
  updateThemeIndicators(currentTheme);

  // ===== Dark/Light toggle =====
  // Requirement: Toggle switches mode AND applies the stored theme for the new mode
  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var newDark = !isDark();
      var theme = getStoredTheme(newDark);
      applyTheme(newDark, theme);
    });
  }

  // ===== Theme picker =====
  // Requirement: Clicking a theme stores it for the current mode and applies it
  // Approach: Event delegation on [data-theme-pick] buttons — one handler for all themes
  document.addEventListener('click', function (e) {
    var themeBtn = e.target.closest('[data-theme-pick]');
    if (!themeBtn) return;
    var themeName = themeBtn.getAttribute('data-theme-pick');
    if (themeName) {
      applyTheme(isDark(), themeName);
    }
  });

  // ===== Cross-tab sync =====
  // storage event only fires in other tabs — values already written by
  // the originating tab, so skipPersist avoids redundant writes
  window.addEventListener('storage', function (e) {
    if (e.key === 'darkMode' || e.key === 'lightTheme' || e.key === 'darkTheme') {
      var dark = safeStorageGet('darkMode') === 'true';
      var theme = getStoredTheme(dark);
      applyTheme(dark, theme, true);
    }
  });

  // Track OS preference changes when user hasn't made an explicit choice
  var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', function (e) {
    if (safeStorageGet('darkMode') === null) {
      var theme = getStoredTheme(e.matches);
      applyTheme(e.matches, theme);
    }
  });

  // ===== Burger Menu =====
  // Requirement: Disclosure-pattern dropdown with Escape, focus management, click-outside
  // Approach: CSS opacity+scale transitions toggled via class swaps + aria-expanded.
  //   Close on click-outside (document handler), Escape key, and [data-close] item clicks.
  //   Focus first item on open, return focus to trigger on close.
  //   Body scroll locked while open to prevent scroll-through on mobile.
  // Why no backdrop overlay: The navbar's backdrop-filter (backdrop-blur-md) creates a
  //   containing block that traps position:fixed children. A backdrop inside the navbar
  //   only covers the navbar area. Moving it outside would cover the menu too (the menu
  //   is inside the navbar's stacking context at z-30, so an external backdrop at z-40
  //   would sit above it). Document click handler is more robust regardless.
  // Alternative: CSS-only :focus-within — rejected, can't trap Escape or click-outside

  var trigger = document.getElementById('burger-trigger');
  var menu = document.getElementById('burger-menu');

  if (trigger && menu) {
    // Requirement: Smooth open/close transitions for burger menu
    // Approach: CSS opacity+scale transitions, toggled via classes.
    //   pointer-events-none when closed prevents interaction with invisible menu.
    // Alternative: hidden attribute — rejected, no transition possible
    var menuOpen = false;

    function openMenu() {
      menuOpen = true;
      menu.classList.remove('pointer-events-none', 'opacity-0', 'scale-95');
      menu.classList.add('pointer-events-auto', 'opacity-100', 'scale-100');
      trigger.setAttribute('aria-expanded', 'true');
      // Requirement: Prevent body scroll while menu is open
      // Approach: Lock body overflow. Only one component touches this, so
      //   no double-lock conflict (see CLAUDE.md overscroll-contain note).
      // Why not overscroll-contain alone: it only prevents chaining on
      //   scroll containers. Taps on non-scrollable menu areas (nav links,
      //   toggle) still chain to the body without this lock.
      document.body.style.overflow = 'hidden';
      // Focus first menu item after transition starts
      requestAnimationFrame(function () {
        var first = menu.querySelector('a, button');
        if (first) first.focus();
      });
    }

    function closeMenu() {
      menuOpen = false;
      menu.classList.remove('pointer-events-auto', 'opacity-100', 'scale-100');
      menu.classList.add('pointer-events-none', 'opacity-0', 'scale-95');
      trigger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      trigger.focus();
    }

    function isOpen() {
      return menuOpen;
    }

    trigger.addEventListener('click', function () {
      if (isOpen()) closeMenu();
      else openMenu();
    });

    // Requirement: Tap/click outside menu closes it
    // Approach: Document-level click handler checks if target is outside menu+trigger.
    document.addEventListener('click', function (e) {
      if (menuOpen && !menu.contains(e.target) && !trigger.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        e.preventDefault();
        closeMenu();
      }
    });

    // Close menu when clicking [data-close] items (nav links, PDF button)
    // Theme toggle and theme picker do NOT have data-close — menu stays open
    menu.addEventListener('click', function (e) {
      var item = e.target.closest('[data-close]');
      if (item) {
        // Small delay so anchor navigation or action fires before close
        setTimeout(closeMenu, 100);
      }
    });
  }
})();
