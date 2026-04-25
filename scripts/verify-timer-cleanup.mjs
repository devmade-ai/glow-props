#!/usr/bin/env node
// Tripwire: verify timer/listener cleanup hygiene against docs/implementations/TIMER_LEAKS.md.
//
// Approach: static check that every glow-props module registering timers, intervals,
// listeners, or subscriptions exposes a documented teardown path:
//   - Files under src/ ship through Vite's module graph and must declare
//     import.meta.hot.dispose() so HMR doesn't accumulate stale listeners.
//   - public/theme.js is a static-asset script (no HMR), so its IIFE must expose
//     window.__theme.dispose() so tests, manual re-init, and future SSR can release
//     listeners deterministically.
//
// Run: node scripts/verify-timer-cleanup.mjs
// Wired into package.json as `npm run verify:timer-cleanup`.
//
// This is a heuristic, not a full analyzer — it greps for the registration verbs and
// requires a corresponding teardown anchor in the same file. False positives are
// acceptable (override by adding the anchor as a code comment if a file genuinely
// has no module-level registrations); false negatives are not.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const ROOT = dirname(dirname(__filename));

const REGISTRATION = /\b(setTimeout|setInterval)\s*\(|\.addEventListener\s*\(|\.subscribe\s*\(/;
const VITE_DISPOSE = /\bimport\.meta\.hot\.dispose\s*\(/;
const THEME_DISPOSE = /window\.__theme\s*=\s*\{[^}]*\bdispose\b/;

function readUtf8(path) {
  return readFileSync(path, 'utf8');
}

function listJsFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      out.push(...listJsFiles(path));
    } else if (name.endsWith('.js') || name.endsWith('.mjs')) {
      out.push(path);
    }
  }
  return out;
}

const failures = [];

for (const file of listJsFiles(join(ROOT, 'src'))) {
  const content = readUtf8(file);
  if (REGISTRATION.test(content) && !VITE_DISPOSE.test(content)) {
    failures.push(`${file}: uses setTimeout/setInterval/addEventListener/subscribe but has no import.meta.hot.dispose() block`);
  }
}

const themePath = join(ROOT, 'public', 'theme.js');
const themeContent = readUtf8(themePath);
if (REGISTRATION.test(themeContent) && !THEME_DISPOSE.test(themeContent)) {
  failures.push(`${themePath}: registers listeners but does not expose window.__theme.dispose()`);
}

if (failures.length) {
  console.error('TIMER_LEAKS tripwire — failures:');
  for (const f of failures) console.error('  -', f);
  console.error('\nSee docs/implementations/TIMER_LEAKS.md for required cleanup variants.');
  process.exit(1);
}
console.log('TIMER_LEAKS tripwire: OK');
