# Session Notes

## Worked on
Rebranding the synctone project's scrubbed detail-page docs from the stale
SyncTone/tone content to inTXT — the follow-up flagged after the catalog refresh
(PR #50, merged). Branch `claude/google-analytics-setup-34ltdy`, restarted from
`main` (the prior PR was already merged, so this is a fresh change, not stacked).

## Accomplished
Rewrote all four `public/projects/synctone/*.md` files (the Details page renders
`README.md`; the others are linked from it) to accurately describe the current
product, sourced from the live `synctone` repo's own docs (which are already
rebranded to inTXT):
- **README.md** — scrubbed rewrite: intention tags (no reveal step), ✓/✓✓ read
  receipts, quick-6 + More reactions, scheduling, share target, Uniwind + Web
  Push in the tech table, `intxt.app` links, ~42,000 codes. Dropped the dev-only
  sections (DB schema, Quick Start, local URLs, dev commands, code conventions).
- **USER_GUIDE.md** — mirrored the current repo's user guide verbatim (it's
  already accurate + user-facing; grep-clean of secrets/local URLs).
- **TESTING_GUIDE.md** — rewritten at portfolio altitude (the live 561-line
  source is dev-command-heavy): first-launch/create/join/messaging/intention
  tags/editing/reactions/reply/deletion/info/scheduling/notifications/PWA/desktop/
  chat-management/rate-limiting + regression checklist, all corrected (no reveal,
  no "delivered" tick, quick-6+More, 4-slide tutorial, mutual end-chat, `#`-frag
  join links, merged Notifications setting).
- **TUTORIAL.md** — rewritten to the current 4 slides (anonymous / tag-what-you-
  mean / on-your-terms / private-by-default).

## Current state
- `./node_modules/.bin/vite build` clean — `validateProjectMeta` still green
  (synctone keeps `docs: {readme,userGuide,testingGuide,tutorial}` all true; all
  four files exist). Residual-term sweep across the four files: no `SyncTone` /
  `tone tag` / `revealed` / `NativeWind` / `OneSignal` / 9-step / 12-emoji.
- Committed on `claude/google-analytics-setup-34ltdy` (fresh branch off main).

## Key context
- Source of truth for the rewrite = the live `synctone` repo docs (README +
  docs/USER_GUIDE + docs/TESTING_GUIDE) + its CLAUDE.md, all already inTXT.
- The `?name=synctone` slug and the GitHub repo name are unchanged — only the
  brand-facing content moved (the repo is still `synctone` on GitHub).
- The three project dirs added in PR #50 (`kl-website`, `web-arch`, `dm-website`)
  still carry `docs: {}` (no scrubbed doc files) — add them if those Details pages
  should carry doc links.
- Pre-existing `<script src="theme.js">` build notices are the intentional classic
  static-asset script — unrelated.
