// Requirement: pattern.html and project.html choose their content from a
//   `?name=` query parameter, so every pattern and every project is a distinct
//   page served by one HTML file. Their <head> can only carry generic copy —
//   and a static <link rel="canonical"> would be worse than none, because
//   pointing every pattern at the bare pattern.html tells Google they are all
//   the same URL and suppresses the lot.
// Approach: set the per-page tags at runtime, where the name is known. Google
//   renders JS and reads these; that is the same channel the existing
//   document.title assignment already relies on.
// Alternatives:
//   - Static canonical per page: rejected, see above — actively harmful.
//   - Prerendering one HTML file per pattern: the better answer for crawling,
//     and a real option later, but a build-architecture change rather than a
//     head-tag fix. Noted in docs/TODO.md.
//
// NOT a fix for link previews. Unfurlers (WhatsApp, Slack, Signal, iMessage)
// do not run JS, so they see the generic tags in the HTML and nothing this
// module does. That is a known limit of a query-parameter page and is why the
// static fallbacks in both files are written to stand on their own.
//
// See docs/implementations/DISCOVERABILITY.md.

const SITE = 'https://devmade-ai.github.io/glow-props/';

function setMeta(selector, attr, key, content) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/**
 * Point the page's identity tags at the item actually being shown.
 *
 * @param {object} page
 * @param {string} page.title       Item title, without the site suffix.
 * @param {string} page.description One or two sentences about this item.
 * @param {string} page.path        Page file plus query, e.g. "pattern.html?name=x".
 */
export function applyPageSeo({ title, description, path }) {
  const fullTitle = `${title} — devmade-ai`;
  const url = SITE + path;

  document.title = fullTitle;

  // The canonical is the whole reason this runs: it has to carry the query
  // string, or every item collapses onto one URL.
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);

  setMeta('meta[name="description"]', 'name', 'description', description);
  setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
  setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  setMeta('meta[property="og:url"]', 'property', 'og:url', url);
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
}
