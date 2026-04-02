# Theme & Dark Mode

User-controlled dark/light mode with system preference fallback, persistence, and flash prevention. Two variants: React (Vite + Tailwind) for web-only projects, React Native (Expo) for cross-platform. The burger menu's "Dark / Light mode" toggle item connects to the hook exposed here.

## CSS Variable Palette

Two sets of semantic tokens — `:root` for light, `.dark` for dark. Use raw hex values (not `theme()`) so the palette works in both Tailwind v3 and v4. Components reference tokens via Tailwind's `ui.*` namespace, so they auto-switch when the `.dark` class changes.

```css
/* Semantic color tokens — Light mode (default) */
:root {
  --color-text-default: #27272a;   /* zinc-800 */
  --color-text-muted: #52525b;     /* zinc-600 */
  --color-text-subtle: #71717a;    /* zinc-500 */
  --color-surface: #ffffff;
  --color-surface-elevated: #fafafa; /* zinc-50 */
  --color-surface-inset: #f4f4f5;  /* zinc-100 */
  --color-surface-hover: #e4e4e7;  /* zinc-200 */
  --color-border: #e4e4e7;         /* zinc-200 */
  --color-border-subtle: #f4f4f5;  /* zinc-100 */
  --color-border-strong: #d4d4d8;  /* zinc-300 */
}

/* Semantic color tokens — Dark mode */
.dark {
  --color-text-default: #f4f4f5;   /* zinc-100 */
  --color-text-muted: #d4d4d8;     /* zinc-300 */
  --color-text-subtle: #a1a1aa;    /* zinc-400 */
  --color-surface: #1a1a2e;
  --color-surface-elevated: #16213e;
  --color-surface-inset: #1e1e3f;
  --color-surface-hover: #252550;
  --color-border: #3f3f46;         /* zinc-700 */
  --color-border-subtle: #27272a;  /* zinc-800 */
  --color-border-strong: #52525b;  /* zinc-600 */
}

/* Native form inputs, selects, scrollbars — must match theme */
html.dark { color-scheme: dark; }
```

- **Semantic names, not color names**: `text-default`, `surface`, `border` — not `gray-800`, `white`, `zinc-700`. Components never reference raw colors directly.
- **Raw hex values, not `theme()`**: The Tailwind `theme()` function is deprecated in v4. Hex values work in both v3 and v4 without any build-time resolution.
- **`color-scheme: dark` on `html.dark`**: Without this, native `<select>`, `<input>`, `<option>` dropdowns, and default scrollbars remain light-themed even when the app is dark.
- **Adapt the dark palette to your brand**: The hex values above use deep indigo backgrounds; swap for slate, neutral, or any dark hue. Keep the token names unchanged.

Wire the tokens into Tailwind so components use `text-ui-text` instead of hardcoded colors. **Using `ui.*` classes eliminates most `dark:` prefixes** — since the CSS variables resolve differently under `:root` vs `.dark`, `bg-ui-surface` auto-switches without needing `dark:bg-ui-surface`. This is the primary benefit of semantic tokens. However, hover states, placeholder text, dividers, and focus rings that reference non-semantic Tailwind colors (e.g., `hover:bg-zinc-100`) still need explicit `dark:` variants:

```js
// tailwind.config.js (v3) — in theme.extend.colors:
ui: {
  text: { DEFAULT: 'var(--color-text-default)', muted: 'var(--color-text-muted)', subtle: 'var(--color-text-subtle)' },
  surface: { DEFAULT: 'var(--color-surface)', elevated: 'var(--color-surface-elevated)', inset: 'var(--color-surface-inset)', hover: 'var(--color-surface-hover)' },
  border: { DEFAULT: 'var(--color-border)', subtle: 'var(--color-border-subtle)', strong: 'var(--color-border-strong)' },
}
```

## Tailwind Dark Mode Config

Tailwind v3 and v4 handle class-based dark mode differently:

**Tailwind v3** — `tailwind.config.js`:
```js
export default { darkMode: 'class', /* ... */ }
```

**Tailwind v4** — in your main CSS file:
```css
@custom-variant dark (&:where(.dark, .dark *));
```

Both look for a `.dark` class on `<html>`. The hook below manages that class.

## React Web (`useDarkMode.js`)

Hook with localStorage persistence, system preference fallback, cross-tab sync, and safe storage access.

```js
import { useState, useEffect } from 'react'

// Requirement: User-controlled dark/light mode with system fallback and cross-tab sync
// Approach: localStorage persistence, .dark class on <html>, matchMedia listener,
//   storage event for cross-tab sync
// Alternatives:
//   - CSS-only prefers-color-scheme: Rejected — no user override possible
//   - React Context: Rejected — overkill for web (DOM class is the source of truth)
//   - Zustand/Redux: Rejected — theme is UI-only state, no cross-component actions
//   - next-themes: Rejected — SSR/multi-theme/forced-page features not needed for SPA

function safeStorageGet(key) {
  try { return localStorage.getItem(key) } catch { return null }
}

function safeStorageSet(key, value) {
  try { localStorage.setItem(key, value) } catch { /* sandboxed iframe, disabled storage */ }
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = safeStorageGet('darkMode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Apply .dark class to <html> and persist choice
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    safeStorageSet('darkMode', isDark)
  }, [isDark])

  // Cross-tab sync — when another tab changes darkMode in localStorage,
  // update this tab to match. The storage event only fires in OTHER tabs
  // (not the one that wrote), so there's no infinite loop risk.
  // Both next-themes and use-dark-mode include this; without it, two tabs
  // show different themes until the stale tab is refreshed.
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'darkMode' && e.newValue !== null) {
        setIsDark(e.newValue === 'true')
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Track OS preference changes — only when user hasn't made an explicit choice
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      if (safeStorageGet('darkMode') === null) setIsDark(e.matches)
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggle = () => setIsDark((prev) => !prev)

  return { isDark, toggle }
}
```

- **`safeStorageGet` / `safeStorageSet`**: localStorage throws `SecurityError` in sandboxed iframes, disabled-storage settings, and some enterprise environments. Wrapping both reads and writes in try/catch ensures the hook degrades to system preference instead of crashing.
- **System preference is a fallback, not an override**: Once the user toggles manually, their choice is stored and system changes are ignored. Overriding a manual choice with OS preference changes is disorienting.
- **`.dark` on `document.documentElement`**: Applying to `<html>` rather than `<body>` ensures `:root`-level styles and pseudo-elements also switch.
- **No CSS transition on theme switch**: Instant switches are the industry standard (GitHub, Discord, VS Code). Transitions cause visual inconsistency — different elements change at different rates. If transitions are ever wanted, use the inject-remove-stylesheet pattern to disable them during programmatic switches.
- **Cross-tab sync via `storage` event**: The `storage` event only fires in *other* tabs (not the one that wrote to localStorage), so there's no infinite loop risk. Without this, two tabs show different themes until the stale tab is refreshed. Both `next-themes` and `use-dark-mode` include this feature.


## Flash Prevention (`index.html`)

The hook runs after React mounts — too late. An inline `<script>` in `<head>` reads localStorage and applies `.dark` before the first paint. Same early-capture pattern as the PWA `beforeinstallprompt` script.

```html
<script>
  (function() {
    try {
      var stored = localStorage.getItem('darkMode');
      var isDark = stored !== null
        ? stored === 'true'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) document.documentElement.classList.add('dark');
    } catch(e) {}
  })();
</script>
```

Place before any `<link>` or `<script type="module">` tags. Executes synchronously during HTML parse.

- **Must be a classic script, not `type="module"`**: Module scripts are deferred — they run after DOM parse, too late to prevent flash.
- **Same logic as the hook**: Duplicates the localStorage/matchMedia check. If you change the storage key in the hook, update it here too.
- **try/catch**: Handles environments where localStorage is unavailable. Falls back to system preference via matchMedia.
- **CSP note**: Strict Content Security Policy without `unsafe-inline` blocks inline scripts. For static hosting, precompute the script's SHA-256 hash and add it to the CSP: `script-src 'self' 'sha256-<hash>'`. For server-rendered pages, use a per-request nonce.

## Print Override

Force readable output regardless of dark mode:

```css
@media print {
  .no-print { display: none !important; }
  body {
    background: white !important;
    color: black !important;
  }
  a {
    color: black !important;
    text-decoration: underline !important;
  }
}
```

Pairs with the "Download as PDF" suggested implementation.

## React Native (`useAppTheme.ts`)

Context-based theme with AsyncStorage persistence. Components consume the full color token object, not just an `isDark` boolean.

```typescript
import React, { useContext, useMemo, useCallback, createContext } from 'react'
import { usePersistedState } from './usePersistedState'

// Semantic color tokens — both objects must have identical keys.
// Brand colors stay constant across themes; only lightness adjusts for contrast.
export const LightTheme = {
  text: '#111827', textSecondary: '#6B7280', textTertiary: '#6B7280',
  background: '#F9FAFB', surface: '#FFFFFF', border: '#E5E7EB', borderLight: '#F3F4F6',
  primary: '#0D9488', primaryLight: '#14B8A6',
  error: '#DC2626', errorBg: '#FEE2E2', success: '#16A34A', successBg: '#DCFCE7',
  warning: '#F59E0B', warningBg: '#FEF3C7',
}

export const DarkTheme = {
  text: '#F9FAFB', textSecondary: '#9CA3AF', textTertiary: '#9CA3AF',
  background: '#111827', surface: '#1F2937', border: '#374151', borderLight: '#1F2937',
  primary: '#14B8A6', primaryLight: '#2DD4BF',
  error: '#EF4444', errorBg: '#7F1D1D', success: '#22C55E', successBg: '#14532D',
  warning: '#FBBF24', warningBg: '#78350F',
}

export type AppTheme = typeof LightTheme

interface ThemeContextValue {
  theme: AppTheme
  isDark: boolean
  toggleTheme: () => void
  themeHydrated: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark, loaded] = usePersistedState<boolean>('theme_dark', true)
  const theme = isDark ? DarkTheme : LightTheme
  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), [setIsDark])
  const value = useMemo(
    () => ({ theme, isDark, toggleTheme, themeHydrated: loaded }),
    [theme, isDark, toggleTheme, loaded]
  )
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useAppTheme(): AppTheme {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useAppTheme must be inside AppThemeProvider')
  return ctx.theme
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useThemeMode must be inside AppThemeProvider')
  return { isDark: ctx.isDark, toggleTheme: ctx.toggleTheme, themeHydrated: ctx.themeHydrated }
}
```

- **`themeHydrated` exposed via context**: The splash screen must wait for this flag before hiding. Without it, users who stored "light" see a dark flash before the stored preference loads.
- **Both theme objects must have identical keys**: `type AppTheme = typeof LightTheme` enforces this at compile time. Missing a token in one theme causes runtime errors.
- **`textTertiary` is the same value in both themes**: Tertiary text is decorative — `#6B7280` passes AA on light backgrounds, `#9CA3AF` passes AA on dark backgrounds. Do not swap these accidentally (the original values were reversed, failing WCAG contrast).
- **Brand colors stay constant across themes**: Primary hue doesn't change — only lightness adjusts for contrast against the background.

## Flash Prevention (React Native)

Hold the splash screen until both fonts AND theme preference are hydrated from AsyncStorage:

```typescript
// In app/_layout.tsx:
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ /* ... */ })

  return (
    <AppThemeProvider>
      <RootLayoutInner fontsLoaded={fontsLoaded} />
    </AppThemeProvider>
  )
}

function RootLayoutInner({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isDark, themeHydrated } = useThemeMode()

  useEffect(() => {
    if (fontsLoaded && themeHydrated) SplashScreen.hideAsync()
  }, [fontsLoaded, themeHydrated])

  if (!fontsLoaded || !themeHydrated) return null

  return (
    <ThemeProvider value={isDark ? CustomDarkTheme : CustomLightTheme}>
      <Stack />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  )
}
```

- **Wait for both conditions**: Hiding the splash on font load alone lets the wrong theme flash before AsyncStorage resolves.
- **`app.json` backgroundColor**: Set to match the default theme (dark). The native splash screen renders this color before any JavaScript runs — prevents white flash even before React mounts.
- **`StatusBar style`**: Toggle based on `isDark` so the status bar text remains readable against the current background.

## Related Patterns

**SVG icons with `currentColor`**: Icons using `fill="currentColor"` or `stroke="currentColor"` auto-adapt to theme via CSS color inheritance. The burger menu's hamburger icon already uses this pattern. Prefer `currentColor` over hardcoded fill colors for all theme-aware icons.

**Chart/graph colors**: Chart libraries (Chart.js, Recharts, D3) use hardcoded color arrays by default. Pass theme-derived colors to chart config and re-render on theme change. Without this, charts become unreadable on dark backgrounds.

**Content themes vs app dark mode**: App theme (dark/light) controls the application chrome. Content themes (templates, canvas styles, color schemes) are independent — a user may want a light content theme while using the app in dark mode. Do not conflate these two concepts.

**Debug pill in separate React root**: The debug pill renders in its own React root (survives App crashes) and cannot access `useDarkMode` or `AppThemeProvider`. On web, read the `.dark` class from `document.documentElement` directly to determine theme. Do not attempt to share React context across separate roots.

## Key Lessons

**Foundations:**

1. **System preference is a fallback, not an override.** Once the user toggles manually, their choice persists. Overriding a manual choice with OS preference changes is disorienting.
2. **Flash prevention requires an inline `<script>` in `<head>`.** The React hook runs after mount — too late. The script must be classic (not `type="module"`), duplicate the localStorage/matchMedia logic, and run before any `<link>` tags.
3. **`.dark` class on `<html>`, not `<body>`.** Tailwind's `dark:` variant targets descendants of `.dark`. Placing it on `<html>` ensures `:root`-level styles and pseudo-elements also switch.
4. **No CSS transitions on theme switch.** Instant switches are the industry standard (GitHub, Discord, VS Code). Transitions cause visual inconsistency — different elements change at different rates. If transitions are ever wanted, use the inject-remove-stylesheet pattern to disable them during programmatic switches.

**HTML & browser chrome:**

5. **Strict CSP blocks the flash prevention inline script.** For static hosting, precompute the script's SHA-256 hash and add `'sha256-<hash>'` to the CSP `script-src` directive. For SSR, use a per-request nonce. Most deployments don't set strict CSP — document as a caveat, not a blocker.

**CSS & Tailwind:**

6. **Semantic token names, not color names.** `text-default`, `surface`, `border` — not `gray-800`, `white`, `zinc-700`. Swapping the entire palette is a single-file change.
7. **Use raw hex values in CSS, not `theme()`.** The `theme()` function is deprecated in Tailwind v4. Hex values work in both v3 and v4. V4 projects can optionally reference auto-generated `var(--color-zinc-800)` variables instead.
8. **Tailwind v3 uses `darkMode: 'class'` in config. Tailwind v4 uses `@custom-variant dark` in CSS.** Both target `.dark` on `<html>`. See the Burger Menu Key Lessons for the full v4 directive.
9. **`color-scheme: dark` on `html.dark` is required.** Without it, native form inputs, select dropdowns, and default scrollbars remain light-themed even in dark mode.
10. **Some Tailwind utilities still need `dark:` prefixes even with semantic tokens.** The `ui.*` token classes auto-switch for text, background, and border colors. But hover states (`hover:bg-zinc-100 dark:hover:bg-zinc-700`), placeholder text, dividers, and focus rings may still need explicit `dark:` variants because they reference non-semantic Tailwind colors.

**Storage & sync:**

11. **Wrap all localStorage access in try/catch.** Sandboxed iframes, disabled storage, and enterprise policies throw `SecurityError`. Fall back to system preference when storage is unavailable.
12. **Cross-tab sync requires the `storage` event listener.** The `storage` event only fires in other tabs (not the one that wrote), so there is no infinite loop. Without it, toggling dark mode in one tab leaves other tabs on the old theme until refresh. This is a standard feature in `next-themes` and `use-dark-mode`.

**React Native:**

13. **Hold the splash screen until theme is hydrated.** On React Native, `usePersistedState` loads asynchronously from AsyncStorage. Hiding the splash before the stored preference resolves causes a visible flash. Wait for both fonts and theme hydration.
