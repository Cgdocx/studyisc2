import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(here, '../..');
export const OUT_DIR = resolve(here, '../src/data/content');

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', middot: '\u00b7', rarr: '\u2192', larr: '\u2190', times: '\u00d7', ne: '\u2260', hellip: '\u2026', mdash: '\u2014', ndash: '\u2013' };

export function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    if (!(e in ENTITIES)) throw new Error('Unknown entity ' + m);
    return ENTITIES[e];
  });
}

export const read = file => readFileSync(resolve(ROOT, file), 'utf8');
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

export function parseAttrs(s) {
  const attrs = {};
  for (const m of s.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*"([^"]*)")?/g)) attrs[m[1]] = m[2] === undefined ? '' : decode(m[2]);
  return attrs;
}

export function topBlocks(html) {
  const blocks = [];
  const re = /<([a-z][a-z0-9]*)\b([^>]*)>/g;
  let i = 0;
  for (;;) {
    re.lastIndex = i;
    const m = re.exec(html);
    if (!m) break;
    const end = blockEnd(html, m.index, m[1]);
    const closeLen = `</${m[1]}>`.length;
    blocks.push({ tag: m[1], attrs: parseAttrs(m[2]), html: html.slice(m.index + m[0].length, end - closeLen), outer: html.slice(m.index, end) });
    i = end;
  }
  return blocks;
}

export function meta(html) {
  const title = decode(html.match(/<title>([^<]*)<\/title>/)[1]);
  const metas = {};
  for (const m of html.matchAll(/<meta\s+(?:name|property)="([^"]+)"\s+content="([^"]*)"\s*\/?>/g)) metas[m[1]] = decode(m[2]);
  return { title, metas };
}

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

export function evalConst(html, name, endMarker) {
  const start = html.indexOf(`const ${name} = `);
  if (start < 0) throw new Error('missing const ' + name);
  const from = start + `const ${name} = `.length;
  const open = html[from];
  const close = open === '[' ? ']' : '}';
  let depth = 0, i = from, str = null;
  for (; i < html.length; i++) {
    const c = html[i];
    if (str) {
      if (c === '\\') { i++; continue; }
      if (c === str) str = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { str = c; continue; }
    if (c === '/' && html[i + 1] === '/') { i = html.indexOf('\n', i); continue; }
    if (c === open) depth++;
    else if (c === close && --depth === 0) break;
  }
  void endMarker;
  return vm.runInNewContext('(' + html.slice(from, i + 1) + ')');
}

const LESSON_FILES = [1, 2, 3, 4, 5].map(n => `lesson-domain-${n}.html`);

function lessonParts(file) {
  const html = read(file);
  const a = html.indexOf('<div class="wrap">');
  const wrap = stripComments(html.slice(a + '<div class="wrap">'.length, blockEnd(html, a, 'div') - '</div>'.length));
  return { html, blocks: topBlocks(wrap) };
}

export function extractLessons() {
  const first = lessonParts(LESSON_FILES[0]).blocks.find(b => b.attrs.class === 'lesson-tabs');
  const tabs = topBlocks(first.html).map((b, k) => {
    const inner = b.html.match(/<b>([^<]*)<\/b><span>([^<]*)<\/span>/);
    return { n: k + 1, file: b.attrs.href, code: decode(inner[1]), label: decode(inner[2]) };
  });
  const tabsAria = first.attrs['aria-label'];
  const lessons = LESSON_FILES.map((file, k) => {
    const { html, blocks } = lessonParts(file);
    const hero = blocks.find(b => b.tag === 'header');
    const heroKids = topBlocks(hero.html);
    const sub = heroKids[2];
    const nav = blocks.find(b => b.attrs.class === 'lesson-nav');
    const content = blocks.filter(b => b.tag !== 'header' && !['lesson-tabs', 'lesson-nav'].includes(b.attrs.class));
    const m = meta(html);
    return {
      n: k + 1,
      file,
      title: m.title,
      description: m.metas.description,
      variant: hero.attrs.class === 'lesson-hero' ? 'a' : 'b',
      hero: {
        className: hero.attrs.class,
        eyebrow: decode(heroKids[0].html),
        title: decode(heroKids[1].html),
        subTag: sub.tag,
        subLines: sub.html.split(/<br\s*\/?>/).map(decode),
      },
      navAria: nav.attrs['aria-label'],
      nav: topBlocks(nav.html).map(l => {
        const mm = l.html.match(/^([\s\S]*?)<small>([\s\S]*)<\/small>$/);
        return { href: l.attrs.href, className: l.attrs.class, label: decode(mm[1]), small: decode(mm[2]) };
      }),
      blocks: content.map(b => ({ tag: b.tag, attrs: b.attrs, html: b.html })),
    };
  });
  return { tabsAria, tabs, lessons };
}

export function extractLearningPath() {
  const html = read('learning-path.html');
  const m = meta(html);
  return {
    title: m.title,
    description: m.metas.description,
    phases: evalConst(html, 'PHASES'),
    domainColors: evalConst(html, 'DOMAIN_COLORS'),
    domainLabels: evalConst(html, 'DOMAIN_LABELS'),
  };
}

export function extractFlashcards() {
  const html = read('flashcard.html');
  const m = meta(html);
  return {
    title: m.title,
    description: m.metas.description,
    domains: evalConst(html, 'DOMAINS'),
    cards: evalConst(html, 'ALL_CARDS'),
  };
}

export function extractMindMap() {
  const html = read('index.html');
  const m = meta(html);
  const ns = html.slice(html.indexOf('<noscript>') + '<noscript>'.length, html.indexOf('</noscript>'));
  return {
    title: m.title,
    metas: m.metas,
    noscriptHtml: ns,
    icons: evalConst(html, 'chapterIcons'),
    chapters: evalConst(html, 'chapters'),
  };
}

export const EXTRACTORS = {
  'lessons.json': extractLessons,
  'learning-path.json': extractLearningPath,
  'flashcards.json': extractFlashcards,
  'mindmap.json': extractMindMap,
};
