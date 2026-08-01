#!/usr/bin/env node

// Requirement: Auto-generate all theme metadata from DaisyUI theme definitions
// What: Single source of truth for theme lists, meta colors, and navbar buttons.
//   Reads daisyui/theme/object.js → derives light/dark from color-scheme →
//   converts primary (light) or base-100 (dark) oklch → hex → writes everything.
// Updates: theme.js, head-common.html, navbar.html, index.html, project.html

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

function oklchToHex(oklchStr) {
  const m = oklchStr.match(/oklch\(([0-9.]+)%?\s+([0-9.]+)\s+([0-9.]+)\)/);
  if (!m) return null;
  let L = parseFloat(m[1]);
  if (L > 1) L /= 100;
  const C = parseFloat(m[2]);
  const hRad = parseFloat(m[3]) * Math.PI / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const r = +4.0767416621 * l_**3 - 3.3077115913 * m_**3 + 0.2309699292 * s_**3;
  const g = -1.2684380046 * l_**3 + 2.6097574011 * m_**3 - 0.3413193965 * s_**3;
  const bl = -0.0041960863 * l_**3 - 0.7034186147 * m_**3 + 1.7076147010 * s_**3;

  const gamma = (x) => x >= 0.0031308 ? 1.055 * Math.pow(x, 1 / 2.4) - 0.055 : 12.92 * x;
  const clamp = (v) => Math.round(Math.min(255, Math.max(0, gamma(v) * 255)));
  return '#' + [clamp(r), clamp(g), clamp(bl)].map(v => v.toString(16).padStart(2, '0')).join('');
}

// ===== Extract meta colors: light → primary, dark → base-100 =====

const metaColors = {};
for (const name of [...lightThemes, ...darkThemes]) {
  const theme = themes[name];
  const colorKey = darkThemes.includes(name) ? '--color-base-100' : '--color-primary';
  metaColors[name] = oklchToHex(theme[colorKey]) || '#000000';
}

// ===== Output formatters =====

function wrapArray(varName, arr, indent) {
  const lines = [`${indent}var ${varName} = [`];
  let current = indent + '  ';
  for (let i = 0; i < arr.length; i++) {
    const item = `'${arr[i]}'` + (i < arr.length - 1 ? ', ' : '');
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

function buildNavbarButtons(themeList) {
  const btnClass = 'w-full text-left px-4 py-2.5 text-sm text-base-content hover:bg-base-200 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px] min-h-11 flex items-center gap-2 rounded-lg';
  return themeList.map(name => {
    const display = name.charAt(0).toUpperCase() + name.slice(1);
    return `              <li><button type="button" data-theme-pick="${name}" class="${btnClass}"><span class="theme-check invisible text-primary text-xs">&#10003;</span><span>${display}</span></button></li>`;
  }).join('\n');
}

// ===== Write files =====

// 1. theme.js
let themeJs = readFileSync(join(root, 'public/theme.js'), 'utf8');
themeJs = themeJs.replace(
  /  var META_COLORS = \{[\s\S]*?\};/,
  buildMetaColorsBlock()
);
themeJs = themeJs.replace(
  /  var LIGHT_THEMES = \[[\s\S]*?\];\s*\n\s*var DARK_THEMES = \[[\s\S]*?\];/,
  wrapArray('LIGHT_THEMES', lightThemes, '  ') + '\n' + wrapArray('DARK_THEMES', darkThemes, '  ')
);
writeFileSync(join(root, 'public/theme.js'), themeJs);
console.log('Updated public/theme.js');

// 2. head-common.html
let headHtml = readFileSync(join(root, 'partials/head-common.html'), 'utf8');
headHtml = headHtml.replace(/      var mc = \{[\s\S]*?\};/, buildBootstrapMc());
headHtml = headHtml.replace(
  /      var lt = \[[\s\S]*?\];\s*\n\s*var dt = \[[\s\S]*?\];/,
  wrapArray('lt', lightThemes, '      ') + '\n' + wrapArray('dt', darkThemes, '      ')
);
writeFileSync(join(root, 'partials/head-common.html'), headHtml);
console.log('Updated partials/head-common.html');

// 3. navbar.html
let navbarHtml = readFileSync(join(root, 'partials/navbar.html'), 'utf8');
navbarHtml = navbarHtml.replace(
  /(<!-- Light themes \(visible when in light mode\) -->\s*<li class="theme-list-light">\s*<ul[^>]*>)\n[\s\S]*?(<\/ul>\s*<\/li>\s*<!-- Dark themes \(visible when in dark mode\) -->\s*<li class="theme-list-dark[^"]*">\s*<ul[^>]*>)\n[\s\S]*?(<\/ul>\s*<\/li>)/,
  `$1\n${buildNavbarButtons(lightThemes)}\n$2\n${buildNavbarButtons(darkThemes)}\n            $3`
);
writeFileSync(join(root, 'partials/navbar.html'), navbarHtml);
console.log('Updated partials/navbar.html');

// 4. index.html / pattern.html / project.html — initial meta tag values.
// All three pages carry the theme-color pair; missing one lets it silently
// drift on the next DaisyUI update.
const defaultLightColor = metaColors['caramellatte'] || '#000000';
const defaultDarkColor = metaColors['coffee'] || '#261b25';
for (const htmlFile of ['index.html', 'pattern.html', 'project.html']) {
  try {
    const htmlPath = join(root, htmlFile);
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
console.log(`\nLight (${lightThemes.length}): ${lightThemes.join(', ')}`);
console.log(`Dark (${darkThemes.length}): ${darkThemes.join(', ')}`);

