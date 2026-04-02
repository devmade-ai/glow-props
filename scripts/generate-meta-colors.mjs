#!/usr/bin/env node

// Requirement: Auto-generate theme metadata from DaisyUI theme definitions
// What: Reads daisyui/theme/object.js, derives light/dark classification from
//   color-scheme, converts primary (light) or base-100 (dark) oklch → hex.
// Why: Eliminates manual hex approximations and manual light/dark theme lists.
//   Single source of truth = DaisyUI's own theme objects.
// Updates: theme.js (META_COLORS + LIGHT_THEMES/DARK_THEMES arrays),
//   head-common.html (mc color map + lt/dt arrays), navbar.html (button sections),
//   index.html/project.html (initial meta tag values).

import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const require = createRequire(import.meta.url);

const themes = require('daisyui/theme/object.js').default
  || require('daisyui/theme/object.js');

// ===== Classify themes from DaisyUI's color-scheme =====

const lightThemes = [];
const darkThemes = [];
for (const [name, theme] of Object.entries(themes)) {
  const scheme = theme['color-scheme'] || 'light';
  if (scheme.includes('dark')) {
    darkThemes.push(name);
  } else {
    lightThemes.push(name);
  }
}

// ===== oklch → hex conversion =====

function parseOklch(str) {
  const m = str.match(/oklch\(([0-9.]+)%?\s+([0-9.]+)\s+([0-9.]+)\)/);
  if (!m) return null;
  let L = parseFloat(m[1]);
  if (L > 1) L /= 100;
  return { L, C: parseFloat(m[2]), h: parseFloat(m[3]) };
}

function oklchToHex(oklchStr) {
  const p = parseOklch(oklchStr);
  if (!p) return null;
  const hRad = p.h * Math.PI / 180;
  const a = p.C * Math.cos(hRad);
  const b = p.C * Math.sin(hRad);

  const l_ = p.L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = p.L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = p.L - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  const gamma = (x) => x >= 0.0031308 ? 1.055 * Math.pow(x, 1 / 2.4) - 0.055 : 12.92 * x;
  const clamp = (v) => Math.round(Math.min(255, Math.max(0, gamma(v) * 255)));
  return '#' + [clamp(r), clamp(g), clamp(bl)].map(v => v.toString(16).padStart(2, '0')).join('');
}

// ===== Simple extraction: light → primary, dark → base-100 =====

const metaColors = {};
for (const name of [...lightThemes, ...darkThemes]) {
  const theme = themes[name];
  const isDark = darkThemes.includes(name);
  const colorKey = isDark ? '--color-base-100' : '--color-primary';
  metaColors[name] = oklchToHex(theme[colorKey]) || '#000000';
}

// ===== Generate theme.js blocks =====

function buildMetaColorsBlock() {
  const lines = ['  var META_COLORS = {'];
  const all = [...lightThemes, ...darkThemes];
  for (let i = 0; i < all.length; i++) {
    const n = all[i];
    const comma = i < all.length - 1 ? ',' : '';
    const pad = n.length < 13 ? ' '.repeat(13 - n.length) : ' ';
    lines.push(`    ${n}:${pad}'${metaColors[n]}'${comma}`);
  }
  lines.push('  };');
  return lines.join('\n');
}

function buildThemeArrays() {
  const fmt = (arr) => arr.map(n => `'${n}'`).join(', ');
  // Wrap at ~90 chars
  function wrapArray(varName, arr, indent) {
    const items = arr.map(n => `'${n}'`);
    const lines = [`${indent}var ${varName} = [`];
    let current = indent + '  ';
    for (let i = 0; i < items.length; i++) {
      const item = items[i] + (i < items.length - 1 ? ', ' : '');
      if (current.length + item.length > 90) {
        lines.push(current);
        current = indent + '  ' + item;
      } else {
        current += item;
      }
    }
    lines.push(current);
    lines.push(`${indent}];`);
    return lines.join('\n');
  }
  return {
    themeJs: wrapArray('LIGHT_THEMES', lightThemes, '  ') + '\n' + wrapArray('DARK_THEMES', darkThemes, '  '),
    bootstrap: wrapArray('lt', lightThemes, '      ') + '\n' + wrapArray('dt', darkThemes, '      '),
  };
}

function buildBootstrapMc() {
  const all = [...lightThemes, ...darkThemes];
  const entries = all.map(n => `${n}:'${metaColors[n]}'`);
  const lines = ['      var mc = {'];
  let current = '        ';
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i] + (i < entries.length - 1 ? ',' : '');
    if (current.length + entry.length > 95) {
      lines.push(current);
      current = '        ' + entry;
    } else {
      current += entry;
    }
  }
  lines.push(current);
  lines.push('      };');
  return lines.join('\n');
}

// ===== Generate navbar theme buttons =====

function buildNavbarSection(themeList, existingButtons) {
  // Reuse existing button metadata (display name, descriptor) if available
  const lines = [];
  for (const name of themeList) {
    if (existingButtons[name]) {
      lines.push(existingButtons[name]);
    } else {
      // New theme not yet in navbar — generate with capitalized name
      const display = name.charAt(0).toUpperCase() + name.slice(1);
      lines.push(`              <li><button type="button" data-theme-pick="${name}" class="w-full text-left px-4 py-2.5 text-sm text-base-content hover:bg-base-200 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px] min-h-11 flex items-center gap-2 rounded-lg"><span class="theme-check invisible text-primary text-xs">&#10003;</span><span>${display}</span></button></li>`);
    }
  }
  return lines.join('\n');
}

function parseNavbarButtons(html) {
  // Extract all theme buttons as { themeName: fullHtmlLine }
  const buttons = {};
  const regex = /^.*data-theme-pick="([^"]+)".*$/gm;
  let match;
  while ((match = regex.exec(html)) !== null) {
    buttons[match[1]] = match[0];
  }
  return buttons;
}

// ===== Write files =====

const arrays = buildThemeArrays();

// 1. theme.js — update META_COLORS and theme arrays
let themeJs = readFileSync(join(root, 'public/theme.js'), 'utf8');
themeJs = themeJs.replace(
  /  var META_COLORS = \{[\s\S]*?\};/,
  buildMetaColorsBlock()
);
themeJs = themeJs.replace(
  /  var LIGHT_THEMES = \[[\s\S]*?\];\s*\n\s*var DARK_THEMES = \[[\s\S]*?\];/,
  arrays.themeJs
);
writeFileSync(join(root, 'public/theme.js'), themeJs);
console.log('Updated public/theme.js');

// 2. head-common.html — update mc color map and lt/dt arrays
let headHtml = readFileSync(join(root, 'partials/head-common.html'), 'utf8');
headHtml = headHtml.replace(
  /      var mc = \{[\s\S]*?\};/,
  buildBootstrapMc()
);
headHtml = headHtml.replace(
  /      var lt = \[[\s\S]*?\];\s*\n\s*var dt = \[[\s\S]*?\];/,
  arrays.bootstrap
);
writeFileSync(join(root, 'partials/head-common.html'), headHtml);
console.log('Updated partials/head-common.html');

// 3. navbar.html — redistribute theme buttons between light/dark sections
let navbarHtml = readFileSync(join(root, 'partials/navbar.html'), 'utf8');
const existingButtons = parseNavbarButtons(navbarHtml);
const lightSection = buildNavbarSection(lightThemes, existingButtons);
const darkSection = buildNavbarSection(darkThemes, existingButtons);
navbarHtml = navbarHtml.replace(
  /(<!-- Light themes \(visible when in light mode\) -->\s*<li class="theme-list-light">\s*<ul[^>]*>)\n[\s\S]*?(<\/ul>\s*<\/li>\s*<!-- Dark themes \(visible when in dark mode\) -->\s*<li class="theme-list-dark[^"]*">\s*<ul[^>]*>)\n[\s\S]*?(<\/ul>\s*<\/li>)/,
  `$1\n${lightSection}\n$2\n${darkSection}\n            $3`
);
writeFileSync(join(root, 'partials/navbar.html'), navbarHtml);
console.log('Updated partials/navbar.html');

// 4. index.html / project.html — update initial meta tag values
const defaultLightColor = metaColors['caramellatte'] || '#000000';
const defaultDarkColor = metaColors['coffee'] || '#261b25';

for (const htmlFile of ['index.html', 'project.html']) {
  const htmlPath = join(root, htmlFile);
  try {
    let html = readFileSync(htmlPath, 'utf8');
    html = html.replace(
      /(<meta name="theme-color" content=")#[0-9a-fA-F]{6}(" media="\(prefers-color-scheme: light\)")/,
      `$1${defaultLightColor}$2`
    );
    html = html.replace(
      /(<meta name="theme-color" content=")#[0-9a-fA-F]{6}(" media="\(prefers-color-scheme: dark\)")/,
      `$1${defaultDarkColor}$2`
    );
    writeFileSync(htmlPath, html);
    console.log(`Updated ${htmlFile}`);
  } catch (e) { /* skip missing files */ }
}

// Summary
console.log(`\nLight themes (${lightThemes.length}): ${lightThemes.join(', ')}`);
console.log(`Dark themes (${darkThemes.length}): ${darkThemes.join(', ')}`);
console.log('\nMeta colors:');
for (const n of [...lightThemes, ...darkThemes]) {
  const isDark = darkThemes.includes(n);
  console.log(`  ${n.padEnd(14)} ${isDark ? 'base-100' : 'primary'} ${metaColors[n]}`);
}
