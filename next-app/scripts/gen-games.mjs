import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { GAME_EXTRACTORS, GAMES_DIR } from './games-lib.mjs';

mkdirSync(GAMES_DIR, { recursive: true });
for (const [name, extract] of Object.entries(GAME_EXTRACTORS)) {
  writeFileSync(resolve(GAMES_DIR, name), JSON.stringify(extract(), null, 1) + '\n');
  process.stdout.write(`wrote src/data/games/${name}\n`);
}
