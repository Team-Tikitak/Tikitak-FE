import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const fontsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/fonts');

// 유지할 유니코드 범위 (한자·희귀 CJK 제거, 한글 완성형 전체 유지)
const KEEP_RANGES = [
  [0x0020, 0x00ff], // Basic Latin + Latin-1 Supplement
  [0x1100, 0x11ff], // Hangul Jamo
  [0x2000, 0x206f], // General Punctuation (…, •, – 등)
  [0x20a0, 0x20cf], // Currency Symbols (₩)
  [0x2190, 0x21ff], // Arrows
  [0x25a0, 0x25ff], // Geometric Shapes
  [0x3000, 0x303f], // CJK Symbols & Punctuation (。、「」 등)
  [0x3130, 0x318f], // Hangul Compatibility Jamo
  [0xac00, 0xd7a3], // Hangul Syllables (완성형 전체)
  [0xff00, 0xffef], // Halfwidth & Fullwidth Forms
];

let keepText = '';
for (const [start, end] of KEEP_RANGES) {
  for (let code = start; code <= end; code += 1) keepText += String.fromCodePoint(code);
}

const targets = ['SUIT-Regular', 'SUIT-Medium', 'SUIT-SemiBold', 'SUIT-Bold'];

for (const name of targets) {
  const file = path.join(fontsDir, `${name}.woff2`);
  const buffer = await readFile(file);
  const subset = await subsetFont(buffer, keepText, { targetFormat: 'woff2' });
  await writeFile(file, subset);
  const kb = (n) => `${(n / 1024).toFixed(0)}KB`;
  console.log(`${name}: ${kb(buffer.length)} -> ${kb(subset.length)}`);
}
