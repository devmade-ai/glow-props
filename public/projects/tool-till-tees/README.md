# tool-till-tees

Utilities API hosted on Vercel. Three main systems: an interest/contact notification endpoint, a multi-tenant form builder API ("Four Ems"), and an agreement management backend ("Sancio") — all backed by Supabase.

## Features

- **Interest/contact form** — visitors on your CV site submit a message, delivered to your inbox via SMTP
- **Form builder API** — create, manage, publish, and collect submissions for custom forms
- **Sancio agreement management** — projects, agreements, modules, proposals, signatures, notifications, and PDF verifications for two-party contract workflows
- **Server-side validation** — field types, conditional visibility, and input sanitization
- **Email notifications** — optional SMTP notifications on new form submissions and Sancio invitations
- **Authentication** — anonymous auth with JWT tokens and row-level security policies

## Architecture

```
[CV Site / Frontend]  →  POST /api/send-interest  →  [SMTP]  →  [Your Inbox]

[Form Builder App]  →  /api/forms/*  →  [Database]  (authenticated)
[Public Form Page]  →  /api/public/forms/:slug/submit  →  [Database]  (unauthenticated)

[Sancio Frontend]  →  /api/sancio/*  →  [Database]  (authenticated)
```

## API Overview

### General

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api` | Root status |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/send-interest` | Submit a contact message |

### Forms (Authenticated)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/forms` | List your forms |
| `POST` | `/api/forms` | Create a new form |
| `GET` | `/api/forms/:id` | Get a single form |
| `PUT` | `/api/forms/:id` | Update a form |
| `DELETE` | `/api/forms/:id` | Delete a form |
| `POST` | `/api/forms/:id/publish` | Publish a form |
| `GET` | `/api/forms/:id/submissions` | List form submissions |

### Forms (Public)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/public/forms/:slug` | Get published form definition |
| `POST` | `/api/public/forms/:slug/submit` | Submit data to a published form |

### Sancio (Authenticated)

Sancio provides a full agreement management workflow:

- **Projects** — Create and manage projects between two parties
- **Agreements** — Define agreements within projects, track status
- **Modules** — Break agreements into signable modules with sequencing
- **Proposals** — Submit and resolve change proposals
- **Signatures** — Digital signature log
- **Notifications** — In-app notification system
- **PDF Verifications** — Verify signed document integrity

## Tech Stack

- **Runtime:** TypeScript, Node.js
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Vercel serverless functions
- **Database:** Supabase (PostgreSQL + row-level security)
- **Email:** Nodemailer (SMTP)

## Security

- **CORS** dynamic origin allowlist — only configured frontends can call the API
- **Input validation** on all endpoints (length limits, format checks, type coercion)
- **Honeypot** field on interest endpoint to catch bots
- **HTML escaping** on all user input in emails
- **Row-level security** — users access only their own data; public can only read published forms
- **JWT authentication** validated server-side
- **Security headers** — nosniff, deny framing

## Documentation

- [User Guide](USER_GUIDE.md)
- [Testing Guide](TESTING_GUIDE.md)
