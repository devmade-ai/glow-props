// Requirement: rendered markdown (pattern docs, project docs) with working
//   per-code-block copy buttons.
// Approach: the HTML comes from the shared marked renderer (identical at build
//   time and runtime); copy buttons carry data-copy-code and ONE delegated
//   listener per Markdown instance handles them — no window.* global, and the
//   same markup works in the SSG output before React mounts (buttons are
//   simply inert until then, matching the pre-JS state of everything else).
// Cleanup: the listener and any pending feedback-reset timers are released on
//   unmount (TIMER_LEAKS.md — effect returns are the React variant).
import { useEffect, useRef } from 'react';
import { clipboardWrite } from '../lib/markdown.js';

export function Markdown({ html }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const feedbackTimers = new Set();

    const onClick = (e) => {
      const btn = e.target.closest('[data-copy-code]');
      if (!btn || !container.contains(btn)) return;
      const code = btn.parentNode.querySelector('code');
      if (!code) return;
      clipboardWrite(code.textContent).then((ok) => {
        btn.textContent = ok ? 'Copied!' : 'Copy failed';
        const id = setTimeout(() => {
          feedbackTimers.delete(id);
          btn.textContent = 'Copy';
        }, 1500);
        feedbackTimers.add(id);
      });
    };

    container.addEventListener('click', onClick);
    return () => {
      container.removeEventListener('click', onClick);
      feedbackTimers.forEach(clearTimeout);
    };
  }, [html]);

  return <div ref={containerRef} className="md-render" dangerouslySetInnerHTML={{ __html: html }} />;
}

// Page-level "Copy markdown" button with self-resetting feedback.
export function CopyMarkdownButton({ text }) {
  const btnRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const onCopy = () => {
    if (!text) return;
    clipboardWrite(text).then((ok) => {
      const btn = btnRef.current;
      if (!btn) return;
      btn.textContent = ok ? 'Copied!' : 'Copy failed';
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        if (btnRef.current) btnRef.current.textContent = 'Copy markdown';
      }, 1500);
    });
  };

  return (
    <button ref={btnRef} type="button" className="btn btn-outline btn-sm gap-1" onClick={onCopy}>
      Copy markdown
    </button>
  );
}
