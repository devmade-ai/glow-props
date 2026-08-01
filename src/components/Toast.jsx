// Requirement: non-blocking feedback notifications (offline ready, update
//   results, copy confirmations) — reusable, stacking, theme-aware.
// Approach: context provider + useToast hook per PWA_SYSTEM.md's Toast System.
//   Newest renders on top via flex-col-reverse; DaisyUI semantic colors work
//   across all 35 themes; safe-area bottom clears the iPhone home indicator.
// Alternative: one-off DOM injection per notification — rejected, not reusable
//   (and exactly what the vanilla version outgrew).
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ToastContext = createContext(() => {});

export function useToast() {
  return useContext(ToastContext);
}

const TOAST_STYLES = {
  success: 'bg-success text-success-content',
  error: 'bg-error text-error-content',
  info: 'bg-neutral text-neutral-content',
  warning: 'bg-warning text-warning-content',
};

let nextToastId = 1;

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const exitTimerRef = useRef(null);

  useEffect(() => {
    // Enter on the next frame so the transition runs; schedule exit + removal.
    const rafId = requestAnimationFrame(() => setVisible(true));
    const exitId = setTimeout(() => {
      setVisible(false);
      exitTimerRef.current = setTimeout(() => onRemove(toast.id), 200);
    }, toast.duration);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(exitId);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [toast, onRemove]);

  return (
    <div
      className={`px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium text-center
        transition-all duration-200
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        ${TOAST_STYLES[toast.tone] || TOAST_STYLES.info}`}
    >
      {toast.message}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, tone = 'info', duration = 3000) => {
    setToasts((current) => [...current, { id: nextToastId++, message, tone, duration }]);
  }, []);

  const remove = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* Always mounted: a live region inserted together with its first
          message is often not announced — screen readers need the region to
          exist BEFORE content lands in it. The region lives on the container
          (single announcer), not per toast — nested live regions double-speak.
          Positioning is in main.css (.toast-viewport) so the stack can shift
          above the update banner when both are on screen. */}
      <div
        className="toast-viewport fixed left-1/2 -translate-x-1/2 z-70 flex flex-col-reverse gap-2
          max-w-sm w-[calc(100%-2rem)] no-print"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => <ToastItem key={toast.id} toast={toast} onRemove={remove} />)}
      </div>
    </ToastContext.Provider>
  );
}
