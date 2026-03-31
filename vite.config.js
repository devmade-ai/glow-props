import { defineConfig } from 'vite';
import { copyFileSync } from 'fs';
import { resolve } from 'path';

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
  plugins: [copyRootFiles()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        project: resolve(__dirname, 'project.html'),
      },
    },
  },
});
