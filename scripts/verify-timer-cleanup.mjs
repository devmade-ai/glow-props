#!/usr/bin/env node
// Tripwire: verify timer/listener cleanup hygiene against docs/implementations/TIMER_LEAKS.md.
//
// Approach: static check that every glow-props script registering timers, intervals,
// listeners, or subscriptions exposes a documented teardown path:
//   - Plain modules under src/ (.js — the lib singletons) that register at module
//     level must declare import.meta.hot.dispose() so HMR doesn't accumulate
//     stale listeners.
//   - React files (.jsx) put registrations inside effects whose cleanup a static
//     grep can't follow — the checkable contract is PAIRING: every
//     addEventListener needs a removeEventListener in the same file, every
//     setTimeout a clearTimeout, every setInterval a clearInterval, every
//     IntersectionObserver a disconnect, every requestAnimationFrame a
//     cancelAnimationFrame.
//   - Static-asset scripts under public/ (no HMR) must expose a window.__<name>
//     object with a dispose() so tests, manual re-init, and future SSR can release
//     listeners deterministically.
//   - Inline <script> blocks in the HTML entry points and partials are checked
//     PER BLOCK: each must register listeners through an AbortController
//     signal, expose the window.__<name> dispose shape, or attach behind a
//     window.__<name>Attached guard; and any setTimeout/setInterval must have
//     a paired clear in the same block.
//
// Run: node scripts/verify-timer-cleanup.mjs
// Wired into package.json as `npm run verify:timer-cleanup`.
//
// This is a heuristic, not a full analyzer — it greps for the registration verbs and
// requires a corresponding teardown anchor in the same file. False positives are
// acceptable (override by adding the anchor as a code comment if a file genuinely
// has no module-level registrations); false negatives are not.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const ROOT = dirname(dirname(__filename));

const REGISTRATION = /\b(setTimeout|setInterval|requestAnimationFrame)\s*\(|\.addEventListener\s*\(|\.subscribe\s*\(|\bnew IntersectionObserver\s*\(/;
const VITE_DISPOSE = /\bimport\.meta\.hot\.dispose\s*\(/;
const GLOBAL_DISPOSE = /window\.__\w+\s*=\s*\{[\s\S]*?\bdispose\b/;
const ATTACH_GUARD = /window\.__\w+Attached/;

function readUtf8(path) {
  return readFileSync(path, 'utf8');
}

function listJsFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      out.push(...listJsFiles(path));
    } else if (name.endsWith('.js') || name.endsWith('.mjs') || name.endsWith('.jsx')) {
      out.push(path);
    }
  }
  return out;
}

// Pairing rules for React files: registration verb → required release verb.
const PAIRS = [
  [/\.addEventListener\s*\(/, /\.removeEventListener\s*\(/, 'addEventListener without removeEventListener'],
  [/\bsetTimeout\s*\(/, /\bclearTimeout\s*\(/, 'setTimeout without clearTimeout'],
  [/\bsetInterval\s*\(/, /\bclearInterval\s*\(/, 'setInterval without clearInterval'],
  [/\bnew IntersectionObserver\s*\(/, /\.disconnect\s*\(/, 'IntersectionObserver without disconnect'],
  [/\brequestAnimationFrame\s*\(/, /\bcancelAnimationFrame\s*\(/, 'requestAnimationFrame without cancelAnimationFrame'],
];

// Inline scripts only — <script src=...> bodies are empty and external files are
// covered by the src/ and public/ walks. Returned as SEPARATE blocks: each
// inline script is its own scope-of-trust, and joining them let a guard in one
// block vouch for an unguarded listener in another (that blind spot is where a
// fault-injected leak sailed through).
function inlineScripts(html) {
  const blocks = [];
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) blocks.push(m[1]);
  return blocks;
}

const failures = [];

for (const file of listJsFiles(join(ROOT, 'src'))) {
  const content = readUtf8(file);
  // React files (components, hooks) register inside effects — the pairing rule
  // applies. Anything importing react counts, .jsx or not.
  const isReactFile = file.endsWith('.jsx') || /from 'react'/.test(content);
  if (isReactFile) {
    for (const [register, release, message] of PAIRS) {
      if (register.test(content) && !release.test(content)) {
        failures.push(`${file}: ${message} in the same file — effects must release what they register`);
      }
    }
  } else if (REGISTRATION.test(content) && !VITE_DISPOSE.test(content)) {
    failures.push(`${file}: uses setTimeout/setInterval/addEventListener/subscribe at module level but has no import.meta.hot.dispose() block`);
  }
}

// Every static-asset script, not just theme.js — a future public/analytics.js
// with listeners must not slip past unchecked.
for (const file of listJsFiles(join(ROOT, 'public'))) {
  const content = readUtf8(file);
  if (REGISTRATION.test(content) && !GLOBAL_DISPOSE.test(content)) {
    failures.push(`${file}: registers listeners/timers but does not expose a window.__<name> object with dispose()`);
  }
}

// HTML entry points and partials carry inline scripts that used to be invisible
// to this check — that blind spot is where every audited leak lived.
const htmlFiles = ['index.html', 'pattern.html', 'project.html']
  .map((f) => join(ROOT, f))
  .concat(
    existsSync(join(ROOT, 'partials'))
      ? readdirSync(join(ROOT, 'partials')).filter((f) => f.endsWith('.html')).map((f) => join(ROOT, 'partials', f))
      : [],
  );

for (const file of htmlFiles) {
  const blocks = inlineScripts(readUtf8(file));
  blocks.forEach((script, i) => {
    const where = `${file} (inline script #${i + 1})`;
    if (/\.addEventListener\s*\(/.test(script)) {
      const hasSignal = /\{\s*signal\b/.test(script) || /signal\s*:/.test(script);
      if (!hasSignal && !GLOBAL_DISPOSE.test(script) && !ATTACH_GUARD.test(script)) {
        failures.push(`${where}: adds listeners with no AbortController signal, window.__<name> dispose, or window.__<name>Attached guard`);
      }
    }
    if (/\bsetTimeout\s*\(/.test(script) && !/\bclearTimeout\s*\(/.test(script)) {
      failures.push(`${where}: sets a timeout with no clearTimeout in the same script block`);
    }
    if (/\bsetInterval\s*\(/.test(script) && !/\bclearInterval\s*\(/.test(script)) {
      failures.push(`${where}: sets an interval with no clearInterval in the same script block`);
    }
  });
}

if (failures.length) {
  console.error('TIMER_LEAKS tripwire — failures:');
  for (const f of failures) console.error('  -', f);
  console.error('\nSee docs/implementations/TIMER_LEAKS.md for required cleanup variants.');
  process.exit(1);
}
console.log('TIMER_LEAKS tripwire: OK');
