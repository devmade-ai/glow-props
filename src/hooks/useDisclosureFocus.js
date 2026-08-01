// Focus-first-item-on-open and return-to-trigger-on-close for disclosure
// components (BURGER_MENU.md "Reusable Focus Hooks", canva-grid original).
// The hasBeenOpenRef guard prevents stealing focus on initial mount.
import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useDisclosureFocus(triggerRef, contentRef, open, selector = FOCUSABLE) {
  const hasBeenOpenRef = useRef(false);

  useEffect(() => {
    if (open) {
      hasBeenOpenRef.current = true;
      const rafId = requestAnimationFrame(() => {
        const firstItem = contentRef.current?.querySelector(selector);
        firstItem?.focus();
      });
      return () => cancelAnimationFrame(rafId);
    } else if (hasBeenOpenRef.current) {
      triggerRef.current?.focus();
    }
  }, [open, triggerRef, contentRef, selector]);
}
