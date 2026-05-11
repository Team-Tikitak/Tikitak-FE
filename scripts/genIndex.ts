#!/usr/bin/env tsx
/**
 * Barrel 파일(index.ts) 자동 동기화 스크립트
 *
 * 사용법:
 *   yarn gen:index
 *   yarn gen:index --check
 */

import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, extname, join, relative } from 'node:path';

const SRC = join(process.cwd(), 'src');

const HEADER = ['/**', ' * 자동 생성 파일 수정 금지', ' */'].join('\n');

const BARREL_DIRS = [
  'shared/ui',
  'shared/hooks',
  'shared/lib',
  'shared/constants',
  'shared/types',
  'shared/contexts',
  'shared/stores',
];

const IGNORE = [
  /^index\.tsx?$/,
  /\.stories\.tsx?$/,
  /\.test\.tsx?$/,
  /\.spec\.tsx?$/,
  /\.d\.ts$/,
  /^__tests__$/,
  /^__mocks__$/,
  /^\./,
];

function shouldIgnore(name: string): boolean {
  return IGNORE.some((pattern) => pattern.test(name));
}

function displayPath(filePath: string): string {
  return relative(process.cwd(), filePath).replace(/\\/g, '/');
}

async function dirExists(dirPath: string): Promise<boolean> {
  try {
    return (await stat(dirPath)).isDirectory();
  } catch {
    return false;
  }
}

async function hasDefaultExport(filePath: string): Promise<boolean> {
  const content = await readFile(filePath, 'utf-8');
  return /^export\s+default\b/m.test(content);
}

type BarrelResult = { path: string; content: string };

async function generateBarrelForDir(dirPath: string): Promise<BarrelResult[]> {
  if (!(await dirExists(dirPath))) return [];

  const entries = (await readdir(dirPath)).sort();
  const exportLines: string[] = [];
  const results: BarrelResult[] = [];

  for (const entry of entries) {
    if (shouldIgnore(entry)) continue;

    const fullPath = join(dirPath, entry);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      const subResults = await generateBarrelForDir(fullPath);
      results.push(...subResults);
      if (subResults.length > 0) {
        exportLines.push(`export * from './${entry}';`);
      }
      continue;
    }

    if (/\.tsx?$/.test(entry)) {
      const stem = basename(entry, extname(entry));
      const importPath = `./${stem}`;

      if (await hasDefaultExport(fullPath)) {
        exportLines.push(`export { default as ${stem} } from '${importPath}';`);
      }
      exportLines.push(`export * from '${importPath}';`);
    }
  }

  if (exportLines.length > 0) {
    const content = `${HEADER}\n\n${exportLines.join('\n')}\n`;
    results.push({ path: join(dirPath, 'index.ts'), content });
  }

  return results;
}

async function findPageBarrelDirs(): Promise<string[]> {
  const pagesDir = join(SRC, 'pages');
  if (!(await dirExists(pagesDir))) return [];

  const pages = await readdir(pagesDir);
  const dirs: string[] = [];

  for (const page of pages) {
    for (const sub of ['ui', 'model']) {
      const dir = join(pagesDir, page, sub);
      if (await dirExists(dir)) {
        dirs.push(dir);
      }
    }
  }

  return dirs;
}

async function main() {
  const isCheck = process.argv.includes('--check');
  const allResults: BarrelResult[] = [];

  for (const dir of BARREL_DIRS) {
    const results = await generateBarrelForDir(join(SRC, dir));
    allResults.push(...results);
  }

  const pageDirs = await findPageBarrelDirs();
  for (const dir of pageDirs) {
    const results = await generateBarrelForDir(dir);
    allResults.push(...results);
  }

  if (allResults.length === 0) {
    console.log('동기화할 barrel 파일이 없습니다.');
    return;
  }

  if (isCheck) {
    const outdated: string[] = [];

    for (const { path: filePath, content } of allResults) {
      let existing = '';
      try {
        existing = await readFile(filePath, 'utf-8');
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
        outdated.push(displayPath(filePath));
        continue;
      }

      if (existing !== content) {
        outdated.push(displayPath(filePath));
      }
    }

    if (outdated.length > 0) {
      console.error('barrel 파일이 최신 상태가 아닙니다:\n');
      outdated.forEach((path) => console.error(`  - ${path}`));
      console.error('\n  yarn gen:index 를 실행하세요.');
      process.exit(1);
    }

    console.log('모든 barrel 파일이 최신 상태입니다.');
    return;
  }

  for (const { path: filePath, content } of allResults) {
    await writeFile(filePath, content, 'utf-8');
    console.log(`  ${displayPath(filePath)}`);
  }

  console.log(`\n${allResults.length}개 barrel 파일을 동기화했습니다.`);
}

main().catch((err) => {
  console.error('오류:', err);
  process.exit(1);
});
