# SyncTone

Anonymous messaging app where senders tag the tone of each message they send. Tone tags are automatically revealed when the receiver enters the chat, showing how the message was intended.

## Features

### Core Messaging

- **Anonymous Identity**: No accounts, phone numbers, or emails - just a random UUID stored on your device
- **Chat Codes**: Human-readable codes (e.g., "happy-tiger") for sharing and joining conversations
- **Link Sharing**: Share join links via SMS, WhatsApp, email, or any app - links auto-fill codes for easy joining
- **Optional Tone Tags**: Tag messages with up to 2 tones from 6 defaults (happy, sad, serious, joking, sarcastic, sincere) or any custom single word
- **Automatic Tone Reveal**: Tones are revealed when the receiver enters the chat screen
- **Custom Display Names**: Each participant can set their own personal label for a chat

### Familiar Features

- **Emoji Reactions**: React to messages with 12 emoji options
- **Message Replies**: Quote-style threading with visual reply indicators
- **Message Editing**: Edit messages within 15 minutes (max 5 edits per message)
- **Message Deletion**: Soft delete (for me only) or hard delete (for everyone, within 1-hour window)
- **Read Receipts**: Sent, delivered, and read indicators
- **Copy Text**: One-tap clipboard copying

### Advanced Features

- **Push Notifications**: Platform-specific support for native mobile, web mobile, and web desktop
- **In-App Notifications**: Slide-in notification banners for foreground messages
- **Pull-to-Refresh**: Refresh chat list and messages
- **Message Reporting**: Anonymous reporting system for inappropriate content
- **Message Info**: View delivery status, tones, reactions, and edit history
- **Interactive Tutorial**: 9-step walkthrough for new users
- **Progressive Web App**: Installable PWA with offline support and automatic updates
- **Desktop Layout**: Side-by-side chat list and conversation on wider screens

### Privacy & Security

- **Anonymous**: Random device ID is your only identity
- **No Recovery**: Uninstalling the app = permanent loss (by design)
- **Unique Chat Codes**: ~42,600 possible combinations, each code used only once
- **Database-Level Access Control**: Row-level security policies ensure users can only access their own data
- **Anti-Spam**: Multi-layer rate limiting and auto-flagging

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Expo SDK 54 + React Native |
| **Routing** | Expo Router (file-based routing) |
| **Language** | TypeScript (strict mode) |
| **Backend** | Supabase (PostgreSQL, Realtime, Anonymous Auth) |
| **Styling** | NativeWind v4 (Tailwind CSS for React Native) |
| **State Management** | Zustand |
| **Storage** | SecureStore (native) + AsyncStorage (web) |
| **Notifications** | expo-notifications (native) + OneSignal (web) |

## Core Concepts

### Identity

Random UUID generated on first app launch. Stored securely on device. Serves as the user's identity. Lost on app uninstall with no recovery possible.

### Chat Codes

Human-readable word-based code (e.g., "happy-tiger") generated when creating a new chat. Format: adjective-noun combination from predefined word lists (~200 adjectives x ~200 nouns = ~42,600 possible codes).

Users can share join links via native share sheet. Links work on web and deep link into the native app if installed.

### Tone Tags

Custom single-word labels displayed as colored text (not emojis). Users can optionally select up to 2 tones per message — either from 6 defaults (happy, sad, serious, joking, sarcastic, sincere) or by typing any custom single word (letters and hyphens only, max 15 characters).

Messages are always sent without tones. After sending, the sender can add tones via a "tap to add tones" hint or the message action sheet. Tones are automatically revealed when the receiver enters the chat screen.

Tone colors are assigned deterministically from a 16-color palette based on a hash of the tone label. The same tone always gets the same color across all users and sessions.

Not every message needs tone tags. Sometimes the message is clear on its own. The option is there when you need it.

## Platform Support

- **iOS**: Full native support with APNs push notifications
- **Android**: Full native support with FCM push notifications
- **Web Mobile**: Web Push via service worker
- **Web Desktop**: Browser notification API

## Data & Privacy

- Your identity is a random device ID — no email, no phone number, no account
- Uninstalling the app permanently deletes your identity with no recovery
- Messages are stored in a cloud database for delivery between participants
- Chat codes are single-use and expire after joining
- Anti-spam systems auto-flag suspicious behavior
- Anonymous reporting system for inappropriate content

## Documentation

- [User Guide](USER_GUIDE.md)
- [Testing Guide](TESTING_GUIDE.md)
