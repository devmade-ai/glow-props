#!/usr/bin/env node
// Requirement: the Gap Matrix's DISCOVERABILITY column was graded by hand from
//   a one-off fetch of every origin. Hand-maintained grades rot — that is
//   exactly how the matrix's other columns ended up four months stale while
//   still reading as current.
// Approach: fetch every tracked origin, apply the written criteria
//   mechanically, and emit the column. `--check` compares what it measures
//   against what docs/TODO.md claims and fails on drift.
// Why not a deploy gate: this reaches 16 third-party origins over the network.
//   A transient 503 on someone else's host must not block publishing a
//   documentation change. It is a periodic check, run deliberately.
// Alternative: grade from source in each repo — rejected, that is the method
//   that produced the stale columns. A repo containing public/robots.txt and an
//   origin serving robots.txt are different facts, and four repos in this fleet
//   have the first without the second.
//
// Run: npm run audit:discoverability [--check] [--json]

import { readFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
// Shared with audit-cross-links.mjs — one resolution of "what is the fleet".
import { origins } from './lib/fleetOrigins.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TODO = join(ROOT, 'docs', 'TODO.md');

const CHECK = process.argv.includes('--check');
const AS_JSON = process.argv.includes('--json');

// Identify as a crawler: if any host varies its response for one, the crawler
// view is the one being graded.
const UA = 'Mozilla/5.0 (compatible; devmade-audit/1.0; +https://devmade.app)';
const TIMEOUT_MS = 20000;

/**
 * A repo may DECLARE that discoverability does not apply to it.
 *
 * Requirement: not every origin in this fleet is a product. tool-till-tees is an
 *   internal backend API whose root is a placeholder shell — no public
 *   audience, nothing to find, nothing to unfurl. Grading it against the public
 *   criteria produces a permanent red cell that means "we decided this on
 *   purpose", which is the same noise as a stale grade and trains people to
 *   ignore the column.
 *
 * Approach: the declaration lives in the project's own meta.json, next to the
 *   liveUrl the audit already reads from it — so it travels with the project
 *   rather than becoming a hardcoded exception list in this script that nobody
 *   revisits.
 *
 * Two guards, because "N/A" is exactly the shape a silencer takes:
 *   - A REASON IS REQUIRED. An N/A with no argument is rejected loudly. If you
 *     cannot say why in a sentence, you have not decided, you have deferred.
 *   - The origin is still MEASURED. If a declared-N/A site starts carrying
 *     Open Graph tags, a sitemap, or real body text, it has stopped being what
 *     the declaration says it is, and the run says so. A decision that outlives
 *     its premise is the failure mode every other column in this matrix already
 *     demonstrates.
 */
function declaredNotApplicable(decl) {
  if (!decl || decl.grade !== 'N/A') return null;
  if (!decl.reason || !decl.reason.trim()) {
    throw new Error(
      'a discoverability declaration of N/A requires a "reason" in meta.json.\n' +
      '  An N/A with no argument is a mute, not a decision.',
    );
  }
  return decl.reason.trim();
}

async function get(url) {
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow', signal });
    return { ok: true, status: res.status, headers: res.headers, body: await res.text() };
  } catch (err) {
    return { ok: false, error: String(err.message || err) };
  }
}

/**
 * Strip HTML comments before any regex looks at the markup.
 *
 * Requirement: a grade must describe what a browser or crawler sees.
 * Why: a regex has no idea it is inside a comment, and a `<head>` full of
 *   documentation comments routinely contains meta-tag literals. see-veo has an
 *   explanatory comment reading `... so <meta name="description">, the Open
 *   Graph copy below ...` fifteen lines above the real tag — `tagContent` below
 *   matched THAT, found no `content` attribute, and reported the description as
 *   empty. It is not: a compliant parser sees exactly one description meta with
 *   the correct copy. This audit reported a defect that did not exist, and the
 *   downstream repo was "fixed" for it.
 * Alternatives:
 *   - Parse with a real HTML parser: correct, and the right answer if this
 *     grows. Rejected for now — it is one dependency for one line, and stripping
 *     comments removes the entire failure mode these regexes have.
 *   - Negative lookbehind per pattern: rejected, unreadable and easy to forget
 *     on the next check added.
 */
const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');

const tagContent = (html, prop) => {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*>`, 'i'));
  if (!m) return null;
  return m[0].match(/content=["']([^"']*)["']/i)?.[1] ?? '';
};

const titlesIn = (html) => (html.match(/<title[^>]*>[\s\S]*?<\/title>/gi) ?? []).length;
const firstTitle = (html) => html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '';

/**
 * Readable characters in <body>, scripts and styles removed.
 *
 * Shared by the home document and the sampled item page, because "does this URL
 * say anything" is the same question at both — and asking it only of the home
 * page mis-grades a whole shape of site. dm-website's landings are app shells by
 * design while its posts and case studies carry real text; measuring the home
 * page alone reported it as having no crawlable content when twelve of its
 * pages had just been given some.
 */
function bodyTextLength(html) {
  const inner = html.match(/<body[\s\S]*?>([\s\S]*)<\/body>/i)?.[1] ?? '';
  return inner
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().length;
}

/**
 * Fetch one item page named by the sitemap and report only what differs from
 * the home document. Returns null when there is nothing to check — no sitemap,
 * or a sitemap listing only the home URL — which is not itself a fault here;
 * the missing sitemap is already graded.
 */
async function measureItem(sitemap, homeUrl) {
  if (!sitemap.ok || sitemap.status !== 200) return null;
  const locs = [...sitemap.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
  const home = new URL(homeUrl).href.replace(/\/$/, '');
  const candidates = locs.filter((l) => l.replace(/\/$/, '') !== home);
  if (!candidates.length) return null;

  // Prefer the DEEPEST path, not the first listed.
  //
  // Item pages live under their collection — /blog/<slug>, /case-studies/<slug>
  // — while the shallow entries are section landings. Sitemaps are usually
  // written breadth-first, so "first non-home entry" reliably picks a landing
  // and never sees an item at all. dm-website is the worked example: its first
  // non-home <loc> is /vibe-rescue, and sampling that reported "no crawlable
  // body text" while twelve posts and case studies underneath it carried
  // thousands of characters each.
  //
  // Deepest is the right bias for what this sample is FOR: item pages are the
  // ones assembled per-request or per-build from a shell, which is where the
  // failures this audit hunts actually live. A landing that a human wrote is
  // the least interesting page on any of these origins.
  // Among equally deep candidates, take the LAST listed. Sitemap generators
  // emit static routes first and append the dynamic collections, so the tail is
  // where the generated item pages are. Depth alone was not enough on
  // dm-website: /legal/terms is also two segments deep and is a hand-written
  // page, so "first of the deepest" picked that and still missed every post.
  const depth = (u) => new URL(u).pathname.replace(/\/+$/, '').split('/').filter(Boolean).length;
  const target = candidates.reduce((best, l) => (depth(l) >= depth(best) ? l : best), candidates[0]);

  const res = await get(target);
  if (!res.ok || res.status !== 200) return { url: target, error: res.error ?? `HTTP ${res.status}` };

  const html = stripComments(res.body);
  return {
    url: target,
    titleCount: titlesIn(html),
    title: firstTitle(html),
    canonical: html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ?? null,
    bodyTextLen: bodyTextLength(html),
  };
}

/** Everything the grade is computed from, so a surprising grade can be read back. */
async function measure(url) {
  const home = await get(url);
  if (!home.ok) return { error: home.error };

  const html = stripComments(home.body);

  const robots = await get(new URL('robots.txt', url).href);
  const sitemap = await get(new URL('sitemap.xml', url).href);

  // Requirement: the home document is not the whole site, and the failures this
  //   audit hunts are MORE likely on item pages — they are the ones assembled by
  //   a prerenderer or an edge rewriter, from a shell nobody looks at.
  // Approach: take the first non-home <loc> the sitemap already gave us and
  //   fetch that one too. One extra request per origin, no new configuration,
  //   and it self-maintains — a new item type joins as soon as it is listed.
  // Why only one: this is a periodic check against sixteen third-party hosts,
  //   not a crawler. One item proves the mechanism; the repo's own tripwire is
  //   what covers every item (gp-props' verify:seo does exactly that split).
  const item = await measureItem(sitemap, url);

  return {
    item,
    // A robots.txt that 200s with the app's HTML is the SPA-rewrite trap: the
    // file does not exist and the catch-all answered for it.
    robotsServed: robots.ok && robots.status === 200 && !/<html|<!doctype/i.test(robots.body.slice(0, 400)),
    // The 400-char window this used to look in was too small and produced a
    // false "missing sitemap" for model-pear, whose sitemap opens with an
    // explanatory comment — the root element starts at ~430. Strip comments and
    // look at the whole document instead of guessing how much prologue is
    // reasonable. Still anchored to the ROOT ELEMENT, not to the word
    // "sitemap", so an SPA fallback serving HTML at 200 still fails.
    sitemapServed: sitemap.ok && sitemap.status === 200
      && /<urlset|<sitemapindex/i.test(stripComments(sitemap.body)),
    canonical: /<link[^>]+rel=["']canonical["']/i.test(html),
    og: Boolean(tagContent(html, 'og:title')) && Boolean(tagContent(html, 'og:image')),
    twitter: Boolean(tagContent(html, 'twitter:card')),
    jsonld: /<script[^>]+type=["']application\/ld\+json["']/i.test(html),
    // Either lever counts: a meta tag cannot express a per-route posture on a
    // single-index.html SPA, which is why the header exists.
    noindex: /<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html)
      || /noindex/i.test(home.headers.get('x-robots-tag') || ''),
    bodyTextLen: bodyTextLength(html),
    // Requirement: catch a page with no title on the next scheduled run rather
    //   than by luck.
    // Why this is counted rather than merely tested for presence, and why it is
    //   counted on the COMMENT-STRIPPED html: model-pear served three
    //   prerendered pages with zero titles for a day. Its shell template named
    //   the framework's head placeholder inside a comment, so the whole injected
    //   head — title and modulepreloads — was substituted BETWEEN the comment
    //   markers. `curl | grep '<title>'` found a title the entire time, because
    //   grep does not know what a comment is. Only stripping first shows it.
    //   Counting also catches the opposite defect: a shell that carries its own
    //   <title> alongside the route's, where the shell's wins.
    titleCount: titlesIn(html),
    title: firstTitle(html),
  };
}

/**
 * What is wrong on the one item page we sampled, if anything.
 *
 * Deliberately narrow: only faults an item page can have that the home page
 * cannot, so this never double-reports something already graded above.
 *  - a title fault (same rules as home — this is where shell-shadowing lands);
 *  - a title IDENTICAL to the home page's, which means the per-item mechanism
 *    is not running and every item is competing for the same search result;
 *  - a canonical pointing at the home page, which collapses the whole
 *    collection onto one URL — the worst of the four, and invisible from the
 *    home document.
 */
function itemFault(m) {
  const it = m.item;
  if (!it) return null;
  const where = it.url.replace(/^https?:\/\/[^/]+/, '');
  if (it.error) return `sitemap lists ${where} but it does not serve (${it.error})`;

  if (it.titleCount === 0) return `item ${where} has no <title>`;
  if (it.titleCount > 1) return `item ${where} has ${it.titleCount} <title> tags`;
  if (!it.title) return `item ${where} has an empty <title>`;
  if (m.title && it.title === m.title) {
    return `item ${where} reuses the home page's <title> — the per-item mechanism is not running`;
  }
  // Only the unambiguous collapse is flagged: a canonical that resolves to the
  // site ROOT from a page that is not the root. That is the SPA default —
  // one static canonical in one template — and it tells search engines the
  // whole collection is a single page.
  if (it.canonical) {
    const resolved = new URL(it.canonical, it.url).href.replace(/\/$/, '');
    const root = new URL('/', it.url).href.replace(/\/$/, '');
    if (resolved === root) return `item ${where} canonicalises to the site root`;
  }
  return null;
}

// The criteria from docs/TODO.md, in code. Kept in this order so the reason for
// a grade is the first rule that matched.
function grade(m) {
  if (m.error) return { grade: '?', why: `unreachable: ${m.error}` };

  // The title fault is checked before the posture split, because it is the one
  // defect that is wrong under EVERY posture: a private app's links still
  // unfurl, and the title is what the recipient reads.
  const titleFault = m.titleCount === 0
    ? 'no <title> (none survives comment-stripping)'
    : m.titleCount > 1
      ? `${m.titleCount} <title> tags — the first wins, so the page's own may never show`
      : m.title.length === 0
        ? 'an empty <title>'
        : null;

  if (m.noindex) {
    // Private posture: no search result to enrich, so structured data and a
    // sitemap are not expected. What IS expected is that the crawl is allowed
    // (so the noindex can be read) and that links still unfurl.
    const priv = [titleFault, itemFault(m)].filter(Boolean);
    if (priv.length) return { grade: 'Partial', why: `private posture with ${priv.join('; ')}` };
    return m.robotsServed && m.og
      ? { grade: 'Pass (P)', why: 'private posture: crawl allowed, noindex carried, links unfurl' }
      : { grade: 'Partial', why: 'private posture with ' + (m.robotsServed ? 'no link preview' : 'no reachable robots.txt') };
  }

  const missing = [];
  // Observations that are NOT gaps but must not vanish — a grade that hides how
  // it was reached is the thing this script exists to replace.
  const notes = [];
  if (!m.robotsServed) missing.push('robots.txt');
  if (!m.sitemapServed) missing.push('sitemap');
  if (!m.canonical) missing.push('canonical');
  if (!m.og || !m.twitter) missing.push('open graph');
  if (!m.jsonld) missing.push('structured data');
  // Head tags over an empty mount point make a link preview well and a page
  // indexable not at all — the distinction the pattern calls unfurl-only.
  //
  // Judged across BOTH sampled pages, not the home document alone. Some sites
  // legitimately have a shell for a landing page and their substance at item
  // URLs: dm-website's /blog and /case-studies are navigation, while each post
  // and case study carries real text. Grading only the home page called that
  // "missing crawlable body text" at the moment twelve of its pages had just
  // been given some.
  //
  // This is deliberately NOT a loosening. The gap is still reported when
  // NOTHING sampled says anything — which is the actual defect, a site that is
  // indexable for nothing but its description. What changes is that a shell
  // landing over rich item pages is described accurately instead of being
  // called broken. And because "accurate" must not mean "silent", the shell is
  // still named in the reason line.
  const itemBodyLen = m.item && !m.item.error ? m.item.bodyTextLen : null;
  if (m.bodyTextLen === 0 && !itemBodyLen) {
    missing.push('crawlable body text');
  } else if (m.bodyTextLen === 0) {
    notes.push(`landing page is a shell (item page carries ${itemBodyLen} chars)`);
  }

  // A title fault is phrased on its own — it is a broken tag, not an absent
  // feature, and folding it into "missing …" reads as nonsense. Item-page
  // faults are appended the same way: they are real defects on real URLs, and
  // burying them in the home page's list would misattribute them.
  const faults = [titleFault, itemFault(m)].filter(Boolean);
  const why = (base) => [base, ...faults, ...notes].filter(Boolean).join('; ');

  if (missing.length === 0) {
    return faults.length
      ? { grade: 'Partial', why: [...faults, ...notes].join('; ') }
      : { grade: 'Pass', why: notes.length ? `complete; ${notes.join('; ')}` : 'complete' };
  }
  if (!m.og && !m.robotsServed && !m.canonical && !m.sitemapServed) {
    return { grade: 'Missing', why: why('no open graph, robots.txt, canonical or sitemap') };
  }
  return { grade: 'Partial', why: why(`missing ${missing.join(', ')}`) };
}

/** The DISCOVERABILITY cell docs/TODO.md currently claims, per repo. */
function claimedGrades() {
  const lines = readFileSync(TODO, 'utf8').split('\n');
  const start = lines.findIndex((l) => l.startsWith('| Repo |'));
  if (start === -1) throw new Error('Gap Matrix header not found in docs/TODO.md');
  const header = lines[start].split('|').slice(1, -1).map((c) => c.trim());
  const col = header.indexOf('DISCOVERABILITY');
  if (col === -1) throw new Error('No DISCOVERABILITY column in the Gap Matrix');
  const claimed = new Map();
  for (let i = start + 2; i < lines.length && lines[i].startsWith('|'); i++) {
    const cells = lines[i].split('|').slice(1, -1).map((c) => c.trim());
    claimed.set(cells[0], cells[col]);
  }
  return claimed;
}

const sites = origins();
const results = [];
for (const [name, url, declaration] of sites) {
  const naReason = declaredNotApplicable(declaration);
  const m = await measure(url);
  if (naReason) {
    // Still measured, deliberately. A declaration that has outlived its premise
    // is the failure every other column in this matrix already demonstrates —
    // so if a "nothing to find here" origin starts carrying the marks of a
    // public site, the run says so instead of quietly honouring a stale note.
    const looksPublic = [
      m.og && 'open graph',
      m.sitemapServed && 'a sitemap',
      m.bodyTextLen > 200 && `${m.bodyTextLen} chars of body text`,
    ].filter(Boolean);
    const why = looksPublic.length
      ? `${naReason} — BUT it now serves ${looksPublic.join(', ')}; revisit the declaration`
      : naReason;
    results.push({ name, url, grade: 'N/A', why, declared: true, measured: m });
    process.stderr.write(`. ${name} (declared N/A)\n`);
    continue;
  }
  results.push({ name, url, ...grade(m), measured: m });
  process.stderr.write(`. ${name}\n`);
}

if (AS_JSON) {
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

console.log('\nDISCOVERABILITY — measured against the deployed origins\n');
for (const r of results) {
  console.log(`  ${r.name.padEnd(16)} ${r.grade.padEnd(10)} ${r.why}`);
}

if (!CHECK) {
  console.log('\nColumn cells for the Gap Matrix:\n');
  for (const r of results) console.log(`  ${r.name.padEnd(16)} | ${r.grade} |`);
  console.log('\nRun with --check to compare against what docs/TODO.md claims.');
  process.exit(0);
}

const claimed = claimedGrades();
const drift = [];
for (const r of results) {
  const was = claimed.get(r.name);
  if (was === undefined) {
    drift.push(`${r.name}: measured ${r.grade}, but the repo has no row in the Gap Matrix`);
  } else if (was !== r.grade) {
    drift.push(`${r.name}: matrix says ${was}, measured ${r.grade} — ${r.why}`);
  }
}
for (const name of claimed.keys()) {
  if (!results.some((r) => r.name === name)) {
    drift.push(`${name}: in the Gap Matrix but not measured (no mirrored meta.json with a live URL)`);
  }
}

if (drift.length) {
  console.error(`\n✗ the matrix and the live sites disagree (${drift.length}):`);
  for (const d of drift) console.error(`  • ${d}`);
  console.error('\nUpdate the DISCOVERABILITY column in docs/TODO.md, or fix the site.');
  process.exit(1);
}
console.log(`\n✓ the DISCOVERABILITY column matches all ${results.length} live origins`);
