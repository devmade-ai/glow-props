# TODO

## Missing Documentation (source repos)

- [ ] **model-pear** — Create User Guide, Testing Guide, and TutorialModal in the source repo, then mirror here
- [ ] **see-veo** — Create User Guide, Testing Guide, and TutorialModal in the source repo, then mirror here

## Future Improvements

- [ ] **sun-sea-o** — Add TutorialModal in source repo, then extract as TUTORIAL.md here
- [ ] **four-ems** — Add TutorialModal in source repo, then extract as TUTORIAL.md here

## Technical Debt

- [ ] **Bundle size from 35 DaisyUI themes** — CSS bundle is ~145KB (gzipped ~25KB) with all 35 themes registered. Acceptable for a portfolio site, but if performance becomes a concern, consider lazy-loading non-default themes or trimming unused ones.
- [ ] **Flash prevention default duplication** — Default theme names (`caramellatte`/`coffee`) are duplicated in the inline scripts of index.html and project.html, and in theme.js constants. Intentional — the inline scripts must run before theme.js loads. Each copy has a comment flagging the sync requirement.
- [ ] **Theme lists duplicated in 3 places** — Light/dark theme arrays exist in index.html bootstrap, project.html bootstrap, and theme.js. Must stay in sync manually. Extraction to a shared file is complex because the bootstrap scripts must be inline (flash prevention). A build-time template system would solve this.
- [ ] **Burger menu HTML duplicated** — ~400 lines of burger menu markup duplicated across index.html and project.html. Same constraint as theme lists — vanilla HTML multi-page site with no templating. A Vite HTML partial/include plugin would solve this.

## Deferred Audit Findings (Low Priority)

- [ ] **No debug system (DebugPill)** — Per CLAUDE.md, the debug system is an alpha-phase diagnostic tool. Not needed for a static portfolio site. Revisit if the site adds dynamic features.
- [ ] **Google Fonts render-blocking** — `display=swap` + preconnect is adequate. Inlining critical font-face adds complexity for marginal gain.
- [ ] **Icon-192 used at 36x36 display** — 2.5KB image served at 5x display size. Cached by SW, negligible impact.
- [ ] **No ESLint / Prettier** — Solo project with consistent style. Add if contributors join.
- [ ] **No test framework** — Static site with manual testing. Add Vitest + Playwright if regressions become a problem.
- [ ] **No CSP headers** — GitHub Pages limits header control. Low-risk static site with no user input forms.
- [ ] **No sitemap / robots.txt** — Low SEO priority for a portfolio.
- [ ] **No Google Fonts SRI** — Google Fonts CDN doesn't support SRI (dynamic CSS generation). Low risk.
- [ ] **No Lighthouse CI** — Nice-to-have automated performance tracking in GitHub Actions.
- [ ] **No structured data (JSON-LD)** — schema.org markup for portfolio/projects. Low SEO priority.
- [ ] **Card hover states lack touch feedback** — Cards work via JS click handler, touch interaction is functional. Could add `:active` state for visual feedback.
- [ ] **Hard-coded base URL** — `base: '/glow-props/'` in vite.config.js. Single deployment target, no need for env vars unless deployment changes.
- [ ] **Vite warning about theme.js** — "can't be bundled without type='module' attribute" is expected. theme.js is intentionally a classic script for synchronous execution.
- [ ] **Silent localStorage catch blocks** — Intentional degradation pattern per THEME_DARK_MODE.md. Falls back to OS preference.
