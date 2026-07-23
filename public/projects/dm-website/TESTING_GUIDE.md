# Testing Guide

Manual test scenarios for verifying dm-website in a browser. Every check is something a visitor can see.

## Scenarios

**Scenario: the front door routes to both products**
1. Load `/`.
   - **Expected:** intro + two door cards (vibe rescue, apps for business); cards lift on hover.
2. Click the **vibe rescue** door.
   - **Expected:** client-side nav to `/vibe-rescue` (no full reload), scrolled to top.
3. Back, then click **apps for business**.
   - **Expected:** `/apps`.

**Scenario: in-page anchors + sticky nav**
1. On `/vibe-rescue`, open the menu (☰) and click **how it works** (or the "see how it works" button).
   - **Expected:** smooth-scrolls to the How section, which clears the sticky header (not hidden under it).

**Scenario: vibe rescue intake modal**
1. On `/vibe-rescue`, click **finish my build**.
   - **Expected:** modal opens (blurred backdrop), focus moves into it, page scroll locks.
2. Submit with the email empty.
   - **Expected:** the browser blocks submit (email is required).
3. Fill a valid email and submit.
   - **Expected:** "sending…" then the "got it." confirmation. On a network failure: an inline error pointing
     to a fallback contact email.
4. Press **Esc** / click outside / click ✕.
   - **Expected:** modal closes, scroll unlocks.

**Scenario: apps pricing toggle + prepaid slider**
1. On `/apps`, switch **monthly → yearly → prepaid**.
   - **Expected:** price, unit, and note update; "≈ $X/mo · save $Y" on yearly.
2. On **prepaid**, drag the slider.
   - **Expected:** "you pay" and "you get ≈ N days / mo" update live; the climb chart renders (violet flat
     line, lime "you lock here" dot).
3. Open **lock my rate** with a plan selected.
   - **Expected:** the modal's rate strip shows the selected plan.

**Scenario: case studies filter + detail**
1. On `/case-studies`, click **rescues**, then **apps**, then **all**.
   - **Expected:** the grid filters; "all" shows a featured card + the rest.
2. Open a **rescue** case, then an **apps** case.
   - **Expected:** rescue shows the before/after terminal; apps shows the apps-run grid; both show
     approach/outcome/metrics/quote + related.
3. Visit `/case-studies/does-not-exist`.
   - **Expected:** redirect to `/case-studies`.

**Scenario: blog filter + post**
1. On `/blog`, filter by category; open a post.
   - **Expected:** post renders all block types (paragraph, heading, terminal block, quote, note, list);
     related posts at the bottom.
2. Visit `/blog/nope`.
   - **Expected:** redirect to `/blog`.

**Scenario: legal switcher is deep-linkable**
1. Load `/legal`.
   - **Expected:** terms shown by default.
2. Click **privacy / cookies / acceptable use**.
   - **Expected:** URL changes to `/legal/<doc>`, content swaps, scrolled to top; browser back returns to the
     previous doc.
3. Load `/legal/cookies` directly.
   - **Expected:** cookies doc shown.

## Regression checklist

- [ ] Site loads with no console errors on every route
- [ ] All nav/footer links resolve (no 404s); internal links don't full-reload
- [ ] `/`, `/vibe-rescue`, `/apps`, `/case-studies(/:slug)`, `/blog(/:slug)`, `/legal(/:doc)` all render
- [ ] Unknown route → redirects to `/`
- [ ] Deep links (a direct `/case-studies/<slug>` URL, opened fresh) load the page, not a 404
- [ ] Layout holds at ≤375px (mobile) and desktop; the nav build-tag hides on very narrow screens
- [ ] `prefers-reduced-motion`: hovers don't translate, pulse/caret/modal animations off, scroll is instant
