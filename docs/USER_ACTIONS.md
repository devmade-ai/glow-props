# User Actions

## 1. Connect the repo to Vercel and confirm the domain

**Why:** the repo now carries `vercel.json` and the whole site is built for
`https://gp-props.vercel.app/` — canonicals, Open Graph URLs, JSON-LD `@id`s,
the sitemap and `robots.txt` all point there. Nothing serves until the project
exists on Vercel.

**Steps**
1. Import `devmade-ai/gp-props` in Vercel.
2. Leave the build settings alone — `vercel.json` sets them: framework `vite`,
   output `dist`, build command `npm run build && npm run verify`.
3. Confirm the production domain really is `gp-props.vercel.app`. If Vercel
   assigns something else, say so — every absolute URL above has to change with
   it, and they all come from one constant (`SITE` in `src/lib/structuredData.js`).

## 2. Turn off GitHub Pages

**Why:** the site has moved. Leaving Pages on means two live copies of the
portfolio at different origins, each with its own canonical — which is exactly
the duplicate-content case `DISCOVERABILITY.md` exists to prevent. It also keeps
the old `devmade-ai.github.io/glow-props/` URL answering, so a downstream repo
still pointing at it looks fine while being wrong.

**Steps**
1. Repo **Settings → Pages → Source → None**.
2. Delete the `github-pages` environment if it lingers (Settings → Environments).

Cannot be done from here: the `/repos/{owner}/{repo}/pages` API is blocked by
this session's proxy, and the setting has no other programmatic route.

## 3. Re-point anything outside the repos

**Why:** the rename and the host change break every saved link to
`devmade-ai.github.io/glow-props/`. GitHub redirects the *repo* URL after a
rename, but the Pages URL stops resolving once step 2 is done.

Worth checking: browser bookmarks, any installed PWA copy of the old site (the
manifest `id` changed, so an existing install will NOT update — it has to be
removed and re-installed from the new origin), and any link in a CV, profile or
external page.
