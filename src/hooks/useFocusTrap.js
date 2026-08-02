// Traps Tab/Shift+Tab within a container and restores focus on deactivation.
// Used by BurgerMenu and InstallModal (BURGER_MENU.md "Reusable Focus Hooks",
// canva-grid original).
import { useEffect, useRef } from 'react';

// summary is natively tabbable and must be in the list — the InstallModal's
// stale-icon disclosure sits between the trap's first/last stops, and omitting
// it both skips it on Tab wrap and lets Shift+Tab escape the dialog after a
// mouse-click focuses it.
const FOCUSABLE = 'a[href], button:not([disabled]), summary, textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(containerRef, active) {
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    previousFocusRef.current = document.activeElement;

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = containerRef.current?.querySelectorAll(FOCUSABLE);
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [active, containerRef]);
}
