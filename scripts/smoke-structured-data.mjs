#!/usr/bin/env node
// Requirement: prove the JSON-LD block is correct on the pages a crawler
//   actually loads — including the ?name= forms, where the item node is written
//   at runtime by src/seoMeta.js.
// Approach: serve dist/ under the real base (root, since the Vercel move) and
//   drive it in headless Chromium, reading the DOM after the page settles.
// Why a browser and not a static check over dist/: verify:seo can only see what
//   the build wrote. Half of this feature runs in the browser, and the failure
//   it guards against — seoMeta.js appending a SECOND block instead of rewriting
//   the one already there — is invisible in dist/ and looks fine in source.
// Why not jsdom: it disagreed with real Chromium on event behaviour earlier in
//   this repo's history and produced a confident, wrong conclusion. A check that
//   can be wrong in the reassuring direction is worse than no check.
//
// This script FAILS when it cannot run. It does not skip. A tripwire that
// quietly opts out when its dependency is missing reports green on an untested
// build, which is the defect this repo has flagged in other repos' suites.
//
// Run: npm run build && npm run smoke:seo

import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, extname, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SITE } from '../src/lib/structuredData.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const BASE_PATH = '/';
const PORT = 8123;
const ORIGIN = `http://localhost:${PORT}${BASE_PATH}`;

const failures = [];
const fail = (msg) => failures.push(msg);

if (!existsSync(DIST)) {
  console.error('✗ dist/ not found — run `npm run build` first.');
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error(
    '✗ playwright is not installed. This check drives a real browser by design;\n' +
    '  see the header comment for why it must not silently skip.\n' +
    '  Install with: npm install',
  );
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon',
};

// Static file server rooted at dist/, mounted at the site's real base path —
// serving at "/" instead would 404 every base-absolute asset while the SSG'd
// markup still rendered, which reads as a pass. That false green happened here.
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (!url.pathname.startsWith(BASE_PATH)) {
    res.writeHead(404).end('not found');
    return;
  }
  let rel = url.pathname.slice(BASE_PATH.length);
  if (rel === '' || rel.endsWith('/')) rel += 'index.html';
  const file = join(DIST, rel);
  if (!file.startsWith(DIST) || !existsSync(file)) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
  res.end(await readFile(file));
});

await new Promise((r) => server.listen(PORT, r));

const browser = await chromium.launch(
  existsSync('/opt/pw-browsers/chromium')
    ? { executablePath: '/opt/pw-browsers/chromium' }
    : {},
);
const page = await browser.newPage();
const pageErrors = [];
page.on('pageerror', (err) => pageErrors.push(String(err)));

async function read(url) {
  await page.goto(url, { waitUntil: 'networkidle' });
  return page.evaluate(() => {
    const blocks = document.querySelectorAll('script[type="application/ld+json"]');
    return {
      title: document.title,
      ogTitle: document.querySelector('meta[property="og:title"]')?.content ?? null,
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
      blockCount: blocks.length,
      raw: blocks[0]?.textContent ?? null,
    };
  });
}

function checkGraph(label, state, { expectItemId, expectType }) {
  if (state.blockCount !== 1) {
    fail(`${label}: expected exactly 1 JSON-LD block, found ${state.blockCount}`);
    return;
  }
  let graph;
  try {
    graph = JSON.parse(state.raw);
  } catch (err) {
    fail(`${label}: JSON-LD does not parse in the browser — ${err.message}`);
    return;
  }
  const nodes = graph['@graph'] ?? [];
  const ids = nodes.map((n) => n['@id']);
  for (const required of [`${SITE}#org`, `${SITE}#website`]) {
    if (!ids.includes(required)) fail(`${label}: missing the ${required} node`);
  }
  if (expectItemId) {
    const item = nodes.find((n) => n['@id'] === expectItemId);
    if (!item) {
      fail(`${label}: no item node — expected ${expectItemId}, got ${ids.join(', ')}`);
    } else if (item['@type'] !== expectType) {
      fail(`${label}: item node is ${item['@type']}, expected ${expectType}`);
    } else if (item.url !== expectItemId.replace(/#item$/, '')) {
      fail(`${label}: item node url is ${item.url}, expected the canonical URL`);
    }
  } else if (nodes.length !== 2) {
    fail(`${label}: expected only the 2 site nodes, found ${nodes.length}`);
  }
  if (state.title !== state.ogTitle) {
    fail(`${label}: <title> ("${state.title}") does not match og:title ("${state.ogTitle}")`);
  }
}

// One of each page shape. Which pattern and project is arbitrary — the shapes
// are what differ, and every item of a shape goes through the same code path.
const PATTERN = 'timer-leaks';
const PROJECT = 'graphiki';

// The legacy query-parameter forms: nothing is in the built file, so a pass
// here is entirely seoMeta.js doing its job.
checkGraph(
  `pattern.html?name=${PATTERN}`,
  await read(`${ORIGIN}pattern.html?name=${PATTERN}`),
  { expectItemId: `${SITE}patterns/${PATTERN}/#item`, expectType: 'TechArticle' },
);
checkGraph(
  `project.html?name=${PROJECT}`,
  await read(`${ORIGIN}project.html?name=${PROJECT}`),
  { expectItemId: `${SITE}projects/${PROJECT}/#item`, expectType: 'SoftwareApplication' },
);

// The prerendered clean URLs: the node is already in the file AND seoMeta.js
// runs. Exactly one block afterwards is the property that matters — this is the
// case a static check cannot see.
checkGraph(
  `patterns/${PATTERN}/`,
  await read(`${ORIGIN}patterns/${PATTERN}/`),
  { expectItemId: `${SITE}patterns/${PATTERN}/#item`, expectType: 'TechArticle' },
);
checkGraph(
  `projects/${PROJECT}/`,
  await read(`${ORIGIN}projects/${PROJECT}/`),
  { expectItemId: `${SITE}projects/${PROJECT}/#item`, expectType: 'SoftwareApplication' },
);

// The landing page claims no item and nothing should give it one.
checkGraph(ORIGIN, await read(ORIGIN), {});

if (pageErrors.length) {
  fail(`page errors on the checked routes:\n    ${pageErrors.join('\n    ')}`);
}

await browser.close();
server.close();

if (failures.length) {
  console.error(`✗ structured-data smoke failed (${failures.length}):`);
  for (const f of failures) console.error(`  • ${f}`);
  process.exit(1);
}
console.log('✓ structured-data smoke: 5 routes, one graph each, item nodes and titles correct');
