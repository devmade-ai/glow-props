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
//   - Prerendering one HTML file per item: DONE for both patterns AND projects
//     — prerenderPages() in vite.config.js gives each its own file, head tags
//     and crawlable body at /patterns/<slug>/ and /projects/<slug>/. This
//     module still runs on those pages (harmlessly, setting the same values)
//     and is what covers the legacy ?name= entry points, which stay generic
//     until it runs.
//
// NOT a fix for link previews. Unfurlers (WhatsApp, Slack, Signal, iMessage)
// do not run JS, so they see the generic tags in the HTML and nothing this
// module does. That is a known limit of a query-parameter page and is why the
// static fallbacks in both files are written to stand on their own.
//
// See docs/implementations/DISCOVERABILITY.md.

import { SITE, ORG_ID, WEBSITE_ID, siteNodes, itemNode, graphJson } from './lib/structuredData.js';

function setMeta(selector, attr, key, content) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

// Requirement: the ?name= entry points need the same item node the prerendered
//   pages get, or a pattern reached that way is described only by the two
//   site-wide nodes.
// Approach: rewrite the existing block's contents rather than appending a
//   second <script>. On a prerendered page this recomputes the node that is
//   already there — same values, one block, so the "exactly one graph" property
//   holds whichever route the visitor arrived by.
// Alternative: append a block when the page is a ?name= form — rejected, it
//   makes the number of graphs depend on the entry point, which is the kind of
//   thing that silently doubles after an unrelated change.
function applyStructuredData({ itemType, title, description, url }) {
  const block = document.getElementById('page-jsonld');
  if (!block) return;

  // Read the block rather than trusting it: if the template's site nodes are
  // ever wrong, replacing them with freshly-built ones would hide that from
  // verify:seo. Both must be present and match before this writes anything.
  let existing;
  try {
    existing = JSON.parse(block.textContent);
  } catch {
    // A malformed block is a build-time mistake, not something to paper over at
    // runtime: leave it alone so verify:seo and Search Console both see it.
    return;
  }
  const ids = (existing['@graph'] || []).map((node) => node['@id']);
  if (!ids.includes(ORG_ID) || !ids.includes(WEBSITE_ID)) return;

  block.textContent = graphJson([
    ...siteNodes(),
    itemNode({ itemType, title, description, url }),
  ]);
}

/**
 * Point the page's identity tags at the item actually being shown.
 *
 * @param {object} page
 * @param {string} page.title       Item title, without the site suffix.
 * @param {string} page.description One or two sentences about this item.
 * @param {string} page.path        Site-relative canonical path, e.g. "patterns/timer-leaks/".
 * @param {string} page.itemType    schema.org type for this item — "TechArticle" or
 *                                  "SoftwareApplication". Must match what
 *                                  prerenderPages() writes for the same page.
 */
export function applyPageSeo({ title, description, path, itemType }) {
  const fullTitle = `${title} — devmade-ai`;
  const url = SITE + path;

  document.title = fullTitle;

  // The canonical is the whole reason this runs: callers pass the item's
  // clean prerendered URL (patterns/<slug>/, projects/<slug>/), which is what
  // keeps the legacy ?name= entry points from competing with those pages —
  // and keeps every item from collapsing onto the bare template URL.
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

  if (itemType) applyStructuredData({ itemType, title, description, url });
}
