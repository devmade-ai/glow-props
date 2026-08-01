// Shared page chrome — skip link, navbar, main landmark, footer. Rendered by
// all three page roots AND by entry-server for the build-time SSG pass, so it
// must only import SSR-safe modules (no src/lib/pwa.js — that arrives via
// PwaContext, which defaults to the SSR-safe shape when no provider exists).
import { Navbar } from './Navbar.jsx';

export function SkipLink() {
  // z-50 clears the sticky navbar (z-30) — its whole job — while staying below
  // modals (60) and toasts (70). See docs/implementations/Z_INDEX_SCALE.md.
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:btn focus:btn-primary focus:btn-sm"
    >
      Skip to main content
    </a>
  );
}

export function Footer() {
  return (
    <footer
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center border-t border-base-300 no-print"
      style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      <p className="text-sm text-base-content/40">
        <a
          href="https://github.com/devmade-ai"
          target="_blank"
          rel="noopener"
          className="link link-hover text-base-content/40 hover:text-base-content/70"
        >
          github.com/devmade-ai
        </a>
      </p>
    </footer>
  );
}

export function PageShell({ children }) {
  return (
    <>
      <SkipLink />
      <Navbar />
      <main id="main" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <Footer />
    </>
  );
}
