# TODO

## Missing Documentation (source repos)

- [ ] **model-pear** — Create User Guide, Testing Guide, and TutorialModal in the source repo, then mirror here
- [ ] **see-veo** — Create User Guide, Testing Guide, and TutorialModal in the source repo, then mirror here

## Future Improvements

- [ ] **sun-sea-o** — Add TutorialModal in source repo, then extract as TUTORIAL.md here
- [ ] **four-ems** — Add TutorialModal in source repo, then extract as TUTORIAL.md here

## Technical Debt

- [ ] **Bundle size from 35 DaisyUI themes** — CSS bundle is ~138KB (gzipped ~24KB) with all 35 themes registered. Was ~117KB with 16 themes. Acceptable for a portfolio site, but if performance becomes a concern, consider lazy-loading non-default themes or trimming unused ones.
- [ ] **Flash prevention default duplication** — Default theme names (`caramellatte`/`coffee`) are duplicated in the inline scripts of index.html and project.html, and in theme.js constants. Intentional — the inline scripts must run before theme.js loads. Each copy has a comment flagging the sync requirement.
