# Session Notes

## Worked on
Full CSS framework migration from Pico CSS to Tailwind CSS v4 + DaisyUI v5, theme selection, and hero gradient tuning.

## Accomplished
- Replaced Pico CSS v2.1.1 with Tailwind CSS v4.2.2 + DaisyUI v5.5.19
- Deleted `pico-theme.css` and `styles.css`, replaced with `main.css` (Tailwind entry point)
- Migrated `index.html` — navbar, hero, project cards, tool items, pattern cards, all sections
- Migrated `project.html` — meta grid, tabs, doc viewer, markdown renderer, all inline styles
- Updated `theme.js` to set both `.dark` class (Tailwind) and `data-theme` (DaisyUI) together
- Updated flash-prevention inline scripts in both HTML files for dual class/attribute approach
- Added scroll-triggered animations (Intersection Observer + CSS transitions)
- Added card hover effects (lift + shadow on hover)
- Added sticky glassmorphism navbar with backdrop blur
- Configured Vite with `@tailwindcss/vite` plugin
- Moved Tailwind/DaisyUI from dependencies to devDependencies
- Fixed missing `.dark` class removal in flash-prevention light mode branch
- Switched themes from DaisyUI defaults (light/dark) to caramellatte (light) / coffee (dark)
- Changed hero gradient from theme-dependent (`from-primary to-secondary`) to fixed warm gradient (`from-amber-600 to-rose-500`, `dark:from-amber-400 dark:to-rose-400`)

## Current state
- Site builds cleanly with `vite build`
- Both pages fully migrated to Tailwind + DaisyUI
- Themes: caramellatte (light), coffee (dark)
- Dark mode works via `.dark` class + `data-theme` attribute
- Animations: fade-in-up on hero, scroll-triggered on sections/cards with stagger delays
- All accessibility preserved (disclosure pattern, aria-expanded, focus-visible, 44px touch targets)
- Branch: claude/evaluate-css-frameworks-xWcmj, pushed to remote

## Key context
- Dark mode requires BOTH `.dark` class on `<html>` (Tailwind dark: variant) AND `data-theme="coffee"` / `data-theme="caramellatte"` (DaisyUI component colors) — set together in theme.js and flash-prevention scripts
- DaisyUI themes configured as `caramellatte --default, coffee --prefersdark` in main.css @plugin directive
- Custom animations defined in main.css: `scroll-animate` class + `animate-in` added by Intersection Observer
- Tailwind v4 uses CSS-first config — no `tailwind.config.js` needed
- Theme label visibility controlled by JS (theme.js `updateThemeLabels`) instead of CSS selectors
- Container uses `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8` instead of Pico's `.container` class
- Hero gradient uses fixed colors (amber/rose) not theme tokens — caramellatte's primary/secondary are both near-black, making theme-dependent gradient invisible
