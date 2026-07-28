# Session Notes

## Worked on

Registering the new **qi-invoice** app in the project catalog. All the
implementation work for that app happened in its own repo; the change here is
the catalog entry plus its scrubbed docs.

## Accomplished

- **`public/projects/qi-invoice/`** — `meta.json` + `README.md` +
  `USER_GUIDE.md` + `TESTING_GUIDE.md`, `docs: { readme, userGuide,
  testingGuide }`.
  - `meta.json` — category `user-facing`, badge `Invoicing`, private repo, live
    at `qi-invoice.vercel.app`. `dataPrivacy` carries four keys rather than the
    usual storage/auth pair, because "storage: none" is the product's defining
    claim and needed the personalisation and delivery keys beside it to be
    honest — the browser DOES remember the sender's own details, and a copy of
    every send DOES reach the operator's inbox.
  - `README.md` — scrubbed of setup commands, env vars and internal doc links,
    but the design-decision section was kept deliberately: integer money, the
    two rounding rules, invoice-level currency and sign-from-section are the
    interesting part of the project at portfolio altitude.
  - `USER_GUIDE.md` — copied verbatim. Grepped first; the source guide contains
    no commands, no localhost, no env vars, nothing to strip.
  - `TESTING_GUIDE.md` — rewritten. The source version opens with the automated
    suite, npm scripts, a per-test-file coverage table and env-var manipulation,
    none of which belongs here. The 13 manual scenarios and the regression
    checklist carried over.
- **`docs/PROJECT_DOCS.md`** — new row in the User-Facing Apps table with the
  per-file scrub notes, and `qi-invoice` added to the private-repo list.

## Current state

- `npm run build` clean. `validateProjectMeta` green — no warnings, so every
  declared doc file exists. `[generate-sitemap] 29 URLs` (up from 28; the
  generator picks the directory up automatically).
- `npm run verify:seo` and `npm run verify:timer-cleanup` both pass.

## Key context

- The Details page (`project.html`) renders one labeled tab per
  `meta.docs.<key>: true` (Overview / User Guide / Testing Guide / Tutorial),
  fetching the matching file from `public/projects/<slug>/`.
  `validateProjectMeta` in `vite.config.js` warns if a declared doc file is
  missing (`DOC_FILE_MAP`: readme→README.md, userGuide→USER_GUIDE.md,
  testingGuide→TESTING_GUIDE.md, tutorial→TUTORIAL.md).
- Scrub rule, unchanged from the previous rounds: no `npm run`/`npm install`, no
  localhost/`:5173`, no `VITE_*` / `SUPABASE_*` / `SMTP_*`, no `wrangler`/`npx`/
  `supabase` commands, no DB schema or RLS, no deploy internals, no source-tree
  or CLAUDE.md references. Features and high-level stack stay.
- `intxt`'s docs remain the reference for scrub altitude; qi-invoice matches it.
- No TutorialModal exists in qi-invoice's source, so `tutorial: false` — same
  position as sun-sea-o and four-ems.
