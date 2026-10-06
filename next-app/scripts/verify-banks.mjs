import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BANKS, extractBank } from './gen-banks.mjs';

const here = dirname(fileURLToPath(import.meta.url));
let failed = false;

function diff(a, b, path, out) {
  if (out.length > 5) return;
  if (Array.isArray(a) !== Array.isArray(b) || typeof a !== typeof b || (a === null) !== (b === null)) {
    out.push(`${path}: type mismatch`);
    return;
  }
  if (a && typeof a === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      if (!(k in a) || !(k in b)) out.push(`${path}.${k}: missing on one side`);
      else diff(a[k], b[k], `${path}.${k}`, out);
    }
  } else if (a !== b) out.push(`${path}: ${JSON.stringify(a).slice(0, 60)} != ${JSON.stringify(b).slice(0, 60)}`);
}

for (const bank of BANKS) {
  const src = extractBank(bank);
  const json = JSON.parse(readFileSync(resolve(here, '../public/data', bank.out), 'utf8'));
  const out = [];
  diff(src, json, bank.id, out);
  const n = bank.count(json);
  const fields = new Set();
  const list = Array.isArray(json) ? json : json.questions;
  list.forEach(q => Object.keys(q).forEach(k => fields.add(k)));
  if (out.length || n !== bank.expected) {
    failed = true;
    process.stdout.write(`[X] ${bank.id}: ${n} questions; ${out.join('; ')}\n`);
  } else {
    process.stdout.write(`[OK] ${bank.id}: ${n} questions, every field equal to ${bank.file} (${[...fields].join(', ')})\n`);
  }
}
process.exit(failed ? 1 : 0);
