// Extracted Escape key handler — avoids duplicating the listener pattern
// (BURGER_MENU.md "Reusable Focus Hooks", repo-tor original).
import { useEffect } from 'react';

export function useEscapeKey(active, onEscape) {
  useEffect(() => {
    if (!active) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onEscape(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active, onEscape]);
}
