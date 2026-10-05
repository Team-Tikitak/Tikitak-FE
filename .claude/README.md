# Manifest — Claude Code Boot Sequence

이 문서는 Claude Code가 대화 시작 시 어떤 파일을 어떤 순서로 읽어야 하는지를 정의한다.

## 부트 순서

1. `CLAUDE.md`에서 프로젝트 개요를 읽는다.
2. 이 manifest를 읽는다.
3. 코드 변경 작업에서는 Tier 1 규칙을 로드한다.
4. Tier 2, Tier 3 규칙과 도메인 reference는 작업에 필요한 경우에만 로드한다.

## Tier 1: 기본 로드

| 파일                             | 목적                                   |
| -------------------------------- | -------------------------------------- |
| `.claude/rules/code-style.md`    | 네이밍, 파일·폴더 컨벤션               |
| `.claude/rules/data-fetching.md` | TanStack Query·axios·zustand 사용 전략 |
| `.claude/rules/workflow.md`      | 기본 inspect-edit-verify 작업 흐름     |
| `.claude/rules/verification.md`  | 검증 명령 선택 기준                    |

Tier 1은 코드 변경, 리뷰, 리팩터링처럼 실제 작업이 시작될 때만 로드한다. 단순 질문이나 설명 요청에서는 `CLAUDE.md`와 이 manifest만으로 답한다.

## Tier 2: 필요 시 로드

| 작업                             | 로드할 문서                                  |
| -------------------------------- | -------------------------------------------- |
| 파일 배치, import, 구조 판단     | `.claude/rules/architecture.md`              |
| 컴포넌트 신규 작성·리팩토링      | `.claude/rules/component-guide.md`           |
| 테스트 작성                      | `.claude/rules/testing.md`                   |
| 성능 최적화·렌더링 이슈          | `.claude/skills/react-performance/AGENTS.md` |
| 구조, 라이브러리, 규칙 변경 결정 | `.claude/decisions/README.md`                |
| PR/커밋 문구 작성                | `.claude/rules/commit-convention.md`         |

## Tier 3: 도메인별 로드

작업 도메인이 명확하면 해당 파일만 로드한다.

| 도메인                | 파일                                        | 트리거 키워드                                                         |
| --------------------- | ------------------------------------------- | --------------------------------------------------------------------- |
| 인증·로그인·약관      | `.claude/references/domain/auth.md`         | `auth`, `login`, `terms`, OAuth                                       |
| 팀 관리               | `.claude/references/domain/team.md`         | `team`, `member`, `role`, `OWNER`                                     |
| 온보딩·질문           | `.claude/references/domain/onboarding.md`   | `onboarding`, `question`, `step`, `character`                         |
| 마이페이지·내 팀 목록 | `.claude/references/domain/user.md`         | `myPage`, `TeamItem`, 내 팀                                           |
| 피드                  | `.claude/references/domain/feed.md`         | `feed`, `comment`, `FeedPage`, `FeedDetail`                           |
| 피드 에디터           | `.claude/references/domain/editor.md`       | `feedEditor`, `dailyFeedEditor`, `create feed`, `edit feed`           |
| 장소/지도             | `.claude/references/domain/place.md`        | `home`, `map`, `place`, `KakaoMap`, `location`                        |
| 활동                  | `.claude/references/domain/activity.md`     | `activity`, `monthly`, `attendance`, `recommended places`             |
| 초대                  | `.claude/references/domain/invitation.md`   | `invite`, `invitation`, `teamInvite`, `inviteAccept`                  |
| 네이티브/카메라       | `.claude/references/domain/native.md`       | `Capacitor`, `native`, `camera`, `keyboard`, `back button`, `WebView` |
| 알림                  | `.claude/references/domain/notification.md` | `notification`, `Notification`, `알림`                                |
| 갤러리                | `.claude/references/domain/gallery.md`      | `gallery`, `Gallery`, `사진 선택`                                     |

## Skills

| Skill                 | 용도                                                       |
| --------------------- | ---------------------------------------------------------- |
| `/scaffold-api`       | OpenAPI/Swagger 기반 API 클라이언트·TanStack Query 훅 생성 |
| `/gen-test`           | Vitest + Testing Library 테스트 생성                       |
| `/code-review`        | 변경 코드 리뷰                                             |
| `/pr-inline-review`   | GitHub PR 변경 diff를 리뷰하고 inline comment 작성         |
| `/commit-kr`          | 한국어 커밋 메시지 제안                                    |
| `/create-pr`          | PR 제목과 본문 초안 작성                                   |
| `/figma-to-component` | Figma 디자인을 프로젝트 컴포넌트로 구현                    |
| `/refactor`           | 동작 변경 없는 리팩터링 후보 분석과 적용                   |

## Agents

`.claude/agents/`의 프로젝트 전용 서브에이전트. 읽기 전용이며 파일을 수정하지 않는다.

| Agent              | 용도                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| `tikitak-reviewer` | FSD 경계·컴포넌트 컨벤션·데이터 페칭·테스트 커버리지 기준 리뷰                     |
| `tikitak-verifier` | `verification.md` 기준으로 필요한 yarn 검증만 골라 실행하고 결과 보고              |
| `tikitak-debugger` | 트러블슈팅 히스토리와 이 프로젝트의 반복 버그 유형을 먼저 확인한 뒤 근본 원인 추적 |

## Hooks

Claude Code 환경에서는 `.claude/settings.json`이 아래 hook을 사용한다.

- `guard-rules.sh`: Edit/Write/Bash 실행 전 `console.log`, 명시적 `any`, `npm`/`pnpm`/`npx` 명령어를 차단한다 (`yarn`은 이 프로젝트의 패키지 매니저라 차단 대상 아님).
- 저장 후 자동 ESLint 훅은 사용하지 않는다. 작은 수정마다 흐름을 끊지 않고, 작업 완료 시 필요한 범위에 맞춰 `yarn lint`와 `yarn type-check`로 검증한다.
- `skill-suggest.sh`: 사용자 프롬프트 키워드에 맞는 local skill을 제안한다.

## Decision History

프로젝트 구조, 라이브러리, 네이티브/웹 전략, API 처리 방식, 공통 규칙처럼 이후 작업 방향을 제한하는 결정은 `.claude/decisions/`에 기록한다.

- 단순 구현, 오타 수정, 일회성 UI 조정은 기록하지 않는다.
- 새 decision을 만들기 전 `.claude/decisions/README.md`를 먼저 확인한다.
- 실제 문서는 `.claude/decisions/records/<주제>.md`로 작성한다(주제별 flat 파일, `NNN-` 번호
  없음 — `README.md`/`template.md`만 `decisions/` 바로 아래, 결정 문서는 전부 `records/` 하위).
  관련 결정은 한 파일에 이어서 쓰고, 각 `##` 섹션에 `상태`/`기록일`을 남긴다.

## Troubleshooting / Session History

`.claude/troubleshooting/notable-fixes.md`가 팀 공유용 진입점이다. 재발 가능성이 높은 버그
패턴만 주제별(인증, hero 전환, 카메라, 바텀시트/키보드, 레이아웃, 상태 동기화, 접근성, 빌드,
네이티브)로 압축해뒀다 — 새 화면/유사 기능을 만들기 전에 관련 섹션을 먼저 확인한다.

- `troubleshooting.md`, `e2e.md`는 그대로 팀 공유. 특정 PR의 상세 트러블(ssgoi 마이그레이션,
  e2e 도입 등) 회고로, 검증 커맨드 나열 없이 이미 잘 정리돼 있다.
- 날짜/PR 단위의 상세 세션 로그(검증 커맨드 나열 포함)는 개인 회고·포트폴리오 자료 성격이 강해
  `.claude/private/troubleshooting/`(git 비공유)에 둔다. 여기 새로 추가할 때도 형식은 동일하게
  날짜/번호 섹션 아래 `증상`, `원인`, `해결`, `검증`, `배움`을 쓴다.
- 개인 세션 로그에 재발 가능성이 높은 패턴을 새로 발견하면 `notable-fixes.md`에도 압축해서
  옮긴다(검증 커맨드·PR 번호는 빼고 증상/원인/해결/배움만).
- `troubleshooting/`은 이미 해결된 문제의 회고록이다. **아직 우리 코드만으로 해결할 수 없는
  외부 의존성·브라우저/OS 제약**은 여기 대신 `.claude/known-issues/`에 남긴다(기준은
  `.claude/known-issues/README.md` 참고).

## Known Issues

우리 코드만으로 해결할 수 없는 외부 의존성, 브라우저/OS 정책, 네이티브 플랫폼 제약은
`.claude/known-issues/`에 기록한다. 새 이슈를 만들기 전 `.claude/known-issues/README.md`를
먼저 확인한다. 실제 문서는 `.claude/known-issues/records/short-title.md`로 작성하고 `상태`
(`open`/`monitoring`/`resolved`/`wontfix`)를 남긴다.

## 금지 패턴

- ❌ 도메인이 명확하지 않을 때 모든 reference 파일을 로드
- ❌ Tier 2 파일을 단순 채팅·질문 응답 시점에 로드
- ❌ 프로젝트 전체 파일 탐색 후 컨텍스트 추론 (도메인 파일로 먼저 가기)
- ❌ 도메인 규칙을 찾기 전에 코드를 수정하거나 새로 작성
