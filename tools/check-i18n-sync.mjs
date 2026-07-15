// i18n fallback audit for the Stefania Díaz portfolio.
// Compares every data-i18n / data-i18n-html / data-i18n-attr fallback baked into
// index.html against the runtime dictionary (window.I18N.es in assets/js/i18n.js).
// A mismatch means the pre-JS paint differs from the post-JS paint: content jumps
// (CLS) on slow connections, and the two sources silently drift apart.
//
// Run:  node tools/check-i18n-sync.mjs   (or: npm run check:i18n)
// Exits 1 if any fallback is out of sync; the table shows key · lengths · delta.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(path.join(root, 'index.html'), 'utf8');
const i18nSrc = readFileSync(path.join(root, 'assets', 'js', 'i18n.js'), 'utf8');

// i18n.js is a browser global (window.I18N = {...}); evaluate it with a stub window.
const windowStub = {};
new Function('window', i18nSrc)(windowStub);
const ES = windowStub.I18N.es;

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

if (!issues.length) {
  console.log('✓ i18n en sincronía: todos los fallbacks estáticos de index.html coinciden con I18N.es');
  process.exit(0);
}

const W = { key: 18, len: 6 };
console.log('Fallbacks estáticos desincronizados de I18N.es:\n');
console.log(`${'clave'.padEnd(W.key)} ${'HTML'.padStart(W.len)} ${'dicc.'.padStart(W.len)} ${'delta'.padStart(W.len)}  dónde`);
console.log('-'.repeat(W.key + 3 * (W.len + 1) + 24));
for (const { key, a, b, note } of issues) {
  const delta = b.length - a.length;
  console.log(`${key.padEnd(W.key)} ${String(a.length).padStart(W.len)} ${String(b.length).padStart(W.len)} ${(delta >= 0 ? '+' + delta : String(delta)).padStart(W.len)}  ${note}`);
}
console.log(`\n✗ ${issues.length} clave(s) fuera de sincronía. El diccionario es la fuente de verdad en runtime;`);
console.log('  iguala el fallback de index.html al texto de I18N.es (o decide y actualiza ambos).');
process.exit(1);
