#!/usr/bin/env node
// Triages docs/TODO.md against the repos it describes.
//
// Requirement: 157 open items, most citing a file and often a line. Seven of the
//   eleven touched by hand on 2026-08-19 were already describing states that no
//   longer existed, and a stale entry is worse than a missing one because it gets
//   acted on.
// Approach: for each open item, take the repo from its nearest ### heading and
//   the file paths from its backticks, fetch each file once, and report the one
//   thing that needs no judgement -- the cited file is GONE. That alone
//   disqualifies an item without anyone reading it.
// Alternatives:
//   - Read all 157 by hand: rejected, that is the pass that never gets done.
//   - Trust the dates: rejected, an April entry can be live and an August one dead.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { execSync } from "child_process";

const TOK = process.env.GITHUB_ALL_REPO_TOKEN;
const CACHE = "/tmp/todo-cache";
mkdirSync(CACHE, { recursive: true });

const KNOWN = new Set(["gp-props","see-veo","repo-tor","model-pear","graphiki","fl-farlume",
  "fh-fuelhunt","intxt","four-ems","tool-till-tees","canva-grid","sun-sea-o","qi-invoice",
  "dm-website","kl-website","sp-website","sp-backend","hf-sculpt","web-arch"]);

function fetchFile(repo, path) {
  const key = CACHE + "/" + repo + "__" + path.replace(/\//g, "_");
  if (existsSync(key)) return readFileSync(key, "utf-8");
  let body = " MISSING";
  try {
    const cmd = "curl -sf -H \"Authorization: token " + TOK + "\" " +
      "\"https://api.github.com/repos/devmade-ai/" + repo + "/contents/" + path + "\"";
    const j = JSON.parse(execSync(cmd, { encoding: "utf-8", maxBuffer: 40e6 }));
    if (j.content) body = Buffer.from(j.content, "base64").toString("utf-8");
  } catch (e) { /* 404 or binary */ }
  writeFileSync(key, body);
  return body;
}

const lines = readFileSync("docs/TODO.md", "utf-8").split("\n");
let repo = null;
const items = [];
for (const l of lines) {
  const h = /^### +([a-z0-9-]+)/.exec(l);
  if (h && KNOWN.has(h[1])) repo = h[1];
  if (/^\s*(?:[-*]|\d+\.)\s*\[ \]/.test(l) && repo) {
    const files = [...l.matchAll(/`([\w./-]+\.(?:ts|tsx|js|jsx|mjs|json|html|css|yml|yaml))`/g)].map(m => m[1]);
    items.push({ repo, text: l, files: [...new Set(files)] });
  }
}

const results = [];
for (const it of items) {
  const verdicts = [];
  for (const f of it.files) {
    const guesses = f.includes("/") ? [f] : [f, "src/" + f, "src/hooks/" + f, "src/lib/" + f,
      "src/utils/" + f, "src/pwa/" + f, "scripts/" + f];
    let found = null;
    for (const g of guesses) { if (fetchFile(it.repo, g) !== " MISSING") { found = g; break; } }
    verdicts.push((found ? "ok:" : "GONE:") + f);
  }
  results.push({ repo: it.repo, files: it.files.length, verdicts, text: it.text });
}
const gone = results.filter(r => r.verdicts.some(v => v.startsWith("GONE")));
console.log(JSON.stringify({
  items: results.length,
  withFileRefs: results.filter(r => r.files > 0).length,
  itemsWithAMissingFile: gone.length,
  detail: gone.map(g => ({ repo: g.repo, missing: g.verdicts.filter(v => v.startsWith("GONE")),
                           text: g.text.slice(0, 120) }))
}, null, 1));
