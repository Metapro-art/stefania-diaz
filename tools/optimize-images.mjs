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

  // Featured project — the real San Francisco de Asís polychrome sculpture.
  ['Resources/Intervenciones/Intervención/sanfrancisco.jpg', 'featured-sanfrancisco', 'jpeg', 1400, 84],

  // Institutional work cards (4:5 frames).
  ['Resources/11.jpeg', 'work-la-independencia', 'jpeg', 1600, 82],
  ['Resources/2.jpg', 'work-av-villas', 'jpeg', 1600, 82],
  ['Resources/Intervenciones/Conservación Preventiva/1.jpeg', 'work-banco-bogota', 'jpeg', 1600, 82],

  // Interventions gallery (6).
  ['Resources/6.jpeg', 'gallery-gilding-reintegration', 'jpeg', 1600, 82],
  ['Resources/Intervenciones/Intervención/no antes despues/2.jpg', 'gallery-painting-cleaning', 'jpeg', 1600, 82],
  ['Resources/Intervenciones/Intervención/no antes despues/3.jpg', 'gallery-paper-conservation', 'jpeg', 1600, 82],
  ['Resources/Intervenciones/Intervención/no antes despues/4.png', 'gallery-painting-facing', 'jpeg', 1600, 82],
  ['Resources/5.jpeg', 'gallery-paint-examination', 'jpeg', 1600, 82],
  ['Resources/Intervenciones/Conservación Preventiva/2.jpeg', 'gallery-collection-handling', 'jpeg', 1600, 82],

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
// Small thumbnails for the gallery grid tiles (the lightbox still loads the full-res file).
const thumbs = [
  'gallery-gilding-reintegration',
  'gallery-painting-cleaning',
  'gallery-paper-conservation',
  'gallery-painting-facing',
  'gallery-paint-examination',
  'gallery-collection-handling',
];
console.log('-'.repeat(72));
for (const name of thumbs) {
  const src = path.join(outDir, name + '.jpg');
  const out = path.join(outDir, name + '-thumb.jpg');
  try {
    const info = await sharp(src).resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(out);
    const outBytes = (await stat(out)).size;
    console.log(`${(name + '-thumb').padEnd(32)} ${String(info.width).padStart(4)}x${String(info.height).padEnd(4)} ${kb(outBytes)}`);
  } catch (e) {
    console.error(`FAILED ${name}-thumb: ${e.message}`);
  }
}

console.log('-'.repeat(72));
console.log(`TOTAL ${kb(totalIn)} -> ${kb(totalOut)}  (${jobs.length} full images, saved ${((1 - totalOut / totalIn) * 100).toFixed(0)}%) + ${thumbs.length} thumbs`);
console.log('Assets written to assets/img/');
