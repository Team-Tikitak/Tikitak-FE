# 트러블슈팅 기록 — 2026-05 리팩토링 + Hero Transition PR

PR #83 진행 중 발생한 주요 문제와 해결 과정. 포트폴리오·회고 작성 시 참고용.

---

## 1. 프로필·피드 이미지 깨짐 (전 화면)

### 증상

- 피드 상세, 글쓰기 인원 추가 칩, 지도 핀 썸네일 등에서 아바타/이미지가 깨진 placeholder로 표시
- 서버 응답에 따라 일부 화면만 정상, 일부는 깨짐 → 불규칙성

### 원인 분석

- 코드베이스에 이미지 URL 변환 함수가 **두 개 공존**:
  - `toAbsoluteUrl(url)` — `http`로 시작 안 하면 `https://${url}` 단순 prefix
  - `normalizeImageUrl(url, folder)` — UUID 감지 → CDN 경로(`https://dev-media.kusitms.xyz/media/{folder}/${uuid}.png`)로 변환
- 서버가 `profileImageUrl`/`thumbnailImageUrl`에 **UUID만 반환**하는 경우, `toAbsoluteUrl(uuid)`는 `https://uuid`라는 잘못된 URL 생성 → 이미지 안 뜸
- `useFeedData`, `usePinComments`, `adaptFeedListItem`, `Map.tsx`, `pinUtils.ts` 5곳이 `toAbsoluteUrl` 사용 → 모두 영향

### 해결

- 5개 파일 모두 `toAbsoluteUrl` → `normalizeImageUrl(_, '<folder>')`로 일괄 교체
- 사용처 없어진 `toAbsoluteUrl.ts` 자체 삭제
- 추가로 `FeedCreatePage`/`FeedEditPage`의 `UserChip avatarSrc={member.profileImgUrl || undefined}`도 `normalizeImageUrl` 누락 → 동일 패치

### 배움

- 같은 책임의 유틸이 두 개 공존하면 신규 합류자가 어느 걸 써야 할지 모르고, 일관성이 깨짐
- 상위 호환 함수가 있으면 하위 함수는 적극 제거하는 게 좋음. backward-compat 위해 둘 다 두는 것도 안티패턴

---

## 2. Hero Transition 양방향 동작 (가장 큰 트러블)

### 증상

- 처음: 피드 목록 → 피드 상세 진입 시 transition이 instant
- 이후 일부 동작 시: 들어갈 때는 hero 확대 OK, **뒤로갈 때 instant**
- 홈 핀 → 장소 상세도 동일 증상

### 1차: ssgoi matching이 안 됨

- `from: PATHS.FEED, to: PATHS.FEED_DETAIL` 등록인데 `PATHS.FEED_DETAIL = '/feed/:feedId'`
- ssgoi 매칭 함수 소스 직접 확인 (`node_modules/@ssgoi/core/dist/index.js`):
  ```js
  function F(e, n) {
    if (n === '*') return true;
    if (n.endsWith('/*')) {
      const t = n.slice(0, -1);
      return e.startsWith(t) && e.length > t.length;
    }
    return e === n;
  }
  ```
- **`:param` 패턴 미지원**, `*`/`/*` 와일드카드만. React Router의 PATHS 그대로 넣어서 매칭 실패 → defaultTransition fade로 떨어져 사실상 instant처럼 보임
- 수정: `to: '/feed/*'` wildcard로 등록

### 2차: 들어갈 때만 동작

- 들어갈 때 hero 동작, 뒤로갈 때 instant
- `FeedImageCarousel`이 `images.length === 0`이면 `return null` → 데이터 로딩 중 hero target이 DOM에 없어 ssgoi가 매칭 실패
- 해결: 목록 클릭 시 router state로 썸네일 URL 전달, 상세에서 데이터 로딩 전까지 placeholder image 1장으로 carousel을 즉시 채움
- 결과: 피드 ↔ 피드 상세 양방향 동작 OK

### 3차: 홈만 여전히 backward instant

- 피드는 정적 flow의 `<img>`라 mount 즉시 hero target 존재
- 홈은 카카오 지도 SDK가 비동기 로드되고 핀이 mapInstance 초기화 후 그려지는 구조
- ssgoi v5의 `timeout` 옵션을 200ms로 늘려도 효과 미미

### 4차: 공식 문서 확인 + ssgoi v6 마이그레이션

- `ssgoi.dev` 문서 fetch 결과:
  - 새 API는 `hero({ paths, type, variant })` symmetric 자동 양방향
  - attribute는 `data-hero-exit-key` + `data-hero-enter-key` paired 권장
  - "Missing elements — destination element must exist when navigation completes"가 backward 실패 흔한 원인
- 우리 v5.2.0 → v6.4.0 메이저 업그레이드 진행

### 5차: 새 attribute 부여 시 도착 image visibility 안 풀림

- `data-hero-exit-key` + `data-hero-enter-key` 동시 부여 → 들어갈 때 hero 확대는 동작하지만 도착 후 detail 이미지 자체가 안 보이는 cleanup 이슈 발견
- legacy `data-hero-key` 단일 attribute로 회귀 (v6도 backward-compat 인식)

### 6차: 홈은 여전히 instant

- hero `type` `static` ↔ `fade`, `variant: 'smooth'` 모두 시도 → 동일
- 카카오 지도 + absolute 핀 element는 ssgoi가 안정적으로 잡지 못하는 한계
- v6에는 `timeout` 옵션 자체가 없음

### 최종 결론

- 피드는 양방향 hero OK
- 홈은 들어갈 때만 hero, 뒤로갈 때 instant — 라이브러리 한계로 수용
- Follow-up: framer-motion `layoutId`로 hero만 재구현 검토 (별도 PR)

### 배움

- 라이브러리가 직접적인 옵션을 제공 안 할 땐 **소스 코드/문서를 직접 읽는 것**이 가장 빠른 디버그
- ssgoi의 `:param` vs `*` 패턴 매칭 차이는 d.ts에 안 나옴 — 런타임 코드 확인 필수
- async mount 환경(지도 SDK 등)에서 hero/shared element transition은 라이브러리 보장이 어려움. **선택 기준에 mount 동기성도 포함해야**

---

## 3. ssgoi v5 → v6 메이저 마이그레이션

### 변화

| 항목                                    | v5                   | v6                                                                       |
| --------------------------------------- | -------------------- | ------------------------------------------------------------------------ |
| `defaultTransition`                     | config 옵션으로 명시 | 옵션 자체 없음. `...fade({ paths: ['*'] })` 마지막 등록                  |
| `fade({ physics })`                     | 단일 transition 반환 | `fade({ paths })` → `SsgoiPathTransition[]`                              |
| `slide({ direction })`                  | 단일 + direction     | `slide({ paths })` symmetric 자동                                        |
| `sheet({ direction: 'enter' })`         | direction flag       | `sheet({ enter, exit })` directional                                     |
| `hero({ physics })` + from/to 페어 등록 | manual 양방향        | `hero({ paths, type, variant })` symmetric 자동                          |
| hero attribute                          | `data-hero-key`      | `data-hero-exit-key` + `data-hero-enter-key` (legacy도 지원)             |
| `SsgoiTransition`                       | 권장                 | deprecated, `data-ssgoi-transition` attribute 직접 부여 권장 (BC는 유지) |

### 마이그레이션 작업

- TransitionProvider 완전 재작성 (paths spread + nested arrays)
- 기존 `sheetPair`/`pushPair` 헬퍼 제거 (preset이 자체 양방향 처리)
- hero attribute는 legacy `data-hero-key`로 유지 (새 paired key는 cleanup 이슈로 회귀)
- `SsgoiTransition`은 BC 유지 (`key={location.pathname}`이 mount 트리거에 가장 안정적)

### 배움

- 메이저 업그레이드는 호환성 깨질 위험 큼 — 모든 transition을 한 번씩 화면 확인 필수
- Type 정의(d.ts)와 실제 동작이 불일치하는 경우 있음. 런타임 동작 우선

---

## 4. 보안 강화 + 리뷰 피드백 충돌

### OAuth 콜백 토큰 URL 노출

- 백엔드가 `/auth/callback?accessToken=...`로 리다이렉트 → 브라우저 history/Referer/Vercel access log/외부 폰트 요청 Referer로 토큰 누설 위험
- 1차: loader에서 `setAccessToken()` 후 `window.history.replaceState(null, '', PATHS.HOME)`로 URL 쿼리 즉시 제거 + redirect

### 리뷰 봇 지적: history 직접 조작 회피 권장

- "React Router의 redirect만 사용하고 history 직접 조작은 피하라"
- 평가: `redirect()`는 새 history entry push라 뒤로가기 시 토큰 URL 재노출 위험. fragment 전환은 백엔드 협의 필요
- **결정: 반영 안 함**. 의도 명시 주석만 추가
- 원칙: 보안 우선 의도가 명확하면 일반론적 권장보다 의도 보존

### ProtectedRoute isError 가드 — 과보호 발견

- 1차: `if (isError || !accessToken) return <Navigate to={LOGIN}>`로 강화
- 리뷰 지적: refresh 일시 실패 시 accessToken 살아 있어도 로그인 강제 → OAuth callback 직후 진입 막힘
- **결정: 반영**. `if (!accessToken)` 단독으로 원복
- 배움: "더 안전해 보이는 가드"가 정상 흐름을 막을 수 있음. 가드 추가 시 token 보유 케이스를 명확히 분리

### 기타 보안 개선

- `window.open(_, '_blank', 'noopener,noreferrer')` 3곳
- 프로필 업로드 MIME 화이트리스트(`image/jpeg|png|webp`) + 5MB 제한 + SVG 거부
- `vercel.json`에 `Referrer-Policy` / `X-Content-Type-Options` / `X-Frame-Options` / `HSTS`
- 카카오 SDK URL 프로토콜 상대(`//dapi...`) → `https://` 고정
- `.env.example`에 `VITE_KAKAO_MAP_APP_KEY=` 추가

---

## 5. 대규모 리팩토링 안전 진행 전략

### 컨텍스트

- 50+ 파일 변경. 한 번에 다 하면 회귀 발생 시 bisect 어려움

### 5단계 분할

1. **청소**: `.gitkeep`, 미사용 mock, 중복 LongPressHint, 매직넘버 → 상수
2. **코드 품질**: `shared/ui` 5종 `className`/`ref` 노출, `kakao.d.ts` 타입화
3. **유틸 추출**: `useActiveTeamId`, 로딩/에러 UI, `CapturedPhoto` shared 승격
4. **보안**: OAuth, `noopener`, 파일 검증, vercel 헤더
5. **구조**: Overlay shared 승격, mock barrel export 정리, useSelfTag 정리

### 회귀 위험 큰 작업은 **명시적으로 별도 PR**로 분리

- Feed 4페이지 통합 (FeedFormShell)
- CameraOverlay shared 승격 (camera 도메인 전체 이동 필요)
- useCamera 223줄 3분할
- 글로벌 토스트 도입 (디자인 시스템 변경 필요)
- 디자인 토큰화 (디자이너 협의 필요)
- OAuth fragment 전환 (백엔드 협의 필요)

### 매 단계 검증

- `yarn type-check && yarn lint && yarn build && yarn test`
- 단계 통과 후에만 다음 단계 진입
- lint 자동 수정은 후속 Edit의 string mismatch 유발 → `Read` 다시 후 진행

### 커밋 분할

- 16개 논리 단위 커밋. 한 커밋 = 한 책임
- 리뷰어가 PR을 commit-by-commit으로 따라갈 수 있음

### 배움

- 큰 변경은 단계 분할 + 매 단계 검증이 회귀 비용을 가장 크게 줄임
- 회귀 위험 큰 작업은 PR 분리만으로도 리뷰 부담·롤백 부담 절반
- 별도 PR 보류 결정도 명시 기록(`decisions/`, `tasks/todo.md`)으로 follow-up 누수 방지

---

## 6. 개발 환경 트러블

### Windows + Yarn 출력 캡처 실패

- `yarn type-check`/`yarn lint`/`yarn build`의 출력이 PowerShell/Bash 어느 쪽으로도 직접 캡처 안 되는 경우
- 해결: `> .tmp.log 2>&1; echo "EXIT=$?"`로 파일 redirect + exit code만 표준 출력으로

### gh CLI 인증 없음

- `gh pr create` 실행 시 `gh auth login` 필요. 인증 환경 외에서는 PR 본문을 텍스트로 출력해 사용자가 GitHub UI에 붙여넣는 방식

### Lint --fix가 후속 Edit과 충돌

- `yarn lint --fix`로 import 순서, Tailwind canonical class 등이 자동 수정되며 파일 내용이 변경됨
- 후속 Edit의 `old_string`이 mismatch — `Read`로 다시 읽은 뒤 Edit 진행

---

## 7. Hero backward 해결 — placeholder 미리 깔기 (PR #85, 코덱스 우회)

### 컨텍스트

PR #83에서 "홈 → 장소 backward instant"를 ssgoi v6 한계로 수용하고 별도 PR(#85)로 분리. PR #85에서 여러 시도가 모두 실패한 뒤 코덱스가 다른 각도의 해결책을 제시.

### 우리가 시도하고 실패한 것

| 시도                                                      | 결과                          | 한계                                                                                                            |
| --------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 카카오 SDK preconnect + async head 이동                   | 첫 진입은 여전히 instant      | SDK가 아무리 빨라도 React mount 시점엔 비동기                                                                   |
| `ensureKakaoSdk()` promise singleton + polling            | 핀 mount 빨라졌지만 race 잔존 | ssgoi의 hero matching 시점이 더 앞섬                                                                            |
| `lastViewport` 모듈 스코프 캐시                           | viewport 복원은 OK            | hero target 좌표는 별개 문제                                                                                    |
| ssgoi `hero` type/variant 모든 조합                       | 동일                          | 라이브러리 옵션 없음                                                                                            |
| ssgoi `zoom` (`data-zoom-exit-key`/`data-zoom-enter-key`) | hero와 동일 race              | "enter target 없으면 no-op" 동일 정책                                                                           |
| framer-motion `layoutId` + `motion.figure`                | layoutId 매칭 실패            | ssgoi의 `key={pathname}` SsgoiTransition이 React unmount/remount 즉시 발생 → framer가 layoutId 매칭할 시간 없음 |
| 비대칭 transition (hero forward + slide/fade backward)    | 동작은 하지만 비대칭 어색     | 본질 해결 아님                                                                                                  |

### 코덱스의 우회 — "ssgoi 옵션 대신 우리가 hero target을 미리 만든다"

**핵심 통찰**: 라이브러리에 mount 대기 옵션이 없다는 한계를 받아들이는 대신, **hero target이 mount 직후 즉시 DOM에 있도록 환경을 만들어주면** ssgoi의 시점 race는 무관해진다.

**구현**:

1. `src/pages/home/lib/heroPinStorage.ts` 신설 — sessionStorage `tikitak:last-hero-pin`에 직전 클릭 핀의 `{ placeId, thumbnailUrl, lat/lng, level, x, y }` 저장
2. `Map.tsx`가 mount 시 `useState(readStoredHeroPin)`로 초기값 동기 읽음 → SDK 로드 전에도 placeholder 핀을 absolute로 렌더 → **hero target이 첫 frame에 DOM 존재**
3. 좌표가 stale일 수 있으니 `shouldCenterStoredHeroPin`이면 `calc(50% - PIN_SIZE/2)`로 화면 중앙에 배치 — visual 안전판
4. `useKakaoMap`이 stored pin의 lat/lng를 mapInstance 초기 center로 사용 → 지도가 그 핀 위치로 즉시 열림, 실제 핀 mount 시 placeholder와 자연스럽게 합쳐짐
5. `MapView.handlePinClick`에서 `queryClient.prefetchQuery`로 장소 피드 사전 캐싱 → 도착 페이지 데이터 부재 race도 동시 해소
6. RootLayout의 `SsgoiTransition` wrapper를 `<div data-ssgoi-transition={id}>` 직접 부여로 교체 — v6 권장 방식, deprecated 해소
7. 피드 ↔ 피드 상세는 정적 flow라 이전부터 양방향 hero OK, 변경 없음

### 왜 동작하는지

- 우리는 "race를 줄이려" SDK·prefetch·캐시·layoutId를 시도. 모두 mount 타이밍이 ssgoi보다 빨라야 하는 종속.
- 코덱스는 "**race를 회피**" — hero target을 SDK·React mount 흐름과 완전히 분리해서 sessionStorage → useState 초기값 → 즉시 DOM. 첫 frame에 존재 보장.
- 라이브러리 옵션이 없을 때 **라이브러리 외부에서 환경을 만들어주는** 패턴이 정공법인 케이스가 많음.

### 배움

- "라이브러리 한계라 안 됨" 결론을 내리기 전에 한 단계 더: **라이브러리가 요구하는 조건을 우리가 직접 만들 수 있는가**
- async mount는 React/lib lifecycle 안에서 해결하려 하면 한계가 명확. **mount 흐름 밖의 storage(sessionStorage, module scope, query cache)에서 동기적으로 데이터를 끌어오는 게 종종 더 빠르고 견고**
- shared element 보간(hero/zoom/layoutId)은 모두 "양쪽 element가 같은 시점에 존재"라는 동일 조건 → 그 조건을 만족시키는 것이 라이브러리 선택보다 중요
- 시도 7번 후에 새 해결책을 제안한 코덱스의 접근 방식 자체에서 배울 것: **막혔을 때 같은 축으로 더 깊이 파지 말고 한 단계 위에서 우회 경로 찾기**

---

## 8. 리팩토링 범위 결정 — "의미 vs 비용" 판단 (PR #85 마무리)

### 컨텍스트

Capacitor 웹뷰 감싸기 전 마지막 1차 리팩토링 후보로 3가지를 검토:

1. **PhotoStrip 추출** — Feed 4페이지 통합의 미완 부분
2. **`useActiveTeamId` `number | null` 전환** — 0이 유효 teamId처럼 새는 잠재 버그 해결
3. **`me?.activeTeamId ?? null` 패턴 통합** — 4개 페이지의 직접 useMe + ?? null 호출을 useActiveTeamId 로 일관화

### 진단 — 2번/3번이 작업 가치 미미함을 발견

#### 검증 절차

- `grep`으로 query 훅 시그니처 일제 점검
- 모든 query 훅(`useFeeds`, `useGetFeedDetail`, `useGetDailyQuestion`, `useGetPins`, `useTeamMembers`)이 **이미 `enabled: teamId > 0`** 가드를 갖고 있음 확인
- 즉 `useActiveTeamId`가 0 반환해도 query 호출 자체가 차단되어 **잠재 버그가 이미 방어되어 있음**

#### 결론

- **2번 skip**: 시그니처를 `number | null`로 바꿔도 호출처가 `?? 0` fallback을 반복하게 될 뿐. 실질 안전성 변화 0
- **3번 부분 skip**: HomePage/FeedPage/ActivityPage는 `me` 객체를 다른 용도(hasTeam, isMePending, teams find)로도 쓰므로 useActiveTeamId 통합이 자연스럽지 않음. FeedCreatePage 하나만 통합 가능하지만 의미 미미
- **3번 부분 채택**: `useFeeds`의 `enabled` 조건을 `typeof teamId === 'number'` → `typeof teamId === 'number' && teamId > 0`로 강화 (다른 query 훅과 동일 패턴으로 통일)
- **1번 채택**: PhotoStrip 추출 — `FeedCreatePage`(50줄 단순 사진 리스트)와 `FeedEditPage`(existing + new 두 종류) 모두 흡수. `PhotoStripItem` 타입을 `{ key, src, onRemove }` 단일로 통일, 호출처가 source 가공만 책임

### 배움

- **"잠재 버그처럼 보이는 것"이 다른 레이어에서 이미 방어되고 있을 수 있음** — 시그니처 변경 의도가 정당해도, 다른 가드가 동일 효과를 내고 있으면 리팩토링 가치가 사라짐. 추진 전에 **방어 레이어 전체를 한 번 매핑**해야
- **리팩토링은 "코드가 어색해 보임"이 아니라 "구체적 안전/가독성 이득"이 명확할 때 진행** — 시그니처가 number지만 호출처가 `?? null` 쓰는 것 같은 표면적 부조화는 이득이 0일 수 있음
- **discriminated union prop보다 더 단순한 추상화가 있을 때 선택** — PhotoStrip은 existing/new 구분 없이 `{ key, src, onRemove }` 단일 타입으로 합쳤다. 호출처(FeedEditPage)가 두 source를 spread로 합쳐 넘기는 게 prop 폭발보다 훨씬 깔끔
- **PhotoSlot(단일) + PhotoStrip(다중)의 분리**: 책임이 다른 두 컴포넌트를 따로 둠. 압축 해서 하나로 만들지 않는 것도 추상화의 일부

---

## 9. 컨텍스트 인지 transition — ssgoi middleware로 path-기반 → 의도-기반 확장 (PR #85)

### 컨텍스트

피드 상세에서 삭제 후 list로 backward 시 hero가 매칭됨. 그런데 list cache에서 item을 optimistic하게 제거했으므로 hero target이 사라져 어색한 instant/no-op. 일반 backward(그냥 뒤로가기)에서는 hero가 자연스러우니 유지하고 싶음 — **"의도에 따라 transition을 다르게 적용"**이 필요.

### 옵션 비교

| 방식                                              | 평가                                                            |
| ------------------------------------------------- | --------------------------------------------------------------- |
| hero pair를 forward만 등록 + backward는 fade      | 일반 backward도 fade가 됨 — hero 양방향 이득 상실. 거부         |
| navigate(-1) 대신 explicit path + state 전달      | 호출처 코드 변경. ssgoi는 state 인식 못 함. 효과 없음           |
| 페이지 컴포넌트에 isDeleting state + opacity fade | wrap div 추가, ssgoi와 동시 동작 시 깜빡임 가능. 사용자 거부    |
| **ssgoi middleware + sessionStorage 플래그**      | path 단계에서 의도 분기. ssgoi 안에서 처리, 호출처는 mark 한 줄 |

### 채택 — middleware 패턴

#### 구조

1. `src/shared/lib/deleteContextStorage.ts` — `markFeedDeleting()` / `consumeFeedDeleting()` (sessionStorage + TTL)
2. `useDeleteFeed.onMutate`에서 `markFeedDeleting()` 호출
3. `TransitionProvider.middleware`에서 from이 `/feed/*`, to가 `/feed`이고 `consumeFeedDeleting()`이 true면 from을 가짜 path `__feed-delete__`로 치환
4. 가짜 path는 어떤 hero/slide/sheet entry와도 매칭 안 됨 → fallback `fade({ paths: ['*'] })`로 떨어짐

#### 동작

- 일반 backward (`/feed/123` → `/feed`): middleware가 그대로 통과 → hero 매칭 → 양방향 hero
- 삭제 후 backward (`/feed/123` → `/feed`, 플래그 set): middleware가 from을 `__feed-delete__`로 치환 → hero 매칭 실패 → fade fallback
- consume은 1회성이라 다음 navigation엔 다시 일반 동작

### 모달 자연스러운 등장 (같이 처리)

ConfirmDialog overlay가 `style={{ display }}` + `onTransitionEnd` 패턴이었음 → 등장이 instant.

- `animations.css`에 `@keyframes dialog-overlay-in/out` + `dialog-card-in/out` 추가
- `.dialog-overlay[data-state='open']` / `[data-state='closed']`로 분기, 자식 카드는 `.dialog-overlay > *`로 자동 적용
- overlay JSX는 `data-state={isOpen ? 'open' : 'closed'}` + `onAnimationEnd`에서 `event.animationName === 'dialog-overlay-out'`이면 unmount
- 동일 패턴을 `FeedDetailPage` 삭제 confirm + `openEditExitConfirm` 두 곳에 적용 (헬퍼 한 줄로 사용처 일관)

### 배움

- **라이브러리 옵션이 path만 받을 때 middleware가 결정 레이어**: ssgoi처럼 매칭 단계에 hook이 있으면, 우리는 그 hook을 "의도→경로 매핑"으로 활용해서 표현력을 확장할 수 있음
- **가짜 path는 enum이 아닌 sentinel** — `__feed-delete__`처럼 다른 entry와 충돌 안 하는 이름이면 충분. type-safe enum까지 갈 필요 없음
- **sessionStorage + TTL + consume 패턴**은 "전이성 컨텍스트"(한 번만 유효한 의도)를 표현하는 데 가볍고 견고. heroPinStorage(섹션 7)와 동일 패턴 — 모듈 스코프 module-state 대신 sessionStorage 쓰는 이유: page reload/navigate에 살아남아야 하므로
- **CSS `data-state` 패턴**은 Radix/Headless UI에서 검증된 일관 패턴. JSX에서 boolean을 `'open' | 'closed'`로 매핑하면 CSS가 enter/exit를 깔끔히 분리 처리

---

## 11. 피드 무한스크롤 cold load 미작동 (PR #109)

### 증상

- 피드 페이지를 **새로고침(cold load)** 하면 1페이지(20개)만 뜨고 스크롤해도 다음 페이지가 안 옴
- 그런데 **피드를 생성한 뒤**엔 60개가 한 번에 다 뜸

### 원인

- `useInfiniteScroll`이 `callbacksRef`(ref에 최신 콜백 보관) + effect 의존성 `[threshold, rootMargin]`만 두는 형태로 리팩토링돼 있었음 → observer 부착 effect가 **마운트 시 1회만 실행**
- cold load 마운트 시점엔 `showFeedLoading === true`라 sentinel div가 아직 DOM에 없음 → `observerRef.current === null` → early return → 이후 sentinel이 렌더돼도 effect가 재실행 안 돼 **observer가 영영 미부착** → 무한스크롤 죽음
- "생성 후 60개"는 버그 해결이 아니라 **SPA 캐시가 유지된 채 invalidate로 로드돼 있던 페이지 전체가 refetch**된 것 + warm 캐시라 마운트 시 sentinel이 처음부터 존재해 observer가 정상 부착된 것. 즉 증상이 가려진 것뿐

### 해결

- effect 의존성에 `hasNextPage`·`isFetchingNextPage`·`fetchNextPage` 복원 (원래 동작하던 형태로 회귀)
- 첫 페이지 도착(=`hasNextPage` false→true 전환) 시점과 sentinel 등장이 같은 렌더에 일어나므로, effect 재실행 타이밍이 sentinel 등장과 일치 → observer 정상 부착
- sentinel은 grid/list 뷰모드 분기 **바깥**에 위치 → 두 뷰 모두 동일 동작

### 회귀 원인 회고

- 누군가 "observer를 매번 재생성하지 말자"고 `callbacksRef` 패턴으로 바꾸면서 deps에서 `hasNextPage`를 떼버린 게 회귀의 직접 원인. **"effect냐 callback ref냐"가 아니라 의존성 배열이 핵심이었음**

### React Compiler + 콜백 ref 메모이제이션

- 검토 과정에서 "컴파일러 쓰는데 `useCallback` 필요한가" 질문 → callback ref 대안을 잠깐 검토
- **결론**: perf용 메모는 컴파일러가 대신해주지만, **ref 콜백처럼 identity가 곧 정확성인 자리**는 명시적 `useCallback`을 남기는 게 안전. 컴파일러 메모는 best-effort라 bail-out 시 함수가 매 렌더 새로 생기고, ref 콜백이면 매 렌더 detach/attach가 발생함
- 다만 effect 방식(채택안)은 애초에 ref 콜백을 안 쓰므로 이 고민 자체가 불필요 — effect + full deps가 더 단순하고, `isFetchingNextPage` 토글마다 observer 재생성 → `observe()` 시 초기 교차 상태를 즉시 콜백해 **짧은 목록 자동 연쇄 로드** 이점까지 있음

### 배움

- 무한스크롤 sentinel이 **조건부 렌더(로딩 중 미렌더)** 면, observer 부착 로직이 그 등장 타이밍에 재실행되는지 반드시 확인. 마운트 1회 부착은 cold load에서 깨짐
- "더 똑똑하게" 리팩토링(ref로 콜백 우회 + deps 축소)이 오히려 타이밍 의존 버그를 만들 수 있음. 원래 단순했던 게 정답인 경우 많음

---

## 12. iOS 키보드 포커스 시 헤더 노치 침범 (PR #109)

### 증상

- 팀 생성·피드 생성 페이지에서 input 포커스 시(키보드 등장) **헤더가 노치/다이내믹 아일랜드 뒤로 스크롤돼 겹침**
- 레이아웃은 이미 PageShell이 header 고정 + `main`만 스크롤하는 올바른 구조였음

### 원인

- iOS WebKit이 input 포커스 시 **`overflow:hidden`을 무시하고 document(body) 자체를 스크롤**해 포커스 요소를 보이게 함 (알려진 WebKit 동작). body가 통째로 밀리니 그 안의 고정 헤더 + safe-area 패딩까지 노치 뒤로 올라감
- 기존 `body { overflow: hidden }`만으론 이 focus-scroll을 못 막음

### 해결

- `base.css`의 `body`에 `position: fixed; inset: 0` 추가 → document 스크롤 경로 자체를 제거 → iOS가 body를 밀 수 없음
- 스크롤은 기존대로 `main`만 담당하므로 입력칸은 main 스크롤로 정상 접근

### 안전성 검증 (전 페이지)

- 모든 페이지가 이미 body가 아닌 `main`(`overflow-y-auto`)으로 스크롤 → body 고정해도 동작 변화 없음 (애초에 body는 `overflow:hidden`이라 안 스크롤됐음)
- `window.scroll`/`scrollTo`/`scrollRestoration` 쓰는 페이지 없음 (grep 확인)
- vaul 바텀시트: 열릴 때 `window.scrollY` 기준 body를 fixed로 잠그는데, 항상 `scrollY=0`이라 잠금/복원이 사실상 no-op → 점프 없음

### 한계 (네이티브에서 해결)

- iOS 키보드의 **visual-viewport 패닝**은 별개 동작이라 PWA에선 CSS만으로 완전 차단 불가
- 최종 Capacitor 앱에선 `Keyboard.resize: 'native'`로 웹뷰가 키보드만큼 리사이즈돼 패닝 자체가 안 일어나므로 완전 해결. **PWA는 document-scroll 경로 차단으로 대부분 잡고, 잔여는 네이티브에서 끝나는 구조**

### create 페이지 헤더도 동일 구조 (재확인, 결정)

- 팀/피드 생성 헤더가 "피드페이지 헤더처럼 고정 안 된다"는 체감은 **구조 차이가 아님** — 둘 다 `PageShell`의 `header` 슬롯(`<header shrink-0>`)으로 이미 상단 고정. 차이는 **입력칸 유무**(피드페이지는 키보드가 안 떠서 패닝이 없을 뿐).
- `position: fixed`/`sticky`로 바꿔도 iOS 키보드 패닝엔 무력(고정 요소도 같이 밀림).
- **visualViewport offset 보정(JS)으로 헤더를 되돌리는 방법은 비채택** — iOS 버전별 동작 편차로 fragile, 키보드 애니 중 translate jank 위험, PWA 전용 band-aid. ROI 낮음.
- **결정: PWA는 현행 유지(수용), 네이티브 `Keyboard.resize`로 해결.**

### 배움

- iOS에서 "고정 요소가 키보드 시 밀린다" = 대개 **document(body) 스크롤**이 원인. `overflow:hidden`이 아니라 `position:fixed`로 못박아야 확실
- 앱 셸 PWA는 body 스크롤을 아예 죽이고 내부 컨테이너만 스크롤시키는 구조가 iOS 키보드/노치 문제에 견고

---

## 13. 클러스터 탭 확대 모션 단일화 (PR #109)

### 증상

- 지도 클러스터 탭 시 확대가 "툭 확대됐다가 → 스르륵 이동"하는 **2단 모션**으로 어색

### 원인

- `expandCluster`가 `setLevel({ anchor })`(애니메이션 없는 즉시 확대) + `panTo(target)`(애니메이션 이동)을 연달아 호출 → 두 동작이 분리돼 끊겨 보임

### 해결

- 탭 지점(`target`)을 anchor로 한 **단일 애니메이션 확대** `setLevel(level, { anchor, animate: { duration: 300 } })`로 통합, `panTo` 제거
- kakao `setLevel` 타입에 `animate` 옵션 추가 (`animate` 미지원 버전이어도 무시될 뿐이라 안전)

### 남은 개선 후보 (별건)

- 드래그 중 마커 swim: 모든 마커의 containerPoint를 rAF마다 재계산하는 React 오버레이 방식이라 빠른 드래그 시 한 프레임 지연. kakao `CustomOverlay`로 옮기면 부드러워지나 큰 리팩토링이라 보류

---

## 14. Capacitor edge-to-edge 상태바/키보드/권한 트러블슈팅 (2026-06-04)

### 증상

- `StatusBar.overlaysWebView: true`를 켜면 바텀시트 딤드 처리가 상태바까지 자연스럽게 이어지지만, Android에서 헤더가 상태바와 겹쳤다.
- 헤더를 임의로 더 내리면 겹침은 사라지지만 `overlaysWebView: false`였을 때보다 헤더가 아래로 밀려 보였다.
- Android 바텀시트 안의 input 포커스 시 키보드와 시트 사이에 간격이 생기거나, 키보드가 시트를 덮는 현상이 반복됐다.
- 약관 화면의 권한 항목이 실제 권한 요청 트리거처럼 보이지 않았고, iOS 사진 권한은 `denied/restricted/limited` 상태에 따라 팝업이 다시 뜨지 않을 수 있었다.
- 내부 스크롤 컨테이너를 쓰는 피드 페이지는 상세 진입 후 뒤로 오면 스크롤 위치가 초기화됐다.
- 카메라 리뷰 화면의 드래그 투 트래쉬 아이콘이 사진 영역 밖으로 내려가 보였다.

### 원인

- Android edge-to-edge에서는 CSS `env(safe-area-inset-top)`만으로 상태바 높이가 안정적으로 들어오지 않는다. Capacitor 네이티브 상태바 높이나 SystemBars CSS inset을 앱 레이아웃 변수로 연결해야 한다.
- `overlaysWebView: false`일 때는 WebView 자체가 상태바 아래에서 시작한다. `true`로 바꾸면 앱이 직접 정확히 상태바 높이만큼 padding을 줘야 같은 위치가 된다. 추가 보정값을 더하면 기존 위치와 달라진다.
- Android fullscreen/edge-to-edge + 키보드 조합에서는 Capacitor의 `keyboardHeight`에 내비게이션 바/하단 inset이 섞이거나, `visualViewport`와 타이밍이 어긋날 수 있다.
- iOS는 현재 네이티브 키보드 resize가 동작하는 상태라 Android 보정을 그대로 적용하면 오히려 이중 보정 위험이 있다.
- `vaul`의 `repositionInputs`만으로는 Android WebView 바텀시트 위치를 항상 맞추기 어렵다. input이 있는 시트에만 명시적인 keyboard offset 적용이 필요하다.
- iOS 권한 팝업은 OS 정책상 한 번 거절되면 앱에서 다시 팝업을 띄울 수 없고 설정 화면 안내가 필요하다. 사진 권한은 `limited`를 성공 상태로 취급하고 제한된 앨범 선택 플로우를 별도로 열어야 한다.
- 브라우저의 기본 scroll restoration은 `window` 스크롤 기준이다. 앱 내부 `overflow` 컨테이너의 `scrollTop`은 직접 저장/복원해야 한다.

### 적용한 방향

- 양 플랫폼 모두 `overlaysWebView: true`를 유지해 딤드 처리가 상태바까지 이어지게 했다.
- Android에만 `cap-android` 클래스를 붙이고, `--safe-top`을 `env(safe-area-inset-top)` + 네이티브 상태바 높이 fallback으로 계산하게 했다.
- 헤더는 `PageShell`에서 `pt-[var(--safe-top)]`만 사용한다. 임의 `+8px` 보정은 제거해 `overlaysWebView: false`였을 때와 같은 위치를 목표로 맞춘다.
- Android 키보드 보정은 `initNativeBridge`에서만 `--keyboard-height`를 갱신한다. `visualViewport` overlap을 우선 사용하고, fallback으로 Capacitor `keyboardHeight`에서 하단 safe inset 또는 24px fallback을 뺀다.
- input이 있는 바텀시트는 `avoidKeyboard` 옵션으로만 `bottom: var(--keyboard-height)`를 적용한다. iOS는 테스트 전까지 `--keyboard-height: 0px` 유지.
- 약관 다음 버튼은 약관 동의만 처리하고, 권한 항목 버튼을 직접 누를 때만 네이티브 권한을 요청한다. 웹은 `Capacitor.isNativePlatform()` 가드로 기존 동작을 유지한다.
- 위치/카메라/사진 권한은 개별 요청 함수로 분리했다. 사진은 `Camera.requestPermissions({ permissions: ['photos'] })`, `limited` 성공 처리, `pickLimitedLibraryPhotos()` 호출을 함께 고려한다.
- 피드 스크롤은 `sessionStorage`에 내부 컨테이너 `scrollTop`을 저장하고 로딩 완료 후 rAF로 복원한다.
- 카메라 리뷰의 트래쉬 타깃은 사진 컨테이너 하단보다 위로 올려 사진 안에 들어오게 했다.

### 검증 및 남은 확인

- `yarn type-check`는 통과했다.
- 샌드박스 환경의 `yarn build`는 Tailwind oxide 네이티브 바이너리 실행 `EPERM`으로 실패할 수 있다. 이 경우 로컬/승격 환경에서 재실행해야 한다.
- `yarn cap:sync`는 승격 실행에서 한 번 통과했다.
- Android 실기기/에뮬레이터에서 확인할 것: 헤더 위치가 `overlaysWebView: false` 시절과 같은지, input 바텀시트와 키보드 사이 간격이 없는지, 팀 선택 snap이 데일리 배너 기준으로 맞는지.
- iOS에서 확인할 것: 현재 키보드 resize가 깨지지 않는지, 사진 권한 `granted/limited/denied` 케이스가 의도대로 동작하는지.

### 교훈

- edge-to-edge는 단순 스타일 옵션이 아니라 앱 전체 레이아웃 계약이다. 상태바/키보드/하단 inset을 한 변수 체계로 묶어야 한다.
- Android와 iOS 키보드 보정은 같은 코드로 밀어붙이면 깨질 가능성이 높다. 검증 전에는 Android 전용 보정으로 제한한다.
- 권한 팝업이 안 뜨는 것은 클릭 핸들러 문제가 아니라 OS 권한 상태 문제일 수 있다. `checkPermissions` 결과를 먼저 보고 `denied/restricted/limited`를 분기한다.
- 내부 스크롤 컨테이너를 쓰면 라우터의 기본 스크롤 복원에 기대지 말고 컨테이너 단위로 저장/복원한다.

---

## 10. 핵심 인사이트

1. **유사 책임 유틸의 공존은 일관성 깨짐의 원인** — 상위 호환 함수가 있으면 하위 함수 제거 적극 검토
2. **라이브러리 한계는 소스 코드와 d.ts 둘 다 확인** — 문서/타입 정의에 안 나오는 동작 차이가 핵심 원인일 때 많음
3. **async mount 환경에서 shared element transition은 신중히** — hero/layoutId 류는 mount 타이밍에 민감
4. **보안 가드를 강화할 때는 정상 흐름까지 막지 않는지 검증** — 가드는 negative case만 잡고 positive case는 통과시켜야
5. **메이저 라이브러리 업그레이드는 회귀 검증 단위로 화면별 확인** — type-check 통과는 동작 보장이 아님
6. **회귀 위험 큰 작업은 사전 PR 분리** — 한 PR에 묶이는 변경 폭은 리뷰·롤백 비용에 직접 영향
7. **결정 보류 사유는 항상 기록** — `decisions/` + `tasks/todo.md`에 follow-up을 명시해야 다음 PR에서 누락 없이 이어짐
8. **"의미 있는 리팩토링"의 정의를 매번 검증** — 표면적 부조화(시그니처 vs 호출 패턴)가 다른 레이어에서 이미 방어되고 있으면 작업 가치 0. 추진 전 **방어 레이어 매핑**으로 진짜 이득을 확인
9. **라이브러리가 path/state만 받을 때 middleware는 "의도 레이어"** — 같은 path여도 컨텍스트에 따라 다른 transition이 필요한 경우, middleware + sessionStorage sentinel로 표현력 확장 가능
