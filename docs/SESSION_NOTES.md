# Session Notes

## Latest session (2026-08-03 → 04): fleet-wide PWA audit, then fleet-wide public-visibility audit

**Worked on:** two full-fleet audits folded back into the pattern docs, plus the
repo-side fixes worth doing immediately. Sibling repos were attached with
`add_repo` + shallow clones under `/workspace/` — **the `GITHUB_ALL_REPO_TOKEN`
API path is blocked by the session proxy for repos not attached to the session**,
so CLAUDE.md's "never clone siblings, use the API" note does not hold in this
environment. Worth fixing in CLAUDE.md or in the proxy, but not silently.

### Round 1–3 — PWA

Audited every PWA repo against `PWA_SYSTEM.md` / `PWA_ICON_CACHE_BUST.md` /
`APP_ICONS.md`. **The docs lagged the fleet's own fixes and several snippets in
them were actively buggy** — multiple repos had independently fixed the same
things, which is what made the findings trustworthy.

Selecting repos by the portfolio's `badge`/`tech` metadata covered **6 of 15**.
Only 5 repos advertise PWA-ness; 15 ship a service worker. The user's home
screen was the ground truth. Nine more repos audited in a second pass; two were
entirely untracked (`dm-website`, `web-arch`/"redline") and `model-pear` was
recorded as a React non-PWA when it is a **SvelteKit** PWA.

**Two repos had a dead service worker in production**, both verified against real
workbox/plugin source and then in headless Chromium rather than inferred:
repo-tor threw `add-to-cache-list-conflicting-entries`; model-pear's
`navigateFallback: '/200.html'` named a URL workbox never precached. Both fixed
and merged. **My first diagnosis of both was wrong** — I claimed registration
failed; both workers actually reach `activated` and precache nothing, and every
route registered after the throw never runs. Corrected in the docs and in both
PRs before merging.

Other corrections to text I wrote earlier the same session: the
duplicate-precache rule is fatal only when the two revisions *disagree*; and the
in-flight promise I added to `checkForUpdate` turned a hang into a *permanent*
one (`registration.update()` can never settle — measured), now bounded by
`Promise.race`.

Round 3 was the first source change: seven of glow-props' own eight self-audit
items closed in `src/lib/pwa.js` + `src/components/PwaManager.jsx` (iOS browser
detection, poll `.catch()`, clear-before-prompt, event buffering,
`useSyncExternalStore` over immutable snapshots, dead timer removed), plus a new
`npm run verify:ssr-safety` import-graph tripwire. Fleet bookkeeping closed: PWA
recorded in all 14 mirrored `meta.json`, model-pear corrected to SvelteKit, Gap
Matrix extended 12 → 16 repos, `PROJECT_DOCS.md` reconciled.

### Round 4 — public visibility (SEO + link previews)

Four parallel audits of all 15 PWAs against `DISCOVERABILITY.md`. All four
independently concluded **extend that doc, do not add an `SEO.md`** — the doc
opens by rejecting "SEO" as a container, so a doc by that name re-establishes
the conflation it exists to dissolve.

**Measured split:** nine repos carry a near-identical full OG set and every card
that exists is correctly 1200×630. Six carry nothing at all — no OG, no Twitter,
no card, no `robots.txt`, no sitemap.

`DISCOVERABILITY.md` grew 370 → 573 lines: a **mixed** posture column,
`Disallow` blocks unfurlers, soft 404s, copy quality and cross-item uniqueness,
per-item cards, unfurl-only vs indexable, where per-route tags come from (**edge
rewriting fails open** — `HTMLRewriter.on()` is a no-op when its selector matches
nothing), framework variants for Vue / SvelteKit / Expo, canonicalization across
four axes, sitemap discipline with `lastmod`, and structured data as its own
step. One existing rule **reversed**: "keep text out of the card image" was a
fontconfig workaround presented as a rule, and now inverts for per-item cards.

**Three repo fixes merged** (highest-value defects): intxt's `Disallow: /join`,
which switched off the invite card a whole build step exists to produce, for
every robots-respecting unfurler; fh-fuelhunt had **no `<title>` at all** — now
title, description, canonical, full OG/Twitter and a generated 1200×630 card;
repo-tor served 6.1 MB of commit bodies (including from repos its own config
marks private) with no `robots.txt` and no `X-Robots-Tag`.

### Round 5 — TIMER_LEAKS audit

Every repo audited against `TIMER_LEAKS.md`. The pattern gained three variants
the fleet had already invented independently: one-shot vs **looping** rAF (only
the looping form needs a cancel handle), `.remove()`-style subscription handles
(React Native `AppState`/`Linking`, which have no `removeEventListener`), and
service workers being **exempt** (no unmount, no HMR — a `setTimeout` in a
`waitUntil` is the correct shape, not a leak).

`npm run verify:timer-cleanup` was widened to `.ts/.tsx/.vue/.svelte` and its
release-verb regex made callback-reference-tolerant — **the tripwire failed the
pattern's own variant 1**, because `/\bclearTimeout\s*\(/` does not match
`timeouts.forEach(clearTimeout)`. Proved against the doc's own snippet, then
fixed.

### Round 6 — the fix pass (all 16 repos)

Every repo-side finding from all three audits worked through in the order the
user set: dm → fh → sun-sea-o → intxt → fl → see-veo → web-arch → kl → qi → the
rest. **16 PRs opened and merged.** The per-repo list is in `docs/TODO.md` under
"Fleet fix pass — 2026-08-04"; the ones that cost a real user something:
four-ems answered every shared form URL with "You're offline" while online;
fh-fuelhunt cached Mapbox URLs **with the `access_token` in the cache key**;
see-veo shipped an empty meta description because a code comment contained a
literal `<meta name="description">`; canva-grid's installed users were
offline-capable for exactly one hour.

Three claims I had written down **did not reproduce** and were dropped rather
than "fixed": fh-fuelhunt's transparent icon raster (fully opaque — the real
defect was the safe zone, at 49%), sun-sea-o's `handleNeedRefresh` early
returns (correct suppression), and my own rAF fault injection, which passed
because I injected into a file that already had a `cancelAnimationFrame`
elsewhere. My test was wrong, not the code.

### Round 7 — improvements the fix pass surfaced, folded back in

Four gaps that only implementing the fixes could reveal:

1. **APP_ICONS.md prescribed 780px**, which measures at 40.5% against its own
   40% safe circle. fh-fuelhunt measured 49%. Two of two repos following the
   rule were outside it, because a derivation cannot see the rasterizer's
   antialiasing. The doc now carries `assertMaskableSafeZone()` and says
   measure, not derive.
2. **A regex reading HTML reads comments too** — and this one is a correction,
   not a finding. see-veo's "meta description shipped empty in production" was
   **wrong**: the page was always correct, and `audit-discoverability.mjs`
   matched a commented tag literal fifteen lines above the real tag. Both that
   script and `verify-seo.mjs` now strip comments first; proven with a
   commented `og:title` carrying a wrong value, which the old code failed on.
   Corrected in see-veo's own docs too (#59).
2b. **Re-parsing all 16 origins with a real parser then found the same
   blindness in the BUILD, live.** model-pear was serving **no `<title>` and no
   modulepreloads** on any prerendered page: the comment added in #122 named the
   framework's head placeholder literally, and SvelteKit substituted the entire
   injected head *between the comment markers*. Reading a comment gives a wrong
   report; writing into one gives a wrong page — and `grep` reassures you both
   times. Fixed in #123 with source + built-output assertions.
3. **A shell template must not carry a tag its routes emit.** Turning on
   model-pear's prerendering gave every page two `<title>`s; `app.html`'s won.
   Invisible until prerendering starts — i.e. while fixing something else.
4. **Assert the install UI has a non-test importer.** fh-fuelhunt's ~550 lines
   were correct, tested, and in the component graph of nothing.

### Round 8 — the audit grew two checks, and each found a live defect

`audit-discoverability.mjs` now **counts** `<title>` on the comment-stripped
document, and **fetches one item page per origin** from the sitemap's first
non-home `<loc>`. Both additions paid immediately:

- **fh-fuelhunt and intxt served an EMPTY title** — Expo Router's static export
  writes react-helmet's `<title data-rh="true"></title>` as the first element
  in `<head>`, ahead of the real one from `+html.tsx`, and first wins.
  fh-fuelhunt's had been shadowed since the day I added it. Fixed by a
  post-export strip in both (#80, #163); `expo-router/head` is unavailable in
  both because each rewrites `/(.*)` to a single document.
- **model-pear served the SPA shell at every URL its sitemap advertises.**
  `/pricing.html` was 25,903 bytes with a real title; `/pricing` was 11,723
  with none, same deploy. A host serves a file only on an exact path match, so
  the catch-all rewrite answered every extensionless URL. Fixed with explicit
  rewrites ahead of the catch-all plus a tripwire that derives the expectation
  from the build (#124).

Also fixed a bug in the audit itself: `sitemapServed` looked for the root
element in the first 400 characters, and model-pear's sitemap opens with an
explanatory comment, so a perfectly good sitemap graded as missing.

### Round 9 — the fixes shipped without running

Both Expo title fixes were wired into `package.json`'s build script. **Vercel
runs `vercel.json`'s `buildCommand`, a hand-copied duplicate of the same
pipeline, in neither case containing the new step.** Both deploys went green and
shipped nothing. Caught only by measuring the live documents afterwards.

intxt's first fix attempt then *failed to deploy* — `buildCommand` is capped at
256 characters and the synced pipeline was 260 — which forced the right answer:
delete the duplicate rather than sync it. fh-fuelhunt's was 198 and would have
sat there indefinitely, so it was moved to delegation too (#82).

A sweep of all 15 deploy configs found fh-fuelhunt was the last duplicated one:
eleven delegate or omit `buildCommand` (Vercel then defaults to `npm run
build`), web-arch runs `npm run build && npm test`. `DISCOVERABILITY.md` now
carries the rule and the preference order.

**Verified live with a real HTML parser**, after three wrong readings in a row
(a `grep -c` counting lines not elements, a 15-byte SSO redirect read as an
empty page, and the earlier comment-blind regex): `fuelhunt.app`, `intxt.app`
and `intxt.app/join` each serve exactly one `<title>`, placeholder gone.

### Round 10 — the absent features, actually built

Nine repos gained what they were missing, each posture decided from the notes
already distributed to them rather than guessed:

- **canva-grid** (#154) — had NO implementation at all. robots, sitemap,
  canonical, title, OG + generated card, `WebApplication`, and 0 -> 775
  crawlable characters.
- **fl-farlume** (#50) — **not indexed, still shareable**. noindex twice (meta +
  header), robots that ALLOWS the crawl, full OG + card. The reflex fix
  (`Disallow: /`) is the one thing that must never appear: it blocks the crawl
  that delivers the noindex AND kills the card on every major unfurler. The
  test fails if anyone adds one.
- **four-ems** (#32, #33) — the fleet's only **mixed** posture. `X-Robots-Tag`
  narrowed to `/forms/*` alone; widening it to `/(.*)` would noindex the front
  door and every published form, and the test pins both halves. Landing body
  added separately.
- **intxt** (#165), **fh-fuelhunt** (#84), **model-pear** (#125) — structured
  data, sitemaps, per-page identity tags.
- **see-veo** (#60) — a CV serving 0 characters. Now 6,564, GENERATED from
  `cv-data.ts` (a hand-written second copy of a CV drifts the first time a role
  changes) including every highlight, which is the part a recruiter searches.
- **kl-website** (#12) — the articles already had bodies; the HOME page did not.
  0 -> 1,630, an index of the investigations with links to each prerendered URL.
- **dm-website** (#24) — the best head machinery in the fleet over an empty
  root: 12 pages, 0 characters. Now 14,839 rendered AT THE EDGE from the same
  data modules `routeMeta.ts` imports. Its existing `verify-head-selectors`
  CAUGHT ITSELF being outgrown — it refused the new `div#root` selector as
  unparseable rather than passing blind.

**model-pear's new test found a third shadowing instance on its first run**:
`app.html` still carried a static `<meta name="description">`, sibling of the
`<title>` removed in #123, so all three pages served the shell copy to crawlers.

The audit gained two corrections of its own. It sampled the FIRST non-home
`<loc>`, which is always a section landing — it never saw an item page. Now the
DEEPEST, last-of-ties (depth alone still picked `/legal/terms`). And crawlable
body is judged across both sampled pages, so a shell landing over rich item
pages is described accurately — `complete; landing page is a shell (item page
carries 1312 chars)` — rather than called broken. Not a loosening: the gap is
still reported when nothing sampled says anything, and the shell is named.

**Final board: 14 of 16 Pass or Pass (P).** The two that are not are decisions,
not work.

## Current state

- glow-props: source + docs, on `claude/pwa-patterns-review-76cg78`. Build green,
  all five verify gates green. Verified behaviourally — `dist/` served under its
  real `/glow-props/` base and driven in headless Chromium: SW activated, React
  mounted, menu interactive, zero page errors.
- **glow-props' own maskable icon was outside its own corrected safe circle** —
  measured at 40.5% against 40%. `MASKABLE_MARK` 780 → 760, and
  `assertMaskableSafeZone()` now measures the **rendered ink** in the produced
  PNG rather than trusting the geometry. The two disagreed by half a percent
  because a derivation cannot see antialiasing, and pixels are the only thing
  Android looks at.
- Merged this session: repo-tor #121 + #122 + #123, model-pear (SW fix) + #122,
  intxt #161 + #162, fh-fuelhunt #78 + #79, dm-website #23, sun-sea-o #41,
  fl-farlume #49, see-veo #58, web-arch #11, kl-website #11, qi-invoice #13,
  four-ems #31, canva-grid #153, graphiki #86. No PRs left open.
- `docs/TODO.md` carries both audits' remaining repo-side drift, and **both
  rounds' findings are now distributed into each repo's own `docs/TODO.md`** —
  nine SEO notes merged 2026-08-04 (canva-grid, dm-website, fl-farlume,
  four-ems, graphiki, kl-website, model-pear, see-veo, sun-sea-o).
- **The Gap Matrix has a `DISCOVERABILITY` column**, the only one graded against
  deployed reality rather than source, with the grading criteria written down so
  the cells mean something — and **regenerable**: `npm run
  audit:discoverability [--check]` fetches all 16 origins, applies the criteria
  in code, prints the cells and fails on drift against `docs/TODO.md`. That is
  the fix for how the other columns went stale; a grade nobody can recompute is
  a grade nobody notices has expired. Origins come from
  `public/projects/*/meta.json`, so a new project joins automatically. Not a
  deploy gate on purpose — sixteen third-party origins, and someone else's 503
  must not block a docs change.
- **The script reproduced the hand grading on 14 of 16 and corrected the other
  two**, which is the acceptance test: glow-props was graded `Pass` counting
  structured data that is still on a branch (live has none — now `Partial`), and
  tool-till-tees was `?` purely because nobody had looked (now `Missing`, and it
  needs a posture decision). Final: 3 Pass, 1 Pass (private), 7 Partial, 5
  Missing.
- The note above the table now says plainly that the eight never-revisited
  columns carry April-2026 grades from a method that this session proved
  over-reports `Pass`.

## Key context for the next session

- **All 15 deployed origins were checked live** (home document, `/robots.txt`,
  `/sitemap.xml`, a nonexistent path — pre-JavaScript document plus real
  headers). It was worth doing: it widened the SPA-rewrite trap from one repo to
  five, showed **10 of 15 origins soft-404**, and confirmed zero crawlable body
  text in six. The script is disposable; the findings are in TODO.md.
- **Both glow-props items the live check found are fixed.** The `<title>` now
  matches `og:title`, and structured data ships on all three templates: one
  `@id`-joined graph per page, site nodes static, item node added by
  `prerenderPages()` for the clean URLs and by `src/seoMeta.js` for the `?name=`
  forms — verified in Chromium that the runtime path rewrites the existing block
  rather than adding a second one. `verify:seo` gates title↔`og:title`
  agreement, a title length budget, and the JSON-LD invariants; five fault
  injections were confirmed to fail the right gate, including reformatting the
  template's JSON, which breaks the prerender literal and fails the build.
- **Both writers now build their nodes from `src/lib/structuredData.js`.** They
  produced the same node in two places, and a tripwire can only check that the
  node exists — not that two independent builders still agree. One module makes
  the drift impossible rather than detectable.
- **New fifth gate: `npm run smoke:seo`** (`scripts/smoke-structured-data.mjs`),
  wired into the deploy workflow with a chromium-only Playwright install. It
  serves `dist/` under the real `/glow-props/` base and loads five routes in
  Chromium. It earns the browser: making `seoMeta.js` append a second block
  instead of rewriting the existing one leaves `dist/` unchanged and
  `verify:seo` **green**, and fails this check on all four item routes — that
  exact injection was run. It FAILS rather than skips when Playwright is
  missing, on purpose. The browser is cached in CI keyed on the resolved
  Playwright version; without that every deploy re-downloaded ~170 MB.
- **Division of labour between the two SEO gates, checked rather than assumed:**
  `verify:seo` covers **every** item page (12 patterns + 16 projects) — proven
  by injecting a literal `</script>` into a project page the smoke test never
  visits and watching it fail. `smoke:seo` covers the runtime *mechanism*, so
  one page of each shape is the right scope, not a coverage gap.
- The verification discipline that worked, and repeatedly caught my own wrong
  conclusions: build → parse the emitted precache manifest → run the real
  workbox code → serve over localhost → drive in headless Chromium → prove the
  tripwire fails when the bug is reintroduced. Three analytical conclusions were
  wrong and the empirical pass caught all three.
- `GIT_AUTHOR_EMAIL`/`GIT_COMMITTER_EMAIL` are set as environment variables in
  this container and **override `.git/config`**, so `git config user.email …`
  silently does nothing. Pass `GIT_*` explicitly on every commit.
- **Two items are decisions, not work, and are the only things left open:**
  repo-tor publishing private-repo commit bodies (`noindex` is not access
  control), and tool-till-tees having a live URL with no discoverability posture
  of any kind. Both are in `docs/TODO.md`; neither can be closed without the
  user.
