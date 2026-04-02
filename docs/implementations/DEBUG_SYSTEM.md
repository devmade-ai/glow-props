# Debug System

The debug system is an alpha-phase diagnostic tool, intended to be removed post-alpha.

**In-memory event store** (`debugLog.ts`): A pub/sub system with a capped circular buffer of 200 entries. Each entry has: `id`, `timestamp`, `source` (boot/db/graph/graphData/pwa/render/global/seed), `severity` (info/success/warn/error), `event`, and optional `details`. Subscribers get notified on every new entry. Global `window.error` and `unhandledrejection` listeners are installed at module load time to capture crashes early. No external dependencies or persistence — purely in-memory.

**Floating debug pill** (`DebugPill.tsx`): Renders in a separate React root (survives App crashes). Collapsed state shows a "dbg" pill with entry count and error/warning badges. Expanded state has two tabs:

- **Log tab**: Scrollable list of all debug entries, color-coded by source and severity (e.g., `pwa` = teal, `error` = red). Timestamps formatted as `HH:MM:SS.mmm`. Auto-scrolls to newest entry.
- **Environment tab**: Runtime diagnostics — URL, user agent, screen/viewport dimensions, online status, protocol, standalone mode, service worker support, IndexedDB support, and current timestamp.

Actions: "Copy" generates a full debug report (environment + all log entries) to clipboard with textarea fallback for environments without Clipboard API. "Clear" wipes all entries.
