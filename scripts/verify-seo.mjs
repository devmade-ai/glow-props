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

// Only docs the pattern manifest actually ACCEPTS count as patterns here — a
// draft without valid frontmatter is skipped by generatePatternManifest()
// (and so has no page, no sitemap entry, no landing-page card), and counting
// raw .md files would fail the build over a page that is deliberately absent.
// Mirrors the REQUIRED fields + slug rule in vite.config.js. Values are
// unquoted the same way the manifest parser unquotes them.
function parsePatternFrontmatter(md) {
  const norm = md.replace(/\r\n/g, '\n')
  if (!norm.startsWith('---\n')) return null
  const end = norm.indexOf('\n---\n', 4)
  if (end === -1) return null
  const block = norm.slice(4, end)
  const get = (key) => {
    let v = block.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim()
    if (v && v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
    // Numeric coercion mirrors the manifest parser: `badge: 0` becomes the
    // number 0 there and fails its truthiness check — this parser must reach
    // the same verdict or the counts drift.
    if (v && /^\d+$/.test(v)) v = parseInt(v, 10)
    return v
  }
  const slug = get('slug')
  // String(slug): the manifest parser regex-tests the coerced value too, so a
  // digit-only slug (numeric after coercion) is ACCEPTED there — rejecting it
  // here would fail the deploy over a page that actually shipped.
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(slug))) return null
  if (!get('title') || !get('badge') || !get('description')) return null
  return { slug: String(slug), title: String(get('title')) }
}

function eligiblePatterns() {
  // Duplicate slugs: keep the FIRST, like generatePatternManifest() does —
  // it warns and skips subsequent duplicates, so counting both here would
  // fail the build with a misleading off-by-one.
  const seen = new Set()
  return readdirSync(join(ROOT, 'docs/implementations'))
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const attrs = parsePatternFrontmatter(readFileSync(join(ROOT, 'docs/implementations', file), 'utf8'))
      return attrs ? { file, ...attrs } : null
    })
    .filter(Boolean)
    .filter(({ slug }) => {
      if (seen.has(slug)) return false
      seen.add(slug)
      return true
    })
}

/**
 * Read markup for INSPECTION — comments stripped.
 *
 * Requirement: these checks must see what a parser sees.
 * Why: every extraction below is a regex, and a regex cannot tell that it is
 *   inside `<!-- ... -->`. Heads in this fleet are full of Requirement/Approach
 *   comments, and those comments quote tag literals. Both directions bite: a
 *   presence check passes on a tag that exists only in a comment, and a content
 *   check reads the commented copy instead of the real one. The second is not
 *   hypothetical — the fleet audit's live checker reported see-veo's meta
 *   description as EMPTY because a comment above it quoted the tag name; the
 *   page was fine.
 * Note: use plain readFileSync where the comment IS the subject (source-literal
 *   assertions), which is why this is a separate helper rather than a global.
 */
const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '')
const readHtml = (path) => stripComments(readFileSync(path, 'utf8'))

function meta(html, attr, key) {
  const m = html.match(new RegExp(`<meta\\s+${attr}="${key}"\\s+content="([^"]*)"`))
  return m ? m[1] : null
}

function title(html) {
  return html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? null
}

// The <title> is the one identity tag with no fallback: a search result shows
// it, a browser tab shows it, and unlike og:title nothing substitutes for it.
// The failure this catches is the one that shipped here — a bare brand token
// that also disagreed with og:title, so a listing and a shared card described
// the same page differently. Both properties, one check.
const SITE_NAME = 'devmade-ai'
const TITLE_MAX = 65

function checkTitle(label, html, { mustMatchOg }) {
  const value = title(html)
  if (!value) {
    fail(`${label}: no <title>`)
    return
  }
  if (value.trim() === SITE_NAME) {
    fail(
      `${label}: <title> is the bare brand token "${SITE_NAME}" — a search result ` +
      'needs to say what the page is, not only who made it',
    )
  }
  if (value.length > TITLE_MAX) {
    fail(`${label}: <title> is ${value.length} chars, over the ${TITLE_MAX} budget — it will be truncated`)
  }
  if (mustMatchOg) {
    const og = meta(html, 'property', 'og:title')
    if (value !== og) {
      fail(`${label}: <title> ("${value}") does not match og:title ("${og}")`)
    }
  }
}

// Structured data (DISCOVERABILITY.md Step 5). Three failure modes are worth
// gating: a block that does not parse (invisible until Search Console says so),
// more than one block or a missing site node (the @id joins stop resolving),
// and an unescaped `</script>` from item copy (which truncates the page's head).
const ORG_ID = `${SITE}#org`
const WEBSITE_ID = `${SITE}#website`

function checkJsonLd(label, html, { itemId = null } = {}) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  if (blocks.length !== 1) {
    fail(`${label}: expected exactly 1 JSON-LD block, found ${blocks.length}`)
    return
  }
  let graph
  try {
    graph = JSON.parse(blocks[0][1])
  } catch (err) {
    fail(`${label}: JSON-LD does not parse — ${err.message}`)
    return
  }
  if (graph['@context'] !== 'https://schema.org') {
    fail(`${label}: JSON-LD @context is ${graph['@context']}, expected https://schema.org`)
  }
  const nodes = graph['@graph'] || []
  const ids = nodes.map((n) => n['@id'])
  for (const required of [ORG_ID, WEBSITE_ID]) {
    if (!ids.includes(required)) fail(`${label}: JSON-LD is missing the ${required} node`)
  }
  if (itemId) {
    if (!ids.includes(itemId)) {
      fail(`${label}: JSON-LD has no item node — expected ${itemId}, got ${ids.join(', ')}`)
    }
  } else if (nodes.length !== 2) {
    fail(
      `${label}: JSON-LD carries ${nodes.length} nodes. A template whose content is ` +
      'chosen at runtime must claim only the site-wide ones — a static item node ' +
      'would assert that every item URL is the same thing.',
    )
  }
  if (/<\/script/i.test(blocks[0][1])) {
    fail(`${label}: JSON-LD contains a literal </script — escape < as \\u003C`)
  }
}

// --- per-page head tags -----------------------------------------------------

const REQUIRED_OG = [
  'og:type', 'og:site_name', 'og:title', 'og:description',
  'og:url', 'og:image', 'og:image:type', 'og:image:width',
  'og:image:height', 'og:image:alt',
]
const REQUIRED_TWITTER = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']

for (const page of PAGES) {
  const html = readHtml(join(ROOT, page))

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

  // The whole setup assumes the PUBLIC posture — one stray noindex undoes all
  // of it with no visible symptom.
  if (/<meta\s+name="robots"[^>]*noindex/.test(html)) {
    fail(`${page}: carries a noindex robots meta — this site is meant to be indexed`)
  }

  // og:title agreement only where the <title> is the real one. pattern.html and
  // project.html carry a placeholder that prerenderPages() and seoMeta.js both
  // replace, so requiring a match there would forbid the placeholder.
  checkTitle(page, html, { mustMatchOg: STATIC_CANONICAL_PAGES.includes(page) })
  checkJsonLd(page, html)
}

// The landing page's identity must point at the site root exactly — presence
// and https:// alone pass happily on a copy-pasted wrong origin.
{
  const html = readHtml(join(ROOT, 'index.html'))
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1]
  if (canonical !== SITE) fail(`index.html: canonical is ${canonical}, expected ${SITE}`)
  if (meta(html, 'property', 'og:url') !== SITE) {
    fail(`index.html: og:url is ${meta(html, 'property', 'og:url')}, expected ${SITE}`)
  }
}

// --- the runtime helper stays wired -----------------------------------------

for (const page of ['src/pages/PatternPage.jsx', 'src/pages/ProjectPage.jsx']) {
  const source = readFileSync(join(ROOT, page), 'utf8')
  if (!source.includes("from '../seoMeta.js'")) {
    fail(`${page}: does not import applyPageSeo — its canonical would never be set`)
  }
  if (!source.includes('applyPageSeo({')) {
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
  // Every page declares the dimensions, so every page can drift — checking
  // index.html alone let an edit to the other two pass silently.
  for (const page of PAGES) {
    const html = readHtml(join(ROOT, page))
    if (String(width) !== meta(html, 'property', 'og:image:width')) {
      fail(`${page}: og:image:width says ${meta(html, 'property', 'og:image:width')}, the file is ${width}`)
    }
    if (String(height) !== meta(html, 'property', 'og:image:height')) {
      fail(`${page}: og:image:height says ${meta(html, 'property', 'og:image:height')}, the file is ${height}`)
    }
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
// The deployed copy, not just the source: public/ files reach dist/ through
// Vite's copy step, and a rename or publicDir change would drop it silently.
if (existsSync(join(ROOT, 'dist')) && !existsSync(join(ROOT, 'dist/robots.txt'))) {
  fail('dist/robots.txt missing — the public/ copy did not reach the build output')
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
  const patternCount = eligiblePatterns().length
  const listed = (xml.match(/glow-props\/patterns\/[a-z0-9-]+\//g) ?? []).length
  if (listed !== patternCount) {
    fail(`dist/sitemap.xml lists ${listed} patterns, docs/implementations has ${patternCount} manifest-eligible`)
  }
}

// --- prerendered pages --------------------------------------------------------

// Each pattern/project gets a real HTML file so it has its own crawlable
// content AND its own link preview. Runtime tags cover neither: unfurlers do
// not run JS.
if (!/^\s*prerenderPages\(\),\s*$/m.test(viteConfig)) {
  fail('vite.config.js defines prerenderPages() but does not register it in the plugins array')
}

const patternEntries = eligiblePatterns()
const distPatternsDir = join(ROOT, 'dist/patterns')

// The markdown renderer resolves bare "X.md" cross-links between pattern docs
// by DERIVING the target slug from the filename — lowercased, _ → -
// (patternMdLinkResolver in src/lib/markdown.js; it cannot fetch the manifest,
// being shared Node/browser code). Until now that convention was only cultural.
// This makes it mechanical: a doc whose frontmatter slug diverges from its
// filename would make every cross-reference TO it a silent 404 on the rendered
// pages. Source-level — runs with or without a build.
for (const { file, slug } of patternEntries) {
  const derived = file.replace(/\.md$/i, '').toLowerCase().replace(/_/g, '-')
  if (slug !== derived) {
    fail(
      `docs/implementations/${file}: frontmatter slug "${slug}" does not match the ` +
      `filename-derived "${derived}" — bare .md cross-links to this doc resolve to ` +
      `/patterns/${derived}/ (patternMdLinkResolver) and would 404. Rename the file ` +
      'or change the slug so they agree.',
    )
  }
}

if (existsSync(distPatternsDir)) {
  for (const { slug, title } of patternEntries) {
    const page = join(distPatternsDir, slug, 'index.html')
    if (!existsSync(page)) {
      fail(`dist/patterns/${slug}/index.html missing — the pattern has no page of its own`)
      continue
    }
    const html = readHtml(page)

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
    checkTitle(`dist/patterns/${slug}/`, html, { mustMatchOg: true })
    checkJsonLd(`dist/patterns/${slug}/`, html, { itemId: `${SITE}patterns/${slug}/#item` })
    // Content, not just tags — a crawler that does not run JS must find the
    // document, which is the reason these files exist at all.
    //
    // Checked INSIDE the SSG'd <main>, not across the whole file: the title
    // also appears in <title> and og:title, so a whole-file search passes
    // happily on a page whose body was never injected. Fault injection is
    // what exposed that.
    const appBody = html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? ''
    if (!/<h1[\s>]/.test(appBody)) {
      fail(`dist/patterns/${slug}/: no prerendered content in <main> — a crawler that does not run JS sees an empty page`)
    }
    if (title && !appBody.includes(title.replace(/&/g, '&amp;'))) {
      fail(`dist/patterns/${slug}/: prerendered body does not contain the pattern's own heading`)
    }
    // Every component link is base-absolute; a document-relative one breaks
    // two directories down.
    if (html.includes('href="./')) {
      fail(`dist/patterns/${slug}/: has root-relative "./" links that break from a nested URL`)
    }

    // Each identity tag must appear EXACTLY once. Prerendering rewrites a
    // template that already carries a full set, so the failure mode is not a
    // missing tag but a second one: the generic value survives next to the
    // specific one and the crawler picks whichever it likes. Every check above
    // is satisfied by a duplicate — `includes()` finds the good value and
    // `match()` returns the first — which is exactly how all 12 pages shipped
    // with two <meta name="description"> tags and every assertion still passed.
    const headHtml = html.slice(0, html.indexOf('</head>'))
    const identityTags = [
      ['<title', '<title>'],
      ['description', '<meta name="description"'],
      ['og:title', '<meta property="og:title"'],
      ['og:description', '<meta property="og:description"'],
      ['og:url', '<meta property="og:url"'],
      ['og:image', '<meta property="og:image"'],
      ['twitter:title', '<meta name="twitter:title"'],
      ['twitter:description', '<meta name="twitter:description"'],
      ['canonical', '<link rel="canonical"'],
    ]
    for (const [label, literal] of identityTags) {
      const count = headHtml.split(literal).length - 1
      if (count !== 1) {
        fail(`dist/patterns/${slug}/: <head> has ${count} ${label} tags, expected exactly 1 — ` +
          'a prerender step is adding a tag instead of replacing the template\'s')
      }
    }
  }
}

// --- prerendered project pages ----------------------------------------------

const projectsDir = join(ROOT, 'public/projects')
const distProjectsDir = join(ROOT, 'dist/projects')
if (existsSync(projectsDir) && existsSync(distProjectsDir)) {
  const projectSlugs = readdirSync(projectsDir).filter(
    (d) => existsSync(join(projectsDir, d, 'meta.json')),
  )
  for (const slug of projectSlugs) {
    const page = join(distProjectsDir, slug, 'index.html')
    if (!existsSync(page)) {
      fail(`dist/projects/${slug}/index.html missing — the project has no page of its own`)
      continue
    }
    const html = readHtml(page)
    const title = JSON.parse(readFileSync(join(projectsDir, slug, 'meta.json'), 'utf8')).title

    if (html.includes('devmade-ai — Project Details')) {
      fail(`dist/projects/${slug}/: still carries the generic og:title — every project would unfurl the same`)
    }
    if (html.includes('<title>Loading... — devmade-ai</title>')) {
      fail(`dist/projects/${slug}/: still carries the template's placeholder <title>`)
    }
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]
    if (canonical !== `${SITE}projects/${slug}/`) {
      fail(`dist/projects/${slug}/: canonical is ${canonical}, expected ${SITE}projects/${slug}/`)
    }
    checkTitle(`dist/projects/${slug}/`, html, { mustMatchOg: true })
    checkJsonLd(`dist/projects/${slug}/`, html, { itemId: `${SITE}projects/${slug}/#item` })
    const appBody = html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? ''
    if (!/<h1[\s>]/.test(appBody)) {
      fail(`dist/projects/${slug}/: no prerendered content in <main> — a crawler that does not run JS sees an empty page`)
    }
    if (title && !appBody.includes(title.replace(/&/g, '&amp;'))) {
      fail(`dist/projects/${slug}/: prerendered body does not contain the project's own heading`)
    }
    if (html.includes('href="./')) {
      fail(`dist/projects/${slug}/: has root-relative "./" links that break from a nested URL`)
    }
    const headHtml = html.slice(0, html.indexOf('</head>'))
    const identityTags = [
      ['<title', '<title>'],
      ['description', '<meta name="description"'],
      ['og:title', '<meta property="og:title"'],
      ['og:description', '<meta property="og:description"'],
      ['og:url', '<meta property="og:url"'],
      ['og:image', '<meta property="og:image"'],
      ['twitter:title', '<meta name="twitter:title"'],
      ['twitter:description', '<meta name="twitter:description"'],
      ['canonical', '<link rel="canonical"'],
    ]
    for (const [label, literal] of identityTags) {
      const count = headHtml.split(literal).length - 1
      if (count !== 1) {
        fail(`dist/projects/${slug}/: <head> has ${count} ${label} tags, expected exactly 1 — ` +
          'a prerender step is adding a tag instead of replacing the template\'s')
      }
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
  if (xml.includes('project.html?name=')) {
    fail('dist/sitemap.xml lists project.html?name= URLs; the prerendered projects/<slug>/ URLs are canonical')
  }
}

// Non-JS crawlers must find the pattern AND project pages FROM the landing
// page, not only via the sitemap — the build SSGs the full card grid for
// exactly that reason.
{
  const distIndex = join(ROOT, 'dist/index.html')
  if (existsSync(distIndex)) {
    const html = readHtml(distIndex)
    const patternLinks = new Set(html.match(/href="\/glow-props\/patterns\/[a-z0-9-]+\/"/g) ?? []).size
    if (patternLinks < patternEntries.length) {
      fail(`dist/index.html links ${patternLinks} pattern pages statically, expected ${patternEntries.length} — non-JS crawlers can't discover them`)
    }
    const projectLinks = new Set(html.match(/href="\/glow-props\/projects\/[a-z0-9-]+\/"/g) ?? []).size
    if (projectLinks === 0) {
      fail('dist/index.html has no static project-page links — non-JS crawlers can\'t discover them')
    }
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
