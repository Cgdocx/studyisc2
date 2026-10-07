// Regenerates the site icons in public/ from the two vector sources in icons/ (text already outlined
// from Archivo Black, so no fonts are needed):
//   icons/mark.svg  -> public/icon.svg, public/favicon.ico (16, 32, 48)
//   icons/badge.svg -> public/icon-192.png, public/icon-512.png, public/apple-touch-icon.png (180, on cream),
//                      public/icon-maskable-512.png (cream full bleed, badge inside the 80% safe zone)
// Uses sharp, which ships with Next.js as an optional dependency. Run: node scripts/make-icons.mjs
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = name => readFileSync(resolve(APP, 'icons', name));
const pub = name => resolve(APP, 'public', name);
const CREAM = '#EFE9D9';

const png = (svg, size) => sharp(svg, { density: 72 * size / 512 * 4 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
const onCream = async (svg, size, scale) => {
  const inner = Math.round(size * scale);
  const art = await png(svg, inner);
  const off = Math.round((size - inner) / 2);
  return sharp({ create: { width: size, height: size, channels: 4, background: CREAM } })
    .composite([{ input: art, left: off, top: off }]).png().toBuffer()
    .then(buf => sharp(buf).removeAlpha().png({ compressionLevel: 9 }).toBuffer());
};

// ICO with PNG-encoded entries (supported by every current browser and Windows Vista+).
function ico(images) {
  const head = Buffer.alloc(6 + 16 * images.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(images.length, 4);
  let offset = head.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(size >= 256 ? 0 : size, e); head.writeUInt8(size >= 256 ? 0 : size, e + 1);
    head.writeUInt8(0, e + 2); head.writeUInt8(0, e + 3);
    head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(data.length, e + 8); head.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([head, ...images.map(i => i.data)]);
}

const mark = src('mark.svg'), badge = src('badge.svg');
copyFileSync(resolve(APP, 'icons/mark.svg'), pub('icon.svg'));
writeFileSync(pub('favicon.ico'), ico(await Promise.all([16, 32, 48].map(async size => ({ size, data: await png(mark, size) })))));
writeFileSync(pub('icon-192.png'), await png(badge, 192));
writeFileSync(pub('icon-512.png'), await png(badge, 512));
writeFileSync(pub('apple-touch-icon.png'), await onCream(badge, 180, 1));
writeFileSync(pub('icon-maskable-512.png'), await onCream(badge, 512, 0.64));
console.log('wrote public/icon.svg, favicon.ico, icon-192.png, icon-512.png, apple-touch-icon.png, icon-maskable-512.png');
