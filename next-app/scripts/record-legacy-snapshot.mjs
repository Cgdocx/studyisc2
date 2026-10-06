// One-shot: run while the legacy root pages still exist, to pin what parity looked like at deletion
// time. Every committed JSON is first asserted equal to a fresh extraction from its original page
// (and the lesson/game markup to the original .wrap markup); only then are hashes written to
// legacy-snapshot.json, which the verify/audit scripts check against after the legacy files are gone.
// The originals stay retrievable with `git show <commit>:<file>` using the commit recorded below.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { APP, SNAPSHOT_FILE, sha256, jsonHash, tokens, fingerprint, wrapOf, routes, normGameMarkup, rebuildLesson, decode } from './check-lib.mjs';
import { ROOT, read, EXTRACTORS } from './content-lib.mjs';
import { GAME_EXTRACTORS } from './games-lib.mjs';
import { BANKS, extractBank } from './gen-banks.mjs';
import { questionsFromCsv, SRC as CSV_583 } from './gen-questions.mjs';

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
const fail = msg => { process.stderr.write('record-legacy-snapshot: ' + msg + '\n'); process.exit(1); };

const site = git('ls-files').split('\n').filter(f => !f.includes('/') && (/\.(html|csv)$/.test(f) || f === 'sw.js' || f === 'manifest.json'));
if (site.length !== 28) fail(`expected 28 legacy site files at the repo root, found ${site.length}`);
const dirty = git('status', '--porcelain', '--', ...site);
if (dirty) fail('legacy files differ from HEAD:\n' + dirty);
const commit = git('rev-parse', 'HEAD');

const snapshot = {
  about: 'Pinned at the deletion of the legacy root site. data/markup entries were verified equal to fresh extractions from the originals before being hashed (scripts/record-legacy-snapshot.mjs, removed with the legacy files). Originals: git show <commit>:<file>.',
  commit,
  recorded: new Date().toISOString().slice(0, 10),
  files: {},
  data: {},
  lessonMarkup: {},
  gameMarkup: {},
  mindmapNoscript: null,
};

for (const f of site) {
  const buf = readFileSync(resolve(ROOT, f));
  const entry = { sha256: sha256(buf), bytes: buf.length };
  if (f.endsWith('.html')) entry.title = decode(buf.toString('utf8').match(/<title>([^<]*)<\/title>/)[1]);
  snapshot.files[f] = entry;
}

function pinData(rel, fresh, source, count) {
  const committed = JSON.parse(readFileSync(resolve(APP, rel), 'utf8'));
  if (!isDeepStrictEqual(committed, JSON.parse(JSON.stringify(fresh)))) fail(`${rel} differs from a fresh extraction of ${source}`);
  snapshot.data[rel] = { source, sha256: jsonHash(committed), ...(count === undefined ? {} : { count }) };
}

pinData('public/data/questions-583.json', questionsFromCsv(readFileSync(CSV_583, 'utf8')), 'studyisc2_questions_583_bilingual.csv', 583);
for (const bank of BANKS) {
  const data = extractBank(bank);
  pinData(`public/data/${bank.out}`, data, bank.file, bank.count(data));
}
const contentSource = { 'lessons.json': 'lesson-domain-1..5.html', 'learning-path.json': 'learning-path.html', 'flashcards.json': 'flashcard.html', 'mindmap.json': 'index.html' };
for (const [name, extract] of Object.entries(EXTRACTORS)) pinData(`src/data/content/${name}`, extract(), contentSource[name]);
for (const [name, extract] of Object.entries(GAME_EXTRACTORS)) { const d = extract(); pinData(`src/data/games/${name}`, d, d.file || 'games.html'); }

const L = JSON.parse(readFileSync(resolve(APP, 'src/data/content/lessons.json'), 'utf8'));
for (const les of L.lessons) {
  const orig = fingerprint(tokens(wrapOf(read(les.file))));
  if (!isDeepStrictEqual(fingerprint(tokens(rebuildLesson(L, les))), orig)) fail(`${les.file}: lessons.json no longer rebuilds the original .wrap`);
  snapshot.lessonMarkup[les.file] = orig;
}

const OUT = resolve(APP, 'out');
if (!existsSync(OUT)) fail('out/ missing: run npm run build first');
const routeMap = routes();
const gameFiles = ['games.html', ...Object.values(GAME_EXTRACTORS).slice(1).map(f => f().file)];
for (const file of gameFiles) {
  const orig = fingerprint(normGameMarkup(wrapOf(read(file))));
  const built = fingerprint(normGameMarkup(wrapOf(readFileSync(resolve(OUT, file), 'utf8'), 'pg-game"'), routeMap));
  if (!isDeepStrictEqual(built, orig)) fail(`out/${file}: pre-JS .wrap markup differs from the original`);
  snapshot.gameMarkup[file] = orig;
}

snapshot.mindmapNoscript = sha256(read('index.html').match(/<noscript>([\s\S]*?)<\/noscript>/)[1]);

writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 1) + '\n');
process.stdout.write(`Pinned ${site.length} legacy files, ${Object.keys(snapshot.data).length} data files, ${L.lessons.length} lesson and ${gameFiles.length} game page markups at ${commit.slice(0, 7)} -> scripts/legacy-snapshot.json\n`);
