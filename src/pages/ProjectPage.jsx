// Project detail page — served from the prerendered /projects/<slug>/
// (canonical) and the legacy project.html?name=<slug>. ProjectView is the
// shared presentational piece: entry-server renders it at build time with the
// README only; the client render adds the interactive doc tabs.
import { useEffect, useState } from 'react';
import { renderMarkdown } from '../lib/markdown.js';
import { applyPageSeo } from '../seoMeta.js';
import { Markdown, CopyMarkdownButton } from '../components/Markdown.jsx';

const BASE = import.meta.env.BASE_URL;

const DOC_FILES = [
  { key: 'readme', file: 'README.md', label: 'Overview' },
  { key: 'userGuide', file: 'USER_GUIDE.md', label: 'User Guide' },
  { key: 'testingGuide', file: 'TESTING_GUIDE.md', label: 'Testing Guide' },
  { key: 'tutorial', file: 'TUTORIAL.md', label: 'Tutorial' },
];

export function projectSlugFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('name');
  if (fromQuery) return fromQuery;
  const fromPath = window.location.pathname.match(/\/projects\/([a-z0-9-]+)\/?$/);
  return fromPath ? fromPath[1] : null;
}

// Defensive defaults so a sparse meta.json never renders "undefined".
export function normalizeMeta(meta, slug) {
  return {
    ...meta,
    title: meta.title || slug,
    description: meta.description || '',
    badge: meta.badge || '',
    repo: meta.repo || '',
    audience: meta.audience || 'Not specified',
    tech: meta.tech || [],
    useCases: meta.useCases || [],
    dataPrivacy: meta.dataPrivacy || {},
    docs: meta.docs || {},
  };
}

function privacyLabel(key) {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
}

// docs: { [key]: rawMarkdown | null (failed) | undefined (loading) }
export function ProjectView({ meta, slug, docs, currentTab, onTab }) {
  const statusLive = !!meta.liveUrl;
  const basePath = `${BASE}projects/${encodeURIComponent(slug)}/`;
  const tabDefs = DOC_FILES.map((d) => ({ ...d, available: !!meta.docs[d.key] }));
  const activeDef = tabDefs.find((t) => t.key === currentTab);
  const raw = docs[currentTab];

  return (
    <>
      <p className="text-sm mb-4">
        <a href={BASE} className="link link-primary">&larr; All projects</a>
      </p>

      <header className="mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold">{meta.title}</h1>
          <span className="badge badge-primary">{meta.badge}</span>
          <span className="badge badge-ghost">{meta.repo}</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium">
            <span className={`w-2 h-2 rounded-full ${statusLive ? 'bg-success' : 'bg-base-content/30'}`} />
            {statusLive ? 'Live' : 'No live URL'}
          </span>
        </div>
        <p className="text-base-content/60 mt-2">{meta.description}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {meta.liveUrl && (
            <a href={meta.liveUrl} target="_blank" rel="noopener" className="btn btn-outline btn-sm gap-1">Visit app</a>
          )}
          {meta.repoUrl && (
            <a href={meta.repoUrl} target="_blank" rel="noopener" className="btn btn-outline btn-sm gap-1">Source code</a>
          )}
          {!meta.repoUrl && meta.repo === 'private' && (
            <span className="btn btn-outline btn-sm btn-disabled opacity-50">Private repository</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {meta.tech.map((t) => <span key={t} className="badge badge-ghost badge-sm">{t}</span>)}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        <div className="card bg-base-200/50 border border-base-300">
          <div className="card-body py-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2">Who it&apos;s for</h3>
            <p className="text-sm text-base-content/70">{meta.audience}</p>
          </div>
        </div>
        <div className="card bg-base-200/50 border border-base-300">
          <div className="card-body py-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2">Use cases</h3>
            {meta.useCases.length > 0 ? (
              <ul className="list-disc ml-4 space-y-1">
                {meta.useCases.map((u) => <li key={u} className="text-sm text-base-content/70">{u}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-base-content/40">Coming soon.</p>
            )}
          </div>
        </div>
        <div className="card bg-base-200/50 border border-base-300">
          <div className="card-body py-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2">Data &amp; Privacy</h3>
            {Object.keys(meta.dataPrivacy).map((key) => (
              <div key={key} className="mb-2">
                <span className="font-semibold text-sm text-base-content">{privacyLabel(key)}:</span>{' '}
                <span className="text-sm text-base-content/70">{meta.dataPrivacy[key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div role="tablist" className="tabs tabs-bordered mb-6 no-print overflow-x-auto">
        {tabDefs.map((tab) => tab.available ? (
          <button
            key={tab.key}
            role="tab"
            className={`tab${tab.key === currentTab ? ' tab-active' : ''}`}
            aria-selected={tab.key === currentTab}
            onClick={() => onTab && onTab(tab.key)}
          >
            {tab.label}
          </button>
        ) : (
          <button key={tab.key} className="tab text-base-content/30 cursor-default" disabled>
            {tab.label}
          </button>
        ))}
      </div>

      <div id="doc-content">
        {raw ? (
          <div className="card bg-base-200/50 border border-base-300">
            <div className="card-body">
              <div className="flex gap-3 mb-4 no-print">
                <CopyMarkdownButton text={raw} />
                <a
                  href={basePath + (DOC_FILES.find((d) => d.key === currentTab)?.file || '')}
                  className="btn btn-outline btn-sm gap-1"
                  target="_blank"
                  rel="noopener"
                >
                  Raw file
                </a>
              </div>
              <Markdown html={renderMarkdown(raw)} />
            </div>
          </div>
        ) : raw === null ? (
          <div className="card bg-base-200/50 border border-base-300">
            <div className="card-body">
              <p className="text-center py-8 text-base-content/40">
                Failed to load this document.{' '}
                <button onClick={() => location.reload()} className="link link-primary">Retry</button>
              </p>
            </div>
          </div>
        ) : activeDef && activeDef.available ? (
          <div className="card bg-base-200/50 border border-base-300">
            <div className="card-body"><p className="text-center py-8 text-base-content/40">Loading...</p></div>
          </div>
        ) : (
          <div className="card bg-base-200/50 border border-base-300">
            <div className="card-body"><p className="text-center py-12 text-base-content/40 italic">Coming soon.</p></div>
          </div>
        )}
      </div>
    </>
  );
}

function ErrorView({ title, body, retry }) {
  return (
    <div className="text-center py-16">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-base-content/60">{body}</p>
      {retry && (
        <p className="mt-2">
          <button onClick={() => location.reload()} className="btn btn-primary btn-sm">Retry</button>
        </p>
      )}
      <p className="mt-2">
        <a href={BASE} className="link link-primary">Back to portfolio</a>
      </p>
    </div>
  );
}

export function ProjectPage() {
  const [state, setState] = useState({ status: 'loading' });
  const [docs, setDocs] = useState({});
  const [currentTab, setCurrentTab] = useState('readme');

  useEffect(() => {
    const slug = projectSlugFromLocation();
    // Allowlist alphanumeric + hyphens — prevents path traversal attempts.
    if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
      setState({ status: 'error', title: 'No project specified', body: '' });
      return;
    }

    const basePath = `${BASE}projects/${encodeURIComponent(slug)}/`;
    const controller = new AbortController();
    const timers = [];
    let timedOut = false;
    const withTimeout = (ms) => {
      const id = setTimeout(() => { timedOut = true; controller.abort(); }, ms);
      timers.push(id);
      return id;
    };

    const metaTimeout = withTimeout(10000);
    fetch(basePath + 'meta.json', { signal: controller.signal })
      .then((r) => {
        clearTimeout(metaTimeout);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then((data) => {
        const meta = normalizeMeta(data, slug);
        applyPageSeo({
          title: meta.title,
          description: meta.description,
          // The clean URL is canonical — the ?name= form is the legacy entry
          // point and must not compete with it for the same content.
          path: `projects/${encodeURIComponent(slug)}/`,
        });
        setState({ status: 'loaded', meta, slug });

        // Each declared doc fetches independently; a failure marks that tab
        // failed without sinking the page. 15s per doc, cleared on both paths.
        DOC_FILES.forEach((doc) => {
          if (!meta.docs[doc.key]) return;
          const docController = new AbortController();
          const docTimeout = setTimeout(() => docController.abort(), 15000);
          timers.push(docTimeout);
          fetch(basePath + doc.file, { signal: docController.signal })
            .then((r) => {
              clearTimeout(docTimeout);
              return r.ok ? r.text() : null;
            })
            .then((text) => {
              setDocs((current) => ({ ...current, [doc.key]: text ?? null }));
            })
            .catch(() => {
              clearTimeout(docTimeout);
              setDocs((current) => ({ ...current, [doc.key]: null }));
            });
        });
      })
      .catch((err) => {
        const isAbort = err && err.name === 'AbortError';
        if (isAbort && !timedOut) return;   // unmount abort — nothing to report
        const isTimeout = isAbort && timedOut;
        setState({
          status: 'error',
          title: isTimeout ? 'Request timed out' : 'Project not found',
          body: isTimeout
            ? 'Could not load project data. Check your connection and try again.'
            : `"${slug}" does not exist.`,
          retry: isTimeout,
        });
      });

    return () => {
      timers.forEach(clearTimeout);
      controller.abort();
    };
  }, []);

  // Screen readers hear the updated content without navigating back to it.
  const onTab = (key) => {
    setCurrentTab(key);
    requestAnimationFrame(() => {
      const content = document.getElementById('doc-content');
      if (content) {
        content.setAttribute('tabindex', '-1');
        content.focus({ preventScroll: true });
      }
    });
  };

  if (state.status === 'loading') {
    return <p className="text-center py-16 text-base-content/40">Loading...</p>;
  }
  if (state.status === 'error') {
    return <ErrorView title={state.title} body={state.body} retry={state.retry} />;
  }
  return (
    <ProjectView meta={state.meta} slug={state.slug} docs={docs} currentTab={currentTab} onTab={onTab} />
  );
}
