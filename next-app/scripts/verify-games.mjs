import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import vm from 'node:vm';
import { read, blockEnd, tokens, decode } from './content-lib.mjs';
import { GAME_EXTRACTORS, GAMES_DIR, BEAT_CLOCK_FIX } from './games-lib.mjs';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../out');
let failed = 0;
const ok = (cond, msg) => { process.stdout.write((cond ? '[OK] ' : '[X] ') + msg + '\n'); if (!cond) failed++; };
const load = name => JSON.parse(readFileSync(resolve(GAMES_DIR, name), 'utf8'));

for (const [name, extract] of Object.entries(GAME_EXTRACTORS)) ok(isDeepStrictEqual(load(name), JSON.parse(JSON.stringify(extract()))), `${name}: identical to a fresh extraction from the original page`);

const bc = read('game-beat-clock.html');
const bcScript = bc.slice(bc.lastIndexOf('<script>', bc.indexOf('const QUESTIONS')) + 8, bc.indexOf('</script>', bc.indexOf('const QUESTIONS')));
const parses = src => { try { new vm.Script(src); return true; } catch { return false; } };
ok(bc.split(BEAT_CLOCK_FIX.from).length === 2 && !parses(bcScript) && parses(bcScript.replace(BEAT_CLOCK_FIX.from, BEAT_CLOCK_FIX.to)),
  `game-beat-clock.html: original script fails to parse; the single "${BEAT_CLOCK_FIX.from}" -> "${BEAT_CLOCK_FIX.to}" fix is the only change needed`);

const hub = load('games.json');
const cards = hub.categories.flatMap(c => c.cards);
const files = Object.values(GAME_EXTRACTORS).slice(1).map(f => f().file);
ok(cards.length === 8 && isDeepStrictEqual(cards.map(c => c.href).sort(), [...files].sort()), `games.json: ${hub.categories.length} categories, ${cards.length} cards linking exactly the 8 game pages`);

const tm = load('term-match.json');
ok(tm.pairs.length === 45 && tm.pairs.every(p => p.t && p.d && tm.domainNames[p.dom]) && new Set(tm.pairs.map(p => p.t)).size === 45, `term-match.json: ${tm.pairs.length} unique terms, every pair has a definition and a known domain`);

const ds = load('domain-sort.json');
ok(ds.concepts.length === 52 && ds.concepts.every(c => c.t && c.h && ds.names[c.d] && ds.colors[c.d]), `domain-sort.json: ${ds.concepts.length} concepts, every concept maps to one of ${Object.keys(ds.names).length} domains`);

const rf = load('rapid-fire.json');
ok(rf.statements.length === 80 && rf.statements.every(s => s.s && typeof s.a === 'boolean' && s.d && s.e), `rapid-fire.json: ${rf.statements.length} statements (${rf.statements.filter(s => s.a).length} true / ${rf.statements.filter(s => !s.a).length} false), each with domain and explanation`);

const bq = load('beat-clock.json');
ok(bq.questions.length === 48 && bq.questions.every(q => q.c.length === 4 && q.a >= 0 && q.a < 4 && q.d && q.e), `beat-clock.json: ${bq.questions.length} questions, 4 choices each, answer index in range`);

const it = load('incident-timeline.json');
ok(it.scenarios.length === 8 && it.scenarios.every(s => s.steps.length === s.stepsTH.length && s.steps.length >= 2), `incident-timeline.json: ${it.scenarios.length} scenarios, steps/stepsTH aligned (${it.scenarios.map(s => s.steps.length).join(' ')})`);

const fg = load('fill-gap.json');
ok(fg.questions.length === 34 && fg.questions.every(q => q.sentence.split('_______').length === 2 && q.choices.includes(q.answer) && new Set(q.choices).size === q.choices.length), `fill-gap.json: ${fg.questions.length} questions, one blank per sentence, answer among unique choices`);

const dc = load('defend-castle.json');
ok(dc.threats.length === 20 && dc.threats.every(t => t.choices.length === 4 && t.correct >= 0 && t.correct < 4 && t.damage > 0 && ['low', 'medium', 'high', 'critical'].includes(t.severity)), `defend-castle.json: ${dc.threats.length} threats, 4 controls each, damage ${Math.min(...dc.threats.map(t => t.damage))}-${Math.max(...dc.threats.map(t => t.damage))}`);

const pd = load('phish-detect.json');
const ids = new Set(pd.flags.map(f => f.id));
const onlyLinks = b => !b.replace(/<span class="fake-link">[^<]*<\/span>/g, '').includes('<');
ok(pd.emails.length === 16 && pd.emails.every(e => e.flags.every(f => ids.has(f)) && (e.isPhishing || e.flags.length === 0) && onlyLinks(e.body) && !/[<&]/.test(e.from)),
  `phish-detect.json: ${pd.emails.length} emails (${pd.emails.filter(e => e.isPhishing).length} phishing), flags within the ${ids.size} known flags, bodies contain only fake-link spans`);

const routes = Object.fromEntries([...readFileSync(resolve(OUT, '../src/lib/site.ts'), 'utf8').matchAll(/'([^']+\.html)':\s*\{\s*route:\s*'([^']*)'/g)].map(m => ['/studyisc2' + m[2], m[1]]));

function wrapOf(html, anchor) {
  const s = anchor ? html.indexOf(anchor) : 0;
  const a = html.indexOf('<div class="wrap">', s);
  return html.slice(a + '<div class="wrap">'.length, blockEnd(html, a, 'div') - '</div>'.length);
}

const LEAF = new Set(['/rect', '/path', '/circle', '/line', '/polyline', '/polygon', '/ellipse']);
function norm(html, built) {
  return tokens(html).filter(t => !LEAF.has(t)).map(t => t[0] === '#' ? t : t.replace(/\[(.*)\]$/, (_, a) => '[' + a.split('|').filter(x => x && !/^on[a-z]+=/.test(x) && x !== '/=').map(x => {
    if (x.startsWith('style=')) return 'style=' + x.slice(6).split(';').map(d => d.trim().replace(/\s*:\s*/, ':')).filter(Boolean).join(';');
    if (built && x.startsWith('href=')) { const h = x.slice(5); return 'href=' + (routes[h] || h); }
    return x;
  }).sort().join('|') + ']'));
}

if (existsSync(OUT)) {
  for (const file of ['games.html', ...files]) {
    const orig = read(file);
    const built = readFileSync(resolve(OUT, file), 'utf8');
    const x = norm(wrapOf(built, 'pg-game"'), true);
    const y = norm(wrapOf(orig), false);
    const diffAt = x.findIndex((t, k) => t !== y[k]);
    const same = diffAt === -1 && x.length === y.length;
    ok(same, `out/${file}: pre-JS .wrap markup matches the original (${y.length} tags/text nodes, ${y.filter(t => t[0] === '#').join('').length} text chars)` + (same ? '' : ` first diff at ${diffAt}: ${x[diffAt]} | ${y[diffAt]}`));
    const t = decode(built.match(/<title>([^<]*)<\/title>/)[1]);
    ok(t === decode(orig.match(/<title>([^<]*)<\/title>/)[1]), `out/${file}: <title> ${t}`);
  }
} else {
  process.stdout.write('[SKIP] out/ not built; run npm run build for the markup checks\n');
}

process.exit(failed ? 1 : 0);
