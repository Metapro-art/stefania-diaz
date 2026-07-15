// i18n audit for the Stefania Díaz portfolio. Three checks:
//   1. Fallbacks: every data-i18n / data-i18n-html / data-i18n-attr fallback baked
//      into index.html must match the runtime dictionary (I18N.es). A mismatch means
//      the pre-JS paint differs from the post-JS paint: content jumps (CLS) on slow
//      connections, and the two sources silently drift apart.
//   2. ES↔EN symmetry: every key must exist in both languages, and must not be
//      empty in only one of them (empty in both = intentionally blank field).
//   3. JS-resolved keys: every *_key / desc_keys value in assets/data/*.js must
//      exist (non-empty) in both languages — catches typos and missing translations
//      for text that has no data-i18n fallback in the HTML.
//
// Run:  node tools/check-i18n-sync.mjs   (or: npm run check:i18n)
// Exits 1 on any finding; the table shows key · lengths · delta · which check.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(path.join(root, 'index.html'), 'utf8');
const i18nSrc = readFileSync(path.join(root, 'assets', 'js', 'i18n.js'), 'utf8');

// i18n.js is a browser global (window.I18N = {...}); evaluate it with a stub window.
const windowStub = {};
new Function('window', i18nSrc)(windowStub);
const ES = windowStub.I18N.es;
const EN = windowStub.I18N.en;

const norm = (s) => s.replace(/\s+/g, ' ').trim();
const stripTags = (s) => s.replace(/<[^>]+>/g, '');

// innerHTML of the element whose opening tag ends at `openEnd` (tracks same-tag nesting).
function innerOf(tag, openEnd) {
  const re = new RegExp(`<${tag}\\b|</${tag}>`, 'g');
  re.lastIndex = openEnd;
  let depth = 1, m;
  while ((m = re.exec(html))) {
    if (m[0] === `</${tag}>`) { depth--; if (depth === 0) return html.slice(openEnd, m.index); }
    else depth++;
  }
  return null;
}

const issues = [];
const check = (key, htmlValue, dictValue, where) => {
  if (dictValue === undefined) { issues.push({ key, a: htmlValue, b: '', note: `clave ausente en I18N.es (${where})` }); return; }
  if (htmlValue !== dictValue) issues.push({ key, a: htmlValue, b: dictValue, note: where });
};

// data-i18n (textContent) and data-i18n-html (innerHTML)
for (const kind of ['data-i18n', 'data-i18n-html']) {
  const re = new RegExp(`<(\\w+)((?:[^>"]|"[^"]*")*?)\\s${kind}="([^"]+)"((?:[^>"]|"[^"]*")*?)>`, 'g');
  let m;
  while ((m = re.exec(html))) {
    const [full, tag, , key] = m;
    const inner = innerOf(tag, m.index + full.length);
    if (inner == null) { issues.push({ key, a: '', b: '', note: 'no se pudo parsear el elemento' }); continue; }
    const dict = ES[key];
    const a = kind === 'data-i18n' ? norm(stripTags(inner)) : norm(inner);
    const b = dict === undefined ? undefined : (kind === 'data-i18n' ? norm(stripTags(dict)) : norm(dict));
    check(key, a, b, kind);
  }
}

// data-i18n-attr="attr:key[,attr2:key2]" — compares each static attribute value.
const reAttr = /<(\w+)((?:[^>"]|"[^"]*")*?)\sdata-i18n-attr="([^"]+)"((?:[^>"]|"[^"]*")*?)>/g;
let m;
while ((m = reAttr.exec(html))) {
  const [, , pre, spec, post] = m;
  const attrs = `${pre} ${post}`;
  for (const pair of spec.split(',')) {
    const i = pair.indexOf(':');
    if (i < 0) continue;
    const attr = pair.slice(0, i).trim(), key = pair.slice(i + 1).trim();
    const mv = attrs.match(new RegExp(`\\s${attr}="([^"]*)"`));
    check(key, mv ? norm(mv[1]) : '', ES[key] === undefined ? undefined : norm(ES[key]), `attr ${attr}`);
  }
}

const fallbackChecks = (html.match(/data-i18n(?:-html)?="/g) || []).length +
  [...html.matchAll(/data-i18n-attr="([^"]+)"/g)].reduce((n, m) => n + m[1].split(',').length, 0);

// --- 2. Simetría ES↔EN --------------------------------------------------------
const allKeys = new Set([...Object.keys(ES), ...Object.keys(EN)]);
for (const key of allKeys) {
  const inEs = Object.prototype.hasOwnProperty.call(ES, key);
  const inEn = Object.prototype.hasOwnProperty.call(EN, key);
  if (!inEs || !inEn) { issues.push({ key, a: inEs ? ES[key] : '', b: inEn ? EN[key] : '', note: `simetría: falta en ${inEs ? 'en' : 'es'}` }); continue; }
  const emptyEs = !String(ES[key]).trim(), emptyEn = !String(EN[key]).trim();
  if (emptyEs !== emptyEn) issues.push({ key, a: ES[key], b: EN[key], note: `simetría: vacía solo en ${emptyEs ? 'es' : 'en'}` });
}

// --- 3. Claves resueltas en JS (assets/data/*.js) ------------------------------
const dataDir = path.join(root, 'assets', 'data');
const refs = new Map(); // key -> archivo(s)
for (const f of readdirSync(dataDir).filter(f => f.endsWith('.js'))) {
  const src = readFileSync(path.join(dataDir, f), 'utf8');
  for (const m of src.matchAll(/\b\w*_key\s*:\s*["']([^"']+)["']/g)) refs.set(m[1], f);
  for (const m of src.matchAll(/\bdesc_keys\s*:\s*\[([^\]]*)\]/g)) {
    for (const k of m[1].matchAll(/["']([^"']+)["']/g)) refs.set(k[1], f);
  }
}
for (const [key, file] of refs) {
  const okEs = Object.prototype.hasOwnProperty.call(ES, key) && String(ES[key]).trim();
  const okEn = Object.prototype.hasOwnProperty.call(EN, key) && String(EN[key]).trim();
  if (!okEs || !okEn) {
    issues.push({ key, a: okEs ? ES[key] : '', b: okEn ? EN[key] : '', note: `ref JS (${file}): ${!okEs && !okEn ? 'falta en es y en' : `falta o vacía en ${okEs ? 'en' : 'es'}`}` });
  }
}

const summary = `auditado: ${fallbackChecks} fallbacks HTML · ${allKeys.size} claves de simetría ES/EN · ${refs.size} referencias *_key en assets/data`;
if (!issues.length) {
  console.log(`✓ i18n en sincronía — ${summary}`);
  process.exit(0);
}

const W = { key: 22, len: 6 };
console.log('Desajustes i18n:\n');
console.log(`${'clave'.padEnd(W.key)} ${'ES/HTML'.padStart(W.len + 1)} ${'EN/dicc'.padStart(W.len + 1)} ${'delta'.padStart(W.len)}  chequeo`);
console.log('-'.repeat(W.key + 3 * (W.len + 1) + 30));
for (const { key, a, b, note } of issues) {
  const la = String(a ?? '').length, lb = String(b ?? '').length, delta = lb - la;
  console.log(`${key.padEnd(W.key)} ${String(la).padStart(W.len + 1)} ${String(lb).padStart(W.len + 1)} ${(delta >= 0 ? '+' + delta : String(delta)).padStart(W.len)}  ${note}`);
}
console.log(`\n✗ ${issues.length} hallazgo(s) — ${summary}`);
console.log('  El diccionario manda en runtime: iguala fallbacks, completa el idioma que falte o corrige la clave referenciada.');
process.exit(1);
