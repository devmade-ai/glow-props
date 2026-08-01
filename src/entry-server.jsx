// Build-time SSG renderers, loaded by the prerender plugins in vite.config.js
// via a nested Vite server's ssrLoadModule. Renders the SAME components the
// client mounts, so the crawlable markup and the live page cannot drift.
//
// Must never import src/lib/pwa.js (registers a service worker on import;
// virtual:pwa-register only resolves in the full plugin pipeline) or anything
// that touches browser APIs at module scope. The PWA UI comes from PwaContext,
// which defaults to the SSR-safe shape when no provider exists — exactly the
// pre-JS state the client then replaces.
import { renderToString } from 'react-dom/server';
import { PageShell } from './components/PageShell.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { PatternView } from './pages/PatternPage.jsx';
import { ProjectView } from './pages/ProjectPage.jsx';
import { normalizeMeta } from './pages/ProjectPage.jsx';
import { renderMarkdown } from './lib/markdown.js';

export function renderHome(patterns) {
  return renderToString(
    <PageShell>
      <HomePage patterns={patterns} prerender />
    </PageShell>,
  );
}

export function renderPattern(pattern, rawMarkdown) {
  return renderToString(
    <PageShell>
      <PatternView pattern={pattern} html={renderMarkdown(rawMarkdown)} rawMarkdown={rawMarkdown} />
    </PageShell>,
  );
}

export function renderProject(meta, slug, rawReadme) {
  const normalized = normalizeMeta(meta, slug);
  return renderToString(
    <PageShell>
      <ProjectView
        meta={normalized}
        slug={slug}
        docs={{ readme: rawReadme || undefined }}
        currentTab="readme"
      />
    </PageShell>,
  );
}
