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

1. Fill in your details (name and email), then the recipient (name and email).
2. Add an item: "Design work", quantity `2.5`, unit `days`, price `400`.
3. **Expect:** line total `EUR 1,000.00`, and the bottom bar showing the same.
4. Add a deduction: "Deposit already paid", quantity `1`, price `250`.
5. **Expect:** the deduction card is tinted with a coloured left edge, its
   subtotal shows `-EUR 250.00`, and the bar now reads `EUR 750.00`.
6. Add an additional item: "Courier", quantity `1`, price `15`.
7. **Expect:** total `EUR 765.00`.

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

## 7. Review and send

1. **Check it over**. **Expect:** the page scrolls to the top of the review.
2. Compare every figure with the form. **Expect:** identical, to the cent.
3. **Back to editing**. **Expect:** nothing lost.
4. **Check it over** again, then **Send the invoice**.
5. **Expect:** the button reads "Sending…", then a success message and a
   confirmation panel naming the recipient.
6. **Check the recipient's inbox.** Expect the invoice, and expect a reply to go
   back to the sender's own address.
7. **Check the account inbox.** Expect the same message.

## 8. Save as PDF

1. From the review screen, press **Save as PDF**.
2. **Expect:** no header, no menu, no buttons, no bottom bar in the preview.
3. **Expect:** white background and black text even if the app is in dark mode.
4. **Expect:** the section tints are still visible.
5. **Expect:** no line-item card and no totals block split across a page break.
6. **Expect:** the text in the resulting PDF is selectable, not a picture.

## 9. What's remembered

1. After a successful send, press **Start another invoice**.
2. **Expect:** your own details, currency, VAT setting, unit and wording all
   still there; the recipient card empty; the invoice number advanced by one.
3. Reload the page entirely. **Expect:** the same.
4. Menu → **Forget my saved details**, then reload.
5. **Expect:** a completely fresh form.

## 10. When things go wrong

1. Disconnect from the network and press send.
2. **Expect:** "You appear to be offline…", and the invoice still on screen.
3. Reconnect. Send six invoices within an hour from the same connection.
4. **Expect:** the sixth is refused with a message asking you to wait and try
   again — and the invoice is still there, not half-sent.

## 11. Theme

1. Switch to dark. **Expect:** no flash of light when the page reloads.
2. **Expect:** on a phone, the status bar matches the theme and its text stays
   readable in both modes.
3. Open a second tab and change the theme there. **Expect:** the first tab
   follows.
4. With no theme chosen, change your device's light/dark setting. **Expect:**
   the app follows it. Then choose a theme explicitly and change the device
   setting again. **Expect:** the app keeps your choice.

## 12. Installing it

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

## 13. Keyboard and screen reader

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
- [ ] The email's totals match the review screen exactly
- [ ] Save as PDF has no app chrome and no split cards
- [ ] Sending twice in quick succession is limited, not duplicated
- [ ] Dark mode has no flash on load
- [ ] The installed app still opens without a connection
