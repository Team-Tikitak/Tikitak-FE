# Domain: Place / Home Map

홈 지도, 장소 검색/상세, 주변 장소와 관련된 도메인.

## Routes

| 경로      | 페이지                   |
| --------- | ------------------------ |
| `/home`   | `src/pages/home/`        |
| 장소 상세 | `src/pages/placeDetail/` |

지도와 장소 상세 경로는 `src/app/routes/paths.ts`를 먼저 확인한다.

## 주요 위치

```text
src/pages/home/
├── hooks/    # useKakaoMap, useMapView, useUserLocation
├── lib/      # clusterIndex, heroPinStorage
└── ui/       # HomePage, Map, MapView, StoredHeroPin

src/pages/placeDetail/
├── hooks/    # usePlaceFeeds
├── model/    # place detail page-local 타입
└── ui/       # PlaceDetailPage, PlaceDetailFeedItem

src/shared/api/home/
src/shared/api/map/
src/shared/api/place/
```

## 작업 기준

- 지도 SDK 의존성은 page hook에 가두고 shared UI로 직접 누수하지 않는다.
- 사용자 위치 권한 거부, 위치 없음, 지도 SDK 로드 실패 상태를 분리한다.
- marker/cluster 계산은 `pages/home/lib`처럼 순수 로직으로 분리하고 테스트 가능하게 둔다.
- place detail은 place API와 feed list API의 책임을 섞지 않는다.
- home hero pin 같은 local persistence는 `heroPinStorage.ts` 패턴을 따른다.

## 검증

- storage/cluster 순수 로직: 관련 unit test
- 지도/장소 플로우: Playwright home-map 또는 home-empty spec
- 위치 권한 변경: browser permission fallback 확인
