import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { read, decode, meta, evalConst, blockEnd, stripComments } from './content-lib.mjs';

export const GAMES_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/games');

export const BEAT_CLOCK_FIX = { from: '"ออกแบบ Network"}', to: '"ออกแบบ Network"]' };

export function beatClockSource() {
  const html = read('game-beat-clock.html');
  const hits = html.split(BEAT_CLOCK_FIX.from).length - 1;
  if (hits !== 1) throw new Error(`expected exactly one "${BEAT_CLOCK_FIX.from}" in game-beat-clock.html, found ${hits}`);
  return html.replace(BEAT_CLOCK_FIX.from, BEAT_CLOCK_FIX.to);
}

const text = s => decode(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

function inner(html, startTag) {
  const a = html.indexOf(startTag);
  if (a < 0) throw new Error('missing ' + startTag);
  const tag = startTag.match(/^<([a-z0-9]+)/)[1];
  return html.slice(a + startTag.length, blockEnd(html, a, tag) - `</${tag}>`.length);
}

function styleVars(style) {
  const out = {};
  for (const d of style.split(';')) {
    const i = d.indexOf(':');
    if (i > 0) out[d.slice(0, i).trim()] = d.slice(i + 1).trim();
  }
  return out;
}

export function extractHub() {
  const html = read('games.html');
  const { title, metas } = meta(html);
  const wrap = stripComments(inner(html, '<div class="wrap">'));
  const hero = inner(wrap, '<header class="hero-section">');
  const categories = [];
  const re = /<div class="category-label">([\s\S]*?)<\/div>\s*<div class="grid">/g;
  let m;
  while ((m = re.exec(wrap))) {
    const gridStart = m.index + m[0].length - '<div class="grid">'.length;
    const grid = wrap.slice(gridStart + '<div class="grid">'.length, blockEnd(wrap, gridStart, 'div') - '</div>'.length);
    const cards = [];
    for (const c of grid.matchAll(/<div class="card" style="([^"]*)">([\s\S]*?)<a href="([^"]+)" class="card-btn">([\s\S]*?)<\/a>/g)) {
      const body = c[2];
      cards.push({
        style: styleVars(c[1]),
        badge: text(body.match(/<span class="card-badge">([\s\S]*?)<\/span>/)[1]),
        title: text(body.match(/<h2>([\s\S]*?)<\/h2>/)[1]),
        desc: text(body.match(/<p>([\s\S]*?)<\/p>/)[1]),
        meta: [...body.match(/<div class="card-meta">([\s\S]*?)<\/div>/)[1].matchAll(/<span>([\s\S]*?)<\/span>/g)].map(s => text(s[1])),
        href: c[3],
        button: text(c[4]),
      });
    }
    categories.push({ label: text(m[1]), cards });
  }
  return {
    title,
    description: metas.description,
    hero: {
      eyebrow: text(hero.match(/<div class="eyebrow">([\s\S]*?)<\/div>/)[1]),
      title: text(hero.match(/<h1>([\s\S]*?)<\/h1>/)[1]),
      sub: text(hero.match(/<div class="sub">([\s\S]*?)<\/div>/)[1]),
    },
    categories,
  };
}

function game(file, names, source) {
  return () => {
    const html = source ? source() : read(file);
    const { title, metas } = meta(html);
    const out = { file, title, description: metas.description };
    for (const [key, constName] of Object.entries(names)) out[key] = evalConst(html, constName);
    return out;
  };
}

export const GAME_EXTRACTORS = {
  'games.json': extractHub,
  'term-match.json': game('game-term-match.html', { pairs: 'ALL_PAIRS', domainNames: 'DOMAIN_NAMES' }),
  'domain-sort.json': game('game-domain-sort.html', { concepts: 'CONCEPTS', colors: 'D_COLORS', names: 'D_NAMES' }),
  'rapid-fire.json': game('game-rapid-fire.html', { statements: 'STATEMENTS' }),
  'beat-clock.json': game('game-beat-clock.html', { questions: 'QUESTIONS' }, beatClockSource),
  'incident-timeline.json': game('game-incident-timeline.html', { scenarios: 'SCENARIOS' }),
  'fill-gap.json': game('game-fill-gap.html', { questions: 'QUESTIONS' }),
  'defend-castle.json': game('game-defend-castle.html', { threats: 'THREATS' }),
  'phish-detect.json': game('game-phish-detect.html', { flags: 'ALL_FLAGS', emails: 'EMAILS' }),
};
