import { copyFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '../..');
const PUBLIC = resolve(here, '../public');

for (const f of readdirSync(ROOT).filter(n => n.endsWith('.csv'))) {
  copyFileSync(resolve(ROOT, f), resolve(PUBLIC, f));
  process.stdout.write(`copied ${f} -> public/${f}\n`);
}
