---
name: pr-inline-review
description: GitHub PR 변경 diff를 한국어로 리뷰하고, 리뷰봇 계정으로 inline review comment를 남깁니다. 기본 실행은 현재 에이전트 단독 리뷰이며, 사용자가 명시한 경우에만 oh-my-claudecode:code-reviewer 에이전트 보조 리뷰 결과를 병합합니다.
user-invocable: true
argument-hint: [PR_URL_or_NUMBER] [--strict|--broad] [--with-code-reviewer]
allowed-tools: Bash, Read, Grep, Agent
---

# PR Inline Review

## Claude 스킬 경계

- 이 스킬은 `.claude/skills/pr-inline-review`에 독립적으로 구성된 Claude 전용 스킬입니다.
- 실행 규칙, 게시 흐름, 스크립트는 이 디렉터리의 `SKILL.md`와 `scripts/post-inline-review.mjs`만 기준으로 삼습니다.
- `.codex/skills/project-pr-inline-review`는 읽거나 따르지 않습니다.
- 프로젝트 코드 규칙을 요약할 때만 필요한 범위에서 `.claude/rules/*`를 참고할 수 있습니다.

GitHub PR의 변경 diff만 리뷰하고, CodeRabbit처럼 변경 라인에 inline review comment를 게시합니다.

이 스킬은 **게시 워크플로우**입니다. 로컬 리포트만 필요한 경우 `code-review`를 사용합니다.

## 리뷰 설정

```yaml
language: ko-KR
tone_instructions: |
  핵심만 짧게 지적하고, 왜 문제인지와 개선 방향을 함께 제시합니다.
  버그 가능성, 보안, 접근성, 유지보수 영향을 우선합니다.
  변경 diff와 직접 관련된 내용만 남기고 중복 지적은 피합니다.
  broad 모드에서는 UX, 타입 안정성, 테스트 리스크, DX 개선까지 포함하되 단순 선호나 취향 차이는 리뷰 코멘트로 남기지 않습니다.
```

## 리뷰 원칙

- 리뷰 코멘트는 한국어로 작성합니다.
- 버그 가능성, 보안, 접근성, 유지보수 영향이 있는 문제를 우선합니다.
- 단순 취향, 사소한 스타일 차이, 영향이 불명확한 추측은 게시하지 않습니다.
- 변경 diff와 직접 관련된 내용만 inline comment로 남깁니다.
- 생성 파일, lockfile, 바이너리/이미지 자산은 리뷰하지 않습니다.
- 같은 문제를 여러 줄에 중복 게시하지 않습니다.

## 리뷰 모드

기본 모드는 `strict`입니다.

### strict

- 확실한 버그, 보안, 접근성, 데이터 손상, 인증/권한, 사용자 흐름 회귀를 우선 게시합니다.
- 영향이 약하거나 추정성이 큰 유지보수/UX 제안은 게시하지 않습니다.
- 코멘트가 적더라도 기준을 만족하는 항목이 없으면 억지로 만들지 않습니다.

### broad

사용자가 다음 중 하나를 명시하면 broad 모드로 실행합니다.

- `--broad`
- `--coderabbit-style`
- "broad 모드"
- "보드 모드"
- "CodeRabbit 스타일"
- "넓게 봐줘"

broad 모드에서는 strict 기준에 더해 다음 항목도 리뷰 후보에 포함합니다.

- 유지보수성: 중복 로직, 책임 경계 흐림, 기존 프로젝트 패턴과 충돌하는 변경
- UX: 로딩/에러/빈 상태 누락, 모바일 조작 회귀, 접근성보다 낮은 수준의 사용성 문제
- 타입 안정성: 느슨한 타입, nullable/undefined guard 누락, API envelope 불일치 가능성
- 테스트 리스크: 변경된 핵심 분기나 회귀 위험이 큰 순수 로직에 대한 테스트 누락
- DX: 추후 API 연결/확장 시 오해를 부르는 이름, 숨은 전역 상태, 디버깅이 어려운 흐름

broad 모드에서도 단순 개수 채우기를 목표로 삼지 않습니다. 변경 diff와 직접 관련되고 수정 방향이 구체적인 항목만 남깁니다.

## 보조 리뷰어 사용

PR inline review는 기본적으로 현재 에이전트가 단독으로 수행합니다.

보조 리뷰어는 사용자가 다음 중 하나를 명시한 경우에만 호출합니다.

- `--with-code-reviewer`
- `--with-omc-review`
- "보조 리뷰 포함"
- "code-reviewer도 사용"

명시되지 않으면 `oh-my-claudecode:code-reviewer` 에이전트를 호출하지 않습니다.

보조 리뷰어를 명시한 경우에만 두 리뷰 흐름을 함께 사용합니다.

1. **기본 리뷰**: 현재 에이전트가 PR 변경 diff를 직접 읽고 inline 후보를 작성합니다.
2. **보조 리뷰**: `oh-my-claudecode:code-reviewer` 에이전트에 **같은 PR 변경 diff만** 전달해 별도 리뷰 후보를 받습니다.

보조 리뷰어 결과는 그대로 게시하지 않습니다. 아래 조건을 통과한 항목만 게시 후보에 병합합니다.

- PR 변경 diff의 실제 변경 라인에 anchor 가능해야 합니다.
- 기본 리뷰와 중복되지 않아야 합니다.
- 문제와 수정 방향이 구체적이어야 합니다.
- 추정성 코멘트가 아니라 재현 가능하거나 코드상 근거가 명확해야 합니다.
- Critical/Major급이거나, 적어도 유지보수/접근성/타입 안정성에 실질 영향이 있어야 합니다.

보조 리뷰를 호출한 경우 게시 payload에는 기본 리뷰와 보조 리뷰에서 통과한 코멘트를 모두 포함합니다. 최종 코멘트에는 리뷰어 출처를 표시하지 않습니다.

## Review Body

PR review body는 항상 `Summary`와 `Code Review`를 포함합니다.
`Code Review`에는 단순히 "inline comment로 남겼습니다"라고만 쓰지 말고, 실제로 남긴 리뷰 항목을 파일/라인 단위로 요약합니다.

```md
## Summary

PR의 핵심 변경 사항을 1문장으로 요약합니다.
변경 범위 목록은 3개로 고정하지 않고, PR 규모에 맞춰 보통 3~6개로 작성합니다.

- 변경 범위 1
- 변경 범위 2
- 변경 범위 3
- 변경 범위 4
- 변경 범위 5

## Code Review

변경 diff에 직접 anchor 가능한 리뷰 1건을 inline comment로 남겼습니다.

- `src/shared/ui/Radio/Radio.tsx:15` uncontrolled radio 사용 시 실제 checked 상태와 시각 표시가 어긋날 수 있어 동기화가 필요합니다.
```

inline comment가 없으면 `Code Review`에는 다음처럼 씁니다.

```md
## Code Review

추가로 남길 inline comment는 없습니다.
```

## 무시 경로

```yaml
ignore_patterns:
  - '.yarn/**'
  - '.pnp.*'
  - 'yarn.lock'
  - '**/*.png'
  - '**/*.jpg'
  - '**/*.jpeg'
  - '**/*.gif'
  - '**/*.webp'
  - '**/*.svg'
  - '**/*.ico'
  - 'coverage/**'
  - '**/storybook-static/**'
  - '**/*.snap'
```

## 요구 사항

- 리뷰봇 계정으로 게시하려면 `.env.pr-inline-review`의 `GH_TOKEN`이 필요합니다.
- `.env.pr-inline-review`는 이 스킬 실행 프로세스에서만 최우선으로 로드합니다.
- `scripts/post-inline-review.mjs`는 Node 내장 `fetch`로 GitHub REST API를 직접 호출합니다. `gh`는 PR metadata/diff 조회(Workflow 1단계)에만 사용하고, 게시 자체는 `gh`에 의존하지 않습니다.
- 토큰 파일은 커밋하지 않습니다.
- 현재 브랜치에 열린 PR이 없으면 사용자가 PR URL 또는 번호를 제공해야 합니다.
- inline comment는 PR diff에 존재하는 변경 라인에만 답니다.
- GitHub API로 review body/comment를 보낼 때는 UTF-8로 전송합니다.

## Workflow

1. PR metadata와 diff를 확인합니다.

   ```bash
   gh pr view --json number,title,baseRefName,headRefName,headRefOid,url
   gh pr diff --patch

   gh pr view <PR_URL_OR_NUMBER> --json number,title,baseRefName,headRefName,headRefOid,url
   gh pr diff <PR_URL_OR_NUMBER> --patch
   ```

2. ignore path를 제외하고 변경 hunk만 리뷰합니다.

3. 리뷰 모드를 결정한 뒤 기본 리뷰 후보를 작성합니다.
   - 사용자가 broad 모드를 명시했으면 `리뷰 모드 > broad` 기준으로 후보를 넓게 수집합니다.
   - 사용자가 strict 모드를 명시했거나 별도 모드 언급이 없으면 `리뷰 모드 > strict` 기준으로 후보를 수집합니다.

4. 사용자가 보조 리뷰어 사용을 명시한 경우에만 `oh-my-claudecode:code-reviewer` 에이전트에 같은 변경 diff를 전달해 보조 리뷰 후보를 받습니다.

   기본 실행에서는 이 단계를 건너뜁니다.

   보조 리뷰어 호출 시 prompt에 다음을 포함합니다.
   - PR 변경 diff 전문
   - 프로젝트 규칙 요약 (`.claude/rules/` 기반)
   - "변경 diff에 anchor 가능한 항목만, 한국어로, 심각도별 분류해서 보고해 주세요."

5. 기본 리뷰 후보와 보조 리뷰 후보를 병합합니다.

   보조 리뷰어를 호출하지 않은 경우에는 기본 리뷰 후보만 사용합니다.

   병합 규칙:
   - 같은 파일/라인/문제는 하나로 합칩니다.
   - 더 구체적인 설명과 수정 방향을 남깁니다.
   - anchor 불가능한 항목은 inline에서 제외하고 필요하면 review body에 요약합니다.
   - low-signal 항목은 게시하지 않습니다.

6. `tmp/` 아래에 임시 JSON payload를 만듭니다.

   ```json
   {
     "body": "## Summary\n\nPR 요약...\n\n## Code Review\n\n변경 diff에 직접 anchor 가능한 리뷰 1건을 inline comment로 남겼습니다.\n\n- `src/shared/ui/Button/Button.tsx:13` 폼 내부에서 의도치 않은 submit이 발생할 수 있어 `type=\"button\"` 명시가 필요합니다.",
     "comments": [
       {
         "path": "src/shared/ui/Button/Button.tsx",
         "line": 13,
         "side": "RIGHT",
         "body": "폼 내부에서 의도치 않은 submit이 발생하지 않도록 `type=\"button\"`을 명시해 주세요."
       }
     ]
   }
   ```

   필드 규칙:
   - `body`: `Summary`와 `Code Review` 섹션을 포함한 PR review 본문
   - `body`의 `Code Review`: 게시한 inline comment의 파일/라인과 핵심 문제를 목록으로 요약합니다.
   - `path`: repository-relative file path
   - `line`: `side: "RIGHT"`이면 새 파일 라인, `side: "LEFT"`이면 기존 파일 라인
   - `side`: 추가/수정 대상은 `RIGHT`, 삭제 라인은 `LEFT`
   - `position`: `line/side`가 불안정할 때만 사용
   - `comments[].body`: 짧고 실행 가능한 한국어 리뷰 코멘트

7. 먼저 dry-run을 실행합니다.

   ```bash
   node .claude/skills/pr-inline-review/scripts/post-inline-review.mjs \
     --comments-path tmp/review-comments.json \
     --pr-url https://github.com/OWNER/REPO/pull/12 \
     --dry-run
   ```

8. 사용자가 게시를 요청한 경우 실제 게시합니다.

   ```bash
   node .claude/skills/pr-inline-review/scripts/post-inline-review.mjs \
     --comments-path tmp/review-comments.json \
     --pr-url https://github.com/OWNER/REPO/pull/12
   ```

## 게시 순서

1. PR review bulk endpoint로 review body와 inline comments를 게시합니다.
2. 실패하면 개별 inline comment endpoint로 재시도합니다.
3. 그래도 실패하면 PR review body에 파일/라인 목록과 리뷰 내용을 fallback으로 게시합니다.
4. 성공하면 payload 파일을 삭제합니다.
5. 실패하면 payload 파일을 남겨 디버깅과 재시도를 가능하게 합니다.

## 운영 규칙

- strict 모드에서는 적은 수의 high-signal 코멘트를 선호합니다.
- broad 모드에서는 high-signal만 고집해 범위를 과도하게 좁히지 말고, 실제 유지보수/UX/타입 안정성/테스트 리스크가 있는 실행 가능한 코멘트도 포함합니다.
- 어떤 모드에서도 단순 개수 채우기, 취향 차이, 근거 약한 추정은 게시하지 않습니다.
- GitHub가 line anchor를 거부하면 억지로 inline에 고집하지 않고 fallback review body를 사용합니다.
- ignored path에 해당하는 comment는 payload에서 제외합니다.
- inline comment가 0건(리뷰 결과 문제 없음, 또는 모든 후보가 ignored path로 제외됨)이어도 실패가 아닙니다 — `body`만 담은 summary-only 리뷰를 게시합니다. `post-inline-review.mjs`는 빈 `comments` 배열을 허용합니다.
- 사용자가 명시하지 않은 기본 실행에서는 보조 리뷰어를 호출하지 않습니다.
- 보조 리뷰어 결과 때문에 게시 코멘트 수가 과도해지면 Critical/Major 또는 가장 영향 큰 항목만 남깁니다.
