# Capacitor Phase 1 — 패키징 셋업 결정 기록

브랜치: `87-feat/capacitor-setup`

## 범위 결정

- 상태: accepted
- 기록일: 2026-09-23

Phase 1은 "웹앱을 Capacitor WebView로 감싸기 위한 최소 셋업"으로 한정. 네이티브 API 마이그레이션과 출시 폴리싱은 별도 PR.

| Phase             | 내용                                                                                       | 시점            |
| ----------------- | ------------------------------------------------------------------------------------------ | --------------- |
| **1 (이 브랜치)** | Capacitor core/플러그인 설치, 플랫폼 추가, 설정, splash/icon 자산, SEO/PWA, 반응형 캔버스  | 지금            |
| 2 (다음 PR)       | OAuth 딥링크, Clipboard/Geolocation/Camera 플러그인 마이그레이션, 외부 링크 in-app browser | Phase 1 머지 후 |
| 3 (베타 직전)     | 디자이너 자산, 햅틱, store 메타, 빌드 파이프라인                                           | 출시 준비 단계  |

## 설치된 패키지

- 상태: accepted
- 기록일: 2026-09-23

```
@capacitor/core      8.3
@capacitor/cli       8.3 (dev)
@capacitor/ios       8.3
@capacitor/android   8.3
@capacitor/app       8.1   - 백버튼/lifecycle
@capacitor/keyboard  8.0   - 키보드 동작
@capacitor/status-bar 8.0  - 상태바
@capacitor/splash-screen 8.0 - 스플래시
@capacitor/assets    3.0 (dev) - 자산 일괄 생성
```

## appId / 플랫폼

- 상태: accepted
- 기록일: 2026-09-23

- `appId: app.tikitak.space` — 실제 서비스 서브도메인(`app.tikitak.space`)과 그대로 일치시킴(엄밀한 reverse DNS는 아님). 추후 Universal Links / App Links 도메인 검증에 유리.
- iOS, Android 모두 추가. Windows 환경에서도 `npx cap add ios` 동작 확인.

## 설정 분리 원칙

- 상태: accepted
- 기록일: 2026-09-23

- **정적 초기값 → `capacitor.config.ts`**: 앱 시작 시 네이티브가 자동 적용. StatusBar 스타일/배경, Keyboard resize mode, SplashScreen, ios/android background color 등.
- **런타임 전용 → `src/app/lib/initNativeBridge.ts`**: 정적 설정으로 불가능한 것만. 현재는 `App.addListener('backButton')`, Android `cap-android` 클래스 + `--status-bar-height` 실측, 네이티브 viewport meta 보정, `Keyboard` 리스너로 `--keyboard-height` 설정(바텀시트 키보드 회피, `bottom-sheet.md`).
- 중복 호출하지 않는다. StatusBar 같은 정적 설정을 양쪽에 두지 않음.

## 흰 배경 통일 (디자인 일관성)

- 상태: accepted
- 기록일: 2026-09-23

- `ios.backgroundColor` + `android.backgroundColor` = `#ffffff` — WebView 컨테이너 흰색.
- Android `styles.xml`에 추가:
  - `statusBarColor` / `navigationBarColor` = `#ffffff`
  - `windowLightStatusBar` / `windowLightNavigationBar` = true (아이콘 검정)
- iOS Info.plist:
  - `UIStatusBarStyle = UIStatusBarStyleDarkContent` (부팅 첫 순간 깜빡임 방지)
  - `UISupportedInterfaceOrientations` Portrait only (iPhone + iPad)
- iOS는 system bar 자체에 색을 직접 못 줌. WebView 배경 흰색이면 상단/하단 모두 흰색으로 보임.

## ★ origin 통일 + edge-to-edge (2026-06, 기기 디버깅 후)

- 상태: accepted
- 기록일: 2026-06

- **`server.hostname: 'tikitak.space'` + `androidScheme`/`iosScheme: 'https'`**: 네이티브 WebView origin을 프로덕션 웹과 동일하게. 기본 `https://localhost`는 백엔드 CORS·Kakao 도메인 화이트리스트 밖이라 **모든 XHR(로그인 exchange·`/me`·업로드)·지도가 막힘** → origin 통일로 일괄 해결. 상세·트러블슈팅은 `decisions/records/native-oauth.md`. (기록 당시엔 로컬 번들 서빙 유지 — `server.url` 아님. ⚠️ 2026-09-23 확인 결과 현재 `capacitor.config.ts`는 `server.hostname`이 아니라 `server.url: 'https://app.tikitak.space'`로 바뀌어 있음 — `decisions/records/capacitor-bundling-strategy.md`의 로컬 번들 결정과 상충하니 실제 배포 방식부터 재확인 필요.)
- **`StatusBar.overlaysWebView: true`** (기존 false): 상태바 투명 + edge-to-edge → 바텀시트 오버레이가 상태바까지 같은 레이어로 덮어 dim 동기화. `statusBarDim`의 네이티브 `setBackgroundColor` 제거(웹 theme-color만 유지). 상세는 `decisions/records/bottom-sheet.md` "status bar dim 동기화".
- **★ Android 헤더 inset — env() 불가, CSS floor로 보정 (2026-06)**: edge-to-edge에서 **iOS는 `env(safe-area-inset-top)`가 상태바 높이를 정확히 보고하지만 Android는 보고하지 않음**(노치만, 상태바 높이 0). 그래서 헤더에 `env()`만 쓰면 Android에서 헤더가 상태바와 겹침. 해결:
  - `base.css`: `--safe-top: env(safe-area-inset-top, 0px)` (iOS/web), `html.cap-android { --safe-top: max(env(safe-area-inset-top,0px), var(--status-bar-height)) }`. `--status-bar-height` 기본 24px(fallback).
  - `initNativeBridge.ts`: Android에서 `document.documentElement.classList.add('cap-android')` + `StatusBar.getInfo().height`로 `--status-bar-height`를 **기기 실측값**으로 덮어씀(24px는 실측 실패 시 fallback).
  - 헤더/카메라 버튼: `pt-[env(...)]` → **`pt-[var(--safe-top)]`** (PageShell, CameraView, CameraReview). 웹은 `--safe-top`=env()라 동작 동일(웹 영향 없음).
  - ⚠️ **잔상 주의**: 상태바 띠에 splash 로고가 비치는 현상은 구조 문제가 아니라 **빌드 staleness**(`yarn build && cap sync` 누락)인 경우가 많음. 풀 리빌드+sync 먼저 확인할 것. overlaysWebView:true 자체는 잔상을 만들지 않음.
- **`@capacitor/browser`** 추가: OAuth start URL 인앱 브라우저 오픈용(`native-oauth.md`).

## 스플래시 처리

- 상태: accepted
- 기록일: 2026-09-23

- 네이티브 splash는 **JS 부팅 중 흰 화면 덮는 짧은 역할**로 축소: `launchShowDuration: 500ms`, `launchAutoHide: true`.
- React `SplashPage`가 메인 — letter-by-letter 애니메이션 fresh하게 시작.
- 수동 `SplashScreen.hide()` 호출 X (auto-hide가 처리). 수동 호출이 있으면 React가 부팅된 후에 hide되면서 애니메이션이 이미 진행된 상태 노출됨.

## 자산 생성

- 상태: accepted
- 기록일: 2026-09-23

- `@capacitor/assets`로 iOS/Android/PWA 자산 일괄 생성.
- 소스: `resources/icon.png` (1024×1024), `resources/splash.svg` (현재).
- 명령: `yarn cap:assets` (흰 배경 옵션 포함).
- 한계: 현재 `tikitakLogoIcon` 디자인이 "흰 카드 + 드롭 섀도우 + 작은 캐릭터" 구조라 1024×1024로 키울 때 캐릭터가 작게 보이고 OS 마스크와 이중 처리됨. Phase 3에서 디자이너에게 평면 사각 디자인 요청.

## 반응형 캔버스

- 상태: accepted
- 기록일: 2026-09-23

- 기존 `max-w-[393px]` 고정 → `sm:max-w-[393px]` (Tailwind sm = 640px).
- 결과:
  - 모든 폰 (360–480px): viewport 전체 채움 (Pixel 7 412px 흰 여백 사라짐)
  - 데스크톱 (≥640px): 393px 중앙 정렬 (기존 폰 프레임 미리보기)
- 7곳 적용: RootLayout 메인 + 바텀 네비, CameraOverlay, TeamListSheet, StickerPicker, BottomSheetOverlay, BottomSheet.

## API 분기 (.env 모드)

- 상태: accepted
- 기록일: 2026-09-23

- 기존 `.env` = dev API (`https://dev-api.tikitak.space`).
- 신규 `.env.production` = prod API (`https://api.tikitak.space`).
- Vite는 `yarn build`(production 모드)에서 `.env.production`을 우선 적용 → `yarn cap:run:android`는 자동으로 prod API 사용.
- `yarn dev`는 기존 dev API 유지.

## SEO / PWA (보너스로 함께 처리)

- 상태: accepted
- 기록일: 2026-09-23

- `index.html` SEO meta (description, OG, Twitter card, 한국어 lang).
- `public/og-image.png` 연결.
- 보일러플레이트 제거: `favicon.svg` (Vite 기본), `icons.svg` (템플릿 sprite).
- **PWA: `vite-plugin-pwa`** (workbox autoUpdate)
  - LOOPIT 식 수동 `sw.js`보다 표준 + 캐시 무효화 자동.
  - `manifest`는 vite.config에 통합 (기존 `site.webmanifest` 삭제).
  - Runtime cache: api.tikitak.space → NetworkFirst 5분, dapi.kakao.com → CacheFirst 1일, dev-media.kusitms.xyz → CacheFirst 30일.
  - `main.tsx`에서 `Capacitor.isNativePlatform()` 시 SW 등록 skip (네이티브에선 SW 불필요/충돌 가능).
- `robots.txt` + `sitemap.xml` (공개 URL 3개: `/`, `/login`, `/terms`).

## 디자인 자산 정리

- 상태: accepted
- 기록일: 2026-09-23

- `src/shared/assets/Logo/tikitakLogoIcon.svg` — 인앱 UI용 (MapImage, InviteAcceptPage). viewBox 1298×1298로 교체 (가독성).
- `src/shared/assets/Logo/tikitakLogoIcon.png` — 고해상도 비트맵 (네이티브 아이콘 소스 / OG 등). 한글 파일명에서 ASCII로 rename.

## 검증

- 상태: accepted
- 기록일: 2026-09-23

- type-check / lint / build 모두 통과.
- 실기기 빌드 검증은 JAVA_HOME 환경 변수 설정 (Android Studio 번들 JBR `E:\Android\Studio\jbr`) 후 `yarn cap:run:android`로 가능.

## 코드 스플리팅 / 빌드 최적화

- 상태: accepted
- 기록일: 2026-09-23

### 라우트 단위 스플리팅

- React Router 7의 `lazy` field 사용 — `<Suspense>` 직접 두지 않고 라우터의 pending 상태로 처리.
- Splash / Login / NotFound / RootLayout / RootErrorBoundary / ProtectedRoute는 eager (초기 진입 부드러움 위해).
- 나머지 17개 페이지는 모두 lazy.

### Vendor 청크 분리 (`build.rolldownOptions.output.manualChunks`)

- `react` (react + react-dom), `react-router`, `tanstack`, `transitions` (페이지 전환 라이브러리), `overlay` (overlay-kit + vaul), `forms` (react-hook-form + zod), `state-network` (zustand + axios), `capacitor`, `vendor` (나머지).
- 결과:
  - Before: 단일 `index.js 865KB / gzip 305KB`
  - After: react 178KB / react-router 91KB / routes 241KB / tanstack 35KB / overlay 77KB ... 페이지별 청크 3~14KB
- 이후 페이지 이동 시 해당 페이지 청크만 다운로드.

### 기타 빌드 옵션

- `esbuild.drop: ['debugger']` + `pure: ['console.log', 'console.debug', 'console.info']` — 프로덕션에서 디버그 로그 제거.
- `chunkSizeWarningLimit: 600` — 정상적인 vendor 청크의 false-positive 경고 억제.
- `cssCodeSplit: true` — 라우트별 CSS 분리.

### 런타임 최적화

- **idle 시 라우트 prefetch** (`src/app/lib/prefetchRoutes.ts`) — `requestIdleCallback`으로 bottom nav 4탭 페이지 청크를 백그라운드 다운로드. **네이티브에선 호출 안 함** (로컬 파일이라 의미 없고 splash 도중 메인 스레드 점유).
- **외부 호스트 preconnect** (`index.html`) — `api.tikitak.space`, `dev-api.tikitak.space`, `dev-media.kusitms.xyz`, `dapi.kakao.com` TLS handshake 미리 시작.
- **이미지 lazy loading** — `<img loading="lazy" decoding="async">` (FeedGrid, FeedListItem, ImageWithFallback).
- **splash 애니메이션 GPU hint** — `.splash-letter`, `.splash-bang`에 `will-change: transform, opacity`. WebView가 GPU 레이어로 미리 승격해서 메인 스레드 부담 줄임.

## 부가 리팩토링 (이 PR 묶음에 포함)

- 상태: accepted
- 기록일: 2026-09-23

### EmptyTeamView를 shared/ui로 승격

- 홈/피드/활동 세 탭 모두 "활성 팀 없음" 케이스에 동일한 안내(TakLeader + "팀 개설하기")가 필요.
- `pages/home/ui/EmptyTeamView.tsx` → `shared/ui/EmptyTeamView/`로 이동.
- 활동 페이지: `!hasActiveTeam` 가드 추가하고 동일 컴포넌트 적용.
- 피드 페이지: 기존 텍스트 메시지를 EmptyTeamView로 교체.

### 편집 페이지 기존 이미지 URL 정규화 누락

- `FeedEditPage`, `DailyFeedEditPage`에서 기존 피드 이미지를 raw `imageUrl`(UUID)로 그대로 PhotoStrip/PhotoSlot에 넘김 → 이미지 깨짐.
- 상세 페이지(`useFeedData`)는 이미 `normalizeImageUrl(img.imageUrl, 'feed-image')` 적용 중이었는데 편집 페이지에선 누락.
- 두 페이지 모두 normalizeImageUrl 적용으로 수정.

### 팀 프로필 미디어 풀 URL 전달

- 백엔드가 DB에 UUID만 저장돼서 풀 URL을 보내달라고 요청 (POST /teams, PATCH /teams/{id}/members/me, POST /teams/join/{token}).
- 대응:
  - `src/shared/api/media/helpers.ts`에 `buildMediaPublicUrl(purpose, publicId, contentType)` 추가 — 업로드 직후 알고 있는 `contentType`으로 확장자 결정 (`.jpg`/`.png`/`.webp`).
  - `useTeamProfileSetupFlow`가 새 파일 업로드 시 풀 URL을 빌드해서 3개 API에 전달. 기존 이미지 유지는 그대로 (백엔드가 마이그레이션 기간 UUID/URL 둘 다 받아준다고 가정).
- `normalizeImageUrl`(display)과 `buildMediaPublicUrl`(upload) 분리 유지: 각각 다른 방향, normalize는 UUID에서 확장자 알 수 없어 `.png` 하드코딩 → 백엔드 마이그레이션 완료되면 UUID 분기 점점 dead code 됨.

## 디자인 자산 갱신 워크플로우

- 상태: accepted
- 기록일: 2026-09-23

```bash
# 1. 새 PNG를 resources/icon.png 또는 resources/splash.png에 덮어쓰기
# 2. iOS/Android/PWA 자산 일괄 재생성
yarn cap:assets
# 3. 네이티브 디렉터리에 반영
yarn cap:sync
# 4. 에뮬/실기기에서 확인
yarn cap:run:android
```

- 인앱 UI에서 같은 아이콘 쓰면 `src/shared/assets/Logo/tikitakLogoIcon.png`도 같이 교체.
- 에뮬레이터에 옛날 아이콘 보이면 앱 제거 후 재설치 (런처 캐시).

## Windows에서 cap sync 주의 — iOS Package.swift 경로 (2026-06)

- 상태: accepted
- 기록일: 2026-06

Windows에서 `cap sync`(또는 `cap sync ios`) 실행 시 `ios/App/CapApp-SPM/Package.swift`의 `.package(path:)`가 **백슬래시**(`..\..\..\node_modules\@capacitor\app`)로 생성됨 → macOS iOS 빌드에서 경로 인식 실패(빌드 깨짐). 파일 헤더가 "DO NOT MODIFY"라 수동 수정해도 다음 Windows sync 때 재발.

- **iOS sync/빌드는 Mac에서** 수행. `package.json`에 플랫폼별 스크립트(`cap:sync:android`, `cap:sync:ios`) 추가됨.
- Windows에서는 `yarn cap:sync:android`로 **Android만** sync(iOS 네이티브 재생성 안 함).
- 이미 백슬래시로 커밋됐으면 슬래시(`/`)로 고쳐 커밋(임시 방편). Gemini 리뷰가 잡은 사례.

## 미해결 / Phase 2, 3로 이동

- 상태: proposed
- 기록일: 2026-09-23

`.claude/tasks/todo.md`의 Capacitor Phase 2 / Phase 3 섹션 참조.

→ 관련: `decisions/records/capacitor-bundling-strategy.md`(로컬 번들 vs server.url 근거 + OTA + 딥링크/토스 정리), `decisions/records/native-oauth.md`(OAuth 딥링크)
