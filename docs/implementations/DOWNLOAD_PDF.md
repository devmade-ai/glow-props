---
slug: download-pdf
title: Download as PDF
badge: Feature
description: Zero-dependency PDF export using window.print(). Print-friendly CSS overrides, no-print utility class, and page break control.
tags:
  - window.print()
  - "@media print"
  - Zero dependencies
order: 5
---

# Download as PDF

Two approaches depending on content type. Choose one per project — or use both if different pages have different needs.

**Related patterns:**
- [THEME_DARK_MODE.md](THEME_DARK_MODE.md) — Print CSS overrides dark themes to force white background and black text for PDF readability (see [Print Override](THEME_DARK_MODE.md#print-override))
- [BURGER_MENU.md](BURGER_MENU.md) — The menu, debug pill, and all interactive elements should have `no-print` class applied
- [DEBUG_SYSTEM.md](DEBUG_SYSTEM.md) — Debug pill should be hidden during print via `no-print`

## Choosing an Approach

| Content type | Approach | Why |
|---|---|---|
| Text, tables, forms, agreements, documents | [window.print()](#approach-a-windowprint) | Browser already knows how to lay out text. Zero dependencies, zero maintenance. |
| Canvas, images, generated graphics, grid layouts | [pdf-lib](#approach-b-pdf-lib) | Browser print can't reliably capture canvas/image content. Need pixel-level control over page composition. |
| Mixed (some text pages + some canvas pages) | [pdf-lib](#approach-b-pdf-lib) | Once you need programmatic control for any part, use it for all of it for consistency. |

**Default to `window.print()` unless you have a specific reason not to.** It's zero-dependency, works offline, and the browser handles all the layout complexity. Only reach for pdf-lib when the browser's print engine can't produce the output you need.

Project variants:
- **window.print()**: glow-props, repo-tor, see-veo, model-pear, sun-sea-o
- **pdf-lib**: canva-grid (canvas-heavy grid layouts)

---

## Approach A: `window.print()`

Zero-dependency PDF download using the browser's native print dialog. The user selects "Save as PDF" from their system print dialog.

Three pieces: a trigger button, a `no-print` utility class, and print-friendly CSS overrides.

### 1. Trigger Button

A simple button that calls `window.print()`:

```tsx
<button type="button" onClick={() => window.print()}>
  Download as PDF
</button>
```

Place this in the page header, hero section, or wherever the user expects a download action. The button itself should be hidden during print (see `no-print` class below).

### 2. The `no-print` Utility Class

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

### 3. Print-Friendly CSS Overrides

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

### To Replicate in Any Project

1. Add a button that calls `window.print()`
2. Add `@media print` CSS rules to make the page printer-friendly (colors, layout)
3. Add a `no-print` utility class to hide interactive/irrelevant elements
4. Use `break-inside: avoid` on content blocks you don't want split across pages
5. Wrap the trigger button's container in `no-print` so it doesn't appear in the PDF

### Limitations of `window.print()`

- **Mobile browsers**: `window.print()` works on desktop but is unreliable on some mobile browsers — `window.open()` + `window.print()` can produce `about:blank` pages or wrong page sizes on iOS Safari and some Android browsers. For document-style content on mobile, the system print dialog usually still works when called directly (not via a popup window).
- **Canvas/WebGL content**: The browser's print engine renders the DOM, not canvas pixels. Canvas elements may appear blank or low-resolution in print.
- **Precise layout control**: You can't control exact page dimensions, headers/footers, or pixel-perfect positioning. The browser's print engine makes its own layout decisions.
- **No programmatic file download**: The user must interact with the system print dialog. You can't trigger a silent PDF download.

If any of these limitations affect your project, use [Approach B: pdf-lib](#approach-b-pdf-lib).

---

## Approach B: pdf-lib

Library-based PDF generation for content that the browser's print engine can't handle — canvas captures, image compositions, multi-page layouts with precise control. Uses `html-to-image` to capture DOM elements as raster images, then `pdf-lib` to compose them into pages.

**Dependencies:**

```bash
npm install pdf-lib html-to-image
```

- **pdf-lib** (~170KB, tree-shakeable): Creates and manipulates PDF documents. No native dependencies, works in browser and Node.
- **html-to-image** (~15KB): Captures DOM elements as PNG/JPEG. Uses the browser's rendering engine, so the capture matches what the user sees.

### Architecture

```
DOM element → html-to-image (capture as PNG) → pdf-lib (embed in PDF page) → Blob → download
```

Each page or section is captured independently, then assembled into a multi-page PDF. This gives full control over page dimensions, margins, image quality, and page order.

### Implementation

```typescript
// Requirement: Export visual canvas/grid content as PDF
// Approach: Capture DOM as images via html-to-image, compose into PDF via pdf-lib
// Alternatives:
//   - window.print(): Rejected — broken on mobile (about:blank, wrong sizes),
//     prints entire UI not just target content, can't capture canvas reliably
//   - jsPDF + html2canvas: Rejected — quality loss in addImage dimension scaling,
//     html2canvas has rendering inconsistencies with CSS grid/flexbox
//   - Server-side Puppeteer: Rejected — requires backend, adds latency, can't
//     capture client-side canvas state

import { PDFDocument } from 'pdf-lib'
import { toPng } from 'html-to-image'

interface ExportOptions {
  /** DOM elements to capture, one per PDF page */
  pages: HTMLElement[]
  /** Filename without extension */
  filename: string
  /** Pixel ratio for capture quality (1 = screen, 2 = retina, 3 = print) */
  quality?: 1 | 2 | 3
}

export async function exportToPdf({
  pages,
  filename,
  quality = 2,
}: ExportOptions): Promise<void> {
  const pdf = await PDFDocument.create()

  for (const element of pages) {
    // Capture DOM element as PNG at specified quality
    const dataUrl = await toPng(element, {
      pixelRatio: quality,
      // Skip elements that shouldn't appear in the PDF
      filter: (node) => {
        if (node instanceof HTMLElement) {
          return !node.classList.contains('no-print')
        }
        return true
      },
    })

    // Convert data URL to bytes
    const imageBytes = await fetch(dataUrl).then(res => res.arrayBuffer())
    const image = await pdf.embedPng(imageBytes)

    // Create page matching the image aspect ratio
    // Default PDF page: 595.28 x 841.89 points (A4)
    const pageWidth = 595.28
    const scale = pageWidth / image.width
    const pageHeight = image.height * scale

    const page = pdf.addPage([pageWidth, pageHeight])
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    })
  }

  // Save and trigger download
  const pdfBytes = await pdf.save()
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.pdf`
  link.click()

  // Clean up the object URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
```

### Usage

```tsx
import { exportToPdf } from '../utils/exportToPdf'

function ExportButton({ pageRefs, filename }) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const pages = pageRefs
        .map(ref => ref.current)
        .filter(Boolean)
      await exportToPdf({ pages, filename, quality: 2 })
    } catch (err) {
      console.error('PDF export failed:', err)
      // Show user-facing error — see DEBUG_SYSTEM.md for error routing
    } finally {
      setExporting(false)
    }
  }

  return (
    <button onClick={handleExport} disabled={exporting}>
      {exporting ? 'Exporting...' : 'Download PDF'}
    </button>
  )
}
```

### Quality Levels

The `quality` (pixelRatio) option controls the tradeoff between file size and visual clarity:

| Quality | pixelRatio | Use case | File size |
|---------|-----------|----------|-----------|
| 1 | 1x | Quick preview, low-bandwidth | Small |
| 2 | 2x | Default — good balance, retina-sharp | Medium |
| 3 | 3x | Print-quality, archival | Large |

For user-facing exports, offer a quality selector or default to 2x. For automated/batch exports, use 1x to keep file sizes manageable.

### Key Differences from `window.print()`

| Concern | window.print() | pdf-lib |
|---------|---------------|---------|
| Dependencies | Zero | pdf-lib + html-to-image (~185KB) |
| User interaction | System print dialog (user picks "Save as PDF") | Silent download — no dialog |
| Mobile support | Unreliable for non-document content | Works everywhere (blob download) |
| Canvas content | Blank or low-res | Pixel-perfect at chosen quality |
| Layout control | Browser decides | Full control (page size, margins, order) |
| Multi-page | Browser decides page breaks | Explicit — one capture per page |
| Offline | Yes | Yes (no network required) |
| Print CSS needed | Yes (no-print, overrides) | No (captures what's visible, filter skips no-print) |

### Limitations of pdf-lib

- **Text is rasterized** — the PDF contains images, not selectable text. Users can't copy text from the PDF or search within it. For text-heavy documents, `window.print()` produces searchable PDFs.
- **File size** — image-based PDFs are larger than text-based ones. A 3x quality multi-page PDF can be several MB.
- **Rendering depends on html-to-image** — some CSS features (backdrop-filter, complex transforms, web fonts) may not capture perfectly. Test your specific content.
- **No native PDF features** — no bookmarks, no hyperlinks, no table of contents. The PDF is a series of page images.

If text searchability or small file size matters, use [Approach A: window.print()](#approach-a-windowprint).

---

## Document Verification (Optional)

For apps where document integrity matters (agreements, contracts, official records), embed a verification hash in the printed/exported output. Works with both approaches.

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

Display the verification code and timestamp at the bottom of the printed/exported page. Users can prove the PDF wasn't tampered with by checking the hash against the original content.

## Key Lessons

1. **Default to `window.print()` unless you have a reason not to.** It's zero-dependency, produces searchable text PDFs, and the browser handles layout. Only reach for pdf-lib when the browser's print engine can't produce the output you need.
2. **Canvas/image content requires pdf-lib (or similar).** The browser's print engine renders the DOM, not canvas pixels. If your content is visual (grids, charts, canvas drawings), `window.print()` will produce blank or broken output.
3. **Mobile is where `window.print()` breaks down.** Direct calls work on most mobile browsers for simple documents, but popup-based approaches (`window.open()` + `window.print()`) fail on iOS Safari and some Android browsers. pdf-lib's blob download works everywhere.
4. **pdf-lib produces images, not text.** Users can't select, search, or copy text from a pdf-lib PDF. For agreements, invoices, or any text-heavy document, `window.print()` is strictly better.
5. **`!important` is justified in print CSS** — print overrides must win against inline styles, CSS-in-JS, and dark mode classes. This is one of the few legitimate uses of `!important`.
6. **`print-color-adjust: exact` preserves backgrounds** — without this, browsers strip background colors in print to save ink. Status badges, colored indicators, and chart elements become invisible.
7. **Use `print-avoid-break` utility class** — more composable than applying `break-inside: avoid` to all `section` elements. Apply selectively to cards, tables, and blocks that should stay together.
8. **Test in print preview** — use the browser's print preview (Ctrl/Cmd+P) to verify layout before committing. Check for: hidden elements, color contrast, page breaks, and overall readability.
9. **Hide the download button itself** — the button that triggers `window.print()` should be inside a `no-print` container, otherwise it appears in the PDF. For pdf-lib, the `filter` option in html-to-image serves the same purpose.
10. **Offer quality selection for pdf-lib exports** — 2x is a good default, but let users choose 1x (fast/small) or 3x (print-quality) when file size or clarity matters.
11. **Show loading state during pdf-lib export** — capturing DOM elements and composing a PDF takes noticeable time (1-5 seconds for multi-page). Disable the button and show progress to prevent double-clicks.
