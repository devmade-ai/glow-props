#!/usr/bin/env node
// Fleet sync planner. Builds each repo's new CLAUDE.md as:
//   <canonical: docs/FLEET_CLAUDE.md verbatim>  <LOCAL marker>  <that repo's own>
//
// Safety property (FLEET_CHANGES step 8): every non-blank line of the original
// file must appear in the new file, or in the canonical text it is being
// replaced by. A line in neither is unaccounted for and the repo is REFUSED —
// nothing is written for it. That is the check the 2026-08-15 pass lacked.
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const SB = process.argv[2];
const OUT = resolve(SB, '_out');
mkdirSync(OUT, { recursive: true });

const CANON = readFileSync('docs/FLEET_CLAUDE.md', 'utf-8').replace(/\n+$/, '\n');
// The fleet's PREVIOUS canonical text. A line found here is superseded by design —
// rescuing it would resurrect the very rules this sync replaces (all seven
// Principles, the old Code Standards bullets) into every repo below the marker.
const BASELINE = readFileSync(resolve(SB, '_baseline.md'), 'utf-8');
const MARKER = "<!-- LOCAL: everything below is this repo's own. Fleet syncs never touch it. -->";

// Sections the canonical text owns. Anything else in a repo's file is local.
const CANONICAL_SECTIONS = new Set([
  'Purpose', 'Fetching This File', 'Process', 'Principles', 'Communication',
  'Scope and Completion', 'Code Standards', 'Documentation', 'AI Notes',
  'Prohibitions', 'Triggers', 'Implementation Patterns (Source of Truth)',
  'Implementation Patterns', 'Adopted Patterns', 'Communication Style',
  // Superseded by canonical's "Fetching This File", which now describes the
  // canonical/LOCAL structure. Anything novel inside them still gets rescued.
  'Fetching the Fleet Standards', 'Fleet Ruleset Source',
]);

const norm = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase();
const canonNorm = norm(CANON);
const baseNorm = norm(BASELINE);
const known = (line) => {
  const k = norm(line).slice(0, 60);
  return canonNorm.includes(k) || baseNorm.includes(k);
};

function split(text) {
  const lines = text.split('\n');
  const out = [];
  let cur = { title: null, lines: [] };
  for (const line of lines) {
    const m = /^## +(.+?)\s*$/.exec(line);
    if (m) { out.push(cur); cur = { title: m[1], lines: [line] }; }
    else cur.lines.push(line);
  }
  out.push(cur);
  return out;
}

const report = [];
for (const f of readdirSync(SB).filter(n => n.endsWith('.md') && !n.startsWith('_'))) {
  const repo = f.slice(0, -3);
  const orig = readFileSync(resolve(SB, f), 'utf-8');
  const sections = split(orig);

  const localBlocks = [];
  const rescued = [];
  for (const sec of sections) {
    const title = sec.title;
    const isCanonical = title !== null && CANONICAL_SECTIONS.has(title);
    if (title === null) {
      // Preamble: product title, intro prose, shared-standards banner. Always local
      // EXCEPT the old fleet H1 banner — canonical now supplies line 1, and keeping
      // the stale one leaves the file with two H1s, the second listing sections
      // (Principles) that no longer exist.
      const kept = sec.lines.filter(l => !/^# READ AND FOLLOW/i.test(l.trim()));
      if (kept.join('').trim()) localBlocks.push(kept.join('\n').replace(/^\n+|\n+$/g, ''));
      continue;
    }
    if (!isCanonical) { localBlocks.push(sec.lines.join('\n').replace(/\n+$/, '')); continue; }
    // Canonical section: keep only lines the new canonical does not already say.
    for (const line of sec.lines) {
      const L = line.trim();
      if (!L || /^#{1,6} /.test(L) || L.startsWith('|---') ) continue;
      if (!known(L)) rescued.push(`${title} :: ${L}`);
    }
  }

  const localText = [
    localBlocks.join('\n\n'),
    rescued.length ? '\n## Rescued From Replaced Sections\n\n' +
      'Lines the fleet sync found in this repo\'s canonical sections that canonical\n' +
      'does not say. Kept verbatim, prefixed with the section they came from, so a\n' +
      'later pass can decide whether each is local, obsolete, or worth upstreaming.\n\n' +
      rescued.map(r => `- ${r}`).join('\n') : '',
  ].filter(Boolean).join('\n');

  const next = `${CANON}\n${MARKER}\n\n${localText.replace(/\n{3,}/g, '\n\n').trim()}\n`;

  // The no-loss assertion.
  const nextNorm = norm(next);
  const missing = orig.split('\n')
    .map(l => l.trim())
    .filter(l => l && !/^#{1,6} /.test(l) && !l.startsWith('|---'))
    // Lost is only lost if it is also not superseded — old canonical text being
    // replaced is an intended deletion, not collateral damage.
    .filter(l => !nextNorm.includes(norm(l).slice(0, 60)) && !baseNorm.includes(norm(l).slice(0, 60)));

  if (missing.length) {
    report.push({ repo, status: 'REFUSED', missing: missing.length, sample: missing.slice(0, 3) });
    continue;
  }
  writeFileSync(resolve(OUT, `${repo}.md`), next);
  report.push({
    repo, status: 'ok',
    origWords: orig.split(/\s+/).filter(Boolean).length,
    localWords: localText.split(/\s+/).filter(Boolean).length,
    rescued: rescued.length,
  });
}
console.log(JSON.stringify(report, null, 1));
