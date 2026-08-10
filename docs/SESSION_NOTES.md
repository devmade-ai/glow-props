# Session Notes

## Latest session (2026-08-10): rewrote how a session decides what to do and when to stop

**Worked on:** `CLAUDE.md` only. The file had nine bullets on *tone* and no rule
anywhere on *when a task is finished*. That gap is what produces sessions that
stop early, hand back questions, and account for undone work as "out of scope".

### The diagnosis

Four contradictions and three gaps in the file as it stood:

- "No conversational padding" fought "close every substantive reply with three
  things" — *substantive* was never defined, so the Concerns/Suggestions/Ask
  footer attached to everything and got filled with manufactured content.
- "Ask clarifying questions until you are certain" had no stopping condition and
  never said whether asking ends the turn.
- Adjacent findings were governed by three sections that never referenced each
  other (report them / don't fix them / don't call them out of scope).
- No definition of done anywhere. `Commit and push before ending a session` is
  session granularity, not task granularity.
- No rule requiring a change be verified before it's reported as working —
  despite `AI_MISTAKES.md:13` recording exactly that failure, with two production
  breaks shipped behind it.

Pattern behind the gaps: `AI_MISTAKES.md` records the lesson, `CLAUDE.md` never
gets the enforceable rule, so nothing acts on it.

### What changed

- **`## Communication` rewritten.** Tone bullets only. Added *Say what you
  checked* ("done" means verified, name the check, never report a pass from
  memory) and *Length is proportional to the decision it supports*. The
  Concerns/Suggestions/Ask footer is replaced by **`### How a reply ends`**:
  what you did → what genuinely needs their attention → suggestions or a full
  stop. A fixable problem reported instead of fixed is now a stated failure.
  Never end finished work on an open question.
- **New `## Scope and Completion`** — the section the file was missing. Four
  subsections: scope is the user's call and everything is in scope unless they
  say otherwise; build for the requirement that exists (no invented migration
  paths, no speculative abstraction, refactoring is expected); asking vs
  deciding (ask once up front batched, the last answer starts the work, once
  work has started an unknown becomes a stated assumption); and the three
  legitimate reasons to stop, with an explicit list of non-reasons —
  pre-existing, different kind of change, big, "feels out of scope".
- **`## Prohibitions`** — removed the two that now contradicted the above
  ("understand full scope first", "no while-I'm-here changes without asking"),
  and added five: don't invent requirements, don't leave assumptions unstated,
  don't report a problem you could have fixed, don't report done without naming
  what verified it, don't end finished work on an open question.
- **Triggers** carry an explicit carve-out: a trigger pass is the one place a
  pause is expected rather than a stop needing justification — the user asked
  for a review, not a rewrite. The `skipped` and `assumed` trigger descriptions
  no longer legitimise leaving things alone.
- **Quality Checks** now says fix what you find, and raise instead of fix only
  when the fix needs a decision that is genuinely the user's.
- H1 section list updated to name the new section.

### Current state

Docs-only change, committed and pushed on `claude/max-effort-hkki82`. No code
touched — `CLAUDE.md` is copied verbatim into `dist/` by the plugin at
`vite.config.js:121`, which globs it by filename, unchanged.

### Key context for the next session

The 18 downstream repos each carry their own copy of these sections. They are
now out of sync with this file, and the `align` trigger will flag every one of
them. Syncing them is unstarted work, not a decision — when it happens, stagger
the pushes per `AI_MISTAKES.md:3` (16 repos pushed inside two minutes starved
the account's CI runners and left a default branch red for 10 hours).
