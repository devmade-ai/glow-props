// Requirement: User-controlled dark/light mode with persistence and cross-tab sync
// Approach: Toggle .dark class on <html>, persist to localStorage, listen for
//   cross-tab changes via storage event and OS preference changes via matchMedia
// Alternative: CSS-only prefers-color-scheme — rejected, no user override

(function () {
  var toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  function isDark() {
    return document.documentElement.classList.contains('dark');
  }

  function safeStorageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* sandboxed */ }
  }

  function safeStorageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function setTheme(dark) {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    safeStorageSet('darkMode', dark);
  }

  toggle.addEventListener('click', function () {
    setTheme(!isDark());
  });

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
})();
