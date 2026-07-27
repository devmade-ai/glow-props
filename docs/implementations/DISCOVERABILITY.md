---
slug: discoverability
title: Discoverability & Link Previews
badge: Convention
description: Decide whether an app should be found in search, then implement that decision. robots.txt must permit the crawl either way. Open Graph coverage for links pasted into chat, where nothing runs JS.
tags:
  - noindex vs indexed
  - Open Graph
  - Prerendering
order: 12
---

# Discoverability & Link Previews

Two different questions get filed under "SEO", and conflating them produces the wrong work on both.

1. **Should search engines list this app?** A private tool behind an account and a public app anyone can use need opposite answers, and neither answer is the default you get by doing nothing.
2. **What happens when someone pastes a link to it into a chat?** This one has the same answer for every app, and it is almost always the more valuable half — most products are shared by link far more often than they are found by search.

Doing nothing answers question 1 with "yes, and with whatever the crawler happens to render", which for an app that auto-signs visitors in is worse than either deliberate choice.

**Related patterns:**
- [PWA_SYSTEM.md](PWA_SYSTEM.md) — the manifest carries its own `name` / `description`; keep them consistent with the `og:` copy
- [APP_ICONS.md](APP_ICONS.md) — the app icon is square and maskable; a link-preview card is 1.91:1 and is a different asset
- [PWA_ICON_CACHE_BUST.md](PWA_ICON_CACHE_BUST.md) — same build-plugin shape (`transformIndexHtml` + a source-level tripwire)

## Step 1: state the posture

Write it down in the repo before writing any tags. It belongs in `CLAUDE.md`'s project overview, because the next person's instinct will be to "fix" whichever half looks missing.

| | Private tool | Public app |
|---|---|---|
| `X-Robots-Tag` / `<meta name="robots">` | `noindex, nofollow, noarchive` | absent |
| `robots.txt` | **allow** the crawl (see below) | **allow** the crawl, plus `Sitemap:` |
| `sitemap.xml` | none — nothing public to list | list the real URLs |
| `<link rel="canonical">` | none | present |
| Open Graph / Twitter | **full set** | **full set** |
| Prerendered content | none | worth it — see Step 4 |

The Open Graph row is identical in both columns. That is the point: link previews are orthogonal to indexing, and skipping them because "we don't want SEO" is the most common mistake this pattern exists to prevent.

## Step 2: robots.txt must permit the crawl — in both columns

The instinct for a private tool is `Disallow: /`. It is the wrong tool and it backfires.

`robots.txt` governs **crawling**. `noindex` governs **indexing**. They are different mechanisms, and a blocked crawler never fetches the page, so it never reads the `noindex`. It can still list a bare URL discovered from any link pointing at the app — and that listing cannot then be removed, because the fetch that would say "go away" is the one you blocked.

**Search engines have to be let in to be told to leave.**

Private tool:

```
# <App> is a private tool. Every screen except sign-in is behind an account.
#
# Crawling is deliberately ALLOWED: a blocked crawler never reads the noindex,
# and can still list a bare URL it found from a link — a listing that cannot
# then be removed. What keeps this out of results is the X-Robots-Tag header
# and the <meta name="robots"> tag.
#
# This file is advisory and is NOT a security control. Authentication is.

User-agent: *
Disallow:
```

Public app:

```
# <App> — https://example.com/
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

`Disallow:` with an empty value means "disallow nothing". It looks odd; it is correct.

### The SPA-fallback trap

A single-page app rewrites unmatched paths to `index.html`. On Vercel that is typically:

```json
{ "source": "/((?!assets/|api/).*)", "destination": "/index.html" }
```

`/robots.txt` matches that. Before a real file exists, requesting it returns **the app's HTML with `Content-Type: text/html`** — not a 404, and nothing a crawler can parse. Vercel checks the filesystem before applying rewrites, so committing `public/robots.txt` fixes it, but that ordering is the only reason it works and is worth asserting (see Step 5).

Check it after deploying: `curl -sI https://…/robots.txt | grep -i content-type` must say `text/plain`.

## Step 3: noindex, for the private column

Two places, because they cover different moments.

**The header** — the authoritative one, applied to the response the crawler fetched:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Robots-Tag", "value": "noindex, nofollow, noarchive" }
      ]
    }
  ]
}
```

`noarchive` matters when the app auto-signs visitors in or renders data without a round trip — it stops a cached copy being served from the search result.

**The meta tag** — covers the rendered page, and any host or path where the header isn't applied:

```html
<meta name="robots" content="noindex, nofollow, noarchive" />
```

`vercel.json` is a **schema-validated API payload, not a document**. Unknown properties are rejected at deploy time, and JSON has no comments — so an added `"comment"` key fails the deploy while `build`, `lint`, and the test suite all still pass. Put the reasoning in `robots.txt`'s own comments and in the tripwire test.

### Verify by rendering, not by reading source

The reason to care is only visible in a browser. Render the deployed app cookieless with a crawler user agent:

```js
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
})
const page = await ctx.newPage()
await page.goto(url, { waitUntil: 'networkidle' })
console.log(page.url(), await page.evaluate(() => document.body.innerText))
```

Googlebot renders JS. An app with an auth bypass, a demo mode, or a public read path will redirect past its own login and hand over real content. Reading the source tells you nothing about that.

## Step 4: link previews, for both columns

Unfurlers — WhatsApp, Slack, Signal, iMessage, Discord — **do not run JS**. They see the static HTML and nothing else, so these tags cannot be set per-route from the client framework, and an SPA that relies on runtime rendering unfurls as a bare URL.

For a product distributed by invitation link, a bare URL asking someone to sign in or sign something reads like phishing. That is a trust problem, not a marketing one.

```html
<meta property="og:type" content="website" />
<meta property="og:site_name" content="App" />
<meta property="og:title" content="App — what it does in one line" />
<meta property="og:description" content="One or two sentences a stranger can act on." />
<meta property="og:image" content="https://example.com/og-image.png" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Describes the card for screen readers." />
<meta property="og:url" content="https://example.com/" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="App — what it does in one line" />
<meta name="twitter:description" content="One or two sentences a stranger can act on." />
<meta name="twitter:image" content="https://example.com/og-image.png" />
```

### `og:image` and `og:url` must be absolute

Facebook's crawler rejects a relative `og:image` outright and others resolve it inconsistently. A deployment URL usually isn't known until build time, so resolve it there:

```ts
function absoluteMetaUrls(): Plugin {
  const raw =
    process.env.VITE_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    ''
  const origin = raw
    ? (/^https?:\/\//.test(raw) ? raw : `https://${raw}`).replace(/\/+$/, '')
    : ''

  return {
    name: 'absolute-meta-urls',
    transformIndexHtml(html) {
      if (!origin) {
        console.warn('[absolute-meta-urls] no site URL — og tags ship relative.')
        return html
      }
      return html
        .replace(/content="\/og-image\.png"/g, `content="${origin}/og-image.png"`)
        .replace('property="og:url" content="/"', `property="og:url" content="${origin}/"`)
    },
  }
}
```

**Warn rather than substitute a placeholder when no URL is available.** A wrong absolute URL points every preview at someone else's server; a relative one merely degrades on one platform.

Use a global regex: `og:image` and `twitter:image` carry the same literal, and a string `.replace` only reaches the first.

### Generating the card

1200×630 (1.91:1). Do **not** reuse a square app icon — every platform expecting that ratio will crop or letterbox it, and it reads as a mistake.

Generate it from the same brand geometry as the icon, with sharp (already present if [APP_ICONS.md](APP_ICONS.md) is implemented), and commit the output.

**Keep text out of the image.** sharp rasterizes SVG text through fontconfig, which cannot load `.woff2` webfonts — so a wordmark silently renders in whatever system font exists and ships in the wrong typeface. The words belong in `og:title` / `og:description`, which every unfurler renders itself, in its own UI font, beside the image.

### Prerendering, for the public column

A client-rendered SPA serves an empty `<div id="root">`. Google renders JS and will eventually index it; nothing else will, and the render is slower and less reliable than static HTML.

Injecting a static landing at build time, then removing it when the app mounts, gets real content to every crawler:

```ts
// vite.config.ts — build-time only
transformIndexHtml(html) {
  return html.replace('<div id="root"></div>', `${SEO_LANDING_HTML}\n<div id="root"></div>`)
}
```

The handoff has three parts — the content, the plugin that injects it, and the mount code that removes it — and breaking any one ships either no crawlable content or a shell that never goes away. Pin all three.

**The prerendered copy and the copy the app renders must not diverge.** If they disagree, the crawled page and the rendered page say different things, which reads as cloaking and wastes the exercise. Hold both in one module and build each from the same strings:

```ts
export const LANDING_TAGLINE = '…'
export const LANDING_LEDE = '…'
export const LANDING_FEATURES: { heading: string; body: string }[] = [ … ]
```

## Step 5: the tripwire

Every piece here is one line that can be deleted with no visible symptom. The failure mode is a search result appearing weeks later, or a preview quietly going blank — neither of which any other test catches.

```ts
// Private column
test('index.html declares noindex', () => {
  expect(html).toMatch(/<meta\s+name="robots"\s+content="[^"]*noindex/)
})

test('the header covers every path', () => {
  const all = vercel.headers.find((h) => h.source === '/(.*)')
  expect(all.headers.find((h) => h.key.toLowerCase() === 'x-robots-tag').value).toContain('noindex')
})

// Both columns — the trap, asserted directly
test('robots.txt does NOT blanket-disallow, or the noindex is never read', () => {
  expect(robots).not.toMatch(/^\s*Disallow:\s*\/\s*$/m)
})

// Both columns — the declaration must match the real file
test('og:image dimensions match the shipped PNG', () => {
  const png = readFileSync('public/og-image.png')
  expect(png.subarray(1, 4).toString()).toBe('PNG')
  expect(String(png.readUInt32BE(16))).toBe(meta('og:image:width'))
  expect(String(png.readUInt32BE(20))).toBe(meta('og:image:height'))
})

// Both columns — two surfaces, one message
test('the Twitter card repeats the Open Graph copy', () => {
  expect(meta('twitter:title')).toBe(meta('og:title'))
  expect(meta('twitter:description')).toBe(meta('og:description'))
})

// Both columns — proves the SPA fallback doesn't swallow the file
describe.skipIf(!existsSync('dist'))('after a build', () => {
  test('robots.txt is emitted to the output directory', () => {
    expect(existsSync('dist/robots.txt')).toBe(true)
  })
})
```

Read the PNG's IHDR directly (8-byte signature, then width and height as big-endian uint32 at offsets 16 and 20) rather than importing an image library — an assertion about a file shouldn't depend on one.

## Verification checklist

- [ ] The posture is written down in `CLAUDE.md`, including what is deliberately absent
- [ ] `curl -sI …/robots.txt` returns `content-type: text/plain`, not `text/html`
- [ ] `robots.txt` does not contain `Disallow: /`
- [ ] Private: the document response carries `X-Robots-Tag: noindex`
- [ ] Private: rendering the deployed app with a Googlebot UA, cookieless, shows nothing that shouldn't be indexed
- [ ] Public: `sitemap.xml` lists the real URLs and `robots.txt` points at it
- [ ] Public: the prerendered copy and the rendered copy say the same thing
- [ ] The built HTML carries absolute `og:image` / `og:url`
- [ ] Pasting the URL into a chat client shows the card, title and description
- [ ] The card is 1.91:1, not a cropped app icon

## Tradeoff assessment

**Why not `Disallow: /` for a private app?** Covered in Step 2 — it prevents the crawl that would deliver the `noindex`, and leaves a bare-URL listing you cannot remove. The only case where it is defensible is when nothing anywhere links to the app, and that is a property you cannot guarantee about the future.

**Why no sitemap or canonical for a private app?** They describe public content, and there isn't any. Adding them is inventing a public surface to satisfy a checklist.

**Why full Open Graph coverage on an app nobody should find?** Because being found and being shared are different things. The private app is shared *more* deliberately than the public one, and the preview is what tells the recipient the link is real.

**Why is `robots.txt` not a security control?** It is a request, honoured by the major search engines and ignored by everything else. If a URL must not be readable, authentication is the only answer — check whether a dev bypass or demo mode is currently making the app readable in ways the team has forgotten.

## Key lessons

- **`robots.txt` controls crawling; `noindex` controls indexing.** Blocking the first prevents the second from ever being delivered.
- **The SPA fallback serves `index.html` for `/robots.txt`** until a real file exists — a 200 with the wrong content type, not a 404.
- **Unfurlers don't run JS.** Whatever is in the static HTML is the entire preview, forever, on every platform.
- **`og:image` must be absolute**, and a guessed domain is worse than a relative path.
- **A square app icon is not a preview card.** Different ratio, different asset.
- **Keep text out of a generated card** unless the generator can genuinely load the brand font — silently wrong typography is worse than none.
- **Verify by rendering with a crawler UA.** Reading source cannot tell you what a JS-rendering crawler actually sees.
