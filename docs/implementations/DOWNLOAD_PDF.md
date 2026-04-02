# Download as PDF (via `window.print()`)

Zero-dependency PDF download using the browser's native print dialog. No PDF libraries needed — the user selects "Save as PDF" from their system print dialog.

## How It Works

Three pieces: a trigger button, a `no-print` utility class, and print-friendly CSS overrides.

## 1. Trigger Button

A simple button that calls `window.print()`:

```tsx
<button type="button" onClick={() => window.print()}>
  Download as PDF
</button>
```

Place this in the page header, hero section, or wherever the user expects a download action. The button itself should be hidden during print (see `no-print` class below).

## 2. The `no-print` Utility Class

Hide interactive or irrelevant elements when printing/saving as PDF:

```css
@media print {
  .no-print {
    display: none !important;
  }
}
```

Apply `className="no-print"` to:
- Navigation bars and menus
- Action buttons (install, download, CTAs)
- Footers with interactive links
- Modals, tooltips, and floating UI
- Forms and interactive widgets
- Debug overlays

## 3. Print-Friendly CSS Overrides

Override dark themes, fix link visibility, and prevent content from splitting across pages:

```css
@media print {
  body {
    background: white !important;
    color: black !important;
  }

  a {
    color: black !important;
    text-decoration: underline !important;
  }

  section {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
```

- **White background / black text**: Ensures readability regardless of the app's theme. Saves ink.
- **Underlined links**: Links lose their hover state in print — underlines make them identifiable.
- **`break-inside: avoid`**: Prevents sections from being split across page breaks. Use on content blocks (cards, feature sections, testimonials) that should stay together. `page-break-inside` is the legacy property for older browsers.

## To Replicate in Any Project

1. Add a button that calls `window.print()`
2. Add `@media print` CSS rules to make the page printer-friendly (colors, layout)
3. Add a `no-print` utility class to hide interactive/irrelevant elements
4. Use `break-inside: avoid` on content blocks you don't want split across pages
5. Wrap the trigger button's container in `no-print` so it doesn't appear in the PDF

## Key Lessons

1. **No library needed** — `window.print()` opens the system print dialog, which includes "Save as PDF" on all major browsers and operating systems.
2. **`!important` is justified here** — print overrides must win against inline styles, CSS-in-JS, and dark mode classes. This is one of the few legitimate uses of `!important`.
3. **Test in print preview** — use the browser's print preview (Ctrl/Cmd+P) to verify layout before committing. Check for: hidden elements, color contrast, page breaks, and overall readability.
4. **`break-inside: avoid` on sections** — prevents awkward mid-section page breaks. Apply to any content block that should stay on one page.
5. **Hide the download button itself** — the button that triggers `window.print()` should be inside a `no-print` container, otherwise it appears in the PDF.
