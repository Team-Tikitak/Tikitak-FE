#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

const REVIEW_MARKER = '<!-- tikitak-pr-review -->';
const INLINE_REVIEW_MARKER = 'tikitak-pr-review-inline';
const GITHUB_API_VERSION = '2022-11-28';
const GITHUB_COMMENT_PAGE_SIZE = 100;

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const reviewPath = args.review ?? 'tikitak-review-output.json';
  const contextPath = args.context ?? 'tikitak-review-context.json';
  const dryRun = Boolean(args['dry-run']) || process.env.DRY_RUN === 'true';

  const context = readJsonIfExists(contextPath) ?? {};
  const reviewResult = readReview(reviewPath);
  const body = redactSecrets(buildCommentBody(reviewResult, context));
  const postMode = args['post-mode'] ?? context.github?.postMode ?? context.postMode ?? 'summary';

  if (dryRun) {
    console.log(body);
    const inlineComments = buildInlineComments(reviewResult, context);
    if (shouldPostInline(postMode) && inlineComments.length > 0) {
      console.log(`\n[DRY RUN] Inline review comments: ${inlineComments.length}`);
    }
    return;
  }

  const repository = args.repository ?? process.env.GITHUB_REPOSITORY;
  const prNumber = args['pr-number'] ?? process.env.PR_NUMBER ?? context.prNumber;
  const token = process.env.GITHUB_TOKEN;

  if (!repository || !prNumber || !token) {
    throw new Error(
      'repository, pr-number, and GITHUB_TOKEN are required unless --dry-run is set.',
    );
  }

  await upsertComment({ repository, prNumber, token, body });
  if (shouldPostInline(postMode)) {
    await upsertInlineComments({ repository, prNumber, token, reviewResult, context });
  }
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      continue;
    }
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      index += 1;
    }
  }
  return args;
}

function readJsonIfExists(filePath) {
  if (!filePath || !existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
  } catch {
    return null;
  }
}

function readReview(filePath) {
  if (!existsSync(filePath)) {
    return {
      ok: false,
      error: `Review output file not found: ${filePath}`,
      review: null,
    };
  }

  try {
    return {
      ok: true,
      error: '',
      review: JSON.parse(readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '')),
    };
  } catch (error) {
    return {
      ok: false,
      error: `Failed to parse review output: ${error.message}`,
      review: null,
    };
  }
}

function buildCommentBody(reviewResult, context) {
  const lines = [REVIEW_MARKER, '## Tikitak PR Review', ''];

  if (!reviewResult.ok) {
    lines.push(
      ...buildContextSummary(context),
      '',
      '### 실행 실패',
      '',
      'Tikitak PR 리뷰 결과를 정상적으로 읽지 못했습니다.',
      '',
      `- 사유: ${reviewResult.error}`,
      '- docs/diff 컨텍스트 생성 로그와 AI review action 로그를 확인해 주세요.',
    );
    return limitComment(lines.join('\n'));
  }

  const review = reviewResult.review;
  const overall = review.overall ?? {};
  lines.push(...buildOverviewSection({ overall, context, review }));

  lines.push('', '### 프로젝트 규칙 점검', '');
  const requirements = arrayOrEmpty(review.repo_rules_check);
  if (requirements.length === 0) {
    lines.push('- 기록된 요구사항 점검 결과가 없습니다.');
  } else {
    lines.push('| 상태 | 출처 | 내용 |', '| --- | --- | --- |');
    for (const item of requirements) {
      lines.push(
        `| ${escapeTableCell(formatStatus(item.status))} | ${escapeTableCell(item.source || 'unknown')} | ${escapeTableCell(item.detail || '')} |`,
      );
    }
  }

  lines.push('', '### 주요 발견 사항', '');
  const findings = arrayOrEmpty(review.findings);
  if (findings.length === 0) {
    lines.push('- 주요 발견 사항이 없습니다.');
  } else {
    lines.push('| 심각도 | 분류 | 제목 | 위치 |', '| --- | --- | --- | --- |');
    for (const finding of findings) {
      lines.push(formatFindingRow(finding));
    }
  }

  lines.push(...buildCompactListSection('테스트 / 검증 누락', review.test_gaps));
  lines.push(...buildCompactListSection('확인 필요', review.needs_confirmation));
  lines.push(...buildContextDetails(context, review));

  return limitComment(lines.join('\n'));
}

function buildOverviewSection({ overall, context, review }) {
  const findings = arrayOrEmpty(review.findings);
  const criticalCount = findings.filter((finding) => finding.severity === 'critical').length;
  const majorCount = findings.filter((finding) => finding.severity === 'major').length;

  return [
    ...buildContextSummary(context),
    '',
    `> ${overall.summary || '요약 없음'}`,
    '',
    '| 항목 | 값 |',
    '| --- | --- |',
    `| 판정 | ${escapeTableCell(formatVerdict(overall.verdict))} |`,
    `| 신뢰도 | ${escapeTableCell(formatConfidence(overall.confidence))} |`,
    `| 주요 발견 | ${escapeTableCell(`${findings.length}개 (Critical ${criticalCount}, Major ${majorCount})`)} |`,
  ];
}

function buildContextSummary(context) {
  const diff = context.diff ?? {};
  return [
    '- 이 코멘트는 Tikitak PR Review가 생성했습니다.',
    `- 리뷰 모드: ${context.reviewMode ?? context.relatedContext?.mode ?? 'diff'}`,
    `- 기준 SHA: ${formatSha(context.baseSha)} -> ${formatSha(context.headSha)}`,
    `- diff 대상 파일: ${arrayOrEmpty(diff.includedFiles).length}`,
  ];
}

function formatFindingRow(finding) {
  const evidence = finding.evidence ?? {};
  const diff = evidence.diff ?? {};
  const location = diff.file
    ? `\`${diff.file}${formatLineRange(diff.line_start, diff.line_end)}\``
    : '-';

  return `| ${[
    escapeTableCell(formatSeverity(finding.severity)),
    escapeTableCell(finding.category || 'other'),
    escapeTableCell(finding.title || '제목 없음'),
    escapeTableCell(location),
  ].join(' | ')} |`;
}

function buildCompactListSection(title, items) {
  const values = arrayOrEmpty(items);
  if (values.length === 0) {
    return ['', `### ${title}`, '', '- 없음'];
  }
  return ['', `### ${title}`, '', ...values.map((item) => `- ${item}`)];
}

function buildContextDetails(context, review) {
  const docs = arrayOrEmpty(context.docs);
  const diff = context.diff ?? {};
  const relatedFiles = arrayOrEmpty(context.relatedContext?.files);
  const warnings = [...arrayOrEmpty(context.warnings), ...arrayOrEmpty(review.warnings)];

  return [
    '',
    '<details>',
    '<summary>실행 컨텍스트</summary>',
    '',
    `- 참조 문서: ${docs.length > 0 ? docs.map((doc) => `\`${doc.path}\``).join(', ') : '없음'}`,
    `- diff 포함 파일: ${
      arrayOrEmpty(diff.includedFiles).length > 0
        ? arrayOrEmpty(diff.includedFiles)
            .map((file) => `\`${file}\``)
            .join(', ')
        : '없음'
    }`,
    `- diff 제외 파일: ${
      arrayOrEmpty(diff.ignoredFiles).length > 0
        ? arrayOrEmpty(diff.ignoredFiles)
            .map((file) => `\`${file}\``)
            .join(', ')
        : '없음'
    }`,
    `- 관련 컨텍스트: ${
      relatedFiles.length > 0 ? relatedFiles.map((file) => `\`${file.path}\``).join(', ') : '없음'
    }`,
    `- 실행 경고: ${warnings.length > 0 ? warnings.join(' / ') : '없음'}`,
    '',
    '</details>',
  ];
}

function formatFindingEvidence(finding) {
  const evidence = finding.evidence ?? {};
  const diff = evidence.diff ?? {};
  const docs = arrayOrEmpty(evidence.docs);
  const evidenceText = [
    docs.length > 0 ? `Docs: ${docs.join(', ')}` : '',
    diff.file ? `Diff: ${diff.file}${formatLineRange(diff.line_start, diff.line_end)}` : '',
  ]
    .filter(Boolean)
    .join(' / ');

  return evidenceText || '명시된 근거 없음';
}

function formatFindingDetails(finding) {
  return [
    `**${formatSeverity(finding.severity)} · ${finding.category || 'other'}**`,
    '',
    `**${finding.title || '제목 없음'}**`,
    '',
    finding.body || '',
    '',
    '**제안**',
    '',
    finding.recommendation || '',
    '',
    `<sub>${formatFindingEvidence(finding)} · 신뢰도 ${formatConfidence(finding.confidence)}</sub>`,
  ].join('\n');
}

function escapeTableCell(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
}

function formatSha(value) {
  if (!value) {
    return 'unknown';
  }
  const text = String(value);
  return `\`${/^[a-f0-9]{40}$/i.test(text) ? text.slice(0, 7) : text}\``;
}

function formatLineRange(start, end) {
  if (!start && !end) {
    return '';
  }
  if (start && end && start !== end) {
    return `:${start}-${end}`;
  }
  return `:${start ?? end}`;
}

function formatVerdict(verdict) {
  const labels = {
    looks_good: '큰 이슈 없음',
    needs_attention: '확인 필요',
    blocked: '머지 전 수정 필요',
    insufficient_context: '컨텍스트 부족',
  };
  return labels[verdict] ?? verdict ?? 'unknown';
}

function formatStatus(status) {
  const labels = {
    satisfied: '충족',
    partial: '부분 충족',
    missing: '누락',
    unclear: '불명확',
    not_applicable: '해당 없음',
  };
  return labels[status] ?? status ?? 'unknown';
}

function formatSeverity(severity) {
  const labels = {
    critical: 'Critical',
    major: 'Major',
    minor: 'Minor',
    info: 'Info',
  };
  return labels[severity] ?? severity ?? 'Info';
}

function formatConfidence(confidence) {
  if (typeof confidence !== 'number' || Number.isNaN(confidence)) {
    return 'unknown';
  }
  return confidence.toFixed(2);
}

function arrayOrEmpty(value) {
  return Array.isArray(value) ? value : [];
}

function limitComment(body) {
  const limit = 60000;
  if (body.length <= limit) {
    return body;
  }
  return `${body.slice(0, limit)}\n\n[TRUNCATED: GitHub comment size guard]`;
}

async function upsertComment({ repository, prNumber, token, body }) {
  const previous = await findExistingReviewComment({ repository, prNumber, token });

  if (previous) {
    await githubApi({
      token,
      method: 'PATCH',
      path: `/repos/${repository}/issues/comments/${previous.id}`,
      body: { body },
    });
    console.log(`Updated Tikitak PR review comment ${previous.id}`);
    return;
  }

  const created = await githubApi({
    token,
    method: 'POST',
    path: `/repos/${repository}/issues/${prNumber}/comments`,
    body: { body },
  });
  console.log(`Created Tikitak PR review comment ${created.id}`);
}

async function findExistingReviewComment({ repository, prNumber, token }) {
  let page = 1;

  while (true) {
    const comments = await githubApi({
      token,
      method: 'GET',
      path: `/repos/${repository}/issues/${prNumber}/comments?per_page=${GITHUB_COMMENT_PAGE_SIZE}&page=${page}`,
    });

    if (!Array.isArray(comments) || comments.length === 0) {
      return null;
    }

    const previous = comments.find(
      (comment) => typeof comment.body === 'string' && comment.body.includes(REVIEW_MARKER),
    );
    if (previous) {
      return previous;
    }

    if (comments.length < GITHUB_COMMENT_PAGE_SIZE) {
      return null;
    }

    page += 1;
  }
}

function shouldPostInline(postMode) {
  return ['inline', 'summary_and_inline'].includes(postMode);
}

async function upsertInlineComments({ repository, prNumber, token, reviewResult, context }) {
  const inlineComments = buildInlineComments(reviewResult, context);
  if (inlineComments.length === 0) {
    console.log('No eligible Tikitak inline review comments.');
    return;
  }

  const existing = await listReviewComments({ repository, prNumber, token });
  const existingByMarker = new Map(
    existing
      .filter((comment) => typeof comment.body === 'string')
      .map((comment) => [extractInlineMarker(comment.body), comment])
      .filter(([marker]) => marker),
  );

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const comment of inlineComments) {
    const previous = existingByMarker.get(comment.marker);
    try {
      if (previous) {
        if (isSameInlineTarget(previous, comment.payload)) {
          await githubApi({
            token,
            method: 'PATCH',
            path: `/repos/${repository}/pulls/comments/${previous.id}`,
            body: { body: comment.body },
          });
          updated += 1;
          continue;
        }

        await githubApi({
          token,
          method: 'DELETE',
          path: `/repos/${repository}/pulls/comments/${previous.id}`,
        });
        await createInlineComment({ repository, prNumber, token, comment });
        created += 1;
        continue;
      }

      await createInlineComment({ repository, prNumber, token, comment });
      created += 1;
    } catch (error) {
      skipped += 1;
      console.warn(
        `Skipped inline Tikitak review comment for ${comment.path}:${comment.line}: ${error.message}`,
      );
    }
  }

  console.log(
    `Tikitak inline review comments: ${created} created, ${updated} updated, ${skipped} skipped.`,
  );
}

async function createInlineComment({ repository, prNumber, token, comment }) {
  await githubApi({
    token,
    method: 'POST',
    path: `/repos/${repository}/pulls/${prNumber}/comments`,
    body: comment.payload,
  });
}

function isSameInlineTarget(previous, payload) {
  return (
    previous.commit_id === payload.commit_id &&
    previous.path === payload.path &&
    previous.line === payload.line &&
    normalizeLine(previous.start_line) === normalizeLine(payload.start_line)
  );
}

function normalizeLine(line) {
  return line ?? null;
}

function buildInlineComments(reviewResult, context) {
  if (!reviewResult.ok) {
    return [];
  }

  const review = reviewResult.review ?? {};
  const includedFiles = new Set(arrayOrEmpty(context.diff?.includedFiles));
  const commitId = context.headSha;
  if (!commitId) {
    return [];
  }

  return arrayOrEmpty(review.findings)
    .map((finding) => buildInlineComment(finding, { includedFiles, commitId }))
    .filter(Boolean);
}

function buildInlineComment(finding, { includedFiles, commitId }) {
  const diff = finding.evidence?.diff ?? {};
  const path = diff.file;
  const lineStart = diff.line_start;
  const lineEnd = diff.line_end ?? lineStart;

  if (!path || !Number.isInteger(lineStart) || !Number.isInteger(lineEnd)) {
    return null;
  }
  if (includedFiles.size > 0 && !includedFiles.has(path)) {
    return null;
  }

  const marker = buildInlineMarker(finding, diff);
  const body = redactSecrets(
    [`<!-- ${INLINE_REVIEW_MARKER}:${marker} -->`, formatFindingDetails(finding)].join('\n'),
  );

  const payload = {
    body,
    commit_id: commitId,
    path,
    line: Math.max(lineStart, lineEnd),
    side: 'RIGHT',
  };

  if (lineStart !== lineEnd) {
    payload.start_line = Math.min(lineStart, lineEnd);
    payload.start_side = 'RIGHT';
  }

  return {
    marker,
    path,
    line: payload.line,
    body,
    payload,
  };
}

function buildInlineMarker(finding, diff) {
  const key = [
    diff.file ?? '',
    diff.line_start ?? '',
    diff.line_end ?? '',
    finding.category ?? '',
  ].join(':');
  return createHash('sha256').update(key).digest('hex').slice(0, 16);
}

function extractInlineMarker(body) {
  const match = body.match(new RegExp(`<!--\\s*${INLINE_REVIEW_MARKER}:([a-f0-9]{16})\\s*-->`));
  return match?.[1] ?? '';
}

async function listReviewComments({ repository, prNumber, token }) {
  const comments = [];
  let page = 1;

  while (true) {
    const pageComments = await githubApi({
      token,
      method: 'GET',
      path: `/repos/${repository}/pulls/${prNumber}/comments?per_page=${GITHUB_COMMENT_PAGE_SIZE}&page=${page}`,
    });

    if (!Array.isArray(pageComments) || pageComments.length === 0) {
      return comments;
    }

    comments.push(...pageComments);
    if (pageComments.length < GITHUB_COMMENT_PAGE_SIZE) {
      return comments;
    }

    page += 1;
  }
}

async function githubApi({ token, method, path, body }) {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`GitHub API failed: ${response.status} ${redactSecrets(text).slice(0, 500)}`);
  }

  try {
    return text ? JSON.parse(text) : null;
  } catch (error) {
    const responsePreview = redactSecrets(text).slice(0, 200);
    throw new Error(
      `Failed to parse GitHub API response as JSON: ${error.message}. Response: ${responsePreview}`,
    );
  }
}

function redactSecrets(value) {
  let text = String(value);
  for (const [name, secretValue] of Object.entries(process.env)) {
    if (!secretValue || secretValue.length < 4) {
      continue;
    }
    if (/(TOKEN|KEY|SECRET|PASSWORD|JIRA_EMAIL|GITHUB_TOKEN|OPENAI_API_KEY)/i.test(name)) {
      text = text.split(secretValue).join(`[REDACTED:${name}]`);
    }
  }
  return text
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, '[REDACTED:OPENAI_KEY]')
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, '[REDACTED:GITHUB_TOKEN]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]')
    .replace(/Basic\s+[A-Za-z0-9+/=]+/gi, 'Basic [REDACTED]');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
