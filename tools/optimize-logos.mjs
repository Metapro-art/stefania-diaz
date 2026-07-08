// One-shot logo pipeline for Fase 3 of the portfolio.
// Trims whitespace, resizes to web-safe max, and writes to assets/img/logos/.
// Run: node tools/optimize-logos.mjs
import sharp from 'sharp';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const logos = path.join(root, 'assets', 'img', 'logos');
const src = path.join(root, 'Resources', 'Logos');

async function kb(p) { return ((await stat(p)).size / 1024).toFixed(0) + ' KB'; }

async function process(inFile, outFile, { trim = false, max = 800 } = {}) {
  let pipe = sharp(inFile).rotate();
  if (trim) pipe = pipe.trim({ threshold: 15 });
  pipe = pipe.resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true });
  const info = await pipe.png({ compressionLevel: 9 }).toFile(outFile);
  const before = await kb(inFile);
  const after = await kb(outFile);
  console.log(`  ${path.basename(outFile).padEnd(32)} ${info.width}x${info.height}  ${before} → ${after}`);
  return info;
}

console.log('Logo pipeline');
console.log('─'.repeat(72));

// MAMBO: replace low-res (162×42) with high-res version, trim white border
await process(
  path.join(src, 'location00_810x.png'),
  path.join(logos, 'logo-mambo.png'),
  { trim: true, max: 800 }
);

// San Francisco: replace with higher-res JPG source, trim white, keep as PNG
await process(
  path.join(src, '247936779_101065825716972_7469754231359013122_n.jpg'),
  path.join(logos, 'logo-san-francisco.png'),
  { trim: true, max: 600 }
);

// La Independencia: new logo, dark navy badge — no trim (background is the brand)
await process(
  path.join(src, 'la independencia.png'),
  path.join(logos, 'logo-independencia.png'),
  { trim: false, max: 600 }
);

console.log('─'.repeat(72));
console.log('Done. Existing logos (externado, AGN, uptc) unchanged.');
