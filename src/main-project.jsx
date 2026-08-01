// Client entry for project.html and the prerendered projects/<slug>/ pages.
import { createRoot } from 'react-dom/client';
import { ToastProvider } from './components/Toast.jsx';
import { PwaManager } from './components/PwaManager.jsx';
import { PageShell } from './components/PageShell.jsx';
import { ProjectPage } from './pages/ProjectPage.jsx';

createRoot(document.getElementById('root')).render(
  <ToastProvider>
    <PwaManager>
      <PageShell>
        <ProjectPage />
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
