// Requirement: preference reads/writes must not throw in sandboxed iframes or
//   private browsing, where even touching the storage global can throw.
// Approach: one shared wrapper module (THEME_DARK_MODE.md key lesson 11 —
//   don't inline try/catch in every consumer). The globals are referenced
//   INSIDE the try so the property access itself is guarded.
// Alternative: per-module private copies (the pre-React shape) — rejected,
//   four consumers now share these and the repetition invited drift.

export function safeLocalGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

export function safeLocalSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* unavailable — no persistence */ }
}

export function safeLocalRemove(key) {
  try { localStorage.removeItem(key); } catch { /* unavailable */ }
}

export function safeSessionGet(key) {
  try { return sessionStorage.getItem(key); } catch { return null; }
}

export function safeSessionSet(key, value) {
  try { sessionStorage.setItem(key, value); } catch { /* unavailable — no persistence */ }
}
