# Session Notes

## Worked on

The **qi-invoice** catalog entry — added, then substantially rewritten in the
same session when the app itself changed shape. All implementation work happened
in qi-invoice's own repo; the change here is the entry plus its scrubbed docs.

## Accomplished

- **`public/projects/qi-invoice/`** — `meta.json` + `README.md` +
  `USER_GUIDE.md` + `TESTING_GUIDE.md`, `docs: { readme, userGuide,
  testingGuide }`.
- **Rewritten mid-session.** The first version described an app that emailed the
  invoice; the owner then removed the entire backend — endpoint, SMTP, rate
  limiting, Supabase — leaving a static app that produces a PDF. Every one of
  the four files was updated: there is no send flow, no recipient inbox, no
  server in the architecture diagram, and the privacy claims changed from "we
  don't retain it" to "it never leaves your device", which is a stronger and
  simpler thing to say.
- **`meta.json`** carries four `dataPrivacy` keys rather than the usual
  storage/auth pair. "No server" is the product's defining claim and stating it
  alone would be incomplete: the browser DOES remember the sender's own details,
  and that belongs beside it. The `authentication` key was dropped — there is no
  auth to describe, and an empty one would read as an omission.
- **`README.md`** keeps its design-decision section deliberately: integer money,
  the two rounding rules, invoice-level currency, sign-from-section, two
  renderers sharing one set of figures, and why the PDF holds text rather than
  pixels. That is the part worth reading at portfolio altitude. Setup commands,
  env vars and internal doc links are gone.
- **`USER_GUIDE.md`** copied verbatim, both times. Grepped first on each pass:
  the source guide has no commands, no localhost and no env vars, so there was
  nothing to strip and rewriting it would only introduce drift.
- **`TESTING_GUIDE.md`** rewritten rather than scrubbed. The source opens with
  the automated suite, npm scripts and a per-test-file coverage table; removing
  those left too little to edit around, so the manual scenarios were carried
  over on their own — 16 of them now, including the generated-PDF and non-Latin
  cases the email-era version had no reason to cover.
- **`docs/PROJECT_DOCS.md`** — row in the User-Facing Apps table with the
  per-file scrub treatment, and `qi-invoice` added to the private-repo list.

## Current state

`npm run build` clean, `validateProjectMeta` green (no warnings, so every
declared doc file exists), sitemap at 29 URLs. `npm run verify:seo` and
`npm run verify:timer-cleanup` both pass.

## Key context

- The Details page (`project.html`) renders one labeled tab per
  `meta.docs.<key>: true` (Overview / User Guide / Testing Guide / Tutorial),
  fetching the matching file from `public/projects/<slug>/`.
  `validateProjectMeta` in `vite.config.js` warns if a declared doc file is
  missing (`DOC_FILE_MAP`: readme→README.md, userGuide→USER_GUIDE.md,
  testingGuide→TESTING_GUIDE.md, tutorial→TUTORIAL.md).
- Scrub rule, unchanged: no `npm run`/`npm install`, no localhost/`:5173`, no
  `VITE_*` / `SUPABASE_*` / `SMTP_*`, no `wrangler`/`npx`/`supabase` commands,
  no DB schema or RLS, no deploy internals, no source-tree or CLAUDE.md
  references. Features and high-level stack stay.
- `intxt`'s docs remain the reference for scrub altitude; qi-invoice matches it.
- **Mirrored docs go stale when the source product changes, not just when its
  wording changes.** This entry described a mail-sending app for part of one
  session. Worth re-reading a project's own README before assuming the mirrored
  copy is still accurate.
