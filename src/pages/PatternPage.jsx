// Pattern detail page — served from two URLs: the prerendered
// /patterns/<slug>/ (canonical) and the legacy pattern.html?name=<slug>.
// PatternView is the shared presentational piece: entry-server renders it at
// build time with data loaded in Node; this page renders it after fetching.
import { useEffect, useState } from 'react';
import { renderMarkdown } from '../lib/markdown.js';
import { applyPageSeo } from '../seoMeta.js';
import { Markdown, CopyMarkdownButton } from '../components/Markdown.jsx';

const BASE = import.meta.env.BASE_URL;

export function patternSlugFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('name');
  if (fromQuery) return fromQuery;
  const fromPath = window.location.pathname.match(/\/patterns\/([a-z0-9-]+)\/?$/);
  return fromPath ? fromPath[1] : null;
}

export function PatternView({ pattern, html, rawMarkdown }) {
  const filePath = `${BASE}patterns/${pattern.file}`;
  return (
    <>
      <p className="text-sm mb-4">
        <a href={`${BASE}#patterns`} className="link link-primary">&larr; All patterns</a>
      </p>
      <header className="mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold">{pattern.title}</h1>
          <span className="badge badge-primary">{pattern.badge}</span>
        </div>
      </header>
      <div className="card bg-base-200/50 border border-base-300">
        <div className="card-body">
          <div className="flex gap-3 mb-4 no-print">
            <CopyMarkdownButton text={rawMarkdown} />
            <a href={filePath} className="btn btn-outline btn-sm gap-1" target="_blank" rel="noopener">Raw file</a>
          </div>
          <Markdown html={html} />
        </div>
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
        <a href={`${BASE}#patterns`} className="link link-primary">Back to patterns</a>
      </p>
    </div>
  );
}

function Loading() {
  return <p className="text-center py-16 text-base-content/40">Loading...</p>;
}

export function PatternPage() {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    const slug = patternSlugFromLocation();
    if (!slug) {
      setState({ status: 'error', title: 'Pattern not found', body: '' });
      return;
    }

    // Timeouts abort the fetch instead of spinning forever; both timers are
    // cleared on every completion path AND on unmount. timedOut distinguishes
    // a timeout abort (show the retry error) from an unmount abort (stay
    // silent — the component is gone).
    const controller = new AbortController();
    const timers = [];
    let timedOut = false;
    const withTimeout = (ms) => {
      const id = setTimeout(() => { timedOut = true; controller.abort(); }, ms);
      timers.push(id);
      return id;
    };

    const manifestTimeout = withTimeout(10000);
    fetch(`${BASE}patterns/manifest.json`, { signal: controller.signal })
      .then((r) => {
        clearTimeout(manifestTimeout);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then((manifest) => {
        const pattern = manifest.patterns.find((p) => p.slug === slug);
        if (!pattern) {
          setState({ status: 'error', title: 'Pattern not found', body: '' });
          return;
        }
        applyPageSeo({
          title: pattern.title,
          description: pattern.description,
          // The clean URL is canonical — the ?name= form is the legacy entry
          // point and must not compete with it for the same content.
          path: `patterns/${encodeURIComponent(pattern.slug)}/`,
        });
        const fetchTimeout = withTimeout(15000);
        return fetch(`${BASE}patterns/${pattern.file}`, { signal: controller.signal })
          .then((r) => {
            clearTimeout(fetchTimeout);
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.text();
          })
          .then((text) => {
            setState({ status: 'loaded', pattern, rawMarkdown: text, html: renderMarkdown(text) });
          });
      })
      .catch((err) => {
        const isAbort = err && err.name === 'AbortError';
        if (isAbort && !timedOut) return;   // unmount abort — nothing to report
        const isTimeout = isAbort && timedOut;
        setState({
          status: 'error',
          title: isTimeout ? 'Request timed out' : 'Could not load pattern',
          body: isTimeout
            ? 'Could not load pattern data. Check your connection and try again.'
            : 'The pattern file could not be loaded.',
          retry: isTimeout,
        });
      });

    return () => {
      timers.forEach(clearTimeout);
      controller.abort();
    };
  }, []);

  if (state.status === 'loading') return <Loading />;
  if (state.status === 'error') return <ErrorView title={state.title} body={state.body} retry={state.retry} />;
  return <PatternView pattern={state.pattern} html={state.html} rawMarkdown={state.rawMarkdown} />;
}
