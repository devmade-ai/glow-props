import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { copyFileSync, readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, basename } from 'path';
import { createHash } from 'crypto';

// Requirement: icon URLs must change when the icon bytes change, or browser/CDN/
//   WebAPK caches keep serving the old mark for weeks
//   (docs/implementations/PWA_ICON_CACHE_BUST.md invariant 1).
// Approach: sha256 of the file in public/, first 8 hex chars, appended as ?v=.
//   Content hash, not a timestamp — same bytes give the same URL across rebuilds,
//   so nothing invalidates spuriously.
// Alternative: content-hashed filenames — rejected for now; vite-plugin-pwa copies
//   manifest icon paths verbatim, so renames would need custom build steps (see the
//   pattern doc's tradeoff assessment).
const PUBLIC_DIR = resolve(__dirname, 'public');

function iconVersion(relPath) {
  const full = resolve(PUBLIC_DIR, relPath);
  if (!existsSync(full)) {
    // Warn, don't throw: a fresh clone has no icons before `npm run generate-icons`,
    // and breaking the dev server there is worse than a clear warning.
    console.warn('[iconVersion] missing icon at ' + full + " — using '0' as version.");
    return '0';
  }
  return createHash('sha256').update(readFileSync(full)).digest('hex').slice(0, 8);
}

const ICON_PATHS = [
  'assets/images/favicon.png',
  'assets/images/apple-touch-icon.png',
  'assets/images/icon-192.png',
  'assets/images/icon-512.png',
  'assets/images/icon-1024-maskable.png',
];
const ICON_VERSIONS = Object.fromEntries(ICON_PATHS.map((p) => [p, iconVersion(p)]));
const versioned = (relPath) => relPath + '?v=' + ICON_VERSIONS[relPath];

// Requirement: every URL surface must carry the icon version — the HTML
//   <link rel="icon">/<link rel="apple-touch-icon"> tags and the navbar mark
//   (PWA_ICON_CACHE_BUST.md invariant 2). Missing one leaks stale content.
// Approach: replace the exact literals in every built page. Fail loud when a
//   literal is missing — a reformatted tag would otherwise silently ship
//   un-versioned URLs and only surface weeks later when an icon changes.
// Runs after htmlPartials (which is order: 'pre') so the navbar img is present.
function iconCacheBustHtml() {
  const REPLACEMENTS = [
    ['href', 'assets/images/favicon.png'],
    ['href', 'assets/images/apple-touch-icon.png'],
    ['src', 'assets/images/icon-192.png'],
  ];
  return {
    name: 'icon-cache-bust-html',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        let out = html;
        for (const [attr, relPath] of REPLACEMENTS) {
          const literal = attr + '="' + relPath + '"';
          if (!out.includes(literal)) {
            throw new Error(
              '[icon-cache-bust-html] expected literal not found in ' + ctx.filename + ': ' + literal +
              '\nThe tag changed shape — update the REPLACEMENTS table in vite.config.js to match.',
            );
          }
          out = out.replaceAll(literal, attr + '="' + versioned(relPath) + '"');
        }
        return out;
      },
    },
  };
}

// Requirement: Shared partials across index.html and project.html without duplication
// Approach: Custom Vite plugin reads partial files and injects them into HTML at build time.
//   Supports three partial types:
//   1. <!-- NAVBAR:prefix --> — navbar with {{NAV_PREFIX}} token replacement
//   2. <!-- HEAD_COMMON --> — shared <head> content (bootstrap, fonts, CSS)
//   3. <!-- SKIP_LINK --> — accessibility skip-to-content link
// Alternative: Vite plugin ecosystem (vite-plugin-handlebars, etc.) — rejected,
//   adds dependency for simple replacements.
function htmlPartials() {
  const partialsDir = resolve(__dirname, 'partials');
  return {
    name: 'html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        // Navbar partial with prefix token
        html = html.replace(
          /<!--\s*NAVBAR:(\S*)\s*-->/g,
          function (match, prefix) {
            var navbar = readFileSync(resolve(partialsDir, 'navbar.html'), 'utf-8');
            return navbar.replace(/\{\{NAV_PREFIX\}\}/g, prefix);
          }
        );
        // Head common partial (bootstrap script, fonts, CSS)
        html = html.replace(
          /<!--\s*HEAD_COMMON\s*-->/g,
          function () {
            return readFileSync(resolve(partialsDir, 'head-common.html'), 'utf-8');
          }
        );
        // Skip link partial
        html = html.replace(
          /<!--\s*SKIP_LINK\s*-->/g,
          function () {
            return readFileSync(resolve(partialsDir, 'skip-link.html'), 'utf-8');
          }
        );
        return html;
      },
    },
  };
}

// Requirement: CLAUDE.md must live at repo root (Claude Code reads it there)
// but also be served via GitHub Pages at /glow-props/CLAUDE.md.
// Also copies implementation pattern docs to dist/patterns/ so pattern.html can fetch them.
// Approach: Small plugin copies files into dist/ after build.
// Alternative: Symlink in public/ — rejected, fragile with git across platforms.
// Alternative: Put patterns in public/ — rejected, they live in docs/implementations/
//   which is the canonical location referenced by CLAUDE.md.
function copyRootFiles() {
  const files = ['CLAUDE.md'];
  const implDir = resolve(__dirname, 'docs', 'implementations');
  return {
    name: 'copy-root-files',
    // Requirement: Serve pattern docs during dev so pattern.html works locally
    // Approach: Dev server middleware rewrites /patterns/*.md to docs/implementations/*.md.
    //   Uses basename() to prevent path traversal (e.g., /patterns/../../../etc/passwd).
    configureServer(server) {
      server.middlewares.use(function (req, res, next) {
        if (req.url && req.url.startsWith('/patterns/')) {
          const fileName = basename(req.url.replace('/patterns/', ''));
          if (!fileName.endsWith('.md')) { next(); return; }
          const filePath = resolve(implDir, fileName);
          if (existsSync(filePath)) {
            res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
            res.end(readFileSync(filePath, 'utf-8'));
            return;
          }
        }
        next();
      });
    },
    closeBundle() {
      for (const file of files) {
        copyFileSync(resolve(__dirname, file), resolve(__dirname, 'dist', file));
      }
      // Copy implementation pattern docs to dist/patterns/
      const distPatterns = resolve(__dirname, 'dist', 'patterns');
      if (existsSync(implDir)) {
        mkdirSync(distPatterns, { recursive: true });
        const mdFiles = readdirSync(implDir).filter(f => f.endsWith('.md'));
        for (const file of mdFiles) {
          copyFileSync(resolve(implDir, file), resolve(distPatterns, file));
        }
      }
    },
  };
}

// Requirement: Build-time validation of project metadata to catch integration bugs early
// Approach: Validate all public/projects/*/meta.json files at build start. Check for
//   required fields and referenced doc files. Fail the build if validation fails.
// Alternative: Runtime validation — rejected, errors are invisible until users hit them.
function validateProjectMeta() {
  const REQUIRED_FIELDS = ['name', 'title', 'description', 'badge', 'repo', 'audience', 'docs'];
  const DOC_FILE_MAP = { readme: 'README.md', userGuide: 'USER_GUIDE.md', testingGuide: 'TESTING_GUIDE.md', tutorial: 'TUTORIAL.md' };
  return {
    name: 'validate-project-meta',
    buildStart() {
      const projectsDir = resolve(__dirname, 'public', 'projects');
      if (!existsSync(projectsDir)) return;
      const dirs = readdirSync(projectsDir, { withFileTypes: true }).filter(d => d.isDirectory());
      const errors = [];
      for (const dir of dirs) {
        const metaPath = resolve(projectsDir, dir.name, 'meta.json');
        if (!existsSync(metaPath)) {
          errors.push(dir.name + ': missing meta.json');
          continue;
        }
        try {
          const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
          for (const field of REQUIRED_FIELDS) {
            if (meta[field] === undefined || meta[field] === null) {
              errors.push(dir.name + ': missing required field "' + field + '"');
            }
          }
          if (meta.docs) {
            for (const [key, enabled] of Object.entries(meta.docs)) {
              if (enabled && DOC_FILE_MAP[key]) {
                var docPath = resolve(projectsDir, dir.name, DOC_FILE_MAP[key]);
                if (!existsSync(docPath)) {
                  errors.push(dir.name + ': meta.json declares docs.' + key + '=true but ' + DOC_FILE_MAP[key] + ' is missing');
                }
              }
            }
          }
        } catch (e) {
          errors.push(dir.name + ': invalid JSON in meta.json');
        }
      }
      if (errors.length > 0) {
        this.warn('Project metadata validation warnings:\n  ' + errors.join('\n  '));
      }
    },
  };
}

function parseFrontmatter(text) {
  if (!text) return null;
  var normalized = text.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) return null;
  var end = normalized.indexOf('\n---\n', 4);
  if (end === -1) return null;
  var block = normalized.slice(4, end);
  var attrs = {};
  var currentKey = null;
  var lines = block.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var arrayMatch = line.match(/^  - (.+)$/);
    if (arrayMatch && currentKey) {
      if (!Array.isArray(attrs[currentKey])) attrs[currentKey] = [];
      var val = arrayMatch[1].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      attrs[currentKey].push(val);
      continue;
    }
    var kvMatch = line.match(/^(\w+):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      var rawVal = kvMatch[2].trim();
      if (rawVal === '') continue;
      if (rawVal.startsWith('"') && rawVal.endsWith('"')) rawVal = rawVal.slice(1, -1);
      if (/^\d+$/.test(rawVal)) rawVal = parseInt(rawVal, 10);
      attrs[currentKey] = rawVal;
    }
  }
  return attrs;
}

// Hoisted so generateSitemap() can list the same patterns the site serves,
// rather than keeping a second copy of the frontmatter parsing.
let buildPatternManifestForSitemap = () => ({ patterns: [] });

function generatePatternManifest() {
  const implDir = resolve(__dirname, 'docs', 'implementations');
  const REQUIRED = ['slug', 'title', 'badge', 'description'];

  function buildManifest() {
    if (!existsSync(implDir)) return { patterns: [] };
    var files = readdirSync(implDir).filter(f => f.endsWith('.md'));
    var patterns = [];
    var slugs = new Set();
    for (var file of files) {
      var text = readFileSync(resolve(implDir, file), 'utf-8');
      var attrs = parseFrontmatter(text);
      if (!attrs) {
        console.warn('[pattern-manifest] ' + file + ': missing YAML frontmatter — skipped');
        continue;
      }
      var missing = REQUIRED.filter(f => !attrs[f]);
      if (missing.length > 0) {
        console.warn('[pattern-manifest] ' + file + ': missing required fields: ' + missing.join(', ') + ' — skipped');
        continue;
      }
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(attrs.slug)) {
        console.warn('[pattern-manifest] ' + file + ': slug "' + attrs.slug + '" is not URL-safe (use lowercase alphanumeric with hyphens) — skipped');
        continue;
      }
      if (slugs.has(attrs.slug)) {
        console.warn('[pattern-manifest] ' + file + ': duplicate slug "' + attrs.slug + '" — skipped');
        continue;
      }
      slugs.add(attrs.slug);
      patterns.push({
        slug: attrs.slug,
        file: file,
        title: attrs.title,
        badge: attrs.badge,
        description: attrs.description,
        tags: attrs.tags || [],
        order: typeof attrs.order === 'number' ? attrs.order : 999,
      });
    }
    patterns.sort(function (a, b) {
      if (a.order !== b.order) return a.order - b.order;
      return a.title.localeCompare(b.title);
    });
    return { patterns: patterns };
  }

  buildPatternManifestForSitemap = buildManifest;

  return {
    name: 'generate-pattern-manifest',
    configureServer(server) {
      server.middlewares.use(function (req, res, next) {
        if (req.url === '/patterns/manifest.json') {
          var manifest = buildManifest();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(manifest, null, 2));
          return;
        }
        next();
      });
    },
    closeBundle() {
      var distPatterns = resolve(__dirname, 'dist', 'patterns');
      mkdirSync(distPatterns, { recursive: true });
      var manifest = buildManifest();
      writeFileSync(resolve(distPatterns, 'manifest.json'), JSON.stringify(manifest, null, 2));
    },
  };
}

// Requirement: every pattern was served from pattern.html?name=<slug>. That is
//   one HTML file standing in for twelve pages, so each pattern had the same
//   generic <title> and og: copy in its markup — a link to any of them unfurled
//   as "Pattern Details", and a crawler that does not run JS saw no content at
//   all. Runtime tags fix the first problem for Google and nothing for anyone
//   else, because unfurlers do not run JS.
// Approach: write one real HTML file per pattern at build, derived from the
//   BUILT pattern.html so every asset URL is already correct. Each gets its own
//   head tags and its markdown rendered into #app — which the page's own render
//   then overwrites on mount, so there is no shell to tear down and no way for
//   the two to disagree about what is on screen.
// Alternative: a full static-site generator — rejected, this is one template
//   and a folder of markdown.
// See docs/implementations/DISCOVERABILITY.md.
function prerenderPatternPages() {
  const SITE = 'https://devmade-ai.github.io/glow-props/';

  function head(pattern) {
    const title = escapeAttr(pattern.title + ' — devmade-ai');
    const desc = escapeAttr(pattern.description);
    const url = SITE + 'patterns/' + pattern.slug + '/';
    const GENERIC_DESC = 'Reusable engineering patterns by devmade-ai — implementation guides shared across every project.';
    // Pairs, not an object: several of these keys are built by concatenation,
    // which an object literal cannot take without bracket syntax.
    //
    // Every entry REPLACES a tag the template already carries. Nothing here
    // may introduce a tag that the template also has: the description was
    // originally injected alongside og:title, which left the generic one in
    // place and shipped all 12 pages with two <meta name="description">
    // tags — a crawler then picks one and we do not get to say which.
    // Replacing in place also means the fail-loud guard below covers the
    // description too, so a reworded template breaks the build instead of
    // quietly restoring the generic copy.
    return [
      ['<title>Loading... — devmade-ai</title>', '<title>' + title + '</title>'],
      [
        '<meta name="description" content="' + GENERIC_DESC + '">',
        '<meta name="description" content="' + desc + '">',
      ],
      [
        '<meta property="og:title" content="devmade-ai — Pattern Details">',
        '<link rel="canonical" href="' + url + '">\n  ' +
        '<meta property="og:title" content="' + title + '">',
      ],
      [
        '<meta property="og:description" content="' + GENERIC_DESC + '">',
        '<meta property="og:description" content="' + desc + '">',
      ],
      [
        '<meta property="og:url" content="' + SITE + 'pattern.html">',
        '<meta property="og:url" content="' + url + '">',
      ],
      [
        '<meta name="twitter:title" content="devmade-ai — Pattern Details">',
        '<meta name="twitter:title" content="' + title + '">',
      ],
      [
        '<meta name="twitter:description" content="' + GENERIC_DESC + '">',
        '<meta name="twitter:description" content="' + desc + '">',
      ],
    ];
  }

  function escapeAttr(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return {
    name: 'prerender-pattern-pages',
    async closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const templatePath = resolve(distDir, 'pattern.html');
      if (!existsSync(templatePath)) {
        console.warn('[prerender-patterns] dist/pattern.html missing — skipped');
        return;
      }
      const template = readFileSync(templatePath, 'utf-8');
      // marked is a runtime dependency of the site, so the build renders the
      // same markdown with the same library the browser will.
      const { marked } = await import('marked');

      const patterns = buildPatternManifestForSitemap().patterns;
      for (const pattern of patterns) {
        const mdPath = resolve(__dirname, 'docs', 'implementations', pattern.file);
        if (!existsSync(mdPath)) continue;
        // Strip the YAML frontmatter — it is metadata for the manifest, not
        // page content, and marked would render it as a paragraph of keys.
        const body = readFileSync(mdPath, 'utf-8').replace(/^---\n[\s\S]*?\n---\n/, '');

        let html = template;
        for (const [from, to] of head(pattern)) {
          if (!html.includes(from)) {
            throw new Error(
              '[prerender-patterns] expected literal not found in built pattern.html: ' + from +
              '\nThe head tags changed — update prerenderPatternPages() in vite.config.js to match.',
            );
          }
          html = html.replace(from, to);
        }

        // Into #app, which the page's own render overwrites on mount. No
        // separate shell to remove, and nothing that can outlive the handoff.
        html = html.replace(
          '<div id="app"',
          '<div id="app" data-prerendered="true"',
        ).replace(
          /(<div id="app"[^>]*>)/,
          '$1\n' + marked.parse(body),
        );

        // The navbar partial is stamped with NAV_PREFIX="./" for a root-level
        // page. Two directories down, "./#patterns" resolves to
        // patterns/<slug>/#patterns and every nav link is dead. These are the
        // only "./" hrefs in the template — they exist BECAUSE of that token —
        // so rewriting them to the site base is exact rather than a guess.
        const navLinks = (html.match(/href="\.\//g) || []).length;
        if (navLinks === 0) {
          throw new Error(
            '[prerender-patterns] no "./" nav links found in built pattern.html. ' +
            'NAV_PREFIX changed shape — re-check that nav links still resolve from ' +
            'patterns/<slug>/ before removing this guard.',
          );
        }
        html = html.replace(/href="\.\//g, 'href="/glow-props/');
        html = rebaseDocumentRelativeAssets(html, 'prerender-patterns');

        const outDir = resolve(distDir, 'patterns', pattern.slug);
        mkdirSync(outDir, { recursive: true });
        writeFileSync(resolve(outDir, 'index.html'), html);
      }
      console.log('[prerender-patterns] ' + patterns.length + ' pages');

      // Requirement: the landing page's pattern cards were client-rendered, so
      //   a crawler that does not run JS saw no link to any prerendered pattern
      //   page — discovery relied on the sitemap alone.
      // Approach: replace the "Loading patterns..." placeholder in the built
      //   index.html with static cards; the page's own render overwrites them
      //   on mount (same into-the-container technique as the page bodies).
      //   No scroll-animate on these — without JS, nothing would ever lift the
      //   utility's opacity:0 and the cards would be invisible.
      const indexPath = resolve(distDir, 'index.html');
      if (existsSync(indexPath)) {
        const LOADING = '<p class="text-base-content/40 text-sm col-span-full text-center py-8">Loading patterns...</p>';
        let indexHtml = readFileSync(indexPath, 'utf-8');
        if (!indexHtml.includes(LOADING)) {
          throw new Error(
            '[prerender-patterns] expected the "Loading patterns..." placeholder in ' +
            'built index.html. The placeholder changed shape — update prerenderPatternPages().',
          );
        }
        const cards = patterns.map(function (p) {
          const tagsHtml = p.tags.length > 0
            ? '<p class="text-xs text-base-content/40">' + p.tags.map(escapeAttr).join(' &middot; ') + '</p>'
            : '';
          return '<div class="card bg-base-200/50 border border-base-300 card-interactive">' +
            '<div class="card-body">' +
              '<h4 class="font-semibold text-base mb-1">' + escapeAttr(p.title) + '</h4>' +
              '<p class="text-sm text-base-content/70 grow">' + escapeAttr(p.description) + '</p>' +
              '<div class="mt-auto pt-2">' + tagsHtml +
                '<div class="card-links"><a href="patterns/' + encodeURIComponent(p.slug) + '/" class="btn btn-sm btn-primary rounded-full">View pattern</a></div>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('\n');
        writeFileSync(indexPath, indexHtml.replace(LOADING, cards));
        console.log('[prerender-patterns] index.html pattern cards injected');
      }
    },
  };
}

// Requirement: prerendered pages live two directories down, but the built
//   template still carries document-relative asset URLs — <script src="theme.js">
//   and the assets/images/* icon links (Vite only rewrites module-graph assets).
//   From patterns/<slug>/ those resolve to files that do not exist: the theme
//   picker and burger menu were dead on every prerendered page, and its favicon
//   404'd.
// Approach: rewrite the document-relative forms to the site base, with the same
//   fail-loud contract as the nav-link rewrite — a template change must break the
//   build, not quietly ship broken pages.
function rebaseDocumentRelativeAssets(html, tag) {
  if (!html.includes('src="theme.js"')) {
    throw new Error(
      '[' + tag + '] expected <script src="theme.js"> in the built template. ' +
      'The tag changed shape — update rebaseDocumentRelativeAssets() to match.',
    );
  }
  html = html.replace('src="theme.js"', 'src="/glow-props/theme.js"');

  // Icon links and the navbar mark (possibly carrying their ?v= cache-bust query).
  const assetRefs = (html.match(/(?:href|src)="assets\//g) || []).length;
  if (assetRefs === 0) {
    throw new Error(
      '[' + tag + '] no document-relative assets/ references found in the built ' +
      'template. The head tags changed shape — update rebaseDocumentRelativeAssets().',
    );
  }
  return html
    .replace(/href="assets\//g, 'href="/glow-props/assets/')
    .replace(/src="assets\//g, 'src="/glow-props/assets/');
}

// A directory under public/projects is a project only if it carries the
// meta.json the page fetches — the folder also holds asset-only directories.
// Shared by generateSitemap() and prerenderProjectPages().
function listProjectSlugs() {
  const projectsDir = resolve(__dirname, 'public', 'projects');
  if (!existsSync(projectsDir)) return [];
  return readdirSync(projectsDir).filter(
    (d) => existsSync(resolve(projectsDir, d, 'meta.json')),
  );
}

// Requirement: the sitemap listed two URLs — the landing and a bare
//   project.html — while the site's real content is every pattern and every
//   project, each at its own "?name=" URL. A hand-maintained file also goes
//   stale the moment a pattern is added, which is the failure the pattern
//   manifest already avoids by being generated.
// Approach: build the sitemap at bundle close from the same two sources the
//   site itself reads — the pattern frontmatter and the project directories.
// Alternative: keep public/sitemap.xml by hand — rejected, it was already
//   wrong when this was written.
// See docs/implementations/DISCOVERABILITY.md.
function generateSitemap() {
  const SITE = 'https://devmade-ai.github.io/glow-props/';

  return {
    name: 'generate-sitemap',
    closeBundle() {
      var urls = [{ loc: SITE, priority: '1.0' }];
      for (var p of buildPatternManifestForSitemap().patterns) {
        urls.push({ loc: SITE + 'patterns/' + p.slug + '/', priority: '0.8' });
      }
      // The prerendered clean URL is canonical; the project.html?name= form is
      // the legacy entry point and must not appear here as duplicate content.
      for (var slug of listProjectSlugs()) {
        urls.push({ loc: SITE + 'projects/' + slug + '/', priority: '0.8' });
      }

      var body = urls
        .map(function (u) {
          // & is legal in a URL and illegal raw in XML; these have none today,
          // but a sitemap that silently becomes invalid is worth one escape.
          var loc = u.loc.replace(/&/g, '&amp;');
          return '  <url>\n    <loc>' + loc + '</loc>\n    <changefreq>weekly</changefreq>\n    <priority>' + u.priority + '</priority>\n  </url>';
        })
        .join('\n');

      writeFileSync(
        resolve(__dirname, 'dist', 'sitemap.xml'),
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<!-- Generated at build time by generateSitemap() in vite.config.js.\n' +
        '     Do not edit by hand — it is rebuilt from docs/implementations/\n' +
        '     and public/projects/ on every build. -->\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        body + '\n</urlset>\n',
      );
      console.log('[generate-sitemap] ' + urls.length + ' URLs');
    },
  };
}

// Requirement: all 16 projects were served from project.html?name=<slug> — one
//   HTML file with one generic head, so every project link unfurled as
//   "Project Details" and non-JS crawlers saw no content
//   (DISCOVERABILITY.md "One page per item, when the content is a collection").
//   Runtime tags (src/seoMeta.js) fix this for Google only; unfurlers do not
//   run JS.
// Approach: same shape as prerenderPatternPages() — one real HTML file per
//   project at projects/<slug>/, derived from the BUILT project.html, with its
//   own head tags and the README rendered into #app, which the page's own
//   render overwrites on mount. The clean URL is canonical; ?name= still works
//   and points at it.
function prerenderProjectPages() {
  const SITE = 'https://devmade-ai.github.io/glow-props/';
  const GENERIC_DESC = 'Software projects, internal tools, and reusable engineering patterns by devmade-ai.';

  function escapeAttr(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function head(meta, slug) {
    const title = escapeAttr(meta.title + ' — devmade-ai');
    const desc = escapeAttr(meta.description);
    const url = SITE + 'projects/' + slug + '/';
    // Same contract as prerenderPatternPages(): every entry REPLACES a tag the
    // template already carries, so the fail-loud guard covers all of them and
    // no duplicate identity tags can ship.
    return [
      ['<title>Loading... — devmade-ai</title>', '<title>' + title + '</title>'],
      [
        '<meta name="description" content="' + GENERIC_DESC + '">',
        '<meta name="description" content="' + desc + '">',
      ],
      [
        '<meta property="og:title" content="devmade-ai — Project Details">',
        '<link rel="canonical" href="' + url + '">\n  ' +
        '<meta property="og:title" content="' + title + '">',
      ],
      [
        '<meta property="og:description" content="' + GENERIC_DESC + '">',
        '<meta property="og:description" content="' + desc + '">',
      ],
      [
        '<meta property="og:url" content="' + SITE + 'project.html">',
        '<meta property="og:url" content="' + url + '">',
      ],
      [
        '<meta name="twitter:title" content="devmade-ai — Project Details">',
        '<meta name="twitter:title" content="' + title + '">',
      ],
      [
        '<meta name="twitter:description" content="' + GENERIC_DESC + '">',
        '<meta name="twitter:description" content="' + desc + '">',
      ],
    ];
  }

  return {
    name: 'prerender-project-pages',
    async closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const templatePath = resolve(distDir, 'project.html');
      if (!existsSync(templatePath)) {
        console.warn('[prerender-projects] dist/project.html missing — skipped');
        return;
      }
      const template = readFileSync(templatePath, 'utf-8');
      const { marked } = await import('marked');

      const slugs = listProjectSlugs();
      for (const slug of slugs) {
        const metaPath = resolve(__dirname, 'public', 'projects', slug, 'meta.json');
        let meta;
        try {
          meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
        } catch (e) {
          console.warn('[prerender-projects] ' + slug + ': invalid meta.json — skipped');
          continue;
        }
        if (!meta.title || !meta.description) {
          console.warn('[prerender-projects] ' + slug + ': meta.json missing title/description — skipped');
          continue;
        }

        let html = template;
        for (const [from, to] of head(meta, slug)) {
          if (!html.includes(from)) {
            throw new Error(
              '[prerender-projects] expected literal not found in built project.html: ' + from +
              '\nThe head tags changed — update prerenderProjectPages() in vite.config.js to match.',
            );
          }
          html = html.replace(from, to);
        }

        // Crawlable body: project header plus the README, into #app — which the
        // page's own render overwrites on mount, exactly like the pattern pages.
        let body = '<h1>' + escapeAttr(meta.title) + '</h1>\n<p>' + escapeAttr(meta.description) + '</p>\n';
        const readmePath = resolve(__dirname, 'public', 'projects', slug, 'README.md');
        if (meta.docs && meta.docs.readme && existsSync(readmePath)) {
          body += marked.parse(readFileSync(readmePath, 'utf-8'));
        }
        html = html.replace(
          '<div id="app"',
          '<div id="app" data-prerendered="true"',
        ).replace(
          /(<div id="app"[^>]*>)/,
          '$1\n' + body,
        );

        const navLinks = (html.match(/href="\.\//g) || []).length;
        if (navLinks === 0) {
          throw new Error(
            '[prerender-projects] no "./" nav links found in built project.html. ' +
            'NAV_PREFIX changed shape — re-check that nav links still resolve from ' +
            'projects/<slug>/ before removing this guard.',
          );
        }
        html = html.replace(/href="\.\//g, 'href="/glow-props/');
        html = rebaseDocumentRelativeAssets(html, 'prerender-projects');

        const outDir = resolve(distDir, 'projects', slug);
        mkdirSync(outDir, { recursive: true });
        writeFileSync(resolve(outDir, 'index.html'), html);
      }
      console.log('[prerender-projects] ' + slugs.length + ' pages');
    },
  };
}

// Requirement: Multi-page site (index.html + project.html + pattern.html)
// Approach: Vite build.rollupOptions.input for multiple HTML entry points
// Alternative: Single-page with client-side routing — rejected, unnecessary complexity
export default defineConfig({
  base: '/glow-props/',
  plugins: [
    validateProjectMeta(),
    htmlPartials(),
    tailwindcss(),
    // Before VitePWA() so the icon-URL contract is locked in ahead of manifest
    // generation (PWA_ICON_CACHE_BUST.md "Plugin order").
    iconCacheBustHtml(),
    // Requirement: Installable PWA with offline support and user-controlled updates
    // Approach: vite-plugin-pwa with registerType: 'prompt' so users control when
    //   updates apply. Service worker caches all assets for offline portfolio viewing.
    // Alternative: autoUpdate — rejected, silently refreshes mid-browsing
    // Alternative: No PWA — rejected, offline access useful for demos/interviews
    VitePWA({
      registerType: 'prompt',
      // Requirement: Reliable cache management across Workbox version upgrades
      // Approach: cleanupOutdatedCaches removes stale caches from older Workbox versions.
      //   globPatterns ensures all asset types used in the project are precached —
      //   including .md, which IS the site's content (pattern.html and project.html
      //   fetch markdown at runtime; without it, every content page is offline-broken).
      // Requirement: query-parameter URLs must resolve offline. pattern.html?name= and
      //   project.html?name= never match their precached page because the query is part
      //   of the cache key, and versioned icon requests (?v=) have the same problem.
      // Approach: ignoreURLParametersMatching strips name/v (plus the Workbox defaults
      //   utm_/fbclid, which supplying this option would otherwise silently drop) before
      //   precache lookup. navigateFallback stays null — multi-page app, every page is
      //   its own precached entry, index.html must never stand in for the others.
      // Requirement: exactly one precache entry per icon (PWA_ICON_CACHE_BUST checklist).
      //   The icon PNGs used to enter twice — revision:null from the glob AND a
      //   revisioned copy from includeAssets/manifest injection. Two cache keys for one
      //   URL makes workbox-precaching throw add-to-cache-list-conflicting-entries at SW
      //   evaluation, killing the whole precache layer in production.
      // Approach: globIgnores the referenced icon files; their precache entries come
      //   solely from the versioned manifest/includeAssets injection.
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json,md}'],
        globIgnores: [
          '**/assets/images/favicon.png',
          '**/assets/images/apple-touch-icon.png',
          '**/assets/images/icon-192.png',
          '**/assets/images/icon-512.png',
          '**/assets/images/icon-1024.png',
          '**/assets/images/icon-1024-maskable.png',
        ],
        ignoreURLParametersMatching: [/^name$/, /^v$/, /^utm_/, /^fbclid$/],
        navigateFallback: null,
        // Google Fonts are loaded on every page (partials/head-common.html) but were
        // never runtime-cached, so offline pages fell back to system fonts.
        // CacheFirst for a year — fonts effectively never change under one URL.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      // Bare paths, not versioned() — includeAssets globs real files, so a query
      // string matches nothing and the icon silently drops out of the precache.
      // Each icon gets ONE bare-URL entry with a content revision here; requests
      // for the versioned form match it because ignoreURLParametersMatching
      // strips ?v= on lookup.
      includeAssets: ICON_PATHS,
      manifest: {
        name: 'Glow Props — Project Portfolio',
        short_name: 'Glow Props',
        description: 'Portfolio of tools and patterns by devmade.ai',
        id: '/glow-props/',
        // Matches the coffee (--prefersdark default) base-100 — THEME_DARK_MODE
        // requires the manifest fallback to be a real theme color, and this is the
        // same value the dark <meta name="theme-color"> ships with.
        theme_color: '#261b25',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/glow-props/',
        start_url: '/glow-props/',
        prefer_related_applications: false,
        icons: [
          {
            src: versioned('assets/images/icon-192.png'),
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: versioned('assets/images/icon-512.png'),
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            // Full-bleed white-background variant — a transparent icon declared
            // maskable gets crop-masked over an undefined backdrop on Android.
            src: versioned('assets/images/icon-1024-maskable.png'),
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
    copyRootFiles(),
    generatePatternManifest(),
    prerenderPatternPages(),
    prerenderProjectPages(),
    generateSitemap(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        project: resolve(__dirname, 'project.html'),
        pattern: resolve(__dirname, 'pattern.html'),
      },
    },
  },
});
