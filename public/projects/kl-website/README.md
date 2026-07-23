# knowless

The **knowless** reader — independent investigative journalism, *"ink on warm paper, one signal red."*
A mobile-first **Progressive Web App**, live at **[knowless.net](https://knowless.net)**.

## What it is

A single fluid-column reading app with four tabs:

- **Today** — the latest investigations, with a lead story and a running stream.
- **Sections** — browse the reporting by beat.
- **Search** — find a report by keyword, beat, or what's most read.
- **Secure** — an encrypted tip line for sources to reach the newsroom privately.

Plus a full-screen **reader** overlay with drop-cap prose and a claim-vs-record panel, **save-for-offline**,
an **install** prompt, and a light/**night** theme. Every screen is hand-rolled from the knowless design
system's tokens — warm paper, serif headlines, uppercase-mono metadata, and one signal-red accent per view.

## Tech stack

- **React + TypeScript**, built with **Vite**
- **knowless design system** — CSS-custom-property tokens; screens are styled directly from the tokens (no CSS framework)
- Self-hosted type: **Newsreader** (display serif), **Libre Franklin** (sans), **IBM Plex Mono** (metadata)
- **Installable PWA** — works offline and updates itself on launch
- Hosted on **Vercel**

## Theming

Light ↔ night, flipped by a single attribute on the page. The choice is remembered on the device and
follows the system setting on a first visit — with no flash of the wrong theme on load.

## Part of the devmade-ai fleet

Shared engineering patterns and conventions live in **glow-props**, the fleet's source of truth.
