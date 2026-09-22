---
name: gen-test
description: 컴포넌트, 훅, 유틸리티 파일에 대한 Vitest + React Testing Library 테스트를 생성합니다.
user-invocable: true
argument-hint: <file-path>
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# 워크플로우

## 1단계: 대상 파일 읽기

`$ARGUMENTS`에서 파일 경로 확인. 파일 전체를 읽고 props, 상태, 사이드이펙트, 엣지 케이스 파악.

## 2단계: 테스트 방식 결정

| 대상     | 방식                        |
| -------- | --------------------------- |
| 컴포넌트 | 렌더 → 인터랙션 → 출력 검증 |
| 훅       | `renderHook` + `act`        |
| 유틸리티 | 입력/출력 검증              |

## 3단계: 테스트 파일 작성

소스 파일과 같은 디렉터리에 co-location(`__tests__/` 폴더로 분리 금지 — `rules/testing.md` 참고):

```
src/shared/ui/Button.tsx       → src/shared/ui/Button.test.tsx
src/shared/hooks/useAuth.ts    → src/shared/hooks/useAuth.test.ts
src/shared/lib/formatDate.ts   → src/shared/lib/formatDate.test.ts
```

### 필수 커버리지

1. 에러 없이 렌더링되는지
2. props/variants가 올바르게 동작하는지
3. 사용자 인터랙션이 기대한 결과를 내는지
4. 접근성 속성이 있는지
5. 엣지 케이스: 빈 데이터, 에러 상태, 로딩

### 쿼리 우선순위

`getByRole` → `getByLabelText` → `getByText` → `getByTestId`

## 4단계: 실행 및 검증

```bash
yarn test <테스트-파일-경로>
```

모든 테스트 통과할 때까지 반복. 실패하는 테스트를 남기지 않기.

# 규칙

- `fireEvent`로 인터랙션 처리 (`@testing-library/user-event` 미도입 — `rules/testing.md` 참고)
- 상태 변경은 `act()`로 래핑
- 비동기 작업: `await act(async () => ...)`
- CSS 클래스나 Tailwind 유틸리티 검증 금지
- 내부 상태나 private 메서드 테스트 금지
- `it()` 블록 하나에 동작 하나
