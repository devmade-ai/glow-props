import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { copyFileSync, readFileSync, readdirSync, existsSync } from 'fs';
import { resolve } from 'path';

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
// Approach: Small plugin copies root-level files into dist/ after build.
// Alternative: Symlink in public/ — rejected, fragile with git across platforms.
function copyRootFiles() {
  const files = ['CLAUDE.md'];
  return {
    name: 'copy-root-files',
    closeBundle() {
      for (const file of files) {
        copyFileSync(resolve(__dirname, file), resolve(__dirname, 'dist', file));
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

// Requirement: Multi-page site (index.html + project.html)
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
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
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
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        project: resolve(__dirname, 'project.html'),
      },
    },
  },
});
