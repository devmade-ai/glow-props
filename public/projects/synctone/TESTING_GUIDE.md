# Testing Guide

Manual test scenarios for SyncTone. Step-by-step actions, expected results, and regression checklist.

---

## Prerequisites

- Two devices/browsers (or one browser with two incognito windows)
- App running locally (`npm run web`) or deployed to Vercel
- Each device/window gets its own anonymous identity (appID)

---

## 1. First Launch & Tutorial

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open app for the first time | Tutorial modal appears automatically |
| 2 | Navigate through all 9 steps | Each step shows correct content, progress bar advances |
| 3 | Complete tutorial | Modal closes, home screen visible |
| 4 | Reload page | Tutorial does NOT reappear |
| 5 | Open Settings > Help & Tutorial | Tutorial reappears from step 1 |

---

## 2. Create Chat

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tap "Create Chat" | Create screen appears |
| 2 | Optionally enter display name (max 50 chars) | Name accepted, truncated at 50 |
| 3 | Tap "Create" | Chat code generated (adjective-noun format, e.g., "happy-tiger") |
| 4 | Tap "Share Link" | Native share sheet opens with join URL |
| 5 | Tap "Copy Code" | Code copied to clipboard, toast confirmation shown |
| 6 | Return to home screen | New chat appears in list with code as title (or display name if set) |

---

## 3. Join Chat

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tap "Join Chat" | Join screen appears |
| 2 | Enter valid chat code | Join button enabled |
| 3 | Tap "Join Chat" | Navigates to chat screen |
| 4 | Enter invalid/nonexistent code | Error message shown in plain language |
| 5 | Try to join already-full chat (2 participants) | Error: chat is full |

### Join via Link

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click shared link (`/join/happy-tiger`) | Join screen with code pre-filled |
| 2 | Tap "Join Chat" | Navigates to chat screen |

---

## 4. Messaging

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Type message, tap send | Message appears in chat with single gray checkmark (sent) |
| 2 | Other user opens home screen | Checkmarks change to double gray (delivered) |
| 3 | Other user enters chat | Checkmarks change to double blue (read) |
| 4 | Send message with 10,000+ characters | Message rejected or truncated at limit |
| 5 | Send empty message | Send button disabled, nothing sent |

### Pull-to-Refresh

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Pull up from bottom of chat | Page refreshes |
| 2 | Pull down from top of chat | Loads older messages (pagination) |

---

## 5. Tone Tags

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a message | Message appears without tones |
| 2 | Tap "tap to add tones" hint below own message | ToneEditModal opens |
| 3 | Select 1 tone from defaults | Tone tag appears on message |
| 4 | Select 2 tones | Both tags shown, max reached |
| 5 | Try selecting a 3rd tone | Not allowed (max 2) |
| 6 | Type custom tone in input | Validates: letters/hyphens only, max 15 chars |
| 7 | Save tones | Modal closes, tones visible on message |
| 8 | Other user enters chat | Tones automatically revealed |
| 9 | Wait 15+ minutes, try changing tones | Action unavailable (window expired) |
| 10 | Change tones 5 times, try again | Action unavailable (limit reached) |

---

## 6. Message Editing

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Long-press/tap own message | Action sheet appears with "Edit Message" |
| 2 | Edit text, save | Message updated, "(edited)" label appears |
| 3 | Edit 5 times | Each edit succeeds, edit count tracks |
| 4 | Try 6th edit | Action unavailable (limit reached) |
| 5 | Wait 15+ minutes, try editing | Action unavailable (window expired) |
| 6 | Try editing other user's message | "Edit" option not shown |

---

## 7. Emoji Reactions

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Long-press any message > "React" | Reaction picker shows 12 emojis |
| 2 | Tap an emoji | Reaction appears below message with count |
| 3 | Other user reacts with same emoji | Count increments to 2 |
| 4 | Tap own reaction again | Reaction removed (toggle off) |
| 5 | Both users react differently | Both reactions shown with individual counts |

---

## 8. Reply to Message

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Swipe message horizontally (60px+) | Reply preview bar appears in compose area |
| 2 | Type reply, send | Message shows reply reference with snippet |
| 3 | Tap reply reference on message | Chat scrolls to original message |
| 4 | Reply to a reply | References the original, not the intermediate reply (1-level deep) |

### Gesture Variants

| Platform | Gesture | Expected Result |
|----------|---------|-----------------|
| Mobile web | Swipe left or right | Reply triggered at 60px threshold |
| Desktop web | Right-click > Reply | Reply preview bar appears |
| Native | Swipe with visual feedback | Animated translateX, reply icon fades in |

---

## 9. Message Deletion

### Delete for Me (Soft Delete)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Long-press message > "Delete for Me" | Confirmation dialog shown |
| 2 | Confirm | Message disappears from your view |
| 3 | Check other user's view | Message still visible to them |

### Delete for Everyone (Hard Delete)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Long-press own message (< 1 hour old) > "Delete for Everyone" | Confirmation with clear warning |
| 2 | Confirm | Message replaced with "[Message deleted]" for both users |
| 3 | Try on message > 1 hour old | Option not available |

---

## 10. Message Info & Reporting

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Long-press message > "Message Info" | Modal shows sent/delivered/read timestamps, tones, reactions |
| 2 | Long-press message > "Report" | Report modal with category selection |
| 3 | Select category, submit | Confirmation toast, report saved |
| 4 | Report 3+ times in an hour | Rate limit error shown |

---

## 11. Notifications

See also: `docs/NOTIFICATION_TEST_PLAN.md` for detailed notification testing.

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open Settings (gear icon) | Notification toggle(s) visible |
| 2 | Enable notifications | Browser permission prompt (web) or system prompt (native) |
| 3 | Receive message while app in background | Push notification appears |
| 4 | Tap notification | Opens relevant chat |
| 5 | Receive message while app in foreground | In-app banner slides in from top (4s auto-dismiss) |
| 6 | Verify bell icon in header | Reflects actual notification state (not just permission) |

---

## 12. PWA Installation (Web Only)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open in Chrome (not installed) | "Install" button visible in header |
| 2 | Tap "Install" | Browser install prompt appears |
| 3 | Accept install | App opens in standalone mode, install button hidden |
| 4 | Open in Safari | "Install" shows with manual instructions |
| 5 | Open in Firefox | "Install" shows with manual instructions |
| 6 | Check installed PWA for updates | "Update" button appears when new SW version available |

---

## 13. Desktop Layout (Web, > 768px)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open on wide screen (> 768px) | Side-by-side layout: chat list (left), chat panel (right) |
| 2 | Click a chat in sidebar | Chat opens in right panel (no navigation) |
| 3 | Click "Create Chat" | Modal opens centered (400px width) |
| 4 | Resize window to < 768px | Switches to mobile stack navigation |
| 5 | Resize back to > 768px | Returns to side-by-side layout |

---

## 14. Chat Management

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open chat header menu | Options: Edit Name, Copy Code, Share Link, End Chat |
| 2 | Edit display name | Name updated in chat list and header |
| 3 | End chat | Chat disappears from your list, other user unaffected |

---

## 15. Rate Limiting

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send 30+ messages in 1 minute | Rate limit error after 30th |
| 2 | Create 15+ chats in 1 hour | Rate limit error after 15th |
| 3 | Report 3+ messages in 1 hour | Rate limit error after 3rd |

---

## Regression Checklist

Run through before any release:

- [ ] First launch tutorial completes without errors
- [ ] Create chat generates valid code
- [ ] Join chat works with manual code and shared link
- [ ] Messages send, deliver, and show read receipts
- [ ] Tone tags can be added, changed (within limits), and auto-reveal
- [ ] Message editing works within 15-min / 5-edit constraints
- [ ] Emoji reactions add, remove, and show counts correctly
- [ ] Reply with swipe gesture works on mobile and desktop
- [ ] Soft delete hides message for one user only
- [ ] Hard delete shows tombstone for both users
- [ ] Push notifications work in background (web and native)
- [ ] In-app notifications work in foreground
- [ ] PWA installs correctly on Chrome, shows instructions on Safari/Firefox
- [ ] Desktop layout switches correctly at 768px breakpoint
- [ ] Pull-to-refresh works on home screen and chat
- [ ] Rate limits enforce correctly
- [ ] No console errors in production build
