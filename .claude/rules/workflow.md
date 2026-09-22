# Workflow Rules

## 기본 작업 순서

1. 변경 전에 관련 파일, 기존 패턴, 가까운 테스트를 먼저 확인한다.
2. 작업을 page/route, shared UI, query/mutation, hook, refactor, config/docs 중 하나로 분류한다.
3. 새 추상화보다 기존 구조, shared 유틸, 기존 컴포넌트, FSD 경계를 우선한다.
4. 변경 범위에 맞는 검증 명령을 함께 선택한다.
5. unrelated 변경을 섞지 않는다.
6. 커밋/PR 설명에는 실제 실행한 검증만 기록한다.

## 작업 유형별 기준

### Page / Route

- `src/pages` 책임과 `src/shared` 책임을 분리한다.
- loading, empty, error, disabled, success 상태를 고려한다.
- 라우팅, 인증, 팀 선택, 사용자 플로우가 바뀌면 E2E 영향 여부를 확인한다.

### Shared UI

- 한 페이지 전용이면 `shared`로 올리지 않는다.
- 공용 UI는 접근성 label, disabled 상태, keyboard 동작을 확인한다.
- UI 변형이 늘어나면 기존 variant 패턴을 우선한다.
- 가능하면 story를 추가하거나 기존 story를 갱신한다.

### Query / Mutation

- 서버 상태는 TanStack Query에 둔다.
- API 응답을 Zustand나 `useState`에 불필요하게 복제하지 않는다.
- API client, query key, query hook의 책임을 분리한다.
- loading, error, empty UX는 호출 UI에서 명시적으로 처리한다.

### Hook

- page-local hook과 shared hook을 먼저 구분한다.
- browser/native API, storage, timer 의존성은 테스트 가능하게 분리한다.
- 상태 전이가 복잡하면 관련 unit test를 추가하거나 기존 테스트를 갱신한다.

### Refactor

- 동작 변경과 구조 변경을 한 PR에 섞지 않는다.
- 리팩터링 전후 동일 동작을 증명할 최소 검증을 먼저 정한다.
- 삭제, 이동, 기존 유틸 재사용을 새 레이어 추가보다 우선한다.

### Config / Docs

- 설정 변경은 CI, build, local command에 미치는 영향을 함께 확인한다.
- 문서 변경은 실제 현재 구조와 명령어만 적는다.
- agent 하네스 변경은 기존 `AGENTS.md`, `CLAUDE.md`, `.claude/rules`와 충돌하지 않게 둔다.
