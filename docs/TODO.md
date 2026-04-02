# TODO

## Missing Documentation (source repos)

- [ ] **model-pear** — Create User Guide, Testing Guide, and TutorialModal in the source repo, then mirror here
- [ ] **see-veo** — Create User Guide, Testing Guide, and TutorialModal in the source repo, then mirror here

## Future Improvements

- [ ] **sun-sea-o** — Add TutorialModal in source repo, then extract as TUTORIAL.md here
- [ ] **four-ems** — Add TutorialModal in source repo, then extract as TUTORIAL.md here

## Technical Debt

- [ ] **Flash prevention theme array duplication** — Theme arrays are still duplicated in `partials/head-common.html` and `public/theme.js`. Intentional — the inline bootstrap script must run synchronously before theme.js loads for flash prevention. Both copies have comments flagging the sync requirement. Consider build-time injection from a shared JSON source if DaisyUI theme list changes.
