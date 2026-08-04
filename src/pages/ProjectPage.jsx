// Project detail page — served from the prerendered /projects/<slug>/
// (canonical) and the legacy project.html?name=<slug>. ProjectView is the
// shared presentational piece: entry-server renders it at build time with the
// README only; the client render adds the interactive doc tabs.
import { useEffect, useMemo, useRef, useState } from 'react';
import { renderMarkdown, isSafeUrl, projectMdLinkResolver } from '../lib/markdown.js';
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
  // Roving-tabindex anchor. Normally currentTab; if currentTab's doc is
  // undeclared (malformed meta), fall back to the first available tab so the
  // tablist never drops out of the keyboard tab order entirely.
  const focusableTabKey = activeDef && activeDef.available
    ? currentTab
    : tabDefs.find((t) => t.available)?.key;
  const raw = docs[currentTab];
  // Memoized: parsing a ~50KB doc on every render (each doc-fetch resolution,
  // every tab switch, every arrow-key move) is real work. Keyed on the raw
  // text — cross-links resolve to the project's own served doc files.
  const docHtml = useMemo(
    () => (raw ? renderMarkdown(raw, { resolveMdLink: projectMdLinkResolver(slug) }) : null),
    [raw, slug],
  );

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
        {/* isSafeUrl: meta.json is repo-controlled but fetched at runtime —
            the same trust boundary the markdown renderer enforces. A
            javascript: URL here would execute on click. */}
        <div className="flex flex-wrap gap-2 mt-3">
          {meta.liveUrl && isSafeUrl(meta.liveUrl) && (
            <a href={meta.liveUrl} target="_blank" rel="noopener" className="btn btn-outline btn-sm gap-1">Visit app</a>
          )}
          {meta.repoUrl && isSafeUrl(meta.repoUrl) && (
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
            <h2 className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2">Who it&apos;s for</h2>
            <p className="text-sm text-base-content/70">{meta.audience}</p>
          </div>
        </div>
        <div className="card bg-base-200/50 border border-base-300">
          <div className="card-body py-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2">Use cases</h2>
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
            <h2 className="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2">Data &amp; Privacy</h2>
            {Object.keys(meta.dataPrivacy).map((key) => (
              <div key={key} className="mb-2">
                <span className="font-semibold text-sm text-base-content">{privacyLabel(key)}:</span>{' '}
                <span className="text-sm text-base-content/70">{meta.dataPrivacy[key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full ARIA tabs pattern, not just the roles: roving tabindex + arrow
          keys on the tablist, and #doc-content is the labelled tabpanel.
          Half the pattern (roles without the keyboard model) announces
          interactions that don't exist. Arrow nav keeps focus ON the tab
          (onTab's focusPanel=false); click activation moves it to the panel
          so screen readers hear the new content. */}
      <div
        role="tablist"
        aria-label="Project documents"
        className="tabs tabs-bordered mb-6 no-print overflow-x-auto"
        onKeyDown={(e) => {
          if (!onTab) return;
          const keys = tabDefs.filter((t) => t.available).map((t) => t.key);
          if (keys.length === 0) return;
          // currentTab can be unavailable only on malformed meta (no readme
          // declared); treating it as "before the first tab" keeps arrows
          // working instead of dead-ending.
          const idx = Math.max(0, keys.indexOf(currentTab));
          let next = null;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = keys[(idx + 1) % keys.length];
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = keys[(idx - 1 + keys.length) % keys.length];
          else if (e.key === 'Home') next = keys[0];
          else if (e.key === 'End') next = keys[keys.length - 1];
          if (next && next !== currentTab) {
            e.preventDefault();
            onTab(next, false);
            document.getElementById(`tab-${next}`)?.focus();
          } else if (next) {
            e.preventDefault();
          }
        }}
      >
        {tabDefs.map((tab) => tab.available ? (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            role="tab"
            className={`tab${tab.key === currentTab ? ' tab-active' : ''}`}
            aria-selected={tab.key === currentTab}
            aria-controls="doc-content"
            tabIndex={tab.key === focusableTabKey ? 0 : -1}
            onClick={() => onTab && onTab(tab.key)}
          >
            {tab.label}
          </button>
        ) : (
          <button
            key={tab.key}
            role="tab"
            aria-selected={false}
            aria-disabled="true"
            tabIndex={-1}
            className="tab text-base-content/30 cursor-default"
            disabled
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* aria-labelledby only when the tab actually renders with that id — a
          disabled tab has no id, and a dangling reference is worse than none. */}
      <div
        id="doc-content"
        role="tabpanel"
        tabIndex={-1}
        aria-labelledby={activeDef && activeDef.available ? `tab-${currentTab}` : undefined}
      >
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
              <Markdown html={docHtml} />
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
      setState({
        status: 'error',
        title: 'No project specified',
        body: 'This link is missing a project name. Head back to the portfolio and pick a project from the list.',
      });
      return;
    }

    const basePath = `${BASE}projects/${encodeURIComponent(slug)}/`;
    // Every fetch (meta + each doc) gets its own controller, all aborted on
    // unmount; timers clear in finally — after the body parses, so a stalled
    // body stream still times out. timedOut distinguishes a timeout abort
    // (show the error) from an unmount abort (stay silent).
    const controllers = [];
    let timedOut = false;
    const fetchWithTimeout = (url, ms, parse) => {
      const controller = new AbortController();
      controllers.push(controller);
      const timer = setTimeout(() => { timedOut = true; controller.abort(); }, ms);
      return fetch(url, { signal: controller.signal })
        .then((r) => {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return parse(r);
        })
        .finally(() => clearTimeout(timer));
    };

    fetchWithTimeout(basePath + 'meta.json', 10000, (r) => r.json())
      .then((data) => {
        const meta = normalizeMeta(data, slug);
        applyPageSeo({
          title: meta.title,
          description: meta.description,
          // The clean URL is canonical — the ?name= form is the legacy entry
          // point and must not compete with it for the same content.
          path: `projects/${encodeURIComponent(slug)}/`,
          // Must match the node prerenderPages() writes for the same page.
          itemType: 'SoftwareApplication',
        });
        setState({ status: 'loaded', meta, slug });

        // Each declared doc fetches independently; a failure marks that tab
        // failed without sinking the page.
        DOC_FILES.forEach((doc) => {
          if (!meta.docs[doc.key]) return;
          fetchWithTimeout(basePath + doc.file, 15000, (r) => r.text())
            .then((text) => {
              // An empty/whitespace file is a failed doc, not content — a bare
              // '' would satisfy neither the loaded nor the failed branch in
              // ProjectView and the tab would show "Loading..." forever.
              setDocs((current) => ({ ...current, [doc.key]: text && text.trim() ? text : null }));
            })
            .catch((err) => {
              if (err && err.name === 'AbortError' && !timedOut) return;   // unmount
              setDocs((current) => ({ ...current, [doc.key]: null }));
            });
        });
      })
      .catch((err) => {
        const isAbort = err && err.name === 'AbortError';
        if (isAbort && !timedOut) return;   // unmount abort — nothing to report
        const isTimeout = isAbort && timedOut;
        // A 404 is a genuinely missing project; anything else (timeout,
        // network drop, 5xx) deserves a retry.
        const isNotFound = !isAbort && /^HTTP 404$/.test(err && err.message || '');
        setState({
          status: 'error',
          title: isTimeout ? 'Request timed out' : isNotFound ? 'Project not found' : 'Could not load project',
          body: isNotFound
            ? `"${slug}" does not exist.`
            : 'Something went wrong loading this project. Check your connection and try again.',
          retry: !isNotFound,
        });
      });

    return () => {
      controllers.forEach((c) => c.abort());
    };
  }, []);

  // Screen readers hear the updated content without navigating back to it.
  // The rAF id lives in a ref so unmount can cancel a mid-flight callback
  // (TIMER_LEAKS.md — every registration needs a reachable release).
  const tabFocusRafRef = useRef(null);
  useEffect(() => () => {
    if (tabFocusRafRef.current !== null) cancelAnimationFrame(tabFocusRafRef.current);
  }, []);
  // focusPanel=false is the arrow-key path — focus must stay on the tab so
  // the user can keep arrowing; click activation moves focus to the panel.
  const onTab = (key, focusPanel = true) => {
    setCurrentTab(key);
    if (tabFocusRafRef.current !== null) cancelAnimationFrame(tabFocusRafRef.current);
    if (!focusPanel) return;
    tabFocusRafRef.current = requestAnimationFrame(() => {
      tabFocusRafRef.current = null;
      document.getElementById('doc-content')?.focus({ preventScroll: true });
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
