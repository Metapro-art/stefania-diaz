// Downscales every candidate source image into assets/img/_preview/ so they can
// be reviewed quickly for art direction. NOT the production pipeline — these are
// throwaway previews (gitignored). Final web-safe assets are produced by
// optimize-images.mjs once the image->section mapping is locked.
import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets', 'img', '_preview');
await mkdir(outDir, { recursive: true });

// [sourceRelativePath, previewName]
const sources = [
  ['Resources/profile pic.webp', 'portrait'],
  ['Resources/1.png', 'general-01'],
  ['Resources/2.jpg', 'general-02'],
  ['Resources/3.jpg', 'general-03'],
  ['Resources/4.jpeg', 'general-04'],
  ['Resources/5.jpeg', 'general-05'],
  ['Resources/6.jpeg', 'general-06'],
  ['Resources/7.jpeg', 'general-07'],
  ['Resources/8.jpeg', 'general-08'],
  ['Resources/9.jpeg', 'general-09'],
  ['Resources/10.jpeg', 'general-10'],
  ['Resources/11.jpeg', 'general-11'],
  ['Resources/Intervenciones/Intervención/no antes despues/1.jpg', 'intervention-01'],
  ['Resources/Intervenciones/Intervención/no antes despues/2.jpg', 'intervention-02'],
  ['Resources/Intervenciones/Intervención/no antes despues/3.jpg', 'intervention-03'],
  ['Resources/Intervenciones/Intervención/no antes despues/4.png', 'intervention-04'],
  ['Resources/Intervenciones/Intervención/no antes despues/5.png', 'intervention-05'],
  ['Resources/Intervenciones/Conservación Preventiva/1.jpeg', 'preventive-01'],
  ['Resources/Intervenciones/Conservación Preventiva/2.jpeg', 'preventive-02'],
];

const kb = (b) => (b / 1024).toFixed(0) + ' KB';

for (const [rel, name] of sources) {
  const src = path.join(root, rel);
  const out = path.join(outDir, name + '.jpg');
  try {
    const meta = await sharp(src).metadata();
    await sharp(src)
      .rotate() // respect EXIF orientation
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 72 })
      .toFile(out);
    const inBytes = (await stat(src)).size;
    const outBytes = (await stat(out)).size;
    console.log(
      `${name.padEnd(16)} ${String(meta.width).padStart(5)}x${String(meta.height).padEnd(5)} ` +
      `${kb(inBytes).padStart(9)} -> ${kb(outBytes).padStart(8)}  (${rel})`
    );
  } catch (e) {
    console.error(`FAILED ${name}: ${e.message}  (${rel})`);
  }
}
console.log('\nPreviews written to assets/img/_preview/');
