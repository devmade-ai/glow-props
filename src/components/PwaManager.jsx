// Requirement: bridge the framework-agnostic PWA singleton (src/lib/pwa.js)
//   into React — provide live state/actions to the navbar via PwaContext and
//   render the event-driven UI (toasts, update banner, install modal).
// This component is CLIENT-ONLY: entry-server must never import it, because
//   src/lib/pwa.js registers the service worker on import and depends on
//   virtual:pwa-register, which only resolves inside the full plugin pipeline.
import { useEffect, useState } from 'react';
import { PwaContext } from '../context/PwaContext.js';
import { useToast } from './Toast.jsx';
import { UpdateBanner } from './UpdateBanner.jsx';
import { InstallModal } from './InstallModal.jsx';
import {
  getPwaState, subscribePwa, subscribePwaEvents, getInstallInstructions,
  toggleAutoUpdate, checkForUpdates, triggerInstall, applyUpdate,
  dismissUpdateBanner, dismissInstall, closeInstallModal,
} from '../lib/pwa.js';

const actions = {
  toggleAutoUpdate, checkForUpdates, triggerInstall, applyUpdate,
  dismissUpdateBanner, dismissInstall, closeInstallModal,
};

export function PwaManager({ children }) {
  const showToast = useToast();
  const [, force] = useState(0);

  // Re-render on singleton state changes; forward its events to toasts.
  // Both subscriptions return unsubscribe fns invoked on cleanup (TIMER_LEAKS.md).
  useEffect(() => {
    const unsubState = subscribePwa(() => force((n) => n + 1));
    const unsubEvents = subscribePwaEvents((event) => {
      if (event.type === 'toast') showToast(event.message, event.tone, event.duration);
    });
    return () => { unsubState(); unsubEvents(); };
  }, [showToast]);

  const state = getPwaState();
  const contextValue = {
    showInstallItem: state.showInstallItem,
    autoUpdateEnabled: state.autoUpdateEnabled,
    updateBannerVisible: state.updateBannerVisible,
    installModalOpen: state.installModalOpen,
    actions,
  };

  return (
    <PwaContext.Provider value={contextValue}>
      {children}
      {state.updateBannerVisible && (
        <UpdateBanner onUpdate={applyUpdate} onDismiss={dismissUpdateBanner} />
      )}
      {state.installModalOpen && (
        <InstallModal
          instructions={getInstallInstructions()}
          onClose={closeInstallModal}
          onDismiss={dismissInstall}
        />
      )}
    </PwaContext.Provider>
  );
}
