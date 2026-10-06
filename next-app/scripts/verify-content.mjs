import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { EXTRACTORS, OUT_DIR, read, stripComments, blockEnd, decode } from './content-lib.mjs';

let failed = 0;
const ok = (cond, msg) => { process.stdout.write((cond ? '[OK] ' : '[X] ') + msg + '\n'); if (!cond) failed++; };
const load = name => JSON.parse(readFileSync(resolve(OUT_DIR, name), 'utf8'));

for (const [name, extract] of Object.entries(EXTRACTORS)) ok(isDeepStrictEqual(load(name), JSON.parse(JSON.stringify(extract()))), `${name}: identical to a fresh extraction from the original page`);

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const attrs = o => Object.entries(o).map(([k, v]) => ` ${k}="${esc(v)}"`).join('');

function tokens(html) {
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

const L = load('lessons.json');
for (const les of L.lessons) {
  const orig = read(les.file);
  const a = orig.indexOf('<div class="wrap">');
  const wrapOrig = orig.slice(a + '<div class="wrap">'.length, blockEnd(orig, a, 'div') - '</div>'.length);
  const tabs = L.tabs.map(t => `<a href="${t.file}" class="lesson-tab${t.n === les.n ? ' active' : ''}"${t.n === les.n ? ' aria-current="page"' : ''}><b>${esc(t.code)}</b><span>${esc(t.label)}</span></a>`).join('');
  const h = les.hero;
  const rebuilt = `<nav class="lesson-tabs" aria-label="${esc(L.tabsAria)}">${tabs}</nav>`
    + `<header class="${h.className}"><div class="eyebrow">${esc(h.eyebrow)}</div><h1>${esc(h.title)}</h1><${h.subTag} class="sub">${h.subLines.map(esc).join('<br>')}</${h.subTag}></header>`
    + les.blocks.map(b => `<${b.tag}${attrs(b.attrs)}>${b.html}</${b.tag}>`).join('')
    + `<nav class="lesson-nav" aria-label="${esc(les.navAria)}">${les.nav.map(n => `<a href="${n.href}" class="${n.className}">${esc(n.label)}<small>${esc(n.small)}</small></a>`).join('')}</nav>`;
  const [x, y] = [tokens(rebuilt), tokens(wrapOrig)];
  const diffAt = x.findIndex((t, k) => t !== y[k]);
  const svg = (wrapOrig.match(/<svg\b/g) || []).length;
  const text = y.filter(t => t[0] === '#').join('').length;
  ok(diffAt === -1 && x.length === y.length, `${les.file}: tabs + hero + ${les.blocks.length} content blocks + nav rebuild the original .wrap exactly (${y.length} tags/text nodes, ${svg} SVG diagram(s), ${text} text chars)` + (diffAt >= 0 ? ` first diff at ${diffAt}: ${x[diffAt]} | ${y[diffAt]}` : ''));
}

const F = load('flashcards.json');
const per = {};
F.cards.forEach(c => { per[c.d] = (per[c.d] || 0) + 1; });
ok(F.cards.length === 100 && new Set(F.cards.map(c => c.d + ':' + c.term)).size === 100, `flashcards.json: ${F.cards.length} cards, unique d:term keys, per domain ${JSON.stringify(per)}`);

const P = load('learning-path.json');
const steps = P.phases.flatMap(p => p.steps);
ok(steps.length === 21 && new Set(steps.map(s => s.id)).size === 21, `learning-path.json: ${P.phases.length} phases, ${steps.length} steps with unique ids (${steps[0].id}..${steps[steps.length - 1].id})`);

const M = load('mindmap.json');
const counts = M.chapters.map(c => `${c.topics.length}/${c.examFocus.length}/${c.cheat.length}`);
ok(M.chapters.length === 12 && M.icons.length === 12, `mindmap.json: 12 chapters, 12 icons, topics/examFocus/cheat per chapter ${counts.join(' ')}`);
const nsOrig = read('index.html').match(/<noscript>([\s\S]*?)<\/noscript>/)[1];
ok(M.noscriptHtml === nsOrig, 'mindmap.json: noscript fallback byte-identical');

process.exit(failed ? 1 : 0);
