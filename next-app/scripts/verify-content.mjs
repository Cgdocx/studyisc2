// Lesson / learning-path / flashcard / mind-map content in src/data/content. Source of truth: the
// committed JSON. Checks: unchanged since verified against the legacy pages at deletion time
// (legacy-snapshot.json), lessons.json still rebuilds the original lesson markup, internal integrity.
import { isDeepStrictEqual } from 'node:util';
import { checker, loadJson, loadSnapshot, jsonHash, sha256, tokens, fingerprint, rebuildLesson } from './check-lib.mjs';

const { ok, done } = checker();
const snap = loadSnapshot();
const at = snap.commit.slice(0, 7);
const load = name => loadJson('src/data/content/' + name);

for (const name of ['lessons.json', 'learning-path.json', 'flashcards.json', 'mindmap.json']) {
  const pin = snap.data['src/data/content/' + name];
  ok(jsonHash(load(name)) === pin.sha256, `${name}: unchanged since verified identical to a fresh extraction from ${pin.source} at ${at}`);
}

const L = load('lessons.json');
ok(L.lessons.length === 5 && L.tabs.length === 5 && L.lessons.every((l, k) => l.n === k + 1 && l.file === L.tabs[k].file && l.title && l.description), `lessons.json: 5 lessons, tabs aligned with lesson files (${L.tabs.map(t => t.file).join(' ')})`);
for (const les of L.lessons) {
  const x = fingerprint(tokens(rebuildLesson(L, les)));
  const y = snap.lessonMarkup[les.file];
  const svg = les.blocks.reduce((n, b) => n + (b.html.match(/<svg\b/g) || []).length, 0);
  ok(isDeepStrictEqual(x, y), `${les.file}: tabs + hero + ${les.blocks.length} content blocks + nav rebuild the original .wrap exactly, per the pinned fingerprint (${y.nodes} tags/text nodes, ${svg} SVG diagram(s), ${y.textChars} text chars)`);
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
ok(sha256(M.noscriptHtml) === snap.mindmapNoscript, 'mindmap.json: noscript fallback byte-identical to the original (pinned hash)');

done();
