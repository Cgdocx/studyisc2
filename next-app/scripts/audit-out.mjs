import { spawn, execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '../..');
const OUT = resolve(here, '../out');
const PORT = Number(process.env.AUDIT_PORT || 4180);
const LOCAL = `http://localhost:${PORT}/studyisc2/`;
const LIVE = 'https://cgdocx.github.io/studyisc2/';
const live = process.argv.includes('--live');
const verifyLive = process.argv.includes('--verify-live');

let failed = 0;
const ok = (cond, msg) => { process.stdout.write((cond ? '[OK] ' : '[X] ') + msg + '\n'); if (!cond) failed++; };

const tracked = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
const published = tracked.filter(f => !f.split('/').some(part => part.startsWith('.') || part.startsWith('_')));
const rootFiles = published.filter(f => !f.includes('/'));
const SITE = rootFiles.filter(f => /\.(html|csv)$/.test(f) || f === 'sw.js' || f === 'manifest.json');
const DOCS = rootFiles.filter(f => !SITE.includes(f));
const INTERNAL = published.filter(f => f.includes('/'));
const SAME_BYTES = SITE.filter(f => /\.csv$/.test(f) || f === 'manifest.json');

const lp = JSON.parse(readFileSync(resolve(here, '../src/data/content/learning-path.json'), 'utf8'));
const lpLinks = [...new Set(JSON.stringify(lp).match(/"link":"[^"]+"/g)?.map(s => s.slice(8, -1)) ?? [])];
const VARIANTS = [...new Set([
  '',
  ...SITE.filter(f => f.endsWith('.html')).map(f => f.replace(/\.html$/, '')).filter(f => f !== 'index'),
  ...[1, 2, 3, 4, 5].map(d => `flashcard.html?d=${d}`),
  ...lpLinks,
])].filter(v => !SITE.includes(v));

async function get(base, path) {
  try {
    const r = await fetch(base + path, { redirect: 'follow' });
    const body = Buffer.from(await r.arrayBuffer());
    return { status: r.status, type: (r.headers.get('content-type') || '').split(';')[0], body, url: r.url };
  } catch (e) {
    return { status: 0, type: '', body: Buffer.alloc(0), error: String(e) };
  }
}

if (verifyLive) {
  const bad = [];
  for (const f of SITE) {
    const r = await get(LIVE, f);
    if (r.status !== 200) { bad.push(`${f} (${r.status})`); continue; }
    if (f.endsWith('.html') && !r.body.toString().includes('/studyisc2/_next/')) bad.push(`${f} (not the Next.js build)`);
    if (SAME_BYTES.includes(f) && !r.body.equals(readFileSync(resolve(ROOT, f)))) bad.push(`${f} (bytes differ)`);
    if (f === 'sw.js' && !r.body.toString().includes('studyisc2-cache-v3')) bad.push('sw.js (not the v3 worker)');
  }
  for (const v of VARIANTS) { const r = await get(LIVE, v); if (r.status !== 200) bad.push(`${v || '/'} (${r.status})`); }
  const asset = (await get(LIVE, 'index.html')).body.toString().match(/\/studyisc2\/(_next\/static\/[^"]+\.js)/);
  const assetRes = asset ? await get(LIVE, asset[1]) : { status: 0 };
  if (assetRes.status !== 200) bad.push(`_next asset ${asset ? asset[1] : '(none found)'} (${assetRes.status})`);
  ok(bad.length === 0, `live site ${LIVE}: ${SITE.length} site URLs and ${VARIANTS.length} URL forms return 200, every page is the Next.js build, _next/ assets load, sw.js is v3, manifest and CSVs byte-identical` + (bad.length ? ': ' + bad.join(', ') : ''));
  process.exit(failed ? 1 : 0);
}

const server = spawn(process.execPath, [resolve(here, 'serve-out.mjs'), '--strict'], { env: { ...process.env, PORT: String(PORT) }, stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((res, rej) => { server.stdout.once('data', res); server.once('exit', rej); });

try {
  ok(existsSync(OUT), 'out/ exists');
  process.stdout.write(`\nLive inventory (what the legacy Pages build publishes from this checkout): ${published.length} files = ${SITE.length} site files + ${DOCS.length} repo docs + ${INTERNAL.length} next-app source files\n\n`);

  const missing = [];
  for (const f of SITE) {
    const r = await get(LOCAL, f);
    const same = !SAME_BYTES.includes(f) || r.body.equals(readFileSync(resolve(ROOT, f)));
    if (r.status !== 200 || !same) missing.push(`${f} (${r.status}${same ? '' : ', bytes differ'})`);
  }
  ok(missing.length === 0, `${SITE.length} site URLs served from out/ at the same /studyisc2/ path (${SITE.filter(f => f.endsWith('.html')).length} pages, sw.js, manifest.json, ${SITE.filter(f => f.endsWith('.csv')).length} CSV byte-identical)` + (missing.length ? ': ' + missing.join(', ') : ''));

  const badVariants = [];
  for (const v of VARIANTS) { const r = await get(LOCAL, v); if (r.status !== 200 || r.type !== 'text/html') badVariants.push(`${v || '/'} (${r.status})`); }
  ok(badVariants.length === 0, `${VARIANTS.length} extra URL forms resolve: /studyisc2/, extensionless page URLs, flashcard.html?d=1..5, learning-path step links` + (badVariants.length ? ': ' + badVariants.join(', ') : ''));

  const noSlash = await fetch(`http://localhost:${PORT}/studyisc2`, { redirect: 'manual' });
  ok(noSlash.status === 302 && noSlash.headers.get('location') === '/studyisc2/', '/studyisc2 redirects to /studyisc2/ (as GitHub Pages does)');

  const sw = readFileSync(resolve(OUT, 'sw.js'), 'utf8');
  const pre = sw.match(/PRECACHE_ASSETS = \[([\s\S]*?)\]/)[1].match(/'[^']+'/g).map(s => s.slice(1, -1));
  const preBad = [];
  for (const p of pre) { const r = await get(LOCAL, p.replace(/^\.\//, '')); if (r.status !== 200) preBad.push(`${p} (${r.status})`); }
  ok(preBad.length === 0, `sw.js: all ${pre.length} precache entries resolve under /studyisc2/ (${pre.join(' ')})` + (preBad.length ? ': ' + preBad.join(', ') : ''));

  const man = JSON.parse(readFileSync(resolve(OUT, 'manifest.json'), 'utf8'));
  const manUrl = new URL('manifest.json', LOCAL);
  const start = new URL(man.start_url, manUrl), scope = new URL(man.scope, manUrl);
  const startRes = await get('', start.href);
  ok(startRes.status === 200 && scope.pathname === '/studyisc2/' && start.pathname.startsWith(scope.pathname), `manifest.json: start_url -> ${start.pathname} (200), scope -> ${scope.pathname}`);
  const iconRes = await Promise.all(man.icons.map(i => get('', new URL(i.src, manUrl).href)));
  process.stdout.write(`[INFO] manifest icons: ${man.icons.map((i, k) => `${i.src} -> ${iconRes[k].status}`).join(', ')} (favicon.ico has never been in the repo; the live site returns 404 for it too)\n`);

  const seen = new Map();
  const queue = ['', ...SITE.filter(f => f.endsWith('.html')), ...VARIANTS];
  const broken = [];
  let nextAssets = 0;
  while (queue.length) {
    const path = queue.shift();
    if (seen.has(path)) continue;
    const r = await get(LOCAL, path);
    seen.set(path, r.status);
    if (r.status !== 200) { broken.push(`${path || '/'} (${r.status})`); continue; }
    if (path.startsWith('_next/')) nextAssets++;
    if (r.type !== 'text/html') continue;
    const html = r.body.toString('utf8');
    const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map(m => m[1])
      .concat([...html.matchAll(/\ssrcset="([^"]+)"/g)].flatMap(m => m[1].split(',').map(s => s.trim().split(/\s+/)[0])));
    for (const ref of refs) {
      if (/^(https?:|mailto:|tel:|data:|javascript:|#)/.test(ref) || ref.includes('${')) continue;
      const u = new URL(ref.replace(/&amp;/g, '&'), new URL(path, LOCAL));
      if (u.origin !== new URL(LOCAL).origin) continue;
      if (!u.pathname.startsWith('/studyisc2/') && u.pathname !== '/studyisc2') { broken.push(`${u.pathname} (outside basePath, from ${path || '/'})`); continue; }
      const rel = u.pathname === '/studyisc2' ? '' : u.pathname.slice('/studyisc2/'.length) + u.search;
      if (!seen.has(rel)) queue.push(rel);
    }
  }
  ok(broken.length === 0, `link crawl: ${seen.size} internal URLs reachable from every page all return 200, including ${nextAssets} _next/ assets` + (broken.length ? ': ' + broken.slice(0, 10).join(', ') : ''));

  const outFiles = readdirSync(OUT, { recursive: true, withFileTypes: true }).filter(d => d.isFile()).map(d => resolve(d.parentPath, d.name).slice(OUT.length + 1));
  const outBad = [];
  for (const f of outFiles) { const r = await get(LOCAL, f.split('/').map(encodeURIComponent).join('/')); if (r.status !== 200) outBad.push(`${f} (${r.status})`); }
  const under = outFiles.filter(f => f.split('/').some(p => p.startsWith('_')));
  ok(outBad.length === 0, `all ${outFiles.length} files in out/ are served, including ${under.length} under underscore paths (_next/, __next.*.txt, which a Jekyll build would drop) and ${outFiles.filter(f => f.startsWith('data/')).length} runtime question banks in data/` + (outBad.length ? ': ' + outBad.slice(0, 10).join(', ') : ''));

  const notFound = await get(LOCAL, 'no-such-page.html');
  ok(notFound.status === 404 && notFound.body.toString().includes('/studyisc2/_next/'), 'unknown URL returns 404 with the exported 404.html');

  if (live) {
    process.stdout.write('\nLive site today:\n');
    const rows = [];
    for (const f of [...SITE, ...VARIANTS, 'favicon.ico']) rows.push([f || '/', (await get(LIVE, f)).status, (await get(LOCAL, f)).status]);
    for (const f of [...DOCS, 'CLAUDE.html', INTERNAL.find(f => f.endsWith('package.json'))]) rows.push([f, (await get(LIVE, f)).status, (await get(LOCAL, f)).status]);
    for (const [f, a, b] of rows) process.stdout.write(`  ${String(a).padEnd(4)} live | ${String(b).padEnd(4)} out  ${f}\n`);
    const regress = rows.filter(([f, a, b]) => a === 200 && b !== 200 && SITE.concat(VARIANTS).includes(f === '/' ? '' : f));
    ok(regress.length === 0, `every site URL that is 200 on the live site is 200 from out/ (${rows.filter(r => r[1] === 200).length} live 200s checked)` + (regress.length ? ': ' + regress.map(r => r[0]).join(', ') : ''));
    const dropped = rows.filter(([, a, b]) => a === 200 && b !== 200).map(r => r[0]);
    process.stdout.write(`[INFO] served live today but not part of the site, intentionally not in out/: ${dropped.join(', ')}, plus the other ${INTERNAL.length - 1} next-app source files\n`);
  }
} finally {
  server.kill();
}
process.exit(failed ? 1 : 0);
