// Client entry for pattern.html and the prerendered patterns/<slug>/ pages.
import { createRoot } from 'react-dom/client';
import { ToastProvider } from './components/Toast.jsx';
import { PwaManager } from './components/PwaManager.jsx';
import { PageShell } from './components/PageShell.jsx';
import { PatternPage } from './pages/PatternPage.jsx';

createRoot(document.getElementById('root')).render(
  <ToastProvider>
    <PwaManager>
      <PageShell>
        <PatternPage />
      </PageShell>
    </PwaManager>
  </ToastProvider>,
);
