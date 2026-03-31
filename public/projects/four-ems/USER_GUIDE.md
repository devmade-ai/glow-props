# Four Ems User Guide

A complete walkthrough of every feature in the Four Ems form builder.

---

## Getting Started

### Your Form List

The home page (`/`) shows all your forms. Each card displays the form title, status (Draft or Published), and when it was last updated.

- **New Form** — click the button in the top-right to create a blank form
- **Import** — click to create a form from an AI-generated JSON definition (see [Import a Document](#import-a-document-as-a-form))
- **Example Form** — a read-only sample form is always visible so you can explore the builder without creating anything

Each form card shows a colored left accent bar: green for published, amber for draft, gray for archived. A right-pointing arrow indicates the card is clickable. When the list is empty, an illustration with a direct "Create your first form" button appears.

Click any form card to open it in the builder.

---

## The Form Builder

The builder is where you design your form. On desktop it has three panels; on mobile everything collapses into a single view with bottom sheets.

### Top Bar

| Control | What it does |
|---------|-------------|
| Back arrow | Return to form list |
| Form title | Click to rename your form inline |
| Status badge | Shows Draft or Published |
| Save indicator | "Saving..." while saving, "Saved" when done |
| Responses | Open the response dashboard |
| Embed | Generate embed code for external sites |
| Preview | Full-screen preview of your form |
| Publish / Unpublish | Make your form public or take it offline |

On mobile, Responses, Embed, and Preview are inside a three-dot menu.

### Pages

Forms can have multiple pages. The tab bar below the top bar shows all pages.

- **Add a page** — click the "+" button at the end of the tab bar
- **Rename a page** — double-click a tab name to edit it inline
- **Remove a page** — click the "x" on a tab (you'll be asked to confirm if the page has fields)
- **Page conditions** — pages can be shown or hidden based on answers (see [Conditional Logic](#conditional-logic))

### Adding Fields

**Desktop:** Drag a field type from the left palette onto the canvas, or click it to add to the bottom of the current page.

**Mobile:** Tap the floating "Add field" button in the bottom-right corner. A panel slides up with all field types — tap one to add it.

Fields are grouped into three categories in the palette:

| Category | Field Types |
|----------|------------|
| **Input** | Text, Long Text, Email, Phone, Number, Date |
| **Choice** | Dropdown, Single Choice, Multi Choice, Checkbox, Rating |
| **Layout** | Heading, Hidden |

### Reordering Fields

**Desktop:** Drag fields up and down on the canvas.

**Mobile:** Use the up/down arrow buttons that appear on each field card.

### Editing Field Properties

Click a field on the canvas to select it. The properties panel opens on the right (desktop) or as a bottom sheet (mobile).

Every field has a **Label** and most have a **Required** toggle. Beyond that, properties vary by field type — see [Field Types](#field-types) below.

### Duplicating and Removing Fields

Each field card shows a duplicate button and a remove button. Duplicate creates an identical copy below the original.

### Theme

When no field is selected, the properties panel shows theme options:

- **Primary color** — a color picker that sets the accent color for buttons, focus rings, and selected options
- **Font family** — choose from Inter, System, Sans-serif, Serif, Mono, and others

### Auto-Save

Changes save automatically after 2 seconds of inactivity. The save indicator in the top bar shows the current status. If saving fails, a red banner appears with the error.

---

## Field Types

### Text
Single-line text input. Supports placeholder text and optional validation: minimum length, maximum length, and regex pattern.

### Long Text (Textarea)
Multi-line text area. Same validation as Text, plus a configurable number of rows (default 4).

### Email
Email address input with built-in format validation. Required by default. Supports min/max length.

### Phone
Phone number input. Accepts 7-20 characters of digits, spaces, hyphens, parentheses, and "+". Default placeholder: "+27 12 345 6789".

### Number
Numeric input. Optional bounds: minimum value, maximum value, and step increment.

### Date
Date picker. Optional bounds: earliest date and latest date (both in YYYY-MM-DD format).

### Dropdown (Select)
Single-selection dropdown menu. Configure the list of options (each with a label and value). Supports a custom placeholder.

### Single Choice (Radio)
Radio buttons — the user picks exactly one option. Options can be arranged vertically or horizontally. Displayed as bordered cards that highlight when selected.

### Multi Choice (Checkbox Group)
Multiple checkboxes — the user can pick several options. Vertical or horizontal layout. Optional minimum and maximum number of selections.

### Checkbox
A single checkbox, typically used for consent or terms acceptance. Displays as a styled checkbox with the label beside it.

### Rating
Star or circle rating scale. Configurable maximum rating (3 to 10). Interactive hover preview shows the rating before clicking. Keyboard accessible with arrow keys.

### Heading
Display-only section heading or description. Not submitted with the form. Three sizes: Large (h2), Small (h3), and Description (paragraph text).

### Hidden
Invisible field that submits a value without the user seeing it. Set a default value in properties. Can also be pre-filled via URL query parameters: `/f/your-form?field-name=value`.

---

## Conditional Logic

Any field or page can be shown or hidden based on the user's answers to other fields.

### Setting Up a Condition

1. Select a field (or deselect all fields to edit page-level conditions)
2. In the properties panel, toggle on "Only show this field based on answers"
3. Choose the action: **Show** or **Hide**
4. Add one or more rules:
   - **Source field** — which field's answer to check
   - **Operator** — how to compare
   - **Value** — what to compare against (not needed for "is blank" / "has a value")

### Available Operators

| Operator | Meaning |
|----------|---------|
| is exactly | Value matches exactly |
| is not | Value does not match |
| includes | Value contains the text |
| is blank | Field has no answer |
| has a value | Field has any answer |

Multiple conditions on the same field use AND logic — all must be true.

### How It Affects the Form

- Hidden fields are skipped during validation (users won't get errors for fields they can't see)
- Hidden pages are skipped during navigation
- Conditions evaluate in real-time as the user fills out the form

---

## Publishing

### Making a Form Public

1. Click **Publish** in the builder top bar
2. The form status changes to Published
3. A green banner appears with the live URL (e.g., `https://yoursite.com/f/your-form-slug`)
4. Click "Copy link" to copy the URL to your clipboard

### Taking a Form Offline

Click **Unpublish** to revert to Draft status. The public URL will stop working.

---

## Previewing Your Form

Click **Preview** in the builder to open a full-screen preview.

- All pages are shown stacked vertically
- Hidden pages appear at reduced opacity with a "Hidden by conditions" label
- Hidden fields appear at reduced opacity with a "Hidden" label
- The form is fully interactive — you can fill it out to test conditional logic

---

## Embedding Forms

Click **Embed** in the builder to open the embed dialog.

### Auto-resize (Recommended)

Paste this code into your website. The form automatically adjusts its height as the user fills it out:

```html
<div data-fourems-form="your-slug"></div>
<script src="https://yoursite.com/embed.js"></script>
```

### Simple Embed

A plain iframe for sites with restrictive content management systems. You may need to adjust the height manually:

```html
<iframe src="https://yoursite.com/f/your-slug?embed=1"
  width="100%" height="600" frameborder="0"
  style="border: none;" title="Form"
  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"></iframe>
```

Click "Copy code" to copy either snippet to your clipboard.

---

## Import a Document as a Form

Convert an existing questionnaire or document into a form using AI.

1. Click **Import** on the form list page
2. **Step 1:** Copy the format instructions to your clipboard
3. Paste those instructions plus your document into an AI assistant (e.g., ChatGPT, Claude) and ask it to convert the document to the specified JSON format
4. **Step 2:** Paste the AI-generated JSON into the import dialog (or upload as a file, up to 5 MB)
5. The system validates the JSON and shows any errors or warnings
6. Give your form a name and click **Create Form**

The new form opens in the builder as a Draft.

---

## Response Dashboard

Open the dashboard by clicking **Responses** in the builder, or navigate to `/forms/:id/responses`.

### Viewing Submissions

The table shows all submissions with:
- Status badge (New, Read, or Archived)
- Submission date
- Preview of the first few field values

### Filtering

Use the filter buttons above the table to show All, New, Read, or Archived submissions. Each button shows a count.

### Sorting

Click column headers to sort by submission date or status. Click again to reverse the sort direction.

### Submission Detail

Click any row to open the detail panel. It shows:
- Full submission date and time
- Current status
- Every field label and its submitted value
- Action buttons to change status (Mark as Read, Archive, Restore)

### Exporting

Click **Export CSV** to download all submissions as a CSV file. The file includes submission date, status, and all field values.

---

## Installing as an App (PWA)

Four Ems can be installed as a standalone app on your device.

### Chrome, Edge, or Brave
An install banner appears automatically. Click **Install** to add the app to your device.

### Safari (iOS)
Tap the Share button, then tap **Add to Home Screen**, then tap **Add**.

### Safari (macOS)
Go to File, then click **Add to Dock**.

### Firefox (Android)
Tap the three-dot menu, then tap **Install**.

If you dismiss the install prompt, it won't appear again (stored in your browser).

### Updates

The app checks for updates every hour. When an update is available, a banner appears prompting you to reload.

---

## Confirmation Dialogs

Destructive actions (removing a field, removing a page with fields) show a styled confirmation dialog instead of a browser popup. The dialog clearly states what will happen and gives you Cancel / Remove buttons. Press Escape or click outside the dialog to cancel.

---

## Tips

- **Use headings** to break long forms into logical sections
- **Use page breaks** for multi-step forms — each page gets its own screen
- **Test conditional logic** in Preview mode before publishing
- **Hidden fields** are useful for tracking where submissions come from (use URL parameters)
- **Export regularly** if you need offline records of submissions
