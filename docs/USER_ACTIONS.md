# User Actions

## 1. Re-point anything outside the repos

**Why:** the rename and the host change broke every saved link to
`devmade-ai.github.io/glow-props/`. GitHub redirects the *repo* URL after a
rename, but the Pages URL is gone — it now returns 404, so a saved link fails
outright rather than quietly serving a stale copy.

Worth checking: browser bookmarks, any installed PWA copy of the old site (the
manifest `id` changed, so an existing install will NOT update — it has to be
removed and re-installed from the new origin), and any link in a CV, profile or
external page.

---

*Completed and removed: connecting the repo to Vercel (the site serves at
`https://gp-props.vercel.app/`) and turning GitHub Pages off (both
`devmade-ai.github.io/glow-props/` and `.../gp-props/` verified 404 on
2026-08-06).*
