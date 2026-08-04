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

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SITE } from '../src/lib/structuredData.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS_DIR = join(ROOT, 'public', 'projects');
const TODO = join(ROOT, 'docs', 'TODO.md');

const CHECK = process.argv.includes('--check');
const AS_JSON = process.argv.includes('--json');

// Identify as a crawler: if any host varies its response for one, the crawler
// view is the one being graded.
const UA = 'Mozilla/5.0 (compatible; devmade-audit/1.0; +https://devmade.app)';
const TIMEOUT_MS = 20000;

// Origins come from the mirrored project metadata, not a list in this file —
// a project added to the portfolio joins the audit without anyone remembering
// to. glow-props is not among its own mirrors, so it is named explicitly.
function origins() {
  const found = [['glow-props', SITE]];
  for (const slug of readdirSync(PROJECTS_DIR).sort()) {
    const metaPath = join(PROJECTS_DIR, slug, 'meta.json');
    if (!existsSync(metaPath)) continue;
    const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
    const url = meta.liveUrl || meta.url;
    // No live URL is not a gap — canva-grid-assets is a CDN bucket with nothing
    // to discover. Silently skipping would hide a genuinely missing one, so the
    // caller is told.
    if (!url) {
      console.error(`  (skipped ${slug}: no liveUrl in meta.json)`);
      continue;
    }
    found.push([slug, url]);
  }
  return found;
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

const tagContent = (html, prop) => {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*>`, 'i'));
  if (!m) return null;
  return m[0].match(/content=["']([^"']*)["']/i)?.[1] ?? '';
};

/** Everything the grade is computed from, so a surprising grade can be read back. */
async function measure(url) {
  const home = await get(url);
  if (!home.ok) return { error: home.error };

  const html = home.body;
  const inner = html.match(/<body[\s\S]*?>([\s\S]*)<\/body>/i)?.[1] ?? '';
  const bodyText = inner
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const robots = await get(new URL('robots.txt', url).href);
  const sitemap = await get(new URL('sitemap.xml', url).href);

  return {
    // A robots.txt that 200s with the app's HTML is the SPA-rewrite trap: the
    // file does not exist and the catch-all answered for it.
    robotsServed: robots.ok && robots.status === 200 && !/<html|<!doctype/i.test(robots.body.slice(0, 400)),
    sitemapServed: sitemap.ok && sitemap.status === 200 && /<urlset|<sitemapindex/i.test(sitemap.body.slice(0, 400)),
    canonical: /<link[^>]+rel=["']canonical["']/i.test(html),
    og: Boolean(tagContent(html, 'og:title')) && Boolean(tagContent(html, 'og:image')),
    twitter: Boolean(tagContent(html, 'twitter:card')),
    jsonld: /<script[^>]+type=["']application\/ld\+json["']/i.test(html),
    // Either lever counts: a meta tag cannot express a per-route posture on a
    // single-index.html SPA, which is why the header exists.
    noindex: /<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html)
      || /noindex/i.test(home.headers.get('x-robots-tag') || ''),
    bodyTextLen: bodyText.length,
  };
}

// The criteria from docs/TODO.md, in code. Kept in this order so the reason for
// a grade is the first rule that matched.
function grade(m) {
  if (m.error) return { grade: '?', why: `unreachable: ${m.error}` };

  if (m.noindex) {
    // Private posture: no search result to enrich, so structured data and a
    // sitemap are not expected. What IS expected is that the crawl is allowed
    // (so the noindex can be read) and that links still unfurl.
    return m.robotsServed && m.og
      ? { grade: 'Pass (P)', why: 'private posture: crawl allowed, noindex carried, links unfurl' }
      : { grade: 'Partial', why: 'private posture with ' + (m.robotsServed ? 'no link preview' : 'no reachable robots.txt') };
  }

  const missing = [];
  if (!m.robotsServed) missing.push('robots.txt');
  if (!m.sitemapServed) missing.push('sitemap');
  if (!m.canonical) missing.push('canonical');
  if (!m.og || !m.twitter) missing.push('open graph');
  if (!m.jsonld) missing.push('structured data');
  // Head tags over an empty mount point make a link preview well and a page
  // indexable not at all — the distinction the pattern calls unfurl-only.
  if (m.bodyTextLen === 0) missing.push('crawlable body text');

  if (missing.length === 0) return { grade: 'Pass', why: 'complete' };
  if (!m.og && !m.robotsServed && !m.canonical && !m.sitemapServed) {
    return { grade: 'Missing', why: 'no open graph, robots.txt, canonical or sitemap' };
  }
  return { grade: 'Partial', why: `missing ${missing.join(', ')}` };
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
for (const [name, url] of sites) {
  const m = await measure(url);
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
