# ssgoi 트랜지션 설정

## 책임 분리 — TransitionProvider

- 상태: accepted
- 기록일: 2026-05-29

ssgoi 설정을 `app/providers/TransitionProvider.tsx`로 추출. `RootLayout`은 모바일 캔버스 프레임 + transition boundary attribute만 책임.

```
app/providers/
└── TransitionProvider.tsx   ← Ssgoi config (paths 기반 preset 배열)

app/layout/
└── RootLayout.tsx           ← <div data-ssgoi-transition={id}> + Outlet + BottomNav
```

### v6 정착 (2026-05-29, PR #85)

- **`SsgoiTransition` wrapper 제거** — v6에서 deprecated. 대신 `<div data-ssgoi-transition={getRouteKey(pathname)} key={pathname}>` 직접 부여로 권장 방식 적용
- `key={pathname}`은 그대로 — mount/unmount 시점 명확화 위해 유지. ssgoi가 attribute 변경뿐 아니라 element re-mount도 신호로 감지하므로 안정성 ↑
- 페이지 전환 영역 배경을 `bg-white`로 명시 — transition 중 빈 frame이 비치지 않도록

## ssgoi v6 마이그레이션 (2026-05-28)

- 상태: accepted
- 기록일: 2026-05-28

v5.2.0 → v6.4.0 업그레이드. v5의 from/to 페어 + `defaultTransition` 방식은 사라지고 v6는 paths 기반 symmetric API로 통일.

### API 변환

| v5                                                     | v6                                                                         |
| ------------------------------------------------------ | -------------------------------------------------------------------------- |
| `fade({ physics })` returns single                     | `fade({ paths })` returns `SsgoiPathTransition[]`                          |
| `slide({ direction: 'left' })`                         | `slide({ paths })` — symmetric 자동                                        |
| `sheet({ direction: 'enter' })`                        | `sheet({ enter, exit })` — directional                                     |
| `hero({ physics })` + 2개 from/to entry                | `hero({ paths, type, variant })` — symmetric 자동                          |
| `defaultTransition: fadeTransition`                    | `fade({ paths: ['*'] })` 마지막 등록                                       |
| `pushPair(a, b)` / `sheetPair(a, b)` 헬퍼              | preset 함수가 자체적으로 양방향 처리, 헬퍼 불필요                          |
| `import type { SsgoiConfig } from '@ssgoi/core/types'` | `import { type SsgoiConfig } from '@ssgoi/react'` (react 패키지 re-export) |

### Preset 배열 spread 패턴

v6의 `transitions` 필드 타입이 `readonly SsgoiPathTransitionInput[]`이고 `SsgoiPathTransitionInput`이 **nested array를 허용**한다. 따라서 preset 결과를 spread할 필요 없이 그대로 배열 안에 둘 수 있다:

```ts
transitions: [
  sheet({ enter: PATHS.FEED_CREATE, exit: PATHS.HOME }),  // SsgoiPathTransition[] — spread 없이
  slide({ paths: [PATHS.LOGIN, PATHS.TERMS] }),
  hero({ paths: [PATHS.HOME, '/place/*'], type: 'static', variant: 'default' }),
  fade({ paths: ['*'] }),
],
```

spread(`...preset()`)는 동일하게 동작하지만 nested 형태가 코드 더 짧고 의도가 명확.

### Hero attribute

- v5: `data-hero-key` 단일 (legacy)
- v6 권장: `data-hero-exit-key`(출발) + `data-hero-enter-key`(도착)
- 양방향 매칭은 paths 등록으로 자동, attribute는 legacy `data-hero-key`로도 동일 동작

**현재 코드는 v6 권장 attribute(`data-hero-exit-key` / `data-hero-enter-key`)를 사용한다.** 과거 paired key cleanup 이슈 때문에 legacy로 회귀한 적이 있었지만, 이후 상세 이미지 visibility와 placeholder 흐름을 안정화하면서 paired key로 재정착했다.

## 트랜지션 매핑

- 상태: accepted
- 기록일: 2026-09-23

| 흐름                                            | 트랜지션           |
| ----------------------------------------------- | ------------------ |
| Splash → Login                                  | fade fallback      |
| Login → Terms → Onboarding → Home               | slide (symmetric)  |
| OAuth Callback → 분기                           | slide              |
| Home/Feed/MyPage ↔ FeedCreate / DailyFeedCreate | sheet (enter/exit) |
| Home/MyPage ↔ TeamCreate                        | sheet              |
| TeamCreate → TeamProfileSetup                   | slide              |
| Home/MyPage ↔ /teams/\*                         | slide              |
| /teams/\* ↔ TeamInvite / TeamProfileSetup       | slide              |
| Home ↔ /place/\*                                | **hero (static)**  |
| Feed ↔ /feed/\*                                 | **hero (static)**  |
| 그 외 미등록                                    | fade fallback      |

## Hero placeholder 처리

- 상태: accepted
- 기록일: 2026-09-23

### 피드 흐름 (PR #83 도입)

데이터 로딩 중 hero target이 carousel `images.length === 0`로 사라지면 ssgoi가 매칭 실패하는 문제 → 목록의 썸네일 URL을 router state로 전달해 placeholder 1장을 즉시 렌더링:

- `FeedPage` Link `state={{ thumbnailUrl }}`, `MapView.handlePinClick`에서 `pin.thumbnailUrl` 전달
- `FeedDetailContent`가 `useLocation().state` 또는 `placeholderThumbnail` prop으로 받아 fallback image 1장 즉시 표시
- 실제 데이터 도착 시 진짜 images로 교체

`PlaceDetailPage`는 첫 번째 `PlaceDetailFeedItem`에만 `heroKey={pin-${placeId}}`를 override해 ID 공간 불일치 해소.

### 홈 흐름 (PR #85 도입, 코덱스 우회)

카카오 SDK가 비동기 로드라 `Map.tsx`의 핀이 mount 직후 DOM에 없는 race를 sessionStorage placeholder로 우회:

- `src/pages/home/lib/heroPinStorage.ts` — sessionStorage `tikitak:last-hero-pin`에 `{ placeId, thumbnailUrl, lat/lng, level, x, y }` 저장/복원
- `Map.tsx`가 mount 시 `useState(readStoredHeroPin)`으로 동기 읽음 → SDK 로드 전에도 stored hero pin을 absolute로 placeholder 렌더 → **hero target 첫 frame DOM 존재**
- 좌표가 stale이면 `calc(50% - PIN_SIZE/2)`로 화면 중앙 fallback
- `useKakaoMap`이 stored pin lat/lng를 mapInstance 초기 center로 사용
- 핀 클릭 시 `storeHeroPin(pin, position, viewport)` 호출 + `queryClient.prefetchQuery(feedKeys.listFiltered)`로 도착 페이지 데이터 미리 캐싱

이 패턴은 ssgoi/framer 등 shared-element 라이브러리 일반에 통용. 자세한 분석은 `troubleshooting/troubleshooting.md` 7번 섹션.

## 2026-06 조정

- 상태: accepted
- 기록일: 2026-06

- **hero `variant: 'smooth'`**: feed·home/place 두 hero 모두 `variant: 'default'→'smooth'`(ssgoi: doubleSpring, 부드러운 도착·hard stop 없음). `type`(static/fade)과 직교 — physics만 교체. (과거 "static smooth" 제거 이력과 별개로 재도입.)
- **blur-up 부드럽게** ([FeedImageDetail.tsx](src/shared/ui/FeedDetail/FeedImageDetail.tsx)): heroPreviewUrl(32px 저용량) placeholder에 blur를 적용하고 메인 이미지 로드 후 opacity 크로스페이드. scale은 불필요(사용자 판단)로 제외. ※ 이건 페이지 hero 트랜지션이 아니라 **상세 이미지 내부 LQIP 크로스페이드**.

## 2026-07 조정

- 상태: accepted
- 기록일: 2026-07

- **피드 상세 fallback 안정화**: `FeedDetailContent`는 route state의 `thumbnailUrl`뿐 아니라 `heroPreviewUrl`도 함께 받아 상세 API 도착 전 fallback image 1장을 즉시 렌더한다. fallback의 `src`는 표시 가능한 thumbnail을 쓰되, `heroPreviewUrl`은 상세와 같은 비율의 LQIP로 전달해 첫 프레임부터 blur-up 기준을 맞춘다.
- **remount 방지**: `FeedImageCarousel`는 이미지 `src`가 fallback thumbnail → 상세 `feed_detail`로 바뀌어도 같은 인스턴스가 유지되도록 index 기반의 안정 key를 사용한다. `key={image.src}`는 상세 API 도착 시 `FeedImageDetail`을 remount해 `loaded` 상태를 리셋하고 "선명한 썸네일 → 흐린 프리뷰 → 선명한 상세"로 후퇴하는 체감을 만들 수 있어 기각.
- **1:1 이미지 letterbox 일관성**: `FeedImageDetail`은 preview 이미지도 `naturalWidth/naturalHeight`를 측정한다. 실제 이미지가 로드되기 전에도 preview와 detail이 같은 `object-contain`/`object-cover` 판정을 공유해야 정사각 이미지에서 "여백 없는 프리셋 → 검은 여백 있는 실제 사진"으로 바뀌지 않는다.
- **blur-up 속도**: 상세 내부 LQIP crossfade는 `duration-[160ms]`로 둔다. 기존 긴 fade는 이미지가 늦게 선명해지는 느낌을 만들었고, 페이지 hero 물리값과 별개라 짧게 끝내는 편이 자연스럽다.
- **무한스크롤 피드 hero warming**: `FeedGrid`는 pointer/focus/mouseenter에서 thumbnail과 `heroPreviewUrl`을 미리 decode하고, 일반 click에서는 최대 180ms만 기다린 뒤 route state를 포함해 이동한다. modifier click/새 탭은 기본 Link 동작을 유지한다.
- **피드 상세 데이터 prefetch (2026-07)**: "뱃지가 사라지고 한참 있다가 hero 전환이 시작된다"는 어색함의 실제 원인은 뱃지 fade 타이밍(100ms 단위)이 아니라, `navigate()` 이후 `feedDetailLoader`가 상세 API를 그제서야 호출해서 생기는 네트워크 왕복 시간이었다. `feedDetailQueryOptions`는 목록 쿼리와 key가 완전히 분리돼 있어 목록을 아무리 미리 봐도 상세 데이터는 캐시되지 않는다.
  - `warmFeedDetail(queryClient, teamId, feedId)` 유틸을 추가해 `queryClient.prefetchQuery(feedDetailQueryOptions(...))`를 실제 진입 전에 미리 태운다. 로더의 `ensureQueryData`가 같은 query key로 조회하므로, 캐시가 fresh(30초 이내)하면 네트워크 재호출 없이 즉시 resolve된다.
  - **트리거는 `onPointerDown`에만 한정** — image preload(`preloadFeedHeroAssets`)는 기존대로 pointer/focus/mouseenter 세 곳 모두 유지하되, 상세 데이터 prefetch는 pointerdown에서만 쏜다. 그리드를 스크롤하며 손가락이 여러 아이템을 스치는 동안 매번 API 콜이 나가는 걸 막기 위함. 데스크톱 마우스 클릭도 `pointerdown → click` 순서로 발생하므로 동일하게 커버된다.
- **decor fade 대기 제거 (2026-07)**: prefetch를 넣은 뒤에도 "뱃지가 사라지고 잠깐 있다가 hero가 시작"되는 공백이 남아있었다. 원인은 `runFeedHeroTransition`이 `waitForQuestionDecorFade`(100ms)로 뱃지·보더 CSS fade가 끝나길 **기다린 다음에야** `navigate()`로 이어졌다는 것 — 이 대기 자체가 코드가 만든 인위적 지연이었다. ssgoi는 전환 중 이전 페이지 DOM을 유지하므로, fade를 명시적으로 안 기다리고 캡처 직후 바로 `navigate()`로 넘어가도 CSS transition은 화면에 그려질 시간이 있다. `waitForQuestionDecorFade`를 완전히 제거하고 `runFeedHeroTransition`을 `preload → capture`로 단순화했다.
- **활동 → 게시물 = slide**: 활동 페이지의 "반응이 많은 게시물"은 hero source가 없으므로 hero에 태우지 않는다. 다만 fade-through는 느리게 느껴져 `slide({ paths: [PATHS.ACTIVITY, '/feed/*'] })`로 조정했다. 피드 리스트 → 상세 hero는 그대로 유지한다.
- **히어로 왕복 핸드오프 공용화 (2026-07)**: 활동 페이지의 "모두의 PICK"/지역별 카드 → `EveryonePickFeedPage`/`RegionFeedPage`도 hero 전환이 붙었는데(`hero({ paths: [PATHS.ACTIVITY, '/activity/*'] })`), 복귀(POP) 시 착지 위치가 안정되기 전에 ssgoi가 측정해 "히어로가 위로 튀었다가 제자리를 찾아가는" 증상이 있었다. 같은 클래스의 문제를 `FeedPage`(`useFeedHeroHandoff`)와 `NotificationPage`(`useNotificationHeroHandoff`)가 각각 독립적으로 복사-붙여넣기한 코드로 해결하고 있었던 것을 확인하고, 세 번째 복사본을 만드는 대신 `shared/hooks/useHeroHandoff.ts` + `shared/lib/hero/heroStorage.ts` + `shared/ui/StoredHero`로 일반화했다.
  - `FeedPage`는 이 공용 훅으로 완전히 마이그레이션(기존 `feed/hooks/useFeedHeroHandoff.ts`, `feed/lib/feedHeroStorage.ts`, `feed/ui/StoredFeedHero.tsx` 삭제). `ActivityPage`는 신규로 이 공용 훅을 사용해 `MonthlyMemories`/`ContentImageCard`에 캡처(`onPointerDown`)·suppress·사본 렌더링을 추가.
  - `NotificationPage`의 `useNotificationHeroHandoff`는 이번 스코프에서는 건드리지 않음(위험 대비 범위 확대 방지) — 나중에 같이 정리할 후보로 남겨둠.
  - 공용 훅은 `itemId`/`heroKey`를 도메인이 아닌 문자열로만 다뤄서, feed(`pin-${feedId}`)·activity(`pin-${feedId}`, radius 8)처럼 exit-key 포맷이나 모서리 반경이 달라도 그대로 재사용 가능.

## 거부된 대안

- 상태: rejected
- 기록일: 2026-09-23

- **양방향 hero attribute 동시 부여** — v6에서 cleanup 이슈로 도착 image 보이지 않음. legacy 단일 사용
- **defaultTransition** — v6에 옵션 자체 없음. `fade({ paths: ['*'] })` 마지막 등록으로 대체
- ~~**SsgoiTransition 제거** — v6에서 deprecated지만 `key={location.pathname}` 기반 mount/unmount가 transition 트리거 신뢰성이 가장 높아 유지~~
  **(2026-05-29, PR #85에서 번복 — 결국 제거함.** "책임 분리 — TransitionProvider"의 "v6 정착" 참조. `key={pathname}`은 `data-ssgoi-transition` attribute와 함께 유지.)

## 미해결 follow-up (별도 PR)

- 상태: proposed
- 기록일: 2026-09-23

**홈 → 장소 상세 backward가 instant.** 카카오 지도가 비동기 mount이라 hero target(absolute 핀)이 transition 시작 시점에 정확한 좌표로 DOM에 없음. v6 hero에는 `timeout` 옵션 없어 라이브러리 차원에서 대기 불가.

### 진행 계획

1. **현재 PR**: 위 상태 그대로 머지. 들어갈 때 hero 동작 / 뒤로갈 때 instant 상태 수용.
2. **머지 후 동작 재확인**: 실 환경(Vercel preview + 모바일 디바이스)에서 backward 동작 한 번 더 검증. 카카오 SDK 캐싱이 더 잘 되면 해결될 가능성도 있음.
3. **여전히 안 되면 별도 PR 후보**:
   - **framer-motion `layoutId`로 hero만 재구현** — ssgoi는 페이지 전환만 담당. 카카오 지도 비동기 mount와 무관하게 layout animation. 추천.
   - **홈만 backward를 slide back으로 fallback** — 비대칭이지만 instant 어색함 즉시 제거. iOS Pinterest 류 패턴.
   - **홈을 zoom transition으로** — 핀↔페이지 전체 zoom. hero target 매칭 불필요.

## Index meta

- 상태: accepted
- 기록일: 2026-09-23

- `index.html` viewport: `width=device-width, initial-scale=1.0, interactive-widget=resizes-content` (`maximum-scale=1.0` 제거 — 접근성 회귀 방지)
- iOS Safari input focus 시 auto-zoom은 디자인 폰트 사이즈 유지 위해 별도 처리 안 함 (blur 시 자동 복원되는 표준 동작)
