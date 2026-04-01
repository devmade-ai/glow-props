# TODO

## Missing Documentation (source repos)

- [ ] **model-pear** — Create User Guide, Testing Guide, and TutorialModal in the source repo, then mirror here
- [ ] **see-veo** — Create User Guide, Testing Guide, and TutorialModal in the source repo, then mirror here

## Future Improvements

- [ ] **sun-sea-o** — Add TutorialModal in source repo, then extract as TUTORIAL.md here
- [ ] **four-ems** — Add TutorialModal in source repo, then extract as TUTORIAL.md here

## Technical Debt

- [ ] **Combo map duplication** — The theme combo key→DaisyUI-name mapping is duplicated in 3 places: `public/theme.js` (COMBOS array), `index.html` (flash prevention script), and `project.html` (flash prevention script). This is intentional — the flash prevention scripts must run inline before any external JS loads, so they can't import from theme.js. Each copy has a comment flagging the sync requirement. Risk: adding/removing a combo requires updating all 3 files.
- [ ] **Bundle size from 16 DaisyUI themes** — CSS bundle is ~117KB (gzipped ~20KB) with 16 themes registered. Was ~50KB with 2 themes. Acceptable for a portfolio site, but if more themes are added, consider lazy-loading non-default themes or trimming unused ones.
