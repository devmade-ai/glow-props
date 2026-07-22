# Session Notes

## Worked on
Refreshing the projects catalog — it was out of date — on branch
`claude/google-analytics-setup-34ltdy`.

## Accomplished
Projects render in three hardcoded places, all updated:
- **`index.html`** (the homepage cards): `SyncTone` → **inTXT** (heading,
  description rewritten to intention tags with no reveal mechanic, live URL →
  `intxt.app`); FuelHunt live URL → `fuelhunt.app`; budgy card heading
  `Cashflow Tracker` → **Farlume** (rebrand). Added three new user-facing cards:
  **knowless** (kl-website, `knowless.net`), **redline** (web-arch — knowless
  sub-brand), **devmade** (dm-website, now live at `www.devmade.app`).
- **`README.md`** (the featured-projects table): same fixes + the 3 new rows;
  also aligned display names to brands (few-lap→FuelHunt, sun-sea-o→Sancio).
- **`public/projects/*/meta.json`** (the detail-page data): rewrote
  `synctone/meta.json` (title/description/liveUrl → intxt, tech NativeWind →
  Uniwind, OneSignal → Web Push, useCases/dataPrivacy de-toned); `few-lap`
  liveUrl → fuelhunt.app; **created** `kl-website/`, `web-arch/`, `dm-website/`
  meta.json (rich meta, `docs: {}` so no scrubbed doc files are required).

## Current state
- `./node_modules/.bin/vite build` clean — `validateProjectMeta` accepted all 15
  metas; dist carries the 3 new project dirs + all five brand names; zero stale
  strings (`SyncTone` / `Cashflow Tracker` / old vercel URLs) in built index.html.
- Committed on `claude/google-analytics-setup-34ltdy` (not merged).

## Key context
- The `?name=` slug and GitHub repo names are UNCHANGED (`?name=synctone`,
  `?name=budgy-ting`) — only the brand-facing fields moved. The repos are still
  named `synctone` / `budgy-ting` on GitHub, so the slugs stay.
- **Known follow-up (not done):** inTXT's Details page renders the SCRUBBED
  `public/projects/synctone/{README,USER_GUIDE,TESTING_GUIDE,TUTORIAL}.md`, which
  still say "SyncTone"/"tone". Those deep scrubbed mirrors weren't rewritten this
  pass (large, and secondary to the catalog fix). The 3 new dirs have no scrubbed
  docs yet (`docs: {}`) — add them if the detail pages should carry doc links.
- Ground truth for "what's deployed" came from querying each scoped repo's GitHub
  `homepage`/`has_pages` directly — the account-wide `/user/repos` API is blocked
  (sessions are repo-scoped), and `illuminAI-select` can't be enumerated from here.
- Two pre-existing build notices (`<script src="theme.js">` not bundled) are the
  intentional classic static-asset script — unrelated.
