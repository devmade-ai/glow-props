# Session Notes

## Worked on
Full TODO.md audit against actual repo code, policy changes (HISTORY.md removal, Communication section), new pattern (PWA_ICON_CACHE_BUST), dynamic pattern discovery system.

## Accomplished
- Audited all 10 downstream repos' actual source code against the per-repo gap matrix in TODO.md
- Discovered canva-grid, budgy-ting, and repo-tor had resolved most/all gaps since the original April 6 audit — updated matrix
- Fixed stale TODO items: canva-grid (19 items done), budgy-ting (5 of 7 patterns now Pass), repo-tor (all 5 gaps done)
- Fixed inaccuracies: see-veo DOWNLOAD_PDF button already exists, few-lap MenuItem interface already exists, four-ems CLAUDE.md line count corrected (~630 not ~475), repo-tor cross-tab sync claim unverified
- Closed EVENT_BUS as N/A for canva-grid, budgy-ting, repo-tor (decided against)
- Added top-level `## Communication` section to CLAUDE.md (9 rules: peer-to-peer, no sycophancy, proper solutions only, ask before assuming, always ask at least one question, etc.)
- Removed `docs/HISTORY.md` from glow-props — policy change: git history tracks completions, no separate changelog needed
- Added HISTORY.md removal + Communication section propagation tasks to all 10 downstream repos
- Created new `docs/implementations/PWA_ICON_CACHE_BUST.md` pattern (content-hashed icon cache busting across 5 cache layers)
- Added ICON_CACHE_BUST column to gap matrix (Missing in all 9 PWA repos, N/A for glow-props and model-pear)
- Added per-repo ICON_CACHE_BUST implementation subsections (Vite template for 7 repos, Expo/Metro template for few-lap and synctone)
- Built dynamic pattern discovery system: YAML frontmatter on all 10 .md files → generatePatternManifest Vite plugin → patterns/manifest.json → index.html and pattern.html consume dynamically. No more hardcoded pattern lists.
- All 10 patterns now visible in the app (was 7 — EVENT_BUS, Z_INDEX_SCALE, PWA_ICON_CACHE_BUST were missing)
- Hardened: \r\n line ending support, slug format validation, manifest fetch timeout, closure-scoped rawMarkdown

## Current state
- Branch: `claude/review-todo-items-MDTlq`
- 10 patterns tracked in gap matrix and all visible in the app
- Dynamic pattern system: add a .md with frontmatter → it appears automatically
- Only glow-props is fully clean on all patterns
- canva-grid, budgy-ting, repo-tor are clean on original 9 patterns but need ICON_CACHE_BUST + HISTORY.md removal + Communication section
- All changes committed and pushed

## Key context
- `plant-fur` and `coin-zapp` are discontinued — excluded per CLAUDE.md
- canva-grid-assets is pure assets, tool-till-tees is backend API — no frontend patterns
- The CLAUDE.md Communication section is a new top-level section that all downstream repos must add
- HISTORY.md removal is a cross-fleet policy — tracked per-repo in TODO.md
- PWA_ICON_CACHE_BUST uses content-hashed query strings (80/20 approach); filename-hash is the architecturally pure alternative (documented in tradeoff section)
- Expo repos (few-lap, synctone) need stack-specific adaptation for ICON_CACHE_BUST — custom sw.js, not vite-plugin-pwa
- model-pear has the lowest compliance (5 of 7 original patterns Missing, no PWA yet)
- Pattern frontmatter contract: slug (URL-safe), title, badge, description (required); tags, order (optional). Documented in CLAUDE.md Implementation Patterns section.
