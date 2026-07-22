# Testing Guide

Manual test scenarios for inTXT. Step-by-step actions, expected results, and a regression checklist.

---

## Prerequisites

- Two devices/browsers (or one browser with two incognito windows)
- Each device/window gets its own anonymous identity

---

## 1. First Launch & Tutorial

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open the app for the first time | Tutorial appears automatically |
| 2 | Step through all 4 slides | Each slide shows correct content; the dots indicator advances |
| 3 | Finish the tutorial | It closes; the home screen is visible |
| 4 | Reload | Tutorial does NOT reappear |
| 5 | Open the You tab → Help & tutorial | Tutorial reappears from the first slide |

---

## 2. Create Chat

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open the new-chat sheet → Start new | A chat code is generated (adjective-noun, e.g., "happy-tiger") |
| 2 | Optionally enter a display name (max 50 chars) | Name accepted, truncated at 50 |
| 3 | Tap "Share link" | Native share sheet opens with the join link |
| 4 | Tap "Copy code" | Code copied to clipboard, toast confirmation shown |
| 5 | Return to home | New chat appears in the list with the code (or display name if set) as title |

---

## 3. Join Chat

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open the new-chat sheet → Join, enter a valid code | Join button enabled |
| 2 | Tap "Join chat" | Navigates to the chat screen |
| 3 | Enter an invalid/nonexistent code | Plain-language error shown |
| 4 | Try to join an already-full chat (2 participants) | Error: chat is full |

### Join via Link

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open a shared link (`intxt.app/join#happy-tiger`) | Join screen with the code pre-filled and auto-validated |
| 2 | Tap "Join chat" | Navigates to the chat screen |

---

## 4. Messaging

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Type a message, tap send | Message appears with a single ✓ (sent) |
| 2 | Other user enters the chat | The ✓ becomes ✓✓ (read) |
| 3 | Send a message over 10,000 characters | Rejected or truncated at the limit |
| 4 | Send an empty message | Send button disabled, nothing sent |

### Pagination & Refresh

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tap the header refresh button | Conversation refetches |
| 2 | Pull down from the top of the chat | Loads older messages |

---

## 5. Intention Tags

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | While composing, tap the tag icon next to send | An inline intention picker opens above the input |
| 2 | Pick 1 intention | It appears as a removable chip above the input |
| 3 | Pick a 2nd intention | Both chips shown; max reached |
| 4 | Try a 3rd intention | Not allowed (max 2) |
| 5 | Type a custom word | Validates: letters/hyphens only, max 15 chars |
| 6 | Send | The message shows its intention tags immediately, to both people (no reveal step) |
| 7 | On an already-sent, untagged message, tap "tap to add intentions" | The intention editor opens |
| 8 | Wait 15+ minutes, try changing intentions | Action unavailable (window expired) |
| 9 | Change intentions 5 times, try again | Action unavailable (limit reached) |

---

## 6. Message Editing

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Long-press your own message | Action sheet appears with "Edit message" |
| 2 | Edit text, save | Message updated, "(edited)" label appears |
| 3 | Edit 5 times | Each edit succeeds |
| 4 | Try a 6th edit | Action unavailable (limit reached) |
| 5 | Wait 15+ minutes, try editing | Action unavailable (window expired) |
| 6 | Try editing the other user's message | "Edit" option not shown |

---

## 7. Emoji Reactions

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Long-press a message | The action sheet shows a quick row of 6 reactions |
| 2 | Tap "More" | The full grouped emoji set expands in the sheet |
| 3 | Tap an emoji | Reaction appears below the message with a count |
| 4 | Other user reacts with the same emoji | Count increments to 2 |
| 5 | Tap your own reaction again | Reaction removed (toggle off) |

---

## 8. Reply to Message

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Swipe a message horizontally (60px+) | Reply preview bar appears in the composer |
| 2 | Type a reply, send | Message shows a reply reference with a snippet |
| 3 | Tap the reply reference | Chat scrolls to the original message |
| 4 | Reply to a reply | References the original, not the intermediate reply (1-level deep) |

---

## 9. Message Deletion

### Delete for Me (Soft Delete)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Long-press a message → "Delete for me" | Confirmation dialog shown |
| 2 | Confirm | Message disappears from your view; still visible to the other person |

### Delete for Everyone (Hard Delete)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Long-press your own message (< 1 hour old) → "Delete for everyone" | Confirmation with a clear warning |
| 2 | Confirm | Message replaced with "[Message deleted]" for both users |
| 3 | Try on a message > 1 hour old | Option not available |

---

## 10. Message Info & Reporting

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Long-press a message → "Message info" | Shows sent/read timestamps, intentions, reactions |
| 2 | Long-press a message → "Report" | Report sheet with category selection |
| 3 | Pick a category, submit | Confirmation toast, report saved |
| 4 | Report 3+ times in an hour | Rate-limit error shown |

---

## 11. Message Scheduling

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Type a draft, tap the clock icon in the composer | Schedule presets appear (e.g. In 1 hour, This evening, Tomorrow) |
| 2 | Pick a time (or "Pick a date & time…") | The message is queued, not sent now |
| 3 | Open the chat menu → "Scheduled" | The pending message is listed |
| 4 | Edit or cancel a pending message | Change/cancel takes effect; cancelled messages leave the list |
| 5 | Wait until the send time | The message is delivered and a notification fires |

---

## 12. Notifications

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open the You tab → Settings | A single "Notifications" row is visible |
| 2 | Enable notifications | Browser permission prompt (web) or system prompt (native) |
| 3 | Receive a message while the app is in the background | A push notification appears |
| 4 | Tap the notification | Opens the relevant chat |
| 5 | Receive a message while the app is in the foreground | An in-app banner slides in from the top (auto-dismisses after 4s) |
| 6 | Turn on "Message previews" | Notifications include the message text + intention tags (off by default) |

---

## 13. PWA Installation (Web)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open in Chrome (not installed) | An "Install" affordance is available |
| 2 | Install | App opens in standalone mode; install affordance hidden |
| 3 | Open in Safari / Firefox | Manual install instructions shown |
| 4 | After a new version deploys | An "Update" affordance appears for installed users |

---

## 14. Desktop Layout (Web, > 768px)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open on a wide screen (> 768px) | Side-by-side layout: chat list (left), conversation (right) |
| 2 | Click a chat in the sidebar | It opens in the right panel (no navigation) |
| 3 | Resize below 768px | Switches to mobile stack navigation |
| 4 | Resize back above 768px | Returns to side-by-side |

---

## 15. Chat Management

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open the chat header menu | Options: Edit name, Copy code, Share link, Scheduled, End chat |
| 2 | Edit the display name | Name updated in the chat list and header |
| 3 | End the chat (confirm) | The chat is removed for BOTH participants (ending is mutual and irreversible) |

---

## 16. Rate Limiting

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send 30+ messages in 1 minute | Rate-limit error after the 30th |
| 2 | Create 15+ chats in 1 hour | Rate-limit error after the 15th |
| 3 | Report 3+ messages in 1 hour | Rate-limit error after the 3rd |

---

## Regression Checklist

Run through before any release:

- [ ] First-launch tutorial completes without errors
- [ ] Create chat generates a valid code
- [ ] Join works with a manual code and a shared link
- [ ] Messages send and show ✓ / ✓✓ read receipts
- [ ] Intention tags can be added while composing and after sending, and display to both people immediately
- [ ] Message editing works within the 15-min / 5-edit limits
- [ ] Emoji reactions (quick 6 + More) add, remove, and show counts
- [ ] Reply with a swipe gesture works on mobile and desktop
- [ ] Soft delete hides a message for one user only
- [ ] Hard delete shows a tombstone for both users
- [ ] Scheduled messages send at the chosen time
- [ ] Push notifications work in the background (web and native)
- [ ] In-app notifications work in the foreground
- [ ] PWA installs on Chrome, shows instructions on Safari/Firefox
- [ ] Desktop layout switches correctly at the 768px breakpoint
- [ ] Ending a chat removes it for both participants
- [ ] Rate limits enforce correctly
- [ ] No console errors in the production build
