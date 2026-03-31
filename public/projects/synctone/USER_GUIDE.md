# SyncTone User Guide

A complete guide to using SyncTone — anonymous messaging with tone tags.

---

## Getting Started

### What is SyncTone?

SyncTone is an anonymous messaging app. There are no accounts, phone numbers, or emails. Your identity is a random ID stored on your device.

The key feature: after sending a message, you can tag it with a **tone** (like "happy", "sarcastic", or "serious") so the other person knows how you meant it. Tones are revealed when they open the chat.

### First Launch

When you open SyncTone for the first time:

1. A unique device ID is created automatically (no sign-up needed)
2. An interactive tutorial walks you through the basics (9 steps)
3. You can re-access the tutorial anytime from **Settings > Help & Tutorial**

**Important:** Your identity is tied to your device. Uninstalling the app permanently deletes your identity — there is no recovery.

---

## Chats

### Creating a Chat

1. Tap **Create Chat** on the home screen
2. Optionally enter a display name for this chat (e.g., "Work Chat") — only you see this name
3. You'll receive a unique chat code like **"happy-tiger"**
4. Share the code or link with someone:
   - **Share Link** (primary): Opens your device's share sheet to send via SMS, WhatsApp, email, etc.
   - **Copy Code** (secondary): Copies just the code to your clipboard

### Joining a Chat

There are two ways to join:

- **Via link**: Click a shared link (e.g., `synctone.vercel.app/join/happy-tiger`) — the code is pre-filled, just tap "Join Chat"
- **Manually**: Tap **Join Chat** on the home screen and type the code

You can optionally set your own display name when joining.

### Chat List

The home screen shows all your active chats with:

- Chat display name (or code if no name was set)
- Last message preview
- Unread message count badge
- Pull down to refresh the list

### Ending a Chat

Open the chat menu (top-right) and select **End Chat**. This removes the chat from your view only — the other person still sees it.

---

## Messages

### Sending Messages

Type your message in the compose bar and tap send. Messages can be up to 10,000 characters.

### Tone Tags

After sending a message, you can add up to **2 tone tags**:

1. Tap the **"tap to add tones"** hint below your message, or use the message menu and select **Add Tones**
2. Choose from:
   - **6 defaults**: happy, sad, serious, joking, sarcastic, sincere
   - **Recent**: Your previously used custom tones
   - **Custom**: Type any single word (letters and hyphens only, max 15 characters)
3. Tones appear as colored text labels on your message

**When are tones revealed?** Tones are hidden until the other person opens the chat. This lets them read the message first, then see how you intended it.

**Time limit:** You can add or change tones within **15 minutes** of sending, up to **5 tone changes** per message.

### Editing Messages

- Tap a message you sent and select **Edit Message**
- You have **15 minutes** after sending to edit
- Maximum **5 edits** per message
- Edited messages show an "(edited)" label

### Replying to Messages

- Swipe a message left or right to reply (mobile)
- Or tap/long-press a message and select **Reply**
- A preview bar appears in the compose area showing what you're replying to
- Tap the reply reference on any message to scroll to the original

### Emoji Reactions

- Tap or long-press a message and select **React**
- Choose from 12 emojis: 👍 ❤️ 😂 😮 😢 🙏 🎉 🔥 👏 💯 ✨ 🤔
- Tap the same emoji again to remove your reaction
- Reactions show with counts on the message bubble

### Deleting Messages

Two options available from the message menu:

- **Delete for Me**: Removes the message from your view only. The other person still sees it.
- **Delete for Everyone**: Permanently removes the message for both people. Available within **1 hour** of sending. Shows a "[Message deleted]" placeholder.

### Copying Text

Tap or long-press a message and select **Copy Text** to copy the message content to your clipboard.

### Message Info

Select **Message Info** from the message menu to see:

- Sent, delivered, and read timestamps
- Tone tags with colors
- Emoji reactions and who reacted
- Edit count and last edited time

### Reporting Messages

If you receive inappropriate content:

1. Tap or long-press the message
2. Select **Report**
3. Choose a category (Spam, Harassment, Inappropriate Content, or Other)
4. Optionally add details
5. Reports are anonymous

---

## Read Receipts

Messages show delivery status with checkmarks:

| Indicator | Meaning |
|-----------|---------|
| ✓ (single gray) | Sent — message saved |
| ✓✓ (double gray) | Delivered — other person opened the app |
| ✓✓ (double blue) | Read — other person opened this chat |

---

## Notifications

SyncTone can notify you when new messages arrive.

### Enabling Notifications

1. Tap the **gear icon** (top-right on home screen) to open Settings
2. Enable notifications:
   - **Mobile app**: One toggle — "Browser Notifications"
   - **Web browser**: Two toggles — "Browser Notifications" (browser permission) and "Push Notifications" (subscription)

### How Notifications Work

- **Background**: Standard system notifications when the app is not in focus
- **Foreground**: A slide-in banner at the top of the screen (auto-dismisses after 4 seconds)
- Tap any notification to open the relevant chat
- The app icon badge shows your total unread count

### Notification Status

The bell icon (🔔) on the home screen reflects whether notifications are actually working — not just whether you granted permission. If notifications stop working (e.g., browser settings changed), the icon updates accordingly.

---

## Installing as an App (PWA)

SyncTone works as a Progressive Web App — you can install it on your device for an app-like experience.

### Chrome, Edge, Brave

An **Install** button appears in the home screen header when available. Tap it to install.

### Safari

1. Tap the Share button
2. Select **Add to Home Screen**
3. Tap **Add**

### Firefox

1. Tap the menu (three dots)
2. Select **Install** or **Add to Home Screen**

### Updates

Installed PWA users see an **Update** button (sparkles icon) in the header when a new version is available. Tap to update and reload.

---

## Desktop Layout

On screens wider than 768px, SyncTone shows a side-by-side layout:

- **Left sidebar**: Your chat list with Create/Join buttons
- **Right panel**: The active conversation

Click a chat in the sidebar to view it. Create Chat and Join Chat open as centered modals.

---

## Privacy & Security

- **Anonymous identity**: Your device generates a random ID — no accounts, no emails, no phone numbers
- **No recovery**: Uninstalling the app permanently deletes your identity. There is no "forgot password" or account recovery
- **Chat codes are single-use**: Each code connects exactly two people
- **Your display names are private**: Only you see the names you give your chats
- **Rate limiting**: Built-in protection against spam and abuse
- **Message reporting**: Flag inappropriate content anonymously

---

## Tips

- **Name your chats** with display names so you can tell them apart (e.g., "Book Club", "Work Project")
- **Tone tags are optional** — use them when the tone of your message might be ambiguous
- **The same tone always gets the same color** across all users, so "happy" looks the same for everyone
- **Pull down to refresh** the chat list or messages if something seems stuck
- **Access the tutorial anytime** from Settings > Help & Tutorial
