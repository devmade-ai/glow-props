# Download as PDF (via `window.print()`)

Zero-dependency PDF download using the browser's native print dialog. No PDF libraries needed — the user selects "Save as PDF" from their system print dialog.

**Related patterns:**
- [THEME_DARK_MODE.md](THEME_DARK_MODE.md) — Print CSS overrides dark themes to force white background and black text for PDF readability (see [Print Override](THEME_DARK_MODE.md#print-override))
- [BURGER_MENU.md](BURGER_MENU.md) — The menu, debug pill, and all interactive elements should have `no-print` class applied
- [DEBUG_SYSTEM.md](DEBUG_SYSTEM.md) — Debug pill should be hidden during print via `no-print`

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
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  a {
    color: black !important;
    text-decoration: underline !important;
  }

  /* Named utility class — more composable than applying to generic `section` elements.
     Apply selectively to specific blocks that should stay on one page. */
  .print-avoid-break {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* Fallback for elements not using the utility class */
  section {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
```

- **White background / black text**: Ensures readability regardless of the app's theme. Saves ink.
- **`print-color-adjust: exact`**: Forces the browser to render background colors and images in print. Without this, status badges, colored indicators, and background-colored elements lose their styling. The `-webkit-` prefix covers Safari/Chrome.
- **Underlined links**: Links lose their hover state in print — underlines make them identifiable.
- **`print-avoid-break` utility class**: Named class for selective application instead of targeting all `section` elements globally. Apply to cards, feature blocks, table rows, and any content that should stay together across page breaks. `page-break-inside` is the legacy property for older browsers.

## To Replicate in Any Project

1. Add a button that calls `window.print()`
2. Add `@media print` CSS rules to make the page printer-friendly (colors, layout)
3. Add a `no-print` utility class to hide interactive/irrelevant elements
4. Use `break-inside: avoid` on content blocks you don't want split across pages
5. Wrap the trigger button's container in `no-print` so it doesn't appear in the PDF

## Document Verification (Optional)

For apps where document integrity matters (agreements, contracts, official records), embed a verification hash in the printed output:

```typescript
async function generateVerification(content: string): Promise<{
  code: string
  generated_at: string
  hash: string
}> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return {
    code: hash.substring(0, 8).toUpperCase(),
    generated_at: new Date().toISOString(),
    hash,
  }
}
```

Display the verification code and timestamp at the bottom of the printed page. Users can prove the PDF wasn't tampered with by checking the hash against the original content.

## Key Lessons

1. **No library needed** — `window.print()` opens the system print dialog, which includes "Save as PDF" on all major browsers and operating systems.
2. **`!important` is justified here** — print overrides must win against inline styles, CSS-in-JS, and dark mode classes. This is one of the few legitimate uses of `!important`.
3. **`print-color-adjust: exact` preserves backgrounds** — without this, browsers strip background colors in print to save ink. Status badges, colored indicators, and chart elements become invisible.
4. **Use `print-avoid-break` utility class** — more composable than applying `break-inside: avoid` to all `section` elements. Apply selectively to cards, tables, and blocks that should stay together.
5. **Test in print preview** — use the browser's print preview (Ctrl/Cmd+P) to verify layout before committing. Check for: hidden elements, color contrast, page breaks, and overall readability.
6. **Hide the download button itself** — the button that triggers `window.print()` should be inside a `no-print` container, otherwise it appears in the PDF.
