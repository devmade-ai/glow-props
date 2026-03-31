# Sancio (sun-sea-o)

Module-based agreement builder with progressive signing. Latin: *"I ratify."*

## What It Does

Sancio is an agreement tool built on the idea that agreements don't happen all at once. Agreements are assembled from individual text modules, each independently authored, negotiated, and signed. The full agreement emerges over time as modules are added, agreed upon, and locked.

## Current Status

All phases (1–8) are complete. The app is fully backed by Supabase (auth, realtime subscriptions) and the tool-till-tees REST API (data mutations).

## Features

- **Projects** — Create, edit, delete projects that contain agreements
- **Counterparty** — Invite a counterparty with email + passphrase, handshake acceptance flow
- **Agreements** — Create, edit, delete agreements with status tracking (draft, in progress, fully agreed, reopened). Counterparties can request new agreements
- **Modules** — Add modules from 6 starter templates or create blank ones. Edit, reorder, and delete. Content limit of 10,000 characters
- **Proposals** — Counterparties propose changes to modules; creators accept, reject, or counter
- **Signing** — Per-module ready-to-sign toggle with auto-lock when both parties agree. Batch signing for multiple modules at once
- **Sequence sign-off** — Both parties approve the final module ordering to fully agree the agreement
- **Notes** — Add notes with source tagging (in-app, email, WhatsApp, phone, in-person, other) at agreement or module level
- **Version history** — Editing a signed module creates a version snapshot and resets signatures
- **Signature log** — Records every signing action with IP, user agent, and timestamp
- **PDF preview** — Print-friendly agreement view with verification codes (SHA-256 hash)
- **Agreement splitting** — Select modules to split into a new agreement
- **Nudge & expiry** — Configurable nudge period and auto-expire per module
- **Notifications** — In-app notifications for signing, proposals, notes, sequence approval, splits, and status changes
- **Authentication** — Google OAuth via Supabase Auth
- **Realtime** — Live updates via Supabase realtime subscriptions
- **PWA** — Installable as a progressive web app with offline indicator, install prompt, and update banner
- **Error handling** — Error boundary with recovery UI, input validation with character limits

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **PWA:** vite-plugin-pwa
- **Auth:** Supabase Auth (Google OAuth)
- **Data:** tool-till-tees REST API (mutations) + Supabase (realtime subscriptions)

## Documentation

- [User Guide](USER_GUIDE.md)
- [Testing Guide](TESTING_GUIDE.md)
