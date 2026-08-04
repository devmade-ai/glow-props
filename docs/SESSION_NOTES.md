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
