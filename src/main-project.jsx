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
