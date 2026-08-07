// Requirement: browser-specific step-by-step install guides for non-technical
//   users, focus-trapped for keyboard accessibility (PWA_SYSTEM.md).
// Approach: data-driven — renders whatever getInstallInstructions() returned.
//   Adding a browser is a switch case in src/lib/pwa.js, not a new component.
import { useEffect, useRef } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { useEscapeKey } from '../hooks/useEscapeKey.js';
import { APP_SHORT_NAME } from '../lib/appIdentity.js';

const CHECK_PATH = 'M5 13l4 4L19 7';

const BENEFITS = [
  'Works offline',
  'Launches from your dock or home screen',
  'Full-screen experience without browser UI',
];

export function InstallModal({ instructions, onClose, onDismiss }) {
  const contentRef = useRef(null);
  useFocusTrap(contentRef, true);
  useEscapeKey(true, onClose);

  // The trap only cycles focus that is already INSIDE the container — without
  // moving focus in on open, Tab keeps walking the page underneath and screen
  // readers never announce the dialog. rAF so the elements exist; cancelled on
  // unmount (TIMER_LEAKS.md).
  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      contentRef.current?.querySelector('button')?.focus();
    });
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
      className="fixed inset-0 z-60 flex items-center justify-center no-print"
      style={{
        padding: 'max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) max(1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left))',
      }}
    >
      {/* cursor-pointer: iOS Safari does not fire click events on empty divs without it */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <div
        ref={contentRef}
        className="relative bg-base-100 rounded-xl border border-base-300 shadow-xl p-6 max-w-sm w-full"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div>
            {/* The manifest short_name — the name the browser itself shows in its
                install prompt. A heading that says anything else reads as a
                different app to a non-technical user (src/lib/appIdentity.js). */}
            <h3 id="install-modal-title" className="text-lg font-semibold text-base-content">Install {APP_SHORT_NAME}</h3>
            <p className="text-sm text-base-content/70">{instructions.browser}</p>
          </div>
        </div>

        <ol className="space-y-2 mb-4">
          {instructions.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                {i + 1}
              </span>
              <span className="text-base-content pt-0.5">{step}</span>
            </li>
          ))}
        </ol>

        {instructions.note && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-4">
            <p className="text-xs text-warning"><strong>Note:</strong> {instructions.note}</p>
          </div>
        )}

        <div className="border-t border-base-300 pt-4">
          <p className="text-xs text-base-content/70 mb-2">Benefits of installing:</p>
          <ul className="text-xs text-base-content/60 space-y-1">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={CHECK_PATH} />
                </svg>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* OS icon cache is the one layer the web app can't refresh — tell
            users who hit it what to do (PWA_ICON_CACHE_BUST.md). Collapsed so
            first-time installers stay focused on the install steps. */}
        <details className="border-t border-base-300 pt-4 mt-4">
          <summary className="text-base-content/60 text-xs cursor-pointer hover:text-base-content">
            Already installed and the icon looks outdated?
          </summary>
          <p className="text-base-content/60 text-xs mt-2 leading-relaxed">
            Your phone or computer keeps app icons cached separately from your
            browser, so clearing site data alone won&apos;t refresh them. Remove the
            app from your home screen, dock, or Start menu first, then install
            it again from this menu.
          </p>
        </details>

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" className="btn btn-ghost" onClick={onDismiss}>Not now</button>
          <button type="button" className="btn btn-primary" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}
