// news-image-20261121 entry (Node 22, standard library only).
// The image is the entry.png beside this file: a front page drawn for
// Saturday 21 November 2026 (Kyiv, markets, Sinaloa, The Hague, Antalya,
// a cancer-pill trial, Hormuz). This program copies it to the output
// directory the grader gives it, unchanged, so both graded runs write
// the same bytes.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const here = new URL('.', import.meta.url);
const src = fileURLToPath(new URL('./entry.png', here));
const bytes = readFileSync(src);

// A whole PNG: magic, then an IEND chunk at the end. Refuse anything else
// rather than copying a truncated file into the entry.
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (bytes.length < 8 || !bytes.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error('entry.png is not a PNG file');
}
if (bytes.length > 1048576) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB cap`);
}
if (!bytes.includes(Buffer.from('IEND'))) {
  throw new Error('entry.png has no IEND chunk: not a whole PNG');
}

// The IHDR chunk (bytes 16-24) holds width and height as big-endian u32.
// Enforce the competition's 1024 by 1024 cap here, not just the byte cap.
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 cap`);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), bytes);
console.log(`news-image: wrote ${bytes.length} bytes to ${join(outDir, 'entry.png')}`);
