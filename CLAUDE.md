# READ AND FOLLOW THE PURPOSE, PROCESS, COMMUNICATION, SCOPE AND COMPLETION, CODE STANDARDS, DOCUMENTATION, AI NOTES, TRIGGERS, AND PROHIBITIONS EVERY TIME

## Purpose

**Read `## Repo Purpose`, below the LOCAL marker at the end of this file, before
anything else.** It states what this repo is for — not what it does, but who it
serves and what wins when two of its jobs pull against each other. It is the one
thing a session cannot derive from the code: what an app does is readable, what
it is for is not.

## Fetching This File

**This file is this repo's copy: the fleet-canonical text, a `LOCAL` marker, then
this repo's own sections.** Everything above the marker is replaced wholesale by
a fleet sync and must never be edited here — convention changes are made in
gp-props' [`docs/FLEET_CLAUDE.md`](https://gp-props.vercel.app/CLAUDE.md) and
propagated. Everything below the marker belongs to this repo and no sync touches
it.

The canonical version is hosted at: `https://gp-props.vercel.app/CLAUDE.md`

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
- Interactive elements meet a 44×44 CSS px touch target (WCAG 2.5.5). Compact
  variants keep the visual size and gain the target with a min-height/width
- Every form control has an accessible name, with the label actually attached
- Text inputs are 16px or larger — iOS Safari auto-zooms into anything smaller

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
| `CLAUDE.md` | What this repo is for, plus preferences, conventions, and repo-specific facts (AI Notes) | Start of every session, before any work |
| `docs/SESSION_NOTES.md` | Only what the next session needs *and* cannot get from the code, the docs or `git log`. **Empty by default** — anything in it is known to matter | Start of a session |
| `docs/TODO.md` | Pending work only, `- [ ]`, grouped by category, what and why. Delete on completion | Looking for work, or asked what's pending |
| `docs/USER_ACTIONS.md` | What only the user can do — credentials, dashboards, external config. Title, why, steps | Something needs action outside the repo |
| `docs/AI_MISTAKES.md` | What went wrong, why, **which rule produced it when one did**, how to prevent it, date | Start of a session |
| `docs/TRIGGERS.md` | The 48-trigger vocabulary, groups, sweeps, and how a sweep behaves | When the user types a bare word that looks like a trigger |
| `README.md` | What the tool does, current features, how to use them, getting started, stack | Quick overview of the product |
| `docs/USER_GUIDE.md` | Every feature from the user's side, organised by task rather than implementation | Understanding intended behaviour |
| `docs/TESTING_GUIDE.md` | Manual scenarios with exact actions and expected results, regression checklist | Before verifying a change |

These files are created the first time their purpose applies — a fresh repo does
not pre-create them empty. An empty file claims there was nothing to say, which
is a different statement from not having been written yet.

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
- **CRITICAL: Keep `TutorialModal.jsx` up to date** - This is USER-FACING help content shown in-app. When tabs, sections, or features change, update the tutorial steps to match. Outdated tutorial content confuses users.
- **Always read a file before editing it.** Never edit from memory of what it contains.
- **Check the build tooling before building.** Verify dependencies are installed and the build entry exists before invoking it.
- **Break up large file writes to avoid timeouts.** Single tool calls that send a lot of content can hit transport timeouts in slower environments. For modifying existing files, always prefer `Edit` over a full-file `Write` — `Edit` sends only the diff. For creating files larger than ~500 lines (or any large data blob), seed with `Write` containing the first portion, then append the remainder via successive `Edit` calls. Same principle for committing large doc/data changes: many small edits are safer than one mega-write.
- **Claude Code mobile/web — accessing sibling repos:**
  - Use `GITHUB_ALL_REPO_TOKEN` with the GitHub API (`api.github.com/repos/devmade-ai/{repo}/contents/{path}`) to read files from other devmade-ai repos
  - Use `$(printenv GITHUB_ALL_REPO_TOKEN)` not `$GITHUB_ALL_REPO_TOKEN` to avoid shell expansion issues
  - Never clone sibling repos — use the API instead

### REMINDER: READ AND FOLLOW THE AI NOTES EVERY TIME

## Prohibitions

Never:
- Create files outside established project structure
- Write a plan, a note, or a scratch file anywhere but `docs/working/` — never the repo root
- Commit a secret, or expose one to the browser. Service-role keys, SMTP passwords, API keys with write scope: not in the repo, and not behind any client-visible env prefix (`VITE_`, `NEXT_PUBLIC_`, and the like). Only anon/public values belong in client config
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

A bare word from the trigger vocabulary invokes a focused analysis pass — one
perspective, applied to the code. `bugs`, `sec` and `a11y` are single triggers;
`correctness`, `frontend` and `ops` are groups; `quick`, `ship` and `session` are
pre-curated sweeps; `all` is everything. Suffix any of them to scope it: `branch`,
`branch <base>`, `staged`, `file <path>`.

**The vocabulary and the behaviour rules live in
[`docs/TRIGGERS.md`](docs/TRIGGERS.md).** Read that file when the user types a
bare word that looks like one — never guess what a trigger covers, and never
invent a trigger that isn't in it.

### REMINDER: READ AND FOLLOW THE TRIGGERS EVERY TIME

## Implementation Patterns (Source of Truth)

All implementation patterns live in the **gp-props** repo and are the single source of truth for all devmade-ai projects.

**Source location:** `docs/implementations/` in the gp-props repo

**How to access from any repo:**
- Fetch from the live site: `curl -sf "https://gp-props.vercel.app/patterns/{PATTERN_NAME}.md"`
- Fetch via GitHub API: `curl -sf -H "Authorization: token $(printenv GITHUB_ALL_REPO_TOKEN)" "https://api.github.com/repos/devmade-ai/gp-props/contents/docs/implementations/{PATTERN_NAME}.md" | jq -r .content | base64 -d`
- To list all available patterns: `curl -sf -H "Authorization: token $(printenv GITHUB_ALL_REPO_TOKEN)" "https://api.github.com/repos/devmade-ai/gp-props/contents/docs/implementations" | jq -r '.[].name'`

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

<!-- LOCAL: everything below is this repo's own. Fleet syncs never touch it. -->

## Repo Purpose

**The goal: be the fleet's source of truth — the patterns, preferences and
standards every other devmade-ai repo aligns to.** Holding current context on
every app in the fleet is what that requires; the public portfolio is what that
context makes possible, not a second mission competing with the first. When the
two pull against each other, canonical wins over presentation.

## Repo Notes

gp-props-only facts. Everything above the marker is fleet-canonical and is
replaced wholesale by a sync; nothing here is.

- **Check build tools before building.** Run `npm install` or verify `node_modules/.bin/vite` exists before attempting `npm run build`. There is no prebuild step — `npm run build` is `vite build` directly; icon generation (`npm run generate-icons`, needs `sharp`) is manual-only and its PNGs are committed.
- **Discontinued repos — skip entirely:** `plant-fur` and `coin-zapp` are discontinued. Do not check, audit, align, or include them in cross-project operations.
- **The convention set is NOT the audit set — never derive one from the other.** Conventions (this file's rules, the patterns, the docs process) propagate to **every** `devmade-ai` repo except the documented exclusions. The audits (`audit:discoverability`, `audit:cross-links`) cover only what `public/projects/*/meta.json` declares, because they grade *live public origins* and a repo without one has nothing to grade. The portfolio set is therefore smaller **by design**, and using it as the alignment list silently drops real repos: `sp-website`, `sp-backend` and `hf-sculpt` all run fleet conventions and have no portfolio entry. Enumerate from the org — `mcp__Claude_Code_Remote__list_repos` — not from `public/projects/`, and reconcile against the exclusions below rather than against the Gap Matrix.
  - **Excluded from conventions:** `plant-fur`, `coin-zapp` (discontinued), `canva-grid-assets` (asset bucket — no app, no `CLAUDE.md` to align).
  - **Excluded from the audits only:** `sp-website`, `sp-backend`, `hf-sculpt` — no `public/projects/` entry, so no declared origin. They still receive every convention change. `hf-sculpt` was settled here deliberately on 2026-08-16 rather than being given a portfolio entry; it is not an oversight, and a session finding it absent from the Gap Matrix should leave it that way.
- **Running a fleet-wide convention change** is a nine-step procedure, proven over 18 repos and shaped around two failures in [`docs/AI_MISTAKES.md`](docs/AI_MISTAKES.md) that destroyed the H1 in 14 repos and double-applied a section in 12. Read [`docs/FLEET_CHANGES.md`](docs/FLEET_CHANGES.md) before writing any script that edits more than one repo.
- **React reference implementation.** gp-props is a React 19 + Vite MPA (three entries, one root each) and is the fleet's living reference for the patterns' React variants: `src/components/BurgerMenu.jsx` + `src/hooks/{useDisclosureFocus,useFocusTrap,useEscapeKey}.js` per BURGER_MENU.md; `src/lib/pwa.js` (module singleton, immutable state snapshots) + `src/components/PwaManager.jsx` bridging it into React via `useSyncExternalStore` per PWA_SYSTEM.md; `src/components/Toast.jsx` (ToastProvider); THEME_DARK_MODE Approach A in `src/lib/theme.js` + `src/hooks/useTheme.js` with the pre-paint bootstrap still inline in `partials/head-common.html`. Four inline classic scripts MUST stay in the head partial (GA, theme bootstrap, debug capture + 20s load watchdog, `beforeinstallprompt` capture) — they run before any module, which is their entire purpose.
- **Repo-specific pattern implementations — read before touching them.** Six subsystems here carry traps that are in no fleet pattern file and caught by no type or test: DISCOVERABILITY/SEO, cross-repo links, PWA_ICON_CACHE_BUST, DEBUG_SYSTEM, SSR safety and TIMER_LEAKS — plus the deliberate BURGER_MENU deviations and which patterns are N/A here. All of it is in [`docs/REPO_PATTERNS.md`](docs/REPO_PATTERNS.md). Read that file before editing `vite.config.js`, `src/lib/*`, `src/seoMeta.js`, `partials/head-common.html`, or anything under `scripts/`.

### Docs this repo carries beyond the canonical set

| File | Holds | Read it |
|---|---|---|
| `docs/FLEET_CLAUDE.md` | The fleet-canonical conventions, with no gp-props specifics — the file served at the hosted URL. `npm run verify:claude-canonical` fails if CLAUDE.md above the LOCAL marker drifts from it | Before changing any convention, since that is where it is edited |
| `docs/FLEET_CHANGES.md` | The nine-step procedure for a convention change across every repo | Before writing any script that edits more than one repo |
| `docs/REPO_PATTERNS.md` | How the fleet patterns are wired in gp-props and what breaks if you touch them | Before editing `vite.config.js`, `src/lib/*`, `src/seoMeta.js`, the head partial, or `scripts/` |
| `docs/PROJECT_DOCS.md` | gp-props only: status table and process for the `public/projects/*/` mirrors | Before mirroring or scrubbing a project's docs |
