# Testing Guide

Step-by-step manual test scenarios for verifying Four Ems works correctly.

---

## Scenario 1: Create a New Form

**Steps:**
1. Go to the home page (`/`)
2. Click "New Form"
3. Verify the builder opens with an empty canvas (Page 1, no fields)
4. Click the form title in the top bar and rename it to "Test Form"
5. Wait 2 seconds for auto-save

**Expected:**
- Builder loads with three panels (desktop) or single panel with FAB (mobile)
- Title updates inline
- Save indicator shows "Saving..." then "Saved"

---

## Scenario 2: Add and Configure Fields

**Steps:**
1. From the field palette, add one of each field type: Text, Long Text, Email, Phone, Number, Date, Dropdown, Single Choice, Multi Choice, Checkbox, Rating, Heading, Hidden
2. Click each field to open its properties panel
3. Set a label for each field
4. Toggle "Required" on the Text field
5. For Dropdown: add 3 options (label + value pairs)
6. For Single Choice: add 3 options, set layout to Horizontal
7. For Rating: set max rating to 7, icon style to Circle
8. For Heading: set size to Description
9. For Hidden: set a default value

**Expected:**
- Each field appears on the canvas with correct icon and label
- Properties panel shows type-specific controls
- Required fields show an asterisk on the canvas
- Options appear in choice fields
- Rating shows correct number of icons
- Auto-save triggers after each change

---

## Scenario 3: Reorder and Duplicate Fields

**Steps:**
1. With multiple fields on the canvas, drag a field to a new position (desktop) or use up/down arrows (mobile)
2. Click the duplicate button on a field
3. Click the remove button on the duplicated field
4. Confirm removal when prompted

**Expected:**
- Field moves to new position
- Duplicate creates an identical field below the original
- Field is removed from canvas after confirmation

---

## Scenario 4: Multi-Page Forms

**Steps:**
1. Click the "+" button in the page tab bar to add Page 2
2. Switch between pages by clicking tabs
3. Add fields to Page 2
4. Double-click a tab name and rename it
5. Click the "x" on Page 2 tab

**Expected:**
- New page tab appears
- Switching tabs shows different field sets
- Tab name updates on rename
- Removal prompts for confirmation if page has fields
- Fields on that page are deleted with the page

---

## Scenario 5: Conditional Logic

**Steps:**
1. Create a form with a Dropdown field (options: "Yes", "No") and a Text field
2. Select the Text field and toggle on "Only show this field based on answers"
3. Set action to "Show"
4. Add rule: Source = Dropdown, Operator = "is exactly", Value = "Yes"
5. Click Preview
6. In preview, select "No" in the dropdown
7. Select "Yes" in the dropdown

**Expected:**
- Text field hidden when dropdown is "No" or empty
- Text field visible when dropdown is "Yes"
- Hidden field shown at reduced opacity with "Hidden" label in preview mode

---

## Scenario 6: Page-Level Conditions

**Steps:**
1. Create a 2-page form with a Dropdown on Page 1 (options: "A", "B")
2. Deselect all fields on Page 2, open page properties
3. Add a condition: Show when Dropdown "is exactly" "B"
4. Preview the form
5. Select "A" on Page 1, then try to navigate
6. Select "B" on Page 1, then navigate

**Expected:**
- Page 2 skipped when dropdown is "A"
- Page 2 shown when dropdown is "B"
- Hidden page appears with dashed border and "Hidden by conditions" label in preview

---

## Scenario 7: Publish and View Public Form

**Steps:**
1. Click "Publish" in the builder top bar
2. Copy the live URL from the green banner
3. Open the URL in a new tab
4. Fill out all required fields
5. Navigate through pages (if multi-page) and click Submit

**Expected:**
- Status changes to Published
- Green banner shows public URL with "Copy link" button
- Public form loads at the URL
- Validation errors appear for empty required fields
- Success screen shows confirmation message after submission
- "Submit another response" button resets the form

---

## Scenario 8: Unpublish a Form

**Steps:**
1. Click "Unpublish" on a published form
2. Try to access the public URL

**Expected:**
- Status reverts to Draft
- Green banner disappears
- Public URL shows an error (form not found or not published)

---

## Scenario 9: Form Validation

**Steps:**
1. Create a form with required Text, Email, Phone, and Number fields
2. Preview the form
3. Click Submit without filling anything
4. Fill in invalid values:
   - Email: "notanemail"
   - Phone: "abc"
   - Number: set min=1, max=10, then enter 15
5. Fix all values and submit

**Expected:**
- Required field errors: "This field is required"
- Email error for invalid format
- Phone error for invalid characters
- Number error for out-of-range value
- Errors scroll into view
- Successful submission after fixing all errors

---

## Scenario 10: Response Dashboard

**Steps:**
1. Submit 2-3 responses to a published form
2. Click "Responses" in the builder
3. Click the status filter buttons (All, New, Read, Archived)
4. Click a column header to sort
5. Click a submission row to open the detail panel
6. Click "Mark as Read"
7. Click "Archive"
8. Click "Restore" on an archived submission

**Expected:**
- Submission count badge shows correct number
- Filters show correct counts and filter the table
- Sorting toggles direction on repeated clicks
- Detail panel shows all field values with labels
- Status changes reflect immediately in the table
- Archived submissions only visible under "Archived" filter (or "All")

---

## Scenario 11: CSV Export

**Steps:**
1. With at least one submission, click "Export CSV"
2. Open the downloaded file

**Expected:**
- File downloads as `responses-{formId}.csv`
- "Downloaded!" feedback appears for 2 seconds
- CSV contains headers for all fields
- Each row is a submission with correct values
- Export button is disabled when no submissions exist

---

## Scenario 12: Embed Code Generation

**Steps:**
1. Publish a form
2. Click "Embed" in the builder
3. View the "Auto-resize" tab code
4. Switch to "Simple embed" tab
5. Click "Copy code" on each tab

**Expected:**
- Auto-resize tab shows script + div code with correct slug
- Simple embed tab shows iframe code with correct URL
- "Copy code" copies to clipboard and shows "Copied!" feedback

---

## Scenario 13: Document Import

**Steps:**
1. On the form list, click "Import"
2. In Step 1, click "Copy instructions"
3. Switch to Step 2
4. Paste invalid JSON (e.g., `{bad}`)
5. Paste valid form JSON with title, pages, and fields
6. Enter a form name and click "Create Form"

**Expected:**
- Instructions copied to clipboard with confirmation
- Invalid JSON shows validation error
- Valid JSON is accepted with preview of form name
- New form opens in builder as Draft

---

## Scenario 14: Theme Customization

**Steps:**
1. Deselect all fields (click empty canvas area)
2. Change the primary color to red
3. Change the font family to Serif
4. Preview the form

**Expected:**
- Color picker shows current color
- Buttons, focus rings, and selected option borders use the new color
- Form text uses the selected font
- Changes persist after save

---

## Scenario 15: Hidden Fields with URL Parameters

**Steps:**
1. Create a form with a Hidden field labeled "source"
2. Set default value to "direct"
3. Publish the form
4. Open the public URL with `?source=email` appended
5. Submit the form
6. Check the submission in the response dashboard

**Expected:**
- Hidden field not visible in the form
- Submission data contains "source" = "email" (URL param overrides default)

---

## Scenario 16: Mobile Responsiveness

**Steps:**
1. Open the builder on a mobile device or resize browser below 768px
2. Verify single-panel layout with FAB button
3. Tap "Add field" FAB — palette slides up from bottom
4. Tap a field type to add it
5. Tap a field on canvas — properties slide up from bottom
6. Use up/down buttons to reorder fields
7. Open three-dot menu for Responses/Embed/Preview

**Expected:**
- Three-panel layout collapses to single panel
- Bottom sheets slide up smoothly and can be swiped to dismiss
- Field palette closes after adding a field
- Properties panel opens for selected field
- Reorder buttons work correctly
- All actions accessible via mobile menu

---

## Scenario 17: Example Form (Read-Only)

**Steps:**
1. Click the example form card on the home page
2. Try to edit a field label
3. Try to add or remove fields
4. Try to publish

**Expected:**
- Builder opens with "read-only" badge
- No editing is possible (fields, labels, options, etc.)
- Palette and mutation actions are disabled or hidden

---

## Scenario 18: Auto-Save Behavior

**Steps:**
1. Open a form in the builder
2. Make a change (e.g., rename a field)
3. Watch the save indicator
4. Make rapid changes (type quickly in a field label)
5. Stop typing and wait

**Expected:**
- Save indicator shows "Saving..." approximately 2 seconds after last change
- Rapid changes debounce — only one save request fires after typing stops
- "Saved" appears on success
- Yellow dot appears next to title while there are unsaved changes

---

## Scenario 19: Confirmation Dialogs

**Steps:**
1. Add a field to the canvas, then click the remove (X) button
2. Verify a styled dialog appears with "Remove field" title and Cancel/Remove buttons
3. Click Cancel — field should remain
4. Click remove again, then click Remove — field should be deleted
5. Create two pages, add a field to Page 2, then click the remove button on the Page 2 tab
6. Verify dialog says the page has fields and asks for confirmation
7. Press Escape — dialog should close, page remains
8. Click outside the dialog backdrop — should also close

**Expected:**
- Custom styled dialog (not browser confirm popup)
- Cancel and Escape close dialog without action
- Remove deletes the field/page as expected
- Focus is trapped inside the dialog (Tab cycles between buttons)

---

## Scenario 20: Page Transitions and Animations

**Steps:**
1. Navigate from form list to builder and back
2. Create a form to see form cards appear
3. Open the 404 page (navigate to /nonexistent)
4. View empty states (empty form list, empty responses)

**Expected:**
- Pages fade in with subtle slide-up animation (0.25s)
- Form list cards appear with staggered entrance animation
- Empty states show SVG illustrations with fade-in
- Confirmation dialogs appear with fast scale animation (0.15s)

---

## Scenario 21: App Header Branding

**Steps:**
1. Open the form list page (/)
2. Verify the top bar shows the "Four Ems" wordmark with four-squares icon
3. Click the wordmark — should navigate to /

**Expected:**
- Slim header bar with brand identity
- Icon uses brand blue color
- Clicking navigates to home

---

## Scenario 22: Unit Tests

**Steps:**
1. Run `npm test` from the project root
2. Verify all tests pass

**Expected:**
- Validation tests: isFieldEmpty, validateField for all field types
- Conditions tests: evaluateCondition for all operators, evaluateConditionGroup for AND/OR/show/hide
- CSV export tests: formatValue, escapeCsvField with injection prevention
- All tests pass with zero failures

---

## Regression Checklist

Quick verification after any code change:

- [ ] Form list loads and shows all forms
- [ ] New form creation works
- [ ] All 13 field types can be added and configured
- [ ] Drag-and-drop reordering works (desktop)
- [ ] Multi-page forms: add, rename, remove, navigate pages
- [ ] Conditional logic: field-level and page-level
- [ ] Auto-save fires and shows status
- [ ] Publish/unpublish toggles correctly
- [ ] Public form loads, validates, and submits
- [ ] Response dashboard shows submissions
- [ ] CSV export downloads correctly
- [ ] Embed dialog shows correct code
- [ ] Mobile layout works below 768px
- [ ] Preview mode shows all pages with visibility indicators
- [ ] Theme changes (color, font) apply correctly
- [ ] Confirmation dialogs appear for field/page removal (not browser popup)
- [ ] Page transitions animate on route changes
- [ ] Form list cards show colored status accent bars
- [ ] App header shows "Four Ems" branding on form list
- [ ] Unit tests pass (`npm test`)
- [ ] Linter passes (`npm run lint`)
