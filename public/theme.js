// Requirement: Theme combo picker + dark/light toggle + burger menu behavior
// Approach: Single IIFE handles theme combos (light/dark pairs), dark/light toggle,
//   and burger menu open/close. Theme combos stored in localStorage as a key string.
//   Each combo defines a light and dark DaisyUI theme name.
// Alternative: Separate scripts — rejected, both need to bind to the same DOM

(function () {
  // ===== Theme Combos =====
  // Requirement: Curated light/dark theme pairs the user can switch between
  // Approach: Array of combo objects with human-readable labels and DaisyUI theme names.
  //   First combo is the default (caramellatte/coffee — warm, current look).
  // Alternative: Let users pick any light + any dark independently — rejected,
  //   untested combos can produce clashing colors. Curated pairs ensure quality.
  // Properties: key (localStorage ID), light/dark (DaisyUI theme names).
  // Display labels live in the HTML — this array is the data source for
  // theme resolution only. HTML is the source of truth for user-facing text.
  var COMBOS = [
    { key: 'caramel-coffee',   light: 'caramellatte', dark: 'coffee' },
    { key: 'nord-night',       light: 'nord',         dark: 'night' },
    { key: 'emerald-forest',   light: 'emerald',      dark: 'forest' },
    { key: 'autumn-dim',       light: 'autumn',       dark: 'dim' },
    { key: 'cupcake-dracula',  light: 'cupcake',      dark: 'dracula' },
    { key: 'lofi-black',       light: 'lofi',         dark: 'black' },
    { key: 'garden-luxury',    light: 'garden',       dark: 'luxury' },
    { key: 'pastel-synthwave', light: 'pastel',       dark: 'synthwave' },
  ];

  var DEFAULT_COMBO_KEY = 'caramel-coffee';

  // ===== Storage helpers =====
  function safeStorageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* sandboxed */ }
  }

  function safeStorageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  // ===== Combo resolution =====
  function getCombo(key) {
    for (var i = 0; i < COMBOS.length; i++) {
      if (COMBOS[i].key === key) return COMBOS[i];
    }
    return COMBOS[0];
  }

  function getCurrentComboKey() {
    return safeStorageGet('themeCombo') || DEFAULT_COMBO_KEY;
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
  function applyTheme(dark, comboKey, skipPersist) {
    var combo = getCombo(comboKey);
    var themeName = dark ? combo.dark : combo.light;

    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('data-theme', themeName);

    if (!skipPersist) {
      safeStorageSet('darkMode', dark);
      safeStorageSet('themeCombo', comboKey);
    }
    updateThemeLabels(dark);
    updateComboIndicators(comboKey);
  }

  // ===== UI label updates =====
  // Requirement: Show correct theme label based on current dark/light state
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

  // Requirement: Show which combo is currently active in the picker
  function updateComboIndicators(comboKey) {
    var items = document.querySelectorAll('[data-combo]');
    items.forEach(function (el) {
      var check = el.querySelector('.combo-check');
      if (el.getAttribute('data-combo') === comboKey) {
        if (check) check.classList.remove('invisible');
        el.classList.add('bg-base-200');
      } else {
        if (check) check.classList.add('invisible');
        el.classList.remove('bg-base-200');
      }
    });
  }

  // ===== Initialize =====
  var currentComboKey = getCurrentComboKey();
  updateThemeLabels(isDark());
  updateComboIndicators(currentComboKey);

  // ===== Dark/Light toggle =====
  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      applyTheme(!isDark(), getCurrentComboKey());
    });
  }

  // ===== Combo picker =====
  // Requirement: Clicking a combo switches both light and dark themes for that pair
  // Approach: Event delegation on [data-combo] buttons — one handler for all combos
  document.addEventListener('click', function (e) {
    var comboBtn = e.target.closest('[data-combo]');
    if (!comboBtn) return;
    var key = comboBtn.getAttribute('data-combo');
    if (key) {
      applyTheme(isDark(), key);
    }
  });

  // ===== Cross-tab sync =====
  // storage event only fires in other tabs — values already written by
  // the originating tab, so skipPersist avoids redundant writes
  window.addEventListener('storage', function (e) {
    if (e.key === 'darkMode' || e.key === 'themeCombo') {
      var dark = safeStorageGet('darkMode') === 'true';
      var combo = getCurrentComboKey();
      applyTheme(dark, combo, true);
    }
  });

  // Track OS preference changes when user hasn't made an explicit choice
  var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', function (e) {
    if (safeStorageGet('darkMode') === null) {
      applyTheme(e.matches, getCurrentComboKey());
    }
  });

  // ===== Burger Menu =====
  // Requirement: Disclosure-pattern dropdown with backdrop, Escape, focus management
  // Approach: Toggle hidden attribute + aria-expanded. Close on backdrop click,
  //   Escape key, and [data-close] item clicks. Focus first item on open.
  // Alternative: CSS-only :focus-within — rejected, can't trap Escape or backdrop

  var trigger = document.getElementById('burger-trigger');
  var menu = document.getElementById('burger-menu');
  var backdrop = document.getElementById('burger-backdrop');

  if (trigger && menu && backdrop) {
    // Requirement: Smooth open/close transitions for burger menu
    // Approach: CSS opacity+scale transitions, toggled via classes.
    //   pointer-events-none when closed prevents interaction with invisible menu.
    //   Replaces hidden attribute which prevents any transition.
    // Alternative: hidden attribute — rejected, no transition possible
    var menuOpen = false;

    function openMenu() {
      menuOpen = true;
      backdrop.classList.remove('pointer-events-none', 'opacity-0');
      backdrop.classList.add('pointer-events-auto', 'opacity-100');
      menu.classList.remove('pointer-events-none', 'opacity-0', 'scale-95');
      menu.classList.add('pointer-events-auto', 'opacity-100', 'scale-100');
      trigger.setAttribute('aria-expanded', 'true');
      // Focus first menu item after transition starts
      requestAnimationFrame(function () {
        var first = menu.querySelector('a, button');
        if (first) first.focus();
      });
    }

    function closeMenu() {
      menuOpen = false;
      backdrop.classList.remove('pointer-events-auto', 'opacity-100');
      backdrop.classList.add('pointer-events-none', 'opacity-0');
      menu.classList.remove('pointer-events-auto', 'opacity-100', 'scale-100');
      menu.classList.add('pointer-events-none', 'opacity-0', 'scale-95');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    }

    function isOpen() {
      return menuOpen;
    }

    trigger.addEventListener('click', function () {
      if (isOpen()) closeMenu();
      else openMenu();
    });

    // Close on backdrop click — cursor-pointer in CSS ensures iOS Safari fires this
    backdrop.addEventListener('click', closeMenu);

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) {
        e.preventDefault();
        closeMenu();
      }
    });

    // Close menu when clicking [data-close] items (nav links, PDF button)
    // Theme toggle and combo picker do NOT have data-close — menu stays open
    menu.addEventListener('click', function (e) {
      var item = e.target.closest('[data-close]');
      if (item) {
        // Small delay so anchor navigation or action fires before close
        setTimeout(closeMenu, 100);
      }
    });
  }
})();
