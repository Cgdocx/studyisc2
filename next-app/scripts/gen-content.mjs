import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { EXTRACTORS, OUT_DIR } from './content-lib.mjs';

mkdirSync(OUT_DIR, { recursive: true });
for (const [name, extract] of Object.entries(EXTRACTORS)) {
  const data = extract();
  writeFileSync(resolve(OUT_DIR, name), JSON.stringify(data, null, 1) + '\n');
  process.stdout.write(`wrote src/data/content/${name}\n`);
}
