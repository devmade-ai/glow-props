# READ AND FOLLOW THE PROCESS, PRINCIPLES, COMMUNICATION, CODE STANDARDS, DOCUMENTATION, AI NOTES, TRIGGERS, AND PROHIBITIONS EVERY TIME

## Fetching This File

This file is hosted at: `https://devmade-ai.github.io/glow-props/CLAUDE.md`

To fetch it directly:
```bash
curl -sf "https://devmade-ai.github.io/glow-props/CLAUDE.md"
```

## Process

1. **Read these preferences first**
2. **Gather context from documentation** (CLAUDE.md, relevant docs/)
3. **Then proceed with the task**

### REMINDER: READ AND FOLLOW THE PROCESS EVERY TIME

## Principles

1. **User-first design** - Align with how real people will use the tool (top priority)
2. **Simplicity** - Simple flow, clear guidance, non-overwhelming visuals, accurate interpretation
3. **Document WHY** - Explain decisions and how they align with tool goals
4. **Testability** - Ensure correctness and alignment with usage goals can be verified
5. **Know the purpose** - Always be aware of what the tool is for
6. **Follow conventions** - Best practices and consistent patterns
7. **Repeatable process** - Follow consistent steps to ensure all the above

### REMINDER: READ AND FOLLOW THE PRINCIPLES EVERY TIME

## Communication

Respond as if talking to yourself. Peer-to-peer, no servility.

- **Direct.** No filler, no preamble, no conversational padding. State facts and actions.
- **No sycophancy.** No "great question", "you're absolutely right", "excellent point". Acknowledge errors briefly and move on.
- **No hedging.** Commit to a position. "I think" / "perhaps" only when genuinely uncertain.
- **Proper solutions only.** Always suggest the right fix, not a quick hack. If the proper solution is complex, explain why the shortcut is wrong and lay out the real approach.
- **Work, not process.** Only discuss work that can be done and work that is done. Never opine on branching, pull requests, git history editing, commit granularity, development process, or code review flow — those are the user's domain and must never influence how you execute a task. If you notice a process concern, keep it to yourself and get on with the work.
- **Ask before assuming.** When a user reports a bug or makes a request, ask clarifying questions until you are certain you understand the requirement. Don't guess the cause and build a fix on an assumption — one wrong assumption wastes multiple commits. When the request is unambiguous, proceed — a manufactured question is filler.
- **Concrete options.** When clarification is needed, list numbered options — never open-ended questions.
- **Assume competence.** The reader is a developer. Don't over-explain basics.
- **Push back.** Disagree when warranted. State your view first, then ask if they want to proceed differently.
- **Close every substantive reply with three things.** (1) **Concerns** — what worries you about the current state: risks, doubts, unverified assumptions, things that could bite later. (2) **Suggestions** — concrete recommended next moves. (3) **The ask** — why this is being raised to the user and what input or decision is needed from them, presented as numbered options when input is needed; say "nothing needed from you" explicitly when that's the case. Empty sections collapse: when there are genuinely no concerns or suggestions, one closing line ("No concerns; nothing needed from you") beats three boilerplate headings.

### REMINDER: READ AND FOLLOW THE COMMUNICATION RULES EVERY TIME

## Code Standards

### Code Organization

- Prefer smaller, focused files and functions
- **Pause and consider extraction at:** 500 lines (file), 100 lines (function), 400 lines (component)
- **Strongly refactor at:** 800+ lines (file), 150+ lines (function), 600+ lines (component)
- Extract reusable logic into separate modules/files immediately
- Group related functionality into logical directories

### Decision Documentation in Code

Non-trivial code changes must include comments explaining:
- **What** was the requirement or instruction
- **Why** this approach was chosen
- **What alternatives** were considered and why they were rejected

```jsx
// Requirement: Per-cell overlay that stacks on top of image overlay
// Approach: cellOverlays in layout state, rendered as separate div layer
// Alternatives:
//   - Merge with image overlay: Rejected - user needs independent control
//   - CSS filter approach: Rejected - can't do gradient overlays
```

### Cleanup

- Remove `console.log`/`console.debug` statements before marking work complete
- Delete unused imports, variables, and dead code immediately
- Remove commented-out code unless explicitly marked `// KEEP:` with reason
- Remove temporary/scratch files after implementation is complete

### Timer and Subscription Cleanup

- Every `setTimeout`/`setInterval`/`addEventListener`/`subscribe` needs a matching cleanup (`clearTimeout`/`clearInterval`/`removeEventListener`/unsubscribe handle).
- Store timer ids in a scope the cleanup can reach. Nested timeouts → array; single-shot → local const or ref.
- In React: return cleanup from `useEffect`. In plain modules: export a `dispose()` or use `AbortController`.
- HMR-safe: guard global listener attachment behind a `window.__<featureName>Attached` flag so hot-reload doesn't double-subscribe. For frameworks exposing `import.meta.hot`, also release listeners via `import.meta.hot.dispose()`.
- See [`docs/implementations/TIMER_LEAKS.md`](docs/implementations/TIMER_LEAKS.md) for concrete patterns (nested-timeout array, AbortController, per-effect dispose, HMR guard).

### Quality Checks

During every change, actively scan for:
- Error handling gaps
- Edge cases not covered
- Inconsistent naming
- Code duplication that should be extracted
- Missing input validation at boundaries
- Security concerns (XSS via dangerouslySetInnerHTML, unsanitized user input)
- Performance issues (unnecessary re-renders, missing keys, large re-computations)

Report findings even if not directly related to current task.

### User Experience (Non-Negotiable)

All end users are non-technical. This overrides cleverness.

- UI must be intuitive without instructions
- Use plain language - no jargon or developer-speak in user-facing text
- Error messages must say what went wrong AND what to do next, in simple terms
- Confirm destructive actions with clear consequences explained
- Provide feedback for all user actions (loading states, success confirmations)

### Commit Message Format

All commits must include metadata footers:

```
type(scope): subject

Body explaining why.

Tags: tag1, tag2, tag3
Complexity: 1-5
Urgency: 1-5
Impact: internal|user-facing|infrastructure|api
Risk: low|medium|high
Debt: added|paid|neutral
Epic: feature-name
Semver: patch|minor|major
```

**Tags:** Use relevant tags for the change (e.g., documentation, pwa, debug, ui, refactor, testing)
**Complexity:** 1=trivial, 2=small, 3=medium, 4=large, 5=major rewrite
**Urgency:** 1=planned, 2=normal, 3=elevated, 4=urgent, 5=critical
**Impact:** internal, user-facing, infrastructure, or api
**Risk:** low=safe change, medium=could break things, high=touches critical paths
**Debt:** added=introduced shortcuts, paid=cleaned up debt, neutral=neither
**Epic:** groups related commits under one feature/initiative name
**Semver:** patch=bugfix, minor=new feature, major=breaking change

These footers are required on every commit. No exceptions.

### REMINDER: READ AND FOLLOW THE CODE STANDARDS EVERY TIME

## Documentation

**AI assistants automatically maintain these documents.** Update them as you work - don't wait for the user to ask. This ensures context is always current for the next session.

### `CLAUDE.md`

**Purpose:** AI preferences, project overview, architecture, key state structures.
**When to read:** At the start of every session, before doing any work.
**When to update:** When project architecture changes, state structure changes, or preferences evolve.
**What to include:**

- Process, Principles, AI Notes: Update when learning new patterns or preferences
- Project Status: Current working features (bullet list)
- Architecture: File structure with brief descriptions
- Key State Structure: Important state shapes with comments
- Any section that becomes outdated after feature changes

**Why:** This is the primary context for AI assistants. Accurate info here prevents mistakes.

### `docs/SESSION_NOTES.md`

**Purpose:** Compact context summary for session continuity (like `/compact` output).
**When to read:** At the start of a session to quickly understand what was done previously.
**When to update:** Rewrite at session end with a fresh summary. Clear previous content.
**What to include:**

- **Worked on:** Brief description of focus area
- **Accomplished:** Bullet list of completions
- **Current state:** Where things stand (working/broken/in-progress)
- **Key context:** Important info the next session needs to know

**Why:** Enables quick resumption without re-reading entire codebase. Not a changelog - a snapshot.

### `docs/TODO.md`

**Purpose:** AI-managed backlog of ideas and potential improvements.
**When to read:** When looking for work to do, or when the user asks about pending tasks.
**When to update:** When noticing potential improvements. Delete completed items (git history tracks them).
**What to include:**

- Group by category (Features, UX, Technical, etc.)
- Use `- [ ]` for pending items only
- Brief description of what and why
- When complete, delete from TODO (git history tracks completions — no separate changelog needed)

**Why:** User reviews this to prioritize work. Keeps TODO focused on pending items only.

### `docs/USER_ACTIONS.md`

**Purpose:** Manual actions requiring user intervention outside the codebase.
**When to read:** When something requires manual user intervention (deployments, API keys, external config).
**When to update:** When tasks need external action. Clear when completed.
**What to include:**

- Action title and description
- Why it's needed
- Steps to complete
- Keep empty when nothing pending (with placeholder text)

**Why:** Some tasks require credentials, dashboards, or manual config the AI can't do.

### `docs/PROJECT_DOCS.md` (glow-props only)

**Purpose:** Status table + process for the mirrored per-project docs under `public/projects/*/`.
**When to read:** Before mirroring or scrubbing a downstream project's docs into the portfolio.
**When to update:** After any mirror pass — refresh the status table and the "Last mirrored" date.

### `docs/AI_MISTAKES.md`

**Purpose:** Record significant AI mistakes and learnings to prevent repetition.
**When to read:** When starting a session, to avoid repeating past mistakes.
**When to update:** After making a mistake that wasted time or broke things.
**What to include:**

- What went wrong
- Why it happened
- How to prevent it
- Date (for context)

**Why:** AI assistants repeat mistakes across sessions. This document builds institutional memory.

### `README.md`

**Purpose:** User-facing guide for the application.
**When to read:** When you need a quick overview of what the tool does and its main features.
**When to update:** When features change that affect how users interact with the tool.
**What to include:**

- What the tool does (overview)
- Current features (keep in sync with actual functionality)
- How to use each feature (user guide)
- Getting started / installation
- Tech stack and deployment info

**Why:** Users and contributors read this first. Must accurately reflect the current state.

### `docs/USER_GUIDE.md`

**Purpose:** Comprehensive user documentation explaining how to use every feature.
**When to read:** When you need to understand what users can do with the tool, or how a feature is supposed to work from the user's perspective.
**When to update:** When adding new features, changing UI workflows, or modifying how existing features work.
**What to include:**

- Tab-by-tab walkthrough of the interface
- Explanation of every control and what it does
- Workflow tips and best practices
- Organized by user tasks, not technical implementation

**Why:** Serves as the authoritative reference for user-facing behavior. Helps ensure AI assistants understand the user experience.

### `docs/TESTING_GUIDE.md`

**Purpose:** Manual test scenarios for verifying the application works correctly.
**When to read:** Before testing changes, or when you need to verify specific functionality works.
**When to update:** When adding new features that need test coverage, or when existing tests become outdated.
**What to include:**

- Step-by-step test scenarios with exact actions
- Where to click/look for each step
- Expected results for each action
- Regression checklist for quick verification

**Why:** Ensures consistent, thorough testing. Prevents regressions by documenting what to verify after changes.

### REMINDER: READ AND FOLLOW THE DOCUMENTATION EVERY TIME

## AI Notes

- **All code is yours.** Every file change, every commit, every branch across every tracked repo is your own work. The user has stated this as fact — it's not a heuristic to evaluate against git author, branch name, or your own memory. When you resume a session and encounter unfamiliar changes, they are your prior work. Don't hedge authorship ("this was added", "someone wrote this"), don't investigate your own work as if written by a third party, don't refuse to build on or modify it. If you need to understand a change, read the diff. That's all.
- Always read a file before attempting to edit it
- Check for existing patterns in the codebase before creating new ones
- Commit and push changes before ending a session
- Clean up completed or obsolete docs/files and remove references to them
- **CRITICAL: Keep `TutorialModal.jsx` up to date** - This is USER-FACING help content shown in-app. When tabs, sections, or features change, update the tutorial steps to match. Outdated tutorial content confuses users. (Fleet rule for the app repos — glow-props itself has no TutorialModal; its mirrored copies of downstream tutorials live under `public/projects/*/TUTORIAL.md`.)
- **Always read files before editing.** Use the Read tool on every file before attempting to Edit it. Editing without reading first will fail.
- **Check build tools before building.** Run `npm install` or verify `node_modules/.bin/vite` exists before attempting `npm run build`. There is no prebuild step — `npm run build` is `vite build` directly; icon generation (`npm run generate-icons`, needs `sharp`) is manual-only and its PNGs are committed.
- **Break up large file writes to avoid timeouts.** Single tool calls that send a lot of content can hit transport timeouts in slower environments. For modifying existing files, always prefer `Edit` over a full-file `Write` — `Edit` sends only the diff. For creating files larger than ~500 lines (or any large data blob), seed with `Write` containing the first portion, then append the remainder via successive `Edit` calls. Same principle for committing large doc/data changes: many small edits are safer than one mega-write.
- **Claude Code mobile/web — accessing sibling repos:**
  - Use `GITHUB_ALL_REPO_TOKEN` with the GitHub API (`api.github.com/repos/devmade-ai/{repo}/contents/{path}`) to read files from other devmade-ai repos
  - Use `$(printenv GITHUB_ALL_REPO_TOKEN)` not `$GITHUB_ALL_REPO_TOKEN` to avoid shell expansion issues
  - Never clone sibling repos — use the API instead
- **Discontinued repos — skip entirely:** `plant-fur` and `coin-zapp` are discontinued. Do not check, audit, align, or include them in cross-project operations.
- **Implementation patterns — always fetch from glow-props.** Never look for local copies of implementation pattern files (e.g., `docs/implementations/*.md`) in downstream repos. They do not exist locally — the single source of truth is the `docs/implementations/` folder in the glow-props repo. Fetch the latest version before every implementation task.
- **React reference implementation.** glow-props is a React 19 + Vite MPA (three entries, one root each) and is the fleet's living reference for the patterns' React variants: `src/components/BurgerMenu.jsx` + `src/hooks/{useDisclosureFocus,useFocusTrap,useEscapeKey}.js` per BURGER_MENU.md; `src/lib/pwa.js` (module singleton, immutable state snapshots) + `src/components/PwaManager.jsx` bridging it into React via `useSyncExternalStore` per PWA_SYSTEM.md; `src/components/Toast.jsx` (ToastProvider); THEME_DARK_MODE Approach A in `src/lib/theme.js` + `src/hooks/useTheme.js` with the pre-paint bootstrap still inline in `partials/head-common.html`. Four inline classic scripts MUST stay in the head partial (GA, theme bootstrap, debug capture + 20s load watchdog, `beforeinstallprompt` capture) — they run before any module, which is their entire purpose. `src/entry-server.jsx` must never import `src/lib/pwa.js` (it registers the SW on import and needs `virtual:pwa-register`, which only resolves in the full plugin pipeline); PWA state reaches SSR-rendered components through `src/context/PwaContext.js`, whose DEFAULT value is the SSR-safe shape.
- **DISCOVERABILITY in this repo:** glow-props follows the PUBLIC column of its own [`docs/implementations/DISCOVERABILITY.md`](docs/implementations/DISCOVERABILITY.md) — indexable, `robots.txt` allowing the crawl and naming the sitemap, per-page canonical, full Open Graph + Twitter coverage, and a 1200×630 card generated from the icon (`npm run generate:og-image`). Four things are deliberate and easy to undo by accident: (1) **the landing page, every pattern, and every project are SSG'd** by `prerenderPages()` in `vite.config.js` — a nested Vite server `ssrLoadModule`s `src/entry-server.jsx`, which `renderToString`s the SAME components the client mounts, injected into each built template's empty `<div id="root"></div>` with per-item head tags replaced literal-for-literal (fail-loud). `createRoot().render()` REPLACES that markup on mount — render-then-replace, not hydration, because the pages fetch their data at runtime. Every component link is base-absolute (`import.meta.env.BASE_URL`), so nested pages need no path rewriting. The clean URLs are canonical; the `?name=` forms still work and point at them. (2) `sitemap.xml` is GENERATED at build from `docs/implementations/` and `public/projects/` — adding `public/sitemap.xml` would shadow it. (3) `pattern.html` / `project.html` carry NO static canonical, because their content is chosen by `?name=` and a fixed one would collapse every item onto a single URL; it is set at runtime in `src/seoMeta.js`. (4) the SSG'd landing page carries `prerender` mode — no `scroll-animate` classes, because without JS nothing lifts that utility's `opacity:0`. (5) **structured data is ONE `<script type="application/ld+json" id="page-jsonld">` per page** — the `Organization` + `WebSite` nodes are static in all three templates (true everywhere, `@id`-joined rather than repeated inline), `prerenderPages()` replaces that exact JSON literal with the same graph plus the item's `TechArticle`/`SoftwareApplication` node, and `src/seoMeta.js` rewrites the SAME block for the `?name=` forms rather than appending a second one. Item copy is escaped `<` → `<` on both paths, since JSON.stringify won't and the HTML tokenizer wins. (6) `<title>` must equal `og:title` wherever the title is real (the landing page and every prerendered item page) — `pattern.html`/`project.html` keep a placeholder title on purpose, which is why the check is scoped rather than global. Both writers build their nodes from ONE module, `src/lib/structuredData.js` — imported by `vite.config.js` and `src/seoMeta.js` — so the two cannot disagree about the same item; it is pure (no DOM, no Node APIs) because it sits in the SSR entry's graph. `npm run verify:seo` is the tripwire for the built output and `npm run smoke:seo` for the runtime half — **run `npm run build` before either**, since their checks over `dist/` are only as current as the last build. The smoke check loads the built pages in real Chromium and is the ONLY gate that can see a second JSON-LD block being appended rather than the existing one rewritten (that change leaves `dist/` untouched, so `verify:seo` stays green); both gate the deploy. Separately, `npm run audit:discoverability [--check]` grades the WHOLE FLEET against the live origins and fails on drift from the Gap Matrix's `DISCOVERABILITY` column in `docs/TODO.md` — that column is REGENERABLE, so do not hand-edit it. It reads its origins from `public/projects/*/meta.json` and is deliberately NOT wired into the deploy: it reaches sixteen third-party hosts, and someone else's 503 must not block publishing.
- **PWA_ICON_CACHE_BUST in this repo:** fully implemented in `vite.config.js` — `iconVersion()` (sha256, 8 hex) feeds the manifest `icons[]`, `iconCacheBustHtml()` rewrites the two icon `<link>`s in every page head (fail-loud on a reformatted tag), and the React navbar mark gets the same hashes through the `__ICON_VERSIONS__` define (client build AND the nested SSG server pass the identical object). Workbox `ignoreURLParametersMatching` includes `/^v$/` and `/^name$/` (offline lookup for versioned icons AND `?name=` pages), and `globIgnores` excludes the icon files so each has exactly ONE precache entry — a bare-URL duplicate alongside a revisioned one makes workbox-precaching throw `add-to-cache-list-conflicting-entries` and kills the whole SW. The manifest's maskable icon is the separate full-bleed `icon-1024-maskable.png` (generated by flattening the transparent source onto white in `scripts/generate-icons.mjs`); the favicon/navbar set stays transparent on purpose. `npm run verify:icons` is the tripwire (dist checks need a build first) and gates the deploy alongside `verify:seo`.
- **DEBUG_SYSTEM in this repo (DEV-gated):** the full pattern, gated so production never ships it — the page entries load `src/debugMount.jsx` via `if (import.meta.env.DEV) import(...)`, which keeps the entire subsystem out of production bundles (same rationale as four-ems' gate: a public portfolio visitor gets nothing from an operational pill). `src/lib/debugLog.js` is the store (200-entry buffer, console interception, global error capture, report generation with `?[redacted]` URLs, PWA diagnostics probes); `src/components/debug/DebugPill.jsx` renders in a separate React root with INLINE styles at z-80. Two pieces DO run in production: the pre-module capture + 20s load watchdog inline in `partials/head-common.html` (buffers errors before any module loads; turns a dead bundle into a plain-language message — every entry must call `window.__debugClearLoadTimer()` after mount) and the localStorage install-funnel analytics in `src/lib/pwa.js` (read by the pill's PWA tab in dev). Production modules must NEVER import the debug subsystem — `src/lib/pwa.js` reaches it through the optional `window.__debugAdd` bridge, which is null in prod.
- **SSR safety in this repo:** `src/entry-server.jsx` is `ssrLoadModule`d by `prerenderPages()` during the build, so the server graph must never reach `src/lib/pwa.js` (it registers the SW **on import** and needs `virtual:pwa-register`, which only resolves in the full plugin pipeline) or `src/lib/debugLog.js` (DEV-only). PWA state reaches SSR-rendered components through `src/context/PwaContext.js`, whose DEFAULT value is the SSR-safe shape. `npm run verify:ssr-safety` walks the entry's relative import graph and fails with the offending chain — a DIRECT import would at least fail loudly at build time, but an INDIRECT one (a shared component the server already renders picking up the singleton) fails deep in the prerender pass with an error naming the virtual module rather than the cause.
- **TIMER_LEAKS in this repo (React variant):** components and hooks register inside effects and the effect's RETURN releases what it registered — that is the whole contract. The lib singletons (`src/lib/theme.js`, `src/lib/pwa.js`) attach module-level listeners behind `window.__*Attached` HMR guards with paired `import.meta.hot.dispose()` teardown (variants 4 + 5); the one inline registration left (`beforeinstallprompt` capture in `partials/head-common.html`) attaches behind `window.__pwaInstallCaptureAttached` and is released by `src/lib/pwa.js`'s dispose. `npm run verify:timer-cleanup` enforces it statically: React files (anything importing react) must PAIR every `addEventListener`/`setTimeout`/`setInterval`/`IntersectionObserver` with its release verb in the same file; plain `.js` modules with module-level registrations need the dispose block; inline HTML scripts need a signal, dispose anchor, or attach guard.
- **Not Applicable Patterns (this repo):**
  - **EVENT_BUS — N/A.** No service or data layer. The pub/sub-shaped needs are cross-tab theme sync (`src/lib/theme.js` `storage` listener — the route EVENT_BUS.md itself prescribes for cross-tab), the one-shot `beforeinstallprompt` handoff (`partials/head-common.html` → `src/lib/pwa.js`, a one-off callback per EVENT_BUS.md's exclusions), and the theme/pwa singletons' subscriber sets — each emits a single logical "state changed" notification consumed via React hooks, which the canonical multi-event factory adds nothing to. Revisit if a module ever needs typed multi-event fan-out to unknown consumers.
  - **HTTPS_PROXY — N/A.** No Node-side outbound HTTP anywhere: build scripts are local-only, browser `fetch()` is same-origin relative. Flips to applicable the moment a script or Vite hook makes a real outbound HTTPS call (e.g. a live link-checker).
- **BURGER_MENU deviations (this repo, deliberate):** (1) **Backdrop is portaled to `<body>` at z-20, not the scale's backdrop tier (40)** — the navbar's `backdrop-blur-md` creates a containing block/stacking context (the pattern's own "externalized backdrop" note; `Z_INDEX_SCALE.md` documents the trap), and the menu lives inside the navbar's z-30 context, so a body-level backdrop above 30 would cover the menu itself. `cursor-pointer` on the backdrop is load-bearing for iOS Safari. (2) **Body scroll lock** — the open-menu effect sets `overflow: hidden` + `scrollbar-gutter: stable` despite the pattern preferring `overscroll-contain` alone, because taps on non-scrollable menu areas still chain to the body without it; single writer, restored by the effect cleanup.

### REMINDER: READ AND FOLLOW THE AI NOTES EVERY TIME

## Prohibitions

Never:
- Start implementation without understanding full scope
- Create files outside established project structure
- Create local copies of implementation pattern files in any repo — always fetch from glow-props
- Leave TODO comments in code without tracking them in `docs/TODO.md`
- Ignore errors or warnings in build/console output
- Make "while I'm here" changes without asking first
- Use placeholder data that looks like real data
- Skip error handling "for now"
- Remove features during "cleanup" without checking if they're documented as intentional (see AI_MISTAKES.md)
- Proceed with assumptions when a single clarifying question would prevent a wrong commit
- Use interactive input prompts or selection UIs — list options as numbered text instead
- Mention branches, pull requests, squashing, rebasing, merging, or force-pushing unless the user raises the topic first. When the user does raise one, answer the specific question and stop — do not volunteer opinions on what they should do process-wise.
- Frame any work as "out of scope" or "deferred as out of scope". Work is either doable (do it) or blocked on missing user input (say exactly what input is needed). "Scope" is a process concept, not a reason to skip work.
- Offer opinions on git history editing, branch strategy, PR size or shape, review flow, or commit structure. Follow instructions; don't editorialize on how the work should be organized.

### REMINDER: READ AND FOLLOW THE PROHIBITIONS EVERY TIME

## Triggers

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
| 24 | `patterns` | `pat` | Deviation from established patterns (fleet-wide glow-props or repo-local), reinvented wheels |
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
| 47 | `align` | `aln` | Drift between this repo's CLAUDE.md and glow-props CLAUDE.md — missing sections, stale rules, divergent conventions |
| 48 | `pattern-audit` | `pa` | Every glow-props implementation pattern: implemented / partial / missing / deviates — with diff notes for each |

### Meta sweeps

Run multiple triggers sequentially, pausing after each for `fix` / `skip` / `stop`. Organised roughly by cadence — pick the one that matches when you're running it.

| Trigger | Alias | Cadence | What it does |
|---------|-------|---------|--------------|
| `hot` | `h` | pre-commit | `bugs` + `types` + `errors` — fastest sanity check before committing. Pairs well with `hot staged` |
| `quick` | `q` | pre-push | `bugs` + `security` + `a11y` — the "don't ship this" triad |
| `ship` | `shp` | pre-merge | `correctness` + `trust` + `a11y` + `tests` — full pre-merge check |
| `session` | `ses` | end of session | `surface` + `wrap` + `undone` + `skipped` — "what state am I leaving this in?" |
| `tidy` | `tdy` | weekly | `clean` + `doc-cleanup` + `hacks` + `deps` + `undone` + `dx` — maintenance / hygiene sweep |
| `all` | `*` | quarterly | Every applicable trigger across every group, in order |

### Reflective passes

Single-pass, no fan-out to other triggers. Each answers one specific question about the recent work.

| Trigger | Alias | What it does |
|---------|-------|--------------|
| `risk` | `rsk` | Worst-case blast radius analysis on the current change |
| `surface` | `srf` | Reflective pass on recent changes: what was decided, what was assumed, what was skipped, what needs human review |
| `wrap` | `wrp` | Wrap-up pass before moving on — anything to double-check / strengthen / improve, anything discovered / assumed / skipped, anything to cleanup / update / tighten, anything to note / document / clarify |
| `skipped` | `skp` | What was skipped — including issues noticed outside the current changes that were intentionally left alone. Each item: what it is, where, why skipped |
| `assumed` | `asm` | What was assumed — explicit assumptions made during the work, including things treated as out of scope. Each item: the assumption, why it was made, what happens if wrong |
| `approach` | `apr` | Was the fix the best / most proper way? Honest self-review: what shortcuts were taken, what a senior reviewer would flag, what the "proper" version looks like if different |
| `cold` | `cld` | Fresh-eyes branch audit. Re-read CLAUDE.md from scratch. Review every change on the branch as if this were a new session with no prior context — don't privilege the diffs you just made. List all findings with a fix plan per item. Default scope: `branch` |

### REMINDER: READ AND FOLLOW THE TRIGGERS EVERY TIME

## Implementation Patterns (Source of Truth)

All implementation patterns live in the **glow-props** repo and are the single source of truth for all devmade-ai projects.

**Source location:** `docs/implementations/` in the glow-props repo

**How to access from any repo:**
- Fetch via GitHub Pages: `curl -sf "https://devmade-ai.github.io/glow-props/patterns/{PATTERN_NAME}.md"`
- Fetch via GitHub API: `curl -sf -H "Authorization: token $(printenv GITHUB_ALL_REPO_TOKEN)" "https://api.github.com/repos/devmade-ai/glow-props/contents/docs/implementations/{PATTERN_NAME}.md" | jq -r .content | base64 -d`
- To list all available patterns: `curl -sf -H "Authorization: token $(printenv GITHUB_ALL_REPO_TOKEN)" "https://api.github.com/repos/devmade-ai/glow-props/contents/docs/implementations" | jq -r '.[].name'`

**Adding a new pattern:** Drop a `.md` file into `docs/implementations/` with YAML frontmatter and it appears in the app automatically. Required frontmatter fields:
```yaml
---
slug: url-safe-slug
title: Display Title
badge: Category
description: One-line description for the card.
tags:
  - tag1
  - tag2
order: 10
---
```
The `generatePatternManifest` Vite plugin scans the folder at build time, parses frontmatter, validates required fields, and generates `patterns/manifest.json`. Both `index.html` and `pattern.html` consume this manifest — no hardcoded lists.

**Rules:**
- **Always fetch the latest version** from glow-props before implementing — patterns are continuously improved
- **Never create local copies** of implementation pattern files in downstream repos
- **Do not hardcode a list of patterns** — scan the source folder to discover what's available
- The set of patterns grows over time; always check the source for new additions

