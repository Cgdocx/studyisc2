// Helpers shared by the verify/audit scripts. Nothing here reads the legacy root pages: those were
// deleted after their content was pinned in legacy-snapshot.json (see record-legacy-snapshot.mjs in
// git history for how the snapshot was produced).
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const APP = resolve(here, '..');
export const SNAPSHOT_FILE = resolve(here, 'legacy-snapshot.json');
export const loadSnapshot = () => JSON.parse(readFileSync(SNAPSHOT_FILE, 'utf8'));
export const loadJson = rel => JSON.parse(readFileSync(resolve(APP, rel), 'utf8'));

export const sha256 = data => createHash('sha256').update(data).digest('hex');
// Hash of a JSON value independent of file formatting (key order is kept, as the app sees it).
export const jsonHash = value => sha256(JSON.stringify(value));

export function checker() {
  const state = { failed: 0 };
  const ok = (cond, msg) => { process.stdout.write((cond ? '[OK] ' : '[X] ') + msg + '\n'); if (!cond) state.failed++; };
  return { ok, done: () => process.exit(state.failed ? 1 : 0) };
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', middot: '\u00b7', rarr: '\u2192', larr: '\u2190', times: '\u00d7', ne: '\u2260', hellip: '\u2026', mdash: '\u2014', ndash: '\u2013' };

export function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    if (!(e in ENTITIES)) throw new Error('Unknown entity ' + m);
    return ENTITIES[e];
  });
}

export const stripComments = s => s.replace(/<!--[\s\S]*?-->/g, '');

export function blockEnd(html, start, tag) {
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g');
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return re.lastIndex;
  }
  throw new Error('Unbalanced <' + tag + '>');
}

// Markup as a flat list of tags (sorted, entity-decoded attributes) and whitespace-collapsed text nodes.
export function tokens(html) {
  const out = [];
  const re = /<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>|([^<]+)/g;
  for (const m of stripComments(html).matchAll(re)) {
    if (m[3] !== undefined) {
      const t = decode(m[3]).replace(/\s+/g, ' ').trim();
      if (t) out.push('#' + t);
      continue;
    }
    const closing = m[0][1] === '/';
    const at = [...(m[2] || '').matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*"([^"]*)")?/g)].map(a => `${a[1]}=${decode(a[2] ?? '')}`).sort();
    out.push((closing ? '/' : '') + m[1].toLowerCase() + (closing ? '' : '[' + at.join('|') + ']'));
  }
  return out;
}

// Fingerprint of a token list: hash plus the counts quoted in check messages.
export const fingerprint = toks => ({ sha256: sha256(toks.join('\n')), nodes: toks.length, textChars: toks.filter(t => t[0] === '#').join('').length });

export function wrapOf(html, anchor) {
  const s = anchor ? html.indexOf(anchor) : 0;
  const a = html.indexOf('<div class="wrap">', s);
  return html.slice(a + '<div class="wrap">'.length, blockEnd(html, a, 'div') - '</div>'.length);
}

// Route table from src/lib/site.ts: '/studyisc2/route' -> 'legacy-file.html'.
export function routes() {
  const site = readFileSync(resolve(APP, 'src/lib/site.ts'), 'utf8');
  return Object.fromEntries([...site.matchAll(/'([^']+\.html)':\s*\{\s*route:\s*'([^']*)'/g)].map(m => ['/studyisc2' + m[2], m[1]]));
}

// Game page markup normalised for comparison: SVG leaf close tags, inline handlers and style
// whitespace ignored; with `routeMap`, Next.js route hrefs are mapped back to the legacy file names.
const LEAF = new Set(['/rect', '/path', '/circle', '/line', '/polyline', '/polygon', '/ellipse']);
export function normGameMarkup(html, routeMap) {
  return tokens(html).filter(t => !LEAF.has(t)).map(t => t[0] === '#' ? t : t.replace(/\[(.*)\]$/, (_, a) => '[' + a.split('|').filter(x => x && !/^on[a-z]+=/.test(x) && x !== '/=').map(x => {
    if (x.startsWith('style=')) return 'style=' + x.slice(6).split(';').map(d => d.trim().replace(/\s*:\s*/, ':')).filter(Boolean).join(';');
    if (routeMap && x.startsWith('href=')) { const h = x.slice(5); return 'href=' + (routeMap[h] || h); }
    return x;
  }).sort().join('|') + ']'));
}

// Lesson .wrap markup rebuilt from lessons.json (tabs + hero + content blocks + prev/next nav).
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const attrs = o => Object.entries(o).map(([k, v]) => ` ${k}="${esc(v)}"`).join('');
export function rebuildLesson(L, les) {
  const tabs = L.tabs.map(t => `<a href="${t.file}" class="lesson-tab${t.n === les.n ? ' active' : ''}"${t.n === les.n ? ' aria-current="page"' : ''}><b>${esc(t.code)}</b><span>${esc(t.label)}</span></a>`).join('');
  const h = les.hero;
  return `<nav class="lesson-tabs" aria-label="${esc(L.tabsAria)}">${tabs}</nav>`
    + `<header class="${h.className}"><div class="eyebrow">${esc(h.eyebrow)}</div><h1>${esc(h.title)}</h1><${h.subTag} class="sub">${h.subLines.map(esc).join('<br>')}</${h.subTag}></header>`
    + les.blocks.map(b => `<${b.tag}${attrs(b.attrs)}>${b.html}</${b.tag}>`).join('')
    + `<nav class="lesson-nav" aria-label="${esc(les.navAria)}">${les.nav.map(n => `<a href="${n.href}" class="${n.className}">${esc(n.label)}<small>${esc(n.small)}</small></a>`).join('')}</nav>`;
}
