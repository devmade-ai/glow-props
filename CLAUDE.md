# READ AND FOLLOW THE PROCESS, PRINCIPLES, CODE STANDARDS, DOCUMENTATION, AI NOTES, TRIGGERS, AND PROHIBITIONS EVERY TIME

## Fetching This File

This file is hosted at: `https://devmade-ai.github.io/glow-props/CLAUDE.md`

To fetch it directly:
```bash
curl -sf "https://devmade-ai.github.io/glow-props/CLAUDE.md"
```

## Process

1. **Read these preferences first**
2. **Gather context from documentation** (CLAUDE.md, relevant docs/)
3. **Then proceed with the task**

### REMINDER: READ AND FOLLOW THE PROCESS EVERY TIME

## Principles

1. **User-first design** - Align with how real people will use the tool (top priority)
2. **Simplicity** - Simple flow, clear guidance, non-overwhelming visuals, accurate interpretation
3. **Document WHY** - Explain decisions and how they align with tool goals
4. **Testability** - Ensure correctness and alignment with usage goals can be verified
5. **Know the purpose** - Always be aware of what the tool is for
6. **Follow conventions** - Best practices and consistent patterns
7. **Repeatable process** - Follow consistent steps to ensure all the above

### REMINDER: READ AND FOLLOW THE PRINCIPLES EVERY TIME

## Code Standards

### Code Organization

- Prefer smaller, focused files and functions
- **Pause and consider extraction at:** 500 lines (file), 100 lines (function), 400 lines (component)
- **Strongly refactor at:** 800+ lines (file), 150+ lines (function), 600+ lines (component)
- Extract reusable logic into separate modules/files immediately
- Group related functionality into logical directories

### Decision Documentation in Code

Non-trivial code changes must include comments explaining:
- **What** was the requirement or instruction
- **Why** this approach was chosen
- **What alternatives** were considered and why they were rejected

```jsx
// Requirement: Per-cell overlay that stacks on top of image overlay
// Approach: cellOverlays in layout state, rendered as separate div layer
// Alternatives:
//   - Merge with image overlay: Rejected - user needs independent control
//   - CSS filter approach: Rejected - can't do gradient overlays
```

### Cleanup

- Remove `console.log`/`console.debug` statements before marking work complete
- Delete unused imports, variables, and dead code immediately
- Remove commented-out code unless explicitly marked `// KEEP:` with reason
- Remove temporary/scratch files after implementation is complete

### Quality Checks

During every change, actively scan for:
- Error handling gaps
- Edge cases not covered
- Inconsistent naming
- Code duplication that should be extracted
- Missing input validation at boundaries
- Security concerns (XSS via dangerouslySetInnerHTML, unsanitized user input)
- Performance issues (unnecessary re-renders, missing keys, large re-computations)

Report findings even if not directly related to current task.

### User Experience (Non-Negotiable)

All end users are non-technical. This overrides cleverness.

- UI must be intuitive without instructions
- Use plain language - no jargon or developer-speak in user-facing text
- Error messages must say what went wrong AND what to do next, in simple terms
- Confirm destructive actions with clear consequences explained
- Provide feedback for all user actions (loading states, success confirmations)

### Commit Message Format

All commits must include metadata footers:

```
type(scope): subject

Body explaining why.

Tags: tag1, tag2, tag3
Complexity: 1-5
Urgency: 1-5
Impact: internal|user-facing|infrastructure|api
Risk: low|medium|high
Debt: added|paid|neutral
Epic: feature-name
Semver: patch|minor|major
```

**Tags:** Use relevant tags for the change (e.g., documentation, pwa, debug, ui, refactor, testing)
**Complexity:** 1=trivial, 2=small, 3=medium, 4=large, 5=major rewrite
**Urgency:** 1=planned, 2=normal, 3=elevated, 4=urgent, 5=critical
**Impact:** internal, user-facing, infrastructure, or api
**Risk:** low=safe change, medium=could break things, high=touches critical paths
**Debt:** added=introduced shortcuts, paid=cleaned up debt, neutral=neither
**Epic:** groups related commits under one feature/initiative name
**Semver:** patch=bugfix, minor=new feature, major=breaking change

These footers are required on every commit. No exceptions.

### REMINDER: READ AND FOLLOW THE CODE STANDARDS EVERY TIME

## Documentation

**AI assistants automatically maintain these documents.** Update them as you work - don't wait for the user to ask. This ensures context is always current for the next session.

### `CLAUDE.md`

**Purpose:** AI preferences, project overview, architecture, key state structures.
**When to read:** At the start of every session, before doing any work.
**When to update:** When project architecture changes, state structure changes, or preferences evolve.
**What to include:**

- Process, Principles, AI Notes: Update when learning new patterns or preferences
- Project Status: Current working features (bullet list)
- Architecture: File structure with brief descriptions
- Key State Structure: Important state shapes with comments
- Any section that becomes outdated after feature changes

**Why:** This is the primary context for AI assistants. Accurate info here prevents mistakes.

### `docs/SESSION_NOTES.md`

**Purpose:** Compact context summary for session continuity (like `/compact` output).
**When to read:** At the start of a session to quickly understand what was done previously.
**When to update:** Rewrite at session end with a fresh summary. Clear previous content.
**What to include:**

- **Worked on:** Brief description of focus area
- **Accomplished:** Bullet list of completions
- **Current state:** Where things stand (working/broken/in-progress)
- **Key context:** Important info the next session needs to know

**Why:** Enables quick resumption without re-reading entire codebase. Not a changelog - a snapshot.

### `docs/TODO.md`

**Purpose:** AI-managed backlog of ideas and potential improvements.
**When to read:** When looking for work to do, or when the user asks about pending tasks.
**When to update:** When noticing potential improvements. Move completed items to HISTORY.md.
**What to include:**

- Group by category (Features, UX, Technical, etc.)
- Use `- [ ]` for pending items only
- Brief description of what and why
- When complete, move to HISTORY.md (don't keep in TODO)

**Why:** User reviews this to prioritize work. Keeps TODO focused on pending items only.

### `docs/HISTORY.md`

**Purpose:** Changelog and record of completed work.
**When to read:** When you need historical context about why something was built a certain way.
**When to update:** When completing TODO items or making significant changes.
**What to include:**

- Completed TODO items (organized by category)
- Bug fixes and changes (organized by date)
- Brief description of what was done

**Why:** Historical context separate from active TODO. Tracks what's been accomplished.

### `docs/USER_ACTIONS.md`

**Purpose:** Manual actions requiring user intervention outside the codebase.
**When to read:** When something requires manual user intervention (deployments, API keys, external config).
**When to update:** When tasks need external action. Clear when completed.
**What to include:**

- Action title and description
- Why it's needed
- Steps to complete
- Keep empty when nothing pending (with placeholder text)

**Why:** Some tasks require credentials, dashboards, or manual config the AI can't do.

### `docs/AI_MISTAKES.md`

**Purpose:** Record significant AI mistakes and learnings to prevent repetition.
**When to read:** When starting a session, to avoid repeating past mistakes.
**When to update:** After making a mistake that wasted time or broke things.
**What to include:**

- What went wrong
- Why it happened
- How to prevent it
- Date (for context)

**Why:** AI assistants repeat mistakes across sessions. This document builds institutional memory.

### `README.md`

**Purpose:** User-facing guide for the application.
**When to read:** When you need a quick overview of what the tool does and its main features.
**When to update:** When features change that affect how users interact with the tool.
**What to include:**

- What the tool does (overview)
- Current features (keep in sync with actual functionality)
- How to use each feature (user guide)
- Getting started / installation
- Tech stack and deployment info

**Why:** Users and contributors read this first. Must accurately reflect the current state.

### `docs/USER_GUIDE.md`

**Purpose:** Comprehensive user documentation explaining how to use every feature.
**When to read:** When you need to understand what users can do with the tool, or how a feature is supposed to work from the user's perspective.
**When to update:** When adding new features, changing UI workflows, or modifying how existing features work.
**What to include:**

- Tab-by-tab walkthrough of the interface
- Explanation of every control and what it does
- Workflow tips and best practices
- Organized by user tasks, not technical implementation

**Why:** Serves as the authoritative reference for user-facing behavior. Helps ensure AI assistants understand the user experience.

### `docs/TESTING_GUIDE.md`

**Purpose:** Manual test scenarios for verifying the application works correctly.
**When to read:** Before testing changes, or when you need to verify specific functionality works.
**When to update:** When adding new features that need test coverage, or when existing tests become outdated.
**What to include:**

- Step-by-step test scenarios with exact actions
- Where to click/look for each step
- Expected results for each action
- Regression checklist for quick verification

**Why:** Ensures consistent, thorough testing. Prevents regressions by documenting what to verify after changes.

### REMINDER: READ AND FOLLOW THE DOCUMENTATION EVERY TIME

## AI Notes

- Always read a file before attempting to edit it
- Check for existing patterns in the codebase before creating new ones
- Commit and push changes before ending a session
- Clean up completed or obsolete docs/files and remove references to them
- **CRITICAL: Keep `TutorialModal.jsx` up to date** - This is USER-FACING help content shown in-app. When tabs, sections, or features change, update the tutorial steps to match. Outdated tutorial content confuses users.
- **ASK before assuming.** When a user reports a bug, ask clarifying questions (which mode? what did you type? what do you see?) BEFORE writing code. Don't guess the cause and build a fix on an assumption - you'll waste time fixing the wrong thing. One clarifying question saves multiple wrong commits.
- **Always read files before editing.** Use the Read tool on every file before attempting to Edit it. Editing without reading first will fail.
- **Check build tools before building.** Run `npm install` or verify `node_modules/.bin/vite` exists before attempting `npm run build`. The `sharp` package may not be installed (used by prebuild icon generation), so use `./node_modules/.bin/vite build` directly to skip the prebuild step.
- **Communication style:** Direct, concise responses. No filler phrases or conversational padding. State facts and actions. Ask specific questions with concrete options when clarification is needed.
- **Claude Code mobile/web — accessing sibling repos:**
  - Use `GITHUB_ALL_REPO_TOKEN` with the GitHub API (`api.github.com/repos/devmade-ai/{repo}/contents/{path}`) to read files from other devmade-ai repos
  - Use `$(printenv GITHUB_ALL_REPO_TOKEN)` not `$GITHUB_ALL_REPO_TOKEN` to avoid shell expansion issues
  - Never clone sibling repos — use the API instead
- **Discontinued repos — skip entirely:** `plant-fur` and `coin-zapp` are discontinued. Do not check, audit, align, or include them in cross-project operations.

### REMINDER: READ AND FOLLOW THE AI NOTES EVERY TIME

## Prohibitions

Never:
- Start implementation without understanding full scope
- Create files outside established project structure
- Leave TODO comments in code without tracking them in `docs/TODO.md`
- Ignore errors or warnings in build/console output
- Make "while I'm here" changes without asking first
- Use placeholder data that looks like real data
- Skip error handling "for now"
- Remove features during "cleanup" without checking if they're documented as intentional (see AI_MISTAKES.md)
- Proceed with assumptions when a single clarifying question would prevent a wrong commit
- Use interactive input prompts or selection UIs — list options as numbered text instead

### REMINDER: READ AND FOLLOW THE PROHIBITIONS EVERY TIME

## Triggers

Single-word commands that invoke focused analysis passes. Each trigger has a short alias. Type the word or alias to activate.

| # | Trigger | Alias | What it does |
|---|---------|-------|--------------|
| 1 | `review` | `rev` | Code review — bugs, UI, UX, simplification |
| 2 | `audit` | `aud` | Code quality — hacks, anti-patterns, latent bugs, race conditions |
| 3 | `docs` | `doc` | Documentation accuracy vs actual code |
| 4 | `mobile` | `tap` | Mobile UX — touch targets, viewport, safe areas |
| 5 | `clean` | `cln` | Hygiene — duplication, refactor candidates, dead code |
| 6 | `performance` | `perf` | Re-renders, expensive ops, bundle size, DB/API, memory |
| 7 | `security` | `sec` | Injection, auth gaps, data exposure, insecure defaults, CVEs |
| 8 | `debug` | `dbg` | Debug pill coverage — missing logs, noise |
| 9 | `improve` | `imp` | Open-ended — architecture, DX, anything else |
| 10 | `start` | `go` | Sequential sweep of all 9 above, one at a time |

### Trigger behavior

- Each trigger runs a single focused pass and reports findings.
- Findings are listed as numbered text — never interactive prompts or selection UIs.
- One trigger per response. Never combine multiple triggers in a single response.

### `start` / `go` behavior

Runs all 9 triggers in priority sequence, one at a time:

`rev` → `aud` → `doc` → `tap` → `cln` → `perf` → `sec` → `dbg` → `imp`

After each trigger completes and findings are presented, the user responds with one of:
1. `fix` — apply the suggested fixes, then move to the next trigger
2. `skip` — skip this trigger's findings and move to the next trigger
3. `stop` — end the sweep entirely

Rules:
- Always pause after each trigger — never auto-advance to the next one.
- Never run multiple triggers in one response.
- Wait for the user's explicit `fix`, `skip`, or `stop` before proceeding.

### REMINDER: READ AND FOLLOW THE TRIGGERS EVERY TIME

## Suggested Implementations

Reference patterns for features that should be implemented across all projects. These describe the architecture and behavior to follow — adapt file names and frameworks to the specific project.

### PWA System

Four parts, built on `vite-plugin-pwa` (^0.21.1) with React. Adapt patterns for other frameworks.

#### Vite Config (`vite.config.ts`)

```typescript
import { VitePWA } from 'vite-plugin-pwa'

// Inside defineConfig plugins array:
VitePWA({
  registerType: 'prompt',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
  manifest: {
    name: 'Your App',
    short_name: 'App',
    description: 'Description here',
    id: '/',
    theme_color: '#10b981',
    background_color: '#ffffff',
    display: 'standalone',
    scope: '/',
    start_url: '/',
    prefer_related_applications: false,
    icons: [
      { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: 'pwa-1024x1024.png', sizes: '1024x1024', type: 'image/png', purpose: 'maskable' }
    ]
  }
})
```

- **`registerType: 'prompt'`**: Users control when updates apply. `autoUpdate` silently refreshes mid-work.
- **`id`**: Stable app identity. Without it, Chrome derives from `start_url` — breaks on config changes or redeployments.
- **`prefer_related_applications: false`**: Without this, Chrome may skip `beforeinstallprompt` if it thinks a native app exists.
- **Separate icon purposes**: `any` for standard display (192, 512), `maskable` for full-bleed (1024). Never combine `"any maskable"` — browsers pick the wrong one. Use a dedicated 1024x1024 for maskable.
- **`theme_color` is a branding surface**: The status bar carries your brand color, not the page background. A mid-tone brand color (like `#10b981`) provides enough contrast for status bar text (white or black) in both light and dark OS modes. Switching theme-color between light/dark background colors causes visibility issues — if the OS is set to the opposite scheme from the app, status bar text becomes invisible (light-on-light or dark-on-dark). The manifest value overrides meta tags in Android PWA standalone mode.

#### Install Prompt Race Condition (`index.html`)

`beforeinstallprompt` fires once. On repeat visits with a cached SW, it fires before the framework mounts — if nothing catches it, the install prompt is permanently lost.

Inline classic (non-module) script before any `<script type="module">`:

```html
<script>
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    window.__pwaInstallPromptEvent = e;
  });
</script>
```

Executes synchronously during HTML parse. Stashes the event for the React hook to consume. `e.preventDefault()` suppresses the browser's default mini-infobar. The hook's fallback `useEffect` listener handles first-visit timing (SW registers after mount). Neither alone covers both cases.

#### Service Worker Updates (`usePWAUpdate.ts`)

Wraps `vite-plugin-pwa`'s React hook. Exposes `hasUpdate` boolean and `updateApp()`. Checks for new SW versions every 60 minutes. Offline-ready auto-dismisses after 3 seconds.

```typescript
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useEffect, useCallback } from 'react'

const CHECK_INTERVAL_MS = 60 * 60 * 1000

export function usePWAUpdate() {
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (registration) {
        setInterval(() => registration.update(), CHECK_INTERVAL_MS)
      }
    }
  })

  // Auto-dismiss offline-ready after 3s
  useEffect(() => {
    if (!offlineReady) return
    const t = setTimeout(() => setOfflineReady(false), 3000)
    return () => clearTimeout(t)
  }, [offlineReady, setOfflineReady])

  const updateApp = useCallback(() => {
    updateServiceWorker(true)
  }, [updateServiceWorker])

  return { hasUpdate: needRefresh, offlineReady, updateApp }
}
```

#### Install Detection (`usePWAInstall.ts`)

Detects browser, captures `beforeinstallprompt` (consuming the early-captured event from `index.html`), tracks install analytics. Hides prompt when already installed or dismissed.

```typescript
import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type BrowserType = 'chrome' | 'edge' | 'brave' | 'safari-ios' | 'safari-macos'
  | 'firefox-android' | 'firefox-desktop' | 'unknown'

function detectBrowser(): BrowserType {
  const ua = navigator.userAgent
  if ((navigator as any).brave) return 'brave'
  if (/Edg\//i.test(ua)) return 'edge'
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return 'chrome'
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
    return /iPhone|iPad|iPod/.test(ua) ? 'safari-ios' : 'safari-macos'
  }
  if (/Firefox/i.test(ua)) {
    return /Android/i.test(ua) ? 'firefox-android' : 'firefox-desktop'
  }
  return 'unknown'
}

function consumeEarlyCapturedEvent(): BeforeInstallPromptEvent | null {
  const win = window as unknown as Record<string, unknown>
  const captured = win.__pwaInstallPromptEvent as BeforeInstallPromptEvent | undefined
  if (captured) {
    delete win.__pwaInstallPromptEvent
    return captured
  }
  return null
}

const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  || (navigator as any).standalone === true

export function usePWAInstall() {
  const [browser] = useState(detectBrowser)
  const [deferredPrompt, setDeferredPrompt] = useState(consumeEarlyCapturedEvent)
  const [installed] = useState(isStandalone)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('pwa-install-dismissed') === 'true'
  )

  // Fallback listener — first-visit case where SW registers after mount
  useEffect(() => {
    if (deferredPrompt) return
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [deferredPrompt])

  // Diagnostic: warn if beforeinstallprompt hasn't fired after 5s on Chromium
  useEffect(() => {
    if (deferredPrompt || !['chrome', 'edge', 'brave'].includes(browser)) return
    const t = setTimeout(() => {
      const hasManifest = !!document.querySelector('link[rel="manifest"]')
      const swControlled = !!navigator.serviceWorker?.controller
      console.warn('[PWA Install] No beforeinstallprompt after 5s', {
        browser, hasManifest, swControlled, standalone: isStandalone
      })
    }, 5000)
    return () => clearTimeout(t)
  }, [deferredPrompt, browser])

  const canNativeInstall = !!deferredPrompt
  const needsManualInstructions = ['safari-ios', 'safari-macos', 'firefox-android', 'firefox-desktop'].includes(browser)
  const showInstallPrompt = !installed && !dismissed && (canNativeInstall || needsManualInstructions)

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return
    trackEvent('prompted')
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    trackEvent(outcome === 'accepted' ? 'installed' : 'dismissed')
    setDeferredPrompt(null)
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
    trackEvent('dismissed')
  }, [])

  return {
    browser, installed, dismissed, canNativeInstall,
    needsManualInstructions, showInstallPrompt,
    triggerInstall, dismiss
  }
}

// Analytics — last 50 events in localStorage
function trackEvent(type: string) {
  try {
    const key = 'pwa-install-analytics'
    const events = JSON.parse(localStorage.getItem(key) || '[]')
    events.push({ type, timestamp: Date.now() })
    localStorage.setItem(key, JSON.stringify(events.slice(-50)))
  } catch { /* localStorage unavailable */ }
}
```

Key detail: `consumeEarlyCapturedEvent` is passed directly as a `useState` initializer — runs once on mount, grabs the stashed event from `index.html`'s inline script (repeat visits), then the `useEffect` fallback handles first visits. The `swControlled` diagnostic is critical: on first visit the SW registers but doesn't control the page until reload, which is likely why Chrome won't fire the event.

#### Install Prompt UI (`InstallPrompt.tsx`)

Banner that shows conditionally based on `showInstallPrompt`:
- **Chromium** (`canNativeInstall`): "Install" button → calls `triggerInstall()`
- **Safari/Firefox** (`needsManualInstructions`): "How to Install" button → opens `InstallInstructionsModal`
- **"Not now"** dismiss button → calls `dismiss()`, persists to localStorage

Hidden when already in standalone mode, dismissed, or unsupported browser.

#### Manual Install Instructions (`InstallInstructionsModal.tsx`)

Browser-specific step-by-step guides in a modal. Four variants, plain language for non-technical users:

| Browser | Steps |
|---------|-------|
| Safari iOS | Share → Add to Home Screen → Add |
| Safari macOS | File → Add to Dock |
| Firefox Android | Three-dot menu → Install → Install again |
| Firefox Desktop | Fallback: "Use Chrome or Edge for install support" |

Tracks `instructions-viewed` analytics event on open.

#### Fix: Timer Leaks on Unmount (Nested Timeouts)

Debounce patterns using `setTimeout` leak when a component unmounts mid-timeout. The nested case is worse: a timeout callback sets *another* timeout, and cleaning up only the outer one leaves the inner one orphaned — it fires after unmount, updating state or triggering side effects on a dead component.

**Broken:**
```typescript
useEffect(() => {
  const outer = setTimeout(() => {
    doSomething();
    const inner = setTimeout(() => save(), 500); // leaked
  }, 300);
  return () => clearTimeout(outer); // only clears outer
}, [value]);
```

**Fix — track all timeout IDs:**
```typescript
useEffect(() => {
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  const outer = setTimeout(() => {
    doSomething();
    const inner = setTimeout(() => save(), 500);
    timeouts.push(inner);
  }, 300);
  timeouts.push(outer);

  return () => timeouts.forEach(clearTimeout);
}, [value]);
```

**Alternative — mounted ref guard:**
```typescript
const mountedRef = useRef(true);
useEffect(() => () => { mountedRef.current = false; }, []);

// In any async/timeout callback:
if (!mountedRef.current) return;
```

**General rule:** Every `setTimeout`, `setInterval`, `addEventListener`, or `subscribe` call inside a `useEffect` needs a corresponding cleanup in the return function. If callbacks create *new* async operations, those need cleanup too.

#### Key Lessons

1. **Never combine `"any maskable"` in icon purpose** — use separate entries with a dedicated 1024x1024 for maskable.
2. **Set `id` explicitly** in the manifest — Chrome derives it from `start_url` otherwise.
3. **The inline script in `index.html` is essential** — without it, repeat visitors on Chromium lose the install prompt.
4. **`registerType: 'prompt'`** gives users control. `autoUpdate` silently refreshes mid-work.
5. **Diagnostic 5s timeout on Chromium** — log `hasManifestLink` and `swControlled` state for debugging. `swControlled: false` on first visit is expected (SW doesn't control until reload).
6. **Clean up all timers** — every `setTimeout`/`setInterval` in `useEffect` needs cleanup. Nested timeouts need the array pattern or mounted ref guard.
7. **400 DPI rasterization** — Sharp renders the SVG at ~5.5x the coordinate space before downscaling, so edges are anti-aliased from high-res source data instead of the default 72 DPI. The 192px PWA icon benefits most.
8. **`shape-rendering="geometricPrecision"`** — tells the SVG rasterizer to prioritize accurate geometry over rendering speed. Add to the root `<svg>` element.

### Debug System

The debug system is an alpha-phase diagnostic tool, intended to be removed post-alpha.

**In-memory event store** (`debugLog.ts`): A pub/sub system with a capped circular buffer of 200 entries. Each entry has: `id`, `timestamp`, `source` (boot/db/graph/graphData/pwa/render/global/seed), `severity` (info/success/warn/error), `event`, and optional `details`. Subscribers get notified on every new entry. Global `window.error` and `unhandledrejection` listeners are installed at module load time to capture crashes early. No external dependencies or persistence — purely in-memory.

**Floating debug pill** (`DebugPill.tsx`): Renders in a separate React root (survives App crashes). Collapsed state shows a "dbg" pill with entry count and error/warning badges. Expanded state has two tabs:

- **Log tab**: Scrollable list of all debug entries, color-coded by source and severity (e.g., `pwa` = teal, `error` = red). Timestamps formatted as `HH:MM:SS.mmm`. Auto-scrolls to newest entry.
- **Environment tab**: Runtime diagnostics — URL, user agent, screen/viewport dimensions, online status, protocol, standalone mode, service worker support, IndexedDB support, and current timestamp.

Actions: "Copy" generates a full debug report (environment + all log entries) to clipboard with textarea fallback for environments without Clipboard API. "Clear" wipes all entries.

### App Icons from SVG Source

Single SVG source file, Sharp converts to all needed PNG sizes at 400 DPI for crisp edges. One command regenerates everything.

**Dependencies:** `sharp` (devDependency)

```bash
npm install --save-dev sharp
```

**File structure:**
```
assets/
  icon-source.svg          # Source of truth — edit this, regenerate PNGs
  images/
    icon.png               # 1024x1024 — main app icon
    adaptive-icon.png       # 1024x1024 — Android adaptive foreground
    splash-icon.png         # 1024x1024 — splash screen
    favicon.png             # 48x48 — browser tab
    icon-192.png            # 192x192 — PWA manifest (Android home screen)
    icon-512.png            # 512x512 — PWA manifest (Chrome install)
scripts/
  generate-icons.mjs       # Sharp conversion script
```

**Generator script** (`scripts/generate-icons.mjs`):

```javascript
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SVG_SOURCE = join(ROOT, 'assets', 'icon-source.svg');
const IMAGES_DIR = join(ROOT, 'assets', 'images');

// 400 DPI: ~5.5x the default 72 DPI. Sharp rasterizes the SVG at this density
// before downscaling, so edges are anti-aliased from high-res source data.
// The 192px PWA icon benefits most — arc and needle edges are noticeably crisper.
const SVG_DENSITY = 400;

const ICONS = [
  { name: 'icon.png', size: 1024 },
  { name: 'adaptive-icon.png', size: 1024 },
  { name: 'splash-icon.png', size: 1024 },
  { name: 'favicon.png', size: 48 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

async function generate() {
  const svgBuffer = readFileSync(SVG_SOURCE);
  mkdirSync(IMAGES_DIR, { recursive: true });

  for (const icon of ICONS) {
    await sharp(svgBuffer, { density: SVG_DENSITY })
      .resize(icon.size, icon.size)
      .png()
      .toFile(join(IMAGES_DIR, icon.name));
    console.log(`  ${icon.name} (${icon.size}x${icon.size})`);
  }
  console.log(`Done — ${ICONS.length} icons generated.`);
}

generate().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
```

**Run:** `node scripts/generate-icons.mjs`

**SVG design rules for maskable icons:**
- Canvas must be square (e.g. `viewBox="0 0 1024 1024"`)
- Add `shape-rendering="geometricPrecision"` to the root `<svg>` element — tells the rasterizer to prioritize accurate geometry over speed
- Background fills entire canvas (no transparency)
- Important content stays within the inner 80% (safe zone for maskable crop)
- Design must be legible at 48px (favicon) — avoid fine details

**PWA manifest icons** (`manifest.json`):
```json
"icons": [
  { "src": "/assets/images/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
  { "src": "/assets/images/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
  { "src": "/assets/images/icon.png", "sizes": "1024x1024", "type": "image/png", "purpose": "maskable" }
]
```

Separate `purpose` values: `any` for standard display (192, 512), `maskable` for the full-bleed 1024. Don't combine `"any maskable"` — browsers pick the wrong one.

**Expo config** (`app.json`): Point `expo.icon`, `expo.splash.image`, `android.adaptiveIcon.foregroundImage`, and `web.favicon` at the generated PNGs. Set `backgroundColor` on splash and adaptive icon to match the SVG background color.

### Download as PDF (via `window.print()`)

Zero-dependency PDF download using the browser's native print dialog. No PDF libraries needed — the user selects "Save as PDF" from their system print dialog.

#### How It Works

Three pieces: a trigger button, a `no-print` utility class, and print-friendly CSS overrides.

#### 1. Trigger Button

A simple button that calls `window.print()`:

```tsx
<button type="button" onClick={() => window.print()}>
  Download as PDF
</button>
```

Place this in the page header, hero section, or wherever the user expects a download action. The button itself should be hidden during print (see `no-print` class below).

#### 2. The `no-print` Utility Class

Hide interactive or irrelevant elements when printing/saving as PDF:

```css
@media print {
  .no-print {
    display: none !important;
  }
}
```

Apply `className="no-print"` to:
- Navigation bars and menus
- Action buttons (install, download, CTAs)
- Footers with interactive links
- Modals, tooltips, and floating UI
- Forms and interactive widgets
- Debug overlays

#### 3. Print-Friendly CSS Overrides

Override dark themes, fix link visibility, and prevent content from splitting across pages:

```css
@media print {
  body {
    background: white !important;
    color: black !important;
  }

  a {
    color: black !important;
    text-decoration: underline !important;
  }

  section {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
```

- **White background / black text**: Ensures readability regardless of the app's theme. Saves ink.
- **Underlined links**: Links lose their hover state in print — underlines make them identifiable.
- **`break-inside: avoid`**: Prevents sections from being split across page breaks. Use on content blocks (cards, feature sections, testimonials) that should stay together. `page-break-inside` is the legacy property for older browsers.

#### To Replicate in Any Project

1. Add a button that calls `window.print()`
2. Add `@media print` CSS rules to make the page printer-friendly (colors, layout)
3. Add a `no-print` utility class to hide interactive/irrelevant elements
4. Use `break-inside: avoid` on content blocks you don't want split across pages
5. Wrap the trigger button's container in `no-print` so it doesn't appear in the PDF

#### Key Lessons

1. **No library needed** — `window.print()` opens the system print dialog, which includes "Save as PDF" on all major browsers and operating systems.
2. **`!important` is justified here** — print overrides must win against inline styles, CSS-in-JS, and dark mode classes. This is one of the few legitimate uses of `!important`.
3. **Test in print preview** — use the browser's print preview (Ctrl/Cmd+P) to verify layout before committing. Check for: hidden elements, color contrast, page breaks, and overall readability.
4. **`break-inside: avoid` on sections** — prevents awkward mid-section page breaks. Apply to any content block that should stay on one page.
5. **Hide the download button itself** — the button that triggers `window.print()` should be inside a `no-print` container, otherwise it appears in the PDF.

### HTTPS Proxy Support for Node.js Scripts

Zero-dependency HTTP CONNECT tunnel for Node.js scripts that need to reach external APIs through an HTTPS proxy. Solves the problem that Node.js's built-in `fetch()` (undici) and `https.get()` **do not** respect `HTTP_PROXY`/`HTTPS_PROXY` environment variables.

#### The Problem

In proxy-only environments (CI containers, Claude Code remote sessions, corporate networks), outbound traffic must route through an HTTP proxy. But:

- **`fetch()` (Node 18+ built-in)**: Uses undici internally. Does NOT auto-detect `HTTP_PROXY`/`HTTPS_PROXY` env vars. Requests fail with DNS errors.
- **`https.get()`**: Also does NOT respect proxy env vars. Same DNS failure.
- **`curl`**: Works — it reads `HTTP_PROXY`/`HTTPS_PROXY` automatically. But shelling out to curl from Node is ugly.
- **`global-agent` / `proxy-agent` packages**: Work, but add external dependencies for a simple tunnel.

#### The Solution

Detect the proxy from environment variables, establish an HTTP CONNECT tunnel, then pipe the HTTPS request through the tunnel socket. Pure `http`/`https` stdlib — no dependencies.

```javascript
import http from 'http';
import https from 'https';

// --- Proxy detection ---
// Check both lowercase and uppercase conventions.
// HTTPS_PROXY is used for HTTPS requests; HTTP_PROXY for HTTP requests.
// Most environments set both to the same value.
const PROXY_URL = process.env.https_proxy || process.env.HTTPS_PROXY || null;

function getProxyConnectOptions(targetHost) {
  const proxy = new URL(PROXY_URL);
  const options = {
    host: proxy.hostname,
    port: proxy.port,
    method: 'CONNECT',
    path: `${targetHost}:443`,
    headers: { 'Host': `${targetHost}:443` },
    timeout: 15000,
  };
  // Proxy authentication (username:password in proxy URL)
  if (proxy.username) {
    const auth = Buffer.from(
      decodeURIComponent(proxy.username) + ':' + decodeURIComponent(proxy.password)
    ).toString('base64');
    options.headers['Proxy-Authorization'] = `Basic ${auth}`;
  }
  return options;
}

// --- HTTPS GET with automatic proxy support ---
// When PROXY_URL is set: HTTP CONNECT tunnel → HTTPS over tunnel
// When PROXY_URL is null: Direct HTTPS request
function httpsGet(requestUrl, headers = {}) {
  const parsed = new URL(requestUrl);
  if (PROXY_URL) {
    return httpsGetViaProxy(parsed, headers);
  }
  return httpsGetDirect(parsed, headers);
}

function httpsGetDirect(parsed, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(parsed.href, { headers, timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

function httpsGetViaProxy(parsed, headers) {
  return new Promise((resolve, reject) => {
    const connectOptions = getProxyConnectOptions(parsed.hostname);
    const proxyReq = http.request(connectOptions);

    proxyReq.on('connect', (res, socket) => {
      if (res.statusCode !== 200) {
        socket.destroy();
        reject(new Error(`Proxy CONNECT failed: ${res.statusCode}`));
        return;
      }
      // TLS handshake through the tunnel
      const tlsReq = https.get({
        host: parsed.hostname,
        path: parsed.pathname + parsed.search,
        headers,
        socket,              // Reuse the CONNECT tunnel socket
        servername: parsed.hostname, // Required for SNI
        timeout: 15000,
      }, (tlsRes) => {
        let data = '';
        tlsRes.on('data', (chunk) => { data += chunk; });
        tlsRes.on('end', () => {
          if (tlsRes.statusCode >= 200 && tlsRes.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`HTTP ${tlsRes.statusCode}: ${data.substring(0, 200)}`));
          }
        });
      });
      tlsReq.on('error', reject);
      tlsReq.on('timeout', () => { tlsReq.destroy(); reject(new Error('Request timeout')); });
    });

    proxyReq.on('error', reject);
    proxyReq.on('timeout', () => { proxyReq.destroy(); reject(new Error('Proxy connect timeout')); });
    proxyReq.end();
  });
}
```

**Usage:**

```javascript
// Works identically whether proxy is set or not
const data = await httpsGet('https://api.example.com/status', {
  'User-Agent': 'MyApp/1.0',
});
```

**For curl in shell scripts:**

```bash
# curl respects HTTP_PROXY/HTTPS_PROXY automatically — no code changes needed.
# If the env var is named differently (e.g., GLOBAL_AGENT_HTTP_PROXY), pass it explicitly:
curl -x "$GLOBAL_AGENT_HTTP_PROXY" https://api.example.com/status
```

#### How It Works

1. **Detect proxy** from `HTTPS_PROXY` or `https_proxy` env var
2. **HTTP CONNECT** — send a `CONNECT targethost:443` request to the proxy. The proxy establishes a TCP tunnel to the target.
3. **TLS over tunnel** — once the proxy responds `200`, pass the raw socket to `https.get()` via the `socket` option. Node performs the TLS handshake through the tunnel.
4. **Transparent fallback** — when no proxy env var is set, `httpsGet()` uses direct `https.get()`. Same API, zero config.

#### Key Lessons

1. **Node's `fetch()` and `https.get()` ignore proxy env vars** — unlike `curl`, Python `requests`, or Go's `http.Client`, Node does not auto-detect `HTTP_PROXY`. This is a long-standing design choice, not a bug.
2. **HTTP CONNECT is the standard** — it's how all HTTPS proxying works. The proxy sees only the target hostname, not the request content (TLS encrypts everything after the tunnel opens).
3. **`socket` + `servername` are both required** — `socket` reuses the tunnel; `servername` enables SNI so the target server presents the correct TLS certificate.
4. **Auth uses Basic scheme** — proxy credentials are sent as `Proxy-Authorization: Basic base64(user:pass)` in the CONNECT request. URL-decode the username/password first (they may be percent-encoded in the URL).
5. **No external dependencies needed** — `global-agent`, `proxy-agent`, `https-proxy-agent` packages solve this too, but for scripts that just need GET requests, the stdlib solution above is simpler and has zero supply chain risk.
6. **`curl` just works** — it reads `HTTP_PROXY`/`HTTPS_PROXY` automatically. Use it for quick tests: `curl -x "$HTTPS_PROXY" https://example.com`.

### Burger Menu

Dropdown navigation menu triggered by a hamburger icon. Uses the WAI-ARIA **disclosure pattern** (not `role="menu"`) because a burger nav is a list of links/actions revealed by a toggle, not an application menu (File/Edit/View). Two variants: React (Vite + Tailwind) for web-only projects, React Native (Expo) for cross-platform.

#### Z-Index Scale

All projects should follow this scale to prevent stacking conflicts between the burger menu, debug pill, modals, toasts, and install banners:

| Layer | Z-Index | Examples |
|-------|---------|----------|
| Base content | 0–10 | Page content, cards |
| Sticky headers | 20 | App bar, bottom nav |
| Sheets / drawers | 30 | Bottom sheets, side panels |
| Menu backdrop | 40 | Burger menu backdrop |
| Menu dropdown | 50 | Burger menu card |
| Modals | 60 | Dialogs, confirmation modals |
| Toasts / banners | 70 | Update banner, install prompt |
| Debug pill | 80 | Debug overlay (separate React root) |

#### Standard Menu Items

Adapt per project. Show/hide based on state — never render disabled items.

| Item | When to show | Category |
|------|-------------|----------|
| How to use / Tutorial | Always | Help |
| User Guide | Always (external link — show indicator) | Help |
| Dark / Light mode toggle | Always | Preferences |
| Check for updates | Web platform + PWA registered | PWA |
| Install app | Web + not installed + not dismissed | PWA |
| Admin | When authenticated admin | Auth |
| Sign out | When authenticated | Auth |

#### React Web (`BurgerMenu.jsx`)

Disclosure-pattern dropdown with backdrop. Tailwind CSS for styling (v3 and v4 compatible).

```jsx
import { useState, useRef, useCallback, useEffect, useId } from 'react'

// Requirement: Global nav menu accessible from header
// Approach: Disclosure-pattern dropdown with backdrop
// Why disclosure, not role="menu": ARIA menu pattern is for app menus
//   (File/Edit/View). Screen readers enter forms mode, suppress normal nav
//   keys, and expect arrow-key navigation. A burger nav is a disclosure.
// Alternatives:
//   - role="menu" pattern: Rejected — wrong ARIA semantics for navigation
//   - Slide-out drawer: Rejected — needs animation lib, fights with bottom nav
//   - Headless UI Disclosure: Viable — adds dependency for a single component

export function BurgerMenu({ items, id }) {
  const autoId = useId()
  const menuId = id || `nav-menu-${autoId}`
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const timerRef = useRef(null)
  const hasBeenOpenRef = useRef(false)

  const visibleItems = items.filter((item) => item.visible !== false)

  const close = useCallback(() => setOpen(false), [])

  // Close menu first, then execute action after DOM settles.
  // 150ms accounts for any CSS transition — adjust if animation changes.
  const handleItem = useCallback((action) => {
    close()
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try { await action() } catch (e) { console.error('Menu action failed:', e) }
    }, 150)
  }, [close])

  // Cleanup pending action timer on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  // Focus management: focus first item on open, return to trigger on close.
  // hasBeenOpenRef prevents stealing focus on initial mount (open starts false).
  useEffect(() => {
    if (open) {
      hasBeenOpenRef.current = true
      const rafId = requestAnimationFrame(() => {
        const firstItem = menuRef.current?.querySelector('button, a')
        firstItem?.focus()
      })
      return () => cancelAnimationFrame(rafId)
    } else if (hasBeenOpenRef.current) {
      triggerRef.current?.focus()
    }
  }, [open])

  // Escape key closes menu
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close() }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, close])

  return (
    <div className="relative no-print">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10
                   transition-colors"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
             stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop — z-40. cursor-pointer required for iOS Safari
              (empty divs don't receive click events without it). */}
          <div
            className="fixed inset-0 z-40 cursor-pointer"
            onClick={close}
          />

          <nav
            ref={menuRef}
            id={menuId}
            aria-label="Main navigation"
            className="absolute right-0 top-full mt-2 z-50
                       w-56 max-w-[calc(100vw-2rem)] rounded-xl shadow-lg
                       bg-white dark:bg-zinc-800
                       border border-zinc-200 dark:border-zinc-700
                       py-1 overflow-hidden overscroll-contain"
          >
            <ul className="list-none m-0 p-0">
              {visibleItems.map((item, i) => (
                <li key={item.label}>
                  {item.separator && i > 0 && (
                    <hr className="my-1 border-zinc-200 dark:border-zinc-700" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleItem(item.action)}
                    className={`w-full text-left px-4 py-2.5 text-sm truncate
                      transition-colors outline-none
                      focus-visible:ring-2 focus-visible:ring-blue-500
                      ${item.destructive
                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                  >
                    {item.label}
                    {item.external && (
                      <svg className="inline-block w-3 h-3 ml-1.5 opacity-40"
                           viewBox="0 0 12 12" fill="none" stroke="currentColor"
                           strokeWidth={1.5} aria-hidden="true">
                        <path d="M3.5 3H9v5.5M9 3L3 9" strokeLinecap="round"
                              strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </div>
  )
}
```

- **Disclosure pattern, not ARIA menu**: `aria-expanded` on trigger, `<nav>` with `<ul>/<li>` — no `role="menu"`, no `role="menuitem"`, no `aria-haspopup`. Using `role="menu"` causes screen readers (JAWS, NVDA) to enter forms mode, suppressing normal navigation keys and confusing users who expect link-style Tab navigation.
- **`useId()` for unique IDs**: Prevents `aria-controls` collisions if multiple BurgerMenu instances exist on the same page.
- **`cursor-pointer` on backdrop**: iOS Safari does not fire click events on empty `<div>` elements. Without `cursor-pointer`, tapping outside the menu on iPhone/iPad silently fails to close it.
- **`hasBeenOpenRef` guard**: Without this, the focus-return `useEffect` runs on initial mount (when `open` starts as `false`), stealing focus from wherever the user currently is.
- **`cancelAnimationFrame` cleanup**: The `requestAnimationFrame` used for focusing the first item must be cancelled if the component unmounts before the next frame.
- **`overscroll-contain`**: Prevents scroll chaining (scrolling the page behind the menu) without touching `document.body.style.overflow`. Avoids the double-lock problem where two components both write body overflow and one overwrites the other's cleanup.
- **`max-w-[calc(100vw-2rem)]`**: Prevents the dropdown from overflowing the viewport on narrow screens.
- **`truncate`**: Prevents long menu item labels from breaking the layout.

**Usage:**

```jsx
<BurgerMenu items={[
  { label: 'How to use', action: () => setShowTutorial(true) },
  { label: 'User Guide', action: () => window.open(GUIDE_URL, '_blank'), external: true },
  { label: darkMode ? 'Light mode' : 'Dark mode', action: toggleDarkMode, separator: true },
  { label: 'Check for updates', action: checkForUpdates, visible: isPWA },
  { label: 'Install app', action: triggerInstall, visible: showInstallPrompt },
  { label: 'Sign out', action: signOut, visible: isAuth, separator: true, destructive: true },
]} />
```

#### React Native (`BurgerMenu.tsx`)

Modal dropdown with transparent backdrop. Cross-platform (iOS, Android, web via Expo).

```tsx
import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Modal, Pressable, View, Text, StyleSheet, Platform, AccessibilityInfo
} from 'react-native'
import { FontAwesome } from '@expo/vector-icons'

// Requirement: Global nav menu accessible from header
// Approach: Modal dropdown with transparent backdrop (disclosure pattern)
// Alternatives:
//   - react-native-drawer-layout: Rejected — extra dependency, fights with tab nav
//   - ActionSheet: Rejected — no custom styling, platform-inconsistent

interface MenuItem {
  label: string
  action: () => void | Promise<void>
  visible?: boolean
  separator?: boolean
  destructive?: boolean
  external?: boolean
}

interface BurgerMenuProps {
  items: MenuItem[]
  theme: {
    surface: string; border: string; text: string
    textSecondary: string; danger: string
  }
}

// Set this to match your app's header height (status bar + nav bar).
// React Native Modal renders in its own layer detached from the trigger,
// so there is no CSS top-full equivalent — this must be a known constant.
const MENU_TOP = 52

export function BurgerMenu({ items, theme }: BurgerMenuProps) {
  const [open, setOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const visibleItems = items.filter((item) => item.visible !== false)

  const close = useCallback(() => setOpen(false), [])

  // Close menu first, then execute action after Modal dismiss settles.
  // 150ms accounts for Modal fade animation — adjust if animationType changes.
  const handleItem = useCallback((action: () => void | Promise<void>) => {
    close()
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try { await action() } catch (e) { console.error('Menu action failed:', e) }
    }, 150)
  }, [close])

  // Cleanup pending action timer on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  // Announce menu state to screen readers
  useEffect(() => {
    if (open) AccessibilityInfo.announceForAccessibility('Menu opened')
  }, [open])

  // Explicit Escape key handler for web — onRequestClose is not always
  // reliable for Escape on all React Native Web versions.
  useEffect(() => {
    if (!open || Platform.OS !== 'web') return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close() }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, close])

  return (
    <>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Menu"
        accessibilityState={{ expanded: open }}
      >
        <FontAwesome name="bars" size={20} color={theme.textSecondary} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        {/* Backdrop: e.target === e.currentTarget instead of stopPropagation
            on children — more reliable in React Native Web. */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={(e) => {
            if (e.target === e.currentTarget) close()
          }}
        >
          <View
            style={[styles.dropdown, {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }]}
          >
            {visibleItems.map((item, i) => (
              <View key={item.label}>
                {item.separator && i > 0 && (
                  <View style={[styles.separator, { backgroundColor: theme.border }]} />
                )}
                <Pressable
                  style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                  onPress={() => handleItem(item.action)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    item.external ? `${item.label}, opens externally` : item.label
                  }
                >
                  <Text
                    style={[
                      styles.itemText,
                      { color: item.destructive ? theme.danger : theme.text },
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}{item.external ? ' ↗' : ''}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  dropdown: {
    position: 'absolute',
    right: 12,
    top: MENU_TOP,
    width: 220,
    maxWidth: '85%',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
             shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 8 },
      default: { boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
    }),
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  itemPressed: {
    opacity: 0.7,
  },
  itemText: {
    fontSize: 15,
  },
})
```

- **`onRequestClose={close}`**: Handles Android hardware back button. Also fires on Escape in some React Native Web versions, but the explicit `keydown` listener provides reliable backup.
- **`e.target === e.currentTarget` on backdrop**: `stopPropagation()` on nested `Pressable` components is unreliable in React Native Web — the RN event system is separate from the DOM event system. Checking the target on the outer handler is more robust.
- **`MENU_TOP` as a project-level constant**: React Native `Modal` renders in its own layer detached from the trigger element. There is no CSS `top-full` equivalent — the menu position must be a known value matching the app's header height. Adjust this per project.
- **All colors from `theme` prop**: No hardcoded color values in the component. Platform shadows (`shadowColor`, `elevation`, `boxShadow`) use neutral values since shadow theming is not practical cross-platform.
- **`minHeight: 44`**: Minimum touch target per Apple HIG and Material Design guidelines.
- **`numberOfLines={1}`**: Prevents long labels from breaking the menu layout.
- **`AccessibilityInfo.announceForAccessibility`**: Notifies screen readers when the menu opens, since React Native does not automatically announce modal visibility changes on all platforms.

#### Key Lessons

1. **`role="menu"` is for application menus only** — File/Edit/View style. Screen readers enter forms mode, suppress normal navigation keys, and expect arrow-key item navigation. A burger nav menu is a disclosure — use `aria-expanded` on the trigger and `<nav>` with a `<ul>/<li>` list. Do not use `aria-haspopup` (it signals "this opens an application menu").
2. **iOS Safari does not fire click events on empty divs** — the backdrop overlay must have `cursor: pointer` (Tailwind: `cursor-pointer`) or it silently fails on all iPhones and iPads. This is an intentional iOS Safari optimization, not a bug, and has persisted across all iOS versions.
3. **Don't steal focus on mount** — the "return focus to trigger on close" effect runs when `open` is `false`, which includes initial mount. Guard with a `hasBeenOpenRef` flag that only becomes `true` after the menu has been opened at least once.
4. **`requestAnimationFrame` needs cleanup** — return `cancelAnimationFrame(id)` from the effect. Without it, the callback fires on unmounted components if the component is destroyed before the next frame.
5. **`overscroll-behavior: contain` avoids the scroll lock race** — two components both writing `document.body.style.overflow = 'hidden'` causes one to overwrite the other's cleanup on unmount. Using `overscroll-contain` on the menu card prevents scroll chaining without touching body styles.
6. **`stopPropagation` is unreliable in React Native Web** — nested `Pressable` event propagation doesn't always work because the RN event system is separate from the DOM. Use `e.target === e.currentTarget` on the outer backdrop handler instead.
7. **RN Modal `onRequestClose` is not enough for web Escape** — it reliably handles Android back button but not always Escape on React Native Web. Add an explicit `keydown` listener as backup for `Platform.OS === 'web'`.
8. **Close-then-act with 150ms delay** — close the menu before executing the action to prevent visual glitches from state changes while the menu is visible. The 150ms accounts for Modal/CSS transition settle time. Clean up the timer on unmount using a ref.
9. **Tailwind v4 `dark:` variant requires project-level config** — v4 defaults to `prefers-color-scheme` (OS preference). For class-based dark mode toggling (`.dark` on `<html>`), the project must add `@custom-variant dark (&:where(.dark, .dark *));` to its CSS. This is the project's responsibility, not the component's. All other Tailwind classes used here are compatible with both v3 and v4.
10. **If wrapping in `React.memo`, memoize the `items` array** — inline array literals (`items={[...]}`) create new references every render, defeating memoization. Use `useMemo` for the items array if the parent re-renders frequently and the menu is memoized.

### Theme & Dark Mode

User-controlled dark/light mode with system preference fallback, persistence, and flash prevention. Two variants: React (Vite + Tailwind) for web-only projects, React Native (Expo) for cross-platform. The burger menu's "Dark / Light mode" toggle item connects to the hook exposed here.

#### CSS Variable Palette

Two sets of semantic tokens — `:root` for light, `.dark` for dark. Use raw hex values (not `theme()`) so the palette works in both Tailwind v3 and v4. Components reference tokens via Tailwind's `ui.*` namespace, so they auto-switch when the `.dark` class changes.

```css
/* Semantic color tokens — Light mode (default) */
:root {
  --color-text-default: #27272a;   /* zinc-800 */
  --color-text-muted: #52525b;     /* zinc-600 */
  --color-text-subtle: #71717a;    /* zinc-500 */
  --color-surface: #ffffff;
  --color-surface-elevated: #fafafa; /* zinc-50 */
  --color-surface-inset: #f4f4f5;  /* zinc-100 */
  --color-surface-hover: #e4e4e7;  /* zinc-200 */
  --color-border: #e4e4e7;         /* zinc-200 */
  --color-border-subtle: #f4f4f5;  /* zinc-100 */
  --color-border-strong: #d4d4d8;  /* zinc-300 */
}

/* Semantic color tokens — Dark mode */
.dark {
  --color-text-default: #f4f4f5;   /* zinc-100 */
  --color-text-muted: #d4d4d8;     /* zinc-300 */
  --color-text-subtle: #a1a1aa;    /* zinc-400 */
  --color-surface: #1a1a2e;
  --color-surface-elevated: #16213e;
  --color-surface-inset: #1e1e3f;
  --color-surface-hover: #252550;
  --color-border: #3f3f46;         /* zinc-700 */
  --color-border-subtle: #27272a;  /* zinc-800 */
  --color-border-strong: #52525b;  /* zinc-600 */
}

/* Native form inputs, selects, scrollbars — must match theme */
html.dark { color-scheme: dark; }
```

- **Semantic names, not color names**: `text-default`, `surface`, `border` — not `gray-800`, `white`, `zinc-700`. Components never reference raw colors directly.
- **Raw hex values, not `theme()`**: The Tailwind `theme()` function is deprecated in v4. Hex values work in both v3 and v4 without any build-time resolution.
- **`color-scheme: dark` on `html.dark`**: Without this, native `<select>`, `<input>`, `<option>` dropdowns, and default scrollbars remain light-themed even when the app is dark.
- **Adapt the dark palette to your brand**: The hex values above use deep indigo backgrounds; swap for slate, neutral, or any dark hue. Keep the token names unchanged.

Wire the tokens into Tailwind so components use `text-ui-text` instead of hardcoded colors. **Using `ui.*` classes eliminates most `dark:` prefixes** — since the CSS variables resolve differently under `:root` vs `.dark`, `bg-ui-surface` auto-switches without needing `dark:bg-ui-surface`. This is the primary benefit of semantic tokens. However, hover states, placeholder text, dividers, and focus rings that reference non-semantic Tailwind colors (e.g., `hover:bg-zinc-100`) still need explicit `dark:` variants:

```js
// tailwind.config.js (v3) — in theme.extend.colors:
ui: {
  text: { DEFAULT: 'var(--color-text-default)', muted: 'var(--color-text-muted)', subtle: 'var(--color-text-subtle)' },
  surface: { DEFAULT: 'var(--color-surface)', elevated: 'var(--color-surface-elevated)', inset: 'var(--color-surface-inset)', hover: 'var(--color-surface-hover)' },
  border: { DEFAULT: 'var(--color-border)', subtle: 'var(--color-border-subtle)', strong: 'var(--color-border-strong)' },
}
```

#### Tailwind Dark Mode Config

Tailwind v3 and v4 handle class-based dark mode differently:

**Tailwind v3** — `tailwind.config.js`:
```js
export default { darkMode: 'class', /* ... */ }
```

**Tailwind v4** — in your main CSS file:
```css
@custom-variant dark (&:where(.dark, .dark *));
```

Both look for a `.dark` class on `<html>`. The hook below manages that class.

#### React Web (`useDarkMode.js`)

Hook with localStorage persistence, system preference fallback, cross-tab sync, dynamic meta theme-color, and safe storage access.

```js
import { useState, useEffect } from 'react'

// Requirement: User-controlled dark/light mode with system fallback and cross-tab sync
// Approach: localStorage persistence, .dark class on <html>, matchMedia listener,
//   storage event for cross-tab sync, dynamic meta theme-color update
// Alternatives:
//   - CSS-only prefers-color-scheme: Rejected — no user override possible
//   - React Context: Rejected — overkill for web (DOM class is the source of truth)
//   - Zustand/Redux: Rejected — theme is UI-only state, no cross-component actions
//   - next-themes: Rejected — SSR/multi-theme/forced-page features not needed for SPA

function safeStorageGet(key) {
  try { return localStorage.getItem(key) } catch { return null }
}

function safeStorageSet(key, value) {
  try { localStorage.setItem(key, value) } catch { /* sandboxed iframe, disabled storage */ }
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = safeStorageGet('darkMode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Apply .dark class to <html> and persist choice
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    safeStorageSet('darkMode', isDark)
  }, [isDark])

  // Cross-tab sync — when another tab changes darkMode in localStorage,
  // update this tab to match. The storage event only fires in OTHER tabs
  // (not the one that wrote), so there's no infinite loop risk.
  // Both next-themes and use-dark-mode include this; without it, two tabs
  // show different themes until the stale tab is refreshed.
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'darkMode' && e.newValue !== null) {
        setIsDark(e.newValue === 'true')
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Track OS preference changes — only when user hasn't made an explicit choice
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      if (safeStorageGet('darkMode') === null) setIsDark(e.matches)
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggle = () => setIsDark((prev) => !prev)

  return { isDark, toggle }
}
```

- **`safeStorageGet` / `safeStorageSet`**: localStorage throws `SecurityError` in sandboxed iframes, disabled-storage settings, and some enterprise environments. Wrapping both reads and writes in try/catch ensures the hook degrades to system preference instead of crashing.
- **System preference is a fallback, not an override**: Once the user toggles manually, their choice is stored and system changes are ignored. Overriding a manual choice with OS preference changes is disorienting.
- **`.dark` on `document.documentElement`**: Applying to `<html>` rather than `<body>` ensures `:root`-level styles and pseudo-elements also switch.
- **No CSS transition on theme switch**: Instant switches are the industry standard (GitHub, Discord, VS Code). Transitions cause visual inconsistency — different elements change at different rates. If transitions are ever wanted, use the inject-remove-stylesheet pattern to disable them during programmatic switches.
- **Cross-tab sync via `storage` event**: The `storage` event only fires in *other* tabs (not the one that wrote to localStorage), so there's no infinite loop risk. Without this, two tabs show different themes until the stale tab is refreshed. Both `next-themes` and `use-dark-mode` include this feature.


#### Flash Prevention (`index.html`)

The hook runs after React mounts — too late. An inline `<script>` in `<head>` reads localStorage and applies `.dark` before the first paint. Same early-capture pattern as the PWA `beforeinstallprompt` script.

```html
<script>
  (function() {
    try {
      var stored = localStorage.getItem('darkMode');
      var isDark = stored !== null
        ? stored === 'true'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) document.documentElement.classList.add('dark');
    } catch(e) {}
  })();
</script>
```

Place before any `<link>` or `<script type="module">` tags. Executes synchronously during HTML parse.

- **Must be a classic script, not `type="module"`**: Module scripts are deferred — they run after DOM parse, too late to prevent flash.
- **Same logic as the hook**: Duplicates the localStorage/matchMedia check. If you change the storage key in the hook, update it here too.
- **try/catch**: Handles environments where localStorage is unavailable. Falls back to system preference via matchMedia.
- **CSP note**: Strict Content Security Policy without `unsafe-inline` blocks inline scripts. For static hosting, precompute the script's SHA-256 hash and add it to the CSP: `script-src 'self' 'sha256-<hash>'`. For server-rendered pages, use a per-request nonce.

#### Meta Theme-Color

A single tag with the brand color. The status bar is a branding surface — it carries the brand color, not the page background:

```html
<meta name="theme-color" content="#10b981" />
```

- **Use the brand color, not background colors**: Switching between `#ffffff` (light) and `#1a1a2e` (dark) causes visibility problems — if the phone's OS is set to the opposite color scheme from the app, status bar text (time, battery, wifi) becomes invisible (light text on light background, or dark text on dark background). A mid-tone brand color provides enough contrast for status bar text in both OS modes.
- **One tag, not two**: Since the brand color is the same regardless of color scheme, media queries are unnecessary. The brand color is constant.
- **Firefox ignores `theme-color` entirely**: This is a graceful no-op — the browser chrome stays its default color.
- **Android PWA override**: In standalone mode, the manifest's `theme_color` overrides meta tags.

#### Print Override

Force readable output regardless of dark mode:

```css
@media print {
  .no-print { display: none !important; }
  body {
    background: white !important;
    color: black !important;
  }
  a {
    color: black !important;
    text-decoration: underline !important;
  }
}
```

Pairs with the "Download as PDF" suggested implementation.

#### React Native (`useAppTheme.ts`)

Context-based theme with AsyncStorage persistence. Components consume the full color token object, not just an `isDark` boolean.

```typescript
import React, { useContext, useMemo, useCallback, createContext } from 'react'
import { usePersistedState } from './usePersistedState'

// Semantic color tokens — both objects must have identical keys.
// Brand colors stay constant across themes; only lightness adjusts for contrast.
export const LightTheme = {
  text: '#111827', textSecondary: '#6B7280', textTertiary: '#6B7280',
  background: '#F9FAFB', surface: '#FFFFFF', border: '#E5E7EB', borderLight: '#F3F4F6',
  primary: '#0D9488', primaryLight: '#14B8A6',
  error: '#DC2626', errorBg: '#FEE2E2', success: '#16A34A', successBg: '#DCFCE7',
  warning: '#F59E0B', warningBg: '#FEF3C7',
}

export const DarkTheme = {
  text: '#F9FAFB', textSecondary: '#9CA3AF', textTertiary: '#9CA3AF',
  background: '#111827', surface: '#1F2937', border: '#374151', borderLight: '#1F2937',
  primary: '#14B8A6', primaryLight: '#2DD4BF',
  error: '#EF4444', errorBg: '#7F1D1D', success: '#22C55E', successBg: '#14532D',
  warning: '#FBBF24', warningBg: '#78350F',
}

export type AppTheme = typeof LightTheme

interface ThemeContextValue {
  theme: AppTheme
  isDark: boolean
  toggleTheme: () => void
  themeHydrated: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark, loaded] = usePersistedState<boolean>('theme_dark', true)
  const theme = isDark ? DarkTheme : LightTheme
  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), [setIsDark])
  const value = useMemo(
    () => ({ theme, isDark, toggleTheme, themeHydrated: loaded }),
    [theme, isDark, toggleTheme, loaded]
  )
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useAppTheme(): AppTheme {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useAppTheme must be inside AppThemeProvider')
  return ctx.theme
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useThemeMode must be inside AppThemeProvider')
  return { isDark: ctx.isDark, toggleTheme: ctx.toggleTheme, themeHydrated: ctx.themeHydrated }
}
```

- **`themeHydrated` exposed via context**: The splash screen must wait for this flag before hiding. Without it, users who stored "light" see a dark flash before the stored preference loads.
- **Both theme objects must have identical keys**: `type AppTheme = typeof LightTheme` enforces this at compile time. Missing a token in one theme causes runtime errors.
- **`textTertiary` is the same value in both themes**: Tertiary text is decorative — `#6B7280` passes AA on light backgrounds, `#9CA3AF` passes AA on dark backgrounds. Do not swap these accidentally (the original values were reversed, failing WCAG contrast).
- **Brand colors stay constant across themes**: Primary hue doesn't change — only lightness adjusts for contrast against the background.

#### Flash Prevention (React Native)

Hold the splash screen until both fonts AND theme preference are hydrated from AsyncStorage:

```typescript
// In app/_layout.tsx:
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ /* ... */ })

  return (
    <AppThemeProvider>
      <RootLayoutInner fontsLoaded={fontsLoaded} />
    </AppThemeProvider>
  )
}

function RootLayoutInner({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isDark, themeHydrated } = useThemeMode()

  useEffect(() => {
    if (fontsLoaded && themeHydrated) SplashScreen.hideAsync()
  }, [fontsLoaded, themeHydrated])

  if (!fontsLoaded || !themeHydrated) return null

  return (
    <ThemeProvider value={isDark ? CustomDarkTheme : CustomLightTheme}>
      <Stack />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  )
}
```

- **Wait for both conditions**: Hiding the splash on font load alone lets the wrong theme flash before AsyncStorage resolves.
- **`app.json` backgroundColor**: Set to match the default theme (dark). The native splash screen renders this color before any JavaScript runs — prevents white flash even before React mounts.
- **`StatusBar style`**: Toggle based on `isDark` so the status bar text remains readable against the current background.

#### Related Patterns

**SVG icons with `currentColor`**: Icons using `fill="currentColor"` or `stroke="currentColor"` auto-adapt to theme via CSS color inheritance. The burger menu's hamburger icon already uses this pattern. Prefer `currentColor` over hardcoded fill colors for all theme-aware icons.

**Chart/graph colors**: Chart libraries (Chart.js, Recharts, D3) use hardcoded color arrays by default. Pass theme-derived colors to chart config and re-render on theme change. Without this, charts become unreadable on dark backgrounds.

**Content themes vs app dark mode**: App theme (dark/light) controls the application chrome. Content themes (templates, canvas styles, color schemes) are independent — a user may want a light content theme while using the app in dark mode. Do not conflate these two concepts.

**Debug pill in separate React root**: The debug pill renders in its own React root (survives App crashes) and cannot access `useDarkMode` or `AppThemeProvider`. On web, read the `.dark` class from `document.documentElement` directly to determine theme. Do not attempt to share React context across separate roots.

#### Key Lessons

**Foundations:**

1. **System preference is a fallback, not an override.** Once the user toggles manually, their choice persists. Overriding a manual choice with OS preference changes is disorienting.
2. **Flash prevention requires an inline `<script>` in `<head>`.** The React hook runs after mount — too late. The script must be classic (not `type="module"`), duplicate the localStorage/matchMedia logic, and run before any `<link>` tags.
3. **`.dark` class on `<html>`, not `<body>`.** Tailwind's `dark:` variant targets descendants of `.dark`. Placing it on `<html>` ensures `:root`-level styles and pseudo-elements also switch.
4. **No CSS transitions on theme switch.** Instant switches are the industry standard (GitHub, Discord, VS Code). Transitions cause visual inconsistency — different elements change at different rates. If transitions are ever wanted, use the inject-remove-stylesheet pattern to disable them during programmatic switches.

**HTML & browser chrome:**

5. **The status bar is a branding surface, not a content surface.** Use your brand color (e.g., `#10b981`), not the page background color. Switching between light (`#ffffff`) and dark (`#1a1a2e`) background colors causes visibility problems — if the phone's OS is set to the opposite color scheme from the app, status bar text (time, battery, wifi icons) becomes invisible. A mid-tone brand color provides enough contrast for status bar text in both light and dark OS modes.
6. **One `<meta name="theme-color">` tag with the brand color.** Since the brand color is constant regardless of light/dark mode, media queries are unnecessary. No dynamic JS update needed — the HTML tag is the source of truth. On iOS standalone PWAs, use `apple-mobile-web-app-status-bar-style: black-translucent` — it shows the page background through the status bar. iOS status bar text is always white with `black-translucent` (platform limitation).
7. **In Android PWA standalone mode, the manifest `theme_color` overrides meta tags.** The manifest value should also be the brand color. On iOS, the meta tag approach works correctly in standalone.
8. **Strict CSP blocks the flash prevention inline script.** For static hosting, precompute the script's SHA-256 hash and add `'sha256-<hash>'` to the CSP `script-src` directive. For SSR, use a per-request nonce. Most deployments don't set strict CSP — document as a caveat, not a blocker.

**CSS & Tailwind:**

9. **Semantic token names, not color names.** `text-default`, `surface`, `border` — not `gray-800`, `white`, `zinc-700`. Swapping the entire palette is a single-file change.
10. **Use raw hex values in CSS, not `theme()`.** The `theme()` function is deprecated in Tailwind v4. Hex values work in both v3 and v4. V4 projects can optionally reference auto-generated `var(--color-zinc-800)` variables instead.
11. **Tailwind v3 uses `darkMode: 'class'` in config. Tailwind v4 uses `@custom-variant dark` in CSS.** Both target `.dark` on `<html>`. See the Burger Menu Key Lessons for the full v4 directive.
12. **`color-scheme: dark` on `html.dark` is required.** Without it, native form inputs, select dropdowns, and default scrollbars remain light-themed even in dark mode.
13. **Some Tailwind utilities still need `dark:` prefixes even with semantic tokens.** The `ui.*` token classes auto-switch for text, background, and border colors. But hover states (`hover:bg-zinc-100 dark:hover:bg-zinc-700`), placeholder text, dividers, and focus rings may still need explicit `dark:` variants because they reference non-semantic Tailwind colors.

**Storage & sync:**

14. **Wrap all localStorage access in try/catch.** Sandboxed iframes, disabled storage, and enterprise policies throw `SecurityError`. Fall back to system preference when storage is unavailable.
15. **Cross-tab sync requires the `storage` event listener.** The `storage` event only fires in other tabs (not the one that wrote), so there is no infinite loop. Without it, toggling dark mode in one tab leaves other tabs on the old theme until refresh. This is a standard feature in `next-themes` and `use-dark-mode`.

**React Native:**

16. **Hold the splash screen until theme is hydrated.** On React Native, `usePersistedState` loads asynchronously from AsyncStorage. Hiding the splash before the stored preference resolves causes a visible flash. Wait for both fonts and theme hydration.
