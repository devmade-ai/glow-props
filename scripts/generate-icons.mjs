import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SVG_SOURCE = join(ROOT, 'assets', 'icon-source.svg');
const IMAGES_DIR = join(ROOT, 'public', 'assets', 'images');

// Requirement: Generate icon PNGs from SVG source for favicon, PWA manifest, and social sharing
// Approach: Sharp at 400 DPI for crisp anti-aliasing, then downscale to target sizes
// Sizes: favicon (48), PWA manifest (192, 512), master (1024), maskable (1024)
const SVG_DENSITY = 400;
const ICONS = [
  { name: 'favicon.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-1024.png', size: 1024 },
];

// Requirement: the manifest's maskable icon must be full-bleed AND keep the
//   mark inside the maskable safe zone — a CIRCLE of radius 40% of the canvas
//   (410px at 1024), not a square. The mark's outer corner arcs reach ~523px
//   from center at full size (rects at 128→896, rx 48: corner-arc centers 336px
//   out diagonally → 336·√2 + 48), so circular Android masks (Pixel launcher
//   default) crop all four corners unless the mark is scaled down.
// Approach: render the mark at MASKABLE_MARK px (≤ 1024·409.6/523.2 ≈ 801;
//   780 leaves ~3% margin) and composite it centered on a white 1024 canvas.
// Alternative: put the background rect back in the SVG — rejected, the favicon
//   and navbar mark are deliberately transparent so they sit on any theme.
const MASKABLE = { name: 'icon-1024-maskable.png', size: 1024, background: '#ffffff' };
const MASKABLE_MARK = 780;

async function generate() {
  const svgBuffer = readFileSync(SVG_SOURCE);
  mkdirSync(IMAGES_DIR, { recursive: true });

  for (const icon of ICONS) {
    await sharp(svgBuffer, { density: SVG_DENSITY })
      .resize(icon.size, icon.size)
      .png()
      .toFile(join(IMAGES_DIR, icon.name));
    console.log(`  ${icon.name} (${icon.size}x${icon.size})`);
  }

  const mark = await sharp(svgBuffer, { density: SVG_DENSITY })
    .resize(MASKABLE_MARK, MASKABLE_MARK)
    .png()
    .toBuffer();
  await sharp({
    create: { width: MASKABLE.size, height: MASKABLE.size, channels: 4, background: MASKABLE.background },
  })
    .composite([{ input: mark, gravity: 'centre' }])
    .flatten({ background: MASKABLE.background })
    .png()
    .toFile(join(IMAGES_DIR, MASKABLE.name));
  console.log(`  ${MASKABLE.name} (${MASKABLE.size}x${MASKABLE.size}, full-bleed, mark ${MASKABLE_MARK}px in safe zone)`);

  console.log(`Done — ${ICONS.length + 1} icons generated.`);
}

generate().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
