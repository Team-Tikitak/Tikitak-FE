---
name: code-review
description: 변경된 코드를 프로젝트 규칙 기준으로 리뷰하고 심각도별 이슈를 보고합니다.
user-invocable: true
argument-hint: [file-or-branch]
allowed-tools: Bash, Read, Grep, Glob
---

# Code Review

변경 사항을 읽고 버그, 보안, 유지보수성, 프로젝트 규칙 위반을 찾습니다.
이 스킬은 **읽기 전용**입니다. 코드를 수정하지 말고 리뷰 리포트만 출력합니다.

## Workflow

### 1. 리뷰 범위 확인

인자가 없으면 현재 작업트리의 staged + unstaged 변경을 리뷰합니다.
인자가 파일이면 해당 파일을, 브랜치나 ref 범위면 해당 diff를 리뷰합니다.

기본 확인 명령:

```bash
git diff --name-only
git diff --staged --name-only
git diff
git diff --staged
```

브랜치 비교가 필요한 경우:

```bash
git diff main...HEAD --name-only
git diff main...HEAD
```

### 2. 관련 규칙 읽기

변경 파일과 관련된 프로젝트 규칙을 먼저 확인합니다.

- `CLAUDE.md`
- `.claude/rules/architecture.md`
- `.claude/rules/code-style.md`
- `.claude/rules/component-guide.md`
- `.claude/rules/data-fetching.md`
- `.claude/skills/react-performance/AGENTS.md`

필요한 규칙만 읽고, 읽지 않은 규칙을 근거로 단정하지 않습니다.

### 3. 리뷰 기준

우선순위는 실제 결함 가능성이 높은 항목입니다.

| 영역        | 확인 내용                                                      |
| ----------- | -------------------------------------------------------------- |
| 동작        | 런타임 버그, 상태 불일치, 잘못된 조건 분기, 깨지는 사용자 흐름 |
| FSD 구조    | `shared`가 `pages`를 의존하지 않는지, 레이어 경계가 유지되는지 |
| 타입 안정성 | 불필요한 `any`, 잘못된 타입 단언, 누락된 null/undefined 처리   |
| 컴포넌트    | `className`/`ref` 노출, prop 설계, 접근 가능한 HTML 요소 사용  |
| 데이터 요청 | TanStack Query 패턴, query key 안정성, 에러/로딩 처리          |
| 접근성      | `button`/`a` 의미, `aria-label`, `alt`, 키보드 조작 가능성     |
| 성능        | 불필요한 렌더링, 반복 계산, 과도한 effect, 불안정한 의존성     |
| 보안        | XSS, 민감 정보 노출, 신뢰할 수 없는 입력 처리                  |
| 테스트      | 변경 위험도에 맞는 테스트 또는 검증 누락                       |

스타일 선호만으로는 이슈를 만들지 않습니다. 실제 위험이나 프로젝트 규칙 위반이 있을 때만 보고합니다.

### 4. 심각도

| 등급       | 기준                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| Critical   | 보안 취약점, 데이터 손실, 주요 플로우 중단 가능성                       |
| Major      | 실제 버그 가능성, 아키텍처/FSD 위반, 타입 안정성 문제, 접근성 주요 결함 |
| Minor      | 유지보수성 저하, 누락된 검증, 제한적인 UX/성능 문제                     |
| Suggestion | 선택적 개선, 명확성 향상, 낮은 위험의 리팩터링 제안                     |

### 5. 출력 규칙

`template.md` 형식을 따릅니다.

- Findings를 먼저 출력합니다.
- 이슈가 없는 등급 섹션은 생략합니다.
- 각 이슈는 `파일:라인`, 문제, 위험, 권장 수정 방향을 포함합니다.
- 확실하지 않은 내용은 추정이라고 표시합니다.
- 리뷰 범위 밖의 변경은 언급하지 않습니다.
- 좋은 점 칭찬 섹션은 만들지 않습니다.
- 코드 수정 예시는 꼭 필요할 때만 짧게 포함합니다.

## Verdict

- `Approve`: blocking 이슈 없음
- `Comment`: Critical/Major는 없고 Minor/Suggestion만 있음
- `Request changes`: Critical 또는 Major가 1개 이상 있음

## Final Check

최종 리포트 전에 확인합니다.

- 변경 파일을 실제로 읽었는가?
- 모든 finding에 구체적인 파일 위치가 있는가?
- 심각도가 위험도와 맞는가?
- 테스트/검증 미실행 여부를 명시했는가?

## Figma 컴포넌트 리뷰 체크

Figma 컴포넌트나 variant 기반 UI를 리뷰할 때 다음도 확인합니다.

- 같은 문자열 유니온이 여러 곳에 중복 선언되어 있지 않은가?
- Figma variant/property 값이 임의 문자열이 아니라 `as const` 튜플과 파생 유니온으로 관리되는가?
- variant config map이 `Record<Union, Config>`와 `satisfies`를 사용해 누락된 키를 잡는가?
- 설정 키와 유니온 원천이 따로 놀아서 불일치가 생길 수 있지 않은가?
- Figma variant를 하나의 variant 유니온 대신 boolean 여러 개로 풀어놓지 않았는가?
- variant에 따라 props 조합이 다르면 discriminated union이 더 적합하지 않은가?
- 탭, 메뉴 버튼, 분할 컨트롤, 라디오 그룹 같은 반복 UI가 설정 배열/맵으로 렌더링되는가?
- 순서가 중요하면 tuple을 사용하고, 값별 설정 완전성이 중요하면 `Record`를 사용하는가?
- Figma 컴포넌트/variant 경계가 코드 컴포넌트 경계에도 합리적으로 반영되어 있는가?

SVG/아이콘은 다음도 확인합니다.

- 복잡한 Figma SVG 경로를 UI 컴포넌트 안에 인라인으로 수동 작성하지 않았는가?
- 아이콘 생성 스크립트가 있으면 수동 인라인 SVG 대신 생성 에셋 흐름을 따르는가?
- SVG 에셋이 아직 없으면 아이콘을 수동 재작성하지 않고 최소 임시 자리표시 또는 할 일 주석만 두었는가?
- 사용자가 추가한 SVG 에셋을 프로젝트가 지원하는 방식, 예를 들어 `?react`, 으로 가져오는가?
- 상태별 색상이 필요한 아이콘이 hardcoded `fill`/`stroke` 대신 `currentColor`를 사용하는가?
- 선택/활성/비활성 색상 변경이 필요한 아이콘에 `<img>`를 사용하지 않았는가?
- 선택 상태에서 경로 구조가 달라진다면 같은 SVG 안의 상태 그룹 또는 선택/비선택 에셋 분리로 의도적으로 표현했는가?
