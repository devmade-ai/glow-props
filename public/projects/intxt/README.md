# inTXT

Anonymous messaging app where senders tag the intention of each message they send. Intention tags appear right on the message, showing how it was meant.

## Features

### Core Messaging

- **Anonymous Identity**: No accounts, phone numbers, or emails — just a random ID stored on your device
- **Chat Codes**: Human-readable codes (e.g., "happy-tiger") for sharing and joining conversations
- **Link Sharing**: Share join links via SMS, WhatsApp, email, or any app — links auto-fill codes for easy joining
- **Optional Intention Tags**: Tag messages with up to 2 intentions from 6 defaults (happy, sad, serious, joking, sarcastic, sincere) or any custom single word — while composing (an inline picker above the keyboard) or up to 15 minutes after sending
- **Custom Display Names**: Each participant can set their own personal label for a chat

### Familiar Features

- **Emoji Reactions**: A quick row of 6 common reactions for one-tap reacting, plus a larger grouped set behind a **More** toggle
- **Message Replies**: Quote-style threading with visual reply indicators
- **Message Editing**: Edit messages within 15 minutes (max 5 edits per message)
- **Message Deletion**: Soft delete (for me only) or hard delete (for everyone, within a 1-hour window)
- **Read Receipts**: ✓ sent, ✓✓ read
- **Copy Text**: One-tap clipboard copying
- **Message Scheduling**: Queue a message to send later (from 2 minutes up to 30 days out)

### Advanced Features

- **Push Notifications**: Platform-specific support for native mobile, web mobile, and web desktop
- **In-App Notifications**: Slide-in notification banners for foreground messages
- **Pull-to-Refresh**: Refresh chat list and messages
- **Message Reporting**: Anonymous reporting system for inappropriate content
- **Message Info**: View sent/read status, intentions, reactions, and edit history
- **Interactive Tutorial**: Concise 4-step walkthrough for new users
- **Progressive Web App**: Installable PWA with offline support and automatic updates
- **Share Target**: Installed Android PWAs appear in the system Share menu — share text from another app straight into a chat (Chromium only; iOS Safari doesn't support it)
- **Desktop Layout**: Side-by-side chat list and conversation on wider screens

### Privacy & Security

- **Anonymous**: A random device ID is your only identity
- **No Recovery**: Uninstalling the app = permanent loss (by design)
- **Unique Chat Codes**: ~42,000 possible combinations, each code used only once
- **Row-Level Security**: Database-level access control
- **Anti-Spam**: Multi-layer rate limiting and auto-flagging

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Expo SDK 54 + React Native |
| **Routing** | Expo Router (file-based routing) |
| **Language** | TypeScript (strict mode) |
| **Backend** | Supabase (PostgreSQL, Realtime, Anonymous Auth) |
| **Styling** | Uniwind + Tailwind CSS v4 (inTXT design-system tokens) |
| **State Management** | Zustand |
| **Storage** | expo-secure-store (native) + AsyncStorage (web) |
| **Notifications** | expo-notifications (native) + raw Web Push / VAPID (web) |

## Core Concepts

### Identity

A random ID is generated on first app launch and stored on your device. It's your only identity — no accounts, emails, or phone numbers. Uninstalling the app permanently deletes it, with no recovery possible.

### Chat Codes

A human-readable, word-based code (e.g., "happy-tiger") is generated when you create a new chat — an adjective-noun combination from predefined word lists (~200 adjectives × ~200 nouns, so ~42,000 possible codes).

**Sharing**: Share a join link (e.g., `https://intxt.app/join#happy-tiger`) via the native share sheet. The code rides in the URL fragment, so it stays out of server logs and link-preview scrapers. Links work on the web and deep-link into the native app if installed.

### Intention Tags

Custom single-word labels shown as colored text (not emojis). Optionally add up to 2 intentions per message — either from 6 defaults (happy, sad, serious, joking, sarcastic, sincere) or by typing any custom single word (letters and hyphens only, max 15 characters).

**How it works**: Tag while composing via the tag icon next to send (chips appear above the input), or after sending via the "tap to add intentions" hint or the message action sheet (15-minute window, max 5 changes). Tags display on the message for both people right away — there's no reveal step.

**Colors**: The six default intentions each have a fixed, distinct color; custom intentions get a color assigned deterministically from a readable palette based on the label. The same intention always looks the same for everyone.

**Why optional**: Not every message needs a tag — sometimes the words are clear on their own. The option is there when you need it.

## Platform Support

- **iOS**: Full native support with APNs push notifications
- **Android**: Full native support with FCM push notifications
- **Web Mobile**: Web Push (VAPID) via service worker
- **Web Desktop**: Web Push (VAPID) via service worker

## Data & Privacy

- Your identity is a random device ID — no email, no phone number, no account
- Uninstalling the app permanently deletes your identity, with no recovery
- Messages are stored in a cloud database only to deliver them between participants
- Chat codes are single-use and connect exactly two people
- Anti-spam systems auto-flag suspicious behavior
- Anonymous reporting is available for inappropriate content

## Documentation

- [User Guide](USER_GUIDE.md)
- [Testing Guide](TESTING_GUIDE.md)

---

**inTXT** — Anonymous messaging where you tag the intention behind your messages.
