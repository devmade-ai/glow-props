// Requirement: a link to this site pasted into a chat unfurled with the square
//   512px app icon as its image. Every client expecting the 1.91:1 Open Graph
//   ratio crops or letterboxes that, and the result reads as a mistake rather
//   than a brand. See docs/implementations/DISCOVERABILITY.md.
// Approach: one SVG at 1200×630 built from the SAME four squares as
//   assets/icon-source.svg, rasterized with sharp (already a devDependency for
//   generate-icons.mjs). The colours are PARSED from that file rather than
//   retyped, so the card cannot drift from the icon.
// Alternatives:
//   - Keep pointing og:image at icon-512.png: rejected — that is the defect.
//   - Put "devmade-ai" in the card: rejected. sharp rasterizes SVG text through
//     fontconfig, which cannot load the site's webfonts, so the wordmark would
//     silently render in a system font and ship in the wrong typeface. The name
//     is already in og:title, which every unfurler renders in its own UI.
//   - Resolve a DaisyUI theme colour for the background: rejected — the icon is
//     deliberately theme-independent ("carries its own identity, so it won't
//     clash with any theme combo"), so the card is neutral for the same reason.
//     A hairline border keeps it from disappearing into a white chat bubble.
//
// Run: npm run generate:og-image
// Output: public/assets/images/og-image.png (committed)

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const WIDTH = 1200
const HEIGHT = 630

// The four brand hexes, read from the icon so there is one source of truth.
// Order is the icon's: blue (top-left), emerald (top-right), amber
// (bottom-left), violet (bottom-right).
const iconSvg = readFileSync(join(ROOT, 'assets/icon-source.svg'), 'utf8')
const colors = [...iconSvg.matchAll(/<rect[^>]*fill="(#[0-9a-fA-F]{6})"/g)].map((m) => m[1])
if (colors.length !== 4) {
  throw new Error(
    `[generate-og-image] expected 4 rect fills in assets/icon-source.svg, found ${colors.length}. ` +
    'The card is built from the icon; update this script if the mark changed.',
  )
}

const SURFACE = '#ffffff'
const HAIRLINE = '#e7e2dc'

// The icon's 2×2 grid, scaled for a landscape card: 360px squares with a 48px
// gap on a 1024 canvas become 150px squares with a 20px gap here, centred.
const TILE = 150
const GAP = 20
const RADIUS = 20
const GRID = TILE * 2 + GAP
const GX = (WIDTH - GRID) / 2
const GY = (HEIGHT - GRID) / 2

const tile = (col, row, fill) =>
  `<rect x="${GX + col * (TILE + GAP)}" y="${GY + row * (TILE + GAP)}" width="${TILE}" height="${TILE}" rx="${RADIUS}" fill="${fill}"/>`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" shape-rendering="geometricPrecision">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${SURFACE}"/>
  <rect x="24" y="24" width="${WIDTH - 48}" height="${HEIGHT - 48}" rx="20" fill="none" stroke="${HAIRLINE}" stroke-width="3"/>
  ${tile(0, 0, colors[0])}
  ${tile(1, 0, colors[1])}
  ${tile(0, 1, colors[2])}
  ${tile(1, 1, colors[3])}
</svg>`

const png = await sharp(Buffer.from(svg), { density: 300 })
  .resize(WIDTH, HEIGHT)
  .png({ compressionLevel: 9 })
  .toBuffer()

writeFileSync(join(ROOT, 'public/assets/images/og-image.png'), png)
console.log(`og-image.png: ${WIDTH}×${HEIGHT}, ${png.length} bytes, colours ${colors.join(' ')}`)
