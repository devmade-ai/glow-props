// Client entry for index.html. createRoot().render() clears the SSG'd content
// in #root and replaces it with the live tree — the build-time markup exists
// for crawlers and unfurlers, not for hydration (the pages fetch their data at
// runtime, so hydration would mismatch by design).
import { createRoot } from 'react-dom/client';
import { ToastProvider } from './components/Toast.jsx';
import { PwaManager } from './components/PwaManager.jsx';
import { PageShell } from './components/PageShell.jsx';
import { HomePage } from './pages/HomePage.jsx';

createRoot(document.getElementById('root')).render(
  <ToastProvider>
    <PwaManager>
      <PageShell>
        <HomePage />
      </PageShell>
    </PwaManager>
  </ToastProvider>,
);

// The pre-module watchdog in partials/head-common.html arms a 20s timer; a
// successful mount clears it. The debug pill loads ONLY in dev — the dynamic
// import keeps the whole debug subsystem out of production bundles (this
// repo's documented DEBUG_SYSTEM gate).
if (window.__debugClearLoadTimer) window.__debugClearLoadTimer();
if (import.meta.env.DEV) import('./debugMount.jsx');
