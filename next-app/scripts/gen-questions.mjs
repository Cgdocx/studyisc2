import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const SRC = resolve(here, '../../studyisc2_questions_583_bilingual.csv');
const OUT = resolve(here, '../public/data/questions-583.json');

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function splitOptions(raw) {
  return raw.split(/\s*\|\s*(?=[A-F]\.\s)/).map(s => s.replace(/^[A-F]\.\s*/, '').trim());
}

export function questionsFromCsv(raw) {
  const text = raw.replace(/^\uFEFF/, '');
  const [head, ...body] = parseCsv(text);
  const col = name => {
    const i = head.indexOf(name);
    if (i < 0) throw new Error('Missing column ' + name);
    return i;
  };
  const C = {
    id: col('ID'), dom: col('Domain ID'), q: col('Question (EN)'), qth: col('Question (TH)'),
    o: col('Options (EN)'), oth: col('Options (TH)'), ans: col('Correct Answer'),
    e: col('Explanation (EN)'), eth: col('Explanation (TH)'),
  };

  const questions = body.map(r => {
    const options = splitOptions(r[C.o]);
    const options_th = splitOptions(r[C.oth]);
    const correct_idx = 'ABCDEF'.indexOf(r[C.ans].trim().toUpperCase());
    if (correct_idx < 0 || correct_idx >= options.length || options.length !== options_th.length) {
      throw new Error('Bad row ' + r[C.id]);
    }
    return {
      id: Number(r[C.id]), dom: Number(r[C.dom]),
      question: r[C.q].trim(), question_th: r[C.qth].trim(),
      options, options_th, correct_idx,
      explanation: r[C.e].trim(), explanation_th: r[C.eth].trim(),
    };
  });

  return questions;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const questions = questionsFromCsv(readFileSync(SRC, 'utf8'));
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(questions));
  process.stdout.write(`Wrote ${questions.length} questions to public/data/questions-583.json\n`);
}
