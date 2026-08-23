---
slug: mobile-app-shell
title: Mobile App Shell
badge: UI
description: Baseline layout shell for a mobile-first app — thin header, bottom nav, three edge drawers, a snapping bottom sheet, full-height modals, and the viewport and layering rules that hold them together.
tags:
  - Layout
  - Surfaces
  - Virtual keyboard
  - Cross-project standard
order: 14
---

# Mobile App Shell

Baseline layout shell for devmade-ai apps: thin header, bottom nav, three edge drawers, a snapping bottom sheet, and full-height modals. Mobile is the design target. Desktop widens the content column and swaps the bottom nav for a rail; it does not introduce a different information architecture.

## What this document is

A guideline. It states what must be true, what the values are, and why each decision was made. It does not contain implementation.

Every rule here is testable by inspection or by using the app. If a rule cannot be checked without reading source, it is written wrong and should be rephrased.

The reference implementation lives in FuelHunt. Where an implementation and this document disagree, this document is the defect report.

## Knowledge absorbed from other patterns

The parts of the following patterns that bear on the shell are stated here in full, so this document can be applied without opening them. Those patterns keep the code and remain canonical for it.

- [Z_INDEX_SCALE.md](Z_INDEX_SCALE.md) — layer values, stacking-context rules, audit approach.
- [BURGER_MENU.md](BURGER_MENU.md) — focus and disclosure behaviour, iOS and React Native gotchas, close-then-act.
- [TIMER_LEAKS.md](TIMER_LEAKS.md) — cleanup obligations.
- [EVENT_BUS.md](EVENT_BUS.md) — transport guarantees the surface manager relies on.
- [DEBUG_SYSTEM.md](DEBUG_SYSTEM.md) — on-device diagnostics.
- [THEME_DARK_MODE.md](THEME_DARK_MODE.md) — token sourcing and flash prevention.
- [PWA_SYSTEM.md](PWA_SYSTEM.md) — install and update surfaces.

---

## 1. Layout baseline

### Breakpoints

Two layouts, split at 1024px.

- Below 1024px: mobile layout. Full-bleed content, bottom nav, full-width drawers, sheet snaps.
- 1024px and above: desktop layout. Centred clamped column, left rail, half-width drawers.

Phones and tablets share the mobile layout. Every iPad below 13 inches falls inside it: iPad viewport widths run from 744px on the mini to 1032px on the 13-inch Pro. A half-width drawer on an 820px iPad is 410px, too narrow for chat and too wide to read as navigation. Thirteen-inch iPads in portrait sit at or above 1024px and get the desktop layout, which is correct at that width.

There is no tablet band. A third layout triples the test matrix for a range the mobile layout already handles.

### Content column

- Mobile: full width with 16px side padding.
- Desktop: clamped between 640px and 1100px, targeting 60% of viewport width, horizontally centred.

The clamp carries more weight than the percentage. Unclamped, 60% is 768px on a 1280px laptop and 1536px on a 2560px display; the first is fine and the second is unreadable.

### Header

- Fixed, 56px tall, present at every breakpoint.
- Holds the app mark, the context title, at most two app-level actions, and the disclosure menu.
- The title truncates. It never wraps and never pushes the actions off screen.
- The disclosure menu is the burger menu pattern unchanged: theme, install, check for updates, help, sign out.
- A header with a blur or translucency effect creates a stacking context. See section 3.

### Bottom nav, mobile layout only

- Fixed, three to five destinations, icon with label.
- Destinations only. No menu button. App-level actions live in the header menu, account and workspace live in the left drawer, and a nav menu button would duplicate both.
- 56px tall plus the bottom safe-area inset.
- Hides while the virtual keyboard is open.
- Sits below every drawer, sheet, and modal.

### Left rail, desktop layout only

- Fixed, 72px wide, replacing the bottom nav one for one.
- Same destinations, plus an avatar control in the footer that opens the left drawer.
- The left drawer survives on desktop. Destinations belong on the rail; account and workspace switching are infrequent and would bloat it.

---

## 2. Surfaces

### Inventory

- Left drawer: account, workspace switching, settings.
- Right drawer: AI chat.
- Bottom sheet: contextual detail for the current selection.
- Modal: a focused task or form.
- Toast: transient feedback.

### Shared contract

Every surface, regardless of type, answers the same questions. Any surface that cannot is incomplete.

- Is it open.
- Is it topmost. Escape, back, and the backdrop belong to the topmost surface alone.
- Is it modal in the current layout. Modal means backdrop, focus containment, inert background, and scroll lock together, never a subset.
- Is it dismissible right now, and if not, what confirmation replaces dismissal.
- What is announced when it opens, and what is announced when its content changes without it closing.
- What it renders while loading, when empty, and on error.
- What it cleans up when it closes.

Surfaces differ in geometry and content. They do not differ in this contract.

---

## 3. Layering

### The scale

- 0 to 10: base content, cards, inline elements.
- 20: sticky chrome, meaning header, bottom nav, left rail.
- 28: surface backdrop, behind drawers and the bottom sheet.
- 30: side drawers.
- 34: bottom sheet.
- 38: AI drawer when non-modal on desktop.
- 40: overlay backdrop, behind menus and modals.
- 50: menus, dropdowns, popovers, tooltips.
- 60: modals, dialogs, confirmations, full-screen overlays.
- 70: toasts, update banners, install prompts.
- 80: debug pill, always topmost.

Values 28 through 38 are the shell's subdivision of the single sheets-and-drawers layer in the base scale. Everything else is unchanged.

### Rules

1. Every z-index in the codebase maps to a value in this list. No arbitrary large numbers. A new layer means editing this document first.
2. A backdrop renders directly beneath the surface it belongs to. Two backdrop layers exist for that reason: one at 28 for surfaces in the 30s, one at 40 for menus and modals. Same component, different layer.
3. One backdrop instance per band, never two in the same band. A second surface in the same band reuses the existing one rather than stacking a second layer of opacity, which would double the dimming. A modal opened from inside a drawer is the case that needs both bands at once: the drawer keeps its backdrop at 28 and the modal gets its own at 40, because the modal has to dim the drawer as well as the page.
4. Nothing renders above the debug pill.
5. Sticky chrome always sits below every overlay.
6. Wrapper elements do not carry a z-index. A positioned parent with a z-index creates a stacking context its children cannot escape.

Tailwind's *named* steps stop at 50, but since v4 `z-index` takes a bare numeric value, so `z-60`, `z-70` and `z-80` compile to real utilities with no brackets and no config. On v3, whose named scale is the whole scale, these need the arbitrary form `z-[60]`. Either way, name a layer as a utility where its meaning is worth stating at the call site, and keep the numbers greppable.

### The top layer beats all of it

One escape hatch outranks the entire scale. An element promoted to the **top layer** — a `<dialog>` opened with `showModal()`, or anything shown through the `popover` attribute — renders above every stacking context in the document, whatever any ancestor's transform, `overflow`, or z-index says. Nothing on the page can cover it, and no ancestor can trap it. Only `showModal()` promotes; `show()` does not.

Where that lands for this shell:

- **Modals: use the native dialog.** `showModal()` marks every element in the document except the dialog and its descendants inert, which is section 6's primary mechanism arriving for free, and brings the top layer, `::backdrop` and Escape with it. Two limits it does not cover: focus can still leave for browser UI (whatwg/html#8339, open), and only the containing document is blocked, so a dialog inside an iframe leaves the outer page interactive. Layer 60 still describes anything that must sit above it.
- **Menus, dropdowns, tooltips: use popover.** Light dismiss and Escape come with it, and a header's blur can no longer trap the dropdown.
- **Drawers, sheets and toasts stay on the scale.** A drawer is non-modal on desktop, a sheet coexists with the chrome around it, and toasts stack with each other rather than claim one layer. Top-layer ordering is by promotion order, which is the wrong model for all three.

Both are cross-browser: dialog since March 2022, when Safari 15.4 and Firefox 98 shipped it, and popover since April 2024, when Firefox shipped it. Both are Baseline *newly* available at those dates, not widely available — popover's Baseline date has since been restated as January 2025, and it is projected to reach widely available in July 2027. Where a target cannot use them, React Native above all, the portal rules below are the fallback. They are not the default any more.

### Stacking contexts

A z-index is only meaningful within its stacking context. These properties on any ancestor create one, and every descendant is then trapped inside it regardless of its own z-index:

- a z-index on a non-static positioned element
- transform, translate, rotate, scale
- filter, backdrop-filter
- opacity below 1
- will-change naming any of the above
- contain set to layout or paint
- isolation set to isolate

Two consequences bite this shell specifically.

**Drawers and sheets animate with transform**, so they create a stacking context whenever they are open. A modal opened from inside a drawer is trapped beneath that drawer's own backdrop no matter what layer it claims. Every modal and every toast that is not in the top layer therefore mounts at the document root, not where it is declared.

**A header with a blur effect traps its own dropdown.** Four fixes, in order of preference:

1. **Portal the backdrop, not the dropdown.** Leave the menu inside the header and render only the click-to-close backdrop to the document root, at a layer *below* the header's own. The backdrop still covers the page; the menu still sits above it, because it is inside a stacking context that outranks the backdrop's layer. This is the only fix that keeps both a real backdrop and the dropdown's DOM position, so tab order and the trigger's `aria-controls` relationship need no repair. It is the one exception to rule 2, and [Z_INDEX_SCALE.md](Z_INDEX_SCALE.md) carries it.
2. **Render the dropdown as a sibling of the header** rather than a child. Moves it out of tab order behind its trigger; needs explicit focus management.
3. **Mount the dropdown at the document root.** Same tab-order caveat as 2.
4. **Drop the backdrop element** and use a document-level outside-click handler. Keeps the DOM intact but gives up dimming, and on iOS Safari a delegated click on a non-interactive element does not reliably fire (section 20).

### Audit

Grep the codebase for z-index values across markup, styles, and components. Anything outside the list above is a defect. The usual finds are a four-digit value on a debug overlay, a four-digit value on a modal, and a sticky header competing with menus.

---

## 4. Surface manager

One module owns which surfaces are open and in what order. Surfaces publish and subscribe through the shared event bus; they never import each other. Direct calls between drawers create cycles that only appear once two are open at the same time.

The bus provides per-listener error isolation and a catch-all change event. Isolation matters because a throwing subscriber must not prevent a drawer from closing. The catch-all matters because the debug pill can then record every transition without instrumenting each component.

### State

Three values, held once:

- the open surface stack, ordered, last entry topmost
- the current bottom sheet snap
- the current keyboard inset in pixels, zero when closed

Anything else a surface needs is local to that surface.

### Rules

1. One modal at a time. Opening a modal closes any open modal first.
2. Left and right drawers are mutually exclusive.
3. On mobile, opening a side drawer collapses the bottom sheet to peek rather than closing it. The sheet holds selection context the user returns to.
4. On desktop the AI drawer is non-modal: no backdrop, no focus containment, no scroll lock. It exists to be used while working.
5. On mobile the AI drawer is modal.
6. Escape and back address the topmost surface only.
7. Everything below a modal surface is made inert.

---

## 5. Dismissal and history

### Ways out

- Escape closes the topmost surface. The handler cancels the default action so the key does not also exit full screen or clear an input.
- A backdrop tap closes the topmost surface unless it is currently non-dismissible.
- Browser back and the Android hardware back button close the topmost surface instead of leaving the page.

Back is implemented by pushing a history entry when a surface opens and popping it when it closes. A surface closed by any other route must remove the entry it added, or the back stack fills with entries that do nothing.

`CloseWatcher` is the platform version of exactly this, and where it exists it replaces both the Escape handler and the history entry: it fires one close request for Escape on desktop and the back gesture on Android, and it handles the nesting. `<dialog>` and `popover` are wired into the same mechanism, which is a second reason to prefer them (section 3). Support is Chrome 126 and later and Firefox 149, from March 2026; Safari has not shipped it. So the history-entry route above stays, as the iOS path and the fallback — not because there is no better API.

Intercepting back through unload events was considered and rejected: it cannot cancel selectively. Ignoring back entirely was rejected because it exits the app from an open drawer, which reads as data loss.

React Native covers the Android back button through its modal's close request. That is not a substitute for the web behaviour; both are needed in a shared codebase.

### Close then act

When a surface item triggers an action, close the surface first and run the action after a delay matching the close duration. Otherwise the resulting state change is visible behind a surface that is still animating out, which reads as a glitch.

The delay is a timer. It is cancellable, and it is cancelled if the component unmounts first. Errors from the deferred action route to the debug store rather than the console.

### URL state

Surface state belongs in the URL only when the surface holds an addressable resource.

- In the URL: a record or detail opened in the bottom sheet, a specific item opened in a modal.
- Not in the URL: filter panels, the left drawer, the AI drawer, the current snap position.

Where a surface is addressable, back becomes navigation rather than dismissal and the surface must survive a reload. Putting every panel in the URL fills the back stack with entries that mean nothing to the person pressing back.

---

## 6. Focus and inertness

### On mobile, inert does the work

A keyboard focus trap is not sufficient on a mobile-first shell. TalkBack and VoiceOver navigate by swipe gesture rather than by Tab, so a trap that intercepts only keyboard events gives swipe users no boundary and they escape the dialog into background content.

Marking the background inert is therefore the primary mechanism, and the keyboard trap is the desktop supplement. Inert removes the subtree from tab order, pointer events, assistive technology, page search, and text selection at once. `aria-hidden` alone does none of that except the third.

Inert became broadly interoperable in April 2023 with Chrome and Edge 102, Firefox 112 and Safari 15.5, and reached Baseline widely available in October 2025 — both dates confirmed against web.dev's Baseline record. No polyfill is needed for a greenfield project. (Do not confuse the HTML `inert` attribute with the CSS `interactivity: inert` property, which is Chromium-only and not Baseline; searches conflate the two.) The legacy polyfill is unmaintained and works by tree-walking, which is expensive; do not add it. A CSS-driven equivalent exists but has narrower support, so the attribute remains the choice.

Source: https://blog.openreplay.com/inert-attribute-focus-interactivity/

### Focus behaviour

- Focus moves into a surface when it opens and returns to the trigger when it closes.
- Focus does not move on first mount. Only a surface that has been opened at least once returns focus on close, otherwise the page steals focus on load.
- Focus moves one frame after the open state flips, not in the same tick. The content is not in the document at the moment the state changes.
- The focus trap records what was focused before it activated and restores that element on deactivation, rather than assuming the trigger.
- Escape binds to topmost, not to open. Bound to open, one keypress closes three surfaces.

### Semantics

- Triggers are buttons, carry an expanded state, and reference the surface they control.
- Identifiers for that reference are unique per instance. Two shells on one page, or a component rendered twice, must not collide.
- Surfaces are dialogs when modal, labelled by their own title.
- Use disclosure semantics, not menu semantics. Menu semantics promise arrow-key navigation and typeahead; announcing a menu the user then cannot drive is worse than announcing nothing.
- An edge rail is a button with an expanded state, never a bare element with a click handler.
- Content that changes inside an open surface, such as the sheet swapping to a new selection, is announced through a polite live region. The visual change alone is silent.
- On React Native, surface visibility changes are not announced on all platforms and need an explicit announcement.

---

## 7. Viewport and the virtual keyboard

### Behaviour to design against

Current mobile browsers resize only the visual viewport when the on-screen keyboard opens. The layout viewport is untouched. Chrome on Android moved to this behaviour at version 108 to align with Mobile Safari, and Firefox followed at version 132.

The consequence drives everything below. Because the layout viewport does not change, viewport units do not change either. A full-height value in `dvh` does not shrink when the keyboard opens. `dvh` solves collapsing browser chrome and nothing else. Anchored elements stay where the layout viewport puts them, which is behind the keyboard.

### The opt-in

The viewport meta tag needs four things: device width, initial scale of 1, cover fit for safe areas, and the interactive-widget keyword set to resize content. The last one restores layout viewport resizing so viewport units and fixed positioning respond to the keyboard again.

That keyword is supported in Chrome 108 and later and Firefox 132 and later. Source: htmhell.dev, 4 December 2024, https://www.htmhell.dev/adventcalendar/2024/4/

WebKit has not shipped it. The standards position request remains open with no position assigned: https://github.com/WebKit/standards-positions/issues/65

Both parts are required, not one or the other. A page shipping `viewport-fit=cover` without `interactive-widget=resizes-content` has the safe-area half and none of the keyboard half, which is the easy state to leave a template in, because nothing about it looks wrong until an input is focused.

### The iOS path

iOS needs the visual viewport measured directly and the result exposed as a custom property that bottom-anchored elements consume alongside the safe-area inset.

Knowledge that governs how:

- The inset is the difference between window height and visual viewport height, minus the viewport offset, floored at zero.
- Measurement is throttled to one animation frame. Both resize and scroll fire on the visual viewport, and both fire repeatedly during the keyboard animation.
- The property is removed on teardown, not left at its last value.
- The value stays at zero on Chromium and Firefox where the meta keyword already handles layout, so the same property is safe everywhere.

Rejected alternatives, with reasons: the meta keyword alone, no WebKit support; `dvh` alone, viewport units do not react; focus and blur heuristics, wrong with hardware keyboards, external displays, and a resized window.

The VirtualKeyboard API — `navigator.virtualKeyboard.overlaysContent` with the `env(keyboard-inset-*)` variables — is the standards-track way to get the same inset without measuring, and is also rejected: it is Chromium-only, so it covers exactly the browsers the meta keyword already covers and leaves iOS, the one platform that needs the work, untouched. Adopting it would mean maintaining three keyboard paths instead of two.

### Rules

- Every surface with an input needs this: the AI composer, header search, sheet forms, modal forms.
- The bottom nav hides whenever the inset is above zero.
- The focused input is scrolled into view after the resize settles, not on focus. Focus fires before the keyboard animates, so scrolling then targets the wrong geometry.
- Below 700px of visual viewport height, and in landscape, modals promote to full screen. A 90% modal with the keyboard open leaves almost nothing on a small phone.

---

## 8. Safe areas

- Keep cover fit in the viewport meta project-wide.
- Bottom nav, sheet, and modal footers add the bottom inset to their padding.
- The header adds the top inset.
- Drawers add left and right insets in landscape.
- Backdrops never take insets. A backdrop covers the screen edge to edge, including under the notch and the home indicator.
- Safe-area insets are physical, not logical. They do not swap in right-to-left layouts.

---

## 9. Bottom sheet

### Snap points

Defaults, overridable per project, all as a percentage of the **visual** viewport so the sheet reacts to the keyboard:

- peek, 30%: handle and a one-line summary.
- half, 55%: primary detail.
- full, 92%: everything, with internal scroll.

Behaviour:

- Opens at half with a selection, at peek without one.
- On release, a flick above 500 px/s moves one snap in the direction of travel. Otherwise it settles at the nearest snap.
- Dragging more than a quarter of the peek height below peek closes the sheet.
- The sheet covers the bottom nav. Navigation does not need to stay reachable while a selection is open.

### Scroll handoff

Content scrolls only at the full snap. Below that, vertical drag moves the sheet. At full, downward drag moves the sheet only when the content is already scrolled to the top.

Without this rule the drag and the scroll compete on every gesture and the sheet feels broken. This is the single most-reported bug in sheet implementations.

### Drag is never the only way

Drag-only resizing fails WCAG 2.2 success criterion 2.5.7 Dragging Movements, which is Level AA and requires a single-pointer alternative. Source: https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html

Two alternatives ship together:

- Tapping the handle advances one snap, wrapping from full back to peek.
- An explicit expand and collapse control in the sheet header.

The handle is a 4px line inside a 44px target, labelled with the state it moves to, not the state it is in.

### Selection changes

- A new selection swaps content in place and keeps the current snap.
- The swap is announced politely.
- Multi-select shows a count at peek and the batch actions at half.

---

## 10. Side drawers

- Mobile: full width, capped so the drawer can never exceed the viewport minus a margin.
- Desktop: half width, capped at 560px, so a 2560px display does not produce a 1280px drawer.
- Movement is a horizontal translation. Width and offset are never animated.
- Mobile drawers are modal: surface backdrop, focus containment, inert background, scroll lock.

### Desktop behaviour differs by drawer

**The left drawer overlays, and stays modal at both breakpoints.** It is a short interaction — switch workspace, open settings, sign out — so covering the content costs nothing. Modal follows from the rules rather than being asserted here: section 4 rule 4 carves out only the AI drawer as non-modal, and a drawer that covers the page without taking focus and inertness would leave the covered content reachable behind it. Only the AI drawer changes modality between layouts.

**The right AI drawer shifts the content column instead.** It exists to be used while reading the content, so covering that content defeats its purpose.

The shift is a translation of the column by half the drawer width, which re-centres it in the remaining space. Because the column is clamped and centred, this needs no reflow. Changing the column's width instead would re-lay out every table and chart on each open, which is both slow and visually noisy.

The drawer overlays instead of shifting whenever the column does not fit beside it. Shift only while `clamp(640px, 60vw, 1100px)` is less than or equal to viewport width minus drawer width. Test that **rendered** width, not the 640px minimum: the minimum binds only between 1024 and 1067px, a 43px band at the very bottom of the desktop layout, and the column sits at 60% across everything above it.

With the widths above that puts the crossover at 1400px. Below it the drawer overlays. Testing the minimum instead moves the crossover to 1200px, which breaks every width in between: at 1280px the column overlaps the drawer by 48px and its leading edge leaves the screen, at 1366px by 14px, and the overlap only reaches zero at 1400px. Both figures are arithmetic from the widths above, not measurements.

### Edge affordance

- A 4px visual rail inside a 44px target, anchored to the edge and centred over the middle quarter of the height.
- The left screen edge belongs to the iOS system back gesture. The left rail opens on tap only, never on drag. The right edge may drag.
- The rail is a real button carrying an expanded state.

---

## 11. AI chat drawer

- One active thread, persisted locally, restored on reload. Mobile browsers discard background tabs aggressively, so a reload is routine rather than exceptional. Clearing is explicit through a new-chat action.
- Server-side thread history is a product decision, not a shell decision. The shell reads and writes one thread through an interface a backend can replace.
- When the drawer is closed and a response arrives or is streaming, the trigger carries an indicator.
- Context passing is explicit. If the current selection is being sent, a removable chip above the composer names it. Silent context is indistinguishable from a hallucination when the answer is wrong.
- The composer grows to six lines, then scrolls internally.
- Auto-scroll to the newest message happens only when the user is already at the bottom. Otherwise a jump-to-latest control appears.
- Required states: idle, streaming with a stop control, error with retry, rate limited, offline.
- Code blocks scroll horizontally. They never wrap, because wrapped code is unreadable and cannot be copied cleanly.

---

## 12. Modals

- 90% of visual viewport height, fixed, regardless of content height. Short content centres inside; the modal does not shrink to fit.
- The body scrolls internally. Header and footer stay fixed within the modal.
- Mounted at the document root. See section 3.
- Focus containment and inert background, per section 6.
- Labelled by its own title, announced as a dialog.
- Promotes to full screen below 700px of visual viewport height and in landscape.

### Dirty forms

A modal with untouched fields is always dismissible. Once any field is dirty, Escape and backdrop tap raise a confirmation instead of closing.

Blocking dismissal outright traps anyone who opened the modal by mistake. Silent data loss is worse than one extra tap. A permanently non-dismissible modal is reserved for flows where a partial state would be invalid on the server.

---

## 13. Toasts and banners

- Layer 70, above every surface, mounted at the document root.
- Anchored above the bottom nav, and above the bottom sheet when it is open, so the sheet handle stays reachable.
- Anchored above the keyboard inset when the keyboard is open.
- Maximum three stacked. Beyond that the oldest is replaced rather than queued; a queue that outlives the action it describes is noise.
- Four to six seconds for informational toasts. Errors and anything carrying an action persist until dismissed.
- A toast never carries the only route to an action. It is confirmation, not navigation.
- Toasts are polite live regions. Errors are assertive.
- PWA install prompts and update banners share this layer and count towards the stack limit.

---

## 14. Scroll behaviour

Two components writing to the document body's overflow will have the first unlock the page while the second is still open. This is the most common shell bug once more than one surface exists.

- Contain overscroll on each surface's own scroll container. This stops scroll chaining without touching the body at all and covers most cases.
- Where a true body lock is unavoidable, it is reference-counted in one module. Components never set body styles directly.
- Containment does not cascade. A scrollable list inside a scrollable drawer needs it declared on both.
- Scroll position of the page behind is restored exactly once, no matter how many surfaces were open.
- Each surface restores its own internal scroll position when reopened within a session, except the AI drawer, which returns to the latest message.

---

## 15. Content states

Every surface renders four states, not one. A surface that only handles the loaded state will show an empty box on a slow connection and a blank panel on a failed request.

- **Loading.** Skeletons matching the eventual layout, not a centred spinner, so the surface does not resize when data lands. Below roughly 300ms show nothing rather than flashing a skeleton.
- **Empty.** A sentence explaining what would be here and, where one exists, the action that fills it. Never an empty panel.
- **Error.** What failed, whether it is retryable, and a retry control. The underlying error goes to the debug store, not to the person.
- **Offline.** Distinguished from error. Reads as a state to wait out rather than a failure to act on.

The bottom sheet has a fifth: no selection. It sits at peek with a prompt naming what to select.

---

## 16. Touch targets

Three separate numbers, routinely conflated:

- WCAG 2.2 criterion 2.5.8, Target Size Minimum, Level AA: 24 by 24 CSS pixels, with a spacing exception.
- WCAG 2.2 criterion 2.5.5, Target Size Enhanced, Level AAA: 44 by 44 CSS pixels, no spacing exception.
- Apple's guidance is 44 by 44 points. Material's is 48 by 48 density-independent pixels.

Shell rule: 44px minimum on every interactive element, 48px on primary destinations. The AA floor of 24px is a compliance number, not a design target; at 24px on a phone the mis-tap rate is the problem being solved.

Set the minimum as an explicit height. Vertical padding alone does not reliably reach 44px across font sizes and themes.

Visual size and target size are independent. The sheet handle and the edge rails are 4px wide and 44px tappable.

Sources: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html and https://testparty.ai/blog/wcag-target-size-guide

---

## 17. Motion

- Only translation and opacity animate. Height, width, and offsets never do.
- Drawer open 220ms, drawer close 160ms, sheet snap 260ms, modal 200ms, content column shift 220ms to match the drawer.
- Sheets and drawers use a decelerating curve that overshoots slightly at the start of travel. Modals use a standard ease-out.
- During a drag, movement tracks the pointer exactly with no easing applied. Easing is added only on release.
- Reduced-motion preference cuts every transition to an instant state change — no travel. Snap points still apply; only the animation goes. Where a hard cut reads as a glitch rather than a change, the one permitted substitute is a short opacity fade that moves nothing, and its duration is a token like every other duration here (section 19). Do not type a number at the call site.
- Close-then-act delays match the close duration and change with it. They are read from the same token, not typed in twice.

---

## 18. Direction

The shell is direction-aware. Left and right are not fixed positions.

- Drawer edges are logical: the navigation drawer opens from the inline start, the AI drawer from the inline end. In right-to-left layouts both swap sides, including the rails.
- Padding, margins, and insets use logical properties so they swap with direction.
- Translations do not swap automatically. Movement direction is derived from the resolved direction, not hardcoded.
- Safe-area insets stay physical. See section 8.
- The desktop content column shift reverses with direction.
- Icons that indicate direction, such as expand and collapse chevrons, mirror. Icons that do not, such as the avatar or a status glyph, do not.

---

## 19. Tokens

Named once, consumed everywhere. A value that appears in two places without a name will diverge.

Geometry:

- header height, 56px
- bottom nav height, 56px, plus bottom safe-area inset
- rail width, 72px
- desktop drawer width, half the viewport capped at 560px
- content column width, clamped 640px to 1100px targeting 60%
- sheet snaps, 30%, 55%, 92% of visual viewport height
- minimum target size, 44px; primary destination target size, 48px
- edge rail visual width, 4px

Runtime:

- keyboard inset, set by measurement, zero by default

Motion:

- drawer open, drawer close, sheet snap, modal, column shift durations, per section 17
- surface easing and overlay easing curves
- reduced-motion fade duration, for the one substitute section 17 permits

Colour, from the theme pattern, never hardcoded:

- scrim colour and its light and dark opacities
- surface background, surface border, drag handle colour

Theme values resolve before first paint to avoid a flash of the wrong theme, and stay in sync across tabs. Class-driven dark mode needs the dark variant redefined in project CSS, because Tailwind v4 defaults it to the system preference rather than a class.

---

## 20. Platform behaviour

### iOS Safari

- Empty elements do not receive click events. A backdrop must carry a pointer cursor or tapping outside silently fails on every iPhone and iPad. This is deliberate behaviour, not a bug, and has persisted across versions.
- The left screen edge is the system back gesture. No drag affordance there.
- Applying manipulation touch-action globally interferes with native input behaviour. Scope it to interactive elements and leave inputs, text areas, and selects alone.
- The installed PWA is a separate target. Keyboard appearance, safe areas, and focus behaviour all differ from the same app in the browser.

### React Native and Expo Web

- z-index maps to the CSS property on web, so the same scale applies. Guard web-only values by platform.
- The native modal creates its own portal. Verify it does not compete with the shell's own root mounting.
- Event propagation control is unreliable on Expo Web, because the React Native event system is separate from the DOM. Compare the event target against the handler's own element on the backdrop instead.
- A native modal renders detached from its trigger, so there is no anchoring equivalent. Anchored surfaces need a shared constant matching the header height.
- Haptics on snap changes and drawer opens are native-only and a silent no-op on web. Use a selection-strength tap for snaps and a light tap for opens.

### Framework notes

- React: mount modals and toasts at the document root through a portal. Generate reference identifiers per instance so duplicates do not collide.
- Vue: teleport for portals, and the next-tick callback rather than an animation frame for post-render focus. Instance identifiers come from a module-level counter.
- Svelte: same DOM rules; portal by moving the node to the document root.

---

## 21. Cleanup and diagnostics

The shell is the worst leak surface in any codebase because it holds long-lived listeners that outlive individual routes. Every listener, timer, and subscription is paired with its removal.

What the shell creates and must release:

- visual viewport resize and scroll listeners, plus any pending animation frame
- pointer listeners registered during a sheet or drawer drag, including when the pointer is released outside the window
- the history listener for each open surface, plus the compensating entry removal when the surface closes by another route
- close-then-act timers
- bus subscriptions held by the surface manager and the debug pill
- the keyboard inset custom property, removed rather than left at its last value

Where several listeners share a lifecycle, tie them to one abort signal. Track nested timeouts in a collection so a single pass clears them all. Guard against hot reload so a re-mounted shell does not stack duplicate listeners; a shell that leaks under hot reload also leaks under route changes.

### Diagnostics

Shell state goes to the on-device debug pill, not the console. There is no DevTools on a real phone, and the pill renders in its own root above everything, so it survives modals, toasts, and crashes.

Worth recording: the open surface stack, the current snap, the keyboard inset, window height against visual viewport height, and the resolved breakpoint. Every caught error routes there with a severity, including errors from deferred actions that would otherwise vanish.

---

## 22. Review checklist

Behaviour, checked on device:

- Keyboard open on iOS Safari: the composer sits above the keyboard, and still does after the page is scrolled.
- The same two checks in the installed PWA.
- Keyboard open on Android Chrome with the meta keyword active.
- Landscape phone: modals promote to full screen, the sheet stays usable.
- A narrow iPad window, around 400 to 500px wide. That range came from Split View, which iPadOS 26 replaced with free-form resizable windows; it is carried over from this document's source and has not been confirmed against Apple's own figures, and the floor a freely resized window can reach is not established at all. So treat it as a width worth testing, not a boundary: test there, and treat narrower as untested rather than impossible. This is the check that earns the no-tablet-band decision in section 1.
- Notch and home indicator: nothing clipped, the backdrop reaches every edge.
- Tapping outside every surface on a real iPhone, not the simulator, which catches the missing pointer cursor.
- A modal opened from inside a drawer renders above that drawer's backdrop.
- Two surfaces opened and closed in reverse order: page scroll restored exactly once.
- Back from an open drawer closes it and stays in the app.
- The sheet resized entirely by tap, with no drag used at all.
- Desktop with the AI drawer open: the column shifts, tables and charts do not reflow.
- A right-to-left locale: drawers, rails, and the column shift all mirror.
- Every surface seen in loading, empty, error, and offline states.
- Screen reader with swipe navigation: background content is unreachable behind a modal surface, and sheet content changes are announced.
- Hot reload with two surfaces open: no duplicated listeners, no stuck scroll lock.

---

## 23. Rollout

- The reference implementation is FuelHunt. It already carries the draggable sheet, and a full-screen map is the hardest case for drag against scroll. A contract that holds against a map holds anywhere.
- This document is the contract. A shell carries far more stateful logic than a menu, so unguided copying drifts within a release or two.
- No shared package. Not viable across React, Vue 3, SvelteKit, and Expo in the current project spread. Projects port the implementation and conform to this document.
- Web first. The expensive work is the keyboard and viewport handling, which is a web-only problem.
- Expo projects inherit the interaction contract, not the code: snap points, target sizes, dismissal order, drag alternatives, surface exclusivity, announcement rules. Native handles keyboard and safe areas through platform APIs.

---

## Key lessons

1. **`dvh` is not a keyboard fix.** Viewport units track the layout viewport, and no current mobile browser resizes the layout viewport for the keyboard by default.
2. **The interactive-widget keyword covers Chromium and Firefox only.** WebKit has not shipped it, so measuring the visual viewport on iOS is required, not optional.
3. **A keyboard focus trap does not contain a screen reader on mobile.** Swipe navigation walks straight past it. Inert is the primary mechanism; the trap is the desktop supplement.
4. **One layer for all sheets and drawers is not enough** once three can coexist. Subdivide the band before the first collision, not after.
5. **A backdrop belongs directly beneath its own surface.** Two backdrop layers, one per band, beats one rule with exceptions.
6. **Stacking contexts are the real enemy, not z-index values.** Transform-animated drawers trap their children, so modals and toasts mount at the document root — unless they are in the top layer, which no ancestor can trap.
7. **Reach for the top layer before reaching for a portal.** `<dialog showModal()>` and `popover` escape every stacking context by construction, and bring the backdrop, focus containment, inertness and close requests with them. The portal rules are the fallback for targets that cannot use them, not the default.
8. **iOS Safari ignores taps on empty elements.** Every backdrop needs a pointer cursor or dismissal silently fails on the most common device.
9. **Drag is never the only way to resize.** Tap-to-cycle is the accessible path and is faster for most people anyway.
10. **Scroll handoff needs an explicit rule,** or drag and scroll compete on every gesture.
11. **Containing overscroll avoids the scroll-lock race** without touching the body. Where a body lock is unavoidable, reference-count it.
12. **Surfaces coordinate through one manager.** Direct calls between drawers create cycles that only appear when two are open at once.
13. **44px is the floor, not the target.** AA allows 24px; that is a compliance number, not a usable one on a phone.
14. **The left screen edge belongs to the OS on iOS.** Tap to open on that side, drag on the other.
15. **Shift the content column, do not resize it** — and overlay once it stops fitting. A translation is free; a width change re-lays out everything inside. The crossover is the column's *rendered* width against the space left beside the drawer, not its minimum; testing the minimum shifts the column into the drawer across a whole band of common laptop widths.
16. **Two breakpoints, not three.** A tablet band triples the test matrix for a range the mobile layout already handles.
17. **Escape belongs to the topmost surface only.** Bound to open instead, one keypress closes three things.
18. **Four states per surface, not one.** Loading, empty, error, and offline are the states people actually hit on a phone.
19. **The debug pill beats the console on a phone.** There is no DevTools on a real device.
20. **Test the installed PWA separately.** Keyboard, safe area, and focus behaviour differ from the same app in the browser.
