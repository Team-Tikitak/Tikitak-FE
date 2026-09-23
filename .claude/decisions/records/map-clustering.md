# 홈 지도 핀 클러스터링

## 결정

- 상태: accepted
- 기록일: 2026-09-23

홈 지도(카카오맵) 핀 클러스터링을 **supercluster**로 구현. 카카오 `MarkerClusterer`는 채택 안 함.

## 왜 카카오 MarkerClusterer가 아닌가

- 상태: rejected
- 기록일: 2026-09-23

현재 핀은 `kakao.maps.Marker`가 **아니다**. `useKakaoMap`이 핀 좌표를 화면 픽셀로 투영(`containerPointFromCoords`)하고, 그 위에 **React 오버레이(`MapImage` 사진 카드)** 로 렌더한다. `data-hero-exit-key` 기반 hero 전환도 이 오버레이에 붙어 있다.

- 카카오 `MarkerClusterer`는 `kakao.maps.Marker`만 묶는다 → 쓰려면 사진 카드 핀을 기본 마커로 갈아엎어야 하고 hero 전환 UX가 깨진다.
- **supercluster는 렌더러 비종속**: 좌표·bbox·zoom만 받아 "클러스터 / 개별점"을 돌려준다. 기존 React 오버레이 렌더링과 hero 전환을 그대로 유지하면서 데이터만 클러스터링된다.
- 데이터 규모가 커져도(수만 핀) 안정적이라 확장성도 안전.

## 구조

- 상태: accepted
- 기록일: 2026-09-23

```
src/pages/home/
├── lib/clusterIndex.ts        ← supercluster 인덱스 + 카카오 level↔zoom 변환
├── hooks/useKakaoMap.ts       ← renderItems(클러스터/핀) 반환 + expandCluster
├── hooks/kakao.d.ts           ← getBounds/KakaoLatLngBounds/setLevel(anchor·animate)/panTo 타입
└── ui/Map.tsx                 ← renderItems 분기 렌더
```

- **clusterIndex.ts**: `createPinClusterIndex(pins)`가 supercluster 인덱스 생성. `map`/`reduce` 옵션으로 클러스터마다 **대표 썸네일**(군집 내 `feedCount` 최대 핀)을 빌드 단계에 집계 → idle마다 leaf 순회 불필요.
- **useKakaoMap.ts**: 반환을 `pinPositions` → `renderItems`(discriminated union `{type:'pin'}` | `{type:'cluster'}`)로 변경. idle/drag/zoom마다 `map.getBounds()` + `index.getClusters(bbox, zoom)`로 재계산·투영. 클러스터 클릭용 `expandCluster(clusterId, lng, lat)` = `getClusterExpansionZoom` → `setLevel(level, { anchor: target, animate: { duration: 300 } })` **단일 애니메이션 확대**. (이전 `setLevel({anchor}) + panTo()` 2단 모션은 "툭 확대 후 이동"으로 어색해 제거 — 트러블슈팅 13번)
- **Map.tsx**: 클러스터는 대표 썸네일 + `+N` 배지(`MapImage` 재사용)·클릭 시 확대, 개별 핀은 기존 hero 전환 유지.

## 줌 변환 (주의)

- 상태: accepted
- 기록일: 2026-09-23

카카오 `level`은 **역방향**(1=최대 확대, 14=최대 축소), supercluster zoom은 정방향(클수록 확대). `clusterIndex.ts`에서 단조 변환:

```ts
kakaoLevelToZoom(level) = clamp(round(20 - level))   // SUPERCLUSTER_MAX_ZOOM=20
zoomToKakaoLevel(zoom)  = clamp(round(20 - zoom), 1..14)
```

## 튜닝 포인트

- 상태: accepted
- 기록일: 2026-09-23

`clusterIndex.ts`의 튜닝 상수 (실기기에서 보며 조정):

- `CLUSTER_RADIUS_PX`(현재 **50**, 핀 크기 87px 기준) — 군집이 너무 잘 묶이거나/안 묶이면 여기부터 조정
- `CLUSTER_MAX_ZOOM`(`clusterIndex.ts`, 현재 **18**) — 이 zoom 초과(카카오 level 1)부터 개별 핀. 낮추면 더 빨리 개별 핀으로 풀림.
- `PIN_ENTER_MAX_LEVEL`(`ui/Map.tsx`, 현재 **6**) — **진입 게이트**. 지도가 이 level보다 멀면(축소) 개별 핀 탭 시 진입 대신 `focusPin(lng, lat, PIN_ENTER_MAX_LEVEL)`로 그 level까지 확대 → **한 번 더 탭해야 진입**. (한반도급 축소에서 외딴 핀이 바로 진입되던 문제. 단일 lone 핀은 멀리서도 개별 표시돼 클러스터링으로 못 막으므로 level 게이트로 처리. 너무 빡빡하면(예전 3) 평소 줌에서 진입이 막혀 깨짐 → 6으로 넉넉히.)
- `DEFAULT_MAP_LEVEL`(`useKakaoMap.ts`, 현재 **2**) — 복원 컨텍스트 없는 신규 진입 기본 줌. 더 확대=낮게.
- level↔zoom 매핑 상수

> 변천: radius 80 / maxZoom 19(4번 확대) → radius 50 / maxZoom 17 → maxZoom 18 + 진입 게이트(PIN_ENTER_MAX_LEVEL=6) + 기본 줌 2.

## hero 복귀 상호작용

- 상태: accepted
- 기록일: 2026-09-23

복귀는 기존 `StoredHeroPin` 오버레이가 처리(→ `decisions/records/transitions.md`, 트러블슈팅 7번 placeholder 패턴). 복귀 핀이 클러스터에 묶여 `renderItems`에 개별 `'pin'`이 없으면 `StoredHeroPin`이 stored 위치에 표시되어 hero-enter target을 보장한다.

## 의존성

- 상태: accepted
- 기록일: 2026-09-23

`supercluster` + `@types/supercluster` 추가.
