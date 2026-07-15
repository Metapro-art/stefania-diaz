// Production image pipeline for the Stefania Díaz portfolio.
// Reads the (intact) originals in Resources/ and writes web-safe, kebab-case,
// optimized copies into assets/img/. The HTML only ever references assets/img/.
//
// Run:  node tools/optimize-images.mjs
//
// To add a new image: add a row to `jobs` and re-run. Originals are never modified.
import sharp from 'sharp';
import { mkdir, stat, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets', 'img');
await mkdir(outDir, { recursive: true });
await mkdir(path.join(outDir, 'before-after'), { recursive: true });
await mkdir(path.join(outDir, 'hero'), { recursive: true });

// [sourceRelPath, outName, format, maxEdge, quality, crop?]
// crop → sharp.extract({left,top,width,height}) sobre el ORIGINAL, antes del resize.
const jobs = [
  // Portrait — kept as WebP (the source is .webp), square.
  ['Resources/profile pic.webp', 'portrait', 'webp', 1200, 82],

  // Section accents.
  ['Resources/4.jpeg', 'tools-flatlay', 'jpeg', 1800, 82],          // Metodología
  ['Resources/3.jpg', 'enfoque-museum', 'jpeg', 1600, 82],          // Enfoque (Monet)

  // Hero — capa fotográfica difuminada (fondo de .hero__photo; va con blur, comprimir fuerte).
  ['Resources/8.jpeg', 'hero/hero-taller', 'jpeg', 1280, 72],
  // Hero móvil (≤640px) — recorte VERTICAL compuesto alrededor del sujeto. Encuadre
  // bajo a pedido de la dueña: cara con visera y mano con pincel sobre la obra caen en
  // la banda que la máscara muestra (el prendedor queda fuera de cuadro — arriba no
  // cabían ambos sin mover la máscara). El horizontal en cover a 390px solo mostraba
  // el 43% del ancho: una tajada no es un taller.
  ['Resources/8.jpeg', 'hero/hero-taller-mobile', 'jpeg', 1200, 72, { left: 870, top: 440, width: 440, height: 760 }],
];

const kb = (b) => (b / 1024).toFixed(0).padStart(5) + ' KB';
let totalIn = 0, totalOut = 0;

for (const [rel, name, format, maxEdge, quality, crop] of jobs) {
  const src = path.join(root, rel);
  const out = path.join(outDir, `${name}.${format === 'jpeg' ? 'jpg' : format}`);
  try {
    const meta = await sharp(src).metadata();
    let pipe = sharp(src).rotate(); // bake EXIF orientation
    if (crop) pipe = pipe.extract(crop);
    pipe = pipe.resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true });
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

// --- Pair sync ---------------------------------------------------------------
// Ambas imágenes de un par antes/después DEBEN medir lo mismo (regla de
// assets/data/intervenciones.js): con object-fit:cover, proporciones distintas se
// recortan distinto y la obra "salta" al arrastrar el handle del slider.
// AQUÍ SOLO van pares diagnosticados como artefacto de exportación (fotos
// alineadas, offset ≈ 0 tras recorte común centrado). Los pares con desregistro
// fotográfico real NO se recortan: igualar píxeles sin registro sería maquillaje.
const pairSync = [
  // gr/p6b — verso Kraft de Wolff: alineado (offset 0.28%), desfase 1061 vs 1035 de ancho.
  ['assets/img/intervenciones/grafica/p6/b-antes.jpg', 'assets/img/intervenciones/grafica/p6/b-despues.jpg'],
];
for (const pair of pairSync) {
  const abs = pair.map((p) => path.join(root, p));
  const metas = await Promise.all(abs.map((p) => sharp(p).metadata()));
  const cw = Math.min(...metas.map((m) => m.width));
  const ch = Math.min(...metas.map((m) => m.height));
  for (let i = 0; i < abs.length; i++) {
    const m = metas[i];
    if (m.width === cw && m.height === ch) continue;
    // A buffer primero: en Windows, sharp mantiene abierto el archivo de entrada
    // y no se puede sobreescribir en el mismo paso.
    const buf = await sharp(await readFile(abs[i]))
      .extract({ left: Math.floor((m.width - cw) / 2), top: Math.floor((m.height - ch) / 2), width: cw, height: ch })
      .jpeg({ quality: 92, mozjpeg: true, progressive: true })
      .toBuffer();
    await writeFile(abs[i], buf);
    console.log(`pair-sync ${pair[i]}  ${m.width}x${m.height} -> ${cw}x${ch}`);
  }
}
