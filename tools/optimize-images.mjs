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

// [sourceRelPath, outName, format, size, quality, crop?, rotate?]
// size   → número: lado máximo con fit:'inside' (conserva la proporción de la fuente).
//          [w,h]:  recorte exacto a w×h con fit:'cover'. Obligatorio en los pares
//          antes/después, que DEBEN medir lo mismo (regla de intervenciones.js).
// crop   → sharp.extract({left,top,width,height}) sobre el ORIGINAL, antes del resize.
// rotate → grados horarios cuando la toma está mal orientada. Sustituye la
//          auto-orientación EXIF (semántica de sharp): solo para fuentes sin EXIF.
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

  // --- Intervenciones ---------------------------------------------------------
  // Pares antes/después: mismo [w,h] en las dos filas del par, siempre.

  // OG/7 — Omar Rayo, «Exit». El después está enmarcado y el antes no (mismo caso
  // que PL&M/6): no se recorta el marco, solo se igualan las dimensiones. 7/5 es la
  // proporción natural de las dos tomas (1.404 / 1.433); 4/3 o 3/2 comerían el marco.
  ['Resources/Intervención/Obra Gráfica/7/Antes.jpg',   'intervenciones/grafica/p7/antes',   'jpeg', [1200, 857], 84],
  ['Resources/Intervención/Obra Gráfica/7/Despúes.jpg', 'intervenciones/grafica/p7/despues', 'jpeg', [1200, 857], 84],

  // PL&M/7 — Alipio Jaramillo. Las dos tomas son 1512×1512 con relleno blanco y la
  // obra descentrada ~19 px en vertical entre una y otra. El crop encuadra la obra
  // (bbox medido) más un margen mínimo hasta 7/5: elimina el desfase de encuadre y
  // el blanco sobrante, dejando la pintura registrada en las dos.
  ['Resources/Intervención/Pintura sobre Lienzo y Madera/7/Antes.jpg',   'intervenciones/lienzoMadera/p7/antes',   'jpeg', [1200, 857], 84, { left: 23, top: 253, width: 1466, height: 1047 }],
  ['Resources/Intervención/Pintura sobre Lienzo y Madera/7/Despúes.jpg', 'intervenciones/lienzoMadera/p7/despues', 'jpeg', [1200, 857], 84, { left: 16, top: 232, width: 1469, height: 1049 }],

  // OG/2a — Warhol, anverso «antes»: mismo artefacto de exportación que el par b
  // (2560 de alto, 1877 vs 1920 de ancho, hoja centrada en ambas). Aquí NO sirve
  // pairSync: el «antes» ya es el archivo estrecho (880 vs 900), así que el área
  // común es 880 y el bucle recortaría el «después». Se regenera el «antes» a
  // 900×1200 con fit:'cover', que recorta 2.24% de alto (13.7 px por lado, la hoja
  // empieza en 1.9%: no se toca) y deja el par igualado tocando solo esta imagen.
  // Es un no-op visual: el contenedor 3/4 con object-fit:cover ya recortaba esa
  // misma banda de alto al pintar el 880×1200.
  ['Resources/Intervención/Obra Gráfica/2/Antes1.png', 'intervenciones/grafica/p2/a-antes', 'jpeg', [900, 1200], 84],

  // OG/2b — Warhol, reverso «antes»: la toma está a 180° respecto del «después»
  // (la mancha verde y la etiqueta del dorso caían invertidas al arrastrar el
  // handle). Se regenera desde el original con rotate 180; el resto del proyecto
  // (par a y este «después») se deja como está.
  ['Resources/Intervención/Obra Gráfica/2/Antes2.png', 'intervenciones/grafica/p2/b-antes', 'jpeg', 1200, 84, null, 180],
];

const kb = (b) => (b / 1024).toFixed(0).padStart(5) + ' KB';
let totalIn = 0, totalOut = 0;

for (const [rel, name, format, size, quality, crop, rotate] of jobs) {
  const src = path.join(root, rel);
  const out = path.join(outDir, `${name}.${format === 'jpeg' ? 'jpg' : format}`);
  await mkdir(path.dirname(out), { recursive: true });
  try {
    const meta = await sharp(src).metadata();
    let pipe = sharp(src).rotate(); // bake EXIF orientation
    if (crop) pipe = pipe.extract(crop);
    if (rotate) pipe = pipe.rotate(rotate);
    pipe = Array.isArray(size)
      ? pipe.resize({ width: size[0], height: size[1], fit: 'cover' })
      : pipe.resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true });
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
  // gr/p2b — verso del Warhol: los dos originales se exportaron a 2560 de alto y
  // 1960 vs 1920 de ancho, con la hoja centrada en ambos (centros al 49.55% y
  // 49.65%): artefacto de encuadre, no desregistro. Recorta solo el 'antes'
  // (919→900); el 'despues' ya mide 900 y el bucle lo salta. Es además un no-op
  // visual: el contenedor 3/4 con object-fit:cover ya recortaba esos 19 px.
  ['assets/img/intervenciones/grafica/p2/b-antes.jpg', 'assets/img/intervenciones/grafica/p2/b-despues.jpg'],
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
