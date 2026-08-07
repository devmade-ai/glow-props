# AI Mistakes

## 2026-08-06: Pushed a fleet-wide change to every repo at once and starved CI of runners

**What went wrong:** The `glow-props` → `gp-props` rename was pushed to ~16 repos inside about two minutes (19:33–19:35), each opening a PR, each firing both a push and a pull_request run. That burst exceeded the account's concurrent-job allowance. Four jobs never got a runner at all and were cancelled ~15 minutes later: `verify` in gp-props (CI #1), `verify` in qi-invoice (CI #29), `Docker image` in sp-backend (CI #36), and `check` in sun-sea-o (CI #48). The last one was the merge commit landing on **main**, so sun-sea-o's default branch showed red for 10 hours over a job that never executed. Re-running all four with no code change passed — every job was assigned a runner within ~3 seconds.

**Why it happened:** A fleet-wide edit is naturally executed as a loop over repos, and nothing in that loop is aware that CI capacity is a *shared, account-level* resource. Each individual push was correct and cheap; the aggregate was what broke. The cost is invisible at authoring time because it lands minutes later, in a different repo, as someone else's problem.

**How to recognise it (the diagnostic signature):** the run shows ✗ but there is **no failing job** — `get_job_logs --failed_only` returns "No failed jobs found". The job's conclusion is `cancelled`, `runner_id` is `0`, `runner_name` is `""`, `started_at == created_at`, and there is **no `steps` array at all**, because the job never began. Duration is ~15 minutes, GitHub's cancel point for an unassignable job. Corroborate with a sibling: in sp-backend CI #36 the other two jobs in the SAME run with the SAME `ubuntu-latest` label got runners in 3 seconds and passed — which rules out label mismatch, workflow error, and the commit itself. This reads exactly like a broken build to anyone who does not check `runner_id`, so the wasted hours go into hunting a bug that was never there.

**How to prevent it:** Stagger fleet-wide pushes rather than firing every repo in one loop — the per-repo workflows are fine and need no change. When a red run has no failing step, check `runner_id`/`steps` BEFORE reading any code, and re-run rather than debug. Remediation is just `rerun_workflow_run`; nothing needs fixing in the repos.

## 2026-08-01: Self-reported pattern compliance without verifying it

**What went wrong:** The Gap Matrix in `docs/TODO.md` graded gp-props "Pass" or "N/A" in every column. A full 12-pattern self-audit found the row wrong in six columns — including two production breaks that had shipped: the service worker threw `add-to-cache-list-conflicting-entries` at evaluation (duplicate icon precache entries — the entire offline layer was dead), and all 12 prerendered pattern pages loaded `theme.js` from a relative path that 404s (theme picker and burger menu dead on the canonical URLs). The ICON_CACHE_BUST "N/A" rested on a premise ("static site, no PWA icons") that the same matrix row contradicted by marking PWA_SYSTEM "Pass".

**Why it happened:** The matrix cells for this repo were filled in from memory of what had been implemented, not from the same evidence standard the fleet audits apply to downstream repos (one agent per repo, file-level verification). N/A cells were recorded without rationale footnotes — the exact defect this file's process flags when other repos do it — so nothing forced the premise to be checked. And no tripwire covered the two breaks: `verify:seo` checked head tags on prerendered pages but not their script/asset paths, and nothing inspected the built `sw.js` precache list.

**How to prevent it:** Grade this repo's own matrix row by the downstream standard: per-pattern verification against the actual files and the actual build output, never from memory. Every N/A needs a written rationale at the moment it's recorded; an N/A without one is unverified. When a break can only be seen in `dist/` (SW precache conflicts, un-versioned URLs, broken asset paths), add a dist-level tripwire the same day the feature lands — `verify:icons` and the extended `verify:seo`/`verify:timer-cleanup` now cover these three.

## 2026-03-31: Used stale secondary source instead of the authoritative API

**What went wrong:** Built the portfolio project list from repo-tor's `projects.json` file, which was incomplete (missing four-ems, sun-sea-o). Used the GitHub API's public-repos-only endpoint to cross-check, which hid private repos. Missed two projects entirely — sun-sea-o was caught by the user, four-ems was caught when the user provided the actual live URLs. Also used GitHub Pages URLs from the stale projects.json instead of the current Vercel URLs for 5 projects.

**Why it happened:** Trusted a secondary source (repo-tor's projects.json) as the canonical list instead of using `GITHUB_ALL_REPO_TOKEN` — which was available the entire time and documented in CLAUDE.md — to query `api.github.com/user/repos?per_page=100` and get ALL repos including private ones. One API call would have returned the complete list of 15 repos.

**How to prevent it:** When building a list of all repos, always use the `GITHUB_ALL_REPO_TOKEN` to query the authenticated `/user/repos` endpoint first. This returns all repos including private ones. Never rely on a secondary source (projects.json, memory, partial lists) as the single source of truth. Cross-check live URLs against actual deployments, not cached project manifests.

## 2026-03-30: Suggested an implementation that caused a bug in consuming projects

**What went wrong:** The Meta Theme-Color section in CLAUDE.md's suggested implementations confidently prescribed switching `theme-color` between background colors (`#ffffff`/`#1a1a2e`) on dark mode toggle. This pattern caused invisible status bar text when the OS color scheme opposed the app theme — a bug shipped to real users because a consuming project followed the suggestion.

**Why it happened:** Wrote a suggested implementation without validating it against real device behavior. The pattern sounded reasonable in theory (match the status bar to the page background) but failed in practice (OS controls status bar text color, not the app).

**How to prevent it:** Don't add suggested implementations to CLAUDE.md unless the pattern has been tested in a real project. Suggested implementations are treated as authoritative — if they're wrong, consuming projects ship bugs.

**Resolution (2026-04-02):** Implemented the correct approach from canva-grid: light themes use primary/neutral colors (saturated or dark enough that white text is always legible), dark themes use base-100 (dark background). The key insight is that the status bar color must never be white/light — the OS controls the text color, so only dark or saturated backgrounds are safe. See `THEME_DARK_MODE.md` PWA Meta Theme-Color section for the full pattern.

## 2026-03-30: Rewrote a flawed suggestion instead of removing it

**What went wrong:** User asked to remove the above suggestion. Instead of deleting it, rewrote it three times — first hardcoding a brand color, then simplifying the code, then finally removing it after the user had to explicitly say so twice.

**Why it happened:** Defaulted to "fix the code" mode instead of listening to what the user actually wanted: stop suggesting this pattern entirely.

**How to prevent it:** When a user says a suggestion caused issues and should be removed, remove it. Don't rewrite, don't "improve" it, don't preserve it in a different form. Ask one clarifying question if genuinely unsure, but default to deletion when the user's intent is to get rid of something.

## 2026-03-03: Failed to install dependencies before running scripts

**What went wrong:** Ran `npm run generate-icons` without checking if `sharp` was installed. It wasn't. Instead of installing it, reported "Sharp isn't available in this environment" and skipped icon regeneration — leaving the task incomplete.

**Why it happened:** Assumed the missing package was an environment limitation rather than checking `package.json` devDependencies and running `npm install`. The CLAUDE.md AI Notes explicitly say "Check build tools before building" and to verify dependencies exist before attempting builds.

**How to prevent it:** Before running any script that imports packages, check if `node_modules` exists and has the required package. If not, run `npm install` (or install the specific package) first. Never assume a missing dependency is an environment constraint — try installing it.
