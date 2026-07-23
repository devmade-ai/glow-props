# User Guide

What visitors can do on dm-website, page by page, in plain language.

## Hub (`/`) — the front door

The first thing a visitor sees: a short intro ("what do you need shipped?") and **two doors**:

- **vibe rescue** — for someone whose AI-built app broke and needs it fixed.
- **apps for business** — for someone who wants ready-made software to subscribe to.

Picking a door takes them to that product line. The top nav links to both; the footer links to both plus
resources (case studies, the build log, contact) and legal.

## Vibe Rescue (`/vibe-rescue`) — the service

A landing page for the hands-on, hourly rescue service:

- **Hero** — the pitch, a status pill (now taking rescues), and a "before → shipped" terminal animation. Two
  buttons: **finish my build** (opens the intake form) and **see how it works** (scrolls down).
- **The problem** — six things that commonly get stuck at this stage, framed as normal (not the maker's fault).
- **How it works** — three steps (send us what you have → we build it for real → ship and stay shipped).
- **Pricing** — one flat hourly rate, scoped up front. **Book the rescue** opens the intake form.
- **Proof** — testimonials + stats.
- **FAQ** — billing, code ownership, audits, maintenance.
- **Intake form** (modal) — paste your html / a repo / a link, optionally describe what's got you stuck, and an
  email. Submitting sends it to the team and shows a confirmation. Close with the ✕, the **done** button,
  clicking outside, or **Esc**.

## Apps for Business (`/apps`) — the products

A landing page for the subscription product line:

- **Hero** — the pitch and a mock app window. **Get started** opens the subscribe form; **browse the apps**
  scrolls down.
- **The apps** — the current shelf (billing, ops board, support inbox) plus a "+ future apps" card.
- **One subscription** — every app included, future apps free, your price locked.
- **Pricing** — switch between **monthly**, **yearly**, and **prepaid**. Prepaid shows a slider: drag the
  amount and see how much access time it buys. **Lock my rate** opens the subscribe form. A small chart shows
  your locked rate staying flat while the list price climbs.
- **FAQ** — cancelling, why the price climbs, what a "future app" is, prepaid, and how this differs from the
  rescue.
- **Subscribe form** (modal) — optional company + email. Submitting confirms the locked rate.

## Case Studies (`/case-studies`)

Proof, with numbers. A stats strip, a **filter** (all / rescues / apps), a featured case, and a grid. Clicking
a card opens the full case study (`/case-studies/:slug`):

- Rescues show a before/after terminal; apps customers show the apps they run.
- Both show what we did, the outcome, metrics, a quote, a contextual call-to-action, and related cases.

## The Build Log (`/blog`)

devmade's posts. A **filter** (all / engineering / rescues / product / field notes), a featured latest post, and
a grid. Clicking a card opens the post (`/blog/:slug`) with the full article, an author card, a
call-to-action, and related posts.

## Legal (`/legal`)

Plain-language policies behind a switcher: **terms**, **privacy**, **cookies**, **acceptable use**. Each is its
own URL (`/legal/terms`, etc.) so it can be linked directly. A notice at the top flags that these are sample
documents with `[bracketed]` placeholders to be filled in.

---
Every page is **dark-themed**, works down to mobile widths, and respects "reduce motion" (animations and
smooth-scroll switch off).
