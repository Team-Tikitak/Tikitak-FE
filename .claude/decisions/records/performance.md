# 성능 최적화 (Lighthouse) — 105-refactor 진행

홈/피드/마이페이지 Lighthouse 측정 기반 최적화 기록. **타깃은 Capacitor 앱**이라 웹 Lighthouse는 일부 지표만 유효하다(아래 "측정 주의" 참조).

## 진행 결과

- 상태: accepted
- 기록일: 2026-09-23

- Performance 26 → 54, **FCP 5.9s → 3.1s**, render-blocking 2,910ms → 10ms, CLS 0.101 → **0**.
- LCP는 9~11s대 — 페이지별로 외부 카카오 지도 / 백엔드 원본 이미지가 지배(아래).

## 적용한 변경 (프론트)

- 상태: accepted
- 기록일: 2026-09-23

1. **폰트 자가호스팅** — `public/fonts/`에 SUIT 4종(400/500/600/700)+Pretendard Regular, `src/app/styles/fonts.css`(`font-display: swap`), index.html에서 SUIT Regular/Bold `preload`. index.css의 CDN `@import`(jsdelivr) 제거. → render-blocking 체인(index.css→SUIT.css→woff2 667KB) 제거가 FCP 최대 이득.
2. **카카오 SDK 온디맨드** — `shared/lib/kakaoSdk.ts`가 스크립트 직접 주입(전역 `<script>` 제거), `prefetchRoutes.ts`에서 idle 워밍. → 지도 없는 페이지(로그인 등)에서 SDK 다운로드 제거.
3. **typekit 비차단** — index.html `preload`+onload swap.
4. **CLS 제거** — `HomePage` 로딩 분기에도 `AppHeader` 렌더. → 데이터 로드 후 헤더가 생겨 main이 헤더 높이만큼 밀리던 0.100 shift 제거.
5. **SW 등록 지연** — `main.tsx`에서 `window 'load'` 이후 `registerSW`. → 폰트 1.4MB precache가 초기 FCP/LCP와 경쟁 안 함.
6. **vaul 청크 분리** — `vite.config.ts` manualChunks에서 vaul를 overlay-kit와 분리(바텀시트 열 때만 lazy 로드).
7. **피드 그리드 이미지** — `FeedGrid.tsx`: 첫 9장 eager + 첫 장 `fetchPriority=high`, 나머지 `loading=lazy`, `decoding=async`. → 전 이미지 동시 eager 로드 경쟁 완화. 그리드 즉시 노출 UX는 유지.
8. `vite.config.ts` `preview.port: 5173`.

## ★ 단일 최대 미해결 레버 = 백엔드 이미지 (프론트 불가)

- 상태: accepted
- 기록일: 2026-09-23

백엔드가 **작은 표시 영역에 원본 이미지를 그대로** 내려준다:

- 프로필: 1728×2304 → **11×15px** 표시 = **827KB**
- 피드 썸네일: 1728×1721 → 127×169 표시 = 434KB

`MEDIA_CDN_BASE_URL`은 단순 스토리지(URL 파라미터 리사이즈 미지원)라 **프론트에서 축소 불가**. → **백엔드 썸네일 생성 또는 이미지 리사이즈 CDN(imgproxy/Cloudflare Images 등) 도입 필요.** 홈/피드/마이 LCP·데이터의 공통 주범이며, **앱(셀룰러 데이터)에서 더 중요**.

## 측정 주의 (수치 왜곡 요인)

- 상태: accepted
- 기록일: 2026-09-23

- **IndexedDB** 경고 — 시크릿 창에서 측정해야 정확(PWA/persist 캐시 영향).
- **브라우저 확장**(React DevTools `installHook.js` 등)이 TBT/long task 부풀림 — 확장 끈 상태로 측정.
- **`yarn preview`는 http://localhost** — Best Practices의 "Does not use HTTPS" + vercel.json 보안헤더 미적용으로 **BP 점수가 실제보다 낮게** 나옴. **배포 HTTPS에서 측정**해야 진짜 값.
- LCP "render delay 16s" / SI 24.9s 같은 값은 런 스톨 이상치 → 재측정.

## 의도적으로 안 바꾼 것 (디자인/UX 우선, 점수 감수)

- 상태: accepted
- 기록일: 2026-09-23

- **viewport `user-scalable=no`** — 네이티브 앱 무확대 UX. a11y "확대 비활성화" 감수.
- **DailyQuestion 배너색 `#43b0e0`** — 브랜드색. 흰 글씨 대비 2.46:1(글자 키워도 3:1 미달)이라 색 외 통과 불가 → Contrast 감수.
- ~~**input 16px 미강제** — 디자인 타이포 보존(과거 번복 이력). → iOS 입력 확대는 viewport로 차단.~~
  **(2026-07에 번복됨 — `bottom-sheet.md`의 "iOS input zoom guard" 참조.** viewport 차단은 Capacitor 실기기에서 안정적으로 안 먹혀서, 결국 실제 `font-size: 16px` + `scale(0.875)` 시각 보정으로 교체됨.)
- 위 둘 때문에 **홈 a11y는 ~89에서 캡**(viewport+contrast가 유일 자동 실패). 타 페이지 a11y는 별도.

## a11y 수정 (타 페이지, 실 Lighthouse label/button-name)

- 상태: accepted
- 기록일: 2026-09-23

`TeamInvitePage` 초대링크 input / `ContentTextarea` / `ContentImageCard` `div[role=button]` / `useImageFileInput` 파일 input에 `aria-label` 추가.

## 추가 측정·수정 (2026-06)

- 상태: accepted
- 기록일: 2026-06

- **카카오 타일 CDN preconnect** — `index.html`에 `t1.daumcdn.net`·`mts.daumcdn.net` 추가(기존 dapi.kakao.com·api.tikitak.space와 합쳐 4개). 지도 LCP 요소가 타일 배경 div인데 타일 CDN이 preconnect 안 돼 핸드셰이크가 크리티컬 경로였음. 앱 WebView에도 적용됨.
- **활동 페이지 CLS 0.171 → 0** — `MonthlyMemories`/`MonthlyRecommendedPlaces`가 페이지 스켈레톤 게이트 밖 쿼리라 로딩 중 null/헤더만 → 데이터 도착 시 pop-in. **로딩 중 `h-[204px]` 스켈레톤으로 공간 예약**(섹션별 자체 스켈레톤). 패턴: 페이지 게이트에 안 들어간 하위 비동기 섹션은 자리 예약 필수.
- **LCP 분해 재확인**: /home LCP=지도 타일(load delay 지배), /feed LCP=피드 이미지지만 **render delay 지배(JS 렌더 대기)** — 쓰로틀+확장 노이즈 큼, 앱(로컬 번들)은 훨씬 빠름. /feed 썸네일 320px는 레티나(DPR 2.6) 기준 적정이라 "과대" 플래그는 오탐.
- `recommend_place` 이미지(640px, 카드 ~191px)는 위 "백엔드 이미지" 레버에 해당 — 리사이즈 파라미터/프리셋 필요(프론트 불가).

## 번들·의존성 그래프 비교 기준 (2026-08)

- 상태: accepted
- 기록일: 2026-08

**결정**: 번들에 영향을 주는 변경은 아래의 현재 프로젝트용 Vite 측정법으로 전후 비교한다. Next.js 프로젝트를 분석할 때는 별도 참고 기준의 Client Reference Manifest 측정법을 사용한다.

**근거**:

- Tikitak은 Vite 앱이므로 Next.js의 Client Reference Manifest가 생성되지 않는다. Vite/Rolldown이 만든 JavaScript chunk와 해당 chunk를 import하는 route를 기준으로 확인해야 한다.
- tree shaking이 최종 미사용 코드를 제거할 수 있어도, barrel import의 해석 비용, 넓은 lazy loading 경계, 공통 vendor chunk의 비대화 여부는 별도 확인이 필요하다.
- chunk·산출물 크기와 빌드 시간은 서로 다른 지표다. 하나의 수치만으로 사용자 성능 개선을 확정하지 않는다.

### Tikitak(Vite) 측정법

1. 변경 전·후를 같은 Node/Yarn 버전, lockfile, 빌드 모드, 캐시 조건에서 각각 `yarn build`한다.
2. 터미널의 chunk 출력에서 초기 진입 route와 변경 대상 기능의 JavaScript chunk 크기를 기록한다.
3. `dist/assets`의 파일 목록과 크기를 비교한다.

   ```bash
   find dist/assets -type f -exec du -h {} \; | sort -h
   ```

4. chunk가 커졌거나 줄지 않은 이유를 확인해야 할 때에만 Bundle Analyzer로 모듈 구성을 시각화한다. 분석 도구는 기본 의존성으로 추가하지 않으며, 도입 시 별도 결정 기록을 남긴다.

### Next.js 참고 측정법

Next.js App Router 프로젝트에서는 route별 Client Reference Manifest로 클라이언트 의존성 그래프 규모를 비교할 수 있다.

```bash
pnpm build

find .next/server/app -type f -name '*client-reference-manifest.js' -exec du -h {} \; | sort -h
```

- 매니페스트 크기는 해당 route가 참조하는 Client Component와 의존성 규모를 보여주는 **간접 지표**다.
- 실제 브라우저 전송 JavaScript와 chunk 중복은 Bundle Analyzer로 별도로 확인한다.
- `'use client'` 경계 이동, barrel import를 direct import로 변경, 무거운 라이브러리의 동적 import 적용 전후에 특히 유용하다.

**기록 방식**: PR에는 비교한 commit, 변경 대상 route 또는 기능, 전후 chunk·매니페스트 크기, 측정 환경을 짧게 남긴다. 초기 화면 성능이 목적이면 배포 환경 Lighthouse와 앱 WebView의 실제 로딩도 함께 확인한다. Capacitor 앱에서 웹 Lighthouse 수치는 보조 지표라는 기존 측정 주의를 유지한다.

## Best Practices 58

- 상태: accepted
- 기록일: 2026-09-23

scored 실패는 전부 환경/외부/백엔드: HTTPS(localhost http), third-party cookies(카카오 SDK+백엔드 refreshToken), Issues panel(쿠키 SameSite/Secure=백엔드). CSP/HSTS/COOP/XFO는 Unscored(vercel.json에 HSTS·XFO·nosniff·referrer 이미 있음, COOP·CSP는 미설정). → **배포 HTTPS 재측정 시 상승**, 나머지는 백엔드/외부.
