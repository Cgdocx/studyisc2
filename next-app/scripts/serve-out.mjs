import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../out');
const LEGACY = resolve(here, '../..');
const BASE = '/studyisc2';
const PORT = Number(process.env.PORT || 4173);
const STRICT = process.argv.includes('--strict') || process.env.STRICT === '1';
const ROOTS = STRICT ? [OUT] : [OUT, LEGACY];
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2', '.md': 'text/markdown; charset=utf-8', '.csv': 'text/csv; charset=utf-8', '.webmanifest': 'application/manifest+json',
};

async function isFile(p) {
  try { return (await stat(p)).isFile(); } catch { return false; }
}

async function locate(rel) {
  const candidates = [rel, rel + '.html', join(rel, 'index.html')];
  for (const root of ROOTS) {
    for (const c of candidates) {
      const full = normalize(join(root, c));
      if (!full.startsWith(root)) continue;
      if (root === LEGACY && full.startsWith(join(LEGACY, 'next-app'))) continue;
      if (await isFile(full)) return full;
    }
  }
  return null;
}

createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');
  if (url.pathname === '/' || url.pathname === BASE) {
    res.writeHead(302, { Location: BASE + '/' });
    return res.end();
  }
  if (!url.pathname.startsWith(BASE + '/')) {
    res.writeHead(404);
    return res.end('Not found');
  }
  const rel = decodeURIComponent(url.pathname.slice(BASE.length + 1));
  const file = await locate(rel || 'index.html');
  if (!file) {
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    return res.end(await readFile(join(OUT, '404.html')).catch(() => 'Not found'));
  }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
  res.end(await readFile(file));
}).listen(PORT, () => {
  process.stdout.write(`Serving ${BASE}/ on http://localhost:${PORT}${BASE}/ (${STRICT ? 'out/ only, like GitHub Pages after the switch' : 'out/ first, then legacy root pages'})\n`);
});
