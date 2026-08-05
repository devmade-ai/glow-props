// Requirement: bridge the framework-agnostic PWA singleton (src/lib/pwa.js)
//   into React — provide live state/actions to the navbar via PwaContext and
//   render the event-driven UI (toasts, update banner, install modal).
// This component is CLIENT-ONLY: entry-server must never import it, because
//   src/lib/pwa.js registers the service worker on import and depends on
//   virtual:pwa-register, which only resolves inside the full plugin pipeline.
import { useEffect, useSyncExternalStore } from 'react';
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

  // useSyncExternalStore is the primitive for exactly this shape — an external
  // mutable store React has to observe. It replaces a force-render subscriber
  // plus a manual on-mount resync: React reads the snapshot during render, so
  // a notify() landing between first render and effect commit cannot be
  // missed, and concurrent rendering can't tear. Requires getPwaState() to
  // return a NEW object per change, which src/lib/pwa.js now guarantees.
  const state = useSyncExternalStore(subscribePwa, getPwaState, getPwaState);

  // Events (toasts) stay a plain subscription — they are notifications, not
  // state, so there is no snapshot to read. The singleton buffers any that
  // fire before this effect commits and drains them on subscribe.
  useEffect(() => {
    return subscribePwaEvents((event) => {
      if (event.type === 'toast') showToast(event.message, event.tone, event.duration);
    });
  }, [showToast]);
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
