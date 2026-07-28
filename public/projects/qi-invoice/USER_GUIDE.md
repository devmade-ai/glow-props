# User Guide

Everything qi-invoice does, in the order you meet it.

## Before you start

The app is one page. You fill it in from the top down, check the result, and
send it. There is no account, nothing to log into, and nothing saved on our
side — so the invoice only exists while you have the page open, and once it's
sent we have no copy to re-send or correct.

If you want a file to keep, use **Save as PDF** on the review screen or on the
confirmation screen afterwards.

## The header menu

The button in the top right opens the menu.

| Item | What it does |
|---|---|
| **Switch to light / dark** | Flips the theme. The label tells you what you'll switch *to*. Your choice is remembered and overrides your system setting from then on |
| **Slate / Warm / Plain** | Three colour schemes. The menu stays open so you can try each one and watch the page change. "current" marks the one in use |
| **Check for updates** | Asks whether a newer version of the app is available and tells you either way |
| **Automatic updates: on / off** | When on, a new version is applied the next time you open the app. It never interrupts you while you're typing |
| **Install app** | Adds qi-invoice to your home screen or desktop. On browsers that can't do it automatically you get the steps for yours |
| **Forget my saved details** | Clears everything the app remembered about you from this device |

## 1. Your details

Who the invoice is from.

- **Name or company** and **Email address** are required. Everything else is
  optional.
- **Address** starts with one line. Use *Add another address line* for more, and
  *Remove* to take one away. Blank lines are ignored, so you don't have to tidy
  up before sending.
- **Email address** is where replies go. When the recipient hits reply, it
  reaches you, not the app.
- **How you'd like to be paid** appears on the invoice under "How to pay". Bank
  name, account number or IBAN, payment terms — whatever the payer needs.

## 2. Who it's for

The same fields, for the other side. The invoice is emailed to the address you
put here, so check it carefully — there is no way to recall it afterwards.

Your browser won't offer to autofill this card with your own saved details.
That's deliberate: filling a client's address with your own is an easy mistake
to send.

## 3. Invoice details

- **Invoice number** — anything you like. If it ends in a number, the app
  offers the next one along the next time you use it (`INV-0007` becomes
  `INV-0008`).
- **Payment reference** — what the payer should quote. It follows the invoice
  number automatically until you type something different, after which it stays
  as you set it.
- **Invoice date** defaults to today. **Due date** is optional and is left off
  the invoice if you leave it blank.
- **Currency** applies to the whole invoice. Every line uses it — that's what
  makes a single total possible.
- **Add VAT** reveals a percentage box. With VAT switched on, each line gets a
  "VAT applies to this line" tick so you can exclude the ones it doesn't cover.

## 4. Opening message

The first thing the recipient reads. There's standard wording already in the
box. Change it however you like; if you want the original back, a *Put the
standard wording back* button appears once you've edited it.

## 5. Items, deductions, and additional items

Three sections, same fields in each, different effect on the total.

| Section | Effect | Use it for |
|---|---|---|
| **Items** | Adds | What you're charging for |
| **Deductions** | Subtracts | Discounts, credits, deposits already paid |
| **Additional items** | Adds | Delivery, expenses, a late fee |

Deductions and additional items are tinted and have a coloured edge so you can
tell at a glance which is which, and each subtotal shows its sign (`-` or `+`).

Each line has:

- **Description** — required.
- **Quantity** and **Unit** — the unit is free text ("hours", "days", "items").
  Once you've typed one, new lines in that section start with the same unit.
- **Price per unit** — in the invoice currency. Type it however you like: `10`,
  `10.50` and `10,50` all work.
- **VAT applies to this line** — only shown when VAT is on.
- **Notes** — optional, printed under the description.

The **line total** is shown on each card and updates as you type. Use the arrows
to reorder lines within a section, and *Remove* to delete one.

At least one item is required. An invoice made only of deductions isn't an
invoice.

## 6. General instructions

Optional, and the one field worth a warning — which is why there's a **What not
to put here** link above it. Open it once.

Anything you write here goes into the email and can be read by anyone who
receives or forwards it. Keep it to things you'd be happy for the recipient to
keep a copy of. Bank details for payment aren't a problem — those go in your
own payment details further up.

## 7. Closing message

Your sign-off. Works exactly like the opening message, standard wording and all.

## The running total

The bar pinned to the bottom of the screen shows the total as you work, with the
net figure and the VAT underneath it. It follows you down the page so you never
have to scroll to find out where you've got to.

## Checking it over

**Check it over** takes you to the review screen. If something required is
missing, you'll get a message saying which field, and you stay on the form.

The review screen shows the invoice exactly as it will arrive — same layout,
same numbers, same wording. Read it through. From here you can:

- **Back to editing** — nothing is lost.
- **Save as PDF** — your browser's print dialogue, set up to produce a clean
  invoice with none of the app's buttons or menus on it.
- **Send the invoice** — the button that actually sends.

## After sending

You get a confirmation naming the address it went to. A copy has gone to the
account inbox, so there's a record it happened.

Two buttons: **Save as PDF**, if you didn't already — this page is the only copy
left — and **Start another invoice**, which gives you a fresh form with your own
details, currency, wording and the next invoice number already filled in.

## What's remembered, and where

After a successful send, this browser keeps: your own details, the currency, the
VAT setting and percentage, the last unit you used, your opening and closing
wording, and the next invoice number.

It is stored on your device only. It is never sent anywhere, and it isn't shared
between browsers or devices. **Forget my saved details** in the menu wipes it.

The recipient's details are never kept.

## If something goes wrong

Every failure says what happened and what to do next:

- **A missing or wrong field** names the field. Nothing has been sent.
- **"You appear to be offline"** — your invoice is still on screen. Reconnect
  and press send again.
- **"We couldn't reach the server"** — the same; nothing was sent.
- **"You've sent several invoices in a short time"** — there's a limit on how
  many can go out from one connection per hour. Wait a little and retry.
- **"We couldn't send the invoice"** — check the recipient's email address
  first; that's the usual cause.

In every one of these cases the invoice is still in front of you. Nothing is
lost, and nothing has been half-sent.
