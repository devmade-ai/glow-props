// Requirement: components (navbar menu) re-render when the theme changes from
//   ANY source — menu click, cross-tab storage event, OS preference change.
// Approach: plain useState + subscribeTheme effect over the theme singleton.
//   The initializer reads the DOM (set pre-paint by the bootstrap); during SSG
//   renderToString effects don't run and the guarded getters return defaults,
//   which matches the static markup the client then replaces.
import { useEffect, useState } from 'react';
import { isDark, currentTheme, isRandomEnabled, subscribeTheme } from '../lib/theme.js';

export function useTheme() {
  const [snapshot, setSnapshot] = useState(() => ({
    dark: isDark(),
    theme: currentTheme(),
    randomEnabled: typeof window === 'undefined' ? false : isRandomEnabled(),
  }));

  useEffect(() => {
    const update = () => setSnapshot({
      dark: isDark(),
      theme: currentTheme(),
      randomEnabled: isRandomEnabled(),
    });
    update();   // state may have changed between initial render and mount
    return subscribeTheme(update);
  }, []);

  return snapshot;
}
