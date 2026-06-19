// Production image pipeline for the Stefania Díaz portfolio.
// Reads the (intact) originals in Resources/ and writes web-safe, kebab-case,
// optimized copies into assets/img/. The HTML only ever references assets/img/.
//
// Run:  node tools/optimize-images.mjs
//
// To add a new image: add a row to `jobs` and re-run. Originals are never modified.
import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets', 'img');
await mkdir(outDir, { recursive: true });
await mkdir(path.join(outDir, 'before-after'), { recursive: true });

// [sourceRelPath, outName, format, maxEdge, quality]
const jobs = [
  // Portrait — kept as WebP (the source is .webp), square.
  ['Resources/profile pic.webp', 'portrait', 'webp', 1200, 82],

  // Section accents.
  ['Resources/4.jpeg', 'tools-flatlay', 'jpeg', 1800, 82],          // Metodología
  ['Resources/3.jpg', 'enfoque-museum', 'jpeg', 1600, 82],          // Enfoque (Monet)
];

const kb = (b) => (b / 1024).toFixed(0).padStart(5) + ' KB';
let totalIn = 0, totalOut = 0;

for (const [rel, name, format, maxEdge, quality] of jobs) {
  const src = path.join(root, rel);
  const out = path.join(outDir, `${name}.${format === 'jpeg' ? 'jpg' : format}`);
  try {
    const meta = await sharp(src).metadata();
    let pipe = sharp(src)
      .rotate() // bake EXIF orientation
      .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true });
    pipe = format === 'webp'
      ? pipe.webp({ quality })
      : pipe.jpeg({ quality, mozjpeg: true, progressive: true });
    const info = await pipe.toFile(out);
    const inBytes = (await stat(src)).size;
    const outBytes = (await stat(out)).size;
    totalIn += inBytes; totalOut += outBytes;
    console.log(
      `${name.padEnd(32)} ${String(info.width).padStart(4)}x${String(info.height).padEnd(4)} ` +
      `${kb(inBytes)} -> ${kb(outBytes)}  (${(meta.width)}x${meta.height} src)`
    );
  } catch (e) {
    console.error(`FAILED ${name}: ${e.message}`);
  }
}

console.log('-'.repeat(72));
console.log(`TOTAL ${kb(totalIn)} -> ${kb(totalOut)}  (${jobs.length} images, saved ${((1 - totalOut / totalIn) * 100).toFixed(0)}%)`);
console.log('Assets written to assets/img/');
