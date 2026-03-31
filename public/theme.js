// Requirement: User-controlled dark/light mode with persistence and cross-tab sync
// Approach: Toggle data-theme attribute on <html> (Pico CSS convention), persist
//   to localStorage, listen for cross-tab changes and OS preference changes
// Alternative: .dark class — rejected, Pico CSS uses [data-theme] for dark mode

(function () {
  var toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

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
