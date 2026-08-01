#!/usr/bin/env node
// Tripwire: verify icon cache-busting against docs/implementations/PWA_ICON_CACHE_BUST.md.
//
// The failure mode this guards is silent: someone reformats an icon tag or drops a
// workbox option, the build still succeeds, and stale icons only surface weeks later
// when the mark changes. Same shape as verify-timer-cleanup.mjs / verify-seo.mjs —
// no test runner, exits non-zero with a list.
//
// Source-level checks always run; dist-level checks run when dist/ exists (build first).
//
// Run: npm run verify:icons

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const VERSIONED = /\?v=[0-9a-f]{8}(?=[^0-9a-f]|$)/

const failures = []
const fail = (msg) => failures.push(msg)

// --- source: the plugin and its contract --------------------------------------

const viteConfig = readFileSync(join(ROOT, 'vite.config.js'), 'utf8')

if (!/function iconCacheBustHtml\s*\(/.test(viteConfig)) {
  fail('vite.config.js: iconCacheBustHtml() is not defined')
}
// Registered BEFORE VitePWA — locks the icon-URL contract in ahead of manifest
// generation (pattern doc "Plugin order").
const pluginsStart = viteConfig.indexOf('plugins: [')
const iconPluginIdx = viteConfig.indexOf('iconCacheBustHtml()', pluginsStart)
// 'VitePWA({' — the call with its options object, not prose mentions of the name.
const vitePwaIdx = viteConfig.indexOf('VitePWA({', pluginsStart)
if (iconPluginIdx === -1) {
  fail('vite.config.js: iconCacheBustHtml() is defined but not registered in the plugins array')
} else if (vitePwaIdx !== -1 && iconPluginIdx > vitePwaIdx) {
  fail('vite.config.js: iconCacheBustHtml() must be registered BEFORE VitePWA()')
}

if (!/cleanupOutdatedCaches:\s*true/.test(viteConfig)) {
  fail('vite.config.js: workbox.cleanupOutdatedCaches must be true')
}
// Without /^v$/ the precache only serves the un-versioned URL — versioned icon
// requests fall through to network every time, breaking offline.
if (!/ignoreURLParametersMatching:\s*\[[^\]]*\/\^v\$\//.test(viteConfig)) {
  fail('vite.config.js: workbox.ignoreURLParametersMatching must include /^v$/')
}

// The exact bare literals the plugin replaces must exist in every source page —
// a reformatted tag makes the build throw, but only if the page is still using
// the literal form the plugin knows about.
for (const page of ['index.html', 'pattern.html', 'project.html']) {
  const html = readFileSync(join(ROOT, page), 'utf8')
  for (const literal of [
    'href="assets/images/favicon.png"',
    'href="assets/images/apple-touch-icon.png"',
  ]) {
    if (!html.includes(literal)) {
      fail(`${page}: missing the exact literal ${literal} the cache-bust plugin replaces`)
    }
  }
  // href attributes only — prose comments legitimately mention ?v=.
  if (/href="[^"]*\?v=/.test(html)) {
    fail(`${page}: source carries a hardcoded ?v= in a link — versions are appended at build time only`)
  }
}

// The navbar mark is rendered by React from the __ICON_VERSIONS__ define —
// the define must exist in the config and the component must consume it, or
// the mark silently ships un-versioned.
if (!/define:\s*\{[^}]*__ICON_VERSIONS__/.test(viteConfig)) {
  fail('vite.config.js: __ICON_VERSIONS__ define missing — the React navbar mark has no version source')
}
{
  const navbar = readFileSync(join(ROOT, 'src/components/Navbar.jsx'), 'utf8')
  if (!navbar.includes('__ICON_VERSIONS__')) {
    fail('src/components/Navbar.jsx: does not consume __ICON_VERSIONS__ — the navbar mark ships un-versioned')
  }
}

// --- dist: the contract actually held ----------------------------------------

if (!existsSync(DIST)) {
  console.warn('[verify-icons] dist/ not found — run the build first for dist-level assertions.')
} else {
  // Manifest icons all versioned.
  const manifestPath = join(DIST, 'manifest.webmanifest')
  if (!existsSync(manifestPath)) {
    fail('dist/manifest.webmanifest missing')
  } else {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    for (const icon of manifest.icons) {
      if (!VERSIONED.test(icon.src)) {
        fail(`dist/manifest.webmanifest: icon src is not versioned (${icon.src})`)
      }
    }
  }

  // Every built page — the three entries plus every prerendered pattern and
  // project page — must carry only versioned icon links.
  const pages = ['index.html', 'pattern.html', 'project.html'].map((p) => join(DIST, p))
  for (const dir of ['patterns', 'projects']) {
    const base = join(DIST, dir)
    if (!existsSync(base)) continue
    for (const slug of readdirSync(base)) {
      const page = join(base, slug, 'index.html')
      if (existsSync(page)) pages.push(page)
    }
  }
  for (const page of pages) {
    const html = readFileSync(page, 'utf8')
    const rel = page.slice(DIST.length + 1)
    const links = html.match(/<link[^>]+rel="(?:icon|apple-touch-icon)"[^>]*>/g) ?? []
    if (links.length < 2) fail(`dist/${rel}: expected icon + apple-touch-icon links, found ${links.length}`)
    for (const link of links) {
      const href = link.match(/href="([^"]+)"/)?.[1] ?? ''
      if (!VERSIONED.test(href)) fail(`dist/${rel}: un-versioned icon link leaked through (${href})`)
    }
    const navMark = html.match(/<img src="([^"]*icon-192[^"]*)"/)?.[1]
    if (navMark && !VERSIONED.test(navMark)) {
      fail(`dist/${rel}: navbar mark is un-versioned (${navMark})`)
    }
  }

  // SW: cleanup + ignore param made it into the generated worker, and the
  // precache holds exactly ONE entry per icon path — two entries with different
  // cache keys make workbox-precaching throw add-to-cache-list-conflicting-entries
  // at evaluation time, killing the whole precache layer.
  const swPath = join(DIST, 'sw.js')
  if (!existsSync(swPath)) {
    fail('dist/sw.js missing')
  } else {
    const sw = readFileSync(swPath, 'utf8')
    if (!/cleanupOutdatedCaches\(\)/.test(sw)) fail('dist/sw.js: cleanupOutdatedCaches() not present')
    if (!/ignoreURLParametersMatching:\s*\[[^\]]*\/\^v\$\//.test(sw)) {
      fail('dist/sw.js: ignoreURLParametersMatching does not include /^v$/')
    }
    const entries = sw.match(/\{url:"assets\/images\/[^"]+"/g) ?? []
    const seen = new Map()
    for (const e of entries) {
      const url = e.slice(6).replace(/"$/, '').split('?')[0]
      seen.set(url, (seen.get(url) ?? 0) + 1)
    }
    for (const [url, count] of seen) {
      if (count > 1) fail(`dist/sw.js: ${url} has ${count} precache entries — conflicting cache keys break the SW`)
    }
    for (const icon of ['favicon.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-1024-maskable.png']) {
      if (![...seen.keys()].some((u) => u.endsWith('/' + icon))) {
        fail(`dist/sw.js: assets/images/${icon} has no precache entry — the icon is not available offline`)
      }
    }
  }
}

// --- report -------------------------------------------------------------------

if (failures.length) {
  console.error(`\n✗ icon cache-bust check failed (${failures.length}):\n`)
  for (const f of failures) console.error(`  • ${f}`)
  console.error('\nSee docs/implementations/PWA_ICON_CACHE_BUST.md\n')
  process.exit(1)
}
console.log('✓ icon cache-bust: manifest, pages, and service worker all versioned and conflict-free')
