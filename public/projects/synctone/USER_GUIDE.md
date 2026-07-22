# inTXT User Guide

A complete guide to using inTXT — anonymous messaging with intention tags.

---

## Getting Started

### What is inTXT?

inTXT is an anonymous messaging app. There are no accounts, phone numbers, or emails. Your identity is a random ID stored on your device.

The key feature: you can tag any message with an **intention** (like "happy", "sarcastic", or "serious") so the other person knows how you meant it — either while composing or after sending. Tags appear right on the message.

### First Launch

When you open inTXT for the first time:

1. A unique device ID is created automatically (no sign-up needed)
2. A short interactive tutorial walks you through the basics (4 steps)
3. You can re-access the tutorial anytime from the **You tab > Help & tutorial**

**Important:** Your identity is tied to your device. Uninstalling the app permanently deletes your identity — there is no recovery.

---

## Chats

### Creating a chat

1. Tap the **pen button** (top-right of the home screen), then **Start a new chat**
2. You instantly get a unique chat code like **"happy-tiger"**, right there in the sheet
3. Share it with someone:
   - **Share link** (primary): Opens your device's share sheet to send via SMS, WhatsApp, email, etc.
   - **Copy code** (secondary): Copies just the code to your clipboard
4. Tap **Open chat** to go to the conversation and wait for them to join. You can give the chat your own private name anytime — chat-list **⋮ → Rename**, or the in-chat menu (only you see it).

### Joining a chat

There are two ways to join:

- **Via link**: Click a shared link (e.g., `intxt.app/join#happy-tiger`) — the code is pre-filled, just tap "Join chat"
- **Manually**: Tap the **pen button**, choose **Join**, and type the code

You can optionally set your own display name when joining.

### Filtering chats by intention

Once your chats carry intention tags, a filter rail appears above the list — tap a tag like **[joking]** to show only chats whose latest message carries it; tap it again (or **all**) to clear.

You can optionally set your own display name when joining.

### Chat List

The home screen shows all your active chats with:

- Chat display name (or code if no name was set)
- Last message preview, with its intention tag shown inline (e.g. **[joking]**) so you can see the tone at a glance
- Unread message count badge
- A ✓ / ✓✓ tick on your own last message (✓ sent, ✓✓ read) — so you can tell whether they've read it without opening the chat
- Pull down to refresh the list

### Activity tab

The **Activity** tab (bottom bar) is your "waiting on you" list — every chat where the other person sent something you haven't read yet, newest first, each with its intention tag. Tap one to jump straight into that chat (which marks it read). When nothing's waiting, you'll see a "You're all caught up" message.

### Renaming a chat

Give a chat your own name (or change it) any time after it's created:

- **From the chat list**: tap the **⋮** on the chat row (or long-press the row) → **Rename**
- **Inside the chat**: open the chat menu (top-right ⋮) → **Set name** / **Edit name**

The name is private to you — the other person sees their own name or the chat code. Clearing the field puts the chat code back as the title.

### Ending a Chat

Open the chat menu (top-right ⋮) → **End chat**, or tap the **⋮** on the chat row in the list (or long-press the row) → **End chat**, then confirm. This **ends the chat for both of you** — it disappears from both of your chat lists and can't be undone.

---

## Messages

### Sending Messages

Type your message in the compose bar and tap send. Messages can be up to 10,000 characters.

Web/links (`https://…`) in a message are tappable — tap one to open it in a new tab. (Long-press a message with a link to copy it instead.)

### Talking instead of typing

On a phone, you can dictate a message instead of typing it: tap the **microphone on your phone's keyboard** and start speaking — your words appear in the compose box, ready to send or edit. It works in any chat, and inTXT never hears or stores the audio — your phone's keyboard does the listening and just hands inTXT the finished text. The first time, a small tip points this out; tap **got it** to dismiss it for good. (Whether the speech is handled on your phone or by Apple/Google depends on your phone and its settings, not on inTXT.)

### Sharing text from another app

If you've installed inTXT to your home screen on Android (Chrome, Edge, or another Chromium browser), inTXT shows up in the system **Share** menu. So when you're reading something in another app — a message, an article, a link — you can send it straight into a chat:

1. Tap **Share** in the other app and pick **inTXT**
2. inTXT opens to a short list of your active chats with a preview of what you're sharing
3. Tap the chat you want — the shared text drops into that chat's compose bar, ready to send or edit first

The text isn't sent automatically; you always get to review it (and add intention tags) before tapping send. You can only share into chats the other person has already joined.

> **Note:** This works on installed Android PWAs. iPhone/iPad (Safari) doesn't support apps registering in the share menu, so inTXT won't appear there — paste the text in manually instead.

### Scheduling Messages

Want a message to send later? Type it, then tap the **clock icon** (next to send).

1. A picker shows the target send time (defaults to 1 hour from now, rounded to the nearest 5 minutes)
2. Pick any time between **2 minutes** and **30 days** from now
3. Tap **Schedule** — you'll see a toast confirming when it'll send
4. The message is queued on our servers; it'll go out even if the app is closed

**Managing scheduled messages:**
- Tap the chat menu (⋮) → **Scheduled (N)** to see pending and failed scheduled messages for this chat
- **Edit** lets you change the message text, its intentions, and the send time — no need to cancel and start over to fix a typo
- **Cancel** removes the message entirely (it'll never send)
- If the other person hasn't joined the chat yet by send time, the message is still delivered — they'll see it when they join
- If you end the chat before send time, the scheduled message won't go out — it'll show as failed so you can see what happened

**Limits:** Up to 20 pending scheduled messages per user; up to 10 schedules per hour.

### Intention Tags

You can tag any message with up to **2 intentions**, before or after sending:

**While composing:** Tap the **tag icon** next to the send button — an intention picker opens right above the keyboard, so the conversation stays visible. Pick your intentions, tap **done** to collapse it, then send. Selected tags show as small chips above the input — tap a chip to remove it.

**After sending:** Tap the **"tap to add intentions"** hint below your message, or use the message menu and select **Add Intentions** / **Change Intentions**.

Either way, choose from:
- **6 defaults**: happy, sad, serious, joking, sarcastic, sincere
- **Recent**: Your previously used custom intentions
- **Custom**: Type any single word (letters and hyphens only, max 15 characters)

Intentions appear as colored text labels on your message, visible to both of you.

**Time limit:** After sending, you can add or change intentions within **15 minutes**, up to **5 intention changes** per message.

**In notifications:** If the other person has Message Previews turned on, your intentions appear in their notification alongside the message text (e.g. "sure, whatever — joking").

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

- Tap or long-press a message — the action menu opens with a **quick row of 6** common reactions (👍 ❤️ 😂 😮 😢 🙏) at the top for one-tap reacting
- Tap **More** to expand the full grouped set (smileys, feelings, gestures, hearts, fun)
- Tap the same emoji again to remove your reaction
- Reactions show with counts on the message bubble
- The author of the message gets a notification when you react (if they have notifications on). Removing a reaction doesn't notify anyone.

### Deleting Messages

Two options available from the message menu:

- **Delete for Me**: Removes the message from your view only. The other person still sees it.
- **Delete for Everyone**: Permanently removes the message for both people. Available within **1 hour** of sending. Shows a "[Message deleted]" placeholder.

### Copying Text

Tap or long-press a message and select **Copy Text** to copy the message content to your clipboard.

### Message Info

Select **Message Info** from the message menu to see:

- Sent and read timestamps
- Intention tags with colors
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

Messages show status with checkmarks:

| Indicator | Meaning |
|-----------|---------|
| ✓ (single gray) | Sent — message saved |
| ✓✓ (double blue) | Read — other person opened this chat |

The same tick appears next to your last message in the chat list, so you can glance at the home screen and see whether your latest message was read — no need to open the chat.

---

## Notifications

inTXT can notify you when new messages arrive.

### Enabling Notifications

1. Open **You** (bottom-right on mobile; the person icon at the top of the sidebar on desktop), then tap **Settings**
2. Tap **Notifications** — a single row turns them on (and on the web, subscribes you) in one tap. It shows **On**, **Off**, or **Blocked — tap for help** if your browser or device has them blocked.

On the web, inTXT also asks once automatically — **right after you finish the tutorial**, never before — so the request makes sense in context. If you miss or dismiss it, the Notifications row above always works.

### Message Previews

By default, notifications keep your messages private — they say "You have a new message" without showing the text. This protects your messages on lock screens and shared devices.

**Automatic updates** (web, on by default) applies new versions the moment you open the app — never while you're in the middle of writing something. Turn it off if you'd rather apply updates yourself with the **Update** button.

**Reload app** (web) restarts the app and refetches everything — useful if something looks stuck.

**Clear all data** permanently deletes your identity and every chat on this device. Because there are no accounts and no recovery, the app asks you to type **delete** before the button activates — a stray tap can't wipe anything.

Want notifications to show the message text? Turn on **Message previews** in **Settings**. You can turn it off again anytime — a preview under the toggle shows exactly what the lock screen will reveal.

### How Notifications Work

- **Background**: Standard system notifications when the app is not in focus
- **Foreground**: A slide-in banner at the top of the screen (auto-dismisses after 4 seconds)
- Tap any notification to open the relevant chat
- The app icon badge shows your total unread count

### Notification Status

The bell icon (🔔) on the home screen reflects whether notifications are actually working — not just whether you granted permission. If notifications stop working (e.g., browser settings changed), the icon updates accordingly.

---

## Installing as an App (PWA)

inTXT works as a Progressive Web App — you can install it on your device for an app-like experience.

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

inTXT keeps itself up to date for you. When you open the app and a new version is ready, it applies right away with a quick refresh — before you've typed anything, so nothing you're writing can be lost.

If an update arrives **while you're using the app**, it never interrupts you. Installed users see an **Update** button (sparkles icon) in the header — tap it whenever you like, or just ignore it: the update applies by itself the next time you open the app.

Prefer to stay in control? Turn off **Automatic updates** in **You → Settings**. Updates will then always wait for you to tap **Update**. You can also tap **Check for updates** in Settings at any time.

---

## Desktop Layout

On screens wider than 768px, inTXT shows a side-by-side layout:

- **Left sidebar**: Your chat list with Create/Join buttons
- **Right panel**: The active conversation

Click a chat in the sidebar to view it. The person icon at the top of the sidebar opens **You**; from there **Settings** opens in the same right panel. Create Chat and Join Chat open as centered modals.

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
- **Intention tags are optional** — use them when how you meant your message might be unclear
- **The same intention always gets the same color** across all users, so "happy" looks the same for everyone
- **Pull down to refresh** the chat list or messages if something seems stuck
- **Access the tutorial anytime** from the You tab > Help & tutorial
