# qi-invoice

Fill in an invoice, check it over, and email it.

Nothing you type is stored. The invoice is validated, turned into an email, and
handed to the mail server — there is no database of invoices, no file on disk,
and no copy kept afterwards. What the recipient receives, and the copy sent to
the account inbox, are the only records that exist.

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
- **A review step** — the invoice exactly as it will arrive, before anything is
  sent.
- **Save as PDF** — from the review step or after sending, using your browser's
  own print-to-PDF. The result is real text, so it can be searched and copied.
- **It remembers you, on your device** — your own details, currency, unit,
  standard wording and next invoice number come back next time. All of it lives
  in your browser and none of it is sent anywhere. One menu item clears it.
- **Install it** — it works as an app on your phone or desktop, and the form
  keeps working without a connection right up until you press send.
- **Light and dark** — three themes, following your system until you choose.

## How it works

```
[Your browser]  →  fill in the form  →  review  →  send
                                                    ↓
                                          [validate + recompute]
                                                    ↓
                                          [format as email]  →  [SMTP]  →  [recipient]
                                                                              ↓
                                                                    (copy to account inbox)
```

The totals shown on the review screen and the totals in the email are produced
by the same code. The server recalculates everything from the raw form data and
ignores any figures the browser sends, so the numbers in the email are always
derived from the same inputs you checked.

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

**Updates never interrupt you.** A new version is applied when you next open the
app, never while you're part-way through typing an invoice — there's nothing to
save it to.

## Tech

React, Vite, TypeScript, Tailwind CSS with DaisyUI, and a serverless function
using Nodemailer for delivery. Installable as a PWA.
