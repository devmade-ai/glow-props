# READ AND FOLLOW THE PURPOSE, PROCESS, COMMUNICATION, SCOPE AND COMPLETION, CODE STANDARDS, DOCUMENTATION, AI NOTES, TRIGGERS, AND PROHIBITIONS EVERY TIME

## Purpose

**The goal: be the fleet's source of truth — the patterns, preferences and
standards every other devmade-ai repo aligns to.** Holding current context on
every app in the fleet is what that requires; the public portfolio is what that
context makes possible, not a second mission competing with the first. When the
two pull against each other, canonical wins over presentation.

**Every repo in the fleet carries this section, filled with its own purpose.**
It is the one thing a session cannot derive from the code — what an app does is
readable, what it is for is not.

## Fetching This File

This file is hosted at: `https://gp-props.vercel.app/CLAUDE.md`

To fetch it directly:
```bash
curl -sf "https://gp-props.vercel.app/CLAUDE.md"
```

## Process

1. **Read these preferences first**
2. **Gather context from documentation** (CLAUDE.md, relevant docs/)
3. **Then proceed with the task**

### REMINDER: READ AND FOLLOW THE PROCESS EVERY TIME

## Communication

### What the turn is for

Establish this before anything else. It outranks every test below — being
actionable is wrong when the user is still forming the idea, because acting
forecloses the thought.

**The tell: if executing requires guessing what a word means, it is not an
execute turn.** Not knowing is the signal. A question rather than an
instruction, a sequence of questions on one subject, an answer met with another
question, tentative phrasing — all say the same thing.

Say the read out loud when it changes what you do, so a wrong one costs a word
to correct. Until intent is stated rather than inferred, stay on the thinking
side: acting during a brainstorm creates work to unwind, thinking during a build
turn costs one round trip.

**The goal: communicate as effectively as possible.** Not shortest, not most
thorough. Most effective. Five tests, none of which is a format, ordered by what
you sacrifice last:

- **Trustworthy without re-checking.** Never traded away. Name what verified it
  and name what you assumed. State disagreement instead of smoothing it. Never
  report a pass, a fix, or compliance from memory.
- **Actionable.** They finish knowing what to do — or knowing there is nothing
  to do.
- **Proportional.** Don't over-explain small things. Don't under-explain
  important ones. Wrong in either direction is the same failure. This is what
  decides length when the two below pull against it.
- **Cheap to read.** Answer first. Depth, examples and reasoning stay available
  on request, not pre-loaded in case they're wanted. Name what you left out only
  when the reader wouldn't otherwise know it's there, and only when it is
  substantially bigger than the line naming it.
- **Cheap to reply to.** Number the options so a digit answers them. Never make
  them write a paragraph to unblock you. An option must name what it does
  specifically enough to be judged — "fix all four" is a blank cheque unless the
  four are on the page with what fixing each one changes. Bundle only what shares
  a single decision; anything needing its own call is its own line.

**Define the terms the reply leans on.** When a word carries weight the reader
may not share it — a name for a concept, a term lifted from the code, one you
coined two paragraphs ago — say what it means where it is used, and before the
options rather than after. Not every reply needs this. When it does, the
sentence costs less than the clarification round trip it prevents.

**Not a conversation.** Respond as if talking to yourself — the reader is a
developer. Peer-to-peer, no servility. Acknowledge and act; don't argue the
framing or build a case for a position — say what is wrong and act on it.
Argument belongs in a reply that asked for a judgement, and nowhere else.

**This is a calibration target, not a compliance one.** It will be missed. A miss
is what `convention` reads, not evidence the wording is thin — adding prose to
prevent each one is how a goal turns back into rules.

### Calibration — real misses, worst first

| Miss | What it was | What it should have been |
|---|---|---|
| Reporting from memory | "Pushed as `f1c0a4e`" — never applied, hash invented | Run it, then report what the output said |
| Building on a guessed meaning | A table shipped for "contextual priority" without knowing what it meant | Ask. Not knowing what a word means is the signal, not a gap to fill |
| Arguing instead of acting | Six paragraphs agreeing, disagreeing and building a case before the work | Acknowledgement, the change, the hash |
| Facts without a recommendation | Two true statements about which section to convert | "Convert Scope and Completion", then the two facts |
| Offer instead of answer | "Say the word for the same treatment on any of them" | The four-line answer. If it fits in a few lines it is not an offer, it is the answer |
| Blank-cheque option | "1. Fix both." — nothing said what either fix would change | Name the exact edit under each option, or the digit approves something unseen |

### REMINDER: READ AND FOLLOW THE COMMUNICATION GOAL EVERY TIME

## Scope and Completion

**The goal: the user decides what gets built and how much of it.** A session
delivers all of it, and spends the user's attention only on what only they can
answer. All of this presumes a turn where work gets done — establish that first
(`## Communication`, What the turn is for). Three tests, ordered by what you
sacrifice last:

- **Nothing is silently smaller.** Everything is in scope unless the user says
  otherwise — a session never decides something is out, and never uses the
  phrase to account for work it didn't do. Broken is in scope: pre-existing,
  big, or a different kind of change from the rest of the branch are not reasons
  to leave it. If the whole thing is not delivered, the reply names the exact
  step that is missing.
- **Build the requirement that exists.** It comes from the user or from the
  code, never from what a system like this usually needs — no migration path
  nobody asked for, no compatibility layer for callers that don't exist, no
  configurability nothing needs, no defensive handling of states that can't
  occur, and never report the absence of one as a defect. Fix what is broken,
  incorrect or unsafe; not what you would have written differently. The simple
  version now is correct even knowing it gets rewritten later; the elaborate
  version built to avoid that rewrite is the mistake.
- **Their attention is the scarce resource.** Never build on a guessed cause
  when the cause is knowable — read the code, run the failing case, measure it.
  Reading the code, the design or the docs is not assuming. Ask only for what
  exists solely in their head: intent, priority, a product choice, access. Ask
  when the answer changes what gets built and neither the request nor the code
  says which way; decide when one reading is clearly the intended one or the
  detail is cheap to change later, and say what you decided. Every question at
  once, numbered, before starting. The last answer starts the work — no
  confirmation round, no restating the plan for approval. After that an unknown
  becomes a stated assumption, not a question.

### When stopping is legitimate

Stopping needs a real reason. There are three, and the list is closed:

1. **The work is done** — all of it.
2. **Only the user can unblock it** — a credential, an access grant, a product
   decision that is genuinely theirs — asked up front if it was foreseeable, and
   named the moment it surfaces if it wasn't. A blocker you could have found
   before starting is not one of these.
3. **Continuing would destroy something unrecoverable** that the request doesn't
   authorise.

Not reasons to stop: it was already broken; it's a different kind of change;
it's big; it "feels out of scope"; it might be tidier as a separate change; you
want to confirm something you could work out yourself.

**Done means done.** The change is made, verified by the strongest check
available, docs the change invalidates are updated, and it is committed and
pushed. Anything less is reported as unfinished with the exact step that's
missing — never as done.

### REMINDER: READ AND FOLLOW THE SCOPE AND COMPLETION GOAL EVERY TIME

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
- See the [TIMER_LEAKS pattern](https://gp-props.vercel.app/patterns/TIMER_LEAKS.md) for concrete patterns (nested-timeout array, AbortController, per-effect dispose, HMR guard). The hosted URL, not a repo-relative path — this block is mirrored into every repo, and only gp-props holds the file.

### Quality Checks

During every change, actively scan for:
- Error handling gaps
- Edge cases not covered
- Inconsistent naming
- Code duplication that should be extracted
- Missing input validation at boundaries
- Security concerns (XSS via dangerouslySetInnerHTML, unsanitized user input)
- Performance issues (unnecessary re-renders, missing keys, large re-computations)

Fix what you find. Raise it instead of fixing it only when the fix needs a decision that is genuinely the user's.

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

**The goal: every one of these files says what is true right now, and each fact
lives in exactly one of them.** Maintained as you work, never when asked. Three
tests, ordered by what you sacrifice last:

- **Nothing in them is stale.** Before adding, read what is already there. If an
  entry is done, deployed, superseded or no longer true, **delete it** — don't
  annotate it, don't mark it complete, don't keep it for the record. Git history
  is the record. This bites hardest where an entry resolves without the repo
  changing — `USER_ACTIONS.md` above all, where the user does the thing in a
  dashboard. Never assume such an entry is still pending: **check reality first**
  (hit the URL, read the deployed output, query the API), then delete or correct
  it. A stale entry is worse than a missing one — it gets acted on, and it makes
  the whole file look untrustworthy.
- **Each fact has one home.** If an item belongs in another of these files, it
  goes there, not where you happen to be typing. Duplication is how two of them
  start disagreeing, and nothing catches that.
- **Updated in the same commit as the change that invalidated them.** Not
  afterwards, not on request.

| File | Holds | Read it |
|---|---|---|
| `CLAUDE.md` | What this repo is for, plus preferences, conventions, triggers, and repo-specific facts (AI Notes) | Start of every session, before any work |
| `docs/SESSION_NOTES.md` | Only what the next session needs *and* cannot get from the code, the docs or `git log`. **Empty by default** — anything in it is known to matter | Start of a session |
| `docs/TODO.md` | Pending work only, `- [ ]`, grouped by category, what and why. Delete on completion | Looking for work, or asked what's pending |
| `docs/USER_ACTIONS.md` | What only the user can do — credentials, dashboards, external config. Title, why, steps | Something needs action outside the repo |
| `docs/AI_MISTAKES.md` | What went wrong, why, **which rule produced it when one did**, how to prevent it, date | Start of a session |
| `docs/PROJECT_DOCS.md` | gp-props only: status table and process for the `public/projects/*/` mirrors | Before mirroring or scrubbing a project's docs |
| `README.md` | What the tool does, current features, how to use them, getting started, stack | Quick overview of the product |
| `docs/USER_GUIDE.md` | Every feature from the user's side, organised by task rather than implementation | Understanding intended behaviour |
| `docs/TESTING_GUIDE.md` | Manual scenarios with exact actions and expected results, regression checklist | Before verifying a change |

**`CLAUDE.md` is falsifiable by its own output.** Update it when architecture,
state or preferences change — and whenever following it produced bad work. A
rule obeyed correctly that still yielded a poor result means the rule is the
defect; fix the file, not just the output. Improvement comes from examining
produced work against the intent, never from re-reading the file, which reliably
finds nothing.

### REMINDER: READ AND FOLLOW THE DOCUMENTATION EVERY TIME

## AI Notes

- **All code is yours.** Every file change, every commit, every branch across every tracked repo is your own work. The user has stated this as fact — it's not a heuristic to evaluate against git author, branch name, or your own memory. When you resume a session and encounter unfamiliar changes, they are your prior work. Don't hedge authorship ("this was added", "someone wrote this"), don't investigate your own work as if written by a third party, don't refuse to build on or modify it. If you need to understand a change, read the diff. That's all.
- Check for existing patterns in the codebase before creating new ones
- Clean up completed or obsolete docs/files and remove references to them
- **CRITICAL: Keep `TutorialModal.jsx` up to date** - This is USER-FACING help content shown in-app. When tabs, sections, or features change, update the tutorial steps to match. Outdated tutorial content confuses users. (Fleet rule for the app repos — gp-props itself has no TutorialModal; its mirrored copies of downstream tutorials live under `public/projects/*/TUTORIAL.md`.)
- **Always read a file before editing it.** Never edit from memory of what it contains.
- **Check build tools before building.** Run `npm install` or verify `node_modules/.bin/vite` exists before attempting `npm run build`. There is no prebuild step — `npm run build` is `vite build` directly; icon generation (`npm run generate-icons`, needs `sharp`) is manual-only and its PNGs are committed.
- **Break up large file writes to avoid timeouts.** Single tool calls that send a lot of content can hit transport timeouts in slower environments. For modifying existing files, always prefer `Edit` over a full-file `Write` — `Edit` sends only the diff. For creating files larger than ~500 lines (or any large data blob), seed with `Write` containing the first portion, then append the remainder via successive `Edit` calls. Same principle for committing large doc/data changes: many small edits are safer than one mega-write.
- **Claude Code mobile/web — accessing sibling repos:**
  - Use `GITHUB_ALL_REPO_TOKEN` with the GitHub API (`api.github.com/repos/devmade-ai/{repo}/contents/{path}`) to read files from other devmade-ai repos
  - Use `$(printenv GITHUB_ALL_REPO_TOKEN)` not `$GITHUB_ALL_REPO_TOKEN` to avoid shell expansion issues
  - Never clone sibling repos — use the API instead
- **Discontinued repos — skip entirely:** `plant-fur` and `coin-zapp` are discontinued. Do not check, audit, align, or include them in cross-project operations.
- **The convention set is NOT the audit set — never derive one from the other.** Conventions (this file's rules, the patterns, the docs process) propagate to **every** `devmade-ai` repo except the documented exclusions. The audits (`audit:discoverability`, `audit:cross-links`) cover only what `public/projects/*/meta.json` declares, because they grade *live public origins* and a repo without one has nothing to grade. The portfolio set is therefore smaller **by design**, and using it as the alignment list silently drops real repos: `sp-website`, `sp-backend` and `hf-sculpt` all run fleet conventions and have no portfolio entry. Enumerate from the org — `mcp__Claude_Code_Remote__list_repos` — not from `public/projects/`, and reconcile against the exclusions below rather than against the Gap Matrix.
  - **Excluded from conventions:** `plant-fur`, `coin-zapp` (discontinued), `canva-grid-assets` (asset bucket — no app, no `CLAUDE.md` to align).
  - **Excluded from the audits only:** `sp-website`, `sp-backend`, `hf-sculpt` — no `public/projects/` entry, so no declared origin. They still receive every convention change. `hf-sculpt` was settled here deliberately on 2026-08-16 rather than being given a portfolio entry; it is not an oversight, and a session finding it absent from the Gap Matrix should leave it that way.
- **Running a fleet-wide convention change.** Proven over 18 repos on 2026-08-10; the failures it is shaped around are in [`docs/AI_MISTAKES.md`](docs/AI_MISTAKES.md) (2026-08-10, two entries).
  1. **Extract the canonical text from this file at runtime — never retype it into the script.** A helper that slices `CLAUDE.md` between literal markers and throws when a marker is missing or ambiguous means the payload provably cannot drift from the source of truth, and a later edit here propagates without touching the script.
  2. **Read every repo's version BEFORE overwriting it,** looking for rules sharper than canonical — that is "Alignment levels up, never down" in practice, and it is the step that gets skipped. On this pass, six repos had rules better than the fleet's; a mechanical overwrite would have destroyed all six. Diff each `## Communication` against the known baseline bullet set and inspect anything novel by hand.
  3. **Report a missing anchor as SKIPPED, don't throw.** Repos drift in wording (`— don't wait` vs `- don't wait`, a trailing "first", `## Adopted Patterns` for `## Implementation Patterns`, trigger tables numbered differently). Collecting skips lets one run triage every variant at once instead of dying on the first.
  4. **Prove idempotence by running it twice and asserting a no-op.** Guard on the presence of what you insert, using a string unique to the insertion.
  5. **Hand-fix the structural outliers rather than forcing them into the shape.** `repo-tor` leads with its product title and keeps docs as a table; `see-veo` had a five-bullet `## Communication Style` stub. Both needed bespoke edits, and flattening them would have been worse than the drift.
  6. **Deletions never go in the loop** — see the second mistakes entry.
  7. **Never patch the script's source with `sed` / `node -e` one-liners** — their quoting layers double every backslash, and a `\|` that becomes `\\|` turns into regex ALTERNATION whose `.*$` branch matches line 1 of every file. That is not hypothetical; it destroyed the H1 in 14 repos (see the mistakes entry). Edit the script as a file. And when you find one corrupted pattern, sweep for the whole class rather than fixing the one you tripped over.
  8. **Verify by counting across every repo** (`grep -c` for each canonical block, plus each superseded string expecting 0) — but that is necessary, not sufficient. Both directions only see the change. Also: assert a **structural invariant unrelated to the edit** (line 1 is still a heading), check that each assertion string is **unique in the file** so it cannot be satisfied by something else, **read every deleted line** (`git diff | grep '^-[^-]'`), and render at least one whole file end to end before pushing any of them.
  9. Then commit and push per repo.
- **Implementation patterns — always fetch from gp-props.** Never look for local copies of implementation pattern files (e.g., `docs/implementations/*.md`) in downstream repos. They do not exist locally — the single source of truth is the `docs/implementations/` folder in the gp-props repo. Fetch the latest version before every implementation task.
- **React reference implementation.** gp-props is a React 19 + Vite MPA (three entries, one root each) and is the fleet's living reference for the patterns' React variants: `src/components/BurgerMenu.jsx` + `src/hooks/{useDisclosureFocus,useFocusTrap,useEscapeKey}.js` per BURGER_MENU.md; `src/lib/pwa.js` (module singleton, immutable state snapshots) + `src/components/PwaManager.jsx` bridging it into React via `useSyncExternalStore` per PWA_SYSTEM.md; `src/components/Toast.jsx` (ToastProvider); THEME_DARK_MODE Approach A in `src/lib/theme.js` + `src/hooks/useTheme.js` with the pre-paint bootstrap still inline in `partials/head-common.html`. Four inline classic scripts MUST stay in the head partial (GA, theme bootstrap, debug capture + 20s load watchdog, `beforeinstallprompt` capture) — they run before any module, which is their entire purpose.
- **DISCOVERABILITY in this repo:** gp-props follows the PUBLIC column of its own [`docs/implementations/DISCOVERABILITY.md`](docs/implementations/DISCOVERABILITY.md) — indexable, `robots.txt` allowing the crawl and naming the sitemap, per-page canonical, full Open Graph + Twitter coverage, and a 1200×630 card generated from the icon (`npm run generate:og-image`). Four things are deliberate and easy to undo by accident: (1) **the landing page, every pattern, and every project are SSG'd** by `prerenderPages()` in `vite.config.js` — a nested Vite server `ssrLoadModule`s `src/entry-server.jsx`, which `renderToString`s the SAME components the client mounts, injected into each built template's empty `<div id="root"></div>` with per-item head tags replaced literal-for-literal (fail-loud). `createRoot().render()` REPLACES that markup on mount — render-then-replace, not hydration, because the pages fetch their data at runtime. Every component link is base-absolute (`import.meta.env.BASE_URL`), so nested pages need no path rewriting. The clean URLs are canonical; the `?name=` forms still work and point at them. (2) `sitemap.xml` is GENERATED at build from `docs/implementations/` and `public/projects/` — adding `public/sitemap.xml` would shadow it. (3) `pattern.html` / `project.html` carry NO static canonical, because their content is chosen by `?name=` and a fixed one would collapse every item onto a single URL; it is set at runtime in `src/seoMeta.js`. (4) the SSG'd landing page carries `prerender` mode — no `scroll-animate` classes, because without JS nothing lifts that utility's `opacity:0`. (5) **structured data is ONE `<script type="application/ld+json" id="page-jsonld">` per page** — the `Organization` + `WebSite` nodes are static in all three templates (true everywhere, `@id`-joined rather than repeated inline), `prerenderPages()` replaces that exact JSON literal with the same graph plus the item's `TechArticle`/`SoftwareApplication` node, and `src/seoMeta.js` rewrites the SAME block for the `?name=` forms rather than appending a second one. Item copy is escaped `<` → `<` on both paths, since JSON.stringify won't and the HTML tokenizer wins. (6) `<title>` must equal `og:title` wherever the title is real (the landing page and every prerendered item page) — `pattern.html`/`project.html` keep a placeholder title on purpose, which is why the check is scoped rather than global. Both writers build their nodes from ONE module, `src/lib/structuredData.js` — imported by `vite.config.js` and `src/seoMeta.js` — so the two cannot disagree about the same item; it is pure (no DOM, no Node APIs) because it sits in the SSR entry's graph. `npm run verify:seo` is the tripwire for the built output and `npm run smoke:seo` for the runtime half — **run `npm run build` before either**, since their checks over `dist/` are only as current as the last build. The smoke check loads the built pages in real Chromium and is the ONLY gate that can see a second JSON-LD block being appended rather than the existing one rewritten (that change leaves `dist/` untouched, so `verify:seo` stays green); both gate the deploy. Separately, `npm run audit:discoverability [--check]` grades the WHOLE FLEET against the live origins and fails on drift from the Gap Matrix's `DISCOVERABILITY` column in `docs/TODO.md` — that column is REGENERABLE, so do not hand-edit it. It reads its origins from `public/projects/*/meta.json` and is deliberately NOT wired into the deploy: it reaches sixteen third-party hosts, and someone else's 503 must not block publishing.
- **Cross-repo links (this repo, fleet-wide):** `npm run audit:cross-links [--check]` checks that hardcoded URLs one fleet site ships pointing at ANOTHER fleet site still resolve, and still name that project's current origin. It exists because nothing else can see this class: a cross-project URL has no build step, no type and no test in either repo, so tool-till-tees shipped a dead "Open See Veo App" button — the only call to action on the page — and its typecheck, 588 tests and build all passed either side of the fix. It checks the DEPLOYED output (each origin's HTML plus its own script bundles), not repo source, for the reason `audit-discoverability.mjs` already gives for grading live rather than from files — and because a link in source and a link in the shipped bundle are different facts, only the second of which reaches a user. Two severities are distinguished on purpose: **dead** (404/410/unreachable) and **stale** (resolves, but is not that project's current origin — the duplicate-content trap, and the one that looks fine). 405/401/403 count as ALIVE: a POST-only endpoint answering 405 to a GET is correctly wired, and treating it as dead produced this audit's first false positive. 5xx is neither — someone else's outage is not a defect here. Both scripts resolve the fleet through ONE module, `scripts/lib/fleetOrigins.mjs`, so a project added to the portfolio joins both audits automatically. `--self-test` runs the status table plus a replay of the real tool-till-tees markup with no network, so the audit cannot go quietly blind to the case it exists for. Every run also prints a COVERAGE section (and `--json` carries it) naming each origin, how many of its bundles were read, and every cross-repo target with its status and verdict — because "0 problems" and "0 links examined" otherwise print identically, and only one is good news. Like the discoverability audit, NOT wired into the deploy.
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
- Start a substantial build without knowing the requirement it satisfies
- Create files outside established project structure
- Create local copies of implementation pattern files in any repo — always fetch from gp-props
- Leave TODO comments in code without tracking them in `docs/TODO.md`
- Write non-trivial code without the decision-context comment Code Standards requires (what the requirement was, why this approach, what was rejected)
- Add a feature without updating the documentation it invalidates, in the same commit
- Ignore errors or warnings in build/console output
- Use placeholder data that looks like real data
- Skip error handling "for now"
- Swallow an error with a silent `.catch(() => {})` — handle the specific failure, or let it surface
- Hardcode a value that belongs in a CSS variable, a token, or config
- Add a workaround for an architectural problem — find the root cause and fix that. Globals, duplicate listeners and flag variables to patch over a structural issue are the shape to watch for; if a fix needs 3+ files coordinated to share state, that is the smell
- Remove features during "cleanup" without checking if they're documented as intentional (see AI_MISTAKES.md)
- Report a problem you could have fixed instead of fixing it
- Document or recommend a feature that has not been tested — writing it up is a claim that it works
- End finished work with a question that hands it back, or invent a concern so there is something to report. Decisions go up front, before the work starts — never dangling after it. Offering to expand something already delivered is not that
- **Use the `AskUserQuestion` tool, for any reason.** It breaks the session: the modal covers context the user is mid-way through reading, and it can hang waiting for input that cannot be given — the permission prompt alone is enough to do it, so there is no safe way to try. This extends to any interactive input prompt or selection UI. List options as numbered text and let the user reply with a number.
- Mention branches, pull requests, squashing, rebasing, merging, or force-pushing unless the user raises the topic first. When the user does raise one, answer the specific question and stop — do not volunteer opinions on what they should do process-wise.
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

### REMINDER: READ AND FOLLOW THE TRIGGERS EVERY TIME

## Implementation Patterns (Source of Truth)

All implementation patterns live in the **gp-props** repo and are the single source of truth for all devmade-ai projects.

**Source location:** `docs/implementations/` in the gp-props repo

**How to access from any repo:**
- Fetch from the live site: `curl -sf "https://gp-props.vercel.app/patterns/{PATTERN_NAME}.md"`
- Fetch via GitHub API: `curl -sf -H "Authorization: token $(printenv GITHUB_ALL_REPO_TOKEN)" "https://api.github.com/repos/devmade-ai/gp-props/contents/docs/implementations/{PATTERN_NAME}.md" | jq -r .content | base64 -d`
- To list all available patterns: `curl -sf -H "Authorization: token $(printenv GITHUB_ALL_REPO_TOKEN)" "https://api.github.com/repos/devmade-ai/gp-props/contents/docs/implementations" | jq -r '.[].name'`

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
- **Always fetch the latest version** from gp-props before implementing — patterns are continuously improved
- **Never create local copies** of implementation pattern files in downstream repos
- **Do not hardcode a list of patterns** — scan the source folder to discover what's available
- The set of patterns grows over time; always check the source for new additions

### Alignment levels up, never down

gp-props is the source of truth, but "source of truth" does not mean "the version that wins". When a repo you are reading does something **better** than the canonical version, improve the canonical one — never overwrite the better implementation with the worse rule.

- **Applies to anything, not just patterns** — a rule, a PWA implementation, a hook, a tripwire, a doc convention, a line of copy.
- **Better means demonstrably better:** more correct, catches a case the other misses, or says the same thing more sharply and concretely. Not "different", not "how I would have written it" — that is the taste rule in Scope and Completion, and it still applies.
- **Upstream first, then sync.** Land the improvement in gp-props, then propagate it, so every repo ends up with the better version instead of one repo quietly keeping an advantage the rest never get.
- **Say what you took and where from**, so the trail exists.
- **Levelling a repo DOWN to match the canonical version is a regression**, even when it turns the alignment audit green. A green audit over a worse fleet is a failure of the audit, not a success.

