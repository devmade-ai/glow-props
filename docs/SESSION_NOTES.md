# Session Notes

**`## Communication` is a goal, not rules — and it is on trial.**

Replaced 2026-08-17: twelve bullets and a prescribed three-part reply shape
became one goal and five tests. The other 18 fleet repos still carry the old
bullets.

**That split is deliberate.** An `align` pass will read this repo as drifted. It
has not drifted — the fleet is behind. Do not level gp-props back down to the
twelve bullets, and do not propagate the goal until the user says so.

No script can verify a goal. It is checked by the `convention` trigger and by
noticing which of the five tests a reply failed; the misses so far are recorded
in [`AI_MISTAKES.md`](AI_MISTAKES.md).

Delete this once the goal has held for a few sessions and the fleet is synced.

---

**App-shell baseline: decisions are locked; the spec text is not yet written.**

Locked 2026-08-24 on branch `claude/mobile-optimized-design-baseline-gv2jma`
after three review rounds. The write-up is its own turn: **one commit** creating
`docs/implementations/APP_SHELL.md` plus the amendments it forces —
`BURGER_MENU.md` (the slide-out rejection at :323 is superseded where a bottom
nav exists; the RN note at :593 rejects only `react-native-drawer-layout`, quote
it that narrowly) and `Z_INDEX_SCALE.md` (overlay-vs-scrimless note below).
Without those amendments in the same commit, an `align` pass will read
APP_SHELL as drift. No reference implementation until the spec text is locked
in writing. Delete this entire section when that commit lands.

The complete lock list — nothing here is still open:

- **Geometry.** Percentages are of the viewport; drawers dock to the viewport
  edge. Content column `width: min(100% - 2rem, clamp(48rem, 60vw, 72rem));
  margin-inline: auto;` — spec must note 60vw only wins between 1280–1920px.
  One width breakpoint (768) plus a short-viewport clause: height ≲ 500px keeps
  mobile chrome even at desktop width.
- **Left drawer** = today's burger contents (theme, install, how-to — overflow
  and settings, not primary nav). Overlay everywhere. The bottom-nav menu
  button opens it; the thin header carries identity + current-view actions
  only, no second burger.
- **Right drawer** = AI chat. Overlay (full viewport width) on mobile; push/
  split pane at 50vw on desktop — content takes the rest, the 60% cap is
  dropped while split. Internals: scroll pinned to bottom while streaming,
  unread badge on the collapsed tab, conversation survives close/reopen.
- **Bottom sheet** = contextual detail of the current selection. Contract:
  select → peek (handle + one line above the nav + `safe-area-inset-bottom`;
  UI-sized, never a viewport fraction); drag to snaps **50% / 90% of the
  canvas** (the area below the header and above the nav, not the viewport);
  no selection → no sheet. Content taller than the snap scrolls inside; drag
  rubber-bands to the nearest snap. Scrimless at every snap — canvas stays
  live, a new selection replaces the content. Desktop: sheet is
  **content-column width**, not viewport width, so it can sit on top of the
  pushed AI panel without covering its input. Closed ≠ collapsed(peek) ≠
  expanded is the named state triad.
- **Concurrency.** Desktop: both side drawers allowed; sheet allowed over the
  pushed AI panel. Mobile: at most one expanded overlay (full width covers
  everything); a modal closes expanded drawers, peeks may stay.
- **Dismissal / back.** Tap to open (no edge-swipe open — fights OS
  back-swipe), swipe to close. Escape / Android back pops the topmost layer
  via history: push one entry per overlay open (not per snap drag), close on
  `popstate`; spec names that forward reopens the overlay. One owner for
  history + the body-lock refcount.
- **Stacking (final, after two wrong drafts).** 1) Peek/in-flow: no z,
  `bottom: nav-height + safe-area`. 2) Expanded bottom sheet, every snap:
  **z-30, no scrim**, covers the nav. 3) Tap-outside side drawers: backdrop
  **40** + panel **50**, with a real backdrop element — a reference
  implementation must NOT copy the document-level click handler
  (`Z_INDEX_SCALE.md:93`, a gp-props burger deviation). Split panes are
  layout (flex/grid), off the scale. Backdrop stays 40; modal 60 / toast 70 /
  debug 80 unchanged; header + nav stay 20. No header dropdown while an
  overlay drawer is open; the desktop AI split is in-flow, so dropdowns are
  fine there. The rejected drafts, so they don't come back: an expanded-sheet
  40/50 scrim eats canvas taps and dims the AI split (unmakes the selection
  contract and the concurrency default); "sheet at 50 without a backdrop"
  was the interim reading, superseded by z-30.
- **Bottom nav** folds into the header at the desktop breakpoint; kept on
  short viewports.
- **Modals, two kinds.** Workspace: 90vw × 90% of the viewport, height not
  content-driven, internal scroll. Confirm/alert: content-sized, capped at
  90%. Keyboard adaptation on the overlay only, via `visualViewport`; the
  shell stays on measured `--app-height` (`PWA_SYSTEM.md:1598` — no `resize`
  on the shell, `dvh` only as CSS fallback); inputs ≥ 16px.
- **Toasts** z-70, offset above `nav-height + safe-area-inset-bottom`;
  top-pinned banners mirror with `safe-area-inset-top`
  (`PWA_SYSTEM.md:1153`).
- **A11y / motion.** 44px hit targets on thin paint (12–16px visible handle,
  larger hit area); snap handle is a button with arrow-key snap stepping;
  focus trap/restore + `inert` via the existing `useFocusTrap` /
  `useDisclosureFocus` / `useEscapeKey` hooks, never reinvented;
  `prefers-reduced-motion` drops slides to fades; `overscroll-contain` inside
  every surface; one scroll-lock owner with a refcount; transforms +
  `transition` only, no animation library; RTL flips the side drawers.
