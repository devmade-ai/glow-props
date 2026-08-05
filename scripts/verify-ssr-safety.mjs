#!/usr/bin/env node
// Tripwire: the SSR/SSG entry must never reach the PWA singleton.
//
// Requirement: src/entry-server.jsx is ssrLoadModule'd by prerenderPages() in
//   vite.config.js during the build. src/lib/pwa.js registers the service
//   worker AT IMPORT TIME and imports `virtual:pwa-register`, which only
//   resolves inside the full vite-plugin-pwa pipeline — not in the nested SSG
//   server. Importing it from the server graph fails deep in the prerender
//   pass with an error that points at the virtual module, not at the real
//   cause.
// Why a script and not a comment: today the invariant is enforced only by
//   comments in entry-server.jsx and PwaManager.jsx. A DIRECT import would at
//   least fail loudly at build time; an INDIRECT one — someone adds
//   `import { getPwaState } from '../lib/pwa.js'` to a shared component that
//   the server entry already renders — fails confusingly and only once the
//   prerender runs. This walks the actual import graph so either shape is
//   caught at the source, naming the offending chain.
// Alternatives:
//   - Trust the build to fail: rejected, the error is misleading and arrives
//     late; and PWA_SYSTEM.md's SSR section names this as the invariant most
//     worth tripwiring.
//   - Full bundler-accurate resolution: rejected, overkill. Relative specifiers
//     are what the rule is about, and that is what this resolves.
//
// Run: node scripts/verify-ssr-safety.mjs   (npm run verify:ssr-safety)

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY = resolve(ROOT, 'src/entry-server.jsx');

// Modules the server graph must never pull in, and why.
const FORBIDDEN = [
  ['src/lib/pwa.js', 'registers the service worker on import and needs virtual:pwa-register'],
  ['src/lib/debugLog.js', 'DEV-only debug subsystem — must stay out of the server and prod graphs'],
];

const EXTENSIONS = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx'];

function resolveSpecifier(specifier, fromFile) {
  if (!specifier.startsWith('.')) return null; // bare/virtual — not ours to follow
  const base = resolve(dirname(fromFile), specifier);
  for (const ext of EXTENSIONS) {
    const candidate = base + ext;
    if (existsSync(candidate) && !candidate.endsWith('/')) return candidate;
  }
  return null;
}

function importsOf(file) {
  const src = readFileSync(file, 'utf8');
  const specifiers = [];
  // static `import ... from '...'`, side-effect `import '...'`, and dynamic import('...')
  const patterns = [
    /import\s+[^'"]*?from\s*['"]([^'"]+)['"]/g,
    /import\s*['"]([^'"]+)['"]/g,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(src)) !== null) specifiers.push(m[1]);
  }
  return specifiers;
}

const failures = [];

if (!existsSync(ENTRY)) {
  console.error(`SSR safety tripwire — ${relative(ROOT, ENTRY)} not found.`);
  process.exit(1);
}

// Breadth-first walk of the server entry's relative import graph, keeping the
// chain so a violation reports HOW the server entry reaches the forbidden file.
const seen = new Set([ENTRY]);
const queue = [[ENTRY, [relative(ROOT, ENTRY)]]];

while (queue.length) {
  const [file, chain] = queue.shift();
  for (const specifier of importsOf(file)) {
    const target = resolveSpecifier(specifier, file);
    if (!target || seen.has(target)) continue;
    seen.add(target);
    const rel = relative(ROOT, target).split('\\').join('/');
    const nextChain = [...chain, rel];

    const hit = FORBIDDEN.find(([path]) => path === rel);
    if (hit) {
      failures.push(`${hit[0]} is reachable from the SSR entry — ${hit[1]}\n      chain: ${nextChain.join(' -> ')}`);
      continue; // reported; no need to walk into it
    }
    queue.push([target, nextChain]);
  }
}

if (failures.length) {
  console.error('SSR safety tripwire — failures:');
  for (const f of failures) console.error('  -', f);
  console.error('\nThe SSG pass ssrLoadModule()s src/entry-server.jsx. Keep client-only');
  console.error('modules behind PwaContext/props instead of importing them there.');
  console.error('See docs/implementations/PWA_SYSTEM.md, "SSR / prerendered (SSG) apps".');
  process.exit(1);
}

console.log(`SSR safety tripwire: OK (${seen.size} modules reachable from the SSR entry, none forbidden)`);
