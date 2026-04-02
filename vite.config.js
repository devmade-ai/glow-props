import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { copyFileSync, readFileSync } from 'fs';
import { resolve } from 'path';

// Requirement: Shared navbar across index.html and project.html without duplication
// Approach: Custom Vite plugin reads partials/navbar.html and injects it into HTML
//   files at build time, replacing <!-- NAVBAR:prefix --> comments.
//   The prefix token ({{NAV_PREFIX}}) becomes "" for same-page anchors (index.html)
//   or "./" for cross-page anchors (project.html).
// Alternative: Vite plugin ecosystem (vite-plugin-handlebars, etc.) — rejected,
//   adds dependency for a single simple replacement. This is 15 lines.
function htmlPartials() {
  const navbarPath = resolve(__dirname, 'partials', 'navbar.html');
  return {
    name: 'html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(
          /<!--\s*NAVBAR:(\S*)\s*-->/g,
          function (match, prefix) {
            var navbar = readFileSync(navbarPath, 'utf-8');
            return navbar.replace(/\{\{NAV_PREFIX\}\}/g, prefix);
          }
        );
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
        console.log(`  Copied ${file} → dist/${file}`);
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
