import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { copyFileSync, readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, basename } from 'path';

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
    var GENERIC_DESC = 'Reusable engineering patterns by devmade-ai — implementation guides shared across every project.';
    // Pairs, not an object: several of these keys are built by concatenation,
    // which an object literal cannot take without bracket syntax.
    return [
      ['<title>Loading... — devmade-ai</title>', '<title>' + title + '</title>'],
      [
        '<meta property="og:title" content="devmade-ai — Pattern Details">',
        '<link rel="canonical" href="' + url + '">\n  ' +
        '<meta name="description" content="' + desc + '">\n  ' +
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

        const outDir = resolve(distDir, 'patterns', pattern.slug);
        mkdirSync(outDir, { recursive: true });
        writeFileSync(resolve(outDir, 'index.html'), html);
      }
      console.log('[prerender-patterns] ' + patterns.length + ' pages');
    },
  };
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
  const projectsDir = resolve(__dirname, 'public', 'projects');

  function projectSlugs() {
    if (!existsSync(projectsDir)) return [];
    // A directory is a project only if it carries the meta.json the page
    // fetches — public/projects also holds asset-only folders.
    return readdirSync(projectsDir).filter(
      (d) => existsSync(resolve(projectsDir, d, 'meta.json')),
    );
  }

  return {
    name: 'generate-sitemap',
    closeBundle() {
      var urls = [{ loc: SITE, priority: '1.0' }];
      for (var p of buildPatternManifestForSitemap().patterns) {
        urls.push({ loc: SITE + 'patterns/' + p.slug + '/', priority: '0.8' });
      }
      for (var slug of projectSlugs()) {
        urls.push({ loc: SITE + 'project.html?name=' + slug, priority: '0.8' });
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

// Requirement: Multi-page site (index.html + project.html + pattern.html)
// Approach: Vite build.rollupOptions.input for multiple HTML entry points
// Alternative: Single-page with client-side routing — rejected, unnecessary complexity
export default defineConfig({
  base: '/glow-props/',
  plugins: [
    validateProjectMeta(),
    htmlPartials(),
    tailwindcss(),
    // Requirement: Installable PWA with offline support and user-controlled updates
    // Approach: vite-plugin-pwa with registerType: 'prompt' so users control when
    //   updates apply. Service worker caches all assets for offline portfolio viewing.
    // Alternative: autoUpdate — rejected, silently refreshes mid-browsing
    // Alternative: No PWA — rejected, offline access useful for demos/interviews
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['assets/images/favicon.png'],
      // Requirement: Reliable cache management across Workbox version upgrades
      // Approach: cleanupOutdatedCaches removes stale caches from older Workbox versions.
      //   globPatterns ensures all asset types used in the project are precached.
      // Alternative: Rely on Workbox defaults — rejected, defaults may miss font/image types
      //   and don't clean up caches from prior Workbox major versions.
      // Requirement: Fix SW for multi-page app — disable SPA-style navigation fallback
      // Approach: Set navigateFallback to false so the SW doesn't serve index.html for
      //   all navigation requests. This is a multi-page app (index, project, pattern),
      //   not an SPA. Without this fix, navigating to pattern.html?name=... or
      //   project.html?name=... serves index.html from the SW cache because query params
      //   prevent precacheAndRoute from matching.
      // Alternative: navigateFallbackDenylist — rejected, easier to disable entirely
      //   since every page is already precached.
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
        navigateFallback: null,
      },
      manifest: {
        name: 'Glow Props — Project Portfolio',
        short_name: 'Glow Props',
        description: 'Portfolio of tools and patterns by devmade.ai',
        id: '/glow-props/',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/glow-props/',
        start_url: '/glow-props/',
        prefer_related_applications: false,
        icons: [
          {
            src: 'assets/images/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'assets/images/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'assets/images/icon-1024.png',
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
