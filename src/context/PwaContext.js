// Requirement: the navbar menu needs PWA state (install item visibility,
//   auto-update indicator) and actions, but the navbar is also rendered at
//   build time by entry-server — which must never import src/lib/pwa.js
//   (virtual:pwa-register only resolves inside the full Vite plugin pipeline,
//   and the module registers a service worker on import).
// Approach: a context whose DEFAULT value is the SSR-safe shape — install item
//   hidden, indicator default, no-op actions. PwaManager provides the live
//   value on the client; the build-time render simply has no provider and
//   falls through to the default, which matches the pre-hydration UI.
// Alternative: lazy dynamic import inside a hook — rejected, splits the
//   subscription logic across files and hides the SSR boundary.
import { createContext, useContext } from 'react';

const noop = () => {};

export const PwaContext = createContext({
  showInstallItem: false,
  autoUpdateEnabled: true,
  updateBannerVisible: false,
  installModalOpen: false,
  actions: {
    toggleAutoUpdate: noop,
    checkForUpdates: noop,
    triggerInstall: noop,
    applyUpdate: noop,
    dismissUpdateBanner: noop,
    dismissInstall: noop,
    closeInstallModal: noop,
  },
});

export function usePwa() {
  return useContext(PwaContext);
}
