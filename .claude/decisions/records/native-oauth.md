# 네이티브 앱 소셜 로그인 (OAuth 딥링크)

Capacitor 앱 출시용 소셜 로그인 설계 + **백엔드 요청 사항**. 웹 흐름은 `decisions/records/auth-flow.md`, 프론트 작업 항목은 `tasks/todo.md`의 "Capacitor Phase 2 — OAuth 딥링크" 참조.

## ✅ 구현됨 (2026-06, BE PR #107 / FE)

- 상태: accepted
- 기록일: 2026-06

아래 "백엔드 요청 사항"은 원래 계획안이고, **실제 채택은 일부 다름**:

- **start**: `GET /api/v1/auth/oauth/{provider}/start?mode=app` → **302 리다이렉트**(+ `oauthMode=app` 쿠키). 앱은 이 URL을 **`@capacitor/browser`**(인앱 브라우저: SFSafariViewController/Custom Tab)로 **그대로 오픈**(JSON 반환 아님). 계획안의 ASWebAuthenticationSession은 미채택 — 현재 동작 확인됨.
- **콜백**: 백엔드가 `tikitak://oauth/callback?loginCode={code}` 로 302.
- **교환**: `POST /api/v1/auth/oauth/login-code/exchange { loginCode }` → `CommonResponse<LoginResponse>`, `LoginResponse = { accessToken, refreshToken, isNewMember, hasAgreedRequiredTerms, activeTeamId }`. **응답이 refreshToken을 httpOnly 쿠키로도 set** — 이 POST는 **앱 WebView**가 호출하므로 쿠키가 앱 WebView 저장소에 박혀 **기존 `/token/refresh`(쿠키)가 앱에서도 그대로 동작** → 별도 refresh 경로(계획 4번) **불필요**. body의 refreshToken은 SecureStorage용(현재 미사용).
- **진입 후 라우팅**: `setAccessToken` → HOME 이동 → protected `setupFlowLoader`가 terms/onboarding 분기(웹과 동일). exchange의 isNewMember/hasAgreedRequiredTerms 필드는 현재 라우팅에 직접 안 씀(me/agreements로 분기).
- **앱 재시작 자동 로그인 (2026-06)**: 스플래시(`useSplashGate`)에서 `restoreSession()`(`/token/refresh`) 시도 → 성공 시 HOME 자동 진입. ⚠️ **전제는 refresh 쿠키가 앱 재시작 후에도 WebView에 남아있는 것**. Android WebView가 세션 쿠키로 받거나 flush 안 하면 소실 → 자동 로그인 실패. 그 경우 폴백 = exchange body의 `refreshToken`(현재 미사용)을 `@capacitor/preferences`/SecureStorage 저장 후 부팅 시 갱신(아래 계획 4번 body/header refresh 필요). 즉 "별도 refresh 경로 불필요" 판단은 **쿠키 영속 성공 시에만** 유효. → `auth-flow.md`의 "앱 재시작 자동 로그인" 참조.
- **FE 파일**: `auth/api.ts`(getStartOAuthLogin 네이티브 분기 + postLoginCodeExchange), `auth/queries.ts`(useLoginCodeExchange), `app/lib/useOAuthDeepLink.ts`(appUrlOpen→loginCode 파싱→exchange→`Browser.close()`, RootLayout 마운트), `auth/endpoints.ts`/`types.ts`. 엔드포인트가 `OAUTH_PREFIX`로 시작 → instance 인터셉터 Bearer/refresh-retry 제외에 자동 포함.
- **네이티브 설정**: iOS `Info.plist` `CFBundleURLTypes` scheme `tikitak`, Android `AndroidManifest` `<intent-filter>` VIEW/BROWSABLE scheme `tikitak` host `oauth`. `@capacitor/browser` 추가.
- ⚠️ 빌드 후 `npx cap sync` 필요. 딥링크는 기기 네이티브 빌드에서만 동작(웹은 기존 redirect 유지).

### ⚠️ 기기에서 전부 막힘 → `server.hostname`로 해결 (핵심 트러블슈팅)

딥링크 복귀까지 됐는데 exchange가 **`Network Error`**(진단 다이얼로그로 확인), 지도 미로드, 사진 업로드 실패. 원인은 **네이티브 WebView origin이 `https://localhost`**(Capacitor 기본 androidScheme)라:

- 백엔드 CORS 허용 밖 → `withCredentials` XHR 전부 차단(로그인 exchange·`/me`·`/feeds`·presigned PUT 업로드 모두).
- Kakao JS SDK 도메인 화이트리스트 밖 → 지도 미로드(이건 CORS 아니라 Kakao 도메인 체크).
- OAuth 인앱 브라우저는 top-level 이동이라 CORS 무관 → 그것만 동작했던 것.

**해결: `capacitor.config.ts`에 `server.hostname: 'tikitak.space'` (+ `androidScheme`/`iosScheme: 'https'`)** → 네이티브 WebView origin이 **프로덕션 웹과 동일**해져 Kakao·백엔드 CORS·쿠키가 전부 "아는 origin"으로 인식 → 로그인/지도/업로드/refresh **한 번에 해결**.

- `server.hostname`은 **로컬 번들을 그 origin으로 서빙**할 뿐(오프라인·버전 고정·스토어 안전). `server.url`(원격 사이트 로드 = 오프라인X·버전드리프트·스토어 리젝 위험)과 다름.
- 전제: `tikitak.space`가 Kakao 콘솔 Web 플랫폼 등록 + 백엔드 CORS 허용 origin(= 프로덕션 웹 주소)이어야 함. 프로덕션 주소 다르면 그 값으로.
- **시도→폐기**: `CapacitorHttp { enabled: true }`(네이티브 HTTP로 CORS 우회) — CORS는 피하나 origin은 여전히 localhost라 Kakao 못 고치고 바이너리 업로드·서드파티 SDK 간섭 리스크. `server.hostname`이 근본적이라 채택.
- **배움**: Capacitor 기기에서 "API 죄다 막힘 / 지도·SDK 도메인 거부"의 1순위 해법 = **`server.hostname`으로 origin을 프로덕션 도메인에 맞추기**. 백엔드 CORS에 localhost 추가보다 근본적(쿠키·SDK 도메인까지 동시 해결).

## 현재(웹) 흐름

- 상태: accepted
- 기록일: 2026-09-23

- `getStartOAuthLogin` → `window.location.href = {VITE_API_BASE_URL}/api/v1/auth/oauth/{provider}/start`
- 백엔드 OAuth 처리 → `https://tikitak.space/oauth/callback?accessToken=...` 리다이렉트
- `authCallbackLoader`가 query `accessToken` → `setAccessToken`. refresh는 httpOnly 쿠키.

## 앱에서 깨지는 점

- 상태: accepted
- 기록일: 2026-09-23

1. 구글/애플은 **임베디드 WebView OAuth 차단** → **시스템 브라우저**(iOS `ASWebAuthenticationSession` / Android Custom Tab)로 열어야 함. (Mafia42 로그인의 "앱이 google.com 사용 로그인" 동의창 = ASWebAuthenticationSession 신호 = 이 패턴)
2. `https://` 콜백은 앱이 아니라 브라우저가 받음 → **커스텀 스킴 딥링크 `tikitak://oauth/callback`** 로 복귀 필요.
3. 시스템 브라우저와 앱은 **쿠키 저장소 분리** → refresh 토큰을 쿠키로 못 받음 → 명시적 전달 필요.

## ★ 백엔드 요청 사항

- 상태: superseded
- 기록일: 2026-09-23
- 대체: ✅ 구현됨 (2026-06, BE PR #107 / FE)

### 1. OAuth start에 플랫폼 구분

`GET /api/v1/auth/oauth/{provider}/start?platform=native` — `platform=native`(또는 `redirect_uri=tikitak://oauth/callback`)를 받아 OAuth `state`에 저장. provider: kakao/google/apple 동일.

### 2. 콜백 리다이렉트 분기

- 웹: `https://tikitak.space/oauth/callback?accessToken=...` (+ refresh 쿠키) — 기존 유지
- 네이티브: `tikitak://oauth/callback?...` 로 302

### 3. 토큰 전달 — 1안 권장(보안)

- **1안. 일회용 code + 교환(OAuth 표준)**
  - 콜백: `tikitak://oauth/callback?code={일회용코드}` (만료 1~5분, 1회용)
  - 신설: `POST /api/v1/auth/oauth/exchange { code } → { accessToken, refreshToken }`
  - 토큰이 URL/로그/리퍼러에 안 남음. (가능하면 PKCE)
- **2안. 직접 전달(차선)**: `tikitak://oauth/callback?accessToken=...&refreshToken=...` — refresh 토큰 URL 노출.

### 4. refresh 토큰 — 쿠키 외 경로 허용

`POST /api/v1/auth/token/refresh` 가 바디/헤더의 refreshToken도 수용 → `{ accessToken }`. (웹은 쿠키 방식 유지, 둘 다 지원)

### 체크리스트

- [ ] start에 `platform=native` 수용 + state 저장
- [ ] 콜백 네이티브 분기 → `tikitak://oauth/callback`
- [ ] (1안) `POST /auth/oauth/exchange` 신설
- [ ] `POST /auth/token/refresh` 바디/헤더 refresh 지원
- [ ] kakao/google/apple 3사 동일

## 앱(프론트) 측 계약 (todo Phase 2와 동일)

- 상태: superseded
- 기록일: 2026-09-23
- 대체: ✅ 구현됨 (2026-06, BE PR #107 / FE)

- iOS `Info.plist` `CFBundleURLTypes` scheme `tikitak`, Android Manifest `<intent-filter>` scheme `tikitak` host `oauth`
- 시스템 브라우저로 start URL 열기 — Mafia42식 동의창+자동복귀를 원하면 `@capacitor/browser`(SFSafariViewController, 자동복귀 수동) 대신 `ASWebAuthenticationSession` 기반 플러그인(`@capacitor-community/generic-oauth2`) 또는 네이티브 SDK
- `@capacitor/app` `appUrlOpen`에서 `tikitak://oauth/callback` 파싱 → (1안)code 교환 / (2안)토큰 저장 → `setAccessToken` + 홈 이동
- refresh 토큰은 `@capacitor/preferences`(또는 SecureStorage) 저장

## 대안: 네이티브 SDK 방식

- 상태: rejected
- 기록일: 2026-09-23

Google Sign-In SDK / Sign in with Apple로 OS 네이티브 계정 피커 사용 → 앱이 idToken 받아 백엔드에 전달·검증. UX는 더 네이티브하나 provider별 네이티브 셋업 필요. 웹 OAuth 재사용 측면에선 위 "시스템 브라우저" 방식이 백엔드 부담 적음.

→ 관련: `decisions/records/auth-flow.md`, `decisions/records/capacitor-setup.md`, `tasks/todo.md`(Capacitor Phase 2)
