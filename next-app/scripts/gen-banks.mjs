import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '../..');
const OUT_DIR = resolve(here, '../public/data');

function between(text, start, end, file) {
  const i = text.indexOf(start);
  if (i < 0) throw new Error(`Marker not found in ${file}: ${start}`);
  const j = text.indexOf(end, i + start.length);
  if (j < 0) throw new Error(`End marker not found in ${file}: ${end}`);
  return text.slice(i + start.length, j);
}

function evalLiteral(src) {
  return vm.runInNewContext(`(${src})`, Object.create(null), { timeout: 5000 });
}

export const BANKS = [
  {
    id: '548',
    file: 'isc2_cc_exam548_5Domain_dualTh-Eng.html',
    out: 'questions-548.json',
    extract: html => JSON.parse(between(html, 'const ALL_QUESTIONS = ', ';\n', '548')),
    count: data => data.length,
    expected: 548,
  },
  {
    id: '1832',
    file: '1832quiz_NewExamDomainTH.html',
    out: 'bank-1832.json',
    extract: html => JSON.parse(between(html, '<script id="bank" type="application/json">', '</script>', '1832')),
    count: data => data.length,
    expected: 1832,
  },
  {
    id: 'ncsa50',
    file: 'isc2_cc_exam1NCSA_bi_no-track-50q.html',
    out: 'ncsa-50.json',
    extract: html => JSON.parse(between(html, 'const DATA = ', ';\n', 'ncsa50')),
    count: data => data.questions.length,
    expected: 50,
  },
  {
    id: 'explained',
    file: 'quiz-explained.html',
    out: 'quiz-explained.json',
    extract: html => evalLiteral(between(html, 'const QUESTIONS = ', '\n];', 'explained') + '\n]'),
    count: data => data.length,
    expected: 57,
  },
];

export function extractBank(bank) {
  const html = readFileSync(resolve(ROOT, bank.file), 'utf8');
  return JSON.parse(JSON.stringify(bank.extract(html)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const bank of BANKS) {
    const data = extractBank(bank);
    const n = bank.count(data);
    if (n !== bank.expected) throw new Error(`${bank.id}: expected ${bank.expected} questions, got ${n}`);
    writeFileSync(resolve(OUT_DIR, bank.out), JSON.stringify(data));
    process.stdout.write(`Wrote ${n} questions to public/data/${bank.out} (from ${bank.file})\n`);
  }
}
