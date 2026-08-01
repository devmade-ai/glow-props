// DEV-only mount for the debug pill, loaded via dynamic import from the page
// entries: `if (import.meta.env.DEV) import('./debugMount.jsx')`. The gate
// lives at the import site so production bundles never contain the debug
// subsystem at all — this repo's documented DEBUG_SYSTEM variant (see
// CLAUDE.md AI notes; same rationale as four-ems' DEV gate: public visitors
// get nothing from an operational pill).
//
// Separate React root, created here rather than shipped as an empty div in
// every page: the pill must survive page-root crashes (DEBUG_SYSTEM.md key
// lesson 1), and only dev sessions ever need the container.
import { createRoot } from 'react-dom/client';
import { DebugPill } from './components/debug/DebugPill.jsx';

if (!window.__debugPillMounted) {
  window.__debugPillMounted = true;

  let container = document.getElementById('debug-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'debug-root';
    document.body.appendChild(container);
  }
  const root = createRoot(container);
  root.render(<DebugPill />);

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      root.unmount();
      window.__debugPillMounted = false;
    });
  }
}
