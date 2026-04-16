# User Actions

## Propagate HISTORY.md removal to all downstream repos

Policy change: HISTORY.md files are removed across the fleet. Git history tracks completions — no separate changelog needed.

For each downstream repo (canva-grid, budgy-ting, model-pear, see-veo, repo-tor, few-lap, sun-sea-o, graphiki, four-ems, synctone), do the following on the next session:

1. Delete `docs/HISTORY.md`
2. In `CLAUDE.md`, remove the `### docs/HISTORY.md` section from Documentation rules
3. In `CLAUDE.md`, change any "move completed items to HISTORY.md" to "delete completed items (git history tracks them)"
4. In `README.md` (if it lists docs structure), remove the HISTORY.md line
5. In `docs/TODO.md`, delete any already-completed `[x]` items (notably model-pear's "Negotiation Mode" section and graphiki's "Remove IDs from Import/Merge" section)
6. Grep for any other references to HISTORY.md and remove them

Commit message: `docs: remove HISTORY.md — git history tracks completions`
