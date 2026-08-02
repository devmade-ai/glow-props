// Requirement: global nav menu accessible from the header on every page.
// Approach: disclosure-pattern dropdown per BURGER_MENU.md's React reference —
//   aria-expanded trigger, <nav>/<ul>/<li> (no role="menu": ARIA menus put
//   screen readers in forms mode and suppress normal nav keys), backdrop,
//   arrow-key navigation, focus hooks, close-then-act.
// Extensions over the reference MenuItem (each exists for this site's menu and
//   is worth upstreaming):
//   - href:      renders a real <a> instead of a <button> — nav links must be
//                anchors so the build-time SSG pass gives crawlers real links.
//   - keepOpen:  preference toggles (theme, random, auto-update) act without
//                closing — users compare themes by clicking through the list
//                (BURGER_MENU.md "menu stays open during theme switching").
//   - indicator: right-aligned status text ("On"/"Off") for toggle items.
//   - ariaLabel: explicit accessible name that flips with state (the visible
//                label alone goes stale for screen readers).
//   - render:    escape hatch for non-item content (the theme picker section).
import { useState, useRef, useCallback, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { useDisclosureFocus } from '../hooks/useDisclosureFocus.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { useEscapeKey } from '../hooks/useEscapeKey.js';

const ITEM_CLASS = (item) => `w-full text-left px-4 min-h-11 text-sm
  flex items-center gap-2 transition-colors outline-none cursor-pointer no-underline
  focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px]
  ${item.disabled
    ? 'opacity-40 cursor-not-allowed'
    : item.destructive
      ? 'text-error hover:bg-error/10'
      : item.highlight
        ? `${item.highlightColor || 'text-primary'} hover:bg-primary/10`
        : 'text-base-content hover:bg-base-200'
  }`;

export function BurgerMenu({ items, id, version }) {
  const autoId = useId();
  const menuId = id || `nav-menu-${autoId}`;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const timerRef = useRef(null);

  const visibleItems = items.filter((item) => item.visible !== false);

  const close = useCallback(() => setOpen(false), []);

  useDisclosureFocus(triggerRef, menuRef, open);
  useFocusTrap(menuRef, open);
  useEscapeKey(open, close);

  // Requirement: prevent body scroll while the menu is open. overscroll-contain
  // alone only stops chaining on scroll containers — taps on non-scrollable
  // menu areas still chain to the body without the lock. scrollbar-gutter
  // keeps the layout from shifting when the scrollbar hides. Deliberate
  // deviation from the pattern's overscroll-only guidance; single writer,
  // restored on close/unmount.
  useEffect(() => {
    if (!open) return;
    document.body.style.scrollbarGutter = 'stable';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.body.style.scrollbarGutter = '';
    };
  }, [open]);

  // Close menu first, then execute the action after the DOM settles (150ms
  // covers the close). keepOpen items (preference toggles) act immediately.
  const handleItem = useCallback((item) => {
    if (item.disabled) return;
    if (item.keepOpen) {
      // Same error surface as the close-then-act path below — one failure
      // class, one route.
      try {
        item.action();
      } catch (e) {
        if (window.__debugPushError) {
          window.__debugPushError(`Menu action "${item.label}" failed: ${e.message}`);
        } else {
          console.error('Menu action failed:', e);
        }
      }
      return;
    }
    close();
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await item.action();
      } catch (e) {
        // Route to the debug system when one exists; console otherwise.
        if (window.__debugPushError) {
          window.__debugPushError(`Menu action "${item.label}" failed: ${e.message}`);
        } else {
          console.error('Menu action failed:', e);
        }
      }
    }, 150);
  }, [close]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // Arrow key + Home/End navigation. Only rendered (= visible) items exist in
  // the DOM — the inactive theme list is conditionally unmounted, so no
  // visibility filtering is needed.
  const handleMenuKeyDown = useCallback((e) => {
    const focusables = menuRef.current?.querySelectorAll('a[href], button:not([disabled])');
    if (!focusables || focusables.length === 0) return;
    const idx = Array.from(focusables).indexOf(document.activeElement);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusables[(idx + 1) % focusables.length].focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusables[(idx - 1 + focusables.length) % focusables.length].focus();
        break;
      case 'Home':
        e.preventDefault();
        focusables[0].focus();
        break;
      case 'End':
        e.preventDefault();
        focusables[focusables.length - 1].focus();
        break;
    }
  }, []);

  return (
    <div className="relative no-print">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn btn-ghost btn-square min-h-11 min-w-11"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop, portaled to <body> per the pattern's "externalized
              backdrop" note: the navbar's backdrop-blur creates a containing
              block that would clip a fixed child. z-20 rather than the scale's
              backdrop tier (40): the menu lives inside the navbar's z-30
              stacking context, so a body-level backdrop above 30 would cover
              the menu itself. cursor-pointer is required for iOS Safari —
              empty divs don't receive click events without it. */}
          {createPortal(
            <div className="fixed inset-0 z-20 cursor-pointer" onClick={close} />,
            document.body,
          )}

          <nav
            ref={menuRef}
            id={menuId}
            aria-label="Main navigation"
            className="absolute right-0 top-full mt-2 z-dropdown w-56 max-w-[calc(100vw-2rem)]
              rounded-xl shadow-lg bg-base-100 border border-base-300
              py-1 overscroll-contain origin-top-right"
            onKeyDown={handleMenuKeyDown}
          >
            <ul className="list-none m-0 p-0 flex flex-col">
              {visibleItems.map((item, i) => (
                <li key={item.key || item.label}>
                  {item.separator && i > 0 && <hr className="my-1 border-base-300" />}
                  {item.render ? item.render() : item.href ? (
                    <a href={item.href} className={ITEM_CLASS(item)} onClick={close}>
                      <MenuItemBody item={item} />
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled={item.disabled}
                      onClick={() => handleItem(item)}
                      aria-label={item.ariaLabel}
                      className={ITEM_CLASS(item)}
                    >
                      <MenuItemBody item={item} />
                    </button>
                  )}
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
  );
}

function MenuItemBody({ item }) {
  return (
    <>
      {item.icon && (
        <svg className={`w-4 h-4 shrink-0 ${item.iconClass || ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
        </svg>
      )}
      <span className="truncate">{item.label}</span>
      {item.indicator && (
        <span className="text-xs text-base-content/40 ml-auto">{item.indicator}</span>
      )}
      {item.external && (
        <svg className="w-3 h-3 ml-auto opacity-40 shrink-0"
          viewBox="0 0 12 12" fill="none" stroke="currentColor"
          strokeWidth={1.5} aria-hidden="true">
          <path d="M3.5 3H9v5.5M9 3L3 9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </>
  );
}
