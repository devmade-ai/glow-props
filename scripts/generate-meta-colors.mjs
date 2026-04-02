#!/usr/bin/env node

// Requirement: Auto-extract hex meta-color values from DaisyUI theme definitions
// Approach: Read oklch colors from daisyui/theme/object.js, convert to hex, apply
//   selection heuristic (dark themes → base-100, light themes → primary if L ≤ 50%,
//   else neutral, with lightness safety check). Output updates theme.js and
//   head-common.html so the maps stay in sync automatically.
// Why not runtime conversion: Inline bootstrap script can't import libraries;
//   meta theme-color needs a static hex value. Build-time extraction is the only option.
// Alternative: Manual hex approximations — rejected, tedious to maintain when DaisyUI
//   updates themes.

import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const require = createRequire(import.meta.url);

// Load DaisyUI theme definitions
const themes = require('daisyui/theme/object.js').default
  || require('daisyui/theme/object.js');

// Derive light/dark from DaisyUI's own color-scheme property
const LIGHT_THEMES = [];
const DARK_THEMES = [];
for (const [name, theme] of Object.entries(themes)) {
  const scheme = theme['color-scheme'] || 'light';
  if (scheme.includes('dark')) {
    DARK_THEMES.push(name);
  } else {
    LIGHT_THEMES.push(name);
  }
}

// ===== oklch → hex conversion =====

function parseOklch(str) {
  const m = str.match(/oklch\(([0-9.]+)%?\s+([0-9.]+)\s+([0-9.]+)\)/);
  if (!m) return null;
  let L = parseFloat(m[1]);
  if (L > 1) L /= 100; // normalize percentage to 0–1
  return { L, C: parseFloat(m[2]), h: parseFloat(m[3]) };
}

function oklchToLinearRgb(L, C, h) {
  const hRad = h * Math.PI / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  // oklab → LMS (cubed intermediate)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  // LMS → linear sRGB
  return {
    r: +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    g: -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    b: -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3,
  };
}

function linearToSrgb(x) {
  return x >= 0.0031308 ? 1.055 * Math.pow(x, 1 / 2.4) - 0.055 : 12.92 * x;
}

function oklchToHex(oklchStr) {
  const parsed = parseOklch(oklchStr);
  if (!parsed) return null;
  const { r, g, b } = oklchToLinearRgb(parsed.L, parsed.C, parsed.h);
  const clamp = (v) => Math.round(Math.min(255, Math.max(0, linearToSrgb(v) * 255)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}

// Relative luminance (WCAG) from hex — used to check if a color is too light
function hexToRelativeLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

// ===== Color selection =====

// Max lightness threshold: colors above this produce invisible white status bar text.
// Relative luminance 0.2 ≈ oklch L ~50%. Conservative to ensure white text legibility.
const MAX_LUMINANCE = 0.2;

function selectMetaColor(themeName, theme) {
  const isDark = DARK_THEMES.includes(themeName);
  const primary = theme['--color-primary'];
  const neutral = theme['--color-neutral'];
  const base100 = theme['--color-base-100'];
  const baseContent = theme['--color-base-content'];

  if (isDark) {
    // Dark themes: base-100 is always dark enough
    return { hex: oklchToHex(base100), source: 'base-100' };
  }

  // Light theme: try primary first
  const primaryHex = oklchToHex(primary);
  if (primaryHex && hexToRelativeLuminance(primaryHex) <= MAX_LUMINANCE) {
    return { hex: primaryHex, source: 'primary' };
  }

  // Primary too light — try neutral
  const neutralHex = oklchToHex(neutral);
  if (neutralHex && hexToRelativeLuminance(neutralHex) <= MAX_LUMINANCE) {
    return { hex: neutralHex, source: 'neutral' };
  }

  // Neutral also too light — try base-content (text color, always dark on light themes)
  if (baseContent) {
    const baseContentHex = oklchToHex(baseContent);
    if (baseContentHex && hexToRelativeLuminance(baseContentHex) <= MAX_LUMINANCE) {
      return { hex: baseContentHex, source: 'base-content' };
    }
  }

  // Final fallback
  return { hex: '#000000', source: 'fallback' };
}

// ===== Generate the map =====

const results = {};
const allThemes = [...LIGHT_THEMES, ...DARK_THEMES];

for (const name of allThemes) {
  const theme = themes[name];
  if (!theme) {
    console.warn(`Warning: theme "${name}" not found in DaisyUI`);
    continue;
  }
  const { hex, source } = selectMetaColor(name, theme);
  results[name] = { hex, source, isDark: DARK_THEMES.includes(name) };
}

// ===== Format output blocks =====

function buildThemeJsBlock() {
  const lines = [];
  lines.push('  var META_COLORS = {');

  // Group: Light — primary
  const lightPrimary = LIGHT_THEMES.filter(n => results[n]?.source === 'primary');
  const lightNeutral = LIGHT_THEMES.filter(n => results[n]?.source === 'neutral');
  const lightOther = LIGHT_THEMES.filter(n => results[n] && !['primary', 'neutral'].includes(results[n].source));
  const darkThemes = DARK_THEMES.filter(n => results[n]);

  lines.push('    // Light themes — primary color (dark enough for white status bar text)');
  for (const n of lightPrimary) {
    lines.push(`    ${formatEntry(n, results[n])}`);
  }

  if (lightNeutral.length || lightOther.length) {
    lines.push('    // Light themes — neutral/fallback (primary too light for white text)');
    for (const n of [...lightNeutral, ...lightOther]) {
      lines.push(`    ${formatEntry(n, results[n])}`);
    }
  }

  lines.push('    // Dark themes — base-100 background');
  for (let i = 0; i < darkThemes.length; i++) {
    const n = darkThemes[i];
    const isLast = i === darkThemes.length - 1;
    lines.push(`    ${formatEntry(n, results[n], isLast)}`);
  }

  lines.push('  };');
  return lines.join('\n');
}

function formatEntry(name, info, isLast = false) {
  const comma = isLast ? '' : ',';
  const pad = name.length < 13 ? ' '.repeat(13 - name.length) : ' ';
  return `${name}:${pad}'${info.hex}'${comma} // ${info.source}`;
}

function buildBootstrapBlock() {
  // Compact single-object format for inline script
  const entries = allThemes
    .filter(n => results[n])
    .map(n => `${n}:'${results[n].hex}'`);

  // Wrap at ~90 chars per line
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

// ===== Write files =====

// Update theme.js
const themeJsPath = join(root, 'public/theme.js');
let themeJs = readFileSync(themeJsPath, 'utf8');
const themeJsBlock = buildThemeJsBlock();
themeJs = themeJs.replace(
  /  var META_COLORS = \{[\s\S]*?\};/,
  themeJsBlock
);
writeFileSync(themeJsPath, themeJs);
console.log('Updated public/theme.js');

// Update head-common.html
const headPath = join(root, 'partials/head-common.html');
let headHtml = readFileSync(headPath, 'utf8');
const bootstrapBlock = buildBootstrapBlock();
headHtml = headHtml.replace(
  /      var mc = \{[\s\S]*?\};/,
  bootstrapBlock
);
writeFileSync(headPath, headHtml);
console.log('Updated partials/head-common.html');

// Print summary
console.log('\nGenerated META_COLORS:');
for (const name of allThemes) {
  if (!results[name]) continue;
  const { hex, source, isDark } = results[name];
  const mode = isDark ? 'D' : 'L';
  console.log(`  ${name.padEnd(14)} ${mode} ${source.padEnd(12)} ${hex}`);
}

// Update initial meta tag values in index.html and project.html
// Default light theme: caramellatte, default dark theme: coffee
const defaultLightColor = results['caramellatte']?.hex || '#000000';
const defaultDarkColor = results['coffee']?.hex || '#261b25';
console.log(`\nDefault meta colors: light=${defaultLightColor} dark=${defaultDarkColor}`);

for (const htmlFile of ['index.html', 'project.html']) {
  const htmlPath = join(root, htmlFile);
  try {
    let html = readFileSync(htmlPath, 'utf8');
    // Update light scheme meta tag
    html = html.replace(
      /(<meta name="theme-color" content=")#[0-9a-fA-F]{6}(" media="\(prefers-color-scheme: light\)")/,
      `$1${defaultLightColor}$2`
    );
    // Update dark scheme meta tag
    html = html.replace(
      /(<meta name="theme-color" content=")#[0-9a-fA-F]{6}(" media="\(prefers-color-scheme: dark\)")/,
      `$1${defaultDarkColor}$2`
    );
    writeFileSync(htmlPath, html);
    console.log(`Updated ${htmlFile}`);
  } catch (e) {
    // File may not exist — skip
  }
}
