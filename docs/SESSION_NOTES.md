# Session Notes

## Worked on
Hygiene sweep on `claude/review-guidelines-iM84o`: ran the `clean` and `doc-cleanup` triggers across the whole codebase and fixed the actionable findings.

## Accomplished
- `clean` pass: dropped a duplicate Requirement/Approach comment block in the dev-server middleware in `vite.config.js` (the second pair was a strict superset of the first — kept the version that documents the basename() path-traversal note). Commit `d48d506`.
- `doc-cleanup` pass: identified pattern-count drift between source-of-truth (`docs/implementations/`) and surfaced docs.
- Fixed `README.md` pattern count: 10 → 11 in both the prose ("Currently 10 patterns") and the project-structure tree comment. Added "Timer & Subscription Cleanup" to the named list.
- Refreshed this file (the prior version described a session from weeks ago on a different branch).

## Current state
- Branch: `claude/review-guidelines-iM84o`, pushed to origin.
- `vite.config.js` and `README.md` reflect reality.
- One known doc drift consciously left alone: `docs/PROJECT_DOCS.md` "Last mirrored: 2026-03-31" is 25 days stale. Bumping the date without actually re-running the mirror sweep against sibling repos would be dishonest. Needs an explicit mirror-sync task.

## Key context
- There are **11** implementation patterns in `docs/implementations/` (all with valid YAML frontmatter). Any doc that names or counts them must include `TIMER_LEAKS.md` (slug `timer-leaks`, title "Timer & Subscription Cleanup").
- The `generatePatternManifest` Vite plugin scans the folder at build time, so the app already shows 11 — the drift was only in human-edited surface docs.
- `TODO.md` per-repo audits are time-stamped; historical "9 patterns" / "10 patterns" notes are correct as-of those dates and should not be back-edited.
- `clean` pass also verified: no leftover `TODO`/`FIXME`/`HACK`/`XXX` markers in source, no commented-out code blocks, no unused imports, all `window.md.*` / `window.__pwa.*` / `window.__theme.*` exports are consumed.
- `doc-cleanup` rejected (with reasons): CLAUDE.md `TutorialModal.jsx` AI Note + `USER_GUIDE.md` / `TESTING_GUIDE.md` sections are fleet-wide rules for the shared CLAUDE.md, not local drift; `AI_MISTAKES.md` and `USER_ACTIONS.md` are clean; no orphaned or superseded docs.
