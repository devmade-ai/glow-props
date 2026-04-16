# PWA Icon Cache Busting

## Problem

PWA icons referenced by stable filenames (`icon-192.png`, `apple-touch-icon.png`, `favicon.ico`) survive "clear site data" and PWA reinstall because every cache layer below the OS keys off URL. When you deploy a new icon, users see the old one — sometimes for weeks.

Five layers cache it independently:

| Layer                                                         | Keyed by                | Cache-bust via `?v=<hash>`? |
|---------------------------------------------------------------|-------------------------|------------------------------|
| Browser HTTP cache                                            | URL + Cache-Control     | ✅ new URL = new entry       |
| CDN edge cache (Vercel, Cloudflare, etc.)                     | URL                     | ✅ new URL = miss            |
| Service-worker precache (Workbox)                             | URL + revision          | ✅ with config below         |
| Chrome WebAPK shadow                                          | manifest icon URL       | ✅ triggers regen            |
| OS icon cache (Springboard, Android launcher, Windows, macOS) | installed-app identity  | ❌ full uninstall required   |

## Invariants (stack-free contract)

1. **Icon URL identity changes when icon bytes change.** Hash-derived, not timestamp. Same content → same URL across rebuilds. Prevents spurious cache invalidations and spurious WebAPK regenerations.
2. **Every URL surface carries the version.** Web manifest `icons[]`, HTML `<link rel="icon">` / `<link rel="apple-touch-icon">`, any `<meta>` image references. Missing any one leaks stale content.
3. **Service-worker precache resolves the versioned URL.** Either precache the versioned URL directly, or precache the base URL and tell the SW to strip the cache-bust query on lookup.
4. **Contract failures are loud.** Un-versioned URL leaking through, missing icon file, SW config drift — must throw at build time or fail a test. Never silent no-op.
5. **OS icon cache is surfaced to the user.** Platform-controlled, web-side can't fix. User education is part of the pattern, not an afterthought.

## Reference implementation (Vite + vite-plugin-pwa)

```javascript
// vite.config.js
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, 'public');

function iconVersion(relPath) {
  const full = resolve(PUBLIC_DIR, relPath);
  if (!existsSync(full)) {
    console.warn(`[iconVersion] missing icon at ${full} — using '0' as version.`);
    return '0';
  }
  return createHash('sha256').update(readFileSync(full)).digest('hex').slice(0, 8);
}

const ICON_PATHS = [
  'assets/images/icon-192.png',
  'assets/images/icon-512.png',
  'assets/images/icon.png',
  'assets/images/favicon.png',
  'favicon.ico',
  'apple-touch-icon.png',
];

const ICON_VERSIONS = Object.fromEntries(ICON_PATHS.map((p) => [p, iconVersion(p)]));
const versioned = (relPath) => `${relPath}?v=${ICON_VERSIONS[relPath]}`;

function iconCacheBustHtml() {
  const REPLACEMENTS = [
    { from: 'href="/assets/images/favicon.png"',
      to: () => `href="/${versioned('assets/images/favicon.png')}"` },
    { from: 'href="/favicon.ico"',
      to: () => `href="/${versioned('favicon.ico')}"` },
    { from: 'href="/apple-touch-icon.png"',
      to: () => `href="/${versioned('apple-touch-icon.png')}"` },
  ];

  return {
    name: 'icon-cache-bust-html',
    transformIndexHtml(html) {
      let out = html;
      for (const { from, to } of REPLACEMENTS) {
        if (!out.includes(from)) {
          throw new Error(
            `[icon-cache-bust-html] expected literal not found in index.html: ${from}\n` +
            `Update the REPLACEMENTS table in vite.config.js to match the current tag formatting.`
          );
        }
        out = out.replace(from, to());
      }
      return out;
    },
  };
}
```

Wiring:

```javascript
plugins: [
  react(),
  iconCacheBustHtml(),
  VitePWA({
    manifest: {
      icons: [
        { src: versioned('assets/images/icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: versioned('assets/images/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: versioned('assets/images/icon.png'),     sizes: '1024x1024', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      cleanupOutdatedCaches: true,
      ignoreURLParametersMatching: [/^utm_/, /^v$/],
    },
  }),
]
```

## Why each piece matters

- **Content hash, not timestamp.** Version only bumps when icons actually change. Prevents spurious cache invalidation on every deploy and spurious Chrome WebAPK regeneration (which costs user disk + Play Services bandwidth on Android).
- **Fail-loud on missing literal.** Biggest bug class: someone reformats a link tag (single-quoted attrs, attribute reorder, query already present), the plugin silently ships un-versioned URLs, the bug surfaces weeks later when an icon changes. Throwing on missing literal catches it at build time.
- **Warn, don't throw, on missing icon file.** A first-time clone legitimately has no icons before the generation step. Breaking the dev server is worse UX than a clear warning.
- **`ignoreURLParametersMatching: [/^v$/]`.** Required. Without it, Workbox precache only serves the un-versioned URL; versioned icon requests fall through to network every time, breaking offline.
- **`cleanupOutdatedCaches: true`.** Defense-in-depth. Deletes precache stores whose names use an older `workbox-precache-*` prefix than the active SW (cross-major-version cleanup). Same-prefix stale entries are already handled by Workbox's normal install flow; this is not per-build cleanup.
- **Plugin order.** Placing the cache-bust plugin before `VitePWA()` locks the contract in — neutral today (VitePWA only injects a `<link rel="manifest">`), protects against future behavior changes in either plugin.

## Source-level tripwire test

```javascript
// __tests__/icon-cache-bust.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VITE_CONFIG = readFileSync(join(REPO_ROOT, 'vite.config.js'), 'utf8');
const INDEX_HTML = readFileSync(join(REPO_ROOT, 'index.html'), 'utf8');
const DIST_DIR = join(REPO_ROOT, 'dist');
const DIST_AVAILABLE = existsSync(DIST_DIR);
const VERSIONED = /\?v=[0-9a-f]{8}(?=[^0-9a-f]|$)/;

test('iconCacheBustHtml is defined and wired before VitePWA', () => {
  assert.match(VITE_CONFIG, /function iconCacheBustHtml\s*\(/);
  const pluginsStart = VITE_CONFIG.indexOf('plugins: [');
  const vitePwaIdx = VITE_CONFIG.indexOf('VitePWA(', pluginsStart);
  const iconPluginIdx = VITE_CONFIG.indexOf('iconCacheBustHtml()', pluginsStart);
  assert.ok(iconPluginIdx > 0 && iconPluginIdx < vitePwaIdx);
});

test('workbox has cleanupOutdatedCaches and /^v$/ in ignoreURLParametersMatching', () => {
  assert.match(VITE_CONFIG, /cleanupOutdatedCaches:\s*true/);
  assert.match(VITE_CONFIG, /ignoreURLParametersMatching:\s*\[[^\]]*\/\^v\$\//);
});

test('index.html contains the exact literal hrefs the plugin replaces', () => {
  for (const literal of [
    'href="/assets/images/favicon.png"',
    'href="/favicon.ico"',
    'href="/apple-touch-icon.png"',
  ]) {
    assert.ok(INDEX_HTML.includes(literal));
  }
});

if (!DIST_AVAILABLE) {
  console.warn('[icon-cache-bust] dist/ not found — run `vite build` to enable dist-level assertions.');
}

test('dist/manifest.webmanifest icons are versioned', { skip: !DIST_AVAILABLE }, () => {
  const m = JSON.parse(readFileSync(join(DIST_DIR, 'manifest.webmanifest'), 'utf8'));
  for (const icon of m.icons) assert.match(icon.src, VERSIONED);
});

test('dist/index.html icon links are versioned, none leaked un-versioned', { skip: !DIST_AVAILABLE }, () => {
  const html = readFileSync(join(DIST_DIR, 'index.html'), 'utf8');
  const links = html.match(/<link[^>]+rel="(?:icon|apple-touch-icon)"[^>]*>/g) || [];
  assert.ok(links.length >= 3);
  for (const link of links) {
    const href = link.match(/href="([^"]+)"/)[1];
    assert.match(href, VERSIONED);
  }
  for (const bare of ['/favicon.ico"', '/apple-touch-icon.png"', '/assets/images/favicon.png"']) {
    assert.ok(!html.includes(bare));
  }
});

test('dist/sw.js contains cleanupOutdatedCaches() and /^v$/ ignore', { skip: !DIST_AVAILABLE }, () => {
  const sw = readFileSync(join(DIST_DIR, 'sw.js'), 'utf8');
  assert.match(sw, /cleanupOutdatedCaches\(\)/);
  assert.match(sw, /ignoreURLParametersMatching:\s*\[[^\]]*\/\^v\$\//);
});
```

## User communication

The OS icon cache is the one layer the web app can't touch. Surface it in the install modal so users who hit the issue know what to do. Collapsed by default keeps first-time installers focused on the install flow.

```jsx
<details className="border-t border-base-300 pt-4 mt-4">
  <summary className="text-base-content/60 text-xs cursor-pointer hover:text-base-content">
    Already installed and the icon looks outdated?
  </summary>
  <p className="text-base-content/60 text-xs mt-2 leading-relaxed">
    Your phone or computer keeps app icons cached separately from your
    browser, so clearing site data alone won't refresh them. Remove the
    app from your home screen, dock, or Start menu first, then install
    it again from this menu.
  </p>
</details>
```

Plain language. No jargon ("OS", "cache", "Springboard"). Tells the user what to do, not what's wrong.

## Browser-layer behavior (cross-stack)

- **Chrome WebAPK**: regenerates on manifest content hash change. URL with new query counts. Force immediately at `chrome://webapks` → "Update Soon".
- **iOS Springboard / macOS Icon Services**: keyed off installed-app identity. No web-side path. User must remove and reinstall.
- **Android launcher**: same as above for home-screen shortcuts. WebAPK refresh still happens on the app-level icon.
- **Windows icon cache**: persists across browser site-data clears. Pinned taskbar icon requires unpin/repin.
- **Workbox default**: strips `utm_*` query params only on precache lookup. Cache-bust param must be added explicitly to `ignoreURLParametersMatching`.

## Adapting to other stacks

| Invariant                  | Vite + vite-plugin-pwa                           | Webpack                                             | Next.js                                    | Expo / Metro                      | Static site         |
|----------------------------|--------------------------------------------------|-----------------------------------------------------|--------------------------------------------|-----------------------------------|---------------------|
| Compute hash               | `vite.config.js` at config-load                  | `webpack.config.js` evaluation                      | `next.config.js` `env`                     | `metro.config.js` prebuild        | build script        |
| Inject into HTML           | `transformIndexHtml` plugin                      | `HtmlWebpackPlugin.templateParameters`              | `app/layout.tsx` / `_document.tsx`         | Expo web template                 | template pass       |
| Inject into manifest       | `VitePWA` `manifest.icons`                       | `webpack-pwa-manifest` plugin                       | `app/manifest.ts` route handler            | `app.json` `expo.icons`           | written JSON        |
| SW precache match          | workbox `ignoreURLParametersMatching`            | workbox-webpack-plugin + same option                | `@ducanh2912/next-pwa` + same option       | custom SW                         | workbox-cli         |
| Build-time assertion       | Vite plugin `throw`                              | `compilation.errors.push`                           | Next config check / middleware             | prebuild `process.exit(1)`        | shell `exit 1`      |

## Verification checklist

1. `dist/manifest.webmanifest` icons end in `?v=<hash>` (8 hex chars).
2. `dist/index.html` icon `<link>` tags all end in `?v=<hash>`.
3. `dist/sw.js` contains `cleanupOutdatedCaches()` and `ignoreURLParametersMatching:[...,/^v$/]`.
4. Tripwire test passes.
5. Deploy. Chrome DevTools → Application → Manifest shows new hashes. Application → Cache Storage → precache has a single entry per icon path, no duplicates.
6. On Android: after WebAPK update interval, the icon refreshes.
7. Clear site data + refresh → icons render from new URLs. Uninstall + reinstall → home-screen icon refreshes.

## Known limitation: OS icon cache

OS home-screen / launcher / dock icons are cached by the OS keyed off the installed app's identity, not its icon URL. No web-side change refreshes these. The "User communication" section above is the only available mitigation.

## Tradeoff assessment

This pattern uses **content-hashed query strings**, not content-hashed filenames. Query-string cache-busting is industry-standard and ships in most production PWAs, but it's a compromise with one smell:

- `ignoreURLParametersMatching: [/^v$/]` exists because the pattern creates **two URL identities for the same resource** — unique per build (for HTTP/CDN/WebAPK busting) AND identical per build (so Workbox precache matches). Telling Workbox to strip the query resolves the conflict but means the precache entry and fetch URL have different identities by design.

The architecturally cleaner alternative is **content-hashed filenames** (e.g. `icon-192.abc123.png`), matching how Vite hashes JS/CSS bundles. Benefits:

- URL is the identity. Different content = different URL, same entry throughout.
- No `ignoreURLParametersMatching` workaround needed.
- Immune to edge caches/proxies that strip query strings (RFC-permitted, rare in practice).

Costs:

- Requires a prebuild step that hashes icon files, renames them, writes a manifest of the renames, and rewrites every reference (manifest JSON, HTML links, meta tags).
- Requires stale-file cleanup in the public directory between builds.
- Most PWA plugin ecosystems (vite-plugin-pwa, webpack-pwa-manifest, next-pwa) copy `includeAssets` verbatim and don't participate in the asset graph — so the rename step is custom code, not a library option.

Query-string approach is the 80/20. Filename-hash approach is the architecturally pure version. Both satisfy the invariants; choose based on tolerance for custom build steps and risk appetite for query-string-stripping intermediaries.
