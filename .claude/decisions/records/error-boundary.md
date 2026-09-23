# 에러 바운더리 (Error Boundary)

## 현재 상태

- 상태: accepted
- 기록일: 2026-09-23

**라우트 레벨만 적용**. React Router v7의 `errorElement` 사용.

- `src/pages/error/RootErrorBoundary.tsx` — `useRouteError`로 라우트 에러 처리
- `src/pages/not-found/NotFoundPage.tsx` — `path: '*'` catch-all 404
- 위치: `router.tsx`의 layout-route children에 `errorElement` 부착 → MainLayout 셸 유지하며 에러 UI 표시

## 컴포넌트 레벨 ErrorBoundary는 도입 보류

- 상태: rejected
- 기록일: 2026-09-23

도입 트리거가 등장할 때까지 라이브러리/래퍼 추가하지 않음.

### 도입 트리거

- `useSuspenseQuery` 사용 시작 — 에러를 throw 하므로 컴포넌트 바운더리 필요
- 위젯 격리 필요한 시점 — 댓글, 이미지 캐러셀, 피드 한 항목 등 한 부분 실패가 페이지 전체로 번지면 안 될 때
- 서드파티 임베드 도입 — 지도, 결제 SDK 같이 외부 코드 실패가 격리되어야 할 때

### 도입 시 작업

1. `react-error-boundary` 설치 (클래스 ErrorBoundary 직접 작성보단 표준)
2. `src/shared/ui/ErrorBoundary` 프로젝트 래퍼 생성 — 공통 fallback UI + 로깅
3. TanStack Query 연동: `QueryErrorResetBoundary`로 retry 흐름 처리

### 왜 지금 안 하나

지금 시점에 감쌀 대상이 없음. 라이브러리 추가, 래퍼 생성, 설정 모두 데드 코드.
첫 사용처 등장 시점에 패턴을 명확히 잡고 한꺼번에 도입하는 게 추상화 비용 대비 효과가 좋음.

## Suspense

- 상태: rejected
- 기록일: 2026-09-23

라우트 레벨 Suspense 경계도 보류. `React.lazy` 라우트나 `useSuspenseQuery` 첫 도입 시 페이지/컴포넌트 단위로 추가.
