# Burger Menu

Dropdown navigation menu triggered by a hamburger icon. Uses the WAI-ARIA **disclosure pattern** (not `role="menu"`) because a burger nav is a list of links/actions revealed by a toggle, not an application menu (File/Edit/View). Two variants: React (Vite + Tailwind) for web-only projects, React Native (Expo) for cross-platform.

## Z-Index Scale

All projects should follow this scale to prevent stacking conflicts between the burger menu, debug pill, modals, toasts, and install banners:

| Layer | Z-Index | Examples |
|-------|---------|----------|
| Base content | 0-10 | Page content, cards |
| Sticky headers | 20 | App bar, bottom nav |
| Sheets / drawers | 30 | Bottom sheets, side panels |
| Menu backdrop | 40 | Burger menu backdrop |
| Menu dropdown | 50 | Burger menu card |
| Modals | 60 | Dialogs, confirmation modals |
| Toasts / banners | 70 | Update banner, install prompt |
| Debug pill | 80 | Debug overlay (separate React root) |

## Standard Menu Items

Adapt per project. Show/hide based on state. Items can be hidden (`visible: false`) or disabled (`disabled: true`).

| Item | When to show | Category |
|------|-------------|----------|
| How to use / Tutorial | Always | Help |
| User Guide | Always (external link — show indicator) | Help |
| Dark / Light mode toggle | Always | Preferences |
| Check for updates | Web platform + PWA registered | PWA |
| Install app | Web + not installed + not dismissed | PWA |
| Admin | When authenticated admin | Auth |
| Sign out | When authenticated | Auth |

## MenuItem Interface

```typescript
interface MenuItem {
  label: string
  action: () => void | Promise<void>
  visible?: boolean        // Hide item entirely (default: true)
  disabled?: boolean       // Show grayed out, prevent click (default: false)
  separator?: boolean      // Show divider above this item
  destructive?: boolean    // Red text styling (e.g., "Sign out")
  highlight?: boolean      // Accent text styling (e.g., "Install app")
  highlightColor?: string  // Custom highlight class (default: 'text-primary')
  external?: boolean       // Show external link indicator (↗)
  icon?: string            // SVG path string for inline icon
  iconClass?: string       // Icon color override class (e.g., 'text-warning')
}
```

**Version display:** Optionally show the app version at the bottom of the dropdown as a non-interactive footer. Import from `package.json` or define as a constant.

## Reusable Focus Hooks

Extract these into shared hooks — they are used by BurgerMenu and other disclosure components (modals, dropdowns).

### `useDisclosureFocus` (adapted from canva-grid)

Handles focus-first-item-on-open and return-to-trigger-on-close. Parameterized for reuse across any disclosure component. canva-grid's original uses an options object `(open, { triggerRef, contentRef, selector })` — simplified here to positional args:

```javascript
import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useDisclosureFocus(triggerRef, contentRef, open, selector = FOCUSABLE) {
  const hasBeenOpenRef = useRef(false)

  useEffect(() => {
    if (open) {
      hasBeenOpenRef.current = true
      const rafId = requestAnimationFrame(() => {
        const firstItem = contentRef.current?.querySelector(selector)
        firstItem?.focus()
      })
      return () => cancelAnimationFrame(rafId)
    } else if (hasBeenOpenRef.current) {
      triggerRef.current?.focus()
    }
  }, [open, triggerRef, contentRef, selector])
}
```

### `useFocusTrap` (canva-grid)

Traps Tab/Shift+Tab within a container and restores focus on deactivation. Used by BurgerMenu and InstallInstructionsModal:

```javascript
import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(containerRef, active) {
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (!active) return
    previousFocusRef.current = document.activeElement

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return
      const focusable = containerRef.current?.querySelectorAll(FOCUSABLE)
      if (!focusable || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [active, containerRef])
}
```

### `useEscapeKey` (repo-tor)

Extracted Escape key handler — avoids duplicating the listener pattern:

```javascript
import { useEffect } from 'react'

export function useEscapeKey(active, onEscape) {
  useEffect(() => {
    if (!active) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onEscape() }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [active, onEscape])
}
```

## React Web (`BurgerMenu.jsx`)

Disclosure-pattern dropdown with backdrop, keyboard navigation, and icon support. Tailwind CSS + DaisyUI for styling.

```jsx
import { useState, useRef, useCallback, useEffect, useId } from 'react'
import { useDisclosureFocus } from '../hooks/useDisclosureFocus'
import { useEscapeKey } from '../hooks/useEscapeKey'

// Requirement: Global nav menu accessible from header
// Approach: Disclosure-pattern dropdown with backdrop
// Why disclosure, not role="menu": ARIA menu pattern is for app menus
//   (File/Edit/View). Screen readers enter forms mode, suppress normal nav
//   keys, and expect arrow-key navigation. A burger nav is a disclosure.
// Alternatives:
//   - role="menu" pattern: Rejected — wrong ARIA semantics for navigation
//   - Slide-out drawer: Rejected — needs animation lib, fights with bottom nav
//   - Headless UI Disclosure: Viable — adds dependency for a single component

export function BurgerMenu({ items, id, version }) {
  const autoId = useId()
  const menuId = id || `nav-menu-${autoId}`
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const timerRef = useRef(null)

  const visibleItems = items.filter((item) => item.visible !== false)

  const close = useCallback(() => setOpen(false), [])

  useDisclosureFocus(triggerRef, menuRef, open)
  useEscapeKey(open, close)

  // Close menu first, then execute action after DOM settles.
  // 50-150ms accounts for CSS transition — adjust to match actual duration.
  const handleItem = useCallback((item) => {
    if (item.disabled) return
    close()
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        await item.action()
      } catch (e) {
        // Route to debug system if available, otherwise console
        if (window.__debugPushError) {
          window.__debugPushError(`Menu action "${item.label}" failed: ${e.message}`)
        } else {
          console.error('Menu action failed:', e)
        }
      }
    }, 150)
  }, [close])

  // Cleanup pending action timer on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  // Arrow key + Home/End navigation within menu items
  const handleMenuKeyDown = useCallback((e) => {
    const items = menuRef.current?.querySelectorAll('button:not([disabled])')
    if (!items || items.length === 0) return
    const idx = Array.from(items).indexOf(document.activeElement)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        items[(idx + 1) % items.length].focus()
        break
      case 'ArrowUp':
        e.preventDefault()
        items[(idx - 1 + items.length) % items.length].focus()
        break
      case 'Home':
        e.preventDefault()
        items[0].focus()
        break
      case 'End':
        e.preventDefault()
        items[items.length - 1].focus()
        break
    }
  }, [])

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
              (empty divs don't receive click events without it).
              Note: If parent header has backdrop-filter, render backdrop
              outside the header stacking context to avoid clipping. */}
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
                       bg-base-100 border border-base-300
                       py-1 overflow-hidden overscroll-contain"
            onKeyDown={handleMenuKeyDown}
          >
            <ul className="menu menu-sm p-0">
              {visibleItems.map((item, i) => (
                <li key={item.label}>
                  {item.separator && i > 0 && (
                    <hr className="my-1 border-base-300" />
                  )}
                  <button
                    type="button"
                    disabled={item.disabled}
                    onClick={() => handleItem(item)}
                    className={`w-full text-left px-4 min-h-11 text-sm truncate
                      flex items-center gap-2
                      transition-colors outline-none
                      focus-visible:ring-2 focus-visible:ring-primary
                      ${item.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : item.destructive
                          ? 'text-error hover:bg-error/10'
                          : item.highlight
                            ? `${item.highlightColor || 'text-primary'} hover:bg-primary/10`
                            : 'text-base-content hover:bg-base-200'
                      }`}
                  >
                    {item.icon && (
                      <svg className={`w-4 h-4 shrink-0 ${item.iconClass || ''}`}
                           viewBox="0 0 24 24" fill="none" stroke="currentColor"
                           strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    )}
                    <span className="truncate">{item.label}</span>
                    {item.external && (
                      <svg className="w-3 h-3 ml-auto opacity-40 shrink-0"
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
            {version && (
              <div className="px-4 py-1.5 text-xs text-base-content/40 text-right">
                v{version}
              </div>
            )}
          </nav>
        </>
      )}
    </div>
  )
}
```

- **Disclosure pattern, not ARIA menu**: `aria-expanded` on trigger, `<nav>` with `<ul>/<li>` — no `role="menu"`, no `role="menuitem"`, no `aria-haspopup`. Using `role="menu"` causes screen readers (JAWS, NVDA) to enter forms mode, suppressing normal navigation keys and confusing users who expect link-style Tab navigation.
- **Arrow key + Home/End navigation**: ArrowDown/ArrowUp cycle through items with wrapping. Home/End jump to first/last. Improves keyboard accessibility.
- **`useDisclosureFocus` hook**: Extracted focus management — reusable across BurgerMenu, ThemeSelector, or any disclosure. The `hasBeenOpenRef` guard prevents stealing focus on initial mount.
- **`useFocusTrap` hook**: Tab/Shift+Tab boundary wrapping with previous-focus restoration. Reused by BurgerMenu and InstallInstructionsModal.
- **`useId()` for unique IDs**: Prevents `aria-controls` collisions if multiple BurgerMenu instances exist on the same page.
- **`cursor-pointer` on backdrop**: iOS Safari does not fire click events on empty `<div>` elements. Without `cursor-pointer`, tapping outside the menu on iPhone/iPad silently fails to close it.
- **Externalized backdrop**: If the parent header uses `backdrop-filter`, render the backdrop outside the header stacking context (in the parent layout) to avoid `backdrop-blur-sm` clipping fixed children.
- **DaisyUI `menu` classes**: `menu menu-sm` provides theme-aware hover states, padding, and focus indicators automatically.
- **`min-h-11` (44px) touch targets**: Meets Apple HIG and Material Design minimum touch target guidelines.
- **`overscroll-contain`**: Prevents scroll chaining without touching `document.body.style.overflow`.
- **`max-w-[calc(100vw-2rem)]`**: Prevents the dropdown from overflowing the viewport on narrow screens.
- **Error routing to debug system**: `handleItem` routes failures through `window.__debugPushError()` when available, connecting menu errors to the debug pill.
- **Icon support**: Per-item SVG icons via `item.icon` (path string) make items scannable. `item.iconClass` allows per-icon color overrides (e.g., sun/moon icons in theme colors).
- **`highlight` + `highlightColor`**: Draw attention to specific items like "Install app" without destructive red styling.

**Usage:**

```jsx
import { version } from '../package.json'

<BurgerMenu
  version={version}
  items={[
    { label: 'How to use', action: () => setShowTutorial(true),
      icon: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.01' },
    { label: 'User Guide', action: () => window.open(GUIDE_URL, '_blank'), external: true },
    { label: darkMode ? 'Light mode' : 'Dark mode', action: toggleDarkMode, separator: true,
      icon: darkMode ? 'M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' : 'M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z' },
    { label: 'Check for updates', action: checkForUpdates, visible: isPWA },
    { label: 'Install app', action: triggerInstall, visible: showInstallPrompt,
      highlight: true },
    { label: 'Sign out', action: signOut, visible: isAuth, separator: true,
      destructive: true },
  ]}
/>
```

## Shared ModalBackdrop (React Native)

Extract the Modal + backdrop + Escape-key pattern into a reusable component used by BurgerMenu, search modals, filters, etc:

```tsx
import { Modal, Pressable, StyleSheet, Platform } from 'react-native'
import { useEscapeKey } from '../hooks/useEscapeKey'

interface ModalBackdropProps {
  visible: boolean
  onClose: () => void
  alignItems?: 'flex-start' | 'flex-end' | 'center'
  backdropColor?: string
  children: React.ReactNode
}

export function ModalBackdrop({
  visible, onClose, alignItems = 'flex-end',
  backdropColor = 'transparent', children,
}: ModalBackdropProps) {
  useEscapeKey(visible && Platform.OS === 'web', onClose)

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[StyleSheet.absoluteFill, { alignItems, backgroundColor: backdropColor }]}
        onPress={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        {children}
      </Pressable>
    </Modal>
  )
}
```

## Haptic Feedback (React Native)

Wrap `expo-haptics` with a platform guard (no-op on web). Five semantic levels:

```typescript
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

const isNative = Platform.OS === 'ios' || Platform.OS === 'android'

export const lightTap = () => isNative && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
export const mediumTap = () => isNative && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
export const selectionTap = () => isNative && Haptics.selectionAsync()
export const successTap = () => isNative && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
export const errorTap = () => isNative && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
```

BurgerMenu calls `lightTap()` on toggle for tactile feedback.

## React Native (`BurgerMenu.tsx`)

Modal dropdown with transparent backdrop. Cross-platform (iOS, Android, web via Expo). Uses extracted `ModalBackdrop` and haptic feedback.

```tsx
import { useState, useRef, useCallback, useEffect } from 'react'
import { Pressable, View, Text, StyleSheet, Platform, AccessibilityInfo } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { ModalBackdrop } from './ModalBackdrop'
import { lightTap } from '../lib/haptics'

// Requirement: Global nav menu accessible from header
// Approach: Modal dropdown with transparent backdrop (disclosure pattern)
// Alternatives:
//   - react-native-drawer-layout: Rejected — extra dependency, fights with tab nav
//   - ActionSheet: Rejected — no custom styling, platform-inconsistent

interface MenuItem {
  label: string
  action: () => void | Promise<void>
  visible?: boolean
  disabled?: boolean
  separator?: boolean
  destructive?: boolean
  highlight?: boolean
  external?: boolean
  icon?: string
}

interface BurgerMenuProps {
  items: MenuItem[]
  theme: {
    surface: string; border: string; text: string
    textSecondary: string; danger: string; primary: string
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

  const toggle = useCallback(() => {
    lightTap()
    setOpen((o) => !o)
  }, [])

  // Close menu first, then execute action after Modal dismiss settles.
  // 150ms accounts for Modal fade animation — adjust if animationType changes.
  const handleItem = useCallback((item: MenuItem) => {
    if (item.disabled) return
    close()
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try { await item.action() } catch (e) { console.error('Menu action failed:', e) }
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

  return (
    <>
      <Pressable
        onPress={toggle}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Menu"
        accessibilityState={{ expanded: open }}
      >
        <FontAwesome name="bars" size={20} color={theme.textSecondary} />
      </Pressable>

      <ModalBackdrop visible={open} onClose={close} alignItems="flex-end">
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
                disabled={item.disabled}
                style={({ pressed }) => [
                  styles.item,
                  pressed && styles.itemPressed,
                  item.disabled && styles.itemDisabled,
                ]}
                onPress={() => handleItem(item)}
                accessibilityRole="button"
                accessibilityLabel={
                  item.external ? `${item.label}, opens externally` : item.label
                }
              >
                <Text
                  style={[
                    styles.itemText,
                    { color: item.destructive ? theme.danger
                           : item.highlight ? theme.primary
                           : theme.text },
                  ]}
                  numberOfLines={1}
                >
                  {item.label}{item.external ? ' ↗' : ''}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ModalBackdrop>
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
  itemDisabled: {
    opacity: 0.4,
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

## Vue Variant Notes

Vue projects use the same patterns with framework-specific adaptations:

- **Counter-based unique ID**: Vue doesn't have `useId()`. Use a module-level counter: `const menuId = `nav-menu-${++idCounter}``
- **`nextTick` instead of `requestAnimationFrame`**: Vue's `nextTick` is the idiomatic equivalent for post-render focus management.
- **Lucide icons**: `lucide-vue-next` provides consistent icons without inline SVG management.

## Key Lessons

1. **`role="menu"` is for application menus only** — File/Edit/View style. Screen readers enter forms mode, suppress normal navigation keys, and expect arrow-key item navigation. A burger nav menu is a disclosure — use `aria-expanded` on the trigger and `<nav>` with a `<ul>/<li>` list. Do not use `aria-haspopup` (it signals "this opens an application menu").
2. **iOS Safari does not fire click events on empty divs** — the backdrop overlay must have `cursor: pointer` (Tailwind: `cursor-pointer`) or it silently fails on all iPhones and iPads. This is an intentional iOS Safari optimization, not a bug, and has persisted across all iOS versions.
3. **Extract focus logic into reusable hooks** — `useDisclosureFocus`, `useFocusTrap`, and `useEscapeKey` are used by BurgerMenu, modals, and other disclosures. Don't inline focus management in each component.
4. **Arrow key + Home/End navigation** — cycling through items with wrapping improves keyboard accessibility. Not required by the disclosure pattern spec but expected by power users.
5. **`overscroll-behavior: contain` avoids the scroll lock race** — two components both writing `document.body.style.overflow = 'hidden'` causes one to overwrite the other's cleanup on unmount. Using `overscroll-contain` on the menu card prevents scroll chaining without touching body styles.
6. **`stopPropagation` is unreliable in React Native Web** — nested `Pressable` event propagation doesn't always work because the RN event system is separate from the DOM. Use `e.target === e.currentTarget` on the outer backdrop handler instead.
7. **Extract `ModalBackdrop` for React Native** — Modal + Pressable + Escape handling as a reusable component eliminates boilerplate across BurgerMenu, search modals, and filter drawers.
8. **Close-then-act with 50-150ms delay** — close the menu before executing the action to prevent visual glitches from state changes while the menu is visible. Adjust the delay to match the actual transition duration (50ms for snappier, 150ms for animated). Clean up the timer on unmount using a ref.
9. **44px minimum touch targets** — `min-h-11` on menu buttons meets Apple HIG and Material Design guidelines. `py-2.5` alone may not reach 44px on all font sizes.
10. **Route menu errors to the debug system** — `handleItem` should use `window.__debugPushError()` when available, making menu action failures visible in the debug pill without DevTools.
11. **Haptic feedback on toggle** — `lightTap()` from expo-haptics (with web no-op guard) provides tactile feedback on mobile. Subtle but noticeable improvement in perceived quality.
12. **Tailwind v4 `dark:` variant requires project-level config** — v4 defaults to `prefers-color-scheme` (OS preference). For class-based dark mode toggling (`.dark` on `<html>`), the project must add `@custom-variant dark (&:where(.dark, .dark *));` to its CSS.
13. **If wrapping in `React.memo`, memoize the `items` array** — inline array literals (`items={[...]}`) create new references every render, defeating memoization. Use `useMemo` for the items array if the parent re-renders frequently and the menu is memoized.
