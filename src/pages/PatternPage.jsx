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
      setState({
        status: 'error',
        title: 'Pattern not found',
        body: 'This link is missing a pattern name. Head back and pick a pattern from the list.',
      });
      return;
    }

    // Each fetch gets its OWN controller + timeout: a shared controller lets
    // one request's timeout abort the other mid-flight, and the timer is
    // cleared in finally — after the BODY parses, not at headers, so a stalled
    // body stream still times out. timedOut distinguishes a timeout abort
    // (show the retry error) from an unmount abort (stay silent — the
    // component is gone).
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

    fetchWithTimeout(`${BASE}patterns/manifest.json`, 10000, (r) => r.json())
      .then((manifest) => {
        const pattern = manifest.patterns.find((p) => p.slug === slug);
        if (!pattern) {
          setState({
            status: 'error',
            title: 'Pattern not found',
            body: 'This pattern doesn’t exist or was renamed. Head back and pick one from the list.',
          });
          return;
        }
        applyPageSeo({
          title: pattern.title,
          description: pattern.description,
          // The clean URL is canonical — the ?name= form is the legacy entry
          // point and must not compete with it for the same content.
          path: `patterns/${encodeURIComponent(pattern.slug)}/`,
        });
        return fetchWithTimeout(`${BASE}patterns/${pattern.file}`, 15000, (r) => r.text())
          .then((text) => {
            setState({ status: 'loaded', pattern, rawMarkdown: text, html: renderMarkdown(text) });
          });
      })
      .catch((err) => {
        const isAbort = err && err.name === 'AbortError';
        if (isAbort && !timedOut) return;   // unmount abort — nothing to report
        const isTimeout = isAbort && timedOut;
        // Retry offered on every load failure, not only timeouts — a flaky
        // connection produces plain network errors just as often.
        setState({
          status: 'error',
          title: isTimeout ? 'Request timed out' : 'Could not load pattern',
          body: 'Something went wrong loading this pattern. Check your connection and try again.',
          retry: true,
        });
      });

    return () => {
      controllers.forEach((c) => c.abort());
    };
  }, []);

  if (state.status === 'loading') return <Loading />;
  if (state.status === 'error') return <ErrorView title={state.title} body={state.body} retry={state.retry} />;
  return <PatternView pattern={state.pattern} html={state.html} rawMarkdown={state.rawMarkdown} />;
}
