# User Guide

## Overview

Tool Till Tees is a utilities API hosted on Vercel. It provides backend services for:
1. **Interest/contact form** — lets visitors on your CV site send you a message via email
2. **Form builder API** ("Four Ems") — create, manage, and publish custom forms with submissions stored in a database
3. **Agreement management API** ("Sancio") — two-party contract workflows with projects, agreements, modules, proposals, signatures, and notifications

## Landing Page

The root URL (`/`) shows a minimal status page with:
- The project name
- An API health indicator (green = online, red = unreachable)
- A link to the See Veo app

## API Endpoints

### General

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api` | Root status with API name |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/send-interest` | Submit a contact message (name, email, message) |

**How it works:** A visitor fills out a form on your CV site. The form POSTs to `/api/send-interest`. The API validates the input, checks the honeypot field, and sends an email to your inbox via SMTP.

### Forms (Authenticated)

Authenticated endpoints require a valid JWT token.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/forms` | List your forms (newest first) |
| `POST` | `/api/forms` | Create a new form |
| `GET` | `/api/forms/:id` | Get a single form |
| `PUT` | `/api/forms/:id` | Update a form (title, definition, status, settings) |
| `DELETE` | `/api/forms/:id` | Delete a form and all its submissions |
| `POST` | `/api/forms/:id/publish` | Publish a form |
| `GET` | `/api/forms/:id/submissions` | List all submissions for a form (newest first) |
| `PUT` | `/api/submissions/:id` | Update submission status (new, read, archived) |

### Forms (Public)

No authentication required. Only returns published forms.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/public/forms/:slug` | Get a published form's definition and public settings |
| `POST` | `/api/public/forms/:slug/submit` | Submit data to a published form |

## Form Builder Concepts

### Form Structure
- A **form** has one or more **pages**
- Each page has a **title** and a list of **fields**
- Fields support 13 types: text, textarea, email, phone, number, select, radio, checkbox_group, checkbox, date, rating, heading, hidden

### Conditional Fields
- Fields can be shown/hidden based on other field values
- Conditions support operators: equals, not_equals, contains, not_contains, greater_than, less_than, is_empty, is_not_empty, in, not_in
- Conditions can be combined with AND/OR logic
- Conditions are evaluated server-side during submission — hidden fields are silently stripped

### Form Lifecycle
1. **Draft** — form is being built, not publicly accessible
2. **Published** — form is live, accessible via public URL, can receive submissions
3. **Archived** — form is hidden from public but preserved in the database

### Settings
- `notification_emails` — email addresses to notify on new submissions
- `confirmation_message` — message shown to submitters after completion
- `redirect_url` — optional URL to redirect to after submission
- `collect_metadata` — whether to collect submission metadata (default: true)

### Submissions
- Each submission stores sanitized field values, metadata, and status
- Submission statuses: `new` → `read` → `archived`
- Submissions are only accessible to the form owner via authenticated endpoints

## Security

- **CORS** dynamic origin allowlist — only configured frontends can call the API
- **Security headers** — nosniff, deny framing
- **Input validation** on all endpoints (length limits, format checks, type validation)
- **Honeypot** field on interest endpoint to catch bots
- **HTML escaping** on all user input in emails
- **Row-level security** — users can only access their own forms; public can only read published forms and submit to them
- **JWT authentication** validated server-side
- **Data sanitization** — form submissions are validated and stripped of hidden/extra fields before storage

## Sancio Agreement Management

Sancio is a two-party agreement management system. All endpoints are under `/api/sancio/` and require authentication.

### Core Concepts

- **Project** — a workspace shared between a creator and a counterparty. The creator invites the counterparty via a passphrase-protected link.
- **Agreement** — a named container within a project, holding one or more modules. Has a lifecycle: requested → draft → in_progress → fully_agreed → reopened.
- **Module** — an individual clause or section within an agreement. Each module is independently signable. When both parties mark ready, the module auto-locks.
- **Proposal** — a suggested change to module content, submitted by one party and resolved (accepted/rejected/countered) by the other.
- **Note** — a freeform annotation on an agreement or module, with source tracking.
- **Notification** — in-app alerts for actions like proposals received, modules signed, agreements split, etc.

### Workflow

1. Creator creates a project and invites a counterparty (sends a passphrase-protected link via email)
2. Counterparty verifies the passphrase to join the project
3. Either party can create agreements and add modules
4. Parties negotiate module content via proposals
5. When both parties mark a module as ready-to-sign, it auto-locks
6. Sequence approval: both parties must approve the module ordering
7. When all modules are signed and sequence is approved, the agreement reaches "fully agreed"
8. PDF verifications can be generated with a unique code and content snapshot hash
