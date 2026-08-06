# redline

**redline** is a Wayback diff viewer — it shows what changed in a web page over time, using the
[Wayback Machine](https://web.archive.org/) archive. It's built for tracking the quiet edits companies make
to **privacy policies, terms of service**, and pricing pages, and answers *"what did they just change on me?"*
by leading with the single most recent change and laying each change out **word for word**.

A sub-brand of **knowless**, built on the same warm editorial design system. Live at
**[web-arch.vercel.app](https://web-arch.vercel.app)**.

## What it does

Companies change their terms and privacy policies quietly, and almost no one re-reads them. A real policy has
thousands of archived snapshots but only a handful of dates where the wording actually changed — and on a big
rewrite, one of those dates can touch a hundred paragraphs. The archive is also slow to interrogate. redline is
built around all three facts:

1. **Paste a page address** — a company's privacy policy, say — or pick a one-click example (a clean archive, a
   self-annotating one, and a deliberately noisy multi-language one).
2. redline reads the capture index behind an **honest wait** (a live "reading the archive" log, not a fake
   progress bar), finds the **newest change first**, and shows it as a **hero** — a plain-language read plus the
   exact word-level redline — in seconds.
3. Older changes then **stream in behind it, newest-first, and never reshuffle** as they load. Minor
   wording/formatting edits collapse out of the way, and an opt-in **Dig into older history** unlocks everything
   before the recent window.
4. Want the ranked picture? **Rank the last two years** is a deliberate second click (it reads everything, so
   it's slower): a worst-first **verdict**, a **claim-vs-record** panel setting the old wording against the new,
   and every significant change **ranked by impact** with a Data / Rights / Money / Wording tag and a
   Critical / High / Notable tier — ranked once, held still.
5. **Plain-language** is an optional header toggle. On, an AI layer writes the verdict and each date's summary,
   category, and significance. Off (or when the AI layer isn't available), cards fall back to the page's own
   changed wording — the hero, stable feed, and ranking are identical, only the prose is plainer.
6. **Honest about a messy archive:** captures in more than one language are flagged, shown side by side, and
   never counted as confident edits; the ranking says so ("provisional").

## How it works — the Wayback Machine

redline reads archived pages straight from the public Internet Archive — no account needed to read.

- The **capture index** lists every date a page was saved, with a content digest. redline collapses
  consecutive-identical captures for free, then **binary-searches the readable text** across the remaining
  boundaries — so it opens a few dozen captures, not thousands. The digest hashes raw HTML (which churns every
  capture), so it can't stand in for the wording; the real search is over the extracted text.
- The **newest change is found first**, deterministically, so the lead card is stable and never swaps as older
  changes stream in behind it.
- Each date's many paragraph edits **roll up to one card**, so the feed stays human-scale (a two-year window is
  a handful of change points, not hundreds of paragraph diffs).

## Tech stack

- **React**, built with **Vite**
- **knowless design system** — a warm editorial system (self-hosted Newsreader / Libre Franklin / IBM Plex Mono
  + CSS custom-property tokens), applied via style objects. No CSS framework.
- **Diff:** [`jsdiff`](https://github.com/kpdecker/jsdiff) — line-level to find changes, word-level to render the
  inline redline
- **Content extraction:** [`@mozilla/readability`](https://github.com/mozilla/readability) to isolate the
  article/policy text
- **AI:** an optional plain-language layer (per-date summaries, categories, significance, and a synthesised
  verdict) that degrades to the raw changed wording when it isn't configured
- Hosted on **Vercel**

## Part of the devmade-ai fleet

Shared engineering patterns and conventions live in **gp-props**, the fleet's source of truth.
