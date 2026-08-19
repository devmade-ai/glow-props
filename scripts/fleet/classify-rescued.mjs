#!/usr/bin/env node
// Classifies the "Rescued From Replaced Sections" block the sync left in each repo.
//
// Requirement: the sync kept every line canonical did not say, so nothing was lost —
//   but nothing was sorted either, and an unsorted block of 1,137 lines reads as
//   noise, which is how a file stops being trusted.
// Approach: drop only what is PROVABLY superseded — a trigger row whose name is in
//   gp-props' vocabulary, a section the canonical text replaced outright, a pointer
//   canonical now carries, or an orphaned formatting fragment with no content. Keep
//   everything else, because "I do not recognise it" is not evidence it is obsolete.
// Alternatives:
//   - Classify every line by hand across 18 repos: rejected, the judgement is
//     mechanical for the superseded cases and unreliable at that volume for the rest.
//   - Drop the whole block: rejected, it is the only surviving copy of each repo's
//     novel local rules.
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve } from 'path';

const OUT = process.argv[2];
const TRIGGERS = new Set(
  [...readFileSync('docs/TRIGGERS.md', 'utf-8').matchAll(/\| `([a-z0-9-]+)` \|/g)].map(m => m[1])
);
// Sections the canonical text replaced outright; nothing they said survives it.
const DEAD_SECTIONS = new Set([
  'Fetching This File', 'Fetching the Fleet Standards', 'Fleet Ruleset Source',
  'Principles', 'Process',
]);
const SUPERSEDED = [
  /patterns\/\{PATTERN_NAME\}\.md/i,          // canonical Implementation Patterns has the fetch
  /TIMER_LEAKS.*for concrete patterns/i,       // canonical Code Standards has the pointer
  /never clone sibling repos/i,                // canonical AI Notes
  /check build tools before building/i,        // upstreamed generically this session
  /this file mirrors them/i,                   // the superseded sync model
  /implementation patterns are fetched separately/i,
  /ASK before assuming/i,                      // canonical is stronger: go find the cause
  /onBeforeUnmount|onScopeDispose/i,           // upstreamed into the canonical timer rule
];
// Lines torn out of a block by the line-based rescue; alone they carry nothing.
const ORPHAN = /^(\*\*[A-Za-z ]+:\*\*|Example:|\| *[-: ]+\|.*|)$/;

const report = [];
for (const f of readdirSync(OUT).filter(n => n.endsWith('.md'))) {
  const repo = f.slice(0, -3);
  const p = resolve(OUT, f);
  const text = readFileSync(p, 'utf-8');
  const at = text.indexOf('## Rescued From Replaced Sections');
  if (at === -1) { report.push({ repo, kept: 0, dropped: 0 }); continue; }

  const head = text.slice(0, at);
  const kept = [], dropped = [];
  for (const line of text.slice(at).split('\n')) {
    const m = /^- ([^:]+) :: (.*)$/.exec(line);
    if (!m) continue;
    const [, section, body] = m;
    const trig = /^\| *\d+ *\| *`([a-z0-9-]+)` *\|/.exec(body);
    const dead =
      DEAD_SECTIONS.has(section.trim()) ||
      (trig && TRIGGERS.has(trig[1])) ||
      SUPERSEDED.some(rx => rx.test(body)) ||
      ORPHAN.test(body.trim());
    (dead ? dropped : kept).push(`- ${section} :: ${body}`);
  }

  const block = kept.length
    ? '## Kept From Replaced Sections\n\n' +
      'What this repo said in sections the fleet sync replaced, that canonical does\n' +
      'not say. Superseded lines were dropped; these were not. Each is a line, not a\n' +
      'block — the rescue was line-based, so the surrounding context is in the commit\n' +
      'before the sync.\n\n' + kept.join('\n') + '\n'
    : '';
  writeFileSync(p, head.replace(/\n+$/, '\n') + (block ? '\n' + block : ''));
  report.push({ repo, kept: kept.length, dropped: dropped.length });
}
console.log(JSON.stringify(report));
