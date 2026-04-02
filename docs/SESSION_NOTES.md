# Session Notes

## Worked on
Organizing suggested implementations into standalone files, rewriting THEME_DARK_MODE.md, and implementing PWA support.

## Accomplished
- Extracted all 7 suggested implementations from inline CLAUDE.md into `docs/implementations/`
- Rewrote THEME_DARK_MODE.md to reflect actual DaisyUI-based approach across all three projects
- Implemented PWA support: service worker, offline caching, install prompt, update banner

## Current state
- Site builds cleanly with `vite build` — PWA generates manifest, SW, and precaches 11 entries (~270KB)
- PWA: installable on Chromium (native prompt), Safari/Firefox (manual instructions in modal)
- Update banner appears when a new SW version is available; user controls when to apply
- Offline toast auto-dismisses after 3s on first cache completion
- "Install app" menu item in burger menu, hidden when already installed or dismissed
- Branch: claude/organize-implementations-folder-DBcuk

## Key context
- glow-props is vanilla JS (no React) — pwa.js uses `virtual:pwa-register` (not the React hook)
- `registerType: 'prompt'` — user controls updates, no silent refresh
- `beforeinstallprompt` captured in inline script (both HTML files) before module scripts load
- `window.__pwa` exposes `triggerInstall()` and `dismissInstall()` for burger menu onclick handlers
- Icon assets: 48px favicon, 192px + 512px (purpose: any), 1024px (purpose: maskable)
- Base path is `/glow-props/` — manifest scope, start_url, and id all account for this
- `theme.js` is loaded as a classic script (not module) intentionally — it runs synchronously for flash prevention. Vite's warning about this is expected and harmless.
