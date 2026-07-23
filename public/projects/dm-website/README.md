# dm-website

The **devmade-ai front-door site** — the public brand homepage for devmade-ai. It introduces the studio and
routes visitors to its two product lines: the **vibe rescue** service and **apps for business**. Live at
**[devmade.app](https://www.devmade.app)**.

> Not to be confused with **glow-props**, the portfolio / resource hub. dm-website is the top-level brand
> landing; glow-props is the deep project showcase. The front door links out to it.

## What's here

A React single-page app with clean-URL routing:

| Route | Page |
|-------|------|
| `/` | **Hub** — the front door; two doors (vibe rescue, apps for business) |
| `/vibe-rescue` | **Vibe Rescue** — the hands-on, hourly rescue service (hero, problem, how-it-works, pricing, proof, FAQ, intake modal) |
| `/apps` | **Apps for Business** — the subscription product line (apps shelf, one-subscription pitch, monthly/yearly/prepaid pricing, FAQ, subscribe modal) |
| `/case-studies` · `/case-studies/:slug` | **Case Studies** index + detail (filterable; rescue vs apps templates) |
| `/blog` · `/blog/:slug` | **The Build Log** index + post (filterable; typed body blocks) |
| `/legal` · `/legal/:doc` | **Legal** — terms / privacy / cookies / acceptable use |

The intake and subscribe forms deliver an email through the shared **tool-till-tees** contact API.

## Tech Stack

- **Vite + React + TypeScript** (strict)
- **React Router** — clean URLs, with a single-page-application fallback so deep links resolve
- **devmade design system** — token CSS + hand-rolled components (Space Grotesk + JetBrains Mono, self-hosted).
  No Tailwind — the design is built entirely on the design-system tokens. Dark theme only.
- Hosted on **Cloudflare Workers** static assets

## Documentation

- [User Guide](USER_GUIDE.md) — page-by-page walkthrough
- [Testing Guide](TESTING_GUIDE.md) — manual test scenarios

## Related repos (devmade-ai)

- **glow-props** — portfolio / resource hub + the fleet's implementation-pattern source of truth
- **tool-till-tees** — shared utilities API backend (handles the contact forms)
