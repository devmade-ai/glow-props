# Running a Fleet-Wide Convention Change

Read this before writing any script that edits more than one repo.
`CLAUDE.md` points here; this file is the procedure.

**Running a fleet-wide convention change.** Proven over 18 repos on 2026-08-10; the failures it is shaped around are in [`docs/AI_MISTAKES.md`](docs/AI_MISTAKES.md) (2026-08-10, two entries).
1. **Extract the canonical text from this file at runtime — never retype it into the script.** A helper that slices `CLAUDE.md` between literal markers and throws when a marker is missing or ambiguous means the payload provably cannot drift from the source of truth, and a later edit here propagates without touching the script.
2. **Read every repo's version BEFORE overwriting it,** looking for rules sharper than canonical — that is "Alignment levels up, never down" in practice, and it is the step that gets skipped. On this pass, six repos had rules better than the fleet's; a mechanical overwrite would have destroyed all six. Diff each `## Communication` against the known baseline bullet set and inspect anything novel by hand.
3. **Report a missing anchor as SKIPPED, don't throw.** Repos drift in wording (`— don't wait` vs `- don't wait`, a trailing "first", `## Adopted Patterns` for `## Implementation Patterns`, trigger tables numbered differently). Collecting skips lets one run triage every variant at once instead of dying on the first.
4. **Prove idempotence by running it twice and asserting a no-op.** Guard on the presence of what you insert, using a string unique to the insertion.
5. **Hand-fix the structural outliers rather than forcing them into the shape.** `repo-tor` leads with its product title and keeps docs as a table; `see-veo` had a five-bullet `## Communication Style` stub. Both needed bespoke edits, and flattening them would have been worse than the drift.
6. **Deletions never go in the loop** — see the second mistakes entry.
7. **Never patch the script's source with `sed` / `node -e` one-liners** — their quoting layers double every backslash, and a `\|` that becomes `\\|` turns into regex ALTERNATION whose `.*$` branch matches line 1 of every file. That is not hypothetical; it destroyed the H1 in 14 repos (see the mistakes entry). Edit the script as a file. And when you find one corrupted pattern, sweep for the whole class rather than fixing the one you tripped over.
8. **Verify by counting across every repo** (`grep -c` for each canonical block, plus each superseded string expecting 0) — but that is necessary, not sufficient. Both directions only see the change. Also: assert a **structural invariant unrelated to the edit** (line 1 is still a heading), check that each assertion string is **unique in the file** so it cannot be satisfied by something else, **read every deleted line** (`git diff | grep '^-[^-]'`), and render at least one whole file end to end before pushing any of them.
9. Then commit and push per repo.
