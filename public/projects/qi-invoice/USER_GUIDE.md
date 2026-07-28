# User Guide

Everything qi-invoice does, in the order you meet it.

## Before you start

The app is one page. You fill it in from the top down, check the result, and
download it. There is no account and nothing to log into. Nothing you type
leaves your device — there is no server for it to go to — so the invoice only
exists while you have the page open. Download it before you close the tab.

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
- **Email address** is optional and simply appears on the invoice, so the
  recipient knows how to reach you.
- **How you'd like to be paid** appears on the invoice under "How to pay". Bank
  name, account number or IBAN, payment terms — whatever the payer needs.

## 2. Who it's for

The same fields, for the other side. Only the name is required; the email
address is optional and just appears on the document.

Your browser won't offer to autofill this card with your own saved details.
That's deliberate: filling a client's address with your own is an easy mistake
to miss.

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

Anything you write here is printed on the invoice and can be read by anyone the
PDF is passed on to. Keep it to things you'd be happy for the recipient to keep
a copy of. Bank details for payment aren't a problem — those go in your own
payment details further up.

## 7. Closing message

Your sign-off. Works exactly like the opening message, standard wording and all.

## The running total

The bar pinned to the bottom of the screen shows the total as you work, with the
net figure and the VAT underneath it. It follows you down the page so you never
have to scroll to find out where you've got to.

## Checking it over

**Check it over** takes you to the review screen. If something required is
missing, you'll get a message saying which field, and you stay on the form.

The review screen shows the finished invoice — same numbers, same wording as the
file you'll get. Read it through. From here you can:

- **Back to editing** — nothing is lost.
- **Download PDF** — saves a file named after the invoice number, for example
  `INV-0007.pdf`. The text inside is real text, so the amounts can be searched
  and copied.
- **Print** — opens your browser's print dialogue, where "Save as PDF" is one of
  the destinations. The page prints as a clean invoice with none of the app's
  buttons or menus on it.

### Choosing a style

Above the invoice is a row of style choices. Pick one and the invoice below
redraws immediately, so you can compare them before committing. Whichever you
pick is used for both the downloaded PDF and Print, and it's remembered for next
time.

The style changes only how the invoice looks — never the figures, the fields, or
which lines appear.

There are five. Four are one branded design on different paper stocks — a deep
navy one that you get unless you change it, made for sending on screen; a white
one that's the best of them to print; a cream one that's easiest to read on real
paper; and one with the colour taken out for anywhere a coloured invoice would
look out of place. The four are the same invoice on different paper: the same
information sits in the same places on all of them.

The fifth is a plainer style. It's more compact than the other four, so a short
invoice usually fits on a single sheet, and nothing on it depends on colour.

### Which of the two should I use?

**Download PDF** for almost everything. It's one press, the filename is right,
and it behaves the same on a phone as on a computer.

**Print** if your invoice contains letters outside the Latin alphabet — Greek,
Cyrillic, Chinese, Japanese, Korean, or an emoji. The downloaded PDF uses a
built-in font that can't draw those, so rather than print the wrong characters
the app will tell you and ask you to use Print instead, which uses your
browser's own fonts and handles any language.

One difference to expect on the four branded styles: on screen and via Print
they use their own lettering, while the downloaded PDF falls back to a standard
one. The layout, the colours and every figure are the same — only the shapes of
the letters differ. The plain style looks identical either way.

## After downloading

The buttons stay where they are, so you can download again if you missed the
file or cancelled by accident. **Start another invoice** appears alongside them
and gives you a fresh form with your own details, currency, wording and the next
invoice number already filled in.

## What's remembered, and where

Once you've downloaded or printed an invoice, this browser keeps: your own
details, the currency, the VAT setting and percentage, the last unit you used,
your opening and closing wording, and the next invoice number.

It is stored on your device only. It is never sent anywhere — there is nowhere
for it to be sent — and it isn't shared between browsers or devices. **Forget my
saved details** in the menu wipes it.

The recipient's details are never kept. Different client each time, and
pre-filling someone else's details into a fresh invoice is an easy mistake to
miss.

## If something goes wrong

Every message says what happened and what to do next:

- **A missing field** names the field, and you stay on the form.
- **"The PDF can't include …"** — your invoice contains letters the downloaded
  file's font can't draw. Use **Print** instead; it handles any language.
- **"We couldn't build the PDF"** — something unexpected. Use **Print**, which
  goes an entirely different route.

In every case the invoice is still in front of you. Nothing is lost.

## Two things worth knowing

**Close the tab and the invoice is gone.** There is no server keeping a copy and
no draft saved anywhere. Download it before you leave. If you try to close the
page part-way through, your browser will warn you.

**Nothing you type is transmitted.** Not to us, not to anyone. The app works
with the network switched off entirely — once it's loaded, it never needs it
again.
