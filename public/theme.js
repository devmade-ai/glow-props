// Requirement: Theme toggle + burger menu behavior for vanilla HTML pages
// Approach: Single IIFE handles both concerns — theme persistence/sync and
//   burger menu open/close with backdrop, Escape key, and focus management.
//   Theme uses both .dark class (Tailwind dark: variant) and data-theme
//   attribute (DaisyUI component colors) — both must be set together.
// Alternative: Separate scripts — rejected, both need to bind to the same DOM

(function () {
  // ===== Theme Toggle =====
  var toggle = document.getElementById('theme-toggle');

  function isDark() {
    return document.documentElement.classList.contains('dark');
  }

  function safeStorageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* sandboxed */ }
  }

  function safeStorageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  // Requirement: Both .dark class and data-theme must be set together
  // Why: Tailwind dark: variant reads .dark class on <html>;
  //   DaisyUI component colors read data-theme attribute.
  //   If only one is set, custom dark: utilities and DaisyUI components
  //   fall out of sync — e.g. dark: hover states on light DaisyUI bg.
  function setTheme(dark) {
    if (dark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'coffee');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'caramellatte');
    }
    safeStorageSet('darkMode', dark);
    updateThemeLabels(dark);
  }

  // Requirement: Show correct theme label based on current theme
  // Approach: Toggle hidden class on label spans via JS
  // Why: Previously used CSS [data-theme="dark"] selectors from Pico —
  //   now handled in JS since the toggle controls both class and attribute
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

  // Set initial label state from current theme
  updateThemeLabels(isDark());

  if (toggle) {
    toggle.addEventListener('click', function () {
      setTheme(!isDark());
    });
  }

  // Cross-tab sync — storage event only fires in other tabs
  window.addEventListener('storage', function (e) {
    if (e.key === 'darkMode' && e.newValue !== null) {
      setTheme(e.newValue === 'true');
    }
  });

  // Track OS preference changes when user hasn't made an explicit choice
  var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', function (e) {
    if (safeStorageGet('darkMode') === null) {
      setTheme(e.matches);
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
    function openMenu() {
      menu.hidden = false;
      backdrop.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      // Focus first menu item after DOM update
      requestAnimationFrame(function () {
        var first = menu.querySelector('a, button');
        if (first) first.focus();
      });
    }

    function closeMenu() {
      menu.hidden = true;
      backdrop.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    }

    function isOpen() {
      return !menu.hidden;
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
    // Theme toggle does NOT have data-close — menu stays open for quick toggling
    menu.addEventListener('click', function (e) {
      var item = e.target.closest('[data-close]');
      if (item) {
        // Small delay so anchor navigation or action fires before close
        setTimeout(closeMenu, 100);
      }
    });
  }
})();
