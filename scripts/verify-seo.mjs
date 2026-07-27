// Requirement: every piece of the discoverability setup is one line that can be
//   deleted with no visible symptom — a preview quietly goes blank, or a
//   canonical starts pointing every pattern at the same URL. Neither shows up
//   in a build, a page render, or a manual click-through.
// Approach: a static check over the source, in the same shape as
//   verify-timer-cleanup.mjs — no test runner, exits non-zero with a list.
// See docs/implementations/DISCOVERABILITY.md.
//
// Run: npm run verify:seo

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE = 'https://devmade-ai.github.io/glow-props/'
const OG_IMAGE = 'public/assets/images/og-image.png'

const PAGES = ['index.html', 'pattern.html', 'project.html']

// pattern.html and project.html pick their content from ?name=, so a STATIC
// canonical on them would point every item at the bare page and suppress the
// lot. They set it at runtime instead (src/seoMeta.js).
const STATIC_CANONICAL_PAGES = ['index.html']

const failures = []
const fail = (msg) => failures.push(msg)

function meta(html, attr, key) {
  const m = html.match(new RegExp(`<meta\\s+${attr}="${key}"\\s+content="([^"]*)"`))
  return m ? m[1] : null
}

// --- per-page head tags -----------------------------------------------------

const REQUIRED_OG = [
  'og:type', 'og:site_name', 'og:title', 'og:description',
  'og:url', 'og:image', 'og:image:type', 'og:image:width',
  'og:image:height', 'og:image:alt',
]
const REQUIRED_TWITTER = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']

for (const page of PAGES) {
  const html = readFileSync(join(ROOT, page), 'utf8')

  for (const key of REQUIRED_OG) {
    if (!meta(html, 'property', key)) fail(`${page}: missing <meta property="${key}">`)
  }
  for (const key of REQUIRED_TWITTER) {
    if (!meta(html, 'name', key)) fail(`${page}: missing <meta name="${key}">`)
  }

  // Two surfaces, one message — they drift the moment someone edits one.
  if (meta(html, 'name', 'twitter:title') !== meta(html, 'property', 'og:title')) {
    fail(`${page}: twitter:title does not match og:title`)
  }
  if (meta(html, 'name', 'twitter:description') !== meta(html, 'property', 'og:description')) {
    fail(`${page}: twitter:description does not match og:description`)
  }

  // Unfurlers resolve nothing: a relative og:image is rejected outright by
  // some crawlers and resolved inconsistently by the rest.
  const image = meta(html, 'property', 'og:image')
  if (image && !image.startsWith('https://')) fail(`${page}: og:image is not absolute (${image})`)
  const url = meta(html, 'property', 'og:url')
  if (url && !url.startsWith('https://')) fail(`${page}: og:url is not absolute (${url})`)

  // A square app icon is not a preview card — that was the defect this setup
  // was written to fix, and it is an easy one to reintroduce.
  if (image && /icon-\d+\.png/.test(image)) {
    fail(`${page}: og:image points at an app icon, not the 1.91:1 card (${image})`)
  }

  if (!/<meta\s+name="description"\s+content="[^"]+"/.test(html)) {
    fail(`${page}: missing a non-empty <meta name="description">`)
  }

  const hasStaticCanonical = /<link\s+rel="canonical"/.test(html)
  if (STATIC_CANONICAL_PAGES.includes(page) && !hasStaticCanonical) {
    fail(`${page}: missing <link rel="canonical">`)
  }
  if (!STATIC_CANONICAL_PAGES.includes(page) && hasStaticCanonical) {
    fail(
      `${page}: has a STATIC canonical. Its content is chosen by ?name=, so a ` +
      'fixed canonical tells search engines every item is the same URL. It is ' +
      'set at runtime in src/seoMeta.js instead.',
    )
  }
}

// --- the runtime helper stays wired -----------------------------------------

for (const page of ['pattern.html', 'project.html']) {
  const html = readFileSync(join(ROOT, page), 'utf8')
  if (!html.includes("from './src/seoMeta.js'")) {
    fail(`${page}: does not import applyPageSeo — its canonical would never be set`)
  }
  if (!html.includes('applyPageSeo({')) {
    fail(`${page}: imports applyPageSeo but never calls it`)
  }
}

// --- the card itself --------------------------------------------------------

if (!existsSync(join(ROOT, OG_IMAGE))) {
  fail(`${OG_IMAGE} missing — run npm run generate:og-image`)
} else {
  // PNG IHDR: 8-byte signature, 4-byte length, 4-byte type, then width and
  // height as big-endian uint32. Read directly rather than importing an image
  // library — an assertion about a file should not depend on one.
  const png = readFileSync(join(ROOT, OG_IMAGE))
  if (png.subarray(1, 4).toString() !== 'PNG') fail(`${OG_IMAGE} is not a PNG`)
  const width = png.readUInt32BE(16)
  const height = png.readUInt32BE(20)
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8')
  if (String(width) !== meta(html, 'property', 'og:image:width')) {
    fail(`og:image:width says ${meta(html, 'property', 'og:image:width')}, the file is ${width}`)
  }
  if (String(height) !== meta(html, 'property', 'og:image:height')) {
    fail(`og:image:height says ${meta(html, 'property', 'og:image:height')}, the file is ${height}`)
  }
}

// --- robots.txt -------------------------------------------------------------

const robotsPath = join(ROOT, 'public/robots.txt')
if (!existsSync(robotsPath)) {
  fail('public/robots.txt missing')
} else {
  const robots = readFileSync(robotsPath, 'utf8')
  // This site is meant to be found. A blanket disallow would also stop the
  // sitemap being read, so it is wrong here for two reasons.
  if (/^\s*Disallow:\s*\/\s*$/m.test(robots)) fail('public/robots.txt blanket-disallows crawling')
  if (!robots.includes(`Sitemap: ${SITE}sitemap.xml`)) {
    fail('public/robots.txt does not point at the sitemap')
  }
}

// --- the sitemap is generated, not hand-written -----------------------------

if (existsSync(join(ROOT, 'public/sitemap.xml'))) {
  fail(
    'public/sitemap.xml exists and would shadow the generated one. The sitemap ' +
    'is built from docs/implementations/ and public/projects/ by generateSitemap() ' +
    'in vite.config.js.',
  )
}
// Match the REGISTRATION in the plugins array, not the mere presence of the
// name — `function generateSitemap()` contains the substring too, so a plain
// includes() passes happily on a config where the plugin is defined and never
// used. Caught by fault injection, which is the only reason it is written this
// way.
const viteConfig = readFileSync(join(ROOT, 'vite.config.js'), 'utf8')
if (!/^\s*generateSitemap\(\),\s*$/m.test(viteConfig)) {
  fail('vite.config.js defines generateSitemap() but does not register it in the plugins array')
}

const distSitemap = join(ROOT, 'dist/sitemap.xml')
if (existsSync(distSitemap)) {
  const xml = readFileSync(distSitemap, 'utf8')
  const patternCount = readdirSync(join(ROOT, 'docs/implementations')).filter((f) => f.endsWith('.md')).length
  const listed = (xml.match(/glow-props\/patterns\/[a-z0-9-]+\//g) ?? []).length
  if (listed !== patternCount) {
    fail(`dist/sitemap.xml lists ${listed} patterns, docs/implementations has ${patternCount}`)
  }
}

// --- prerendered pattern pages ----------------------------------------------

// Each pattern gets a real HTML file so it has its own crawlable content AND
// its own link preview. Runtime tags cover neither: unfurlers do not run JS.
if (!/^\s*prerenderPatternPages\(\),\s*$/m.test(viteConfig)) {
  fail('vite.config.js defines prerenderPatternPages() but does not register it in the plugins array')
}

const patternFiles = readdirSync(join(ROOT, 'docs/implementations')).filter((f) => f.endsWith('.md'))
const distPatternsDir = join(ROOT, 'dist/patterns')

if (existsSync(distPatternsDir)) {
  const slugs = []
  for (const file of patternFiles) {
    const md = readFileSync(join(ROOT, 'docs/implementations', file), 'utf8')
    const slug = md.match(/^slug:\s*(\S+)/m)?.[1]
    const title = md.match(/^title:\s*(.+)$/m)?.[1]?.trim()
    if (slug) slugs.push({ slug, title })
  }

  for (const { slug, title } of slugs) {
    const page = join(distPatternsDir, slug, 'index.html')
    if (!existsSync(page)) {
      fail(`dist/patterns/${slug}/index.html missing — the pattern has no page of its own`)
      continue
    }
    const html = readFileSync(page, 'utf8')

    // The whole point: its OWN copy, not the template's placeholder.
    if (html.includes('devmade-ai — Pattern Details')) {
      fail(`dist/patterns/${slug}/: still carries the generic og:title — every pattern would unfurl the same`)
    }
    if (html.includes('<title>Loading... — devmade-ai</title>')) {
      fail(`dist/patterns/${slug}/: still carries the template's placeholder <title>`)
    }
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]
    if (canonical !== `${SITE}patterns/${slug}/`) {
      fail(`dist/patterns/${slug}/: canonical is ${canonical}, expected ${SITE}patterns/${slug}/`)
    }
    // Content, not just tags — a crawler that does not run JS must find the
    // document, which is the reason these files exist at all.
    //
    // Checked INSIDE #app, not across the whole file: the title also appears
    // in <title> and og:title, so a whole-file search passes happily on a page
    // whose body was never injected. Fault injection is what exposed that.
    const appBody = html.match(/<div id="app"[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? ''
    if (!/<h1[\s>]/.test(appBody)) {
      fail(`dist/patterns/${slug}/: #app has no prerendered content — a crawler that does not run JS sees an empty page`)
    }
    if (title && !appBody.includes(title.replace(/&/g, '&amp;'))) {
      fail(`dist/patterns/${slug}/: prerendered body does not contain the pattern's own heading`)
    }
    // Nav links are stamped for a root-level page; two directories down they
    // would all resolve inside patterns/<slug>/.
    if (html.includes('href="./')) {
      fail(`dist/patterns/${slug}/: has root-relative "./" links that break from a nested URL`)
    }
  }
}

// The clean URL is canonical, so that is what the sitemap must list — the
// ?name= form is the legacy entry point and would be duplicate content.
if (existsSync(distSitemap)) {
  const xml = readFileSync(distSitemap, 'utf8')
  if (xml.includes('pattern.html?name=')) {
    fail('dist/sitemap.xml lists pattern.html?name= URLs; the prerendered patterns/<slug>/ URLs are canonical')
  }
}

// --- report -----------------------------------------------------------------

if (failures.length) {
  console.error(`\n✗ discoverability check failed (${failures.length}):\n`)
  for (const f of failures) console.error(`  • ${f}`)
  console.error('\nSee docs/implementations/DISCOVERABILITY.md\n')
  process.exit(1)
}
console.log(`✓ discoverability: ${PAGES.length} pages, card, robots.txt and sitemap all consistent`)
