---
slug: z-index-scale
title: Z-Index Scale
badge: Convention
description: Standard stacking order for all projects. Fixed values for base, sticky, sheets, backdrop, menu, modal, toast, and debug layers.
tags:
  - CSS z-index
  - Tailwind
  - Cross-project standard
order: 9
---

# Z-Index Scale

Standard stacking order for all devmade-ai projects. Prevents conflicts between overlapping UI layers (menus, modals, toasts, debug overlays) by assigning each layer a fixed z-index value. All repos must use this scale — no ad-hoc values.

**Related patterns:**
- [BURGER_MENU.md](BURGER_MENU.md) — Menu backdrop (z-40) and dropdown (z-50)
- [DEBUG_SYSTEM.md](DEBUG_SYSTEM.md) — Debug pill (z-80) must render above all other layers, including modals and toasts
- [PWA_SYSTEM.md](PWA_SYSTEM.md) — Update banner and install prompt toast (z-70), install instructions modal (z-60)
- [THEME_DARK_MODE.md](THEME_DARK_MODE.md) — Migration Phase 4 normalizes z-index values to this scale

## The Scale

| Layer | Z-Index | Tailwind Class | Examples |
|-------|---------|----------------|----------|
| Base content | 0–10 | `z-0` – `z-10` | Page content, cards, inline elements |
| Sticky headers | 20 | `z-20` | App bar, bottom nav, sticky table headers |
| Sheets / drawers | 30 | `z-30` | Bottom sheets, side panels, slide-overs |
| Backdrop | 40 | `z-40` | Click-to-close overlay behind menus and modals |
| Menu / dropdown | 50 | `z-50` | Burger menu card, dropdowns, popovers, tooltips |
| Modal | 60 | `z-60` / `z-[60]` | Dialogs, confirmation modals, full-screen overlays |
| Toast / banner | 70 | `z-70` / `z-[70]` | Toast notifications, update banners, install prompts |
| Debug pill | 80 | `z-80` / `z-[80]` | Debug overlay (separate React root, must be topmost) |

Above 50 the table gives two forms: the bare one for Tailwind v4, the bracketed one for v3. Check which your project is on before copying — both produce the same declaration.

**Why these values?** Gaps of 10 between layers leave room for sub-layers if needed (e.g., a dropdown inside a modal could use z-55, though this should be rare). The scale is intentionally small — 8 layers cover every UI pattern across all repos.

**Tailwind note:** Tailwind's *named* steps stop at `z-50`, but since v4 `z-index` accepts a bare numeric value, so `z-60`, `z-70` and `z-80` compile to real utilities with no brackets and no config. Verified on Tailwind 4.2.2: this repo's built stylesheet contains `.z-60{z-index:60}` and `.z-70{z-index:70}`, and compiling a bare `z-80` through the Tailwind CLI emits `.z-80{z-index:80}`. The v3 half is reasoned from its named scale ending at 50, not tested — no v3 project was available to check.

Either way the values stay greppable. Named utilities are an option where the layer's *meaning* is worth stating at the call site:

```css
/* Optional: named utilities for readability */
@utility z-modal { z-index: 60; }
@utility z-toast { z-index: 70; }
@utility z-debug { z-index: 80; }
```

## Rules

1. **Every z-index in the codebase must map to a layer in this scale.** No `z-[9999]`, `z-[1000]`, or `z-[999]`. If you need a new layer, add it to this document first.
2. **Backdrop and its content are always adjacent.** Menu backdrop (40) + menu (50). Modal backdrop (40) + modal (60). The backdrop is z-40 regardless of what it's behind — with one exception: when the surface is trapped inside an ancestor stacking context (a blurred sticky header is the usual one), its backdrop goes *below* that ancestor's layer instead, because a body-level backdrop at 40 would cover the surface it belongs to. Measured, not reasoned: on gp-props, moving its z-20 backdrop to z-40 makes `elementFromPoint` over the open menu return the backdrop instead of a menu item. See "Common Trap" below.
3. **Debug pill is always topmost.** Nothing should render above z-80. The pill is in a separate React root and must remain visible during crashes, modals, and toasts.
4. **Sticky headers stay below overlays.** A sticky navbar (z-20 or z-30) must not overlap a modal (z-60) or toast (z-70).
5. **Don't nest stacking contexts unnecessarily.** A parent with `z-index` creates a stacking context — children cannot escape it. Avoid setting z-index on wrapper divs unless required.

## Audit

Run this to find all z-index usage in a project:

```bash
# Find all z-index values in components and styles
rg 'z-\[|z-[0-9]' -g '*.tsx' -g '*.jsx' -g '*.vue' -g '*.svelte' -g '*.css' -g '*.html' -g '*.js' -g '*.ts'
```

Flag any value outside the scale. Common violations and fixes:

| Violation | Fix |
|-----------|-----|
| `z-[9999]` on debug pill | `z-80` (v3: `z-[80]`) |
| `z-[1000]` on modal | `z-60` (v3: `z-[60]`) |
| `z-100` on dropdown | `z-50` |
| `z-[999]` on toast | `z-70` (v3: `z-[70]`) |
| `z-[50]` on sticky header | `z-30` (or `z-20` if no sheets) |

## Stacking Context Gotchas

### CSS Properties That Create Stacking Contexts

These properties on a parent element trap all children — a child with `z-[80]` inside a parent with `z-30` will never render above a sibling at `z-40`:

- `z-index` (with position other than static)
- `transform`, `translate`, `rotate`, `scale`
- `filter`, `backdrop-filter`
- `opacity` less than 1
- `will-change` targeting any of the above
- `contain: layout` or `contain: paint`
- `isolation: isolate`

### Common Trap: Sticky Navbar with `backdrop-filter`

A sticky navbar using `backdrop-blur-md` creates a stacking context. Any element positioned inside it (like a burger menu dropdown) is trapped within the navbar's z-index. Solutions:

1. **Portal the backdrop, not the dropdown** — leave the menu inside the navbar and render only the click-to-close backdrop to `document.body`, at a layer *below* the navbar's own. The backdrop still covers the page; the menu still sits above it, because it is inside a stacking context that outranks the backdrop's layer. Prefer this one: it is the only fix that keeps both a real backdrop element and the dropdown's DOM position, so tab order and the trigger's `aria-controls` relationship need no repair. gp-props does this — backdrop `createPortal`'d to `<body>` at z-20 under a z-30 navbar (`src/components/BurgerMenu.jsx`).
2. **Render the menu dropdown outside the navbar** — as a sibling in the DOM, not a child. Moves the dropdown out of tab order behind the trigger; needs explicit focus management.
3. **Portal the dropdown** to `document.body` (React `createPortal`). Same tab-order caveat as 2.
4. **Use a document-level click handler** instead of a backdrop overlay. Keeps the DOM intact but gives up the backdrop entirely — no dimming, and nothing to attach the iOS `cursor: pointer` workaround to, since there is no element. What [BURGER_MENU.md](BURGER_MENU.md) documents is narrower than it may sound: iOS Safari does not fire click events on **empty `<div>` elements**. It says nothing about event delegation, so treat outside-click on iOS as untested rather than known-broken.

Whichever you pick, an element that closes a surface by being tapped needs `cursor: pointer` — iOS Safari does not fire click events on empty non-interactive elements without it.

### Separate React Roots

The debug pill renders in `#debug-root` (a separate React root from `#root`). This is intentional — it avoids stacking context traps from the main app tree and ensures the pill survives app crashes. Both roots are siblings in the DOM, so their z-index values compete at the top level as expected.

## Per-Framework Notes

### React (Vite)
- Use `createPortal` for modals/toasts if they're defined inside deeply nested components
- Debug pill mounts in `#debug-root` — already outside the main stacking context
- PWA update banner is a fixed-position element at z-[70]

### React Native (Expo Web)
- On web, `zIndex` in React Native maps to CSS `z-index`
- `Modal` component from React Native creates its own portal — verify it doesn't conflict with the scale
- Use `Platform.OS === 'web'` guards for z-index values that only matter on web

### Vue / Svelte
- Same DOM rules apply — portals (`<Teleport>` in Vue, `{#key}` + DOM in Svelte) solve stacking context traps
- Debug pill in a separate app instance follows the same pattern as React's separate root

## Key Lessons

1. **Ad-hoc z-index causes invisible bugs.** A modal at `z-[1000]` works until someone adds a toast at `z-[999]` — then the toast hides behind the modal. A shared scale prevents the arms race.
2. **Stacking contexts are the real enemy, not z-index values.** A `z-[80]` debug pill inside a `z-30` navbar will never render above a `z-40` backdrop. Understanding stacking contexts matters more than memorizing the scale.
3. **The scale is small by design.** 8 layers cover every UI pattern. If you think you need a 9th, you probably have a stacking context problem, not a z-index problem.
4. **Backdrop is always z-40.** Whether it's behind a menu (z-50) or a modal (z-60), the backdrop is always z-40. This simplifies reasoning — "is there a backdrop visible? It's at 40."
5. **Debug pill must survive everything.** Separate React root + highest z-index + inline styles = the pill renders no matter what breaks.
