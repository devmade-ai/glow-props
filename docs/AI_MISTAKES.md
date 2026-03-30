# AI Mistakes

## 2026-03-30: Suggested an implementation that caused a bug in consuming projects

**What went wrong:** The Meta Theme-Color section in CLAUDE.md's suggested implementations confidently prescribed switching `theme-color` between background colors (`#ffffff`/`#1a1a2e`) on dark mode toggle. This pattern caused invisible status bar text when the OS color scheme opposed the app theme — a bug shipped to real users because a consuming project followed the suggestion.

**Why it happened:** Wrote a suggested implementation without validating it against real device behavior. The pattern sounded reasonable in theory (match the status bar to the page background) but failed in practice (OS controls status bar text color, not the app).

**How to prevent it:** Don't add suggested implementations to CLAUDE.md unless the pattern has been tested in a real project. Suggested implementations are treated as authoritative — if they're wrong, consuming projects ship bugs.

## 2026-03-30: Rewrote a flawed suggestion instead of removing it

**What went wrong:** User asked to remove the above suggestion. Instead of deleting it, rewrote it three times — first hardcoding a brand color, then simplifying the code, then finally removing it after the user had to explicitly say so twice.

**Why it happened:** Defaulted to "fix the code" mode instead of listening to what the user actually wanted: stop suggesting this pattern entirely.

**How to prevent it:** When a user says a suggestion caused issues and should be removed, remove it. Don't rewrite, don't "improve" it, don't preserve it in a different form. Ask one clarifying question if genuinely unsure, but default to deletion when the user's intent is to get rid of something.

## 2026-03-03: Failed to install dependencies before running scripts

**What went wrong:** Ran `npm run generate-icons` without checking if `sharp` was installed. It wasn't. Instead of installing it, reported "Sharp isn't available in this environment" and skipped icon regeneration — leaving the task incomplete.

**Why it happened:** Assumed the missing package was an environment limitation rather than checking `package.json` devDependencies and running `npm install`. The CLAUDE.md AI Notes explicitly say "Check build tools before building" and to verify dependencies exist before attempting builds.

**How to prevent it:** Before running any script that imports packages, check if `node_modules` exists and has the required package. If not, run `npm install` (or install the specific package) first. Never assume a missing dependency is an environment constraint — try installing it.
