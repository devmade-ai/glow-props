# Testing Guide

## Overview

Manual test scenarios for verifying Sancio works correctly. Run through these after making changes.

## Test Scenarios

### Scenario: Login Flow

**Steps:**
1. Open the app (not logged in)
2. Verify you're redirected to the login page
3. Click "Sign in with Google"
4. Verify you're redirected to the projects list

**Expected result:** Successfully "logged in" and see the projects page.

### Scenario: Project CRUD

**Steps:**
1. Click "New project"
2. Try submitting with an empty name — should show error
3. Enter a name and description, click "Create project"
4. Verify toast "Project created" appears
5. Verify the new project appears in the list
6. Click into the project
7. Click "Edit", change the title, click "Save"
8. Verify the title is updated
9. Click "Delete", confirm in the dialog
10. Verify you're redirected to the projects list and the project is gone

**Expected result:** Full create, read, update, delete cycle works.

### Scenario: Agreement CRUD

**Prerequisites:** At least one project exists.

**Steps:**
1. Click into a project
2. Click "New agreement"
3. Enter a title, click "Create agreement"
4. Verify toast "Agreement created" appears
5. Click into the agreement
6. Click "Edit", change the title, click "Save"
7. Click "Delete", confirm
8. Verify you're back at the project detail and the agreement is gone

**Expected result:** Full agreement CRUD within a project.

### Scenario: Module CRUD

**Prerequisites:** At least one agreement exists.

**Steps:**
1. Click into an agreement
2. Click "Add module"
3. Select "Scope of Work" template
4. Verify toast "Module added" appears and module appears in the list
5. Click "Add module" again, choose "Blank module"
6. Verify an "Untitled Module" is added
7. Click on a module to open the editor
8. Change the title and content
9. Click "Save" — verify "Saved" confirmation appears
10. Click "Back to agreement"
11. Verify the module title is updated in the list

**Expected result:** Modules can be created from templates or blank, edited, and saved.

### Scenario: Module Reorder

**Prerequisites:** Agreement with 3+ modules.

**Steps:**
1. Note the current order of modules
2. Click the down arrow on the first module
3. Verify it swapped positions with the second module
4. Click the up arrow on the (now second) module
5. Verify it moved back to the first position
6. Verify the up arrow is disabled on the first module
7. Verify the down arrow is disabled on the last module

**Expected result:** Modules can be reordered with up/down arrows.

### Scenario: Delete Confirmation

**Steps:**
1. Click "Delete" on any module, agreement, or project
2. Verify a confirmation dialog appears with the item name
3. Click "Cancel" — verify nothing was deleted
4. Click "Delete" again, then confirm
5. Verify the item is removed

**Expected result:** All deletes require confirmation and can be cancelled.

### Scenario: Data Persistence

**Steps:**
1. Create a project, agreement, and module
2. Refresh the page (F5)
3. Verify all data is still present
4. Log out, then log back in
5. Verify data is still present

**Expected result:** Data persists across page refreshes via Supabase.

### Scenario: Mobile Responsiveness

**Steps:**
1. Open browser DevTools, set viewport to 375px wide
2. Navigate through: login → projects → project detail → agreement → module editor
3. Verify all text is readable, buttons are tappable, nothing overflows
4. Verify modals don't touch screen edges
5. Verify breadcrumbs scroll horizontally if needed

**Expected result:** All pages are usable on a 375px mobile viewport.

### Scenario: Empty States

**Steps:**
1. Log in with a fresh account (or one with no projects)
2. Verify "No projects yet" empty state shows
4. Create a project, click into it
5. Verify "No agreements yet" empty state shows
6. Create an agreement, click into it
7. Verify "No modules yet" empty state shows

**Expected result:** All list pages show helpful empty states with create actions.

### Scenario: Role Detection

**Steps:**
1. Log in and create a project — you are the Creator
2. Verify you see Creator-only controls (Edit, Delete, New agreement, Add module)
3. Open a project where you were invited as counterparty
4. Verify you see Counterparty UI (read-only, Propose change, Request agreement)

**Expected result:** Role is determined per project based on account, not a manual toggle.

### Scenario: Counterparty Invite Flow

**Prerequisites:** In the Creator's browser.

**Steps:**
1. Create a new project
2. Click into the project
3. Verify "No counterparty invited" banner with "Invite" button
4. Click "Invite"
5. Try submitting with empty fields — should show errors
6. Try submitting with invalid email — should show error
7. Try submitting with passphrase under 4 chars — should show error
8. Enter valid email and passphrase, click "Send invitation"
9. Verify toast "Invitation sent" appears
10. Verify banner changes to "Waiting for counterparty" with the email shown

**Expected result:** Invitation form validates inputs and saves counterparty email.

### Scenario: Handshake Acceptance

**Prerequisites:** Project with counterparty invited (from above scenario).

**Steps:**
1. Log in as the counterparty (use a second browser or incognito window)
2. Open the project (should appear in counterparty's project list)
3. Verify "Handshake pending" banner with "Accept handshake" button
4. Click "Accept handshake"
5. Verify toast "Handshake accepted" appears
6. Verify banner changes to "Handshake complete" with date

**Expected result:** Counterparty can accept handshake, status updates for both parties.

### Scenario: Agreement Request by Counterparty

**Prerequisites:** Project with completed handshake, logged in as Counterparty.

**Steps:**
1. Open the project
2. Verify "Request agreement" button is visible (not "New agreement")
3. Click "Request agreement"
4. Enter a title and optional description
5. Click "Request agreement"
6. Verify toast "Agreement requested" appears
7. Verify the agreement appears with purple "Requested" badge
8. Switch to the Creator's browser
9. Open the same project
10. Verify the agreement shows "Requested by counterparty" text and "Accept request" button
11. Click "Accept request"
12. Verify toast "Agreement request accepted" appears
13. Verify the status changes to "Draft"

**Expected result:** Counterparty can request agreements, creator can accept them.

### Scenario: Proposal Flow

**Prerequisites:** Agreement with at least one module, handshake complete.

**Steps:**
1. Switch to the Counterparty's browser
2. Open an agreement, click on a module
3. Verify read-only view with "Propose change" button
4. Click "Propose change"
5. Edit the content, click "Submit proposal"
6. Verify toast "Proposal submitted" appears
7. Verify proposal appears below with "Pending" badge
8. Verify "Waiting for the other party..." message shows
9. Switch to the Creator's browser
10. Open the same module
11. Verify the proposal appears below the editor with Accept/Counter/Reject buttons
12. Verify the module card in the agreement list shows "Proposal pending" amber badge
13. Click "Accept" on the proposal
14. Verify toast "Proposal accepted" confirms
15. Verify the module content has been updated to match the proposal

**Expected result:** Full propose → review → accept cycle works.

### Scenario: Counter-Proposal Flow

**Prerequisites:** Module with a pending proposal (from Counterparty).

**Steps:**
1. As Creator, open the module with a pending proposal
2. Click "Counter" on the proposal
3. Edit the content in the counter-proposal modal
4. Click "Submit counter"
5. Verify toast "Counter-proposal sent" appears
6. Verify the original proposal status changes to "Countered"
7. Verify a new pending proposal appears (from Creator)
8. Switch to the Counterparty's browser
9. Verify you can see both proposals — the countered one and the new pending one

**Expected result:** Counter-proposals resolve the original and create a new one.

### Scenario: Counterparty View Restrictions

**Prerequisites:** In the Counterparty's browser.

**Steps:**
1. Open a project
2. Verify no "Edit" or "Delete" buttons on the project header
3. Verify no "New agreement" button (only "Request agreement" if handshake is complete)
4. Open an agreement
5. Verify no "Edit", "Delete", or "Add module" buttons
6. Open a module
7. Verify read-only view (no editable fields)
8. Verify "Propose change" button is present
9. Verify no reorder arrows or delete buttons on module cards

**Expected result:** Counterparty sees read-only UI with propose capability only.

### Scenario: Creator View (Unchanged)

**Prerequisites:** In the Creator's browser.

**Steps:**
1. Verify all original Phase 1 functionality still works:
   - Create/edit/delete projects
   - Create/edit/delete agreements
   - Add/edit/reorder/delete modules
2. Verify new handshake section appears on project detail
3. Verify proposals appear below module editor when present

**Expected result:** Creator retains all original capabilities plus new Phase 2 features.

### Scenario: Ready to Sign Flow

**Prerequisites:** Agreement with at least one module, handshake complete.

**Steps:**
1. As Creator, open a module
2. Verify the "Signing" section appears at the bottom of the editor
3. Click "Mark as ready to sign"
4. Verify the button changes to "Ready to sign" (primary style)
5. Verify the module card in the agreement list shows a blue "Ready" badge
6. Switch to the Counterparty's browser
7. Open the same module
8. Verify you see "Creator marked as ready to sign" status
9. Click "Mark as ready to sign"
10. Verify both signatures are recorded (auto-lock)
11. Verify module card shows green "Signed" badge
12. Verify signing status shows "Signed by both parties" with date

**Expected result:** Ready-to-sign toggle works for both parties, auto-locks when both mark ready.

### Scenario: Module Amendment (Signed Module Edit)

**Prerequisites:** A signed module (both parties have signed).

**Steps:**
1. As Creator, open the signed module
2. Verify "Signed by both parties" status banner appears
3. Verify the save button shows "Save (will invalidate signatures)" when changes are made
4. Edit the module content
5. Click the save button
6. Verify signatures are invalidated (signing status disappears)
7. Scroll down to Version history
8. Verify the previous version appears with its signature state
9. Verify the module version number incremented

**Expected result:** Editing a signed module creates version history and resets signatures.

### Scenario: Batch Signing

**Prerequisites:** Agreement with 3+ unsigned modules.

**Steps:**
1. Open the agreement page
2. Click "Batch sign"
3. Verify the batch selection panel appears
4. Click "Select all" — verify all modules are checked
5. Uncheck one module
6. Click "Mark N as ready to sign"
7. Verify toast confirmation appears
8. Verify selected module cards show "Ready" badges
9. Click "Cancel" to close batch mode

**Expected result:** Multiple modules can be marked as ready in one action.

### Scenario: Notes System

**Prerequisites:** At least one agreement exists.

**Steps:**
1. Open an agreement
2. Scroll to the "Notes" section
3. Verify "No notes yet" message shows
4. Click "Add note"
5. Try submitting empty — should show error
6. Type a note, select "WhatsApp" as source
7. Click "Add note"
8. Verify toast "Note added" appears
9. Verify the note appears with "WhatsApp" source badge and timestamp
10. Click "Delete" on the note
11. Verify the note is removed

**Expected result:** Notes can be added with source tags, viewed, and deleted.

### Scenario: Module-Level Notes

**Prerequisites:** Agreement with at least one module.

**Steps:**
1. Open a module
2. Scroll to the "Notes" section
3. Click "Add note"
4. Enter a note with "Phone call" source
5. Click "Add note"
6. Verify the note appears on the module page
7. Return to the agreement page
8. Verify agreement-level notes show separately

**Expected result:** Notes can be attached at module level distinct from agreement level.

### Scenario: Version History

**Prerequisites:** A module that has been signed and then amended.

**Steps:**
1. Open the amended module
2. Scroll to "Version history" section
3. Verify current version is labeled "(current)" with its signature state
4. Verify previous version(s) appear below with their content preview and signature badges
5. Verify versions are numbered correctly

**Expected result:** Version history shows all previous versions with signature states.

### Scenario: Sequence Sign-Off

**Prerequisites:** Agreement where ALL modules are signed by both parties.

**Steps:**
1. Open the agreement
2. Verify the "Sequence sign-off" section appears (blue panel)
3. Verify it says "All modules have been signed"
4. Click "Approve sequence" (as Creator)
5. Verify "Creator approved" indicator appears
6. Verify "Waiting for the other party..." message shows
7. Switch to the Counterparty's browser
8. Click "Approve sequence"
9. Verify the agreement status changes to "Fully agreed" (green badge)
10. Verify the panel changes to "Agreement fully signed" with date

**Expected result:** Both parties must approve sequence for agreement to become fully agreed.

### Scenario: PDF Preview

**Prerequisites:** Agreement with at least one module.

**Steps:**
1. Open an agreement
2. Click the "PDF" button in the header
3. Verify the PDF preview modal opens
4. Verify agreement title, description, and status are shown
5. Verify all modules are listed with numbering, content, and signature state
6. Click "Generate verification code"
7. Verify a verification code appears (8-character alphanumeric)
8. Verify SHA-256 hash prefix is displayed
9. Click "Print / Save as PDF"
10. Verify browser print dialog opens
11. Close the modal

**Expected result:** PDF preview shows agreement content, verification code can be generated.

### Scenario: Agreement Splitting

**Prerequisites:** Agreement with 3+ modules (as Creator).

**Steps:**
1. Open an agreement
2. Verify "Split" button appears in header
3. Click "Split"
4. Verify the split form shows with title input and module checkboxes
5. Try submitting without title — should not submit
6. Enter a title
7. Try submitting without selecting modules — should not submit
8. Select 2 modules
9. Click "Split modules"
10. Verify toast "Split 2 modules into ..." appears
11. Navigate back to the project
12. Verify a new agreement exists with the split title
13. Open the new agreement and verify it contains copies of the selected modules (unsigned)

**Expected result:** Selected modules are copied into a new agreement with reset signatures.

### Scenario: Nudge & Expiry Configuration

**Prerequisites:** Agreement with a module (as Creator).

**Steps:**
1. Open a module as Creator
2. Scroll to "Nudge & expiry" section
3. Verify it shows "Nudge after 30 days" (default)
4. Click "Configure"
5. Verify the modal opens with current values
6. Change nudge days to 14
7. Enable auto-expire checkbox
8. Click "Save settings"
9. Verify toast "Settings saved" appears
10. Verify the section now shows "Nudge after 14 days · Auto-expire enabled"

**Expected result:** Nudge period and auto-expire can be configured per module.

### Scenario: Agreement Status Management

**Prerequisites:** A draft agreement (as Creator).

**Steps:**
1. Open a draft agreement
2. Verify "Start" button appears in header
3. Click "Start"
4. Verify toast "Agreement marked as in progress" appears
5. Verify blue "In progress" badge appears
6. (Complete signing and sequence approval to get to "Fully agreed")
7. Verify "Reopen" button appears
8. Click "Reopen"
9. Verify toast "Agreement reopened" appears
10. Verify amber "Reopened" badge appears

**Expected result:** Creator can transition agreement through lifecycle states.

### Scenario: Notification Bell

**Steps:**
1. Verify bell icon appears in header
2. Click the bell icon
3. Verify notification panel opens (may show "No notifications")
4. Click outside the panel — verify it closes
5. Click the bell again to reopen

**Expected result:** Notification panel opens/closes correctly.

### Scenario: Signature Log

**Prerequisites:** A module that has been signed (ready-to-sign toggle used).

**Steps:**
1. Open the module
2. Scroll to "Signature log" section
3. Verify log entries appear with action label, IP address, and timestamp
4. Verify entries are in reverse chronological order

**Expected result:** Signing actions are logged with metadata.

### Scenario: Error Boundary

**Steps:**
1. (For testing, you can temporarily add `throw new Error('test')` in a component render)
2. Verify the error boundary catches the error
3. Verify "Something went wrong" message appears
4. Click "Try again" — verify the component attempts to re-render
5. Click "Refresh page" — verify browser reloads

**Expected result:** Render errors are caught and shown with recovery options.

### Scenario: Offline Indicator

**Steps:**
1. Open browser DevTools → Network tab
2. Toggle "Offline" mode
3. Verify amber "You are currently offline" banner appears at top
4. Toggle back to online
5. Verify the banner disappears

**Expected result:** Offline status is shown and auto-clears when online.

### Scenario: Multi-Word Intent Labels

**Prerequisites:** Agreement with at least one module (as Creator).

**Steps:**
1. Open a module in the editor
2. Verify 8 default intent labels appear: obligation, permission, restriction, definition, condition, declaration, process, remedy
3. Type "force majeure" in the custom intent input
4. Click "Add"
5. Verify the label is accepted and appears as a pill
6. Type "pro rata" and press Enter
7. Verify it's accepted
8. Try typing a label with special characters like "test@123" — should show "Letters, spaces, and hyphens only" error
9. Verify intent pills display on the module card in the agreement list

**Expected result:** Multi-word intent labels (including Latin phrases) are accepted and displayed.

### Scenario: Module Summaries (Creator)

**Prerequisites:** Agreement with at least one module (as Creator).

**Steps:**
1. Open a module in the editor
2. Scroll to the "Plain-language summary" collapsible section
3. Click to expand
4. Verify three fields appear: "What this does", "When this matters", "If not followed"
5. Fill in the first field with "Requires Supplier to maintain insurance"
6. Click outside the field (blur)
7. Verify the field saves (no explicit save button needed)
8. Fill in the other two fields
9. Navigate back to the agreement
10. Verify the module card shows the "What this does" text instead of the content preview
11. Re-open the module — verify all three summary fields still have their values

**Expected result:** Summary fields save on blur and display on module cards.

### Scenario: Module Summaries (Counterparty)

**Prerequisites:** Module with at least one summary field filled (from above).

**Steps:**
1. Switch to the Counterparty's browser
2. Open the module
3. Verify the summary card appears above the content, showing only populated fields
4. Verify fields with no value are not shown (no "Not described yet" clutter)
5. Verify the summary is read-only (no edit capability)

**Expected result:** Counterparty sees populated summary fields in a clean card above content.

## Regression Checklist

Quick checks to run after any change:

- [ ] App loads without console errors
- [ ] Login/logout works
- [ ] Role is correctly detected per project (Creator vs Counterparty)
- [ ] Can create a project (as Creator)
- [ ] Can invite counterparty with email and passphrase
- [ ] Handshake status displays correctly for both roles
- [ ] Counterparty can accept handshake
- [ ] Can create an agreement (as Creator)
- [ ] Counterparty can request an agreement
- [ ] Creator can accept agreement requests
- [ ] Can add a module from template
- [ ] Can edit and save a module (as Creator)
- [ ] Counterparty sees read-only module view
- [ ] Can submit a proposal (as Counterparty)
- [ ] Can accept/reject/counter proposals (as Creator)
- [ ] Can reorder modules (as Creator)
- [ ] Can delete a module (with confirmation, as Creator)
- [ ] Can mark a module as ready to sign (both roles)
- [ ] Auto-lock works when both parties mark ready
- [ ] Editing a signed module invalidates signatures and creates version history
- [ ] Batch sign selects and marks multiple modules
- [ ] Can add/delete notes on agreements and modules
- [ ] Note source tagging works (in-app, email, WhatsApp, phone, in-person, other)
- [ ] Version history displays correctly for amended modules
- [ ] Sequence sign-off appears when all modules are signed
- [ ] Both parties approving sequence → agreement fully agreed
- [ ] Module cards show Signed/Ready badges correctly
- [ ] Data persists on refresh
- [ ] Data loads correctly from Supabase on login
- [ ] PDF preview opens with correct content
- [ ] Verification code generates successfully
- [ ] Agreement splitting creates new agreement with copied modules
- [ ] Nudge & expiry config saves and displays correctly
- [ ] Agreement status transitions work (Start, Reopen)
- [ ] Notification bell opens/closes correctly
- [ ] Signature log entries appear after signing actions
- [ ] Error boundary catches render errors gracefully
- [ ] Offline indicator appears when network is disconnected
- [ ] Mobile layout doesn't break at 375px
- [ ] Multi-word intent labels are accepted (e.g. "force majeure")
- [ ] 8 default intent labels display correctly
- [ ] Module summary fields save on blur (creator)
- [ ] Module summary card shows for counterparty (populated fields only)
- [ ] Module card shows summary_does instead of content preview when available
- [ ] `npm run build` succeeds
