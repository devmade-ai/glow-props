# Testing Guide

Manual test scenarios for **redline**, written from the user's side of the screen. Open the app and work
through each flow; every check is something you can see in the browser.

## Happy path — track a real page

1. Open the app. **Expect:** the landing screen — the **redline.** wordmark, the "See what they just
   **changed** on you." headline (with a redaction-wipe animation on "changed"), a URL box, example chips (a
   **clean archive**, a **self-annotating** one, a **noisy archive**), three "how it behaves" facts, and an
   illustrative sample-change card.
2. Select the **Mozilla · Firefox Privacy Notice** example (or paste a real privacy-policy URL).
   **Expect (the honest wait):** the page title header appears immediately, then **Step 1 · The index** — an
   elapsed-seconds metric and a live **archive log**. When the index returns, **Step 2 · The newest captures** —
   a **captures opened** counter and sealed bars. No fake progress bar.
3. **The hero lands** (Latest changes mode, active by default). **Expect:** a slim status line ("Newest change
   is in — still reading older captures"), then **Most recent change · {date}** with a category tag
   (Data/Rights/Money/Wording), an action (+ Added / − Removed / ~ Reworded), context, an optional
   plain-language summary, the word-level **redline** (struck-through removals, highlighted additions), a
   "+ N more passages changed on this date" note, and a **View source capture** link.
4. **Hero stability:** note the hero's date — it must NOT change as older changes stream in. It's the newest
   from the first reveal to completion.
5. **Earlier in the last two years · newest first** — older change-point cards appear **below** the hero and
   **do not reshuffle** as more load. Select a card (or "Show the redline") to expand its redline + source link.
6. When complete, select the **"+ N wording & formatting edits"** collapse at the bottom. **Expect:** it
   expands to the minor dates.
7. Under **Before {month year}**, select **Dig into older history**. **Expect:** a brief "Digging…", then older
   change points appear as a timeline with an **"at least N"** honesty note. On an older entry, **Look deeper**
   reports either a hidden change found or a clean span.
8. Select the **Rank the last two years** mode. **Expect:** if the window is still reading, a loading state;
   once ready — **The verdict** (a worst-first paragraph with highlighted phrases, or a plain fallback), a
   **What it said / What the archive shows** claim-vs-record panel, the **Ranked worst-first** list (rank, tag,
   Critical/High/Notable tier + meter, date, summary, expandable redline) marked "ranked once … it doesn't
   reshuffle", and a **How Redline read this** note.
9. Select **Share**. **Expect:** a brief "✓ Link copied" (an archive.org side-by-side diff link is on the
   clipboard).
10. Toggle **Plain-language** off in the masthead. **Expect:** the hero/cards drop the written summary and show
    just the redline + context; the ranked verdict shows a "plain-language is off" note. Toggle back on to
    restore.
11. Select **New comparison** (or the wordmark). **Expect:** back to the landing screen.

## Noisy archive (honesty states)

1. Select the **WhatsApp** example (or another multi-language page). **Expect:** a **This archive is noisy**
   banner above the results; one or more change cards flagged **Unsure · possible translation** (dashed
   border), which when expanded show the two snippets side by side ("NEWEST" vs "THIS CAPTURE").
2. Switch to **Rank the last two years**. **Expect:** a **Provisional** note on the verdict, and the flagged
   captures listed under **Uncertain · not ranked** — never mixed into the ranking.

## Plain-language layer (and graceful degradation)

1. With the AI layer available: run a comparison. **Expect:** plain-language **summaries**, **Data/Rights/
   Money/Wording** tags that vary, significance tiers that **spread** (Critical/High/Notable), a synthesised
   **verdict** with highlighted phrases, and a claim-vs-record panel.
2. With the AI layer off or unavailable: run a comparison. **Expect:** everything still renders — the hero,
   stable feed, ranking, redlines, and claim-vs-record all present; summaries are the page's own changed
   wording, badges read the neutral **Wording**, and the verdict is a plain one-liner. Nothing errors or hangs.

## Mobile

1. Load the app in a narrow viewport (≈390px) or a phone. **Expect:** no horizontal scrolling anywhere. The
   masthead shows **redline.** + a compact **AI On/Off** + the theme toggle (the "New comparison" button is
   dropped — the wordmark restarts); nothing overlaps. The hero, cards, mode switch, and redlines all reflow
   cleanly.

## Theme

1. Select the sun/moon toggle. **Expect:** the whole app flips between warm day (cream) and night (warm
   near-black); text, redline marks (amber add / red strike), tiers, and badges stay legible in both.
2. Reload. **Expect:** the theme persists (stored per device). No flash of the wrong theme on load.

## Empty / edge states

1. Paste a made-up address like `not-a-real-site-xyz.example/nope`. **Expect:** returned to landing with a
   short "not archived" message. No crash.
2. Paste gibberish like `hello` (no dot). **Expect:** an inline "That doesn't look like a web address…" under
   the box; nothing is submitted.
3. Find a page with only one archived version. **Expect:** a "only one archived version" message, back on
   landing.
4. A page with **no wording changes in the last two years**. **Expect:** no hero; a "Nothing changed in the
   last two years" panel; the older dig still offered.

## Regression checklist

- [ ] Landing → **honest wait** (index elapsed + archive log → reading counter + bars) → hero renders; no fake
      progress bar.
- [ ] **Hero is stable** — its date at first reveal equals its date at complete (no swap as older changes
      stream in).
- [ ] Older changes append **newest-first and never reshuffle**; the window resolves in dozens of reads, never
      the full archive count.
- [ ] Feed card = one **change point (date)**, expands to capped redlines + "+ N more passages" + source link;
      minor collapse works.
- [ ] **Rank** mode: loading state if not done; verdict (or fallback/off) + claim-vs-record + worst-first
      ranked list + Uncertain + methodology.
- [ ] **Dig into older history** searches on demand, "at least N" note; Look deeper reports found / not-found.
- [ ] Plain-language toggle On/Off swaps summaries ↔ redline-only; with the AI layer, summaries + varied
      categories + spread tiers.
- [ ] Noisy archive: banner + "unsure · translation" flags + provisional + Uncertain-not-ranked.
- [ ] Mobile (~390px): no horizontal scroll; masthead compact (AI toggle + theme), no overlap.
- [ ] Share copies a link; New comparison / wordmark returns to landing.
- [ ] Day/night toggle works and persists; no wrong-theme flash on reload.
- [ ] "Not archived" and invalid-input states handled inline, no crash; excerpts are real text.
- [ ] No console/page errors during a normal run (desktop + mobile + night).
