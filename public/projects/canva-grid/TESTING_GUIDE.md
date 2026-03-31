# Manual Testing Guide

Step-by-step test scenarios for verifying CanvaGrid works correctly.

---

## How to Use This Guide

Each test scenario includes:
- **Scenario:** What you're testing
- **Steps:** Exact actions to perform
- **Where:** Which tab/section/element to interact with
- **Expected:** What should happen

Run these tests after making changes to ensure nothing is broken.

---

## Test Environment Setup

1. Start the dev server: `npm run dev`
2. Open `http://localhost:5173` in your browser
3. Open browser DevTools (F12) to check for console errors

---

## Presets Tab Tests

### T1: Apply Complete Design

**Scenario:** Complete designs should apply theme, fonts, layout, and overlay all at once.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Click "Presets" tab | Top tab bar | Presets tab opens with sections |
| 2 | Find "Looks" section | Presets tab | Section visible with design thumbnails |
| 3 | Click any design thumbnail | Looks grid | Preview updates immediately |
| 4 | Check Style tab | Click Style tab | Theme, fonts match the preset |
| 5 | Check Structure tab | Click Structure tab | Grid structure matches preset |

### T2: Apply Layout Only

**Scenario:** Layout-only presets should change grid without affecting colors/fonts.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Apply a Look first | Presets → Looks | Note the current theme colors |
| 2 | Click "Layout" section | Presets tab | Layout thumbnails visible |
| 3 | Click a different layout | Layout grid | Grid structure changes |
| 4 | Check Style tab | Click Style tab | Theme colors unchanged |

---

## Media Tab Tests

### M0: Sample Images with Categories and Pagination

**Scenario:** Sample images load from CDN manifest with category filtering and pagination.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Click "Media" tab | Top tab bar | Media tab opens |
| 2 | Expand "Sample Images" section | Media tab | Loading spinner appears briefly, then category chips and thumbnail grid |
| 3 | Verify category chips scroll horizontally | Category filter row | Chips in a single row, scrollable if many categories |
| 4 | Click a category chip (e.g., "Nature") | Category filter row | Grid filters to show only that category, page resets to 1 |
| 5 | Click "All" chip | Category filter row | All sample images shown again, page resets to 1 |
| 6 | If more than 15 images, check pagination | Below image grid | "Prev / 1 / N / Next" controls visible |
| 7 | Click "Next" | Pagination controls | Next page of images shown, page counter updates |
| 8 | Click "Prev" | Pagination controls | Previous page shown |
| 9 | Click any sample thumbnail | Sample grid | Loading spinner appears on thumbnail |
| 10 | Wait for load | Sample grid | Image added to library, spinner disappears |
| 11 | Check preview | Ad preview | Image appears in the canvas |
| 12 | Disconnect internet, reload page | Browser | Manifest loads from cache, thumbnails still visible |
| 13 | With internet off, click a non-cached thumbnail | Sample grid | Error: "Failed to load image. Check your connection." |
| 14 | Set invalid manifest URL (dev only), reload | sampleImages.js | Error: "Could not load sample images..." with "Try again" button |
| 15 | Click "Try again" | Error state | Retries manifest fetch |

### M1: Image Upload

**Scenario:** Users can upload a background image via drag-drop or click.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Click "Media" tab | Top tab bar | Media tab opens |
| 2 | Find "Background Image" section | Media tab | Upload area visible |
| 3 | Click upload area | Background Image section | File picker opens |
| 4 | Select an image file | File picker dialog | Image appears in preview |
| 5 | Alternative: drag image onto upload area | Background Image section | Image appears in preview |

### M2: Image Fit Modes

**Scenario:** Cover and Contain fit modes work correctly.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Upload a non-square image | Media → Background Image | Image visible in preview |
| 2 | Click "Cover" | Fit options | Image fills frame, may crop edges |
| 3 | Click "Contain" | Fit options | Entire image visible, may have empty space |

### M3: Image Position

**Scenario:** Position controls adjust where the image sits in the frame.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Upload image, set to "Cover" | Media tab | Image is cropped |
| 2 | Adjust position sliders | Position controls | Visible portion of image shifts |

### M4: Advanced Filters

**Scenario:** Image filters apply correctly.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Upload an image | Media tab | Image visible |
| 2 | Expand "Advanced Filters" | Media tab | Filter sliders appear |
| 3 | Drag Grayscale to 100% | Grayscale slider | Image becomes black and white |
| 4 | Drag Sepia to 50% | Sepia slider | Image has warm tone |
| 5 | Drag Blur to 5px | Blur slider | Image becomes blurry |
| 6 | Reset all to 0 | Each slider | Image returns to original |

### M5: Logo Upload and Position

**Scenario:** Logo appears in the correct position.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Expand "Logo" section | Media tab | Logo upload area visible |
| 2 | Upload a logo image | Logo section | Logo appears on preview |
| 3 | Click "Top Left" | Position options | Logo moves to top-left corner |
| 4 | Click "Bottom Right" | Position options | Logo moves to bottom-right corner |
| 5 | Click "Center" | Position options | Logo moves to center |
| 6 | Change size to "Large" | Size options | Logo becomes larger |

### M6: Image Cell Selection

**Scenario:** Image can be assigned to different cells from Media tab.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Upload an image | Media → Background Image | Image visible in preview |
| 2 | Apply a 2-cell layout | Structure → Structure | 2 cells visible |
| 3 | Return to Media tab | Top tab bar | Media tab opens |
| 4 | Find "Image Cell" selector | Background Image section | Small grid showing cells |
| 5 | Click cell 2 | Image Cell grid | Background image moves to cell 2 |

### M7: Image Overlay

**Scenario:** Image overlay controls affect the background image layer.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Upload an image | Media → Background Image | Image visible in preview |
| 2 | Find "Image Overlay" section | Media tab | Overlay controls visible |
| 3 | Change Type to "Vignette" | Type selector | Vignette effect appears on image |
| 4 | Change Color to "Primary" | Color selector | Overlay uses theme's primary color |
| 5 | Drag Opacity to 50% | Opacity slider | Overlay semi-transparent |
| 6 | Drag Opacity to 0% | Opacity slider | Overlay disappears completely |

---

## Content Tab Tests

### C1: Text Input

**Scenario:** Text entered in fields appears in the preview.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Click "Content" tab | Top tab bar | Content tab opens |
| 2 | Expand "Title & Tagline" section | Content tab | Title and Tagline fields visible |
| 3 | Type "Test Headline" in Title field | Title input | Text appears in preview |
| 4 | Type "Supporting text" in Tagline field | Tagline input | Tagline appears below title |

### C2: Visibility Toggle

**Scenario:** Eye icon toggles text visibility.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Enter text in Title field | Content → Title & Tagline | Title visible in preview |
| 2 | Click eye icon next to Title | Title row | Title disappears from preview |
| 3 | Click eye icon again | Title row | Title reappears |

### C3: Per-Cell Text

**Scenario:** Each cell has its own text elements.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Apply a 2-row layout | Presets → Layout | Preview shows 2 cells |
| 2 | Select Cell 1 in Context Bar | Cell selector | Cell 1 highlighted |
| 3 | Go to Content tab | Top tab bar | Content tab opens, shows Cell 1 text |
| 4 | Type "Cell 1 Title" in Title | Title input | Text appears in cell 1 in preview |
| 5 | Select Cell 2 in Context Bar | Cell selector | Cell 2 highlighted |
| 6 | Type "Cell 2 Title" in Title | Title input | Text appears in cell 2 in preview |
| 7 | Switch back to Cell 1 | Cell selector | Cell 1 Title still shows "Cell 1 Title" |

### C4: Text Alignment

**Scenario:** Alignment controls position text within cells.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Enter Title text | Content → Title | Title visible |
| 2 | Click "Left" alignment | Title alignment buttons | Title aligns left |
| 3 | Click "Center" alignment | Title alignment buttons | Title centers |
| 4 | Click "Right" alignment | Title alignment buttons | Title aligns right |
| 5 | Click "Auto" | Title alignment buttons | Title uses cell default |

### C5: Text Styling

**Scenario:** Bold, italic, color, and size work correctly.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Enter Title text | Content → Title | Title visible |
| 2 | Click Bold (B) button | Title controls | Title becomes bold |
| 3 | Click Italic (I) button | Title controls | Title becomes italic |
| 4 | Change color dropdown | Title color selector | Title color changes |
| 5 | Adjust size slider | Title size slider | Title size changes |

---

## Structure Tab Tests

### L1: Layout Type Selection

**Scenario:** Layout type changes the grid structure.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Click "Structure" tab | Top tab bar | Structure tab opens |
| 2 | Expand "Structure" section | Structure tab | Layout type options visible |
| 3 | Click "Full Bleed" | Layout type buttons | Preview shows single cell |
| 4 | Click "Rows" | Layout type buttons | Preview shows horizontal divisions |
| 5 | Click "Columns" | Layout type buttons | Preview shows vertical divisions |

### L2: Interactive Grid Resizing

**Scenario:** Dragging dividers resizes cells.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Select "Rows" layout type | Structure → Structure | 2+ rows visible in grid editor |
| 2 | Find the divider line between rows | Interactive grid | Cursor changes on hover |
| 3 | Drag the divider up or down | Grid divider | Cell sizes change proportionally |
| 4 | Check preview | Ad preview | Preview reflects new proportions |

### L3: Section Reorder

**Scenario:** Rows can be moved up/down, columns left/right.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Apply a 3-row layout or add 3 sections | Structure → Structure | 3 rows visible in grid editor |
| 2 | Add text to each cell for identification | Content tab | Different text in each cell |
| 3 | Click on Row 2 in the grid | Structure grid | Row 2 highlights as selected |
| 4 | Click "Move Up" button | Structure grid controls | Row 2 moves to position 1, text follows |
| 5 | Click "Move Down" button | Structure grid controls | Row moves back down, text follows |
| 6 | Check image assignments | Media tab | Images remain assigned to correct cells |

### L4: Text Alignment (in Content Tab)

**Scenario:** Per-cell alignment controls work from the Content tab.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Apply a 2-cell layout | Presets → Layout | 2 cells visible |
| 2 | Select Cell 1 in Context Bar | Cell selector | Cell 1 highlighted |
| 3 | Go to Content tab | Top tab bar | Content tab opens |
| 4 | Find alignment controls | Content tab (below text groups) | Horizontal + Vertical alignment buttons visible |
| 5 | Set horizontal to "Left" | Alignment buttons | Cell 1 text aligns left |
| 6 | Select Cell 2 in Context Bar | Cell selector | Cell 2 highlighted |
| 7 | Set horizontal to "Right" | Alignment buttons | Cell 2 text aligns right, Cell 1 still left |

### L5: Insert Section

**Scenario:** Sections can be inserted before or after existing sections.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Apply a 2-row layout | Structure → Structure | 2 rows visible |
| 2 | Click on Row 1 in the grid | Structure grid | Row 1 highlights |
| 3 | Click "Insert After" | Structure grid controls | New row appears between rows 1 and 2 |
| 4 | Check cell numbering | Context Bar cell grid | Cells renumbered correctly |
| 5 | Check existing text and images | Preview | Original content remains in correct cells |

---

## Style Tab Tests

### S1: Theme Application

**Scenario:** Themes change colors throughout the design.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Click "Presets" tab | Top tab bar | Presets tab opens |
| 2 | Expand "Themes" section | Presets tab | 19 theme thumbnails visible |
| 3 | Click a different theme | Theme grid | Preview colors change |
| 4 | Check text colors | Preview | Text uses theme colors |

### S2: Custom Colors

**Scenario:** Custom color inputs override theme colors.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Expand custom colors area | Presets → Themes | Color input fields visible |
| 2 | Change "Primary" color | Primary color input | Primary text color changes |
| 3 | Change "Background" color | Background color input | Background color changes |

### S3: Font Selection

**Scenario:** Font changes apply to the correct text elements.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Expand "Typography" section | Style tab | Font selectors visible |
| 2 | Change Title font | Title font dropdown | Title text font changes |
| 3 | Change Body font | Body font dropdown | Body text, tagline, etc. font changes |

### S4: Overlay Controls

**Scenario:** Per-cell overlays can be configured independently.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Apply a 2-cell layout | Structure tab | 2 cells visible |
| 2 | Go to Style → Overlay | Style tab | Per-cell overlay controls visible |
| 3 | Enable overlay for Cell 1 | Cell 1 toggle | Overlay appears on cell 1 only |
| 4 | Change overlay type to "Gradient Bottom" | Cell 1 type dropdown | Gradient appears from bottom |
| 5 | Adjust opacity to 80% | Cell 1 opacity slider | Overlay becomes more opaque |

### S5: Spacing Controls

**Scenario:** Padding affects text positioning.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Add visible text | Content tab | Text visible in preview |
| 2 | Go to Style → Spacing | Style tab | Padding controls visible |
| 3 | Increase global padding | Global padding slider | Text moves away from edges |
| 4 | Set per-cell padding for Cell 1 | Cell 1 padding | Cell 1 padding differs from others |

---

## Export Tests

### E1: Platform Switching

**Scenario:** Preview updates for different platform sizes.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Expand Social → LinkedIn | Platform selector below preview | Shows Square, Portrait, Landscape options |
| 2 | Click "Square" under LinkedIn | Platform selector | Preview shows 1080×1080 aspect ratio |
| 3 | Click "Portrait" under LinkedIn | Platform selector | Preview shows 1080×1350 aspect ratio |
| 4 | Expand Social → Instagram | Platform selector | Shows Feed Portrait, Square, Feed Landscape, Story options |
| 5 | Click "Story / Reels" under Instagram | Platform selector | Preview shows tall (1080×1920) |

### E2: Single Download

**Scenario:** Download button exports current platform in selected format.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Select a platform | Platform selector | Platform selected |
| 2 | Select format (PNG/JPG/WebP) | File Format buttons | Format highlighted |
| 3 | Click "Download Current" | Export buttons | File downloads with timestamp filename |
| 4 | Open downloaded file | File system | Image matches preview, correct dimensions, correct format |

### E3: Multi-Platform Download

**Scenario:** Download Multiple Platforms creates ZIP with selected platforms.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Click "Download Multiple Platforms (ZIP)" | Export buttons | Platform selection UI appears |
| 2 | Click "Select All" | Multi-select panel | All 40 platforms selected |
| 3 | Click "Export 40 Platforms" | Multi-select panel | Progress indicator appears |
| 4 | Wait for completion | Progress indicator | ZIP file downloads |
| 5 | Extract ZIP | File system | Contains 40 image files, one per format |
| 6 | Check dimensions | Each file | Correct dimensions for each platform |

### E4: Format Selection

**Scenario:** PNG/JPG/WebP format toggle works correctly.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Select a platform | Platform selector | Platform selected |
| 2 | Click "JPG" format button | File Format toggle | JPG highlighted |
| 3 | Click "Download Current" | Export buttons | Downloaded file is .jpg |
| 4 | Click "WebP" format button | File Format toggle | WebP highlighted |
| 5 | Click "Download Current" | Export buttons | Downloaded file is .webp |
| 6 | Check "Use recommended" link | File Format area | Link appears if current format differs from recommended |

### E5: PDF Export

**Scenario:** PDF export creates a properly formatted PDF.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Add an image and some text | Media + Content tabs | Design visible in preview |
| 2 | Click "Download as PDF" | Export buttons | PDF file downloads |
| 3 | Open the PDF | File system | Image is sharp, text readable, correct dimensions |
| 4 | Check file size | File system | Reasonable size (not bloated — should be under 1MB for simple designs) |
| 5 | Add a second page | Context Bar → Pages | 2 pages exist |
| 6 | Click "Download as PDF" | Export buttons | PDF has 2 pages |

### E6: Platform Search Filter

**Scenario:** Users can search platforms by name to quickly find the right format.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Find the platform selector | Below preview (desktop) or Presets tab (mobile) | Platform categories visible |
| 2 | Type "linked" in the search field | Platform search input | Only LinkedIn-related platforms shown (LinkedIn Square/Portrait/Landscape, LinkedIn Banner) |
| 3 | Type "story" in the search field | Platform search input | All platforms with "Story" formats shown (Instagram, Facebook, Pinterest, Snapchat, WhatsApp, Threads) |
| 4 | Clear the search field | Platform search input | All platform categories visible again |
| 5 | Type "xyz123" (no match) | Platform search input | Empty state or "no results" message |

### E7: Save and Load Designs

**Scenario:** Designs can be saved, loaded, and deleted.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Create a design with text and images | Various tabs | Design visible |
| 2 | Click "Save" in header | Header | Save/Load modal opens |
| 3 | Enter a name and click Save | Save tab | Success confirmation shown |
| 4 | Switch to Load tab | Modal tabs | Saved design appears in list |
| 5 | Modify the current design | Various tabs | Design looks different |
| 6 | Click the saved design to load it | Load tab | Original design restored |
| 7 | Delete the design | Load tab → delete button | Confirm dialog, design removed from list |

---

## Error Handling Tests

### ERR1: Invalid Image Upload

**Scenario:** Non-image files are rejected gracefully.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Try to upload a .txt file | Media → Background Image | File rejected or error message shown |
| 2 | Check console | DevTools | No uncaught errors |

### ERR2: Missing Image Export

**Scenario:** Export works even without a background image.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Clear/don't upload any image | Media tab | No background image |
| 2 | Add some text | Content tab | Text visible on solid background |
| 3 | Click Download | Export buttons | PNG exports successfully |

---

## Mobile-Specific Tests

### MOB1: Long-Press Cell Context Menu

**Scenario:** Long-pressing a cell on mobile opens a context menu for quick tab access.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Open DevTools and enable mobile view | Browser | Mobile layout active (< 1024px) |
| 2 | Long-press (touch and hold) on a cell | Canvas | Context menu appears with options: Media, Content, Style |
| 3 | Tap "Media" in the context menu | Context menu | Bottom sheet opens to Media tab with that cell selected |
| 4 | Long-press a different cell | Canvas | Context menu appears for the new cell |
| 5 | Tap "Content" | Context menu | Bottom sheet opens to Content tab with that cell selected |
| 6 | Tap outside the context menu | Canvas area | Context menu dismisses without navigating |

---

## Responsive Tests

### R1: Mobile Width

**Scenario:** UI remains usable on narrow screens.

| Step | Action | Where | Expected |
|------|--------|-------|----------|
| 1 | Open DevTools | Browser | DevTools open |
| 2 | Toggle device toolbar | DevTools | Mobile view enabled |
| 3 | Set width to 375px | Device toolbar | UI adapts to narrow width |
| 4 | Navigate all tabs | Tab bar | All tabs accessible and functional |
| 5 | Check preview | Preview area | Preview scales appropriately |

---

## Regression Checklist

Quick checks to run after any code change:

- [ ] App loads without console errors
- [ ] All 5 tabs are clickable and show content
- [ ] Image upload works (drag-drop and click)
- [ ] Text appears in preview when typed
- [ ] Theme change affects preview colors
- [ ] Layout change affects preview structure
- [ ] Sample images: manifest loads, category chips (horizontal scroll) and thumbnails appear
- [ ] Sample images: pagination controls show when more than 15 images, Prev/Next work
- [ ] Sample images: clicking a thumbnail loads full image and adds to library
- [ ] Sample images: error state shows retry button if manifest fails
- [ ] Image Cell selector works in Media tab (multi-cell layouts)
- [ ] Image Overlay controls work in Media tab
- [ ] Text alignment controls work in Content tab (per-cell)
- [ ] Per-cell text: switching cells in Context Bar shows correct text
- [ ] Section reorder: move up/down preserves text and image assignments
- [ ] Export produces a valid image matching preview
- [ ] Format selection (PNG/JPG/WebP) produces correct file type
- [ ] PDF export produces sharp, reasonably-sized PDF
- [ ] Save/Load designs works (save, load, delete)
- [ ] Platform search filter narrows results correctly
- [ ] Long-press cell context menu works on mobile (opens Media/Content/Style)
- [ ] `npm test` passes (unit tests)
- [ ] No React warnings in console
