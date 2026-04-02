# Session Notes

## Worked on
Standardizing PWA install/update UI patterns across all repos based on cross-repo audit.

## Accomplished
- Audited PWA implementations across canva-grid, four-ems, sync-tone, and glow-props
- Rewrote PWA_SYSTEM.md suggested implementation, standardizing on canva-grid's patterns:
  - **usePWAUpdate**: ref-based interval cleanup (fixes interval leak on remount)
  - **usePWAInstall**: data-driven `getInstallInstructions()` with iOS/macOS Safari split from four-ems
  - **Toast system**: new section — context-based ToastProvider + useToast hook (replaces one-off DOM banners)
  - **InstallInstructionsModal**: data-driven rendering + focus trap + benefits section
  - **Install & Update UI Patterns**: new section documenting burger menu vs banner vs inline approaches
  - **Key Lessons**: reorganized into categories (Icons, Install, SW Updates, Caching, UI, General)
- Added `cleanupOutdatedCaches` and `globPatterns` to vite.config.js Workbox config
- Added Cache Headers, ChunkLoadError Prevention, and Platform Gotchas sections

## Current state
- Build clean (15 precache entries, 301.83 KiB)
- Branch: claude/improve-pwa-updates-tYFSG

## Key context
- canva-grid is the base pattern — data-driven install instructions, context-based toast, focus-trapped modal
- four-ems iOS/macOS Safari split merged into canva-grid's `getInstallInstructions()` via UA sniffing
- sync-tone's module-level singleton pattern was NOT adopted (adds complexity only needed for Expo's frequent remounts)
- glow-props is vanilla JS — uses `virtual:pwa-register` directly, not the React hooks. The suggested implementation covers the React pattern.
