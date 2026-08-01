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

// The pre-module watchdog (partials/head-common.html) is cleared from
// PageShell's mount effect — after the tree actually commits, not here at
// module eval. The debug pill loads ONLY in dev — the dynamic import keeps
// the whole debug subsystem out of production bundles (this repo's
// documented DEBUG_SYSTEM gate).
if (import.meta.env.DEV) import('./debugMount.jsx');
