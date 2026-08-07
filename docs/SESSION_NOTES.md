# Session Notes

## Latest session (2026-08-07): rename cleanup across the fleet, and four CI failures that were not failures

**Worked on:** finishing the `glow-props` → `gp-props` rename — the references the
move left behind in this repo, a fleet-wide sweep of all 19 live repos, a data
fix in repo-tor, and the diagnosis of four red CI runs.

### This repo — ten stale references (`cb048ba`)

The rename and the host change landed together and left stragglers a grep for the
old slug could not find, because they name the old *app* or the old *host*:

- **User-facing, the one that mattered:** the install modal heading and the
  Brave / Chrome / Edge steps still said "Install Glow Props" while the manifest
  installs as `short_name: 'Props'`. The browser builds that menu label from the
  manifest, so the steps told a non-technical user to look for an entry that does
  not exist, at the moment they were trying to install.
- README claimed a GitHub Pages deploy, listed the deleted `deploy.yml`, and ended
  with "set Pages source to GitHub Actions" — the exact opposite of what
  `USER_ACTIONS.md` was asking for. Now describes the real split: Vercel runs
  `build && verify` (four file gates), CI runs the fifth (`smoke:seo`, needs
  Chromium).
- `package.json` description, CLAUDE.md's "Fetch via GitHub Pages" label (in the
  block downstream repos copy), `TODO.md`'s app-name map.
- `index.html`'s CSP rationale rejected an HTTP header because "GitHub Pages
  doesn't allow custom headers". Vercel does, so the recorded reason was false.
  The real one: a `vercel.json` header would leave `vite preview` and local
  `dist/` serves unprotected, so a CSP break would first appear in production.

**Deliberately left:** the two comments explaining what the base *used to be*,
`USER_ACTIONS.md` (it is about the old URL by design), `PWA_SYSTEM.md`'s Pages
cache-header note (a fleet note for repos actually on Pages), and
`canva-grid-assets`' meta.json (that project really is on Pages).

### `src/lib/appIdentity.js` (`cf6dc61`)

Fixing those three strings by hand left the same trap armed — the manifest name
and the copy quoting it agreed only because someone kept them in step, and
nothing can check that. `APP_NAME`/`APP_SHORT_NAME` now feed the manifest in
`vite.config.js` **and** both install surfaces. Pure module (no DOM, no Node
APIs) because it is imported under Node by the config, by browser bundles, and
through `InstallModal` by the SSR entry's graph — same constraint
`structuredData.js` carries. Verified in the built bundle: `const Yf="Props"`
feeds both `Install ${...}...` steps and the modal heading.

### Fleet sweep — 19 repos, clean

Added and cloned every live repo (`plant-fur`/`coin-zapp` skipped as
discontinued) and grepped for `glow-props`, `glow_props`, `glowprops`,
`devmade-ai.github.io`. **No repo holds a stale pointer.** All 18 with a pattern
pointer already use `gp-props.vercel.app`; `canva-grid-assets` has none, correct
for an asset repo. Live-checked `CLAUDE.md`, two pattern docs, a clean pattern
URL, `sitemap.xml`, `robots.txt` — all 200.

Three greps hit but are not misses: `fh-fuelhunt`'s `BrandGlowProps` (a TS
interface), `four-ems`' `AI_MISTAKES.md` describing a past CORS bug, and
`tool-till-tees:src/App.tsx:46` linking `devmade-ai.github.io/see-veo/` — a
*different* repo's Pages site, unrelated to this rename but worth checking
separately.

### repo-tor — 236 records keyed by the old name (`813697f`, `f3fa6cb`, `82fe7b1`)

`processed/gp-props/commits/*.json` all carried `"repo_id": "glow-props"`. That
is the key the dashboard groups by, so gp-props was about to split into a frozen
`glow-props` plus a `gp-props` starting at zero. Rewritten and verified: 236
files, diff contains no line without `repo_id`, replayed grouping yields one key.
`intxt` checked after its synctone rename — clean; gp-props was the only case.
Also corrected `USER_ACTIONS.md` there: its "the proxy 403s every repo but
repo-tor" blocker has expired (all six now 200), and the real obstacle is the
human-in-the-loop batch review — 335 commits, ~14 batches.

### Four red CI runs — none of them a build failure

gp-props CI #1, qi-invoice #29, sp-backend #36 and **sun-sea-o #48 (on `main`)**
all showed ✗ with **no failing job**. Each had `runner_id: 0`, empty
`runner_name`, `started_at == created_at` and **no `steps` array** — the job never
began — then was cancelled at ~15 minutes. Cause: the rename was pushed to ~16
repos inside two minutes, saturating the account's concurrent-job allowance. All
four re-ran green with no code change, each assigned a runner in ~3 seconds.
Recorded in `docs/AI_MISTAKES.md` (`e66f163`) led by the diagnostic signature,
since the failure misrepresents itself as a broken build.

## Current state

- **gp-props** — branch `claude/gp-props-rename-refs-ps9c9q`: `cb048ba`,
  `cf6dc61`, `e66f163`. Build clean, four file gates green, `smoke:seo` green
  over 5 routes.
- **repo-tor** — branch `claude/gp-props-rename-refs-ps9c9q`: `813697f`,
  `f3fa6cb`, `82fe7b1`.
- GitHub Pages is **off** — `devmade-ai.github.io/glow-props/` and `.../gp-props/`
  both 404, verified. `USER_ACTIONS.md` is down to one human-only item
  (bookmarks, re-installing the PWA — the manifest `id` changed so an existing
  install cannot update itself, external links).

## Key context for the next session

- **`GITHUB_ALL_REPO_TOKEN` covers repo metadata and commits fleet-wide, but the
  Actions API is 403 for every repo except gp-props.** Use the github MCP tools
  for workflow runs. Note their `list_workflow_runs` responses are enormous
  (~300–450k chars) — filter by branch and `per_page`, or parse the saved
  tool-result file.
- **Fleet-wide pushes starve CI of runners.** Stagger them; the per-repo
  workflows are fine. A red run with no failing step means checking `runner_id`
  before reading any code.
- Six repos in repo-tor's `config/repos.json` (`dm-website`, `hf-sculpt`,
  `kl-website`, `sp-backend`, `sp-website`, `web-arch`) still have no
  `processed/` data — 335 commits, blocked on batch review, not on access.
