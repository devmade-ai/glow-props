# User Guide

**redline** tells you what changed in a web page's fine print — built for privacy policies, terms of service,
and pricing pages that change quietly. It reads from the [Wayback Machine](https://web.archive.org/) archive and
answers *"what did they just change on me?"* by leading with the **most recent change**. No account or sign-in.

## The masthead

At the top of every screen:

- **redline.** — the wordmark; also your way home (select it to start over).
- **Plain-language On / Off** (results only) — turns the AI plain-language layer on or off. On, each change gets
  a written summary and a verdict; off, you see just the sourced word-for-word redlines. (On phones this shows
  as **AI On/Off**.)
- **Day / night toggle** (sun/moon icon) — switches the theme. Your choice is remembered on this device; the
  first visit follows your system setting.
- **New comparison** (results only, on wider screens) — start over with a different page. On phones, use the
  wordmark to start over.

## 1. Paste a page address

On the landing screen, paste a page address (for example `example.com/privacy`) into the box and submit. You can
leave off `http://` — it's added for you. Or select one of the example pages: a **clean** archive, a
**self-annotating** one, and a deliberately **noisy** multi-language one so you can see how redline handles a
messy archive.

If the address doesn't look like a web address, you'll get a short message right under the box and nothing is
submitted.

## 2. The wait is honest

The archive is slow to read — its index call alone can take anywhere from a few seconds to the better part of a
minute, and that time is spent on the archive's own server, not in redline. So instead of a fake progress bar,
you get an honest account of the work:

- **Step 1 · The index** — redline asks the archive for every date this page was saved. You'll see the seconds
  ticking up and a live **archive log**.
- **Step 2 · The newest captures** — the index says how many times the page was saved (not whether the words
  changed), so redline opens the newest captures to find the latest real edit. Now the counter shows **captures
  opened**.

You never wait on a blank screen, and redline returns the newest change the moment it's resolved.

**Page not archived, or only captured once?** You're returned to the landing screen with a short explanation —
check the address or try another page.

## 3. Latest changes — the most recent change, first

Results open on **Latest changes** (Fast · newest first).

**The hero** is the single most recent change, shown as soon as it's found: its category tag (**Data / Rights /
Money / Wording**), the action (**+ Added / − Removed / ~ Reworded**), where in the document it sits, an
optional plain-language summary, and the exact **redline**:

- **Struck through** — the old wording that was removed.
- **Highlighted** — the new wording that was added.
- Plain text — the surrounding wording that stayed the same.

If that date changed more passages than the one shown, a note says how many more. **View source capture** opens
the whole archived page on web.archive.org.

**Earlier in the last two years** follows — the older changes, **newest first**. They **stream in behind the
hero and never reshuffle** as they load: nothing jumps around under you. Select any card (or "Show the redline")
to expand its word-level redline. When the window is fully read, a status line confirms it.

**Minor edits** — dates that only reformatted, renamed, or fixed copy without changing your rights — collapse
into a single row at the bottom (**"+ N wording & formatting edits"**). Select it to see them.

## 4. Rank the last two years — the deliberate, expensive view

The second mode, **Rank the last two years** (Reads everything · slower), is the ranked picture. Ranking every
change worst-first and writing a one-paragraph verdict both need the *whole* window, so it's a deliberate choice
— if the window isn't fully read yet, it tells you plainly and finishes reading first (the fast answer was
already in Latest). Once ready:

- **The verdict** — one plain-language paragraph, worst first, of what changed against you, with the **key
  phrases highlighted**. (With plain-language off, there's no written verdict — just the ranked changes below.)
- **What it said vs what the archive shows** — a claim-vs-record panel setting the newest change's old wording
  against its new wording, both sourced to real captures.
- **Ranked worst-first** — every significant change as a card with a rank number, category tag, a
  **Critical / High / Notable** tier and meter, the date, a summary, and an expandable redline. It's **ranked
  once, when the read finished — it does not reshuffle while you read.**
- **Uncertain · not ranked** — any captures redline isn't sure about (see below) are listed here separately,
  never mixed into the ranking.
- **How Redline read this** — a plain-language note on the method.

## 5. Older history — opt-in, and "at least N"

Below the Latest feed, **Before {month year}** is everything older than the two-year window. It's searched only
when you ask: select **Dig into older history**. The earlier change points then appear as a timeline, honestly
framed as **"at least N"** — binary search steps over most captures, so a change made and then undone between
two stepped-over captures can be missed.

**Look deeper** — on any older stretch, this spends a few more reads probing for a change that was **made and
then undone** between the captures redline compared. If it finds a hidden change it's noted; if not, it tells
you the span is clean.

## 6. Honest about a messy archive

The Wayback Machine sometimes stores the same page in different languages, or captures an error page. redline
says so rather than pretending:

- **This archive is noisy** — a banner appears when the window's captures span more than one language. A
  language switch makes every line look edited, so the changes below can be language flips, not real edits.
- **Unsure · possible translation** — an individual change whose capture shares almost no words with the newest
  one is flagged this way, shown with both snippets side by side, and **never counted as a confident edit or
  ranked**.
- **Provisional** — when the archive is noisy, the ranked view says its ranking is provisional.

## Share

**Share** copies a link to the Internet Archive's own side-by-side view of the two most recent versions, so
anyone can verify the comparison at the source. A brief "Link copied" confirms it.

## Good to know

- redline compares the **readable text** of each page, not its layout or code, so the feed focuses on wording.
- **The most recent change is fast; the full history takes longer — by design.** The newest change lands in
  seconds; ranking everything or digging older costs more reads.
- **The feed counts the dates the policy changed, not the paragraphs.** A big rewrite touches many passages on
  one date — that's one card, expandable to the passages, so the answer stays readable.
- **Plain-language is optional.** With the AI layer off (or unavailable), you still get the hero, the stable
  feed, the ranking, and every sourced redline — just without the written summaries and verdict.
- Heavily-templated pages (marketing shells with lots of dynamic content) can inflate the passage count,
  because boilerplate leaks into the readable text. Cleaner policy pages give the cleanest feed.
