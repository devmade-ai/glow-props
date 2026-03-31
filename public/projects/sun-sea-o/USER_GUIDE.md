# Sancio User Guide

## What is Sancio?

Sancio is an agreement tool built on the idea that agreements don't happen all at once. Instead of negotiating one large document, you build agreements from smaller, independent text modules. Each module can be authored, negotiated, and signed on its own. The full agreement comes together over time as modules are added and agreed upon.

## Getting Started

1. Open the app and click **Sign in with Google**
2. You'll see your **Projects** page — this is your home screen

## Roles

Your role is determined per project:

- **Creator** — The project owner who creates projects, agreements, and modules
- **Counterparty** — The invited party who views, proposes changes, and requests agreements

Your role is assigned automatically based on whether you created the project or were invited as the counterparty. There is no manual toggle — the app knows your role from your account.

## Core Concepts

### Projects

A project is a container for agreements between two parties. Create a project for each client or business relationship.

- Click **New project** to create one (creator only)
- Give it a name and optional description
- Click into a project to see its agreements
- Project cards show **Active** (handshake complete) or **Pending** (waiting for counterparty) status

### Inviting a Counterparty

After creating a project, invite the other party:

1. Open a project and find the **handshake status** section
2. Click **Invite** to open the invitation form
3. Enter the counterparty's email address
4. Set a shared passphrase — this is a secret word or phrase the counterparty needs to verify their identity
5. Share the passphrase separately (e.g. via WhatsApp, phone, or in person)

### Handshake

The handshake is a signed record that both parties intend to work together:

- **Creator** — Automatically signed when the project is created
- **Counterparty** — Sees a "Handshake pending" banner and clicks **Accept handshake** to join
- Once both have accepted, the status shows **Handshake complete** with the acceptance date

The handshake must be complete before the counterparty can request agreements.

### Agreements

An agreement lives inside a project. It's a collection of ordered text modules that together form the full agreement.

- **Creator:** Click **New agreement** to create one
- **Counterparty:** Click **Request agreement** to ask the creator to build one (appears after handshake)
- The creator can **Accept request** on requested agreements to convert them to drafts

#### Agreement Statuses

- **Requested** (purple) — Counterparty requested this; creator needs to accept
- **Draft** (grey) — Just created, modules being added
- **In progress** (blue) — Actively being negotiated
- **Fully agreed** (green) — All modules signed, sequence approved
- **Reopened** (amber) — Previously agreed, now being amended

### Modules

A module is a self-contained section of an agreement. Each module has a title and plain-text content.

- Click **Add module** to add one (creator only)
- Choose from a **starter template** or create a **blank module**
- Click a module to open the editor (creator) or read-only viewer (counterparty)
- Use the **up/down arrows** to reorder modules (creator only)
- Modules with pending proposals show an amber **Proposal pending** badge

### Intent Labels

Each module can have up to 2 intent labels that categorize what the clause does:

- **Built-in labels:** obligation, permission, restriction, definition, condition, declaration, process, remedy
- **Custom labels:** Type any label — multi-word phrases like "force majeure", "pro rata", or "only applies when" are supported (up to 60 characters)
- Click a label to select it, click again to deselect
- Intent labels appear as colored pills on module cards and the module viewer

### Plain-Language Summaries

The creator can add plain-language descriptions to help both parties understand a module at a glance:

1. Open a module as Creator
2. Click **Plain-language summary** to expand the section
3. Fill in any or all of the three fields:
   - **What this does** — The main action or obligation
   - **When this matters** — When the clause applies
   - **If not followed** — What happens if the clause is breached
4. Each field saves automatically when you click away (max 200 characters each)
5. The counterparty sees these summaries above the clause content in their read-only view
6. In the agreement's module list, the "What this does" summary replaces the content preview

### Signing Modules

Each module can be independently signed by both parties:

1. When you're satisfied with a module, click **Mark as ready to sign**
2. The button changes to **Ready to sign** to show your status
3. When the other party also marks it as ready, the module **auto-locks** — both signatures are recorded
4. A green **Signed** badge appears on the module card
5. Signed modules show a shield icon with the signing date

**Amendment:** If a signed module needs changes, the creator can still edit it. Saving changes to a signed module will:
- Invalidate both signatures
- Create a version history entry for the previous state
- Both parties will need to re-sign

**Batch signing:** On the agreement page, click **Batch sign** to select multiple modules and mark them all as ready at once.

### Version History

When a signed module is amended, the previous version is saved:

- Open a module and scroll down to see the **Version history** section
- Each version shows its content preview and which parties had signed it
- The current version is always shown at the top

### Notes

Add notes to any agreement or module to record discussions:

1. Click **Add note** on an agreement or module page
2. Write your note and select the **source** (where this discussion happened):
   - In-app, Email, WhatsApp, Phone call, In person, Other
3. Optionally select a **tone** to convey the note's intent (e.g., clarification, concern, suggestion, firm, supportive, urgent). You can select up to 2 tones, including custom ones.
4. Click **Add note** to save
5. Notes appear in reverse chronological order with tone pills displayed alongside the source badge
6. You can delete your own notes

### Sequence Sign-Off

When all modules in an agreement are signed, the **sequence sign-off** section appears:

1. Review the final module order
2. Click **Approve sequence** to sign off on the arrangement
3. When both parties approve, the agreement status changes to **Fully agreed**

This confirms both parties agree not just on module content, but on the module order.

### PDF Preview & Verification

Generate a printable preview of the full agreement:

1. Open an agreement that has at least one module
2. Click the **PDF** button in the header
3. The preview shows all modules with their content, signing status, and version numbers
4. Click **Print / Save as PDF** to use your browser's print dialog
5. Click **Generate verification code** to create a tamper-proof verification code
6. The verification code is a SHA-256 hash of the agreement and module content, displayed with an 8-character alphanumeric code

### Splitting Agreements

Split modules from one agreement into a new agreement:

1. Open an agreement with 2 or more modules (creator only)
2. Click the **Split** button in the header
3. Enter a title for the new agreement
4. Check the modules you want to move to the new agreement (you cannot select all modules)
5. Click **Split modules**
6. A new agreement is created with copies of the selected modules (signatures are reset)

### Nudge & Expiry Settings

Configure reminders and auto-expiry per module (creator only):

1. Open a module as Creator
2. Scroll to the **Nudge & expiry** section
3. Click **Configure**
4. Set the **Nudge after (days)** value — a reminder will be sent if the module remains unsigned for this long
5. Optionally enable **Auto-expire** — the module will be marked as expired after the nudge period plus 7 days
6. Click **Save settings**

### Agreement Status Management

Manage the lifecycle of an agreement:

- **Start** (creator only) — Move a draft agreement to "In progress" status
- **Reopen** (creator only) — Reopen a fully agreed agreement for amendments

### Notifications

The notification bell in the header shows in-app notifications:

1. Click the **bell icon** to open the notification panel
2. Unread notifications show a red badge count
3. Click a notification to mark it as read and navigate to the relevant item
4. Click **Mark all read** to clear all unread badges
5. Click the **X** button to delete a notification

### Signature Log

Every signing action is logged with metadata:

1. Open a module and scroll to the **Signature log** section
2. Each entry shows:
   - The action performed (e.g., "Marked as ready to sign", "Module auto-signed")
   - IP address and browser information
   - Timestamp

### Error Handling

If something goes wrong, the app shows a friendly error screen:

- Click **Try again** to attempt recovery
- Click **Refresh page** to reload the app
- Your data is safe in the cloud

### Offline Indicator

When your internet connection drops, an amber bar appears at the top of the screen:

- The bar shows "You are currently offline. Changes will be saved locally."
- It disappears automatically when the connection is restored

### Starter Templates

When adding a module, you can choose from these templates that pre-fill helpful structure:

- **Scope of Work** — What work will be performed
- **Payment Terms** — Amounts, schedule, and methods
- **Timeline** — Milestones and deadlines
- **Confidentiality** — What must be kept confidential
- **Deliverables** — What will be delivered and acceptance criteria
- **Termination** — Conditions for ending the agreement

### Proposals

The counterparty can propose changes to any module's content:

1. Open a module (as counterparty) to see the read-only view
2. Click **Propose change**
3. Edit the content to reflect your suggested changes
4. Click **Submit proposal**
5. The creator sees the proposal below the module editor

The creator can respond to proposals in three ways:
- **Accept** — The module content is updated to match the proposal
- **Reject** — The proposal is dismissed
- **Counter** — The creator edits the proposal and sends it back

Each party can see the full history of proposals on a module.

## Editing

### Editing Projects and Agreements

- Click the **Edit** button next to a project or agreement title (creator only)
- Modify the name and description inline
- Click **Save** to keep changes or **Cancel** to discard

### Editing Modules

- **Creator:** Click a module to open the full editor. Edit title and content, click **Save**
- **Counterparty:** Click a module to see a read-only view. Click **Propose change** to suggest edits
- A "Saved" confirmation appears briefly after saving
- Click **Back to agreement** to return

## Deleting

All delete actions require confirmation (creator only):

- **Delete a module** — Click the Delete button on the module card
- **Delete an agreement** — Click Delete in the agreement header
- **Delete a project** — Click Delete in the project header (this removes all its agreements too)

## Data Storage

All data is stored securely in the cloud via Supabase (PostgreSQL). This means:
- Data syncs across devices — sign in from any browser and see your projects
- Data persists even if you clear your browser
- Real-time updates — changes made by the other party appear automatically
