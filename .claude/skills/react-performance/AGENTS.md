# React 성능 최적화 — 에이전트 참조

6개 카테고리, 25개 규칙. React SPA + Capacitor 웹뷰 기준.

## CRITICAL

- **async/병렬 요청**: 독립적 API 호출은 `Promise.all`로 병렬 처리
- **async/불필요한 await 제거**: 후속 작업 없으면 await 없이 실행
- **bundle/barrel import 피하기**: `index.ts`에서 import 대신 직접 경로 import
- **bundle/동적 import**: 초기 로딩 불필요한 컴포넌트는 `React.lazy` 사용
- **rerender/파생 상태**: useEffect로 setState 대신 useMemo로 렌더 중 계산

## HIGH

- **bundle/서드파티 지연 로딩**: 초기 렌더에 불필요한 라이브러리 동적 로드
- **rerender/함수형 setState**: 이전 상태 의존 시 `setCount(prev => prev + 1)`
- **rerender/lazy 초기화**: 무거운 초기값은 `useState(() => compute())`
- **rerender/useRef 일시적 값**: 리렌더 불필요한 값은 ref로 관리
- **rendering/조건부 렌더링**: CSS 숨김 대신 조건부 렌더링으로 DOM에서 제거
- **rendering/useTransition**: 비긴급 업데이트는 `startTransition`으로 분리
- **js/Set Map 조회**: 배열 `includes` 대신 `Set.has`로 O(1) 조회
- **js/함수 결과 캐싱**: 동일 입력 반복 계산 방지

## MEDIUM

- **async/Suspense 경계**: 데이터 로딩 시 Suspense로 선언적 관리
- **bundle/조건부 번들**: 특정 조건에서만 필요한 모듈 조건부 로드
- **rerender/이벤트 핸들러 우선**: useEffect 대신 이벤트 핸들러에서 사이드이펙트 처리
- **rerender/무거운 컴포넌트 memo**: 자주 바뀌는 상태와 무거운 렌더링 분리
- **rendering/JSX 호이스팅**: 변하지 않는 JSX는 컴포넌트 밖으로 추출
- **rendering/content-visibility**: 긴 리스트에서 화면 밖 요소 렌더링 지연
- **js/조기 종료**: `filter()[0]` 대신 `find()` 사용
- **js/반복문 병합**: 같은 배열 여러 번 순회 대신 한번에 처리
- **advanced/이벤트 핸들러 ref**: 콜백 안정화로 useEffect 재실행 방지
- **advanced/초기화 중복 방지**: Strict Mode에서 ref로 중복 초기화 방지

## LOW

- **js/정규식 호이스팅**: 반복 호출 함수 안의 정규식 밖으로 추출
- **advanced/useLatest 패턴**: 최신 값 참조하되 의존성 배열 제외
