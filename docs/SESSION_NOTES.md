# Session Notes

## Worked on
Theme toggle refactor — replaced combo system with per-mode individual theme picker.

## Accomplished
- Replaced 8 curated theme combos with full DaisyUI catalogue (35 themes: 22 light, 13 dark)
- Dark/light toggle now controls which theme list is shown in the burger menu
- Each mode stores its own theme independently (`lightTheme`/`darkTheme` in localStorage)
- Simplified flash prevention scripts — no combo map needed, just reads two storage keys
- Eliminated combo map duplication across 3 files (was flagged as tech debt in TODO.md)
- All 35 DaisyUI themes registered in main.css
- Theme lists scroll independently within the menu (max-h-52 with overflow-y-auto)
- Each theme has a mood/style tag (Warm, Cool, Gothic, Minimal, etc.)

## Current state
- Site builds cleanly with `vite build` (CSS 138KB / 24KB gzipped — up from 117KB due to 19 additional themes)
- 22 light themes and 13 dark themes selectable from burger menu
- Defaults: caramellatte (light), coffee (dark) — same warm feel as before
- Toggle flips mode and swaps theme list; each mode remembers its own last-used theme
- Cross-tab sync, OS preference fallback, and flash prevention all work with new storage keys
- Branch: claude/theme-toggle-refactor-u3XFR

## Key context
- Old `themeCombo` localStorage key is ignored — existing users reset to defaults (intentional, per user decision)
- Flash prevention defaults are duplicated in index.html and project.html inline scripts — must stay in sync with `DEFAULT_LIGHT_THEME`/`DEFAULT_DARK_THEME` in theme.js
- Monochrome themes (lofi, black, wireframe) have near-identical primary/accent, so the hero gradient degrades to solid text — matches their design intent
- CSS bundle grew ~20KB (uncompressed) due to 19 additional DaisyUI theme definitions
