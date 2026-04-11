#!/usr/bin/env tsx
/**
 * Barrel 파일(index.ts) 자동 동기화 스크립트
 *
 * FSD 아키텍처 기반으로 shared, pages 하위 디렉토리에
 * index.ts barrel 파일을 자동 생성합니다.
 *
 * 사용법:
 *   yarn gen:index          — barrel 파일 동기화
 *   yarn gen:index --check  — 변경 필요 여부만 확인 (CI용)
 */

import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, extname, join, relative } from 'node:path';

const SRC = join(process.cwd(), 'src');

const HEADER = [
  '/**',
  ' * ⚠️ 이 파일은 자동 생성됩니다. 직접 수정하지 마세요.',
  ' * 생성: yarn gen:index',
  ' */',
].join('\n');

/** barrel을 생성할 shared 하위 디렉토리 */
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
  /\.test\.tsx?$/,
  /\.spec\.tsx?$/,
  /\.d\.ts$/,
  /^__tests__$/,
  /^__mocks__$/,
  /^\./,
];

function shouldIgnore(name: string): boolean {
  return IGNORE.some((p) => p.test(name));
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
      exportLines.push(`export * from './${entry}';`);
    } else if (/\.tsx?$/.test(entry)) {
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

// pages/{page}/ui, pages/{page}/model barrel dirs
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

  // 1. shared 하위 고정 디렉토리
  for (const dir of BARREL_DIRS) {
    const results = await generateBarrelForDir(join(SRC, dir));
    allResults.push(...results);
  }

  // 2. pages/*/ui, pages/*/model 동적 탐지
  const pageDirs = await findPageBarrelDirs();
  for (const dir of pageDirs) {
    const results = await generateBarrelForDir(dir);
    allResults.push(...results);
  }

  if (allResults.length === 0) {
    console.log('동기화할 barrel 파일이 없습니다.');
    return;
  }

  // --check 모드: 변경 필요 여부만 확인
  if (isCheck) {
    const outdated: string[] = [];

    for (const { path: filePath, content } of allResults) {
      let existing = '';
      try {
        existing = await readFile(filePath, 'utf-8');
      } catch {
        /* 파일 없음 = 변경 필요 */
      }

      if (existing !== content) {
        outdated.push(displayPath(filePath));
      }
    }

    if (outdated.length > 0) {
      console.error('barrel 파일이 최신 상태가 아닙니다:\n');
      outdated.forEach((d) => console.error(`  - ${d}`));
      console.error('\n  yarn gen:index 를 실행하세요.');
      process.exit(1);
    }

    console.log('모든 barrel 파일이 최신 상태입니다.');
    return;
  }

  // 쓰기 모드
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
