# TODO

## Missing Documentation (source repos)

- [ ] **model-pear** — Create User Guide, Testing Guide, and TutorialModal in the source repo, then mirror here
- [ ] **see-veo** — Create User Guide, Testing Guide, and TutorialModal in the source repo, then mirror here

## Future Improvements

- [ ] **sun-sea-o** — Add TutorialModal in source repo, then extract as TUTORIAL.md here
- [ ] **four-ems** — Add TutorialModal in source repo, then extract as TUTORIAL.md here

## Technical Debt

- [ ] **Flash prevention default duplication** — Default theme names (`caramellatte`/`coffee`) and theme arrays are duplicated in the inline bootstrap scripts of index.html / project.html and in theme.js constants. Intentional — the inline scripts must run before theme.js loads for flash prevention. Each copy has a comment flagging the sync requirement. The navbar HTML duplication was solved via `partials/navbar.html`, but the bootstrap scripts can't be externalized without losing synchronous execution.
