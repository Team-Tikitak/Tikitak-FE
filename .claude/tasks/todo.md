# TODO

## E2E 2차 시나리오 (별도 PR)

1차 PR(`89-test/e2e-test`)로 인프라 + 7개 핵심 흐름은 완료. 다음 항목은 추가 mock·셋업 비용이 커서 분리.

> 아래 [x]는 **작성 + 타입/lint 검증 완료**. 실제 CI 통과는 push 후 확인 필요. 카메라 흐름은 `getUserMedia`/`isReady` stub이 불확실해 CI trace로 보정 예정.

### 진행 후보

- [x] **피드 삭제** — 더보기 메뉴 → ConfirmDialog destructive → 목록 복귀 (`feed-delete.spec.ts`). 편집(PATCH)은 미작성
- [x] **팀 전환 시트** — 활동 페이지 헤더에서 팀 선택 → 활성 팀 갱신 (`team-switch.spec.ts`)
- [x] **마이페이지 팀 카드** — 멤버 다수 시 +N 칩 / 소수 시 칩 없음 (`mypage.spec.ts`)
- [x] **초대 링크 진입** — `/invite/:token` preview → 팀 프로필 셋업 이동 (`invite.spec.ts`)
- [x] **카카오 지도** — `stubKakaoMap`으로 SDK stub, 에러 없이 마운트 (`home-map.spec.ts`)
- [x] **팀 생성** — 정보 입력 → 프로필 셋업 → POST `/teams` → 홈 (`team-create.spec.ts`)
- [x] **피드 작성** — 사진 파일 업로드(`setInputFiles`) + 미디어 업로드 → POST `/feeds` → 목록 복귀 (`feed-create.spec.ts`). 피드는 카메라 아닌 파일 입력
- [x] **데일리 피드 작성** — 카메라(`stubCamera`) → 캡처 → 업로드 → POST 답변 (`daily-create.spec.ts`). ⚠️ webkit captureStream 한계로 CI 보정 가능성
- [ ] **댓글/핀 흐름** — 롱프레스 → 핀 추가, BottomSheet 댓글 입력/삭제 (포인터 제스처+캔버스 좌표 의존, 미작성)

### 인프라 보강 필요

- [x] `e2e/fixtures/auth.ts` 도입 (`base.extend`) — 스플래시 자동 skip하는 `test`. 신규 8개 스펙 적용(smoke/protected 등 인증·스플래시 검증 스펙은 base test 유지)
- [x] 미디어 업로드 4단계 mock 헬퍼 — `mockMediaUpload` (POST uploads → PUT presigned → POST complete)
- [x] 카카오 SDK stub — `stubKakaoMap` (`window.kakao` 객체 주입)
- [x] 카메라 stub — `stubCamera`: `getUserMedia`를 canvas.captureStream으로 대체 (데일리 작성용)
- [ ] 컴포넌트별 data-testid 도입 검토 (지금은 텍스트 기반 셀렉터, 텍스트 변경에 취약)

### CI / 환경

- [x] CI 워크플로우 첫 실패 보정 — 컨테이너(mcr playwright) 대신 **호스트 러너 + `playwright install --with-deps`**로 전환(corepack EACCES·sudo 없음·MCR pull 차단 회피), `serviceWorkers: 'block'` 추가. 자세한 경위는 `troubleshooting/e2e.md`
- [x] **Playwright 브라우저 캐시** — `actions/cache`로 `~/.cache/ms-playwright` 캐싱(yarn.lock 해시 키), 캐시 히트 시 `install-deps`만 실행 (e2e.yml)
- [x] **브라우저 프로젝트 스코핑** — PR은 `--project=mobile-chrome`만, `main` push 시 양 브라우저 (e2e.yml Run 스텝 조건부). ⚠️ webkit 전용 버그는 main 머지 후 발견됨
- [ ] **`serviceWorkers: 'block'` 회귀 가드** — PWA 서비스워커가 route mock을 우회(webkit에서 PUT 404). 제거 금지, `troubleshooting/e2e.md` 참조
- [x] (선택) a11y 스모크 — 로그인 페이지 `@axe-core/playwright` critical/serious 위반 검사 (`a11y.spec.ts`)
- [ ] 실패 시 Slack/Discord 알림 (선택)
- [ ] preview deploy URL을 PLAYWRIGHT_BASE_URL로 사용해 vercel preview 직접 검증 (선택)

### 추후 예정 (보류 — 사유 명시)

- **댓글/핀 흐름 e2e** — 롱프레스 포인터 제스처 + 캔버스 % 좌표 + 접근성 이름 없는 핀이라 e2e가 flaky·저ROI. 핵심 로직은 `usePinComments.test.ts` 유닛 테스트로 커버됨 → 유닛에 위임
- **피드 편집(PATCH) e2e** — 삭제는 완료, 편집 폼 흐름은 미작성
- **data-testid 도입** — 텍스트 셀렉터 깨짐 예방엔 좋으나 앱 컴포넌트 다수 수정(회귀 위험) → 보류
- **`serviceWorkers: 'block'` 회귀 가드** — 제거 금지(제거 시 webkit PUT 404 재발). `troubleshooting/e2e.md` 참조. (작업 아님, 주의사항)
- **카메라/지도 stub CI 보정** — `daily-create`(webkit captureStream)·`home-map` stub은 push 후 CI trace로 안정화 필요할 수 있음

## Capacitor Phase 2 — 네이티브 API 마이그레이션 (별도 PR)

Phase 1 (`87-feat/capacitor-setup`) 머지 후 진행. Phase 1 결정은 `.claude/decisions/records/capacitor-setup.md` 참조.

### OAuth 딥링크 — ✅ 구현 완료 (2026-06, BE PR #107)

> 상세: `.claude/decisions/records/native-oauth.md`. 채택 방식은 아래 계획안(accessToken in URL)과 다름 → **일회용 login-code 교환**(더 안전).

- [x] **백엔드:** `start?mode=app` → 302 + `tikitak://oauth/callback?loginCode=...` 리다이렉트
- [x] `@capacitor/browser` 추가
- [x] `getStartOAuthLogin` 네이티브 분기 → `Browser.open({ url: start?mode=app })`
- [x] iOS Info.plist `CFBundleURLTypes` scheme `tikitak`
- [x] Android Manifest `<intent-filter>` scheme `tikitak` host `oauth`
- [x] `app/lib/useOAuthDeepLink.ts`: `appUrlOpen` → loginCode 파싱 → `POST /oauth/login-code/exchange` → `setAccessToken` + 홈
- [x] **★ 기기 막힘 해결**: `server.hostname: 'tikitak.space'`로 origin 통일(localhost CORS·Kakao 도메인·업로드 일괄 해결). `native-oauth.md` 참조

### 네이티브 플러그인 교체

- [ ] **Clipboard:** `useTeamInvite`의 `navigator.clipboard.writeText` → `@capacitor/clipboard`로 분기 (네이티브에선 plugin, 웹은 기존)
- [ ] **Geolocation:** `useUserLocation`의 `navigator.geolocation` → `@capacitor/geolocation`로 분기 (권한 처리 자동화) — 아래 "지도 위치권한 결정" QA와 연계
- [ ] **Camera:** 다음 iOS 재심사 빌드에서 커스텀 native camera plugin 검토/구현. `@capacitor/camera` 단순 교체가 아니라 React `CameraOverlay` UI는 유지하고 iOS `AVCaptureSession`/`AVCaptureVideoPreviewLayer`로 preview/capture/1x·2x zoom을 제공하는 bridge가 필요. 배경: WebView `getUserMedia`는 iPhone 기본 카메라 앱과 동일한 1x/2x 화각을 보장하지 못하고, 2026-07 QA에서 1x가 약 1.2x처럼 보이는 현상과 프리뷰 끊김이 관찰됨. 상세 결정: `.claude/decisions/records/native-media.md`
- [ ] **외부 링크:** `EXTERNAL_LINKS`의 노션 URL을 `<a>` 또는 `window.open` 대신 `Browser.open` 사용해 in-app 표시
- [ ] **네이티브 권한 온보딩** — 앱에서만 온보딩 전 위치/카메라/사진 권한 선요청 (아래 QA 항목)
- [ ] **초대 QR Universal Link(iOS)** — `https://app.tikitak.space/invite/{token}`을 앱 설치 시 앱으로, 미설치 시 브라우저로 열기. Xcode Associated Domains + AASA + `App.getLaunchUrl()`/`appUrlOpen` 처리 필요. 결정: `.claude/decisions/records/native-deep-links.md`

## Capacitor Phase 3 — 출시 폴리싱 (베타 직전)

- [ ] 디자이너에게 "OS 마스크 무시한 평면 정사각" 앱 아이콘 받기 (현재 `resources/icon.png`은 둥근 카드 + 섀도우 형태라 Android adaptive icon에서 잘림)
- [ ] 디자이너에게 splash 전용 디자인 받기 (로고 작게 + 흰 여백 큰 2732×2732)
- [ ] `yarn cap:assets`로 일괄 재생성
- [ ] **Firebase Analytics / GA4 앱 스트림 도입 검토** — `@capacitor-firebase/analytics` 후보. 구현 전 기획-프론트 이벤트 택소노미(`event_name`, params, user properties, conversion 여부) 확정 필요. 세션 메모: `.claude/troubleshooting/2026-07-session-history.md`
- [ ] 햅틱: `@capacitor/haptics` 추가 — 버튼 탭/시트 열림 등 핵심 인터랙션에 적용
- [ ] iOS `UIRequiredDeviceCapabilities` `armv7` → `arm64`로 변경 (또는 제거)
- [ ] iOS Privacy 항목 추가 (위치/카메라/사진 사용 이유 plist 문구)
- [ ] iOS native camera plugin 도입 시 App Store 재심사 체크: 새 Swift 코드/Info.plist/권한 문구/심사 메모 반영, 실기기에서 기본 카메라 앱 1x·2x와 화각 비교 QA, 프리뷰 프레임 드랍/줌 램핑 확인
- [ ] Android `targetSdk` 점검, signing config 추가
- [ ] App Store / Play Store 메타데이터 (앱 설명, 스크린샷, 개인정보 정책 URL)
- [ ] EAS/Fastlane 같은 빌드 파이프라인 결정 (또는 수동 빌드)
- [ ] **카카오 네이티브 SDK** 도입 결정 (`@capacitor-community/kakao-login`) — 한국 사용자 비중 클 때 ROI 큼. `.claude/decisions/records/auth-flow.md` 단계 3 참조

## 앱 아이콘 배지(Badge) 카운트 (2026-07)

iOS 홈 화면 앱 아이콘에 안 읽은 알림 개수를 배지로 표시하는 기능. 서버/클라이언트 두 축으로 분리.

- [ ] **백엔드 요청**: 푸시 전송 시 FCM `apns.payload.aps.badge`에 해당 사용자의 안 읽은 알림 개수(`notification.read === false` 카운트)를 실어서 보내달라고 요청. 안 읽은 알림이 0이 되는 시점(전부 읽음 처리 등)에도 배지를 0으로 지울 별도 트리거 필요 여부 논의
  - 프론트 작업 없음 — 이미 설치된 `@capacitor-firebase/messaging`이 payload를 그대로 iOS에 전달
- [ ] **(보류) 클라이언트 배지 제어** — 앱 열 때 또는 알림 읽었을 때 `@capacitor/badge`(또는 커뮤니티 플러그인)로 `Badge.clear()`/`Badge.set()` 호출. 새 네이티브 플러그인 추가라 Xcode 빌드 + 앱스토어 재심사 필요 → 다른 네이티브 변경(카메라 플러그인 등)과 묶어서 나중에 진행

## Hero 양방향 follow-up (현재 PR 머지 후 재확인)

ssgoi v6 마이그레이션 후에도 **홈 → 장소 상세 backward는 instant**. 카카오 지도의 비동기 mount로 hero target이 transition 시작 시점에 없어서. 결정은 `.claude/decisions/records/transitions.md` 참조.

- [ ] PR 머지 후 Vercel preview + 모바일 실기에서 backward 동작 재확인
- [ ] 여전히 instant면 framer-motion `layoutId`로 hero만 재구현 (추천), 또는 홈은 slide back fallback / zoom transition으로 교체
- [ ] 피드는 양방향 hero 동작 확인됐으므로 그대로 유지

## useActiveTeamId null 반환으로 전환 (별도 PR)

현재 `useActiveTeamId`는 `me?.activeTeamId ?? 0`으로 number 보장. 0이 유효 ID로 새 API 요청에 실리는 잠재 버그.

- [ ] `useActiveTeamId(): number | null` 시그니처 변경
- [ ] 5곳 호출처 (`useFeedDetail`, `usePlaceFeeds`, `DailyFeedCreatePage`, `DailyFeedEditPage`, `FeedEditPage`) 모두 `enabled: !!teamId` 가드 또는 early return 추가
- [ ] OAuth 콜백 fragment 전환과 함께 진행 검토 (백엔드 협의 필요한 보안 follow-up)

## 스킬 완성

- [ ] `figma-to-component` — 디자인 시스템 확정 후 스킬 완성 (weeth-client 참조: 토큰 매핑 테이블, 레이아웃 원칙, 셀프체크 포함, 한글로 작성)
- [x] `code-review` — 코드 리뷰 스킬 추가 완료

## 프로젝트 설정

- [x] `shared/api/instance.ts` — axios 인스턴스 생성 완료
- [ ] `app/routes` — 라우터 설정
- [ ] `app/layout` — 공통 레이아웃 구성
- [ ] auth 구현 시 axios 인터셉터 추가

## 팀 스코프 라우팅 리팩토링 (백엔드 API 연동 시점에 별도 브랜치)

홈/피드는 결국 "현재 선택된 팀"의 컨텐츠. 지금은 `/home`, `/feed` 글로벌 URL이지만 팀 컨텍스트가 URL에 없어 모호함. 백엔드 API 스펙 나오면 일괄 정리.

- [ ] `PATHS` 정리: `HOME` / `FEED` 제거, `TEAM_HOME` (`/teams/:teamId`) / `TEAM_FEED` (`/teams/:teamId/feed`) 추가
- [ ] `toTeamHome(teamId)` / `toTeamFeed(teamId)` 헬퍼 추가
- [ ] `router.tsx` 라우트 경로 변경
- [ ] `BottomNavigation` — `useParams()`로 현재 teamId 읽어 적절한 URL로 navigate
- [ ] 로그인/약관/온보딩 후 사용자의 기본 팀으로 진입 (팀 없으면 `EmptyTeamView`)
- [ ] `useTeams()` 훅 도입 (현재 `MOCK_TEAMS` 자리)
- [ ] `HomePage` / `FeedPage`에서 `useParams<{ teamId }>` 받아 그 팀 데이터 fetch
- [ ] 마이페이지(`/mypage`)는 user-level이라 그대로

이유: URL이 source of truth가 되면 deep-linking·공유 가능, 팀 전환이 navigate로 자연스러움, "현재 팀" 별도 전역 상태 불필요.

## 발견한 QA 사항들

### ✅ 완료 (2026-06)

- [x] 팀 선택 바텀시트 딤 자연스럽게 — snap-points 진입 fade (`animations.css`)
- [x] 토탈 카운트 — 낙관적 삭제 시 `totalCount` 함께 감소 + `pageHasFeed` 가드 (`feed/queries.ts`)
- [x] 데일리 질문 카메라 재오픈 시 검은 화면 — `useCamera`에 `open` 파라미터 추가 → 재오픈 시 stream 재생성 (`useCamera.ts`, `CameraOverlay.tsx`)
- [x] 히어로 화질 튐 — 백엔드 `heroPreviewUrl`(상세와 **동일 비율** 저화질) + `FeedDetailContent` 로딩 fallback을 정사각 thumbnail→heroPreviewUrl로 교체 (BE PR #110). FE 단독 blur-up은 크롭 불일치로 폐기
- [x] 지도 클러스터링 너무 먼 확대에서 진입 — `PIN_ENTER_MAX_LEVEL` 진입 게이트(레벨 초과 시 한 단계 확대 후 진입) + `CLUSTER_MAX_ZOOM` 18 + 기본 줌 확대 (`Map.tsx`, `useKakaoMap.ts`, `clusterIndex.ts`)
- [x] Android 상태바·헤더 겹침 — **safe-area 플러그인 아님**. `StatusBar.overlaysWebView:true`(edge-to-edge) + CSS floor(`--safe-top`/`html.cap-android`, `StatusBar.getInfo().height` 실측). 잔상은 구조 문제 아닌 **빌드 staleness**였음(풀 리빌드+`cap sync`로 해결). `capacitor-setup.md` 참조
- [x] 바텀시트 인풋 키보드 겹침(댓글·위치 등) — Android `--keyboard-height`로 시트를 키보드 위로(`avoidKeyboard` prop), iOS는 0px 유지(native resize), 웹 영향 없음. `bottom-sheet.md` 참조
- [x] 앱 재시작 자동 로그인 — 스플래시에서 `restoreSession()`(`/token/refresh`) 시도 → 성공 HOME / 실패 LOGIN. `auth-flow.md` 참조. ⚠️ **기기 확인 필요**: refresh 쿠키가 앱 재시작 후 잔존해야 동작(미잔존 시 `@capacitor/preferences` 폴백 별도 작업)

### 🟡 부분 / 수용

- [~] 웹 스테이터스바 딤 동기화 — 웹은 `theme-color`(브라우저 UI 레이어라 CSS 오버레이와 프레임 완전 동기화 불가 → 현 수준 수용). 네이티브는 edge-to-edge로 오버레이가 상태바까지 같은 레이어로 덮어 동기화됨

### ⬜ 남음

- 모두의 픽에서 반응과 댓글이 가장 많은 사진 들어갔을 때 그 게시물 전환 애니메이션 자연스럽게 디졸브 정도로 히어로는 안함

- 오늘의 질문 게시글 삭제 후 쿼리키 무효화 확실히 해야함 확인 필요
- 피드 썸네일에서 피드 상세로 이미지 바뀌는거 좀 더 되게 자연스럽게 되면 좋겠음
