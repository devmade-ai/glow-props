# Session Notes

## Worked on
Adding scrubbed detail-page docs for the three project dirs that shipped with
the catalog refresh (PR #50) carrying `docs: {}` (no doc files):
`kl-website`, `web-arch`, `dm-website`. Branch
`claude/google-analytics-setup-34ltdy`, restarted from `main` (prior PR #51 was
already merged, so this is a fresh change, not stacked).

## Accomplished
Created scrubbed markdown under each project dir and flipped its `meta.json`
`docs` flags so the Details page renders the doc tabs:
- **kl-website** — `README.md` only (source repo has just a README).
  `docs: { readme }`. The knowless reader (four tabs, reader overlay,
  save-for-offline, install, night theme), tech at portfolio altitude.
- **web-arch (redline)** — `README.md` + `USER_GUIDE.md` + `TESTING_GUIDE.md`.
  `docs: { readme, userGuide, testingGuide }`. README + USER_GUIDE scrubbed from
  the live repo's own docs; TESTING_GUIDE freshly rewritten at portfolio altitude
  (source was dev-command/headless-harness heavy).
- **dm-website** — `README.md` + `USER_GUIDE.md` + `TESTING_GUIDE.md`.
  `docs: { readme, userGuide, testingGuide }`. README reframed as **live at
  www.devmade.app** (the source README's "Not yet deployed" line was stale —
  the site is deployed); USER_GUIDE kept faithful; TESTING_GUIDE stripped of the
  localhost/CORS/env intro + the npm-tooling regression bullet.

Scrub rule applied throughout: no `npm run`/`npm install`, no localhost/`:5173`,
no `VITE_*` / `OPENROUTER_API_KEY` / `SUPABASE_*`, no `wrangler`/`npx`/`supabase`
commands, no DB schema/RLS, no deploy internals, no source-tree/CLAUDE.md refs.

## Current state
- `./node_modules/.bin/vite build` clean — `validateProjectMeta` green (all three
  dirs' declared `docs` files exist; no warnings). Doc files + flipped flags
  verified copied into `dist/projects/*/`.
- Grep sweep of the six new files for scrub targets: CLEAN (zero matches).
- Committed on `claude/google-analytics-setup-34ltdy` (fresh branch off main).

## Key context
- The Details page (`project.html`) renders one labeled tab per `meta.docs.<key>:
  true` (Overview / User Guide / Testing Guide / Tutorial), fetching the matching
  file from `public/projects/<slug>/`. `validateProjectMeta` in `vite.config.js`
  warns if a declared doc file is missing (`DOC_FILE_MAP`: readme→README.md,
  userGuide→USER_GUIDE.md, testingGuide→TESTING_GUIDE.md, tutorial→TUTORIAL.md).
- `?name=<slug>` slugs stay the GitHub repo names (`kl-website` / `web-arch` /
  `dm-website`); redline is web-arch's brand, knowless is kl-website's.
- `intxt`'s four docs (from the earlier PR #51) remain the reference for the
  scrub altitude; these three now match that treatment.
