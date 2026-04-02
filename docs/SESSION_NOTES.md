# Session Notes

## Worked on
Improving PWA update system based on research into vite-plugin-pwa best practices.

## Accomplished
- Added `cleanupOutdatedCaches: true` and `globPatterns` to Workbox config in vite.config.js
- Updated PWA_SYSTEM.md suggested implementation with research findings:
  - Added Cache Headers section (no-cache for index.html/sw.js, immutable for hashed assets, GitHub Pages note)
  - Added ChunkLoadError Prevention section with lazy-load retry wrapper pattern
  - Added Platform Gotchas section (Safari caching, navigation overlap, Workbox timing heuristic, autoUpdate→prompt danger, Expo Web incompatibility)
  - Added workbox-window dev dependency note for React projects
  - Added navigateFallback SPA-only guidance
  - Added 4 new Key Lessons (cleanupOutdatedCaches, globPatterns, navigateFallback, cache headers)

## Current state
- Build clean (15 precache entries, 297.54 KiB)
- Branch: claude/improve-pwa-updates-tYFSG

## Key context
- glow-props is a multi-page app (index.html + project.html) — `navigateFallback` must NOT be set
- PWA implementation is vanilla JS (not React) — uses `virtual:pwa-register` directly
- GitHub Pages hosting means no control over HTTP cache headers, but SW precache layer handles staleness
