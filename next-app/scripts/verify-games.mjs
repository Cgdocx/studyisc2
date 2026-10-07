// Mini-game data in src/data/games and the built game pages. Source of truth: the committed JSON.
// Checks: unchanged since verified against the legacy pages at deletion time (legacy-snapshot.json),
// internal integrity, and (after a build) the pre-JS markup of out/ game pages against the pinned
// fingerprint of the original pages' markup.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { APP, checker, loadJson, loadSnapshot, jsonHash, decode, fingerprint, wrapOf, routes, normGameMarkup } from './check-lib.mjs';

const OUT = resolve(APP, 'out');
const { ok, done } = checker();
const snap = loadSnapshot();
const load = name => loadJson('src/data/games/' + name);
const GAMES = ['games.json', 'term-match.json', 'domain-sort.json', 'rapid-fire.json', 'beat-clock.json', 'incident-timeline.json', 'fill-gap.json', 'defend-castle.json', 'phish-detect.json'];

for (const name of GAMES) {
  const pin = snap.data['src/data/games/' + name];
  ok(jsonHash(load(name)) === pin.sha256, pin.changed
    ? `${name}: matches its pinned hash (verified against ${pin.source} at ${snap.commit.slice(0, 7)}, changed on purpose since: ${pin.changed})`
    : `${name}: unchanged since verified identical to a fresh extraction from ${pin.source} at ${snap.commit.slice(0, 7)}`);
}

// Hub card counts: the {count} token of each card is filled from the game data (src/components/games/counts.ts).
const countsSrc = readFileSync(resolve(APP, 'src/components/games/phish-config.ts'), 'utf8');
const PHISH_PER_GAME = Number(countsSrc.match(/PHISH_EMAILS_PER_GAME = (\d+);/)[1]);
const COUNTS = {
  'game-term-match.html': load('term-match.json').pairs.length,
  'game-domain-sort.html': load('domain-sort.json').concepts.length,
  'game-rapid-fire.html': load('rapid-fire.json').statements.length,
  'game-beat-clock.html': load('beat-clock.json').questions.length,
  'game-incident-timeline.html': load('incident-timeline.json').scenarios.length,
  'game-fill-gap.html': load('fill-gap.json').questions.length,
  'game-defend-castle.html': load('defend-castle.json').threats.length,
  'game-phish-detect.html': PHISH_PER_GAME,
};
const phishSrc = readFileSync(resolve(APP, 'src/components/games/PhishDetect.tsx'), 'utf8');
ok(PHISH_PER_GAME <= load('phish-detect.json').emails.length && phishSrc.includes('.slice(0, PHISH_EMAILS_PER_GAME)'), `Phishing Detective deals PHISH_EMAILS_PER_GAME = ${PHISH_PER_GAME} of ${load('phish-detect.json').emails.length} emails, the number its hub card quotes`);
const hubCards = load('games.json').categories.flatMap(c => c.cards);
const literal = hubCards.filter(c => /\d/.test(c.meta[0]) || !c.meta[0].includes('{count}'));
ok(literal.length === 0, `games.json: every card's first meta tag is a {count} token, so hub counts cannot drift from the data` + (literal.length ? ': ' + literal.map(c => c.href).join(', ') : ''));

// Intentional text changes against the legacy pages: [text now, text in the legacy page]. The built
// markup is mapped back with these before its fingerprint is compared with the pinned original.
const DEVIATIONS = {
  'games.html': [
    [`${COUNTS['game-term-match.html']} คู่`, '44 คู่'], [`${COUNTS['game-term-match.html']} PAIRS`, '44 PAIRS'],
    [`${COUNTS['game-rapid-fire.html']} STATEMENTS`, '82 STATEMENTS'],
    [`${COUNTS['game-beat-clock.html']} QUESTIONS`, '60+ QUESTIONS'],
    [`${COUNTS['game-fill-gap.html']} ข้อ`, '35 ข้อ'], [`${COUNTS['game-fill-gap.html']} QUESTIONS`, '35 QUESTIONS'],
  ],
  'game-fill-gap.html': [[`0 / ${COUNTS['game-fill-gap.html']}`, '0 / 35']],
  'game-beat-clock.html': [[`คลัง ${COUNTS['game-beat-clock.html']} คำถาม`, 'คลัง 60+ คำถาม']],
};
const toLegacy = (file, html) => {
  let out = html;
  const misses = [];
  for (const [now, then] of DEVIATIONS[file] || []) {
    if (out.split(now).length !== 2) misses.push(now);
    out = out.replace(now, then);
  }
  return { out, misses };
};

const hub = load('games.json');
const cards = hub.categories.flatMap(c => c.cards);
const files = GAMES.slice(1).map(name => load(name).file);
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

const routeMap = routes();
if (existsSync(OUT)) {
  for (const file of ['games.html', ...files]) {
    const built = readFileSync(resolve(OUT, file), 'utf8');
    const { out: mapped, misses } = toLegacy(file, wrapOf(built, 'pg-game"'));
    const x = fingerprint(normGameMarkup(mapped, routeMap));
    const y = snap.gameMarkup[file];
    const dev = (DEVIATIONS[file] || []).length;
    const same = isDeepStrictEqual(x, y) && misses.length === 0;
    ok(same, `out/${file}: pre-JS .wrap markup matches the original, per the pinned fingerprint (${y.nodes} tags/text nodes, ${y.textChars} text chars)` + (dev ? `, apart from ${dev} intentional count fix(es): ${DEVIATIONS[file].map(d => `'${d[1]}' -> '${d[0]}'`).join(', ')}` : '') + (same ? '' : ` got ${x.nodes} nodes / ${x.textChars} chars${misses.length ? '; expected once: ' + misses.join(', ') : ''}`));
    if (file === 'games.html') {
      const metas = [...wrapOf(built, 'pg-game"').matchAll(/<div class="card-meta">([\s\S]*?)<\/div>/g)].map(m => [...m[1].matchAll(/<span>([^<]*)<\/span>/g)].map(t => decode(t[1])));
      const want = hubCards.map(c => c.meta.map(m => m.replaceAll('{count}', String(COUNTS[c.href]))));
      ok(isDeepStrictEqual(metas, want) && !wrapOf(built, 'pg-game"').includes('{count}'), `out/games.html: hub card counts equal the game data (${hubCards.map(c => want[hubCards.indexOf(c)][0]).join(', ')})`);
    }
    const t = decode(built.match(/<title>([^<]*)<\/title>/)[1]);
    ok(t === snap.files[file].title, `out/${file}: <title> ${t}`);
  }
} else {
  process.stdout.write('[SKIP] out/ not built; run npm run build for the markup checks\n');
}

done();
