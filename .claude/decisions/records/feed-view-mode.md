# 피드 뷰 모드(grid/list) 유지 정책

## 배경

- 상태: accepted
- 기록일: 2026-09-23

피드 목록은 grid/list 두 가지 보기 방식을 토글로 제공한다. 기존에는 `ef5dd78`(피드 페이지 스켈레톤 및 뷰 모드 세션 유지) 커밋에서 `sessionStorage`에 전역 키(`tikitak:feed-view-mode`)로 선택값을 저장해, 다른 탭에 갔다가 돌아오거나 팀을 전환해도 마지막으로 고른 뷰 모드가 그대로 유지되도록 구현되어 있었다.

이 동작이 QA 중 다시 논의됐다. 팀별 스코프 없이 전역 키 하나만 쓰다 보니 "리스트로 바꾼 뒤 팀을 바꿔도 리스트가 유지"되는 부작용이 있었고, 팀을 바꾸는 것은 사실상 다른 피드 목록을 보는 것이므로 이전 팀에서 고른 뷰 모드를 새 팀에 그대로 끌고 오는 게 어색하다는 판단.

## 결정

- 상태: accepted
- 기록일: 2026-09-23

- 피드 뷰 모드는 더 이상 영속화하지 않는다. `FeedPage`는 항상 `viewMode = 'grid'`로 시작한다.
- `teamId`가 바뀌면(팀 전환) 현재 페이지가 언마운트되지 않아도 `viewMode`를 강제로 `grid`로 리셋한다.
- 구현은 `useEffect` 안에서 `setState`를 호출하지 않고, 렌더링 중 이전 `teamId`를 저장해둔 state와 비교해 다르면 즉시 `setViewMode('grid')`를 호출하는 React 공식 "prop 변경 시 state 리셋" 패턴을 사용한다(`react-hooks/set-state-in-effect` 린트 규칙 위반 회피).
- `viewModeStorage.ts`, `viewModeStorage.test.ts`는 삭제한다.

## 대안/기각 사유

- 상태: rejected
- 기록일: 2026-09-23

- **팀별로 키를 스코프해서 유지**(`tikitak:feed-view-mode:{teamId}`): 팀 전환 시에는 이전 값이 안 섞이지만, 탭 이동 후 복귀 시에도 뷰 모드가 유지되는 게 맞는지 자체가 불확실해서 채택하지 않음. "처음 진입은 항상 grid"라는 요구가 더 명확했다.
- **`useEffect`로 teamId 변경 감지 후 setState**: 동작은 같지만 `react-hooks/set-state-in-effect` lint 에러 발생 및 불필요한 cascading render 유발. React 문서가 권장하는 렌더 중 비교 패턴으로 대체.

## 검증/남은 리스크

- 상태: accepted
- 기록일: 2026-09-23

- `yarn type-check`, `yarn lint`, `yarn test --run src/pages/feed` 통과.
- 남은 리스크: 페이지 내에서 grid/list를 수동으로 바꾸는 동작 자체는 그대로 유지되므로, 같은 팀 안에서 스크롤 중 토글하는 시나리오는 기존과 동일하게 동작한다. 팀 전환이 아닌 다른 경로(예: 새로고침)로 teamId가 동일하게 유지되는 경우까지 포함해 실제 QA에서 grid 기본 노출을 한 번 더 확인하는 것을 권장.
