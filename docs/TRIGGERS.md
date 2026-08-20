# Triggers

The vocabulary of analysis passes. `CLAUDE.md` names what a trigger is and
points here; this file is what each one means and how a sweep behaves.

Commands that invoke focused analysis passes. Each trigger is a single perspective — what you'd notice that the others wouldn't.

### How to invoke

- **One perspective** — type the trigger name or its alias (e.g. `bugs`, `sec`, `a11y`).
- **A group** — type the group name (e.g. `correctness`, `frontend`, `ops`).
- **Everything** — type `all`.
- **Meta sweep** — type `quick`, `ship`, or `risk` for pre-curated bundles.

### Scope modifiers (suffix any trigger)

- *(none)* — whole codebase.
- `branch` — diff against the branch's base (default: `main`).
- `branch <base>` — diff against a specified base.
- `staged` — staged changes only.
- `file <path>` — single file.

Examples:
- `bugs` — bugs check across the whole codebase.
- `bugs branch` — bugs check on the current branch's diff vs main.
- `correctness branch main` — every correctness trigger against the branch diff.
- `all staged` — every applicable trigger against staged files.

### Behavior rules

- One trigger pass per response. Never combine.
- Findings are numbered text — never interactive prompts or selection UIs.
- After each pass, pause. User responds with `fix` / `skip` / `stop`:
  - `fix` — apply the suggested fixes for this trigger, then move on.
  - `skip` — skip this trigger's findings and move on.
  - `stop` — end the sweep entirely.
- Groups, meta sweeps, and `all` run triggers sequentially in table order, pausing after each.
- If a trigger doesn't apply to this repo (e.g. `database` on a static site), report "N/A for this repo" and move on.
- Triggers are the one place a pause is expected rather than a stop needing justification (Scope and Completion) — the user asked for a review, not a rewrite. Everywhere else, a found problem gets fixed.

### Correctness — group `correctness`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 1 | `bugs` | `bug` | Logic errors, off-by-ones, null/undefined paths, wrong default branches, stale assumptions |
| 2 | `errors` | `err` | Missing try/catch, swallowed failures, unhelpful error surfaces to user and dev |
| 3 | `race` | `rac` | Concurrency, stale closures, async ordering, event leaks, double-fire guards |
| 4 | `types` | `typ` | `any`/`as` abuse, unsafe casts, missing generics, runtime-vs-compile-time gaps |
| 5 | `edges` | `edg` | Empty/null/zero/max/unicode/timezone boundary cases; 0-item, 1-item, 10k-item behavior |

### Security / trust — group `trust`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 6 | `security` | `sec` | Injection, XSS, CSRF, auth gaps, insecure defaults, exposed secrets in code or bundle |
| 7 | `privacy` | `pri` | PII flow, redaction, retention, client-side data leaks, telemetry overreach |
| 8 | `supply-chain` | `sup` | Dep integrity, lockfile drift, postinstall hooks, third-party scripts |

### Performance — group `speed`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 9 | `performance` | `perf` | Render loops, expensive ops in hot paths, memory leaks, large re-computations |
| 10 | `network` | `net` | Request count, caching, batching, waterfalls, payload size, compression |
| 11 | `database` | `db` | N+1, missing indexes, transaction scope, lock contention |
| 12 | `bundle` | `bun` | Code splitting, tree-shaking, duplicate deps, blocking resources |

### User-facing — group `frontend`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 13 | `ux` | `ux` | Friction, cognitive load, missing loading/empty/error states, undiscoverable affordances |
| 14 | `a11y` | `a11y` | Keyboard nav, screen reader labels, focus order, contrast, ARIA correctness |
| 15 | `mobile` | `mob` | Touch target size, viewport, safe areas, tap delay, gestures, iOS keyboard handling |
| 16 | `motion` | `mot` | `prefers-reduced-motion` respect, animation jank, 60fps budgets, autoplay, transitions that interrupt screen-reader flow |
| 17 | `forms` | `frm` | Input validation, per-field error states, submit error handling, accessible field labels, paste/autofill behavior, unsaved-changes warnings |
| 18 | `copy` | `cpy` | Microcopy, voice consistency, jargon, error messages users actually see |
| 19 | `i18n` | `i18` | Hardcoded strings, RTL readiness, date/number formatting, pluralization |
| 20 | `dark-mode` | `dm` | Semantic color usage, contrast in both themes, flash-on-load |
| 21 | `visual` | `vis` | Layout/spacing/alignment, visual hierarchy, brand consistency, dark-vs-light visual parity, inconsistent corner radii/shadows/type scale |

### Maintainability — group `quality`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 22 | `clean` | `cln` | Dead code, duplication, commented-out blocks, unused imports/exports, leftover TODOs |
| 23 | `naming` | `nam` | Identifier clarity, consistency with local norms, misleading abbreviations |
| 24 | `patterns` | `pat` | Deviation from established patterns (fleet-wide gp-props or repo-local), reinvented wheels |
| 25 | `docs` | `doc` | Docs ↔ code drift, missing docs on public API, outdated README/CLAUDE.md claims |
| 26 | `doc-cleanup` | `dcl` | Duplicated content across doc files, stale files no longer relevant, orphaned docs nothing references, superseded files that replaced but didn't delete their predecessor, sections still describing removed features |
| 27 | `tests` | `tst` | Coverage gaps on critical paths, flaky patterns, test smells, missing edge-case tests |
| 28 | `complexity` | `cpx` | Function length, nesting depth, cyclomatic complexity hotspots |
| 29 | `hacks` | `hck` | `TODO`/`FIXME`/`HACK`/`XXX` markers, `@ts-ignore`/`@ts-expect-error`, `any` escapes framed as temporary, `setTimeout` for timing fixes, quick patches waiting to be done properly |
| 30 | `simplify` | `smp` | Reinvented framework features, over-engineered abstractions, custom code that could be 1–2 stdlib/library calls, unnecessary layers |
| 31 | `reuse` | `rus` | Custom-vs-stdlib balance: how much is hand-written that shouldn't be; logic that should be extracted for reuse but isn't; abstractions generalized for a single caller; speculative parameters, defensive checks for impossible states, and configurability serving no real need |
| 32 | `back-compat` | `bck` | Orphaned feature flags, deprecated branches with no callers, `legacy*` exports, backcompat shims outliving their purpose, `// kept for compatibility` blocks |
| 33 | `comments` | `cmt` | Code comments against repo rules — WHY not WHAT, no PR-reference rot, no AI narration, no commented-out blocks unless `// KEEP:` annotated |
| 34 | `dx` | `dx` | Developer experience: README/setup clarity, dev-error message quality, source map/stack trace usefulness, debug-surface ergonomics, contribution path friction |
| 35 | `undone` | `und` | Started-but-unfinished work — partial implementations, half-wired features, WIP branches of logic, features only reachable from dev but not production |

### Operational — group `ops`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 36 | `deps` | `dep` | Outdated, unused, vulnerable, license-risky dependencies |
| 37 | `observability` | `obs` | Log coverage, metric hygiene, trace completeness, debug-pill surfaces |
| 38 | `reliability` | `rel` | Retries, timeouts, idempotency, graceful degradation, offline handling |
| 39 | `config` | `cfg` | Env var handling, secret management, config schema drift |
| 40 | `migration` | `mig` | DB migration safety, API versioning, rollback plan, backward compatibility |
| 41 | `ci` | `ci` | Pipeline health, build speed, cache effectiveness, flake rate |
| 42 | `pwa` | `pwa` | Service worker correctness, manifest validity, install prompt handling, update flow, offline behavior, icon cache-busting, standalone-mode quirks |

### Design-level — group `design`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 43 | `architecture` | `arch` | Coupling, layering violations, abstraction leaks, module boundaries |
| 44 | `api` | `api` | Interface consistency, versioning, deprecation, contract clarity |
| 45 | `state` | `sta` | Where state lives, derivation vs storage, single-source-of-truth violations |
| 46 | `data-model` | `dat` | Schema normalization, foreign-key integrity, nullable discipline |

### Fleet alignment — group `fleet`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 47 | `align` | `aln` | Drift between this repo's CLAUDE.md and gp-props CLAUDE.md — missing sections, stale rules, divergent conventions. Drift runs both ways: anything this repo does better gets upstreamed, not overwritten (see "Alignment levels up, never down") |
| 48 | `pattern-audit` | `pa` | Every gp-props implementation pattern: implemented / partial / missing / deviates — with diff notes for each. A deviation that is an improvement is an upstream candidate, not a defect |

### Meta sweeps

Run multiple triggers sequentially, pausing after each for `fix` / `skip` / `stop`. Organised roughly by cadence — pick the one that matches when you're running it.

| Trigger | Alias | Cadence | What it does |
|---------|-------|---------|--------------|
| `hot` | `h` | pre-commit | `bugs` + `types` + `errors` — fastest sanity check before committing. Pairs well with `hot staged` |
| `quick` | `q` | pre-push | `bugs` + `security` + `a11y` — the "don't ship this" triad |
| `ship` | `shp` | pre-merge | `correctness` + `trust` + `a11y` + `tests` — full pre-merge check |
| `session` | `ses` | end of session | `surface` + `wrap` + `undone` + `skipped` + `convention` — "what state am I leaving this in?" |
| `tidy` | `tdy` | weekly | `clean` + `doc-cleanup` + `hacks` + `deps` + `undone` + `dx` — maintenance / hygiene sweep |
| `all` | `*` | quarterly | Every applicable trigger across every group, in order |

### Reflective passes

Single-pass, no fan-out to other triggers. Each answers one specific question about the recent work.

| Trigger | Alias | What it does |
|---------|-------|--------------|
| `risk` | `rsk` | Worst-case blast radius analysis on the current change |
| `surface` | `srf` | Reflective pass on recent changes: what was decided, what was assumed, what was skipped, what needs human review |
| `wrap` | `wrp` | Wrap-up pass before moving on — anything to double-check / strengthen / improve, anything discovered / assumed / skipped, anything to cleanup / update / tighten, anything to note / document / clarify |
| `skipped` | `skp` | What was left undone — issues noticed and not fixed, wherever they were noticed. Each item: what it is, where, why it wasn't fixed. Under Scope and Completion this list should come back empty; anything in it is a defect to close, not a record to keep |
| `assumed` | `asm` | What was assumed — anything decided rather than asked. Each item: the assumption, why it was made, what happens if wrong |
| `approach` | `apr` | Was the fix the best / most proper way? Honest self-review: what shortcuts were taken, what a senior reviewer would flag, what the "proper" version looks like if different |
| `convention` | `cnv` | Audit CLAUDE.md against what this session actually produced. For each place the output was poor, decide which is at fault — the output, or the rule that produced it. Two-directional: a rule that earned no words gets deleted, not amended. Evidence is real output, never a re-read of the file |
| `cold` | `cld` | Fresh-eyes branch audit. Re-read CLAUDE.md from scratch. Review every change on the branch as if this were a new session with no prior context — don't privilege the diffs you just made. List all findings with a fix plan per item. Default scope: `branch` |
