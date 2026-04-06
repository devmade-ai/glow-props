# Theme & Dark Mode (DaisyUI)

User-controlled dark/light mode with DaisyUI theme selection, system preference fallback, persistence, flash prevention, and cross-tab sync.

Project variants demonstrating this pattern:
- **glow-props**: Vanilla HTML/CSS/JS + Vite, full 35-theme catalog, per-mode independent selection (3 keys: `darkMode`, `lightTheme`, `darkTheme`)
- **canva-grid**: React + Vite, combo-based selection with curated presets (2 keys: `darkMode`, `themeCombo`)
- **graphiki**: React + Vite, combo-based with DaisyUI v5, auto-generated meta colors
- **few-lap**: React Native (Expo) + Uniwind, named combos (light/dark pairs), CSS variable themes
- **synctone**: React Native (Expo) + Zustand + Uniwind, combo presets with per-side meta colors

All use DaisyUI's semantic color system. The old custom CSS variable token approach (`--color-text-default`, `--color-surface`, etc.) is not used in any project.

## Dual-Layer Theming

DaisyUI and Tailwind use different mechanisms for dark mode. Both must be set together on every theme change:

1. **`data-theme` attribute on `<html>`** — DaisyUI reads this to apply component colors (buttons, cards, badges, etc.) via its CSS variables
2. **`.dark` class on `<html>`** — Tailwind's `dark:` variant reads this for custom utilities (hover states, text opacity, borders, etc.)
3. **`color-scheme: dark` on `html.dark`** — browser reads this for native form inputs, select dropdowns, scrollbars

If only one layer is set, DaisyUI components and Tailwind utilities fall out of sync — e.g., dark hover states on a light DaisyUI background.

### CSS Setup (Tailwind v4 + DaisyUI v5)

```css
@import "tailwindcss";

/* Register DaisyUI themes — adapt list per project */
@plugin "daisyui" {
  themes: caramellatte --default, coffee --prefersdark,
          lofi, nord, emerald, cupcake, garden, autumn, pastel,
          night, black, forest, dracula, dim, synthwave, luxury;
}

/* Class-based dark mode for Tailwind v4 */
@custom-variant dark (&:where(.dark, .dark *));

/* Native form inputs must match theme */
@layer base {
  html { color-scheme: light; }
  html.dark { color-scheme: dark; }
}
```

- **`--default` / `--prefersdark`**: DaisyUI uses these to set the initial theme before JavaScript runs. `--default` is the light fallback, `--prefersdark` activates when the user's OS prefers dark mode.
- **`@custom-variant dark`**: Tailwind v4 replacement for `darkMode: 'class'` in v3. Maps the `dark:` prefix to `.dark` ancestor.
- **`color-scheme`**: Without this, native `<select>`, `<input>`, and scrollbars remain light-themed even when the app is dark.

### Applying Both Layers (JavaScript)

Every theme change must set both layers together:

```javascript
function applyTheme(dark, themeName, skipPersist) {
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  document.documentElement.setAttribute('data-theme', themeName);

  if (!skipPersist) {
    safeStorageSet('darkMode', dark);
    safeStorageSet(dark ? 'darkTheme' : 'lightTheme', themeName);
  }
}
```

The `skipPersist` parameter is used by the cross-tab sync handler — the values already came from another tab's localStorage write, so writing them back is redundant.

## Per-Mode Theme Persistence

Each mode (light/dark) stores its own DaisyUI theme independently. Three localStorage keys:

| Key | Value | Example |
|-----|-------|---------|
| `darkMode` | `'true'` or `'false'` | `'false'` |
| `lightTheme` | DaisyUI theme name | `'caramellatte'` |
| `darkTheme` | DaisyUI theme name | `'coffee'` |

When the user toggles dark/light, the system looks up the stored theme for the new mode and applies it. Users can have e.g. "nord" in light mode and "dracula" in dark mode simultaneously.

```javascript
function getStoredTheme(dark) {
  if (dark) {
    return safeStorageGet('darkTheme') || DEFAULT_DARK_THEME;
  }
  return safeStorageGet('lightTheme') || DEFAULT_LIGHT_THEME;
}
```

### Variant: Named Combos (React Native)

few-lap uses named combos instead of independent per-mode selection, because the mobile UI doesn't have room for a full theme picker. Two storage keys:

| Key | Value | Example |
|-----|-------|---------|
| `theme_combo` | Combo key | `'forest'` |
| `theme_dark` | `true` or `false` | `true` |

```typescript
export const THEME_COMBOS: Record<ComboKey, ThemeCombo> = {
  forest: { label: 'Forest', light: 'lemonade', dark: 'abyss' },
  nordic: { label: 'Nordic', light: 'nord', dark: 'night' },
  corporate: { label: 'Corporate', light: 'corporate', dark: 'business' },
  cafe: { label: 'Cafe', light: 'caramellatte', dark: 'coffee' },
  silk: { label: 'Silk', light: 'silk', dark: 'sunset' },
};
```

## Theme Catalog

### Curated vs Full Catalog

Two approaches, choose per project:

**Full catalog** (glow-props): Register all 35 DaisyUI built-in themes. Good for portfolio/personal sites where theme variety is a feature.

**Curated catalog** (canva-grid): Pick 8 light + 8 dark themes that look good with your content. Better for utility apps where novelty themes would look unprofessional.

### Theme Catalog Module (React)

When curating, define themes with metadata for the UI and PWA status bar:

```javascript
export const lightThemes = [
  { id: 'nord', name: 'Nord', description: 'Cool blue-gray', metaColor: '#5E81AC' },
  { id: 'lofi', name: 'Lo-Fi', description: 'Minimal mono', metaColor: '#808080' },
  { id: 'emerald', name: 'Emerald', description: 'Fresh green', metaColor: '#66CC8A' },
  // ...
]

export const darkThemes = [
  { id: 'night', name: 'Night', description: 'Deep blue', metaColor: '#0F172A' },
  { id: 'black', name: 'Black', description: 'True OLED', metaColor: '#000000' },
  { id: 'coffee', name: 'Coffee', description: 'Dark roast', metaColor: '#20161F' },
  // ...
]

export const DEFAULT_LIGHT_THEME = 'lofi'
export const DEFAULT_DARK_THEME = 'black'
```

### Validation

Always validate stored theme IDs against the catalog. Users may have outdated values from a previous version where a theme was available but has since been removed:

```javascript
const lightIds = new Set(lightThemes.map(t => t.id))
const darkIds = new Set(darkThemes.map(t => t.id))

function validLightTheme(id) {
  return lightIds.has(id) ? id : DEFAULT_LIGHT_THEME
}

function validDarkTheme(id) {
  return darkIds.has(id) ? id : DEFAULT_DARK_THEME
}
```

### PWA Meta Theme-Color

DaisyUI themes use oklch colors that can't be directly used in `<meta name="theme-color">`. Use a build script to extract hex values from DaisyUI's theme definitions (`daisyui/theme/object.js`) so nothing is manually maintained.

#### Build Script (`scripts/generate-theme-meta.mjs`)

Reads DaisyUI's theme objects and generates everything — zero manual maintenance:

```javascript
import { createRequire } from 'module';
import { readFileSync, writeFileSync } from 'fs';

const require = createRequire(import.meta.url);
const themeObj = require('daisyui/theme/object.js');

// oklch → hex conversion (~30 lines, no dependency)
function oklchToHex(oklchStr) {
  // Parse oklch(L C H) or oklch(L% C H)
  const match = oklchStr.match(/oklch\(([\d.]+)%?\s+([\d.]+)\s+([\d.]+)\)/);
  if (!match) return null;
  let [, L, C, H] = match.map(Number);
  if (L > 1) L /= 100; // normalize percentage

  // oklch → oklab
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  // oklab → linear sRGB (via LMS)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bV = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  // Gamma correction + clamp
  const gamma = (v) => Math.max(0, Math.min(255,
    Math.round((v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055) * 255)
  ));
  return `#${[r, g, bV].map(gamma).map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

// Process all themes
const results = {};
for (const [name, vars] of Object.entries(themeObj)) {
  if (name.startsWith('__')) continue;
  const isDark = vars['color-scheme'] === 'dark';
  // Light themes: use --color-primary for status bar. Dark themes: use --color-base-100
  const colorKey = isDark ? '--color-base-100' : '--color-primary';
  const hex = oklchToHex(vars[colorKey] || '');
  results[name] = { isDark, metaColor: hex || '#808080' };
}

// Generate outputs — update your theme catalog, meta tags, and flash prevention script
console.log(JSON.stringify(results, null, 2));
// In practice: write to daisyuiThemes.ts, update index.html meta tags, etc.
```

1. **Light/dark classification** — read each theme's `color-scheme` property
2. **oklch → hex conversion** — at build time, no runtime dependency
3. **Color selection** — light themes use `--color-primary`, dark themes use `--color-base-100`
4. **Generate all outputs** — theme arrays, hex color maps, initial meta tag values, flash prevention script's color map

The script should update every file that contains theme lists or color maps so there is zero manual maintenance. Run it after DaisyUI version updates.

#### HTML Setup

Two meta tags with media queries provide the correct initial color before JavaScript runs:

```html
<meta name="theme-color" content="<default-light-hex>" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="<default-dark-hex>" media="(prefers-color-scheme: dark)">
```

These should also be updated by the build script.

#### JavaScript Update

Update **both** meta tags on every theme change — overwriting the media-specific values so the active theme's color always wins regardless of OS preference:

```javascript
const color = META_COLORS[activeTheme] || '#808080'
document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
  meta.setAttribute('content', color)
})
```

#### Bootstrap Script

The flash prevention inline script needs its own copy of the color map (inline scripts can't import ES modules). The build script should generate both copies to keep them in sync.

## Safe localStorage Wrappers

localStorage throws `SecurityError` in sandboxed iframes, disabled-storage settings, and some enterprise environments. Extract into a shared module — reused by theme hook, PWA install hook, debug system, and any other consumer:

```typescript
// src/utils/safeStorage.ts
export function safeStorageGet(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

export function safeStorageSet(key: string, value: string): void {
  try { localStorage.setItem(key, value) } catch { /* sandboxed iframe, disabled storage */ }
}

export function safeStorageRemove(key: string): void {
  try { localStorage.removeItem(key) } catch { /* sandboxed iframe, disabled storage */ }
}
```

When storage is unavailable, the system degrades to OS preference with default themes — no crash, no unstyled page.

## Flash Prevention

### Web: Inline Script in `<head>`

The theme hook/script runs after mount — too late. An inline classic `<script>` in `<head>` reads localStorage and sets both `.dark` and `data-theme` before the first paint:

```html
<script>
  (function() {
    try {
      var stored = localStorage.getItem('darkMode');
      var isDark = stored !== null
        ? stored === 'true'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = isDark
        ? (localStorage.getItem('darkTheme') || 'coffee')
        : (localStorage.getItem('lightTheme') || 'caramellatte');
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      document.documentElement.setAttribute('data-theme', theme);
    } catch(e) {}
  })();
</script>
```

Place before any `<link>` or `<script type="module">` tags. Executes synchronously during HTML parse.

- **Must be a classic script, not `type="module"`**: Module scripts are deferred — they run after DOM parse, too late to prevent flash.
- **Defaults must match** the hook/theme script defaults. If you change `DEFAULT_DARK_THEME` in your JS, update it here too.
- **try/catch**: Handles environments where localStorage is unavailable.
- **CSP note**: Strict Content Security Policy without `unsafe-inline` blocks inline scripts. For static hosting, precompute the script's SHA-256 hash and add it to the CSP: `script-src 'self' 'sha256-<hash>'`.

### Web: Theme ID Validation in Bootstrap Script

For curated catalogs, validate the stored theme against a hardcoded allowlist in the bootstrap script. This prevents a removed theme from producing an unstyled page on the first paint:

```html
<script>
  (function() {
    try {
      var stored = localStorage.getItem('darkMode');
      var isDark = stored !== null
        ? stored === 'true'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      var lightAllow = ['nord','lofi','emerald','cupcake','garden','autumn','pastel','caramellatte'];
      var darkAllow = ['night','black','forest','dracula','dim','synthwave','luxury','coffee'];
      var raw = isDark
        ? localStorage.getItem('darkTheme')
        : localStorage.getItem('lightTheme');
      var theme = isDark
        ? (darkAllow.indexOf(raw) !== -1 ? raw : 'black')
        : (lightAllow.indexOf(raw) !== -1 ? raw : 'lofi');
      if (isDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', theme);
    } catch(e) {}
  })();
</script>
```

Keep the allowlists in sync with the theme catalog module.

### React Native: Splash Screen Hold

Hold the splash screen until both fonts AND theme preference are hydrated from AsyncStorage:

```typescript
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ /* ... */ })

  return (
    <AppThemeProvider>
      <RootLayoutInner fontsLoaded={fontsLoaded} />
    </AppThemeProvider>
  )
}

function RootLayoutInner({ fontsLoaded }) {
  const { loaded: themeLoaded } = useTheme()

  useEffect(() => {
    if (fontsLoaded && themeLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded, themeLoaded])

  if (!fontsLoaded || !themeLoaded) return null
  return <Stack />
}
```

Set `app.json` `backgroundColor` to match the default dark theme. The native splash screen renders this color before any JavaScript runs.

## Cross-Tab Sync

The `storage` event fires in other tabs (not the one that wrote), so there's no infinite loop. Without it, toggling dark mode in one tab leaves other tabs on the old theme until refresh.

### Web (Vanilla JS)

```javascript
window.addEventListener('storage', function (e) {
  if (e.key === 'darkMode' || e.key === 'lightTheme' || e.key === 'darkTheme') {
    var dark = safeStorageGet('darkMode') === 'true';
    var theme = getStoredTheme(dark);
    applyTheme(dark, theme, true); // skipPersist — values already in storage
  }
});
```

### Web (React)

```javascript
useEffect(() => {
  const handleStorage = (e) => {
    if (e.key === 'darkMode') {
      const newDark = e.newValue !== null
        ? e.newValue === 'true'
        : window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(newDark)
    } else if (e.key === 'lightTheme' && e.newValue) {
      setLightThemeState(validLightTheme(e.newValue))
    } else if (e.key === 'darkTheme' && e.newValue) {
      setDarkThemeState(validDarkTheme(e.newValue))
    }
  }
  window.addEventListener('storage', handleStorage)
  return () => window.removeEventListener('storage', handleStorage)
}, [])
```

Validate incoming values — another tab could have garbage in localStorage.

### React Native (Web Platform Only)

```typescript
useEffect(() => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'theme_combo' && e.newValue !== null) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed in THEME_COMBOS) setComboRaw(parsed);
      } catch { /* malformed value */ }
    }
    if (e.key === 'theme_dark' && e.newValue !== null) {
      try { setIsDark(JSON.parse(e.newValue)); } catch { /* malformed */ }
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}, [setComboRaw, setIsDark]);
```

JSON.parse because `usePersistedState` stores values as JSON strings.

## System Preference Fallback

On first visit with no stored preference, use `matchMedia`. Once the user toggles manually, their choice persists and OS changes are ignored:

```javascript
// Initial state
const stored = safeStorageGet('darkMode')
const isDark = stored !== null
  ? stored === 'true'
  : window.matchMedia('(prefers-color-scheme: dark)').matches

// Track OS changes — only when no explicit user choice
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
mediaQuery.addEventListener('change', function (e) {
  if (safeStorageGet('darkMode') === null) {
    applyTheme(e.matches, getStoredTheme(e.matches))
  }
})
```

System preference is a **fallback, not an override**. Overriding a manual choice with OS preference changes is disorienting.

## Random Theme on Load (Optional)

glow-props implements an optional "random theme on load" feature. When enabled, the bootstrap script picks a random theme from the current mode's list before first paint:

```html
<script>
  // Inside the flash prevention script, after determining isDark and theme:
  if (localStorage.getItem('randomThemeOnLoad') === 'true') {
    var lightThemes = ['caramellatte','cupcake','pastel','lofi','nord', /* ... */];
    var darkThemes = ['coffee','dim','night','dracula', /* ... */];
    var list = isDark ? darkThemes : lightThemes;
    theme = list[Math.floor(Math.random() * list.length)];
    localStorage.setItem(isDark ? 'darkTheme' : 'lightTheme', theme);
  }
</script>
```

The randomization persists the chosen theme so the picker indicator matches. The toggle in the burger menu just flips the `randomThemeOnLoad` localStorage flag — actual randomization only happens on page load.

## Hex Colors for Non-CSS Contexts (React Native)

Mapbox GL, canvas rendering, charts, and other JS contexts need hex color values — they can't read CSS variables or DaisyUI classes. Maintain a static lookup table:

```typescript
export const THEME_HEX: Record<ThemeName, ThemeColors> = {
  lemonade: {
    primary: '#419400',
    primaryContent: '#010800',
    secondary: '#BDC000',
    base100: '#F8FDEF',
    base200: '#E1E6D9',
    baseContent: '#151614',
    // ... all semantic tokens
  },
  abyss: {
    primary: '#6FE744',
    // ...
  },
}
```

Hex values should be auto-generated by `scripts/generate-theme-meta.mjs` (see Build Script section above). No manual conversion needed.

### `withAlpha()` Utility

Uniwind doesn't generate opacity modifiers for DaisyUI CSS variable colors (`bg-warning/10` produces no CSS). For inline styles in React Native, append an alpha channel to hex:

```typescript
export function withAlpha(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0')
  return `${hex}${alpha}` // #RRGGBB → #RRGGBBAA
}
```

### Module-Level Theme Dedup

Prevent redundant `setTheme()` calls and debug log noise when multiple components mount simultaneously:

```typescript
let _lastAppliedTheme: string | null = null

function applyThemeIfChanged(themeName: string) {
  if (themeName === _lastAppliedTheme) return
  _lastAppliedTheme = themeName
  Uniwind.setTheme(themeName)
  debugAdd('render', 'info', 'Theme applied', { theme: themeName })
}
```

## Uniwind Theme Switching (React Native)

React Native doesn't have `data-theme` or `.dark` classes. Uniwind provides `setTheme()` to swap CSS variables at runtime without React re-renders:

```typescript
useEffect(() => {
  if (!loaded) return;
  Uniwind.setTheme(themeName); // Swaps CSS variables, zero re-renders
}, [themeName, loaded]);
```

Theme definitions go in `global.css` as `@variant` blocks with DaisyUI oklch values:

```css
@layer theme {
  :root {
    @variant light {
      --color-primary: oklch(58.92% 0.199 134.6);
      --color-base-100: oklch(98.71% 0.02 123.72);
      /* ... */
    }
    @variant dark {
      --color-primary: oklch(92% 0.2653 125);
      --color-base-100: oklch(20% 0.08 209);
      /* ... */
    }
    @variant nord { /* ... */ }
    @variant night { /* ... */ }
  }
}
```

## Zustand Store Pattern (React Native)

For React Native apps, Zustand solves the problem where `useState` in hooks gives independent copies across components. All components read from the same store. synctone separates the store (`stores/themeStore.ts`) from the hydration logic (`hooks/useTheme.ts`) — shown combined here for clarity:

```typescript
import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { debugAdd } from '../utils/debugLog'

interface ThemeState {
  isDark: boolean
  comboKey: string
  loaded: boolean
  toggleMode: () => void
  setCombo: (key: string) => void
}

// Guard against multiple simultaneous AsyncStorage reads on mount
let _asyncLoadStarted = false

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,
  comboKey: 'default',
  loaded: false,

  toggleMode: () => {
    const newDark = !get().isDark
    set({ isDark: newDark })
    AsyncStorage.setItem('darkMode', JSON.stringify(newDark))
    debugAdd('render', 'info', 'Dark mode toggled', { dark: newDark })
  },

  setCombo: (key: string) => {
    set({ comboKey: key })
    AsyncStorage.setItem('themeCombo', JSON.stringify(key))
  },
}))

// Hydrate from AsyncStorage — called once from root layout
export async function hydrateTheme() {
  if (_asyncLoadStarted) return
  _asyncLoadStarted = true
  try {
    const [darkStr, comboStr] = await Promise.all([
      AsyncStorage.getItem('darkMode'),
      AsyncStorage.getItem('themeCombo'),
    ])
    useThemeStore.setState({
      isDark: darkStr ? JSON.parse(darkStr) : false,
      comboKey: comboStr ? JSON.parse(comboStr) : 'default',
      loaded: true,
    })
  } catch {
    useThemeStore.setState({ loaded: true })
  }
}
```

Cross-tab sync via `StorageEvent` directly on the store setters — works on web, ignored on native.

## Content Themes vs App Dark Mode

App theme (dark/light + DaisyUI theme) controls the application chrome — buttons, cards, nav, backgrounds.

Content themes (templates, canvas styles, color palettes) are independent. A user may want a light app theme while their canvas uses a dark color scheme. canva-grid separates these with `src/config/themes.js` (content presets) vs `src/config/daisyuiThemes.js` (app UI themes). Do not conflate these two concepts.

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

Pairs with the [Download as PDF](DOWNLOAD_PDF.md) implementation.

## Key Lessons

**DaisyUI integration:**

1. **Dual-layer theming is required.** `.dark` class for Tailwind utilities, `data-theme` for DaisyUI components, `color-scheme` for native form elements. All three must be set together on every theme change. Missing any one produces visual inconsistencies.
2. **`--default` and `--prefersdark`** in the DaisyUI plugin config set the initial theme before JavaScript runs. Use them as your sensible defaults.
3. **DaisyUI's semantic classes (`btn`, `bg-base-100`, `text-primary`) auto-switch** when `data-theme` changes. No `dark:` prefix needed for DaisyUI component classes — only for custom Tailwind utilities.
4. **Some Tailwind utilities still need `dark:` prefixes.** Hover states (`hover:bg-zinc-100 dark:hover:bg-zinc-700`), placeholder text, dividers, and focus rings that reference non-DaisyUI Tailwind colors need explicit `dark:` variants.

**Theme catalogs:**

5. **Validate stored theme IDs against the catalog.** Users may have outdated values from a previous version. Invalid IDs should silently fall back to defaults — no crash, no unstyled page.
6. **Curate for quality, not quantity.** All 35 DaisyUI themes is fine for a portfolio, but utility apps should pick 8-10 per mode that look good with the content. Novelty themes (cyberpunk, halloween) can look unprofessional.
7. **PWA meta theme-color hex values should be auto-generated.** Use `scripts/generate-theme-meta.mjs` to extract oklch→hex from `daisyui/theme/object.js`. Derive light/dark classification from each theme's `color-scheme` property. Generate all theme lists, color maps, and meta tag values — zero manual maintenance.

**Persistence and sync:**

8. **System preference is a fallback, not an override.** Once the user toggles manually, their choice persists. Overriding a manual choice with OS preference changes is disorienting.
9. **Cross-tab sync requires the `storage` event listener.** The `storage` event only fires in other tabs (not the one that wrote), so there is no infinite loop. Without it, toggling dark mode in one tab leaves other tabs on the old theme until refresh.
10. **Extract `safeStorage` into a shared module.** `safeStorageGet`, `safeStorageSet`, `safeStorageRemove` in `src/utils/safeStorage.ts` — reused by theme hook, PWA install hook, debug system. Don't inline try/catch in every consumer.

**Flash prevention:**

11. **The inline `<script>` must set both `.dark` AND `data-theme`.** Setting only `.dark` prevents Tailwind flash but leaves DaisyUI on the wrong theme for one frame. Both must be applied before first paint.
12. **Must be a classic script, not `type="module"`.** Module scripts are deferred — they run after DOM parse, too late.
13. **Defaults in the bootstrap script must match defaults in the JS.** If you change `DEFAULT_DARK_THEME` in your theme module, update the inline script too. This duplication is unavoidable — the bootstrap runs before any module loads.
14. **For curated catalogs, validate in the bootstrap script too.** A hardcoded allowlist prevents a removed theme from producing an unstyled first paint.

**React Native:**

15. **Uniwind's `setTheme()` avoids React re-renders.** CSS variable swaps happen at the native layer. Components don't need to re-render when the theme changes — they read the new CSS variable values automatically.
16. **Hold the splash screen until theme is hydrated.** `usePersistedState` loads asynchronously from AsyncStorage. Hiding the splash before the stored preference resolves causes a visible flash.
17. **Hex lookup table should be auto-generated.** Use `scripts/generate-theme-meta.mjs` or `scripts/generate-theme-colors.mjs` to generate `THEME_HEX` from DaisyUI's oklch values. No manual conversion.
18. **Use Zustand for shared theme state.** React Native hooks with `useState` give independent copies across components. Zustand store provides single source of truth accessible everywhere.
19. **Guard against duplicate AsyncStorage reads.** Module-level `_asyncLoadStarted` flag prevents race condition where multiple simultaneous hook mounts all trigger async reads.
20. **`withAlpha(hex, opacity)` for inline styles.** Uniwind doesn't generate opacity modifiers for DaisyUI CSS variable colors. Append alpha channel to hex for transparent backgrounds.
21. **Module-level theme dedup.** Track `_lastAppliedTheme` to prevent redundant `setTheme()` calls and debug log noise when multiple components mount simultaneously.

**Architecture:**

22. **No CSS transitions on theme switch.** Instant switches are the industry standard (GitHub, Discord, VS Code). Transitions cause visual inconsistency — different elements change at different rates.
23. **Content themes and app dark mode are independent.** A user may want a light app with a dark canvas. Keep content color palettes separate from the DaisyUI app theme system.
24. **Debug pill in separate React root** cannot access theme hooks or context. On web, read the `.dark` class from `document.documentElement` directly. Do not attempt to share React context across separate roots.
