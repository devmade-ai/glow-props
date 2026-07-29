# Testing Guide

Manual scenarios for checking qi-invoice behaves. Work through them in order —
each builds on the last.

## 1. First run, empty state

1. Open the app in a private window, so nothing is remembered.
2. **Expect:** one empty item card, today's date, EUR, VAT off, standard opening
   and closing wording, invoice number `INV-0001`.
3. Press **Check it over** immediately.
4. **Expect:** an error naming the first missing field. You stay on the form.

## 2. A complete invoice

1. Fill in your name, then the recipient's name. Leave both emails blank.
2. **Expect:** no complaint about the missing emails — they're optional.
3. Add an item: "Design work", quantity `2.5`, unit `days`, price `400`.
4. **Expect:** line total `EUR 1,000.00`, and the bottom bar showing the same.
5. Add a deduction: "Deposit already paid", quantity `1`, price `250`.
6. **Expect:** the deduction card is tinted with a coloured left edge, its
   subtotal shows `-EUR 250.00`, and the bar now reads `EUR 750.00`.
7. Add an additional item: "Courier", quantity `1`, price `15`.
8. **Expect:** total `EUR 765.00`.

## 3. VAT

1. Tick **Add VAT**, leave it at 21.
2. **Expect:** a "VAT applies to this line" tick appears on every card, on by
   default, and the bar gains a VAT figure.
3. **Expect:** `Net EUR 765.00 · VAT 21% EUR 160.65`, total `EUR 925.65`.
4. Untick VAT on the courier line.
5. **Expect:** VAT drops to `EUR 157.50` (21% of 750.00), total `EUR 922.50`.

## 4. Number entry

1. In a price field type `10,50`. **Expect:** the line total reads `10.50`.
2. Type `10.005`. **Expect:** `10.01` — rounded, not rejected.
3. Type `abc`. **Expect:** the line total falls back to `0.00`, with no crash.
   The problem is reported when you press **Check it over**.
4. Type `-5`. **Expect:** the same. Negative prices are not accepted; a
   deduction is how you subtract.

## 5. Payment reference

1. Note that the reference field mirrors the invoice number.
2. Change the invoice number. **Expect:** the reference follows.
3. Type your own reference. Change the invoice number again.
4. **Expect:** the reference now stays as you typed it.

## 6. The warning on general instructions

1. Scroll to **General instructions**.
2. **Expect:** a collapsed "What not to put here" control with a warning icon.
3. Open it. **Expect:** a plain-language list — passwords, card numbers, ID
   numbers, other people's information — and a note that bank details for
   payment are fine.
4. Tab to it and press Enter. **Expect:** it opens from the keyboard too.

## 7. Review

1. **Check it over**. **Expect:** the page scrolls to the top of the review.
2. Compare every figure with the form. **Expect:** identical, to the cent.
3. **Back to editing**. **Expect:** nothing lost.

## 7a. Invoice style

1. On the review screen, note the **Invoice style** choices above the document.
2. Switch between them. **Expect:** the invoice redraws immediately — colours,
   lettering, row spacing and header treatment all change.
3. **Expect:** every figure is identical across styles, to the cent.
4. Download in one style, switch, download again. **Expect:** the two PDFs look
   different and carry the same numbers.
5. Download, then reload the page. **Expect:** your chosen style is remembered.
6. Tab to the choices and use the keyboard. **Expect:** they behave as a radio
   group, and the selected one is announced.
7. Clear the saved details and reload. **Expect:** a new user lands on the deep
   navy branded style, not the plain one.
8. **Expect** a routine invoice — a couple of items, a deduction, an additional
   item and both messages — to fit on ONE page in every style. Longer invoices
   run to two, which is correct; a second page holding only a line or two is not.
9. On the four branded styles, **expect:** a logo at the top left, ONE table
   holding every line, and a closing block with the payment details, the general
   instructions and the closing message stacked on the left, beside the totals
   on the right. A deduction row carries a small "deduction" marker beside its
   description and a minus on its total; an additional row a small "added" marker
   and a plus. An invoice with only items shows a plain table with no markers.
   **Expect** the column headings above the figures — quantity, unit price, line
   total — to be clearly separated rather than running together.
10. On the navy style, download a long enough invoice to run to two pages.
    **Expect:** the navy is painted on both pages, not just the first, and the
    final page carries the complete closing block — payment details, totals,
    instructions and sign-off together, never a single stray line.
    **Expect** also the same lettering as the screen, with every figure in a
    monospaced face — and select and copy the total to confirm you get the real
    digits rather than nonsense.
11. Clear the due date. **Expect:** the "Due in N days" pill disappears rather
    than showing something nonsensical. Set it to yesterday and **expect**
    "Overdue by 1 day"; set it to today and **expect** "Due today".

## 8. Download PDF

1. Press **Download PDF**.
2. **Expect:** a file named after the invoice number — `INV-0001.pdf` — with no
   dialogue in the way, and a confirmation message.
3. Open it. **Expect:** every figure matches the review screen exactly.
4. **Expect:** you can select and copy the total. It is text, not a picture.
5. **Expect:** the invoice number as the document's title, and a footer on each
   page.
6. Change the invoice number to `2026/07/12` and download again.
7. **Expect:** the file is named `2026-07-12.pdf` — slashes replaced, not a
   folder created.

## 9. A long invoice

1. Add enough lines to run past one page (about 25 items).
2. Download. **Expect:** several pages, `Page 1 of 3` style footers, and no line
   split across a page boundary.
3. **Expect:** the totals block is whole on one page, never split from its VAT
   line.

## 10. Non-Latin characters

1. Set the recipient's name to something in Greek, Cyrillic or Chinese —
   `Ελληνικά ΑΕ` will do.
2. Press **Download PDF**.
3. **Expect:** a message naming the characters that can't be included and
   pointing you at Print. **Expect:** no file downloaded, no crash, and the
   invoice still on screen.
4. Press **Print** instead. **Expect:** the preview shows the name correctly.

## 11. Print

1. From the review screen, press **Print**.
2. **Expect:** no header, no menu, no buttons in the preview.
3. **Expect:** white background and black text even if the app is in dark mode.
4. **Expect:** the section tints are still visible.
5. **Expect:** no line-item card and no totals block split across a page break.
6. **Expect:** the text in the resulting PDF is selectable, not a picture.

## 12. What's remembered

1. After downloading, press **Start another invoice**.
2. **Expect:** your own details, currency, VAT setting, unit and wording all
   still there; the recipient card empty; the invoice number advanced by one.
3. Reload the page entirely. **Expect:** the same.
4. Menu → **Forget my saved details**, then reload.
5. **Expect:** a completely fresh form.
6. Fill in a form but do NOT download. Reload.
7. **Expect:** the browser warns before leaving, and after reloading the draft
   is gone — an abandoned draft is not remembered.

## 13. Offline

1. Load the app, then disconnect from the network entirely.
2. **Expect:** everything still works, including Download PDF. There is nothing
   for it to reach.

## 14. Theme

1. Switch to dark. **Expect:** no flash of light when the page reloads.
2. **Expect:** on a phone, the status bar matches the theme and its text stays
   readable in both modes.
3. Open a second tab and change the theme there. **Expect:** the first tab
   follows.
4. With no theme chosen, change your device's light/dark setting. **Expect:**
   the app follows it. Then choose a theme explicitly and change the device
   setting again. **Expect:** the app keeps your choice.
5. In dark mode, download a PDF in the plain style. **Expect:** the PDF is black
   on white regardless — it is generated, not screenshotted. The app's
   light/dark setting and the invoice's style are separate: a dark app never
   darkens the invoice, and the navy stock stays navy in a light app.

## 15. Installing it

1. Menu → **Install app**. On Chrome, Edge or Brave expect the browser's own
   prompt; on Safari or Firefox expect written steps for that browser.
2. Install it and open it from the home screen.
3. **Expect:** no browser chrome, the correct icon, the correct status-bar
   colour.
4. Disconnect from the network and reload. **Expect:** the form still loads and
   still works.
5. After a new version ships, reopen the installed app.
6. **Expect:** it updates as it opens, without asking. If a new version arrives
   while you are part-way through an invoice, **expect** only a banner offering
   to restart — never an interruption.

## 16. Keyboard and screen reader

1. Tab from the top of the page. **Expect:** a "skip to the invoice form" link
   appears first.
2. Tab to the menu button, press Enter, then use Arrow Up/Down, Home and End.
3. **Expect:** focus cycles through the items, and Escape returns focus to the
   button.
4. Open the install instructions and press Tab repeatedly. **Expect:** focus
   stays inside the dialogue and returns to where it was when you close it.
5. **Expect:** every input has a visible label, not just grey placeholder text.

## Regression checklist

A quick pass after any change:

- [ ] Review-screen totals match the form's bottom bar exactly
- [ ] The downloaded PDF's totals match the review screen exactly
- [ ] The PDF's text is selectable, and the filename matches the invoice number
- [ ] A long invoice pages cleanly, with no split rows and no split totals block
- [ ] Non-Latin input is refused with a message pointing at Print, not a crash
- [ ] Print output has no app chrome and no split cards
- [ ] Dark mode has no flash on load, and does not affect the PDF
- [ ] The installed app still works with the network off
