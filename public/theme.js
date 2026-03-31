// Requirement: Theme toggle + burger menu behavior for vanilla HTML pages
// Approach: Single IIFE handles both concerns — theme persistence/sync and
//   burger menu open/close with backdrop, Escape key, and focus management
// Alternative: Separate scripts — rejected, both need to bind to the same DOM

(function () {
  // ===== Theme Toggle =====
  var toggle = document.getElementById('theme-toggle');

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function safeStorageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* sandboxed */ }
  }

  function safeStorageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function setTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    safeStorageSet('darkMode', dark);
  }

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
