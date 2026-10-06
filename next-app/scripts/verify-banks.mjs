// Question banks served from public/data. Source of truth: the committed JSON (plus the 583 CSV in
// public/). Checks: (1) questions-583.json is exactly what gen:questions builds from the CSV,
// (2) every bank is unchanged since it was verified against its legacy page at deletion time
// (legacy-snapshot.json), (3) structural integrity of every question.
import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { checker, loadJson, loadSnapshot, jsonHash, sha256 } from './check-lib.mjs';
import { questionsFromCsv, SRC } from './gen-questions.mjs';

const { ok, done } = checker();
const snap = loadSnapshot();
const uniq = a => new Set(a).size === a.length;
const text = (...v) => v.every(s => typeof s === 'string' && s.trim());
const inDomain = d => Number.isInteger(d) && d >= 1 && d <= 5;

const BANKS = [
  {
    rel: 'public/data/questions-583.json', list: d => d,
    check: q => inDomain(q.dom) && q.options.length === 4 && q.options_th.length === 4 && q.correct_idx >= 0 && q.correct_idx < 4 && text(q.question, q.question_th, q.explanation, q.explanation_th),
    ids: q => q.id,
  },
  {
    rel: 'public/data/questions-548.json', list: d => d,
    check: q => inDomain(q.dom) && q.options.length >= 2 && q.options_th.length === q.options.length && q.correct_idx >= 0 && q.correct_idx < q.options.length && text(q.question, q.question_th, q.explanation, q.explanation_th, q.short_explanation_en),
    ids: q => q.id,
  },
  {
    rel: 'public/data/bank-1832.json', list: d => d,
    check: q => inDomain(q.d) && q.c.length >= 2 && q.ct.length === q.c.length && q.a >= 0 && q.a < q.c.length && text(q.q, q.qt, q.e, q.et),
  },
  {
    rel: 'public/data/ncsa-50.json', list: d => d.questions,
    check: (q, d) => d.domains.some(x => x.id === q.dom) && q.answers_th.length === q.answers_en.length && q.correct_indices.length >= 1 && (q.type !== 'single' || q.correct_indices.length === 1) && q.correct_indices.every(i => i >= 0 && i < q.answers_en.length) && text(q.question_en, q.question_th, q.explanation_en, q.explanation_th),
    ids: q => q.id,
  },
  {
    rel: 'public/data/quiz-explained.json', list: d => d,
    check: q => inDomain(q.d) && q.choices.length >= 2 && q.explanations.length === q.choices.length && q.correct >= 0 && q.correct < q.choices.length && text(q.q, q.qe, q.dn),
  },
];

const csv = readFileSync(SRC);
ok(sha256(csv) === snap.files['studyisc2_questions_583_bilingual.csv'].sha256, 'public/studyisc2_questions_583_bilingual.csv: byte-identical to the legacy root CSV at deletion');
ok(isDeepStrictEqual(loadJson('public/data/questions-583.json'), questionsFromCsv(csv.toString('utf8'))), 'questions-583.json: identical to a fresh gen:questions build from the CSV');

for (const bank of BANKS) {
  const data = loadJson(bank.rel);
  const list = bank.list(data);
  const pin = snap.data[bank.rel];
  const name = bank.rel.slice('public/data/'.length);
  const fields = [...new Set(list.flatMap(q => Object.keys(q)))];
  ok(jsonHash(data) === pin.sha256 && list.length === pin.count, `${name}: ${list.length} questions, unchanged since verified field-by-field against ${pin.source} at ${snap.commit.slice(0, 7)} (${fields.join(', ')})`);
  const bad = list.map((q, k) => (bank.check(q, data) ? -1 : k)).filter(k => k >= 0);
  const idsOk = !bank.ids || uniq(list.map(bank.ids));
  ok(bad.length === 0 && idsOk, `${name}: every question has its texts, aligned EN/TH choices, an answer index in range and a valid domain${bank.ids ? '; ids unique' : ''}` + (bad.length ? ` (bad at ${bad.slice(0, 5).join(', ')})` : ''));
}

done();
