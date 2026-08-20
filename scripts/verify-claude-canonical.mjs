#!/usr/bin/env node
// Tripwire: CLAUDE.md's canonical half must equal docs/FLEET_CLAUDE.md exactly.
//
// Requirement: every devmade-ai repo's CLAUDE.md is the fleet-canonical text,
//   a LOCAL marker, then that repo's own sections. gp-props is repo nineteen
//   under that rule, and docs/FLEET_CLAUDE.md is the master it copies.
// Why a script and not a convention: a session editing a convention in the root
//   CLAUDE.md instead of the master produces a file that reads correctly and is
//   silently wrong — the next fleet sync replaces everything above the marker
//   and the edit is gone. Nothing about the working tree looks broken in
//   between, and no other check compares the two files.
// Approach: byte-compare the text above the marker against the master, and
//   report the first differing line so the fix is obvious. Also assert the
//   master carries no gp-props specifics, since it is what downstream repos
//   curl from https://gp-props.vercel.app/CLAUDE.md.
// Alternatives:
//   - Generate CLAUDE.md from the master at build time: rejected — the file
//     must be readable and editable at rest, and a generated CLAUDE.md invites
//     edits that the next build discards.
//   - Compare with a hash: rejected — a hash says "different" and nothing else.
//     The first differing line is what makes the failure actionable.

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MARKER = '<!-- LOCAL:';
const ROOT_FILE = resolve(ROOT, 'CLAUDE.md');
const MASTER = resolve(ROOT, 'docs/FLEET_CLAUDE.md');

// Tokens that must never reach a downstream repo's copy. Each one sent a reader
// into gp-props to discover it did not apply to them.
const GP_PROPS_ONLY = [
  'REPO_PATTERNS', 'FLEET_CHANGES', 'PROJECT_DOCS', 'public/projects/',
  'React reference implementation', 'plant-fur', 'node_modules/.bin/vite',
];

const fail = (msg) => { console.error(`✗ ${msg}`); process.exitCode = 1; };

for (const f of [ROOT_FILE, MASTER]) {
  if (!existsSync(f)) { fail(`${f} not found`); process.exit(1); }
}

const root = readFileSync(ROOT_FILE, 'utf-8');
const master = readFileSync(MASTER, 'utf-8');

const at = root.indexOf(MARKER);
if (at === -1) {
  fail(`CLAUDE.md has no ${MARKER} marker — the canonical half cannot be located`);
  process.exit(1);
}

const canonical = root.slice(0, at).replace(/\n+$/, '\n');
const expected = master.replace(/\n+$/, '\n');

if (canonical !== expected) {
  const a = canonical.split('\n'), b = expected.split('\n');
  // findIndex over `a` alone returns -1 when one file is a prefix of the other,
  // which would print "line 0" and two <end of file> markers. Scan the longer.
  const max = Math.max(a.length, b.length);
  let i = 0;
  while (i < max && a[i] === b[i]) i++;
  fail('CLAUDE.md above the LOCAL marker differs from docs/FLEET_CLAUDE.md.');
  console.error(`  first difference at line ${i + 1} (${a.length} lines here, ${b.length} in the master)`);
  console.error(`    CLAUDE.md:        ${JSON.stringify(a[i] ?? '<end of file>')}`);
  console.error(`    FLEET_CLAUDE.md:  ${JSON.stringify(b[i] ?? '<end of file>')}`);
  console.error('  Conventions are edited in docs/FLEET_CLAUDE.md, then copied here.');
}

// The master is the payload downstream repos receive; local facts must not ride along.
for (const token of GP_PROPS_ONLY) {
  if (master.includes(token)) fail(`docs/FLEET_CLAUDE.md contains gp-props-only text: ${token}`);
}

// Line 1 is a structural invariant unrelated to whatever the edit was about —
// the check that would have caught the 2026-08-15 H1 destruction.
if (!root.startsWith('# READ AND FOLLOW')) fail('CLAUDE.md line 1 is no longer the H1 banner');
if (!master.startsWith('# READ AND FOLLOW')) fail('docs/FLEET_CLAUDE.md line 1 is no longer the H1 banner');

if (!process.exitCode) {
  const local = root.slice(at).split(/\s+/).filter(Boolean).length;
  console.log(`✓ claude canonical: CLAUDE.md matches docs/FLEET_CLAUDE.md (${expected.split(/\s+/).filter(Boolean).length} words), ${local} words local`);
}
