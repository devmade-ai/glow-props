---
slug: discoverability
title: Discoverability & Link Previews
badge: Convention
description: Everything about public visibility — whether search should list the app, what a pasted link looks like in chat, and the structured data, canonicals and sitemaps in between. robots.txt must permit the crawl either way.
tags:
  - noindex vs indexed
  - Open Graph
  - Structured data
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

**State it per URL family, not per app.** Most apps have one posture; some genuinely have two, and the third column below is not a hedge — it is the shape four-ems needs, where the builder is behind an account but `/f/:slug` form links are the product's primary distribution channel.

| | Private tool | Public app | Mixed |
|---|---|---|---|
| which URLs | all | all | private by default, one named public family |
| `X-Robots-Tag` / `<meta name="robots">` | `noindex, nofollow, noarchive` | absent | `noindex` everywhere **except** the public family |
| `robots.txt` | **allow** the crawl (see below) | **allow** the crawl, plus `Sitemap:` | **allow** the crawl; never `Disallow` the shareable family |
| `sitemap.xml` | none — nothing public to list | list the real URLs | list the public family only |
| `<link rel="canonical">` | none | present | on the public family |
| Open Graph / Twitter | **full set** | **full set** | **full set**, and per-item on the public family |
| Prerendered content | none | worth it — see Step 4 | for the public family |

The Open Graph row is identical in all three columns. That is the point: link previews are orthogonal to indexing, and skipping them because "we don't want SEO" is the most common mistake this pattern exists to prevent.

**The mixed column changes what the header can look like, and Step 3's snippet assumes it can't.** On a single-`index.html` SPA the `<meta name="robots">` tag is global — there is exactly one template, so it cannot express a per-route posture without SSR or per-path prerendered files. **The header is the only mechanism with path granularity**, which makes `X-Robots-Tag` non-optional in the mixed column rather than belt-and-braces. Scope it with a negative lookahead the way the SPA rewrite already is:

```json
{ "source": "/((?!f/).*)", "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow, noarchive" }] }
```

If you copy the tripwire from a single-posture repo, delete its "the header source is not narrowed to a subpath" assertion first — that test is correct for a private tool and **fails the correct implementation** of a mixed one.

## Step 2: robots.txt must permit the crawl — in both columns

The instinct for a private tool is `Disallow: /`. It is the wrong tool and it backfires.

`robots.txt` governs **crawling**. `noindex` governs **indexing**. They are different mechanisms, and a blocked crawler never fetches the page, so it never reads the `noindex`. It can still list a bare URL discovered from any link pointing at the app — and that listing cannot then be removed, because the fetch that would say "go away" is the one you blocked.

**Search engines have to be let in to be told to leave.**

**And so do unfurlers — `Disallow` blocks link previews, not just search results.** `facebookexternalhit`, `Twitterbot`, `LinkedInBot` and Slack's link expander all fetch `robots.txt` and honour it. So a `Disallow`-ed path renders as a bare URL on exactly the platforms most likely to be shown a card; only the robots-ignoring clients (WhatsApp, iMessage, Signal) still preview it.

This is not hypothetical. intxt ships `scripts/build-join-html.mjs` for the sole purpose of giving `/join` its own invite card, routes `/join` to it in `vercel.json` — and then says `Disallow: /join` in `robots.txt`, which turns the whole build step off for Facebook, LinkedIn, Twitter and Slack.

**A path you want to unfurl must stay crawl-permitted.** To keep it out of results, `noindex` that path — the same crawl-vs-index distinction as above, applied one level down. Per-path `Disallow` and "not indexed" are different levers, and reaching for the wrong one silently disables previews.

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

`/robots.txt` matches that. Before a real file exists, requesting it returns **the app's HTML with `Content-Type: text/html`** — not a 404, and nothing a crawler can parse. Vercel checks the filesystem before applying rewrites, so committing `public/robots.txt` fixes it, but that ordering is the only reason it works and is worth asserting (see Step 6).

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

**Meta robots is impossible in a non-HTML response, so anything crawlable that isn't a page must use the header.** A JSON data file, a PDF, a CSV export — none of them can carry a `<meta>` tag, and they are fetched and indexed like anything else. repo-tor serves `data.json` plus per-month commit shards at its site root containing full commit subjects and bodies for repositories its own config annotates as *"Private repository"*, with no `robots.txt` and no `X-Robots-Tag`. Nothing in the app links to those URLs, which is not protection: they are in the sitemap-less open, one guessed path away.

So Step 3 has a third obligation the private column usually forgets: **enumerate what the deploy serves that is not a page**, and cover it with the header. `curl -sI` the data files, not just `/`.

`vercel.json` is a **schema-validated API payload, not a document**. Unknown properties are rejected at deploy time, and JSON has no comments — so an added `"comment"` key fails the deploy while `build`, `lint`, and the test suite all still pass. Put the reasoning in `robots.txt`'s own comments and in the tripwire test.

### Soft 404s

The same rewrite that makes `/robots.txt` return HTML makes **every unknown path return the app shell with status 200** — every typo, every retired item URL, every scanner probe, each one an indexable duplicate of the home page. Step 2 documents the small case; this is the same mechanism an order of magnitude larger, and it is worse in the public column because Google indexes what it is given.

Cloudflare's `not_found_handling = "single-page-application"` and Vercel's catch-all rewrite both do this. The fix is to answer a real 404 status while still serving the shell, so a human gets the app and a crawler gets the truth:

```ts
if (!isKnownRoute(pathname)) {
  return new Response(shell, {
    status: 404,
    headers: { 'content-type': 'text/html', 'X-Robots-Tag': 'noindex' },
  })
}
```

**Derive the known-route list from the same data that generates the sitemap** — `allRoutePaths()` mapped from `sitemapEntries()` — so the two can never disagree. dm-website does exactly this. Normalise the trailing slash *before* the allowlist check, or `/blog/` 404s while `/blog` doesn't.

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

### The copy itself

The tags above are the easy half. The strings are the half that decides whether the card earns a click, and "present" is not the same as "good":

- **`<title>` ~60 characters, description ~155**, before search results and unfurl cards truncate. Write to the budget rather than discovering it in the SERP.
- **A brand token is not a title.** `<title>CanvaGrid</title>` says nothing to someone who has never heard of it; `CanvaGrid — design social images in the browser` does. Pick one suffix convention (`${item} — ${brand}`) and define it in one place so every surface composes it identically.
- **Every item in a collection needs its own description.** The exactly-once tripwire in Step 6 is *structural* — it counts tags — so a build where all twelve articles carry an identical description passes green. Duplicate descriptions across a collection are a ranking problem with no structural signal; assert cross-item uniqueness explicitly.
- **`<title>` belongs in the "one message" rule.** Tripwires usually pair `twitter:*` against `og:*` and leave `<title>` out, which is how glow-props ended up with `<title>devmade-ai</title>` beside `og:title` = `devmade-ai — Project Portfolio`. Either they match or the difference is deliberate and written down.

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

**Default to keeping text out of the image.** sharp rasterizes SVG text through fontconfig, which cannot load `.woff2` webfonts — so a wordmark silently renders in whatever system font exists and ships in the wrong typeface. For a single site-wide card the words belong in `og:title` / `og:description`, which every unfurler renders itself, in its own UI font, beside the image.

**That default inverts for per-item cards, and the blocker is solvable.** A per-article card without the headline is a logo — the headline is the entire reason the card is per-item. kl-website overturned this rule after shipping cards in a fallback serif for months, and the recipe is:

- point fontconfig at build-only **static `.ttf`/`.otf`** files (not the app's `.woff2`), and
- set `FONTCONFIG_FILE` **before the first sharp render** — libvips initialises fontconfig lazily and caches it, so setting it later silently has no effect.

Then tripwire the font itself. Asserting "text rendered" is not enough, because the fallback also renders text: render the same string in the three families you ship and assert the outputs are **pixel-distinct from each other**. That catches a silent fallback, which a dimensions-only check never will.

### Per-item cards

One card per item, each with its own `og:image:alt`. Two consequences worth stating: the images are generated from item data at build time like the pages are, and — if the repo is a PWA — they must be **excluded from the service-worker precache**, or every installed client downloads a card for every item it will never look at. dm-website's five per-section cards are the lighter middle ground: one card per section, reused by the dynamic items under it, while title and description still vary per item.

**Cache-bust the card like any other stable-named asset.** Facebook, LinkedIn and Slack cache it by URL effectively forever, so a regenerated card at an unchanged URL never refreshes anywhere it has already been pasted. Append a content hash — `og-image.png?v=<sha256[0:8]>` — with the same fail-loud occurrence count the icon plugin uses ([PWA_ICON_CACHE_BUST.md](PWA_ICON_CACHE_BUST.md)). Note the interaction with the rule above: an OG card is scraper-only, so `globIgnores` it from the precache regardless.

### Unfurl-only vs indexable — decide per page

These are two different jobs and the first one looks like both:

- **Unfurl-only** — the head carries correct per-route tags; the body is client-rendered. A card renders correctly anywhere the link is pasted. **The content is still invisible to anything that doesn't run JS.**
- **Indexable** — the text is present in the served HTML.

dm-website is the cautionary case: the most sophisticated head machinery in the fleet — per-route titles, descriptions, canonicals, cards and `BlogPosting` JSON-LD, all generated at the edge — over `<div id="root"></div>`. Six blog posts and six case studies with a perfect head and no crawlable body. Per-route head tags on a page whose *value is its text* are a half-measure that looks complete.

**Any page whose value is its text — a blog post, a case study, a doc — must be indexable.** App screens behind interaction are legitimately unfurl-only. Write down which pages are which; the failure is silent otherwise.

### Where the per-route tags come from

Three mechanisms, and the choice follows how the route set is known:

| | Use when | Fails how |
|---|---|---|
| **Build-time file per item** | the item list is known at build (files, a content module) | **loud** — throws on a missing literal |
| **Edge rewrite** (Worker/middleware) | routes are unbounded or DB-driven | **silent** — see below |
| **Runtime JS only** (`useHead`, `document.title`) | never, for unfurling | silently, always — unfurlers don't run JS |

**Edge rewriting fails open, and that is the single most surprising thing in this pattern.** A build-time replacement throws when its expected literal is gone. Cloudflare's `HTMLRewriter.on(selector, …)` is a **no-op when the selector matches nothing** — delete `<link rel="canonical">` or an `og:` tag from the template and there is no error, no log, and every route quietly ships the template's generic value. The rewriter cannot guard itself.

So when meta rewriting happens at the edge, **the only place the fail-loud guard can live is a source-level tripwire asserting the template still carries every tag the rewriter targets.** That assertion is the edge equivalent of the build plugin's `throw`, and without it the whole layer can degrade to nothing silently.

Two more edge rules, both learned from dm-website:

- **Route every request through the Worker** (`run_worker_first = true`), or the assets layer answers the SPA fallback without invoking it and every rewrite silently doesn't happen.
- **Overwrite the values of tags the template already carries; never append.** Appending is how you get two `og:title`s, which Step 6's exactly-once check exists to catch. JSON-LD is the deliberate exception, because that node does not exist in the template.

### One data module, two renderers

Whatever produces the tags — a build script, an edge Worker, the React page — they must read from **one module**, not a hand-maintained mirror. dm-website's `siteMeta.ts` carries the post-mortem of doing it the other way: the Worker's copy of the strings rotted, and it served "terms — devmade" while the page served "terms of service — devmade".

Two constraints on that module, both load-bearing:

- **It must be framework-free and CSS-import-free**, so it can be pulled into an edge bundle. This is structurally the same rule as the SSR-safety invariant in [PWA_SYSTEM.md](PWA_SYSTEM.md) — a shared module reachable from a non-browser runtime must not drag the browser graph with it.
- **Composition helpers live in it too.** Define the `" — brand"` suffix once, so two surfaces cannot disagree about it.

A related counterintuitive detail: a runtime head hook should **not** restore the previous title on unmount. Every route sets it, so a restore only produces a flicker between unmount and the next mount.

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

A neat simplification when the app already renders into a container: inject the static content **into that same container**. The app's own first render overwrites it, so there is no removal step to wire, no shell that can outlive the handoff, and no third moving part to break.

### Framework variants

Everything above is stack-independent; the *mechanics* are Vite-plugin-shaped. Three of the fleet's stacks cannot use `transformIndexHtml` at all, and two of those have zero coverage today as a direct result.

**React + Vite** — the examples above, unchanged.

**Vue 3 + Vite.** `useHead()` from `@unhead/vue` is the per-route mechanism; the zero-dependency version is `route.meta.title` plus a `router.afterEach` hook. Same caveat as React: it runs after mount, so it fixes Google's rendered pass and fixes nothing for unfurlers. **For a private, local-first tool that is the wrong purchase** — fl-farlume has five routes, no head library, and no OG at all; what it needs is the static head and the full card set, not per-route head machinery.

**SvelteKit.** `<svelte:head>` is the per-route mechanism and it is **worth nothing unless the route is prerendered**. model-pear is the worked failure: four `<svelte:head>` blocks carrying real titles, `adapter-static` with `fallback: '200.html'`, and **no route setting `export const prerender = true`** — so the build emits `200.html` and nothing else, and those four titles never reach a file. One line in `src/routes/+layout.ts` turns them into four real HTML documents. Also: `static/` is SvelteKit's `public/` (model-pear has no `static/robots.txt`, so `/robots.txt` returns HTML), and the sitemap is an **endpoint**, not a static file — `src/routes/sitemap.xml/+server.ts` returning XML with `export const prerender = true`.

**Turning prerendering on exposes the shell template's own head tags.** The moment model-pear's routes started emitting files, every page had **two** `<title>` elements — its own, and the static one already sitting in `app.html`. The first wins, so all three pages still showed the generic title and the fix looked complete while changing nothing. The rule generalises past SvelteKit: **the shell template (`app.html`, `index.html`, `_document.tsx`) must not carry any identity tag that a per-route mechanism also emits.** Either the shell owns it or the route does. This is the exactly-once check above, aimed at the one duplicate whose two halves are written by different people months apart — and it is invisible until prerendering starts, which is exactly when nobody is looking for a second bug.

**Expo Router (`output: "static"`).** `app/+html.tsx` is **one template for every route** — anything written there is global by construction. Three consequences:

- **`<Stack.Screen options={{ title }}>` is not a head tag.** It sets the in-app header and `document.title` after mount. Both Expo repos have per-screen titles; neither reaches the served HTML.
- **The export injects an EMPTY `<title data-rh="true"></title>` as the first element of `<head>`** — react-helmet's placeholder, emitted whether or not anything set a title. A `<title>` written in `+html.tsx` comes *after* it and therefore loses: the operative title is the empty one. Measured on both Expo origins in this fleet; fh-fuelhunt's title had been shadowed since the day it was added, and nothing in the repo showed it, because the source is correct and `grep` finds a title. This is the shell-template rule again with the shell owned by the framework rather than by you — so the fix is to make helmet own the *value* (set it through `expo-router/head`) or to strip the placeholder in a post-export rewrite, not to add another static tag.
- `expo-router/head`'s `<Head>` is the sanctioned per-route primitive — but it is inert on a deployment whose rewrites collapse every path to `/`.
- **The honest per-path card is a post-export rewrite.** intxt's `scripts/build-join-html.mjs` is this doc's build-time recipe translated out of Vite: read the *built* `dist/index.html`, apply fail-loud literal swaps, write a sibling file, route to it. Use `split/join` rather than `replace` — a title string is usually shared by `og:title`, `twitter:title` and `og:image:alt`.

**Prerendering and routing must agree.** A catch-all rewrite silently voids every per-route file the build just emitted. fh-fuelhunt pays the full cost of `output: "static"` and then rewrites `/(.*)` → `/`, discarding all of it.

**The half-broken version is more common than the fully-broken one, and much harder to see.** A host serves an existing file only on an **exact** path match, so `/pricing.html` returns the real prerendered page while `/pricing` — the extensionless URL in the sitemap and in every internal link — matches no file and falls through to the catch-all. model-pear shipped exactly this: 25,903 bytes with a real title at `/pricing.html`, 11,723 bytes with no title at all at `/pricing`, at the same moment, from the same deploy. Every local check passed, because the build output was correct; the deploy config was throwing half of it away, and the sitemap was pointing crawlers at the half being thrown away.

Two consequences for how you check it:

- **Fetch the URL the sitemap advertises, not the file the build emitted.** They are different strings, and only one of them is what a crawler asks for.
- **Derive the routing expectation from the build.** Every prerendered page except the shells needs a rewrite mapping its clean URL, positioned *before* the catch-all — a rewrite listed after it is dead configuration that reads as active. Both directions are worth asserting; a hardcoded list of routes goes stale the first time someone adds a page.

Prefer explicit rewrites over a host's clean-URL flag when you cannot exercise the routing locally. The flag is fewer lines and implies its effect; the explicit table states it, and can be checked offline against the emitted files.

### One page per item, when the content is a collection

A page whose content is chosen by a query parameter — `pattern.html?name=x` — is many pages served by one file, and it can only ever carry one set of head tags. Runtime tags fix that for Google and for nobody else, because unfurlers do not run JS: every item unfurls with the same generic title.

Generating one real file per item fixes both at once. Derive them from the **built** template so every asset URL is already correct, and rewrite only what is item-specific:

```js
async closeBundle() {
  const template = readFileSync('dist/item.html', 'utf-8')
  for (const item of items()) {
    let html = template
    for (const [from, to] of headTagsFor(item)) {
      if (!html.includes(from)) throw new Error(`expected literal not found: ${from}`)
      html = html.replace(from, to)
    }
    html = html.replace(/(<div id="app"[^>]*>)/, `$1\n${marked.parse(item.body)}`)
    mkdirSync(`dist/items/${item.slug}`, { recursive: true })
    writeFileSync(`dist/items/${item.slug}/index.html`, html)
  }
}
```

Three things bite here, all of them silent:

- **Relative links break two directories down.** A nav stamped `href="./#section"` for a root-level page resolves to `items/<slug>/#section`. Rewrite them to the site base, and throw if none are found — that means the template changed shape and the assumption needs re-checking.
- **The page must find its own identity without the query string.** Read the slug from the path when the parameter is absent, so both URLs work.
- **Pick ONE canonical URL and point the other at it.** The clean URL should win; the query form then canonicalises to it, and the sitemap lists only the clean one. Two URLs serving the same content with no canonical is duplicate content you created yourself.

**That rule generalises past query parameters.** Four axes produce byte-identical pages at different URLs, and every one needs the same treatment:

| Axis | Fix |
|---|---|
| `?name=x` vs `/items/x` | canonical on the query form → clean URL |
| Trailing slash | normalise **before** routing decisions, or `/blog/` misses an allowlist that `/blog` hits |
| Apex vs `www` vs `*.vercel.app` / `*.workers.dev` | one origin serves 200, every other **301s** to it; the canonical alone is a hint, not a redirect |
| Preview / branch deployments | `X-Robots-Tag: noindex` on the preview hostname |
| Chrome-less embed variants (`?embed=1`, `/embed/x`) | `noindex`, or canonical back to the parent page |

Two practical notes. Vercel header `source:` matches **paths, not query strings** — so a `?embed=` variant cannot be reached by a header rule at all and must be handled by canonical or meta from inside the app. And a hardcoded canonical is usually right for a single-origin app precisely *because* it doesn't follow the preview host: a preview that claims to be canonical is worse than one that points at production.

**The prerendered copy and the copy the app renders must not diverge.** If they disagree, the crawled page and the rendered page say different things, which reads as cloaking and wastes the exercise. Hold both in one module and build each from the same strings:

```ts
export const LANDING_TAGLINE = '…'
export const LANDING_LEDE = '…'
export const LANDING_FEATURES: { heading: string; body: string }[] = [ … ]
```

**When the build host can't render, commit the snapshot.** web-arch prerenders with a browser, which Vercel's build image doesn't have — so it builds, serves `dist/` locally, screenshots the DOM with playwright-core, and **commits** the fragment; the deploy build is then a pure string inject. That is a legitimate third shape, and it introduces a staleness mode the module-sharing rule above doesn't cover: the snapshot can silently fall behind the app. Two guards, both cheap — the generator must build *first* so a stale injected fragment can't be re-snapshotted into itself, and the tripwire asserts the load-bearing copy strings actually appear in the committed snapshot, so rewording the landing without regenerating fails the deploy.

### The sitemap

Generate it; don't hand-maintain it. Three shapes all work — a `closeBundle` hook writing `dist/sitemap.xml`, a Rollup `emitFile` plus a dev-server middleware so `npm run dev` matches the deploy, or an endpoint rendered per request at the edge. Pick by where the URL list lives.

Five rules:

- **Derive it from the same source that generates the pages**, so a new item cannot be published without appearing in it. If the 404 allowlist also derives from that source, all three stay consistent by construction.
- **Never ship a static `public/sitemap.xml` alongside a generated one** — the static file shadows the generated one and silently freezes it. Assert its absence.
- **`lastmod` is a real content date or it is omitted.** An invented one — a build timestamp on unchanged content — actively misreports freshness and is worse than nothing.
- **If you do emit a build-date `lastmod`, assert its freshness in CI**, or it quietly rots into a constant.
- **`changefreq` and `priority` are ignored by Google.** Harmless, but don't mistake them for the field that matters.

The upstream requirement most content repos miss: **store dates machine-readable in the content model and format them for display.** kl-website types its article date as the display string `'14 Mar 2026'`, which is why it carries a hand-rolled three-letter-month parser to produce ISO — and why its sitemap has no `lastmod` at all.

## Step 5: structured data (public column only)

A `<script type="application/ld+json">` block tells a crawler what the page *is*, rather than leaving it to infer. It is public-column only — a private tool declaring itself in schema.org is inventing a public surface, the same argument that keeps sitemaps out of that column.

Pick the type from what the app actually is:

| App | Node |
|---|---|
| Free browser tool | `WebApplication` + an `Offer` with `"price": "0"` (without the Offer it is ineligible for the rich result) |
| Brand / company home | `Organization` + `WebSite` |
| Article or post | `Article` / `BlogPosting` / `NewsArticle`, plus `BreadcrumbList` |
| Personal site or CV | `Person` + `ProfilePage` |

```html
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "WebApplication",
  "name": "App", "url": "https://example.com/",
  "applicationCategory": "ProductivityApplication",
  "operatingSystem": "Any", "browserRequirements": "Requires JavaScript",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } }
</script>
```

Six rules, each earned:

1. **Derive it from the same strings that produce `title` / `description`.** It is otherwise a third or fourth hand-copy of the pitch, and the one nobody re-reads. web-arch restates its description a fourth time here and its "one message" test doesn't cover it — so a reword ships stale structured data, green.
2. **Only mark up what the page actually shows.** A `BreadcrumbList` with no visible trail is a classic spam signal. dm-website deliberately omits it on section landings for exactly this reason.
3. **Escape `<` when serializing** — `JSON.stringify(node).replace(/</g, '\\u003c')` — or a `</script>` inside any title or description breaks out of the block. A pattern that says "inject JSON-LD" without this ships an XSS.
4. **Keep multi-node graphs joined by `@id`, not duplicated.** Put the `Organization` and `WebSite` nodes in a static `@graph` on every page and have the per-page node reference the publisher by `@id`.
5. **`type="application/ld+json"` is a data block, not an executable script.** CSP `script-src` does not govern it, so it works under a strict policy with no `'unsafe-inline'`. Say so in a comment, or the next inline-script audit deletes it.
6. **On a client-routed SPA the node must be removed on navigation.** A stale `NewsArticle` left behind when the user returns to the index describes the wrong page. Upsert-or-remove by element id.

Tripwire it: parses as JSON, `@type` is what you expect, its `url` equals the canonical, its `description` equals the meta description, and it appears exactly once.

## Step 6: the tripwire

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

### Assert each identity tag appears exactly ONCE

Only if you prerender (Step 4). Every assertion above is satisfied by a **duplicate**: `includes()` finds the good value and `match()` returns the first hit, so a second, wrong tag sitting beside a correct one is invisible to all of them.

This is not hypothetical. Prerendering rewrites a template that already carries a complete set of tags, so the failure mode is never a *missing* tag — it is a *surviving* one. A generator that adds `<meta name="description">` instead of replacing the template's shipped 12 pages each carrying two descriptions, with the crawler choosing between them. It built cleanly, passed every check above, and was only visible in the served HTML.

```js
const head = html.slice(0, html.indexOf('</head>'))
for (const [label, literal] of [
  ['description', '<meta name="description"'],
  ['og:title', '<meta property="og:title"'],
  ['og:url', '<meta property="og:url"'],
  ['canonical', '<link rel="canonical"'],
  // …every identity tag the generator touches
]) {
  const count = head.split(literal).length - 1
  if (count !== 1) fail(`${page}: ${count} ${label} tags, expected exactly 1`)
}
```

The generator-side rule that prevents it: **no substitution may introduce a tag the template also carries.** Replace in place, always — which also brings each tag under the generator's fail-loud "expected literal not found" guard, so rewording the template breaks the build instead of silently restoring the generic copy.

### Strip comments before any regex touches the markup

Every check on this page — and every audit script that grades a live origin —
extracts tags with a regular expression. **A regex cannot tell that it is inside
`<!-- … -->`.** The heads in this fleet are full of Requirement/Approach
comments, and those comments quote tag literals, because that is how you explain
a tag. So the comment is indistinguishable from the thing it documents.

It bites in both directions, and the second one is not hypothetical:

- **False negative.** A presence assertion is satisfied by a tag that exists
  only inside a comment. The check is green and the page has nothing.
- **False positive.** A content extraction matches the *commented* copy first
  and reads its (absent, or example) `content` attribute. This is what happened
  during the fleet audit: see-veo has an explanatory comment reading
  `… so <meta name="description">, the Open Graph copy below …` fifteen lines
  above the real tag, and the live checker reported the description as **empty
  in production**. It was not. A compliant parser sees exactly one description
  meta with the correct copy; the build output was correct the whole time. A
  downstream repo was changed for a defect that did not exist.

One line removes the entire failure mode, and it belongs at the read, not at
each pattern — a per-pattern lookbehind is unreadable and the next check added
will forget it:

```js
const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '')
const readHtml = (path) => stripComments(readFileSync(path, 'utf8'))
```

Two follow-ons. **Body-text extraction needs it too** — a crawlable-text
heuristic that strips `<script>` and `<style>` but not comments counts a block
of documentation prose as page content, and over-reports. And **keep the plain
read for assertions whose subject IS the comment** (source-literal checks),
which is why this is a separate helper rather than applied globally.

The general form: a check that reads markup with a regex is not measuring what a
parser sees, and the gap is exactly where comments, `<template>` contents and
CDATA live. If a check ever grows past tag presence, parse instead.

#### The same blindness in the build, which is far worse

Reading a comment produces a wrong *report*. **Writing into one produces a wrong
*page*, and it is the identical root cause: string substitution has no idea what
a comment is.**

This shipped. model-pear's `app.html` had its static `<title>` removed, with a
comment explaining why — and that comment named the framework's head placeholder
**literally**, to say where the real title comes from. SvelteKit replaces that
token with a plain string replace. So the entire injected head — the route's
`<title>` and every `modulepreload` — was written *between the comment markers*:

```html
<!-- No static <title> here. Each route sets its own, which %sveltekit.head% injects below … -->
                                                          ↑ the whole head lands HERE
```

Measured on the live site: **zero titles and zero modulepreloads** survived
comment-stripping on all three prerendered pages. The commit whose only purpose
was giving those pages titles took them away instead.

Nothing caught it, and each reason is worth knowing:

- the build succeeded — it did exactly what it was told;
- `curl … | grep '<title>'` finds the title, because grep does not know what a
  comment is either — the same blind spot that produced the false report above,
  now producing a false *reassurance*;
- the pages render correctly, because the browser boots from the `<body>`;
- only an HTML parser can see the head is empty.

The rule is one line and it is not framework-specific: **a comment may not
contain a token the build substitutes.** Name it in prose. It applies to
`%sveltekit.*%`, Vite's `%VITE_*%`, `<%= %>`, `{{ }}`, and any literal in a
plugin's replacement table. A fleet sweep found the class in two more repos —
see-veo's own `%THEME_COLOR%` sat inside two comments and was being substituted
in place, harmless (a colour string into prose) but self-falsifying.

Both halves are worth asserting, and they are cheap:

```js
const COMMENT = /<!--[\s\S]*?-->/g
const TOKEN = /%[A-Za-z_][A-Za-z0-9_.]*%/g

// Source: no substituted token inside a comment.
const offenders = (shell.match(COMMENT) ?? []).flatMap((c) => c.match(TOKEN) ?? [])
if (offenders.length) fail(`app.html comment contains ${offenders.join(', ')}`)

// Built output: the title survives comment-stripping. Strip FIRST — a check
// over raw HTML passes on the broken build, which is how this shipped.
const live = built.replace(COMMENT, '')
const titles = [...live.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/g)]
if (titles.length !== 1) fail(`${page}: ${titles.length} titles after comment-stripping`)
```

### Run it in the deploy job, not by hand

A tripwire that fires only when someone remembers to type the command is documentation. Wire it into whatever actually gates publishing:

```yaml
- run: npm run build
- run: npm run verify:seo      # reads dist/, so after build —
- uses: actions/upload-pages-artifact@v3   # — and before anything publishes
```

Failing there is safe: the build has already succeeded and nothing is published yet, so a red run leaves the previous deploy serving. If the repo has no PR-time gate at all, the deploy job is the only place this can live — and it is still worth it, because the alternative is finding out from the live site.

**No CI at all? Use the platform's build command.** `"buildCommand": "npm run build && npm test"` in `vercel.json` makes a failing assertion fail the *deploy*, with no workflow file to maintain — and it orders build-before-test for free, so `dist/`-level assertions run against fresh output. Locally the same suite degrades to skipped rather than failing on a missing `dist/`.

#### The deploy's build command must not be a second copy of the repo's

Note the shape of the line above: `buildCommand` **delegates** to an npm script. That is not incidental, and getting it wrong is how a fix ships without ever running.

A host's `buildCommand` overrides the default. If it spells out the pipeline — `expo export && node scripts/a.mjs && node scripts/b.mjs` — then the repo has **two** definitions of its build, and only one of them is what production executes. Add a step to `package.json` and nothing tells you the deploy still runs the old list. The build succeeds. The deploy is green. The step never ran.

This shipped twice in one hour, in two repos, from the same cause: a post-export fix added to `package.json`, absent from `vercel.json`, deployed successfully, and the defect it fixed was still live afterwards. Neither the build, the tests, nor the deploy status showed anything wrong — the only signal was the live document.

Worse, one of the two was invisible in a way the other wasn't. `vercel.json`'s `buildCommand` is capped at **256 characters**; intxt's synced pipeline came to 260 and was rejected outright, so the duplication surfaced in a single deploy. fh-fuelhunt's was 198 and would have sat there indefinitely. **A hazard that only announces itself once the string gets long enough is not a hazard you can rely on noticing.**

The rule, in order of preference:

1. **Delegate.** `"buildCommand": "npm run build"`. One definition. Nothing to keep in sync, and nothing to check.
2. **Delegate and gate.** `"npm run build && npm test"` — the form above, when the deploy is also the test gate.
3. **Omit it entirely.** With no `buildCommand`, Vercel runs `npm run build` anyway. Same single definition, one less line.
4. **If you must spell it out** (a monorepo path, a flag the script cannot carry), assert the two agree — and put the assertion in *both* commands, because a checker wired into only one reproduces the bug it exists to catch:

```js
const steps = (cmd) => [...cmd.matchAll(/node\s+(scripts\/[\w-]+\.mjs)/g)].map((m) => m[1])
const local = steps(pkg.scripts.build)
const deployed = steps(vercel.buildCommand)
if (local.join('|') !== deployed.join('|')) {
  fail(`MISSING from the deploy: ${local.filter((s) => !deployed.includes(s)).join(', ')}`)
}
```

Put it **first** in the chain, not after the expensive export — a divergence should cost a second, not a full build.

Worth a sweep rather than a memory: reading every deploy config in the fleet at once took one script and found exactly one repo still duplicating. The same question applies to any host that lets you override the build — Netlify's `[build] command`, a Dockerfile `RUN`, a workflow step that inlines what `package.json` already defines.

**The general rule this is an instance of:** verify the path production takes, not the artifact you changed. A local build proves your script works. It proves nothing about whether the deploy runs it.

**Express the assertions in whatever runner the repo already has** — `node --test`, vitest, jest, or a plain `scripts/verify-seo.mjs`. What matters is that they read the **built output directory**, whose name varies by framework: `dist/` for Vite and Expo, `build/` for SvelteKit's adapter-static.

Assertions worth adding beyond the exactly-once check:

- The template still carries **every tag an edge rewriter targets** — the only fail-loud guard available when rewriting happens at the edge.
- `og:image` is really 1200×630, read from the **PNG IHDR**, not from the declared `og:image:width` literal. Asserting the literal only proves you can type.
- Titles and descriptions are **unique across items**, not merely present.
- The JSON-LD parses, has the expected `@type`, and its `url` and `description` match the canonical and the meta description.
- No static `public/sitemap.xml` exists to shadow the generated one.

## Verification checklist

- [ ] The posture is written down in `CLAUDE.md`, including what is deliberately absent
- [ ] `curl -sI …/robots.txt` returns `content-type: text/plain`, not `text/html`
- [ ] `robots.txt` does not contain `Disallow: /`
- [ ] Private: the document response carries `X-Robots-Tag: noindex`
- [ ] Private: rendering the deployed app with a Googlebot UA, cookieless, shows nothing that shouldn't be indexed
- [ ] Public: `sitemap.xml` lists the real URLs and `robots.txt` points at it
- [ ] Public: the prerendered copy and the rendered copy say the same thing
- [ ] Public: if items are prerendered, each file carries its OWN title, description and canonical — not the template's placeholder
- [ ] Public: a prerendered page's nav links still work from its nested URL
- [ ] Public: each identity tag appears exactly ONCE per prerendered page — no generic survivor beside the specific one
- [ ] The tripwire runs in the job that gates publishing, not only on demand
- [ ] The built HTML carries absolute `og:image` / `og:url`
- [ ] Pasting the URL into a chat client shows the card, title and description
- [ ] The card is 1.91:1, not a cropped app icon
- [ ] No path you intend to share by link is `Disallow`-ed — use `noindex` on it instead
- [ ] Everything the deploy serves that is NOT a page (JSON, PDF, exports) is covered by `X-Robots-Tag`
- [ ] An unknown path returns a real 404 status, not the shell at 200
- [ ] One origin serves 200; apex / `www` / platform aliases 301 to it, and preview hosts are `noindex`
- [ ] Every page's `<title>` and description are unique across the collection, not just present
- [ ] Public: the JSON-LD parses, matches the canonical, and appears exactly once
- [ ] Per-item cards (if any) are excluded from the service-worker precache
- [ ] The card URL is content-hashed, so a regenerated card actually refreshes where it was pasted
- [ ] Prerendering and routing agree — no catch-all rewrite discarding per-route files the build emitted
- [ ] Pages whose value is their text are indexable, not merely unfurl-only

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
- **A dist-level check is only worth as much as the build behind it.** Assertions over generated output pass happily against a stale `dist/`; rebuild before trusting them, and rebuild between fault injections or the check never sees the fault.
- **Assert prerendered content INSIDE its container.** The item's title is also in `<title>` and `og:title`, so a whole-file search for it passes on a page whose body was never injected.
- **When you rewrite a template, the bug is a duplicate, not an absence.** Presence checks are all satisfied by a second, wrong tag sitting beside the correct one — assert each identity tag appears exactly once, and never let a substitution *add* a tag the template already has.
- **The shell template must not carry a tag the routes emit.** Switching prerendering on gives every page a second `<title>`; the shell's wins, and the fix reads as complete.
- **Strip HTML comments before any regex reads the markup.** A comment quoting a tag satisfies a presence check and hijacks a content check — this doc's own live audit reported a description as empty in production when the page was correct.
- **A comment may not contain a token the build substitutes.** Same root cause, worse blast radius: model-pear named its head placeholder inside a comment and had every prerendered page's `<title>` and modulepreloads injected between the comment markers, where no crawler could see them. `grep` said the title was there.
- **An unrun tripwire is documentation.** Wire it into the job that gates publishing; a checker nobody invokes did not fail, it just never ran.
- **The deploy's build command must not be a second copy of the repo's.** Delegate to the npm script, or a step added in one place silently never runs in the other — a green deploy that shipped nothing. It cost two repos a no-op fix each, in the same hour.
- **Verify the path production takes, not the artifact you changed.** A local build proves the script works; it says nothing about whether the deploy runs it, or whether the URL a crawler requests serves what the build emitted.
