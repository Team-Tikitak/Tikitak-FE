#!/usr/bin/env node
// post-inline-review.mjs — Node/macOS port of post-inline-review.ps1
//
// Usage:
//   node post-inline-review.mjs --comments-path tmp/review-comments.json --pr-url https://github.com/OWNER/REPO/pull/12 [--dry-run]
//   node post-inline-review.mjs --comments-path tmp/review-comments.json --pr-number 12 [--dry-run]

import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--comments-path':
        args.commentsPath = argv[++i];
        break;
      case '--pr-number':
        args.prNumber = argv[++i];
        break;
      case '--pr-url':
        args.prUrl = argv[++i];
        break;
      case '--dry-run':
        args.dryRun = true;
        break;
      default:
        fail(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function loadDotEnv(filePath, { override = false } = {}) {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (override || !process.env[key]) {
      process.env[key] = value;
    }
  }
}

const IGNORED_PATTERNS = [
  /^yarn\.lock$/,
  /^\.pnp\./,
  /^\.yarn\//,
  /^coverage\//,
  /\/storybook-static\//,
  /^storybook-static\//,
  /\.(png|jpg|jpeg|gif|webp|svg|ico|snap)$/,
];

const isIgnoredPath = (filePath) => IGNORED_PATTERNS.some((pattern) => pattern.test(filePath));

async function githubRequest(token, method, endpoint, body) {
  const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com/${endpoint}`;
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'claude-pr-inline-review',
      ...(body ? { 'Content-Type': 'application/json; charset=utf-8' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(`GitHub API ${method} ${url} failed: ${response.status} ${JSON.stringify(data)}`);
  }
  return data;
}

function resolveOwnerRepoPr(args) {
  if (args.prUrl) {
    const match = args.prUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
    if (!match) fail(`Invalid GitHub PR URL: ${args.prUrl}`);
    return { owner: match[1], repo: match[2], prNumber: Number(match[3]) };
  }

  let remote;
  try {
    remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
  } catch {
    fail('Could not infer repository from git remote. Provide --pr-url.');
  }
  const match = remote.match(/github\.com[:/]([^/]+)\/([^/.]+)(\.git)?$/);
  if (!match) fail(`Could not parse GitHub repository from origin remote: ${remote}. Provide --pr-url.`);
  const prNumber = args.prNumber ? Number(args.prNumber) : undefined;
  if (!prNumber) fail('PR number is required when --pr-url is not provided. Pass --pr-number or --pr-url.');
  return { owner: match[1], repo: match[2], prNumber };
}

function normalizeComments(rawComments) {
  const normalized = [];
  for (const comment of rawComments) {
    if (!comment.path) fail('Each comment must include path.');
    if (isIgnoredPath(comment.path)) {
      console.warn(`Warning: Skipping ignored review path: ${comment.path}`);
      continue;
    }
    if (!comment.body) fail(`Comment for ${comment.path} must include body.`);

    if (comment.position) {
      normalized.push({ path: comment.path, body: comment.body, position: comment.position });
      continue;
    }

    if (!comment.line) fail(`Comment for ${comment.path} must include line or position.`);
    if (comment.side !== 'RIGHT' && comment.side !== 'LEFT') {
      fail(`Comment side must be RIGHT or LEFT: ${comment.path}:${comment.line}`);
    }
    normalized.push({ path: comment.path, body: comment.body, line: comment.line, side: comment.side });
  }
  return normalized;
}

const DEFAULT_BODY = [
  '## Summary',
  '',
  '이 PR의 변경 diff를 기준으로 주요 변경사항을 요약합니다.',
  '',
  '## Code Review',
  '',
  '버그 가능성, 보안, 유지보수 영향이 있는 항목을 중심으로 인라인 코멘트를 남겼습니다.',
].join('\n');

function buildFallbackBody(reviewBody, normalizedComments) {
  const lines = [
    reviewBody,
    '',
    'Inline review comments could not be anchored by GitHub, so the findings are listed here.',
    '',
  ];
  for (const comment of normalizedComments) {
    const location = comment.line
      ? `${comment.path}:${comment.line}`
      : comment.position
        ? `${comment.path} (diff position ${comment.position})`
        : comment.path;
    lines.push(`- \`${location}\``);
    lines.push(`  ${comment.body}`);
  }
  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.commentsPath) fail('--comments-path is required');
  if (!existsSync(args.commentsPath)) fail(`Comments file not found: ${args.commentsPath}`);

  loadDotEnv(path.resolve('.env.pr-inline-review'), { override: true });
  loadDotEnv(path.resolve('.env.local'));
  loadDotEnv(path.resolve('.env'));

  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    fail(
      'Set GITHUB_TOKEN or GH_TOKEN in the shell, .env.local, .env, or .env.pr-inline-review before running this script.',
    );
  }

  const { owner, repo, prNumber } = resolveOwnerRepoPr(args);

  const pr = await githubRequest(token, 'GET', `repos/${owner}/${repo}/pulls/${prNumber}`).catch((error) =>
    fail(`Could not resolve PR head SHA: ${error.message}`),
  );
  const headSha = pr?.head?.sha;
  if (!headSha) fail('Could not resolve PR head SHA.');

  const commentsJson = JSON.parse(readFileSync(args.commentsPath, 'utf8'));
  const rawComments = Array.isArray(commentsJson.comments) ? commentsJson.comments : [];
  const normalizedComments = normalizeComments(rawComments);

  // 원본 .ps1과 달리 comments가 비어 있어도 실패시키지 않는다 — inline comment 없이
  // summary만 남기는 "이상 없음" 리뷰도 유효한 결과다.

  const reviewBody = commentsJson.body || DEFAULT_BODY;
  const payload = {
    commit_id: headSha,
    event: 'COMMENT',
    body: reviewBody,
    comments: normalizedComments,
  };

  if (args.dryRun) {
    console.log(
      `Dry run: would post ${normalizedComments.length} inline review comment(s) to ${owner}/${repo} PR #${prNumber} at ${headSha}.`,
    );
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const removeCommentsFileAfterSuccess = () => {
    if (existsSync(args.commentsPath)) {
      unlinkSync(args.commentsPath);
      console.log(`Deleted completed review payload: ${args.commentsPath}`);
    }
  };

  try {
    await githubRequest(token, 'POST', `repos/${owner}/${repo}/pulls/${prNumber}/reviews`, payload);
    console.log(`Posted ${normalizedComments.length} inline review comment(s) to PR #${prNumber}.`);
    removeCommentsFileAfterSuccess();
    return;
  } catch (error) {
    console.warn(`Warning: Bulk review endpoint failed: ${error.message}`);
  }

  if (normalizedComments.length > 0) {
    try {
      let posted = 0;
      for (const comment of normalizedComments) {
        const commentPayload = { commit_id: headSha, path: comment.path, body: comment.body };
        if (comment.position) commentPayload.position = comment.position;
        else {
          commentPayload.line = comment.line;
          commentPayload.side = comment.side;
        }
        await githubRequest(token, 'POST', `repos/${owner}/${repo}/pulls/${prNumber}/comments`, commentPayload);
        posted += 1;
      }
      console.log(`Posted ${posted} individual inline review comment(s) to PR #${prNumber}.`);
      removeCommentsFileAfterSuccess();
      return;
    } catch (error) {
      console.warn(`Warning: Individual inline comments failed: ${error.message}. Posting fallback PR review body.`);
    }
  }

  try {
    await githubRequest(token, 'POST', `repos/${owner}/${repo}/pulls/${prNumber}/reviews`, {
      event: 'COMMENT',
      body: buildFallbackBody(reviewBody, normalizedComments),
    });
    console.log(`Posted fallback PR review body to PR #${prNumber}.`);
    removeCommentsFileAfterSuccess();
  } catch (error) {
    fail(`All posting strategies failed: ${error.message}. Payload left at ${args.commentsPath} for debugging.`);
  }
}

main();
