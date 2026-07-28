# qi-invoice

Fill in an invoice, check it over, download it as a PDF.

**Nothing you type leaves your device.** There is no server, no database, no
account, and no email. The invoice is built in your browser and saved straight
to your downloads. Close the tab and it is gone.

## Features

- **One form, top to bottom** — your details, who it's for, the numbers, the
  wording. A running total stays in view at the bottom of the screen while you
  work.
- **Three kinds of line** — items, deductions (discounts, credits, anything
  already paid), and additional items (delivery, expenses, a late fee). Each is
  a card you can fill in on a phone without pinching to zoom, and each section
  shows its own subtotal.
- **Optional VAT** — switch it on, set the percentage, and mark individual lines
  as VAT-applicable or not.
- **A review step** — the finished invoice, before you commit to anything.
- **Five styles** — a plain one, plus a branded design in four paper stocks: a
  deep navy one for sending on screen, a white one for printing, a cream one, and
  one with the colour taken out. Switching redraws the invoice instantly, applies
  to the PDF as well as the screen, and never changes a figure.
- **Download PDF** — a real file named after the invoice number, with real text
  in it, so the amounts can be searched and copied.
- **Print** — the second route, and the one to use if the invoice contains
  Greek, Cyrillic, CJK or anything else outside the Latin alphabet.
- **It remembers you, on your device** — your own details, currency, unit,
  standard wording and next invoice number come back next time. One menu item
  clears it.
- **Install it** — works as an app on a phone or desktop, and works completely
  offline, because there is nothing for it to reach.
- **Light and dark** — three themes, following the system until you choose.

## How it works

```
[Your browser]  →  fill in the form  →  review  →  Download PDF
                                                        ↓
                                                  [your downloads]
```

That's the whole diagram. There is no second box.

## Design decisions worth knowing

**Money is never a decimal internally.** Amounts are whole numbers of cents,
quantities whole thousandths of a unit, and VAT rates whole basis points.
Ordinary decimal arithmetic drifts on exactly the operations an invoice performs
most — repeated addition and multiplication — and the error surfaces in the one
number the recipient checks.

**Line totals are rounded individually; VAT is rounded once.** Each line total
is displayed, so the visible lines have to add up to the visible subtotal.
Rounding VAT per line and then adding it up double-rounds and drifts, so VAT is
calculated once on the summed VAT-applicable net.

**Currency is set per invoice, not per line.** Mixed currencies make a single
total impossible. If you genuinely bill in two currencies, that's two invoices.

**A line's sign comes from which section it's in.** Prices are always positive;
deductions subtract because they are deductions. Otherwise "a negative extra"
and "a deduction" would be two ways of saying the same thing.

**Two renderers, one set of figures.** The invoice on screen and the invoice in
the downloaded PDF are laid out by separate code — one is a web page, the other
is drawn in PDF text primitives. They are allowed to look different and cannot
disagree on a number, because neither of them calculates anything: both read the
same computed totals.

**The PDF holds real text, not a picture.** Rasterising the screen would
guarantee a pixel-perfect match, but the amounts would stop being selectable,
searchable or copyable — the wrong trade for a document whose purpose is to be
filed.

**Print is not a fallback.** The generated PDF uses a built-in font that covers
Latin scripts only. Rather than print the wrong characters, the app refuses and
points at Print, which uses the browser's own fonts and handles any language.

**Updates never interrupt you.** A new version is applied when you next open the
app, never while you're part-way through an invoice — there's nothing to save it
to.

## Tech

React, Vite, TypeScript, Tailwind CSS with DaisyUI, and pdf-lib for the
generated file. Installable as a PWA. Deploys as static files.
